
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User } from '../../types';
// Fix: Use createAiInstance instead of getAiInstance
import { createAiInstance } from '../../services/geminiClient';
import { Type } from "@google/genai";
import { aiTeacherService } from '../../services/aiTeacherService';

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
  const [challenge, setChallenge] = useState<PuzzleChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [userInput, setUserInput] = useState<{ char: string; poolIdx: number }[]>([]);
  const [letterPool, setLetterPool] = useState<{ char: string; used: boolean }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const TOTAL_ROUNDS = 5;

  const generateChallenge = async () => {
    setIsProcessing(true);
    
    // Fix: Use createAiInstance and handle potential initialization errors
    let ai;
    try {
      ai = createAiInstance();
    } catch (error) {
      console.error("AI Initialization failed:", error);
    }
    
    if (!ai) return;

    try {
      // Bước 1: Tạo nội dung câu đố bằng Gemini 3 Flash
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Bạn là chuyên gia trò chơi truyền hình "Đuổi hình bắt chữ". 
        Hãy tạo 1 câu đố Tiếng Việt cho học sinh lớp ${user.grade}. 
        Yêu cầu:
        1. Đáp án là một từ ghép hoặc thành ngữ quen thuộc (ví dụ: "CÁ CHÉP", "HỌC TẬP", "HOA HỒNG").
        2. Mô tả hình ảnh minh họa theo cách ẩn dụ hoặc ghép hình (ví dụ: Đáp án "CÁ CHÉP" -> mô tả: "Một con cá đang cầm một quyển vở để chép bài").
        3. Trả về JSON.`,
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
          }
        }
      });

      const puzzleData = JSON.parse(textResponse.text || '{}');
      
      // Bước 2: Tạo hình ảnh bằng Gemini 2.5 Flash Image
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A vibrant, clear, funny digital illustration for a "Catch the word" game: ${puzzleData.imageDescription}. 3D cartoon style, bright lighting, solid background.` }]
        },
        config: {
          imageConfig: { aspectRatio: "4:3" }
        }
      });

      let imageUrl = "";
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      const finalChallenge = { ...puzzleData, imageUrl };
      setChallenge(finalChallenge);
      prepareLetterPool(finalChallenge.word);
      setGameState('playing');
    } catch (error) {
      console.error("Lỗi tạo câu đố:", error);
      alert("Cô giáo AI đang vẽ hình hơi chậm, bé đợi xíu nhé!");
    } finally {
      setIsProcessing(false);
    }
  };

  const prepareLetterPool = (word: string) => {
    const cleanWord = word.toUpperCase().replace(/\s/g, '');
    const letters = cleanWord.split('');
    
    // Thêm các chữ cái ngẫu nhiên để làm nhiễu (tổng cộng 14 chữ)
    const alphabet = "AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY";
    while (letters.length < 14) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      letters.push(randomChar);
    }

    // Xáo trộn
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    setLetterPool(letters.map(char => ({ char, used: false })));
    setUserInput([]);
    setIsCorrect(null);
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
      setScore(prev => prev + 1);
      aiTeacherService.speak("Đúng rồi! Bé thông minh quá.");
      
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(prev => prev + 1);
          setGameState('loading');
          generateChallenge();
        } else {
          setGameState('finished');
          if (onAwardExp) onAwardExp(score * 20 + 20);
        }
      }, 2000);
    } else {
      setIsCorrect(false);
      aiTeacherService.speak("Chưa đúng rồi, bé nhìn kỹ lại hình nhé!");
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

  const startNewGame = () => {
    setScore(0);
    setRound(1);
    setGameState('loading');
    generateChallenge();
  };

  if (gameState === 'landing') {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('games')} className="text-[#4c9a66] hover:text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined">arrow_back</span> Quay lại
          </button>
        </div>
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-12 text-center shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center gap-8">
          <div className="size-48 bg-card-orange rounded-[2.5rem] flex items-center justify-center shadow-xl animate-bounce">
            <span className="material-symbols-outlined text-8xl text-orange-500 filled">image_search</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight">Đuổi Hình Bắt Chữ</h1>
            <p className="text-xl text-gray-500 font-medium max-w-md mx-auto">Nhìn hình AI vẽ và đoán xem đó là từ gì nhé! Trò chơi cực vui và bổ ích.</p>
          </div>
          <button 
            onClick={startNewGame}
            className="h-16 px-12 bg-primary hover:bg-primary-hover text-[#102216] font-black rounded-full shadow-lg text-xl transition-all hover:scale-105"
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
          <p className="text-gray-500 font-medium">Bé chờ một xíu để hình ảnh hiện ra nhé!</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto w-full text-center py-12">
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-10 shadow-2xl border border-primary/20">
          <div className="size-32 mx-auto bg-primary rounded-full flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-6xl text-white filled">workspace_premium</span>
          </div>
          <h2 className="text-4xl font-black mb-4">Hoàn thành thử thách!</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Điểm số</p>
              <p className="text-3xl font-black text-primary">{score}/{TOTAL_ROUNDS}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Phần thưởng</p>
              <p className="text-3xl font-black text-orange-500">+{score * 20 + 20} EXP</p>
            </div>
          </div>
          <button onClick={startNewGame} className="w-full h-14 bg-primary text-text-main font-bold rounded-full mb-4">Chơi ván mới</button>
          <button onClick={() => setView('games')} className="w-full h-14 bg-gray-100 dark:bg-white/5 font-bold rounded-full">Quay lại</button>
        </div>
      </div>
    );
  }

  const targetChars = challenge?.word.toUpperCase().replace(/\s/g, '').split('') || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-black">
            {round}
          </div>
          <span className="font-bold">Màn {round}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-500">Điểm: <span className="text-primary">{score}</span></span>
          <div className="w-32 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 md:p-10 shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center gap-8">
        <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-[#2a4030] bg-gray-100 dark:bg-black/20">
          {challenge?.imageUrl && (
            <img src={challenge.imageUrl} className="w-full h-full object-cover" alt="AI Puzzle" />
          )}
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] text-white font-bold uppercase tracking-widest">
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
                className={`size-12 md:size-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all cursor-pointer ${
                  userInput[i] 
                  ? 'bg-primary text-[#102216] shadow-[0_4px_0px_0px_#0ea841]' 
                  : 'bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-transparent'
                } ${isCorrect === false && userInput[i] ? 'bg-red-500 text-white shadow-[0_4px_0px_0px_#b91c1c] animate-shake' : ''}`}
              >
                {userInput[i]?.char}
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-white/5 max-w-xs"></div>

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
                    : 'bg-white dark:bg-[#2a4030] border-gray-200 dark:border-black/20 text-[#102216] dark:text-white hover:border-primary active:translate-y-0.5 active:border-b-0'
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
