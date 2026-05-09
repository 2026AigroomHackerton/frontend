import { useRef, type DragEvent } from 'react';
import { FileText, Upload } from 'lucide-react';

type FileDropzoneProps = {
  selectedFile: File | null;
  isDragging: boolean;
  onFileSelected: (file: File) => void;
  onDragStateChange: (dragging: boolean) => void;
  onClearFile?: () => void;
};

function FileDropzone({
  selectedFile,
  isDragging,
  onFileSelected,
  onDragStateChange,
  onClearFile,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickPick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) onDragStateChange(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragStateChange(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragStateChange(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center transition-colors sm:py-24 ${
        isDragging
          ? 'border-blue-500 bg-blue-100/70'
          : 'border-blue-300 bg-blue-50'
      }`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
        <Upload className="h-10 w-10 text-blue-600" />
      </div>

      {selectedFile ? (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="max-w-[200px] truncate text-sm font-medium text-slate-700 sm:max-w-xs">
            {selectedFile.name}
          </span>
          {onClearFile ? (
            <button
              type="button"
              onClick={onClearFile}
              className="text-xs text-slate-400 hover:text-slate-600"
              aria-label="파일 선택 해제"
            >
              ✕
            </button>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-base font-semibold text-blue-700 sm:text-lg">
          파일을 드래그하거나 클릭하여 업로드
        </p>
      )}

      <button
        type="button"
        onClick={handleClickPick}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        파일 선택
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export default FileDropzone;
