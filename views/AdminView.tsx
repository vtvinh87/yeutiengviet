
import React, { useState, useEffect } from 'react';
import { User, Story, AdminImage } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import UserTable from './admin/UserTable';
import StoryTable from './admin/StoryTable';
import ImageTable from './admin/ImageTable';
import AdminModal from './admin/AdminModal';

type AdminTab = 'users' | 'stories' | 'images';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [images, setImages] = useState<AdminImage[]>([]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(authService.getUsers());
    setStories(dataService.getStories());
    setImages(dataService.getImages());
  };

  const handleSave = (data: any) => {
    if (activeTab === 'users') {
      authService.saveUser(data as User);
    } else if (activeTab === 'stories') {
      const current = dataService.getStories();
      const index = current.findIndex(s => s.id === data.id);
      if (index > -1) current[index] = data;
      else current.push({ ...data, id: Date.now().toString() });
      dataService.saveStories(current);
    } else if (activeTab === 'images') {
      const current = dataService.getImages();
      const index = current.findIndex(i => i.id === data.id);
      if (index > -1) current[index] = data;
      else current.push({ ...data, id: Date.now().toString() });
      dataService.saveImages(current);
    }
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    if (activeTab === 'users') {
      const current = authService.getUsers().filter(u => u.id !== id);
      localStorage.setItem("vn_companion_users", JSON.stringify(current));
    } else if (activeTab === 'stories') {
      const current = dataService.getStories().filter(s => s.id !== id);
      dataService.saveStories(current);
    } else if (activeTab === 'images') {
      const current = dataService.getImages().filter(i => i.id !== id);
      dataService.saveImages(current);
    }
    refreshData();
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
          <p className="text-gray-500">Quản lý nội dung và người dùng hệ thống.</p>
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
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-white/10">
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
