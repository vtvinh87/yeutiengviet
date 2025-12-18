
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("CẢNH BÁO: Không tìm thấy API_KEY trong môi trường. Các tính năng AI sẽ không hoạt động.");
}

// Khởi tạo một instance duy nhất. Nếu key lỗi, nó sẽ throw lỗi lúc gọi content chứ không crash app lúc import.
export const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_API_KEY' });
