interface PdfPageImage {
  width: number;
  height: number;
  data: Uint8Array;
}

const DPI_TO_POINTS = 72 / 96;

export async function createPdfFileFromSvgs(
  svgs: string[],
  filename: string,
): Promise<File> {
  if (svgs.length === 0) {
    throw new Error('PDF로 변환할 페이지가 없습니다.');
  }

  const pages: PdfPageImage[] = [];
  for (const svg of svgs) {
    pages.push(await svgToJpegPage(svg));
  }

  const bytes = buildPdf(pages);
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return new File([buffer], ensurePdfName(filename), {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
}

async function svgToJpegPage(svg: string): Promise<PdfPageImage> {
  const size = getSvgSize(svg);
  const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(size.width * scale));
  canvas.height = Math.max(1, Math.round(size.height * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('PDF 변환용 캔버스를 만들 수 없습니다.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const image = await loadSvgImage(svg);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (nextBlob) resolve(nextBlob);
        else reject(new Error('PDF 페이지 이미지를 만들 수 없습니다.'));
      },
      'image/jpeg',
      0.92,
    );
  });

  return {
    width: size.width * DPI_TO_POINTS,
    height: size.height * DPI_TO_POINTS,
    data: new Uint8Array(await blob.arrayBuffer()),
  };
}

function getSvgSize(svg: string): { width: number; height: number } {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  const width = parseSvgLength(root.getAttribute('width'));
  const height = parseSvgLength(root.getAttribute('height'));
  if (width && height) return { width, height };

  const viewBox = root.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
  if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  return { width: 794, height: 1123 };
}

function parseSvgLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  const sanitizedSvg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
  const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('SVG 페이지를 이미지로 변환하지 못했습니다.'));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildPdf(pages: PdfPageImage[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;

  function push(chunk: string | Uint8Array) {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  }

  function object(id: number, body: string | Uint8Array, beforeStream = '', afterStream = '') {
    offsets[id] = length;
    push(`${id} 0 obj\n`);
    if (typeof body === 'string') {
      push(`${body}\nendobj\n`);
      return;
    }
    push(`${beforeStream}\nstream\n`);
    push(body);
    push(`\nendstream\n${afterStream}endobj\n`);
  }

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const pageIds = pages.map((_, index) => 3 + index * 3);
  object(1, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  object(2, '<< /Type /Catalog /Pages 1 0 R >>');

  pages.forEach((page, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const imageName = `Im${index + 1}`;
    const width = formatNumber(page.width);
    const height = formatNumber(page.height);
    const content = encoder.encode(`q\n${width} 0 0 ${height} 0 0 cm\n/${imageName} Do\nQ\n`);

    object(
      pageId,
      `<< /Type /Page /Parent 1 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    object(contentId, content, `<< /Length ${content.length} >>`);
    object(
      imageId,
      page.data,
      `<< /Type /XObject /Subtype /Image /Width ${Math.round(page.width / DPI_TO_POINTS)} /Height ${Math.round(page.height / DPI_TO_POINTS)} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.data.length} >>`,
    );
  });

  const xrefOffset = length;
  const objectCount = 2 + pages.length * 3;
  push(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let id = 1; id <= objectCount; id += 1) {
    push(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${objectCount + 1} /Root 2 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const output = new Uint8Array(length);
  let cursor = 0;
  for (const chunk of chunks) {
    output.set(chunk, cursor);
    cursor += chunk.length;
  }
  return output;
}

function formatNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function ensurePdfName(name: string): string {
  const clean = name.trim() || 'document.pdf';
  return /\.pdf$/i.test(clean) ? clean : `${clean}.pdf`;
}
