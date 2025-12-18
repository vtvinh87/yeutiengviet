
import React, { useState, useEffect } from 'react';
import { User, Story, AdminImage } from '../../types';
import { IMAGE_KEYS } from '../../services/dataService';
import { aiTeacherService } from '../../services/aiTeacherService';
import { audioBufferToWav } from '../../services/audioUtils';
import { storageService } from '../../services/storageService';
import { GoogleGenAI } from "@google/genai";

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

    setIsGeneratingAudio(true);
    setAudioStatus('Đang tạo audio...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(formData.entries());
    
    let finalData = { 
      ...editingItem, 
      ...values,
      summary: autoSummary || editingItem?.summary,
      duration: autoDuration || editingItem?.duration
    };

    if (activeTab === 'stories') {
      // 1. Nếu có audio mới tạo, upload nó trước
      if (audioBlob) {
        setAudioStatus('Đang lưu audio lên hệ thống...');
        const uploadedUrl = await storageService.uploadStoryAudio(editingItem?.id || 'new', audioBlob);
        if (uploadedUrl) {
          finalData.audioUrl = uploadedUrl;
        }
      } else if (editingItem?.audioUrl) {
        // Giữ lại audio cũ nếu không tạo mới
        finalData.audioUrl = editingItem.audioUrl;
      }
    }
    
    try {
      await onSave(finalData);
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu. Vui lòng kiểm tra lại Database!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[#102216] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Loading Overlay for Audio Generation */}
        {(isGeneratingAudio || isSaving) && (
          <div className="absolute inset-0 z-50 bg-[#102216]/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="size-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                  {isSaving ? 'save' : 'record_voice_over'}
                </span>
              </div>
            </div>
            <h4 className="text-2xl font-black text-white mb-3">{isSaving ? 'Đang lưu dữ liệu...' : 'Đang tạo Narration AI'}</h4>
            <p className="text-primary font-bold text-lg h-12 flex items-center justify-center animate-in slide-in-from-bottom-2">
              {isSaving ? 'Đang đồng bộ với hệ thống Supabase' : LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <h3 className="font-black text-2xl text-white">
            {editingItem ? 'Cập nhật truyện' : 'Thêm mới truyện'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-white rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form id="admin-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Tên hiển thị</label>
                  <input name="name" defaultValue={editingItem?.name} required className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Tên đăng nhập</label>
                  <input name="username" defaultValue={editingItem?.username} required className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Email</label>
                  <input name="email" defaultValue={editingItem?.email} required type="email" className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Lớp</label>
                  <input name="grade" defaultValue={editingItem?.grade} className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                </div>
              </div>
            )}

            {activeTab === 'stories' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Tiêu đề truyện</label>
                  <input 
                    id="story-title"
                    name="title" 
                    defaultValue={editingItem?.title} 
                    required 
                    className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary/70 ml-1">Hình ảnh (URL)</label>
                    <input name="image" defaultValue={editingItem?.image} className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary/70 ml-1">Audio Narration</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const title = (document.getElementById('story-title') as HTMLInputElement).value;
                          const content = (document.getElementById('story-content') as HTMLTextAreaElement).value;
                          generateAIAudio(title, content);
                        }}
                        className={`flex-1 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                          audioBlob || editingItem?.audioUrl 
                            ? 'border-primary/40 text-primary bg-primary/5' 
                            : 'border-white/10 text-white/50 hover:border-primary/50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {(audioBlob || editingItem?.audioUrl ? 'check_circle' : 'record_voice_over')}
                        </span>
                        {(audioBlob || editingItem?.audioUrl ? 'Làm mới Audio AI' : 'Tạo Audio AI')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Nội dung câu chuyện</label>
                  <textarea 
                    id="story-content"
                    name="content" 
                    defaultValue={editingItem?.content} 
                    required
                    className="rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4 py-3 min-h-[200px]" 
                  />
                </div>

                {(autoSummary || autoDuration || editingItem?.audioUrl) && (
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Thông tin bổ sung</p>
                    <p className="text-xs text-white/70"><b>Tóm tắt:</b> {autoSummary || editingItem?.summary}</p>
                    <p className="text-xs text-white/70"><b>Thời lượng:</b> {autoDuration || editingItem?.duration}</p>
                    <p className="text-xs text-white/70"><b>Trạng thái:</b> {audioStatus}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'images' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">URL Hình ảnh</label>
                  <input name="url" defaultValue={editingItem?.url} required className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Mô tả vị trí</label>
                  <input name="description" defaultValue={editingItem?.description} className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary/70 ml-1">Vị trí hệ thống (Key)</label>
                  <select name="key" defaultValue={editingItem?.key || ''} className="h-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary transition-all px-4">
                    <option value="" className="bg-[#102216]">-- Thủ công --</option>
                    {Object.entries(IMAGE_KEYS).map(([k, v]) => (
                      <option key={v} value={v} className="bg-[#102216]">{k}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="h-14 px-10 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="h-14 px-10 bg-primary hover:bg-[#0fd650] text-[#0d1b12] font-black rounded-full shadow-lg shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50"
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
