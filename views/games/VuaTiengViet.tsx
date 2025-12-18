
import React from 'react';
import { AppView, User } from '../../types';

interface VuaTiengVietProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
}

const VuaTiengViet: React.FC<VuaTiengVietProps> = ({ setView, user }) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-[#4c9a66] dark:text-[#8abf9e]">
        <button 
          onClick={() => setView('dashboard')}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
        >
          <span className="material-symbols-outlined text-lg">home</span>
          Trang chủ
        </button>
        <span className="material-symbols-outlined text-base opacity-50">chevron_right</span>
        <button 
          onClick={() => setView('games')}
          className="hover:text-primary transition-colors font-medium"
        >
          Trò chơi
        </button>
        <span className="material-symbols-outlined text-base opacity-50">chevron_right</span>
        <span className="font-bold text-text-main dark:text-white">Vua Tiếng Việt</span>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-[#e7f3eb] dark:border-[#2a4030]">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-1/3 rounded-xl overflow-hidden aspect-[4/3] relative shadow-lg group">
            <div 
              className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBlNn1eZLKN6rt2m4uiDEaTHzK2gC4HlEhlgaXWDc1s9UHnxJhHGJ_qQLIOMCltppSxT3K_tJf-v8WAl3Fv9FKadELdvrqbNwdU58k7GQ6lO8fhrujRCDAwEySn84F8rLf_rt0lVsc5SbGGCcEHfPanErqmN0pPiK5Jp6HtTjArgBZYGPTOL12IQboTrGPfmOcACjwYRP8vDTOuqA6MnMnDeAh0kz0y-QR_Psjm1NjyjVrf5Y8PPCFO9rPjUCKXpwpow7KyDvK-bw")' }}
            ></div>
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-orange-500 text-base">star_half</span> Vừa
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full h-full justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider border border-primary/20">
                  Đánh vần
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                  Từ vựng
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-main dark:text-white mb-4 tracking-tight">Vua Tiếng Việt</h1>
              <p className="text-[#4c9a66] dark:text-[#8abf9e] text-lg leading-relaxed max-w-2xl">
                Thử thách khả năng ngôn ngữ của bé! Hãy sắp xếp lại các chữ cái lộn xộn để tìm ra từ ngữ bí ẩn. Trò chơi giúp bé cải thiện khả năng đánh vần và mở rộng vốn từ vựng phong phú.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-[#e7f3eb] dark:border-[#2a4030] bg-[#f9fbf9] dark:bg-[#152e20]/50 -mx-2 px-2 sm:mx-0 sm:px-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#4c9a66] dark:text-[#8abf9e] font-medium uppercase">Thời gian</p>
                  <p className="font-bold text-base leading-none mt-0.5">60 giây</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                  <span className="material-symbols-outlined">quiz</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#4c9a66] dark:text-[#8abf9e] font-medium uppercase">Số câu hỏi</p>
                  <p className="font-bold text-base leading-none mt-0.5">10 Câu</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <button className="flex-1 sm:flex-none bg-primary hover:bg-[#0fd650] text-[#0d1b12] px-10 py-4 rounded-full font-black shadow-xl shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg group">
                <span className="material-symbols-outlined group-hover:animate-bounce">play_circle</span>
                BẮT ĐẦU CHƠI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VuaTiengViet;
