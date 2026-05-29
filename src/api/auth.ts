import apiClient from './client';

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; nickname: string; }
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; nickname: string };
}

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/auth/login', data);
export const register = (data: RegisterRequest) =>
  apiClient.post<AuthResponse>('/auth/register', data);
export const refreshToken = (data: { refreshToken: string }) =>
  apiClient.post<AuthResponse>('/auth/refresh', data);
export const logout = (data: { refreshToken: string }) =>
  apiClient.post('/auth/logout', data);
