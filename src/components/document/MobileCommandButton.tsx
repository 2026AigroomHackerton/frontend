import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';
import type { AiState } from '../../hooks/useAiEditFlow';

interface MobileCommandButtonProps {
  aiState: AiState;
  onCommand: (transcript: string, inputType: 'voice' | 'text') => void;
  onRecordingChange?: (recording: boolean) => void;
}

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function MobileCommandButton({ aiState, onCommand, onRecordingChange }: MobileCommandButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);

  const isRecording = aiState.kind === 'recording';
  const isBusy = aiState.kind === 'thinking' || aiState.kind === 'applying';

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  function startVoice() {
    if (isBusy) return;
    setErrorMessage(null);

    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setIsModalOpen(true);
      return;
    }

    try {
      const recognition = new Ctor();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        if (transcript.trim()) {
          onCommand(transcript.trim(), 'voice');
        } else {
          onRecordingChange?.(false);
        }
      };
      recognition.onerror = (event) => {
        setErrorMessage(`음성 인식 오류: ${event.error}. 텍스트로 입력해보세요.`);
        setIsModalOpen(true);
        onRecordingChange?.(false);
      };
      recognition.onend = () => {
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      onRecordingChange?.(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '음성 인식을 시작할 수 없습니다.';
      setErrorMessage(`${message} 텍스트로 입력해보세요.`);
      setIsModalOpen(true);
      onRecordingChange?.(false);
    }
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    onRecordingChange?.(false);
  }

  function handleTextSubmit() {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onCommand(trimmed, 'text');
    setTextValue('');
    setIsModalOpen(false);
    setErrorMessage(null);
  }

  const buttonTone = isRecording
    ? 'bg-rose-600 hover:bg-rose-500 ring-rose-300'
    : isBusy
      ? 'bg-slate-300 cursor-not-allowed'
      : 'bg-slate-900 hover:bg-slate-800 ring-blue-300';

  return (
    <>
      <div className="pointer-events-none fixed bottom-0 right-0 z-30 flex flex-col items-end gap-2 p-4 sm:p-5">
        {/* recording 라벨 */}
        {isRecording ? (
          <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 shadow">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-70" />
              <span className="absolute inset-0 rounded-full bg-rose-500" />
            </span>
            듣는 중…
          </span>
        ) : null}

        <button
          type="button"
          disabled={isBusy}
          onClick={isRecording ? stopVoice : startVoice}
          aria-label={isRecording ? '음성 인식 중지' : '음성 명령 시작'}
          className={[
            'pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
            buttonTone,
            isRecording ? 'animate-pulse' : '',
          ].join(' ')}
        >
          {isRecording ? <MicOff size={22} aria-hidden /> : <Mic size={22} aria-hidden />}
        </button>
      </div>

      {/* 텍스트 fallback 모달 */}
      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="텍스트 명령 입력"
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">텍스트 명령</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  음성 대신 직접 입력해서 AI에게 수정 요청을 보낼 수 있어요.
                </p>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            {errorMessage ? (
              <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorMessage}</p>
            ) : null}

            <textarea
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder="예: 지난주 활동 안내문인데 이번에는 환경정화 활동으로 바꿔줘. 날짜는 5월 20일이야."
              rows={4}
              autoFocus
              className="mt-3 w-full resize-none rounded-md border border-slate-300 bg-white p-3 text-base text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage(null);
                }}
                className="h-10 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!textValue.trim()}
                onClick={handleTextSubmit}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={14} aria-hidden />
                보내기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MobileCommandButton;
