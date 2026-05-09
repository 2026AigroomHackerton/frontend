import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Download,
  FileText,
  Folder,
  Grid3x3,
  List,
  MoreVertical,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react';
import {
  CURRENT_USER,
  mockDashboardFiles,
  mockRecommendedFolders,
  type DashboardFile,
  type RecommendedFolder,
} from '../../data/mockDocuments';

type ViewMode = 'list' | 'grid';
type SortKey = 'name' | 'modifiedAt' | 'size';
type SortDirection = 'asc' | 'desc';

export type ArchiveViewKey =
  | 'all'
  | 'personal'
  | 'important'
  | 'recent'
  | 'shared'
  | 'trash';

const VIEW_HEADING: Record<ArchiveViewKey, string> = {
  all: '파일',
  personal: '개인 문서함',
  important: '중요 문서함',
  recent: '최근 문서함',
  shared: '공유 문서함',
  trash: '휴지통',
};

const FOLDER_COLOR: Record<RecommendedFolder['color'], string> = {
  blue: 'bg-blue-100 text-blue-600',
  violet: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
  sky: 'bg-sky-100 text-sky-600',
};

const EMPTY_HINT: Record<ArchiveViewKey, string> = {
  all: '표시할 파일이 없습니다.',
  personal: '내 문서가 없습니다.',
  important: '중요로 표시한 파일이 없습니다.',
  recent: '최근 수정한 파일이 없습니다.',
  shared: '공유된 파일이 없습니다.',
  trash: '휴지통이 비어있습니다.',
};

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '이름' },
  { key: 'modifiedAt', label: '수정 날짜' },
  { key: 'size', label: '파일 크기' },
];

function ownerLabel(file: DashboardFile) {
  return file.owner === CURRENT_USER ? '나' : '공유됨';
}

function parseSize(size: string): number {
  const match = size.trim().match(/^([\d.]+)\s*(KB|MB|GB|B)?$/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  if (unit === 'KB') return value * 1024;
  if (unit === 'MB') return value * 1024 * 1024;
  if (unit === 'GB') return value * 1024 * 1024 * 1024;
  return value;
}

function compareFiles(a: DashboardFile, b: DashboardFile, key: SortKey): number {
  if (key === 'name') return a.name.localeCompare(b.name, 'ko');
  if (key === 'modifiedAt') return a.modifiedAt.localeCompare(b.modifiedAt);
  if (key === 'size') return parseSize(a.size) - parseSize(b.size);
  return 0;
}

type FileAction =
  | 'download'
  | 'rename'
  | 'trash'
  | 'restore'
  | 'deleteForever';

type ActionMenuProps = {
  open: boolean;
  align: 'right-down' | 'right-up';
  isTrashView?: boolean;
  onAction: (action: FileAction) => void;
};

function ActionMenu({ open, align, isTrashView, onAction }: ActionMenuProps) {
  if (!open) return null;
  const positionClass =
    align === 'right-up'
      ? 'right-0 bottom-full mb-1'
      : 'right-0 top-full mt-1';

  if (isTrashView) {
    return (
      <div
        className={`absolute z-20 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${positionClass}`}
        role="menu"
      >
        <button
          type="button"
          onClick={() => onAction('restore')}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          복원
        </button>
        <button
          type="button"
          onClick={() => onAction('deleteForever')}
          className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          영구 삭제
        </button>
      </div>
    );
  }

  return (
    <div
      className={`absolute z-20 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${positionClass}`}
      role="menu"
    >
      <button
        type="button"
        onClick={() => onAction('download')}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        다운로드
      </button>
      <button
        type="button"
        onClick={() => onAction('rename')}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
      >
        <Pencil className="h-4 w-4" />
        이름 변경
      </button>
      <button
        type="button"
        onClick={() => onAction('trash')}
        className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        휴지통으로 이동
      </button>
    </div>
  );
}

type SortHeaderButtonProps = {
  label: string;
  sortKey: SortKey;
  active: SortState;
  onSelect: (key: SortKey) => void;
};

function SortHeaderButton({
  label,
  sortKey,
  active,
  onSelect,
}: SortHeaderButtonProps) {
  const isActive = active.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSelect(sortKey)}
      className={`inline-flex items-center gap-1 transition-colors hover:text-slate-900 ${
        isActive ? 'text-slate-900' : 'text-slate-500'
      }`}
    >
      {label}
      {isActive ? (
        active.direction === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
}

type DashboardFileExplorerProps = {
  view?: ArchiveViewKey;
};

function DashboardFileExplorer({ view = 'all' }: DashboardFileExplorerProps = {}) {
  const [displayMode, setDisplayMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({
    key: 'modifiedAt',
    direction: 'desc',
  });
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());
  const [trashedIds, setTrashedIds] = useState<Set<number>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleStar = (id: number) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    setSelectedFolder(null);
  }, [view]);

  useEffect(() => {
    if (openMenuId === null && !sortMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId, sortMenuOpen]);

  const handleSelectSortKey = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const handleAction = (file: DashboardFile, action: FileAction) => {
    setOpenMenuId(null);
    if (action === 'download') {
      alert(`다운로드: ${file.name}`);
      return;
    }
    if (action === 'rename') {
      const next = window.prompt('새 이름을 입력하세요.', file.name);
      if (next) alert(`이름 변경: ${file.name} → ${next}`);
      return;
    }
    if (action === 'trash') {
      setTrashedIds((prev) => {
        const next = new Set(prev);
        next.add(file.id);
        return next;
      });
      return;
    }
    if (action === 'restore') {
      setTrashedIds((prev) => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
      return;
    }
    if (action === 'deleteForever') {
      if (
        window.confirm(`${file.name}을(를) 영구 삭제하시겠습니까?`)
      ) {
        setTrashedIds((prev) => {
          const next = new Set(prev);
          next.delete(file.id);
          return next;
        });
        alert(`영구 삭제됨: ${file.name}`);
      }
    }
  };

  const filteredFiles = useMemo(() => {
    let base: DashboardFile[];
    if (view === 'trash') {
      base = mockDashboardFiles.filter((file) => trashedIds.has(file.id));
    } else if (view === 'personal') {
      base = mockDashboardFiles.filter(
        (file) => file.category === 'personal' && !trashedIds.has(file.id),
      );
    } else if (view === 'important') {
      base = mockDashboardFiles.filter(
        (file) => starredIds.has(file.id) && !trashedIds.has(file.id),
      );
    } else if (view === 'shared') {
      base = mockDashboardFiles.filter(
        (file) => file.category === 'shared' && !trashedIds.has(file.id),
      );
    } else if (view === 'recent') {
      base = mockDashboardFiles
        .filter((file) => !trashedIds.has(file.id))
        .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    } else {
      base = mockDashboardFiles.filter((file) => !trashedIds.has(file.id));
    }
    if (selectedFolder) {
      base = base.filter((file) => file.tag === selectedFolder);
    }
    return base;
  }, [view, starredIds, trashedIds, selectedFolder]);

  const sortedFiles = useMemo(() => {
    const arr = [...filteredFiles];
    arr.sort((a, b) => {
      const cmp = compareFiles(a, b, sort.key);
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredFiles, sort]);

  return (
    <div ref={containerRef} className="space-y-6">
      {view === 'all' && !selectedFolder ? (
        <section>
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              추천 폴더
            </h2>
          </header>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
            {mockRecommendedFolders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedFolder(folder.name)}
                className="group flex flex-col items-start gap-1.5 rounded-lg border border-gray-200 bg-white p-2.5 text-left shadow-sm transition-colors hover:border-blue-300 hover:shadow-md sm:gap-2 sm:p-3"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${FOLDER_COLOR[folder.color]}`}
                >
                  <Folder className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                  {folder.name}
                </p>
                <p className="text-[10px] text-slate-500 sm:text-[11px]">
                  {folder.count}개 항목
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedFolder ? (
              <button
                type="button"
                onClick={() => setSelectedFolder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="전체 파일로 돌아가기"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {selectedFolder ? selectedFolder : VIEW_HEADING[view]}
            </h2>
            {selectedFolder ? (
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                폴더
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setDisplayMode('list')}
              aria-label="목록 보기"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                displayMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('grid')}
              aria-label="그리드 보기"
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                displayMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {sortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              {selectedFolder
                ? `'${selectedFolder}' 폴더에 파일이 없습니다.`
                : EMPTY_HINT[view]}
            </p>
          </div>
        ) : displayMode === 'list' ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm sm:text-[15px]">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  <th className="px-3 py-2.5 sm:w-[44%] sm:px-4 sm:py-3">
                    <SortHeaderButton
                      label="이름"
                      sortKey="name"
                      active={sort}
                      onSelect={handleSelectSortKey}
                    />
                  </th>
                  <th className="hidden sm:table-cell sm:w-[14%] sm:px-3 sm:py-3">
                    소유자
                  </th>
                  <th className="px-2 py-2.5 sm:w-[20%] sm:px-3 sm:py-3">
                    <SortHeaderButton
                      label="마지막 수정"
                      sortKey="modifiedAt"
                      active={sort}
                      onSelect={handleSelectSortKey}
                    />
                  </th>
                  <th className="hidden sm:table-cell sm:w-[14%] sm:px-3 sm:py-3">
                    <SortHeaderButton
                      label="파일 크기"
                      sortKey="size"
                      active={sort}
                      onSelect={handleSelectSortKey}
                    />
                  </th>
                  <th className="px-2 py-2.5 text-right sm:w-[8%] sm:px-3 sm:py-3">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSortMenuOpen((value) => !value);
                          setOpenMenuId(null);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="정렬"
                        aria-haspopup="menu"
                        aria-expanded={sortMenuOpen}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                      {sortMenuOpen ? (
                        <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            정렬 기준
                          </p>
                          {SORT_OPTIONS.map((option) => {
                            const isActive = sort.key === option.key;
                            return (
                              <button
                                key={option.key}
                                type="button"
                                onClick={() => {
                                  handleSelectSortKey(option.key);
                                }}
                                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{option.label}</span>
                                {isActive ? (
                                  sort.direction === 'asc' ? (
                                    <span className="inline-flex items-center gap-1 text-xs">
                                      오름차순
                                      <ArrowUp className="h-3.5 w-3.5" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs">
                                      내림차순
                                      <ArrowDown className="h-3.5 w-3.5" />
                                    </span>
                                  )
                                ) : (
                                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFiles.map((file, index) => {
                  const isStarred = starredIds.has(file.id);
                  return (
                  <tr
                    key={file.id}
                    className="group border-b border-gray-100 transition-colors last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleStar(file.id);
                          }}
                          className={`flex h-7 w-7 flex-none items-center justify-center rounded transition ${
                            isStarred
                              ? 'text-yellow-400'
                              : 'text-slate-300 hover:text-yellow-400 sm:opacity-0 sm:group-hover:opacity-100'
                          }`}
                          aria-label={isStarred ? '중요 표시 해제' : '중요 표시'}
                          aria-pressed={isStarred}
                        >
                          <Star
                            className={`h-4 w-4 ${isStarred ? 'fill-yellow-400' : ''}`}
                          />
                        </button>
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-blue-100 sm:h-9 sm:w-9">
                          <FileText className="h-4 w-4 text-blue-600 sm:h-4.5 sm:w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight text-slate-900">
                            {file.name}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
                            <span className="sm:hidden">
                              {ownerLabel(file)} · {file.size}
                              {file.tag ? ` · ${file.tag}` : ''}
                            </span>
                            <span className="hidden sm:inline">
                              {file.tag ?? ''}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell sm:px-3 sm:py-3.5 sm:text-sm sm:text-slate-600">
                      {ownerLabel(file)}
                    </td>
                    <td className="px-2 py-3 text-xs text-slate-600 sm:px-3 sm:py-3.5 sm:text-sm">
                      {file.modifiedAt.split(' ')[0]}
                    </td>
                    <td className="hidden sm:table-cell sm:px-3 sm:py-3.5 sm:text-sm sm:text-slate-600">
                      {file.size}
                    </td>
                    <td className="px-2 py-3 text-right sm:px-3 sm:py-3.5">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId((current) =>
                              current === file.id ? null : file.id,
                            );
                            setSortMenuOpen(false);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="더보기"
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === file.id}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <ActionMenu
                          open={openMenuId === file.id}
                          align={
                            index >= sortedFiles.length - 2
                              ? 'right-up'
                              : 'right-down'
                          }
                          isTrashView={view === 'trash'}
                          onAction={(action) => handleAction(file, action)}
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedFiles.map((file) => {
              const isStarred = starredIds.has(file.id);
              return (
              <li
                key={file.id}
                className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleStar(file.id);
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded transition ${
                        isStarred
                          ? 'text-yellow-400'
                          : 'text-slate-300 opacity-0 hover:text-yellow-400 group-hover:opacity-100'
                      }`}
                      aria-label={isStarred ? '중요 표시 해제' : '중요 표시'}
                      aria-pressed={isStarred}
                    >
                      <Star
                        className={`h-4 w-4 ${isStarred ? 'fill-yellow-400' : ''}`}
                      />
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((current) =>
                            current === file.id ? null : file.id,
                          );
                          setSortMenuOpen(false);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="더보기"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <ActionMenu
                        open={openMenuId === file.id}
                        align="right-down"
                        isTrashView={view === 'trash'}
                        onAction={(action) => handleAction(file, action)}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-slate-900">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {file.modifiedAt} · {file.size}
                </p>
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    file.owner === CURRENT_USER
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {ownerLabel(file)}
                </span>
              </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardFileExplorer;
