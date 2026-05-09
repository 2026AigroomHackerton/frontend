import { useMemo, useState } from 'react';
import CompactSearchBar from '../components/workspace/CompactSearchBar';
import DocumentRow from '../components/workspace/DocumentRow';
import FolderTree from '../components/workspace/FolderTree';
import { sharedDocuments, sharedFolders, sharedGroups } from '../data/mockWorkspaceDocuments';

const sharedFilters = [
  { label: '전체', value: 'all' },
  { label: '읽기', value: 'read' },
  { label: '수정', value: 'edit' },
  { label: '소유자', value: 'owner' },
  { label: '외부 저장소', value: 'external' },
];

function SharedPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  const handleOpenDocument = (documentId: string) => {
    console.log('TODO: open shared document', documentId);
  };

  const handleImportExternal = () => {
    console.log('TODO: import from external storage');
  };

  const groupNameById = useMemo(
    () => Object.fromEntries(sharedGroups.map((group) => [group.id, group.name])),
    [],
  );

  const filteredDocuments = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return sharedDocuments
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
  }, [groupNameById, searchValue, selectedFilter, selectedFolderId, selectedGroupId]);

  const headerTitle =
    selectedGroupId === 'all'
      ? '전체 공유'
      : selectedFolderId !== 'all'
        ? sharedFolders.find((folder) => folder.id === selectedFolderId)?.name ?? '공유 문서'
        : groupNameById[selectedGroupId] ?? '공유 문서';

  const headerSub =
    selectedGroupId === 'all'
      ? '모든 그룹의 공유 문서'
      : selectedFolderId !== 'all'
        ? `${groupNameById[selectedGroupId] ?? ''} · 폴더`
        : '그룹 문서함';

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-8">
      <FolderTree
        groups={sharedGroups}
        folders={sharedFolders}
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
            <p className="mt-1 truncate text-xs text-slate-400">{headerSub}</p>
          </div>
          <button
            type="button"
            onClick={handleImportExternal}
            className="h-8 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
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
          {filteredDocuments.length > 0 ? (
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
              <p className="mt-1 text-xs text-slate-400">다른 그룹이나 권한 필터를 선택해보세요</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default SharedPage;
