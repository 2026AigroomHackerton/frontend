import React from 'react';
import { TONE_OPTIONS, type ToneCode } from './profileStorage';

// 선호 문체 단일 선택 (라디오 형태의 토글 버튼).

interface ToneSelectorProps {
  selected: ToneCode | '';
  onChange: (next: ToneCode | '') => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ selected, onChange }) => {
  // 같은 항목을 다시 누르면 선택 해제
  const handleSelect = (code: ToneCode) => {
    if (selected === code) {
      onChange('');
    } else {
      onChange(code);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TONE_OPTIONS.map((option) => {
        const isActive = selected === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => handleSelect(option.code)}
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

export default ToneSelector;
