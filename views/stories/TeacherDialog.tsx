
import React from 'react';

interface TeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  response: string;
}

const TeacherDialog: React.FC<TeacherDialogProps> = ({ isOpen, onClose, loading, response }) => {
  if (!isOpen) return null;

  // Hàm xử lý Markdown cơ bản để hiển thị nội dung AI đẹp hơn
  const formatMarkdown = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      // Xử lý in đậm **text**
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-black">$1</strong>');
      
      const trimmedLine = line.trim();
      
      // Danh sách không thứ tự (- hoặc *)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const content = formattedLine.replace(/^[-*]\s/, '');
        return (
          <div key={i} className="flex gap-3 mb-3 ml-2">
            <div className="size-2 rounded-full bg-primary mt-2.5 shrink-0 shadow-[0_0_8px_rgba(19,236,91,0.5)]"></div>
            <p className="flex-1" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      }
      
      // Danh sách có thứ tự (1. 2. ...)
      if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+\.)\s/);
        const number = match ? match[1] : '';
        const content = formattedLine.replace(/^\d+\.\s/, '');
        return (
          <div key={i} className="flex gap-3 mb-3">
            <span className="text-primary font-black shrink-0">{number}</span>
            <p className="flex-1" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      }

      // Dòng trống
      if (trimmedLine === '') {
        return <div key={i} className="h-4" />;
      }

      // Đoạn văn bình thường
      return (
        <p key={i} className="mb-4 text-gray-200" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      {/* Lớp nền mờ tối */}
      <div 
        className="absolute inset-0 bg-[#0d1b12]/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Khung Modal chính */}
      <div className="relative w-full max-w-2xl bg-[#102216] border-2 border-[#13ec5b]/20 rounded-[2.5rem] shadow-[0_20px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Phần đầu Modal */}
        <div className="p-6 md:p-8 bg-[#13ec5b]/5 border-b border-[#13ec5b]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b] shadow-inner">
              <span className="material-symbols-outlined text-4xl filled">psychology</span>
            </div>
            <div>
              <h3 className="font-black text-2xl text-white tracking-tight">Cô giáo AI</h3>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <p className="text-[#13ec5b] text-[10px] font-black uppercase tracking-widest">Đang giải đáp cho bé</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="size-12 rounded-full hover:bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-white/10"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Nội dung Modal - Có thanh cuộn */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="size-20 border-4 border-[#13ec5b]/10 border-t-[#13ec5b] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13ec5b] text-3xl animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-white">Cô giáo đang suy nghĩ...</p>
                <p className="text-[#4c9a66] font-bold mt-2">Bé đợi cô một xíu để cô tìm câu trả lời hay nhất nhé!</p>
              </div>
            </div>
          ) : (
            <div className="text-lg md:text-xl leading-relaxed font-medium text-gray-200">
              {formatMarkdown(response)}
            </div>
          )}
        </div>

        {/* Chân Modal */}
        <div className="p-6 md:p-8 bg-black/20 border-t border-[#13ec5b]/10 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-[#13ec5b] text-[#102216] font-black rounded-full hover:bg-[#0fd150] shadow-xl shadow-[#13ec5b]/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Em cảm ơn cô!
            <span className="material-symbols-outlined filled">favorite</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(19, 236, 91, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(19, 236, 91, 0.5); }
      `}</style>
    </div>
  );
};

export default TeacherDialog;
