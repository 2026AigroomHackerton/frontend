type StorageType = 'personal' | 'group';

type UploadSettingsProps = {
  storageType: StorageType;
  fileName: string;
  onChangeStorageType: (value: StorageType) => void;
  onChangeFileName: (value: string) => void;
};

function UploadSettings({
  storageType,
  fileName,
  onChangeStorageType,
  onChangeFileName,
}: UploadSettingsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-700">저장 위치</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="storageType"
              value="personal"
              checked={storageType === 'personal'}
              onChange={() => onChangeStorageType('personal')}
              className="h-4 w-4 accent-blue-600"
            />
            개인 보관함
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="storageType"
              value="group"
              checked={storageType === 'group'}
              onChange={() => onChangeStorageType('group')}
              className="h-4 w-4 accent-blue-600"
            />
            공유 보관함
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">파일명</label>
        <input
          type="text"
          value={fileName}
          onChange={(event) => onChangeFileName(event.target.value)}
          placeholder="파일명을 입력하세요. (선택)"
          className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

export default UploadSettings;
export type { StorageType };
