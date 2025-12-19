
import React from 'react';
import { ReadingPractice } from '../../types';

interface ReadingPracticeTableProps {
  items: ReadingPractice[];
  onDelete: (id: string, name: string) => void;
}

const ReadingPracticeTable: React.FC<ReadingPracticeTableProps> = ({ items, onDelete }) => {
  return (
    <table className="w-full text-left border-separate border-spacing-y-2 px-4">
      <thead>
        <tr className="text-gray-400 text-xs font-black uppercase tracking-widest">
          <th className="px-6 py-4">Bài tập</th>
          <th className="px-6 py-4">Giọng đọc AI</th>
          <th className="px-6 py-4">Nội dung trích đoạn</th>
          <th className="px-6 py-4 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
              Chưa có bài tập nào được lưu vào kho. Admin hãy vào phần "Luyện đọc" để lưu bài tập nhé!
            </td>
          </tr>
        )}
        {items.map(item => (
          <tr key={item.id} className="group bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-primary/5 transition-all">
            <td className="px-6 py-4 first:rounded-l-2xl">
              <div className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 rounded-xl overflow-hidden border-2 border-white/10 shadow-md">
                  <img src={item.image_url} className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">{item.title}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              {item.audio_url ? (
                <button 
                  onClick={() => new Audio(item.audio_url).play()}
                  className="flex items-center gap-2 text-primary font-black text-[10px] uppercase bg-primary/10 px-3 py-1.5 rounded-full w-fit border border-primary/20 hover:scale-105 transition-all"
                  title="Nghe giọng đọc mẫu"
                >
                  <span className="material-symbols-outlined text-sm filled">play_circle</span>
                  Nghe thử
                </button>
              ) : (
                <span className="text-gray-400 text-[10px] uppercase font-bold italic">Không có audio</span>
              )}
            </td>
            <td className="px-6 py-4">
              <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">{item.text}</p>
            </td>
            <td className="px-6 py-4 text-right last:rounded-r-2xl">
              <button 
                onClick={() => onDelete(item.id, item.title)} 
                className="size-10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                title="Xóa khỏi kho"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReadingPracticeTable;
