const POINTS = [
  '정확한 정보 입력이 추천 정확도를 높입니다.',
  '민감정보는 안전하게 암호화되어 저장됩니다.',
  '필요 시 언제든 수정하거나 삭제할 수 있습니다.',
];

function AIInfoPanel() {
  return (
    <section className="rounded-xl border border-blue-300 bg-blue-50/40 p-6">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
        >
          i
        </span>
        <h2 className="text-base font-semibold text-slate-900">
          AI 자동 입력에 사용되는 정보
        </h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        입력하신 정보는 문서 작성 시 AI가 자동으로 불러와 추천하고 입력하는 데
        사용됩니다.
      </p>
      <ul className="mt-4 space-y-2">
        {POINTS.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <span
              aria-hidden
              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
            >
              ✓
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AIInfoPanel;
