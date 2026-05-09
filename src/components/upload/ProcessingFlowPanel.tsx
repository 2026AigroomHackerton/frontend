import { ShieldCheck } from 'lucide-react';

type FlowStep = {
  step: number;
  title: string;
  desc: string;
};

const STEPS: FlowStep[] = [
  {
    step: 1,
    title: '원본 저장',
    desc: '업로드된 파일을 안전하게 저장합니다.',
  },
  {
    step: 2,
    title: '텍스트 추출',
    desc: '문서의 텍스트를 자동으로 추출합니다.',
  },
  {
    step: 3,
    title: 'AI 분석 준비',
    desc: '추출된 텍스트를 AI 분석에 최적화합니다.',
  },
  {
    step: 4,
    title: '아카이브 등록',
    desc: '분석 완료 후 아카이브에 등록합니다.',
  },
];

function ProcessingFlowPanel() {
  return (
    <aside className="space-y-4">
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          업로드 후 처리 흐름
        </h2>

        <ol className="mt-4 space-y-1">
          {STEPS.map((item, index) => (
            <li key={item.step}>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {item.step}
                  </div>
                  {index < STEPS.length - 1 ? (
                    <div className="my-1 h-8 w-px border-l border-dashed border-blue-200" />
                  ) : null}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-900">
            보안이 중요합니다
          </p>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          모든 데이터는 안전하게 암호화되어 보호됩니다.
        </p>
        <button
          type="button"
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          자세히 보기 &gt;
        </button>
      </section>
    </aside>
  );
}

export default ProcessingFlowPanel;
