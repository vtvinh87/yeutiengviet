
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = authService.login(username, password);
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.message);
    }
  };

  const quickLogin = () => {
    // Create a demo user if none exists
    const users = authService.getUsers();
    let demoUser = users.find(u => u.username === 'demo');
    if (!demoUser) {
      authService.register({
        name: 'Bé An',
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo',
        grade: 'Lớp 2A',
        school: 'Tiểu học Việt Mỹ',
        phone: '0901234567',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzmxC4VGasAnzPJKGhpgt-0YSgUzPkIn8BTStpjB2qYDSxVpltOGKD2MLsC4YcOavUFY4XXlYXL2hCGdyxrCp7E91804H30xxX3NShqiPSMCUW0M5DYsUthSdcHNuhi0z80YZNRhoeidAtqtTUGe0k9v38mJwOOjax6u6kOaz34r1FLomkhohE1KZM17M0RI84ZSB0c7mg4v_NIywm61g3hFGQ7vIO-yNs10jpjBxZyhCZkNJzLr81I9s3eU6s8hjHQZPLQBQBHA'
      });
    }
    const result = authService.login('demo', 'demo');
    if (result.user) onLogin(result.user);
  };

  const adminQuickLogin = () => {
    // Create an admin user if none exists
    const users = authService.getUsers();
    let adminUser = users.find(u => u.username === 'admin');
    if (!adminUser) {
      authService.register({
        name: 'Quản trị viên',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        grade: 'Hệ thống',
        school: 'Ban quản trị',
        phone: '0000000000',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiIvZe_ZPLsBzt1jswWsaQuQAiG1i8iDHKOEqywQ_x3OxZN-n4DcVrphV9SxfvnWzGGEgeGxM1TdCDqWh-BBZ2pULbsxEhS3rT9Vxr3iIeoK07QZbE7LJtCvJbtOQWkfCrM7CSrcSkwSLXZRDTuynsHDv8ealt-OW9T-enx88RAB_4S6Jz6fA9qLescTpnL5CDG6r3S0ztqv0lK0idk8FsPic23SwhQo_gJTu559W3N4crNRq7UX1TiYUnOenZS2nZPXvjxJEvGw'
      });
    }
    const result = authService.login('admin', 'admin');
    if (result.user) onLogin(result.user);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm font-bold border border-red-200">
          {error}
        </div>
      )}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold ml-2">Tên đăng nhập / Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">person</span>
            <input 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base"
              placeholder="Nhập tên của bé hoặc email phụ huynh"
              type="text"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-2">
            <label className="text-sm font-bold">Mật khẩu</label>
            <button type="button" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">lock</span>
            <input 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-12 pr-12 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base"
              placeholder="Nhập mật khẩu"
              type="password"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="mt-2 w-full h-14 bg-primary hover:bg-primary-hover text-text-main text-lg font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Vào học ngay</span>
          <span className="material-symbols-outlined font-bold">arrow_forward</span>
        </button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        <span className="flex-shrink-0 mx-4 text-xs text-[#4c9a66] font-bold uppercase tracking-widest">Hoặc đăng nhập bằng</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
      </div>

      <div className="flex justify-center gap-4">
        <button className="h-14 w-14 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-[#2a4533] flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all">
          <span className="text-xl font-bold">G</span>
        </button>
        <button className="h-14 w-14 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-[#2a4533] flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all">
          <span className="text-xl font-bold text-[#1877F2]">f</span>
        </button>
      </div>

      <div className="pt-4 border-t border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center gap-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dành cho nhà phát triển</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button 
            onClick={quickLogin}
            type="button"
            className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-all border border-primary/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Học sinh (demo)
          </button>
          <button 
            onClick={adminQuickLogin}
            type="button"
            className="px-4 py-2 text-xs font-bold text-blue-500 bg-blue-500/10 rounded-full hover:bg-blue-500/20 transition-all border border-blue-500/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Admin (admin)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
