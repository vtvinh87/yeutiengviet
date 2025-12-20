
import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Tuân thủ quy định sử dụng process.env.API_KEY.
 * Tạo instance mới mỗi lần gọi để đảm bảo sử dụng khóa cập nhật nhất.
 */
export const getAiInstance = () => {
  // Fix: Solely rely on process.env.API_KEY and use it directly when initializing
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
