import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import type { RhwpEditor } from '@rhwp/editor';
import { createPdfFileFromSvgs } from '../../lib/pdfFromSvg';

interface RhwpViewerProps {
  file: File | null;
  editedText?: string | null;
  reloadKey?: number;
}

export interface RhwpViewerHandle {
  exportHwpxFile: (fallbackName: string) => Promise<File>;
  exportPdfFile: (fallbackName: string) => Promise<File>;
  openPdfPrintPreview: (fallbackName: string, targetWindow?: Window | null) => Promise<void>;
}

const RhwpViewer = forwardRef<RhwpViewerHandle, RhwpViewerProps>(function RhwpViewer(
  { file, editedText, reloadKey = 0 },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<RhwpEditor | null>(null);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'slow' | 'ready' | 'error'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      async exportHwpxFile(fallbackName: string) {
        if (!editorRef.current) {
          if (!file) throw new Error('내보낼 문서가 없습니다.');
          return file;
        }

        const bytes = await editorRef.current.exportHwpx();
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;

        return new File([buffer], ensureHwpxName(fallbackName || file?.name || 'document.hwpx'), {
          type: 'application/haansofthwpx',
          lastModified: Date.now(),
        });
      },
      async openPdfPrintPreview(fallbackName: string, targetWindow?: Window | null) {
        if (!editorRef.current) {
          throw new Error('편집기가 아직 준비되지 않았습니다.');
        }

        const pages = await editorRef.current.pageCount();
        const svgs: string[] = [];
        for (let page = 0; page < pages; page += 1) {
          svgs.push(await editorRef.current.getPageSvg(page));
        }
        openPrintableSvgDocument(svgs, fallbackName, targetWindow);
      },
      async exportPdfFile(fallbackName: string) {
        if (!editorRef.current) {
          throw new Error('편집기가 아직 준비되지 않았습니다.');
        }

        const pages = await editorRef.current.pageCount();
        const svgs: string[] = [];
        for (let page = 0; page < pages; page += 1) {
          svgs.push(await editorRef.current.getPageSvg(page));
        }
        return createPdfFileFromSvgs(svgs, fallbackName);
      },
    }),
    [file],
  );

  useEffect(() => {
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!file || editedText || !containerRef.current) {
        editorRef.current?.destroy();
        editorRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = '';
        setLoadStatus('idle');
        setPageCount(null);
        return;
      }

      setLoadStatus('loading');
      setErrorMessage(null);
      setPageCount(null);

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
          const result = await editor.loadFile(buffer, getViewerFileName(file.name, reloadKey));
          if (cancelled) return;
          setPageCount(result.pageCount);
          setLoadStatus('ready');
        } catch (loadErr) {
          if (cancelled) return;
          const loadMsg = loadErr instanceof Error ? loadErr.message : '';
          if (!/timeout/i.test(loadMsg)) throw loadErr;

          setLoadStatus('slow');
          const startedAt = Date.now();
          const maxWaitMs = 60_000;
          const pollMs = 1500;

          while (Date.now() - startedAt < maxWaitMs) {
            await new Promise((resolve) => setTimeout(resolve, pollMs));
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
              // HOP is still processing the document.
            }
          }

          setErrorMessage('파일을 여는 데 시간이 오래 걸립니다. 잠시 후 다시 시도해주세요.');
          setLoadStatus('error');
        }
      } catch (caught) {
        if (cancelled) return;
        const message = caught instanceof Error ? caught.message : 'HOP 편집기를 열지 못했습니다.';
        setErrorMessage(message);
        setLoadStatus('error');
      }
    }

    void load();

    return () => {
      cancelled = true;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [file, editedText, reloadKey]);

  return (
    <div className="relative flex min-h-0 w-full max-w-full flex-1 overflow-hidden bg-slate-100">
      <div
        ref={containerRef}
        className={['h-full w-full max-w-full', file && !editedText ? 'block' : 'hidden'].join(
          ' ',
        )}
      />

      {editedText ? (
        <div className="h-full w-full overflow-auto bg-slate-100 px-3 py-4 sm:px-6 lg:px-10">
          <article className="mx-auto min-h-full w-full max-w-3xl rounded-lg bg-white px-5 py-6 text-slate-950 shadow-sm sm:px-10 sm:py-9">
            <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              AI 수정본
            </div>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 sm:text-base">
              {editedText}
            </pre>
          </article>
        </div>
      ) : null}

      {!file && !editedText ? (
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileText size={26} aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-950">표시할 문서가 없어요</p>
              <p className="text-xs text-slate-500">
                업로드 페이지에서 HWPX 파일을 선택해 편집기로 열어주세요.
              </p>
            </div>
            <Link
              to="/upload"
              className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              업로드 페이지로
            </Link>
          </div>
        </div>
      ) : null}

      {file && !editedText && (loadStatus === 'loading' || loadStatus === 'slow') ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 px-6 text-center backdrop-blur-sm">
          <Loader2 className="animate-spin text-slate-700" size={28} aria-hidden />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {loadStatus === 'slow' ? '파일을 여는 중입니다' : 'HOP 편집기를 여는 중'}
            </p>
            {loadStatus === 'slow' ? (
              <p className="mt-1 text-xs text-slate-500">
                문서가 크면 조금 더 걸릴 수 있어요.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {file && !editedText && loadStatus === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 px-6 text-center">
          <p className="text-sm font-semibold text-rose-700">HOP 편집기를 열지 못했어요</p>
          <p className="text-xs text-slate-600">{errorMessage}</p>
          <Link
            to="/upload"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            다른 파일 선택
          </Link>
        </div>
      ) : null}

      {file && !editedText && loadStatus === 'ready' && pageCount ? (
        <span className="pointer-events-none absolute bottom-2 left-2 hidden rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-500 shadow-sm sm:inline-block">
          {pageCount}페이지
        </span>
      ) : null}
    </div>
  );
});

function ensureHwpxName(name: string): string {
  const clean = name.trim() || 'document.hwpx';
  return /\.(hwpx|hwp)$/i.test(clean) ? clean.replace(/\.hwp$/i, '.hwpx') : `${clean}.hwpx`;
}

function getViewerFileName(name: string, reloadKey: number): string {
  if (reloadKey <= 0) return name;
  return name.replace(/\.(hwpx|hwp)$/i, `_view_${reloadKey}.$1`);
}

function openPrintableSvgDocument(
  svgs: string[],
  title: string,
  targetWindow?: Window | null,
): void {
  const printWindow = targetWindow ?? window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    throw new Error('PDF 내보내기 창을 열 수 없습니다. 팝업 차단을 확인해주세요.');
  }

  const body = svgs
    .map(
      (svg) =>
        `<section class="page">${svg.replace(/<script[\s\S]*?<\/script>/gi, '')}</section>`,
    )
    .join('');

  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title || 'document')}</title>
  <style>
    @page { margin: 0; }
    html, body { margin: 0; background: #e5e7eb; }
    .page { break-after: page; page-break-after: always; display: flex; justify-content: center; padding: 16px; box-sizing: border-box; }
    .page svg { max-width: 100%; height: auto; background: white; box-shadow: 0 1px 8px rgba(15, 23, 42, 0.16); }
    @media print {
      html, body { background: white; }
      .page { padding: 0; }
      .page svg { box-shadow: none; width: 100%; }
    }
  </style>
</head>
<body>${body}</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 400);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default RhwpViewer;
