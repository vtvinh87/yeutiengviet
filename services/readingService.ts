
import { Type } from "@google/genai";
import { getAiInstance } from "./geminiClient";
import { supabase } from "./supabaseClient";
import { storageService } from "./storageService";
import { ReadingPractice } from "../types";
import { audioBufferToWav } from "./audioUtils";

export const readingService = {
  async generateNextExercise(): Promise<{ title: string; text: string; imageUrl: string; isGenerated: boolean }> {
    // Tỷ lệ 30% lấy bài cũ từ kho để tối ưu tốc độ và chi phí
    if (Math.random() < 0.3) {
      const saved = await this.getRandomSavedExercise();
      if (saved) {
        console.log("Sử dụng bài đọc từ kho lưu trữ (Fast Load)");
        return { 
          title: saved.title, 
          text: saved.text, 
          imageUrl: saved.image_url, 
          isGenerated: false // Đánh dấu là bài cũ từ kho
        };
      }
    }

    const aiClient = getAiInstance();
    const fallbackImage = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop";

    if (!aiClient) {
      const saved = await this.getRandomSavedExercise();
      if (saved) return { title: saved.title, text: saved.text, imageUrl: saved.image_url, isGenerated: false };
      return {
        title: "Mùa xuân về",
        text: "Mùa xuân về, trăm hoa đua nở. Bé cùng mẹ đi chúc tết ông bà. Cả nhà ai cũng vui tươi.",
        imageUrl: fallbackImage,
        isGenerated: false
      };
    }

    try {
      const textResponse = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Tạo một bài tập đọc ngắn (15-25 từ) cho học sinh lớp 1-2 Việt Nam. Chủ đề: gia đình, trường học hoặc thiên nhiên. Trả về JSON gồm title, text, và imagePrompt chi tiết bằng tiếng Anh.",
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
            parts: [{ text: `A vibrant, friendly 3D cartoon illustration for children: ${content.imagePrompt}` }]
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
        if (saved) return { title: content.title, text: content.text, imageUrl: saved.image_url, isGenerated: true };
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
      if (saved) return { title: saved.title, text: saved.text, imageUrl: saved.image_url, isGenerated: false };
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

  async getSavedExercises(): Promise<ReadingPractice[]> {
    const { data, error } = await supabase
      .from('reading_practice')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
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
        contents: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: `NHIỆM VỤ: Chuyển âm thanh thành văn bản, so sánh với mẫu: "${targetText}", trả về JSON accuracy và feedback.`
          }
        ],
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
