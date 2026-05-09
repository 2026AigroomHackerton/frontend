import type { DetectedField } from '../types/document';

const FIELD_KEYWORDS = [
  '성명',
  '이름',
  '한글 이름',
  '영문 이름',
  '한자',
  '주소',
  '연락처',
  '전화번호',
  '휴대폰',
  '주민등록번호',
  '생년월일',
  '자격증',
  '직업',
  '이메일',
  '성별',
  '학과',
  '학교',
  '소속',
  '계좌번호',
];

const TYPE_MAP: Record<string, string> = {
  성명: 'name',
  이름: 'name',
  '한글 이름': 'koreanName',
  '영문 이름': 'englishName',
  한자: 'hanja',
  주소: 'address',
  연락처: 'phone',
  전화번호: 'phone',
  휴대폰: 'mobile',
  주민등록번호: 'residentNumber',
  생년월일: 'birthDate',
  자격증: 'certificate',
  직업: 'job',
  이메일: 'email',
  성별: 'gender',
  학과: 'department',
  학교: 'school',
  소속: 'affiliation',
  계좌번호: 'bankAccount',
};

export function detectPersonalFields(text: string): DetectedField[] {
  return text
    .split(/\r?\n/)
    .map((line, lineIndex) => {
      const normalized = line.replace(/\s+/g, ' ').trim();
      const matched = FIELD_KEYWORDS.find((keyword) => normalized.includes(keyword));
      if (!matched) return null;

      return {
        id: `${lineIndex}-${matched}`,
        label: matched,
        type: TYPE_MAP[matched] ?? 'personalInfo',
        lineIndex,
        originalLine: line,
        suggestedValue: '',
      } satisfies DetectedField;
    })
    .filter((field): field is DetectedField => field !== null);
}
