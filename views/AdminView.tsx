
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
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <span className="material-symbols-outlined text-6xl text-red-500">lock</span>
        <h2 className="text-2xl font-black">Truy cập bị từ chối</h2>
        <p className="text-gray-500">Chỉ giáo viên quản trị mới có quyền truy cập khu vực này.</p>
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Bảng quản trị</h2>
          <p className="text-gray-500">Quản lý nội dung và người dùng trên hệ thống Supabase.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-text-main font-bold rounded-full shadow-lg hover:bg-primary-hover transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm mới
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-white/10">
        {[
          { id: 'users', label: 'Người dùng', icon: 'group' },
          { id: 'stories', label: 'Truyện kể', icon: 'auto_stories' },
          { id: 'images', label: 'Hình ảnh', icon: 'image' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-white/10 min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
             <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        {activeTab === 'users' && <UserTable users={users} onEdit={openModal} onDelete={handleDelete} />}
        {activeTab === 'stories' && <StoryTable stories={stories} onEdit={openModal} onDelete={handleDelete} />}
        {activeTab === 'images' && <ImageTable images={images} onEdit={openModal} onDelete={handleDelete} />}
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
