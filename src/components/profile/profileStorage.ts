// ProfilePage 전용 mock 프로필 저장/로드 유틸.
// 백엔드 연결 전이므로 localStorage 기반으로만 처리한다.
// user_id=1 단일 데모 사용자 기준이라 별도 식별자는 두지 않는다.

// 자주 쓰는 문서 유형 코드.
export type DocumentTypeCode = 'notice' | 'report' | 'info' | 'meeting';

// 선호 문체 코드.
export type ToneCode = 'polite' | 'concise' | 'report' | 'friendly';

// 사용자 프로필 (mock 저장 데이터 타입).
export interface MockUserProfile {
  name: string;
  organization: string;
  role: string;
  favoriteDocTypes: DocumentTypeCode[];
  preferredTone: ToneCode | '';
  signature: string;
  aiContext: string;
  savedAt: string; // ISO timestamp
}

// 문서 유형 옵션 (라벨 매핑 포함).
export const DOCUMENT_TYPE_OPTIONS: { code: DocumentTypeCode; label: string }[] = [
  { code: 'notice', label: '공지문' },
  { code: 'report', label: '보고서' },
  { code: 'info', label: '안내문' },
  { code: 'meeting', label: '회의록' },
];

// 선호 문체 옵션 (라벨 매핑 포함).
export const TONE_OPTIONS: { code: ToneCode; label: string }[] = [
  { code: 'polite', label: '공손한 문체' },
  { code: 'concise', label: '간결한 문체' },
  { code: 'report', label: '보고서 문체' },
  { code: 'friendly', label: '친근한 문체' },
];

// localStorage 저장 키.
const STORAGE_KEY = 'mock_user_profile';

// 빈 프로필 기본값.
export const EMPTY_PROFILE: MockUserProfile = {
  name: '',
  organization: '',
  role: '',
  favoriteDocTypes: [],
  preferredTone: '',
  signature: '',
  aiContext: '',
  savedAt: '',
};

// localStorage에서 프로필 불러오기 (없으면 EMPTY_PROFILE 반환).
export const loadProfile = (): MockUserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as Partial<MockUserProfile>;
    return { ...EMPTY_PROFILE, ...parsed };
  } catch (error) {
    console.error('프로필 로드 실패:', error);
    return EMPTY_PROFILE;
  }
};

// 프로필 저장 (저장 시각 자동 갱신).
export const saveProfile = (profile: MockUserProfile): MockUserProfile => {
  const next: MockUserProfile = {
    ...profile,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
