
import { User } from "../types";
import { supabase } from "./supabaseClient";

export const authService = {
  async register(userData: Omit<User, 'id' | 'role' | 'exp' | 'level' | 'stars' | 'lastChallengeDate'>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
        options: {
          data: { full_name: userData.name }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Không thể tạo tài khoản xác thực.");

      const newUser: User = {
        id: authData.user.id,
        name: userData.name,
        username: userData.username.toLowerCase().trim(),
        email: userData.email,
        grade: userData.grade || "Lớp 2A",
        school: userData.school || "Tiểu học Việt Mỹ",
        phone: userData.phone || "",
        avatar: userData.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCzmxC4VGasAnzPJKGhpgt-0YSgUzPkIn8BTStpjB2qYDSxVpltOGKD2MLsC4YcOavUFY4XXlYXL2hCGdyxrCp7E91804H30xxX3NShqiPSMCUW0M5DYsUthSdcHNuhi0z80YZNRhoeidAtqtTUGe0k9v38mJwOOjax6u6kOaz34r1FLomkhohE1KZM17M0RI84ZSB0c7mg4v_NIywm61g3hFGQ7vIO-yNs10jpjBxZyhCZkNJzLr81I9s3eU6s8hjHQZPLQBQBHA",
        role: 'user',
        exp: 0,
        level: 1,
        streak: userData.streak || 1,
        stars: 0
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          grade: newUser.grade,
          school: newUser.school,
          phone: newUser.phone,
          avatar: newUser.avatar,
          role: newUser.role,
          exp: newUser.exp,
          level: newUser.level,
          streak: newUser.streak,
          stars: newUser.stars
        }], { onConflict: 'id' })
        .select()
        .single();

      if (profileError) throw profileError;

      return { success: true, message: "Đăng ký thành công!", user: profile || newUser };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi đăng ký hệ thống." };
    }
  },

  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const input = usernameOrEmail.trim();
      let email = input;

      if (!input.includes('@')) {
        const { data: profile, error: profileSearchError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', input.toLowerCase())
          .maybeSingle(); 
        
        if (profileSearchError) throw new Error("Hệ thống đang bận.");
        if (!profile) throw new Error("Tên đăng nhập không tồn tại.");
        email = profile.email;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw new Error("Mật khẩu không chính xác.");

      const { data: fullProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !fullProfile) throw new Error("Tài khoản chưa có hồ sơ.");

      return { success: true, message: "Đăng nhập thành công!", user: fullProfile };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) return null;
    return profile;
  },

  async getAllUsers(page: number = 1, pageSize: number = 5): Promise<User[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true })
      .range(from, to);
    
    if (error) throw error;
    return data || [];
  },

  async getUsersCount(): Promise<number> {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async updateProfile(updatedUser: User): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        grade: updatedUser.grade,
        school: updatedUser.school,
        phone: updatedUser.phone,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        stars: updatedUser.stars,
        last_challenge_date: updatedUser.lastChallengeDate
      })
      .eq('id', updatedUser.id);
    
    if (error) throw error;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async markChallengeComplete(userId: string): Promise<User | null> {
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from('profiles')
      .update({ last_challenge_date: today })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) return null;
    return data;
  },

  async addExperience(userId: string, amount: number): Promise<User | null> {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('exp, level, stars')
      .eq('id', userId)
      .single();

    if (fetchError) return null;

    const currentExp = profile.exp || 0;
    const currentStars = profile.stars || 0;
    
    const newTotalExp = currentExp + amount;
    const newLevel = Math.floor(newTotalExp / 100) + 1;
    
    const bonusStars = Math.floor(amount / 20);
    const newStars = currentStars + bonusStars;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        exp: newTotalExp, 
        level: newLevel, 
        stars: newStars 
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) return null;
    return updatedProfile;
  }
};
