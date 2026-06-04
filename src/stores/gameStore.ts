import { create } from 'zustand';
import type { Player, DisplayQuestion, AnswerResult, GameStatus, WordBook, GameEndData, OpponentStatus, GameMode } from '../types';
import { startGameApi } from '../api/room';

interface GameState {
  roomId: string | null;
  players: Player[];
  scores: Record<string, number>;
  currentQuestion: DisplayQuestion | null;
  timeLeft: number;
  wordBook: WordBook | null;
  status: GameStatus;
  roundNumber: number;
  result: AnswerResult | null;
  opponentStatus: OpponentStatus;
  hasSubmitted: boolean;
  gameEndData: GameEndData | null;
  gameMode: GameMode;
  currentTurnPlayerId: string | null;
  readyPlayerIds: string[];
  hostId: string | null;
  roomCode: string | null;

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
  setPlayerReady: (playerId: string) => void;
  setHostId: (id: string) => void;
  setRoomCode: (code: string) => void;
  leaveRoom: () => void;
  reset: () => void;
  resetToWaiting: () => void;
}

const initialState = {
  roomId: null,
  players: [],
  scores: {},
  currentQuestion: null,
  timeLeft: 15,
  wordBook: null,
  status: 'idle' as GameStatus,
  roundNumber: 0,
  result: null,
  opponentStatus: null,
  hasSubmitted: false,
  gameEndData: null,
  gameMode: 'rush' as GameMode,
  currentTurnPlayerId: null,
  readyPlayerIds: [],
  hostId: null,
  roomCode: null,
};

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,
  setRoom: (roomId, players, wordBook, hostId, roomCode) => set({ roomId, players, wordBook, status: 'waiting', hostId: hostId ?? null, roomCode: roomCode ?? null }),
  addPlayer: (player) => set((state) => ({
    players: state.players.some((p) => p.id === player.id) ? state.players : [...state.players, player],
  })),
  startGame: async () => {
    const { roomId, players } = get();
    if (!roomId) return;
    const scores: Record<string, number> = {};
    for (const p of players) scores[p.id] = 0;
    await startGameApi(Number(roomId));
    set({ status: 'playing', scores, hasSubmitted: false });
  },
  setQuestion: (chinese, round) => set({ currentQuestion: { chinese, round }, result: null, timeLeft: 15, hasSubmitted: false }),
  setResult: (result) => set({ result }),
  setScores: (scores) => set({ scores }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setOpponentStatus: (status) => set({ opponentStatus: status }),
  endGame: (data) => set({ status: 'finished', gameEndData: data }),
  submitAnswer: () => set({ hasSubmitted: true }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setTurn: (playerId) => set({ currentTurnPlayerId: playerId }),
  setPlayerReady: (playerId) => set((state) => ({
    readyPlayerIds: state.readyPlayerIds.includes(playerId)
      ? state.readyPlayerIds.filter((id) => id !== playerId)
      : [...state.readyPlayerIds, playerId],
  })),
  setHostId: (id) => set({ hostId: id }),
  setRoomCode: (code) => set({ roomCode: code }),
  leaveRoom: () => set({ ...initialState, status: 'idle' }),
  reset: () => set(initialState),
  resetToWaiting: () => set({
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
    readyPlayerIds: [],
  }),
}));
