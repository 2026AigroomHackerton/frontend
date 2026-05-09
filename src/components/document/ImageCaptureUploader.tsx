import { useEffect, useRef } from 'react';
import { Camera, ImagePlus } from 'lucide-react';

interface ImageCaptureUploaderProps {
  onSelectImage: (file: File) => void;
  /** mount 시 카메라 input을 자동으로 트리거 */
  autoOpenCamera?: boolean;
}

function ImageCaptureUploader({ onSelectImage, autoOpenCamera = false }: ImageCaptureUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // mount 시 한 번만 카메라 input.click() 호출.
  // 모바일에선 후면 카메라가 자동으로 열리고, 데스크톱에선 일반 파일 다이얼로그.
  // 브라우저가 사용자 제스처 외 click을 차단하더라도 페이지의 카드 탭으로 fallback.
  useEffect(() => {
    if (!autoOpenCamera) return;
    // 라우터 전환 직후 DOM이 안정될 때까지 살짝 지연 — Safari에서 더 안정적.
    const timer = window.setTimeout(() => {
      cameraInputRef.current?.click();
    }, 50);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onSelectImage(file);
    // input value 초기화 — 같은 파일 재선택 가능
    event.target.value = '';
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      <label className="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-100 focus-within:border-blue-500">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white transition group-hover:bg-blue-500">
          <Camera size={26} aria-hidden />
        </span>
        <span className="space-y-1">
          <span className="block text-base font-semibold text-slate-950">
            카메라로 촬영
          </span>
          <span className="block text-xs text-slate-500">
            후면 카메라로 문서를 바로 찍어요
          </span>
        </span>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      <label className="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-50 focus-within:border-slate-500">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
          <ImagePlus size={26} aria-hidden />
        </span>
        <span className="space-y-1">
          <span className="block text-base font-semibold text-slate-950">
            갤러리에서 선택
          </span>
          <span className="block text-xs text-slate-500">
            이미 촬영해둔 사진을 사용해요
          </span>
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}

export default ImageCaptureUploader;
