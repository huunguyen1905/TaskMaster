import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface UserModalProps {
    user?: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    onDelete: (id: string) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        username: '',
        password: '',
        role: 'User',
        permission: 'Chưa phân quyền',
        avatarColor: '#007AFF',
        telegramChatId: ''
    });

    const isEditing = !!user;

    // Reset or Populate form
    useEffect(() => {
        if (user) {
            setFormData({ ...user, password: '' }); // Don't show password
        } else {
            const colors = ['#007AFF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6'];
            setFormData({
                name: '',
                username: '',
                password: '',
                role: 'User',
                permission: 'Chưa phân quyền',
                avatarColor: colors[Math.floor(Math.random() * colors.length)],
                telegramChatId: ''
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!formData.username || !formData.name) {
            alert('Vui lòng nhập tên hiển thị và tên đăng nhập');
            return;
        }
        if (!isEditing && !formData.password) {
            alert('Vui lòng nhập mật khẩu cho người dùng mới');
            return;
        }
        onSave({
            ...formData,
            id: user?.id // Keep ID if editing
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-surface w-[500px] max-w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border relative z-10 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-surface/80 backdrop-blur-md px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 z-20">
                    <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                        {isEditing ? <><i className="fas fa-user-edit text-primary"></i> Sửa Nhân Sự</> : <><i className="fas fa-user-plus text-primary"></i> Thêm Nhân Sự</>}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full text-textMuted hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    {/* Display Name */}
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Tên hiển thị</label>
                        <input 
                            type="text"
                            className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Username & Password */}
                    <div className="grid grid-cols-2 gap-5">
                         <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Tên đăng nhập</label>
                            <input 
                                type="text"
                                disabled={isEditing} // Cannot change username
                                className={`w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none transition-all ${isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                                placeholder="username"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">
                                {isEditing ? 'Đổi mật khẩu (Tuỳ chọn)' : 'Mật khẩu'}
                            </label>
                            <input 
                                type="password"
                                className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder={isEditing ? '••••••' : 'Nhập mật khẩu...'}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Role & Permission */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Vai trò</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none text-xs"></i>
                            </div>
                        </div>
                        <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Quyền hạn</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={formData.permission}
                                    onChange={e => setFormData({...formData, permission: e.target.value as any})}
                                >
                                    <option value="Toàn quyền">Toàn quyền</option>
                                    <option value="Chỉ xem">Chỉ xem</option>
                                    <option value="Chưa phân quyền">Chưa phân quyền</option>
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none text-xs"></i>
                            </div>
                        </div>
                    </div>
                    
                    {/* Telegram Notification Setup */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl">
                        <label className="block text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <i className="fab fa-telegram"></i> Telegram ID (Để nhận thông báo)
                        </label>
                        <input 
                            type="text"
                            className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                            placeholder="Nhập Chat ID (Ví dụ: 123456789)"
                            value={formData.telegramChatId || ''}
                            onChange={e => setFormData({...formData, telegramChatId: e.target.value})}
                        />
                         <div className="mt-2 text-[10px] text-textMuted leading-relaxed">
                            <ol className="list-decimal pl-3 space-y-1">
                                <li>Mở Telegram, chat với bot <b>@userinfobot</b> để lấy ID của bạn.</li>
                                <li>Dán ID vào đây.</li>
                                <li>Chat "Start" với Bot thông báo của hệ thống (Bạn cần tạo Bot riêng qua @BotFather và cập nhật vào Script).</li>
                            </ol>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Màu đại diện</label>
                        <div className="flex gap-3">
                            {['#007AFF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6', '#64D2FF'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setFormData({...formData, avatarColor: color})}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-surface ${formData.avatarColor === color ? 'ring-textMain scale-110' : 'ring-transparent'}`}
                                    style={{ backgroundColor: color }}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-between bg-surface sticky bottom-0 z-20">
                     {isEditing ? (
                        <button 
                            onClick={() => { if(confirm('Xoá người dùng này?')) onDelete(user!.id); }}
                            className="text-danger hover:underline text-sm font-medium"
                        >
                            Xoá người dùng
                        </button>
                     ) : <div></div>}
                     
                     <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-textMain hover:bg-black/5 dark:hover:bg-white/10 rounded-xl font-medium transition-colors"
                        >
                            Huỷ
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primaryHover hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            Lưu
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default UserModal;