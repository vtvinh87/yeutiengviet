
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authService.login(username, password);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ Supabase.");
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
          <label className="text-sm font-bold ml-2">Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">mail</span>
            <input 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base disabled:opacity-50"
              placeholder="Nhập email phụ huynh"
              type="email"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-2">
            <label className="text-sm font-bold">Mật khẩu</label>
            <button type="button" className="text-xs font-bold text-primary hover:underline" disabled={loading}>Quên mật khẩu?</button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c9a66]">lock</span>
            <input 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-12 pr-12 bg-gray-50 dark:bg-surface-dark border-2 border-[#cfe7d7] dark:border-[#2a4533] rounded-full focus:ring-primary focus:border-primary transition-all text-sm md:text-base disabled:opacity-50"
              placeholder="Nhập mật khẩu"
              type="password"
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
              <span>Vào học ngay</span>
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </>
          )}
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
    </div>
  );
};

export default LoginView;
