import React from 'react';

// Google Drive / Notion 외부 저장소 버튼.
// 실제 연동은 추후 작업 (PDF 가이드: provider 구조만 둠).

interface ExternalProvider {
  key: 'google_drive' | 'notion';
  label: string;
}

const PROVIDERS: ExternalProvider[] = [
  { key: 'google_drive', label: 'Google Drive' },
  { key: 'notion', label: 'Notion' },
];

const ExternalStorageSection: React.FC = () => {
  // 준비중 버튼 클릭 시 안내만 띄움
  const handleClick = (label: string) => {
    alert(`${label} 연동은 준비 중입니다.`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.key}
          type="button"
          onClick={() => handleClick(provider.label)}
          className="flex items-center gap-2 px-3 py-1 border rounded text-sm bg-white"
        >
          <span>{provider.label}</span>
          {/* Coming Soon 배지 */}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
            Coming Soon
          </span>
        </button>
      ))}
    </div>
  );
};

export default ExternalStorageSection;
