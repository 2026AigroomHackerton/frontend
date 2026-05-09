import type { Folder } from '../../types/workspace';

interface WorkspaceSidebarProps {
  label: string;
  allLabel: string;
  folders: Folder[];
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
}

function FolderGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-slate-400"
    >
      <path
        d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.25c.4 0 .78.16 1.06.44L8 4.63h4.5A1.5 1.5 0 0 1 14 6.13v5.37A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkspaceSidebar({ label, allLabel, folders, selectedFolderId, onSelectFolder }: WorkspaceSidebarProps) {
  return (
    <>
      {/* desktop sidebar */}
      <aside className="sticky top-4 hidden h-fit w-full lg:block">
        <p className="px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onSelectFolder('all')}
              className={[
                'flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                selectedFolderId === 'all'
                  ? 'bg-slate-100 font-semibold text-slate-950'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="text-slate-400">#</span>
              <span className="truncate">{allLabel}</span>
            </button>
          </li>
          {folders.map((folder) => {
            const isActive = selectedFolderId === folder.id;
            return (
              <li key={folder.id}>
                <button
                  type="button"
                  onClick={() => onSelectFolder(folder.id)}
                  className={[
                    'flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-950'
                      : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <FolderGlyph />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs text-slate-400">{folder.documentCount}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* mobile horizontal chips */}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
        <button
          type="button"
          onClick={() => onSelectFolder('all')}
          className={[
            'h-8 shrink-0 rounded-full px-3 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
            selectedFolderId === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {allLabel}
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelectFolder(folder.id)}
            className={[
              'h-8 shrink-0 rounded-full px-3 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              selectedFolderId === folder.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
            ].join(' ')}
          >
            {folder.name}
          </button>
        ))}
      </div>
    </>
  );
}

export default WorkspaceSidebar;
