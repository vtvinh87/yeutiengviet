
import { GoogleGenAI } from "@google/genai";

/**
 * Lấy instance của GoogleGenAI một cách an toàn.
 * Không khởi tạo ngay lập tức ở cấp độ module để tránh crash trang trắng nếu Key bị thiếu.
 */
export const getAiInstance = () => {
  // Ưu tiên process.env.API_KEY theo tiêu chuẩn, 
  // nhưng cũng kiểm tra VITE_API_KEY cho các môi trường Vite/Netlify
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === 'MISSING_API_KEY' || apiKey === '') {
    console.warn("Yêu Tiếng Việt: Chưa cấu hình API_KEY. Chế độ dự phòng (Offline) đã được kích hoạt.");
    return null;
  }

  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Yêu Tiếng Việt: Lỗi khi khởi tạo Gemini SDK:", error);
    return null;
  }
};

// Xuất một proxy object hoặc giữ hàm getter để các service sử dụng
export const ai = null; // Không dùng biến static này nữa, dùng getAiInstance()
