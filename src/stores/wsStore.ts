import { create } from 'zustand';
import { useGameStore } from './gameStore';

const WS_URL = import.meta.env.VITE_WS_URL || '/ws';

interface WSState {
  ws: WebSocket | null;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  send: (event: string, data: Record<string, unknown>) => void;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const useWSStore = create<WSState>()((set, get) => ({
  ws: null,
  connected: false,

  connect: (token: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsEndpoint = WS_URL.startsWith('ws') ? WS_URL : `${protocol}//${host}${WS_URL}`;
    const ws = new WebSocket(`${wsEndpoint}?token=${token}`);

    ws.onopen = () => set({ connected: true });

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
      reconnectTimer = setTimeout(() => {
        const t = localStorage.getItem('token');
        if (t) get().connect(t);
      }, 3000);
    };

    set({ ws });
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) ws.close();
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    set({ ws: null, connected: false });
  },

  send: (event: string, data: Record<string, unknown>) => {
    const { ws, connected } = get();
    if (connected && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  },
}));
