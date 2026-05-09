import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AiStatusBar from "../components/document/AiStatusBar";
import DocumentEditor from "../components/document/DocumentEditor";
import type { RhwpViewerHandle } from "../components/document/RhwpViewer";
import EditPlanSheet from "../components/document/EditPlanSheet";
import MobileCommandButton from "../components/document/MobileCommandButton";
import { useAiEditFlow } from "../hooks/useAiEditFlow";
import {
  getDocument,
  getDocumentFile,
  replaceDocumentFile,
  saveDocumentText,
  uploadDocument,
} from "../api/documents";
import { parseHwpxFile } from "../lib/hwpxParser";
import { applyEditOperationsToHwpxFile } from "../lib/hwpxWriter";
import { sendKakaoTextShare } from "../lib/kakaoShare";
import { downloadTextFile } from "../utils/fileUtils";
import { ApiError } from "../api/client";

interface RouteState {
  file?: File;
  meta?: { id: number; title?: string };
}

function EditorPage() {
  const params = useParams<{ documentId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as RouteState | null) ?? null;

  const [file, setFile] = useState<File | null>(routeState?.file ?? null);
  const [title, setTitle] = useState<string>(
    routeState?.meta?.title ??
      (routeState?.file
        ? routeState.file.name.replace(/\.(hwpx|hwp)$/i, "")
        : ""),
  );
  const [persistedDocumentId, setPersistedDocumentId] = useState<string>(
    params.documentId ?? routeState?.meta?.id?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [viewerReloadKey, setViewerReloadKey] = useState(0);
  const [viewerInstanceKey, setViewerInstanceKey] = useState(0);
  const documentTextRef = useRef<string>("");
  const fileRef = useRef<File | null>(routeState?.file ?? null);
  const viewerRef = useRef<RhwpViewerHandle | null>(null);

  const documentId = params.documentId ?? persistedDocumentId;

  useEffect(() => {
    if (routeState?.file || routeState?.meta) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // Only consume route state once on entry. Keeping it causes edited files to be
    // overwritten by the original route-state file after the first AI apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    if (params.documentId && params.documentId !== persistedDocumentId) {
      setPersistedDocumentId(params.documentId);
    }
  }, [params.documentId, persistedDocumentId]);

  useEffect(() => {
    if (!documentId || routeState?.file) return;
    const numericId = Number(documentId);
    if (!Number.isFinite(numericId)) return;

    let cancelled = false;
    (async () => {
      try {
        const doc = await getDocument(numericId);
        if (cancelled) return;
        const nextTitle =
          doc.metadata?.title ||
          doc.metadata?.original_filename?.replace(/\.[^.]+$/i, "") ||
          `문서 ${numericId}`;
        setTitle(nextTitle);
        documentTextRef.current =
          doc.text?.extracted_text ?? doc.text?.cleaned_text ?? "";
        try {
          const originalFile = await getDocumentFile(
            numericId,
            doc.metadata?.original_filename || `${nextTitle}.hwpx`,
          );
          if (!cancelled) {
            setFile(originalFile);
            setEditedText(null);
          }
        } catch {
          if (!cancelled) {
            const fallbackText = documentTextRef.current.trim();
            if (fallbackText) {
              setFile(null);
              setEditedText(fallbackText);
              setSaveMessage("원본 파일이 없어 텍스트 문서로 열었습니다.");
            } else {
              setError("문서 파일을 불러오지 못했습니다. 다시 시도해주세요.");
            }
          }
        }
      } catch (caught) {
        if (cancelled) return;
        const message =
          caught instanceof ApiError
            ? caught.message
            : "문서를 불러오지 못했습니다.";
        setError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId, routeState?.file]);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    const currentFile = file;

    async function extractText() {
      try {
        const parsed = await parseHwpxFile(currentFile);
        if (!cancelled && parsed.text) {
          documentTextRef.current = documentTextRef.current || parsed.text;
        }
      } catch {
        // The visual HWPX viewer can still work even if text extraction fails.
      }
    }

    void extractText();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const getDocumentText = useCallback(() => documentTextRef.current, []);

  const {
    state,
    setRecording,
    startCommand,
    approve,
    reject,
    error: aiError,
  } = useAiEditFlow({
    documentId,
    getDocumentText,
    onApplied: async (updatedText, editOperations, appliedDocumentId) => {
      documentTextRef.current = updatedText;
      const currentFile = fileRef.current;
      if (!currentFile) {
        setEditedText(updatedText);
        return;
      }

      try {
        const rewrittenFile = await applyEditOperationsToHwpxFile(
          currentFile,
          editOperations,
          updatedText,
        );
        setFile(rewrittenFile);
        setEditedText(null);
        setViewerReloadKey((prev) => prev + 1);
        setViewerInstanceKey((prev) => prev + 1);
        const numericId = Number(appliedDocumentId);
        if (Number.isFinite(numericId)) {
          await replaceDocumentFile(numericId, rewrittenFile);
        }
        setSaveMessage("HWPX 저장되었습니다.");
      } catch (caught) {
        console.warn("HWPX 재빌드 실패", caught);
        const message =
          caught instanceof Error
            ? caught.message
            : "HWPX 수정본을 만들지 못했습니다.";
        setError(message);
      }
    },
  });

  async function ensureDocumentForAiCommand() {
    if (documentId) return documentId;

    if (!file) {
      setError("문서를 먼저 업로드한 뒤 AI 수정 요청을 사용할 수 있습니다.");
      return null;
    }

    if (!documentTextRef.current) {
      try {
        const parsed = await parseHwpxFile(file);
        documentTextRef.current = parsed.text;
      } catch {
        documentTextRef.current = "";
      }
    }

    return `local-${Date.now()}`;
  }

  async function handleSave() {
    setError(null);
    setSaveMessage(null);

    if (!documentId && !file) {
      setError("문서 파일을 불러오지 못했습니다. 다시 시도해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      let nextDocumentId = documentId;

      if (!nextDocumentId) {
        if (!file) {
          throw new Error(
            "문서 파일을 불러오지 못했습니다. 다시 시도해주세요.",
          );
        }

        const meta = await uploadDocument({
          file,
          title: title.trim() || file.name.replace(/\.(hwpx|hwp)$/i, ""),
          sourceType: "upload",
        });

        nextDocumentId = String(meta.id);
        setPersistedDocumentId(nextDocumentId);
      }

      const numericId = Number(nextDocumentId);
      if (!Number.isFinite(numericId)) {
        throw new Error("문서 ID가 유효하지 않습니다.");
      }

      if (!documentTextRef.current && file) {
        try {
          const parsed = await parseHwpxFile(file);
          documentTextRef.current = parsed.text;
        } catch {
          documentTextRef.current = "";
        }
      }

      await saveDocumentText(numericId, documentTextRef.current);
      setSaveMessage("문서가 성공적으로 저장되었습니다.");
      navigate("/archive/all", { replace: true });
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "문서 저장 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function getCurrentHwpxFile() {
    if (!file) return;
    const baseName =
      title.trim() || file.name.replace(/\.(hwpx|hwp)$/i, "") || "edited";
    return viewerRef.current?.exportHwpxFile(`${baseName}.hwpx`) ?? file;
  }

  async function getCurrentPdfFile() {
    if (!file) return;
    const baseName =
      title.trim() || file.name.replace(/\.(hwpx|hwp)$/i, "") || "document";
    return viewerRef.current?.exportPdfFile(`${baseName}.pdf`);
  }

  async function handleDownload() {
    const baseName =
      title.trim() || file?.name.replace(/\.(hwpx|hwp)$/i, "") || "edited";
    const text = documentTextRef.current;
    if (!file) {
      if (text) downloadTextFile(text, `${baseName}.txt`);
      return;
    }
    const downloadFile = (await getCurrentHwpxFile()) ?? file;
    const url = URL.createObjectURL(downloadFile);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFile.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportPdf() {
    if (!file) return;
    setError(null);
    setIsExporting(true);
    try {
      await shareCurrentPdfWithKakao();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "PDF 내보내기를 완료하지 못했습니다.";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }

  async function shareCurrentPdfWithKakao() {
    const shareFile = await getCurrentPdfFile();
    if (!shareFile) throw new Error("No document to convert to PDF.");

    await sendKakaoTextShare({
      title: title || shareFile.name,
      description: "localhost Kakao share test",
    });
    setSaveMessage("Opened Kakao share for the PDF export.");
  }

  async function handleShareKakao() {
    setError(null);
    setIsExporting(true);
    try {
      if (!file) {
        const text = documentTextRef.current.trim();
        if (text && navigator.share) {
          await navigator.share({
            title: title || "AI 문서",
            text,
          });
          return;
        }
        setError("공유할 파일이 없습니다. 원본 HWPX 파일이 있는 문서에서 다시 시도해주세요.");
        return;
      }

      await shareCurrentPdfWithKakao();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "카카오톡 공유를 시작하지 못했습니다.";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleVoiceCommand(
    transcript: string,
    inputType: "voice" | "text",
  ) {
    const targetDocumentId = await ensureDocumentForAiCommand();
    if (!targetDocumentId) {
      setError("문서를 먼저 업로드한 뒤 AI 수정 요청을 사용할 수 있습니다.");
      return;
    }
    setError(null);
    void startCommand(transcript, inputType, targetDocumentId);
  }

  const reviewingPlan = state.kind === "reviewing" ? state.plan : null;
  const reviewingCommand =
    state.kind === "reviewing" ? state.commandText : undefined;
  const canSave = Boolean(file || documentId);

  return (
    <div className="flex h-[100dvh] w-full max-w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      <AiStatusBar state={state} />

      <main className="flex min-h-0 flex-1 lg:flex-row">
        <DocumentEditor
          title={title}
          file={file}
          editedText={editedText}
          viewerReloadKey={viewerReloadKey}
          viewerInstanceKey={viewerInstanceKey}
          viewerRef={viewerRef}
          error={error ?? aiError}
          aiState={state}
          canSave={canSave}
          isSaving={isSaving}
          isExporting={isExporting}
          saveMessage={saveMessage}
          onTitleChange={setTitle}
          onSave={handleSave}
          onDownload={handleDownload}
          onExportPdf={handleExportPdf}
          onShareKakao={handleShareKakao}
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
