// 명세 7.1 문서 API. MVP는 stub — 실제 fetch 호출은 백엔드 연결 시 작성.

export interface UploadDocumentInput {
  file: File;
  title: string;
  sourceType: 'upload' | 'camera' | 'manual';
  folderId?: string;
  category?: string;
}

export interface UploadDocumentResult {
  documentId: string;
  fileType: string;
  parseStatus: 'success' | 'partial' | 'unsupported' | 'failed';
}

export async function uploadDocument(input: UploadDocumentInput): Promise<UploadDocumentResult> {
  console.log('TODO: POST /api/documents', input);
  return {
    documentId: `mock-${Date.now()}`,
    fileType: input.file.name.split('.').pop() ?? 'txt',
    parseStatus: 'success',
  };
}

export async function getDocument(documentId: string) {
  console.log('TODO: GET /api/documents/{id}', documentId);
  return null;
}

export async function saveDocumentText(documentId: string, editedText: string) {
  console.log('TODO: PUT /api/documents/{id}/text', { documentId, length: editedText.length });
  return { documentTextId: 'mock-text', versionId: 'mock-v1' };
}

export async function downloadDocument(documentId: string, format: 'txt' | 'hwpx' | 'pdf') {
  console.log('TODO: GET /api/documents/{id}/download', { documentId, format });
}
