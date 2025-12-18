
import { User } from "../types";

const USERS_KEY = "vn_companion_users";
const SESSION_KEY = "vn_companion_session";

export const authService = {
  getUsers: (): User[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  saveUser: (user: User) => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  register: (userData: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
    const users = authService.getUsers();
    if (users.find(u => u.username === userData.username || u.email === userData.email)) {
      return { success: false, message: "Tên đăng nhập hoặc Email đã tồn tại!" };
    }
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      avatar: userData.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCzmxC4VGasAnzPJKGhpgt-0YSgUzPkIn8BTStpjB2qYDSxVpltOGKD2MLsC4YcOavUFY4XXlYXL2hCGdyxrCp7E91804H30xxX3NShqiPSMCUW0M5DYsUthSdcHNuhi0z80YZNRhoeidAtqtTUGe0k9v38mJwOOjax6u6kOaz34r1FLomkhohE1KZM17M0RI84ZSB0c7mg4v_NIywm61g3hFGQ7vIO-yNs10jpjBxZyhCZkNJzLr81I9s3eU6s8hjHQZPLQBQBHA",
      grade: userData.grade || "Lớp 2A",
      school: userData.school || "Tiểu học Việt Mỹ"
    };
    authService.saveUser(newUser);
    return { success: true, message: "Đăng ký thành công!", user: newUser };
  },

  login: (usernameOrEmail: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = authService.getUsers();
    const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
    if (!user) {
      return { success: false, message: "Thông tin đăng nhập không chính xác!" };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, message: "Đăng nhập thành công!", user };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  },

  updateProfile: (updatedUser: User): void => {
    authService.saveUser(updatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  }
};
