import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/archive/Sidebar';
import DashboardFileExplorer from '../components/archive/DashboardFileExplorer';
import MobileFooter from '../components/archive/MobileFooter';

export type ArchiveView =
  | 'all'
  | 'personal'
  | 'important'
  | 'recent'
  | 'shared'
  | 'trash';

const VIEW_TO_SIDEBAR_KEY: Record<ArchiveView, string> = {
  all: 'dashboard',
  personal: 'personal',
  important: 'important',
  recent: 'recent',
  shared: 'shared-docs',
  trash: 'trash',
};

const VIEW_TO_TITLE: Record<ArchiveView, { title: string; subtitle: string }> = {
  all: {
    title: '홈',
    subtitle: 'AI 모바일 문서 비서에 오신 것을 환영합니다.',
  },
  personal: {
    title: '개인 문서함',
    subtitle: '내가 만든 문서만 모아보기',
  },
  important: {
    title: '중요 문서함',
    subtitle: '중요로 표시한 문서만 모아보기',
  },
  recent: {
    title: '최근 문서함',
    subtitle: '가장 최근에 수정한 문서',
  },
  shared: {
    title: '공유 문서함',
    subtitle: '다른 사람이 공유한 문서',
  },
  trash: {
    title: '휴지통',
    subtitle: '삭제된 문서',
  },
};

type ArchivePageProps = {
  view?: ArchiveView;
  onNavigate?: (key: string) => void;
};

function ArchivePage({ view = 'all', onNavigate }: ArchivePageProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { title, subtitle } = VIEW_TO_TITLE[view];
  const mobileFooterActive = VIEW_TO_SIDEBAR_KEY[view];

  const handleMobileFooterSelect = (key: string) => {
    onNavigate?.(key);
  };

  const handleMobileFooterAction = (action: 'upload' | 'camera' | 'folder') => {
    if (action === 'upload') {
      onNavigate?.('upload');
      return;
    }
    if (action === 'camera') {
      alert('사진 촬영 기능은 준비 중입니다.');
      return;
    }
    if (action === 'folder') {
      const name = window.prompt('새 폴더 이름을 입력하세요.');
      if (name) alert(`폴더 생성: ${name}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar
        activeKey={VIEW_TO_SIDEBAR_KEY[view]}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={onNavigate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="사이드바 열기"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
              {title}
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>

        </header>

        <main className="flex-1 space-y-4 px-4 py-5 pb-24 sm:space-y-6 sm:px-6 sm:py-6 lg:pb-6">
          <DashboardFileExplorer view={view} />
        </main>
      </div>

      <MobileFooter
        activeKey={mobileFooterActive}
        onSelect={handleMobileFooterSelect}
        onAction={handleMobileFooterAction}
      />
    </div>
  );
}

export default ArchivePage;
