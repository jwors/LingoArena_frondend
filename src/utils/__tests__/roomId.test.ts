import { describe, it, expect } from 'vitest';
import { resolveRoomId, pickRoomIdFromPayload } from '../roomId';

describe('resolveRoomId', () => {
  it('prefers store roomId', () => {
    expect(resolveRoomId({ storeRoomId: '92', urlParam: '93', joinWithCode: false })).toBe('92');
  });

  it('falls back to numeric URL param for host', () => {
    expect(resolveRoomId({ storeRoomId: '', urlParam: '92', joinWithCode: false })).toBe('92');
  });

  it('does not use room code URL param for guest', () => {
    expect(resolveRoomId({ storeRoomId: '', urlParam: 'ERUGLP', joinWithCode: true, wsRoomId: '92' })).toBe('92');
  });

  it('treats empty store roomId as missing', () => {
    expect(resolveRoomId({ storeRoomId: '', urlParam: '92', joinWithCode: false })).toBe('92');
  });
});

describe('pickRoomIdFromPayload', () => {
  it('reads snake_case room_id', () => {
    expect(pickRoomIdFromPayload({ room_id: 92 })).toBe('92');
  });

  it('reads nested room.id', () => {
    expect(pickRoomIdFromPayload({ room: { id: 92 } })).toBe('92');
  });
});
