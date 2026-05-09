type ProfileHeaderProps = {
  onBack?: () => void;
  onOpenSidebar?: () => void;
};

function ProfileHeader({ onBack, onOpenSidebar }: ProfileHeaderProps = {}) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="flex items-center gap-2">
        {onOpenSidebar ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="사이드바 열기"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
        ) : null}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="뒤로 가기"
          >
            <span className="text-lg leading-none">←</span>
          </button>
        ) : null}
        <h1 className="text-xl font-semibold text-slate-900">개인정보 관리</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
            DU
          </div>
          <span className="text-sm font-medium text-slate-700">Demo User</span>
        </div>
      </div>
    </header>
  );
}

export default ProfileHeader;
