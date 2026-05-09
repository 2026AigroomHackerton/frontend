import type { CommandEditResult, EditOperation } from "../types/document";

type OpenAiTextPart = { type: "text"; text: string };
type OpenAiImagePart = {
  type: "image_url";
  image_url: { url: string; detail?: "auto" | "low" | "high" };
};
type OpenAiContentPart = OpenAiTextPart | OpenAiImagePart;

interface OpenAiChatMessage {
  role: "system" | "user";
  content: string | OpenAiContentPart[];
}

interface OpenAiChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface AiEditPlanPayload {
  summary?: string;
  edit_operations?: Array<{
    operation_id?: string;
    type?: string;
    target?:
      | string
      | { label?: string; line_start?: number; line_end?: number };
    before_text?: string;
    after_text?: string;
    reason?: string;
    requires_user_confirm?: boolean;
    confidence?: number;
  }>;
  preview_text?: string;
  warnings?: string[];
}
const SYSTEM_PROMPT = `
너는 HWPX 한국어 문서를 자연어 명령에 따라 수정하는 안전한 문서 편집 엔진이다.
반드시 JSON만 반환한다. 마크다운, 설명 문장, 코드블록은 금지한다.

이 시스템은 HWPX 원본 XML 구조를 유지해야 한다.
따라서 문서 구조를 새로 만들거나 바꾸지 말고, 기존 문서 안에 실제로 존재하는 텍스트만 찾아서 교체해야 한다.

[가장 중요한 원칙]
- HWPX 구조를 깨뜨리면 안 된다.
- 새 문단을 추가하지 않는다.
- 새 표를 추가하지 않는다.
- 새 제목 블록을 추가하지 않는다.
- 새 번호 목록을 만들지 않는다.
- XML 태그를 만들지 않는다.
- HTML 태그를 만들지 않는다.
- 마크다운 문법을 넣지 않는다.
- 문단 수와 줄 수를 크게 늘리지 않는다.
- 문서 전체를 하나의 operation으로 갈아끼우지 않는다.

[1단계: 사용자의 의도 파악]
명령 문장을 보고 다음 중 어떤 의도인지 판단한다.

A. 단어/숫자/짧은 구절 교체
예: "2026을 2027로", "체육을 미술로"

B. 특정 항목/문단 교체
예: "장소를 부산교육청으로 바꿔", "준비물 항목을 새로 써줘"

C. 전체 내용 주제 변경
예: "내용을 현장체험학습으로 바꿔줘", "환경정화 활동 안내문으로 바꿔줘"

D. 내용 추가/확장
예: "유의사항 단락 추가해줘", "참가비 안내 더 자세히"

E. 백지에서 새로 작성
예: "안내문을 처음부터 새로 만들어줘"

[2단계: 의도별 처리 방식]

A. 단어/숫자/짧은 구절 교체
- type은 replace_text를 사용한다.
- before_text는 원문에 실제로 존재하는 단어/숫자/짧은 구절이어야 한다.
- after_text는 교체 후 단어/숫자/짧은 구절이어야 한다.

B. 특정 항목/문단 교체
- type은 replace_text 또는 replace_section을 사용한다.
- before_text는 원문에 실제로 존재하는 항목 또는 문단 전체여야 한다.
- after_text는 before_text와 비슷한 줄 수와 형식을 유지해야 한다.
- 번호, 머리표, 콜론(:), 괄호, 표기 형식은 최대한 유지한다.

C. 전체 내용 주제 변경
- rewrite_document를 절대 사용하지 않는다.
- 문서 전체를 새로 작성하지 않는다.
- 기존 문서에 있는 제목, 일시, 장소, 대상, 준비물, 유의사항 등 실제 존재하는 항목만 찾아서 replace_text 또는 replace_section 여러 개로 나누어 수정한다.
- 기존에 없는 항목은 새로 만들지 않는다.
- 제목과 본문이 어긋나지 않도록, 바꿀 수 있는 기존 항목들만 일관되게 수정한다.

D. 내용 추가/확장
- append_paragraph 또는 insert_paragraph를 절대 사용하지 않는다.
- 새 문단을 추가하지 않는다.
- 기존에 "유의사항", "안내", "비고", "기타", "참고사항" 같은 항목이 있으면 그 항목의 텍스트만 replace_section으로 수정한다.
- 안전하게 수정할 기존 항목을 찾을 수 없으면 edit_operations를 빈 배열로 반환한다.

E. 백지에서 새로 작성
- 새 문서를 만들지 않는다.
- rewrite_document를 절대 사용하지 않는다.
- 기존 문서에 빈칸, 작성 예시, 입력란, placeholder가 있는 경우에만 update_field 또는 replace_text로 채운다.
- 안전하게 수정할 위치가 없으면 edit_operations를 빈 배열로 반환한다.

[3단계: edit_operations 작성 규칙]
사용 가능한 type은 아래 3개뿐이다.
- replace_text
- replace_section
- update_field

절대 사용하면 안 되는 type:
- rewrite_document
- append_paragraph
- insert_paragraph
- update_table_cell

operation 작성 규칙:
- before_text는 반드시 current_text 안에서 실제로 검색 가능한 텍스트여야 한다.
- before_text를 임의로 요약하거나 새로 만들지 않는다.
- before_text의 띄어쓰기, 줄바꿈, 문장부호를 원문과 다르게 바꾸지 않는다.
- before_text를 찾을 수 없으면 해당 operation은 만들지 않는다.
- after_text는 before_text와 비슷한 길이와 줄 구조를 유지한다.
- before_text가 한 줄이면 after_text도 가능하면 한 줄로 작성한다.
- before_text가 번호 형식이면 after_text도 같은 번호 형식을 유지한다.
- before_text가 머리표 형식이면 after_text도 같은 머리표 형식을 유지한다.
- before_text가 표처럼 보이면 열 구분과 줄 구조를 최대한 유지한다.
- 사용자가 지정하지 않은 연락처, 인명, 금액, 기관명, 날짜는 임의로 만들지 말고 원문 값을 유지한다.
- 사용자가 명시한 날짜, 숫자, 장소, 활동명은 정확히 반영한다.
- after_text에 XML 태그, HTML 태그, 마크다운 문법을 넣지 않는다.
- preview_text는 모든 edit_operations를 적용한 후의 최종 문서 전체 텍스트를 담는다.

[안전하지 않은 경우]
다음 경우에는 억지로 수정하지 말고 edit_operations를 빈 배열로 반환한다.
- before_text를 current_text에서 정확히 찾을 수 없는 경우
- 새 문단을 추가해야만 처리 가능한 경우
- 표 구조를 바꿔야 하는 경우
- 문서 전체를 새로 만들어야 하는 경우
- 기존 항목이 없어 안전하게 수정할 위치가 없는 경우

이때 warnings에는 아래 값 중 적절한 것을 넣는다.
- "NO_SAFE_TARGET_FOUND"
- "BEFORE_TEXT_NOT_FOUND"
- "STRUCTURE_CHANGE_REQUIRED"
- "TABLE_STRUCTURE_EDIT_SKIPPED"
- "NEW_DOCUMENT_CREATION_SKIPPED"

반환 JSON 스키마:
{
  "summary": "수정 요약",
  "hwpx_safe": true,
  "edit_operations": [
    {
      "operation_id": "op_001",
      "type": "replace_text | replace_section | update_field",
      "target": {
        "label": "수정 대상 이름",
        "line_start": 0,
        "line_end": 0
      },
      "before_text": "current_text 안에 실제로 존재하는 정확한 텍스트",
      "after_text": "기존 구조를 유지한 수정 후 텍스트",
      "reason": "수정 이유",
      "requires_user_confirm": true,
      "confidence": 0.85
    }
  ],
  "preview_text": "모든 edit_operations를 적용한 최종 문서 텍스트 전체",
  "warnings": []
}

중요:
- JSON 객체 하나만 반환한다.
- rewrite_document는 절대 사용하지 않는다.
- append_paragraph는 절대 사용하지 않는다.
- insert_paragraph는 절대 사용하지 않는다.
- 문서 전체를 하나의 operation으로 교체하지 않는다.
- 원문에 없는 before_text를 만들지 않는다.
- HWPX 구조 변경이 필요한 작업은 operation으로 만들지 않는다.
`;
export interface CommandEditInput {
  documentId: string;
  documentText?: string;
  commandText: string;
  scope?: string;
}

export interface ApplyEditInput {
  documentId: number | string;
  editOperations: EditOperation[];
  currentText: string;
  previewText?: string;
}

function getOpenAiConfig() {
  const env = import.meta.env;

  const clean = (value: string | undefined) =>
    value?.trim().replace(/^['"]|['"]$/g, "");

  return {
    apiKey: clean(
      env.VITE_OPENAI_API_KEY || env.VITE_OPENAI_KEY || env.VITE_OPENAI_TOKEN,
    ),
    model:
      clean(env.VITE_OPENAI_MODEL || env.VITE_OPENAI_MODEL_TEXT) ||
      "gpt-4o-mini",
  };
}

function mapEditOperation(
  op: NonNullable<AiEditPlanPayload["edit_operations"]>[number],
  index: number,
): EditOperation {
  const targetLabel =
    typeof op.target === "string" ? op.target : (op.target?.label ?? "蹂몃Ц");
  const lineStart =
    typeof op.target === "object" ? op.target?.line_start : undefined;
  const lineEnd =
    typeof op.target === "object" ? op.target?.line_end : undefined;

  return {
    operationId: op.operation_id || `op_${String(index + 1).padStart(3, "0")}`,
    type: (op.type || "replace_text") as EditOperation["type"],
    target: { label: targetLabel, lineStart, lineEnd },
    beforeText: op.before_text || "",
    afterText: op.after_text || "",
    reason: op.reason || "?ъ슜???뚯꽦 紐낅졊???곕Ⅸ ?섏젙",
    confidence: op.confidence ?? 0.7,
    requiresUserConfirm: op.requires_user_confirm ?? true,
  };
}

function extractJsonObject(content: string): AiEditPlanPayload {
  try {
    return JSON.parse(content) as AiEditPlanPayload;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenAI ?묐떟?먯꽌 JSON??李얠? 紐삵뻽?듬땲??");
    return JSON.parse(match[0]) as AiEditPlanPayload;
  }
}

function buildUserPrompt(input: CommandEditInput): string {
  return JSON.stringify(
    {
      document_id: input.documentId,
      scope: input.scope ?? "document",
      command_text: input.commandText,
      document_text: input.documentText ?? "",
    },
    null,
    2,
  );
}

async function requestOpenAiEditPlan(
  input: CommandEditInput,
): Promise<AiEditPlanPayload> {
  const { apiKey, model } = getOpenAiConfig();
  if (!apiKey) {
    throw new Error(
      ".env??VITE_OPENAI_API_KEY 媛믪씠 ?놁뒿?덈떎. 媛믪쓣 異붽?????Vite dev server瑜??ъ떆?묓븯?몄슂.",
    );
  }

  const messages: OpenAiChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(input) },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI ?붿껌 ?ㅽ뙣 (${response.status}): ${message}`);
  }

  const data = (await response.json()) as OpenAiChatCompletion;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI ?묐떟??鍮꾩뼱 ?덉뒿?덈떎.");
  return extractJsonObject(content);
}

export async function commandEdit(
  input: CommandEditInput,
): Promise<CommandEditResult> {
  const plan = await requestOpenAiEditPlan(input);
  const editOperations = (plan.edit_operations ?? []).map(mapEditOperation);

  return {
    summary: plan.summary ?? "AI ?섏젙?덉쓣 留뚮뱾?덉뒿?덈떎.",
    editOperations,
    previewText:
      plan.preview_text ??
      applyOperationsToText(input.documentText ?? "", editOperations),
    warnings: plan.warnings ?? [],
  };
}

export async function applyEdit(input: ApplyEditInput) {
  const updatedText = applyOperationsToText(
    input.currentText,
    input.editOperations,
    input.previewText,
  );

  return { versionId: `local-${Date.now()}`, updatedText };
}

function applyOperationsToText(
  currentText: string,
  editOperations: EditOperation[],
  previewText?: string,
): string {
  let updatedText = currentText;
  let appliedCount = 0;

  for (const op of editOperations) {
    const targetLabel = op.target.label.toLowerCase();
    const shouldInsertAtTop =
      op.type === "insert_paragraph" &&
      (/top|start|beginning/.test(targetLabel) || op.target.lineStart === 0);

    if (shouldInsertAtTop && op.afterText) {
      updatedText = updatedText
        ? `${op.afterText}\n\n${updatedText}`
        : op.afterText;
      appliedCount += 1;
    } else if (op.beforeText && updatedText.includes(op.beforeText)) {
      updatedText = updatedText.replaceAll(op.beforeText, op.afterText);
      appliedCount += 1;
    } else if (
      (op.type === "append_paragraph" || op.type === "insert_paragraph") &&
      op.afterText
    ) {
      updatedText = updatedText
        ? `${updatedText}\n\n${op.afterText}`
        : op.afterText;
      appliedCount += 1;
    }
  }

  if (appliedCount === 0 && previewText?.trim()) return previewText;
  return updatedText;
}
