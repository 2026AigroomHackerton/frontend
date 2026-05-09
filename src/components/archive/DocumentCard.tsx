import React, { useState } from 'react';
import type { MockDocument } from '../../data/mockDocuments';
import { CATEGORY_LABELS } from './categoryLabels';

// 문서 카드 — 제목/카테고리/수정일/내용 미리보기.
// 클릭 시 상세 액션 영역(편집기로 이동 버튼 등)을 토글로 노출한다.

interface DocumentCardProps {
  document: MockDocument;
  onOpenInEditor?: (document: MockDocument) => void;
}

// 본문 미리보기는 너무 길지 않게 잘라 보여준다.
const PREVIEW_LIMIT = 80;

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpenInEditor }) => {
  const [expanded, setExpanded] = useState(false);

  const preview =
    document.extractedText.length > PREVIEW_LIMIT
      ? document.extractedText.slice(0, PREVIEW_LIMIT) + '…'
      : document.extractedText;

  return (
    <div
      className="border rounded p-3 cursor-pointer bg-white"
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">{document.title}</h3>
        <span className="text-xs px-2 py-0.5 border rounded text-slate-600">
          {CATEGORY_LABELS[document.category]}
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-500">최근 수정: {document.updatedAt}</p>

      <p className="mt-2 text-sm text-slate-700">{preview}</p>

      {/* 카드 클릭 시 상세 이동 액션 영역 노출 */}
      {expanded && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              // TODO: 라우터 연결 시 EditorPage로 이동 (라우터 공통 구조 수정 금지로 현재는 콜백만 호출)
              onOpenInEditor?.(document);
            }}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
          >
            편집기로 이동
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
