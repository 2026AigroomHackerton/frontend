// archive/MobileFooter에서 분리. 라우터(useLocation/useNavigate)와 연결.
// 모바일에서만 보이고(lg:hidden), AppLayout이 페이지 어디서든 fixed로 깔아준다.

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  FolderPlus,
  Home,
  Plus,
  Star,
  Upload,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

type FooterItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

const ITEMS: FooterItem[] = [
  { key: 'dashboard', label: '홈', icon: Home, path: '/archive/all' },
  { key: 'personal', label: '개인 문서함', icon: User, path: '/archive/personal' },
  { key: 'important', label: '중요 문서함', icon: Star, path: '/archive/important' },
  { key: 'shared-docs', label: '공유 문서함', icon: Users, path: '/archive/shared' },
];

function MobileFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // 사용자 제스처 안에서 직접 input.click()을 호출해야 모바일 브라우저가
  // 카메라를 띄움. setTimeout이나 navigate 후 useEffect로 호출하면 제스처가
  // 끊겨 일반 파일 탐색기로 fallback됨.
  const handleAction = (action: 'upload' | 'camera' | 'folder') => {
    setMenuOpen(false);
    if (action === 'upload') {
      navigate('/upload');
      return;
    }
    if (action === 'camera') {
      cameraInputRef.current?.click();
      return;
    }
    if (action === 'folder') {
      const name = window.prompt('새 폴더 이름을 입력하세요.');
      if (name) alert(`폴더 생성: ${name}`);
    }
  };

  const handleCameraFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    // 사용자가 카메라/선택을 취소한 경우 그냥 무시
    if (!file) return;
    navigate('/camera', { state: { file } });
    // 같은 파일 재선택 가능하도록 input value 초기화
    event.target.value = '';
  };

  const activePath = location.pathname;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] lg:hidden"
      aria-label="모바일 하단 네비게이션"
    >
      {/* hidden 카메라 input — handleAction('camera')가 사용자 제스처 안에서 직접 click() */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleCameraFile}
        aria-hidden
        tabIndex={-1}
      />

      <div
        ref={menuRef}
        className="pointer-events-none absolute inset-x-0 -top-14 grid grid-cols-4"
      >
        <div />
        <div />
        <div />
        <div className="pointer-events-auto relative flex flex-col items-center">
          {menuOpen ? (
            <div
              className="absolute bottom-full left-1/2 mb-2 w-44 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
              role="menu"
            >
              <button
                type="button"
                onClick={() => handleAction('upload')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Upload className="h-4 w-4 text-slate-500" />
                파일 업로드
              </button>
              <button
                type="button"
                onClick={() => handleAction('camera')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Camera className="h-4 w-4 text-slate-500" />
                사진 촬영
              </button>
              <button
                type="button"
                onClick={() => handleAction('folder')}
                className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <FolderPlus className="h-4 w-4 text-slate-500" />
                폴더 만들기
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform hover:bg-blue-700 active:scale-95"
            aria-label="새로 만들기"
          >
            <Plus
              className={`h-5 w-5 transition-transform ${menuOpen ? 'rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileFooter;
