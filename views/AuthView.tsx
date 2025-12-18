
import React, { useState, useEffect } from 'react';
import LoginView from './LoginView';
import RegisterView from './RegisterView';
import { User } from '../types';
import { dataService, IMAGE_KEYS } from '../services/dataService';

const AuthView: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
    // Fix: Wait for getSystemImage promise to resolve before updating state
    const loadHero = async () => {
      const url = await dataService.getSystemImage(IMAGE_KEYS.AUTH_HERO, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs8ES2d4qfX1CPkR3tdK1bo394PZgw34Zgj19ewQ7rGS1yPGYaO2dL7wtIHNEA-kSIE8gjz-Dvqey0eYkrZUNA0WYbwu3iAe1lMExYtTA8cGSlW7t3tIBSF4uhgp4Fj6P65E3rCNrr3Br5wabJA5yD8iKVHIUnmbDcjgcwohxd01hqhAfHkGbpsfW7rVneezm8-9aYVsCYSm5h7tHyi8FyK2YmKct1SvWyzEo9593AJTmidvHNDKBkExupDDxMZwZ6NtUUjQc45g');
      setHeroImage(url);
    };
    loadHero();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background-light dark:bg-background-dark overflow-x-hidden">
      
      {/* Left Side: Hero Section */}
      <div className="lg:w-1/2 relative bg-[#e7f3eb] dark:bg-[#0d1b12] flex flex-col items-center justify-center p-8 lg:p-20 overflow-hidden shrink-0">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#13ec5b 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
          {/* Main Illustration */}
          <div 
            className="w-full aspect-square max-w-[280px] md:max-w-[360px] lg:max-w-[440px] bg-center bg-no-repeat bg-contain rounded-[3rem] shadow-2xl mb-8 lg:mb-12 animate-in zoom-in duration-700"
            style={{
              backgroundImage: `url("${heroImage}")`,
            }}
          />
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-main dark:text-white leading-tight">
              {mode === 'login' ? 'Học mà chơi, Chơi mà học!' : 'Khám phá Tiếng Việt cùng AI!'}
            </h1>
            <p className="text-base md:text-lg text-[#4c9a66] font-medium max-w-sm mx-auto">
              Cùng khám phá thế giới Tiếng Việt phong phú với người bạn đồng hành thông minh.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 bg-white dark:bg-background-dark transition-all min-h-[600px]">
        <div className="w-full max-w-md mx-auto flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-tight">
              {mode === 'login' ? 'Xin chào bé!' : 'Chào mừng bé!'}
            </h2>
            <p className="text-[#4c9a66] text-base md:text-lg font-medium">
              {mode === 'login' ? 'Vui lòng đăng nhập để bắt đầu học nhé.' : 'Tạo tài khoản để lưu lại tiến trình học tập.'}
            </p>
          </div>

          {/* Switcher */}
          <div className="flex p-1.5 bg-[#e7f3eb] dark:bg-[#1a2e22] rounded-full relative h-14 w-full shadow-inner">
            <div 
              className={`w-1/2 h-full absolute top-0 p-1 transition-all duration-300 ease-in-out ${mode === 'login' ? 'left-0' : 'left-1/2'}`}
            >
              <div className="w-full h-full bg-white dark:bg-[#2f4b38] rounded-full shadow-md"></div>
            </div>
            <button 
              onClick={() => setMode('login')}
              className={`relative z-10 flex-1 flex items-center justify-center text-sm md:text-base font-bold transition-colors ${mode === 'login' ? 'text-text-main dark:text-white' : 'text-gray-500'}`}
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => setMode('register')}
              className={`relative z-10 flex-1 flex items-center justify-center text-sm md:text-base font-bold transition-colors ${mode === 'register' ? 'text-text-main dark:text-white' : 'text-gray-500'}`}
            >
              Đăng ký
            </button>
          </div>

          {/* Render Active Form */}
          {mode === 'login' ? (
            <LoginView onLogin={onLogin} onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterView onRegister={onLogin} onSwitchToLogin={() => setMode('login')} />
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthView;
