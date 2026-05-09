import PersonalPage from './pages/PersonalPage';
import { findRouteByPath } from './routes';

function App() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/personal';
  const currentRoute = findRouteByPath(currentPath);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {currentRoute?.element ?? <PersonalPage />}
    </div>
  );
}

export default App;
