
export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'User';
  avatarColor: string;
  username: string;
  password?: string;
  permission: 'Toàn quyền' | 'Chỉ xem' | 'Chưa phân quyền';
  telegramChatId?: string; // New field for notifications
}

export interface Subtask {
  text: string;
  done: boolean;
}

export interface HistoryEntry {
  t: string; // timestamp
  a: 'add' | 'edit' | 'delete'; // action
  u: string; // user
  c: string; // category
  d: string; // detail
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  status: 'Cần làm' | 'Đang làm' | 'Chờ duyệt' | 'Hoàn thành';
  priority: 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
  author: string;
  assignees: string[];
  tags: string[];
  dueDate: string;
  blockedBy: string[]; // Array of Task IDs that block this task
  history: HistoryEntry[];
}

export interface AppConfig {
  key: string;
  value: string;
}

export interface BatchData {
  tasks: Task[];
  users: User[];
  config: AppConfig[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

// Filters State Interface
export interface FilterState {
  author: string;
  tag: string;
  priority: string;
  dateRange: string;
  dateFrom: string | null;
  dateTo: string | null;
}
