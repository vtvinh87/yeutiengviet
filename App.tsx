
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
import { authService } from './services/authService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('auth');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    authService.updateProfile(updatedUser);
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
      case 'game-detail':
        return <GameDetailView setView={handleSetView} user={user} gameId={selectedGameId || '1'} />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView setView={setCurrentView} user={user} />;
    }
  };

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
