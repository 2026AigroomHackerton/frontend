import { useEffect, useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import type { CommandEditResult } from '../../types/document';
import BeforeAfterPreview from './BeforeAfterPreview';

interface EditPlanSheetProps {
  plan: CommandEditResult | null;
  commandText?: string;
  onApprove: (operationIds: string[]) => void;
  onReject: () => void;
}

function EditPlanSheet({ plan, commandText, onApprove, onReject }: EditPlanSheetProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (plan) {
      setSelected(new Set(plan.editOperations.map((op) => op.operationId)));
    } else {
      setSelected(new Set());
    }
  }, [plan]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isOpen = plan !== null;
  const previewOnly =
    plan !== null &&
    plan.editOperations.length === 0 &&
    Boolean(plan.previewText && plan.previewText.trim().length > 0);
  const canApprove = selected.size > 0 || previewOnly;

  return (
    <>
      {/* 모바일 backdrop */}
      {isOpen ? (
        <button
          type="button"
          aria-label="검토 시트 닫기"
          onClick={onReject}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      ) : null}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AI 수정 계획 검토"
        className={[
          // 모바일: bottom sheet
          'fixed inset-x-0 bottom-0 z-40 max-h-[80vh] rounded-t-2xl bg-white shadow-2xl transition-transform',
          // 데스크톱: 우측 사이드 패널
          'lg:static lg:z-auto lg:flex lg:max-h-none lg:w-[24rem] lg:flex-col lg:rounded-none lg:border-l lg:border-slate-200 lg:shadow-none',
          isOpen ? 'translate-y-0 lg:flex' : 'translate-y-full lg:hidden',
        ].join(' ')}
      >
        {/* drag handle (모바일만) */}
        <div className="lg:hidden">
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300" />
        </div>

        {/* header */}
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles size={13} aria-hidden />
              AI 수정 미리보기
            </p>
            <h2 className="mt-0.5 truncate text-sm font-semibold text-slate-950 sm:text-base">
              {plan?.summary ?? '제안된 변경사항'}
            </h2>
            {commandText ? (
              <p className="mt-0.5 truncate text-xs text-slate-500">"{commandText}"</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onReject}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X size={16} aria-hidden />
          </button>
        </header>

        {/* warnings */}
        {plan && plan.warnings.length > 0 ? (
          <ul className="space-y-0.5 border-b border-slate-100 bg-amber-50 px-4 py-2 text-[11px] text-amber-800 sm:px-5">
            {plan.warnings.map((warning) => (
              <li key={warning}>· {warning}</li>
            ))}
          </ul>
        ) : null}

        {/* operations list (스크롤 영역) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          {plan && plan.editOperations.length > 0 ? (
            <BeforeAfterPreview
              editOperations={plan.editOperations}
              selectedIds={selected}
              onToggle={toggle}
            />
          ) : null}

          {previewOnly && plan?.previewText ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <p className="font-semibold text-amber-900">
                전체 본문이 새로 작성됩니다
              </p>
              <p className="mt-1 text-[11px] text-amber-800">
                기존 단락 단위 매칭이 어려워 HWPX 본문을 새 내용으로 재빌드합니다.
                파일 형식은 그대로 HWPX로 유지됩니다.
              </p>
              <pre className="mt-2 max-h-[40vh] overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-white p-2 text-[11px] leading-5 text-slate-800">
                {plan.previewText}
              </pre>
            </div>
          ) : null}
        </div>

        {/* sticky footer — 큰 승인/반려 CTA */}
        <footer className="sticky bottom-0 flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onReject}
            className="h-11 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            반려
          </button>
          <button
            type="button"
            disabled={!canApprove}
            onClick={() => onApprove(Array.from(selected))}
            className="inline-flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={16} aria-hidden />
            {previewOnly
              ? '전체 적용 (HWPX 재빌드)'
              : selected.size > 0
                ? `${selected.size}건 승인`
                : '승인'}
          </button>
        </footer>
      </aside>
    </>
  );
}

export default EditPlanSheet;
