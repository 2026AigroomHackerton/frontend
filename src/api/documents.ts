// 명세 7.1 / 백엔드 routers/documents.py 매핑.
import { ApiError, apiRequest, buildApiUrl } from './client';

export interface DocumentMeta {
  id: number;
  document_id?: number;
  title: string;
  original_filename?: string;
  source_type: string;
  file_type?: string;
  file_extension?: string;
  content_type?: string;
  parse_status?: string;
  folder_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface UploadDocumentInput {
  file: File;
  title?: string;
  sourceType?: 'upload' | 'camera' | 'manual';
  folderId?: number;
  category?: string;
}

export async function uploadDocument(input: UploadDocumentInput): Promise<DocumentMeta> {
  const fd = new FormData();
  fd.append('file', input.file);
  if (input.title) fd.append('title', input.title);
  fd.append('source_type', input.sourceType ?? 'upload');
  if (input.folderId !== undefined) fd.append('folder_id', String(input.folderId));
  if (input.category) fd.append('category', input.category);

  const document = await apiRequest<DocumentMeta>('/api/documents/upload', {
    method: 'POST',
    formData: fd,
  });

  return {
    ...document,
    id: document.id ?? document.document_id,
    file_type: document.file_type ?? document.file_extension,
  };
}

export async function listDocuments(params: {
  folderId?: number;
  category?: string;
  sourceType?: string;
} = {}): Promise<DocumentMeta[]> {
  return apiRequest<DocumentMeta[]>('/api/documents', {
    query: {
      folder_id: params.folderId,
      category: params.category,
      source_type: params.sourceType,
    },
  });
}

export interface DocumentTextBlock {
  extracted_text?: string | null;
  cleaned_text?: string | null;
  summary?: string | null;
  keywords?: string | null;
  text_version?: number;
  updated_at?: string | null;
}

export interface DocumentDetail {
  metadata: DocumentMeta;
  text?: DocumentTextBlock | null;
  fields?: unknown[];
  answers?: unknown[];
  versions?: unknown[];
}

export async function getDocument(documentId: number): Promise<DocumentDetail> {
  return apiRequest<DocumentDetail>(`/api/documents/${documentId}`);
}

function getFilenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
  return filenameMatch?.[1] ?? null;
}

export async function getDocumentFile(documentId: number, fallbackName: string): Promise<File> {
  const response = await fetch(buildApiUrl(`/api/documents/${documentId}/file`));
  if (!response.ok) {
    throw new ApiError('원본 파일을 불러오지 못했습니다.', 'FILE_LOAD_FAILED', response.status);
  }

  const blob = await response.blob();
  const filename =
    getFilenameFromDisposition(response.headers.get('content-disposition')) ||
    fallbackName ||
    `document-${documentId}.hwpx`;

  return new File([blob], filename, {
    type: blob.type || 'application/octet-stream',
  });
}

async function parseBlobApiError(response: Response, fallbackMessage: string): Promise<ApiError> {
  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return new ApiError(
      payload.message || fallbackMessage,
      payload.error || 'REQUEST_FAILED',
      response.status,
    );
  } catch {
    return new ApiError(fallbackMessage, 'REQUEST_FAILED', response.status);
  }
}

export async function createHwpxFromImage(file: File): Promise<File> {
  const fd = new FormData();
  fd.append('file', file);

  let response: Response;
  try {
    response = await fetch(buildApiUrl('/api/documents/image-to-hwpx'), {
      method: 'POST',
      body: fd,
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'network error';
    throw new ApiError(`서버에 연결할 수 없습니다. ${message}`, 'NETWORK_ERROR', 0);
  }

  if (!response.ok) {
    throw await parseBlobApiError(response, '이미지를 HWPX로 변환하지 못했습니다.');
  }

  const blob = await response.blob();
  const fallbackName = `${file.name.replace(/\.[^.]+$/, '') || 'captured_document'}.hwpx`;
  const filename =
    getFilenameFromDisposition(response.headers.get('content-disposition')) || fallbackName;

  return new File([blob], filename, {
    type: blob.type || 'application/haansofthwpx',
  });
}

export interface ShareLinkResult {
  token: string;
  filename: string;
  url: string;
}

export async function createDocumentShareLink(file: File): Promise<ShareLinkResult> {
  const fd = new FormData();
  fd.append('file', file);

  return apiRequest<ShareLinkResult>('/api/documents/share-link', {
    method: 'POST',
    formData: fd,
  });
}

export async function replaceDocumentFile(documentId: number, file: File): Promise<DocumentMeta> {
  const fd = new FormData();
  fd.append('file', file);

  return apiRequest<DocumentMeta>(`/api/documents/${documentId}/file`, {
    method: 'PUT',
    formData: fd,
  });
}

export interface UpdateDocumentTextResult {
  document_text_id: number;
  version_id: number;
  version_no?: number;
  updated_at?: string;
}

export async function saveDocumentText(
  documentId: number,
  editedText: string,
): Promise<UpdateDocumentTextResult> {
  return apiRequest<UpdateDocumentTextResult>(`/api/documents/${documentId}/text`, {
    method: 'PUT',
    body: { edited_text: editedText },
  });
}

export async function reindexDocument(documentId: number, force = false) {
  return apiRequest(`/api/documents/${documentId}/reindex`, {
    method: 'POST',
    body: { force },
  });
}
