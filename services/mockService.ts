import { Task, User, BatchData, AuthResponse } from '../types';

// Changed key to force re-initialization with new schema (v3)
const DB_KEY = 'taskmaster_db_demo_v3'; 
const SESSION_KEY = 'taskmaster_session_v1';

// Rich Seed Data for Users
const INITIAL_USERS: User[] = [
  { id: 'User1', name: 'Alex Quản Trị', role: 'Admin', avatarColor: '#007AFF', username: 'admin', password: '123', permission: 'Toàn quyền' },
  { id: 'User2', name: 'Sarah Thiết Kế', role: 'User', avatarColor: '#FF9F0A', username: 'sarah', password: '123', permission: 'Toàn quyền' },
  { id: 'User3', name: 'Mike Lập Trình', role: 'User', avatarColor: '#30D158', username: 'mike', password: '123', permission: 'Toàn quyền' },
  { id: 'User4', name: 'Emily Tester', role: 'User', avatarColor: '#BF5AF2', username: 'emily', password: '123', permission: 'Chỉ xem' }
];

// Rich Seed Data for Tasks
const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-1001',
    title: 'Thiết kế lại giao diện Dashboard',
    description: 'Cần làm mới giao diện theo phong cách Modern Clean.',
    subtasks: [
        { text: 'Phác thảo Wireframe', done: true },
        { text: 'Chọn bảng màu Pastel', done: true },
        { text: 'Thiết kế Dark Mode', done: false }
    ],
    status: 'Đang làm',
    priority: 'Cao',
    author: 'Sarah Thiết Kế',
    assignees: ['Mike Lập Trình'],
    tags: ['UI/UX', 'Design'],
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1002',
    title: 'Sửa lỗi đăng nhập API',
    description: 'API trả về 500 khi password chứa ký tự đặc biệt.',
    subtasks: [],
    status: 'Cần làm',
    priority: 'Khẩn cấp',
    author: 'Emily Tester',
    assignees: ['Mike Lập Trình'],
    tags: ['Bug', 'Backend'],
    dueDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1003',
    title: 'Tối ưu hóa Database',
    description: 'Query đang chậm, cần index lại.',
    subtasks: [{ text: 'Index lại bảng Users', done: true }],
    status: 'Hoàn thành',
    priority: 'Trung bình',
    author: 'Mike Lập Trình',
    assignees: [],
    tags: ['Database', 'Performance'],
    dueDate: new Date(Date.now() - 86400000).toISOString(), // -1 day
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1004',
    title: 'Viết tài liệu hướng dẫn sử dụng',
    description: 'Cập nhật Wiki cho version 2.0',
    subtasks: [],
    status: 'Chờ duyệt',
    priority: 'Thấp',
    author: 'Alex Quản Trị',
    assignees: ['Sarah Thiết Kế'],
    tags: ['Docs'],
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1005',
    title: 'Họp Review Sprint 24',
    description: 'Chuẩn bị slide báo cáo.',
    subtasks: [],
    status: 'Cần làm',
    priority: 'Trung bình',
    author: 'Alex Quản Trị',
    assignees: [],
    tags: ['Meeting', 'Management'],
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1006',
    title: 'Nâng cấp React v18',
    description: 'Kiểm tra tương thích các thư viện cũ.',
    subtasks: [],
    status: 'Đang làm',
    priority: 'Cao',
    author: 'Mike Lập Trình',
    assignees: [],
    tags: ['Dev', 'Maintenance'],
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1007',
    title: 'Design System cho Mobile App',
    description: 'Export assets cho iOS và Android.',
    subtasks: [],
    status: 'Hoàn thành',
    priority: 'Cao',
    author: 'Sarah Thiết Kế',
    assignees: [],
    tags: ['Design', 'Mobile'],
    dueDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1008',
    title: 'Kiểm thử tính năng Payment',
    description: 'Tập trung vào các case thẻ bị từ chối.',
    subtasks: [
        { text: 'Test cổng Stripe', done: true },
        { text: 'Test cổng Paypal', done: false },
        { text: 'Test Refund', done: false }
    ],
    status: 'Chờ duyệt',
    priority: 'Khẩn cấp',
    author: 'Emily Tester',
    assignees: ['Mike Lập Trình'],
    tags: ['QA', 'Payment'],
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1009',
    title: 'Nghiên cứu thị trường Q3',
    description: '',
    subtasks: [],
    status: 'Cần làm',
    priority: 'Thấp',
    author: 'Alex Quản Trị',
    assignees: [],
    tags: ['Marketing'],
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    blockedBy: [],
    history: []
  },
  {
    id: 'TASK-1010',
    title: 'Setup CI/CD Pipeline',
    description: 'Tự động deploy lên Staging khi merge PR.',
    subtasks: [],
    status: 'Hoàn thành',
    priority: 'Trung bình',
    author: 'Mike Lập Trình',
    assignees: [],
    tags: ['DevOps'],
    dueDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    blockedBy: [],
    history: []
  },
  {
      id: 'TASK-1011',
      title: 'Interview Senior Frontend',
      description: 'Phỏng vấn ứng viên Nguyễn Văn A',
      subtasks: [],
      status: 'Cần làm',
      priority: 'Cao',
      author: 'Alex Quản Trị',
      assignees: ['Mike Lập Trình'],
      tags: ['HR'],
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      blockedBy: [],
      history: []
  }
];

// Helper to get DB
const getDB = (): { tasks: Task[], users: User[] } => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const initial = { tasks: INITIAL_TASKS, users: INITIAL_USERS };
  localStorage.setItem(DB_KEY, JSON.stringify(initial));
  return initial;
};

// Helper to save DB
const saveDB = (data: { tasks: Task[], users: User[] }) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// PERFORMANCE UPGRADE: Reduced delay significantly
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  getBatchData: async (): Promise<BatchData> => {
    await delay(150); // Reduced from 600
    const db = getDB();
    return {
      tasks: db.tasks,
      users: db.users,
      config: []
    };
  },

  login: async (username: string, password: string): Promise<User | null> => {
    await delay(300); // Reduced from 800
    const db = getDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      return user;
    }
    return null;
  },

  register: async (username: string, password: string, name: string): Promise<AuthResponse> => {
    await delay(300); // Reduced from 800
    const db = getDB();
    
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
    }
    
    const newId = `User${Date.now()}`;
    const colors = ['#007AFF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newUser: User = {
      id: newId,
      name,
      username,
      password,
      role: 'User',
      avatarColor: randomColor,
      permission: 'Chưa phân quyền'
    };
    
    db.users.push(newUser);
    saveDB(db);
    return { success: true };
  },

  saveTask: async (task: Task, isNew: boolean): Promise<{ success: boolean; message?: string }> => {
    await delay(100); // Reduced from 400
    const db = getDB();
    
    if (isNew) {
      db.tasks.push(task);
    } else {
      const idx = db.tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        db.tasks[idx] = task;
      } else {
        return { success: false, message: 'Task not found' };
      }
    }
    saveDB(db);
    return { success: true };
  },

  deleteTask: async (taskId: string, username: string): Promise<{ success: boolean }> => {
    await delay(100); // Reduced from 400
    const db = getDB();
    const idx = db.tasks.findIndex(t => t.id === taskId);
    
    if (idx !== -1) {
      const task = db.tasks[idx];
      task.title = ''; // Soft delete indicator
      
      const historyEntry = {
        t: new Date().toLocaleString('vi-VN'),
        a: 'delete' as const,
        u: username,
        c: 'Task',
        d: 'Đã xoá công việc'
      };
      task.history.push(historyEntry);
      
      db.tasks[idx] = task; 
      saveDB(db);
    }
    return { success: true };
  },

  saveUser: async (user: User, isNew: boolean): Promise<{ success: boolean; message?: string }> => {
    await delay(150); // Reduced from 500
    const db = getDB();
    
    const existing = db.users.find(u => 
      u.username.toLowerCase() === user.username.toLowerCase() && u.id !== user.id
    );
    if (existing) return { success: false, message: 'Username exists' };

    if (isNew) {
      db.users.push(user);
    } else {
      const idx = db.users.findIndex(u => u.id === user.id);
      if (idx !== -1) db.users[idx] = user;
    }
    saveDB(db);
    return { success: true };
  },

  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    await delay(100); // Reduced from 300
    const db = getDB();
    db.users = db.users.filter(u => u.id !== userId);
    saveDB(db);
    return { success: true };
  },

  changePassword: async (userId: string, oldPass: string, newPass: string): Promise<{success: boolean; error?: string}> => {
     await delay(150); // Reduced from 500
     const db = getDB();
     const idx = db.users.findIndex(u => u.id === userId);
     
     if (idx !== -1) {
         if (db.users[idx].password !== oldPass) {
             return { success: false, error: 'Mật khẩu cũ không chính xác' };
         }
         db.users[idx].password = newPass;
         saveDB(db);
         return { success: true };
     }
     return { success: false, error: 'User not found' };
  },

  getSession: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
        const session = JSON.parse(sessionStr);
        if (new Date().getTime() > session.expiry) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session.user;
    } catch {
        return null;
    }
  },

  setSession: (user: User) => {
      const expiry = new Date().getTime() + (6 * 60 * 60 * 1000); // 6 hours
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiry }));
  },

  logout: () => {
      localStorage.removeItem(SESSION_KEY);
  }
};