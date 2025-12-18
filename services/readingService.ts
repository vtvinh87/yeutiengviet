
import { Type } from "@google/genai";
import { ai } from "./geminiClient";

export const readingService = {
  async generateNextExercise(): Promise<{ title: string; text: string; imagePrompt: string }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Tạo một bài tập đọc ngắn (khoảng 20-30 từ) cho học sinh tiểu học. Nội dung về thiên nhiên, trường học hoặc tình cảm gia đình. Trả về JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["title", "text", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async analyzePronunciation(audioBase64: string, targetText: string): Promise<any> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64,
          },
        },
        {
          text: `Bạn là một Chuyên gia Thính học và Ngôn ngữ học Tiếng Việt cực kỳ khắt khe. 
          Nhiệm vụ: Phân tích giọng đọc của học sinh dựa trên văn bản mục tiêu: "${targetText}".

          Yêu cầu bắt buộc kiểm tra các lỗi âm vị học (Phonetic Errors):
          1. Phụ âm đầu L và N: "líu lo" không được phép đọc thành "níu no". Nếu nhầm lẫn, đánh dấu "incorrect".
          2. Phụ âm đầu R, D, GI: "rực rỡ" không được phép đọc thành "dực dỡ" hay "giực giỡ". Phải có độ rung nhẹ của chữ R. Nếu sai, đánh dấu "incorrect".
          3. Phụ âm đầu TR và CH: "trên cành" không được đọc thành "chên cành".
          4. Phụ âm đầu S và X: "sau dãy núi" không được đọc thành "xau dãy núi".
          5. Các dấu thanh: Sắc, Huyền, Hỏi, Ngã, Nặng. Sai dấu thanh là lỗi nghiêm trọng, đánh dấu "incorrect".

          Cấu trúc phản hồi:
          - So sánh từng từ trong file âm thanh với từng từ trong văn bản gốc.
          - Nếu từ đó bị đọc sai phụ âm đầu, vần, hoặc dấu thanh -> status: "incorrect".
          - Nếu từ đó đọc chuẩn xác hoàn toàn -> status: "correct".
          - Nếu bỏ qua từ -> status: "skipped".
          
          Hãy đưa ra nhận xét cụ thể về lỗi (ví dụ: "Con cần chú ý phát âm chữ L và R rõ hơn nhé").`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Điểm từ 0 đến 5 dựa trên độ chính xác âm vị" },
            accuracy: { type: Type.NUMBER, description: "Phần trăm từ đọc đúng" },
            speed: { type: Type.STRING, description: "Chậm, Vừa, hoặc Nhanh" },
            feedback: { type: Type.STRING, description: "Lời khuyên cá nhân hóa tập trung vào các lỗi phát âm cụ thể" },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  status: { type: Type.STRING, description: "correct, incorrect, hoặc skipped" }
                },
                required: ["text", "status"]
              }
            }
          },
          required: ["score", "accuracy", "speed", "feedback", "words"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }
};
