
import React, { useState, useRef, useEffect } from 'react';
import { aiTeacherService } from '../services/aiTeacherService';
import { readingService } from '../services/readingService';
import ReadingHeader from './reading/ReadingHeader';
import ReadingExerciseDisplay from './reading/ReadingExerciseDisplay';
import ReadingRecorder from './reading/ReadingRecorder';
import ReadingFeedback from './reading/ReadingFeedback';

interface ReadingExercise {
  title: string;
  text: string;
  imageUrl: string;
  audioBuffer?: AudioBuffer | null;
}

const ReadingView: React.FC = () => {
  const [currentExercise, setCurrentExercise] = useState<ReadingExercise>({
    title: "Buổi sáng trên bản",
    text: "Hôm nay trời đẹp, chim hót líu lo trên cành. Mặt trời mọc sau dãy núi, tỏa ánh nắng vàng rực rỡ xuống bản làng.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ-Oq1a9_rr8cVQlwENRal6bX4ETKFztilOc5vBUwGaN7hJSGUwOVv9uqIGeSB6OKSLY70YhJWu058DGaidAmIVmc4my4ka-Iem7_ntVgMStLBJ2Ft89zr-kCAtZgVtZm-dBJFYsSheQH-obxuocOojhIuTRi1xZC3Gi88zzZ-8VS3j-ocWCOT1BbtDOe-6J3qQFphp6w8UbFJuBwTKm0FPUEh4kEMO0sSaoHL9oCVe63X_Rg9DWDvUeQw0_5jjqp11FTABaF6jA"
  });

  const [preloadedNext, setPreloadedNext] = useState<ReadingExercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedPreload, setHasStartedPreload] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const preloadNextContent = async () => {
    if (hasStartedPreload || preloadedNext) return;
    setHasStartedPreload(true);
    try {
      const nextContent = await readingService.generateNextExercise();
      const nextAudio = await aiTeacherService.generateSpeechBuffer(nextContent.text, audioCtxRef.current!);
      
      setPreloadedNext({
        title: nextContent.title,
        text: nextContent.text,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(nextContent.title)}/800/600`,
        audioBuffer: nextAudio
      });
    } catch (error) {
      console.error("Preload error:", error);
      setHasStartedPreload(false);
    }
  };

  const handleSpeakSample = async () => {
    if (!audioCtxRef.current) return;
    
    setIsSpeaking(true);
    if (currentExercise.audioBuffer) {
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = currentExercise.audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
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
            const result = await readingService.analyzePronunciation(base64String, currentExercise.text);
            setFeedbackData(result);
            setShowFeedback(true);
          } catch (error) {
            console.error("Analysis error:", error);
            alert("Cô không thể phân tích được giọng đọc của bé. Bé hãy thử lại nhé!");
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

  const handleNextExercise = () => {
    if (preloadedNext) {
      setCurrentExercise(preloadedNext);
      setPreloadedNext(null);
      setHasStartedPreload(false);
      setShowFeedback(false);
      setFeedbackData(null);
      preloadNextContent();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-8 duration-500">
      <ReadingHeader title={currentExercise.title} isPreloaded={!!preloadedNext} />

      <ReadingExerciseDisplay 
        imageUrl={currentExercise.imageUrl} 
        text={currentExercise.text} 
        isSpeaking={isSpeaking}
        onSpeak={handleSpeakSample}
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
          words={feedbackData.words}
          canGoNext={feedbackData.accuracy >= 80 && !!preloadedNext}
          onNext={handleNextExercise}
        />
      )}
    </div>
  );
};

export default ReadingView;
