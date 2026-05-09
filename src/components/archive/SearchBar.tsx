import React from 'react';

// 문서 제목/내용 검색 입력창.

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="제목 또는 내용 검색"
      className="w-full border rounded px-2 py-1 text-sm"
    />
  );
};

export default SearchBar;
