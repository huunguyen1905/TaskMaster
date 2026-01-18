import React, { useMemo } from 'react';
import { Task, User } from '../types';

interface WorkloadViewProps {
    tasks: Task[];
    users: User[];
}

const WorkloadView: React.FC<WorkloadViewProps> = ({ tasks, users }) => {
    
    // 1. Calculate next 7 days
    const next7Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    // 2. Helper to get task count for a user on a specific date
    const getTaskCount = (user: User, date: Date) => {
        const dateStr = date.toISOString().slice(0, 10);
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            // Exclude completed tasks to show actual active load
            if (t.status === 'Hoàn thành') return false; 
            
            // Match Date
            const taskDate = t.dueDate.slice(0, 10);
            
            // Match User (Using 'author' as the assignee based on app logic)
            const isAssigned = t.author === user.name;
            
            return isAssigned && taskDate === dateStr;
        }).length;
    };

    // 3. Helper for Cell Color
    const getCellColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-white/5 text-textMuted'; // Empty
        if (count <= 2) return 'bg-success/20 text-success border border-success/30 font-bold'; // Normal
        return 'bg-danger/20 text-danger border border-danger/30 font-bold'; // Overload (> 3)
    };

    return (
        <div className="p-8 h-full flex flex-col max-w-[1400px] mx-auto overflow-hidden">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-textMain tracking-tight">Quản lý tải nhân sự</h2>
                    <p className="text-textMuted text-sm mt-1">Heatmap khối lượng công việc trong 7 ngày tới</p>
                </div>
                
                {/* Legend */}
                <div className="flex gap-4 text-xs font-medium bg-surface border border-border px-4 py-2 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-textMuted">Trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-success/20 border border-success/30"></div>
                        <span className="text-textMain">Ổn định (1-2)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-danger/20 border border-danger/30"></div>
                        <span className="text-textMain">Quá tải ({'>'}3)</span>
                    </div>
                </div>
            </div>

            {/* Heatmap Container */}
            <div className="bg-surface border border-border rounded-2xl shadow-soft overflow-hidden flex-1 flex flex-col">
                
                {/* Header Row (Dates) */}
                <div className="grid grid-cols-[200px_repeat(7,1fr)] bg-background/50 border-b border-border">
                    <div className="p-4 flex items-center justify-center font-bold text-textMuted text-xs uppercase tracking-wider border-r border-border">
                        Nhân sự
                    </div>
                    {next7Days.map((date, i) => (
                        <div key={i} className={`p-3 flex flex-col items-center justify-center border-r border-border last:border-r-0 ${i === 0 ? 'bg-primary/5' : ''}`}>
                            <span className="text-[10px] text-textMuted font-bold uppercase mb-0.5">
                                {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                            </span>
                            <span className={`text-sm font-bold ${i === 0 ? 'text-primary' : 'text-textMain'}`}>
                                {date.getDate()}/{date.getMonth() + 1}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Body Rows (Users) */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {users.map(user => (
                        <div key={user.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-border/50 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                            
                            {/* User Info Column */}
                            <div className="p-4 flex items-center gap-3 border-r border-border bg-surface sticky left-0 z-10">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                    style={{ backgroundColor: user.avatarColor }}
                                >
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-textMain truncate">{user.name}</span>
                                    <span className="text-[10px] text-textMuted truncate">{user.role}</span>
                                </div>
                            </div>

                            {/* Matrix Cells */}
                            {next7Days.map((date, i) => {
                                const count = getTaskCount(user, date);
                                return (
                                    <div key={i} className="p-2 border-r border-border/50 last:border-r-0 flex items-center justify-center">
                                        <div 
                                            className={`
                                                w-full h-full rounded-lg flex items-center justify-center transition-all duration-300
                                                ${getCellColor(count)}
                                                ${count > 0 ? 'shadow-sm scale-95 group-hover:scale-100' : ''}
                                            `}
                                        >
                                            {count > 0 ? (
                                                <span className="text-lg">
                                                    {count}
                                                </span>
                                            ) : (
                                                <span className="text-xs opacity-20">-</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkloadView;