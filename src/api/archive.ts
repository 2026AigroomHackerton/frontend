// 명세 7.5 아카이브 API. MVP stub.

export interface ArchiveSearchInput {
  query: string;
  folderId?: string;
  category?: string;
}

export async function searchArchive(input: ArchiveSearchInput) {
  console.log('TODO: GET /api/archive/search', input);
  return { results: [] };
}
