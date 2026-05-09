import JSZip from 'jszip';
import type { ParsedDocument } from '../types/document';

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

export async function parseHwpxFile(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const xmlFiles = Object.values(zip.files)
    .filter((entry) => !entry.dir && entry.name.toLowerCase().endsWith('.xml'))
    .sort((a, b) => getXmlPriority(a.name) - getXmlPriority(b.name));

  if (xmlFiles.length === 0) {
    throw new Error('HWPX 내부에서 XML 파일을 찾지 못했습니다.');
  }

  const extractedChunks: string[] = [];
  const sourceFiles: string[] = [];

  for (const entry of xmlFiles) {
    if (isLikelyMetadata(entry.name)) continue;

    const xml = await entry.async('text');
    const text = extractTextFromXml(xml);
    if (text) {
      extractedChunks.push(text);
      sourceFiles.push(entry.name);
    }
  }

  if (extractedChunks.length === 0) {
    for (const entry of xmlFiles) {
      const xml = await entry.async('text');
      const text = stripXmlTags(xml);
      if (text) {
        extractedChunks.push(text);
        sourceFiles.push(entry.name);
      }
    }
  }

  const text = normalizeExtractedText(extractedChunks.join('\n'));

  if (!text) {
    throw new Error('HWPX XML에서 표시 가능한 텍스트를 추출하지 못했습니다.');
  }

  return { text, sourceFiles };
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

function extractTextFromXml(xml: string): string {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(xml, 'application/xml');
  const parserError = parsed.querySelector('parsererror');

  if (parserError) {
    return stripXmlTags(xml);
  }

  const textNodes: string[] = [];
  const walker = parsed.createTreeWalker(parsed, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const value = node.nodeValue?.replace(/\s+/g, ' ').trim();
    if (value) textNodes.push(value);
    node = walker.nextNode();
  }

  return textNodes.join('\n');
}

function stripXmlTags(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

function normalizeExtractedText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}
