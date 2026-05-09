import { useState } from 'react';
import { Upload } from 'lucide-react';
import Sidebar from '../components/archive/Sidebar';
import UploadHeader from '../components/upload/UploadHeader';
import FileDropzone from '../components/upload/FileDropzone';

type DocumentUploadPageProps = {
  onNavigate?: (key: string) => void;
};

function DocumentUploadPage({ onNavigate }: DocumentUploadPageProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleStartUpload = () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }
    alert(`업로드를 시작합니다: ${selectedFile.name}`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar
        activeKey="upload"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={onNavigate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <UploadHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex flex-1 items-start justify-center px-4 py-8 pb-24 sm:px-6 sm:py-12 lg:pb-12">
          <div className="w-full max-w-3xl">
            <FileDropzone
              selectedFile={selectedFile}
              isDragging={isDragging}
              onFileSelected={setSelectedFile}
              onDragStateChange={setIsDragging}
              onClearFile={() => setSelectedFile(null)}
            />

            {selectedFile ? (
              <button
                type="button"
                onClick={handleStartUpload}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Upload className="h-4 w-4" />
                업로드 시작
              </button>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DocumentUploadPage;
