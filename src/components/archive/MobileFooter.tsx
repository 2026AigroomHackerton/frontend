import {
  Bell,
  Camera,
  Settings,
  Share2,
  User,
  type LucideIcon,
} from 'lucide-react';

type FooterItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

const ITEMS: FooterItem[] = [
  { key: 'personal', label: '개인', icon: User },
  { key: 'share', label: '공유', icon: Share2 },
  { key: 'camera', label: '카메라', icon: Camera },
  { key: 'notification', label: '알림', icon: Bell },
  { key: 'settings', label: '설정', icon: Settings },
];

type MobileFooterProps = {
  activeKey?: string;
  onSelect?: (key: string) => void;
};

function MobileFooter({ activeKey = 'personal', onSelect }: MobileFooterProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-[#0a1128]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="모바일 하단 네비게이션"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeKey;
          const isCenter = item.key === 'camera';

          if (isCenter) {
            return (
              <li key={item.key} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onSelect?.(item.key)}
                  className="-mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/40 transition-transform hover:-translate-y-0.5"
                  aria-label={item.label}
                >
                  <Icon className="h-6 w-6" />
                </button>
              </li>
            );
          }

          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onSelect?.(item.key)}
                className={`flex w-full flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                  isActive
                    ? 'text-[#60a5fa]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileFooter;
