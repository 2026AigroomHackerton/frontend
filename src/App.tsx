import { useState } from 'react';
import MobileScanPage from './pages/MobileScanPage';
import EditorPage from './pages/EditorPage';
import ArchivePage from './pages/ArchivePage';

// 라우터 미연결 상태에서 기능 확인을 위한 간단한 탭바.
// 실제 라우팅은 frontend/src/routes에서 추후 연결 예정.

type TabKey = 'scan' | 'editor' | 'archive';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'scan', label: '모바일 스캔' },
  { key: 'editor', label: '편집기' },
  { key: 'archive', label: '아카이브' },
];

function App() {
  const [tab, setTab] = useState<TabKey>('scan');

  return (
    <div className="min-h-screen flex flex-col">
      {/* 확인용 탭바 */}
      <nav className="flex gap-2 border-b bg-slate-100 px-4 py-2">
        {TABS.map((item) => {
          const isActive = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={
                'px-3 py-1 text-sm rounded ' +
                (isActive ? 'bg-blue-500 text-white' : 'bg-white text-slate-700 border')
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1">
        {tab === 'scan' && <MobileScanPage />}
        {tab === 'editor' && <EditorPage />}
        {tab === 'archive' && <ArchivePage />}
      </div>
    </div>
  );
}

export default App;
