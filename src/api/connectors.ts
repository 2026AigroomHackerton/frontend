// 명세 7.5 외부 저장소 connector API. MVP는 더미.

export type ConnectorProvider = 'local' | 'google_drive' | 'notion' | 'mock';

export interface ConnectorStatus {
  provider: ConnectorProvider;
  displayName: string;
  status: 'connected' | 'disconnected' | 'mock';
}

export async function listConnectors(): Promise<ConnectorStatus[]> {
  console.log('TODO: GET /api/connectors');
  return [
    { provider: 'local', displayName: '로컬 업로드', status: 'connected' },
    { provider: 'google_drive', displayName: 'Google Drive', status: 'mock' },
    { provider: 'notion', displayName: 'Notion', status: 'mock' },
  ];
}

export async function mockImport(provider: ConnectorProvider) {
  console.log('TODO: POST /api/connectors/mock-import', provider);
  return { externalDocumentId: `mock-ext-${Date.now()}` };
}
