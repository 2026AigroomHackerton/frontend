import { Download, FileOutput, Loader2, MessageCircle, Save } from 'lucide-react';
import type { RefObject } from 'react';
import type { AiState } from '../../hooks/useAiEditFlow';
import AiActivityOverlay from './AiActivityOverlay';
import RhwpViewer from './RhwpViewer';
import type { RhwpViewerHandle } from './RhwpViewer';

interface DocumentEditorProps {
  title: string;
  file: File | null;
  editedText?: string | null;
  viewerReloadKey?: number;
  viewerInstanceKey?: number;
  viewerRef?: RefObject<RhwpViewerHandle | null>;
  error: string | null;
  aiState: AiState;
  canSave?: boolean;
  isSaving?: boolean;
  isExporting?: boolean;
  saveMessage?: string | null;
  onTitleChange: (value: string) => void;
  onSave: () => void;
  onDownload: () => void;
  onExportPdf: () => void;
  onShareKakao: () => void;
}

function DocumentEditor({
  title,
  file,
  editedText,
  viewerReloadKey,
  viewerInstanceKey,
  viewerRef,
  error,
  aiState,
  canSave = file !== null,
  isSaving = false,
  isExporting = false,
  saveMessage,
  onTitleChange,
  onSave,
  onDownload,
  onExportPdf,
  onShareKakao,
}: DocumentEditorProps) {
  const hasFile = file !== null;
  const hasDocument = hasFile || Boolean(editedText);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="문서명을 입력하세요"
          aria-label="문서명"
          className="min-w-[160px] flex-1 truncate bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:outline-none sm:text-lg"
        />

        {saveMessage ? (
          <span className="hidden text-xs font-medium text-emerald-600 sm:inline">
            {saveMessage}
          </span>
        ) : null}

        <div className="flex shrink-0 items-center gap-1 overflow-x-auto">
          <button
            type="button"
            disabled={!canSave || isSaving}
            onClick={onSave}
            aria-label="저장"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <Save size={15} aria-hidden />
            )}
            <span className="hidden sm:inline">{isSaving ? '저장 중' : '저장'}</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={onDownload}
            aria-label="다운로드"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-900 px-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            <Download size={15} aria-hidden />
            <span className="hidden sm:inline">다운로드</span>
          </button>

          <button
            type="button"
            disabled={!hasFile || isExporting}
            onClick={onExportPdf}
            aria-label="PDF 내보내기"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            {isExporting ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <FileOutput size={15} aria-hidden />
            )}
            <span className="hidden sm:inline">PDF 내보내기</span>
          </button>

          <button
            type="button"
            disabled={!hasDocument}
            onClick={onShareKakao}
            aria-label="카카오톡 공유"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-yellow-300 px-2.5 text-sm font-semibold text-slate-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
          >
            <MessageCircle size={15} aria-hidden />
            <span className="hidden sm:inline">카카오톡 공유</span>
          </button>
        </div>
      </header>

      {error ? (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 sm:px-5 sm:text-sm">
          {error}
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        <RhwpViewer
          key={viewerInstanceKey}
          ref={viewerRef}
          file={file}
          editedText={editedText}
          reloadKey={viewerReloadKey}
        />
        <AiActivityOverlay state={aiState} />
      </div>
    </section>
  );
}

export default DocumentEditor;
