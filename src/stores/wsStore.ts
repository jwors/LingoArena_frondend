import { create } from 'zustand';
import { useGameStore } from './gameStore';

const WS_URL = import.meta.env.VITE_WS_URL || '/ws/room';

interface WSState {
  ws: WebSocket | null;
  connected: boolean;
  _intentionalDisconnect: boolean;
  roomId: string | null;
  roomCode: string | null;
  connect: (token: string, roomId?: string, roomCode?: string, onOpen?: () => void) => void;
  disconnect: () => void;
  send: (event: string, data: Record<string, unknown>) => void;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const useWSStore = create<WSState>()((set, get) => ({
  ws: null,
  connected: false,
  _intentionalDisconnect: false,
  roomId: null,
  roomCode: null,

  connect: (token: string, roomId?: string, roomCode?: string, onOpen?: () => void) => {
    // Clear any pending reconnect timer before creating a new connection
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsEndpoint = WS_URL.startsWith('ws') ? WS_URL : `${protocol}//${host}${WS_URL}`;

    // Pass token and roomId via query parameters
    const params = new URLSearchParams({ token });
    if (roomId) params.set('roomId', roomId);
    if (roomCode) params.set('roomCode', roomCode);
    const ws = new WebSocket(`${wsEndpoint}?${params}`);

    ws.onopen = () => {
      set({ connected: true, _intentionalDisconnect: false });
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Support both { type, payload } and { event, data } formats
        const type = msg.type || msg.event;
        const payload = msg.payload || msg.data;
        const g = useGameStore.getState();
        switch (type) {
          case 'room:joined':
          case 'room_joined':
            if (payload.players) {
              // Initial join: full room data
              g.setRoom(payload.roomId || payload.room?.id, payload.players, payload.wordBook);
            } else if (payload.user) {
              // Opponent joined: add player to list
              const currentPlayers = useGameStore.getState().players;
              const newPlayer = {
                id: String(payload.user.id),
                nickname: payload.user.nickname || `Player ${payload.user.id}`,
              };
              // Avoid duplicates
              if (!currentPlayers.some((p) => p.id === newPlayer.id)) {
                g.setRoom(
                  useGameStore.getState().roomId ?? '',
                  [...currentPlayers, newPlayer],
                  useGameStore.getState().wordBook!
                );
              }
            }
            break;
          case 'game:start': g.startGame(); break;
          case 'question:new': g.setQuestion(payload.chinese, payload.round); break;
          case 'answer:result': g.setResult(payload); break;
          case 'score:update': g.setScores(payload.scores); break;
          case 'timer:tick': g.setTimeLeft(payload.timeLeft); break;
          case 'opponent:status': g.setOpponentStatus(payload.status); break;
          case 'turn:start': g.setTurn(payload.currentPlayerId); break;
          case 'game:end': g.endGame(payload); break;
        }
      } catch (err) { console.error('[WS] parse error:', err); }
    };

    ws.onerror = (err) => {
      console.error('[WS] connection error:', err);
    };

    ws.onclose = (event) => {
      console.log('[WS] closed:', event.code, event.reason || 'no reason');
      set({ connected: false, ws: null });

      // Only auto-reconnect if the disconnect was NOT intentional
      const { _intentionalDisconnect } = get();
      if (_intentionalDisconnect) return;

      reconnectTimer = setTimeout(() => {
        const t = localStorage.getItem('auth_token');
        const { roomId: rid, roomCode: rc } = get();
        if (t) get().connect(t, rid ?? undefined, rc ?? undefined);
      }, 3000);
    };

    set({ ws, roomId: roomId ?? null, roomCode: roomCode ?? null });
  },

  disconnect: () => {
    const { ws } = get();

    // Mark disconnect as intentional BEFORE closing the socket
    set({ _intentionalDisconnect: true, roomId: null, roomCode: null });

    // Clear reconnect timer BEFORE closing so onclose handler won't schedule a reconnect
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) ws.close();
    set({ ws: null, connected: false });
  },

  send: (type: string, payload: Record<string, unknown>) => {
    const { ws, connected } = get();
    if (connected && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  },
}));
