import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWSStore } from '../stores/wsStore';

export function useWebSocket() {
  const token = useAuthStore((s) => s.token);
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (token) { connect(token); }
    return () => disconnect();
  }, [token, connect, disconnect]);
}
