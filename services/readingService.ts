
import { Type } from "@google/genai";
import { getAiInstance } from "./geminiClient";
import { supabase } from "./supabaseClient";
import { storageService } from "./storageService";
import { ReadingPractice } from "../types";
import { audioBufferToWav } from "./audioUtils";

export const readingService = {
  async generateNextExercise(enableAi: boolean = true): Promise<{ title: string; text: string; imageUrl: string; audioUrl?: string; isGenerated: boolean }> {
    // Nếu KHÔNG cho phép dùng AI (Học sinh), buộc lấy từ DB
    if (!enableAi) {
      const saved = await this.getRandomSavedExercise();
      if (saved) {
        return { 
          title: saved.title, 
          text: saved.text, 
          imageUrl: saved.image_url,
          audioUrl: saved.audio_url, // Trả về audio có sẵn để không phải tạo lại
          isGenerated: false 
        };
      }
      // Fallback nếu DB rỗng
      return {
        title: "Chào bé",
        text: "Chào mừng bé đến với bài tập đọc. Hãy nhờ thầy cô thêm bài tập mới vào kho nhé!",
        imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
        isGenerated: false
      };
    }

    // Nếu cho phép dùng AI (Admin), giữ logic cũ: 30% lấy bài cũ để tối ưu
    if (Math.random() < 0.3) {
      const saved = await this.getRandomSavedExercise();
      if (saved) {
        console.log("Sử dụng bài đọc từ kho lưu trữ (Fast Load)");
        return { 
          title: saved.title, 
          text: saved.text, 
          imageUrl: saved.image_url, 
          audioUrl: saved.audio_url,
          isGenerated: false // Đánh dấu là bài cũ từ kho
        };
      }
    }

    const aiClient = getAiInstance();
    const fallbackImage = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop";

    if (!aiClient) {
      const saved = await this.getRandomSavedExercise();
      if (saved) return { title: saved.title, text: saved.text, imageUrl: saved.image_url, audioUrl: saved.audio_url, isGenerated: false };
      return {
        title: "Mùa xuân về",
        text: "Mùa xuân về, trăm hoa đua nở. Bé cùng mẹ đi chúc tết ông bà. Cả nhà ai cũng vui tươi.",
        imageUrl: fallbackImage,
        isGenerated: false
      };
    }

    try {
      // DANH SÁCH CHỦ ĐỀ PHONG PHÚ
      const topics = [
        "Thế giới động vật ngộ nghĩnh (Chó, Mèo, Voi, Thỏ...)",
        "Các món ăn ngon Việt Nam (Phở, Bánh mì, Cơm tấm...)",
        "Lễ hội Việt Nam (Tết Nguyên Đán, Trung Thu, Giỗ Tổ...)",
        "Khám phá Vũ trụ và Phi hành gia",
        "Các phương tiện giao thông (Xe lửa, Máy bay, Tàu thủy...)",
        "Ước mơ nghề nghiệp (Bác sĩ, Giáo viên, Cầu thủ...)",
        "Truyện cổ tích và Phép thuật",
        "Tình bạn diệu kỳ và sự chia sẻ",
        "Gia đình yêu thương và giúp đỡ cha mẹ",
        "Trò chơi dân gian (Thả diều, Nhảy dây, Trốn tìm...)",
        "Phép lịch sự và thói quen tốt hàng ngày",
        "Thế giới đại dương đầy màu sắc",
        "Những phát minh khoa học vui nhộn"
      ];

      // Chọn ngẫu nhiên một chủ đề
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];

      const textResponse = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo một bài tập đọc ngắn (20-35 từ) cho học sinh tiểu học (Lớp 1-2) tại Việt Nam.
        CHỦ ĐỀ CỤ THỂ: ${randomTopic}.
        Yêu cầu:
        1. Tiêu đề ngắn gọn, hấp dẫn.
        2. Nội dung vui tươi, giáo dục, dùng từ ngữ đơn giản, dễ đọc, phù hợp lứa tuổi.
        3. Trả về JSON gồm: title, text, và imagePrompt (mô tả chi tiết bức tranh minh họa bằng tiếng Anh, phong cách hoạt hình 3D Pixar tươi sáng, phù hợp với nội dung).`,
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
        const imageResponse = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A vibrant, cute, friendly 3D cartoon illustration for children, Pixar style, high quality: ${content.imagePrompt}` }]
          },
          config: { imageConfig: { aspectRatio: "4:3" } }
        });

        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            finalImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      } catch (imgErr) {
        console.warn("AI Image generation failed, falling back to database or placeholder", imgErr);
        const saved = await this.getRandomSavedExercise();
        if (saved) return { title: saved.title, text: saved.text, imageUrl: saved.image_url, audioUrl: saved.audio_url, isGenerated: false };
      }

      return {
        title: content.title,
        text: content.text,
        imageUrl: finalImageUrl,
        isGenerated: true // Đánh dấu là bài mới do AI tạo
      };
    } catch (error) {
      console.error("Generate AI Exercise Error:", error);
      const saved = await this.getRandomSavedExercise();
      if (saved) return { title: saved.title, text: saved.text, imageUrl: saved.image_url, audioUrl: saved.audio_url, isGenerated: false };
      return { 
        title: "Bài tập đọc", 
        text: "Mẹ đi chợ mua cá. Bé ở nhà học bài.", 
        imageUrl: fallbackImage,
        isGenerated: false 
      };
    }
  },

  async saveExercise(title: string, text: string, imageUrl: string, audioBuffer?: AudioBuffer | null): Promise<boolean> {
    try {
      let finalImageUrl = imageUrl;
      let finalAudioUrl = null;
      
      if (imageUrl.startsWith('data:')) {
        const uploadedImg = await storageService.uploadReadingImage(imageUrl);
        if (uploadedImg) finalImageUrl = uploadedImg;
      }

      if (audioBuffer) {
        const wavBlob = audioBufferToWav(audioBuffer);
        const uploadedAudio = await storageService.uploadReadingAudio(wavBlob);
        if (uploadedAudio) finalAudioUrl = uploadedAudio;
      }

      const { error } = await supabase
        .from('reading_practice')
        .insert([{
          title,
          text,
          image_url: finalImageUrl,
          audio_url: finalAudioUrl
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("readingService.saveExercise Error:", error);
      return false;
    }
  },

  async getSavedExercises(page: number = 1, pageSize: number = 5): Promise<ReadingPractice[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('reading_practice')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (error) return [];
    return data;
  },

  async getSavedExercisesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('reading_practice')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async getRandomSavedExercise(): Promise<ReadingPractice | null> {
    try {
      const { data, error } = await supabase
        .from('reading_practice')
        .select('*');
      
      if (error || !data || data.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    } catch {
      return null;
    }
  },

  async deleteExercise(id: string): Promise<void> {
    // 1. Lấy thông tin bài tập trước khi xóa để có URL file
    const { data: item, error: fetchError } = await supabase
      .from('reading_practice')
      .select('image_url, audio_url')
      .eq('id', id)
      .single();

    if (!fetchError && item) {
      // 2. Xóa các file vật lý trên Storage
      if (item.image_url) {
        await storageService.deleteFileFromUrl('reading-images', item.image_url);
      }
      if (item.audio_url) {
        await storageService.deleteFileFromUrl('reading-audios', item.audio_url);
      }
    }

    // 3. Xóa bản ghi trong Database
    const { error } = await supabase
      .from('reading_practice')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async analyzePronunciation(audioBase64: string, targetText: string): Promise<any> {
    const aiClient = getAiInstance();
    if (!aiClient) return null;

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: audioBase64,
              },
            },
            {
              text: `NHIỆM VỤ: Chuyển âm thanh thành văn bản, so sánh với mẫu: "${targetText}", trả về JSON accuracy và feedback.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              accuracy: { type: Type.NUMBER },
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
            required: ["score", "accuracy", "feedback", "actualTranscription", "wordComparison"]
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
