import { useState, useRef } from 'react';
import { useWSStore } from '../../stores/wsStore';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { GameMode } from '../../types';

interface Props { roomId: string; gameMode: GameMode; }

export function AnswerForm({ roomId, gameMode }: Props) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const send = useWSStore((s) => s.send);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const userId = useAuthStore((s) => s.user?.id);

  // Turn-based: not this player's turn
  if (gameMode === 'turn' && currentTurnPlayerId && currentTurnPlayerId !== String(userId)) {
    return (
      <div className="text-center py-6 bg-white/60 rounded-xl animate-fade-in">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">等待对手答题...</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || hasSubmitted) return;
    send('answer:submit', { roomId, answer: answer.trim() });
    submitAnswer();
    setAnswer('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 animate-slide-up">
      <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
        disabled={hasSubmitted} placeholder={hasSubmitted ? '已提交，等待结果...' : '输入英文答案'}
        className="flex-1 input-field text-lg"
        autoComplete="off" autoFocus />
      <button type="submit" disabled={hasSubmitted || !answer.trim()}
        className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium hover:shadow-lg active:scale-[0.98]">
        {hasSubmitted ? <LoadingSpinner size="sm" /> : '提交'}
      </button>
    </form>
  );
}
