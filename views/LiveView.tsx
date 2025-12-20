
import React, { useState, useEffect, useRef } from 'react';
import { LiveTeacherSession } from '../services/liveService';

const LiveView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'open' | 'closed' | 'error' | 'unauthorized'>('idle');
  const [transcriptions, setTranscriptions] = useState<{ text: string, isUser: boolean }[]>([]);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(true);
  
  const sessionRef = useRef<LiveTeacherSession | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Kiểm tra xem đã có API Key chưa (từ env hoặc đã chọn qua dialog)
    const checkKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(!!process.env.API_KEY || selected);
      } else {
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();

    return () => {
      stopSession();
      outputAudioCtxRef.current?.close();
    };
  }, []);

  const handleOpenSelectKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Theo hướng dẫn: giả định chọn khóa thành công và tiếp tục
      setHasKey(true);
      setStatus('idle');
    }
  };

  const startSession = async () => {
    // Nếu chưa có khóa, không cho phép bắt đầu và hiển thị UI chọn khóa
    if (!process.env.API_KEY && typeof window !== 'undefined' && (window as any).aistudio) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      if (!selected) {
        setHasKey(false);
        return;
      }
    }

    setTranscriptions([]);
    sessionRef.current = new LiveTeacherSession();
    await sessionRef.current.connect({
      onAudioChunk: (buffer) => {
        if (!outputAudioCtxRef.current) return;
        const ctx = outputAudioCtxRef.current;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
        source.start(startTime);
        nextStartTimeRef.current = startTime + buffer.duration;
        
        sourcesRef.current.add(source);
        source.onended = () => sourcesRef.current.delete(source);
      },
      onInterrupted: () => {
        sourcesRef.current.forEach(s => {
          try { s.stop(); } catch (e) {}
        });
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
      },
      onTranscription: (text, isUser) => {
        setTranscriptions(prev => {
          if (prev.length > 0 && prev[prev.length - 1].isUser === isUser) {
            const lastMessage = prev[prev.length - 1];
            const updatedHistory = [...prev];
            updatedHistory[prev.length - 1] = {
              ...lastMessage,
              text: lastMessage.text + text
            };
            return updatedHistory;
          }
          return [...prev, { text, isUser }];
        });
      },
      onStatusChange: (s) => {
        setStatus(s);
        // Nếu lỗi do không tìm thấy thực thể (thường là lỗi API Key/Project)
        if (s === 'error' || s === 'unauthorized') {
          // Xử lý race condition hoặc lỗi project: yêu cầu chọn lại khóa
          setHasKey(false);
        }
      }
    });
  };

  const stopSession = () => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setStatus('closed');
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    setShowConfirmEnd(false);
  };

  const handleEndClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmEnd(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] -m-4 md:-m-10 lg:-m-20 bg-[#0d1b12] animate-in fade-in duration-500 overflow-hidden relative">
      <div className="flex-1 flex flex-col md:flex-row h-full">
        {/* Left Side: Teacher Visualization */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#13ec5b]/5 to-transparent relative border-r border-white/5">
          <div className="relative mb-8">
            <div className={`size-56 md:size-72 rounded-full bg-[#13ec5b]/10 flex items-center justify-center border-4 border-[#13ec5b]/20 relative z-10 ${status === 'open' ? 'shadow-[0_0_50px_rgba(19,236,91,0.2)]' : ''}`}>
               <div className="size-48 md:size-60 rounded-full bg-[#13ec5b]/20 flex items-center justify-center border-2 border-[#13ec5b]/30">
                  <span className="material-symbols-outlined text-8xl md:text-9xl text-primary filled">psychology</span>
               </div>
            </div>
            {status === 'open' && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[120%] rounded-full border border-[#13ec5b]/10 animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[140%] rounded-full border border-[#13ec5b]/5 animate-ping delay-700"></div>
              </>
            )}
          </div>
          
          <div className="text-center z-10 max-w-md">
            <h2 className="text-4xl font-black mb-2 text-white">Cô Giáo AI</h2>
            
            {!hasKey ? (
              <div className="bg-white/5 border border-primary/20 p-6 rounded-[2rem] animate-in zoom-in duration-300">
                <p className="text-primary font-bold text-lg mb-4">
                  Cần thiết lập khóa API để trò chuyện
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Để sử dụng tính năng AI trực tiếp, bé cần chọn một Khóa API từ dự án Google Cloud đã bật thanh toán.
                </p>
                <button 
                  onClick={handleOpenSelectKey}
                  className="w-full h-14 bg-primary hover:bg-primary-hover text-[#0d1b12] font-black rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined filled">key</span>
                  Thiết lập API Key
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs text-primary/60 hover:text-primary transition-colors underline"
                >
                  Tìm hiểu về thanh toán API
                </a>
              </div>
            ) : (
              <>
                <p className="text-[#4c9a66] font-bold text-lg mb-10">
                  {status === 'idle' && "Nhấn 'Bắt đầu' để trò chuyện cùng cô giáo nhé!"}
                  {status === 'connecting' && "Cô đang kết nối, bé chờ xíu nha..."}
                  {status === 'open' && "Cô đang lắng nghe bé đây!"}
                  {status === 'closed' && "Hẹn gặp lại bé lần sau nhé!"}
                  {(status === 'error' || status === 'unauthorized') && "Ối! Gặp lỗi kết nối. Bé hãy kiểm tra lại thiết lập khóa nhé!"}
                </p>

                <div className="flex justify-center">
                  {status === 'open' ? (
                    <button 
                      onClick={handleEndClick}
                      className="h-16 px-12 bg-[#e14b4b] hover:bg-[#ff5555] text-white font-black rounded-full shadow-2xl transition-all active:scale-95 flex items-center gap-3 group relative z-50 overflow-visible"
                    >
                      <span className="material-symbols-outlined filled text-2xl">stop</span>
                      Kết thúc
                    </button>
                  ) : (
                    <button 
                      onClick={startSession}
                      className="h-16 px-12 bg-primary hover:bg-primary-hover text-[#0d1b12] font-black rounded-full shadow-2xl transition-all active:scale-95 flex items-center gap-3 group"
                    >
                      <span className="material-symbols-outlined filled text-2xl">mic</span>
                      Bắt đầu trò chuyện
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Transcriptions */}
        <div className="md:w-1/2 flex flex-col bg-black/20 h-full overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/10">
            <h3 className="font-black text-xl flex items-center gap-3 text-white">
              <span className="material-symbols-outlined text-primary">forum</span>
              Nhật ký trò chuyện
            </h3>
            <div className={`size-3 rounded-full ${status === 'open' ? 'bg-primary animate-pulse shadow-[0_0_8px_#13ec5b]' : 'bg-gray-600'}`}></div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/10">
            {transcriptions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#4c9a66] opacity-30 space-y-4">
                <span className="material-symbols-outlined text-8xl">chat_bubble</span>
                <p className="font-bold text-center px-4 text-xl">Nội dung trò chuyện sẽ xuất hiện ở đây.</p>
              </div>
            )}
            {transcriptions.map((t, i) => (
              <div key={i} className={`flex ${t.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                <div className={`max-w-[85%] p-5 rounded-3xl shadow-lg font-bold text-lg leading-relaxed ${
                  t.isUser 
                    ? 'bg-[#13ec5b]/10 text-primary rounded-tr-none border border-[#13ec5b]/20' 
                    : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10'
                }`}>
                  <p className="whitespace-pre-wrap">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowConfirmEnd(false)}></div>
          <div className="relative w-full max-w-sm bg-[#1a3322] border-2 border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center gap-6">
                <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                   <span className="material-symbols-outlined text-5xl filled">error</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">Kết thúc trò chuyện?</h4>
                  <p className="text-[#4c9a66] font-bold">Bé có chắc chắn muốn nghỉ học và kết thúc buổi trò chuyện không?</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                   <button 
                    onClick={stopSession}
                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-full shadow-lg transition-all active:scale-95"
                   >
                     Đúng vậy, kết thúc thôi
                   </button>
                   <button 
                    onClick={() => setShowConfirmEnd(false)}
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all"
                   >
                     Không, bé muốn học tiếp
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(19, 236, 91, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(19, 236, 91, 0.2); }
      `}</style>
    </div>
  );
};

export default LiveView;
