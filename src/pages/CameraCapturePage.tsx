import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Loader2, Menu, RotateCcw, Sparkles } from 'lucide-react';
import ImageCaptureUploader from '../components/document/ImageCaptureUploader';
import { createHwpxFromImage } from '../api/documents';

type ProcessingPhase = 'analyzing' | 'building';

type CaptureState =
  | { kind: 'idle' }
  | { kind: 'captured'; file: File; previewUrl: string }
  | { kind: 'processing'; file: File; previewUrl: string; phase: ProcessingPhase };

interface LayoutContext {
  openSidebar: () => void;
}

interface RouteState {
  file?: File;
}

function CameraCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebar } = useOutletContext<LayoutContext>();
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<CaptureState>(() => {
    const incomingFile = (location.state as RouteState | null)?.file;
    if (!incomingFile) return { kind: 'idle' };

    return {
      kind: 'captured',
      file: incomingFile,
      previewUrl: URL.createObjectURL(incomingFile),
    };
  });

  useEffect(() => {
    if ((location.state as RouteState | null)?.file) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    return () => {
      if (state.kind !== 'idle') {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state]);

  function handleSelectImage(file: File) {
    setError(null);
    if (state.kind !== 'idle') {
      URL.revokeObjectURL(state.previewUrl);
    }

    setState({
      kind: 'captured',
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }

  function handleRetake() {
    setError(null);
    if (state.kind !== 'idle') {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ kind: 'idle' });
  }

  async function handleAnalyze() {
    if (state.kind !== 'captured') return;

    setError(null);
    const { file, previewUrl } = state;
    setState({ kind: 'processing', file, previewUrl, phase: 'analyzing' });

    try {
      setState({ kind: 'processing', file, previewUrl, phase: 'building' });
      const hwpxFile = await createHwpxFromImage(file);

      URL.revokeObjectURL(previewUrl);
      navigate('/editor', { state: { file: hwpxFile } });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : '이미지를 HWPX로 변환하지 못했습니다.';
      setError(message);
      setState({ kind: 'captured', file, previewUrl });
    }
  }

  return (
    <>
      <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={openSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="사이드바 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="hidden h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:flex"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            문서 촬영
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            사진을 분석해 정상 HWPX 문서로 만든 뒤 편집기에서 열어요.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
        {error ? (
          <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {state.kind === 'idle' ? (
          <div className="mx-auto w-full max-w-2xl space-y-5">
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">어떤 문서를 촬영할까요?</p>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                가정통신문, 신청서, 안내문을 촬영하면 서버가 템플릿 기반 HWPX 파일로
                만들어 편집기로 열어줍니다.
              </p>
            </div>

            <ImageCaptureUploader onSelectImage={handleSelectImage} autoOpenCamera />
          </div>
        ) : null}

        {(state.kind === 'captured' || state.kind === 'processing') && (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black">
              <img
                src={state.previewUrl}
                alt="촬영한 문서 미리보기"
                className="mx-auto block max-h-[55vh] w-full object-contain"
              />
              {state.kind === 'processing' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/60">
                  <Loader2 className="animate-spin text-white" size={32} aria-hidden />
                  <p className="text-sm font-medium text-white">
                    {state.phase === 'analyzing'
                      ? 'AI가 사진에서 문서를 읽는 중'
                      : '정상 HWPX 파일을 생성하는 중'}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRetake}
                disabled={state.kind === 'processing'}
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={15} aria-hidden />
                다시 촬영
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={state.kind === 'processing'}
                className="inline-flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.kind === 'processing' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden />
                    {state.phase === 'analyzing' ? 'AI 분석 중' : 'HWPX 생성 중'}
                  </>
                ) : (
                  <>
                    <Sparkles size={15} aria-hidden />
                    AI로 HWPX 만들고 편집
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default CameraCapturePage;
