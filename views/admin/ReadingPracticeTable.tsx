
import React from 'react';
import { ReadingPractice } from '../../types';

interface ReadingPracticeTableProps {
  items: ReadingPractice[];
  onDelete: (id: string, name: string) => void;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const ReadingPracticeTable: React.FC<ReadingPracticeTableProps> = ({ 
  items, 
  onDelete, 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex flex-col gap-4">
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
                Chưa có bài tập nào trong trang này hoặc kho đang trống.
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-gray-500">
            Hiển thị bài <span className="text-text-main dark:text-white">{(currentPage - 1) * pageSize + 1}</span> đến <span className="text-text-main dark:text-white">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="text-primary">{totalItems}</span> bài tập
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400 transition-all border border-transparent hover:border-primary/20"
              title="Trang trước"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Chỉ hiển thị tối đa 5 nút trang xung quanh trang hiện tại nếu có quá nhiều trang
                if (totalPages > 7) {
                  if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                    if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-gray-400">...</span>;
                    return null;
                  }
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`size-10 flex items-center justify-center rounded-xl font-black text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-primary text-[#102216] shadow-md' 
                        : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400 transition-all border border-transparent hover:border-primary/20"
              title="Trang sau"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingPracticeTable;
