// ============================================================
// GameHeader — 游戏顶栏组件
// 显示：我方昵称/角色、词库标签、回合标签、倒计时、对手状态
// ============================================================
import { useTimer } from '../../hooks/useTimer';
import type { GameMode } from '../../types';

interface Props {
  myNickname: string;                     // 当前玩家昵称
  myId: string;                           // 当前玩家 ID
  hostId: string | null;                  // 房主 ID
  opponent: { id: string; nickname: string } | null;  // 对手信息
  wordBook: { emoji: string; label: string } | null;  // 词库信息
  timeLeft: number;                       // 剩余时间（秒）
  opponentStatus: 'typing' | 'submitted' | null;      // 对手输入状态
  gameMode: GameMode;                     // 游戏模式
  currentTurnPlayerId: string | null;     // 当前回合玩家 ID
}

export function GameHeader({
  myNickname, myId, hostId, opponent, wordBook,
  timeLeft, opponentStatus, gameMode, currentTurnPlayerId,
}: Props) {
  // 将秒数格式化为 "M:SS" 显示
  const timeDisplay = useTimer(timeLeft);
  const opponentNickname = opponent?.nickname || '对手';

  // 回合制模式下的回合标签
  const turnLabel = gameMode === 'turn'
    ? (currentTurnPlayerId === myId ? '你的回合' : `${opponentNickname}的回合`)
    : null;

  // 玩家角色标签
  const myRole = hostId === myId ? '房主' : '游客';
  const opponentRole = hostId && opponent ? (hostId === opponent.id ? '房主' : '游客') : null;
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
      {/* ---- 左侧：我方信息 ---- */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-medium">
          {myNickname?.[0] || '?'}  {/* 取昵称首字作为头像 */}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-900">{myNickname || '我'}</p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-medium">{myRole}</span>
          </div>
          <p className="text-xs text-gray-400">你</p>
        </div>
      </div>

      {/* ---- 中间：词库标签 + 回合标签 + 倒计时 ---- */}
      <div className="flex flex-col items-center gap-1.5">
        {wordBook && (
          <span className="badge bg-violet-50 text-violet-700">
            {wordBook.emoji} {wordBook.label}
          </span>
        )}
        {turnLabel && (
          <span className="badge bg-amber-50 text-amber-600">{turnLabel}</span>
        )}
        {/* 倒计时：<= 5 秒时变红 + 闪烁 */}
        <div className={`text-xl font-mono font-bold tabular-nums transition-colors duration-200 ${
          timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-gray-700'
        }`}>
          {timeDisplay}
        </div>
      </div>

      {/* ---- 右侧：对手信息 ---- */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <p className="text-sm font-medium text-gray-900">{opponentNickname}</p>
            {opponentRole && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-medium">{opponentRole}</span>
            )}
          </div>
          {/* 对手输入状态：正在输入 / 已提交 */}
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
            ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-200 ring-offset-1'  // 输入中：蓝色高亮
            : opponentStatus === 'submitted'
            ? 'bg-emerald-100 text-emerald-700'                              // 已提交：绿色
            : 'bg-violet-100 text-violet-700'                                // 默认：紫色
        }`}>
          {opponent?.nickname?.[0] || '?'}
        </div>
      </div>
    </div>
  );
}
