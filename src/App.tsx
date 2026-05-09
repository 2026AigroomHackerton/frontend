import PersonalPage from './pages/PersonalPage';
import SharedPage from './pages/SharedPage';

function App() {
  const isSharedRoute =
    typeof window !== 'undefined' && window.location.pathname.includes('shared');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {isSharedRoute ? <SharedPage /> : <PersonalPage />}
    </div>
  );
}

export default App;
