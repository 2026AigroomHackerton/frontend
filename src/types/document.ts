export type FileKind = 'hwpx' | 'hwp' | 'unsupported' | null;

export interface ParsedDocument {
  text: string;
  sourceFiles: string[];
}

export interface DetectedField {
  id: string;
  label: string;
  type: string;
  lineIndex: number;
  originalLine: string;
  suggestedValue: string;
}

export type EditOperationType =
  | 'replace_text'
  | 'replace_section'
  | 'rewrite_document'
  | 'append_paragraph'
  | 'update_field'
  | 'update_table_text'
  | 'update_table_cell';

export interface EditOperationTarget {
  label: string;
  lineStart?: number;
  lineEnd?: number;
}

export interface EditOperation {
  operationId: string;
  type: EditOperationType;
  target: EditOperationTarget;
  beforeText: string;
  afterText: string;
  reason: string;
  confidence: number;
  requiresUserConfirm: boolean;
}

export interface AnswerSuggestion {
  id: string;
  question: string;
  suggestion: string;
  referenceSources: string[];
}

export interface CommandEditResult {
  summary: string;
  editOperations: EditOperation[];
  previewText: string;
  warnings: string[];
}
