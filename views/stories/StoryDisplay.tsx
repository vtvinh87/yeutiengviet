
import React from 'react';
import { Story } from '../../types';

interface StoryDisplayProps {
  story: Story;
  onAskAI: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onAskAI }) => {
  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8fcf9] dark:bg-[#0d1b12]">
      {/* Breadcrumbs & AI Button */}
      <div className="p-6 pb-2 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Trang chủ</span>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-primary">Góc kể chuyện</span>
        </div>
        <button 
          onClick={onAskAI}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-emerald-700 dark:text-primary rounded-full transition-colors text-sm font-bold"
        >
          <span className="material-symbols-outlined text-lg">psychology</span>
          Hỏi cô giáo AI
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 custom-scrollbar">
        <div className="max-w-3xl mx-auto py-4">
          <div className="mb-8">
            <div className="w-full aspect-[21/9] rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden mb-6 shadow-lg relative group">
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${story.image}")` }}
              ></div>
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                Nguồn: Truyện cổ tích Việt Nam
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white leading-tight">
              {story.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              {story.summary}
            </p>
          </div>

          <div className="space-y-6 text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
            {story.content.split('\n\n').map((para, i) => (
              <div key={i} className={`relative group cursor-pointer p-2 rounded-xl transition-all ${i === 1 ? 'bg-primary/10 dark:bg-primary/5' : ''}`}>
                <p>
                  {para}
                  {i === 1 && (
                    <span className="inline-flex align-middle ml-2">
                      <button className="bg-primary text-text-main rounded-full p-1 size-6 flex items-center justify-center hover:scale-110 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">help</span>
                      </button>
                    </span>
                  )}
                </p>
              </div>
            ))}
            <p className="text-gray-400 italic text-base mt-8">(Còn nữa...)</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryDisplay;
