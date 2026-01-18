import { Task, User, BatchData, AuthResponse } from '../types';

// URL Google Apps Script của bạn
const API_URL: string = 'https://script.google.com/macros/s/AKfycbx232wFWiYatVgOKRwQCCgEZ13t8dUlls_76z4VKnMIlpSNm6T-ZdOYLa5t6ELZmjjKZw/exec';

const SESSION_KEY = 'taskmaster_session_v1';
const DATA_CACHE_KEY = 'taskmaster_data_cache_v1';

// Hàm gọi API cải tiến với debug log
const callScript = async (action: string, data: any = {}) => {
    if (API_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE' || !API_URL) {
        console.warn("Chưa cấu hình API URL!");
        return { success: false, message: 'Chưa cấu hình API URL trong code.' }; 
    }

    try {
        console.log(`[API Request] Action: ${action}`);
        
        // Anti-cache param for GET-like behavior simulation
        const timestamp = new Date().getTime();
        const url = `${API_URL}?action=${action}&_t=${timestamp}`;

        // Sử dụng POST với text/plain để tránh preflight CORS của Google
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data)
        });

        // Đọc text trước để check lỗi HTML
        const text = await response.text();
        
        try {
            const json = JSON.parse(text);
            return json;
        } catch (e) {
            console.error('[API Error] Non-JSON response:', text);
            // Nếu phản hồi bắt đầu bằng "<!DOCTYPE html>", khả năng cao là lỗi quyền truy cập
            if (text.trim().startsWith('<')) {
                return { 
                    success: false, 
                    message: 'Lỗi quyền truy cập! Hãy đảm bảo bạn đã chọn "Who has access: Anyone" khi Deploy App Script.' 
                };
            }
            return { success: false, message: 'Invalid server response' };
        }
    } catch (e) {
        console.error('[API Network Error]', e);
        return { success: false, message: 'Lỗi kết nối mạng hoặc chặn CORS.' };
    }
};

export const sheetService = {
  // Setup Database
  setupDatabase: async (): Promise<{ success: boolean; message: string }> => {
     return await callScript('setup');
  },

  // PERFORMANCE: Get cached data first
  getCachedBatchData: (): BatchData | null => {
      const cached = localStorage.getItem(DATA_CACHE_KEY);
      if (cached) {
          try {
              return JSON.parse(cached);
          } catch (e) {
              return null;
          }
      }
      return null;
  },

  getBatchData: async (): Promise<BatchData> => {
    const res = await callScript('getBatchData');
    if (res.success) {
        const batchData: BatchData = {
            tasks: res.tasks || [],
            users: res.users || [],
            config: []
        };
        // Save to cache
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(batchData));
        return batchData;
    }
    // Trả về mảng rỗng nhưng kèm log để debug
    console.warn('GetBatchData failed:', res.message);
    return { tasks: [], users: [], config: [] };
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    // Gọi API để lấy danh sách user về kiểm tra
    const res = await callScript('getBatchData'); 
    
    if (!res.success) {
        return { success: false, message: res.message || 'Không thể kết nối đến dữ liệu.' };
    }

    if (res.users && Array.isArray(res.users)) {
        // FIX: Ép kiểu String() cho cả username và password để tránh lỗi
        // Sheet lưu password '123' là number, input là string => so sánh sai nếu không ép kiểu
        const user = res.users.find((u: User) => 
            String(u.username).toLowerCase().trim() === username.toLowerCase().trim() && 
            String(u.password).trim() === password.trim()
        );
        
        if (user) {
            console.log('Login successful for:', user.username);
            return { success: true, user };
        } else {
            console.warn('Login failed. User not found or wrong pass.');
            // Debug: In ra danh sách user (ẩn pass) để check xem dữ liệu có về không
            console.log('Available users:', res.users.map((u:User) => u.username));
        }
    }
    
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' };
  },

  register: async (username: string, password: string, name: string): Promise<AuthResponse> => {
    return await callScript('register', { username, password, name });
  },

  saveTask: async (task: Task, isNew: boolean): Promise<{ success: boolean; message?: string }> => {
    return await callScript('saveTask', { task, isNew });
  },

  saveBatchTasks: async (tasks: Task[]): Promise<{ success: boolean; message?: string }> => {
      // Since the mock backend script might not have a 'saveBatch' endpoint,
      // we can simulate it using Promise.all to call saveTask multiple times.
      // If you update the Google Script to support batch saving, update this to call 'saveBatchTasks'.
      try {
          // Sequential execution might be safer for sheet locks, but parallel is faster for UI.
          // Let's try parallel first.
          const promises = tasks.map(t => sheetService.saveTask(t, true));
          await Promise.all(promises);
          return { success: true };
      } catch (e) {
          return { success: false, message: String(e) };
      }
  },

  deleteTask: async (taskId: string, username: string): Promise<{ success: boolean }> => {
    return await callScript('deleteTask', { taskId, username });
  },

  saveUser: async (user: User, isNew: boolean): Promise<{ success: boolean; message?: string }> => {
    return await callScript('saveUser', { user, isNew });
  },

  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    return await callScript('deleteUser', { id });
  },

  changePassword: async (id: string, oldPass: string, newPass: string): Promise<{success: boolean; error?: string}> => {
     return await callScript('changePassword', { id, oldPass, newPass });
  },

  // Session Management
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

  setSession: (user: User, remember: boolean = false) => {
      // If remember is true, set expiry to 30 days, else 24 hours
      const duration = remember ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
      const expiry = new Date().getTime() + duration; 
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiry }));
  },

  logout: () => {
      localStorage.removeItem(SESSION_KEY);
  }
};