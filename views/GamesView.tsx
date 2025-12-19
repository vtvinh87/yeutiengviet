
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { dataService, IMAGE_KEYS } from '../services/dataService';

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

interface GamesViewProps {
  setView: (view: AppView, gameId?: string) => void;
}

/**
 * Component con xử lý việc tải ảnh bất đồng bộ từ Supabase
 */
const GameCard: React.FC<{ game: Game; onClick: () => void }> = ({ game, onClick }) => {
  const [imgUrl, setImgUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadImg = async () => {
      // Gọi service để lấy URL ảnh từ DB hoặc fallback
      const url = await dataService.getSystemImage(game.imageKey, 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=800&auto=format&fit=crop');
      if (isMounted) {
        setImgUrl(url);
      }
    };
    loadImg();
    return () => { isMounted = false; };
  }, [game.imageKey]);

  return (
    <div 
      className="group bg-white dark:bg-surface-dark rounded-2xl p-3 border border-[#e7f3eb] dark:border-[#2a4030] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-black/20">
        {/* Lớp nền placeholder trong khi chờ ảnh tải */}
        <div className={`absolute inset-0 bg-primary/5 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
        
        <img 
          src={imgUrl} 
          alt={game.title}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm z-10">
          <span className={`material-symbols-outlined text-sm ${game.difficulty === 'Dễ' ? 'text-yellow-500' : 'text-orange-500'}`}>
            {game.difficulty === 'Dễ' ? 'star' : 'star_half'}
          </span> 
          {game.difficulty}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-2">
        <div className="mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${game.categoryColor}`}>
            {game.category}
          </span>
        </div>
        <h4 className="text-xl font-bold mb-1">{game.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {game.description}
        </p>
        <div className="mt-auto">
          <button 
            onClick={onClick}
            className="w-full h-12 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-text-main dark:text-white font-bold group-hover:bg-primary group-hover:text-[#0d1b12] transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">play_arrow</span> Chơi ngay
          </button>
        </div>
      </div>
    </div>
  );
};

const GamesView: React.FC<GamesViewProps> = ({ setView }) => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
    const loadHero = async () => {
      const url = await dataService.getSystemImage(IMAGE_KEYS.GAMES_HERO, 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=1200&auto=format&fit=crop');
      setHeroImage(url);
    };
    loadHero();
  }, []);

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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.02em]">
                Chào bé! Hôm nay chúng ta chơi gì nào?
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-[500px]">
                Khám phá thế giới Tiếng Việt qua các trò chơi thú vị và bổ ích giúp bé thông minh hơn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start w-full">
              <button 
                onClick={() => setView('game-detail', '2')}
                className="bg-primary hover:bg-[#0fd650] text-[#0d1b12] px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Chơi ngay
              </button>
              <button className="bg-transparent border-2 border-primary/30 hover:bg-primary/10 text-text-main dark:text-white px-6 h-12 rounded-full font-bold transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">leaderboard</span>
                Xem thành tích
              </button>
            </div>
          </div>
          <div 
            className="w-full lg:w-1/2 aspect-video lg:aspect-auto lg:h-[320px] rounded-2xl bg-cover bg-center shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-500 border-4 border-white dark:border-[#2d4234]"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-[#cfe7d7] dark:border-[#2a4030] flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <span className="material-symbols-outlined text-2xl filled">star</span>
          </div>
          <div>
            <p className="text-2xl font-bold">150</p>
            <p className="text-sm text-gray-500">Ngôi sao tích lũy</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-[#cfe7d7] dark:border-[#2a4030] flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-2xl filled">emoji_events</span>
          </div>
          <div>
            <p className="text-2xl font-bold">Level 5</p>
            <p className="text-sm text-gray-500">Cấp độ hiện tại</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-[#cfe7d7] dark:border-[#2a4030] flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-2xl filled">local_fire_department</span>
          </div>
          <div>
            <p className="text-2xl font-bold">3 Ngày</p>
            <p className="text-sm text-gray-500">Chuỗi học tập</p>
          </div>
        </div>
        <div className="bg-primary/20 p-4 rounded-xl border border-primary/30 flex items-center justify-between cursor-pointer hover:bg-primary/30 transition-colors group">
          <div>
            <p className="font-bold text-lg text-text-main">Thử thách ngày</p>
            <p className="text-xs text-text-main/70">Hoàn thành để nhận +20 ⭐</p>
          </div>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>

      {/* Games List Section */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold">Danh sách trò chơi</h3>
            <p className="text-gray-500 mt-1">Chọn một trò chơi để bắt đầu luyện tập nhé!</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Tất cả', 'Đánh vần', 'Từ vựng', 'Ngữ pháp'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${
                  activeFilter === filter
                    ? 'bg-primary text-[#0d1b12] -translate-y-0.5'
                    : 'bg-white dark:bg-surface-dark border border-[#e7f3eb] dark:border-[#2a4030] hover:border-primary text-gray-600 dark:text-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Game Cards Grid - Bây giờ sử dụng GameCard component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_GAMES.filter(g => activeFilter === 'Tất cả' || g.category === activeFilter).map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              onClick={() => setView('game-detail', game.id)} 
            />
          ))}
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

export default GamesView;
