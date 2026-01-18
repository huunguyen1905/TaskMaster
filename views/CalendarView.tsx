import React, { useState, useMemo, useEffect } from 'react';
import { Task } from '../types';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick: (taskId: string) => void;
    onQuickAdd: (date: string) => void; 
    canEdit: boolean;
}

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick, onQuickAdd, canEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // State to control Mobile Agenda visibility
    const [isMobileAgendaOpen, setIsMobileAgendaOpen] = useState(false);

    // Prevent body scroll when mobile sheet is open
    useEffect(() => {
        if (window.innerWidth < 768) {
            if (isMobileAgendaOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileAgendaOpen]);

    // Navigation Logic
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
        if (window.innerWidth < 768) {
            setIsMobileAgendaOpen(true);
        }
    };

    // Calendar Grid Calculation
    const { calendarCells, monthYearString } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOffset = firstDayOfMonth.getDay(); // 0 is Sunday
        
        const cells = [];
        
        // Fill previous month padding
        for (let i = 0; i < startDayOffset; i++) {
            cells.push(null);
        }
        
        // Fill current month days
        for (let i = 1; i <= daysInMonth; i++) {
            cells.push(new Date(year, month, i));
        }

        // Fill remaining slots to maintain 6 rows grid (42 cells total)
        const totalSlots = 42;
        const remaining = totalSlots - cells.length;
        for(let i = 0; i < remaining; i++) {
            cells.push(null); 
        }
        
        const monthStr = new Date(year, month).toLocaleDateString('vi-VN', { month: 'long' });
        const yearStr = year.toString();
        
        return { calendarCells: cells, monthYearString: { month: monthStr, year: yearStr } };
    }, [currentDate]);

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks.forEach(task => {
            if (task.dueDate && task.status !== 'Hoàn thành') { 
                const dateKey = new Date(task.dueDate).toISOString().split('T')[0];
                if (!map[dateKey]) map[dateKey] = [];
                map[dateKey].push(task);
            }
        });
        return map;
    }, [tasks]);

    const isSameDay = (d1: Date, d2: Date) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

    const getDateKey = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().split('T')[0];
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsMobileAgendaOpen(true); 
    };

    // Selected Date Tasks
    const selectedDateTasks = useMemo(() => {
        const key = getDateKey(selectedDate);
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            const tKey = new Date(t.dueDate).toISOString().split('T')[0];
            return tKey === key;
        }).sort((a,b) => {
             const pMap: Record<string, number> = { 'Khẩn cấp': 4, 'Cao': 3, 'Trung bình': 2, 'Thấp': 1 };
             if (a.status === 'Hoàn thành') return 1;
             if (b.status === 'Hoàn thành') return -1;
             return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        });
    }, [selectedDate, tasks]);

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-background relative">
            
            {/* LEFT PANE: CALENDAR GRID */}
            <div className="flex-1 flex flex-col h-full bg-surface/60 backdrop-blur-2xl md:border-r border-white/10 relative z-10">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 shrink-0 sticky top-0 bg-surface/95 backdrop-blur-md z-20 border-b border-border/50 md:border-none">
                    <div className="flex flex-col">
                        <div className="text-[10px] md:text-sm font-bold text-textMuted uppercase tracking-widest mb-0.5">Lịch Trình</div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-textMain capitalize tracking-tight flex items-baseline gap-2">
                            {monthYearString.month}
                            <span className="text-textMuted opacity-50 text-lg md:text-2xl">{monthYearString.year}</span>
                        </h2>
                    </div>

                    <div className="flex items-center bg-background border border-white/10 rounded-xl p-1 shadow-sm">
                        <button onClick={prevMonth} className="w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-textMuted hover:text-textMain transition-all flex items-center justify-center active:scale-95">
                            <i className="fas fa-chevron-left text-xs md:text-sm"></i>
                        </button>
                        <button onClick={goToToday} className="px-3 h-8 md:h-10 text-[10px] md:text-xs font-bold text-textMain hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors uppercase tracking-wide">
                            Hôm nay
                        </button>
                        <button onClick={nextMonth} className="w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-textMuted hover:text-textMain transition-all flex items-center justify-center active:scale-95">
                            <i className="fas fa-chevron-right text-xs md:text-sm"></i>
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 px-2 md:px-4 py-2 shrink-0 bg-surface/50">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-textMuted uppercase tracking-wider opacity-60">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6 px-2 md:px-4 pb-20 md:pb-4 gap-1 overflow-y-auto custom-scrollbar">
                    {calendarCells.map((date, index) => {
                        if (!date) return <div key={`empty-${index}`} className="rounded-xl"></div>;

                        const dateKey = getDateKey(date);
                        const dayTasks = tasksByDate[dateKey] || [];
                        const isToday = isSameDay(date, new Date());
                        const isSelected = isSameDay(date, selectedDate);
                        const hasTasks = dayTasks.length > 0;
                        
                        return (
                            <div 
                                key={dateKey}
                                onClick={() => handleDateClick(date)}
                                onDoubleClick={() => canEdit && onQuickAdd(dateKey)}
                                className={`
                                    relative p-1 md:p-2 rounded-xl md:rounded-2xl transition-all duration-200 cursor-pointer flex flex-col items-center md:items-stretch group/cell
                                    ${isSelected ? 'md:bg-primary/10 md:ring-2 md:ring-primary md:ring-inset md:shadow-soft z-10' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                                    ${isToday && !isSelected ? 'bg-background shadow-inner' : ''}
                                `}
                            >
                                {/* Date Number */}
                                <div className="flex justify-center mb-1">
                                    <span className={`
                                        w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm font-bold transition-all
                                        ${isToday 
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                                            : isSelected 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30' // Desktop only
                                                : 'text-textMain opacity-70 group-hover/cell:opacity-100'}
                                        ${isSelected ? 'md:bg-primary md:text-white bg-transparent text-primary ring-2 ring-primary md:ring-0' : ''} // Mobile highlight
                                    `}>
                                        {date.getDate()}
                                    </span>
                                </div>

                                {/* Task Indicators */}
                                <div className="flex-1 w-full flex flex-col justify-end md:justify-start gap-1 overflow-hidden">
                                    
                                    {/* Desktop Indicators */}
                                    <div className="hidden md:flex flex-col gap-1">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div key={task.id} className={`
                                                h-1.5 w-full rounded-full opacity-80 group-hover/cell:opacity-100 transition-opacity
                                                ${task.priority === 'Khẩn cấp' ? 'bg-danger' : 
                                                  task.priority === 'Cao' ? 'bg-orange-500' : 'bg-primary'}
                                            `}></div>
                                        ))}
                                    </div>

                                    {/* Mobile Indicators */}
                                    {hasTasks && (
                                        <div className="md:hidden flex flex-col items-center gap-0.5 mt-1">
                                             <div className={`w-1.5 h-1.5 rounded-full ${
                                                 dayTasks.some(t => t.priority === 'Khẩn cấp') ? 'bg-danger' : 'bg-primary'
                                             }`}></div>
                                             {dayTasks.length > 1 && <div className="w-1 h-1 rounded-full bg-textMuted/50"></div>}
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* === MOBILE BACKDROP (High Z-Index) === */}
            {isMobileAgendaOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
                    onClick={() => setIsMobileAgendaOpen(false)}
                ></div>
            )}

            {/* === AGENDA PANE (Dual Mode) === */}
            <div className={`
                fixed inset-x-0 bottom-0 z-[100] h-[85vh] 
                bg-surface rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.3)]
                md:relative md:inset-auto md:w-[380px] md:h-auto md:rounded-none md:shadow-none md:z-30
                md:bg-surface/60 md:backdrop-blur-2xl md:border-l md:border-white/10
                flex flex-col overflow-hidden transition-transform duration-300 ease-out will-change-transform
                ${isMobileAgendaOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
            `}>
                
                {/* Mobile Pull Handle & Header */}
                <div 
                    className="md:hidden pt-3 pb-2 px-6 bg-surface shrink-0 cursor-grab active:cursor-grabbing rounded-t-[32px]"
                    onClick={() => setIsMobileAgendaOpen(false)} // Tap top bar to close
                >
                    <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20 mx-auto mb-4"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-textMuted uppercase">Chi tiết công việc</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsMobileAgendaOpen(false); }}
                            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-textMuted active:bg-black/10"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Agenda Content Header */}
                <div className="px-5 md:px-8 pb-3 pt-1 md:py-8 border-b border-border/50 bg-surface/50 sticky top-0 z-10 flex flex-row md:flex-col justify-between items-center md:items-start shrink-0">
                    <div>
                        <div className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-wider mb-0.5 md:mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}
                        </div>
                        <div className="flex items-baseline gap-2 md:gap-3">
                            <h3 className="text-3xl md:text-5xl font-extrabold text-textMain tracking-tighter">
                                {selectedDate.getDate()}
                            </h3>
                            <div className="flex items-baseline md:flex-col gap-1 md:gap-0">
                                <span className="text-lg md:text-sm font-bold text-textMain capitalize leading-none">
                                    Tháng {selectedDate.getMonth() + 1}
                                </span>
                                <span className="text-sm md:text-xs font-semibold text-textMuted leading-none mt-1 hidden md:block">
                                    {selectedDate.getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {selectedDateTasks.length} công việc
                    </div>
                </div>

                {/* Agenda List */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar relative bg-background/50 pb-safe md:pb-0">
                    
                    {selectedDateTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center text-textMuted pt-8 opacity-60">
                            <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                                <i className="fas fa-calendar-plus text-2xl text-textMuted/50"></i>
                            </div>
                            <h4 className="font-bold text-textMain text-sm">Chưa có kế hoạch</h4>
                            <p className="text-xs max-w-[200px] mt-1">Ngày hôm nay đang trống.</p>
                            
                            {canEdit && (
                                <button 
                                    onClick={() => onQuickAdd(getDateKey(selectedDate))}
                                    className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                                >
                                    Thêm mới
                                </button>
                            )}
                        </div>
                    )}

                    <div className="space-y-3 relative z-10 pb-24 md:pb-0">
                        {selectedDateTasks.map((task, index) => (
                            <div 
                                key={task.id} 
                                onClick={() => onTaskClick(task.id)}
                                className="group bg-surface border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm active:scale-[0.98] md:hover:shadow-lg md:hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                    task.priority === 'Khẩn cấp' ? 'bg-danger' : 
                                    task.priority === 'Cao' ? 'bg-orange-500' : 
                                    task.priority === 'Trung bình' ? 'bg-yellow-500' : 'bg-success'
                                }`}></div>

                                <div className="pl-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                            task.status === 'Hoàn thành' ? 'bg-success/10 text-success' : 'bg-black/5 dark:bg-white/5 text-textMuted'
                                        }`}>
                                            {task.status}
                                        </span>
                                        <span className="text-[10px] text-textMuted font-mono">
                                            {new Date(task.dueDate).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    
                                    <h4 className={`text-sm md:text-sm font-bold text-textMain leading-snug mb-2 line-clamp-2 ${task.status === 'Hoàn thành' ? 'line-through opacity-50' : ''}`}>
                                        {task.title}
                                    </h4>

                                    <div className="flex items-center gap-2 border-t border-dashed border-border pt-2 mt-1">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                                            {task.author.charAt(0)}
                                        </div>
                                        <span className="text-[10px] md:text-xs text-textMuted truncate flex-1">{task.author}</span>
                                        <i className="fas fa-chevron-right text-[10px] text-textMuted opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                     {/* FAB for Mobile (Inside Sheet) */}
                     {canEdit && selectedDateTasks.length > 0 && (
                        <button 
                            onClick={() => onQuickAdd(getDateKey(selectedDate))}
                            className="absolute bottom-8 right-6 md:hidden w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-90 transition-transform z-50 animate-in zoom-in duration-300"
                        >
                            <i className="fas fa-plus text-xl"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;