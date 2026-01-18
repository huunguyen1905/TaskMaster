import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface TopBarProps {
    currentUser: User | null;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    toggleTheme: () => void;
    isLightMode: boolean;
    onAddTask: () => void;
    onAIInsight: () => void;
    canEdit: boolean;
    onMenuClick: () => void;
    onBulkImport?: () => void;
    isSyncing: boolean; // New Prop
}

const TopBar: React.FC<TopBarProps> = ({ 
    currentUser, searchTerm, onSearchChange, toggleTheme, isLightMode, onAddTask, onAIInsight, canEdit, onMenuClick, onBulkImport, isSyncing
}) => {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when search opens
    useEffect(() => {
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchActive]);

    // Handle clearing search
    const clearSearch = () => {
        onSearchChange('');
        setIsSearchActive(false);
    };

    return (
        <header className="h-[60px] md:h-[70px] px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-surface/80 backdrop-blur-xl sticky top-0 z-30 transition-all shadow-sm relative overflow-hidden">
            
            {/* === MOBILE SEARCH OVERLAY === */}
            <div className={`
                absolute inset-0 bg-surface z-40 flex items-center px-4 gap-3 transition-transform duration-300 ease-out md:hidden
                ${isSearchActive ? 'translate-y-0' : '-translate-y-full'}
            `}>
                <div className="relative flex-1">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"></i>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        className="w-full bg-black/5 dark:bg-white/10 border-none rounded-xl py-2 pl-10 pr-8 text-sm text-textMain focus:ring-2 focus:ring-primary/50 outline-none h-10"
                        placeholder="Tìm kiếm công việc, nhân sự..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-400/20 flex items-center justify-center text-[10px] text-textMuted">
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <button 
                    onClick={clearSearch}
                    className="text-sm font-semibold text-primary whitespace-nowrap active:opacity-70"
                >
                    Huỷ
                </button>
            </div>

            {/* === MAIN HEADER CONTENT === */}
            
            {/* Left: Menu & Brand/Search Trigger */}
            <div className="flex items-center gap-3 md:gap-4 flex-1">
                {/* Mobile Menu Button */}
                <button 
                    onClick={onMenuClick}
                    className="md:hidden w-9 h-9 -ml-1 flex items-center justify-center text-textMain rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all"
                >
                    <i className="fas fa-bars text-lg"></i>
                </button>

                {/* Desktop Search */}
                <div className="relative group flex-1 max-w-[320px] hidden md:block">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors"></i>
                    <input 
                        type="text" 
                        className="bg-surface border border-border py-2.5 pl-11 pr-5 rounded-2xl text-textMain w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Mobile: Search Trigger Icon (Only show if search is inactive) */}
                <button 
                    onClick={() => setIsSearchActive(true)}
                    className={`md:hidden w-9 h-9 flex items-center justify-center text-textMain rounded-full bg-black/5 dark:bg-white/5 active:scale-95 transition-all ${isSearchActive ? 'opacity-0' : 'opacity-100'}`}
                >
                    <i className="fas fa-search"></i>
                </button>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-2 md:gap-4">
                
                {/* SYNC INDICATOR - NEW */}
                <div className={`
                    hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-500
                    ${isSyncing ? 'bg-primary/10 text-primary' : 'bg-transparent text-textMuted opacity-50'}
                `}>
                    {isSyncing ? (
                        <>
                            <i className="fas fa-sync fa-spin"></i>
                            <span>Đang lưu...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-cloud-check text-success"></i>
                            <span className="hidden lg:inline">Đã đồng bộ</span>
                        </>
                    )}
                </div>

                {/* AI Insight Button */}
                <button 
                    onClick={onAIInsight}
                    className="w-9 h-9 md:w-auto md:h-10 md:px-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:shadow-purple-500/50 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                    <i className="fas fa-wand-magic-sparkles text-xs md:text-sm"></i> 
                    <span className="hidden md:inline text-sm font-semibold">AI Insight</span>
                </button>

                {canEdit && (
                    <div className="flex items-center gap-2">
                         {/* Bulk Import (Hidden on Mobile) */}
                         {onBulkImport && (
                            <button 
                                onClick={onBulkImport}
                                className="hidden md:flex h-10 w-10 rounded-full bg-surface border border-border text-textMuted hover:text-primary hover:border-primary hover:shadow-md transition-all items-center justify-center"
                                title="Nhập hàng loạt"
                            >
                                <i className="fas fa-file-import text-xs"></i>
                            </button>
                         )}
                        
                        {/* Add Task Button */}
                        <button 
                            onClick={onAddTask}
                            className="w-9 h-9 md:w-auto md:h-10 md:px-5 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primaryHover hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                            title="Tạo công việc"
                        >
                            <i className="fas fa-plus text-sm"></i> 
                            <span className="hidden md:inline text-sm font-semibold">Tạo mới</span>
                        </button>
                    </div>
                )}

                {/* Divider (Desktop) */}
                <div className="h-6 w-[1px] bg-border mx-1 hidden md:block"></div>

                {/* Theme Toggle (Desktop & Mobile) */}
                <button 
                    onClick={toggleTheme}
                    className="hidden md:flex w-10 h-10 rounded-full bg-surface border border-border text-textMuted hover:text-primary hover:border-primary items-center justify-center transition-all hover:shadow-md active:scale-90"
                    title="Đổi giao diện"
                >
                    <i className={`fas ${isLightMode ? 'fa-moon' : 'fa-sun text-warning'}`}></i>
                </button>
                
                {/* Avatar Profile */}
                <div className="flex items-center gap-3 pl-1 md:pl-2 relative">
                    <div className="text-right hidden lg:block">
                        <div className="text-sm font-bold text-textMain leading-tight">{currentUser?.name || 'Khách'}</div>
                        <div className="text-[10px] text-textMuted font-medium uppercase">{currentUser?.role || 'Guest'}</div>
                    </div>
                    <div 
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white/20 ring-1 ring-black/5 cursor-pointer active:scale-95 transition-transform"
                        style={{ backgroundColor: currentUser?.avatarColor || '#ccc' }}
                        onClick={toggleTheme} // On mobile, clicking avatar toggles theme
                        title="Chạm để đổi giao diện (Mobile)"
                    >
                        {currentUser?.name?.substring(0, 1).toUpperCase()}
                        
                        {/* Sync Status Dot for Mobile (Since the text indicator is hidden on mobile) */}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface rounded-full transition-colors duration-300 ${isSyncing ? 'bg-warning animate-pulse' : 'bg-success'}`}></span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;