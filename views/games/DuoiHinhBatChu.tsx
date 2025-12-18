
import React from 'react';
import { AppView, User } from '../../types';

interface DuoiHinhBatChuProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  // Added onAwardExp to interface to fix type mismatch in GameDetailView
  onAwardExp?: (amount: number) => void;
}

// Destructured onAwardExp from props
const DuoiHinhBatChu: React.FC<DuoiHinhBatChuProps> = ({ setView, user, onAwardExp }) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-[1000px] mx-auto w-full">
      {/* Game Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setView('games')}
            className="size-10 rounded-full bg-white dark:bg-surface-dark border border-[#e7f3eb] dark:border-[#2a4030] flex items-center justify-center hover:bg-primary/10 transition-colors shadow-sm text-[#4c9a66]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Đuổi Hình Bắt Chữ</h1>
            <p className="text-xs sm:text-sm text-[#4c9a66] dark:text-[#8abf9e]">Màn 1: Khởi động</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark rounded-full border border-[#e7f3eb] dark:border-[#2a4030] shadow-sm">
            <span className="material-symbols-outlined text-yellow-500 filled">star</span>
            <span className="font-bold">1,250</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm text-emerald-800 dark:text-primary font-bold">
            <span>Câu 3/10</span>
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-4 sm:p-8 shadow-soft border border-[#e7f3eb] dark:border-[#2a4030] flex flex-col items-center gap-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden absolute top-0 left-0">
          <div className="h-full bg-primary w-[30%] rounded-full"></div>
        </div>

        {/* Image Display */}
        <div className="w-full max-w-lg aspect-video sm:aspect-[4/3] bg-gray-100 dark:bg-black/20 rounded-2xl shadow-sm border-4 border-white dark:border-[#2a4030] relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqrUvoIZfr_ga_cClK1o54tevcwhDhVkf9aMUNRTFJ-tDxSg4XOd3L3mAV60EpLjwbxO-nkBMPKazaBgy-nEZhcQhG2i8Q9DN79pNdnushaEqh-DzMM0SlqPxzjLaOopSC3krQj0X3ZZudxOu9mvC0USNB3xhJEWbAVCic7UuPPW32arJln33_ODrdnHVlri_23FZIXWJ4qePEIF8z3RMmhNydLHOpZwFg6QQber6wMQVomuEsZDCXyfEQGcZiLVkK8W1T31XD6w")' }}
          ></div>
          <button className="absolute bottom-3 right-3 size-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
        </div>

        {/* Gameplay Logic Area */}
        <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
          <div className="text-center">
            <p className="text-[#4c9a66] dark:text-[#8abf9e] font-medium mb-1">Hãy đoán xem hình ảnh trên đang nói về điều gì?</p>
          </div>

          {/* Answer Slots */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {['C', 'A'].map((char, i) => (
              <div key={i} className="size-12 sm:size-14 bg-primary text-[#0d1b12] rounded-xl flex items-center justify-center text-2xl font-black shadow-[0_4px_0px_0px_#0ea841] cursor-pointer hover:translate-y-0.5 hover:shadow-none transition-all">
                {char}
              </div>
            ))}
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="size-12 sm:size-14 bg-[#f6f8f6] dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-2xl font-black text-transparent">
                _
              </div>
            ))}
          </div>

          <div className="w-24 h-1 bg-gray-100 dark:bg-white/5 rounded-full"></div>

          {/* Letter Pool */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-2xl px-2">
            {['C', 'H', 'E', 'P', 'A', 'G', 'O', 'M', 'L', 'U', 'A', 'N'].map((char, i) => {
              const used = ['C', 'A'].includes(char);
              return (
                <button 
                  key={i} 
                  disabled={used}
                  className={`size-11 sm:size-12 rounded-lg font-bold text-xl transition-all border border-b-4 ${
                    used 
                      ? 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed border-transparent shadow-none' 
                      : 'bg-white dark:bg-[#2a4030] text-[#0d1b12] dark:text-white shadow-[0_4px_0px_0px_rgba(13,27,18,0.1)] border-gray-200 dark:border-black/20 hover:-translate-y-1 hover:border-primary active:translate-y-0 active:shadow-none'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-4 mt-4 max-w-md">
            <button className="w-full sm:w-1/3 h-14 rounded-2xl border-2 border-yellow-400 text-yellow-600 dark:text-yellow-400 font-bold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 flex items-center justify-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined">lightbulb</span> Gợi ý
            </button>
            <button className="w-full sm:w-2/3 h-14 rounded-2xl bg-primary text-[#0d1b12] font-black shadow-lg shadow-primary/30 hover:bg-[#0fd650] flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 text-lg">
              <span className="material-symbols-outlined filled">check_circle</span> Kiểm tra
            </button>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="flex justify-center w-full">
        <button className="text-[#4c9a66] dark:text-[#8abf9e] font-semibold hover:text-primary transition-colors flex items-center gap-1 text-sm">
          Câu hỏi tiếp theo <span className="material-symbols-outlined text-lg">skip_next</span>
        </button>
      </div>

      <div className="h-10"></div>
    </div>
  );
};

export default DuoiHinhBatChu;
