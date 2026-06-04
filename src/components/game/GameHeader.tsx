import { useTimer } from '../../hooks/useTimer';
import type { GameMode } from '../../types';

interface Props {
  myNickname: string;
  myId: string;
  hostId: string | null;
  opponent: { id: string; nickname: string } | null;
  wordBook: { emoji: string; label: string } | null;
  timeLeft: number;
  opponentStatus: 'typing' | 'submitted' | null;
  gameMode: GameMode;
  currentTurnPlayerId: string | null;
}

export function GameHeader({ myNickname, myId, hostId, opponent, wordBook, timeLeft, opponentStatus, gameMode, currentTurnPlayerId }: Props) {
  const timeDisplay = useTimer(timeLeft);
  const opponentNickname = opponent?.nickname || '对手';
  const turnLabel = gameMode === 'turn'
    ? (currentTurnPlayerId === myId ? '你的回合' : `${opponentNickname}的回合`)
    : null;

  const myRole = hostId === myId ? '房主' : '游客';
  const opponentRole = hostId && opponent ? (hostId === opponent.id ? '房主' : '游客') : null;

  return (
    <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm">
      {/* My info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-medium">
          {myNickname?.[0] || '?'}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-900">{myNickname || '我'}</p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-medium">{myRole}</span>
          </div>
          <p className="text-xs text-gray-400">你</p>
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
        <div className={`text-xl font-mono font-bold tabular-nums transition-colors duration-200 ${
          timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-gray-700'
        }`}>
          {timeDisplay}
        </div>
      </div>

      {/* Opponent info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <p className="text-sm font-medium text-gray-900">{opponentNickname}</p>
            {opponentRole && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-medium">{opponentRole}</span>
            )}
          </div>
          {opponentStatus && (
            <p className={`text-xs ${
              opponentStatus === 'typing' ? 'text-sky-500' : 'text-emerald-500'
            }`}>
              {opponentStatus === 'typing' ? '正在输入...' : '已提交'}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
          opponentStatus === 'typing'
            ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-200 ring-offset-1'
            : opponentStatus === 'submitted'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-violet-100 text-violet-700'
        }`}>
          {opponent?.nickname?.[0] || '?'}
        </div>
      </div>
    </div>
  );
}
