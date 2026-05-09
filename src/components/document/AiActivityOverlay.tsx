import { Loader2, Sparkles } from 'lucide-react';
import type { AiState } from '../../hooks/useAiEditFlow';

interface AiActivityOverlayProps {
  state: AiState;
}

function AiActivityOverlay({ state }: AiActivityOverlayProps) {
  // 뷰어를 직접 가리는 단계만 오버레이로 표시
  if (state.kind !== 'applying') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-900/30 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-6 py-5 shadow-xl">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <Loader2 className="absolute inset-0 m-auto animate-spin text-indigo-500" size={56} aria-hidden />
          <Sparkles className="text-indigo-600" size={20} aria-hidden />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-950">AI가 문서를 다시 쓰고 있어요</p>
          <p className="mt-0.5 text-xs text-slate-500">잠시만 기다려주세요…</p>
        </div>
      </div>
    </div>
  );
}

export default AiActivityOverlay;
