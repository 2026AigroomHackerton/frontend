import React from 'react';

// EditorPage에서 사용할 추천 명령 버튼 모음.
// 버튼을 누르면 AI 명령 입력창에 해당 문구가 자동 입력된다.

interface SuggestedCommandsProps {
  onSelect: (command: string) => void;
  disabled?: boolean;
}

const SUGGESTED_COMMANDS: string[] = [
  '공손한 문체로 바꿔줘',
  '핵심 내용만 요약해줘',
  '보고서 형식으로 정리해줘',
  '맞춤법과 띄어쓰기를 수정해줘',
];

const SuggestedCommands: React.FC<SuggestedCommandsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_COMMANDS.map((command) => (
        <button
          key={command}
          type="button"
          onClick={() => onSelect(command)}
          disabled={disabled}
          className="px-2 py-1 text-sm border rounded disabled:opacity-50"
        >
          {command}
        </button>
      ))}
    </div>
  );
};

export default SuggestedCommands;
