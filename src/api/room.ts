// ============================================================
// 房间 REST API（字段与后端 OpenAPI 对齐，JSON 使用 snake_case）
// ============================================================
import apiClient from './client';
import type { GameMode, User, WordBook } from '../types';
import { WORD_BOOKS } from '../types';

export type BackendGameMode = 'RACE' | 'TURN_BASED';

export interface BackendWordbook {
  id: number;
  name: string;
  description?: string;
  level?: string;
  isActive?: boolean;
}

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

/** 前端词库 key → 后端 Wordbook.level */
export const WORD_BOOK_LEVEL_MAP: Record<string, string> = {
  cet4: 'CET4',
  cet6: 'CET6',
  kaoyan: 'KAOYAN',
  ielts: 'IELTS',
  gre: 'TOEFL',
  random: 'CET4',
};

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

function normalizeWordbook(raw: Record<string, unknown>): BackendWordbook {
  return {
    id: Number(pick(raw, 'id')),
    name: String(pick(raw, 'name') ?? ''),
    description: pick(raw, 'description'),
    level: pick(raw, 'level'),
    isActive: pick(raw, 'isActive', 'is_active'),
  };
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

export function wordBookFromRoom(room: NormalizedRoom, fallbackKey?: string): WordBook {
  const byName = WORD_BOOKS.find(
    (wb) => wb.name === room.wordbookName || wb.label === room.wordbookName,
  );
  if (byName) return byName;
  const byKey = WORD_BOOKS.find((wb) => wb.name === fallbackKey);
  if (byKey) return byKey;
  return {
    name: room.wordbookName || fallbackKey || 'cet4',
    label: room.wordbookName || 'CET-4',
    emoji: '📘',
    color: 'blue',
  };
}

export function resolveWordbookId(
  wordbooks: BackendWordbook[],
  selectedKey: string,
): number | null {
  if (wordbooks.length === 0) return null;

  const level = WORD_BOOK_LEVEL_MAP[selectedKey];
  if (level) {
    const byLevel = wordbooks.find((wb) => wb.level === level);
    if (byLevel) return byLevel.id;
  }

  const key = selectedKey.toLowerCase();
  const byName = wordbooks.find((wb) => wb.name.toLowerCase().includes(key));
  if (byName) return byName.id;

  const active = wordbooks.find((wb) => wb.isActive !== false);
  return active?.id ?? wordbooks[0]?.id ?? null;
}

function unwrapRoom(data: unknown): NormalizedRoom {
  const envelope = data as Record<string, unknown>;
  const raw = (envelope.room ?? envelope) as Record<string, unknown>;
  return normalizeRoom(raw);
}

export const listWordbooks = async (): Promise<BackendWordbook[]> => {
  const { data } = await apiClient.get<unknown>('/wordbooks');

  if (Array.isArray(data)) {
    return data.map((item) => normalizeWordbook(item as Record<string, unknown>));
  }

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const list = [obj.wordbooks, obj.data, ...Object.values(obj)].find(Array.isArray);
    if (Array.isArray(list)) {
      return list.map((item) => normalizeWordbook(item as Record<string, unknown>));
    }
  }

  return [];
};

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
