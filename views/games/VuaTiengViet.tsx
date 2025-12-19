
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User } from '../../types';
import { getAiInstance } from '../../services/geminiClient';
import { Type } from "@google/genai";
import { aiTeacherService } from '../../services/aiTeacherService';

interface WordChallenge {
  word: string;
  hint: string;
  category: string;
}

interface VuaTiengVietProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  onAwardExp?: (amount: number) => void;
}

const VuaTiengViet: React.FC<VuaTiengVietProps> = ({ setView, user, onAwardExp }) => {
  const [gameState, setGameState] = useState<'landing' | 'loading' | 'playing' | 'finished'>('landing');
  const [challenges, setChallenges] = useState<WordChallenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [shuffledLetters, setShuffledLetters] = useState<{ char: string; originalIdx: number; used: boolean }[]>([]);
  const [userInput, setUserInput] = useState<{ char: string; fromIdx: number }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Xáo trộn chuỗi
  const shuffleString = (str: string) => {
    const arr = str.replace(/\s/g, '').split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Gọi AI tạo bộ từ vựng giáo dục
  const fetchChallenges = async () => {
    setGameState('loading');
    const ai = getAiInstance();
    
    // Dữ liệu dự phòng nếu AI gặp sự cố
    const fallback = [
      { word: "TRƯỜNG HỌC", hint: "Nơi bé gặp thầy cô và bạn bè mỗi ngày", category: "Nhà trường" },
      { word: "GIA ĐÌNH", hint: "Nơi có ba mẹ và những người yêu thương bé nhất", category: "Yêu thương" },
      { word: "CÂY XANH", hint: "Lá của nó giúp không khí trong lành hơn", category: "Thiên nhiên" },
      { word: "CHĂM CHỈ", hint: "Bé học tập tốt và làm việc nhà giúp mẹ", category: "Đức tính" },
      { word: "QUÊ HƯƠNG", hint: "Nơi bé sinh ra và lớn lên", category: "Đất nước" }
    ];

    if (!ai) {
      setChallenges(fallback);
      initRound(fallback[0]);
      setGameState('playing');
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Bạn là một chuyên gia soạn giáo án Tiếng Việt tiểu học. 
        Hãy tạo 10 thử thách từ vựng cho học sinh ${user.grade}. 
        Yêu cầu:
        1. Từ vựng thuộc các chủ đề quen thuộc: Gia đình, Nhà trường, Thiên nhiên, Con vật, Đồ dùng học tập.
        2. Từ phải có ý nghĩa giáo dục, không dùng từ lóng hay từ quá khó.
        3. Mỗi từ từ 2-4 tiếng (ví dụ: "Học tập", "Con voi", "Hoa hồng").
        4. Gợi ý phải dễ thương, giúp bé tư duy để đoán từ.
        5. Trả về JSON array của các đối tượng {word, hint, category}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                hint: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["word", "hint", "category"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || '[]');
      const validData = data.length > 0 ? data : fallback;
      setChallenges(validData);
      initRound(validData[0]);
      setGameState('playing');
    } catch (error) {
      console.error("Lỗi tạo câu hỏi:", error);
      setChallenges(fallback);
      initRound(fallback[0]);
      setGameState('playing');
    }
  };

  const initRound = (challenge: WordChallenge) => {
    const normalizedWord = challenge.word.toUpperCase().replace(/\s/g, '');
    const shuffled = shuffleString(normalizedWord).map((c, i) => ({
      char: c,
      originalIdx: i,
      used: false
    }));
    setShuffledLetters(shuffled);
    setUserInput([]);
    setIsCorrect(null);
  };

  const handleTileClick = (idx: number) => {
    if (shuffledLetters[idx].used || isCorrect !== null) return;
    
    const newShuffled = [...shuffledLetters];
    newShuffled[idx].used = true;
    setShuffledLetters(newShuffled);
    
    setUserInput([...userInput, { char: newShuffled[idx].char, fromIdx: idx }]);
  };

  const handleRemoveLetter = (inputIdx: number) => {
    if (isCorrect !== null) return;
    
    const removed = userInput[inputIdx];
    const newUserInput = userInput.filter((_, i) => i !== inputIdx);
    setUserInput(newUserInput);
    
    const newShuffled = [...shuffledLetters];
    newShuffled[removed.fromIdx].used = false;
    setShuffledLetters(newShuffled);
  };

  const checkAnswer = () => {
    const target = challenges[currentIdx].word.toUpperCase().replace(/\s/g, '');
    const current = userInput.map(u => u.char).join('');
    
    if (current === target) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      
      const praises = ["Tuyệt vời!", "Bé giỏi quá!", "Chính xác luôn!", "Đúng rồi bé ơi!"];
      aiTeacherService.speak(praises[Math.floor(Math.random() * praises.length)]);
      
      setTimeout(() => nextQuestion(), 1500);
    } else {
      setIsCorrect(false);
      aiTeacherService.speak("Chưa đúng rồi, bé thử lại nhé.");
      setTimeout(() => {
        const resetShuffled = shuffledLetters.map(s => ({ ...s, used: false }));
        setShuffledLetters(resetShuffled);
        setUserInput([]);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < challenges.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      initRound(challenges[nextIdx]);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameState('finished');
    if (timerRef.current) clearInterval(timerRef.current);
    const bonus = score * 10;
    if (onAwardExp) onAwardExp(bonus);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, timeLeft]);

  if (gameState === 'landing') {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-[#4c9a66] dark:text-[#8abf9e]">
          <button onClick={() => setView('games')} className="hover:text-primary transition-colors flex items-center gap-1 font-black">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Quay lại kho trò chơi
          </button>
        </div>
        
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-10 md:p-16 shadow-soft border border-[#e7f3eb] dark:border-[#2a4030] flex flex-col items-center text-center gap-8 relative overflow-hidden">
           <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-10 -left-10 size-40 bg-blue-500/10 rounded-full blur-3xl"></div>
           
           <div className="size-48 md:size-64 bg-gradient-to-br from-[#13ec5b] to-emerald-600 rounded-[3rem] flex items-center justify-center shadow-2xl animate-bounce duration-[3s] relative z-10">
              <span className="material-symbols-outlined text-8xl md:text-9xl text-[#102216] filled">auto_awesome</span>
           </div>

           <div className="space-y-4 z-10">
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main dark:text-white">Vua Tiếng Việt</h1>
             <p className="text-xl text-gray-500 font-bold max-w-lg mx-auto leading-relaxed">
               Bé hãy trổ tài sắp xếp các chữ cái để tạo thành từ đúng nhé. Sẵn sàng chưa nào?
             </p>
           </div>

           <button 
             onClick={fetchChallenges} 
             className="h-20 px-16 bg-primary hover:bg-primary-hover text-[#102216] font-black rounded-full shadow-xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 text-2xl flex items-center gap-4 z-10"
           >
             Bắt đầu chinh phục
             <span className="material-symbols-outlined text-3xl">rocket_launch</span>
           </button>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8 animate-in fade-in">
        <div className="relative">
          <div className="size-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl animate-pulse">edit_note</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-700 dark:text-gray-200">Cô đang soạn từ vựng cho bé...</p>
          <p className="text-gray-400 font-bold mt-2 italic">Những từ vựng thật hay đang được chuẩn bị!</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto w-full text-center py-10 animate-in zoom-in-95">
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-12 shadow-2xl border border-primary/20">
          <div className="size-32 mx-auto bg-primary rounded-full flex items-center justify-center mb-8 shadow-xl">
            <span className="material-symbols-outlined text-6xl text-[#102216] filled">military_tech</span>
          </div>
          <h2 className="text-5xl font-black mb-4">Tuyệt vời quá!</h2>
          <p className="text-xl text-gray-500 mb-8 font-bold">Bé đã hoàn thành xuất sắc thử thách.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-[#f0faf3] dark:bg-white/5 p-8 rounded-[2rem] border border-primary/10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Đúng</p>
              <p className="text-5xl font-black text-primary">{score}/{challenges.length}</p>
            </div>
            <div className="bg-[#fff9f0] dark:bg-white/5 p-8 rounded-[2rem] border border-orange-100 dark:border-white/5">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nhận được</p>
              <p className="text-5xl font-black text-orange-500">+{score * 10} EXP</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setGameState('landing')} 
              className="h-16 bg-primary text-[#102216] font-black rounded-full shadow-lg hover:bg-primary-hover transition-all text-xl"
            >
              Thử lại lần nữa
            </button>
            <button 
              onClick={() => setView('games')} 
              className="h-16 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-black rounded-full transition-all"
            >
              Quay về kho trò chơi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentChallenge = challenges[currentIdx];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full pb-20">
      {/* Game Header */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-[#102216] text-3xl font-black shadow-inner">
            {currentIdx + 1}
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiến độ của bé</p>
            <div className="flex gap-2 mt-2">
              {challenges.map((_, i) => (
                <div key={i} className={`h-2.5 w-5 rounded-full transition-all duration-500 ${i < currentIdx ? 'bg-primary' : (i === currentIdx ? 'bg-primary/40 animate-pulse w-8' : 'bg-gray-200 dark:bg-white/10')}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`text-3xl font-black tabular-nums ${timeLeft < 10 ? 'text-red-500 animate-bounce' : 'text-primary'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
          <div className="w-24 h-2 bg-gray-100 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(timeLeft/60)*100}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm số</p>
             <p className="font-black text-2xl text-primary">{score}</p>
          </div>
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-3xl filled">stars</span>
          </div>
        </div>
      </div>

      {/* Play Area */}
      <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-6 md:p-12 shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center gap-8 relative">
        
        {/* Category Badge */}
        <div className="absolute top-6 left-6 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200 dark:border-blue-800 shadow-sm">
          Chủ đề: {currentChallenge.category}
        </div>

        <div className="bg-primary/5 dark:bg-primary/10 px-10 py-6 rounded-[2rem] border-2 border-dashed border-primary/20 flex items-center gap-4 w-full mt-6">
          <div className="size-12 rounded-full bg-primary flex items-center justify-center text-[#102216] shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-2xl">lightbulb</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 leading-relaxed">
            {currentChallenge.hint}
          </p>
        </div>

        {/* Selected Letters Slots */}
        <div className="flex flex-wrap justify-center gap-3 min-h-[90px] w-full max-w-2xl p-6 bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 shadow-inner">
          {userInput.map((u, i) => (
            <button 
              key={i} 
              onClick={() => handleRemoveLetter(i)}
              className={`size-16 md:size-20 rounded-2xl flex items-center justify-center text-4xl font-black transition-all transform hover:scale-110 active:scale-95 shadow-xl ${
                isCorrect === true ? 'bg-primary text-[#102216] scale-110' : (isCorrect === false ? 'bg-red-500 text-white animate-shake' : 'bg-white dark:bg-surface-dark border-4 border-primary text-primary')
              }`}
            >
              {u.char}
            </button>
          ))}
          {userInput.length < shuffledLetters.length && (
            <div className="size-16 md:size-20 rounded-2xl border-4 border-dashed border-gray-300 dark:border-gray-700 animate-pulse flex items-center justify-center text-gray-300">?</div>
          )}
        </div>

        {/* Letter Pool */}
        <div className="flex flex-col items-center gap-4 w-full">
           <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Chọn chữ cái để ghép từ:</p>
           <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
            {shuffledLetters.map((item, idx) => (
              <button
                key={idx}
                disabled={item.used || isCorrect !== null}
                onClick={() => handleTileClick(idx)}
                className={`size-16 md:size-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black transition-all shadow-lg border-b-8 ${
                  item.used 
                    ? 'bg-gray-100 dark:bg-white/5 text-transparent border-transparent opacity-30 scale-90 -translate-y-0.5 shadow-none' 
                    : 'bg-white dark:bg-[#2a4030] border-[#e2e8f0] dark:border-[#1a2e20] text-text-main dark:text-white hover:border-primary hover:-translate-y-1.5 active:translate-y-0 active:border-b-2'
                }`}
              >
                {!item.used && item.char}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex justify-center mt-4">
          <button 
            onClick={checkAnswer}
            disabled={userInput.length !== shuffledLetters.length || isCorrect !== null}
            className={`h-20 px-20 font-black rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-2xl flex items-center gap-4 ${
              userInput.length === shuffledLetters.length && isCorrect === null
              ? 'bg-primary text-[#102216] shadow-primary/40' 
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCorrect === true ? (
              <><span className="material-symbols-outlined text-4xl filled">check_circle</span> HOÀN THÀNH</>
            ) : (
              <>KIỂM TRA NGAY</>
            )}
          </button>
        </div>
      </div>

      {/* Toast status */}
      {isCorrect === false && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-10 py-5 rounded-full font-black shadow-2xl animate-bounce z-50 flex items-center gap-3">
            <span className="material-symbols-outlined filled">sentiment_very_dissatisfied</span>
            Ối! Sai mất rồi, thử lại nhé bé!
         </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default VuaTiengViet;
