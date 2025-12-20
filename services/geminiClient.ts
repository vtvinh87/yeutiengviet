
import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Tuân thủ quy định sử dụng process.env.API_KEY.
 * Nếu API_KEY không tồn tại, trả về null để UI xử lý yêu cầu chọn khóa.
 */
export const getAiInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not defined in the environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};
