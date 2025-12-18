
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
          <th className="px-6 py-4 font-bold text-sm">Thời lượng</th>
          <th className="px-6 py-4 font-bold text-sm">Mô tả</th>
          <th className="px-6 py-4 font-bold text-sm text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
        {stories.map(story => (
          <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={story.image} className="size-10 rounded-lg object-cover" />
                <span className="font-bold">{story.title}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{story.duration}</td>
            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{story.summary}</td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(story)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => onDelete(story.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
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
