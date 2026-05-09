type FrequentItem = {
  icon: string;
  label: string;
  value: string;
};

type FrequentItemsPanelProps = {
  items: FrequentItem[];
};

function FrequentItemsPanel({ items }: FrequentItemsPanelProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">자주 쓰는 항목</h2>
        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          편집
        </button>
      </div>
      <ul className="mt-4 divide-y divide-slate-100">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-3 py-3 text-sm"
          >
            <span aria-hidden className="text-base">
              {item.icon}
            </span>
            <span className="w-20 flex-none font-medium text-slate-700">
              {item.label}
            </span>
            <span className="truncate text-slate-500">{item.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FrequentItemsPanel;
