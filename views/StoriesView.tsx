
import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { aiTeacherService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import StoryList from './stories/StoryList';
import StoryDisplay from './stories/StoryDisplay';
import AudioPlayer from './stories/AudioPlayer';
import TeacherDialog from './stories/TeacherDialog';

interface StoriesViewProps {
  onAwardExp?: (amount: number) => void;
}

const StoriesView: React.FC<StoriesViewProps> = ({ onAwardExp }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Trạng thái cho infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Trạng thái theo dõi xem truyện hiện tại đã được thưởng điểm chưa
  const [hasAwardedCurrent, setHasAwardedCurrent] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Tải trang đầu tiên (5 items)
      const loaded = await dataService.getStories(1, 5);
      setStories(loaded);
      if (loaded.length > 0) setSelectedStory(loaded[0]);
      
      // Nếu số lượng tải về ít hơn pageSize (5), nghĩa là đã hết
      if (loaded.length < 5) setHasMore(false);
    };
    loadData();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const moreStories = await dataService.getStories(nextPage, 5);
      
      if (moreStories.length < 5) {
        setHasMore(false);
      }
      
      if (moreStories.length > 0) {
        setStories(prev => {
          // Lọc trùng lặp để an toàn
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNewStories = moreStories.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNewStories];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm truyện:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setIsPlaying(false);
    setHasAwardedCurrent(false); // Reset trạng thái thưởng khi đổi truyện
  };

  const handleProgressUpdate = (progress: number) => {
    // Nếu đạt 75% (0.75) và chưa được thưởng điểm cho truyện này
    if (progress >= 0.75 && !hasAwardedCurrent) {
      setHasAwardedCurrent(true);
      if (onAwardExp) {
        onAwardExp(10); // Thưởng 10 EXP khi bé đã nghe được 75%
      }
    }
  };

  const handleAskAI = async () => {
    if (!selectedStory) return;
    setIsAskingAI(true);
    setLoadingAI(true);
    try {
      const prompt = `Bé đang nghe chuyện "${selectedStory.title}". Bé muốn hỏi cô giáo về ý nghĩa của câu chuyện này. Cô hãy giải thích thật hay nhé!`;
      const response = await aiTeacherService.chat(prompt);
      setAiResponse(response);
      if (onAwardExp) onAwardExp(5); // Hỏi AI được 5 EXP
    } catch (err) {
      setAiResponse("Cô đang bận một chút, bé hỏi lại sau nhé!");
    } finally {
      setLoadingAI(false);
    }
  };

  if (!selectedStory) return <div className="p-8 text-center font-bold">Đang tải truyện...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full bg-white dark:bg-[#0d1b12] overflow-hidden">
      <StoryList 
        stories={stories} 
        selectedStory={selectedStory} 
        onSelectStory={handleSelectStory} 
        isPlaying={isPlaying} 
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
        audioPlayer={
          <AudioPlayer 
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
            audioUrl={selectedStory.audioUrl}
            onProgressUpdate={handleProgressUpdate}
          />
        }
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative border-t lg:border-t-0 border-[#cfe7d7] dark:border-gray-800">
        <StoryDisplay story={selectedStory} onAskAI={handleAskAI} />
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
