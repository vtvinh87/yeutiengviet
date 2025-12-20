import { GoogleGenAI } from "@google/genai";

/**
 * Khởi tạo GoogleGenAI client instance.
 * Hỗ trợ lấy API Key từ process.env.API_KEY (môi trường Dev/System) 
 * và import.meta.env.VITE_API_KEY (môi trường Vite/Netlify) để tránh lỗi undefined.
 */
export const getAiInstance = () => {
  let apiKey = '';

  // 1. Thử lấy từ process.env.API_KEY (Ưu tiên theo yêu cầu môi trường hiện tại)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Bỏ qua lỗi nếu process không được định nghĩa
  }

  // 2. Nếu chưa có, thử lấy từ import.meta.env.VITE_API_KEY (Cho deployment Netlify/Vite)
  if (!apiKey) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY;
      }
    } catch (e) {
      // Bỏ qua lỗi nếu import.meta không được định nghĩa
    }
  }
  
  if (!apiKey) {
    console.warn("API Key is missing (checked process.env.API_KEY and VITE_API_KEY). AI features will be disabled.");
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};