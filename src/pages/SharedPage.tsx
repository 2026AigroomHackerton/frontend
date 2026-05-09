import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { getArchive } from '../api/archive';
import CompactSearchBar from '../components/workspace/CompactSearchBar';
import DocumentRow from '../components/workspace/DocumentRow';
import FolderTree from '../components/workspace/FolderTree';
import type { Folder, SharedGroup, WorkspaceDocument } from '../types/workspace';

const sharedFilters = [
  { label: '전체', value: 'all' },
  { label: '외부 저장소', value: 'external' },
  { label: '읽기', value: 'read' },
  { label: '수정', value: 'edit' },
];

const externalGroup: SharedGroup = {
  id: 'external',
  name: '외부 저장소',
  description: '백엔드 archive API의 외부 저장소 항목',
  memberCount: 1,
  documentCount: 0,
  role: 'viewer',
  updatedAt: new Date().toISOString(),
};

function SharedPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [groups, setGroups] = useState<SharedGroup[]>([externalGroup]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSharedSources() {
      setIsLoading(true);
      setError(null);
      try {
        const archive = await getArchive();
        if (cancelled) return;

        const externalDocuments: WorkspaceDocument[] = archive.external.map((item) => ({
          id: item.id,
          title: item.title,
          description: `${item.source_type} · ${item.status}`,
          folderId: item.source_type,
          groupId: 'external',
          sourceType: 'external',
          fileType: 'external',
          status: 'saved',
          permission: 'read',
          sharedBy: '외부 저장소',
          updatedAt: new Date().toISOString(),
          hasAiSuggestion: false,
        }));

        const externalFolders: Folder[] = Array.from(new Set(archive.external.map((item) => item.source_type))).map((sourceType) => ({
          id: sourceType,
          name: sourceType,
          documentCount: archive.external.filter((item) => item.source_type === sourceType).length,
          updatedAt: new Date().toISOString(),
          ownerType: 'group',
          ownerId: 'external',
        }));

        setGroups([{ ...externalGroup, documentCount: externalDocuments.length }]);
        setFolders(externalFolders);
        setDocuments(externalDocuments);
      } catch (caught) {
        if (!cancelled) {
          const message = caught instanceof ApiError ? caught.message : '공유 문서를 불러오지 못했습니다.';
          setError(message);
          setDocuments([]);
          setFolders([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadSharedSources();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupNameById = useMemo(
    () => Object.fromEntries(groups.map((group) => [group.id, group.name])),
    [groups],
  );

  const filteredDocuments = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return documents
      .filter((document) => {
        const groupName = document.groupId ? groupNameById[document.groupId] ?? '' : '';
        const matchesKeyword =
          !keyword ||
          document.title.toLowerCase().includes(keyword) ||
          document.description.toLowerCase().includes(keyword) ||
          (document.sharedBy?.toLowerCase().includes(keyword) ?? false) ||
          groupName.toLowerCase().includes(keyword);

        if (!matchesKeyword) return false;
        if (selectedGroupId !== 'all' && document.groupId !== selectedGroupId) return false;
        if (selectedFolderId !== 'all' && document.folderId !== selectedFolderId) return false;
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'external') return document.sourceType === 'external';
        return document.permission === selectedFilter;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [documents, groupNameById, searchValue, selectedFilter, selectedFolderId, selectedGroupId]);

  const headerTitle =
    selectedGroupId === 'all'
      ? '전체 공유'
      : selectedFolderId !== 'all'
        ? folders.find((folder) => folder.id === selectedFolderId)?.name ?? '공유 문서'
        : groupNameById[selectedGroupId] ?? '공유 문서';

  const handleOpenDocument = (documentId: string) => {
    console.log('TODO: external document import/open API 연결 필요', documentId);
  };

  const handleImportExternal = () => {
    navigate('/archive/shared');
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-8">
      <FolderTree
        groups={groups}
        folders={folders}
        selectedGroupId={selectedGroupId}
        selectedFolderId={selectedFolderId}
        onSelectAll={() => {
          setSelectedGroupId('all');
          setSelectedFolderId('all');
        }}
        onSelectGroup={(groupId) => {
          setSelectedGroupId(groupId);
          setSelectedFolderId('all');
        }}
        onSelectFolder={(groupId, folderId) => {
          setSelectedGroupId(groupId);
          setSelectedFolderId(folderId);
        }}
      />

      <section className="min-w-0">
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">{headerTitle}</h1>
            <p className="mt-1 truncate text-xs text-slate-400">
              공유 그룹 API가 추가되면 이 영역에 실제 그룹 문서가 표시됩니다.
            </p>
          </div>
          <button type="button" onClick={handleImportExternal} className="h-8 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            외부 저장소
          </button>
        </header>

        <div className="mt-5">
          <CompactSearchBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="문서 제목, 공유자, 그룹 검색"
            ariaLabel="공유 문서 검색"
            filters={sharedFilters}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        <div className="mt-4 -mx-2 divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-2 py-12 text-center text-sm text-slate-500">공유 문서를 불러오는 중입니다.</div>
          ) : error ? (
            <div className="mx-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          ) : filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                groupName={document.groupId ? groupNameById[document.groupId] : undefined}
                variant="shared"
                onOpen={handleOpenDocument}
              />
            ))
          ) : (
            <div className="px-2 py-12 text-center">
              <p className="text-sm text-slate-500">공유된 문서가 없어요</p>
              <p className="mt-1 text-xs text-slate-400">백엔드 공유/그룹 API가 추가되면 이 목록이 실제 데이터로 채워집니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default SharedPage;
