
import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm font-bold text-gray-500">
        Hiển thị <span className="text-text-main dark:text-white">{(currentPage - 1) * pageSize + 1}</span> đến <span className="text-text-main dark:text-white">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="text-primary">{totalItems}</span> bản ghi
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
  );
};

export default PaginationControls;
