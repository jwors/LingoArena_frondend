// ============================================================
// AnswerForm — 答案输入框组件
// 功能：输入英文答案并提交，防重复提交，回合制模式权限控制
// ============================================================
import { useState, useRef } from 'react';
import { useWSStore } from '../../stores/wsStore';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { GameMode } from '../../types';

interface Props {
  roomId: string;     // 当前房间 ID（用于发送 answer:submit 事件）
  gameMode: GameMode; // 游戏模式（rush / turn）
}

export function AnswerForm({ roomId, gameMode }: Props) {
  const [answer, setAnswer] = useState('');           // 当前输入框内容
  const inputRef = useRef<HTMLInputElement>(null);     // 输入框引用（用于自动聚焦）
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);        // 是否已提交（防重复）
  const submitAnswer = useGameStore((s) => s.submitAnswer);        // 标记已提交
  const send = useWSStore((s) => s.send);                          // WebSocket 发送
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);  // 当前回合玩家
  const userId = useAuthStore((s) => s.user?.id);                  // 当前用户 ID

  // ============================================================
  // 回合制模式：不是自己的回合 → 显示等待提示，不渲染输入框
  // ============================================================
  if (gameMode === 'turn' && currentTurnPlayerId && currentTurnPlayerId !== String(userId)) {
    return (
      <div className="text-center py-6 card">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">等待对手答题...</p>
      </div>
    );
  }

  // ============================================================
  // handleSubmit — 提交答案
  // 通过 WebSocket 发送 answer:submit 事件
  // ============================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();               // 阻止表单默认提交行为
    if (!answer.trim() || hasSubmitted) return;  // 空答案或已提交则忽略
    send('answer:submit', { roomId, answer: answer.trim() });  // 发送答案到服务端
    submitAnswer();                   // 标记本地已提交（防止重复提交）
    setAnswer('');                    // 清空输入框
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {/* 答案输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={hasSubmitted}                    // 已提交后禁用输入
        placeholder={hasSubmitted ? '已提交，等待结果...' : '输入英文答案'}
        className="flex-1 input-field text-lg"
        autoComplete="off"
        autoFocus
      />
      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={hasSubmitted || !answer.trim()}  // 已提交或空内容时禁用
        className="px-6 py-2.5 bg-violet-600 text-white rounded-lg
                   hover:bg-violet-700 transition-colors duration-150
                   disabled:opacity-40 disabled:cursor-not-allowed font-medium"
      >
        {hasSubmitted ? <LoadingSpinner size="sm" /> : '提交'}
      </button>
    </form>
  );
}
