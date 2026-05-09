import { Download, FilePlus, Save } from 'lucide-react';
import type { AiState } from '../../hooks/useAiEditFlow';
import AiActivityOverlay from './AiActivityOverlay';
import RhwpViewer from './RhwpViewer';

interface DocumentEditorProps {
  title: string;
  file: File | null;
  error: string | null;
  aiState: AiState;
  onTitleChange: (value: string) => void;
  onSelectFile: (file: File | null) => void;
  onSave: () => void;
  onDownload: () => void;
}

function DocumentEditor({
  title,
  file,
  error,
  aiState,
  onTitleChange,
  onSelectFile,
  onSave,
  onDownload,
}: DocumentEditorProps) {
  const hasFile = file !== null;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* compact header */}
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="문서명을 입력하세요"
          aria-label="문서명"
          className="min-w-0 flex-1 truncate bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:outline-none sm:text-lg"
        />

        <div className="flex shrink-0 items-center gap-1">
          <label
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:px-3"
            aria-label="파일 업로드"
          >
            <FilePlus size={15} aria-hidden />
            <span className="hidden sm:inline">업로드</span>
            <input
              type="file"
              accept=".hwpx,.hwp"
              className="sr-only"
              onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            disabled={!hasFile}
            onClick={onSave}
            aria-label="저장"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            <Save size={15} aria-hidden />
            <span className="hidden sm:inline">저장</span>
          </button>
          <button
            type="button"
            disabled={!hasFile}
            onClick={onDownload}
            aria-label="다운로드"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-900 px-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            <Download size={15} aria-hidden />
            <span className="hidden sm:inline">다운로드</span>
          </button>
        </div>
      </header>

      {/* error banner */}
      {error ? (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 sm:px-5 sm:text-sm">
          {error}
        </div>
      ) : null}

      {/* viewer + overlay */}
      <div className="relative flex min-h-0 flex-1">
        <RhwpViewer file={file} onSelectFile={onSelectFile} />
        <AiActivityOverlay state={aiState} />
      </div>
    </section>
  );
}

export default DocumentEditor;
