// ============================================================
// WebSocket 状态管理（Zustand Store）
// 职责：建立/断开 WS 连接、自动重连、事件分发
// 后端地址由 VITE_WS_URL 环境变量配置，默认 /ws/room
// ============================================================
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { useAuthStore } from './authStore';
import { fromBackendGameMode } from '../api/room';
import { showToast } from '../components/shared/Toast';

// WebSocket 服务端地址（从环境变量读取，默认代理到后端 /ws/room）
const WS_URL = import.meta.env.VITE_WS_URL || '/ws/room';

// ============================================================
// Store 接口定义
// ============================================================
interface WSState {
  ws: WebSocket | null;             // WebSocket 实例
  connected: boolean;               // 是否已连接
  _intentionalDisconnect: boolean;  // 是否主动断开（用于区分断线重连）
  roomId: string | null;            // 当前所在房间 ID
  roomCode: string | null;          // 当前所在房间码

  // Actions
  connect: (token: string, roomId?: string, roomCode?: string, onOpen?: () => void) => void;
  disconnect: () => void;
  send: (event: string, data: Record<string, unknown>) => void;
}

// 全局重连定时器（模块级，不会被 React 重新渲染重置）
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

// ============================================================
// 创建 Store
// ============================================================
export const useWSStore = create<WSState>()(
  devtools(
    (set, get) => ({
  ws: null,
  connected: false,
  _intentionalDisconnect: false,
  roomId: null,
  roomCode: null,

  // ==========================================================
  // connect — 建立 WebSocket 连接
  // token: 认证令牌，roomId/roomCode: 加入房间的参数
  // ==========================================================
  connect: (token: string, roomId?: string, roomCode?: string, onOpen?: () => void) => {
    // 清除之前残留的重连定时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // 构造 WebSocket URL（支持 HTTPS → WSS 自动升级）
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsEndpoint = WS_URL.startsWith('ws') ? WS_URL : `${protocol}//${host}${WS_URL}`;

    // 通过 URL 查询参数传递认证信息和房间标识
    const params = new URLSearchParams({ token });
    if (roomId) params.set('roomId', roomId);       // 已有 roomId 直接加入
    if (roomCode) params.set('roomCode', roomCode); // 通过房间码加入
    const ws = new WebSocket(`${wsEndpoint}?${params}`);

    // ---- 连接成功 ----
    ws.onopen = () => {
      set({ connected: true, _intentionalDisconnect: false });
      onOpen?.();  // 连接完成回调
    };

    // ---- 收到消息 — 核心事件分发器 ----
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // 兼容两种消息格式：{ type, payload } 和 { event, data }
        const type = msg.type || msg.event;
        const payload = msg.payload || msg.data;
        const g = useGameStore.getState();

        switch (type) {
          // ====================================================
          // room:joined — 玩家加入房间
          // payload.players 存在 → 全量数据（首次加入/创建房间）
          // payload.user 存在     → 增量数据（其他玩家加入时通知）
          // ====================================================
          case 'room:joined':
          case 'room_joined':
            if (payload.players) {
              // ---- 全量数据：初始化整个房间状态 ----
              // 后端 player.id 可能是 number，统一转为 string
              const normalizedPlayers = payload.players.map((p: { id: string | number; nickname?: string; avatar?: string }) => ({
                ...p,
                id: String(p.id),
              }));
              // 兼容 snake_case（服务端）和 camelCase（前端）
              const hostId = payload.hostId ?? payload.host_id ?? payload.host?.id ?? null;
              const roomCode = payload.roomCode ?? payload.room_code ?? payload.room?.room_code ?? null;
              const roomId = payload.roomId ?? payload.room_id ?? payload.room?.id ?? null;
              g.setRoom(
                roomId != null ? String(roomId) : '',
                normalizedPlayers,
                payload.wordBook,
                hostId != null ? String(hostId) : null,
                roomCode
              );
              {
                const mode = payload.gameMode ?? payload.game_mode;
                if (typeof mode === 'string') g.setGameMode(fromBackendGameMode(mode));
              }
            } else if (payload.user) {
              // ---- 增量数据：单个玩家加入 ----
              const currentUserId = String(useAuthStore.getState().user?.id ?? '');
              const isSelf = String(payload.user.id) === currentUserId;

              if (isSelf) {
                // -- 当前玩家自己加入了房间 --
                // 使用合并策略，避免后到的 payload.user 覆盖之前 payload.players 设好的全量数据
                const ws = get();
                const state = useGameStore.getState();
                const selfId = String(payload.user.id);
                const selfPlayer = {
                  id: selfId,
                  nickname: payload.user.nickname || `Player ${selfId}`,
                };
                // 合并：保留已有的 players 列表，确保自己在列表中
                const mergedPlayers = state.players.some((p) => String(p.id) === selfId)
                  ? state.players                       // 自己已在列表中，保留不动
                  : [...state.players, selfPlayer];     // 自己不在列表中则添加
                // 兼容 snake_case（服务端）和 camelCase（前端）
                const selfRoomId = payload.roomId ?? payload.room_id ?? (ws.roomId ?? ws.roomCode ?? '');
                const selfHostId = payload.hostId ?? payload.host_id ?? payload.host?.id ?? state.hostId ?? null;
                const selfRoomCode = payload.roomCode ?? payload.room_code ?? payload.room?.room_code ?? state.roomCode ?? null;
                g.setRoom(
                  selfRoomId,
                  mergedPlayers,
                  payload.wordBook ?? state.wordBook ?? null,
                  selfHostId,
                  selfRoomCode
                );
              } else {
                // -- 对手加入了房间：添加到玩家列表 --
                const currentPlayers = useGameStore.getState().players;
                const currentState = useGameStore.getState();
                const newPlayer = {
                  id: String(payload.user.id),
                  nickname: payload.user.nickname || `Player ${payload.user.id}`,
                };
                // 去重：避免重复添加
                if (!currentPlayers.some((p) => String(p.id) === newPlayer.id)) {
                  g.setRoom(
                    currentState.roomId ?? '',
                    [...currentPlayers, newPlayer],  // 追加新玩家
                    currentState.wordBook!,           // 保留原词库
                    currentState.hostId,              // 保留原房主
                    currentState.roomCode             // 保留原房间码
                  );
                }
              }
            }
            break;

          // ====================================================
          // game:start — 游戏正式开始
          // 服务端启动游戏后广播此事件，前端仅初始化分数
          // ====================================================
          case 'game:start':
            const initScores: Record<string, number> = {};
            for (const p of g.players) initScores[p.id] = 0;
            useGameStore.setState({ status: 'playing', scores: initScores, hasSubmitted: false });
            break;

          // ====================================================
          // player:ready_status — 玩家准备状态变更
          // payload: { userId, ready: true/false }
          // ====================================================
          case 'player:ready_status':
            {
              const userId = payload.userId ?? payload.user_id;
              if (userId) {
                const ready = payload.ready !== false;
                g.setPlayerReadyState(String(userId), ready);
              }
            }
            break;

          // ====================================================
          // 游戏进行中事件
          // ====================================================
          case 'question:new':    g.setQuestion(payload.chinese, payload.round); break;
          case 'answer:result':   g.setResult(payload); break;
          case 'score:update':    g.setScores(payload.scores); break;
          case 'timer:tick':      g.setTimeLeft(payload.timeLeft); break;

          // ====================================================
          // opponent:status — 对手输入状态
          // { status: 'typing' | 'submitted' | 'connected' }
          // ====================================================
          case 'opponent:status':
            {
              const userId = payload.userId ?? payload.user_id;
              if (userId) {
                const uid = String(userId);
                const currentState = useGameStore.getState();
                // 新玩家连接时，补充加入 players 列表（服务端未广播 room:joined 时的兜底）
                if (payload.status === 'connected' && !currentState.players.some((p) => String(p.id) === uid)) {
                  currentState.addPlayer({ id: uid, nickname: `玩家 ${uid}` });
                }
                // 更新打字/已提交状态
                if (payload.status === 'typing' || payload.status === 'submitted') {
                  currentState.setOpponentStatus(payload.status);
                }
              }
            }
            break;

          // ====================================================
          // turn:start — 回合制切换当前玩家
          // ====================================================
          case 'turn:start': g.setTurn(payload.currentPlayerId ?? payload.current_player_id); break;

          // ====================================================
          // game:end — 游戏结束
          // ====================================================
          case 'game:end': g.endGame(payload); break;

          // ====================================================
          // player:left — 有玩家离开房间
          // ====================================================
          case 'player:left':
            {
              const userId = payload.userId ?? payload.user_id;
              if (userId) {
                const leftUserId = String(userId);
                showToast('对手已离开房间', 'info');
                useGameStore.setState((state) => ({
                  players: state.players.filter((p) => p.id !== leftUserId),
                }));
              }
            }
            break;

          // ====================================================
          // room:closed — 房间被关闭（最后一人退出时）
          // ====================================================
          case 'room:closed':
            g.reset();                              // 重置游戏状态
            useGameStore.setState({ roomClosed: true });  // 标记房间已关闭（触发页面跳转）
            showToast('房间已关闭', 'info');
            break;
        }
      } catch (err) { console.error('[WS] 消息解析失败:', err); }
    };

    // ---- 连接出错 ----
    ws.onerror = (err) => {
      console.error('[WS] 连接异常:', err);
    };

    // ---- 连接关闭 ----
    ws.onclose = (event) => {
      console.warn('[WS] 连接已关闭:', event.code, event.reason || '无原因');
      set({ connected: false, ws: null });

      // 如果是主动断开（disconnect() 调用），不重连
      const { _intentionalDisconnect } = get();
      if (_intentionalDisconnect) return;

      // 非主动断开：3 秒后自动重连
      reconnectTimer = setTimeout(() => {
        const t = localStorage.getItem('auth_token');
        const { roomId: rid, roomCode: rc } = get();
        if (t) get().connect(t, rid ?? undefined, rc ?? undefined);
      }, 3000);
    };

    // 保存 WebSocket 实例到 store
    set({ ws, roomId: roomId ?? null, roomCode: roomCode ?? null });
  },

  // ==========================================================
  // disconnect — 主动断开 WebSocket 连接
  // ==========================================================
  disconnect: () => {
    const { ws } = get();

    // 先标记为主动断开，这样 onclose 不会触发重连
    set({ _intentionalDisconnect: true, roomId: null, roomCode: null });

    // 清除重连定时器（确保 onclose 不会安排新重连）
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // 关闭 WebSocket
    if (ws) ws.close();
    set({ ws: null, connected: false });
  },

  // ==========================================================
  // send — 发送消息到服务端
  // 格式: { type: "事件名", payload: { ... } }
  // ==========================================================
  send: (type: string, payload: Record<string, unknown>) => {
    const { ws, connected } = get();
    if (connected && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  },
    }),
    { name: 'WSStore' },
  ),
);
