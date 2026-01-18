import React, { useState } from 'react';
import { Task } from '../types';
import { commandParser } from '../services/commandParser';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (tasks: Partial<Task>[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedTasks, setParsedTasks] = useState<Partial<Task>[]>([]);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const results = await commandParser.parseBulkText(inputText);
            setParsedTasks(results);
        } catch (e) {
            setError('Không thể phân tích. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmImport = () => {
        onImport(parsedTasks);
        handleClose();
    };

    const handleClose = () => {
        setInputText('');
        setParsedTasks([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>
            
            <div className="bg-surface w-[800px] max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-border relative z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center shrink-0">
                    <div className="text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <i className="fas fa-layer-group"></i> Nhập Hàng Loạt
                        </h2>
                        <p className="text-white/80 text-sm mt-1">Sử dụng AI để tạo nhiều công việc từ văn bản</p>
                    </div>
                    <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-6">
                    
                    {/* Left: Input */}
                    <div className="flex-1 flex flex-col h-full min-h-[300px]">
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">
                            Dán danh sách công việc (Mỗi dòng 1 việc)
                        </label>
                        <textarea 
                            className="flex-1 w-full bg-background border border-border rounded-xl p-4 text-textMain text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none font-mono leading-relaxed"
                            placeholder="- Làm báo cáo tháng (Mai)&#10;- Fix bug login #Gấp @Mike&#10;- Thiết kế banner marketing"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                        ></textarea>
                        <div className="mt-3 text-right">
                             <button 
                                onClick={handleAnalyze}
                                disabled={isLoading || !inputText.trim()}
                                className="px-5 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primaryHover disabled:opacity-50 transition-all flex items-center gap-2 ml-auto"
                            >
                                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>}
                                Phân tích
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex-1 flex flex-col h-full min-h-[300px] bg-background/50 rounded-xl border border-border overflow-hidden">
                        <div className="p-3 border-b border-border bg-surface flex justify-between items-center">
                            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Xem trước ({parsedTasks.length})</span>
                            {error && <span className="text-xs text-danger font-bold">{error}</span>}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
                            {parsedTasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50">
                                    <i className="fas fa-arrow-left text-2xl mb-2 md:hidden"></i>
                                    <i className="fas fa-arrow-left text-2xl mb-2 hidden md:block"></i>
                                    <p className="text-xs text-center px-4">Nhập văn bản và nhấn Phân tích để xem kết quả tại đây</p>
                                </div>
                            ) : (
                                parsedTasks.map((t, idx) => (
                                    <div key={idx} className="bg-surface border border-border rounded-lg p-3 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                t.priority === 'Khẩn cấp' ? 'bg-danger/10 text-danger' : 
                                                t.priority === 'Cao' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'
                                            }`}>
                                                {t.priority || 'Trung bình'}
                                            </span>
                                            <span className="text-[10px] text-textMuted">
                                                {t.dueDate ? new Date(t.dueDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : ''}
                                            </span>
                                        </div>
                                        <div className="font-semibold text-sm text-textMain mb-1">{t.title}</div>
                                        <div className="flex gap-2 text-[10px] text-textMuted">
                                            {t.assignees?.length ? <span><i className="fas fa-user mr-1"></i>{t.assignees.join(', ')}</span> : null}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={handleClose} 
                        className="px-5 py-2.5 text-textMain hover:bg-black/5 dark:hover:bg-white/10 rounded-xl font-medium transition-colors"
                    >
                        Huỷ bỏ
                    </button>
                    <button 
                        onClick={handleConfirmImport} 
                        disabled={parsedTasks.length === 0}
                        className="px-6 py-2.5 bg-success text-white font-bold rounded-xl shadow-lg shadow-success/30 hover:bg-success/90 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <i className="fas fa-file-import mr-2"></i>
                        Nhập {parsedTasks.length} công việc
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;