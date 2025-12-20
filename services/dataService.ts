
import { Story, AdminImage, GameData, GameType } from "../types";
import { supabase } from "./supabaseClient";
import { storageService } from "./storageService";

export const IMAGE_KEYS = {
  AUTH_HERO: 'AUTH_HERO',
  DASHBOARD_HERO: 'DASHBOARD_HERO',
  DASHBOARD_READING: 'DASHBOARD_READING',
  DASHBOARD_STORIES: 'DASHBOARD_STORIES',
  DASHBOARD_DICTIONARY: 'DASHBOARD_DICTIONARY',
  DASHBOARD_GAMES: 'DASHBOARD_GAMES',
  GAMES_HERO: 'GAMES_HERO',
  GAME_RUNG_CHUONG_VANG: 'GAME_RUNG_CHUONG_VANG',
  GAME_VUA_TIENG_VIET: 'GAME_VUA_TIENG_VIET',
  GAME_DUOI_HINH_BAT_CHU: 'GAME_DUOI_HINH_BAT_CHU',
  // Branding Keys
  SYSTEM_LOGO: 'SYSTEM_LOGO',
  SYSTEM_FAVICON: 'SYSTEM_FAVICON',
  SYSTEM_PWA_ICON: 'SYSTEM_PWA_ICON',
};

const DEFAULT_STORIES: Story[] = [
  {
    id: '1',
    title: 'Thánh Gióng',
    duration: '5 phút',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBWmZQHrocpbDAKCXuiBy3bq74U8DVD4gv3AjYtH2uypfLrgZkJ0I_5X2Jdl4cRZQXRQz4ovcvO_I3jUfIpnvALxy5NLut1Dok1epJ0Kw0lXLnIOxQkGudY2SYcuiQFWydbiT5NrqJf1AkF8LwXQVhh6h9XmXrkf1SsfquR32kbs7UahlXoDjLJKz3CTk-Tb514wwgwPZ6S3mRpIhe7n2KE6tvHbNOx47GL6cW-3Re913eahH0UfXBNWXQs6eHCDAzCtKWzRFFhQ',
    summary: 'Truyền thuyết về người anh hùng làng Gióng.',
    content: `Vào đời Hùng Vương thứ sáu, ở làng Gióng có hai vợ chồng ông lão chăm chỉ làm ăn và ăn ở phúc đức nhưng mãi không có con.`,
    audioUrl: 'https://ajxctwbzpgdpypiwpvpu.supabase.co/storage/v1/object/public/story-audios/narration-sample.wav'
  }
];

export const dataService = {
  async getStories(page: number = 1, pageSize: number = 5): Promise<Story[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (!data || data.length === 0) return (page === 1 ? DEFAULT_STORIES : []);
      
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        summary: item.summary,
        duration: item.duration,
        image: item.image,
        audioUrl: item.audio_url
      }));
    } catch (err) {
      console.error("Lỗi getStories:", err);
      return (page === 1 ? DEFAULT_STORIES : []);
    }
  },

  async getStoriesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async saveStory(story: Story) {
    const dbData: any = {
      title: story.title,
      content: story.content,
      summary: story.summary,
      duration: story.duration,
      image: story.image,
      audio_url: story.audioUrl
    };

    if (story.id && story.id !== 'new' && story.id.length > 10) {
      dbData.id = story.id;
    }

    const { data, error } = await supabase
      .from('stories')
      .upsert([dbData])
      .select();

    if (error) {
      console.error("Lỗi lưu Story:", error);
      throw error;
    }
    return data;
  },

  async deleteStory(id: string) {
    const { data: item, error: fetchError } = await supabase
      .from('stories')
      .select('image, audio_url')
      .eq('id', id)
      .single();

    if (!fetchError && item) {
      if (item.image && item.image.includes('supabase.co')) {
        await storageService.deleteFileFromUrl('admin-images', item.image);
      }
      
      if (item.audio_url) {
        await storageService.deleteFileFromUrl('story-audios', item.audio_url);
      }
    }

    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) throw error;
  },

  async getImages(page: number = 1, pageSize: number = 5): Promise<AdminImage[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('admin_images')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error || !data) return [];
    return data;
  },

  async getImagesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('admin_images')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async saveImage(image: AdminImage) {
    const dbData: any = {
      url: image.url,
      description: image.description,
      category: image.category || 'System',
      key: image.key
    };

    if (image.id && image.id !== 'new' && image.id.length > 10) {
      dbData.id = image.id;
    }

    const { data, error } = await supabase
      .from('admin_images')
      .upsert([dbData])
      .select();

    if (error) {
      console.error("Lỗi lưu Image vào Database:", error);
      throw error;
    }
    return data;
  },

  async deleteImage(id: string) {
    const { data: item } = await supabase.from('admin_images').select('url').eq('id', id).single();
    if (item && item.url) {
      await storageService.deleteFileFromUrl('admin-images', item.url);
    }

    const { error } = await supabase.from('admin_images').delete().eq('id', id);
    if (error) throw error;
  },

  async getSystemImage(key: string, fallback: string): Promise<string> {
    try {
      const { data } = await supabase
        .from('admin_images')
        .select('url')
        .eq('key', key)
        .single();
      return data?.url || fallback;
    } catch {
      return fallback;
    }
  },

  // --- GAME LIBRARY METHODS ---

  async saveGameContent(type: GameType, content: any, id?: string): Promise<boolean> {
    try {
      let finalContent = { ...content };

      // Tối ưu hóa: Nếu là game có hình ảnh (Base64), upload lên Storage trước khi lưu DB
      if (type === 'DUOI_HINH_BAT_CHU' && finalContent.imageUrl && finalContent.imageUrl.startsWith('data:')) {
        console.log("Phát hiện ảnh Base64, đang tải lên Storage...");
        const uploadedUrl = await storageService.uploadGameImage(finalContent.imageUrl);
        if (uploadedUrl) {
          finalContent.imageUrl = uploadedUrl;
          console.log("Đã thay thế Base64 bằng URL:", uploadedUrl);
        } else {
          console.warn("Không thể tải ảnh lên Storage, sẽ lưu dạng Base64 (có thể nặng DB).");
        }
      }

      if (id) {
        // Update existing record
        const { error } = await supabase
          .from('game_library')
          .update({ content: finalContent })
          .eq('id', id);
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('game_library')
          .insert([{
            type,
            content: finalContent
          }]);
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error("Lỗi lưu game content:", err);
      return false;
    }
  },

  async getGameLibrary(type: GameType, page: number = 1, pageSize: number = 5): Promise<GameData[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error } = await supabase
        .from('game_library')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Lỗi lấy game library:", err);
      return [];
    }
  },

  async getGameLibraryCount(type: GameType): Promise<number> {
    const { count, error } = await supabase
      .from('game_library')
      .select('*', { count: 'exact', head: true })
      .eq('type', type);
    
    if (error) return 0;
    return count || 0;
  },

  async getRandomGameContent(type: GameType, limit: number = 1): Promise<any[]> {
    try {
      // Vì Supabase không hỗ trợ random trực tiếp dễ dàng, 
      // ta fetch một lượng nhỏ mới nhất hoặc dùng function RPC nếu có.
      // Ở đây dùng cách fetch 50 item mới nhất rồi shuffle client-side để đơn giản.
      const { data, error } = await supabase
        .from('game_library')
        .select('content')
        .eq('type', type)
        .limit(50);
      
      if (error || !data) return [];
      
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit).map(item => item.content);
    } catch (err) {
      return [];
    }
  },

  async deleteGameContent(id: string): Promise<void> {
    // 1. Lấy nội dung để kiểm tra xem có ảnh cần xóa không
    const { data: item } = await supabase
      .from('game_library')
      .select('content')
      .eq('id', id)
      .single();
    
    // 2. Xóa ảnh trên Storage nếu có
    if (item && item.content && item.content.imageUrl) {
      // Kiểm tra xem URL có thuộc về Supabase Storage không
      if (item.content.imageUrl.includes('supabase.co')) {
        // Chúng ta sử dụng bucket 'admin-images' cho ảnh game trong implementation mới
        await storageService.deleteFileFromUrl('admin-images', item.content.imageUrl);
      }
    }

    // 3. Xóa record trong DB
    const { error } = await supabase
      .from('game_library')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
