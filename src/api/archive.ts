// 명세 7.5 / 백엔드 routers/archive.py 매핑.
import { apiRequest } from './client';

export interface ArchiveLocalCard {
  id: number;
  title: string;
  source_type: string;
  created_at: string;
  updated_at: string;
}

export interface ArchiveLocalGroup {
  folder_id: number | null;
  documents: ArchiveLocalCard[];
}

export interface ArchiveExternalCard {
  id: string;
  title: string;
  source_type: string;
  status: string;
}

export interface ArchiveResponse {
  local: ArchiveLocalGroup[];
  external: ArchiveExternalCard[];
}

export async function getArchive(): Promise<ArchiveResponse> {
  return apiRequest<ArchiveResponse>('/api/archive');
}
