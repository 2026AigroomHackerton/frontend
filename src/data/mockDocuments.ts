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
  recentDocuments: 12,
  aiAnalyzed: 28,
  groupCount: 3,
  savedAnswers: 47,
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
