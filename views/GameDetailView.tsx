
import React from 'react';
import { AppView, User } from '../types';
import RungChuongVang from './games/RungChuongVang';
import VuaTiengViet from './games/VuaTiengViet';
import DuoiHinhBatChu from './games/DuoiHinhBatChu';

interface GameDetailViewProps {
  setView: (view: AppView, gameId?: string) => void;
  user: User;
  gameId: string;
  onAwardExp?: (amount: number) => void;
}

const GameDetailView: React.FC<GameDetailViewProps> = ({ setView, user, gameId, onAwardExp }) => {
  switch (gameId) {
    case '1':
      return <RungChuongVang setView={setView} user={user} onAwardExp={onAwardExp} />;
    case '2':
      return <VuaTiengViet setView={setView} user={user} onAwardExp={onAwardExp} />;
    case '3':
      return <DuoiHinhBatChu setView={setView} user={user} onAwardExp={onAwardExp} />;
    default:
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Trò chơi không tồn tại</h2>
          <button onClick={() => setView('games')} className="mt-4 text-primary font-bold hover:underline">
            Quay lại danh sách
          </button>
        </div>
      );
  }
};

export default GameDetailView;
