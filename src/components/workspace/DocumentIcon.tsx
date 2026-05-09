import type { DocumentFileType } from '../../types/workspace';

interface DocumentIconProps {
  fileType: DocumentFileType;
  size?: number;
  className?: string;
}

const palette: Record<DocumentFileType, { fill: string; stroke: string; fold: string }> = {
  hwpx: { fill: '#EFF6FF', stroke: '#60A5FA', fold: '#BFDBFE' },
  hwp: { fill: '#EEF2FF', stroke: '#818CF8', fold: '#C7D2FE' },
  ocr: { fill: '#FFFBEB', stroke: '#FBBF24', fold: '#FDE68A' },
  txt: { fill: '#F8FAFC', stroke: '#94A3B8', fold: '#E2E8F0' },
  external: { fill: '#F1F5F9', stroke: '#64748B', fold: '#CBD5E1' },
};

function DocumentIcon({ fileType, size = 28, className }: DocumentIconProps) {
  const tone = palette[fileType] ?? palette.txt;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 3.75A1.75 1.75 0 0 1 6.75 2H14l5 5v13.25A1.75 1.75 0 0 1 17.25 22H6.75A1.75 1.75 0 0 1 5 20.25V3.75Z"
        fill={tone.fill}
        stroke={tone.stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v4.25c0 .41.34.75.75.75H19"
        fill={tone.fold}
        stroke={tone.stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DocumentIcon;
