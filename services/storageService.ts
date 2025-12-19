
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

  async uploadSystemImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `sys-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('admin-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('admin-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Lỗi khi tải ảnh hệ thống lên:', error);
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
  },

  async deleteStoryAudio(url: string): Promise<void> {
    try {
      if (!url) return;
      // Extract fileName from public URL
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      
      // Safety check: don't delete if it looks like the default sample or empty
      if (!fileName || fileName === 'narration-sample.wav') return;

      const { error } = await supabase.storage
        .from('story-audios')
        .remove([fileName]);

      if (error) {
        console.error('Lỗi khi xoá file audio cũ trên storage:', error);
      }
    } catch (error) {
      console.error('Lỗi trong deleteStoryAudio:', error);
    }
  }
};
