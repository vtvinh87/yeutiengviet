
import { Story, AdminImage } from "../types";
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
  }
};
