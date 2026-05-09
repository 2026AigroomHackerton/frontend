import PersonalPage from './pages/PersonalPage';
import SharedPage from './pages/SharedPage';

export const appRoutes = [
  {
    path: '/personal',
    label: '개인 문서',
    element: <PersonalPage />,
  },
  {
    path: '/shared',
    label: '공유 문서',
    element: <SharedPage />,
  },
] as const;

function App() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/personal';
  const currentRoute = appRoutes.find((route) => route.path === currentPath);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {currentRoute?.element ?? <PersonalPage />}
    </div>
  );
}

export default App;
