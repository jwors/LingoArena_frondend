import { useTimer } from '../../hooks/useTimer';
import type { GameMode } from '../../types';

interface Props {
  opponent: { nickname: string } | null;
  wordBook: { emoji: string; label: string } | null;
  timeLeft: number;
  opponentStatus: 'typing' | 'submitted' | null;
  gameMode: GameMode;
  currentTurnPlayerId: string | null;
  myId: string;
}

export function GameHeader({ opponent, wordBook, timeLeft, opponentStatus, gameMode, currentTurnPlayerId, myId }: Props) {
  const timeDisplay = useTimer(timeLeft);
  const opponentNickname = opponent?.nickname || '对手';
  const turnLabel = gameMode === 'turn'
    ? (currentTurnPlayerId === myId ? '你的回合' : `${opponentNickname}的回合`)
    : null;

  return (
    <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm">
      {/* Opponent */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
          opponentStatus === 'typing'
            ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-200 ring-offset-1'
            : opponentStatus === 'submitted'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-violet-100 text-violet-700'
        }`}>
          {opponent?.nickname?.[0] || '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{opponentNickname}</p>
          {opponentStatus && (
            <p className={`text-xs ${
              opponentStatus === 'typing' ? 'text-sky-500' : 'text-emerald-500'
            }`}>
              {opponentStatus === 'typing' ? '正在输入...' : '已提交'}
            </p>
          )}
        </div>
      </div>

      {/* Center badges */}
      <div className="flex flex-col items-center gap-1.5">
        {wordBook && (
          <span className="badge bg-violet-50 text-violet-700">
            {wordBook.emoji} {wordBook.label}
          </span>
        )}
        {turnLabel && (
          <span className="badge bg-amber-50 text-amber-600">{turnLabel}</span>
        )}
      </div>

      {/* Timer */}
      <div className={`text-xl font-mono font-bold tabular-nums transition-colors duration-200 ${
        timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-gray-700'
      }`}>
        {timeDisplay}
      </div>
    </div>
  );
}
