// ============================================================
// 游戏状态管理（Zustand Store）
// 管理：房间信息、玩家列表、分数、题目、准备状态、游戏流程
// ============================================================
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Player, DisplayQuestion, AnswerResult, GameStatus, WordBook, GameEndData, OpponentStatus, GameMode } from '../types';
import { startGameApi } from '../api/room';

// ============================================================
// Store 接口定义
// ============================================================
interface GameState {
  // ---- 房间状态 ----
  roomId: string | null;          // 房间 ID（数字的字符串形式）
  players: Player[];              // 房间内所有玩家
  wordBook: WordBook | null;      // 当前选中的词库
  status: GameStatus;             // 游戏状态：idle | waiting | playing | finished
  gameMode: GameMode;             // 游戏模式：rush（抢答）| turn（回合）
  hostId: string | null;          // 房主玩家 ID
  roomCode: string | null;        // 6位房间码（用于分享邀请）
  roomClosed: boolean;            // 房间是否已被关闭（用于导航跳转）

  // ---- 准备状态 ----
  readyPlayerIds: string[];       // 已准备的玩家 ID 列表

  // ---- 游戏进行中 ----
  scores: Record<string, number>;           // 每位玩家的当前分数（key=playerId）
  currentQuestion: DisplayQuestion | null;  // 当前显示的题目
  timeLeft: number;                         // 当前题目剩余时间（秒）
  roundNumber: number;                      // 当前回合数
  result: AnswerResult | null;              // 最近一次答题结果
  opponentStatus: OpponentStatus;           // 对手状态（null | 'typing' | 'submitted'）
  hasSubmitted: boolean;                    // 当前玩家是否已提交答案（防重复提交）
  currentTurnPlayerId: string | null;       // 回合制模式下，当前回合的玩家 ID
  gameEndData: GameEndData | null;          // 游戏结束数据

  // ---- Actions ----
  setRoom: (roomId: string, players: Player[], wordBook: WordBook, hostId?: string | null, roomCode?: string | null) => void;
  addPlayer: (player: Player) => void;
  startGame: () => Promise<void>;
  setQuestion: (chinese: string, round: number) => void;
  setResult: (result: AnswerResult) => void;
  setScores: (scores: Record<string, number>) => void;
  setTimeLeft: (time: number) => void;
  setOpponentStatus: (status: OpponentStatus) => void;
  endGame: (data: GameEndData) => void;
  submitAnswer: () => void;
  setGameMode: (mode: GameMode) => void;
  setTurn: (playerId: string) => void;
  setPlayerReady: (playerId: string) => void;                // 切换准备状态（旧，保留兼容）
  setPlayerReadyState: (playerId: string, ready: boolean) => void;  // 绝对设置准备状态（推荐）
  setHostId: (id: string) => void;
  setRoomCode: (code: string) => void;
  leaveRoom: () => void;           // 离开房间 → 重置到 idle
  reset: () => void;               // 完全重置（回到初始状态）
  resetToWaiting: () => void;      // 游戏结束后重置回等待状态
}

// ============================================================
// 初始状态
// ============================================================
const initialState = {
  roomId: null,
  players: [],
  scores: {},
  currentQuestion: null,
  timeLeft: 15,                     // 默认每题 15 秒
  wordBook: null,
  status: 'idle' as GameStatus,
  roundNumber: 0,
  result: null,
  opponentStatus: null,
  hasSubmitted: false,
  gameEndData: null,
  gameMode: 'rush' as GameMode,     // 默认抢答模式
  currentTurnPlayerId: null,
  readyPlayerIds: [],
  hostId: null,
  roomCode: null,
  roomClosed: false,
};

// ============================================================
// 创建 Store
// ============================================================
export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
  ...initialState,

  // ---- 设置房间（由 room:joined 事件或初始化流程调用）----
  setRoom: (roomId, players, wordBook, hostId, roomCode) => set({
    roomId,
    players,
    wordBook,
    status: 'waiting',              // 设置房间后进入等待状态
    hostId: hostId ?? null,
    roomCode: roomCode ?? null,
    readyPlayerIds: hostId ? [String(hostId)] : [],  // 房主默认已准备
  }),

  // ---- 添加玩家（去重，ID 统一转为 string）----
  addPlayer: (player) => set((state) => ({
    players: state.players.some((p) => String(p.id) === String(player.id))
      ? state.players               // 已存在则不重复添加
      : [...state.players, { ...player, id: String(player.id) }],
  })),

  // ---- 开始游戏（房主调用 REST API 通知服务端）----
  startGame: async () => {
    const { roomId, players } = get();
    if (!roomId) return;             // 无房间 ID 则跳过
    // 初始化所有玩家分数为 0
    const scores: Record<string, number> = {};
    for (const p of players) scores[p.id] = 0;
    await startGameApi(Number(roomId));  // 调 REST API 通知服务端开始
    set({ status: 'playing', scores, hasSubmitted: false });
  },

  // ---- 设置新题目（由 question:new 事件触发）----
  setQuestion: (chinese, round) => set({
    currentQuestion: { chinese, round },
    result: null,                   // 清空上题结果
    timeLeft: 15,                   // 重置倒计时
    hasSubmitted: false,            // 重置提交状态
  }),

  // ---- 设置答题结果（由 answer:result 事件触发）----
  setResult: (result) => set({ result }),

  // ---- 更新分数（由 score:update 事件触发）----
  setScores: (scores) => set({ scores }),

  // ---- 更新倒计时（由 timer:tick 事件触发）----
  setTimeLeft: (time) => set({ timeLeft: time }),

  // ---- 更新对手输入状态（由 opponent:status 事件触发）----
  setOpponentStatus: (status) => set({ opponentStatus: status }),

  // ---- 游戏结束（由 game:end 事件触发）----
  endGame: (data) => set({ status: 'finished', gameEndData: data }),

  // ---- 标记已提交答案（防重复提交）----
  submitAnswer: () => set({ hasSubmitted: true }),

  // ---- 设置游戏模式 ----
  setGameMode: (mode) => set({ gameMode: mode }),

  // ---- 设置当前回合玩家（回合制模式）----
  setTurn: (playerId) => set({ currentTurnPlayerId: playerId }),

  // ---- 切换玩家准备状态（旧，toggle 逻辑）----
  setPlayerReady: (playerId) => set((state) => ({
    readyPlayerIds: state.readyPlayerIds.includes(playerId)
      ? state.readyPlayerIds.filter((id) => id !== playerId)   // 在列表中则移除
      : [...state.readyPlayerIds, playerId],                    // 不在列表中则添加
  })),

  // ---- 绝对设置玩家准备状态（推荐，根据服务端 ready 字段）----
  setPlayerReadyState: (playerId, ready) => set((state) => ({
    readyPlayerIds: ready
      ? (state.readyPlayerIds.includes(playerId)
        ? state.readyPlayerIds                    // 已准备则不重复添加
        : [...state.readyPlayerIds, playerId])    // 添加为已准备
      : state.readyPlayerIds.filter((id) => id !== playerId),  // 取消准备
  })),

  // ---- 设置房主 ID ----
  setHostId: (id) => set({ hostId: id }),

  // ---- 设置房间码 ----
  setRoomCode: (code) => set({ roomCode: code }),

  // ---- 离开房间（完全重置）----
  leaveRoom: () => set({ ...initialState, status: 'idle' }),

  // ---- 完全重置（回到初始状态）----
  reset: () => set(initialState),

  // ---- 游戏结束后重置回等待状态（保留房间和房主信息）----
  resetToWaiting: () => set((state) => ({
    status: 'waiting',
    scores: {},
    currentQuestion: null,
    timeLeft: 15,
    roundNumber: 0,
    result: null,
    opponentStatus: null,
    hasSubmitted: false,
    gameEndData: null,
    currentTurnPlayerId: null,
    readyPlayerIds: state.hostId ? [state.hostId] : [],  // 保留房主已准备状态
  })),
    }),
    { name: 'GameStore' },
  ),
);
