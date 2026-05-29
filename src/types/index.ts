export interface User {
  id: number;
  nickname: string;
}

export interface Player {
  id: string;
  nickname: string;
  avatar?: string;
}

export interface WordBook {
  name: string;
  label: string;
  emoji: string;
  color: string;
}

export interface DisplayQuestion {
  chinese: string;
  round: number;
}

export interface AnswerResult {
  correct: boolean;
  playerId: string;
  answer?: string;
}

export interface GameStats {
  correct: number;
  wrong: number;
  avgTime: number;
}

export interface GameEndData {
  winner: string;
  scores: Record<string, number>;
  stats: Record<string, GameStats>;
}

export type GameStatus = 'idle' | 'waiting' | 'playing' | 'finished';
export type OpponentStatus = 'typing' | 'submitted' | null;

export type GameMode = 'rush' | 'turn';

export interface TurnInfo {
  currentPlayerId: string;
  round: number;
}

export const WORD_BOOKS: WordBook[] = [
  { name: 'cet4', label: 'CET-4', emoji: '📘', color: 'blue' },
  { name: 'cet6', label: 'CET-6', emoji: '📕', color: 'red' },
  { name: 'kaoyan', label: '考研英语', emoji: '📗', color: 'green' },
  { name: 'gre', label: 'GRE', emoji: '📙', color: 'orange' },
  { name: 'ielts', label: '雅思', emoji: '🔵', color: 'blue' },
  { name: 'random', label: '随机混合', emoji: '🎲', color: 'purple' },
];

export const WINNING_SCORE = 5;
export const DEFAULT_TIME_LIMIT = 15;
