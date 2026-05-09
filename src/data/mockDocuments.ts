export type DocumentStatusColor = 'green' | 'blue' | 'yellow' | 'red';

export type RecentDocument = {
  id: number;
  name: string;
  date: string;
  status: string;
  statusColor: DocumentStatusColor;
};

export type FolderItem = {
  id: number;
  name: string;
  count: number;
  date: string;
};

export type AiActivityIcon = 'user' | 'sparkles' | 'mail';

export type AiActivity = {
  id: number;
  icon: AiActivityIcon;
  title: string;
  desc: string;
  time: string;
};

export const mockStats = {
  recentDocuments: 0,
  aiAnalyzed: 0,
  groupCount: 0,
  savedAnswers: 0,
};

export const mockRecentDocuments: RecentDocument[] = [
  {
    id: 1,
    name: '입사 지원서_마케팅.hwpx',
    date: '2024.05.20 14:30',
    status: '작성 완료',
    statusColor: 'green',
  },
  {
    id: 2,
    name: '경력기술서.hwpx',
    date: '2024.05.19 16:10',
    status: 'AI 분석 완료',
    statusColor: 'blue',
  },
  {
    id: 3,
    name: '자기소개서_2024.hwpx',
    date: '2024.05.18 09:45',
    status: '작성 중',
    statusColor: 'yellow',
  },
];

export const mockPersonalFolders: FolderItem[] = [
  { id: 1, name: '지원서', count: 5, date: '2024.05.20' },
  { id: 2, name: '자기소개서', count: 3, date: '2024.05.18' },
  { id: 3, name: '경력기술서', count: 2, date: '2024.05.15' },
];

export const mockGroupFolders: FolderItem[] = [
  { id: 1, name: '마케팅팀', count: 8, date: '2024.05.20' },
  { id: 2, name: '프로젝트A', count: 6, date: '2024.05.19' },
  { id: 3, name: '신입용도TF', count: 4, date: '2024.05.16' },
];

export type DashboardFile = {
  id: number;
  name: string;
  category: 'personal' | 'shared';
  owner: string;
  modifiedAt: string;
  size: string;
  tag?: string;
};

export const CURRENT_USER = '양희승';

export const mockDashboardFiles: DashboardFile[] = [
  {
    id: 1,
    name: '입사 지원서_마케팅.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.05.09 14:30',
    size: '142 KB',
    tag: '지원서',
  },
  {
    id: 2,
    name: '경력기술서_2026.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.05.08 16:10',
    size: '98 KB',
    tag: '경력',
  },
  {
    id: 3,
    name: '자기소개서_초안.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.05.07 09:45',
    size: '76 KB',
    tag: '자소서',
  },
  {
    id: 4,
    name: '마케팅팀 주간보고.hwpx',
    category: 'shared',
    owner: '마케팅팀',
    modifiedAt: '2026.05.09 11:20',
    size: '215 KB',
    tag: '보고서',
  },
  {
    id: 5,
    name: '프로젝트A 기획안.hwpx',
    category: 'shared',
    owner: '프로젝트A',
    modifiedAt: '2026.05.06 18:02',
    size: '1.2 MB',
    tag: '기획',
  },
  {
    id: 6,
    name: '신입용도TF 회의록.hwpx',
    category: 'shared',
    owner: '신입용도TF',
    modifiedAt: '2026.05.05 10:15',
    size: '64 KB',
    tag: '회의록',
  },
  {
    id: 7,
    name: '가정통신문_5월호.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.05.04 09:00',
    size: '188 KB',
    tag: '가정통신문',
  },
  {
    id: 8,
    name: '학부모 안내문_체험학습.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.05.03 13:25',
    size: '92 KB',
    tag: '가정통신문',
  },
  {
    id: 9,
    name: '5월 학부모회 회의록.hwpx',
    category: 'shared',
    owner: '학부모회',
    modifiedAt: '2026.05.02 19:40',
    size: '120 KB',
    tag: '회의록',
  },
  {
    id: 10,
    name: '1분기 실적 보고서.hwpx',
    category: 'shared',
    owner: '경영지원팀',
    modifiedAt: '2026.05.01 11:05',
    size: '2.4 MB',
    tag: '보고서',
  },
  {
    id: 11,
    name: '임대차 계약서_사무실.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.04.28 17:00',
    size: '356 KB',
    tag: '계약서',
  },
  {
    id: 12,
    name: '신규 프로젝트 제안서.hwpx',
    category: 'personal',
    owner: '양희승',
    modifiedAt: '2026.04.27 10:42',
    size: '1.8 MB',
    tag: '기획',
  },
  {
    id: 13,
    name: '연말 정산 안내문.hwpx',
    category: 'shared',
    owner: '인사팀',
    modifiedAt: '2026.04.25 15:30',
    size: '210 KB',
    tag: '안내문',
  },
  {
    id: 14,
    name: '워크숍 일정 안내.hwpx',
    category: 'shared',
    owner: '마케팅팀',
    modifiedAt: '2026.04.22 09:15',
    size: '78 KB',
    tag: '안내문',
  },
];

export type RecommendedFolder = {
  id: number;
  name: string;
  count: number;
  color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
};

export const mockRecommendedFolders: RecommendedFolder[] = [
  { id: 1, name: '가정통신문', count: 2, color: 'amber' },
  { id: 2, name: '회의록', count: 2, color: 'emerald' },
  { id: 3, name: '보고서', count: 2, color: 'blue' },
  { id: 4, name: '계약서', count: 1, color: 'rose' },
  { id: 5, name: '안내문', count: 2, color: 'sky' },
  { id: 6, name: '기획', count: 2, color: 'violet' },
];

export const mockAiActivities: AiActivity[] = [
  {
    id: 1,
    icon: 'user',
    title: '성명 자동 매칭',
    desc: '입사 지원서의 성명을 개인정보와 자동 매칭했어요.',
    time: '5분 전',
  },
  {
    id: 2,
    icon: 'sparkles',
    title: '지원동기 추천 생성',
    desc: '지원 분야에 맞는 지원동기 문장을 생성했어요.',
    time: '15분 전',
  },
  {
    id: 3,
    icon: 'mail',
    title: '이메일 입력 추천',
    desc: '이메일 항목에 맞춘 문장을 제안했어요.',
    time: '30분 전',
  },
];
