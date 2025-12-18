
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface RegisterViewProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await authService.register({
        name,
        username,
        email,
        password,
        grade: 'Lớp 2A',
        school: 'Tiểu học Việt Mỹ',
        phone: '',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzmxC4VGasAnzPJKGhpgt-0YSgUzPkIn8BTStpjB2qYDSxVpltOGKD2MLsC4YcOavUFY4XXlYXL2hCGdyxrCp7E91804H30xxX3NShqiPSMCUW0M5DYsUthSdcHNuhi0z80YZNRhoeidAtqtTUGe0k9v38mJwOOjax6u6kOaz34r1FLomkhohE1KZM17M0RI84ZSB0c7mg4v_NIywm61g3hFGQ7vIO-yNs10jpjBxZyhCZkNJzLr81I9s3eU6s8hjHQZPLQBQBHA'
      });

      if (result.success && result.user) {
        onRegister(result.user);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
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
          <label className="text-sm font-bold ml-2">Tên của bé</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">face</span>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base disabled:opacity-50"
              placeholder="Nhập tên bé ví dụ: Bé An"
              type="text"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold ml-2">Tên đăng nhập</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">person</span>
            <input 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base disabled:opacity-50"
              placeholder="Nhập tên đăng nhập"
              type="text"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold ml-2">Email phụ huynh</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">mail</span>
            <input 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base disabled:opacity-50"
              placeholder="Nhập email phụ huynh"
              type="email"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold ml-2">Mật khẩu</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">lock</span>
            <input 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-12 pr-12 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base disabled:opacity-50"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              type="password"
              minLength={6}
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="mt-2 w-full h-14 bg-primary hover:bg-primary-hover text-text-main text-lg font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="size-6 border-2 border-text-main/30 border-t-text-main rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Tạo tài khoản</span>
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <button onClick={onSwitchToLogin} className="font-bold text-primary hover:underline" disabled={loading}>Đăng nhập</button>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
