import { useState } from 'react';
import Sidebar from '../components/archive/Sidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCards from '../components/profile/StatsCards';
import BasicInfoForm, {
  type ProfileFormData,
} from '../components/profile/BasicInfoForm';
import AIInfoPanel from '../components/profile/AIInfoPanel';
import FrequentItemsPanel from '../components/profile/FrequentItemsPanel';

const SAMPLE_DATA: ProfileFormData = {
  nameKo: '양희승',
  nameEn: 'Yang Heeseung',
  address: '대구광역시 수성구 달구벌대로 2450',
  gender: '남성',
  phone: '010-1234-5678',
  rrn: '900101-1******',
  email: 'heeseung@example.com',
  certifications: ['정보처리기사', 'AWS SAA', 'SQLD'],
  job: '연암공대 소프트웨어학과',
};

const EMPTY_DATA: ProfileFormData = {
  nameKo: '',
  nameEn: '',
  address: '',
  gender: '선택 안 함',
  phone: '',
  rrn: '',
  email: '',
  certifications: [],
  job: '',
};

function countFilledFields(data: ProfileFormData): number {
  let count = 0;
  if (data.nameKo) count += 1;
  if (data.nameEn) count += 1;
  if (data.address) count += 1;
  if (data.gender && data.gender !== '선택 안 함') count += 1;
  if (data.phone) count += 1;
  if (data.rrn) count += 1;
  if (data.email) count += 1;
  if (data.certifications.length > 0) count += 1;
  if (data.job) count += 1;
  return count;
}

type ProfilePageProps = {
  onBack?: () => void;
  onNavigate?: (key: string) => void;
};

function ProfilePage({ onBack, onNavigate }: ProfilePageProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_DATA);
  const [certInput, setCertInput] = useState('');

  const handleChangeField = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCert = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, value],
    }));
    setCertInput('');
  };

  const handleRemoveCert = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert !== value),
    }));
  };

  const handleSave = () => {
    console.log('save profile', formData);
  };

  const handleReset = () => {
    setFormData(EMPTY_DATA);
    setCertInput('');
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_DATA);
    setCertInput('');
  };

  const filledCount = countFilledFields(formData);

  const frequentItems = [
    { icon: '👤', label: '이름', value: formData.nameKo || '-' },
    { icon: '📞', label: '연락처', value: formData.phone || '-' },
    { icon: '✉️', label: '이메일', value: formData.email || '-' },
    {
      icon: '📍',
      label: '주소',
      value: formData.address
        ? formData.address.length > 20
          ? `${formData.address.slice(0, 20)}...`
          : formData.address
        : '-',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        activeKey="profile"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={onNavigate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ProfileHeader
          onBack={onBack}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="flex-1 px-4 py-6 sm:px-8">
          <StatsCards
            registeredCount={filledCount}
            registeredTotal={10}
            recommendableDocs={0}
            lastModifiedDate="2026.05.09"
            lastModifiedTime="오전 10:32"
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <BasicInfoForm
              formData={formData}
              certInput={certInput}
              onChangeField={handleChangeField}
              onChangeCertInput={setCertInput}
              onAddCertification={handleAddCert}
              onRemoveCertification={handleRemoveCert}
              onSave={handleSave}
              onReset={handleReset}
              onLoadSample={handleLoadSample}
            />

            <div className="space-y-6">
              <AIInfoPanel />
              <FrequentItemsPanel items={frequentItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
