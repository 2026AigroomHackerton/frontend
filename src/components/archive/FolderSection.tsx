import { Folder, FolderOpen } from 'lucide-react';
import {
  mockGroupFolders,
  mockPersonalFolders,
  type FolderItem,
} from '../../data/mockDocuments';

type FolderListProps = {
  title: string;
  folders: FolderItem[];
  accent: 'blue' | 'purple';
};

const ACCENT: Record<FolderListProps['accent'], { bg: string; icon: string }> = {
  blue: { bg: 'bg-[#3b82f6]/15', icon: 'text-[#60a5fa]' },
  purple: { bg: 'bg-[#8b5cf6]/15', icon: 'text-[#a78bfa]' },
};

function FolderList({ title, folders, accent }: FolderListProps) {
  const accentStyle = ACCENT[accent];
  return (
    <section className="rounded-xl bg-[#1e2a45] p-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className={`h-4 w-4 ${accentStyle.icon}`} />
          <h2 className="text-base font-semibold text-white sm:text-lg">
            {title}
          </h2>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-[#60a5fa] hover:text-[#93c5fd]"
        >
          더보기
        </button>
      </header>
      <ul className="mt-4 space-y-2">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
          >
            <div
              className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${accentStyle.bg}`}
            >
              <Folder className={`h-4 w-4 ${accentStyle.icon}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {folder.name}
              </p>
              <p className="mt-0.5 text-xs text-[#94a3b8]">
                {folder.count}개 · {folder.date}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FolderSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <FolderList
        title="개인 폴더"
        folders={mockPersonalFolders}
        accent="blue"
      />
      <FolderList
        title="그룹 폴더"
        folders={mockGroupFolders}
        accent="purple"
      />
    </div>
  );
}

export default FolderSection;
