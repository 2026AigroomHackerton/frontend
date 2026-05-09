import { useMemo, useState } from 'react';
import CompactSearchBar from '../components/workspace/CompactSearchBar';
import DocumentRow from '../components/workspace/DocumentRow';
import WorkspaceSidebar from '../components/workspace/WorkspaceSidebar';
import { personalDocuments, personalFolders } from '../data/mockWorkspaceDocuments';

const personalFilters = [
  { label: '전체', value: 'all' },
  { label: '최근', value: 'recent' },
  { label: 'OCR', value: 'ocr' },
  { label: 'HWPX', value: 'hwpx' },
  { label: 'AI 추천', value: 'ai_suggested' },
];

function PersonalPage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  const handleStartCamera = () => {
    console.log('TODO: open mobile camera scan flow');
  };

  const handleUploadHwpx = () => {
    console.log('TODO: open HWPX upload flow');
  };

  const handleOpenDocument = (documentId: string) => {
    console.log('TODO: open personal document editor', documentId);
  };

  const filteredDocuments = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return personalDocuments
      .filter((document) => {
        const matchesKeyword =
          !keyword ||
          document.title.toLowerCase().includes(keyword) ||
          document.description.toLowerCase().includes(keyword);

        if (!matchesKeyword) return false;

        if (selectedFolderId !== 'all' && document.folderId !== selectedFolderId) return false;

        if (selectedFilter === 'all' || selectedFilter === 'recent') return true;
        if (selectedFilter === 'ocr' || selectedFilter === 'hwpx') return document.fileType === selectedFilter;
        if (selectedFilter === 'ai_suggested') return document.hasAiSuggestion;

        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [searchValue, selectedFilter, selectedFolderId]);

  const activeFolderName =
    selectedFolderId === 'all'
      ? '전체 문서'
      : personalFolders.find((folder) => folder.id === selectedFolderId)?.name ?? '전체 문서';

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[14rem_1fr] lg:gap-10 lg:py-8">
      <WorkspaceSidebar
        label="Workspace"
        allLabel="전체 문서"
        folders={personalFolders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
      />

      <section className="min-w-0">
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">{activeFolderName}</h1>
            <p className="mt-1 text-xs text-slate-400">개인 문서 작업 공간</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={handleUploadHwpx}
              className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              HWPX 업로드
            </button>
            <button
              type="button"
              onClick={handleStartCamera}
              className="h-8 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
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
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <DocumentRow key={document.id} document={document} onOpen={handleOpenDocument} />
            ))
          ) : (
            <div className="px-2 py-12 text-center">
              <p className="text-sm text-slate-500">조건에 맞는 문서가 없어요</p>
              <p className="mt-1 text-xs text-slate-400">검색어를 바꾸거나 다른 폴더를 선택해보세요</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PersonalPage;
