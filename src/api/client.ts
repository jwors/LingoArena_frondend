// ============================================================
// Axios HTTP 客户端
// 功能：自动附加 JWT token、401 自动刷新令牌、
//       令牌刷新期间并发请求排队等待、刷新失败触发登出
// ============================================================
import axios from 'axios';

// 刷新令牌 API 的响应格式
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: { id: number; nickname: string };
}

// API 基础地址（由环境变量 VITE_API_BASE_URL 配置）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',  // 无环境变量时走 Vite proxy
  headers: { 'Content-Type': 'application/json' },
});

// ---- 令牌刷新状态 ----
let isRefreshing = false;                         // 是否正在刷新令牌（防止并发刷新）
const refreshSubscribers: Array<(token: string) => void> = [];  // 等待刷新的请求队列

// 订阅刷新：将等待的请求加入队列
const subscribeRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// 刷新完成：用新 token 恢复所有等待的请求
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers.length = 0;  // 清空队列
};

// ============================================================
// 请求拦截器：自动附加 Authorization header
// ============================================================
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================================
// 响应拦截器：处理 401 令牌过期 → 自动刷新
// ============================================================
apiClient.interceptors.response.use(
  (response) => response,  // 正常响应直接返回
  async (error) => {
    const originalRequest = error.config;
    // 判断是否为认证错误（401 或 TOKEN_EXPIRED）
    const isAuthError = error.response?.status === 401
      || error.response?.data?.code === 'TOKEN_EXPIRED';

    if (isAuthError && !originalRequest._retry) {
      originalRequest._retry = true;  // 标记已重试，防止循环

      if (isRefreshing) {
        // ---- 已有刷新在进行中：将当前请求加入等待队列 ----
        return new Promise((resolve) => {
          subscribeRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // ---- 开始刷新令牌 ----
      isRefreshing = true;
      const refreshTok = localStorage.getItem('auth_refresh_token');

      if (!refreshTok) {
        // 无 refresh_token → 清除登录状态，触发登出
        isRefreshing = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }

      try {
        // 调用刷新令牌 API
        const { data } = await axios.post<AuthResponse>(
          `${API_BASE_URL}/api/auth/refresh`,
          { refresh_token: refreshTok }
        );
        // 保存新令牌
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_refresh_token', data.refresh_token);
        // 用新令牌重试原始请求
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        onRefreshed(data.access_token);  // 恢复等待队列中的所有请求
        return apiClient(originalRequest);
      } catch {
        // 刷新失败 → 清除登录状态
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
