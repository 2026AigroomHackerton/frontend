import React from 'react';
import {
  DOCUMENT_TYPE_OPTIONS,
  type DocumentTypeCode,
} from './profileStorage';

// 자주 쓰는 문서 유형 다중 선택 (체크박스 형태의 토글 버튼).

interface DocumentTypeSelectorProps {
  selected: DocumentTypeCode[];
  onChange: (next: DocumentTypeCode[]) => void;
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  selected,
  onChange,
}) => {
  // 클릭 시 토글 (이미 있으면 빼고, 없으면 추가)
  const handleToggle = (code: DocumentTypeCode) => {
    if (selected.includes(code)) {
      onChange(selected.filter((item) => item !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DOCUMENT_TYPE_OPTIONS.map((option) => {
        const isActive = selected.includes(option.code);
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => handleToggle(option.code)}
            className={
              'px-2 py-1 text-sm border rounded ' +
              (isActive ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-700')
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DocumentTypeSelector;
