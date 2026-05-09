import React from 'react';
import type { MockAiResult } from './mockAi';

// AI 수정 결과 비교 영역.
// 수정 전/후 텍스트, 변경사항 리스트, 적용/취소 버튼을 묶어서 보여준다.

interface AiResultPanelProps {
  result: MockAiResult;
  onApply: () => void;
  onCancel: () => void;
}

const AiResultPanel: React.FC<AiResultPanelProps> = ({ result, onApply, onCancel }) => {
  return (
    <div className="mt-4 border rounded p-3">
      <h2 className="font-medium">AI 수정 결과</h2>

      {/* 수정 전/후 비교 영역 */}
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div>
          <div className="text-xs text-slate-500">수정 전</div>
          <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap border p-2 text-sm">
            {result.before}
          </pre>
        </div>
        <div>
          <div className="text-xs text-slate-500">수정 후</div>
          <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap border p-2 text-sm">
            {result.after}
          </pre>
        </div>
      </div>

      {/* 변경사항 설명 리스트 */}
      <div className="mt-3">
        <div className="text-xs text-slate-500">변경사항</div>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {result.changes.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </div>

      {/* 적용 / 취소 */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onApply}
          className="px-3 py-1 bg-purple-600 text-white rounded"
        >
          적용
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border rounded"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default AiResultPanel;
