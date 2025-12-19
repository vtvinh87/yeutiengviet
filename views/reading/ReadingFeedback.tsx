
import React from 'react';

interface WordResult {
  text: string;
  status: 'correct' | 'incorrect' | 'skipped';
}

interface ReadingFeedbackProps {
  score: number;
  accuracy: number;
  feedback: string;
  words: WordResult[];
  canGoNext: boolean;
  onNext: () => void;
}

const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({ score, accuracy, feedback, words, canGoNext, onNext }) => {
  // Normalize accuracy: if it's a decimal (e.g., 0.9), convert to percentage (90)
  // This fixes the issue where 90% was displaying as 0.9%
  const displayAccuracy = accuracy <= 1 ? accuracy * 100 : accuracy;
  
  // Normalize score: if it's > 5 (e.g., 88), it's likely a percentage out of 100, scale it to 5
  const normalizedScore = score > 5 ? (score / 20) : score;
  const displayScore = score > 5 ? Math.round(score) : score.toFixed(1);

  return (
    <section className="animate-in fade-in slide-in-from-top-4 duration-700 border-t border-dashed border-gray-200 dark:border-white/10 pt-8 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary">auto_awesome</span>
          <h3 className="text-xl font-bold">Phản hồi từ Cô Giáo AI</h3>
        </div>
        {canGoNext && (
          <button 
            onClick={onNext}
            className="flex items-center gap-2 bg-primary text-text-main px-6 py-3 rounded-full font-bold shadow-lg hover:bg-primary-hover transition-all animate-bounce"
          >
            Tiếp theo
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-shrink-0 min-w-[240px] flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5 pb-6 lg:pb-0 lg:pr-6">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter">{displayScore}</span>
              <span className="text-lg text-gray-500 font-medium">/ 5</span>
            </div>
            <div className="flex gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined ${i < Math.floor(normalizedScore) ? 'filled' : ''}`}>
                  star
                </span>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Độ chính xác</span>
                <span className="font-bold text-primary">{displayAccuracy.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{width: `${displayAccuracy}%`}}></div>
              </div>
            </div>
          </div>
          <div className="flex-grow space-y-4">
            <h4 className="font-bold text-lg">Nhận xét chi tiết</h4>
            <p className="text-gray-600 dark:text-gray-300 italic mb-4">"{feedback}"</p>
            <div className="p-6 bg-gray-50 dark:bg-black/20 rounded-xl leading-loose text-xl flex flex-wrap gap-2">
              {words.map((w, idx) => (
                <span 
                  key={idx}
                  className={`px-1 rounded transition-colors ${
                    w.status === 'correct' 
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                      : w.status === 'incorrect' 
                      ? 'text-red-500 underline decoration-wavy decoration-red-500 underline-offset-4 font-bold' 
                      : 'text-gray-400'
                  }`}
                >
                  {w.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingFeedback;
