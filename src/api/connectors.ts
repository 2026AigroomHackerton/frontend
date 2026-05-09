// 백엔드 routers/storage.py 매핑.
import { apiRequest } from './client';

export interface ConnectorStatus {
  provider: string;
  display_name?: string;
  status: string;
}

export async function listConnectors(): Promise<ConnectorStatus[]> {
  const result = await apiRequest<ConnectorStatus[] | { connectors: ConnectorStatus[] }>(
    '/api/connectors',
  );
  return Array.isArray(result) ? result : result.connectors;
}

export async function listProviders() {
  return apiRequest('/api/storage/providers');
}

export interface ExternalImportResult {
  imported_document_id?: string | null;
  title: string;
  source_type: string;
  extracted_text?: string;
  status: string;
}

export async function importExternalDocument(
  provider: 'google_drive' | 'notion',
): Promise<ExternalImportResult> {
  const path =
    provider === 'google_drive'
      ? '/api/connectors/google-drive/import'
      : '/api/connectors/notion/import';
  return apiRequest<ExternalImportResult>(path, { method: 'POST', body: {} });
}
