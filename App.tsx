
import React, { useState, useEffect } from 'react';
import { AppView, User } from './types';
import Layout from './components/Layout';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import DictionaryView from './views/DictionaryView';
import ReadingView from './views/ReadingView';
import ProfileView from './views/ProfileView';
import StoriesView from './views/StoriesView';
import GamesView from './views/GamesView';
import GameDetailView from './views/GameDetailView';
import AdminView from './views/AdminView';
import LiveView from './views/LiveView';
import { authService } from './services/authService';
import { hasApiKey } from './services/geminiClient';

interface ExpNotification {
  id: number;
  amount: number;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [expNotifications, setExpNotifications] = useState<ExpNotification[]>([]);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkKeyAndSession = async () => {
      try {
        // Kiểm tra API Key (Bắt buộc theo hướng dẫn mới cho các model 2.5/3)
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey && !hasApiKey()) {
          setNeedsApiKey(true);
        }

        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setCurrentView('dashboard');
        }
      } catch (err) {
        console.error("Session restoration failed", err);
      } finally {
        setInitializing(false);
      }
    };
    checkKeyAndSession();
  }, []);

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      // Giả định chọn thành công theo hướng dẫn để tránh race condition
      setNeedsApiKey(false);
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentView('auth');
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    await authService.updateProfile(updatedUser);
    setUser(updatedUser);
  };

  const handleAwardExp = async (amount: number) => {
    if (!user) return;
    
    const id = Date.now();
    setExpNotifications(prev => [...prev, { id, amount }]);
    
    setTimeout(() => {
      setExpNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);

    const updatedUser = await authService.addExperience(user.id, amount);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const handleSetView = (view: AppView, gameId?: string) => {
    if (gameId) setSelectedGameId(gameId);
    setCurrentView(view);
  };

  const renderView = () => {
    if (!user) return null;

    switch (currentView) {
      case 'dashboard':
        return <DashboardView setView={setCurrentView} user={user} />;
      case 'dictionary':
        return <DictionaryView onAwardExp={handleAwardExp} />;
      case 'reading':
        return <ReadingView onAwardExp={handleAwardExp} />;
      case 'profile':
        return <ProfileView user={user} onUpdate={handleUpdateProfile} />;
      case 'stories':
        return <StoriesView onAwardExp={handleAwardExp} />;
      case 'games':
        return <GamesView setView={handleSetView} />;
      case 'live':
        return <LiveView />;
      case 'game-detail':
        return <GameDetailView setView={handleSetView} user={user} gameId={selectedGameId || '1'} onAwardExp={handleAwardExp} />;
      case 'admin':
        return <AdminView user={user} />;
      default:
        return <DashboardView setView={setCurrentView} user={user} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center gap-6">
        <div className="size-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-bold animate-pulse">Đang khởi động Yêu Tiếng Việt...</p>
      </div>
    );
  }

  if (needsApiKey) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-dark rounded-[3rem] p-10 border border-white/10 shadow-2xl text-center flex flex-col items-center gap-8">
          <div className="size-32 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-pulse">
            <span className="material-symbols-outlined text-6xl filled">vpn_key</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white">Chào mừng bé!</h2>
            <p className="text-gray-400 font-medium">Để cô giáo AI có thể hoạt động, bé (hoặc ba mẹ) hãy giúp cô chọn một API Key nhé.</p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-primary text-xs font-bold hover:underline mt-2"
            >
              Tìm hiểu về thanh toán và API Key
            </a>
          </div>
          <button 
            onClick={handleSelectKey}
            className="w-full h-16 bg-primary text-background-dark font-black text-xl rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">key</span>
            Chọn API Key ngay
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="relative w-full min-h-screen">
      <Layout 
        activeView={currentView} 
        setView={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onLogout={handleLogout}
        user={user!}
      >
        {renderView()}
      </Layout>

      <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
        {expNotifications.map(notif => (
          <div 
            key={notif.id} 
            className="absolute animate-exp-float flex items-center gap-4 bg-primary text-text-main font-black px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(19,236,91,0.5)] whitespace-nowrap border-4 border-white/20"
          >
            <span className="material-symbols-outlined filled text-4xl md:text-6xl text-text-main">stars</span>
            <span className="text-3xl md:text-5xl tracking-tighter">+{notif.amount} EXP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
