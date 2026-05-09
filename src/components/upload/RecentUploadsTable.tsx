import { Upload } from 'lucide-react';

type RecentUpload = {
  id: number;
  name: string;
  location: string;
  uploadedAt: string;
};

type RecentUploadsTableProps = {
  items?: RecentUpload[];
};

function RecentUploadsTable({ items = [] }: RecentUploadsTableProps) {
  const isEmpty = items.length === 0;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
        최근 업로드 파일
      </h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
              <th className="px-3 py-2">파일명</th>
              <th className="px-3 py-2">저장 위치</th>
              <th className="px-3 py-2">업로드 시간</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={3} className="px-3 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <Upload className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      업로드된 파일이 없습니다.
                    </p>
                    <p className="text-xs text-slate-400">
                      HWPX 파일을 업로드해 보세요.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-3 py-3 text-slate-700">{item.name}</td>
                  <td className="px-3 py-3 text-slate-500">{item.location}</td>
                  <td className="px-3 py-3 text-slate-500">
                    {item.uploadedAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentUploadsTable;
