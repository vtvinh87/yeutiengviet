
import React from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, onTogglePlay, progress }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#152e1e] border-t border-[#cfe7d7] dark:border-gray-800 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
        {/* Progress */}
        <div className="flex items-center gap-3 w-full group cursor-pointer">
          <span className="text-xs font-mono font-bold text-gray-500">00:45</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500">05:00</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="w-1/4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 font-bold transition-colors">
              <span className="text-xs">1.0x</span>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-3xl">skip_previous</span>
            </button>
            <button 
              onClick={onTogglePlay}
              className="bg-primary hover:bg-primary-hover text-text-main rounded-full size-14 flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-4xl filled">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button className="text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-3xl">skip_next</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 w-1/4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer hidden sm:block overflow-hidden">
              <div className="bg-primary h-full rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
