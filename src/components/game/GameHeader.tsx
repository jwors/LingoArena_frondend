import { useTimer } from '../../hooks/useTimer';

interface Props {
  opponent: { nickname: string } | null;
  wordBook: { emoji: string; label: string } | null;
  timeLeft: number;
  opponentStatus: 'typing' | 'submitted' | null;
}

export function GameHeader({ opponent, wordBook, timeLeft, opponentStatus }: Props) {
  const timeDisplay = useTimer(timeLeft);
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
          {opponent?.nickname?.[0] || '?'}
        </div>
        <div>
          <p className="text-sm font-medium">{opponent?.nickname || '对手'}</p>
          {opponentStatus && <p className="text-xs text-gray-400">{opponentStatus === 'typing' ? '正在输入...' : '已提交'}</p>}
        </div>
      </div>
      {wordBook && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg">{wordBook.emoji} {wordBook.label}</span>}
      <div className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-700'}`}>{timeDisplay}</div>
    </div>
  );
}
