import { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import Sidebar from '../components/archive/Sidebar';
import StatCards from '../components/archive/StatCards';
import RecentDocuments from '../components/archive/RecentDocuments';
import QuickStart from '../components/archive/QuickStart';
import FolderSection from '../components/archive/FolderSection';
import AiActivityFeed from '../components/archive/AiActivityFeed';
import MobileFooter from '../components/archive/MobileFooter';

function ArchivePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState('personal');

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <Sidebar
        activeKey="dashboard"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/5 bg-[#0f172a] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-md text-[#94a3b8] hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="사이드바 열기"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-white sm:text-xl">
                대시보드
              </h1>
              <p className="hidden text-xs text-[#94a3b8] sm:block">
                AI 기반 한글 문서 작성 비서에 오신 것을 환영합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md text-[#94a3b8] hover:bg-white/5 hover:text-white"
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-[#94a3b8] hover:bg-white/5 hover:text-white"
              aria-label="알림"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-4 px-4 py-5 pb-24 sm:space-y-6 sm:px-6 sm:py-6 lg:pb-6">
          <StatCards />
          <QuickStart />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <RecentDocuments />
              <FolderSection />
            </div>
            <div>
              <AiActivityFeed />
            </div>
          </div>
        </main>
      </div>

      <MobileFooter activeKey={mobileNav} onSelect={setMobileNav} />
    </div>
  );
}

export default ArchivePage;
