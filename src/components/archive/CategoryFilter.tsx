import React from 'react';
import {
  CATEGORY_FILTER_OPTIONS,
  CATEGORY_LABELS,
  type CategoryFilterValue,
} from './categoryLabels';

// 전체/공지/보고서/안내문/기타 필터 버튼 모음.

interface CategoryFilterProps {
  selected: CategoryFilterValue;
  onSelect: (value: CategoryFilterValue) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_FILTER_OPTIONS.map((value) => {
        const isActive = value === selected;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={
              'px-2 py-1 text-sm border rounded ' +
              (isActive ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-700')
            }
          >
            {CATEGORY_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
