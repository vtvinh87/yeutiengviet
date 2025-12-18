
import React from 'react';
import { User, Story, AdminImage } from '../../types';
import { IMAGE_KEYS } from '../../services/dataService';

interface AdminModalProps {
  activeTab: 'users' | 'stories' | 'images';
  editingItem: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ activeTab, editingItem, onClose, onSave }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(formData.entries());
    onSave({ ...editingItem, ...values });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-b border-gray-100 dark:border-white/10">
          <h3 className="font-black text-xl">
            {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'users' ? 'người dùng' : activeTab === 'stories' ? 'truyện' : 'hình ảnh'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'users' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Tên hiển thị</label>
                  <input name="name" defaultValue={editingItem?.name} required className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Tên đăng nhập</label>
                  <input name="username" defaultValue={editingItem?.username} required className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Email</label>
                  <input name="email" defaultValue={editingItem?.email} required type="email" className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Lớp</label>
                  <input name="grade" defaultValue={editingItem?.grade} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
              </>
            )}
            {activeTab === 'stories' && (
              <>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Tiêu đề truyện</label>
                  <input name="title" defaultValue={editingItem?.title} required className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Thời lượng (VD: 5 phút)</label>
                  <input name="duration" defaultValue={editingItem?.duration} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Hình ảnh (URL)</label>
                  <input name="image" defaultValue={editingItem?.image} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Tóm tắt</label>
                  <textarea name="summary" defaultValue={editingItem?.summary} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" rows={2} />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Nội dung</label>
                  <textarea name="content" defaultValue={editingItem?.content} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10 font-serif" rows={6} />
                </div>
              </>
            )}
            {activeTab === 'images' && (
              <>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">URL Hình ảnh</label>
                  <input name="url" defaultValue={editingItem?.url} required className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Mô tả vị trí</label>
                  <input name="description" defaultValue={editingItem?.description} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10" placeholder="VD: Hình trang chủ..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Vị trí hệ thống (Key)</label>
                  <select name="key" defaultValue={editingItem?.key || ''} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10">
                    <option value="">-- Không bắt buộc --</option>
                    {Object.entries(IMAGE_KEYS).map(([k, v]) => (
                      <option key={v} value={v}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Phân loại</label>
                  <select name="category" defaultValue={editingItem?.category || 'General'} className="rounded-xl border-gray-200 dark:bg-white/5 border dark:border-white/10">
                    <option>System</option>
                    <option>General</option>
                    <option>Nature</option>
                    <option>Animals</option>
                    <option>Education</option>
                  </select>
                </div>
              </>
            )}
            <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/10 mt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-full font-bold border border-gray-200 dark:border-white/10">Hủy</button>
              <button type="submit" className="px-8 py-2 bg-primary text-text-main font-bold rounded-full shadow-lg">Lưu lại</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
