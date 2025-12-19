
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
        .upload(fileName, blob);

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

  /**
   * Xóa file từ Storage dựa trên URL và tên bucket.
   * Logic mới dùng split để lấy phần sau tên bucket, giúp xử lý chính xác hơn
   * so với việc đếm index của các thành phần trong URL.
   */
  async deleteFileFromUrl(bucket: string, url: string | undefined | null): Promise<void> {
    if (!url || typeof url !== 'string') return;
    
    // Nếu là data URL (base64) thì không cần xóa trên Storage
    if (url.startsWith('data:')) return;

    try {
      // Tìm vị trí của tên bucket trong URL
      // URL mẫu: https://.../storage/v1/object/public/reading-audios/voice-123.wav?t=...
      const bucketMarker = `/${bucket}/`;
      const bucketIndex = url.indexOf(bucketMarker);
      
      if (bucketIndex !== -1) {
        // Lấy phần sau /bucket/
        let filePath = url.substring(bucketIndex + bucketMarker.length);
        
        // Loại bỏ các tham số query (ví dụ ?t=123...)
        filePath = filePath.split('?')[0];
        
        // Giải mã các ký tự đặc biệt như dấu cách (%20)
        const decodedPath = decodeURIComponent(filePath);
        
        console.log(`Đang xóa file: ${decodedPath} từ bucket: ${bucket}`);
        
        const { error } = await supabase.storage.from(bucket).remove([decodedPath]);
        
        if (error) {
          console.warn(`Cảnh báo: Không thể xóa file ${decodedPath} từ bucket ${bucket}.`, error);
        } else {
          console.log(`Đã xóa thành công file ${decodedPath} từ bucket ${bucket}`);
        }
      } else {
        console.warn(`Không tìm thấy bucket marker '${bucketMarker}' trong URL: ${url}`);
      }
    } catch (e) {
      console.error("Lỗi khi xử lý xóa file từ Storage:", e);
    }
  },

  async deleteStoryAudio(url: string): Promise<void> {
    await this.deleteFileFromUrl('story-audios', url);
  }
};
