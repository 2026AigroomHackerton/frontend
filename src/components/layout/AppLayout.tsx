// 모든 라우트의 공통 레이아웃.
//   - 데스크톱(lg+): 좌측 Sidebar + 본문
//   - 모바일: 본문 + 하단 MobileFooter (항상 보임)
//   - 풀스크린이 필요한 페이지(EditorPage)는 layout 바깥에서 렌더해도 되고,
//     여기선 모든 페이지가 layout 안에 있다고 가정. EditorPage도 layout 안에서
//     overflow-hidden으로 풀스크린 처리.

import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../archive/Sidebar';
import MobileFooter from './MobileFooter';

// path → sidebar activeKey 매핑
function pathToSidebarKey(pathname: string): string {
  if (pathname.startsWith('/archive/personal')) return 'personal';
  if (pathname.startsWith('/archive/important')) return 'important';
  if (pathname.startsWith('/archive/recent')) return 'recent';
  if (pathname.startsWith('/archive/shared')) return 'shared-docs';
  if (pathname.startsWith('/archive/trash')) return 'trash';
  if (pathname.startsWith('/upload')) return 'upload';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'dashboard';
}

// sidebar key → path
function sidebarKeyToPath(key: string): string {
  switch (key) {
    case 'dashboard':
      return '/archive/all';
    case 'personal':
      return '/archive/personal';
    case 'important':
      return '/archive/important';
    case 'recent':
      return '/archive/recent';
    case 'shared-docs':
      return '/archive/shared';
    case 'trash':
      return '/archive/trash';
    case 'upload':
      return '/upload';
    case 'profile':
      return '/profile';
    default:
      return '/archive/all';
  }
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = pathToSidebarKey(location.pathname);

  const handleSidebarSelect = (key: string) => {
    navigate(sidebarKeyToPath(key));
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar
        activeKey={activeKey}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
      </div>

      <MobileFooter />
    </div>
  );
}

export default AppLayout;
