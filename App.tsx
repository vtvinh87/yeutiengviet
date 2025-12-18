
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

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
        return <DictionaryView />;
      case 'reading':
        return <ReadingView />;
      case 'profile':
        return <ProfileView user={user} onUpdate={handleUpdateProfile} />;
      case 'stories':
        return <StoriesView />;
      case 'games':
        return <GamesView setView={handleSetView} />;
      case 'live':
        return <LiveView />;
      case 'game-detail':
        return <GameDetailView setView={handleSetView} user={user} gameId={selectedGameId || '1'} />;
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
  );
};

export default App;
