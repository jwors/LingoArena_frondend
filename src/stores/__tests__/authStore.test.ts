import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authApi from '../../api/auth';
import { useAuthStore } from '../authStore';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
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
    const mockUser = { id: '1', email: 'a@b.com', nickname: 'Test' };
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { token: 'tok', user: mockUser },
    });
    await useAuthStore.getState().login('a@b.com', 'pw');
    const s = useAuthStore.getState();
    expect(s.token).toBe('tok');
    expect(s.user).toEqual(mockUser);
    expect(s.isAuthenticated()).toBe(true);
  });

  it('should clear on logout', () => {
    localStorage.setItem('token', 'x');
    useAuthStore.setState({ token: 'x', user: { id: '1', email: 'a@b.com', nickname: 'x' } });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
