import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Sử dụng import.meta.env.VITE_API_KEY cho môi trường Vite.
 * Trả về null nếu không có key để các service khác có thể fallback.
 */
export const getAiInstance = () => {
  const apiKey = (import.meta as any).env.VITE_API_KEY;
  
  if (!apiKey) {
    console.warn("API Key is missing (VITE_API_KEY). AI features will be disabled.");
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};