
import React, { useState, useRef } from 'react';
import { GameType } from '../../types';
import { storageService } from '../../services/storageService';

interface GameEditorModalProps {
  gameType: GameType;
  initialData?: any;
  onClose: () => void;
  onSave: (content: any) => Promise<void>;
}

const GameEditorModal: React.FC<GameEditorModalProps> = ({ gameType, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize defaults based on game type if no initial data
  useState(() => {
    if (!initialData) {
      if (gameType === 'RUNG_CHUONG_VANG') {
        setFormData({
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
        });
      } else if (gameType === 'VUA_TIENG_VIET') {
        setFormData({
          word: '',
          hint: '',
          category: ''
        });
      } else if (gameType === 'DUOI_HINH_BAT_CHU') {
        setFormData({
          word: '',
          category: '',
          imageDescription: '',
          hint: '',
          imageUrl: ''
        });
      }
    }
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData((prev: any) => ({ ...prev, options: newOptions }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await storageService.uploadSystemImage(file); // Reuse system image bucket for games
      if (url) {
        handleChange('imageUrl', url);
      } else {
        alert('Lỗi tải ảnh lên');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu dữ liệu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[#102216] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between bg-[#13ec5b]/5 shrink-0">
          <h3 className="font-black text-2xl text-white">
            {initialData ? 'Chỉnh sửa dữ liệu' : 'Thêm mới dữ liệu'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form id="game-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* --- FORM RUNG CHUÔNG VÀNG --- */}
            {gameType === 'RUNG_CHUONG_VANG' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Câu hỏi</label>
                  <textarea 
                    required 
                    value={formData.question}
                    onChange={(e) => handleChange('question', e.target.value)}
                    className="rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6 py-4 min-h-[100px]"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-400 ml-1">Đáp án {String.fromCharCode(65 + idx)}</label>
                      <input 
                        required 
                        value={formData.options?.[idx] || ''}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="h-12 rounded-xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-4"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Đáp án đúng</label>
                  <select 
                    value={formData.correctIndex}
                    onChange={(e) => handleChange('correctIndex', parseInt(e.target.value))}
                    className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6"
                  >
                    {[0, 1, 2, 3].map(idx => (
                      <option key={idx} value={idx}>Đáp án {String.fromCharCode(65 + idx)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Giải thích đáp án</label>
                  <textarea 
                    required 
                    value={formData.explanation}
                    onChange={(e) => handleChange('explanation', e.target.value)}
                    className="rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6 py-4 min-h-[80px]"
                    placeholder="Tại sao đáp án này đúng?..."
                  />
                </div>
              </>
            )}

            {/* --- FORM VUA TIẾNG VIỆT --- */}
            {gameType === 'VUA_TIENG_VIET' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Từ khóa (Đáp án)</label>
                  <input 
                    required 
                    value={formData.word}
                    onChange={(e) => handleChange('word', e.target.value.toUpperCase())}
                    className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6 font-black uppercase tracking-widest"
                    placeholder="VD: VIỆT NAM"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Chủ đề</label>
                  <input 
                    required 
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6"
                    placeholder="VD: Địa lý"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Gợi ý cho bé</label>
                  <textarea 
                    required 
                    value={formData.hint}
                    onChange={(e) => handleChange('hint', e.target.value)}
                    className="rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6 py-4 min-h-[100px]"
                    placeholder="VD: Tên đất nước hình chữ S..."
                  />
                </div>
              </>
            )}

            {/* --- FORM ĐUỔI HÌNH BẮT CHỮ --- */}
            {gameType === 'DUOI_HINH_BAT_CHU' && (
              <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-primary ml-1">Từ khóa (Đáp án)</label>
                      <input 
                        required 
                        value={formData.word}
                        onChange={(e) => handleChange('word', e.target.value.toUpperCase())}
                        className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6 font-black uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-primary ml-1">Chủ đề</label>
                      <input 
                        required 
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6"
                      />
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary ml-1">Hình ảnh minh họa</label>
                    <div className="flex gap-2">
                      <input 
                        required 
                        value={formData.imageUrl}
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        className="flex-1 h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6"
                        placeholder="Nhập URL hoặc tải ảnh lên..."
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-14 px-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center transition-all"
                      >
                         {isUploading ? (
                           <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                           <span className="material-symbols-outlined">cloud_upload</span>
                         )}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2 w-32 aspect-square rounded-xl bg-gray-800 border border-white/10 overflow-hidden">
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary ml-1">Mô tả hình ảnh (Cho AI hoặc Gợi ý)</label>
                    <textarea 
                      required 
                      value={formData.imageDescription}
                      onChange={(e) => handleChange('imageDescription', e.target.value)}
                      className="rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary px-6 py-4 min-h-[80px]"
                    />
                 </div>
              </>
            )}

            <div className="pt-4 flex justify-end gap-3">
               <button 
                 type="button"
                 onClick={onClose}
                 className="px-8 py-3 rounded-full font-bold text-white border border-white/10 hover:bg-white/5"
               >
                 Hủy bỏ
               </button>
               <button 
                 type="submit"
                 disabled={isSaving}
                 className="px-10 py-3 rounded-full font-black bg-primary text-[#0d1b12] shadow-lg shadow-primary/20 hover:bg-[#0fd650] flex items-center gap-2"
               >
                 {isSaving ? (
                   <>
                     <div className="size-4 border-2 border-[#0d1b12] border-t-transparent rounded-full animate-spin"></div>
                     Đang lưu...
                   </>
                 ) : (
                   <>
                     <span className="material-symbols-outlined filled">save</span>
                     Lưu dữ liệu
                   </>
                 )}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameEditorModal;
