import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Cloud, Loader2, Upload } from 'lucide-react';
import UploadHeader from '../components/upload/UploadHeader';
import FileDropzone from '../components/upload/FileDropzone';
import { uploadDocument } from '../api/documents';
import { ApiError } from '../api/client';
import { importExternalDocument } from '../api/connectors';

interface LayoutContext {
  openSidebar: () => void;
}

function DocumentUploadPage() {
  const navigate = useNavigate();
  const { openSidebar } = useOutletContext<LayoutContext>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState<'google_drive' | 'notion' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleStartUpload = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      const meta = await uploadDocument({
        file: selectedFile,
        title: selectedFile.name.replace(/\.(hwpx|hwp)$/i, ''),
        sourceType: 'upload',
      });
      // 업로드 직후 EditorPage로 이동.
      // documentId(URL) + 클라이언트 측 File(라우트 state)을 함께 전달해
      // 뷰어가 즉시 rhwp.loadFile로 띄울 수 있게 한다.
      navigate(`/editor/${meta.id}`, { state: { file: selectedFile, meta } });
    } catch (caught) {
      const message =
        caught instanceof ApiError ? caught.message : '업로드 중 오류가 발생했어요.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExternalImport = async (provider: 'google_drive' | 'notion') => {
    setUploadError(null);
    setIsImporting(provider);
    try {
      const result = await importExternalDocument(provider);
      if (result.imported_document_id) {
        navigate(`/editor/${result.imported_document_id}`, {
          state: { meta: { id: Number(result.imported_document_id), title: result.title } },
        });
        return;
      }
      setUploadError(
        `${provider === 'google_drive' ? 'Google Drive' : 'Notion'} 문서를 불러왔지만 문서 ID가 없어 편집기로 열 수 없습니다.`,
      );
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : '외부 저장소 문서를 불러오지 못했습니다.';
      setUploadError(message);
    } finally {
      setIsImporting(null);
    }
  };

  return (
    <>
      <UploadHeader onOpenSidebar={openSidebar} />

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-3xl">
          <FileDropzone
            selectedFile={selectedFile}
            isDragging={isDragging}
            onFileSelected={setSelectedFile}
            onDragStateChange={setIsDragging}
            onClearFile={() => setSelectedFile(null)}
          />

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Cloud className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-slate-900">외부 저장소에서 불러오기</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Google Drive와 Notion API에서 문서를 가져와 편집용 HWPX로 변환합니다.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleExternalImport('google_drive')}
                disabled={isImporting !== null}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {isImporting === 'google_drive' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Google Drive 불러오기
              </button>
              <button
                type="button"
                onClick={() => handleExternalImport('notion')}
                disabled={isImporting !== null}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {isImporting === 'notion' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Notion 불러오기
              </button>
            </div>
          </section>

          {uploadError ? (
            <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {uploadError}
            </p>
          ) : null}

          {selectedFile ? (
            <button
              type="button"
              onClick={handleStartUpload}
              disabled={isUploading}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  업로드 중…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  업로드 시작
                </>
              )}
            </button>
          ) : null}
        </div>
      </main>
    </>
  );
}

export default DocumentUploadPage;
