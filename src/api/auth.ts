import apiClient from './client';
import type { User } from '../types';

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; nickname: string; }
export interface AuthResponse { token: string; user: User; }

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/auth/login', data);
export const register = (data: RegisterRequest) =>
  apiClient.post<AuthResponse>('/auth/register', data);
