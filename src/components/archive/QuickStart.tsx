import {
  FilePlus,
  Sparkles,
  Smartphone,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react';

type QuickAction = {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  gradient: string;
};

const ACTIONS: QuickAction[] = [
  {
    key: 'new',
    label: '새 문서 작성',
    desc: '빈 문서로 시작하기',
    icon: FilePlus,
    gradient: 'from-[#3b82f6] to-[#2563eb]',
  },
  {
    key: 'ai',
    label: 'AI 추천 작성',
    desc: '템플릿 기반 자동 생성',
    icon: Sparkles,
    gradient: 'from-[#8b5cf6] to-[#7c3aed]',
  },
  {
    key: 'upload',
    label: '문서 업로드',
    desc: 'HWPX 파일 가져오기',
    icon: UploadCloud,
    gradient: 'from-[#06b6d4] to-[#0891b2]',
  },
  {
    key: 'mobile',
    label: '모바일 스캔',
    desc: '문서 촬영으로 입력',
    icon: Smartphone,
    gradient: 'from-emerald-500 to-emerald-600',
  },
];

function QuickStart() {
  return (
    <section className="rounded-xl bg-[#1e2a45] p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          빠른 시작
        </h2>
      </header>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              className={`group flex flex-col items-start gap-3 rounded-xl bg-gradient-to-br ${action.gradient} p-4 text-left text-white transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="mt-0.5 text-xs text-white/80">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default QuickStart;
