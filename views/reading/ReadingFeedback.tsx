
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
  onNext: () => void;
}

const ReadingFeedback: React.FC<ReadingFeedbackProps> = ({ 
  score, 
  accuracy, 
  feedback, 
  wordComparison, 
  actualTranscription,
  canGoNext, 
  onNext 
}) => {
  const displayAccuracy = accuracy <= 1 ? accuracy * 100 : accuracy;
  const normalizedScore = score > 5 ? (score / 20) : score;
  const displayScore = score > 5 ? Math.round(score) : score.toFixed(1);

  // Tính toán đường tròn
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayAccuracy / 100) * circumference;

  return (
    <section className="animate-in fade-in slide-in-from-top-6 duration-700 border-t border-[#2a4535] pt-12 mt-8 pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(19,236,91,0.1)]">
            <span className="material-symbols-outlined filled text-3xl">analytics</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white">Kết quả luyện đọc</h3>
        </div>
        
        {canGoNext && (
          <button 
            onClick={onNext}
            className="group flex items-center gap-3 bg-primary text-[#0d1b12] px-10 py-4 rounded-full font-black shadow-[0_10px_30px_rgba(19,236,91,0.3)] hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all"
          >
            Bài tiếp theo
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* accuracy Card - Tinh chỉnh theo hình ảnh yêu cầu */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-[#1a3322] rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="relative size-48 flex items-center justify-center mb-6">
            <svg className="size-full transform -rotate-90">
              <circle 
                cx="96" 
                cy="96" 
                r={radius} 
                stroke="currentColor" 
                strokeWidth="12" 
                fill="transparent" 
                className="text-white/5" 
              />
              <circle 
                cx="96" 
                cy="96" 
                r={radius} 
                stroke="currentColor" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                className="text-primary transition-all duration-1000 ease-out" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white tracking-tighter leading-none">{Math.round(displayAccuracy)}%</span>
              <span className="text-[11px] font-black text-primary/80 uppercase tracking-widest mt-2">Chính xác</span>
            </div>
          </div>

          <div className="flex gap-1 text-yellow-400 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`material-symbols-outlined text-2xl transition-all duration-500 ${i < Math.floor(normalizedScore) ? 'filled scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'text-white/10'}`}>
                star
              </span>
            ))}
          </div>
          
          <div className="px-5 py-2 rounded-full bg-white/5 border border-white/5">
            <p className="text-xs font-bold text-gray-400">Điểm đánh giá: <span className="text-white">{displayScore}/5</span></p>
          </div>
        </div>

        {/* Lời khuyên & So sánh chi tiết */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-[#1a3322] rounded-[3rem] p-10 border border-white/5 shadow-xl flex items-start gap-6">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <span className="material-symbols-outlined text-3xl filled">record_voice_over</span>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-black text-xl text-white">Lời khuyên của cô:</h4>
              <p className="text-xl md:text-2xl text-gray-300 italic leading-relaxed font-medium">
                "{feedback}"
              </p>
            </div>
          </div>

          <div className="bg-[#1a3322] rounded-[3rem] p-10 border border-white/5 shadow-xl">
            <h4 className="font-black text-xl mb-10 flex items-center gap-4 text-white">
              <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">spellcheck</span>
              </div>
              So sánh bài đọc chi tiết
            </h4>

            <div className="space-y-12">
              <div className="relative pl-6 border-l-2 border-white/10">
                <div className="absolute -left-1.5 top-0 size-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Văn bản mẫu (Bé nên đọc)</p>
                <div className="flex flex-wrap gap-x-3 gap-y-4 text-xl md:text-2xl font-medium text-white/40">
                  {wordComparison.map((item, idx) => (
                    <span 
                      key={idx}
                      className={`transition-colors duration-300 ${item.status === 'missing' ? 'text-red-500/80 line-through decoration-2' : ''}`}
                    >
                      {item.target}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative pl-6 border-l-2 border-white/10">
                <div className="absolute -left-1.5 top-0 size-3 rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
                <p className="text-[11px] font-black text-primary/80 uppercase tracking-widest mb-4">AI nghe thấy bé đọc</p>
                <div className="flex flex-wrap gap-x-3 gap-y-5 text-2xl md:text-3xl font-black">
                  {wordComparison.map((item, idx) => {
                    if (item.status === 'missing') return null;
                    return (
                      <span 
                        key={idx}
                        className={`transition-all duration-300 ${
                          item.status === 'correct' 
                          ? 'text-primary' 
                          : 'text-red-500 underline decoration-red-500/50 underline-offset-[12px] decoration-4'
                        }`}
                      >
                        {item.actual}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 text-[11px] font-black text-gray-500 uppercase tracking-widest border-t border-white/5 pt-8">
              <div className="flex items-center gap-2.5">
                <div className="size-2.5 rounded-full bg-primary shadow-[0_0_5px_rgba(19,236,91,0.5)]"></div>
                <span>Phát âm đúng</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="size-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                <span>Đọc sai/nhầm</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="size-2.5 rounded-full border-2 border-red-500 border-dashed"></div>
                <span>Bị đọc thiếu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingFeedback;
