/** 合并 store / URL / WS 中的 roomId，空字符串视为未设置 */
export function resolveRoomId(options: {
  storeRoomId: string | null;
  urlParam?: string;
  joinWithCode: boolean;
  wsRoomId?: string | null;
}): string | null {
  const fromStore = options.storeRoomId?.trim();
  if (fromStore) return fromStore;

  if (!options.joinWithCode && options.urlParam && /^\d+$/.test(options.urlParam)) {
    return options.urlParam;
  }

  const fromWs = options.wsRoomId?.trim();
  if (fromWs && /^\d+$/.test(fromWs)) return fromWs;

  return null;
}

export function pickRoomIdFromPayload(payload: Record<string, unknown>): string | null {
  const room = payload.room as Record<string, unknown> | undefined;
  const raw = payload.roomId ?? payload.room_id ?? room?.id;
  if (raw == null || String(raw).trim() === '') return null;
  return String(raw);
}
