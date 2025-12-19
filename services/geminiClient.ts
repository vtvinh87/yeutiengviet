
import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Tuân thủ quy định sử dụng process.env.API_KEY.
 * Tạo instance mới mỗi lần gọi để đảm bảo sử dụng khóa cập nhật nhất.
 */
export const getAiInstance = () => {
  let apiKey = '';
  
  try {
    // Kiểm tra an toàn sự tồn tại của process.env
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || '';
    }
  } catch (error) {
    console.error("Yêu Tiếng Việt: Không thể truy cập process.env", error);
  }

  // Nếu khóa bị trả về là chuỗi "undefined" (thường do lỗi bundler)
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.warn("Yêu Tiếng Việt: API_KEY chưa được cấu hình trong môi trường.");
    // Vẫn trả về instance để SDK ném lỗi cụ thể nếu cần, 
    // hoặc giúp debug dễ hơn thay vì trả về null gây crash ngang.
  }

  return new GoogleGenAI({ apiKey });
};
