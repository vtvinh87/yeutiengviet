
import React from 'react';

interface ReadingExerciseDisplayProps {
  imageUrl: string;
  text: string;
  isSpeaking: boolean;
  onSpeak: () => void;
}

const ReadingExerciseDisplay: React.FC<ReadingExerciseDisplayProps> = ({ imageUrl, text, isSpeaking, onSpeak }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-soft group">
          <img 
            src={imageUrl} 
            alt="Exercise illustration"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled">volume_up</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Nghe đọc mẫu</span>
              <span className="text-xs text-gray-500">Cô giáo AI</span>
            </div>
          </div>
          <button 
            onClick={onSpeak}
            disabled={isSpeaking}
            className={`size-10 rounded-full bg-primary text-text-main hover:bg-primary-hover flex items-center justify-center shadow-lg transition-colors disabled:opacity-50`}
          >
            <span className={`material-symbols-outlined filled ${isSpeaking ? 'animate-pulse' : ''}`}>
              {isSpeaking ? 'volume_up' : 'play_arrow'}
            </span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-10 shadow-soft border border-gray-100 dark:border-white/5 min-h-[320px] flex items-center justify-center">
          <p className="text-2xl md:text-3xl leading-relaxed font-medium text-center italic">
            "{text}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReadingExerciseDisplay;
