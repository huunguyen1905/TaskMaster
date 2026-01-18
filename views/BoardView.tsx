import React from 'react';
import { Task, Subtask } from '../types';

interface BoardViewProps {
    tasks: Task[]; // All tasks for checking blockers
    filteredTasks: Task[]; // Tasks to display (filtered)
    onTaskClick: (taskId: string) => void;
    onTaskDrop: (taskId: string, newStatus: string) => void;
    onQuickAdd: (status: string) => void;
    onDeleteTask: (id: string) => void; // New prop for quick action
    canEdit: boolean;
}

const COLUMNS = ["Cần làm", "Đang làm", "Chờ duyệt", "Hoàn thành"];

const BoardView: React.FC<BoardViewProps> = ({ 
    tasks, filteredTasks, onTaskClick, onTaskDrop, onQuickAdd, onDeleteTask, canEdit 
}) => {
    
    const isTaskBlocked = (task: Task) => {
        if (!task.blockedBy || task.blockedBy.length === 0) return false;
        const blockers = tasks.filter(t => task.blockedBy.includes(t.id));
        return blockers.some(b => b.status !== 'Hoàn thành');
    };

    const handleDragStart = (e: React.DragEvent, taskId: string, isBlocked: boolean) => {
        if (!canEdit || isBlocked) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData("text/plain", taskId);
        e.dataTransfer.effectAllowed = "move";
        const target = e.target as HTMLElement;
        target.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        if (!canEdit) return;
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) {
            onTaskDrop(taskId, status);
        }
        e.currentTarget.classList.remove('bg-primary/5'); // Remove highlight
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (canEdit) {
            e.preventDefault();
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if(canEdit) e.currentTarget.classList.add('bg-primary/5');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if(canEdit) e.currentTarget.classList.remove('bg-primary/5');
    };

    return (
        <div className="flex flex-1 overflow-x-auto p-4 md:p-8 gap-4 md:gap-6 h-full items-start bg-background snap-x snap-mandatory">
            {COLUMNS.map(col => {
                const colTasks = filteredTasks.filter(t => t.status === col);
                return (
                    <div 
                        key={col} 
                        className="min-w-[85vw] md:min-w-[320px] w-[85vw] md:w-[320px] flex flex-col h-full snap-center md:snap-start transition-colors rounded-2xl"
                        onDrop={(e) => handleDrop(e, col)}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    >
                        {/* Column Header */}
                        <div className="flex justify-between items-center mb-4 px-2 py-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                    col === 'Cần làm' ? 'bg-gray-400' :
                                    col === 'Đang làm' ? 'bg-primary' :
                                    col === 'Chờ duyệt' ? 'bg-warning' : 'bg-success'
                                }`}></span>
                                <span className="text-textMain font-bold text-sm uppercase tracking-wide">{col}</span>
                                <span className="bg-surface border border-border px-2 py-0.5 rounded-md text-[10px] font-bold text-textMuted shadow-sm ml-1">
                                    {colTasks.length}
                                </span>
                            </div>
                            {canEdit && (
                                <button 
                                    onClick={() => onQuickAdd(col)}
                                    className="w-7 h-7 rounded-lg text-textMuted hover:bg-surface hover:text-primary hover:shadow-sm border border-transparent hover:border-border transition-all flex items-center justify-center"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                </button>
                            )}
                        </div>
                        
                        {/* Tasks Area */}
                        <div className="flex-1 overflow-y-auto px-1 pb-10 flex flex-col gap-3 custom-scrollbar">
                            {colTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    isBlocked={isTaskBlocked(task)}
                                    onClick={() => onTaskClick(task.id)}
                                    onDelete={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                    onDragStart={(e) => handleDragStart(e, task.id, isTaskBlocked(task))}
                                    onDragEnd={handleDragEnd}
                                    canEdit={canEdit}
                                />
                            ))}
                            {/* Empty State / Drop Target Hint */}
                            {colTasks.length === 0 && (
                                <div className="h-full rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-textMuted/40 text-xs font-medium bg-surface/20 min-h-[150px]">
                                    <i className="fas fa-inbox text-2xl mb-2"></i>
                                    Thả công việc vào đây
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface TaskCardProps { 
    task: Task; 
    isBlocked: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onDragStart: (e: React.DragEvent) => void; 
    onDragEnd: (e: React.DragEvent) => void;
    canEdit: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isBlocked, onClick, onDelete, onDragStart, onDragEnd, canEdit }) => {
    
    const getPriorityColor = (p: string) => {
        if (p === 'Khẩn cấp') return 'bg-danger shadow-[0_0_8px_rgba(255,69,58,0.4)]';
        if (p === 'Cao') return 'bg-orange-500';
        if (p === 'Trung bình') return 'bg-yellow-500';
        return 'bg-success'; 
    };

    let subtasks: Subtask[] = task.subtasks || [];
    const doneCount = subtasks.filter(s => s.done).length;
    const progress = subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0;
    const hasSubtasks = subtasks.length > 0;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Hoàn thành';

    return (
        <div 
            className={`
                group relative bg-surface border border-border rounded-xl p-4 shadow-sm 
                transition-all duration-200 
                ${isBlocked 
                    ? 'opacity-70 grayscale border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 cursor-grab active:cursor-grabbing'
                }
            `}
            draggable={canEdit && !isBlocked}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onClick}
        >
            {/* Priority Indicator Strip */}
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${getPriorityColor(task.priority)}`}></div>

            {/* Quick Actions (Hover Only) */}
            {canEdit && !isBlocked && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 md:opacity-0 opacity-100">
                    <button 
                        onClick={onDelete}
                        className="w-6 h-6 rounded-md bg-white dark:bg-gray-800 text-textMuted hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm border border-border flex items-center justify-center transition-colors"
                        title="Xoá nhanh"
                    >
                        <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>
                    <button 
                        className="w-6 h-6 rounded-md bg-white dark:bg-gray-800 text-textMuted hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm border border-border flex items-center justify-center transition-colors"
                        title="Sửa nhanh"
                    >
                        <i className="fas fa-pen text-[10px]"></i>
                    </button>
                </div>
            )}

            {/* Content Wrapper */}
            <div className="pl-3">
                {/* Header: ID & Blocked Status */}
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono text-textMuted opacity-70">{task.id}</span>
                    {isBlocked && (
                        <span className="text-[10px] font-bold text-danger flex items-center gap-1 bg-danger/5 px-1.5 py-0.5 rounded">
                            <i className="fas fa-lock"></i> Blocked
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-textMain mb-2 leading-snug line-clamp-2" title={task.title}>
                    {task.title}
                </h3>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-textMuted border border-black/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Progress Bar (Visual Efficiency) */}
                {hasSubtasks && (
                    <div className="mb-3">
                        <div className="flex justify-between text-[9px] text-textMuted mb-1 font-medium">
                            <span>Tiến độ</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-success' : 'bg-primary'}`} 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Footer: Date & Assignee */}
                <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${isOverdue ? 'text-danger bg-danger/5' : 'text-textMuted'}`}>
                        <i className="far fa-calendar-alt"></i>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--'}
                    </div>

                    <div className="flex items-center gap-1">
                         <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-surface" title={task.author}>
                            {task.author.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardView;