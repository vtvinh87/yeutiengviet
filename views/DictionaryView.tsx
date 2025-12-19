
import React, { useState } from 'react';
import { DictionaryEntry } from '../types';
import { dictionaryService } from '../services/geminiService';

interface DictionaryViewProps {
  onAwardExp?: (amount: number) => void;
}

const DictionaryView: React.FC<DictionaryViewProps> = ({ onAwardExp }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await dictionaryService.defineWord(query);
      setResult(data);
      if (onAwardExp) onAwardExp(5); // Tra từ thành công được 5 EXP
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Trình duyệt của em không hỗ trợ phát âm tự động rồi.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      {/* Search Hero Section - Styled to match screenshot */}
      <section 
        className="w-full relative rounded-[2.5rem] overflow-hidden min-h-[480px] flex flex-col items-center justify-center p-8 md:p-12 text-center bg-cover bg-center shadow-2xl"
        style={{
          backgroundImage: 'linear-gradient(rgba(16, 34, 22, 0.75), rgba(16, 34, 22, 0.95)), url("https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200&auto=format&fit=crop")',
        }}
      >
        <div className="z-10 flex flex-col items-center w-full max-w-4xl">
          <h1 className="text-white text-4xl md:text-6xl font-black mb-6 tracking-tight animate-in fade-in slide-in-from-top-4 duration-700">
            Em muốn tìm hiểu từ gì?
          </h1>
          <h2 className="text-white/80 text-lg md:text-2xl font-medium mb-12 max-w-3xl animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">
            Nhập từ vựng em muốn tra cứu hoặc nhấn vào micro để nói nhé!
          </h2>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row w-full max-w-[760px] gap-4 animate-in fade-in zoom-in duration-700 delay-500">
            <div className="flex w-full flex-1 items-stretch rounded-full bg-white p-2 shadow-2xl group focus-within:ring-4 focus-within:ring-primary/20 transition-all">
              <div className="flex items-center justify-center pl-6 pr-3">
                <span className="material-symbols-outlined text-primary text-3xl">search</span>
              </div>
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-[#0d1b12] placeholder:text-gray-400 text-xl py-4 font-bold" 
                placeholder="Ví dụ: Thiên hà, Cây cối, Học tập..." 
              />
              <button 
                type="button" 
                className="flex items-center justify-center size-14 rounded-full bg-gray-100 hover:bg-primary/20 text-[#0d1b12] transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-2xl">mic</span>
              </button>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-full h-18 px-12 bg-primary hover:bg-primary-hover text-[#0d1b12] font-black text-xl shadow-[0_0_30px_rgba(19,236,91,0.4)] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="size-8 border-4 border-[#0d1b12]/30 border-t-[#0d1b12] rounded-full animate-spin"></div>
              ) : 'Tra từ'}
            </button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled text-2xl">auto_awesome</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Kết quả tìm kiếm</h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white dark:bg-[#1a3322] rounded-[2.5rem] p-6 md:p-10 shadow-soft border border-gray-100 dark:border-primary/10">
              <div className="flex flex-col-reverse md:flex-row gap-10 items-stretch">
                <div className="flex flex-[3] flex-col justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-4 py-1 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-widest">{result.type}</span>
                      <span className="px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest">{result.category}</span>
                    </div>
                    
                    <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-text-main dark:text-white">{result.word}</h3>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <button 
                        onClick={() => speakWord(result.word)}
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#2a4535] hover:bg-[#355642] text-white transition-all shadow-lg active:scale-95 group"
                      >
                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">volume_up</span>
                        <span className="font-bold text-base">Nghe phát âm</span>
                      </button>
                      <span className="text-gray-400 italic text-xl font-medium tracking-wide">
                        {result.phonetic}
                      </span>
                    </div>
                    
                    <p className="text-xl md:text-2xl leading-relaxed font-medium text-gray-700 dark:text-gray-200">
                      {result.definition}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <button className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-primary transition-all font-bold group">
                      <span className="material-symbols-outlined text-orange-400 group-hover:rotate-12 transition-transform">star</span>
                      Lưu từ này
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-primary transition-all font-bold group">
                      <span className="material-symbols-outlined text-blue-400 group-hover:translate-x-1 transition-transform">share</span>
                      Chia sẻ
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-[2] relative group min-h-[300px]">
                  <div className="absolute inset-0 bg-primary/20 rounded-[2rem] transform rotate-3 group-hover:rotate-1 transition-transform"></div>
                  <div 
                    className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-8 border-white dark:border-[#2d4234] shadow-2xl bg-cover bg-center transition-all group-hover:scale-[1.02]"
                    style={{backgroundImage: `url("${result.image}")`}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-[#1a3322] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">lightbulb</span>
                  </div>
                  <h4 className="text-xl font-black">Ví dụ minh họa</h4>
                </div>
                <ul className="flex flex-col gap-5">
                  {result.examples.map((ex, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="min-w-[8px] h-[8px] rounded-full bg-primary mt-3 shadow-[0_0_8px_rgba(19,236,91,0.5)]"></div>
                      <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200 font-medium">{ex}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#e7f3eb] dark:bg-[#152e20] p-8 rounded-[2rem] border border-primary/20 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <h4 className="text-xl font-black">Từ đồng nghĩa</h4>
                  </div>
                  <span className="text-[10px] bg-white dark:bg-black/40 px-3 py-1.5 rounded-full text-primary font-black uppercase tracking-widest border border-primary/20 shadow-sm">Mở rộng vốn từ</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.synonyms.map((syn, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { setQuery(syn); handleSearch(); }}
                      className="px-5 py-3 bg-white dark:bg-[#1a3322] text-text-main dark:text-white rounded-2xl shadow-sm hover:shadow-lg hover:text-primary hover:-translate-y-1 transition-all font-bold text-lg border border-transparent hover:border-primary/30"
                    >
                      {syn}
                    </button>
                  ))}
                  {result.synonyms.length === 0 && (
                    <p className="text-gray-500 italic text-sm">Không tìm thấy từ đồng nghĩa nào phù hợp.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="h-20"></div>
    </div>
  );
};

export default DictionaryView;
