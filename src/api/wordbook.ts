// ============================================================
// 词库 REST API — GET /api/wordbooks → { wordbooks: Wordbook[] }
// ============================================================
import apiClient from './client';
import type { WordBook } from '../types';

export interface BackendWordbook {
  id: number;
  name: string;
  description?: string;
  level?: string;
  isActive?: boolean;
}

const LEVEL_VISUAL: Record<string, { emoji: string; color: string }> = {
  CET4: { emoji: '📘', color: 'blue' },
  CET6: { emoji: '📕', color: 'red' },
  KAOYAN: { emoji: '📗', color: 'green' },
  IELTS: { emoji: '🔵', color: 'blue' },
  TOEFL: { emoji: '📙', color: 'orange' },
};

function pick<T>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) return val as T;
  }
  return undefined;
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

function visualForLevel(level?: string) {
  if (level && LEVEL_VISUAL[level]) return LEVEL_VISUAL[level];
  return { emoji: '📚', color: 'gray' };
}

/** 后端 Wordbook → 前端展示用 WordBook */
export function toDisplayWordBook(wb: BackendWordbook): WordBook {
  const visual = visualForLevel(wb.level);
  return {
    id: wb.id,
    name: wb.name,
    label: wb.description?.trim() || wb.name || wb.level || '词库',
    emoji: visual.emoji,
    color: visual.color,
    level: wb.level,
  };
}

/** 从房间信息构造展示用词库（不依赖本地硬编码列表） */
export function wordBookFromRoom(room: {
  wordbookId: number | null;
  wordbookName: string | null;
}): WordBook {
  const visual = visualForLevel(room.wordbookName?.toUpperCase());
  return {
    id: room.wordbookId ?? undefined,
    name: room.wordbookName ?? 'unknown',
    label: room.wordbookName ?? '词库',
    emoji: visual.emoji,
    color: visual.color,
  };
}

export const listWordbooks = async (): Promise<BackendWordbook[]> => {
  const { data } = await apiClient.get<unknown>('/wordbooks');

  let list: unknown[] = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const found = obj.wordbooks ?? obj.data;
    if (Array.isArray(found)) list = found;
  }

  return list
    .map((item) => normalizeWordbook(item as Record<string, unknown>))
    .filter((wb) => wb.id && wb.isActive !== false);
};
