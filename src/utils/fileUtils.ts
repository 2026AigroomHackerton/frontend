import type { FileKind } from '../types/document';

export function getFileKind(file: File): FileKind {
  const name = file.name.toLowerCase();
  if (name.endsWith('.hwpx')) return 'hwpx';
  if (name.endsWith('.hwp')) return 'hwp';
  return 'unsupported';
}

export function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
