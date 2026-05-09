import { Calendar, FileText } from 'lucide-react';

type UploadStatCardsProps = {
  todayCount: number;
  todayDate: string;
};

function UploadStatCards({ todayCount, todayDate }: UploadStatCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-100">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">지원 형식</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">HWPX 우선</p>
            <p className="mt-1 text-xs text-slate-500">
              HWPX 파일을 우선 지원합니다
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-100">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">오늘 업로드</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {todayCount}건
            </p>
            <p className="mt-1 text-xs text-slate-500">{todayDate} 기준</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default UploadStatCards;
