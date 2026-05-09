import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Clock,
  FilePlus,
  FileText,
  FolderPlus,
  Home,
  Plus,
  Star,
  Trash2,
  Upload,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: '홈', icon: Home },
  { key: 'important', label: '중요 문서함', icon: Star },
  { key: 'recent', label: '최근 문서함', icon: Clock },
  { key: 'shared-docs', label: '공유 문서함', icon: Users },
];

const TRASH_ITEM: NavItem = {
  key: 'trash',
  label: '휴지통',
  icon: Trash2,
};

type SidebarProps = {
  activeKey?: string;
  open?: boolean;
  onClose?: () => void;
  onSelect?: (key: string) => void;
};

function Sidebar({
  activeKey = 'dashboard',
  open = false,
  onClose,
  onSelect,
}: SidebarProps) {
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!newMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        newMenuRef.current &&
        !newMenuRef.current.contains(event.target as Node)
      ) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [newMenuOpen]);

  const handleNewAction = (action: 'folder' | 'file' | 'upload') => {
    setNewMenuOpen(false);
    if (action === 'folder') {
      const name = window.prompt('새 폴더 이름을 입력하세요.');
      if (name) alert(`폴더 생성: ${name}`);
    } else if (action === 'file') {
      const name = window.prompt('새 파일 이름을 입력하세요.');
      if (name) alert(`파일 생성: ${name}`);
    } else if (action === 'upload') {
      onSelect?.('upload');
      onClose?.();
    }
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-gray-200 bg-white text-slate-900 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:self-start ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#3b82f6]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                AI 기반 한글
              </p>
              <p className="text-sm font-semibold text-slate-900">
                문서 작성 비서
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 lg:hidden"
            aria-label="사이드바 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={newMenuRef} className="relative px-3 pb-1">
          <button
            type="button"
            onClick={() => setNewMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={newMenuOpen}
            className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-md transition-colors hover:bg-slate-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b82f6] text-white">
              <Plus className="h-4 w-4" />
            </span>
            신규
          </button>

          {newMenuOpen ? (
            <div
              className="absolute left-3 right-3 top-full z-30 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              role="menu"
            >
              <button
                type="button"
                onClick={() => handleNewAction('folder')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <FolderPlus className="h-4 w-4 text-slate-500" />
                새 폴더
              </button>
              <button
                type="button"
                onClick={() => handleNewAction('file')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <FilePlus className="h-4 w-4 text-slate-500" />
                새 파일
              </button>
              <div className="border-t border-gray-100" />
              <button
                type="button"
                onClick={() => handleNewAction('upload')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Upload className="h-4 w-4 text-slate-500" />
                파일 업로드
              </button>
            </div>
          ) : null}
        </div>

        <nav className="mt-3 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect?.(item.key);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 flex-none" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-2 border-t border-gray-200 px-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onSelect?.(TRASH_ITEM.key);
              onClose?.();
            }}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeKey === TRASH_ITEM.key
                ? 'bg-[#3b82f6] text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TRASH_ITEM.icon className="h-4 w-4 flex-none" />
            <span>{TRASH_ITEM.label}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelect?.('profile')}
          className="mx-3 mb-4 mt-2 flex items-center gap-3 rounded-lg bg-slate-100 p-3 text-left transition-colors hover:bg-slate-200"
        >
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#3b82f6] text-sm font-semibold text-white">
            양
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">양희승</p>
            <p className="truncate text-xs text-slate-500">
              마케팅팀 · 일반 사용자
            </p>
          </div>
          <ChevronRight className="h-4 w-4 flex-none text-slate-400" />
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
