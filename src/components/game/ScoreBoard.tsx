// ============================================================
// ScoreBoard — 计分板组件
// 显示：我方分数 VS 对手分数 + 获胜条件提示
// 先到 WINNING_SCORE（5 分）者获胜
// ============================================================
import { WINNING_SCORE } from '../../types';

interface Props {
  myScore: number;         // 当前玩家分数
  opponentScore: number;   // 对手分数
}

export function ScoreBoard({ myScore, opponentScore }: Props) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
      {/* 我方分数（紫色） */}
      <div className="text-center flex-1">
        <p className="text-xs text-gray-400 mb-1 font-medium">你</p>
        <p className="text-4xl font-bold text-violet-600 tabular-nums">{myScore}</p>
      </div>

      {/* VS 分隔 */}
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-400 font-bold">
        VS
      </div>

      {/* 对手分数（红色） */}
      <div className="text-center flex-1">
        <p className="text-xs text-gray-400 mb-1 font-medium">对手</p>
        <p className="text-4xl font-bold text-rose-500 tabular-nums">{opponentScore}</p>
      </div>

      {/* 获胜条件提示 */}
      <span className="text-xs text-gray-400">
        先到 <span className="font-medium text-gray-600">{WINNING_SCORE}</span> 分获胜
      </span>
    </div>
  );
}
