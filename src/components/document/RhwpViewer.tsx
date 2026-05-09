import { useEffect, useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import type { RhwpEditor } from '@rhwp/editor';

interface RhwpViewerProps {
  file: File | null;
  onSelectFile: (file: File | null) => void;
}

function RhwpViewer({ file, onSelectFile }: RhwpViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<RhwpEditor | null>(null);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'slow' | 'ready' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!file || !containerRef.current) {
        editorRef.current?.destroy();
        editorRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = '';
        setLoadStatus('idle');
        setPageCount(null);
        return;
      }

      setLoadStatus('loading');
      setErrorMessage(null);

      try {
        editorRef.current?.destroy();
        editorRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = '';

        const { createEditor } = await import('@rhwp/editor');
        if (cancelled || !containerRef.current) return;

        const editor = await createEditor(containerRef.current, {
          width: '100%',
          height: '100%',
        });
        if (cancelled) {
          editor.destroy();
          return;
        }

        editorRef.current = editor;
        const buffer = await file.arrayBuffer();
        if (cancelled) return;

        try {
          const result = await editor.loadFile(buffer, file.name);
          if (cancelled) return;
          setPageCount(result.pageCount);
          setLoadStatus('ready');
          return;
        } catch (loadErr) {
          if (cancelled) return;
          const loadMsg = loadErr instanceof Error ? loadErr.message : '';

          // rhwp는 큰 파일에서 loadFile timeout을 던지지만 백그라운드 처리는 계속됨.
          // pageCount()를 polling 해서 실제 로드 완료를 기다림.
          if (!/timeout/i.test(loadMsg)) {
            throw loadErr;
          }

          setLoadStatus('slow');
          const startedAt = Date.now();
          const MAX_WAIT_MS = 60_000;
          const POLL_MS = 1500;

          while (Date.now() - startedAt < MAX_WAIT_MS) {
            await new Promise((resolve) => setTimeout(resolve, POLL_MS));
            if (cancelled) return;
            try {
              const pages = await editor.pageCount();
              if (cancelled) return;
              if (pages > 0) {
                setPageCount(pages);
                setLoadStatus('ready');
                return;
              }
            } catch {
              // 아직 처리 중. 다음 tick에서 재시도.
            }
          }

          setErrorMessage('파일이 너무 커서 로드에 시간이 오래 걸리고 있어요. 잠시 후 다시 시도해주세요.');
          setLoadStatus('error');
          return;
        }
      } catch (caught) {
        if (cancelled) return;
        const message = caught instanceof Error ? caught.message : 'rhwp 로드 실패';
        setErrorMessage(message);
        setLoadStatus('error');
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div className="relative flex min-h-0 w-full max-w-full flex-1 overflow-hidden bg-slate-100">
      {/* iframe container — rhwp가 여기에 mount */}
      <div
        ref={containerRef}
        className={[
          'h-full w-full max-w-full',
          file ? 'block' : 'hidden',
        ].join(' ')}
      />

      {/* 빈 상태 CTA */}
      {!file ? (
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <label className="group flex w-full max-w-sm cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-50 focus-within:border-slate-500">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white transition group-hover:bg-slate-700">
              <FileUp size={26} aria-hidden />
            </span>
            <span className="space-y-1">
              <span className="block text-base font-semibold text-slate-950">
                HWPX 파일을 업로드하세요
              </span>
              <span className="block text-xs text-slate-500">
                탭하거나 끌어다 놓으면 한글 편집기가 열립니다
              </span>
            </span>
            <input
              type="file"
              accept=".hwpx,.hwp"
              className="sr-only"
              onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      ) : null}

      {/* 로드 중 오버레이 */}
      {file && (loadStatus === 'loading' || loadStatus === 'slow') ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 px-6 text-center backdrop-blur-sm">
          <Loader2 className="animate-spin text-slate-700" size={28} aria-hidden />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {loadStatus === 'slow' ? '파일이 커서 조금 더 걸려요…' : '한글 편집기를 여는 중…'}
            </p>
            {loadStatus === 'slow' ? (
              <p className="mt-1 text-xs text-slate-500">잠시만 기다려주세요. 자동으로 표시됩니다.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 에러 상태 */}
      {file && loadStatus === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 px-6 text-center">
          <p className="text-sm font-semibold text-rose-700">한글 편집기를 열 수 없어요</p>
          <p className="text-xs text-slate-600">{errorMessage}</p>
          <button
            type="button"
            onClick={() => onSelectFile(null)}
            className="mt-3 h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            다른 파일 선택
          </button>
        </div>
      ) : null}

      {/* 좌하단 페이지 카운트 (참고용, 모바일에선 숨김) */}
      {file && loadStatus === 'ready' && pageCount ? (
        <span className="pointer-events-none absolute bottom-2 left-2 hidden rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-500 shadow-sm sm:inline-block">
          {pageCount}페이지
        </span>
      ) : null}
    </div>
  );
}

export default RhwpViewer;
