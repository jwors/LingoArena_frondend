import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
// Import to trigger module initialization (creates axios instance & registers interceptors)
import '../client';

vi.mock('axios', () => {
  const instance: Record<string, unknown> = {
    create: vi.fn(() => instance),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return { default: instance };
});

describe('api client', () => {
  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalled();
    const config = (axios.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(config.headers['Content-Type']).toBe('application/json');
  });

  it('should register interceptors', () => {
    expect(axios.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(axios.interceptors.response.use).toHaveBeenCalledTimes(1);
  });
});
