import { useState } from 'react';
import ArchivePage, { type ArchiveView } from './pages/ArchivePage';
import ProfilePage from './pages/ProfilePage';
import DocumentUploadPage from './pages/DocumentUploadPage';

type PageKey = 'archive' | 'profile' | 'upload';

const SIDEBAR_TO_VIEW: Record<string, ArchiveView> = {
  dashboard: 'all',
  personal: 'personal',
  important: 'important',
  recent: 'recent',
  'shared-docs': 'shared',
  trash: 'trash',
};

function App() {
  const [page, setPage] = useState<PageKey>('archive');
  const [view, setView] = useState<ArchiveView>('all');

  const handleNavigate = (key: string) => {
    if (key === 'upload') {
      setPage('upload');
      return;
    }
    if (key === 'profile') {
      setPage('profile');
      return;
    }
    const nextView = SIDEBAR_TO_VIEW[key];
    if (nextView) {
      setPage('archive');
      setView(nextView);
    }
  };

  return (
    <>
      {page === 'archive' && (
        <ArchivePage view={view} onNavigate={handleNavigate} />
      )}
      {page === 'profile' && (
        <ProfilePage
          onBack={() => setPage('archive')}
          onNavigate={handleNavigate}
        />
      )}
      {page === 'upload' && <DocumentUploadPage onNavigate={handleNavigate} />}
    </>
  );
}

export default App;
