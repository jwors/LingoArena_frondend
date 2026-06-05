// ============================================================
// 认证状态管理（Zustand Store）
// 管理：登录/注册/登出、JWT 令牌持久化、身份验证
// token 和用户信息存储在 localStorage 中以保持会话
// ============================================================
import { create } from 'zustand';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';
import type { User } from '../types';

// ============================================================
// Store 接口定义
// ============================================================
interface AuthState {
  token: string | null;           // JWT 访问令牌
  refresh_token: string | null;   // JWT 刷新令牌（用于自动续期）
  user: User | null;              // 当前登录用户信息

  // Actions
  login: (email: string, password: string) => Promise<void>;          // 登录
  register: (email: string, password: string, nickname: string) => Promise<void>;  // 注册
  logout: () => Promise<void>;                                         // 登出
  isAuthenticated: () => boolean;   // 是否已认证（检查 token 是否存在）
  initialize: () => void;           // 从 localStorage 恢复会话
}

// 页面加载时从 localStorage 读取已保存的 token
const storedToken = localStorage.getItem('auth_token');

// ============================================================
// 创建 Store
// ============================================================
export const useAuthStore = create<AuthState>()((set, get) => ({
  // ---- 初始状态：从 localStorage 恢复 ----
  token: storedToken,
  refresh_token: localStorage.getItem('auth_refresh_token'),
  user: storedToken
    ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null)
    : null,

  // ---- 检查是否已认证（仅检查 token 是否存在）----
  isAuthenticated: () => !!get().token,

  // ---- 登录：调 API → 保存 token + user 到 localStorage 和 store ----
  login: async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.access_token, refresh_token: data.refresh_token, user: data.user });
  },

  // ---- 注册：调 API → 自动登录（保存 token + user）----
  register: async (email, password, nickname) => {
    const { data } = await registerApi({ email, password, nickname });
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.access_token, refresh_token: data.refresh_token, user: data.user });
  },

  // ---- 登出：调 API 使 refresh_token 失效 → 清除本地存储 ----
  logout: async () => {
    const refreshTok = get().refresh_token;
    if (refreshTok) {
      try { await logoutApi({ refresh_token: refreshTok }); } catch { /* 忽略网络错误 */ }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('user');
    set({ token: null, refresh_token: null, user: null });
  },

  // ---- 初始化：从 localStorage 重新读取（适用于页面刷新后恢复）----
  initialize: () => {
    const token = localStorage.getItem('auth_token');
    const user = token
      ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null)
      : null;
    set({ token, user });
  },
}));
