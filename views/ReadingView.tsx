
import React, { useState, useRef, useEffect } from 'react';
import { aiTeacherService } from '../services/aiTeacherService';
import { readingService } from '../services/readingService';
import { authService } from '../services/authService';
import ReadingHeader from './reading/ReadingHeader';
import ReadingExerciseDisplay from './reading/ReadingExerciseDisplay';
import ReadingRecorder from './reading/ReadingRecorder';
import ReadingFeedback from './reading/ReadingFeedback';

interface ReadingExercise {
  title: string;
  text: string;
  imageUrl: string;
  audioBuffer?: AudioBuffer | null;
  isGenerated: boolean;
}

interface ReadingViewProps {
  onAwardExp?: (amount: number) => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ onAwardExp }) => {
  const [currentExercise, setCurrentExercise] = useState<ReadingExercise | null>(null);
  const [preloadedNext, setPreloadedNext] = useState<ReadingExercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedPreload, setHasStartedPreload] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const initExercise = async () => {
      setIsInitialLoading(true);
      try {
        const user = await authService.getCurrentUser();
        setIsAdmin(user?.role === 'admin');

        const content = await readingService.generateNextExercise();
        const audio = await aiTeacherService.generateSpeechBuffer(content.text, audioCtxRef.current!);
        
        const firstEx = {
          title: content.title,
          text: content.text,
          imageUrl: content.imageUrl,
          audioBuffer: audio,
          isGenerated: content.isGenerated
        };
        setCurrentExercise(firstEx);
        if (audio) playBuffer(audio);
      } catch (error) {
        console.error("Initial generation error:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initExercise();

    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioCtxRef.current) return;
    setIsSpeaking(true);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.onended = () => setIsSpeaking(false);
    source.start();
  };

  const preloadNextContent = async () => {
    if (hasStartedPreload || preloadedNext) return;
    setHasStartedPreload(true);
    try {
      const nextContent = await readingService.generateNextExercise();
      const nextAudio = await aiTeacherService.generateSpeechBuffer(nextContent.text, audioCtxRef.current!);
      
      setPreloadedNext({
        title: nextContent.title,
        text: nextContent.text,
        imageUrl: nextContent.imageUrl,
        audioBuffer: nextAudio,
        isGenerated: nextContent.isGenerated
      });
    } catch (error) {
      console.error("Preload error:", error);
      setHasStartedPreload(false);
    }
  };

  const handleSpeakSample = async () => {
    if (!audioCtxRef.current || !currentExercise) return;
    setIsSpeaking(true);
    if (currentExercise.audioBuffer) {
      playBuffer(currentExercise.audioBuffer);
    } else {
      await aiTeacherService.speak(currentExercise.text);
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    preloadNextContent();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          setIsProcessing(true);
          try {
            if (currentExercise) {
              const result = await readingService.analyzePronunciation(base64String, currentExercise.text);
              setFeedbackData(result);
              setShowFeedback(true);
              if (onAwardExp) onAwardExp(Math.floor(result.accuracy / 2));
            }
          } catch (error) {
            console.error("Analysis error:", error);
          } finally {
            setIsProcessing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Bé cần cho phép sử dụng Micro để tập đọc nhé!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleNextExercise = async () => {
    // Nếu bài tiếp theo đã được nạp sẵn rồi thì đổi ngay
    if (preloadedNext) {
      setCurrentExercise(preloadedNext);
      setPreloadedNext(null);
      setHasStartedPreload(false);
      setShowFeedback(false);
      setFeedbackData(null);
      if (preloadedNext.audioBuffer) playBuffer(preloadedNext.audioBuffer);
      preloadNextContent();
      return;
    }

    // Nếu chưa có bài nạp sẵn (do AI lỗi hoặc mạng chậm), thực hiện nạp trực tiếp
    setIsSwitching(true);
    try {
      const nextContent = await readingService.generateNextExercise();
      const nextAudio = await aiTeacherService.generateSpeechBuffer(nextContent.text, audioCtxRef.current!);
      
      const newEx = {
        title: nextContent.title,
        text: nextContent.text,
        imageUrl: nextContent.imageUrl,
        audioBuffer: nextAudio,
        isGenerated: nextContent.isGenerated
      };
      
      setCurrentExercise(newEx);
      setShowFeedback(false);
      setFeedbackData(null);
      if (nextAudio) playBuffer(nextAudio);
      setHasStartedPreload(false);
    } catch (err) {
      console.error("Manual fetch next error:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isInitialLoading || !currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-2xl animate-pulse">auto_stories</span>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black mb-2">Đang chuẩn bị bài học...</h3>
          <p className="text-gray-500 font-medium">Cô giáo AI đang soạn bài và ghi âm giọng đọc cho bé!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-8 duration-500 pb-20">
      <ReadingHeader title={currentExercise.title} isPreloaded={!!preloadedNext} />

      <ReadingExerciseDisplay 
        title={currentExercise.title}
        imageUrl={currentExercise.imageUrl} 
        text={currentExercise.text} 
        isSpeaking={isSpeaking}
        onSpeak={handleSpeakSample}
        audioBuffer={currentExercise.audioBuffer}
        isAdmin={isAdmin}
        isGenerated={currentExercise.isGenerated}
      />

      <ReadingRecorder 
        isRecording={isRecording} 
        isProcessing={isProcessing} 
        onStart={startRecording}
        onStop={stopRecording}
      />

      {showFeedback && feedbackData && (
        <ReadingFeedback 
          score={feedbackData.score}
          accuracy={feedbackData.accuracy}
          feedback={feedbackData.feedback}
          wordComparison={feedbackData.wordComparison}
          actualTranscription={feedbackData.actualTranscription}
          canGoNext={feedbackData.accuracy >= 80}
          isPreloading={isSwitching || (!preloadedNext && hasStartedPreload)}
          onNext={handleNextExercise}
        />
      )}
    </div>
  );
};

export default ReadingView;
