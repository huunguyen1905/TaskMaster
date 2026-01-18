import React, { useState, useEffect } from 'react';
import { sheetService } from '../services/sheetService'; // CHANGED
import { User } from '../types';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen || !currentUser) return null;

    const handleSubmit = async () => {
        setError('');
        
        if (!oldPass || !newPass || !confirmPass) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        if (newPass !== confirmPass) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPass.length < 3) {
            setError('Mật khẩu mới phải có ít nhất 3 ký tự');
            return;
        }

        setIsLoading(true);
        const result = await sheetService.changePassword(currentUser.id, oldPass, newPass); // CHANGED
        setIsLoading(false);

        if (result.success) {
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            sheetService.logout(); // CHANGED
            window.location.reload(); // Reload to force logout view
        } else {
            setError(result.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="bg-surface w-[400px] max-w-full rounded-2xl shadow-2xl border border-border relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-surface/80 backdrop-blur-md px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                        <i className="fas fa-key text-primary"></i> Đổi Mật Khẩu
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full text-textMuted hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4">
                    
                    {/* Old Password */}
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <input 
                                type={showOld ? "text" : "password"}
                                className="w-full bg-background border border-border rounded-xl p-3 pr-10 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập mật khẩu cũ..."
                                value={oldPass}
                                onChange={e => setOldPass(e.target.value)}
                            />
                            <button 
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors"
                            >
                                <i className={`fas ${showOld ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Mật khẩu mới</label>
                        <div className="relative">
                            <input 
                                type={showNew ? "text" : "password"}
                                className="w-full bg-background border border-border rounded-xl p-3 pr-10 text-textMain outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập mật khẩu mới..."
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                            />
                            <button 
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors"
                            >
                                <i className={`fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-textMuted text-xs font-bold uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                        <input 
                            type="password"
                            className={`w-full bg-background border rounded-xl p-3 text-textMain outline-none focus:ring-2 focus:ring-primary/20 transition-all ${newPass && confirmPass && newPass !== confirmPass ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                            placeholder="Nhập lại mật khẩu mới..."
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-danger/10 text-danger text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-textMain hover:bg-black/5 dark:hover:bg-white/10 rounded-xl font-medium transition-colors"
                    >
                        Huỷ
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primaryHover hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                    >
                        {isLoading && <i className="fas fa-circle-notch fa-spin"></i>}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;