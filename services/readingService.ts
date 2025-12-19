
import { Type } from "@google/genai";
import { getAiInstance } from "./geminiClient";

export const readingService = {
  async generateNextExercise(): Promise<{ title: string; text: string; imageUrl: string }> {
    const aiClient = getAiInstance();
    const fallbackImage = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop";

    if (!aiClient) {
      return {
        title: "Bài học dự phòng",
        text: "Mẹ đi chợ mua cá. Bé ở nhà học bài. Cả nhà đều vui vẻ.",
        imageUrl: fallbackImage
      };
    }

    try {
      const textResponse = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Tạo một bài tập đọc ngắn (khoảng 15-25 từ) cho học sinh tiểu học. Nội dung về thiên nhiên hoặc trường học. Trả về JSON bao gồm tiêu đề, văn bản và prompt tiếng Anh vẽ minh họa.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["title", "text", "imagePrompt"]
          }
        }
      });
      
      const content = JSON.parse(textResponse.text || '{}');
      let finalImageUrl = fallbackImage;

      try {
        const imageResult = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A vibrant digital illustration for kids: ${content.imagePrompt}. Storybook style.` }]
          },
          config: { imageConfig: { aspectRatio: "4:3" } }
        });

        for (const part of imageResult.candidates[0].content.parts) {
          if (part.inlineData) finalImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      } catch (imgErr) {
        console.warn("Image gen failed", imgErr);
      }

      return {
        title: content.title,
        text: content.text,
        imageUrl: finalImageUrl
      };
    } catch (error) {
      console.error("Generate Exercise Error:", error);
      return { title: "Bài tập đọc", text: "Mẹ đi chợ mua cá. Bé ở nhà học bài.", imageUrl: fallbackImage };
    }
  },

  async analyzePronunciation(audioBase64: string, targetText: string): Promise<any> {
    const aiClient = getAiInstance();
    
    if (!aiClient) return null;

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: `Bạn là một Chuyên gia Thính học và Giám khảo chấm thi Tiếng Việt cực kỳ nghiêm khắc. 
            Văn bản mẫu: "${targetText}".
            
            NHIỆM VỤ:
            1. Nghe thật kỹ tệp âm thanh. 
            2. Phát hiện TẤT CẢ các lỗi phát âm: sai phụ âm (L/N, S/X, TR/CH, R/D/GI), sai dấu thanh, đọc thiếu từ, đọc thừa từ, hoặc đọc sai từ hoàn toàn.
            3. Trả về accuracy chính xác dựa trên tỉ lệ từ đọc đúng hoàn hảo. Nếu đọc sai L/N hoặc dấu thanh, từ đó PHẢI bị coi là sai.
            
            YÊU CẦU JSON:
            - score: từ 1-5 (5 là hoàn hảo).
            - accuracy: 0-100 (tỉ lệ % thực tế).
            - speed: "Chậm", "Vừa", "Nhanh".
            - feedback: Nhận xét chi tiết các lỗi cụ thể bé đã mắc phải (ví dụ: "Bé còn lẫn lộn giữa L và N ở từ 'lúa'").
            - actualTranscription: Chuỗi văn bản bé đã THỰC TẾ nói (kể cả những từ sai).
            - wordComparison: Mảng các đối tượng so sánh từng từ theo thứ tự bài đọc:
              { "target": "từ trong mẫu", "actual": "từ bé đã đọc", "status": "correct" | "wrong" | "missing" | "extra" }`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              accuracy: { type: Type.NUMBER },
              speed: { type: Type.STRING },
              feedback: { type: Type.STRING },
              actualTranscription: { type: Type.STRING },
              wordComparison: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    target: { type: Type.STRING },
                    actual: { type: Type.STRING },
                    status: { type: Type.STRING }
                  },
                  required: ["target", "actual", "status"]
                }
              }
            },
            required: ["score", "accuracy", "speed", "feedback", "actualTranscription", "wordComparison"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Pronunciation Analysis Error:", error);
      throw error;
    }
  }
};
