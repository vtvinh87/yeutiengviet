
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decodeBase64, decodeAudioData } from './audioUtils';

// Helper for Base64 encoding
export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface LiveSessionHandlers {
  onAudioChunk: (buffer: AudioBuffer) => void;
  onInterrupted: () => void;
  onTranscription: (text: string, isUser: boolean) => void;
  onStatusChange: (status: 'connecting' | 'open' | 'closed' | 'error') => void;
}

export class LiveTeacherSession {
  private ai: any;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(handlers: LiveSessionHandlers) {
    handlers.onStatusChange('connecting');

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          handlers.onStatusChange('open');
          const source = this.inputAudioContext!.createMediaStreamSource(this.stream!);
          this.scriptProcessor = this.inputAudioContext!.createScriptProcessor(4096, 1, 1);
          
          this.scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const base64Data = encodeBase64(new Uint8Array(int16.buffer));
            
            this.sessionPromise?.then(session => {
              session.sendRealtimeInput({
                media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(this.scriptProcessor);
          this.scriptProcessor.connect(this.inputAudioContext!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            const audioData = decodeBase64(message.serverContent.modelTurn.parts[0].inlineData.data);
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const buffer = await decodeAudioData(audioData, ctx, 24000, 1);
            handlers.onAudioChunk(buffer);
          }

          if (message.serverContent?.interrupted) {
            handlers.onInterrupted();
          }

          if (message.serverContent?.inputTranscription) {
            handlers.onTranscription(message.serverContent.inputTranscription.text, true);
          }
          if (message.serverContent?.outputTranscription) {
            handlers.onTranscription(message.serverContent.outputTranscription.text, false);
          }
        },
        onerror: (e: any) => {
          console.error("Live session error:", e);
          handlers.onStatusChange('error');
        },
        onclose: () => {
          handlers.onStatusChange('closed');
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: 'Bạn là cô giáo dạy Tiếng Việt hiền hậu cho học sinh tiểu học. Hãy trả lời các bé thật dễ mến, ngắn gọn, và khuyến khích các bé học tập.'
      }
    });
  }

  disconnect() {
    this.scriptProcessor?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.inputAudioContext?.close();
    this.sessionPromise?.then(s => s.close());
  }
}
