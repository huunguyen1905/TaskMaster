import React from 'react';
import { User } from '../types';

interface SidebarProps {
    currentView: string;
    onChangeView: (view: string) => void;
    onLogout: () => void;
    currentUser: User | null;
    onChangePassword: () => void;
    isOpen?: boolean; // New prop for mobile state
    onClose?: () => void; // New prop to close mobile menu
    onBulkImport?: () => void; // Added for mobile access
    canEdit?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, 
    onChangeView, 
    onLogout, 
    currentUser, 
    onChangePassword, 
    isOpen = false, 
    onClose,
    onBulkImport,
    canEdit
}) => {
    const navItems = [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Tổng quan' },
        { id: 'board', icon: 'fa-columns', label: 'Bảng việc' },
        { id: 'list', icon: 'fa-list', label: 'Danh sách' },
        { id: 'calendar', icon: 'fa-calendar-alt', label: 'Lịch trình' },
        { id: 'history', icon: 'fa-history', label: 'Lịch sử' },
    ];

    if (currentUser?.role === 'Admin') {
        navItems.push({ id: 'users', icon: 'fa-users', label: 'Người dùng' });
    }

    return (
        <nav className={`
            w-[280px] md:w-[260px] flex flex-col p-4 border-r border-border h-full flex-shrink-0 transition-all duration-300 bg-surfaceGlass backdrop-blur-2xl 
            fixed md:relative inset-y-0 left-0 z-50 md:z-20
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Logo Area */}
            <div className="flex justify-between items-center mb-8 mt-2 px-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <i className="fas fa-layer-group text-sm"></i>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-textMain">TaskMaster</h1>
                </div>
                {/* Mobile Close Button */}
                <button 
                    onClick={onClose}
                    className="md:hidden w-8 h-8 rounded-full bg-surface border border-border text-textMuted flex items-center justify-center active:scale-95"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-[11px] font-semibold text-textMuted uppercase tracking-wider">Menu Chính</div>
                {navItems.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => onChangeView(item.id)}
                        className={`group flex items-center gap-3 px-3 py-3 md:py-2.5 cursor-pointer rounded-xl transition-all duration-200 text-sm font-medium
                            ${currentView === item.id 
                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                : 'text-textMain hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]'
                            }`}
                    >
                        <i className={`fas ${item.icon} w-5 text-center ${currentView === item.id ? 'text-white' : 'text-textMuted group-hover:text-textMain'}`}></i>
                        {item.label}
                    </div>
                ))}

                {/* Tools Section (Visible mostly on Mobile or if actions needed) */}
                {canEdit && onBulkImport && (
                    <div className="mt-4">
                        <div className="px-3 mb-2 text-[11px] font-semibold text-textMuted uppercase tracking-wider">Công cụ</div>
                        <div 
                            onClick={() => { onBulkImport(); onClose?.(); }}
                            className="group flex items-center gap-3 px-3 py-3 md:py-2.5 cursor-pointer rounded-xl text-textMain hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all text-sm font-medium"
                        >
                            <div className="w-5 text-center text-indigo-500 flex justify-center">
                                <i className="fas fa-file-import"></i>
                            </div>
                            <span className="flex-1">Nhập hàng loạt (AI)</span>
                            <i className="fas fa-magic text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / User Settings */}
            <div className="mt-auto pt-4 border-t border-border flex flex-col gap-1">
                <div 
                     onClick={onChangePassword}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 text-textMain hover:bg-black/5 dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors text-sm font-medium"
                >
                    <i className="fas fa-key w-5 text-center text-textMuted"></i> 
                    Đổi mật khẩu
                </div>
                <div 
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-3 md:py-2 text-danger hover:bg-danger/10 rounded-xl cursor-pointer transition-colors text-sm font-medium"
                >
                    <i className="fas fa-sign-out-alt w-5 text-center"></i> 
                    Đăng xuất
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;