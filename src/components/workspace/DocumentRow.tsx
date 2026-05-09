import type { DocumentPermission, WorkspaceDocument } from '../../types/workspace';
import DocumentIcon from './DocumentIcon';

const permissionLabel: Record<DocumentPermission, string> = {
  read: '읽기',
  edit: '수정',
  owner: '소유자',
};

interface DocumentRowProps {
  document: WorkspaceDocument;
  groupName?: string;
  variant?: 'personal' | 'shared';
  onOpen: (documentId: string) => void;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(date));
}

function DocumentRow({ document, groupName, variant = 'personal', onOpen }: DocumentRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(document.id)}
      className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:gap-4 sm:px-3 sm:py-3"
    >
      <DocumentIcon fileType={document.fileType} size={28} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-slate-900">{document.title}</h3>
          {document.hasAiSuggestion ? (
            <span className="hidden h-1.5 w-1.5 rounded-full bg-indigo-400 sm:inline-block" aria-label="AI 추천" />
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{document.description}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
          {variant === 'shared' && document.sharedBy ? <span>{document.sharedBy}</span> : null}
          {variant === 'shared' && groupName ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{groupName}</span>
            </>
          ) : null}
          {variant === 'shared' && document.permission ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{permissionLabel[document.permission]}</span>
            </>
          ) : null}
        </div>
      </div>

      <span className="shrink-0 text-[11px] text-slate-400">{formatDate(document.updatedAt)}</span>
    </button>
  );
}

export default DocumentRow;
