
import React, { useState, useEffect } from 'react';
import { AppView, User } from '../types';
import { dataService, IMAGE_KEYS } from '../services/dataService';

interface DashboardViewProps {
  setView: (view: AppView) => void;
  user: User;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView, user }) => {
  const [images, setImages] = useState<Record<string, string>>({});

  const isAdmin = user.role === 'admin';
  const expProgress = user.exp % 100;
  
  const getLevelName = (lvl: number) => {
    if (lvl < 2) return "Mầm non mới nhú";
    if (lvl < 5) return "Mầm non xanh";
    if (lvl < 10) return "Cây con vươn cao";
    return "Cây đại thụ tri thức";
  };

  useEffect(() => {
    const fetchImages = async () => {
      const hero = await dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_HERO, 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3p1Js7q-qE3ZzD7ykqRn59jFSLb6L4txqXpEW1cd028lqvEe-lqg5oF6h8NsvYjOVXc3FhqgQ_DRVvt5QPLbV1fX0-9DR6sqQXj6srnN3U0FpVONxI2qNfZA-RvcugujCMkUrGmBhPpzoteXxBkVTRe3DbVOsa17CrOZc16RAJ-Uqz3Y0lx_I0Y2QtSn76ISI_RC-Zh7CWnLBpfg5aQ97Ay7wNxIsq6xcD2E3t0O0wRk1pUvmBQCPFaAURGGTh3FeNErzY4Zp1Q');
      const reading = await dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_READING, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm7DEgbI8CzwYbAqgXhxGyCO0jHp0rLfxvoeTuZjQ2jpWQv5DUncTEGRkzO-UaOng7h9jFvUPTwKEmheqaFoVLlDfaCkxxY0b5DT9dvefLWv1CHSXLamV_xFt5WDRe2RvFooVwkWawS2c7eYGnHyVXa8K3b_VxPf28O_rVPJM60dT6CZepJmYCnYMcNtVIxuQXzusQYTtn9QTOSJCB1aA2KK-YOjbDJepJfILlD9aoaQN82FxhA8iFNKrLmLNiaNasjzhgTS6lRQ');
      const stories = await dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_STORIES, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2j5kA6qbv7Im4ELQ4ph2OJt2R0k20w_n78E-shcr40XtCjShCWPxTpUVI2jAJUBH3WdqEeJ53AZEiVSuVsyViOnYgI63uUF9NuObyQg5Arkb9qL11bZHeOEIGvAcIUMVw3kLvhAY2XMXCFLo89EiV74K12fX1bU5Nwy-ie5x68M7EY-u-dLiMvJITSwTtI4enkrCeU6Yr1CgrIdk89ftzFhQkDguBhzTYvDIUSQU6x67qHvjuYLC0Viygf4bw0iOJO75MYF74_Q');
      const dict = await dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_DICTIONARY, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5tapRLSBvwi1m0pxzYtx7gvQabmhfOEn2xMHbk6RwNhtrPLTHVVMl8OEqI2GBZQ_lVjbxfi52MhPQ7nOS9EphvCGHe5tCtdmrgFbe2thx_i7hwVAQWSwLpb-IkXMkYZtDPnwylwnUnWVKb7vUIwKuV2J0SHZbhLG7vlWfKw4U65SU5RGBDhCMXV5D8cIXNSKgwDYavsBde7S3JKWOaay6KFTi-jvWnhxcpl1J8UwQN41-NJ-hJ6yRPbzWpEL616mZCWfzvSweLQ');
      const games = await dataService.getSystemImage(IMAGE_KEYS.DASHBOARD_GAMES, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJGNlzpyt67Oy2lmy2gJsgXuNvjjPXgnGZtEwe5zfIbEM-hHCi87oxJCgrNRVjRbW2V0aI_7WM0QbEWmiVIFoL6UFIomOXCBHQSBk_S8ekNuY3gamOIu8MoPMKyN9xFRWUv6GoeYMQd-vI_u8UOom0P_S-RHujXd60gr_LjAEHrqijfjfwL9RuDVWJQyYjrwpOHh43ZkAO2qCVz5YMiobphmIJhRyvQzpElooSO0nrT9rhbZ7zgF9zAWydYQhQeEDX46LAusvugA');
      
      setImages({ hero, reading, stories, dictionary: dict, games });
    };
    fetchImages();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600">admin_panel_settings</span>
            <p className="text-amber-800 dark:text-amber-200 font-bold text-sm">Bạn đang đăng nhập với quyền Quản trị viên!</p>
          </div>
          <button 
            onClick={() => setView('admin')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            Vào Admin Panel
          </button>
        </div>
      )}

      <section className="rounded-3xl bg-white dark:bg-[#1a3324] shadow-soft p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center border border-gray-100 dark:border-[#2a4535] relative overflow-hidden">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="w-full md:w-1/2 flex flex-col gap-4 text-center md:text-left items-center md:items-start relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-emerald-700 dark:text-primary text-sm font-black uppercase tracking-widest">
            <span className="material-symbols-outlined filled text-base">waving_hand</span>
            Xin chào, {user.name}!
          </span>
          <h2 className="text-4xl md:text-5xl font-black leading-tight text-text-main dark:text-white tracking-tighter">
            Hôm nay bé muốn khám phá điều gì mới?
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium">
            Người bạn đồng hành AI luôn sẵn sàng cùng bé học Tiếng Việt thật vui.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <button 
              onClick={() => setView('reading')}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-text-main text-base font-black py-3 px-8 rounded-full shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined filled">menu_book</span>
              <span>Bắt đầu học</span>
            </button>
            <button 
              onClick={() => setView('live')}
              className="flex items-center justify-center gap-2 bg-white dark:bg-white/10 text-text-main dark:text-white text-base font-black py-3 px-8 rounded-full border border-primary/20 hover:border-primary shadow-sm transition-all"
            >
              <span className="material-symbols-outlined filled text-primary">forum</span>
              <span>Trò chuyện AI</span>
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div 
            className="w-full aspect-[4/3] md:aspect-video bg-cover bg-center rounded-2xl shadow-md border-4 border-white dark:border-[#2d4234] animate-in zoom-in duration-1000"
            style={{backgroundImage: `url("${images.hero}")`}}
          ></div>
        </div>
      </section>

      {/* Phần tiến độ học tập - Đã đồng bộ với USER.STREAK và USER.EXP thực tế */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#102216] dark:bg-[#1a3324] rounded-[2rem] p-8 flex flex-col justify-between shadow-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 size-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-orange-500 shadow-inner">
              <span className="material-symbols-outlined filled text-3xl">local_fire_department</span>
            </div>
            <h3 className="text-xl font-black text-white">Chuỗi học tập</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-primary leading-none">{user.streak || 1}</span>
            <span className="text-xl font-bold text-gray-300 mb-1">ngày</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">GIỎI LẮM! ĐỪNG DỪNG LẠI NHÉ.</p>
        </div>

        <div className="bg-[#142838] dark:bg-[#152e40] rounded-[2rem] p-8 flex flex-col justify-between shadow-xl border border-white/5 col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 size-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-blue-400 shadow-inner">
                <span className="material-symbols-outlined filled text-3xl">potted_plant</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Cây tri thức</h3>
                <p className="text-sm text-blue-300/70 font-bold">Level {user.level}: {getLevelName(user.level)}</p>
              </div>
            </div>
            <span className="text-xl font-black text-blue-300 bg-blue-900/40 px-4 py-2 rounded-2xl border border-blue-400/20">{expProgress}/100 XP</span>
          </div>
          <div className="relative w-full h-10 bg-black/40 rounded-full overflow-hidden shadow-2xl p-1.5 border border-white/5">
            <div 
              className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all duration-1000 shadow-[0_0_15px_rgba(19,236,91,0.5)]" 
              style={{width: `${expProgress}%`}}
            >
              <div className="size-4 bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary">grid_view</span>
            Góc học tập của bé
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            title="Luyện đọc"
            desc="Cùng cô giáo AI tập đọc to và rõ ràng các bài thơ hay."
            icon="menu_book"
            colorClass="bg-card-blue dark:bg-blue-900/20"
            imgUrl={images.reading}
            onClick={() => setView('reading')}
          />
          <FeatureCard 
            title="Kể chuyện"
            desc="Nghe những câu chuyện cổ tích diệu kỳ bằng giọng đọc ấm áp."
            icon="headphones"
            colorClass="bg-card-orange dark:bg-orange-900/20"
            imgUrl={images.stories}
            onClick={() => setView('stories')}
          />
          <FeatureCard 
            title="Giải nghĩa từ"
            desc="Tra cứu từ vựng và xem hình ảnh minh họa sinh động."
            icon="translate"
            colorClass="bg-card-purple dark:bg-purple-900/20"
            imgUrl={images.dictionary}
            onClick={() => setView('dictionary')}
          />
          <FeatureCard 
            title="Trò chơi"
            desc="Vừa chơi vừa học với các thử thách Tiếng Việt vui nhộn."
            icon="sports_esports"
            colorClass="bg-card-pink dark:bg-pink-900/20"
            imgUrl={images.games}
            onClick={() => setView('games')}
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{title: string; desc: string; icon: string; colorClass: string; imgUrl: string; onClick: () => void;}> = ({ title, desc, icon, colorClass, imgUrl, onClick }) => (
  <button 
    onClick={onClick}
    className={`group relative flex flex-col text-left overflow-hidden rounded-[2rem] ${colorClass} border-2 border-transparent hover:border-primary/30 transition-all hover:shadow-2xl hover:-translate-y-2`}
  >
    <div className="aspect-[4/3] w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: `url("${imgUrl}")`}}></div>
    <div className="p-6 flex flex-col flex-1">
      <div className="size-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm mb-4 group-hover:bg-primary group-hover:text-text-main transition-colors">
        <span className="material-symbols-outlined text-3xl filled">{icon}</span>
      </div>
      <h4 className="text-xl font-black mb-2">{title}</h4>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default DashboardView;
