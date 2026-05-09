import { Menu } from 'lucide-react';
import { useOutletContext, useParams } from 'react-router-dom';
import DashboardFileExplorer from '../components/archive/DashboardFileExplorer';

export type ArchiveView = 'all' | 'personal' | 'important' | 'recent' | 'shared' | 'trash';

const VIEW_TO_TITLE: Record<ArchiveView, { title: string; subtitle: string }> = {
  all: {
    title: '홈',
    subtitle: 'AI 모바일 문서 비서에 오신 것을 환영합니다.',
  },
  personal: {
    title: '개인 문서함',
    subtitle: '내가 만든 문서를 한곳에서 확인해요.',
  },
  important: {
    title: '중요 문서함',
    subtitle: '중요로 표시한 문서만 모아봅니다.',
  },
  recent: {
    title: '최근 문서함',
    subtitle: '가장 최근에 수정한 문서를 확인해요.',
  },
  shared: {
    title: '공유 문서함',
    subtitle: '공유받은 문서와 외부 저장소 문서를 확인해요.',
  },
  trash: {
    title: '휴지통',
    subtitle: '삭제한 문서를 복원하거나 완전히 삭제할 수 있어요.',
  },
};

const VALID_VIEWS = new Set(Object.keys(VIEW_TO_TITLE));

interface LayoutContext {
  openSidebar: () => void;
}

function ArchivePage() {
  const { view: rawView } = useParams<{ view: string }>();
  const view: ArchiveView =
    rawView && VALID_VIEWS.has(rawView) ? (rawView as ArchiveView) : 'all';
  const { openSidebar } = useOutletContext<LayoutContext>();
  const { title, subtitle } = VIEW_TO_TITLE[view];

  return (
    <>
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={openSidebar}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="사이드바 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
        <DashboardFileExplorer view={view} />
      </main>
    </>
  );
}

export default ArchivePage;
