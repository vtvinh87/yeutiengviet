
import React from 'react';
import { Story } from '../../types';

interface StoryTableProps {
  stories: Story[];
  onEdit: (story: Story) => void;
  onDelete: (id: string) => void;
}

const StoryTable: React.FC<StoryTableProps> = ({ stories, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
        <tr>
          <th className="px-6 py-4 font-bold text-sm">Tên truyện</th>
          <th className="px-6 py-4 font-bold text-sm">Trạng thái Audio</th>
          <th className="px-6 py-4 font-bold text-sm">Thời lượng</th>
          <th className="px-6 py-4 font-bold text-sm text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
        {stories.map(story => (
          <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={story.image} className="size-12 rounded-lg object-cover shadow-sm" />
                <div className="flex flex-col">
                  <span className="font-bold text-base">{story.title}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[200px]">{story.summary}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              {story.audioUrl ? (
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm filled">headphones</span>
                  Sẵn sàng
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">voice_over_off</span>
                  Chưa có
                </div>
              )}
            </td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs font-bold text-gray-400">
                {story.duration}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(story)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => onDelete(story.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
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
