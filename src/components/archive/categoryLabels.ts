import type { DocumentCategory } from '../../data/mockDocuments';

// 카테고리 코드 → 화면 라벨 매핑.
// 필터 옵션은 'all'(전체)을 포함하므로 별도 타입으로 둔다.
export type CategoryFilterValue = 'all' | DocumentCategory;

export const CATEGORY_LABELS: Record<CategoryFilterValue, string> = {
  all: '전체',
  notice: '공지',
  report: '보고서',
  info: '안내문',
  other: '기타',
};

export const CATEGORY_FILTER_OPTIONS: CategoryFilterValue[] = [
  'all',
  'notice',
  'report',
  'info',
  'other',
];
