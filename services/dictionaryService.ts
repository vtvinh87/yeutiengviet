
import { Type } from "@google/genai";
import { DictionaryEntry } from "../types";
import { getAiInstance } from "./geminiClient";

export const dictionaryService = {
  async defineWord(word: string): Promise<DictionaryEntry> {
    const ai = getAiInstance();
    
    // Nếu không có AI, ném lỗi để UI xử lý hoặc trả về dữ liệu mẫu báo lỗi
    if (!ai) {
      return {
        word: word,
        type: "Thông báo",
        category: "Hệ thống",
        phonetic: "...",
        definition: "Chưa thiết lập API Key nên cô giáo AI không thể tra từ này được.",
        examples: ["Vui lòng kiểm tra biến môi trường VITE_API_KEY."],
        synonyms: [],
        image: "https://images.unsplash.com/photo-1555861496-0666c8981751?q=80&w=600&auto=format&fit=crop"
      };
    }
    
    try {
      // 1. Get structured definition from Gemini 3 Flash
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Giải nghĩa từ "${word}" cho trẻ em tiểu học một cách sinh động, dễ hiểu.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              type: { type: Type.STRING, description: "Loại từ (Danh từ, Động từ, v.v.)" },
              category: { type: Type.STRING },
              phonetic: { type: Type.STRING, description: "Phiên âm tiếng Việt dễ hiểu" },
              definition: { type: Type.STRING },
              examples: { type: Type.ARRAY, items: { type: Type.STRING } },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              imagePrompt: { type: Type.STRING, description: "Mô tả hình ảnh minh họa bằng tiếng Anh (ví dụ: 'a cute robot in space')" }
            },
            required: ["word", "type", "category", "phonetic", "definition", "examples", "synonyms", "imagePrompt"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');

      // 2. Generate a kid-friendly illustration
      let finalImageUrl = `https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop`;
      
      try {
        const imageResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A kid-friendly, colorful, high-quality digital illustration of: ${data.imagePrompt}. Storybook art style, clean lines, vibrant colors, educational vibe.` }]
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });

        for (const part of imageResult.candidates[0].content.parts) {
          if (part.inlineData) {
            finalImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      } catch (err) {
        console.warn("Could not generate AI image for dictionary, using fallback.", err);
      }

      return {
        ...data,
        image: finalImageUrl
      };
    } catch (error) {
      console.error("Dictionary Service Error:", error);
      return {
        word: word,
        type: "Từ vựng",
        category: "Chưa phân loại",
        phonetic: "...",
        definition: "Hệ thống AI hiện đang bận, cô chưa thể giải nghĩa từ này ngay lúc này được. Bé hãy thử lại sau nhé!",
        examples: ["Ví dụ đang được cập nhật..."],
        synonyms: [],
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop"
      };
    }
  }
};
