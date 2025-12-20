
import React, { useState, useEffect, useRef } from 'react';
import { dataService, IMAGE_KEYS } from '../../services/dataService';
import { storageService } from '../../services/storageService';

interface LogoItem {
  key: string;
  label: string;
  description: string;
  fallback: string;
  aspectRatio: string;
}

const LOGO_CONFIGS: LogoItem[] = [
  {
    key: IMAGE_KEYS.SYSTEM_LOGO,
    label: 'Logo Ứng Dụng',
    description: 'Hiển thị ở góc trên bên trái của thanh menu. Nên dùng ảnh PNG trong suốt, tỉ lệ vuông hoặc ngang.',
    fallback: '', // Will handle fallback in component
    aspectRatio: 'aspect-square md:aspect-auto'
  },
  {
    key: IMAGE_KEYS.SYSTEM_FAVICON,
    label: 'Favicon (Tab trình duyệt)',
    description: 'Icon nhỏ hiển thị trên tab trình duyệt. Kích thước khuyến nghị 32x32 hoặc 64x64.',
    fallback: '',
    aspectRatio: 'aspect-square'
  },
  {
    key: IMAGE_KEYS.SYSTEM_PWA_ICON,
    label: 'Icon Ứng dụng (Mobile)',
    description: 'Icon hiển thị khi người dùng cài đặt ứng dụng trên điện thoại (PWA). Kích thước khuyến nghị 192x192 trở lên.',
    fallback: '',
    aspectRatio: 'aspect-square'
  }
];

const LogoManager: React.FC = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const loaded: Record<string, string> = {};
    for (const config of LOGO_CONFIGS) {
      loaded[config.key] = await dataService.getSystemImage(config.key, '');
    }
    setImages(loaded);
  };

  const handleUploadClick = (key: string) => {
    fileInputRefs.current[key]?.click();
  };

  const handleFileChange = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      // 1. Upload to Storage
      const publicUrl = await storageService.uploadSystemImage(file);
      
      if (publicUrl) {
        // 2. Save to Database with the specific Key
        // We first need to check if an image with this key exists to update it, or create new
        // The saveImage function in dataService handles upsert based on ID, but we want upsert based on KEY.
        // However, current schema might not enforce unique Key. 
        // Strategy: Query by Key first to get ID, then update.
        
        // Simpler strategy given current dataService:
        // Delete existing record with this key first (optional clean up) or just let saveImage handle it if we passed an ID.
        // Since we don't have the ID handy easily without fetching full object, let's just insert/update based on convention.
        
        // Actually, let's use a specialized logic here:
        // Fetch existing by key
        const { data: existing } = await import('../../services/supabaseClient').then(m => m.supabase
          .from('admin_images')
          .select('id')
          .eq('key', key)
          .single()
        );

        await dataService.saveImage({
          id: existing?.id || 'new',
          url: publicUrl,
          description: LOGO_CONFIGS.find(c => c.key === key)?.label || 'System Logo',
          category: 'Branding',
          key: key
        });

        // 3. Update State
        setImages(prev => ({ ...prev, [key]: publicUrl }));
        alert("Đã cập nhật logo thành công! Hãy tải lại trang để thấy thay đổi.");
        
        // Force favicon update immediately if applicable
        if (key === IMAGE_KEYS.SYSTEM_FAVICON) {
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (link) link.href = publicUrl;
        }
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {LOGO_CONFIGS.map((config) => (
        <div key={config.key} className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-soft flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">
                {config.key === IMAGE_KEYS.SYSTEM_LOGO ? 'badge' : (config.key === IMAGE_KEYS.SYSTEM_FAVICON ? 'tab' : 'install_mobile')}
              </span>
            </div>
            <h4 className="font-bold text-lg">{config.label}</h4>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-black/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 mb-4 relative overflow-hidden group">
            {images[config.key] ? (
              <img 
                src={images[config.key]} 
                alt={config.label} 
                className={`max-w-full max-h-32 object-contain transition-transform group-hover:scale-105 ${config.key === IMAGE_KEYS.SYSTEM_FAVICON ? 'w-16 h-16' : ''}`}
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                <span className="text-xs">Chưa có ảnh</span>
              </div>
            )}
            
            {loading[config.key] && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/60 flex items-center justify-center">
                 <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-6 min-h-[40px]">{config.description}</p>

          <input 
            type="file" 
            ref={el => fileInputRefs.current[config.key] = el}
            onChange={(e) => handleFileChange(config.key, e)}
            accept="image/png, image/jpeg, image/svg+xml, image/ico"
            className="hidden"
          />

          <button 
            onClick={() => handleUploadClick(config.key)}
            disabled={loading[config.key]}
            className="w-full py-3 rounded-xl bg-primary text-[#0d1b12] font-black hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">cloud_upload</span>
            {images[config.key] ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default LogoManager;
