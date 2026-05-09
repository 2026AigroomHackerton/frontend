import React, { useMemo, useState } from 'react';
import { mockDocuments, type MockDocument } from '../data/mockDocuments';
import SearchBar from '../components/archive/SearchBar';
import CategoryFilter from '../components/archive/CategoryFilter';
import DocumentCard from '../components/archive/DocumentCard';
import EmptyState from '../components/archive/EmptyState';
import ExternalStorageSection from '../components/archive/ExternalStorageSection';
import type { CategoryFilterValue } from '../components/archive/categoryLabels';

const ArchivePage: React.FC = () => {
  // 검색어 / 선택된 카테고리 필터
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterValue>('all');

  // 검색 + 카테고리 필터링된 문서 목록
  const filteredDocuments = useMemo<MockDocument[]>(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return mockDocuments.filter((document) => {
      // 카테고리 필터
      const matchesCategory =
        selectedCategory === 'all' || document.category === selectedCategory;
      if (!matchesCategory) return false;

      // 키워드가 비어 있으면 카테고리 결과만으로 통과
      if (!keyword) return true;

      // 제목 또는 본문(extractedText) 검색
      return (
        document.title.toLowerCase().includes(keyword) ||
        document.extractedText.toLowerCase().includes(keyword)
      );
    });
  }, [searchTerm, selectedCategory]);

  // 문서 카드 클릭 → 편집기로 이동 (라우터 미연결 상태이므로 mock 동작)
  const handleOpenInEditor = (document: MockDocument) => {
    // TODO: 라우터 연결 후 useNavigate 등으로 EditorPage로 이동.
    // 현재는 라우터 공통 구조 수정 범위 밖이므로 콘솔/알림만 처리.
    console.log('[ArchivePage] open in editor:', document);
    alert(`"${document.title}" 문서를 편집기로 여는 동작은 라우터 연결 후 활성화됩니다.`);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold">문서 아카이브</h1>

        {/* 검색창 */}
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {/* 카테고리 필터 */}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* 외부 저장소 (Google Drive / Notion) 준비중 */}
        <div>
          <div className="text-xs text-slate-500 mb-1">외부 저장소</div>
          <ExternalStorageSection />
        </div>

        {/* 문서 카드 목록 또는 빈 상태 */}
        {filteredDocuments.length === 0 ? (
          <EmptyState
            message={
              searchTerm.trim() || selectedCategory !== 'all'
                ? '검색 결과가 없습니다.'
                : '저장된 문서가 없습니다.'
            }
          />
        ) : (
          <ul className="space-y-2">
            {filteredDocuments.map((document) => (
              <li key={document.id}>
                <DocumentCard
                  document={document}
                  onOpenInEditor={handleOpenInEditor}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ArchivePage;
