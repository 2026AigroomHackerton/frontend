import type { EditOperation } from '../../types/document';

interface BeforeAfterPreviewProps {
  editOperations: EditOperation[];
  selectedIds: Set<string>;
  onToggle: (operationId: string) => void;
}

function operationLabel(type: EditOperation['type']): string {
  switch (type) {
    case 'replace_text':
      return '단어/문장 교체';
    case 'replace_section':
      return '문단/항목 교체';
    case 'rewrite_document':
      return '문서 재작성';
    case 'append_paragraph':
      return '문단 추가';
    case 'update_field':
      return '필드 입력';
    case 'update_table_text':
      return '표 텍스트';
    case 'update_table_cell':
      return '표 셀';
    default:
      return type;
  }
}

function BeforeAfterPreview({ editOperations, selectedIds, onToggle }: BeforeAfterPreviewProps) {
  if (editOperations.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {editOperations.map((op) => {
        const isSelected = selectedIds.has(op.operationId);
        const confidencePct = Math.round(op.confidence * 100);

        return (
          <li key={op.operationId}>
            <label
              className={[
                'block cursor-pointer rounded-lg border bg-white p-3 transition',
                isSelected ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-slate-200',
              ].join(' ')}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(op.operationId)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {operationLabel(op.type)}
                    </span>
                    <span className="truncate text-xs text-slate-500">{op.target.label}</span>
                  </div>

                  <div className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
                    <div className="rounded-md bg-rose-50 p-2 text-rose-900">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500">
                        before
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words leading-5">
                        {op.beforeText || '(빈 줄)'}
                      </p>
                    </div>
                    <div className="rounded-md bg-emerald-50 p-2 text-emerald-900">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                        after
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words leading-5">
                        {op.afterText || '(빈 줄)'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-slate-500">{op.reason}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      신뢰도
                    </span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums text-slate-500">
                      {confidencePct}%
                    </span>
                  </div>
                </div>
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export default BeforeAfterPreview;
