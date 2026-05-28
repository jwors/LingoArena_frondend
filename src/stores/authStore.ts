import { create } from 'zustand';
import { login as loginApi, register as registerApi } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  initialize: () => void;
}

const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: storedToken,
  user: storedToken ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null) : null,
  isAuthenticated: () => !!get().token,
  login: async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  register: async (email, password, nickname) => {
    const { data } = await registerApi({ email, password, nickname });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  initialize: () => {
    const token = localStorage.getItem('token');
    const user = token ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null) : null;
    set({ token, user });
  },
}));
