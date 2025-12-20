
import React from 'react';

interface ComparisonItem {
  target: string;
  actual: string;
  status: 'correct' | 'wrong' | 'missing' | 'extra';
}

interface ReadingFeedbackProps {
  score: number;
  accuracy: number;
  feedback: string;
  wordComparison: ComparisonItem[];
  actualTranscription: string;
  canGoNext: boolean;
  isPreloading?: boolean;
  onNext: () => void;
  onRetry?: () => void;
}

const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({ 
  score, 
  accuracy, 
  feedback, 
  wordComparison, 
  actualTranscription,
  canGoNext, 
  isPreloading,
  onNext,
  onRetry
}) => {
  const displayAccuracy = accuracy <= 1 ? accuracy * 100 : accuracy;
  const normalizedScore = score > 5 ? (score / 20) : score;
  const displayScore = score > 5 ? Math.round(score) : score.toFixed(1);
  const isExcellent = displayAccuracy >= 90;
  const isGood = displayAccuracy >= 70;

  // Tính toán đường tròn tiến độ
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayAccuracy / 100) * circumference;

  return (
    <section className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-[#2a4535]/50 pt-10 mt-8 pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined filled text-2xl">analytics</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Kết quả luyện đọc</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-text-main dark:text-white px-6 py-3.5 rounded-full font-bold transition-all active:scale-95 border border-transparent dark:border-white/5"
          >
            <span className="material-symbols-outlined">refresh</span>
            Đọc lại bài này
          </button>
          
          <button 
            onClick={onNext}
            disabled={isPreloading}
            className={`group flex items-center gap-3 bg-primary text-[#0d1b12] px-10 py-3.5 rounded-full font-black shadow-lg shadow-primary/20 transition-all ${
              isPreloading ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {isPreloading ? (
              <>
                <div className="size-4 border-2 border-[#0d1b12]/30 border-t-[#0d1b12] rounded-full animate-spin"></div>
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                Học bài tiếp theo
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform font-black">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-white dark:bg-[#1a3322]/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-soft relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 pointer-events-none"></div>
          
          <div className="relative size-44 flex items-center justify-center mb-4">
            <svg className="size-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(19,236,91,0.15)]">
              <circle 
                cx="88" 
                cy="88" 
                r={radius} 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                fill="transparent" 
                className="text-gray-100 dark:text-white/5" 
              />
              <circle 
                cx="88" 
                cy="88" 
                r={radius} 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                className={`${displayAccuracy >= 80 ? 'text-primary' : displayAccuracy >= 50 ? 'text-yellow-500' : 'text-orange-500'} transition-all duration-1000 ease-out`} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-text-main dark:text-white tracking-tighter drop-shadow-sm">{Math.round(displayAccuracy)}%</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">CHÍNH XÁC</span>
            </div>
          </div>

          <div className="flex gap-1.5 text-yellow-400 mb-4 h-8 items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`material-symbols-outlined text-xl transition-all duration-700 ${i < Math.floor(normalizedScore) ? 'filled scale-110 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-gray-200 dark:text-white/10'}`}>
                star
              </span>
            ))}
          </div>
          
          <div className="px-4 py-1.5 rounded-full bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Đánh giá: <span className="text-text-main dark:text-white ml-1">{displayScore}/5</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a3322]/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-soft flex items-start gap-5">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <span className="material-symbols-outlined text-2xl filled">auto_awesome</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="font-black text-lg text-text-main dark:text-white">Lời khuyên của cô:</h4>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 italic leading-relaxed font-medium">
                "{feedback}"
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a3322]/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-soft">
            <h4 className="font-black text-lg mb-8 flex items-center gap-3 text-text-main dark:text-white">
              <span className="material-symbols-outlined text-primary text-xl">spellcheck</span>
              Chi tiết các từ bé đã đọc
            </h4>

            {wordComparison.length > 0 ? (
              <div className="space-y-8">
                <div className="relative pl-5 border-l-2 border-gray-100 dark:border-white/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Văn bản mẫu</p>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-3 text-lg md:text-xl font-medium text-gray-300 dark:text-white/30">
                    {wordComparison.map((item, idx) => (
                      <span 
                        key={idx}
                        className={`${item.status === 'missing' ? 'text-red-500/60 line-through' : ''}`}
                      >
                        {item.target}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative pl-5 border-l-2 border-primary/30">
                  <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest mb-3">Bé đã đọc</p>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-4 text-xl md:text-2xl font-black">
                    {wordComparison.map((item, idx) => {
                      if (item.status === 'missing') return null;
                      return (
                        <span 
                          key={idx}
                          className={`${
                            item.status === 'correct' 
                            ? 'text-primary' 
                            : 'text-red-500 underline decoration-red-500/30 underline-offset-8 decoration-2'
                          }`}
                        >
                          {item.actual}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-gray-400 italic">Cô chưa nghe rõ nội dung, bé hãy thử nhấn "Đọc lại bài này" nhé!</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-t border-gray-100 dark:border-white/5 pt-6">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-primary shadow-[0_0_5px_rgba(19,236,91,0.4)]"></div>
                <span>Đọc đúng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]"></div>
                <span>Cần sửa lại</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingFeedback;
