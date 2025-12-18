
import React from 'react';
import { AppView, User } from '../../types';

interface RungChuongVangProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  // Added onAwardExp to interface to fix type mismatch in GameDetailView
  onAwardExp?: (amount: number) => void;
}

// Destructured onAwardExp from props
const RungChuongVang: React.FC<RungChuongVangProps> = ({ setView, user, onAwardExp }) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-[#4c9a66] dark:text-[#8abf9e]">
        <button 
          onClick={() => setView('games')}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quay lại danh sách
        </button>
        <span className="opacity-30">/</span>
        <span className="text-text-main dark:text-white font-bold">Rung Chuông Vàng</span>
      </div>

      <div className="w-full bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 border border-[#e7f3eb] dark:border-[#2a4030] shadow-soft flex flex-col-reverse lg:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="flex-1 z-10 w-full text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Kiến thức chung
            </span>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">star_half</span> Độ khó: Vừa
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-main dark:text-white mb-4 leading-tight">
            Rung Chuông Vàng
          </h1>
          <p className="text-base sm:text-lg text-[#4c9a66] dark:text-[#8abf9e] mb-8 max-w-xl mx-auto lg:mx-0">
            Tham gia cuộc thi trí tuệ, trả lời các câu đố vui về Tiếng Việt và cuộc sống để trở thành người chiến thắng và rung lên chiếc chuông vàng danh giá!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button className="w-full sm:w-auto bg-primary hover:bg-[#0fd650] text-[#0d1b12] px-8 h-14 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg">
              <span className="material-symbols-outlined text-3xl">play_circle</span>
              Bắt đầu chơi
            </button>
          </div>
        </div>
        <div 
          className="w-full lg:w-[45%] aspect-video lg:aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg transform lg:rotate-2 group-hover:rotate-0 transition-transform duration-500 ring-4 ring-white dark:ring-surface-dark" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAa5zXtyMeeyVwM8dGtmbVlgclcUbzlU5O7cQgY3I0iX0QwUc-vhU7ApQ4e1LYuVkijrvEmI8KxHK6KPPHQy3FEcJmWIVZRfkxpJjkiTRVwpEtz51IJ_9LOvWrrqNnBWWjDEN97Wkoq4E9WzPf85CpY5OLloI0b04xMa7YfEqKf24_LBqVUMOOUqNMscdHT7oCIw8KjEP2ew-YxAxzqeNwp_sljWNrK4irTFszn8bu_JH9j7QdWNTVE-VoxfEfRp2U2HCv6Q5GDMg")' }}
        ></div>
      </div>
    </div>
  );
};

export default RungChuongVang;
