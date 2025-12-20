
import React, { useState, useEffect, useRef } from 'react';
import { User, Story, AdminImage } from '../../types';
import { IMAGE_KEYS } from '../../services/dataService';
import { aiTeacherService } from '../../services/aiTeacherService';
import { audioBufferToWav } from '../../services/audioUtils';
import { storageService } from '../../services/storageService';
import { getAiInstance } from '../../services/geminiClient';

interface AdminModalProps {
  activeTab: 'users' | 'stories' | 'images';
  editingItem: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const LOADING_MESSAGES = [
  "Cô giáo AI đang đọc nội dung truyện...",
  "Đang tóm tắt câu chuyện cho các bé...",
  "Đang tính toán thời lượng kể chuyện...",
  "Đang chuyển đổi văn bản thành giọng đọc truyền cảm...",
  "Hệ thống đang xử lý âm thanh chất lượng cao...",
  "Sắp xong rồi, bé chờ cô một xíu nữa nhé...",
  "Đang đóng gói file audio WAV..."
];

const AdminModal: React.FC<AdminModalProps> = ({ activeTab, editingItem, onClose, onSave }) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioStatus, setAudioStatus] = useState<string>(editingItem?.audioUrl ? 'Đã có audio' : 'Chưa có audio');
  const [autoSummary, setAutoSummary] = useState(editingItem?.summary || '');
  const [autoDuration, setAutoDuration] = useState(editingItem?.duration || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [imageUrl, setImageUrl] = useState(editingItem?.url || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isGeneratingAudio) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 5000);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGeneratingAudio]);

  const generateAIAudio = async (title: string, content: string) => {
    if (!title || !content) {
      alert("Vui lòng nhập Tiêu đề và Nội dung trước khi tạo audio!");
      return;
    }

    const ai = getAiInstance();
    if (!ai) {
      alert("Chưa cấu hình API Key trong VITE_API_KEY. Không thể sử dụng tính năng AI.");
      return;
    }

    setIsGeneratingAudio(true);
    setAudioStatus('Đang tạo audio...');

    try {
      const summaryResult = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tóm tắt ngắn gọn câu chuyện "${title}" trong 1-2 câu cho trẻ em. Nội dung: ${content}`,
      });
      const summaryText = summaryResult.text || "";
      setAutoSummary(summaryText);

      const wordCount = content.split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 130);
      setAutoDuration(`${minutes} phút`);

      const narrationText = `Chào mừng các bé đã đến với góc kể chuyện của Yêu Tiếng Việt. Hôm nay, cô sẽ kể cho các bé nghe câu chuyện mang tên: ${title}. ${content}. Câu chuyện đến đây là hết rồi. Hẹn gặp lại các bé lần sau nhé!`;
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await aiTeacherService.generateSpeechBuffer(narrationText, ctx);
      
      if (buffer) {
        const wavBlob = audioBufferToWav(buffer);
        setAudioBlob(wavBlob);
        setAudioStatus('Đã tạo audio xong! (Nhớ nhấn Lưu lại)');
      } else {
        throw new Error("Không thể tạo buffer âm thanh");
      }
    } catch (error) {
      console.error(error);
      setAudioStatus('Lỗi khi tạo audio');
      alert("Gặp lỗi khi tạo audio AI. Bé thử lại nhé!");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await storageService.uploadSystemImage(file);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        alert("Không thể tải ảnh lên. Bé kiểm tra lại bucket admin-images nhé!");
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isUploadingImage) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(formData.entries());
    
    let finalData = { 
      ...editingItem, 
      ...values,
    };

    if (activeTab === 'images') {
      finalData.url = imageUrl;
    }

    if (activeTab === 'stories') {
      finalData.summary = autoSummary || editingItem?.summary;
      finalData.duration = autoDuration || editingItem?.duration;

      if (audioBlob) {
        const oldAudioUrl = editingItem?.audioUrl;
        const uploadedUrl = await storageService.uploadStoryAudio(editingItem?.id || 'new', audioBlob);
        
        if (uploadedUrl) {
          finalData.audioUrl = uploadedUrl;
          if (oldAudioUrl) {
            await storageService.deleteStoryAudio(oldAudioUrl);
          }
        }
      }
    }
    
    try {
      await onSave(finalData);
    } catch (err) {
      console.error("Lỗi khi gửi onSave:", err);
      alert("Gặp lỗi khi đồng bộ với hệ thống. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[#102216] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {(isGeneratingAudio || isSaving || isUploadingImage) && (
          <div className="absolute inset-0 z-50 bg-[#102216]/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="size-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                  {isSaving ? 'save' : (isUploadingImage ? 'cloud_upload' : 'record_voice_over')}
                </span>
              </div>
            </div>
            <h4 className="text-2xl font-black text-white mb-3">
              {isSaving ? 'Đang lưu dữ liệu...' : (isUploadingImage ? 'Đang tải ảnh lên...' : 'Đang tạo Narration AI')}
            </h4>
            <p className="text-primary font-bold text-lg h-12 flex items-center justify-center animate-in slide-in-from-bottom-2">
              {isSaving ? 'Đang đồng bộ với hệ thống Supabase' : (isUploadingImage ? 'Vui lòng đợi trong giây lát...' : LOADING_MESSAGES[loadingMessageIndex])}
            </p>
          </div>
        )}

        <div className="p-8 pb-4 flex items-center justify-between">
          <h3 className="font-black text-2xl text-white">
            {activeTab === 'images' ? (editingItem ? 'Sửa thông tin ảnh' : 'Thêm mới ảnh') : (editingItem ? 'Cập nhật' : 'Thêm mới')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form id="admin-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Tên hiển thị</label>
                  <input name="name" defaultValue={editingItem?.name} required className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Tên đăng nhập</label>
                  <input name="username" defaultValue={editingItem?.username} required className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" />
                </div>
              </div>
            )}

            {activeTab === 'stories' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Tiêu đề truyện</label>
                  <input 
                    id="story-title"
                    name="title" 
                    defaultValue={editingItem?.title} 
                    required 
                    className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary ml-1">Hình ảnh (URL)</label>
                    <input name="image" defaultValue={editingItem?.image} className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary ml-1">Audio Narration</label>
                    <button 
                      type="button"
                      onClick={() => {
                        const title = (document.getElementById('story-title') as HTMLInputElement).value;
                        const content = (document.getElementById('story-content') as HTMLTextAreaElement).value;
                        generateAIAudio(title, content);
                      }}
                      className={`h-14 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                        audioBlob || editingItem?.audioUrl 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-white/10 text-white/50 hover:border-primary/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {(audioBlob || editingItem?.audioUrl ? 'check_circle' : 'record_voice_over')}
                      </span>
                      {(audioBlob || editingItem?.audioUrl ? 'Làm mới Audio AI' : 'Tạo Audio AI')}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">Nội dung câu chuyện</label>
                  <textarea 
                    id="story-content"
                    name="content" 
                    defaultValue={editingItem?.content} 
                    required
                    className="rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6 py-4 min-h-[200px]" 
                  />
                </div>
              </>
            )}

            {activeTab === 'images' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary ml-1">URL Hình ảnh</label>
                  <div className="flex gap-2">
                    <input 
                      name="url" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)}
                      required 
                      className="flex-1 h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" 
                      placeholder="Nhập URL hoặc tải lên..."
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-14 px-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center transition-all"
                      title="Tải ảnh lên kho lưu trữ"
                    >
                      <span className="material-symbols-outlined">cloud_upload</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                  </div>
                  {imageUrl && (
                    <div className="mt-2 w-full aspect-video rounded-xl border border-white/10 overflow-hidden bg-black/20">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary ml-1">Mô tả nội dung</label>
                    <input name="description" defaultValue={editingItem?.description} className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary ml-1">Phân loại (Category)</label>
                    <input name="category" defaultValue={editingItem?.category || 'System'} className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-bold text-primary ml-1">Vị trí hệ thống (Key)</label>
                    <select name="key" defaultValue={editingItem?.key || ''} className="h-14 rounded-2xl bg-[#1a2e20] border-none text-white focus:ring-2 focus:ring-primary transition-all px-6">
                      <option value="" className="bg-[#102216]">-- Thủ công / Không có Key --</option>
                      {Object.entries(IMAGE_KEYS).map(([k, v]) => (
                        <option key={v} value={v} className="bg-[#102216]">{k}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="h-14 px-10 rounded-full font-bold text-white border-2 border-white/10 hover:bg-white/5 transition-all"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSaving || isUploadingImage}
                className="h-14 px-12 bg-primary hover:bg-[#0fd650] text-[#102216] font-black rounded-full shadow-lg shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                Lưu lại
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
