import { WINNING_SCORE } from '../../types';

interface Props { myScore: number; opponentScore: number; }

export function ScoreBoard({ myScore, opponentScore }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 bg-white rounded-xl p-4 shadow-sm">
      <div className="text-center"><p className="text-xs text-gray-400 mb-1">你</p><p className="text-3xl font-bold text-indigo-600">{myScore}</p></div>
      <div className="text-gray-300 text-xl font-bold">:</div>
      <div className="text-center"><p className="text-xs text-gray-400 mb-1">对手</p><p className="text-3xl font-bold text-red-500">{opponentScore}</p></div>
      <div className="text-xs text-gray-400 ml-4">先到 {WINNING_SCORE} 分获胜</div>
    </div>
  );
}
