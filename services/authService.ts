
import { User } from "../types";
import { supabase } from "./supabaseClient";

export const authService = {
  async register(userData: Omit<User, 'id' | 'role'>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
        options: {
          data: {
            full_name: userData.name,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Không thể tạo tài khoản xác thực.");

      const newUser: User = {
        id: authData.user.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        grade: userData.grade || "Lớp 2A",
        school: userData.school || "Tiểu học Việt Mỹ",
        phone: userData.phone || "",
        avatar: userData.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCzmxC4VGasAnzPJKGhpgt-0YSgUzPkIn8BTStpjB2qYDSxVpltOGKD2MLsC4YcOavUFY4XXlYXL2hCGdyxrCp7E91804H30xxX3NShqiPSMCUW0M5DYsUthSdcHNuhi0z80YZNRhoeidAtqtTUGe0k9v38mJwOOjax6u6kOaz34r1FLomkhohE1KZM17M0RI84ZSB0c7mg4v_NIywm61g3hFGQ7vIO-yNs10jpjBxZyhCZkNJzLr81I9s3eU6s8hjHQZPLQBQBHA",
        role: 'user'
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([newUser]);

      if (profileError) console.error("Profile creation error:", profileError);

      return { success: true, message: "Đăng ký thành công!", user: newUser };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi đăng ký hệ thống." };
    }
  },

  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail,
        password: password,
      });

      if (authError) throw authError;

      // Buộc fetch lại profile từ DB để lấy role mới nhất
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Không tìm thấy hồ sơ người dùng trong hệ thống.");
      }

      return { success: true, message: "Đăng nhập thành công!", user: profile };
    } catch (error: any) {
      return { success: false, message: error.message || "Thông tin đăng nhập không chính xác." };
    }
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Fetch fresh profile data including role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
       console.error("Error fetching current user profile:", error);
       return null;
    }

    return profile;
  },

  async updateProfile(updatedUser: User): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updatedUser)
      .eq('id', updatedUser.id);
    
    if (error) console.error("Update profile error:", error);
  },

  async getAllUsers(): Promise<User[]> {
    const { data } = await supabase.from('profiles').select('*');
    return data || [];
  },

  async deleteUser(id: string): Promise<void> {
    await supabase.from('profiles').delete().eq('id', id);
  }
};
