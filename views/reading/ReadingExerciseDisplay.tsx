
import React, { useState } from 'react';
import { readingService } from '../../services/readingService';

interface ReadingExerciseDisplayProps {
  title: string;
  imageUrl: string;
  text: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  audioBuffer?: AudioBuffer | null;
  isAdmin?: boolean;
  isGenerated?: boolean;
}

const ReadingExerciseDisplay: React.FC<ReadingExerciseDisplayProps> = ({ 
  title, 
  imageUrl, 
  text, 
  isSpeaking, 
  onSpeak, 
  audioBuffer, 
  isAdmin,
  isGenerated = false
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleDownloadImage = async () => {
    try {
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `tranh-minh-hoa-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tranh-minh-hoa-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleSaveExercise = async () => {
    // Nếu là bài từ kho thì không cho lưu nữa
    if (!isGenerated) return;
    
    setIsSaving(true);
    const success = await readingService.saveExercise(title, text, imageUrl, audioBuffer);
    setIsSaving(false);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      alert("Không thể lưu bài tập. Vui lòng kiểm tra lại Storage bucket 'reading-audios'!");
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-soft group">
          <img 
            src={imageUrl} 
            alt="Exercise illustration"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            {isAdmin && (
              <button 
                onClick={handleSaveExercise}
                disabled={isSaving || isSaved || !isGenerated}
                className={`size-12 rounded-full flex items-center justify-center shadow-lg transition-all group/save ${
                  !isGenerated || isSaved
                    ? 'bg-primary/40 text-white cursor-not-allowed' 
                    : 'bg-white/90 dark:bg-black/60 text-primary hover:scale-110 active:scale-95'
                }`}
                title={!isGenerated ? "Bài tập này đã có sẵn trong kho dữ liệu" : "Lưu bài tập này vào kho lưu trữ"}
              >
                <span className="material-symbols-outlined filled">
                  {isSaving ? 'sync' : (!isGenerated ? 'verified' : (isSaved ? 'check' : 'bookmark'))}
                </span>
                <div className="absolute -top-10 scale-0 group-hover/save:scale-100 transition-all bg-black/80 text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">
                  {!isGenerated ? 'Đã có trong kho' : (isSaved ? 'Đã lưu!' : 'Lưu vào kho')}
                </div>
              </button>
            )}

            <button 
              onClick={handleDownloadImage}
              className="size-12 bg-white/90 dark:bg-black/60 backdrop-blur text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group/btn"
              title="Tải ảnh này về máy"
            >
              <span className="material-symbols-outlined filled group-hover/btn:animate-bounce">download</span>
              <div className="absolute -top-10 scale-0 group-hover/btn:scale-100 transition-all bg-black/80 text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">
                Lưu ảnh về máy
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled">volume_up</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Nghe đọc mẫu</span>
              <span className="text-xs text-gray-500">Cô giáo AI</span>
            </div>
          </div>
          <button 
            onClick={onSpeak}
            disabled={isSpeaking}
            className={`size-10 rounded-full bg-primary text-text-main hover:bg-primary-hover flex items-center justify-center shadow-lg transition-colors disabled:opacity-50`}
          >
            <span className={`material-symbols-outlined filled ${isSpeaking ? 'animate-pulse' : ''}`}>
              {isSpeaking ? 'volume_up' : 'play_arrow'}
            </span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-10 shadow-soft border border-gray-100 dark:border-white/5 min-h-[320px] flex items-center justify-center">
          <p className="text-2xl md:text-3xl leading-relaxed font-medium text-center italic">
            "{text}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReadingExerciseDisplay;
