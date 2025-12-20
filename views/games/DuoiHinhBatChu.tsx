
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User } from '../../types';
import { getAiInstance } from '../../services/geminiClient';
import { Type } from "@google/genai";
import { aiTeacherService } from '../../services/aiTeacherService';
import { dataService } from '../../services/dataService';

interface PuzzleChallenge {
  word: string;
  imageDescription: string;
  category: string;
  hint: string;
  imageUrl?: string;
}

interface DuoiHinhBatChuProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  onAwardExp?: (amount: number) => void;
}

const DuoiHinhBatChu: React.FC<DuoiHinhBatChuProps> = ({ setView, user, onAwardExp }) => {
  const [gameState, setGameState] = useState<'landing' | 'loading' | 'playing' | 'finished'>('landing');
  
  // Game Data State
  const [challenge, setChallenge] = useState<PuzzleChallenge | null>(null);
  const [nextChallenge, setNextChallenge] = useState<PuzzleChallenge | null>(null);
  
  // Gameplay State
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [userInput, setUserInput] = useState<{ char: string; poolIdx: number }[]>([]);
  const [letterPool, setLetterPool] = useState<{ char: string; used: boolean }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentPoints, setCurrentPoints] = useState(20);
  const [isSaving, setIsSaving] = useState(false);
  
  const timerRef = useRef<any>(null);
  const TOTAL_ROUNDS = 5;
  const MAX_TIME = 30;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (gameState === 'playing' && isCorrect === null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, isCorrect, timeLeft]);

  // Dynamic Scoring Logic based on Time
  useEffect(() => {
    if (timeLeft > 20) setCurrentPoints(20);      // 0-10s đầu: 100%
    else if (timeLeft > 10) setCurrentPoints(15); // 10-20s: 75%
    else setCurrentPoints(10);                    // 20-30s: 50%
  }, [timeLeft]);

  const handleTimeOut = () => {
    aiTeacherService.speak("Hết giờ mất rồi! Bé cố gắng ở câu sau nhé.");
    setIsCorrect(false);
    setTimeout(() => {
      handleNextRound();
    }, 2000);
  };

  // --- CORE AI & DATA LOGIC ---

  /**
   * Hàm chuyên biệt để lấy 1 câu đố (từ AI hoặc DB)
   * Tách biệt khỏi state để dùng cho cả load ban đầu và preload
   */
  const fetchSingleChallenge = async (): Promise<PuzzleChallenge | null> => {
    const ai = getAiInstance();
    const loadFromDB = async () => {
      const loaded = await dataService.getRandomGameContent('DUOI_HINH_BAT_CHU', 1);
      return loaded && loaded.length > 0 ? loaded[0] : null;
    };

    if (!ai) return await loadFromDB();

    try {
      // Danh sách chủ đề phong phú để chọn ngẫu nhiên
      const themes = [
        "Thành ngữ hoặc Tục ngữ Việt Nam (VD: Mẹ tròn con vuông, Ăn quả nhớ kẻ trồng cây)",
        "Địa danh nổi tiếng ở Việt Nam (VD: Hạ Long, Đà Lạt, Sài Gòn, Chợ Bến Thành)",
        "Món ăn đặc sản Việt Nam (VD: Bánh chưng, Phở Bò, Bún Đậu)",
        "Đồ vật quen thuộc nhưng dùng từ ghép (VD: Máy bay, Xe đạp, Bút chì, Đồng hồ)",
        "Hiện tượng thiên nhiên (VD: Mưa rào, Cầu vồng, Bão táp)",
        "Các loại quả hoặc cây cối (VD: Thanh Long, Mãng Cầu, Hoa Phượng)",
        "Hoạt động vui chơi dân gian (VD: Thả diều, Kéo co, Ô ăn quan)",
        "Cảm xúc hoặc tính cách (VD: Vui vẻ, Dũng cảm, Thông minh)"
      ];
      
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      const prompt = `Bạn là chuyên gia thiết kế trò chơi "Đuổi hình bắt chữ" (Visual Puns) đầy sáng tạo.
      Hãy tạo 1 câu đố Tiếng Việt MỚI LẠ cho học sinh lớp ${user.grade}.
      
      YÊU CẦU QUAN TRỌNG:
      1. CHỦ ĐỀ CỤ THỂ CHO LẦN NÀY: ${randomTheme}.
      2. TRÁNH TUYỆT ĐỐI các từ quá cũ như: Cá Sấu, Bàn Là, Học Lỏm, Ngũ Cốc. Hãy tìm từ mới mẻ hơn.
      3. Đáp án: Từ ghép hoặc Cụm từ (2-4 tiếng).
      4. Mô tả hình ảnh (imageDescription): Phải mô tả một bức tranh HÀI HƯỚC, ẨN DỤ, ghép nghĩa từ các hình ảnh khác nhau (Wordplay).
         - Ví dụ muốn đoán "Thất Vọng": Vẽ số 7 (Thất) đang nhìn cái Vòng (Vọng).
         - Ví dụ muốn đoán "Bánh Hỏi": Vẽ cái bánh bao có dấu chấm hỏi ở trên.
      5. Trả về JSON.`;

      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              imageDescription: { type: Type.STRING },
              category: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["word", "imageDescription", "category", "hint"]
          },
          // Tăng temperature để AI sáng tạo hơn
          temperature: 1.2 
        }
      });

      const puzzleData = JSON.parse(textResponse.text || '{}');
      
      // Tạo ảnh 1:1 với phong cách 3D hoạt hình vui nhộn
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A funny, clever, vibrant 3D cartoon illustration representing a visual pun: ${puzzleData.imageDescription}. The image should strictly follow the visual pun logic described. Bright lighting, solid clean background, high quality.` }]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      let imageUrl = "";
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      return { ...puzzleData, imageUrl };
    } catch (error) {
      console.error("AI Error:", error);
      return await loadFromDB();
    }
  };

  /**
   * Bắt đầu game mới
   */
  const startNewGame = async () => {
    setScore(0);
    setRound(1);
    setGameState('loading');
    setNextChallenge(null);

    // Load câu đầu tiên
    const firstChallenge = await fetchSingleChallenge();
    
    if (firstChallenge) {
      setChallenge(firstChallenge);
      prepareLetterPool(firstChallenge.word);
      setGameState('playing');
      setTimeLeft(MAX_TIME);
      
      // Ngay lập tức Preload câu tiếp theo
      preloadNext();
    } else {
      alert("Hệ thống đang bận, bé quay lại sau nhé!");
      setGameState('landing');
    }
  };

  /**
   * Hàm Preload chạy ngầm
   */
  const preloadNext = async () => {
    console.log("Đang tải ngầm câu tiếp theo...");
    const next = await fetchSingleChallenge();
    if (next) {
      setNextChallenge(next);
      console.log("Đã tải xong câu tiếp theo!");
    }
  };

  const handleNextRound = async () => {
    if (round < TOTAL_ROUNDS) {
      // Logic chuyển câu hỏi
      if (nextChallenge) {
        // Nếu đã có hàng sẵn (Preload xong) -> Dùng luôn
        setChallenge(nextChallenge);
        prepareLetterPool(nextChallenge.word);
        setNextChallenge(null); // Clear buffer
        setRound(prev => prev + 1);
        setTimeLeft(MAX_TIME);
        setIsCorrect(null);
        
        // Gọi preload cho câu kế tiếp nữa (n+2)
        preloadNext();
      } else {
        // Nếu chưa preload kịp -> Hiện loading và chờ tải
        setGameState('loading');
        const freshChallenge = await fetchSingleChallenge();
        if (freshChallenge) {
          setChallenge(freshChallenge);
          prepareLetterPool(freshChallenge.word);
          setRound(prev => prev + 1);
          setGameState('playing');
          setTimeLeft(MAX_TIME);
          setIsCorrect(null);
          preloadNext();
        } else {
          // Fallback nếu lỗi
          setGameState('finished');
        }
      }
    } else {
      setGameState('finished');
      if (onAwardExp) onAwardExp(score); // Score đã cộng dồn rồi
    }
  };

  const handleSavePuzzle = async () => {
    if (!challenge) return;
    setIsSaving(true);
    const success = await dataService.saveGameContent('DUOI_HINH_BAT_CHU', challenge);
    setIsSaving(false);
    if (success) alert("Đã lưu câu đố vào kho!");
  };

  // --- GAMEPLAY LOGIC ---

  const prepareLetterPool = (word: string) => {
    const cleanWord = word.toUpperCase().replace(/\s/g, '');
    const letters = cleanWord.split('');
    const alphabet = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY";
    while (letters.length < 14) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      letters.push(randomChar);
    }
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setLetterPool(letters.map(char => ({ char, used: false })));
    setUserInput([]);
  };

  const handleCharSelect = (idx: number) => {
    if (letterPool[idx].used || isCorrect !== null || !challenge) return;
    const cleanWord = challenge.word.toUpperCase().replace(/\s/g, '');
    if (userInput.length >= cleanWord.length) return;

    const newPool = [...letterPool];
    newPool[idx].used = true;
    setLetterPool(newPool);
    setUserInput([...userInput, { char: newPool[idx].char, poolIdx: idx }]);
  };

  const handleRemoveChar = (inputIdx: number) => {
    if (isCorrect !== null) return;
    const removed = userInput[inputIdx];
    const newUserInput = userInput.filter((_, i) => i !== inputIdx);
    setUserInput(newUserInput);
    const newPool = [...letterPool];
    newPool[removed.poolIdx].used = false;
    setLetterPool(newPool);
  };

  const checkAnswer = () => {
    if (!challenge) return;
    const target = challenge.word.toUpperCase().replace(/\s/g, '');
    const current = userInput.map(u => u.char).join('');

    if (current === target) {
      setIsCorrect(true);
      setScore(prev => prev + currentPoints); // Cộng điểm động theo thời gian
      aiTeacherService.speak(`Đúng rồi! Bé nhận được ${currentPoints} điểm.`);
      
      setTimeout(() => {
        handleNextRound();
      }, 1500);
    } else {
      setIsCorrect(false);
      aiTeacherService.speak("Chưa đúng rồi, bé nhìn kỹ lại hình nhé!");
      setTimeout(() => setIsCorrect(null), 1000);
    }
  };

  // --- RENDER ---

  if (gameState === 'landing') {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('games')} className="text-[#4c9a66] hover:text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined">arrow_back</span> Quay lại
          </button>
        </div>
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-12 text-center shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-64 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="size-48 bg-gradient-to-br from-orange-300 to-orange-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce relative z-10">
            <span className="material-symbols-outlined text-8xl text-white filled">image_search</span>
          </div>
          <div className="space-y-4 z-10">
            <h1 className="text-5xl font-black tracking-tight">Đuổi Hình Bắt Chữ</h1>
            <p className="text-xl text-gray-500 font-medium max-w-md mx-auto">
              Nhìn hình AI vẽ và đoán từ. Bé hãy trả lời thật nhanh để nhận nhiều điểm nhé!
            </p>
            <div className="flex justify-center gap-4 text-sm font-bold text-gray-400">
               <span className="flex items-center gap-1"><span className="material-symbols-outlined text-green-500">timer</span> 10s đầu: 20đ</span>
               <span className="flex items-center gap-1"><span className="material-symbols-outlined text-yellow-500">timer</span> 10s giữa: 15đ</span>
               <span className="flex items-center gap-1"><span className="material-symbols-outlined text-red-500">timer</span> 10s cuối: 10đ</span>
            </div>
          </div>
          <button 
            onClick={startNewGame}
            className="h-16 px-12 bg-primary hover:bg-primary-hover text-[#102216] font-black rounded-full shadow-lg text-xl transition-all hover:scale-105 z-10"
          >
            Bắt đầu chơi
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-2xl font-black">Cô giáo AI đang vẽ câu đố...</h3>
          <p className="text-gray-500 font-medium">Bé chờ một xíu nhé!</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto w-full text-center py-12 animate-in zoom-in-95">
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-10 shadow-2xl border border-primary/20">
          <div className="size-32 mx-auto bg-primary rounded-full flex items-center justify-center mb-8 shadow-lg">
            <span className="material-symbols-outlined text-6xl text-white filled">workspace_premium</span>
          </div>
          <h2 className="text-4xl font-black mb-4">Hoàn thành thử thách!</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Tổng điểm</p>
              <p className="text-4xl font-black text-primary">{score}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Phần thưởng</p>
              <p className="text-4xl font-black text-orange-500">+{score} EXP</p>
            </div>
          </div>
          <button onClick={startNewGame} className="w-full h-14 bg-primary text-text-main font-bold rounded-full mb-4 hover:scale-105 transition-transform">Chơi ván mới</button>
          <button onClick={() => setView('games')} className="w-full h-14 bg-gray-100 dark:bg-white/5 font-bold rounded-full">Quay lại</button>
        </div>
      </div>
    );
  }

  const targetChars = challenge?.word.toUpperCase().replace(/\s/g, '').split('') || [];

  // Tính toán màu sắc thanh thời gian
  let timerColor = 'bg-primary';
  if (timeLeft <= 10) timerColor = 'bg-red-500';
  else if (timeLeft <= 20) timerColor = 'bg-yellow-500';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center font-black text-xl">
            {round}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Màn chơi</p>
            <span className="font-bold">{round}/{TOTAL_ROUNDS}</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="flex-1 mx-4 sm:mx-8">
           <div className="flex justify-between items-end mb-1">
              <span className={`font-black text-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-text-main dark:text-white'}`}>
                {timeLeft}s
              </span>
              <span className="text-xs font-bold text-gray-400">
                Thưởng: <span className="text-primary">{currentPoints}đ</span>
              </span>
           </div>
           <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
             <div 
               className={`h-full ${timerColor} transition-all duration-1000 ease-linear`} 
               style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
             ></div>
           </div>
        </div>

        <div className="flex items-center gap-4">
          {user.role === 'admin' && (
             <button 
               onClick={handleSavePuzzle}
               disabled={isSaving}
               className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
               title="Lưu câu đố này"
             >
               {isSaving ? <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined filled text-lg">save</span>}
             </button>
          )}

          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase text-right">Tổng điểm</p>
             <p className="font-black text-2xl text-primary text-right">{score}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 md:p-10 shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center gap-8 relative">
        {/* Preload Indicator */}
        {nextChallenge && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full animate-in fade-in">
             <span className="material-symbols-outlined text-green-600 text-sm">cloud_done</span>
             <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Câu sau đã sẵn sàng</span>
          </div>
        )}

        <div className="relative w-full max-w-md aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white dark:border-[#2a4030] bg-gray-100 dark:bg-black/20 group">
          {challenge?.imageUrl ? (
            <img 
              src={challenge.imageUrl} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="AI Puzzle" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs text-white font-bold uppercase tracking-widest shadow-lg border border-white/10">
            Gợi ý: {challenge?.category}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          {/* Đáp án */}
          <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
            {targetChars.map((_, i) => (
              <div 
                key={i} 
                onClick={() => i < userInput.length && handleRemoveChar(i)}
                className={`size-12 md:size-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all cursor-pointer transform hover:-translate-y-1 ${
                  userInput[i] 
                  ? 'bg-primary text-[#102216] shadow-[0_4px_0px_0px_#0ea841]' 
                  : 'bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-transparent'
                } ${isCorrect === false && userInput[i] ? 'bg-red-500 text-white shadow-[0_4px_0px_0px_#b91c1c] animate-shake' : ''}`}
              >
                {userInput[i]?.char}
              </div>
            ))}
          </div>

          {/* Kho chữ cái */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-2xl">
            {letterPool.map((item, idx) => (
              <button
                key={idx}
                disabled={item.used || isCorrect !== null}
                onClick={() => handleCharSelect(idx)}
                className={`size-11 md:size-12 rounded-lg font-bold text-xl transition-all border-b-4 ${
                  item.used 
                    ? 'bg-gray-200 dark:bg-white/10 text-transparent border-transparent opacity-30 scale-90' 
                    : 'bg-white dark:bg-[#2a4030] border-gray-200 dark:border-black/20 text-[#102216] dark:text-white hover:border-primary active:translate-y-0.5 active:border-b-0 shadow-sm'
                }`}
              >
                {!item.used && item.char}
              </button>
            ))}
          </div>

          <button 
            onClick={checkAnswer}
            disabled={userInput.length !== targetChars.length || isCorrect !== null}
            className={`h-16 px-16 rounded-full font-black text-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
              userInput.length === targetChars.length && isCorrect === null
              ? 'bg-primary text-[#102216] shadow-primary/30 hover:scale-105' 
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCorrect === true ? (
              <span className="material-symbols-outlined text-3xl filled">check_circle</span>
            ) : "KIỂM TRA"}
          </button>
        </div>
      </div>

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

export default DuoiHinhBatChu;
