import { create } from 'zustand';
import { useGameStore } from './gameStore';

const WS_URL = import.meta.env.VITE_WS_URL || '/ws';

interface WSState {
  ws: WebSocket | null;
  connected: boolean;
  _intentionalDisconnect: boolean;
  connect: (token: string, onOpen?: () => void) => void;
  disconnect: () => void;
  send: (event: string, data: Record<string, unknown>) => void;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const useWSStore = create<WSState>()((set, get) => ({
  ws: null,
  connected: false,
  _intentionalDisconnect: false,

  connect: (token: string, onOpen?: () => void) => {
    // Clear any pending reconnect timer before creating a new connection
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsEndpoint = WS_URL.startsWith('ws') ? WS_URL : `${protocol}//${host}${WS_URL}`;

    // Pass token via WebSocket subprotocol instead of query parameter
    // to avoid leaking it to proxy servers, server logs, and browser history
    const ws = new WebSocket(wsEndpoint, ['Bearer', token]);

    ws.onopen = () => {
      set({ connected: true, _intentionalDisconnect: false });
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const { event: wsEvent, data } = JSON.parse(event.data);
        const g = useGameStore.getState();
        switch (wsEvent) {
          case 'room:joined': g.setRoom(data.roomId, data.players, data.wordBook); break;
          case 'game:start': g.startGame(); break;
          case 'question:new': g.setQuestion(data.chinese, data.round); break;
          case 'answer:result': g.setResult(data); break;
          case 'score:update': g.setScores(data.scores); break;
          case 'timer:tick': g.setTimeLeft(data.timeLeft); break;
          case 'opponent:status': g.setOpponentStatus(data.status); break;
          case 'turn:start': g.setTurn(data.currentPlayerId); break;
          case 'game:end': g.endGame(data); break;
        }
      } catch (err) { console.error('[WS] parse error:', err); }
    };

    ws.onclose = () => {
      set({ connected: false, ws: null });

      // Only auto-reconnect if the disconnect was NOT intentional
      const { _intentionalDisconnect } = get();
      if (_intentionalDisconnect) return;

      reconnectTimer = setTimeout(() => {
        const t = localStorage.getItem('token');
        if (t) get().connect(t);
      }, 3000);
    };

    set({ ws });
  },

  disconnect: () => {
    const { ws } = get();

    // Mark disconnect as intentional BEFORE closing the socket
    set({ _intentionalDisconnect: true });

    // Clear reconnect timer BEFORE closing so onclose handler won't schedule a reconnect
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) ws.close();
    set({ ws: null, connected: false });
  },

  send: (event: string, data: Record<string, unknown>) => {
    const { ws, connected } = get();
    if (connected && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  },
}));
