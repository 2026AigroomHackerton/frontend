import React, { useRef, useState } from 'react';
import { requestAIRewrite } from '../data/aiMock';
import type { AIRewriteResult } from '../types/document';

interface DocumentEditorPageProps {
  initialTitle?: string;
  initialContent?: string;
  onBack?: () => void;
}

const DocumentEditorPage: React.FC<DocumentEditorPageProps> = ({
  initialTitle = '제목 없음',
  initialContent = '',
  onBack,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [command, setCommand] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [rewrite, setRewrite] = useState<AIRewriteResult | null>(null);
  const [savedAt, setSavedAt] = useState<string>('');

  const undoStack = useRef<string[]>([]);

  const handleRequestAI = async () => {
    setAiError('');
    setRewrite(null);
    setAiLoading(true);
    try {
      const result = await requestAIRewrite(content, command);
      setRewrite(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 수정 요청에 실패했습니다.';
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  const applyRewrite = () => {
    if (!rewrite) return;
    undoStack.current.push(rewrite.before);
    setContent(rewrite.after);
    setRewrite(null);
    setCommand('');
  };

  const cancelRewrite = () => {
    setRewrite(null);
  };

  const undoLast = () => {
    const previous = undoStack.current.pop();
    if (previous !== undefined) {
      setContent(previous);
    }
  };

  const saveDocument = () => {
    const stamp = new Date().toLocaleTimeString('ko-KR');
    setSavedAt(stamp);
    console.log('[저장]', { title, content });
    alert(`문서가 저장되었습니다. (${stamp})`);
  };

  const canUndo = undoStack.current.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">문서 편집기</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 text-sm bg-slate-200 text-slate-800 rounded"
            >
              ← 스캔으로
            </button>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="문서 제목"
          className="mt-4 w-full border-b border-slate-300 bg-transparent px-1 py-2 text-xl font-medium focus:border-blue-500 focus:outline-none"
        />

        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700">문서 내용</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            placeholder="OCR 결과 또는 문서 본문을 입력하세요."
            className="mt-2 w-full rounded border border-slate-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-sm font-medium text-slate-700">AI 명령</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder='예: "공손한 문체로 바꿔줘", "내용을 요약해줘"'
              className="flex-1 rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              disabled={aiLoading}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !aiLoading) {
                  handleRequestAI();
                }
              }}
            />
            <button
              onClick={handleRequestAI}
              disabled={aiLoading}
              className="rounded bg-purple-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? 'AI 수정 중…' : 'AI 수정 요청'}
            </button>
          </div>

          {aiLoading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              <span>AI가 문서를 수정하고 있어요…</span>
            </div>
          )}

          {aiError && !aiLoading && (
            <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {aiError}
            </div>
          )}
        </div>

        {rewrite && (
          <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-purple-900">AI 수정 제안</h2>
              <span className="text-xs text-purple-700">적용 전 비교해 보세요</span>
            </div>

            <p className="mt-2 rounded bg-white px-3 py-2 text-sm text-slate-700">
              <span className="font-medium text-purple-700">변경 요약:</span>{' '}
              {rewrite.explanation}
            </p>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">수정 전</div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  {rewrite.before}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-purple-700">수정 후</div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded border border-purple-200 bg-white p-3 text-sm text-slate-900">
                  {rewrite.after}
                </pre>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={applyRewrite}
                className="rounded bg-purple-600 px-4 py-2 text-white"
              >
                적용
              </button>
              <button
                onClick={cancelRewrite}
                className="rounded bg-white px-4 py-2 text-purple-700 ring-1 ring-purple-300"
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={undoLast}
            disabled={!canUndo}
            className="rounded bg-slate-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            되돌리기
          </button>
          <button
            onClick={saveDocument}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            저장
          </button>
          {savedAt && (
            <span className="text-sm text-slate-500">최근 저장: {savedAt}</span>
          )}
        </div>
      </section>
    </div>
  );
};

export default DocumentEditorPage;
