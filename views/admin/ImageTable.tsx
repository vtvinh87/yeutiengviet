
import React from 'react';
import { AdminImage } from '../../types';

interface ImageTableProps {
  images: AdminImage[];
  onEdit: (image: AdminImage) => void;
  onDelete: (id: string, name: string) => void;
}

const ImageTable: React.FC<ImageTableProps> = ({ images, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
        <tr>
          <th className="px-6 py-4 font-bold text-sm">Hình ảnh</th>
          <th className="px-6 py-4 font-bold text-sm">Vị trí hệ thống</th>
          <th className="px-6 py-4 font-bold text-sm text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
        {images.map(img => (
          <tr key={img.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={img.url} className="size-12 rounded bg-gray-100 object-cover border border-gray-200 dark:border-white/10" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{img.description}</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{img.url}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              {img.key ? (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded uppercase border border-blue-200 dark:border-blue-800">
                  {img.key}
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 italic">Thủ công</span>
              )}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(img)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => onDelete(img.id, img.description)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
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

export default ImageTable;
