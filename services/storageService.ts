
import { supabase } from "./supabaseClient";

export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      return null;
    }
  },

  async uploadStoryAudio(storyId: string, blob: Blob): Promise<string | null> {
    try {
      const fileName = `narration-${storyId}-${Date.now()}.wav`;
      const { error: uploadError } = await supabase.storage
        .from('story-audios')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('story-audios')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Lỗi khi tải audio lên:', error);
      return null;
    }
  }
};
