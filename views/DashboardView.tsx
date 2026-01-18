import React, { useMemo } from 'react';
import { Task, User } from '../types';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface DashboardViewProps {
    tasks: Task[];
    isLightMode: boolean;
    currentUser: User | null;
    users: User[];
    onAIInsight: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, isLightMode, currentUser, users, onAIInsight }) => {
    
    // --- DATA PROCESSING (Keep existing logic) ---
    const stats = useMemo(() => {
        const activeTasks = tasks.filter(t => t.title !== '');
        const total = activeTasks.length;
        const done = activeTasks.filter(t => t.status === 'Hoàn thành').length;
        const waiting = activeTasks.filter(t => t.status === 'Chờ duyệt' || t.status === 'Cần làm').length;
        const now = new Date();
        const overdue = activeTasks.filter(t => {
            if (t.status === 'Hoàn thành' || !t.dueDate) return false;
            return new Date(t.dueDate) < now;
        }).length;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;
        const myTasks = activeTasks.filter(t => t.assignees.includes(currentUser?.name || '') || t.author === currentUser?.name);
        const myPending = myTasks.filter(t => t.status !== 'Hoàn thành').length;

        return { total, done, waiting, overdue, rate, myPending, myTasks };
    }, [tasks, currentUser]);

    const trendData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
        }
        return days.map(date => {
            const dateStr = date.toLocaleDateString('vi-VN');
            const shortDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            let created = 0;
            let completed = 0;
            tasks.forEach(t => {
                if (t.history) {
                    t.history.forEach(h => {
                         const hDate = h.t.split(',')[0].trim() || h.t.split(' ')[0].trim(); 
                         if (hDate === dateStr) {
                             if (h.a === 'add') created++;
                             if (h.a === 'edit' && h.d.toLowerCase().includes('hoàn thành')) completed++;
                         }
                    });
                }
            });
            return { name: shortDate, created, completed };
        });
    }, [tasks]);

    const statusData = useMemo(() => [
        { name: 'Cần làm', value: tasks.filter(t => t.status === 'Cần làm').length, color: '#9CA3AF' },
        { name: 'Đang làm', value: tasks.filter(t => t.status === 'Đang làm').length, color: '#007AFF' },
        { name: 'Chờ duyệt', value: tasks.filter(t => t.status === 'Chờ duyệt').length, color: '#FF9F0A' },
        { name: 'Hoàn thành', value: tasks.filter(t => t.status === 'Hoàn thành').length, color: '#30D158' },
    ], [tasks]);

    const urgentTasks = useMemo(() => {
        return tasks
            .filter(t => t.status !== 'Hoàn thành' && (t.priority === 'Khẩn cấp' || t.priority === 'Cao'))
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 4);
    }, [tasks]);

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

    const getTaskCount = (user: User, date: Date) => {
        const dateStr = date.toISOString().slice(0, 10);
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            if (t.status === 'Hoàn thành') return false; 
            const taskDate = t.dueDate.slice(0, 10);
            return t.author === user.name && taskDate === dateStr;
        }).length;
    };

    const getCellColor = (count: number) => {
        if (count === 0) return 'bg-black/5 dark:bg-white/5 text-transparent'; 
        if (count <= 2) return 'bg-[#30D158] shadow-[0_0_10px_rgba(48,209,88,0.4)] text-white font-bold'; 
        return 'bg-[#FF453A] shadow-[0_0_10px_rgba(255,69,58,0.4)] text-white font-bold'; 
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    }, []);

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface/80 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl text-xs z-50">
                    <p className="font-bold text-textMain mb-1">{label}</p>
                    {payload.map((p: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="text-textMuted capitalize">{p.name === 'created' ? 'Tạo mới' : 'Xong'}:</span>
                            <span className="font-bold text-textMain">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar bg-background text-textMain">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4 md:gap-6">
                <div>
                    <div className="text-xs md:text-sm font-semibold text-textMuted uppercase tracking-widest mb-1">Overview</div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-textMain to-textMuted">
                        {greeting}
                    </h1>
                    <p className="mt-1 md:mt-2 text-sm md:text-lg text-textMuted font-medium">
                        Bạn có <span className="text-primary font-bold">{stats.myPending} công việc</span> cần làm.
                    </p>
                </div>
                
                {/* AI Insight Button (Premium) */}
                <button 
                    onClick={onAIInsight}
                    className="group relative overflow-hidden rounded-2xl md:rounded-[24px] bg-surface border border-white/10 shadow-lg md:shadow-2xl transition-all hover:scale-[1.02] active:scale-95 w-full md:w-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 group-hover:rotate-12 transition-transform duration-300 shrink-0">
                             <i className="fas fa-sparkles text-sm md:text-lg"></i>
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-500">AI Analysis</div>
                            <div className="text-sm md:text-base font-bold text-textMain group-hover:text-violet-500 transition-colors">
                                Báo cáo hiệu suất
                            </div>
                        </div>
                        <i className="fas fa-chevron-right text-textMuted/50 ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </button>
            </div>

            {/* --- BENTO GRID LAYOUT --- */}
            {/* Changed from grid-cols-1 to grid-cols-2 for metrics on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-6 auto-rows-min">
                
                {/* 1. KEY METRICS (Top Row) */}
                {/* On mobile, each metric takes 1 column (half width). On desktop, 3 columns (quarter width) */}
                <div className="col-span-1 md:col-span-3">
                    <MetricCard 
                        title="Việc cần làm" 
                        value={stats.waiting} 
                        trend="+2" 
                        trendUp={false} 
                        icon="fa-layer-group" 
                        color="bg-blue-500"
                    />
                </div>
                <div className="col-span-1 md:col-span-3">
                    <MetricCard 
                        title="Quá hạn" 
                        value={stats.overdue} 
                        trend={stats.overdue > 0 ? "!" : "Good"} 
                        trendUp={stats.overdue === 0}
                        icon="fa-exclamation-circle" 
                        color="bg-red-500"
                        isAlert={stats.overdue > 0}
                    />
                </div>
                <div className="col-span-1 md:col-span-3">
                    <MetricCard 
                        title="Đã xong" 
                        value={stats.done} 
                        trend={`${stats.rate}%`} 
                        trendUp={true}
                        icon="fa-check" 
                        color="bg-green-500"
                    />
                </div>
                <div className="col-span-1 md:col-span-3">
                    <MetricCard 
                        title="Hiệu suất" 
                        value="Ổn" 
                        trend="Normal" 
                        trendUp={true}
                        icon="fa-chart-bar" 
                        color="bg-purple-500"
                    />
                </div>

                {/* 2. MAIN ACTIVITY CHART (Large Block) */}
                <div className="col-span-2 md:col-span-8 bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[300px] md:h-[420px] flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                        <div>
                            <h3 className="text-base md:text-xl font-bold text-textMain">Hoạt động</h3>
                            <p className="text-xs md:text-sm text-textMuted mt-1 hidden md:block">Số lượng công việc tạo mới vs hoàn thành</p>
                        </div>
                        <div className="flex gap-2 md:gap-4">
                            <LegendItem color="bg-[#007AFF]" label="Mới" />
                            <LegendItem color="bg-[#30D158]" label="Xong" />
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full -ml-4 md:-ml-2 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#30D158" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                {/* Hide ticks on mobile to save space, but keep axis */}
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 500}} dy={10} interval="preserveStartEnd" />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} width={30} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                <Area type="monotone" dataKey="created" stroke="#007AFF" strokeWidth={3} fill="url(#gradCreated)" animationDuration={1500} />
                                <Area type="monotone" dataKey="completed" stroke="#30D158" strokeWidth={3} fill="url(#gradCompleted)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                </div>

                {/* 3. URGENT TASKS (Side Block) */}
                <div className="col-span-2 md:col-span-4 bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[300px] md:h-[420px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-base md:text-lg font-bold text-textMain flex items-center gap-2">
                            🔥 Gấp
                        </h3>
                        <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded-lg">
                            {urgentTasks.length}
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
                        {urgentTasks.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-textMuted opacity-50">
                                <i className="fas fa-check-circle text-3xl md:text-4xl mb-3 text-green-500"></i>
                                <p className="text-xs md:text-sm font-medium">Không có việc khẩn cấp</p>
                            </div>
                        ) : (
                            urgentTasks.map(task => (
                                <div key={task.id} className="group p-3 md:p-4 bg-background/50 border border-white/5 hover:bg-background rounded-2xl transition-all cursor-pointer relative overflow-hidden shrink-0">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 transition-all group-hover:w-1.5"></div>
                                    <div className="pl-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[9px] md:text-[10px] font-bold text-red-500 uppercase tracking-wide">
                                                {task.priority}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] text-textMuted font-mono">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : ''}
                                            </span>
                                        </div>
                                        <h4 className="text-xs md:text-sm font-bold text-textMain line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                                            {task.title}
                                        </h4>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-textMain shadow-sm">
                                                {task.author.charAt(0)}
                                            </div>
                                            <span className="text-[10px] md:text-xs text-textMuted truncate">{task.author}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 4. STATUS DONUT CHART (Square Block) */}
                <div className="col-span-2 md:col-span-4 bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[300px] md:h-[350px] flex flex-col justify-center items-center relative">
                    <h3 className="absolute top-4 md:top-6 left-5 md:left-6 text-base md:text-lg font-bold text-textMain">Trạng thái</h3>
                    <div className="w-full h-[180px] md:h-[220px] relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl md:text-3xl font-extrabold text-textMain">{stats.total}</span>
                            <span className="text-[10px] md:text-xs font-medium text-textMuted uppercase tracking-wider">Tổng việc</span>
                        </div>
                    </div>
                    <div className="flex gap-3 md:gap-4 mt-2 justify-center flex-wrap">
                        {statusData.map(s => (
                            <div key={s.name} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{backgroundColor: s.color}}></div>
                                <span className="text-[9px] md:text-[10px] font-bold text-textMuted">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. MY TASKS (Rectangle Block) */}
                <div className="col-span-2 md:col-span-8 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[300px] md:h-[350px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base md:text-lg font-bold text-textMain flex items-center gap-2">
                             <i className="fas fa-check-square text-primary"></i> Việc của tôi
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                         {stats.myTasks.filter(t => t.status !== 'Hoàn thành').length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-textMuted">
                                 <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                                     <i className="fas fa-glass-cheers text-xl md:text-2xl text-green-500"></i>
                                 </div>
                                 <p className="font-medium text-xs md:text-sm">Tuyệt vời! Bạn đã hoàn thành hết việc.</p>
                             </div>
                         ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {stats.myTasks.filter(t => t.status !== 'Hoàn thành').map(task => (
                                     <div key={task.id} className="flex items-center gap-3 p-3 bg-background rounded-2xl border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                                         <div className={`w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-[14px] flex items-center justify-center text-sm md:text-lg ${
                                             task.status === 'Cần làm' ? 'bg-gray-100 text-gray-500 dark:bg-white/10' : 
                                             task.status === 'Đang làm' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                                         }`}>
                                             <i className={`fas ${task.status === 'Đang làm' ? 'fa-spinner fa-spin' : 'fa-circle'}`}></i>
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <div className="text-xs md:text-sm font-bold text-textMain truncate">{task.title}</div>
                                             <div className="flex gap-2 text-[10px] md:text-[11px] text-textMuted mt-0.5">
                                                 <span className="bg-surface border border-border px-1.5 py-0.5 rounded text-[9px] md:text-[10px]">{task.status}</span>
                                                 <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) : 'No Date'}</span>
                                             </div>
                                         </div>
                                         <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-border flex items-center justify-center text-textMuted md:opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all md:hover:scale-110">
                                             <i className="fas fa-arrow-right text-[10px] md:text-xs"></i>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>
                </div>

                {/* 6. WORKLOAD (Full Width) */}
                <div className="col-span-2 md:col-span-12 bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[32px] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <div>
                            <h3 className="text-base md:text-xl font-bold text-textMain">Nhịp độ làm việc</h3>
                            <p className="text-xs md:text-sm text-textMuted mt-1">Phân bổ tải công việc 7 ngày tới</p>
                        </div>
                        {/* Mobile Swipe Hint */}
                        <div className="md:hidden text-textMuted animate-pulse">
                            <i className="fas fa-arrows-left-right text-xs"></i>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto pb-2 scroll-smooth">
                        <div className="min-w-[600px] md:min-w-[800px]">
                            {/* Days Header */}
                            <div className="flex ml-[140px] md:ml-[200px] mb-4">
                                {next7Days.map((date, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1 ${i === 0 ? 'text-primary' : 'text-textMuted'}`}>
                                            {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                        </div>
                                        <div className={`text-xs md:text-sm font-bold ${i === 0 ? 'text-primary' : 'text-textMain'}`}>
                                            {date.getDate()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Users Rows */}
                            <div className="space-y-3">
                                {users.map(user => (
                                    <div key={user.id} className="flex items-center group">
                                        {/* User - Sticky Column on Mobile */}
                                        <div className="w-[140px] md:w-[200px] flex items-center gap-2 md:gap-3 pr-4 sticky left-0 bg-surface/95 backdrop-blur-sm z-10 border-r border-transparent group-hover:border-border/50 transition-colors py-1">
                                            <div 
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold shadow-md ring-2 ring-surface shrink-0"
                                                style={{ backgroundColor: user.avatarColor }}
                                            >
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs md:text-sm font-bold text-textMain truncate">{user.name}</div>
                                                <div className="text-[9px] md:text-[10px] text-textMuted truncate opacity-70">{user.role}</div>
                                            </div>
                                        </div>

                                        {/* Cells */}
                                        <div className="flex-1 flex gap-2">
                                            {next7Days.map((date, i) => {
                                                const count = getTaskCount(user, date);
                                                return (
                                                    <div key={i} className="flex-1 h-10 md:h-12 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg md:rounded-xl flex items-center justify-center relative group/cell">
                                                        <div 
                                                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${getCellColor(count)}`}
                                                        >
                                                            {count > 0 && <span className="text-[10px] md:text-xs">{count}</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Footer decoration */}
            <div className="mt-8 md:mt-10 text-center text-textMuted text-[10px] md:text-xs font-medium opacity-50 pb-4">
                Designed with <i className="fas fa-heart text-red-400 mx-1"></i> for High Performance Teams
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const MetricCard = ({ title, value, trend, trendUp, icon, color, isAlert = false }: any) => (
    <div className={`
        bg-surface/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default h-full
        ${isAlert ? 'ring-2 ring-red-500/20' : ''}
    `}>
        <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-[18px] ${color} text-white flex items-center justify-center text-sm md:text-xl shadow-lg shadow-${color.replace('bg-', '')}/30 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-xs font-bold flex items-center gap-1 ${
                trendUp ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
            }`}>
                <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'}`}></i> {trend}
            </div>
        </div>
        <div>
            <div className="text-xl md:text-3xl font-extrabold text-textMain tracking-tight mb-0.5 md:mb-1">{value}</div>
            <div className="text-[10px] md:text-sm font-semibold text-textMuted">{title}</div>
        </div>
    </div>
);

const LegendItem = ({ color, label }: any) => (
    <div className="flex items-center gap-1.5 md:gap-2">
        <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${color}`}></span>
        <span className="text-[10px] md:text-xs font-bold text-textMuted">{label}</span>
    </div>
);

export default DashboardView;