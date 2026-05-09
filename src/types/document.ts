export interface DocumentDraft {
  title: string;
  content: string;
}

export interface AIRewriteResult {
  before: string;
  after: string;
  explanation: string;
}
