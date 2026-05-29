import axios from 'axios';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; nickname: string };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
const refreshSubscribers: Array<(token: string) => void> = [];

const subscribeRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers.length = 0;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
      isRefreshing = true;
      const refreshTok = localStorage.getItem('auth_refresh_token');
      if (!refreshTok) {
        isRefreshing = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post<AuthResponse>(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken: refreshTok }
        );
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_refresh_token', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        onRefreshed(data.accessToken);
        return apiClient(originalRequest);
      } catch {
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
