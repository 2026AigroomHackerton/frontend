// 명세 7.2 OCR API. MVP stub.

export interface OcrExtractResult {
  ocrSourceId: string;
  extractedText: string;
  confidence: number;
  documentId?: string;
}

export async function extractText(file: File, createDocument = false): Promise<OcrExtractResult> {
  console.log('TODO: POST /api/ocr/extract', { name: file.name, createDocument });
  return {
    ocrSourceId: `mock-ocr-${Date.now()}`,
    extractedText: '',
    confidence: 0,
  };
}

export async function confirmOcr(ocrSourceId: string, editedText: string) {
  console.log('TODO: POST /api/ocr/{id}/confirm', { ocrSourceId, length: editedText.length });
}
