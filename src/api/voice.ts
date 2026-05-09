// 명세 7.3 / 백엔드 routers/voice.py 매핑.
import { apiRequest } from './client';

export interface SaveVoiceCommandInput {
  documentId: string;
  transcript: string;
  inputType: 'voice' | 'text' | 'audio';
}

export interface VoiceCommandRecord {
  voice_command_id: string;
  document_id: string;
  transcript: string;
  input_type: string;
  status?: string;
  created_at?: string;
}

export async function saveVoiceCommand(input: SaveVoiceCommandInput) {
  // 백엔드는 input_type을 "text" | "audio"로만 받음. "voice"는 "audio"로 매핑.
  const inputType = input.inputType === 'voice' ? 'audio' : input.inputType;
  return apiRequest<VoiceCommandRecord>('/api/voice/commands', {
    method: 'POST',
    body: {
      document_id: input.documentId,
      transcript: input.transcript,
      input_type: inputType,
    },
  });
}

export async function transcribeAudio(audio: Blob, documentId: string) {
  const fd = new FormData();
  fd.append('audio', audio, 'audio.webm');
  fd.append('document_id', documentId);

  return apiRequest<{
    voice_command_id: string;
    transcript: string;
    input_type: string;
    document_id: string;
    audio_path: string;
    status: string;
  }>('/api/voice/transcribe', {
    method: 'POST',
    formData: fd,
  });
}

export async function listVoiceCommands(documentId: string) {
  return apiRequest<{ document_id: string; commands: VoiceCommandRecord[] }>(
    '/api/voice/commands',
    { query: { document_id: documentId } },
  );
}
