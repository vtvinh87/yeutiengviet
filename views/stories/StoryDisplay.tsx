
import React, { useState } from 'react';
import { Story } from '../../types';

interface StoryDisplayProps {
  story: Story;
  onAskAI: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onAskAI }) => {
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-[#0d1b12]">
      {/* Header Navigation */}
      <div className="p-6 pb-4 flex justify-between items-center shrink-0 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-[#0d1b12]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsReadingModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#0d1b12] hover:bg-primary-hover rounded-full transition-all text-sm font-black shadow-lg shadow-primary/20 transform hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">auto_stories</span>
            Đọc truyện
          </button>
        </div>
        <button 
          onClick={onAskAI}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all text-xs font-black border border-primary/20 shadow-lg shadow-primary/5"
        >
          <span className="material-symbols-outlined text-lg">psychology</span>
          Hỏi cô giáo AI
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl md:rounded-[2.5rem] bg-black/40 overflow-hidden mb-8 shadow-2xl relative group border border-white/5">
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url("${story.image}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-text-main dark:text-white leading-tight tracking-tighter mb-4">
              {story.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-500 dark:text-white/50 text-sm font-bold mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {story.duration}
              </div>
              <span className="hidden md:inline text-white/20">•</span>
              <p className="italic text-center lg:text-left">"{story.summary}"</p>
            </div>
          </div>

          <div className="space-y-8 text-xl md:text-2xl lg:text-3xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium pb-32 lg:pb-20">
            {story.content.split('\n\n').map((para, i) => (
              <div 
                key={i} 
                className={`relative group cursor-pointer p-6 rounded-2xl md:rounded-3xl transition-all border border-transparent ${
                  i === 1 ? 'bg-primary/5 dark:bg-white/5 border-primary/10 dark:border-white/10 shadow-inner' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <p>
                  {para}
                  {i === 1 && (
                    <span className="inline-flex align-middle ml-4">
                      <button className="bg-primary text-[#0d1b12] rounded-full p-2 size-8 flex items-center justify-center hover:scale-110 shadow-lg shadow-primary/30 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-base font-black">help</span>
                      </button>
                    </span>
                  )}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-center py-10 opacity-30">
              <div className="w-12 h-1 bg-primary rounded-full mx-2"></div>
              <p className="text-gray-400 italic text-base">Hết phần 1</p>
              <div className="w-12 h-1 bg-primary rounded-full mx-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Reading Modal */}
      {isReadingModalOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0a150e] animate-in fade-in duration-300 flex flex-col">
          {/* Modal Header */}
          <div className="shrink-0 p-6 flex justify-between items-center border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0a150e]/80 backdrop-blur-md sticky top-0">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">auto_stories</span>
              </div>
              <div>
                <h4 className="text-xl font-black text-text-main dark:text-white truncate max-w-[200px] md:max-w-md">
                  {story.title}
                </h4>
                <p className="text-xs font-bold text-primary uppercase">Chế độ đọc tập trung</p>
              </div>
            </div>
            <button 
              onClick={() => setIsReadingModalOpen(false)}
              className="size-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90 active:scale-90"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Modal Content - Focused Reading UI */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-20 lg:px-40 py-12 bg-white dark:bg-[#0a150e]">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center mb-16 text-center">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-[3rem] shadow-2xl mb-8 border-8 border-primary/10"
                />
                <h1 className="text-4xl md:text-6xl font-black text-text-main dark:text-white mb-4 tracking-tighter">
                  {story.title}
                </h1>
                <div className="w-24 h-2 bg-primary rounded-full mb-4"></div>
                <p className="text-xl text-gray-500 italic max-w-lg">
                  {story.summary}
                </p>
              </div>

              <div className="space-y-12 text-2xl md:text-4xl leading-[1.6] text-gray-800 dark:text-gray-200 font-medium pb-20">
                {story.content.split('\n\n').map((para, i) => (
                  <p key={i} className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                    {para}
                  </p>
                ))}
                
                <div className="pt-20 flex flex-col items-center gap-6 opacity-40">
                  <span className="material-symbols-outlined text-5xl text-primary">verified</span>
                  <p className="text-xl font-bold uppercase tracking-[0.2em]">Bé đã hoàn thành bài đọc!</p>
                  <button 
                    onClick={() => setIsReadingModalOpen(false)}
                    className="mt-4 px-10 py-4 bg-primary text-[#0d1b12] font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StoryDisplay;
