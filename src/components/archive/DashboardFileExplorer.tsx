import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ApiError } from '../../api/client';
import { buildApiUrl } from '../../api/client';
import { getArchive, type ArchiveExternalCard, type ArchiveLocalCard } from '../../api/archive';

type ViewMode = 'list' | 'grid';
type SortKey = 'name' | 'modifiedAt' | 'size';
type SortDirection = 'asc' | 'desc';

export type ArchiveViewKey = 'all' | 'personal' | 'important' | 'recent' | 'shared' | 'trash';

type DashboardFile = {
  id: string;
  documentId?: number;
  name: string;
  category: 'personal' | 'external';
  owner: string;
  modifiedAt: string;
  size: string;
  tag?: string;
  status?: string;
};

type RecommendedFolder = {
  id: string;
  name: string;
  count: number;
  color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
};

type FileAction = 'download' | 'rename' | 'important' | 'unimportant' | 'trash' | 'restore' | 'deleteForever';

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

const CURRENT_USER = '나';
const STARRED_STORAGE_KEY = 'groom_archive_starred_ids';
const TRASHED_STORAGE_KEY = 'groom_archive_trashed_ids';
const DELETED_STORAGE_KEY = 'groom_archive_deleted_ids';

const VIEW_HEADING: Record<ArchiveViewKey, string> = {
  all: '전체 문서',
  personal: '개인 문서',
  important: '중요 문서',
  recent: '최근 문서',
  shared: '공유/외부 문서',
  trash: '휴지통',
};

const EMPTY_HINT: Record<ArchiveViewKey, string> = {
  all: '표시할 문서가 없습니다.',
  personal: '개인 문서가 없습니다.',
  important: '중요로 표시한 문서가 없습니다.',
  recent: '최근 수정한 문서가 없습니다.',
  shared: '공유 또는 외부 저장소 문서가 없습니다.',
  trash: '휴지통이 비어 있습니다.',
};

const FOLDER_COLOR: Record<RecommendedFolder['color'], string> = {
  blue: 'bg-blue-100 text-blue-600',
  violet: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
  sky: 'bg-sky-100 text-sky-600',
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '이름' },
  { key: 'modifiedAt', label: '수정 날짜' },
  { key: 'size', label: '파일 크기' },
];

function readStoredSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeStoredSet(key: string, value: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...value]));
}

function mapLocalCard(card: ArchiveLocalCard, folderId: number | null): DashboardFile {
  return {
    id: `document-${card.id}`,
    documentId: card.id,
    name: card.title || `문서 ${card.id}`,
    category: 'personal',
    owner: CURRENT_USER,
    modifiedAt: card.updated_at || card.created_at || '',
    size: '-',
    tag: folderId === null ? '미분류' : `폴더 ${folderId}`,
  };
}

function mapExternalCard(card: ArchiveExternalCard): DashboardFile {
  return {
    id: `external-${card.id}`,
    name: card.title,
    category: 'external',
    owner: '외부 저장소',
    modifiedAt: '',
    size: '-',
    tag: card.source_type,
    status: card.status,
  };
}

function ownerLabel(file: DashboardFile) {
  return file.owner === CURRENT_USER ? '나' : file.owner;
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

function downloadFilePlaceholder(file: DashboardFile) {
  if (!file.documentId) return;
  window.open(buildApiUrl(`/api/documents/${file.documentId}/file`), '_blank');
}

type ActionMenuProps = {
  open: boolean;
  align: 'right-down' | 'right-up';
  isTrashView?: boolean;
  isImportant?: boolean;
  onAction: (action: FileAction) => void;
};

function ActionMenu({ open, align, isTrashView, isImportant, onAction }: ActionMenuProps) {
  if (!open) return null;
  const positionClass = align === 'right-up' ? 'right-0 bottom-full mb-1' : 'right-0 top-full mt-1';

  if (isTrashView) {
    return (
      <div className={`absolute z-20 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${positionClass}`} role="menu">
        <button type="button" onClick={() => onAction('restore')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
          <RotateCcw className="h-4 w-4" />
          복원
        </button>
        <button type="button" onClick={() => onAction('deleteForever')} className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
          영구 삭제
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute z-20 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${positionClass}`} role="menu">
      <button type="button" onClick={() => onAction('download')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
        <Download className="h-4 w-4" />
        다운로드
      </button>
      <button type="button" onClick={() => onAction(isImportant ? 'unimportant' : 'important')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
        <Star className={`h-4 w-4 ${isImportant ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        {isImportant ? '중요 해제' : '중요 표시'}
      </button>
      <button type="button" onClick={() => onAction('rename')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
        <Pencil className="h-4 w-4" />
        이름 변경
      </button>
      <button type="button" onClick={() => onAction('trash')} className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
        <Trash2 className="h-4 w-4" />
        휴지통으로 이동
      </button>
    </div>
  );
}

function SortHeaderButton({
  label,
  sortKey,
  active,
  onSelect,
}: {
  label: string;
  sortKey: SortKey;
  active: SortState;
  onSelect: (key: SortKey) => void;
}) {
  const isActive = active.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSelect(sortKey)}
      className={`inline-flex items-center gap-1 transition-colors hover:text-slate-900 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}
    >
      {label}
      {isActive ? (
        active.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
}

function DashboardFileExplorer({ view = 'all' }: { view?: ArchiveViewKey } = {}) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayMode, setDisplayMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: 'modifiedAt', direction: 'desc' });
  const [starredIds, setStarredIds] = useState<Set<string>>(() => readStoredSet(STARRED_STORAGE_KEY));
  const [trashedIds, setTrashedIds] = useState<Set<string>>(() => readStoredSet(TRASHED_STORAGE_KEY));
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => readStoredSet(DELETED_STORAGE_KEY));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [folders, setFolders] = useState<RecommendedFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => writeStoredSet(STARRED_STORAGE_KEY, starredIds), [starredIds]);
  useEffect(() => writeStoredSet(TRASHED_STORAGE_KEY, trashedIds), [trashedIds]);
  useEffect(() => writeStoredSet(DELETED_STORAGE_KEY, deletedIds), [deletedIds]);

  useEffect(() => {
    let cancelled = false;

    async function loadArchive() {
      setIsLoading(true);
      setError(null);
      try {
        const archive = await getArchive();
        if (cancelled) return;

        const localFiles = archive.local.flatMap((group) =>
          group.documents.map((document) => mapLocalCard(document, group.folder_id)),
        );
        const externalFiles = archive.external.map(mapExternalCard);
        const colors: RecommendedFolder['color'][] = ['amber', 'emerald', 'blue', 'rose', 'sky', 'violet'];
        const derivedFolders = archive.local.map((group, index) => ({
          id: group.folder_id === null ? 'unclassified' : String(group.folder_id),
          name: group.folder_id === null ? '미분류' : `폴더 ${group.folder_id}`,
          count: group.documents.length,
          color: colors[index % colors.length],
        }));

        setFiles([...localFiles, ...externalFiles]);
        setFolders(derivedFolders);
      } catch (caught) {
        if (cancelled) return;
        const message = caught instanceof ApiError ? caught.message : '아카이브를 불러오지 못했습니다.';
        setError(message);
        setFiles([]);
        setFolders([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadArchive();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setSelectedFolder(null), [view]);

  useEffect(() => {
    if (openMenuId === null && !sortMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId, sortMenuOpen]);

  function updateSet(
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    updater: (next: Set<string>) => void,
  ) {
    setter((prev) => {
      const next = new Set(prev);
      updater(next);
      return next;
    });
  }

  const toggleStar = (id: string) => {
    updateSet(setStarredIds, (next) => {
      if (next.has(id)) next.delete(id);
      else next.add(id);
    });
  };

  const handleSelectSortKey = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  };

  const handleOpenFile = (file: DashboardFile) => {
    if (view === 'trash') {
      setNotice('휴지통의 문서는 복원한 뒤 열 수 있습니다.');
      return;
    }
    if (file.documentId) navigate(`/editor/${file.documentId}`);
  };

  const handleAction = (file: DashboardFile, action: FileAction) => {
    setOpenMenuId(null);
    setNotice(null);

    if (action === 'download') {
      downloadFilePlaceholder(file);
      return;
    }
    if (action === 'rename') {
      setNotice('이름 변경 API가 아직 연결되지 않았습니다.');
      return;
    }
    if (action === 'important') {
      updateSet(setStarredIds, (next) => next.add(file.id));
      setNotice('중요 문서함에 추가했습니다.');
      return;
    }
    if (action === 'unimportant') {
      updateSet(setStarredIds, (next) => next.delete(file.id));
      setNotice('중요 표시를 해제했습니다.');
      return;
    }
    if (action === 'trash') {
      updateSet(setTrashedIds, (next) => next.add(file.id));
      updateSet(setStarredIds, (next) => next.delete(file.id));
      setNotice('휴지통으로 이동했습니다.');
      return;
    }
    if (action === 'restore') {
      updateSet(setTrashedIds, (next) => next.delete(file.id));
      setNotice('문서를 복원했습니다.');
      return;
    }
    if (action === 'deleteForever') {
      const ok = window.confirm('이 문서를 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
      if (!ok) return;
      updateSet(setTrashedIds, (next) => next.delete(file.id));
      updateSet(setStarredIds, (next) => next.delete(file.id));
      updateSet(setDeletedIds, (next) => next.add(file.id));
      setNotice('문서를 영구 삭제했습니다.');
    }
  };

  const filteredFiles = useMemo(() => {
    const existingFiles = files.filter((file) => !deletedIds.has(file.id));
    let base: DashboardFile[];

    if (view === 'trash') {
      base = existingFiles.filter((file) => trashedIds.has(file.id));
    } else if (view === 'personal') {
      base = existingFiles.filter((file) => file.category === 'personal' && !trashedIds.has(file.id));
    } else if (view === 'important') {
      base = existingFiles.filter((file) => starredIds.has(file.id) && !trashedIds.has(file.id));
    } else if (view === 'shared') {
      base = existingFiles.filter((file) => file.category === 'external' && !trashedIds.has(file.id));
    } else if (view === 'recent') {
      base = existingFiles
        .filter((file) => !trashedIds.has(file.id))
        .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    } else {
      base = existingFiles.filter((file) => !trashedIds.has(file.id));
    }

    if (selectedFolder) {
      base = base.filter((file) => file.tag === selectedFolder);
    }
    return base;
  }, [deletedIds, files, selectedFolder, starredIds, trashedIds, view]);

  const sortedFiles = useMemo(() => {
    const arr = [...filteredFiles];
    arr.sort((a, b) => {
      const cmp = compareFiles(a, b, sort.key);
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredFiles, sort]);

  if (isLoading) {
    return <div className="rounded-lg border border-gray-200 bg-white p-8 text-sm text-slate-500">문서를 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {notice ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">{notice}</div>
      ) : null}

      {view === 'all' && !selectedFolder && folders.length > 0 ? (
        <section>
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">폴더</h2>
          </header>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedFolder(folder.name)}
                className="group flex flex-col items-start gap-1.5 rounded-lg border border-gray-200 bg-white p-2.5 text-left shadow-sm transition-colors hover:border-blue-300 hover:shadow-md sm:gap-2 sm:p-3"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${FOLDER_COLOR[folder.color]}`}>
                  <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">{folder.name}</p>
                <p className="text-[10px] text-slate-500 sm:text-[11px]">{folder.count}개 항목</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
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
            <h2 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {selectedFolder ? selectedFolder : VIEW_HEADING[view]}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {sortedFiles.length}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
            <button type="button" onClick={() => setDisplayMode('list')} aria-label="목록 보기" className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${displayMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <List className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setDisplayMode('grid')} aria-label="그리드 보기" className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${displayMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
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
              {selectedFolder ? `'${selectedFolder}' 폴더에 파일이 없습니다.` : EMPTY_HINT[view]}
            </p>
          </div>
        ) : displayMode === 'list' ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm sm:text-[15px]">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  <th className="px-3 py-2.5 sm:w-[44%] sm:px-4 sm:py-3">
                    <SortHeaderButton label="이름" sortKey="name" active={sort} onSelect={handleSelectSortKey} />
                  </th>
                  <th className="hidden sm:table-cell sm:w-[14%] sm:px-3 sm:py-3">소유자</th>
                  <th className="px-2 py-2.5 sm:w-[20%] sm:px-3 sm:py-3">
                    <SortHeaderButton label="마지막 수정" sortKey="modifiedAt" active={sort} onSelect={handleSelectSortKey} />
                  </th>
                  <th className="hidden sm:table-cell sm:w-[14%] sm:px-3 sm:py-3">
                    <SortHeaderButton label="파일 크기" sortKey="size" active={sort} onSelect={handleSelectSortKey} />
                  </th>
                  <th className="relative px-2 py-2.5 text-right sm:w-[8%] sm:px-3 sm:py-3">
                    <button type="button" onClick={(event) => { event.stopPropagation(); setSortMenuOpen((value) => !value); setOpenMenuId(null); }} className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="정렬" aria-haspopup="menu" aria-expanded={sortMenuOpen}>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                    {sortMenuOpen ? (
                      <div className="absolute right-8 z-30 mt-1 w-44 overflow-hidden rounded-md border border-gray-200 bg-white text-left shadow-lg">
                        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">정렬 기준</p>
                        {SORT_OPTIONS.map((option) => (
                          <button key={option.key} type="button" onClick={() => handleSelectSortKey(option.key)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                            <span>{option.label}</span>
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFiles.map((file, index) => {
                  const isStarred = starredIds.has(file.id);
                  return (
                    <tr key={file.id} onDoubleClick={() => handleOpenFile(file)} className="group border-b border-gray-100 transition-colors last:border-0 hover:bg-blue-50/40">
                      <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button type="button" onClick={(event) => { event.stopPropagation(); toggleStar(file.id); }} className={`flex h-7 w-7 flex-none items-center justify-center rounded transition ${isStarred ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400 sm:opacity-0 sm:group-hover:opacity-100'}`} aria-label={isStarred ? '중요 표시 해제' : '중요 표시'} aria-pressed={isStarred}>
                            <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-400' : ''}`} />
                          </button>
                          <button type="button" onClick={() => handleOpenFile(file)} className="flex min-w-0 items-center gap-2 text-left sm:gap-3">
                            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-blue-100 sm:h-9 sm:w-9">
                              <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium leading-tight text-slate-900">{file.name}</span>
                              <span className="mt-0.5 block truncate text-[11px] text-slate-500 sm:text-xs">{file.tag ?? ''}</span>
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell sm:px-3 sm:py-3.5 sm:text-sm sm:text-slate-600">{ownerLabel(file)}</td>
                      <td className="px-2 py-3 text-xs text-slate-600 sm:px-3 sm:py-3.5 sm:text-sm">{file.modifiedAt ? file.modifiedAt.split('T')[0] : file.status ?? '-'}</td>
                      <td className="hidden sm:table-cell sm:px-3 sm:py-3.5 sm:text-sm sm:text-slate-600">{file.size}</td>
                      <td className="px-2 py-3 text-right sm:px-3 sm:py-3.5">
                        <div className="relative inline-block">
                          <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => (current === file.id ? null : file.id)); setSortMenuOpen(false); }} className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="더보기" aria-haspopup="menu" aria-expanded={openMenuId === file.id}>
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <ActionMenu open={openMenuId === file.id} align={index >= sortedFiles.length - 2 ? 'right-up' : 'right-down'} isTrashView={view === 'trash'} isImportant={isStarred} onAction={(action) => handleAction(file, action)} />
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
                <li key={file.id} className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => handleOpenFile(file)} className="flex min-w-0 items-start gap-3 text-left">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{file.name}</span>
                        <span className="mt-1 block text-xs text-slate-500">{file.modifiedAt || file.status || '-'}</span>
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={(event) => { event.stopPropagation(); toggleStar(file.id); }} className={`flex h-7 w-7 items-center justify-center rounded transition ${isStarred ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`} aria-label={isStarred ? '중요 표시 해제' : '중요 표시'} aria-pressed={isStarred}>
                        <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-400' : ''}`} />
                      </button>
                      <div className="relative">
                        <button type="button" onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => (current === file.id ? null : file.id)); }} className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="더보기" aria-haspopup="menu" aria-expanded={openMenuId === file.id}>
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <ActionMenu open={openMenuId === file.id} align="right-down" isTrashView={view === 'trash'} isImportant={isStarred} onAction={(action) => handleAction(file, action)} />
                      </div>
                    </div>
                  </div>
                  <span className={`mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${file.category === 'personal' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
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
