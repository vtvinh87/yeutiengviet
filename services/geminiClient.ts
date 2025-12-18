
import { GoogleGenAI } from "@google/genai";

// Hàm hỗ trợ lấy AI instance an toàn
export const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'MISSING_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Giữ lại instance cũ để tương thích ngược nhưng sẽ trả về null nếu key sai
export const ai = getAiClient() as any;
