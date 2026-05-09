import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ArchivePage from './pages/ArchivePage';
import CameraCapturePage from './pages/CameraCapturePage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import EditorPage from './pages/EditorPage';
import PersonalPage from './pages/PersonalPage';
import ProfilePage from './pages/ProfilePage';
import SharedPage from './pages/SharedPage';

const editorRoutes = [
  { path: '/editor', element: <EditorPage /> },
  { path: '/editor/:documentId', element: <EditorPage /> },
] as const;

const layoutRoutes = [
  { path: '/archive/:view', element: <ArchivePage /> },
  { path: '/personal', element: <PersonalPage /> },
  { path: '/shared', element: <SharedPage /> },
  { path: '/upload', element: <DocumentUploadPage /> },
  { path: '/camera', element: <CameraCapturePage /> },
  { path: '/profile', element: <ProfilePage /> },
] as const;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {editorRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/archive/all" replace />} />
          {layoutRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to="/archive/all" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
