import React, { useMemo, useState } from 'react';
import { Task, HistoryEntry } from '../types';

interface HistoryViewProps {
    tasks: Task[];
}

interface EnrichedHistory extends HistoryEntry {
    taskTitle: string;
    taskId: string;
    rawDate: Date;
    avatarColor: string; // Fake avatar color generation based on name
}

const HistoryView: React.FC<HistoryViewProps> = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'add' | 'edit' | 'delete'>('all');

    // 1. Data Processing & Enrichment
    const historyList = useMemo(() => {
        let list: EnrichedHistory[] = [];
        const colors = ['#007AFF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6'];

        tasks.forEach(task => {
            if (task.history && task.history.length > 0) {
                task.history.forEach(h => {
                    // Try to parse date
                    let d = new Date();
                    try {
                        const datePart = h.t.includes(',') ? h.t.split(',')[1] : h.t.split(' ')[1];
                        const timePart = h.t.includes(',') ? h.t.split(',')[0] : h.t.split(' ')[0];
                        
                        if (datePart && timePart) {
                            const [day, month, year] = datePart.trim().split('/').map(Number);
                            const [hour, minute, second] = timePart.trim().split(':').map(Number);
                            if (year && month && day) {
                                d = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
                            }
                        }
                    } catch (e) {
                         // Fallback to current if parse fail
                    }

                    const colorIdx = h.u.length % colors.length;

                    list.push({
                        ...h,
                        taskTitle: task.title || 'Công việc đã xoá',
                        taskId: task.id,
                        rawDate: d,
                        avatarColor: colors[colorIdx]
                    });
                });
            }
        });

        // Sort descending
        return list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    }, [tasks]);

    // 2. Filtering
    const filteredList = useMemo(() => {
        return historyList.filter(item => {
            const matchesSearch = 
                item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.u.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.d.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = filterType === 'all' || item.a === filterType;

            return matchesSearch && matchesType;
        });
    }, [historyList, searchTerm, filterType]);

    // 3. Smart Grouping
    const groupedHistory = useMemo(() => {
        const groups: Record<string, EnrichedHistory[]> = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        filteredList.forEach(item => {
            let key = item.rawDate.toLocaleDateString('vi-VN');
            
            if (item.rawDate.toDateString() === today.toDateString()) {
                key = 'Hôm nay';
            } else if (item.rawDate.toDateString() === yesterday.toDateString()) {
                key = 'Hôm qua';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        
        return groups;
    }, [filteredList]);

    const getActionDetails = (item: EnrichedHistory) => {
        const text = item.d.toLowerCase();
        
        if (item.a === 'add') return { icon: 'fa-plus', bg: 'bg-blue-500', text: 'text-blue-500', bgSoft: 'bg-blue-500/10', label: 'Tạo mới' };
        if (item.a === 'delete') return { icon: 'fa-trash-alt', bg: 'bg-red-500', text: 'text-red-500', bgSoft: 'bg-red-500/10', label: 'Đã xoá' };
        
        if (text.includes('hoàn thành') || text.includes('completed')) 
            return { icon: 'fa-check', bg: 'bg-green-500', text: 'text-green-500', bgSoft: 'bg-green-500/10', label: 'Hoàn thành' };
        if (text.includes('status') || text.includes('trạng thái')) 
            return { icon: 'fa-exchange-alt', bg: 'bg-orange-500', text: 'text-orange-500', bgSoft: 'bg-orange-500/10', label: 'Trạng thái' };
            
        return { icon: 'fa-pen', bg: 'bg-gray-500', text: 'text-gray-500', bgSoft: 'bg-gray-500/10', label: 'Cập nhật' };
    };

    return (
        <div className="h-full flex flex-col w-full bg-background overflow-hidden relative">
            
            {/* Header Area - Compact on Mobile */}
            <div className="p-4 md:p-8 shrink-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0">
                <div className="max-w-[800px] mx-auto w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 md:mb-6">
                         <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-textMain tracking-tight">
                                Nhật ký
                            </h2>
                            <p className="text-xs text-textMuted font-medium">Theo dõi mọi thay đổi trong dự án</p>
                        </div>
                        
                        {/* Search Pill */}
                        <div className="relative group w-full md:w-72">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors text-xs"></i>
                            <input 
                                type="text" 
                                className="w-full bg-surface border border-border pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Chips - Scrollable */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                        {[
                            { id: 'all', label: 'Tất cả' },
                            { id: 'add', label: 'Tạo mới' },
                            { id: 'edit', label: 'Cập nhật' },
                            { id: 'delete', label: 'Đã xoá' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterType(tab.id as any)}
                                className={`
                                    px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border flex-shrink-0
                                    ${filterType === tab.id 
                                        ? 'bg-textMain text-surface border-textMain shadow-md' 
                                        : 'bg-surface text-textMuted border-border hover:bg-black/5 dark:hover:bg-white/5'}
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline Content - Full Width */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 w-full relative">
                <div className="max-w-[800px] mx-auto w-full">
                    
                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-textMuted opacity-50">
                            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 shadow-sm">
                                <i className="fas fa-history text-2xl"></i>
                            </div>
                            <p className="font-medium text-sm">Không có hoạt động nào khớp với bộ lọc</p>
                        </div>
                    ) : (
                        <div className="relative pt-4">
                            {/* Vertical Line - Continuous */}
                            <div className="absolute left-[23px] md:left-[27px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-border via-border to-transparent"></div>

                            {Object.entries(groupedHistory).map(([dateLabel, items]) => (
                                <div key={dateLabel} className="mb-8 relative z-10">
                                    
                                    {/* Sticky Date Header */}
                                    <div className="sticky top-0 z-10 py-2 bg-background/95 backdrop-blur-md mb-2 pl-14 pr-4 md:pl-16 border-b border-transparent">
                                        <span className="text-xs font-bold text-textMuted uppercase tracking-wider bg-surface/50 px-2 py-1 rounded-md border border-border/50">
                                            {dateLabel}
                                        </span>
                                    </div>

                                    <div className="space-y-4 md:space-y-6">
                                        {(items as EnrichedHistory[]).map((item, idx) => {
                                            const style = getActionDetails(item);
                                            return (
                                                <div key={idx} className="relative pl-14 pr-4 md:pl-16 md:pr-8 animate-in slide-in-from-bottom-2 duration-500">
                                                    
                                                    {/* Timeline Node (Mobile & Desktop) */}
                                                    <div className="absolute left-[14px] md:left-[18px] top-4 w-5 h-5 md:w-5 md:h-5 rounded-full bg-background border-2 border-border z-10 flex items-center justify-center">
                                                        <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${style.bg}`}></div>
                                                    </div>

                                                    {/* Content Card */}
                                                    <div className="bg-surface/60 backdrop-blur-sm border border-border/60 rounded-2xl p-3 md:p-4 shadow-sm active:scale-[0.99] transition-all hover:bg-surface hover:shadow-md hover:border-border/80">
                                                        
                                                        {/* Header: User & Time */}
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <div 
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-surface"
                                                                    style={{ backgroundColor: item.avatarColor }}
                                                                >
                                                                    {item.u.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-textMain text-sm leading-none">{item.u}</div>
                                                                    <div className="text-[10px] text-textMuted mt-1 font-medium flex items-center gap-1.5">
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${style.bg}`}></span>
                                                                        {style.label}
                                                                        <span className="text-border mx-0.5">|</span>
                                                                        <span className="font-mono">{item.rawDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Body: Task Info & Action */}
                                                        <div className="pl-[42px]">
                                                            <div className="text-sm text-textMain leading-snug mb-2">
                                                                {item.d}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-border/50">
                                                                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${style.bgSoft} ${style.text}`}>
                                                                    <i className={`fas ${style.icon}`}></i>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-xs font-semibold text-textMain truncate">{item.taskTitle}</div>
                                                                    <div className="text-[9px] text-textMuted font-mono opacity-70 truncate">{item.taskId}</div>
                                                                </div>
                                                                <i className="fas fa-chevron-right text-[10px] text-textMuted/50"></i>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryView;