import { create } from 'zustand';
import type { Player, DisplayQuestion, AnswerResult, GameStatus, WordBook, GameEndData, GameStats, OpponentStatus } from '../types';

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

  setRoom: (roomId: string, players: Player[], wordBook: WordBook) => void;
  startGame: () => void;
  setQuestion: (chinese: string, round: number) => void;
  setResult: (result: AnswerResult) => void;
  setScores: (scores: Record<string, number>) => void;
  setTimeLeft: (time: number) => void;
  setOpponentStatus: (status: OpponentStatus) => void;
  endGame: (data: GameEndData) => void;
  submitAnswer: () => void;
  reset: () => void;
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
};

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,
  setRoom: (roomId, players, wordBook) => set({ roomId, players, wordBook, status: 'waiting' }),
  startGame: () => set((state) => {
    const scores: Record<string, number> = {};
    for (const p of state.players) scores[p.id] = 0;
    return { status: 'playing', scores, hasSubmitted: false };
  }),
  setQuestion: (chinese, round) => set({ currentQuestion: { chinese, round }, result: null, timeLeft: 15, hasSubmitted: false }),
  setResult: (result) => set({ result }),
  setScores: (scores) => set({ scores }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setOpponentStatus: (status) => set({ opponentStatus: status }),
  endGame: (data) => set({ status: 'finished', gameEndData: data }),
  submitAnswer: () => set({ hasSubmitted: true }),
  reset: () => set(initialState),
}));
