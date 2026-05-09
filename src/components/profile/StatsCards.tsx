type StatsCardsProps = {
  registeredCount: number;
  registeredTotal: number;
  recommendableDocs: number;
  lastModifiedDate: string;
  lastModifiedTime: string;
};

function StatsCards({
  registeredCount,
  registeredTotal,
  recommendableDocs,
  lastModifiedDate,
  lastModifiedTime,
}: StatsCardsProps) {
  const completionRate = Math.round((registeredCount / registeredTotal) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span aria-hidden>👤</span>
          <span>등록된 정보</span>
        </div>
        <p className="mt-3 text-3xl font-bold text-blue-600">
          {registeredCount}/{registeredTotal}
        </p>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          프로필 완성도 {completionRate}%
        </p>
      </article>

      <article className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span aria-hidden>📄</span>
          <span>자동 추천 가능 문서</span>
        </div>
        <p className="mt-3 text-3xl font-bold text-blue-600">
          {recommendableDocs}개
        </p>
        <p className="mt-2 text-xs text-slate-500">
          AI 추천으로 자동 입력 가능
        </p>
      </article>

      <article className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span aria-hidden>📅</span>
          <span>최근 수정</span>
        </div>
        <p className="mt-3 text-3xl font-bold text-blue-600">
          {lastModifiedDate}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {lastModifiedTime}에 수정됨
        </p>
      </article>
    </div>
  );
}

export default StatsCards;
