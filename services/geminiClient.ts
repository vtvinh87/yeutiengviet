
import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Luôn sử dụng process.env.API_KEY theo quy định của hệ thống.
 */
export const getAiInstance = () => {
  // Sử dụng trực tiếp process.env.API_KEY theo hướng dẫn
  // Không thực hiện kiểm tra chuỗi nghiêm ngặt để tránh lỗi trong các môi trường build khác nhau
  try {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (error) {
    console.error("Yêu Tiếng Việt: Lỗi khi khởi tạo Gemini SDK:", error);
    return null;
  }
};
