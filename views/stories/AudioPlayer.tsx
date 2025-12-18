
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioUrl?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, onTogglePlay, audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioUrl) {
        audioRef.current.play().catch(e => console.error("Play error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl, audioRef]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration > 0) {
      const seekTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={onTogglePlay}
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative group h-4 flex items-center">
          <input 
            type="range"
            min="0"
            max="100"
            value={currentProgress}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 relative"
              style={{ width: `${currentProgress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onTogglePlay}
            disabled={!audioUrl}
            className="bg-primary hover:bg-primary-hover text-[#0d1b12] rounded-full size-12 flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all disabled:opacity-30 disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined text-3xl filled">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-black dark:text-white truncate max-w-[120px]">Đang nghe truyện</span>
            <span className="text-[10px] font-bold text-primary uppercase">Chế độ AI Voice</span>
          </div>
        </div>

        <div className="flex items-center gap-2 group flex-1 justify-end max-w-[100px]">
          <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-base">
            {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
          </span>
          <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full relative cursor-pointer overflow-hidden">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="h-full bg-primary"
              style={{ width: `${volume * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
