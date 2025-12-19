
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User } from '../../types';
import { getAiInstance } from '../../services/geminiClient';
import { Type } from "@google/genai";
import { aiTeacherService } from '../../services/aiTeacherService';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface RungChuongVangProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  onAwardExp?: (amount: number) => void;
}

const RungChuongVang: React.FC<RungChuongVangProps> = ({ setView, user, onAwardExp }) => {
  const [gameState, setGameState] = useState<'landing' | 'loading' | 'playing' | 'finished'>('landing');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1); // 1-indexed for UI
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  
  // Fix: Replaced NodeJS.Timeout with any because the application runs in a browser environment where setInterval returns a number
  const timerRef = useRef<any>(null);
  const TOTAL_QUESTIONS = 10;

  // Hàm gọi AI tạo câu hỏi
  const generateQuestion = async (num: number): Promise<Question> => {
    const ai = getAiInstance();
    if (!ai) {
      return {
        question: `Câu hỏi dự phòng số ${num}: Từ nào sau đây viết đúng chính tả?`,
        options: ["Rành mạch", "Dành mạch", "Giành mạch", "Rành mặch"],
        correctIndex: 0,
        explanation: "'Rành mạch' có nghĩa là rõ ràng, dễ hiểu."
      };
    }

    const prompt = `Bạn là cô giáo tiểu học hiền hậu. Tạo 1 câu hỏi trắc nghiệm Tiếng Việt vui nhộn cho học sinh lớp ${user.grade || '2'}. 
    Câu hỏi số ${num} trong cuộc thi Rung Chuông Vàng. 
    Nội dung: Đố vui, từ vựng, hoặc ngữ pháp nhẹ nhàng phù hợp lứa tuổi.
    Trả về định dạng JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  };

  // Khởi động game: Nạp sẵn Câu 1 và Câu 2
  const startGame = async () => {
    setGameState('loading');
    setQuestions([]);
    setScore(0);
    setQuestionNumber(1);
    
    try {
      // Nạp song song Q1 và Q2 để nhanh hơn
      const [q1, q2] = await Promise.all([
        generateQuestion(1),
        generateQuestion(2)
      ]);
      
      setQuestions([q1, q2]);
      setGameState('playing');
      setTimeLeft(15);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error("Lỗi khởi động game:", error);
      alert("Cô giáo AI đang chuẩn bị thêm câu hỏi, bé đợi xíu nhé!");
      setGameState('landing');
    }
  };

  // Nạp sẵn câu hỏi tiếp theo trong nền
  const preloadQuestion = async (num: number) => {
    if (num > TOTAL_QUESTIONS || isPreloading) return;
    
    setIsPreloading(true);
    try {
      const nextQ = await generateQuestion(num);
      setQuestions(prev => [...prev, nextQ]);
    } catch (error) {
      console.error(`Lỗi nạp sẵn câu ${num}:`, error);
    } finally {
      setIsPreloading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const currentQ = questions[questionNumber - 1];
    if (index === currentQ?.correctIndex) {
      setScore(prev => prev + 1);
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 1000);
      aiTeacherService.speak("Đúng rồi! Bé giỏi quá.");
    } else {
      aiTeacherService.speak("Tiếc quá, chưa đúng rồi. Bé cố gắng ở câu sau nhé!");
    }

    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nextQuestion = () => {
    if (questionNumber < TOTAL_QUESTIONS) {
      const nextNum = questionNumber + 1;
      
      // Kiểm tra xem câu tiếp theo đã được nạp xong chưa
      if (!questions[nextNum - 1]) {
        // Nếu AI chưa nạp kịp (mạng chậm), hiển thị trạng thái chờ một chút
        setGameState('loading');
        // Đợi 1 giây rồi thử lại hoặc sẽ tự chuyển khi có dữ liệu (ở đây ta đơn giản hóa bằng cách nạp lại)
        preloadQuestion(nextNum).then(() => {
          setGameState('playing');
          finishMovingToNext(nextNum);
        });
        return;
      }

      finishMovingToNext(nextNum);
    } else {
      setGameState('finished');
      const finalExp = score * 10;
      if (onAwardExp) onAwardExp(finalExp);
    }
  };

  const finishMovingToNext = (nextNum: number) => {
    setQuestionNumber(nextNum);
    setTimeLeft(15);
    setIsAnswered(false);
    setSelectedAnswer(null);
    
    // Khi sang câu n, nạp sẵn câu n+1 (ở đây preload n+1 vì questionNumber đã là n)
    // Nếu chúng ta đang ở Câu 2, nạp sẵn Câu 3
    if (nextNum + 1 <= TOTAL_QUESTIONS && !questions[nextNum]) {
      preloadQuestion(nextNum + 1);
    }
  };

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsAnswered(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, isAnswered, timeLeft, questionNumber]);

  const currentQuestion = questions[questionNumber - 1];

  // Landing Screen
  if (gameState === 'landing') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-[#4c9a66]">
          <button onClick={() => setView('games')} className="hover:text-primary transition-colors flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Quay lại
          </button>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 md:p-12 shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center text-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="size-40 md:size-56 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl relative z-10 animate-bounce duration-[3s]">
            <span className="material-symbols-outlined text-7xl md:text-9xl text-white filled drop-shadow-lg">notifications_active</span>
          </div>

          <div className="z-10 flex flex-col gap-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Rung Chuông Vàng</h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-lg">
              Vượt qua {TOTAL_QUESTIONS} câu đố Tiếng Việt hóc búa để dành quyền rung chiếc chuông vàng danh giá!
            </p>
          </div>

          <button 
            onClick={startGame}
            className="h-16 px-12 bg-primary text-[#102216] font-black rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 text-xl flex items-center gap-3 z-10"
          >
            <span className="material-symbols-outlined filled">play_arrow</span>
            Vào thi ngay
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="size-24 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-yellow-500 text-3xl animate-pulse">notifications</span>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black mb-2">Đang nạp câu hỏi...</h3>
          <p className="text-gray-500 font-medium">Cô giáo AI đang tìm câu đố hay nhất cho bé!</p>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto w-full text-center py-12 animate-in zoom-in-95">
        <div className="bg-white dark:bg-surface-dark rounded-[3rem] p-10 shadow-2xl border border-yellow-200/50">
          <div className="size-40 mx-auto bg-yellow-400 rounded-full flex items-center justify-center mb-8 shadow-xl animate-pulse">
            <span className="material-symbols-outlined text-7xl text-white filled">emoji_events</span>
          </div>
          <h2 className="text-4xl font-black mb-4">Chúc mừng bé!</h2>
          <p className="text-xl text-gray-500 mb-8 font-medium">Bé đã hoàn thành bài thi với kết quả:</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
              <p className="text-sm text-gray-400 font-bold uppercase mb-1">Số câu đúng</p>
              <p className="text-4xl font-black text-primary">{score}/{TOTAL_QUESTIONS}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
              <p className="text-sm text-gray-400 font-bold uppercase mb-1">Phần thưởng</p>
              <p className="text-4xl font-black text-yellow-500">+{score * 10} EXP</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={startGame}
              className="w-full h-14 bg-primary text-[#102216] font-black rounded-full shadow-lg hover:bg-primary-hover transition-all"
            >
              Thi lại màn này
            </button>
            <button 
              onClick={() => setView('games')}
              className="w-full h-14 bg-white dark:bg-white/5 text-gray-500 font-bold rounded-full transition-all"
            >
              Quay lại danh sách trò chơi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
            {questionNumber}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Câu hỏi</p>
            <p className="font-black text-sm">Tiến trình: {questionNumber}/{TOTAL_QUESTIONS}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`size-14 rounded-full border-4 ${timeLeft < 5 ? 'border-red-500 text-red-500 animate-pulse' : 'border-primary text-primary'} flex items-center justify-center text-2xl font-black shadow-inner`}>
            {timeLeft}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Điểm số</p>
            <p className="font-black text-sm text-yellow-500">{score} điểm</p>
          </div>
          <div className={`size-12 rounded-xl bg-yellow-400 flex items-center justify-center text-white shadow-lg ${isRinging ? 'animate-ping' : ''}`}>
            <span className="material-symbols-outlined filled">notifications</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 md:p-12 shadow-soft border border-gray-100 dark:border-white/5 flex flex-col gap-8">
        <div className="text-center min-h-[80px] flex items-center justify-center">
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-text-main dark:text-white">
            {currentQuestion?.question}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion?.options.map((opt, idx) => {
            const isCorrect = idx === currentQuestion.correctIndex;
            const isSelected = idx === selectedAnswer;
            
            let btnClass = "bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:border-primary/50 transition-all";
            if (isAnswered) {
              if (isCorrect) btnClass = "bg-primary/20 border-primary text-emerald-700 dark:text-primary";
              else if (isSelected) btnClass = "bg-red-500/10 border-red-500 text-red-500";
              else btnClass = "bg-gray-50 dark:bg-white/5 opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(idx)}
                className={`p-6 rounded-2xl flex items-center gap-4 text-left group ${btnClass}`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center font-black shrink-0 ${
                  isAnswered && isCorrect ? 'bg-primary text-white' : 'bg-white dark:bg-white/10 shadow-sm group-hover:bg-primary transition-colors'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-lg font-bold">{opt}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-4 p-6 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/10 animate-in slide-in-from-bottom-2">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined filled">lightbulb</span>
              </div>
              <div>
                <p className="font-black text-primary mb-1">Giải thích từ Cô Giáo AI:</p>
                <p className="text-gray-600 dark:text-gray-300 font-medium italic leading-relaxed">
                  {currentQuestion?.explanation}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={nextQuestion}
                className="h-14 px-10 bg-primary text-[#102216] font-black rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {questionNumber < TOTAL_QUESTIONS ? 'Câu tiếp theo' : 'Xem kết quả'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isPreloading && gameState === 'playing' && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-surface-dark px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 animate-in slide-in-from-right-4">
          <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Cô đang soạn câu hỏi tiếp theo...</span>
        </div>
      )}

      <style>{`
        @keyframes ring {
          0% { transform: rotate(0); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(-15deg); }
          75% { transform: rotate(10deg); }
          100% { transform: rotate(0); }
        }
        .animate-ring { animation: ring 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default RungChuongVang;
