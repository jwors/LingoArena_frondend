import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../gameStore';

vi.mock('../../api/room', () => ({
  startGameApi: vi.fn(() => Promise.resolve({ data: {} })),
}));

describe('gameStore', () => {
  beforeEach(() => useGameStore.getState().reset());

  it('should start in idle state', () => {
    const s = useGameStore.getState();
    expect(s.status).toBe('idle');
    expect(s.roomId).toBeNull();
    expect(s.currentQuestion).toBeNull();
  });

  it('should set room and transition to waiting', () => {
    const wb = { name: 'cet4', label: 'CET-4', emoji: '📘', color: 'blue' };
    useGameStore.getState().setRoom('r1', [{ id: 'p1', nickname: 'A' }], wb);
    const s = useGameStore.getState();
    expect(s.roomId).toBe('r1');
    expect(s.status).toBe('waiting');
  });

  it('should init scores on game start', async () => {
    const wb = { name: 'cet4', label: 'CET-4', emoji: '📘', color: 'blue' };
    useGameStore.getState().setRoom('r1', [{ id: 'p1', nickname: 'A' }, { id: 'p2', nickname: 'B' }], wb);
    await useGameStore.getState().startGame();
    const s = useGameStore.getState();
    expect(s.status).toBe('playing');
    expect(s.scores['p1']).toBe(0);
    expect(s.scores['p2']).toBe(0);
  });

  it('should set question and reset submission state', () => {
    useGameStore.getState().submitAnswer();
    expect(useGameStore.getState().hasSubmitted).toBe(true);
    useGameStore.getState().setQuestion('苹果', 1);
    const s = useGameStore.getState();
    expect(s.currentQuestion).toEqual({ chinese: '苹果', round: 1 });
    expect(s.hasSubmitted).toBe(false);
  });

  it('should end game with data', () => {
    const end = { winner: 'p1', scores: { p1: 5, p2: 3 }, stats: { p1: { correct: 5, wrong: 0, avgTime: 2.1 }, p2: { correct: 3, wrong: 2, avgTime: 3.5 } } };
    useGameStore.getState().endGame(end);
    const s = useGameStore.getState();
    expect(s.status).toBe('finished');
    expect(s.gameEndData).toEqual(end);
  });
});
