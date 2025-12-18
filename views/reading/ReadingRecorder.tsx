
import React from 'react';

interface ReadingRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

const ReadingRecorder: React.FC<ReadingRecorderProps> = ({ isRecording, isProcessing, onStart, onStop }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <button 
        onClick={isRecording ? onStop : onStart}
        disabled={isProcessing}
        className={`group relative flex items-center justify-center gap-3 h-16 px-8 rounded-full shadow-lg transition-all duration-300 w-full md:w-auto md:min-w-[300px] ${
          isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-text-main hover:bg-primary-hover'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="material-symbols-outlined filled text-3xl">
          {isProcessing ? 'sync' : (isRecording ? 'stop' : 'mic')}
        </span>
        <span className="text-lg font-bold tracking-wide">
          {isProcessing ? 'Đang phân tích...' : (isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm')}
        </span>
      </button>
      <p className="text-sm text-gray-500 text-center">
        {isRecording ? 'Em hãy đọc thật to và rõ ràng nhé!' : 'Nhấn vào nút để bắt đầu đọc'}
      </p>
    </div>
  );
};

export default ReadingRecorder;
