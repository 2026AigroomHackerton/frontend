import {
  Archive,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Upload,
  User,
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
  { key: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { key: 'upload', label: '문서 업로드', icon: Upload },
  { key: 'archive', label: '문서 아카이브', icon: Archive },
  { key: 'profile', label: '개인정보 관리', icon: User },
  { key: 'group', label: '그룹 관리', icon: Users },
  { key: 'history', label: '답변 이력', icon: MessageSquare },
  { key: 'settings', label: '설정', icon: Settings },
];

type SidebarProps = {
  activeKey?: string;
  open?: boolean;
  onClose?: () => void;
};

function Sidebar({ activeKey = 'dashboard', open = false, onClose }: SidebarProps) {
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
        className={`fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col bg-[#0a1128] text-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#3b82f6]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">AI 기반 한글</p>
              <p className="text-sm font-semibold text-white">문서 작성 비서</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="사이드바 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 flex-none" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mx-3 mb-4 mt-2 flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#3b82f6] text-sm font-semibold text-white">
            김
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">김훈진</p>
            <p className="truncate text-xs text-[#94a3b8]">
              마케팅팀 · 일반 사용자
            </p>
          </div>
          <ChevronRight className="h-4 w-4 flex-none text-[#94a3b8]" />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
