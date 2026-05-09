export type DocumentSourceType = 'camera' | 'upload' | 'archive' | 'external' | 'manual';

export type DocumentFileType = 'ocr' | 'hwpx' | 'hwp' | 'txt' | 'external';

export type DocumentStatus = 'draft' | 'ai_suggested' | 'completed' | 'saved';

export type DocumentPermission = 'read' | 'edit' | 'owner';

export type FolderColor = 'blue' | 'slate' | 'indigo' | 'amber';

export interface Folder {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  updatedAt: string;
  ownerType: 'personal' | 'group';
  ownerId: string;
  parentId?: string;
  color?: FolderColor;
}

export interface SharedGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  documentCount: number;
  role: 'owner' | 'editor' | 'viewer';
  updatedAt: string;
}

export interface WorkspaceDocument {
  id: string;
  title: string;
  description: string;
  folderId: string;
  groupId?: string;
  sourceType: DocumentSourceType;
  fileType: DocumentFileType;
  status: DocumentStatus;
  permission?: DocumentPermission;
  sharedBy?: string;
  updatedAt: string;
  hasAiSuggestion: boolean;
}
