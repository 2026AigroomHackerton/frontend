import { useCallback, useEffect, useRef, useState } from 'react';
import AiStatusBar from '../components/document/AiStatusBar';
import DocumentEditor from '../components/document/DocumentEditor';
import EditPlanSheet from '../components/document/EditPlanSheet';
import MobileCommandButton from '../components/document/MobileCommandButton';
import { useAiEditFlow } from '../hooks/useAiEditFlow';
import { saveDocumentText } from '../api/documents';
import { downloadTextFile, getFileKind } from '../utils/fileUtils';

const STORAGE_TITLE_KEY = 'hangul-doc-editor-mvp:lastTitle';

const HWP_NOTICE = 'HWPX 파일을 우선 지원합니다. HWP 파일은 추후 백엔드 파서 연동 예정입니다.';

function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const documentTextRef = useRef<string>('');

  // 초기 타이틀 복원
  useEffect(() => {
    const savedTitle = localStorage.getItem(STORAGE_TITLE_KEY);
    if (savedTitle) setTitle(savedTitle);
  }, []);

  const getDocumentText = useCallback(() => documentTextRef.current, []);

  const { state, setRecording, startCommand, approve, reject } = useAiEditFlow({
    documentId: 'mock-document-id',
    getDocumentText,
    onApplied: (updatedText) => {
      documentTextRef.current = updatedText;
      // TODO: 백엔드 연동 시 새 hwpx ArrayBuffer를 받으면 setSelectedFile로 갱신 → RhwpViewer 자동 reload
    },
  });

  function handleSelectFile(file: File | null) {
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const kind = getFileKind(file);
    if (kind === 'unsupported') {
      setError('.hwpx 또는 .hwp 파일만 업로드할 수 있습니다.');
      return;
    }

    if (kind === 'hwp') {
      setError(HWP_NOTICE);
      // HWP는 뷰어로 시도하되 실패 시 RhwpViewer가 에러 표시
    }

    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.(hwpx|hwp)$/i, ''));
  }

  function handleSave() {
    if (!selectedFile) return;
    localStorage.setItem(STORAGE_TITLE_KEY, title);
    void saveDocumentText('mock-document-id', documentTextRef.current);
  }

  function handleDownload() {
    if (!selectedFile) return;
    const baseName = title.trim() || selectedFile.name.replace(/\.(hwpx|hwp)$/i, '') || 'edited';
    // 백엔드 연결 전: 클라이언트는 원본 파일 다시 다운로드. 향후 /api/documents/{id}/download로 전환.
    const text = documentTextRef.current;
    if (text) {
      downloadTextFile(text, `${baseName}.txt`);
    } else {
      // 텍스트가 없으면 원본 파일 그대로
      const url = URL.createObjectURL(selectedFile);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = selectedFile.name;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  }

  function handleVoiceCommand(transcript: string, inputType: 'voice' | 'text') {
    if (!selectedFile) {
      setError('먼저 HWPX 파일을 업로드한 뒤 명령을 보내세요.');
      return;
    }
    setError(null);
    void startCommand(transcript, inputType);
  }

  // reviewing/applying 상태에서 plan 추출
  const reviewingPlan = state.kind === 'reviewing' ? state.plan : null;
  const reviewingCommand = state.kind === 'reviewing' ? state.commandText : undefined;

  return (
    <div className="flex h-[100dvh] w-full max-w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      <AiStatusBar state={state} />

      <main className="flex min-h-0 flex-1 lg:flex-row">
        <DocumentEditor
          title={title}
          file={selectedFile}
          error={error}
          aiState={state}
          onTitleChange={setTitle}
          onSelectFile={handleSelectFile}
          onSave={handleSave}
          onDownload={handleDownload}
        />

        <EditPlanSheet
          plan={reviewingPlan}
          commandText={reviewingCommand}
          onApprove={approve}
          onReject={reject}
        />
      </main>

      <MobileCommandButton
        aiState={state}
        onCommand={handleVoiceCommand}
        onRecordingChange={setRecording}
      />
    </div>
  );
}

export default EditorPage;
