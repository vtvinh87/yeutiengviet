
import React from 'react';
import { AppView, User } from '../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: AppView;
  setView: (view: AppView) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  onLogout: () => void;
  user: User;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  activeView, 
  setView, 
  toggleDarkMode, 
  isDarkMode,
  onLogout,
  user
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: 'home' },
    { id: 'stories', label: 'Kể chuyện', icon: 'headphones' },
    { id: 'games', label: 'Trò chơi', icon: 'sports_esports' },
    { id: 'reading', label: 'Luyện đọc', icon: 'menu_book' },
    { id: 'dictionary', label: 'Giải nghĩa từ', icon: 'translate' },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: 'account_circle' },
  ];

  return (
    // Đã đổi md:hidden thành xl:hidden để menu hoạt động trên cả Tablet
    <div className="fixed inset-0 z-[100] xl:hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-0 h-full w-[80%] max-sm:w-[85%] max-w-sm bg-white dark:bg-surface-dark shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl filled">school</span>
            </div>
            <span className="font-bold">Menu</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-text-main">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-2xl">
              <div 
                className="h-12 w-12 rounded-full border-2 border-primary bg-cover bg-center"
                style={{backgroundImage: `url("${user.avatar}")`}}
              />
              <div>
                <p className="font-bold truncate max-w-[150px]">{user.name}</p>
                <p className="text-xs text-primary font-medium">{user.grade}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 px-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as AppView);
                  onClose();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  activeView === item.id 
                    ? 'bg-primary text-text-main font-bold shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-3">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 text-sm font-medium"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              <span>Chế độ {isDarkMode ? 'sáng' : 'tối'}</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
               <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-5' : 'left-1'}`} />
            </div>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
