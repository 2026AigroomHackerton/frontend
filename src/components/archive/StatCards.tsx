import { FileText, Sparkles, Users, MessageSquare, type LucideIcon } from 'lucide-react';
import { mockStats } from '../../data/mockDocuments';

type StatCardConfig = {
  key: keyof typeof mockStats;
  label: string;
  unit: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'recentDocuments',
    label: '최근 문서',
    unit: '개',
    icon: FileText,
    iconBg: 'bg-[#3b82f6]/15',
    iconColor: 'text-[#3b82f6]',
  },
  {
    key: 'aiAnalyzed',
    label: 'AI 분석 완료',
    unit: '건',
    icon: Sparkles,
    iconBg: 'bg-[#8b5cf6]/15',
    iconColor: 'text-[#8b5cf6]',
  },
  {
    key: 'groupCount',
    label: '참여 그룹',
    unit: '개',
    icon: Users,
    iconBg: 'bg-[#06b6d4]/15',
    iconColor: 'text-[#06b6d4]',
  },
  {
    key: 'savedAnswers',
    label: '저장된 답변',
    unit: '개',
    icon: MessageSquare,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
];

function StatCards() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = mockStats[card.key];
        return (
          <article
            key={card.key}
            className="rounded-xl bg-[#1e2a45] p-4 sm:p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-[#94a3b8] sm:text-sm">
                {card.label}
              </p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {value}
              <span className="ml-1 text-sm font-medium text-[#94a3b8]">
                {card.unit}
              </span>
            </p>
          </article>
        );
      })}
    </section>
  );
}

export default StatCards;
