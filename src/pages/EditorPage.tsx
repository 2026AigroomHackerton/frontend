import React, { useState } from 'react';
import SuggestedCommands from '../components/document/SuggestedCommands';
import AiResultPanel from '../components/document/AiResultPanel';
import { generateMockAiResult } from '../components/document/mockAi';
import type { MockAiResult } from '../components/document/mockAi';

// EditorPage 내부 전용 mock 저장 데이터 타입
type MockSavedDocument = {
  title: string;
  bodyText: string;
  savedAt: string;
};

// localStorage에 mock 저장할 때 사용하는 키
const STORAGE_KEY = 'mock_saved_document';

// OCR이 끝났다고 가정한 mock 초기 본문
const INITIAL_BODY_TEXT = `???`

const EditorPage: React.FC = () => {
  // 문서 제목 / 본문 / AI 명령 / AI 결과 / 처리 중 상태 / 저장 상태
  const [title, setTitle] = useState<string>('가정통신문 초안');
  const [bodyText, setBodyText] = useState<string>(INITIAL_BODY_TEXT);
  const [aiCommand, setAiCommand] = useState<string>('');
  const [aiResult, setAiResult] = useState<MockAiResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 추천 명령 버튼 클릭 시 입력창에 자동 입력
  const handleSelectSuggestedCommand = (command: string) => {
    setAiCommand(command);
  };

  // AI 수정 요청 (mock)
  const handleRequestAi = async () => {
    setErrorMessage('');

    // 본문 또는 명령이 비어 있으면 안내만 처리
    if (!bodyText.trim()) {
      setErrorMessage('편집할 본문이 비어 있습니다.');
      return;
    }
    if (!aiCommand.trim()) {
      setErrorMessage('AI 명령을 입력하거나 추천 명령을 선택해 주세요.');
      return;
    }

    setIsProcessing(true);
    setAiResult(null);
    try {
      const result = await generateMockAiResult(bodyText, aiCommand);
      setAiResult(result);
    } catch (error) {
      console.error(error);
      setErrorMessage('AI 수정 결과 생성에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 적용: 수정 후 텍스트를 본문에 반영하고 결과 영역 초기화
  const handleApply = () => {
    if (!aiResult) return;
    setBodyText(aiResult.after);
    setAiResult(null);
    setAiCommand('');
    setSaveStatus('AI 수정 적용 완료 (저장 전)');
  };

  // 취소: 결과 영역만 초기화, 본문은 유지
  const handleCancel = () => {
    setAiResult(null);
  };

  // mock 저장: localStorage에 제목/본문/저장 시각 저장
  const handleSave = () => {
    const payload: MockSavedDocument = {
      title,
      bodyText,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      const stamp = new Date(payload.savedAt).toLocaleString('ko-KR');
      setSaveStatus(`저장 완료 (${stamp})`);
    } catch (error) {
      console.error(error);
      setSaveStatus('저장 실패');
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold">문서 편집기</h1>

        {/* 문서 제목 입력 */}
        <div>
          <label className="text-sm">제목</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {/* 문서 본문 textarea */}
        <div>
          <label className="text-sm">본문</label>
          <textarea
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            rows={12}
            className="mt-1 w-full border rounded p-2 font-mono text-sm"
          />
        </div>

        {/* AI 명령 입력 + 추천 명령 + 요청 버튼 */}
        <div className="border rounded p-3">
          <label className="text-sm">AI 명령</label>
          <input
            type="text"
            value={aiCommand}
            onChange={(event) => setAiCommand(event.target.value)}
            placeholder="예: 공손한 문체로 바꿔줘"
            disabled={isProcessing}
            className="mt-1 w-full border rounded px-2 py-1"
          />

          <div className="mt-2">
            <div className="text-xs text-slate-500">추천 명령</div>
            <div className="mt-1">
              <SuggestedCommands
                onSelect={handleSelectSuggestedCommand}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestAi}
              disabled={isProcessing}
              className="px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
            >
              {isProcessing ? 'AI 수정 중...' : 'AI 수정 요청'}
            </button>
            {isProcessing && (
              <span className="text-xs text-slate-500">잠시만 기다려 주세요…</span>
            )}
          </div>

          {errorMessage && (
            <div className="mt-2 text-sm text-red-600">{errorMessage}</div>
          )}
        </div>

        {/* AI 수정 결과 영역 (요청 후에만 표시) */}
        {aiResult && (
          <AiResultPanel
            result={aiResult}
            onApply={handleApply}
            onCancel={handleCancel}
          />
        )}

        {/* 저장 / 저장 상태 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            저장
          </button>
          {saveStatus && (
            <span className="text-sm text-slate-600">{saveStatus}</span>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditorPage;
