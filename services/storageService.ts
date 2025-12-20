
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

  async uploadReadingImage(base64Data: string): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const base64Content = base64Data.split(',')[1] || base64Data;
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      const fileName = `reading-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('reading-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('reading-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Lỗi uploadReadingImage:', error);
      return null;
    }
  },

  /**
   * Tải audio mẫu của bài đọc lên Storage
   */
  async uploadReadingAudio(blob: Blob): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const fileName = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}.wav`;
      
      const { error: uploadError } = await supabase.storage
        .from('reading-audios')
        .upload(fileName, blob, {
          contentType: 'audio/wav',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('reading-audios')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Lỗi uploadReadingAudio:', error);
      return null;
    }
  },

  async uploadStoryAudio(storyId: string, blob: Blob): Promise<string | null> {
    try {
      const fileName = `narration-${storyId}-${Date.now()}.wav`;
      const { error: uploadError } = await supabase.storage
        .from('story-audios')
        .upload(fileName, blob, {
          contentType: 'audio/wav',
          upsert: false
        });

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

  /**
   * Xóa file từ Storage dựa trên URL và tên bucket.
   */
  async deleteFileFromUrl(bucket: string, url: string | undefined | null): Promise<void> {
    if (!url || typeof url !== 'string' || url.startsWith('data:')) return;

    try {
      // URL mẫu: https://.../storage/v1/object/public/reading-audios/voice-123.wav?t=...
      // Chúng ta cần lấy phần sau tên bucket
      const bucketSearchStr = `/${bucket}/`;
      const bucketIndex = url.indexOf(bucketSearchStr);
      
      if (bucketIndex !== -1) {
        let filePath = url.substring(bucketIndex + bucketSearchStr.length);
        
        // Loại bỏ query params (?t=...) nếu có
        filePath = filePath.split('?')[0];
        
        // Giải mã URL (ví dụ %20 thành khoảng trắng)
        const decodedPath = decodeURIComponent(filePath);
        
        console.log(`[Storage] Đang yêu cầu xóa file: "${decodedPath}" trong bucket: "${bucket}"`);
        
        const { error } = await supabase.storage.from(bucket).remove([decodedPath]);
        
        if (error) {
          console.error(`[Storage] Lỗi khi xóa file "${decodedPath}":`, error.message);
          // Gợi ý cho developer nếu lỗi là do quyền hạn
          if (error.message.includes('row-level security') || error.message.includes('Policy')) {
            console.warn(`[Storage] Gợi ý: Hãy kiểm tra RLS Policy của bucket "${bucket}" trong Supabase Dashboard.`);
          }
        } else {
          console.log(`[Storage] Đã xóa thành công file "${decodedPath}"`);
        }
      } else {
        console.warn(`[Storage] Không tìm thấy marker của bucket "${bucket}" trong URL: ${url}`);
      }
    } catch (e) {
      console.error("[Storage] Lỗi ngoại lệ khi xóa file:", e);
    }
  },

  async deleteStoryAudio(url: string): Promise<void> {
    await this.deleteFileFromUrl('story-audios', url);
  }
};
