import React from 'react';

// 검색/필터 결과가 비어 있을 때의 안내 UI.

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = '저장된 문서가 없습니다.',
}) => {
  return (
    <div className="border rounded p-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
};

export default EmptyState;
