// ============================================================
// 房间 REST API
// 创建房间 / 加入房间 / 退出房间 / 开始游戏
// 所有实时通信通过 WebSocket，REST 仅处理一次性操作
// ============================================================
import apiClient from './client';
import type { GameMode, User } from '../types';

// ---- 房间数据结构（与后端对应）----
export interface Room {
  id: number;                     // 房间 ID
  room_code: string;              // 6位房间码
  host: User;                     // 房主信息
  guest: User | null;             // 游客信息（加入后才有）
  wordbook_id: number | null;     // 词库 ID
  wordbook_name: string | null;   // 词库名称
  game_mode: string;              // 游戏模式
  status: string;                 // 房间状态
  total_rounds: number;           // 总回合数
  winner_id: number | null;       // 胜者 ID
  host_score: number;             // 房主分数
  guest_score: number;            // 游客分数
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

// 创建/加入房间的响应
export interface CreateRoomResponse {
  room: Room;
}

// 创建房间
export const createRoom = (data: { wordBook: string; name?: string; mode: GameMode }) =>
  apiClient.post<CreateRoomResponse>('/rooms', data);

// 通过房间码加入房间
export const joinRoom = (data: { room_code: string }) =>
  apiClient.post<CreateRoomResponse>('/rooms/join', data);

// 退出房间
export const leaveRoom = (roomId: number) =>
  apiClient.post(`/rooms/${roomId}/leave`);

// 房主开始游戏（触发 game:start 事件广播）
export const startGameApi = (roomId: number) =>
  apiClient.post(`/rooms/${roomId}/start`);
