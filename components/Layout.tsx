
import React, { useState, useRef, useEffect } from 'react';
import { AppView, User } from '../types';
import MobileMenu from './MobileMenu';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  user: User;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, isDarkMode, toggleDarkMode, onLogout, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user.role === 'admin';
  const isStoriesView = activeView === 'stories';
  const isLiveView = activeView === 'live';
  const isFullHeightView = isStoriesView || isLiveView;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: 'home' },
    { id: 'reading', label: 'Luyện đọc', icon: 'menu_book' },
    { id: 'stories', label: 'Kể chuyện', icon: 'headphones' },
    { id: 'dictionary', label: 'Tra từ', icon: 'translate' },
    { id: 'live', label: 'Trò chuyện AI', icon: 'forum' },
    { id: 'games', label: 'Trò chơi', icon: 'sports_esports' }
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display">
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#102216]/90 backdrop-blur-md border-b border-[#e7f3eb] dark:border-[#2a4535]">
        <div className="flex items-center justify-between px-4 py-3 md:px-10 lg:px-20 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined filled text-2xl">school</span>
            </div>
            <h1 className="text-text-main dark:text-white text-lg md:text-xl font-black tracking-tight">
              Yêu Tiếng Việt
            </h1>
          </div>

          <nav className="hidden xl:flex items-center gap-6 lg:gap-8">
            {navItems.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setView(nav.id as AppView)}
                className={`text-sm font-bold transition-all flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  activeView === nav.id 
                    ? 'text-primary bg-primary/5' 
                    : 'text-text-main dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeView === nav.id ? 'filled' : ''}`}>{nav.icon}</span>
                {nav.label}
              </button>
            ))}
            
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>

            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <div className="relative" ref={menuRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent active:border-primary/20"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div 
                  className="h-9 w-9 rounded-full bg-center bg-cover border-2 border-primary shadow-sm" 
                  style={{backgroundImage: `url("${user.avatar}")`}}
                ></div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-sm font-black truncate max-w-[100px]">{user.name}</span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{user.grade}</span>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 bg-primary/5 dark:bg-primary/10 border-b border-gray-100 dark:border-white/5">
                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Tài khoản</p>
                    <p className="text-sm font-bold truncate">{user.email || user.username}</p>
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={() => { setView('profile'); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-gray-400">account_circle</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Hồ sơ cá nhân</span>
                        <span className="text-[10px] text-gray-500">Cài đặt & Thông tin</span>
                      </div>
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => { setView('admin'); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-gray-400">admin_panel_settings</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">Quản trị hệ thống</span>
                          <span className="text-[10px] text-gray-500">Nội dung & Người dùng</span>
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="border-t border-gray-100 dark:border-white/5 py-2">
                    <button 
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
                    >
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-red-500">logout</span>
                      <span className="text-sm font-bold group-hover:text-red-500">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          <button className="xl:hidden text-text-main dark:text-white p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        activeView={activeView}
        setView={setView}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        onLogout={onLogout}
        user={user}
      />

      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 ${isStoriesView ? 'py-0 md:px-0 lg:px-0' : 'py-6 md:px-10 lg:px-20'}`}>
        {children}
      </main>

      {!isFullHeightView && (
        <footer className="py-8 bg-[#f8fcf9] dark:bg-[#102216] border-t border-[#e7f3eb] dark:border-[#2a4535]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <span className="material-symbols-outlined text-primary filled">school</span>
              <span className="font-bold tracking-tight">Yêu Tiếng Việt</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 Dự án Giáo dục Sáng tạo cho học sinh tiểu học Việt Nam.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
