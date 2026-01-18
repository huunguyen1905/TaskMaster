import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './views/DashboardView';
import BoardView from './views/BoardView';
import ListView from './views/ListView';
import CalendarView from './views/CalendarView'; 
// WorkloadView removed
import UsersView from './views/UsersView';
import HistoryView from './views/HistoryView'; 
import LoginView from './views/LoginView';
import TaskModal from './components/TaskModal';
import UserModal from './components/UserModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import AIInsightModal from './components/AIInsightModal';
import CommandPalette from './components/CommandPalette';
import BulkImportModal from './components/BulkImportModal';
import { sheetService } from './services/sheetService';
import { Task, User } from './types';

const App: React.FC = () => {
    // App State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentView, setCurrentView] = useState('board');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // UI Loading & Sync States
    const [isLoading, setIsLoading] = useState(true); // Initial full-screen load
    const [isSyncing, setIsSyncing] = useState(false); // Background sync indicator
    
    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [isAIModalOpen, setAIModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [isBulkImportOpen, setBulkImportOpen] = useState(false);
    
    // User Management State
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Change Password State
    const [isChangePassModalOpen, setChangePassModalOpen] = useState(false);

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [quickAddStatus, setQuickAddStatus] = useState<string>('');
    const [quickAddDate, setQuickAddDate] = useState<string>('');

    // Filter State (Simplified for SPA)
    const [filterAuthor, setFilterAuthor] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    // Init
    useEffect(() => {
        const init = async () => {
            // Check session
            const sessionUser = sheetService.getSession();
            if (sessionUser) {
                setCurrentUser(sessionUser);
                
                // STRATEGY: Stale-While-Revalidate
                // 1. Show cached data immediately (Fast UX)
                const cachedData = sheetService.getCachedBatchData();
                if (cachedData) {
                    setTasks(cachedData.tasks);
                    setUsers(cachedData.users);
                    setIsLoading(false); // Unlock UI immediately
                }

                // 2. Fetch fresh data in background (Freshness)
                try {
                    // Pass 'true' to indicate background fetch
                    await loadData(!!cachedData); 
                } catch(e) {
                    console.error("Background sync failed", e);
                }
            } else {
                 setIsLoading(false);
            }
        };
        init();
        
        // Load theme
        const savedTheme = localStorage.getItem('taskAppTheme');
        setIsDarkMode(savedTheme === 'dark');
    }, []);

    // Global Keyboard Listener for Command Palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const loadData = async (isBackground = false) => {
        // If it's a background load, show the Sync indicator instead of full loader
        if (isBackground) setIsSyncing(true);
        else setIsLoading(true);

        const data = await sheetService.getBatchData();
        
        // Update state with fresh data
        setTasks(data.tasks);
        setUsers(data.users);

        if (isBackground) setIsSyncing(false);
        else setIsLoading(false);
    };

    const handleLogin = (user: User, remember: boolean) => {
        setCurrentUser(user);
        sheetService.setSession(user, remember); 
        loadData();
    };

    const handleLogout = () => {
        sheetService.logout();
        setCurrentUser(null);
        setTasks([]);
    };

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('taskAppTheme', newMode ? 'dark' : 'light');
    };

    // Filter Logic
    const getFilteredTasks = () => {
        return tasks.filter(t => {
            if (!t.title) return false; // Skip deleted
            
            // Search
            const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filters
            const matchAuthor = filterAuthor === 'all' || t.author === filterAuthor;
            const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
            
            let permission = true;
            return matchSearch && matchAuthor && matchPriority && permission;
        });
    };

    // Task Operations
    const handleTaskClick = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setEditingTask(task);
            setTaskModalOpen(true);
        }
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        const isNew = !taskData.id;
        const newTask: Task = {
            id: taskData.id || `TASK-${Date.now()}`,
            title: taskData.title || 'New Task',
            description: taskData.description || '',
            status: (taskData.status || 'Cần làm') as any,
            priority: (taskData.priority || 'Trung bình') as any,
            author: taskData.author || currentUser?.name || 'Unknown',
            assignees: taskData.assignees || [],
            tags: taskData.tags || [],
            dueDate: taskData.dueDate || new Date().toISOString(),
            blockedBy: taskData.blockedBy || [],
            history: editingTask?.history || [],
            subtasks: taskData.subtasks || []
        };
        
        if (isNew) {
            newTask.history.push({
                t: new Date().toLocaleString(), a: 'add', u: currentUser?.name || '', c: 'Task', d: 'Tạo mới'
            });
            // Optimistic UI: Update immediately
            setTasks([...tasks, newTask]);
        } else {
            newTask.history.push({
                 t: new Date().toLocaleString(), a: 'edit', u: currentUser?.name || '', c: 'Task', d: 'Cập nhật'
            });
            // Optimistic UI: Update immediately
            setTasks(tasks.map(t => t.id === newTask.id ? newTask : t));
        }
        
        setTaskModalOpen(false);
        setEditingTask(null);
        setQuickAddDate(''); 

        // Send to Server Background & Show Sync Indicator
        setIsSyncing(true);
        try {
            await sheetService.saveTask(newTask, isNew);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleBulkImport = async (importedTasks: Partial<Task>[]) => {
        if (importedTasks.length === 0) return;
        
        // Optimistic UI: Show tasks immediately
        const newTasks: Task[] = importedTasks.map((t, index) => ({
            id: `TASK-${Date.now()}-${index}`,
            title: t.title || 'Imported Task',
            description: t.description || '',
            status: (t.status || 'Cần làm') as any,
            priority: (t.priority || 'Trung bình') as any,
            author: currentUser?.name || 'Unknown',
            assignees: t.assignees || [],
            tags: [],
            dueDate: t.dueDate || new Date().toISOString(),
            blockedBy: [],
            history: [{
                t: new Date().toLocaleString(), a: 'add', u: currentUser?.name || '', c: 'Task', d: 'Nhập hàng loạt'
            }],
            subtasks: []
        }));

        setTasks(prev => [...prev, ...newTasks]);
        
        // Background Sync
        setIsSyncing(true);
        try {
            await sheetService.saveBatchTasks(newTasks);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if(!confirm('Bạn có chắc muốn xoá?')) return;
        
        // Optimistic Delete
        setTasks(tasks.filter(t => t.id !== id));
        setTaskModalOpen(false);
        
        // Background Sync
        setIsSyncing(true);
        try {
            await sheetService.deleteTask(id, currentUser?.name || 'User');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDropTask = async (taskId: string, newStatus: string) => {
        const task = tasks.find(t => t.id === taskId);
        if(task && task.status !== newStatus) {
             const updated = { ...task, status: newStatus as any };
             // Optimistic Update
             setTasks(tasks.map(t => t.id === taskId ? updated : t));
             
             // Silent Sync (Drag and drop happens frequently)
             setIsSyncing(true);
             try {
                await sheetService.saveTask(updated, false);
             } finally {
                setIsSyncing(false);
             }
        }
    };

    // User Operations
    const handleSaveUser = async (userData: Partial<User>) => {
        const isNew = !userData.id;
        let finalUser: User;

        if (isNew) {
             finalUser = {
                 id: `User${Date.now()}`,
                 name: userData.name!,
                 username: userData.username!,
                 password: userData.password!,
                 role: userData.role || 'User',
                 permission: userData.permission || 'Chưa phân quyền',
                 avatarColor: userData.avatarColor || '#007AFF',
                 telegramChatId: userData.telegramChatId
             };
             // Optimistic Update
             setUsers([...users, finalUser]);
        } else {
            const existing = users.find(u => u.id === userData.id);
            if (!existing) return;
            finalUser = { ...existing, ...userData } as User;
            // Optimistic Update
            setUsers(users.map(u => u.id === finalUser.id ? finalUser : u));
        }
        
        setUserModalOpen(false);
        setEditingUser(null);
        
        // Background Sync
        setIsSyncing(true);
        try {
            const res = await sheetService.saveUser(finalUser, isNew);
            if (!res.success) {
                alert(res.message);
                loadData(true); // Revert/Refresh on error
            }
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setUsers(users.filter(u => u.id !== id));
        setUserModalOpen(false);
        
        setIsSyncing(true);
        try {
            await sheetService.deleteUser(id);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleQuickAdd = (status: string) => {
        setEditingTask(null);
        setQuickAddStatus(status);
        setQuickAddDate('');
        setTaskModalOpen(true);
    };

    const handleCalendarQuickAdd = (date: string) => {
        setEditingTask({ dueDate: date } as Task); // Pre-fill date
        setQuickAddStatus('Cần làm');
        setQuickAddDate(date);
        setTaskModalOpen(true);
    };

    const canEdit = currentUser?.permission === 'Toàn quyền' || currentUser?.role === 'Admin';

    if (isLoading) {
        return (
            <div className={`w-screen h-screen flex flex-col items-center justify-center text-primary ${isDarkMode ? 'dark bg-background' : 'bg-background'}`}>
                 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                 <div className="text-textMuted font-medium tracking-wide">Đang đồng bộ dữ liệu...</div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className={isDarkMode ? 'dark' : ''}>
                <LoginView onLogin={handleLogin} />
            </div>
        );
    }

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="flex w-screen h-screen bg-background text-textMain overflow-hidden font-sans transition-colors duration-300">
                
                {/* Mobile Sidebar Overlay */}
                <div 
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                <Sidebar 
                    currentView={currentView} 
                    onChangeView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} 
                    onLogout={handleLogout} 
                    currentUser={currentUser}
                    onChangePassword={() => setChangePassModalOpen(true)}
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    onBulkImport={() => setBulkImportOpen(true)}
                    canEdit={canEdit}
                />
                
                <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
                    <TopBar 
                        currentUser={currentUser}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        toggleTheme={toggleTheme}
                        isLightMode={!isDarkMode}
                        onAddTask={() => { setEditingTask(null); setQuickAddStatus(''); setTaskModalOpen(true); }}
                        onAIInsight={() => setAIModalOpen(true)}
                        canEdit={canEdit}
                        onMenuClick={() => setIsMobileMenuOpen(true)} 
                        onBulkImport={() => setBulkImportOpen(true)}
                        isSyncing={isSyncing} // Pass Sync State
                    />

                    {/* View Filters Bar */}
                    <div className="h-[60px] px-4 md:px-8 flex items-center gap-4 border-b border-border flex-shrink-0 z-10 sticky top-[70px] bg-background/80 backdrop-blur-md transition-colors overflow-x-auto no-scrollbar">
                         <div className="flex items-center gap-2 text-textMuted mr-2 whitespace-nowrap">
                             <i className="fas fa-filter"></i>
                             <span className="text-sm font-medium">Bộ lọc</span>
                         </div>
                         <select 
                            className="bg-surface border border-border text-textMain text-sm py-1.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm min-w-[140px]"
                            value={filterAuthor}
                            onChange={(e) => setFilterAuthor(e.target.value)}
                         >
                             <option value="all">Tất cả phụ trách</option>
                             {[...new Set(tasks.map(t => t.author))].map(a => <option key={a} value={a}>{a}</option>)}
                         </select>
                         <select 
                            className="bg-surface border border-border text-textMain text-sm py-1.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm min-w-[140px]"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                         >
                             <option value="all">Tất cả mức độ</option>
                             <option value="Thấp">Thấp</option>
                             <option value="Trung bình">Trung bình</option>
                             <option value="Cao">Cao</option>
                             <option value="Khẩn cấp">Khẩn cấp</option>
                         </select>
                    </div>
                    
                    <main className="flex-1 overflow-hidden relative">
                        {currentView === 'dashboard' && (
                            <DashboardView 
                                tasks={getFilteredTasks()} 
                                isLightMode={!isDarkMode} 
                                currentUser={currentUser} 
                                users={users}
                                onAIInsight={() => setAIModalOpen(true)}
                            />
                        )}
                        {currentView === 'board' && (
                            <BoardView 
                                tasks={tasks} 
                                filteredTasks={getFilteredTasks()} 
                                onTaskClick={handleTaskClick} 
                                onTaskDrop={handleDropTask}
                                onQuickAdd={handleQuickAdd}
                                onDeleteTask={handleDeleteTask}
                                canEdit={canEdit}
                            />
                        )}
                        {currentView === 'list' && <ListView tasks={getFilteredTasks()} onTaskClick={handleTaskClick} />}
                        
                        {currentView === 'calendar' && (
                             <CalendarView 
                                tasks={getFilteredTasks()} 
                                onTaskClick={handleTaskClick}
                                onQuickAdd={handleCalendarQuickAdd}
                                canEdit={canEdit}
                             />
                        )}

                        {currentView === 'users' && (
                            <UsersView 
                                users={users}
                                onAddUser={() => { setEditingUser(null); setUserModalOpen(true); }}
                                onEditUser={(u) => { setEditingUser(u); setUserModalOpen(true); }}
                            />
                        )}
                        
                        {currentView === 'history' && (
                            <HistoryView tasks={tasks} />
                        )}
                    </main>
                </div>

                {/* Modals */}
                <CommandPalette 
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setCommandPaletteOpen(false)}
                    onSave={handleSaveTask}
                />

                <BulkImportModal
                    isOpen={isBulkImportOpen}
                    onClose={() => setBulkImportOpen(false)}
                    onImport={handleBulkImport}
                />

                <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setTaskModalOpen(false)}
                    task={editingTask}
                    tasks={tasks} // Pass all tasks here
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                    users={users}
                    canEdit={canEdit}
                    defaultStatus={quickAddStatus}
                />

                <UserModal 
                    isOpen={isUserModalOpen}
                    onClose={() => setUserModalOpen(false)}
                    user={editingUser}
                    onSave={handleSaveUser}
                    onDelete={handleDeleteUser}
                />

                <ChangePasswordModal 
                    isOpen={isChangePassModalOpen}
                    onClose={() => setChangePassModalOpen(false)}
                    currentUser={currentUser}
                />

                <AIInsightModal 
                    isOpen={isAIModalOpen}
                    onClose={() => setAIModalOpen(false)}
                    tasks={getFilteredTasks()} // Send filtered tasks to AI
                />
            </div>
        </div>
    );
};

export default App;