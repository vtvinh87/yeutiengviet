
import React from 'react';

interface TeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  response: string;
}

const TeacherDialog: React.FC<TeacherDialogProps> = ({ isOpen, onClose, loading, response }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
            <h3 className="font-black text-xl">Cô giáo AI</h3>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="font-bold text-gray-500">Cô đang suy nghĩ...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-200">
                {response}
              </p>
              <div className="flex justify-end pt-4">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-primary text-text-main font-bold rounded-full hover:bg-primary-hover shadow-md"
                >
                  Em cảm ơn cô!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDialog;
