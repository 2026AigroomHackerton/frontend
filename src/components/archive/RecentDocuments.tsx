import { FileText, MoreHorizontal } from 'lucide-react';
import {
  mockRecentDocuments,
  type DocumentStatusColor,
} from '../../data/mockDocuments';

const STATUS_STYLES: Record<DocumentStatusColor, string> = {
  green: 'bg-emerald-500/15 text-emerald-300',
  blue: 'bg-[#3b82f6]/15 text-[#60a5fa]',
  yellow: 'bg-yellow-500/15 text-yellow-300',
  red: 'bg-red-500/15 text-red-300',
};

function RecentDocuments() {
  return (
    <section className="rounded-xl bg-[#1e2a45] p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          최근 문서
        </h2>
        <button
          type="button"
          className="text-xs font-medium text-[#60a5fa] hover:text-[#93c5fd]"
        >
          전체 보기
        </button>
      </header>

      <ul className="mt-4 divide-y divide-white/5">
        {mockRecentDocuments.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#3b82f6]/15">
              <FileText className="h-4 w-4 text-[#60a5fa]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {doc.name}
              </p>
              <p className="mt-0.5 text-xs text-[#94a3b8]">{doc.date}</p>
            </div>
            <span
              className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline ${STATUS_STYLES[doc.statusColor]}`}
            >
              {doc.status}
            </span>
            <button
              type="button"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-[#94a3b8] hover:bg-white/5 hover:text-white"
              aria-label="더보기"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentDocuments;
