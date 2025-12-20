
import React, { useState, useEffect } from 'react';
import { GameData, GameType } from '../../types';
import { dataService } from '../../services/dataService';
import PaginationControls from './PaginationControls';
import GameEditorModal from './GameEditorModal';

const GameLibrary: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>('RUNG_CHUONG_VANG');
  const [data, setData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 8;

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GameData | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const GAME_TABS: { id: GameType; label: string; icon: string }[] = [
    { id: 'RUNG_CHUONG_VANG', label: 'Rung Chuông Vàng', icon: 'notifications_active' },
    { id: 'VUA_TIENG_VIET', label: 'Vua Tiếng Việt', icon: 'edit_note' },
    { id: 'DUOI_HINH_BAT_CHU', label: 'Đuổi Hình Bắt Chữ', icon: 'image_search' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedGame, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [items, count] = await Promise.all([
        dataService.getGameLibrary(selectedGame, page, PAGE_SIZE),
        dataService.getGameLibraryCount(selectedGame)
      ]);
      setData(items);
      setTotalItems(count);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (item: GameData) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSave = async (content: any) => {
    // If editingItem exists, it's an update, otherwise create
    const id = editingItem?.id;
    const success = await dataService.saveGameContent(selectedGame, content, id);
    if (success) {
      fetchData();
    } else {
      alert("Lỗi khi lưu dữ liệu.");
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await dataService.deleteGameContent(itemToDelete);
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
      fetchData();
    }
  };

  const renderContentPreview = (content: any) => {
    switch (selectedGame) {
      case 'RUNG_CHUONG_VANG':
        return (
          <div>
            <p className="font-bold text-sm mb-1 line-clamp-2">Q: {content.question}</p>
            <p className="text-xs text-gray-500">A: {content.options?.[content.correctIndex]}</p>
          </div>
        );
      case 'VUA_TIENG_VIET':
        return (
          <div>
             <p className="font-black text-lg text-primary">{content.word}</p>
             <p className="text-xs text-gray-500 italic">Hint: {content.hint}</p>
             <span className="text-[10px] uppercase bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">{content.category}</span>
          </div>
        );
      case 'DUOI_HINH_BAT_CHU':
        return (
          <div className="flex gap-3">
             {content.imageUrl && (
               <img src={content.imageUrl} className="size-16 object-cover rounded-lg bg-gray-100" />
             )}
             <div>
                <p className="font-black text-primary">{content.word}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{content.imageDescription}</p>
             </div>
          </div>
        );
      default:
        return <pre className="text-xs">{JSON.stringify(content).slice(0, 50)}...</pre>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {GAME_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setSelectedGame(tab.id); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedGame === tab.id 
                  ? 'bg-primary text-[#102216] shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined filled">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/10 text-primary font-black rounded-full border-2 border-primary/20 hover:bg-primary hover:text-[#0d1b12] transition-all shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm câu hỏi
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-6 shadow-soft border border-gray-100 dark:border-white/10 min-h-[400px] relative">
         {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[2rem]">
               <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
               <p className="text-sm font-bold text-gray-500">Đang tải dữ liệu kho...</p>
            </div>
         )}
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.length === 0 && !loading && (
               <div className="col-span-full py-20 text-center text-gray-400 italic">
                  Chưa có dữ liệu nào được lưu trong kho này. 
                  <br/>Hãy nhấn "Thêm câu hỏi" để bắt đầu.
               </div>
            )}
            {data.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all group relative pr-20">
                 {renderContentPreview(item.content)}
                 
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"
                      title="Chỉnh sửa"
                    >
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Xóa"
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                 </div>
              </div>
            ))}
         </div>

         {totalItems > PAGE_SIZE && (
           <PaginationControls 
             currentPage={page}
             totalItems={totalItems}
             pageSize={PAGE_SIZE}
             onPageChange={setPage}
           />
         )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <GameEditorModal 
          gameType={selectedGame}
          initialData={editingItem?.content}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#1a3322] border-2 border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center gap-6">
                <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 animate-bounce">
                   <span className="material-symbols-outlined text-5xl filled">delete_forever</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">Xóa dữ liệu?</h4>
                  <p className="text-[#4c9a66] font-bold">Dữ liệu này sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                   <button 
                    onClick={confirmDelete}
                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-full shadow-lg transition-all active:scale-95"
                   >
                     Đồng ý xóa
                   </button>
                   <button 
                    onClick={() => setIsDeleteModalOpen(false)}
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

export default GameLibrary;
