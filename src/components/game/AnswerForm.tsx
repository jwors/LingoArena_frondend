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
  if (gameMode === 'turn' && currentTurnPlayerId && currentTurnPlayerId !== userId) {
    return (
      <div className="text-center py-4 text-gray-400">
        等待对手答题...
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
        disabled={hasSubmitted} placeholder={hasSubmitted ? '已提交，等待结果...' : '输入英文答案'}
        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg disabled:bg-gray-50 disabled:text-gray-400"
        autoComplete="off" autoFocus />
      <button type="submit" disabled={hasSubmitted || !answer.trim()}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium">
        {hasSubmitted ? <LoadingSpinner /> : '提交'}
      </button>
    </form>
  );
}
