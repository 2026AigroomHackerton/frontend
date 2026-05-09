import { useCallback, useRef, useState } from 'react';
import { applyEdit, commandEdit } from '../api/ai';
import type { CommandEditResult, EditOperation } from '../types/document';

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
  onApplied?: (
    updatedText: string,
    editOperations: EditOperation[],
    documentId: string,
  ) => void | Promise<void>;
}

interface UseAiEditFlowResult {
  state: AiState;
  setRecording: (recording: boolean) => void;
  startCommand: (
    transcript: string,
    inputType: 'voice' | 'text',
    targetDocumentId?: string,
  ) => Promise<void>;
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
  const activeDocumentIdRef = useRef<string>(documentId);
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
    async (transcript: string, inputType: 'voice' | 'text', targetDocumentId?: string) => {
      void inputType;
      setError(null);
      const trimmed = transcript.trim();
      const activeDocumentId = targetDocumentId ?? documentId;
      activeDocumentIdRef.current = activeDocumentId;
      if (!trimmed) {
        setState({ kind: 'idle' });
        return;
      }

      setState({ kind: 'thinking', commandText: trimmed });

      try {
        const plan = await commandEdit({
          documentId: activeDocumentId,
          documentText: getDocumentText(),
          commandText: trimmed,
        });

        setState({ kind: 'reviewing', commandText: trimmed, plan });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'AI 紐낅졊 泥섎━ ?ㅽ뙣';
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
      // ops가 비어 있어도 plan.previewText가 있으면 HWPX 재빌드 경로로 적용한다.
      const hasPreviewText = Boolean(plan.previewText && plan.previewText.trim().length > 0);
      if (ops.length === 0 && !hasPreviewText) return;

      setState({ kind: 'applying', plan });

      try {
        const result = await applyEdit({
          documentId,
          editOperations: ops,
          currentText: getDocumentText(),
          previewText: plan.previewText,
        });

        await onApplied?.(result.updatedText, ops, activeDocumentIdRef.current || documentId);

        setState({ kind: 'done', summary: plan.summary });

        if (doneTimerRef.current) window.clearTimeout(doneTimerRef.current);
        doneTimerRef.current = window.setTimeout(() => {
          setState({ kind: 'idle' });
          doneTimerRef.current = null;
        }, 2000);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'AI ?곸슜 ?ㅽ뙣';
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
