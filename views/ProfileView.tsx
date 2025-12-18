
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    grade: user.grade,
    school: user.school,
    email: user.email,
    phone: user.phone || ''
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onUpdate({
        ...user,
        ...formData
      });
      setSaving(false);
      alert('Đã cập nhật thông tin thành công!');
    }, 600);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black">Hồ sơ cá nhân</h2>
        <p className="text-gray-500">Cập nhật thông tin của bé để trải nghiệm học tập tốt hơn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-soft border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
            <div className="relative group">
              <div 
                className="h-32 w-32 rounded-full border-4 border-primary shadow-xl bg-center bg-cover transition-transform group-hover:scale-105" 
                style={{backgroundImage: `url("${user.avatar}")`}}
              ></div>
              <button className="absolute bottom-0 right-0 size-10 rounded-full bg-primary text-text-main shadow-lg flex items-center justify-center border-4 border-white dark:border-surface-dark hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
            <h3 className="text-2xl font-black mt-6 truncate w-full">{formData.name}</h3>
            <p className="text-primary font-bold">{formData.grade}</p>
            <div className="w-full h-px bg-gray-100 dark:bg-white/5 my-6"></div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tên đăng nhập</span>
                <span className="text-sm font-bold">{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Huy hiệu</span>
                <span className="text-sm font-bold text-orange-500">Người khai phá</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/5 dark:to-primary/10 rounded-3xl p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary filled">verified</span>
              <h4 className="font-bold">Gói học tập</h4>
            </div>
            <p className="text-sm font-medium mb-4">Em đang sử dụng gói <b>Premium</b> với đầy đủ tính năng trợ lý AI.</p>
            <button className="w-full py-2.5 rounded-xl bg-white dark:bg-black/20 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">Gia hạn ngay</button>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-soft border border-gray-100 dark:border-white/5">
            <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person_edit</span>
              Thông tin chi tiết
            </h4>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Tên của bé</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Lớp học</label>
                <input 
                  type="text" 
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold ml-1">Trường học</label>
                <input 
                  type="text" 
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Email phụ huynh</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary focus:ring-0 transition-all font-medium"
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <div className="h-px bg-gray-100 dark:bg-white/5 w-full mb-8"></div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    Bảo mật
                  </h4>
                  <button type="button" className="text-sm font-bold text-primary hover:underline">Đổi mật khẩu</button>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="h-14 px-10 bg-primary hover:bg-primary-hover text-text-main font-bold rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="size-5 border-2 border-text-main/30 border-t-text-main rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
