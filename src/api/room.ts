import apiClient from './client';
import type { GameMode, User } from '../types';

export interface Room {
  id: number;
  room_code: string;
  host: User;
  guest: User | null;
  wordbook_id: number | null;
  wordbook_name: string | null;
  game_mode: string;
  status: string;
  total_rounds: number;
  winner_id: number | null;
  host_score: number;
  guest_score: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface CreateRoomResponse {
  room: Room;
}

export const createRoom = (data: { wordBook: string; name?: string; mode: GameMode }) =>
  apiClient.post<CreateRoomResponse>('/rooms', data);
export const joinRoom = (data: { room_code: string }) =>
  apiClient.post<CreateRoomResponse>('/rooms/join', data);
export const leaveRoom = (roomId: number) =>
  apiClient.post(`/rooms/${roomId}/leave`);
export const startGameApi = (roomId: number) =>
  apiClient.post(`/rooms/${roomId}/start`);
