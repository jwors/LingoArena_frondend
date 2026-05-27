import apiClient from './client';

export interface Room {
  id: string;
  code: string;
  name?: string;
  wordBook: string;
  players: Array<{ id: string; nickname: string }>;
}

export const createRoom = (data: { wordBook: string; name?: string }) =>
  apiClient.post<Room>('/rooms', data);
export const joinRoom = (data: { code: string }) =>
  apiClient.post<Room>('/rooms/join', data);
