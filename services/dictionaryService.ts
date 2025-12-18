
import { Type } from "@google/genai";
import { ai } from "./geminiClient";
import { DictionaryEntry } from "../types";

export const dictionaryService = {
  async defineWord(word: string): Promise<DictionaryEntry> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Giải nghĩa từ "${word}" cho trẻ em tiểu học.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            type: { type: Type.STRING, description: "Loại từ (Danh từ, Động từ, v.v.)" },
            category: { type: Type.STRING },
            phonetic: { type: Type.STRING, description: "Phiên âm tiếng Việt dễ hiểu (ví dụ: vũ trụ -> vũ trụ hoặc v-ũ-tr-ụ)" },
            definition: { type: Type.STRING },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING, description: "Dùng để tạo hình ảnh minh họa cho từ này" }
          },
          required: ["word", "type", "category", "phonetic", "definition", "examples", "synonyms", "imagePrompt"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      // Using a slightly better placeholder for images or actual search result
      image: `https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=600&auto=format&fit=crop` 
    };
  }
};
