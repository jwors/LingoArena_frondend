// ============================================================
// 房间 REST API（字段与后端 OpenAPI 对齐，JSON 使用 snake_case）
// ============================================================
import apiClient from './client';
import type { GameMode, User } from '../types';

export type { BackendWordbook } from './wordbook';
export { listWordbooks, toDisplayWordBook, wordBookFromRoom } from './wordbook';

export type BackendGameMode = 'RACE' | 'TURN_BASED';

export interface NormalizedRoom {
  id: number;
  roomCode: string;
  host: User;
  guest: User | null;
  wordbookId: number | null;
  wordbookName: string | null;
  gameMode: GameMode;
  status: string;
  totalRounds: number;
}

export interface CreateRoomResponse {
  room: NormalizedRoom;
}

function pick<T>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) return val as T;
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) return fallback;
  const message = data.message ?? data.error;
  const code = data.code;
  if (typeof message === 'string' && message) return message;
  if (typeof code === 'string' && code) return code;
  return fallback;
}

export function toBackendGameMode(mode: GameMode): BackendGameMode {
  return mode === 'turn' ? 'TURN_BASED' : 'RACE';
}

export function fromBackendGameMode(mode: string): GameMode {
  if (mode === 'TURN_BASED' || mode === 'turn') return 'turn';
  return 'rush';
}

export function normalizeRoom(raw: Record<string, unknown>): NormalizedRoom {
  const host = pick<Record<string, unknown>>(raw, 'host') ?? {};
  const guestRaw = pick<Record<string, unknown> | null>(raw, 'guest');
  const gameModeRaw = pick<string>(raw, 'gameMode', 'game_mode') ?? 'RACE';

  return {
    id: pick<number>(raw, 'id')!,
    roomCode: pick<string>(raw, 'roomCode', 'room_code')!,
    host: {
      id: pick<number>(host, 'id')!,
      nickname: pick<string>(host, 'nickname') ?? '',
    },
    guest: guestRaw
      ? { id: pick<number>(guestRaw, 'id')!, nickname: pick<string>(guestRaw, 'nickname') ?? '' }
      : null,
    wordbookId: pick<number | null>(raw, 'wordbookId', 'wordbook_id') ?? null,
    wordbookName: pick<string | null>(raw, 'wordbookName', 'wordbook_name') ?? null,
    gameMode: fromBackendGameMode(gameModeRaw),
    status: pick<string>(raw, 'status') ?? 'WAITING',
    totalRounds: pick<number>(raw, 'totalRounds', 'total_rounds') ?? 10,
  };
}

function unwrapRoom(data: unknown): NormalizedRoom {
  const envelope = data as Record<string, unknown>;
  const raw = (envelope.room ?? envelope) as Record<string, unknown>;
  return normalizeRoom(raw);
}

export const createRoom = async (data: {
  wordbookId: number;
  gameMode: GameMode;
  totalRounds?: number;
}) => {
  const { data: res } = await apiClient.post<unknown>('/rooms', {
    wordbook_id: data.wordbookId,
    game_mode: toBackendGameMode(data.gameMode),
    total_rounds: data.totalRounds ?? 10,
  });
  return { data: { room: unwrapRoom(res) } satisfies CreateRoomResponse };
};

export const joinRoom = async (data: { roomCode: string }) => {
  const { data: res } = await apiClient.post<unknown>('/rooms/join', {
    room_code: data.roomCode,
  });
  return { data: { room: unwrapRoom(res) } satisfies CreateRoomResponse };
};

export const leaveRoom = (roomId: number) =>
  apiClient.post(`/rooms/${roomId}/leave`);

export const startGameApi = async (roomId: number): Promise<NormalizedRoom | null> => {
  const { data } = await apiClient.post<unknown>(`/rooms/${roomId}/start`);
  if (!data || typeof data !== 'object') return null;
  const envelope = data as Record<string, unknown>;
  if (!envelope.room) return null;
  return normalizeRoom(envelope.room as Record<string, unknown>);
};
