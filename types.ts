
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
  key?: string; // Identifier for system-specific images
}
