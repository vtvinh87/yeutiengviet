
import { Type } from "@google/genai";
import { DictionaryEntry } from "../types";
import { createAiInstance } from "./geminiClient";

export const dictionaryService = {
  async defineWord(word: string): Promise<DictionaryEntry> {
    try {
      const ai = createAiInstance();
      
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

      // 2. Use a seeded placeholder instead of AI Image Generation to avoid API restrictions
      const finalImageUrl = `https://picsum.photos/seed/${encodeURIComponent(word + "school")}/600/600`;

      return {
        ...data,
        image: finalImageUrl
      };
    } catch (error: any) {
      console.error("Dictionary Service Error:", error);
      
      // Handle the case where the key might be missing/invalid mid-session
      if (error.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }

      return {
        word: word,
        type: "Từ vựng",
        category: "Chưa phân loại",
        phonetic: "...",
        definition: "Hệ thống AI hiện đang bận hoặc cần cập nhật API Key. Bé hãy nhờ ba mẹ kiểm tra hoặc thử lại sau nhé!",
        examples: ["Ví dụ đang được cập nhật..."],
        synonyms: [],
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop"
      };
    }
  }
};
