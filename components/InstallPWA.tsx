
import React, { useEffect, useState } from 'react';

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Kiểm tra xem đã cài đặt chưa
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (!promptInstall) return;
    
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA prompt');
        setSupportsPWA(false);
      } else {
        console.log('User dismissed the PWA prompt');
      }
      setPromptInstall(null);
    });
  };

  if (!supportsPWA || isInstalled) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 z-[9000] flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#1a3322] text-text-main dark:text-white font-bold rounded-2xl shadow-2xl border border-primary/30 animate-in slide-in-from-bottom-10 duration-700 hover:scale-105 transition-transform"
    >
      <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-[#102216]">
        <span className="material-symbols-outlined filled">install_mobile</span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs uppercase text-gray-500 font-bold">Trải nghiệm tốt hơn</span>
        <span className="text-sm font-black">Cài đặt ứng dụng</span>
      </div>
    </button>
  );
};

export default InstallPWA;
