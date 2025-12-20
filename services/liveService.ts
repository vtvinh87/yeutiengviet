
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decodeBase64 } from './audioUtils';
import { getAiInstance } from './geminiClient';

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
  onAudioChunk: (data: Uint8Array) => void;
  onInterrupted: () => void;
  onTranscription: (text: string, isUser: boolean) => void;
  onStatusChange: (status: 'connecting' | 'open' | 'closed' | 'error' | 'unauthorized') => void;
}

export class LiveTeacherSession {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;

  async connect(handlers: LiveSessionHandlers) {
    const aiClient = getAiInstance();
    
    if (!aiClient) {
      handlers.onStatusChange('error');
      return;
    }

    handlers.onStatusChange('connecting');

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.sessionPromise = aiClient.live.connect({
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
            // Passing raw data to avoid recreating AudioContext inside onmessage
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const audioData = decodeBase64(message.serverContent.modelTurn.parts[0].inlineData.data);
              handlers.onAudioChunk(audioData);
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
          systemInstruction: 'Bạn là cô giáo dạy Tiếng Việt hiền hậu cho học sinh tiểu học. Hãy trả lời các bé thật dễ mến, ngắn gọn, và khuyến khích các bé học tập. Khi bé hỏi hoặc nói xong, hãy chờ một lát rồi mới trả lời để tạo cảm giác tự nhiên.'
        }
      });
    } catch (err) {
      console.error("Connection failed", err);
      handlers.onStatusChange('error');
    }
  }

  disconnect() {
    this.scriptProcessor?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.inputAudioContext?.close();
    this.sessionPromise?.then(s => s.close());
  }
}
