import { Menu } from 'lucide-react';

type UploadHeaderProps = {
  onOpenSidebar?: () => void;
};

function UploadHeader({ onOpenSidebar }: UploadHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:px-8">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex h-10 w-10 flex-none items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="사이드바 열기"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
        문서 업로드
      </h1>
    </header>
  );
}

export default UploadHeader;
