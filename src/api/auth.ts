// ============================================================
// 认证 API
// 登录 / 注册 / 刷新令牌 / 登出
// ============================================================
import apiClient from './client';

// ---- 请求/响应类型定义 ----
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; nickname: string; }
export interface AuthResponse {
  access_token: string;     // JWT 访问令牌
  refresh_token: string;    // JWT 刷新令牌（用于续期）
  user: { id: number; nickname: string; email: string; };
}

// 登录
export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>('/auth/login', data);

// 注册
export const register = (data: RegisterRequest) =>
  apiClient.post<AuthResponse>('/auth/register', data);

// 刷新令牌
export const refreshToken = (data: { refresh_token: string }) =>
  apiClient.post<AuthResponse>('/auth/refresh', data);

// 登出（使 refresh_token 失效）
export const logout = (data: { refresh_token: string }) =>
  apiClient.post('/auth/logout', data);
