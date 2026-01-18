import React, { useState, useMemo } from 'react';
import { Task } from '../types';

interface ListViewProps {
    tasks: Task[];
    onTaskClick: (id: string) => void;
}

type SortKey = 'title' | 'status' | 'priority' | 'dueDate' | 'author';
type SortDirection = 'asc' | 'desc';

interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
    width: string; // CSS Grid value
}

const ListView: React.FC<ListViewProps> = ({ tasks, onTaskClick }) => {
    // --- STATE ---
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'dueDate', direction: 'asc' });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    
    // Default Column Configuration
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { key: 'title', label: 'Công việc', visible: true, width: 'minmax(250px, 3fr)' },
        { key: 'status', label: 'Trạng thái', visible: true, width: '130px' },
        { key: 'priority', label: 'Mức độ', visible: true, width: '110px' },
        { key: 'dueDate', label: 'Hạn chót', visible: true, width: '130px' },
        { key: 'author', label: 'Phụ trách', visible: true, width: '150px' }
    ]);

    const perPage = 15; // Increased per page for better density

    // --- LOGIC ---

    // 1. Toggle Column Visibility
    const toggleColumn = (key: string) => {
        setColumns(cols => cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
    };

    // 2. Handle Sorting
    const handleSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // 3. Process Data (Filter -> Sort -> Paginate)
    const processedTasks = useMemo(() => {
        let result = filterStatus === 'all' 
            ? tasks 
            : tasks.filter(t => t.status === filterStatus);
        
        // Sorting Logic
        result = [...result].sort((a, b) => {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;
            
            switch (sortConfig.key) {
                case 'title':
                    return a.title.localeCompare(b.title) * dir;
                case 'status':
                    return a.status.localeCompare(b.status) * dir;
                case 'priority': {
                    const pMap: Record<string, number> = { 'Khẩn cấp': 4, 'Cao': 3, 'Trung bình': 2, 'Thấp': 1 };
                    return ((pMap[a.priority] || 0) - (pMap[b.priority] || 0)) * dir;
                }
                case 'dueDate': {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
                }
                case 'author':
                    return a.author.localeCompare(b.author) * dir;
                default:
                    return 0;
            }
        });

        return result;
    }, [tasks, filterStatus, sortConfig]);

    const totalPages = Math.ceil(processedTasks.length / perPage);
    const paginated = processedTasks.slice((page - 1) * perPage, page * perPage);

    // --- STYLES & HELPERS ---

    const getStatusStyle = (s: string) => {
        if (s === 'Hoàn thành') return 'bg-success/10 text-success ring-1 ring-success/20';
        if (s === 'Đang làm') return 'bg-info/10 text-info ring-1 ring-info/20';
        if (s === 'Chờ duyệt') return 'bg-warning/10 text-warning ring-1 ring-warning/20';
        return 'bg-gray-100 dark:bg-white/10 text-textMuted ring-1 ring-black/5 dark:ring-white/10';
    };

    const getPriorityColor = (p: string) => {
        if (p === 'Khẩn cấp') return 'bg-danger';
        if (p === 'Cao') return 'bg-orange-500';
        if (p === 'Trung bình') return 'bg-yellow-500';
        return 'bg-success'; 
    };

    // Generate Grid Template Columns String
    const gridTemplate = useMemo(() => {
        // Filter visible columns, join widths, add action column (40px) at the end
        const visibleCols = columns.filter(c => c.visible);
        return `${visibleCols.map(c => c.width).join(' ')} 40px`;
    }, [columns]);

    const tabs = ['all', 'Cần làm', 'Đang làm', 'Chờ duyệt', 'Hoàn thành'];

    return (
        <div className="p-4 md:p-8 h-full flex flex-col max-w-[1600px] mx-auto overflow-hidden">
            
            {/* --- HEADER CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-extrabold text-textMain tracking-tight mb-2">
                        Danh sách công việc
                    </h2>
                    {/* Apple-style Segmented Control */}
                    <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-1 rounded-xl flex overflow-x-auto max-w-full no-scrollbar shadow-inner-light">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setFilterStatus(tab); setPage(1); }}
                                className={`px-3 md:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                                    filterStatus === tab 
                                    ? 'bg-white dark:bg-white/10 text-textMain shadow-sm scale-[1.02]' 
                                    : 'text-textMuted hover:text-textMain hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            >
                                {tab === 'all' ? 'Tất cả' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Options (Desktop Only) */}
                <div className="relative hidden md:block z-20">
                    <button 
                        onClick={() => setShowColumnMenu(!showColumnMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-textMain hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm"
                    >
                        <i className="fas fa-columns text-textMuted"></i> Tuỳ chỉnh cột
                    </button>

                    {showColumnMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-[10px] font-bold text-textMuted uppercase px-2 py-1 mb-1">Hiển thị cột</div>
                            {columns.map(col => (
                                <button
                                    key={col.key}
                                    onClick={() => toggleColumn(col.key)}
                                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-sm text-textMain"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${col.visible ? 'bg-primary border-primary text-white' : 'border-textMuted'}`}>
                                        {col.visible && <i className="fas fa-check text-[10px]"></i>}
                                    </div>
                                    {col.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN TABLE CARD --- */}
            <div className="flex-1 bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-soft overflow-hidden flex flex-col relative">
                
                {/* 1. TABLE HEADER (Desktop) */}
                <div 
                    className="hidden md:grid border-b border-border p-4 bg-black/[0.02] dark:bg-white/[0.02] items-center gap-4 sticky top-0 backdrop-blur-md z-10 transition-all duration-300"
                    style={{ gridTemplateColumns: gridTemplate }}
                >
                    {columns.filter(c => c.visible).map(col => (
                        <div 
                            key={col.key}
                            onClick={() => handleSort(col.key as SortKey)}
                            className="text-[11px] font-bold text-textMuted uppercase tracking-wider cursor-pointer hover:text-primary transition-colors flex items-center gap-2 select-none group"
                        >
                            {col.label}
                            <span className={`transition-opacity ${sortConfig.key === col.key ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-50'}`}>
                                <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                            </span>
                        </div>
                    ))}
                    <div className="w-10"></div> {/* Action Column Spacer */}
                </div>

                {/* 2. TABLE BODY */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-0">
                    {paginated.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-textMuted opacity-60">
                             <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                                <i className="fas fa-search text-2xl"></i>
                             </div>
                             <p className="font-medium">Không tìm thấy công việc nào</p>
                         </div>
                    ) : (
                        <div className="space-y-2 md:space-y-0">
                            {paginated.map((task) => (
                                <React.Fragment key={task.id}>
                                    
                                    {/* === MOBILE: COMPACT CARD === */}
                                    <div 
                                        onClick={() => onTaskClick(task.id)}
                                        className="md:hidden bg-surface border border-border rounded-xl p-3 shadow-sm active:scale-[0.98] transition-all flex items-start gap-3 relative overflow-hidden"
                                    >
                                        {/* Left Priority Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(task.priority)}`}></div>
                                        
                                        <div className="flex-1 min-w-0 pl-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-textMain text-sm truncate pr-2">{task.title}</h3>
                                                {task.dueDate && (
                                                    <span className={`text-[10px] whitespace-nowrap ${new Date(task.dueDate) < new Date() ? 'text-danger font-bold' : 'text-textMuted'}`}>
                                                        {new Date(task.dueDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusStyle(task.status)}`}>
                                                    {task.status}
                                                </span>
                                                <span className="text-[10px] text-textMuted border-l border-border pl-2">
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Avatar (Small) */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                            {task.author.charAt(0)}
                                        </div>
                                    </div>

                                    {/* === DESKTOP: GRID ROW === */}
                                    <div 
                                        onClick={() => onTaskClick(task.id)}
                                        className="hidden md:grid px-4 py-3 items-center gap-4 border-b border-border/40 hover:bg-primary/5 cursor-pointer transition-colors group text-sm"
                                        style={{ gridTemplateColumns: gridTemplate }}
                                    >
                                        {/* Title Column */}
                                        {columns.find(c => c.key === 'title')?.visible && (
                                            <div className="font-medium text-textMain truncate pr-4 relative">
                                                {task.title}
                                                {task.tags?.length > 0 && (
                                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-black/5 dark:bg-white/5 text-textMuted border border-black/5">
                                                        {task.tags[0]}
                                                        {task.tags.length > 1 && ` +${task.tags.length - 1}`}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Status Column */}
                                        {columns.find(c => c.key === 'status')?.visible && (
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${getStatusStyle(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        )}

                                        {/* Priority Column */}
                                        {columns.find(c => c.key === 'priority')?.visible && (
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                                                <span className="text-textMain">{task.priority}</span>
                                            </div>
                                        )}

                                        {/* Due Date Column */}
                                        {columns.find(c => c.key === 'dueDate')?.visible && (
                                            <div className={`font-mono text-xs ${task.dueDate && new Date(task.dueDate) < new Date() ? 'text-danger font-bold' : 'text-textMuted'}`}>
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '-'}
                                            </div>
                                        )}

                                        {/* Author Column */}
                                        {columns.find(c => c.key === 'author')?.visible && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-[9px] font-bold text-white">
                                                    {task.author.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="truncate text-textMain max-w-[120px]">{task.author}</span>
                                            </div>
                                        )}

                                        {/* Arrow Action */}
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <i className="fas fa-chevron-right text-textMuted text-xs"></i>
                                        </div>
                                    </div>

                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-black/[0.01] dark:bg-white/[0.01] shrink-0">
                        <span className="text-[10px] text-textMuted font-medium uppercase tracking-wider hidden md:block">
                            Hiển thị {paginated.length} / {processedTasks.length} kết quả
                        </span>
                        <div className="flex items-center gap-2 mx-auto md:mx-0">
                            <button 
                                disabled={page===1} 
                                onClick={() => setPage(p => p-1)} 
                                className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-textMain hover:bg-black/5 disabled:opacity-30 transition-all shadow-sm"
                            >
                                <i className="fas fa-chevron-left text-xs"></i>
                            </button>
                            <span className="text-xs font-bold text-textMain px-2 md:hidden">
                                {page} / {totalPages}
                            </span>
                            <button 
                                disabled={page===totalPages} 
                                onClick={() => setPage(p => p+1)} 
                                className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-textMain hover:bg-black/5 disabled:opacity-30 transition-all shadow-sm"
                            >
                                <i className="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListView;