
import React from 'react';

interface ReadingHeaderProps {
  title: string;
  isPreloaded: boolean;
}

const ReadingHeader: React.FC<ReadingHeaderProps> = ({ title, isPreloaded }) => {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
          <span className="material-symbols-outlined text-lg">record_voice_over</span>
          <span>Bài tập đọc</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black leading-tight">
          {title}
        </h2>
        <p className="text-gray-500 text-lg">
          Em hãy đọc to đoạn văn dưới đây nhé!
        </p>
      </div>
      <div className="bg-primary/10 rounded-2xl p-3 flex items-center gap-3 max-w-xs border border-primary/20">
        <div className="size-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined filled">smart_toy</span>
        </div>
        <p className="text-xs font-medium">
          <span className="font-bold text-primary">Mẹo:</span> {isPreloaded ? "Bài tiếp theo đã sẵn sàng!" : "Đọc chậm rãi và ngắt nghỉ đúng nhé!"}
        </p>
      </div>
    </section>
  );
};

export default ReadingHeader;
