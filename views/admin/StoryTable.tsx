
import React from 'react';
import { Story } from '../../types';

interface StoryTableProps {
  stories: Story[];
  onEdit: (story: Story) => void;
  onDelete: (id: string, name: string) => void;
}

const StoryTable: React.FC<StoryTableProps> = ({ stories, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left border-separate border-spacing-y-2 px-4">
      <thead>
        <tr className="text-gray-400 text-xs font-black uppercase tracking-widest">
          <th className="px-6 py-4">Tên câu chuyện</th>
          <th className="px-6 py-4">Giọng đọc AI</th>
          <th className="px-6 py-4">Thời lượng</th>
          <th className="px-6 py-4 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {stories.map(story => (
          <tr key={story.id} className="group bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-primary/5 transition-all">
            <td className="px-6 py-4 first:rounded-l-2xl">
              <div className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 rounded-xl overflow-hidden border-2 border-white/10 shadow-md">
                  <img src={story.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">{story.title}</span>
                  <span className="text-xs text-gray-400 line-clamp-1 italic">{story.summary}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              {story.audioUrl ? (
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase bg-primary/10 px-3 py-1.5 rounded-full w-fit border border-primary/20">
                  <span className="material-symbols-outlined text-sm filled animate-pulse">settings_voice</span>
                  Đã sẵn sàng
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full w-fit">
                  <span className="material-symbols-outlined text-sm">mic_off</span>
                  Chưa có audio
                </div>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {story.duration}
              </div>
            </td>
            <td className="px-6 py-4 text-right last:rounded-r-2xl">
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => onEdit(story)} 
                  className="size-10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Chỉnh sửa"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                </button>
                <button 
                  onClick={() => onDelete(story.id, story.title)} 
                  className="size-10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StoryTable;
