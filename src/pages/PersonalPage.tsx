import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { listDocuments, type DocumentMeta } from '../api/documents';
import CompactSearchBar from '../components/workspace/CompactSearchBar';
import DocumentRow from '../components/workspace/DocumentRow';
import WorkspaceSidebar from '../components/workspace/WorkspaceSidebar';
import type { DocumentFileType, DocumentSourceType, Folder, WorkspaceDocument } from '../types/workspace';

const personalFilters = [
  { label: '전체', value: 'all' },
  { label: '최근', value: 'recent' },
  { label: 'OCR', value: 'ocr' },
  { label: 'HWPX', value: 'hwpx' },
  { label: '업로드', value: 'upload' },
];

function normalizeFileType(document: DocumentMeta): DocumentFileType {
  const fileType = (document.file_type ?? document.file_extension)?.replace('.', '').toLowerCase();
  if (fileType === 'hwp' || fileType === 'hwpx' || fileType === 'ocr' || fileType === 'txt') {
    return fileType;
  }
  if (document.source_type === 'camera') return 'ocr';
  return 'hwpx';
}

function normalizeSourceType(sourceType: string): DocumentSourceType {
  if (sourceType === 'camera' || sourceType === 'upload' || sourceType === 'archive' || sourceType === 'external' || sourceType === 'manual') {
    return sourceType;
  }
  return 'upload';
}

function mapDocument(document: DocumentMeta): WorkspaceDocument {
  const title =
    document.title ||
    document.original_filename?.replace(/\.[^.]+$/i, '') ||
    `문서 ${document.id}`;

  return {
    id: String(document.id),
    title,
    description: `${document.source_type || 'upload'} 문서 · ${document.parse_status || '처리 상태 없음'}`,
    folderId: document.folder_id === null || document.folder_id === undefined ? 'unclassified' : String(document.folder_id),
    sourceType: normalizeSourceType(document.source_type),
    fileType: normalizeFileType(document),
    status: document.parse_status === 'completed' ? 'completed' : 'saved',
    updatedAt: document.updated_at || document.created_at || new Date().toISOString(),
    hasAiSuggestion: false,
  };
}

function deriveFolders(documents: WorkspaceDocument[]): Folder[] {
  const folderMap = new Map<string, WorkspaceDocument[]>();

  documents.forEach((document) => {
    const current = folderMap.get(document.folderId) ?? [];
    current.push(document);
    folderMap.set(document.folderId, current);
  });

  return Array.from(folderMap.entries()).map(([folderId, folderDocuments]) => ({
    id: folderId,
    name: folderId === 'unclassified' ? '미분류' : `폴더 ${folderId}`,
    documentCount: folderDocuments.length,
    updatedAt: folderDocuments
      .map((document) => document.updatedAt)
      .sort((a, b) => b.localeCompare(a))[0],
    ownerType: 'personal',
    ownerId: 'me',
  }));
}

function PersonalPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await listDocuments();
        if (!cancelled) {
          setDocuments(response.map(mapDocument));
        }
      } catch (caught) {
        if (!cancelled) {
          const message = caught instanceof ApiError ? caught.message : '문서를 불러오지 못했습니다.';
          setError(message);
          setDocuments([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  const folders = useMemo(() => deriveFolders(documents), [documents]);

  const handleStartCamera = () => {
    navigate('/upload');
  };

  const handleUploadHwpx = () => {
    navigate('/upload');
  };

  const handleOpenDocument = (documentId: string) => {
    navigate(`/editor/${documentId}`);
  };

  const filteredDocuments = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return documents
      .filter((document) => {
        const matchesKeyword =
          !keyword ||
          document.title.toLowerCase().includes(keyword) ||
          document.description.toLowerCase().includes(keyword);

        if (!matchesKeyword) return false;
        if (selectedFolderId !== 'all' && document.folderId !== selectedFolderId) return false;
        if (selectedFilter === 'all' || selectedFilter === 'recent') return true;
        if (selectedFilter === 'ocr' || selectedFilter === 'hwpx') return document.fileType === selectedFilter;
        if (selectedFilter === 'upload') return document.sourceType === 'upload';
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [documents, searchValue, selectedFilter, selectedFolderId]);

  const activeFolderName =
    selectedFolderId === 'all'
      ? '전체 문서'
      : folders.find((folder) => folder.id === selectedFolderId)?.name ?? '전체 문서';

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[14rem_1fr] lg:gap-10 lg:py-8">
      <WorkspaceSidebar
        label="Workspace"
        allLabel="전체 문서"
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
      />

      <section className="min-w-0">
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">{activeFolderName}</h1>
            <p className="mt-1 text-xs text-slate-400">백엔드 문서 API와 연결된 개인 작업공간</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={handleUploadHwpx} className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              HWPX 업로드
            </button>
            <button type="button" onClick={handleStartCamera} className="h-8 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              문서 촬영
            </button>
          </div>
        </header>

        <div className="mt-5">
          <CompactSearchBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="문서 제목이나 내용을 검색"
            ariaLabel="내 문서 검색"
            filters={personalFilters}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        <div className="mt-4 -mx-2 divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-2 py-12 text-center text-sm text-slate-500">문서를 불러오는 중입니다.</div>
          ) : error ? (
            <div className="mx-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          ) : filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <DocumentRow key={document.id} document={document} onOpen={handleOpenDocument} />
            ))
          ) : (
            <div className="px-2 py-12 text-center">
              <p className="text-sm text-slate-500">조건에 맞는 문서가 없어요</p>
              <p className="mt-1 text-xs text-slate-400">업로드 페이지에서 첫 문서를 추가해보세요.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PersonalPage;
