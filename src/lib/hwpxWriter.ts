import JSZip from 'jszip';
import type { EditOperation } from '../types/document';

const XML_PRIORITY_HINTS = [
  'Contents/section',
  'contents/section',
  'section',
  'body',
  'header',
  'document',
  'content',
];

const METADATA_HINTS = [
  '_rels',
  'settings',
  'version',
  'manifest',
  'preview',
  'thumbnail',
  'meta',
  'docinfo',
];

interface TextNodeRef {
  node: Text;
  value: string;
}

interface TextReplacement {
  before: string;
  after: string;
}

export async function applyEditOperationsToHwpxFile(
  file: File,
  editOperations: EditOperation[],
  updatedText: string,
): Promise<File> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const xmlEntries = Object.values(zip.files)
    .filter((entry) => !entry.dir && entry.name.toLowerCase().endsWith('.xml'))
    .filter((entry) => !isLikelyMetadata(entry.name))
    .sort((a, b) => getXmlPriority(a.name) - getXmlPriority(b.name));

  const trimmedUpdatedText = updatedText?.trim() ?? '';
  const safeOps = editOperations.filter((op) => op && op.afterText);
  const safeTextOps = safeOps.filter((op) => op.type !== 'rewrite_document');

  // [경로 1] 작은 텍스트 교체 — ops가 있고 rewrite_document가 섞이지 않은 경우.
  //          <hp:t> 안의 텍스트만 치환하고 표·lineseg·paraPr 같은 구조는 절대 건드리지 않는다.
  //          매칭이 하나도 없으면 명확한 에러를 던져서 사용자가 인지하게 한다(자동 재빌드로 떨어지지 않음).
  if (safeTextOps.length > 0) {
    let updatedAny = false;
    for (const entry of xmlEntries) {
      const xml = await entry.async('text');
      const nextXml = rewriteXmlText(xml, safeTextOps, updatedText);
      if (nextXml !== xml) {
        zip.file(entry.name, nextXml);
        updatedAny = true;
      }
    }
    if (!updatedAny) {
      throw new Error(
        'AI가 지정한 원문 조각을 HWPX 본문에서 찾지 못했습니다. 명령을 더 구체적으로 다시 말씀해주세요.',
      );
    }
    return await packageZip(zip, file);
  }

  void trimmedUpdatedText;
  throw new Error(
    '이 요청은 문서 전체 구조를 다시 만드는 수정이라 HWPX 배치가 깨질 수 있어 적용하지 않았습니다. 특정 문구를 바꾸는 방식으로 다시 요청해주세요.',
  );
}

async function packageZip(zip: JSZip, originalFile: File): Promise<File> {
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/haansofthwpx',
  });
  const nextName = createEditedFileName(originalFile.name);
  return new File([blob], nextName, {
    type: originalFile.type || 'application/haansofthwpx',
    lastModified: Date.now(),
  });
}

function createEditedFileName(name: string): string {
  const timestamp = Date.now();
  if (/\.(hwpx|hwp)$/i.test(name)) {
    return name.replace(/\.(hwpx|hwp)$/i, `_edited_${timestamp}.$1`);
  }
  return `${name}_edited_${timestamp}.hwpx`;
}

function isSectionEntry(name: string): boolean {
  return /section/i.test(name);
}

const HP_NAMESPACE_FALLBACK =
  'http://www.hancom.co.kr/hwpml/2011/paragraph';

// 원본 section의 첫 <hp:p>를 템플릿으로 사용해 새 단락을 만든다.
// 이렇게 하면 paraPrIDRef·styleIDRef·linesegarray 등 메타데이터가 그대로 보존되어
// 렌더러가 lineseg 미계산 경고를 내며 화면을 비우는 문제를 피할 수 있다.
function rebuildSectionWithText(originalXml: string, text: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalXml, 'application/xml');
  if (doc.querySelector('parsererror')) return originalXml;

  const root = doc.documentElement;
  if (!root) return originalXml;

  const hpNamespace =
    root.lookupNamespaceURI('hp') ||
    root.getAttribute('xmlns:hp') ||
    HP_NAMESPACE_FALLBACK;

  // 본문 paragraph만 모은다. table 등 깊이 들어간 <hp:p>는 건드리지 않기 위해
  // 루트 직계만 대상으로 한다(루트가 hs:sec이면 그 자식이 본문 단락임).
  const directParagraphs = Array.from(root.childNodes).filter(
    (node): node is Element =>
      node.nodeType === 1 &&
      (node as Element).localName === 'p' &&
      (node as Element).namespaceURI === hpNamespace,
  );

  const template = pickParagraphTemplate(directParagraphs);

  for (const para of directParagraphs) {
    para.parentNode?.removeChild(para);
  }

  const lines = (text ?? '').split(/\r?\n/);
  const paragraphLines = lines.length > 0 ? lines : [''];

  for (let index = 0; index < paragraphLines.length; index += 1) {
    const line = paragraphLines[index];
    const p = template
      ? cleanClonedParagraph(template.cloneNode(true) as Element)
      : createDefaultParagraph(doc, hpNamespace);

    if (p.hasAttribute('id')) {
      p.setAttribute('id', String(index));
    }

    setParagraphText(p, hpNamespace, line);

    root.appendChild(p);
  }

  return new XMLSerializer().serializeToString(doc);
}

function pickParagraphTemplate(paragraphs: Element[]): Element | null {
  // 표(<hp:tbl>) 같은 비-텍스트 요소가 없는 깨끗한 단락을 우선. linesegarray가 있으면 더 좋다.
  let cleanWithLineSeg: Element | null = null;
  let cleanAny: Element | null = null;
  for (const para of paragraphs) {
    if (!isCleanParagraph(para)) continue;
    if (!cleanAny) cleanAny = para;
    if (hasLinesegarray(para)) {
      cleanWithLineSeg = para;
      break;
    }
  }
  return cleanWithLineSeg ?? cleanAny ?? paragraphs[0] ?? null;
}

function isCleanParagraph(para: Element): boolean {
  return Array.from(para.childNodes).every((node) => {
    if (node.nodeType !== 1) return true;
    const localName = (node as Element).localName;
    return localName === 'run' || localName === 'linesegarray';
  });
}

function hasLinesegarray(para: Element): boolean {
  return Array.from(para.childNodes).some(
    (node) => node.nodeType === 1 && (node as Element).localName === 'linesegarray',
  );
}

// 클론한 단락에서 텍스트와 무관한 자식(표·컨트롤 등)을 제거한다.
function cleanClonedParagraph(para: Element): Element {
  for (const child of Array.from(para.childNodes)) {
    if (child.nodeType !== 1) continue;
    const localName = (child as Element).localName;
    if (localName !== 'run' && localName !== 'linesegarray') {
      para.removeChild(child);
    }
  }
  return para;
}

function setParagraphText(para: Element, hpNs: string, text: string): void {
  const doc = para.ownerDocument;
  if (!doc) return;

  const runs = Array.from(para.childNodes).filter(
    (node): node is Element =>
      node.nodeType === 1 &&
      (node as Element).localName === 'run' &&
      (node as Element).namespaceURI === hpNs,
  );

  if (runs.length === 0) {
    const run = doc.createElementNS(hpNs, 'hp:run');
    run.setAttribute('charPrIDRef', '0');
    const tNode = doc.createElementNS(hpNs, 'hp:t');
    tNode.textContent = text;
    run.appendChild(tNode);
    para.insertBefore(run, para.firstChild);
    return;
  }

  // 첫 run의 charPrIDRef는 보존하고 내용만 단일 <hp:t>로 교체
  const firstRun = runs[0];
  const firstRunChildren = Array.from(firstRun.childNodes);
  for (const child of firstRunChildren) {
    firstRun.removeChild(child);
  }
  const tNode = doc.createElementNS(hpNs, 'hp:t');
  tNode.textContent = text;
  firstRun.appendChild(tNode);

  for (let i = 1; i < runs.length; i += 1) {
    runs[i].parentNode?.removeChild(runs[i]);
  }
}

function createDefaultParagraph(doc: Document, hpNs: string): Element {
  const p = doc.createElementNS(hpNs, 'hp:p');
  p.setAttribute('id', '0');
  p.setAttribute('paraPrIDRef', '0');
  p.setAttribute('styleIDRef', '0');
  p.setAttribute('pageBreak', '0');
  p.setAttribute('columnBreak', '0');
  p.setAttribute('merged', '0');

  const run = doc.createElementNS(hpNs, 'hp:run');
  run.setAttribute('charPrIDRef', '0');
  const tNode = doc.createElementNS(hpNs, 'hp:t');
  run.appendChild(tNode);
  p.appendChild(run);

  const lsa = doc.createElementNS(hpNs, 'hp:linesegarray');
  const ls = doc.createElementNS(hpNs, 'hp:lineseg');
  ls.setAttribute('textpos', '0');
  ls.setAttribute('vertpos', '0');
  ls.setAttribute('vertsize', '1000');
  ls.setAttribute('textheight', '1000');
  ls.setAttribute('baseline', '850');
  ls.setAttribute('spacing', '600');
  ls.setAttribute('horzpos', '0');
  ls.setAttribute('horzsize', '42520');
  ls.setAttribute('flags', '393216');
  lsa.appendChild(ls);
  p.appendChild(lsa);

  return p;
}

function rewriteXmlText(
  xml: string,
  editOperations: EditOperation[],
  _updatedText: string,
): string {
  return rewriteRawXmlText(xml, editOperations);
}

function rewriteRawXmlText(xml: string, editOperations: EditOperation[]): string {
  let nextXml = xml;

  for (const op of editOperations) {
    for (const replacement of getTextReplacements(op)) {
      if (!replacement.before || replacement.before === replacement.after) continue;

      const before = escapeXmlText(replacement.before);
      const after = escapeXmlText(replacement.after);
      nextXml = replaceOnlyTextContent(nextXml, before, after);
    }
  }

  return nextXml;
}

function replaceOnlyTextContent(xml: string, before: string, after: string): string {
  if (!before || before === after) return xml;

  const parts = xml.split(/(<[^>]+>)/g);
  let changed = false;
  const nextParts = parts.map((part) => {
    if (!part || part.startsWith('<')) return part;
    if (!part.includes(before)) return part;
    changed = true;
    return part.replaceAll(before, after);
  });

  return changed ? nextParts.join('') : xml;
}

function getTextReplacements(op: EditOperation): TextReplacement[] {
  const replacements: TextReplacement[] = [];

  if (op.beforeText && op.afterText) {
    replacements.push({ before: op.beforeText, after: op.afterText });

    const compactBefore = normalizeSpaces(op.beforeText);
    const compactAfter = normalizeSpaces(op.afterText);
    if (compactBefore !== op.beforeText || compactAfter !== op.afterText) {
      replacements.push({ before: compactBefore, after: compactAfter });
    }

    const diff = getMiddleDiff(op.beforeText, op.afterText);
    if (diff && diff.before && diff.after) {
      replacements.push(diff);
    }

    const yearDiff = getYearReplacement(op.beforeText, op.afterText);
    if (yearDiff) replacements.push(yearDiff);

    replacements.push(...getLineByLineReplacements(op.beforeText, op.afterText));
  }

  return dedupeReplacements(replacements);
}

function getLineByLineReplacements(before: string, after: string): TextReplacement[] {
  const beforeLines = before.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const afterLines = after.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (beforeLines.length < 2 || beforeLines.length !== afterLines.length) return [];

  const result: TextReplacement[] = [];
  for (let index = 0; index < beforeLines.length; index += 1) {
    const beforeLine = beforeLines[index];
    const afterLine = afterLines[index];
    if (beforeLine && afterLine && beforeLine !== afterLine) {
      result.push({ before: beforeLine, after: afterLine });
    }
  }
  return result;
}

function getMiddleDiff(before: string, after: string): TextReplacement | null {
  let start = 0;
  const minLength = Math.min(before.length, after.length);
  while (start < minLength && before[start] === after[start]) start += 1;

  let beforeEnd = before.length - 1;
  let afterEnd = after.length - 1;
  while (beforeEnd >= start && afterEnd >= start && before[beforeEnd] === after[afterEnd]) {
    beforeEnd -= 1;
    afterEnd -= 1;
  }

  const beforeMiddle = before.slice(start, beforeEnd + 1);
  const afterMiddle = after.slice(start, afterEnd + 1);
  if (!beforeMiddle || !afterMiddle || beforeMiddle.length > 80 || afterMiddle.length > 80) {
    return null;
  }

  return { before: beforeMiddle, after: afterMiddle };
}

function getYearReplacement(before: string, after: string): TextReplacement | null {
  const beforeYears = before.match(/\b(19|20)\d{2}\b/g) ?? [];
  const afterYears = after.match(/\b(19|20)\d{2}\b/g) ?? [];
  if (beforeYears.length !== 1 || afterYears.length !== 1) return null;
  if (beforeYears[0] === afterYears[0]) return null;
  return { before: beforeYears[0], after: afterYears[0] };
}

function replaceAcrossTextNodes(
  textNodes: TextNodeRef[],
  beforeText: string,
  afterText: string,
): boolean {
  const indexMap: Array<{ item: TextNodeRef; offset: number }> = [];
  let combined = '';

  for (const item of textNodes) {
    for (let offset = 0; offset < item.value.length; offset += 1) {
      indexMap.push({ item, offset });
      combined += item.value[offset];
    }
  }

  const startIndex = combined.indexOf(beforeText);
  if (startIndex < 0) return false;

  const endIndex = startIndex + beforeText.length - 1;
  const start = indexMap[startIndex];
  const end = indexMap[endIndex];
  if (!start || !end) return false;

  const touchedNodes = textNodes.filter((item) => {
    const first = indexMap.findIndex((mapped) => mapped.item === item);
    const last = findLastIndex(indexMap, (mapped) => mapped.item === item);
    return first <= endIndex && last >= startIndex;
  });

  if (touchedNodes.length === 0) return false;

  const prefix = start.item.value.slice(0, start.offset);
  const suffix = end.item.value.slice(end.offset + 1);

  for (const item of touchedNodes) {
    item.node.nodeValue = '';
    item.value = '';
  }

  start.item.node.nodeValue = `${prefix}${afterText}${suffix}`;
  start.item.value = start.item.node.nodeValue ?? '';
  return true;
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) return index;
  }
  return -1;
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function dedupeReplacements(replacements: TextReplacement[]): TextReplacement[] {
  const seen = new Set<string>();
  return replacements.filter((replacement) => {
    const key = `${replacement.before}\u0000${replacement.after}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeXmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getEditableTextNodes(document: Document): TextNodeRef[] {
  const preferred = Array.from(document.getElementsByTagName('*'))
    .filter((element) => element.localName.toLowerCase() === 't')
    .flatMap((element) =>
      Array.from(element.childNodes)
        .filter((node): node is Text => node.nodeType === Node.TEXT_NODE)
        .map((node) => ({ node, value: node.nodeValue ?? '' })),
    )
    .filter((item) => item.value.trim());

  if (preferred.length > 0) return preferred;

  const fallback: TextNodeRef[] = [];
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    const value = textNode.nodeValue ?? '';
    if (value.trim()) fallback.push({ node: textNode, value });
    node = walker.nextNode();
  }
  return fallback;
}

function shouldInsertAtTop(op: EditOperation): boolean {
  const targetLabel = op.target.label.toLowerCase();
  return (
    op.type === 'insert_paragraph' &&
    (/top|start|beginning/.test(targetLabel) ||
      op.target.lineStart === 0)
  );
}

function getXmlPriority(name: string): number {
  const normalized = name.toLowerCase();
  const hintIndex = XML_PRIORITY_HINTS.findIndex((hint) =>
    normalized.includes(hint.toLowerCase()),
  );
  return hintIndex === -1 ? XML_PRIORITY_HINTS.length : hintIndex;
}

function isLikelyMetadata(name: string): boolean {
  const normalized = name.toLowerCase();
  return METADATA_HINTS.some((hint) => normalized.includes(hint));
}

void [
  isSectionEntry,
  rebuildSectionWithText,
  replaceAcrossTextNodes,
  getEditableTextNodes,
  shouldInsertAtTop,
];
