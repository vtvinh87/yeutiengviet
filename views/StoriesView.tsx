
import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { aiTeacherService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import StoryList from './stories/StoryList';
import StoryDisplay from './stories/StoryDisplay';
import AudioPlayer from './stories/AudioPlayer';
import TeacherDialog from './stories/TeacherDialog';

const StoriesView: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(15);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const loaded = dataService.getStories();
    setStories(loaded);
    if (loaded.length > 0) setSelectedStory(loaded[0]);
  }, []);

  const handleAskAI = async () => {
    if (!selectedStory) return;
    setIsAskingAI(true);
    setLoadingAI(true);
    try {
      const prompt = `Bé đang nghe chuyện "${selectedStory.title}". Bé muốn hỏi cô giáo về ý nghĩa của câu chuyện này. Cô hãy giải thích thật hay nhé!`;
      const response = await aiTeacherService.chat(prompt);
      setAiResponse(response);
    } catch (err) {
      setAiResponse("Cô đang bận một chút, bé hỏi lại sau nhé!");
    } finally {
      setLoadingAI(false);
    }
  };

  if (!selectedStory) return <div className="p-8 text-center font-bold">Đang tải truyện...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] -m-4 md:-m-10 lg:-m-20 bg-white dark:bg-[#0d1b12] overflow-hidden">
      <StoryList 
        stories={stories} 
        selectedStory={selectedStory} 
        onSelectStory={setSelectedStory} 
        isPlaying={isPlaying} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <StoryDisplay story={selectedStory} onAskAI={handleAskAI} />
        <AudioPlayer 
          isPlaying={isPlaying} 
          onTogglePlay={() => setIsPlaying(!isPlaying)} 
          progress={progress} 
        />
      </div>

      <TeacherDialog 
        isOpen={isAskingAI} 
        onClose={() => setIsAskingAI(false)} 
        loading={loadingAI} 
        response={aiResponse} 
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(19, 236, 91, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StoriesView;
