import { Check, Loader2, Mic } from 'lucide-react';
import type { AiState } from '../../hooks/useAiEditFlow';

interface AiStatusBarProps {
  state: AiState;
}

function AiStatusBar({ state }: AiStatusBarProps) {
  if (state.kind === 'idle' || state.kind === 'reviewing') return null;

  const tone =
    state.kind === 'recording'
      ? { bg: 'bg-rose-50', text: 'text-rose-700', accent: 'bg-rose-500' }
      : state.kind === 'done'
        ? { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-500' }
        : { bg: 'bg-indigo-50', text: 'text-indigo-700', accent: 'bg-indigo-500' };

  return (
    <div className={['relative overflow-hidden border-b border-slate-100', tone.bg].join(' ')}>
      <div className={['flex items-center gap-2 px-4 py-2 text-xs font-medium sm:px-5', tone.text].join(' ')}>
        {state.kind === 'recording' ? (
          <>
            <Mic size={13} aria-hidden />
            <span>듣는 중…</span>
            <span className="ml-1 inline-flex items-end gap-0.5" aria-hidden>
              <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
              <span className="h-1.5 w-1 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
            </span>
          </>
        ) : null}
        {state.kind === 'thinking' ? (
          <>
            <Loader2 size={13} className="animate-spin" aria-hidden />
            <span className="truncate">AI가 수정 계획을 짜는 중… "{state.commandText}"</span>
          </>
        ) : null}
        {state.kind === 'applying' ? (
          <>
            <Loader2 size={13} className="animate-spin" aria-hidden />
            <span>AI가 문서를 다시 쓰고 있어요…</span>
          </>
        ) : null}
        {state.kind === 'done' ? (
          <>
            <Check size={13} aria-hidden />
            <span className="truncate">수정 완료 — {state.summary}</span>
          </>
        ) : null}
      </div>

      {/* indeterminate progress (thinking/applying만) */}
      {state.kind === 'thinking' || state.kind === 'applying' ? (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-slate-200/40">
          <div className={['h-full w-full animate-pulse', tone.accent].join(' ')} />
        </div>
      ) : null}
    </div>
  );
}

export default AiStatusBar;
