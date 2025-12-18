
import React from 'react';
import { Story } from '../../types';

interface StoryListProps {
  stories: Story[];
  selectedStory: Story;
  onSelectStory: (story: Story) => void;
  isPlaying: boolean;
  audioPlayer: React.ReactNode;
}

const StoryList: React.FC<StoryListProps> = ({ stories, selectedStory, onSelectStory, isPlaying, audioPlayer }) => {
  return (
    <aside className="w-full lg:w-[400px] flex flex-col border-r border-[#cfe7d7] dark:border-gray-800 bg-white dark:bg-[#102216] shrink-0 h-[40vh] lg:h-full overflow-hidden">
      <div className="p-6 pb-2 shrink-0">
        <h2 className="text-xl font-bold mb-4">Kho tàng truyện cổ tích</h2>
        <div className="relative w-full">
          <input 
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-gray-400 text-sm shadow-sm transition-all" 
            placeholder="Tìm kiếm câu chuyện..."
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {stories.map((story) => (
          <div 
            key={story.id}
            onClick={() => onSelectStory(story)}
            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border-2 ${
              selectedStory.id === story.id 
              ? 'bg-white dark:bg-gray-800 shadow-md border-primary' 
              : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
            }`}
          >
            <div 
              className={`bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0 relative overflow-hidden ${selectedStory.id !== story.id && 'grayscale'}`}
              style={{ backgroundImage: `url("${story.image}")` }}
            >
              {selectedStory.id === story.id && isPlaying && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white drop-shadow-md animate-pulse">equalizer</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <p className={`text-base font-bold truncate ${selectedStory.id === story.id ? 'text-primary' : ''}`}>
                {story.title}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span> {story.duration}
              </p>
            </div>
            {selectedStory.id !== story.id && (
              <span className="material-symbols-outlined text-gray-300">play_circle</span>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 p-4 bg-gray-50 dark:bg-black/20 border-t border-[#cfe7d7] dark:border-gray-800">
        {audioPlayer}
      </div>
    </aside>
  );
};

export default StoryList;
