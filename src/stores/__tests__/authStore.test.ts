import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authApi from '../../api/auth';
import { useAuthStore } from '../authStore';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    vi.clearAllMocks();
  });

  it('should start with null token and user', () => {
    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('should set token and user on successful login', async () => {
    const mockUser = { id: 1, nickname: 'Test' };
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { accessToken: 'tok', refreshToken: 'rtok', user: mockUser },
    });
    await useAuthStore.getState().login('a@b.com', 'pw');
    const s = useAuthStore.getState();
    expect(s.token).toBe('tok');
    expect(s.refreshToken).toBe('rtok');
    expect(s.user).toEqual(mockUser);
    expect(s.isAuthenticated()).toBe(true);
  });

  it('should clear on logout', async () => {
    localStorage.setItem('auth_token', 'x');
    useAuthStore.setState({ token: 'x', refreshToken: 'rx', user: { id: 1, nickname: 'x' } });
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
