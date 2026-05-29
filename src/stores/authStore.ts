import { create } from 'zustand';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  initialize: () => void;
}

const storedToken = localStorage.getItem('auth_token');

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: storedToken,
  refreshToken: localStorage.getItem('auth_refresh_token'),
  user: storedToken ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null) : null,
  isAuthenticated: () => !!get().token,
  login: async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('auth_refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  },
  register: async (email, password, nickname) => {
    const { data } = await registerApi({ email, password, nickname });
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('auth_refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  },
  logout: async () => {
    const refreshTok = get().refreshToken;
    if (refreshTok) {
      try { await logoutApi({ refreshToken: refreshTok }); } catch { /* ignore */ }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('user');
    set({ token: null, refreshToken: null, user: null });
  },
  initialize: () => {
    const token = localStorage.getItem('auth_token');
    const user = token ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null) : null;
    set({ token, user });
  },
}));
