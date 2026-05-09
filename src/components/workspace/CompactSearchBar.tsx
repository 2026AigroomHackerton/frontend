interface FilterOption {
  label: string;
  value: string;
}

interface CompactSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  filters: FilterOption[];
  selectedFilter: string;
  onFilterChange: (value: string) => void;
}

function SearchGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-slate-400"
    >
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="m9 9 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CompactSearchBar({
  searchValue,
  onSearchChange,
  placeholder,
  ariaLabel,
  filters,
  selectedFilter,
  onFilterChange,
}: CompactSearchBarProps) {
  return (
    <div className="space-y-2">
      <label className="flex h-9 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm transition focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-300">
        <SearchGlyph />
        <input
          type="search"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
        {filters.map((filter) => {
          const isActive = selectedFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              className={[
                'h-7 shrink-0 rounded-full px-2.5 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CompactSearchBar;
