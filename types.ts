
export type AppView = 'auth' | 'dashboard' | 'reading' | 'stories' | 'dictionary' | 'games' | 'profile' | 'game-detail' | 'admin' | 'live';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  grade: string;
  school: string;
  phone: string;
  avatar: string;
  role: 'user' | 'admin';
  exp: number;
  level: number;
  streak: number; 
  stars: number; 
  lastChallengeDate?: string; 
}

export interface Story {
  id: string;
  title: string;
  duration: string;
  image: string;
  content: string;
  summary: string;
  audioUrl?: string;
}

export interface DictionaryEntry {
  word: string;
  type: string;
  category: string;
  phonetic: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  image: string;
}

export interface ReadingPractice {
  id: string;
  title: string;
  text: string;
  image_url: string;
  audio_url?: string; 
  created_at?: string;
}

export interface ReadingExercise {
  title: string;
  topic: string;
  image: string;
  text: string;
}

export interface AdminImage {
  id: string;
  url: string;
  description: string;
  category: string;
  key?: string; 
}

export type GameType = 'RUNG_CHUONG_VANG' | 'VUA_TIENG_VIET' | 'DUOI_HINH_BAT_CHU';

export interface GameData {
  id: string;
  type: GameType;
  content: any; // Stores JSON data specific to each game
  created_at?: string;
}
