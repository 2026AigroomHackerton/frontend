// ArchivePage 전용 mock 문서 데이터.
// 백엔드 연결 전 단계로, API 응답 구조(API 가이드 PDF 기준)에 맞춰 정의한다.
// 백엔드 연결 시 동일한 필드명을 그대로 받게 된다.

// 카테고리 코드 — 화면 라벨은 components/archive에서 매핑한다.
export type DocumentCategory = 'notice' | 'report' | 'info' | 'other';

// 입력 출처 — 모바일 스캔(camera)/이미지 업로드(upload) 등.
export type DocumentSourceType = 'camera' | 'upload';

// 문서 응답 타입 — backend 연결 시 그대로 매칭됨.
export interface MockDocument {
  id: string;
  title: string;
  sourceType: DocumentSourceType;
  category: DocumentCategory;
  extractedText: string;
  updatedAt: string; // ISO date (YYYY-MM-DD)
}

// 데모용 문서 목록.
export const mockDocuments: MockDocument[] = [
  {
    id: 'doc-001',
    title: '2026학년도 가정통신문',
    sourceType: 'camera',
    category: 'notice',
    extractedText:
      '2026학년도 1학기 가정통신문입니다. 학교 행사 및 일정에 관한 안내를 드립니다. 일시: 2026년 5월 12일, 장소: 본관 강당.',
    updatedAt: '2026-05-09',
  },
  {
    id: 'doc-002',
    title: '환경정화 활동 보고서',
    sourceType: 'upload',
    category: 'report',
    extractedText:
      '4월 환경정화 활동 결과 보고서입니다. 참여 인원 32명, 수거된 쓰레기 약 18kg, 재활용 분리수거 진행.',
    updatedAt: '2026-05-07',
  },
  {
    id: 'doc-003',
    title: '학부모 총회 안내문',
    sourceType: 'camera',
    category: 'info',
    extractedText:
      '학부모 총회 일정 및 참석 안내입니다. 일시: 2026년 5월 20일 오후 7시, 장소: 학교 도서관.',
    updatedAt: '2026-05-05',
  },
  {
    id: 'doc-004',
    title: '여름방학 특강 모집',
    sourceType: 'upload',
    category: 'notice',
    extractedText:
      '여름방학 특강 수강 신청을 받습니다. 신청 기간: 2026년 6월 1일 ~ 6월 15일. 과목: 영어, 수학, 코딩 입문.',
    updatedAt: '2026-05-02',
  },
  {
    id: 'doc-005',
    title: '월간 학습 진도 보고',
    sourceType: 'upload',
    category: 'report',
    extractedText:
      '4월 학습 진도 종합 보고. 평균 진도율 87%, 우수 학습자 12명, 보충 필요 학습자 5명.',
    updatedAt: '2026-04-30',
  },
  {
    id: 'doc-006',
    title: '식단표 안내',
    sourceType: 'camera',
    category: 'info',
    extractedText:
      '5월 첫째 주 급식 식단표입니다. 알레르기 유발 성분 표시 포함.',
    updatedAt: '2026-04-28',
  },
  {
    id: 'doc-007',
    title: '체험학습 신청서 양식',
    sourceType: 'upload',
    category: 'other',
    extractedText:
      '체험학습 신청서 양식 문서. 보호자 서명, 일정, 장소 기재 필요.',
    updatedAt: '2026-04-25',
  },
];
