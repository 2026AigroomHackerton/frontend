import { useState } from 'react';
import MobileScanPage from './pages/MobileScanPage';
import DocumentEditorPage from './pages/DocumentEditorPage';

type Screen =
  | { name: 'scan' }
  | { name: 'editor'; title: string; content: string };

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'scan' });

  if (screen.name === 'editor') {
    return (
      <DocumentEditorPage
        initialTitle={screen.title}
        initialContent={screen.content}
        onBack={() => setScreen({ name: 'scan' })}
      />
    );
  }

  return (
    <MobileScanPage
      onOpenEditor={(payload) =>
        setScreen({ name: 'editor', title: payload.title, content: payload.content })
      }
    />
  );
}

export default App;
