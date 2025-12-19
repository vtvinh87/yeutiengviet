
import { GoogleGenAI } from "@google/genai";

/**
 * Lấy API Key từ môi trường.
 * Theo quy định, API Key được cung cấp qua process.env.API_KEY.
 */
export const getApiKey = () => {
  return process.env.API_KEY;
};

/**
 * Kiểm tra xem đã có API Key chưa.
 */
export const hasApiKey = () => {
  const key = getApiKey();
  return !!key && key !== "undefined" && key.length > 0;
};

/**
 * Khởi tạo GoogleGenAI client instance.
 * Luôn khởi tạo ngay trước khi sử dụng để đảm bảo lấy được key mới nhất.
 */
export const createAiInstance = () => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key is missing. Please select an API Key first.");
  }
  return new GoogleGenAI({ apiKey });
};
