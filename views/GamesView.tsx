
import React, { useState, useEffect } from 'react';
import { AppView, User } from '../types';
import { dataService, IMAGE_KEYS } from '../services/dataService';
import { getAiInstance } from '../services/geminiClient';
import { Type } from '@google/genai';
import { authService } from '../services/authService';

interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  difficulty: 'Dễ' | 'Vừa' | 'Khó';
  imageKey: string;
}

const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Rung chuông vàng',
    description: 'Trả lời các câu đố vui để rung được chiếc chuông vàng vinh quang.',
    category: 'Kiến thức chung',
    categoryColor: 'text-blue-500',
    difficulty: 'Vừa',
    imageKey: IMAGE_KEYS.GAME_RUNG_CHUONG_VANG
  },
  {
    id: '2',
    title: 'Vua Tiếng Việt',
    description: 'Thử thách ghép các chữ cái rời rạc thành từ có nghĩa nhanh nhất có thể.',
    category: 'Đánh vần',
    categoryColor: 'text-primary',
    difficulty: 'Vừa',
    imageKey: IMAGE_KEYS.GAME_VUA_TIENG_VIET
  },
  {
    id: '3',
    title: 'Đuổi hình bắt chữ',
    description: 'Nhìn hình ảnh gợi ý và đoán xem đó là câu ca dao, tục ngữ gì nhé.',
    category: 'Từ vựng',
    categoryColor: 'text-pink-500',
    difficulty: 'Dễ',
    imageKey: IMAGE_KEYS.GAME_DUOI_HINH_BAT_CHU
  }
];

interface DailyQuestion {
  question: string;
  answer: string;
  synonyms: string[]; // Thêm các biến thể đáp án đúng
}

interface GamesViewProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  onAwardExp?: (amount: number) => void;
}

const GameCard: React.FC<{ game: Game; onClick: () => void }> = ({ game, onClick }) => {
  const [imgUrl, setImgUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadImg = async () => {
      const url = await dataService.getSystemImage(game.imageKey, 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=800&auto=format&fit=crop');
      if (isMounted) setImgUrl(url);
    };
    loadImg();
    return () => { isMounted = false; };
  }, [game.imageKey]);

  return (
    <div className="group bg-white dark:bg-surface-dark rounded-2xl p-3 border border-[#e7f3eb] dark:border-[#2a4030] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-black/20">
        <div className={`absolute inset-0 bg-primary/5 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
        <img 
          src={imgUrl} 
          alt={game.title}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm z-10 text-text-main dark:text-white">
          <span className="material-symbols-outlined text-sm text-yellow-500">star</span> {game.difficulty}
        </div>
      </div>
      <div className="flex flex-col flex-1 px-2">
        <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${game.categoryColor}`}>{game.category}</span>
        <h4 className="text-xl font-bold mb-1">{game.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{game.description}</p>
        <button onClick={onClick} className="mt-auto w-full h-12 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-text-main dark:text-white font-bold group-hover:bg-primary group-hover:text-[#0d1b12] transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">play_arrow</span> Chơi ngay
        </button>
      </div>
    </div>
  );
};

const GamesView: React.FC<GamesViewProps> = ({ setView, user, onAwardExp }) => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [heroImage, setHeroImage] = useState('');
  const [dailyState, setDailyState] = useState<{
    open: boolean;
    loading: boolean;
    questions: DailyQuestion[];
    currentIdx: number;
    correctCount: number;
    finished: boolean;
    userAnswer: string;
    feedback: 'correct' | 'wrong' | null;
  }>({
    open: false,
    loading: false,
    questions: [],
    currentIdx: 0,
    correctCount: 0,
    finished: false,
    userAnswer: '',
    feedback: null
  });

  useEffect(() => {
    dataService.getSystemImage(IMAGE_KEYS.GAMES_HERO, '').then(setHeroImage);
  }, []);

  const hasPlayedToday = () => {
    if (!user.lastChallengeDate || user.lastChallengeDate === 'undefined') return false;
    const lastDate = new Date(user.lastChallengeDate).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
  };

  const startDailyChallenge = async () => {
    if (hasPlayedToday()) {
      alert("Bé đã hoàn thành thử thách hôm nay rồi. Hãy quay lại vào ngày mai nhé!");
      return;
    }

    setDailyState(prev => ({ ...prev, open: true, loading: true, questions: [], currentIdx: 0, correctCount: 0, finished: false, feedback: null }));
    
    const ai = getAiInstance();
    if (!ai) {
       // Dữ liệu giả khi không có AI
       const mockQuestions = [
         { question: "Con gì kêu meo meo?", answer: "Con mèo", synonyms: ["Mèo"] },
         { question: "1 + 1 bằng mấy?", answer: "2", synonyms: ["Hai"] },
         { question: "Mặt trời mọc ở hướng nào?", answer: "Đông", synonyms: ["Hướng Đông"] },
         { question: "Lá cờ Việt Nam màu gì?", answer: "Đỏ", synonyms: ["Màu đỏ", "Đỏ thắm"] },
         { question: "Thủ đô của Việt Nam là gì?", answer: "Hà Nội", synonyms: ["TP Hà Nội"] }
       ];
       setTimeout(() => {
         setDailyState(prev => ({ ...prev, questions: mockQuestions, loading: false }));
       }, 1000);
       return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tạo 5 câu đố Tiếng Việt ngắn gọn dành cho học sinh lớp ${user.grade}. Các câu đố nên thú vị, giáo dục. 
        Mỗi câu đố cung cấp một danh sách các đáp án đúng chấp nhận được (synonyms).
        Ví dụ: câu hỏi "Đồ vật dùng để viết bài?", đáp án chính: "Bút", synonyms: ["Cái bút", "Cây bút", "Bút mực"].
        Trả về JSON array: [ { "question": "...", "answer": "...", "synonyms": ["...", "..."] }, ... ]`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["question", "answer", "synonyms"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || '[]');
      setDailyState(prev => ({ ...prev, questions: data, loading: false }));
    } catch (err) {
      alert("Cô giáo đang bận chuẩn bị, bé đợi xíu nhé!");
      setDailyState(prev => ({ ...prev, open: false, loading: false }));
    }
  };

  const handleCheckAnswer = async () => {
    const currentQ = dailyState.questions[dailyState.currentIdx];
    const cleanInput = dailyState.userAnswer.toLowerCase().trim();
    
    // Kiểm tra đáp án chính và các từ đồng nghĩa
    const acceptable = [currentQ.answer.toLowerCase(), ...currentQ.synonyms.map(s => s.toLowerCase())];
    const isCorrect = acceptable.some(a => a === cleanInput || cleanInput.includes(a) || a.includes(cleanInput));

    if (isCorrect) {
      setDailyState(prev => ({ ...prev, feedback: 'correct', correctCount: prev.correctCount + 1 }));
      if (onAwardExp) onAwardExp(20); 
    } else {
      setDailyState(prev => ({ ...prev, feedback: 'wrong' }));
    }

    setTimeout(async () => {
      if (dailyState.currentIdx < 4) {
        setDailyState(prev => ({ ...prev, currentIdx: prev.currentIdx + 1, userAnswer: '', feedback: null }));
      } else {
        // Hoàn thành cả 5 câu - KHOÁ NGAY
        setDailyState(prev => ({ ...prev, finished: true, feedback: null }));
        await authService.markChallengeComplete(user.id);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="w-full">
        <div className="flex flex-col-reverse lg:flex-row gap-6 bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft items-center border border-[#e7f3eb] dark:border-[#2a4030]">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start p-2">
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-1 bg-primary/20 text-text-main dark:text-primary px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto lg:mx-0">
                <span className="material-symbols-outlined text-sm">celebration</span> Vui học mỗi ngày
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.02em]">Chào bé! Hôm nay chúng ta chơi gì nào?</h1>
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-[500px]">Khám phá thế giới Tiếng Việt qua các trò chơi thú vị giúp bé thông minh hơn.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start w-full">
              <button onClick={() => setView('game-detail', '2')} className="bg-primary hover:bg-[#0fd650] text-[#0d1b12] px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">play_circle</span> Chơi ngay
              </button>
              <button className="bg-transparent border-2 border-primary/30 hover:bg-primary/10 text-text-main dark:text-white px-6 h-12 rounded-full font-bold transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">leaderboard</span> Xem thành tích
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto lg:h-[320px] rounded-2xl bg-cover bg-center shadow-lg border-4 border-white dark:border-[#2d4234]" style={{ backgroundImage: `url("${heroImage || 'https://images.unsplash.com/photo-1610484826967-09c5720778c7'}")` }} />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: 'star', color: 'yellow-400', val: user.stars || 0, label: 'Ngôi sao tích lũy' },
          { icon: 'emoji_events', color: 'blue-400', val: `Level ${user.level}`, label: 'Cấp độ hiện tại' },
          { icon: 'local_fire_department', color: 'purple-400', val: `${user.streak} Ngày`, label: 'Chuỗi học tập' }
        ].map((s, i) => (
          <div key={i} className="bg-[#1a2e22] dark:bg-surface-dark p-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-xl group hover:bg-[#233f2e] transition-all">
            <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${i === 0 ? 'bg-yellow-400/20 text-yellow-400' : (i === 1 ? 'bg-blue-400/20 text-blue-400' : 'bg-purple-400/20 text-purple-400')}`}>
              <span className="material-symbols-outlined text-3xl filled">{s.icon}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white leading-tight">{s.val}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}

        <button 
          disabled={hasPlayedToday()}
          onClick={startDailyChallenge}
          className={`p-6 rounded-3xl border flex items-center justify-between cursor-pointer transition-all group shadow-xl relative overflow-hidden ${hasPlayedToday() ? 'bg-gray-800 border-gray-700 opacity-60' : 'bg-[#114b29] hover:bg-[#1a6b3b] border-primary/20'}`}
        >
          <div className="text-left relative z-10">
            <p className="font-black text-xl text-white">Thử thách ngày</p>
            <p className="text-xs font-bold text-primary/80 uppercase tracking-wider">
              {hasPlayedToday() ? 'Đã hoàn thành hôm nay ✨' : 'Làm 5 câu nhận +100 EXP & 5 ⭐'}
            </p>
          </div>
          <span className={`material-symbols-outlined text-white text-3xl group-hover:translate-x-2 transition-transform relative z-10 ${hasPlayedToday() ? 'text-primary' : ''}`}>
            {hasPlayedToday() ? 'task_alt' : 'arrow_forward'}
          </span>
        </button>
      </div>

      {/* Games List */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div><h3 className="text-3xl font-bold">Danh sách trò chơi</h3><p className="text-gray-500 mt-1">Chọn một trò chơi để luyện tập nhé!</p></div>
          <div className="flex flex-wrap gap-2">
            {['Tất cả', 'Đánh vần', 'Từ vựng', 'Ngữ pháp'].map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === filter ? 'bg-primary text-[#0d1b12]' : 'bg-white dark:bg-surface-dark border border-[#e7f3eb] dark:border-[#2a4030]'}`}>{filter}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_GAMES.filter(g => activeFilter === 'Tất cả' || g.category === activeFilter).map((game) => (
            <GameCard key={game.id} game={game} onClick={() => setView('game-detail', game.id)} />
          ))}
        </div>
      </div>

      {/* Daily Challenge Modal */}
      {dailyState.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !dailyState.loading && setDailyState(prev => ({ ...prev, open: false }))}></div>
          <div className="relative w-full max-w-xl bg-[#102216] border-2 border-primary/20 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
             {dailyState.loading ? (
               <div className="py-20 flex flex-col items-center gap-6">
                 <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                 <p className="text-primary font-black text-xl animate-pulse">Cô giáo AI đang soạn 5 thử thách...</p>
               </div>
             ) : dailyState.finished ? (
               <div className="flex flex-col items-center text-center gap-8 animate-in zoom-in">
                  <div className="size-32 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-2xl">
                     <span className="material-symbols-outlined text-6xl filled">emoji_events</span>
                  </div>
                  <div>
                    <h4 className="text-4xl font-black text-white mb-2">Hoàn thành thử thách!</h4>
                    <p className="text-[#4c9a66] text-xl font-bold">Bé đã trả lời đúng {dailyState.correctCount}/5 câu hỏi.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-gray-400 text-xs uppercase font-black mb-1">Kinh nghiệm</p>
                      <p className="text-3xl font-black text-primary">+{dailyState.correctCount * 20} EXP</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-gray-400 text-xs uppercase font-black mb-1">Ngôi sao</p>
                      <p className="text-3xl font-black text-yellow-400">+{dailyState.correctCount} ⭐</p>
                    </div>
                  </div>
                  <button onClick={() => setDailyState(prev => ({ ...prev, open: false }))} className="w-full h-16 bg-primary text-[#0d1b12] font-black rounded-full text-xl shadow-lg shadow-primary/20">Tuyệt vời!</button>
               </div>
             ) : (
               <div className="flex flex-col gap-8">
                 <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`h-2.5 w-10 rounded-full transition-all duration-500 ${i < dailyState.currentIdx ? 'bg-primary' : (i === dailyState.currentIdx ? 'bg-primary animate-pulse' : 'bg-white/10')}`} />
                      ))}
                    </div>
                    <span className="text-primary font-black">Câu {dailyState.currentIdx + 1}/5</span>
                 </div>

                 <div className="bg-white/5 p-8 rounded-[2rem] border-2 border-dashed border-primary/20">
                   <p className="text-2xl md:text-3xl text-white font-bold leading-relaxed italic text-center">
                     "{dailyState.questions[dailyState.currentIdx]?.question}"
                   </p>
                 </div>

                 <div className="space-y-4">
                   <div className="relative">
                     <input 
                       disabled={dailyState.feedback !== null}
                       type="text" 
                       value={dailyState.userAnswer}
                       onChange={(e) => setDailyState(prev => ({ ...prev, userAnswer: e.target.value }))}
                       onKeyDown={(e) => e.key === 'Enter' && !dailyState.feedback && handleCheckAnswer()}
                       placeholder="Câu trả lời của bé..."
                       className={`w-full h-16 bg-white/5 border-2 rounded-2xl text-white text-center text-2xl font-bold transition-all uppercase focus:ring-0 ${dailyState.feedback === 'correct' ? 'border-primary bg-primary/10' : (dailyState.feedback === 'wrong' ? 'border-red-500 bg-red-500/10' : 'border-white/10 focus:border-primary')}`}
                     />
                     {dailyState.feedback && (
                       <div className="absolute right-6 top-1/2 -translate-y-1/2">
                         <span className={`material-symbols-outlined text-4xl filled ${dailyState.feedback === 'correct' ? 'text-primary' : 'text-red-500'}`}>
                           {dailyState.feedback === 'correct' ? 'check_circle' : 'cancel'}
                         </span>
                       </div>
                     )}
                   </div>
                   
                   <div className="flex gap-3">
                     <button onClick={() => setDailyState(prev => ({ ...prev, open: false }))} className="flex-1 h-16 bg-white/5 text-gray-500 font-bold rounded-full">Dừng lại</button>
                     <button disabled={!dailyState.userAnswer.trim() || dailyState.feedback !== null} onClick={handleCheckAnswer} className="flex-[2] h-16 bg-primary text-[#0d1b12] font-black rounded-full text-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">Gửi đáp án</button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesView;
