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
    <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
          {opponent?.nickname?.[0] || '?'}
        </div>
        <div>
          <p className="text-sm font-medium">{opponentNickname}</p>
          {opponentStatus && <p className="text-xs text-gray-400">{opponentStatus === 'typing' ? '正在输入...' : '已提交'}</p>}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        {wordBook && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg">{wordBook.emoji} {wordBook.label}</span>}
        {turnLabel && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{turnLabel}</span>}
      </div>
      <div className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-700'}`}>{timeDisplay}</div>
    </div>
  );
}
