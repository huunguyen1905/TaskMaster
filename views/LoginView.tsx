import React, { useState } from 'react';
import { User } from '../types';
import { sheetService } from '../services/sheetService';

interface LoginViewProps {
    onLogin: (user: User, remember: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); 
    const [confirmPass, setConfirmPass] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // New State
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await sheetService.login(username, password);
                if (res.success && res.user) {
                    onLogin(res.user, rememberMe); // Pass remember flag
                } else {
                    setError(res.message || 'Thông tin đăng nhập không chính xác');
                }
            } else {
                if(password !== confirmPass) {
                    setError('Mật khẩu không khớp');
                    setIsLoading(false);
                    return;
                }
                const res = await sheetService.register(username, password, name);
                if (res.success) {
                    alert('Đăng ký thành công!');
                    setIsLogin(true);
                } else {
                    setError(res.message || 'Đăng ký thất bại');
                }
            }
        } catch (err) {
            setError('Lỗi hệ thống: ' + String(err));
        }
        setIsLoading(false);
    };

    const handleSetupDB = async () => {
        if(!confirm('Chỉ thực hiện nếu sheet chưa có dữ liệu. Tiếp tục?')) return;
        setIsSettingUp(true);
        const res = await sheetService.setupDatabase();
        setIsSettingUp(false);
        if(res.success) {
            alert(res.message);
        } else {
            alert('Lỗi khởi tạo: ' + res.message);
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-900 font-sans relative overflow-hidden">
            {/* macOS Sonoma Abstract Wallpaper */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1696426615951-4099b2444316?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center opacity-80 z-0 scale-105 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[32px] md:rounded-[40px] w-full max-w-[380px] mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 relative z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                
                {/* Avatar Icon */}
                <div className="relative mb-6 group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 shadow-xl flex items-center justify-center text-4xl text-gray-400 group-hover:scale-105 transition-transform duration-300">
                        <i className="fas fa-user"></i>
                    </div>
                </div>

                <div className="text-center mb-8 w-full">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-md">TaskMaster</h1>
                    <p className="text-sm text-white/60 font-medium tracking-wide uppercase">
                        {isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản mới'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                    {!isLogin && (
                        <div className="relative group">
                            <input 
                                type="text" 
                                required 
                                className="w-full bg-black/20 border border-white/10 rounded-2xl h-12 px-4 text-center text-white placeholder:text-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all font-medium"
                                placeholder="Họ và tên"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>
                    )}
                    
                    <div className="relative group">
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-black/20 border border-white/10 rounded-2xl h-12 px-4 text-center text-white placeholder:text-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all font-medium"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="relative group">
                        <input 
                            type="password" 
                            required 
                            className="w-full bg-black/20 border border-white/10 rounded-2xl h-12 px-4 text-center text-white placeholder:text-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all font-medium tracking-widest"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="relative group">
                            <input 
                                type="password" 
                                required 
                                className="w-full bg-black/20 border border-white/10 rounded-2xl h-12 px-4 text-center text-white placeholder:text-white/40 focus:outline-none focus:bg-black/40 focus:border-white/30 transition-all font-medium tracking-widest"
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    {/* Remember Me Checkbox */}
                    {isLogin && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-white border-white' : 'border-white/40 bg-transparent group-hover:border-white/60'}`}>
                                    {rememberMe && <i className="fas fa-check text-[10px] text-black"></i>}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)} 
                                />
                                <span className="text-xs text-white/70 font-medium group-hover:text-white transition-colors select-none">Duy trì đăng nhập</span>
                            </label>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-300 text-xs font-bold bg-red-500/20 p-3 rounded-xl text-center border border-red-500/30 backdrop-blur-md animate-pulse mt-2">
                            {error}
                        </div>
                    )}

                    <button 
                        disabled={isLoading}
                        className="mt-4 w-full h-12 bg-white text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>
                
                <div className="mt-8 flex flex-col items-center gap-3">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-xs text-white/60 hover:text-white font-medium transition-colors border-b border-transparent hover:border-white/60 pb-0.5"
                    >
                        {isLogin ? 'Chưa có tài khoản?' : 'Quay lại đăng nhập'}
                    </button>

                    <button 
                         onClick={handleSetupDB}
                         disabled={isSettingUp}
                         className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                    >
                        {isSettingUp ? 'Đang thiết lập...' : 'Khởi tạo dữ liệu mẫu'}
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-6 text-white/30 text-[10px] font-bold tracking-widest uppercase">
                Designed for Performance
            </div>
        </div>
    );
};

export default LoginView;