import { useCallback, useRef, useState } from 'react';
import { applyEdit, commandEdit } from '../api/ai';
import { saveVoiceCommand } from '../api/voice';
import type { CommandEditResult } from '../types/document';

export type AiState =
  | { kind: 'idle' }
  | { kind: 'recording' }
  | { kind: 'thinking'; commandText: string }
  | { kind: 'reviewing'; commandText: string; plan: CommandEditResult }
  | { kind: 'applying'; plan: CommandEditResult }
  | { kind: 'done'; summary: string };

interface UseAiEditFlowParams {
  documentId: string;
  getDocumentText: () => string;
  onApplied?: (updatedText: string) => void;
}

interface UseAiEditFlowResult {
  state: AiState;
  setRecording: (recording: boolean) => void;
  startCommand: (transcript: string, inputType: 'voice' | 'text') => Promise<void>;
  approve: (operationIds: string[]) => Promise<void>;
  reject: () => void;
  resetError: () => void;
  error: string | null;
}

export function useAiEditFlow({
  documentId,
  getDocumentText,
  onApplied,
}: UseAiEditFlowParams): UseAiEditFlowResult {
  const [state, setState] = useState<AiState>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef<AiState>(state);
  stateRef.current = state;
  const doneTimerRef = useRef<number | null>(null);

  const setRecording = useCallback((recording: boolean) => {
    setState((prev) => {
      if (recording) return { kind: 'recording' };
      if (prev.kind === 'recording') return { kind: 'idle' };
      return prev;
    });
  }, []);

  const startCommand = useCallback(
    async (transcript: string, inputType: 'voice' | 'text') => {
      setError(null);
      const trimmed = transcript.trim();
      if (!trimmed) {
        setState({ kind: 'idle' });
        return;
      }

      setState({ kind: 'thinking', commandText: trimmed });

      try {
        void saveVoiceCommand({ documentId, transcript: trimmed, inputType });

        const plan = await commandEdit({
          documentId,
          documentText: getDocumentText(),
          commandText: trimmed,
        });

        setState({ kind: 'reviewing', commandText: trimmed, plan });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'AI 명령 처리 실패';
        setError(message);
        setState({ kind: 'idle' });
      }
    },
    [documentId, getDocumentText],
  );

  const approve = useCallback(
    async (operationIds: string[]) => {
      const current = stateRef.current;
      if (current.kind !== 'reviewing') return;

      const plan = current.plan;
      const ops = plan.editOperations.filter((op) => operationIds.includes(op.operationId));
      if (ops.length === 0) return;

      setState({ kind: 'applying', plan });

      try {
        const result = await applyEdit({
          documentId,
          editOperations: ops,
          currentText: getDocumentText(),
        });

        onApplied?.(result.updatedText);

        setState({ kind: 'done', summary: plan.summary });

        if (doneTimerRef.current) window.clearTimeout(doneTimerRef.current);
        doneTimerRef.current = window.setTimeout(() => {
          setState({ kind: 'idle' });
          doneTimerRef.current = null;
        }, 2000);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'AI 적용 실패';
        setError(message);
        setState({ kind: 'idle' });
      }
    },
    [documentId, getDocumentText, onApplied],
  );

  const reject = useCallback(() => {
    setState({ kind: 'idle' });
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return { state, setRecording, startCommand, approve, reject, resetError, error };
}
