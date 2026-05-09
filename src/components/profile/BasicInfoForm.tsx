import type { ChangeEvent, KeyboardEvent } from 'react';

export type ProfileFormData = {
  nameKo: string;
  nameEn: string;
  address: string;
  gender: string;
  phone: string;
  rrn: string;
  email: string;
  certifications: string[];
  job: string;
};

type BasicInfoFormProps = {
  formData: ProfileFormData;
  certInput: string;
  onChangeField: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void;
  onChangeCertInput: (value: string) => void;
  onAddCertification: (value: string) => void;
  onRemoveCertification: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
  onLoadSample: () => void;
};

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

function BasicInfoForm({
  formData,
  certInput,
  onChangeField,
  onChangeCertInput,
  onAddCertification,
  onRemoveCertification,
  onSave,
  onReset,
  onLoadSample,
}: BasicInfoFormProps) {
  const handleText =
    (key: keyof ProfileFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChangeField(key, event.target.value as never);
    };

  const handleCertKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const value = certInput.trim();
    if (!value) return;
    if (formData.certifications.includes(value)) {
      onChangeCertInput('');
      return;
    }
    onAddCertification(value);
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">기본 정보</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel required>성명 (한글)</FieldLabel>
          <input
            type="text"
            className={inputClass}
            value={formData.nameKo}
            onChange={handleText('nameKo')}
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>성명 (영문)</FieldLabel>
          <input
            type="text"
            className={inputClass}
            value={formData.nameEn}
            onChange={handleText('nameEn')}
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel required>주소</FieldLabel>
          <input
            type="text"
            className={inputClass}
            value={formData.address}
            onChange={handleText('address')}
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>성별</FieldLabel>
          <select
            className={inputClass}
            value={formData.gender}
            onChange={handleText('gender')}
          >
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="선택 안 함">선택 안 함</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <FieldLabel required>전화번호</FieldLabel>
          <input
            type="text"
            className={inputClass}
            value={formData.phone}
            onChange={handleText('phone')}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>주민등록번호</FieldLabel>
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                확인 후 반영
              </span>
              <span
                aria-hidden
                title="외부 검증이 필요한 항목입니다."
                className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-500"
              >
                i
              </span>
            </div>
          </div>
          <input
            type="text"
            className={inputClass}
            value={formData.rrn}
            onChange={handleText('rrn')}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <FieldLabel required>이메일</FieldLabel>
          <input
            type="email"
            className={inputClass}
            value={formData.email}
            onChange={handleText('email')}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <FieldLabel>자격증</FieldLabel>
          <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2">
            {formData.certifications.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {cert}
                <button
                  type="button"
                  onClick={() => onRemoveCertification(cert)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label={`${cert} 제거`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="flex-1 min-w-[200px] border-0 bg-transparent px-1 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              placeholder="자격증을 입력하고 Enter 키를 눌러 추가하세요."
              value={certInput}
              onChange={(event) => onChangeCertInput(event.target.value)}
              onKeyDown={handleCertKeyDown}
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <FieldLabel required>직업/소속</FieldLabel>
          <input
            type="text"
            className={inputClass}
            value={formData.job}
            onChange={handleText('job')}
          />
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        * 표시는 필수 입력 항목입니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <span aria-hidden>💾</span> 저장
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span aria-hidden>↺</span> 초기화
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span aria-hidden>↓</span> 샘플 데이터 불러오기
        </button>
      </div>
    </section>
  );
}

export default BasicInfoForm;
