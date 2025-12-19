
import React from 'react';
import { User } from '../../types';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string, name: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
        <tr>
          <th className="px-6 py-4 font-bold text-sm">Người dùng</th>
          <th className="px-6 py-4 font-bold text-sm">Tài khoản</th>
          <th className="px-6 py-4 font-bold text-sm">Lớp</th>
          <th className="px-6 py-4 font-bold text-sm text-right">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
        {users.map(user => (
          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="size-10 rounded-full object-cover border border-primary/20" />
                <span className="font-bold">{user.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{user.username}</td>
            <td className="px-6 py-4"><span className="px-2 py-1 bg-primary/10 text-emerald-700 dark:text-primary text-xs font-bold rounded">{user.grade}</span></td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(user)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => onDelete(user.id, user.name)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
