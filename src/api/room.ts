import apiClient from './client';
import type { GameMode } from '../types';

export interface Room {
  id: string;
  code: string;
  name?: string;
  wordBook: string;
  mode: GameMode;
  players: Array<{ id: string; nickname: string }>;
}

export const createRoom = (data: { wordBook: string; name?: string; mode: GameMode }) =>
  apiClient.post<Room>('/rooms', data);
export const joinRoom = (data: { code: string }) =>
  apiClient.post<Room>('/rooms/join', data);
