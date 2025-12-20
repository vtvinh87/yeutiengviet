
import { Modality } from "@google/genai";
import { getAiInstance } from "./geminiClient";
import { decodeBase64, decodeAudioData } from "./audioUtils";

export const aiTeacherService = {
  async chat(message: string): Promise<string> {
    const aiClient = getAiInstance();
    
    if (!aiClient) {
      return "Cô chưa được kết nối với hệ thống AI (Thiếu API Key), bé thông cảm nhé!";
    }

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction: "Bạn là một cô giáo dạy Tiếng Việt hiền hậu và thông minh cho học sinh tiểu học. Hãy trả lời các bé thật dễ thương, ngắn gọn và khích lệ."
        }
      });
      return response.text || "Cô không nghe rõ, bé nói lại được không?";
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "Hệ thống đang bận, bé chờ cô một lát nhé!";
    }
  },

  async generateSpeechBuffer(text: string, ctx: AudioContext): Promise<AudioBuffer | null> {
    const aiClient = getAiInstance();
    
    if (!aiClient) {
      console.warn("Cannot generate speech: No AI Client");
      return null;
    }

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Đọc diễn cảm cho học sinh tiểu học nghe: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      return await decodeAudioData(
        decodeBase64(base64Audio),
        ctx,
        24000,
        1,
      );
    } catch (error) {
      console.error("Speech Generation Error:", error);
      return null;
    }
  },

  async speak(text: string): Promise<void> {
    try {
      // Fallback to browser TTS immediately if no AI client is available (avoid trying to create context unnecessarily)
      const aiClient = getAiInstance();
      if (!aiClient) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        window.speechSynthesis.speak(utterance);
        return;
      }

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await this.generateSpeechBuffer(text, ctx);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("Speak failed", e);
      // Ultimate fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    }
  }
};
