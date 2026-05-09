// 명세 7.4 AI 편집 API. MVP stub — 실제 LLM 연결 시 commandEdit이 EditOperation[]을 받아옴.

import type {
  AnswerSuggestion,
  CommandEditResult,
  DetectedField,
  EditOperation,
} from "../types/document";

export interface CommandEditInput {
  documentId: string;
  documentText: string;
  commandText: string;
  scope?: "full" | "section";
  documentType?: string;
}

export async function commandEdit(
  input: CommandEditInput,
): Promise<CommandEditResult> {
  console.log("TODO: POST /api/ai/command-edit", input);

  // MVP: thinking 상태 시각 효과 시연용 인위적 지연.
  await new Promise((resolve) => setTimeout(resolve, 900));

  // MVP: 명령을 그대로 반영한 단일 mock EditOperation. 실제 백엔드는 LLM JSON 응답.
  const lines = input.documentText.split(/\r?\n/);
  const nonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);
  const targetLine = nonEmptyIndex >= 0 ? nonEmptyIndex : 0;
  const before = lines[targetLine] ?? "(현재 문서 본문)";
  const after = `${before || "(빈 줄)"} → ${input.commandText}`;

  return {
    summary: `명령 반영 미리보기: ${input.commandText}`,
    editOperations: [
      {
        operationId: `op-${Date.now()}`,
        type: "replace_section",
        target: {
          label: "본문 첫 단락",
          lineStart: targetLine,
          lineEnd: targetLine,
        },
        beforeText: before,
        afterText: after,
        reason: "사용자 명령에 따른 미리보기 (mock)",
        confidence: 0.5,
        requiresUserConfirm: true,
      },
    ],
    previewText: input.documentText.replace(before, after),
    warnings: ["MVP mock 응답입니다. 실제 백엔드 연결이 필요합니다."],
  };
}

export interface ApplyEditInput {
  documentId: string;
  editOperations: EditOperation[];
  currentText: string;
}

export async function applyEdit(input: ApplyEditInput) {
  console.log("TODO: POST /api/ai/apply-edit", {
    documentId: input.documentId,
    ops: input.editOperations.length,
  });

  // MVP: applying 상태 시각 효과 시연용 인위적 지연.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // MVP: 클라이언트에서 직접 적용. 실제 백엔드는 document_versions 갱신.
  let updatedText = input.currentText;
  for (const op of input.editOperations) {
    if (op.beforeText && updatedText.includes(op.beforeText)) {
      updatedText = updatedText.replace(op.beforeText, op.afterText);
    }
  }
  return { versionId: `mock-v-${Date.now()}`, updatedText };
}

export async function analyzeFields(
  documentId: string,
): Promise<DetectedField[]> {
  console.log("TODO: POST /api/ai/analyze-fields", documentId);
  return [];
}

export interface RecommendAnswerInput {
  documentId: string;
  question: string;
  referenceScope?: string;
}

export async function recommendAnswer(
  input: RecommendAnswerInput,
): Promise<AnswerSuggestion> {
  console.log("TODO: POST /api/ai/recommend-answer", input);
  return {
    id: `ans-${Date.now()}`,
    question: input.question,
    suggestion: "",
    referenceSources: [],
  };
}
