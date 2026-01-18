import React, { useState, useEffect, useRef } from 'react';
import { Task, Subtask, User } from '../types';
import { templateService, TaskTemplate } from '../services/templateService';

interface TaskModalProps {
    task?: Task | null;
    tasks: Task[]; // All tasks for dependency selection
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    onDelete: (id: string) => void;
    users: User[];
    canEdit: boolean;
    defaultStatus?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, tasks, isOpen, onClose, onSave, onDelete, users, canEdit, defaultStatus }) => {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        status: (defaultStatus as Task['status']) || 'Cần làm',
        priority: 'Trung bình',
        author: '',
        assignees: [],
        tags: [],
        dueDate: new Date().toISOString().slice(0, 10),
        description: '',
        subtasks: [],
        blockedBy: []
    });
    
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [showDependencyDropdown, setShowDependencyDropdown] = useState(false);
    
    // Template State
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initial Load & Reset
    useEffect(() => {
        if (isOpen) {
            setTemplates(templateService.getTemplates());
        }

        if (task) {
            setFormData({ 
                ...task, 
                dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
                blockedBy: task.blockedBy || []
            });
            // Use direct property instead of JSON.parse
            setSubtasks(task.subtasks || []);
        } else {
            setFormData({
                title: '',
                status: (defaultStatus as Task['status']) || 'Cần làm',
                priority: 'Trung bình',
                author: users[0]?.name || '',
                assignees: [],
                tags: [],
                dueDate: new Date().toISOString().slice(0, 10),
                description: '',
                subtasks: [],
                blockedBy: []
            });
            setSubtasks([]);
        }
        setSelectedTemplate('');
    }, [task, isOpen, defaultStatus, users]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDependencyDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...formData,
            id: task?.id,
            subtasks: subtasks // Pass subtasks array directly
        });
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tId = e.target.value;
        setSelectedTemplate(tId);
        const temp = templates.find(t => t.id === tId);
        if (temp) {
            if(confirm('Áp dụng mẫu sẽ ghi đè nội dung hiện tại. Tiếp tục?')) {
                setFormData(prev => ({
                    ...prev,
                    title: temp.data.title || prev.title,
                    description: temp.data.description || prev.description,
                    priority: temp.data.priority || prev.priority,
                    tags: temp.data.tags || prev.tags,
                    assignees: temp.data.assignees || prev.assignees
                }));
                if (temp.data.subtasks) {
                    setSubtasks(temp.data.subtasks);
                }
            }
        }
    };

    const handleSaveTemplate = () => {
        const name = prompt('Nhập tên mẫu công việc:');
        if (name) {
            const updated = templateService.saveTemplate(name, { ...formData, subtasks });
            setTemplates(updated);
            alert('Đã lưu mẫu thành công!');
        }
    };

    const addSubtask = () => setSubtasks([...subtasks, { text: '', done: false }]);
    const removeSubtask = (idx: number) => setSubtasks(subtasks.filter((_, i) => i !== idx));
    const updateSubtask = (idx: number, field: keyof Subtask, val: any) => {
        const newSubs = [...subtasks];
        // @ts-ignore
        newSubs[idx][field] = val;
        setSubtasks(newSubs);
    };

    const toggleBlocker = (blockerId: string) => {
        const currentBlockedBy = formData.blockedBy || [];
        if (currentBlockedBy.includes(blockerId)) {
            setFormData({ ...formData, blockedBy: currentBlockedBy.filter(id => id !== blockerId) });
        } else {
            setFormData({ ...formData, blockedBy: [...currentBlockedBy, blockerId] });
        }
    };

    // Filter available tasks: exclude self
    const availableDependencies = tasks.filter(t => t.id !== task?.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content - Full screen on mobile, Centered card on desktop */}
            <div className="bg-surface w-full h-full md:h-auto md:w-[650px] md:max-h-[90vh] md:rounded-2xl shadow-2xl overflow-y-auto border border-border relative z-10 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 flex flex-col">
                
                {/* Header */}
                <div className="sticky top-0 bg-surface/80 backdrop-blur-md z-20 px-4 md:px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                        {task ? <><i className="fas fa-edit text-primary"></i> Chi Tiết</> : <><i className="fas fa-plus-circle text-primary"></i> Việc Mới</>}
                    </h2>
                    <div className="flex items-center gap-2">
                        {task && canEdit && (
                            <button onClick={() => onDelete(task.id)} className="w-8 h-8 rounded-full text-danger hover:bg-danger/10 flex items-center justify-center transition-colors" title="Xoá">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        )}
                        <button onClick={onClose} className="w-8 h-8 rounded-full text-textMuted hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 flex-1 overflow-y-auto">
                    
                    {/* Template Selector (Only show if templates exist or adding new) */}
                    {!task && templates.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                            <i className="fas fa-magic text-primary"></i>
                            <select 
                                className="bg-transparent text-sm font-medium text-textMain outline-none w-full cursor-pointer"
                                value={selectedTemplate}
                                onChange={handleTemplateChange}
                            >
                                <option value="">-- Chọn mẫu công việc để điền nhanh --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider">Tiêu đề công việc</label>
                            {/* Save Template Button */}
                            {canEdit && (
                                <button onClick={handleSaveTemplate} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1">
                                    <i className="fas fa-save"></i> Lưu làm mẫu
                                </button>
                            )}
                        </div>
                        <textarea 
                            disabled={!canEdit}
                            className="w-full bg-background border border-border rounded-xl p-3 text-textMain focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-base font-medium"
                            rows={2}
                            placeholder="Nhập tên công việc..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Trạng thái</label>
                            <div className="relative">
                                <select 
                                    disabled={!canEdit}
                                    className="w-full appearance-none bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                >
                                    <option>Cần làm</option>
                                    <option>Đang làm</option>
                                    <option>Chờ duyệt</option>
                                    <option>Hoàn thành</option>
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none text-xs"></i>
                            </div>
                        </div>
                        <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Mức độ ưu tiên</label>
                            <div className="relative">
                                <select 
                                    disabled={!canEdit}
                                    className="w-full appearance-none bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                                    value={formData.priority}
                                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                                >
                                    <option>Thấp</option>
                                    <option>Trung bình</option>
                                    <option>Cao</option>
                                    <option>Khẩn cấp</option>
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none text-xs"></i>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Người phụ trách</label>
                            <div className="relative">
                                <select 
                                    disabled={!canEdit}
                                    className="w-full appearance-none bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                                    value={formData.author}
                                    onChange={e => setFormData({...formData, author: e.target.value})}
                                >
                                    {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none text-xs"></i>
                            </div>
                        </div>
                         <div>
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Hạn chót</label>
                            <input 
                                type="date"
                                disabled={!canEdit}
                                className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
                                value={formData.dueDate}
                                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Tags</label>
                        <input 
                            type="text"
                            disabled={!canEdit}
                            className="w-full bg-background border border-border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-textMuted/50 text-sm md:text-base"
                            placeholder="Frontend, API, (ngăn cách bằng dấu phẩy)..."
                            value={formData.tags?.join(', ')}
                            onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim())})}
                        />
                    </div>

                    {/* Dependencies (Blockers) */}
                    <div ref={dropdownRef}>
                         <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Công việc chặn (Blockers)</label>
                         <div className="relative">
                            <button 
                                type="button"
                                disabled={!canEdit}
                                onClick={() => setShowDependencyDropdown(!showDependencyDropdown)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-left flex justify-between items-center outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-surface text-sm md:text-base"
                            >
                                <span className={formData.blockedBy?.length ? 'text-textMain font-medium' : 'text-textMuted'}>
                                    {formData.blockedBy?.length 
                                        ? `Đang bị chặn bởi ${formData.blockedBy.length} công việc` 
                                        : 'Không có công việc chặn'}
                                </span>
                                <i className={`fas fa-chevron-down text-xs text-textMuted transition-transform ${showDependencyDropdown ? 'rotate-180' : ''}`}></i>
                            </button>
                            
                            {showDependencyDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                                    {availableDependencies.length === 0 && <div className="p-3 text-sm text-textMuted text-center italic">Không có công việc nào khác</div>}
                                    {availableDependencies.map(t => (
                                        <div 
                                            key={t.id} 
                                            onClick={() => toggleBlocker(t.id)}
                                            className="flex items-center gap-3 p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.blockedBy?.includes(t.id) ? 'bg-primary border-primary text-white' : 'border-gray-400'}`}>
                                                {formData.blockedBy?.includes(t.id) && <i className="fas fa-check text-[10px]"></i>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-textMain truncate group-hover:text-primary transition-colors">{t.title || 'Không tiêu đề'}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${t.status === 'Hoàn thành' ? 'bg-success/10 text-success' : 'bg-gray-200 dark:bg-gray-700 text-textMuted'}`}>{t.status}</span>
                                                    <span className="text-[10px] text-textMuted">{t.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                         </div>
                    </div>

                    {/* Description Text */}
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Mô tả chi tiết</label>
                        <textarea 
                            disabled={!canEdit}
                            className="w-full bg-background border border-border rounded-xl p-3 text-textMain focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                            rows={3}
                            placeholder="Mô tả nội dung công việc..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Checklists */}
                    <div className="pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-textMuted text-xs font-bold uppercase tracking-wider">Checklist</label>
                            {canEdit && (
                                <button onClick={addSubtask} className="text-primary text-xs font-bold hover:underline">
                                    <i className="fas fa-plus mr-1"></i> Thêm mục
                                </button>
                            )}
                        </div>
                        <div className="bg-background rounded-xl border border-border p-1 max-h-48 overflow-y-auto">
                            {subtasks.length === 0 && <div className="p-4 text-center text-textMuted text-sm italic">Chưa có công việc con nào</div>}
                            {subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-surface rounded-lg transition-colors group">
                                    <input 
                                        type="checkbox" 
                                        checked={sub.done} 
                                        disabled={!canEdit}
                                        onChange={e => updateSubtask(idx, 'done', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                    />
                                    <input 
                                        type="text" 
                                        value={sub.text}
                                        disabled={!canEdit}
                                        onChange={e => updateSubtask(idx, 'text', e.target.value)}
                                        className={`flex-1 bg-transparent border-none text-textMain text-sm outline-none ${sub.done ? 'line-through text-textMuted' : ''}`}
                                        placeholder="Nhập nội dung..."
                                    />
                                    {canEdit && (
                                        <button onClick={() => removeSubtask(idx)} className="text-textMuted hover:text-danger md:opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 md:px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface md:rounded-b-2xl shrink-0 safe-area-bottom">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-textMain hover:bg-black/5 dark:hover:bg-white/10 rounded-xl font-medium transition-colors"
                    >
                        Huỷ bỏ
                    </button>
                    {canEdit && (
                        <button 
                            onClick={handleSave} 
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primaryHover hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskModal;