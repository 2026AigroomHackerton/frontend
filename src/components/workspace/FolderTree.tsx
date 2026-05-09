import { useMemo, useState } from 'react';
import type { Folder, SharedGroup } from '../../types/workspace';

interface FolderTreeProps {
  groups: SharedGroup[];
  folders: Folder[];
  selectedGroupId: string;
  selectedFolderId: string;
  onSelectAll: () => void;
  onSelectGroup: (groupId: string) => void;
  onSelectFolder: (groupId: string, folderId: string) => void;
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={['transition-transform', open ? 'rotate-90' : ''].join(' ')}
    >
      <path d="M3.5 2.5 6.5 5l-3 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-slate-400">
      <path
        d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.25c.4 0 .78.16 1.06.44L8 4.63h4.5A1.5 1.5 0 0 1 14 6.13v5.37A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderTree({
  groups,
  folders,
  selectedGroupId,
  selectedFolderId,
  onSelectAll,
  onSelectGroup,
  onSelectFolder,
}: FolderTreeProps) {
  const initialExpanded = useMemo(
    () => new Set<string>(groups.length > 0 ? [groups[0].id] : []),
    [groups],
  );
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  const toggle = (groupId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <>
      {/* desktop tree */}
      <aside className="sticky top-4 hidden h-fit w-full lg:block">
        <p className="px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Shared</p>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={onSelectAll}
              className={[
                'flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                selectedGroupId === 'all'
                  ? 'bg-slate-100 font-semibold text-slate-950'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="text-slate-400">#</span>
              <span className="truncate">전체 공유</span>
            </button>
          </li>
          {groups.map((group) => {
            const isOpen = expanded.has(group.id);
            const groupFolders = folders.filter((folder) => folder.ownerId === group.id);
            const isGroupSelected = selectedGroupId === group.id && selectedFolderId === 'all';

            return (
              <li key={group.id}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggle(group.id)}
                    aria-label={isOpen ? `${group.name} 접기` : `${group.name} 펼치기`}
                    className="flex h-9 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <Caret open={isOpen} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGroup(group.id)}
                    className={[
                      'flex h-9 flex-1 items-center gap-2 rounded-lg px-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                      isGroupSelected
                        ? 'bg-slate-100 font-semibold text-slate-950'
                        : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className="truncate">{group.name}</span>
                    <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {group.role}
                    </span>
                  </button>
                </div>

                {isOpen && groupFolders.length > 0 ? (
                  <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
                    {groupFolders.map((folder) => {
                      const isActive = selectedGroupId === group.id && selectedFolderId === folder.id;
                      return (
                        <li key={folder.id}>
                          <button
                            type="button"
                            onClick={() => onSelectFolder(group.id, folder.id)}
                            className={[
                              'flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
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
                ) : null}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* mobile chip rows */}
      <div className="space-y-1.5 lg:hidden">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
          <button
            type="button"
            onClick={onSelectAll}
            className={[
              'h-8 shrink-0 rounded-full px-3 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              selectedGroupId === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
            ].join(' ')}
          >
            전체 공유
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectGroup(group.id)}
              className={[
                'h-8 shrink-0 rounded-full px-3 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                selectedGroupId === group.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              {group.name}
            </button>
          ))}
        </div>
        {selectedGroupId !== 'all' ? (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            {folders
              .filter((folder) => folder.ownerId === selectedGroupId)
              .map((folder) => {
                const isActive = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => onSelectFolder(selectedGroupId, folder.id)}
                    className={[
                      'h-7 shrink-0 rounded-full border px-3 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                      isActive
                        ? 'border-slate-900 bg-white text-slate-900'
                        : 'border-slate-200 bg-white text-slate-500',
                    ].join(' ')}
                  >
                    {folder.name}
                  </button>
                );
              })}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default FolderTree;
