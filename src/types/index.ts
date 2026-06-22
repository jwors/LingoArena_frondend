// ============================================================
// 用户信息（认证系统返回）
// ============================================================
export interface User {
  id: number;         // 用户唯一 ID
  nickname: string;   // 显示昵称
}

// ============================================================
// 玩家（房间内参与者）
// ============================================================
export interface Player {
  id: string;         // 玩家 ID（对应 User.id 的字符串形式）
  nickname: string;   // 玩家昵称
  avatar?: string;    // 可选头像
}

// ============================================================
// 词库信息
// ============================================================
export interface WordBook {
  id?: number;    // 后端词库 ID（来自 /api/wordbooks）
  name: string;   // 词库名称
  label: string;  // 展示标签
  emoji: string;  // 词库图标 emoji
  color: string;  // 主题色
  level?: string; // 后端 level（CET4 / CET6 等）
}

// ============================================================
// 当前题目（展示用）
// ============================================================
export interface DisplayQuestion {
  chinese: string;  // 中文提示词
  round: number;    // 当前第几题
}

// ============================================================
// 答题结果
// ============================================================
export interface AnswerResult {
  correct: boolean;   // 是否正确
  playerId: string;   // 作答玩家 ID
  answer?: string;    // 提交的答案（可选）
}

// ============================================================
// 玩家个人统计（游戏结束）
// ============================================================
export interface GameStats {
  correct: number;   // 正确数
  wrong: number;     // 错误数
  avgTime: number;   // 平均答题时间（秒）
}

// ============================================================
// 游戏结束数据
// ============================================================
export interface GameEndData {
  winner: string;                    // 胜者玩家 ID
  scores: Record<string, number>;    // 每位玩家的分数
  stats: Record<string, GameStats>;  // 每位玩家的详细统计
}

// ============================================================
// 游戏状态枚举
// ============================================================
export type GameStatus = 'idle' | 'waiting' | 'playing' | 'finished';

// 对手输入状态
export type OpponentStatus = 'typing' | 'submitted' | null;

// 游戏模式
export type GameMode = 'rush' | 'turn';

// ============================================================
// 回合信息
// ============================================================
export interface TurnInfo {
  currentPlayerId: string;  // 当前回合的玩家 ID
  round: number;            // 当前回合数
}

// ============================================================
// 游戏常量
// ============================================================
export const WINNING_SCORE = 5;          // 胜利所需分数（先到 5 分胜）
export const DEFAULT_TIME_LIMIT = 15;    // 每题默认倒计时（秒）
