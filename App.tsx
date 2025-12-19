
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

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const initSession = async () => {
      try {
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
    initSession();
  }, []);

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
    
    // Thêm thông báo bay lên từ giữa màn hình
    const id = Date.now();
    setExpNotifications(prev => [...prev, { id, amount }]);
    
    // Tự động xóa sau khi hoạt ảnh kết thúc
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
        return <GamesView setView={handleSetView} user={user} onAwardExp={handleAwardExp} />;
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
        <p className="text-primary font-bold animate-pulse">Đang tải ứng dụng...</p>
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
