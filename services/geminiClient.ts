
import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Luôn sử dụng process.env.API_KEY theo quy định của hệ thống.
 */
export const getAiInstance = () => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("Yêu Tiếng Việt: API_KEY không hợp lệ hoặc chưa được cấu hình.");
    return null;
  }

  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Yêu Tiếng Việt: Lỗi khi khởi tạo Gemini SDK:", error);
    return null;
  }
};
