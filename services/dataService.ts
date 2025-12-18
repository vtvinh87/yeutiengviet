
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
    content: `Vào đời Hùng Vương thứ sáu, ở làng Gióng có hai vợ chồng ông lão chăm chỉ làm ăn và ăn ở phúc đức nhưng mãi không có con. \n\nMột hôm bà ra đồng thấy một vết chân rất to, liền đặt bàn chân mình lên ướm thử để xem thua kém bao nhiêu. Không ngờ về nhà bà thụ thai và mười hai tháng sau sinh được một cậu con trai khôi ngô tuấn tú.\n\nKỳ lạ thay, cậu bé ấy lên ba tuổi mà vẫn không biết nói, biết cười, đặt đâu nằm đấy. Bấy giờ có giặc Ân đến xâm phạm bờ cõi nước ta. Thế giặc mạnh, nhà vua lo sợ, bèn sai sứ giả đi khắp nơi rao tìm người tài giỏi cứu nước.\n\nĐứa bé nghe tin, bỗng dưng cất tiếng nói: "Mẹ ra mời sứ giả vào đây". Sứ giả vào, đứa bé bảo: "Ông về tâu vua sắm cho ta một con ngựa sắt, một cái roi sắt và một tấm áo giáp sắt, ta sẽ phá tan lũ giặc này".`
  }
];

export const dataService = {
  async getStories(): Promise<Story[]> {
    const { data, error } = await supabase.from('stories').select('*');
    if (error || !data || data.length === 0) return DEFAULT_STORIES;
    return data;
  },

  async saveStory(story: Story) {
    await supabase.from('stories').upsert([story]);
  },

  async deleteStory(id: string) {
    await supabase.from('stories').delete().eq('id', id);
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
    const { data } = await supabase
      .from('admin_images')
      .select('url')
      .eq('key', key)
      .single();
    return data?.url || fallback;
  }
};
