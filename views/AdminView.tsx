
import React, { useState, useEffect } from 'react';
import { User, Story, AdminImage } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import UserTable from './admin/UserTable';
import StoryTable from './admin/StoryTable';
import ImageTable from './admin/ImageTable';
import AdminModal from './admin/AdminModal';

interface AdminViewProps {
  user: User;
}

const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'stories' | 'images'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Security check
  if (user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-in fade-in zoom-in">
        <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <span className="material-symbols-outlined text-6xl">lock</span>
        </div>
        <h2 className="text-3xl font-black">Truy cập bị từ chối</h2>
        <p className="text-gray-500 max-w-sm">Chỉ giáo viên quản trị mới có quyền truy cập khu vực này để bảo mật dữ liệu của các bé.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 px-8 py-3 bg-primary text-text-main font-bold rounded-full">Quay lại trang chủ</button>
      </div>
    );
  }

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const u = await authService.getAllUsers();
        setUsers(u);
      } else if (activeTab === 'stories') {
        const s = await dataService.getStories();
        setStories(s);
      } else if (activeTab === 'images') {
        const i = await dataService.getImages();
        setImages(i);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        await authService.updateProfile(data as User);
      } else if (activeTab === 'stories') {
        await dataService.saveStory(data as Story);
      } else if (activeTab === 'images') {
        await dataService.saveImage(data as AdminImage);
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Chi tiết lỗi khi lưu:", error);
      alert(`Lỗi hệ thống: ${error.message || "Không thể đồng bộ dữ liệu. Vui lòng kiểm tra lại bảng trong Database!"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục này khỏi hệ thống không?")) return;
    setLoading(true);
    try {
      if (activeTab === 'users') {
        await authService.deleteUser(id);
      } else if (activeTab === 'stories') {
        await dataService.deleteStory(id);
      } else if (activeTab === 'images') {
        await dataService.deleteImage(id);
      }
      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-4xl filled">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Hệ thống Quản trị</h2>
            <p className="text-gray-500 font-medium italic">Xin chào, Cô giáo {user.name}</p>
          </div>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-8 h-14 bg-primary text-[#102216] font-black rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Thêm mới dữ liệu
        </button>
      </div>

      <div className="flex p-1 bg-white/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 w-fit">
        {[
          { id: 'users', label: 'Học sinh', icon: 'person' },
          { id: 'stories', label: 'Truyện kể', icon: 'auto_stories' },
          { id: 'images', label: 'Hình ảnh', icon: 'collections' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-3.5 text-sm font-black transition-all rounded-xl ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-primary text-primary dark:text-[#102216] shadow-md' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4">
             <div className="size-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
             <p className="text-primary font-black animate-pulse">Đang cập nhật...</p>
          </div>
        )}
        <div className="p-2 overflow-x-auto custom-scrollbar">
          {activeTab === 'users' && <UserTable users={users} onEdit={openModal} onDelete={handleDelete} />}
          {activeTab === 'stories' && <StoryTable stories={stories} onEdit={openModal} onDelete={handleDelete} />}
          {activeTab === 'images' && <ImageTable images={images} onEdit={openModal} onDelete={handleDelete} />}
        </div>
      </div>

      {isModalOpen && (
        <AdminModal 
          activeTab={activeTab} 
          editingItem={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default AdminView;
