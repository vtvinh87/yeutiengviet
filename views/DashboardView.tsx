
import React, { useState, useEffect } from 'react';
import { AppView, User } from '../types';
import { dataService, IMAGE_KEYS } from '../services/dataService';

interface DashboardViewProps {
  setView: (view: AppView) => void;
  user: User;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView, user }) => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    setImages({
      hero: dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_HERO, ''),
      reading: dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_READING, ''),
      stories: dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_STORIES, ''),
      dictionary: dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_DICTIONARY, ''),
      games: dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_GAMES, ''),
    });
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <section className="rounded-3xl bg-white dark:bg-[#1a3324] shadow-soft p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center border border-gray-100 dark:border-[#2a4535]">
        <div className="w-full md:w-1/2 flex flex-col gap-4 text-center md:text-left items-center md:items-start">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-emerald-700 dark:text-primary text-sm font-bold">
            <span className="material-symbols-outlined filled text-base">waving_hand</span>
            Chào buổi sáng, {user.name}!
          </span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-text-main dark:text-white tracking-tight">
            Xin chào! Hôm nay em muốn học gì?
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium">
            Bạn đồng hành AI luôn sẵn sàng giúp em học tập thật vui và hiệu quả.
          </p>
          <button 
            onClick={() => setView('reading')}
            className="mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-text-main text-base font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined filled">play_circle</span>
            <span>Bắt đầu học ngay</span>
          </button>
        </div>
        <div className="w-full md:w-1/2">
          <div 
            className="w-full aspect-video bg-cover bg-center rounded-2xl shadow-md"
            style={{backgroundImage: `url("${images.hero}")`}}
          ></div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#e7f3eb] dark:bg-[#1e3a29] rounded-xl p-6 flex flex-col justify-between shadow-sm border border-[#cfe7d7] dark:border-[#2a4535]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white dark:bg-white/10 rounded-full text-orange-500">
              <span className="material-symbols-outlined filled">local_fire_department</span>
            </div>
            <h3 className="text-lg font-bold">Chuỗi ngày học</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-text-main dark:text-primary">3</span>
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">ngày liên tiếp</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Giỏi lắm! Tiếp tục phát huy nhé.</p>
        </div>

        <div className="bg-[#e0f2fe] dark:bg-[#1a384b] rounded-xl p-6 flex flex-col justify-between shadow-sm border border-[#bae6fd] dark:border-[#254b66] col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-white/10 rounded-full text-blue-500">
                <span className="material-symbols-outlined filled">potted_plant</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Cây tri thức của em</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Em đang làm rất tốt!</p>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">75/100 XP</span>
          </div>
          <div className="relative w-full h-6 bg-white dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all duration-1000" style={{width: '75%'}}>
              <div className="size-2 bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <span>Cấp độ 1</span>
            <span>Cấp độ 2</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary">category</span>
          Góc học tập
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            title="Luyện đọc"
            desc="Tập đọc to và rõ ràng các bài thơ hay."
            icon="menu_book"
            colorClass="bg-card-blue dark:bg-blue-900/30"
            imgUrl={images.reading}
            onClick={() => setView('reading')}
          />
          <FeatureCard 
            title="Nghe kể chuyện"
            desc="Thế giới cổ tích diệu kỳ qua giọng đọc ấm áp."
            icon="headphones"
            colorClass="bg-card-orange dark:bg-orange-900/30"
            imgUrl={images.stories}
            onClick={() => setView('stories')}
          />
          <FeatureCard 
            title="Giải nghĩa từ"
            desc="Tra cứu từ vựng mới dễ dàng và nhanh chóng."
            icon="search"
            colorClass="bg-card-purple dark:bg-purple-900/30"
            imgUrl={images.dictionary}
            onClick={() => setView('dictionary')}
          />
          <FeatureCard 
            title="Trò chơi"
            desc="Vừa chơi vui vừa học tốt với các thử thách."
            icon="sports_esports"
            colorClass="bg-card-pink dark:bg-pink-900/30"
            imgUrl={images.games}
            onClick={() => setView('games')}
          />
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: string;
  colorClass: string;
  imgUrl: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, icon, colorClass, imgUrl, onClick }) => (
  <button 
    onClick={onClick}
    className={`group relative flex flex-col text-left overflow-hidden rounded-2xl ${colorClass} border border-opacity-10 dark:border-opacity-20 transition-all hover:shadow-xl hover:-translate-y-1`}
  >
    <div 
      className="aspect-[4/3] w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
      style={{backgroundImage: `url("${imgUrl}")`}}
    ></div>
    <div className="p-5 flex flex-col flex-1">
      <div className="size-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm mb-3 group-hover:bg-primary group-hover:text-text-main transition-colors">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h4 className="text-xl font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  </button>
);

export default DashboardView;
