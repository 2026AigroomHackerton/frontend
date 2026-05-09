import React, { useEffect, useState } from 'react';
import DocumentTypeSelector from '../components/profile/DocumentTypeSelector';
import ToneSelector from '../components/profile/ToneSelector';
import {
  EMPTY_PROFILE,
  loadProfile,
  saveProfile,
  type MockUserProfile,
} from '../components/profile/profileStorage';

const ProfilePage: React.FC = () => {
  // 단일 데모 사용자 기준 (user_id=1) — 별도 식별자/로그인 없음.
  const [profile, setProfile] = useState<MockUserProfile>(EMPTY_PROFILE);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // 마운트 시 저장된 프로필 로드
  useEffect(() => {
    const stored = loadProfile();
    setProfile(stored);
    if (stored.savedAt) {
      const stamp = new Date(stored.savedAt).toLocaleString('ko-KR');
      setSaveStatus(`마지막 저장: ${stamp}`);
    }
  }, []);

  // 단일 필드 업데이트 헬퍼
  const updateField = <K extends keyof MockUserProfile>(
    key: K,
    value: MockUserProfile[K],
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  // 저장 버튼 (mock)
  const handleSave = () => {
    try {
      const saved = saveProfile(profile);
      setProfile(saved);
      const stamp = new Date(saved.savedAt).toLocaleString('ko-KR');
      setSaveStatus(`저장 완료 (${stamp})`);
    } catch (error) {
      console.error(error);
      setSaveStatus('저장 실패');
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold">프로필</h1>
        <p className="text-xs text-slate-500">
          단일 데모 사용자 기준입니다. 저장한 정보는 추후 AI 명령 추천에 참고 정보로 활용됩니다.
        </p>

        {/* 기본 정보 */}
        <div className="space-y-3">
          <div>
            <label className="text-sm">이름</label>
            <input
              type="text"
              value={profile.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="예: 홍길동"
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="text-sm">소속</label>
            <input
              type="text"
              value={profile.organization}
              onChange={(event) => updateField('organization', event.target.value)}
              placeholder="학교 / 기관 / 회사"
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="text-sm">역할</label>
            <input
              type="text"
              value={profile.role}
              onChange={(event) => updateField('role', event.target.value)}
              placeholder="예: 학생, 담당자"
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* 자주 쓰는 문서 유형 (다중 선택) */}
        <div>
          <label className="text-sm">자주 쓰는 문서 유형</label>
          <div className="mt-1">
            <DocumentTypeSelector
              selected={profile.favoriteDocTypes}
              onChange={(next) => updateField('favoriteDocTypes', next)}
            />
          </div>
        </div>

        {/* 선호 문체 (단일 선택) */}
        <div>
          <label className="text-sm">선호 문체</label>
          <div className="mt-1">
            <ToneSelector
              selected={profile.preferredTone}
              onChange={(next) => updateField('preferredTone', next)}
            />
          </div>
        </div>

        {/* 자주 쓰는 서명/마무리 문구 */}
        <div>
          <label className="text-sm">자주 쓰는 서명 / 마무리 문구</label>
          <input
            type="text"
            value={profile.signature}
            onChange={(event) => updateField('signature', event.target.value)}
            placeholder="예: 감사합니다. 길동 드림."
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {/* AI 추천 참고 정보 */}
        <div>
          <label className="text-sm">AI 추천 참고 정보</label>
          <textarea
            value={profile.aiContext}
            onChange={(event) => updateField('aiContext', event.target.value)}
            rows={4}
            placeholder="자주 쓰는 표현, 주의 사항 등 AI가 참고할 정보를 입력해 주세요."
            className="mt-1 w-full border rounded p-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">
            * 저장된 내용은 추후 AI 명령 추천에 활용됩니다.
          </p>
        </div>

        {/* 저장 / 저장 상태 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            저장
          </button>
          {saveStatus && (
            <span className="text-sm text-slate-600">{saveStatus}</span>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
