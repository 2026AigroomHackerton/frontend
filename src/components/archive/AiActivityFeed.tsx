import { Mail, Sparkles, User, type LucideIcon } from 'lucide-react';
import {
  mockAiActivities,
  type AiActivityIcon,
} from '../../data/mockDocuments';

const ICON_MAP: Record<AiActivityIcon, { icon: LucideIcon; bg: string; color: string }> = {
  user: { icon: User, bg: 'bg-[#3b82f6]/15', color: 'text-[#60a5fa]' },
  sparkles: { icon: Sparkles, bg: 'bg-[#8b5cf6]/15', color: 'text-[#a78bfa]' },
  mail: { icon: Mail, bg: 'bg-[#06b6d4]/15', color: 'text-[#22d3ee]' },
};

function AiActivityFeed() {
  return (
    <section className="rounded-xl bg-[#1e2a45] p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          AI 활동 피드
        </h2>
        <button
          type="button"
          className="text-xs font-medium text-[#60a5fa] hover:text-[#93c5fd]"
        >
          전체 보기
        </button>
      </header>
      <ul className="mt-4 space-y-3">
        {mockAiActivities.map((activity) => {
          const config = ICON_MAP[activity.icon];
          const Icon = config.icon;
          return (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
            >
              <div
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${config.bg}`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {activity.title}
                  </p>
                  <span className="flex-none text-xs text-[#94a3b8]">
                    {activity.time}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
                  {activity.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default AiActivityFeed;
