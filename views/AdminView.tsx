
import React, { useState, useEffect } from 'react';
import { User, Story, AdminImage, ReadingPractice } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { readingService } from '../services/readingService';
import UserTable from './admin/UserTable';
import StoryTable from './admin/StoryTable';
import ImageTable from './admin/ImageTable';
import ReadingPracticeTable from './admin/ReadingPracticeTable';
import AdminModal from './admin/AdminModal';
import LogoManager from './admin/LogoManager';

interface AdminViewProps {
  user: User;
}

const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'stories' | 'images' | 'reading_practice' | 'branding'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [readingPractices, setReadingPractices] = useState<ReadingPractice[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination states for all tabs
  const [pages, setPages] = useState({
    users: 1,
    stories: 1,
    images: 1,
    reading_practice: 1
  });

  const [totals, setTotals] = useState({
    users: 0,
    stories: 0,
    images: 0,
    reading_practice: 0
  });

  const PAGE_SIZE = 5;

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

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
    if (activeTab !== 'branding') {
      refreshData();
    }
  }, [activeTab, pages]);

  const refreshData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const [u, count] = await Promise.all([
          authService.getAllUsers(pages.users, PAGE_SIZE),
          authService.getUsersCount()
        ]);
        setUsers(u);
        setTotals(prev => ({ ...prev, users: count }));
      } else if (activeTab === 'stories') {
        const [s, count] = await Promise.all([
          dataService.getStories(pages.stories, PAGE_SIZE),
          dataService.getStoriesCount()
        ]);
        setStories(s);
        setTotals(prev => ({ ...prev, stories: count }));
      } else if (activeTab === 'images') {
        const [i, count] = await Promise.all([
          dataService.getImages(pages.images, PAGE_SIZE),
          dataService.getImagesCount()
        ]);
        setImages(i);
        setTotals(prev => ({ ...prev, images: count }));
      } else if (activeTab === 'reading_practice') {
        const [r, count] = await Promise.all([
          readingService.getSavedExercises(pages.reading_practice, PAGE_SIZE),
          readingService.getSavedExercisesCount()
        ]);
        setReadingPractices(r);
        setTotals(prev => ({ ...prev, reading_practice: count }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPages(prev => ({ ...prev, [activeTab]: page }));
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

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    const id = itemToDelete.id;
    setItemToDelete(null);

    try {
      if (activeTab === 'users') {
        await authService.deleteUser(id);
      } else if (activeTab === 'stories') {
        await dataService.deleteStory(id);
      } else if (activeTab === 'images') {
        await dataService.deleteImage(id);
      } else if (activeTab === 'reading_practice') {
        await readingService.deleteExercise(id);
      }
      
      // Kiểm tra nếu xóa mục cuối cùng ở trang hiện tại, quay lại trang trước
      const currentItemsCount = {
        users: users.length,
        stories: stories.length,
        images: images.length,
        reading_practice: readingPractices.length,
        branding: 0
      }[activeTab];

      if (currentItemsCount === 1 && pages[activeTab as keyof typeof pages] > 1) {
        handlePageChange(pages[activeTab as keyof typeof pages] - 1);
      } else {
        await refreshData();
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Gặp lỗi khi xóa dữ liệu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInitiated = (id: string, name: string) => {
    setItemToDelete({ id, name });
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
        {activeTab !== 'reading_practice' && activeTab !== 'branding' && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-8 h-14 bg-primary text-[#102216] font-black rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Thêm mới dữ liệu
          </button>
        )}
      </div>

      <div className="flex flex-wrap p-1 bg-white/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 w-fit gap-1">
        {[
          { id: 'users', label: 'Học sinh', icon: 'person' },
          { id: 'stories', label: 'Truyện kể', icon: 'auto_stories' },
          { id: 'images', label: 'Hình ảnh', icon: 'collections' },
          { id: 'reading_practice', label: 'Kho Luyện đọc', icon: 'book' },
          { id: 'branding', label: 'Thương hiệu', icon: 'verified' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition-all rounded-xl ${
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

      {activeTab === 'branding' ? (
        <LogoManager />
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4">
              <div className="size-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-primary font-black animate-pulse">Đang cập nhật...</p>
            </div>
          )}
          <div className="p-2 overflow-x-auto custom-scrollbar">
            {activeTab === 'users' && (
              <UserTable 
                users={users} 
                onEdit={openModal} 
                onDelete={handleDeleteInitiated}
                currentPage={pages.users}
                totalItems={totals.users}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            )}
            {activeTab === 'stories' && (
              <StoryTable 
                stories={stories} 
                onEdit={openModal} 
                onDelete={handleDeleteInitiated}
                currentPage={pages.stories}
                totalItems={totals.stories}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            )}
            {activeTab === 'images' && (
              <ImageTable 
                images={images} 
                onEdit={openModal} 
                onDelete={handleDeleteInitiated}
                currentPage={pages.images}
                totalItems={totals.images}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            )}
            {activeTab === 'reading_practice' && (
              <ReadingPracticeTable 
                items={readingPractices} 
                onDelete={handleDeleteInitiated} 
                currentPage={pages.reading_practice}
                totalItems={totals.reading_practice}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}

      {isModalOpen && activeTab !== 'branding' && (
        <AdminModal 
          activeTab={activeTab === 'reading_practice' ? 'stories' : activeTab} 
          editingItem={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setItemToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-[#1a3322] border-2 border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center gap-6">
                <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 animate-bounce">
                   <span className="material-symbols-outlined text-5xl filled">warning</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">Xác nhận xóa?</h4>
                  <p className="text-[#4c9a66] font-bold">Bạn có chắc chắn muốn xóa <span className="text-white">"{itemToDelete.name}"</span> không?</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                   <button 
                    onClick={confirmDelete}
                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-full shadow-lg transition-all active:scale-95"
                   >
                     Đồng ý xóa
                   </button>
                   <button 
                    onClick={() => setItemToDelete(null)}
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all"
                   >
                     Hủy bỏ
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
