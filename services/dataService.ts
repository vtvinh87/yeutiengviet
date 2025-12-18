
import { Story, AdminImage } from "../types";
import { supabase } from "./supabaseClient";

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
};

// Fallback data if DB is empty
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
  async getStories(): Promise<Story[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return DEFAULT_STORIES;
      
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        summary: item.summary,
        duration: item.duration,
        image: item.image,
        audioUrl: item.audio_url // Ánh xạ từ snake_case của DB sang camelCase của App
      }));
    } catch (err) {
      console.error("Lỗi getStories:", err);
      return DEFAULT_STORIES;
    }
  },

  async saveStory(story: Story) {
    // 1. Chuẩn bị object dữ liệu với tên cột chính xác trong Database (snake_case)
    const dbData: any = {
      title: story.title,
      content: story.content,
      summary: story.summary,
      duration: story.duration,
      image: story.image,
      audio_url: story.audioUrl // Đảm bảo trùng khớp với cột audio_url trong SQL
    };

    // 2. Xử lý ID: Nếu là truyện mới (id là 'new' hoặc undefined), không gửi ID để Supabase tự tạo UUID.
    // Nếu ID là một UUID hợp lệ, gửi đi để Update.
    if (story.id && story.id !== 'new' && story.id.length > 10) {
      dbData.id = story.id;
    }

    console.log("Đang lưu dữ liệu vào Supabase:", dbData);

    const { data, error } = await supabase
      .from('stories')
      .upsert([dbData])
      .select();

    if (error) {
      console.error("Chi tiết lỗi lưu Database:", error);
      throw error;
    }
    
    return data;
  },

  async deleteStory(id: string) {
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) throw error;
  },

  async getImages(): Promise<AdminImage[]> {
    const { data, error } = await supabase.from('admin_images').select('*');
    if (error || !data) return [];
    return data;
  },

  async saveImage(image: AdminImage) {
    await supabase.from('admin_images').upsert([image]);
  },

  async deleteImage(id: string) {
    await supabase.from('admin_images').delete().eq('id', id);
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
