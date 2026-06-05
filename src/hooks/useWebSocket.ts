// ============================================================
// useWebSocket — WebSocket 生命周期 hook
// 用于大厅页面（LobbyPage）建立通用 WS 连接
// 游戏页面（GameRoomPage）独立管理自己的 WS 连接
// ============================================================
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWSStore } from '../stores/wsStore';

export function useWebSocket() {
  const token = useAuthStore((s) => s.token);
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);
  const initialize = useAuthStore((s) => s.initialize);

  // ---- 页面加载时从 localStorage 恢复登录状态 ----
  useEffect(() => {
    initialize();
  }, [initialize]);

  // ---- token 存在则建立 WS 连接（无房间参数，仅保持通用连接）----
  useEffect(() => {
    if (token) { connect(token); }
    return () => disconnect();
  }, [token, connect, disconnect]);
}
