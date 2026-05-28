import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,
      login: async (email, password) => {
        const { data } = await loginApi({ email, password });
        localStorage.setItem('token', data.token);
        set({ token: data.token, user: data.user });
      },
      register: async (email, password, nickname) => {
        const { data } = await registerApi({ email, password, nickname });
        localStorage.setItem('token', data.token);
        set({ token: data.token, user: data.user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
