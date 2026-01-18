import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { commandParser } from '../services/commandParser';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSave }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [previewTask, setPreviewTask] = useState<Partial<Task> | null>(null);
    const [error, setError] = useState('');
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            resetState();
        } else {
            stopRecording(false); // Ensure recording stops if closed
        }
    }, [isOpen]);

    const resetState = () => {
        setInput('');
        setPreviewTask(null);
        setError('');
        setIsRecording(false);
        audioChunksRef.current = [];
    };

    // Handle Keyboard interactions
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const startRecording = async () => {
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone error:', err);
            setError('Không thể truy cập microphone. Vui lòng kiểm tra quyền.');
        }
    };

    const stopRecording = async (process = true) => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);

            if (process) {
                // Wait a bit for the last chunk
                setTimeout(async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await handleAudioSubmit(audioBlob);
                }, 200);
            }
        }
    };

    const handleAudioSubmit = async (audioBlob: Blob) => {
        setIsLoading(true);
        try {
            const result = await commandParser.parseAudioCommand(audioBlob);
            setPreviewTask(result);
            setInput(result.title || ''); // Fill title to input for reference
        } catch (err) {
            setError('Không thể nhận dạng giọng nói. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (previewTask) {
            onSave(previewTask);
            onClose();
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const result = await commandParser.parseCommand(input);
            setPreviewTask(result);
        } catch (err) {
            setError('Không thể hiểu câu lệnh này. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className={`w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col transition-all ${isRecording ? 'ring-4 ring-red-500/20' : ''}`}>
                
                {/* Search Bar Area */}
                <form onSubmit={handleSubmit} className="relative flex items-center p-4 gap-4">
                    {/* Icon Status */}
                    <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300
                        ${isRecording 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
                            : isLoading 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-background text-textMuted'
                        }
                    `}>
                        {isRecording ? (
                            <div className="relative flex items-center justify-center">
                                <i className="fas fa-microphone-lines animate-pulse"></i>
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                            </div>
                        ) : isLoading ? (
                            <i className="fas fa-circle-notch fa-spin"></i>
                        ) : (
                            <i className="fas fa-magic"></i>
                        )}
                    </div>
                    
                    <div className="flex-1 relative">
                        {isRecording ? (
                            <div className="h-12 flex items-center text-lg font-medium text-red-500 animate-pulse">
                                Đang ghi âm... (Nhấn vào icon mic để dừng)
                            </div>
                        ) : (
                            <input 
                                ref={inputRef}
                                type="text" 
                                className="w-full bg-transparent border-none outline-none text-xl text-textMain placeholder:text-textMuted/50 font-medium h-12"
                                placeholder="Gõ lệnh hoặc nhấn Mic để nói..."
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (previewTask) setPreviewTask(null);
                                }}
                                autoComplete="off"
                            />
                        )}
                    </div>

                    {/* Mic Button */}
                    <button
                        type="button"
                        onClick={() => isRecording ? stopRecording() : startRecording()}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95
                            ${isRecording 
                                ? 'bg-red-100 text-red-600 border border-red-200' 
                                : 'bg-background hover:bg-black/5 dark:hover:bg-white/10 text-textMuted hover:text-primary border border-border'
                            }
                        `}
                        title={isRecording ? "Dừng ghi âm" : "Bắt đầu nói"}
                    >
                        <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                    </button>
                </form>

                {/* Keyboard Hints */}
                {!isRecording && !isLoading && (
                    <div className="px-4 pb-3 flex justify-end gap-2 text-[10px] font-bold text-textMuted uppercase tracking-wider">
                         {!previewTask ? (
                            <span className="bg-background border border-border px-2 py-1 rounded-md">Enter để xử lý</span>
                        ) : (
                            <span className="bg-primary text-white border border-primary px-2 py-1 rounded-md">Enter để tạo</span>
                        )}
                        <span className="bg-background border border-border px-2 py-1 rounded-md">Esc để thoát</span>
                    </div>
                )}

                {/* Divider */}
                {(previewTask || error) && <div className="h-[1px] bg-border w-full"></div>}

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 text-danger text-sm flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}

                {/* Preview State */}
                {previewTask && (
                    <div className="p-4 bg-background/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="text-xs font-bold text-textMuted uppercase mb-3 px-1">Xem trước công việc</div>
                        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-textMain">{previewTask.title || '(Chưa có tiêu đề)'}</h3>
                                <div className="flex gap-2">
                                    {previewTask.priority && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            previewTask.priority === 'Khẩn cấp' ? 'bg-danger/10 text-danger border-danger/20' :
                                            previewTask.priority === 'Cao' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                            'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                        }`}>
                                            {previewTask.priority}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {previewTask.description && (
                                <p className="text-sm text-textMuted/80 italic border-l-2 border-primary/30 pl-3">
                                    "{previewTask.description}"
                                </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-textMuted pt-2">
                                <div className="flex items-center gap-2">
                                    <i className="far fa-calendar-alt text-primary"></i>
                                    <span>
                                        {previewTask.dueDate 
                                            ? new Date(previewTask.dueDate).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
                                            : 'Chưa có ngày'}
                                    </span>
                                </div>
                                {previewTask.assignees && previewTask.assignees.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <i className="far fa-user text-primary"></i>
                                        <span>{previewTask.assignees.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandPalette;