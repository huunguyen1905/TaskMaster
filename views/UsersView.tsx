import React from 'react';
import { User } from '../types';

interface UsersViewProps {
    users: User[];
    onAddUser: () => void;
    onEditUser: (user: User) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, onAddUser, onEditUser }) => {
    
    return (
        <div className="p-6 md:p-8 h-full flex flex-col max-w-[1400px] mx-auto overflow-hidden">
             <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <div className="text-sm font-bold text-textMuted uppercase tracking-widest mb-1">Team Members</div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-textMain to-textMuted tracking-tight">
                        Quản lý nhân sự
                    </h2>
                </div>
                <button 
                    onClick={onAddUser}
                    className="group relative overflow-hidden rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 px-6 py-3"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="relative flex items-center gap-2 font-bold text-sm">
                        <i className="fas fa-plus"></i> <span>Thêm thành viên</span>
                    </div>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map(user => (
                        <div 
                            key={user.id}
                            onClick={() => onEditUser(user)} 
                            className="group relative bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 opacity-50"></div>
                            
                            {/* Admin Badge */}
                            {user.role === 'Admin' && (
                                <div className="absolute top-4 right-4 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                    <i className="fas fa-crown text-[8px]"></i> Admin
                                </div>
                            )}

                            <div className="relative flex flex-col items-center text-center mt-2">
                                {/* Avatar */}
                                <div 
                                    className="w-20 h-20 rounded-[24px] flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4 ring-4 ring-surface transform group-hover:scale-110 transition-transform duration-300"
                                    style={{ backgroundColor: user.avatarColor }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                
                                {/* Info */}
                                <h3 className="text-lg font-bold text-textMain mb-1">{user.name}</h3>
                                <div className="text-xs text-textMuted font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg mb-4">
                                    @{user.username}
                                </div>

                                {/* Stats/Badges */}
                                <div className="w-full grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-background/50 rounded-xl p-2 border border-white/5">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Quyền hạn</div>
                                        <div className={`text-xs font-bold mt-1 ${user.permission === 'Toàn quyền' ? 'text-success' : 'text-textMain'}`}>
                                            {user.permission}
                                        </div>
                                    </div>
                                    <div className="bg-background/50 rounded-xl p-2 border border-white/5">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Vai trò</div>
                                        <div className="text-xs font-bold mt-1 text-textMain">
                                            {user.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Hint */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Chỉnh sửa</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add New Card Placeholder */}
                    <button 
                        onClick={onAddUser}
                        className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-textMuted/20 hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[280px] group"
                    >
                        <div className="w-16 h-16 rounded-full bg-textMuted/10 flex items-center justify-center text-textMuted group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                            <i className="fas fa-plus text-2xl"></i>
                        </div>
                        <span className="text-sm font-bold text-textMuted group-hover:text-primary">Thêm nhân sự mới</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsersView;