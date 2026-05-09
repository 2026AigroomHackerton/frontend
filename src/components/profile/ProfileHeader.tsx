function ProfileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <h1 className="text-xl font-semibold text-slate-900">개인정보 관리</h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          aria-label="검색"
        >
          🔍
        </button>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          aria-label="알림"
        >
          🔔
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            3
          </span>
        </button>
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
