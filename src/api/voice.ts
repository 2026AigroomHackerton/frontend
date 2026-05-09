// 명세 7.3 음성/STT API. MVP stub.

export interface SaveVoiceCommandInput {
  documentId: string;
  transcript: string;
  inputType: 'voice' | 'text';
}

export async function transcribeAudio(audio: Blob, documentId: string) {
  console.log('TODO: POST /api/voice/transcribe', { documentId, size: audio.size });
  return { voiceCommandId: `mock-voice-${Date.now()}`, transcript: '' };
}

export async function saveVoiceCommand(input: SaveVoiceCommandInput) {
  console.log('TODO: POST /api/voice/commands', input);
  return { voiceCommandId: `mock-voice-${Date.now()}` };
}
