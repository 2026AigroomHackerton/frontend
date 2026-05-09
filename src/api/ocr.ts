// 명세 7.2 / 백엔드 routers/ocr.py 매핑.
import { apiRequest } from './client';

export interface OcrExtractResult {
  ocr_source_id: string;
  extracted_text: string;
  confidence: number;
  document_id: number | null;
  image_path: string;
}

export async function extractText(file: File, createDocument = false): Promise<OcrExtractResult> {
  const fd = new FormData();
  fd.append('image', file);
  fd.append('create_document', String(createDocument));
  return apiRequest<OcrExtractResult>('/api/ocr/extract', {
    method: 'POST',
    formData: fd,
  });
}

export async function getOcrResult(ocrSourceId: string) {
  return apiRequest<OcrExtractResult>(`/api/ocr/${ocrSourceId}`);
}

export async function confirmOcr(ocrSourceId: string, editedText: string) {
  return apiRequest(`/api/ocr/${ocrSourceId}/confirm`, {
    method: 'POST',
    body: { edited_text: editedText },
  });
}
