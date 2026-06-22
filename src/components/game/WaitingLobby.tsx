// ============================================================
// WaitingLobby — 游戏等待区组件
// 功能：显示房间码（可复制/分享）、玩家列表、准备/开始按钮
// 三种角色视图：
//   仅房主在等待 → "等待对手加入..."
//   房主 + 对手   → "开始游戏"按钮（需双方准备）
//   游客         → "准备" / "取消准备"按钮
// ============================================================
import { useState } from 'react';
import { showToast } from '../shared/Toast';
import type { Player } from '../../types';

// ---- 组件 Props ----
interface WaitingLobbyProps {
  players: Player[];           // 当前房间所有玩家
  myId: string;                // 当前玩家 ID
  hostId: string | null;       // 房主 ID
  readyPlayerIds: string[];    // 已准备的玩家 ID 列表
  roomCode: string | null;     // 房间码
  isHost: boolean;             // 当前玩家是否为房主
  onReady: (ready: boolean) => void;    // 点击准备/取消准备
  onStartGame: () => void;             // 点击开始游戏
  minimal?: boolean;           // 精简模式（仅显示房间码）
}

export function WaitingLobby({
  players,
  myId,
  hostId,
  readyPlayerIds,
  roomCode,
  isHost,
  onReady,
  onStartGame,
  minimal = false,
}: WaitingLobbyProps) {
  // ---- 复制状态（用于按钮反馈）----
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  // ---- 复制房间码到剪贴板 ----
  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied('code');
      showToast('房间码已复制', 'success');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      showToast('复制失败，请手动抄录', 'error');
    }
  };

  // ---- 分享房间链接（设备原生分享 或 复制链接）----
  const handleShareLink = async () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/lobby?roomCode=${roomCode}`;
    try {
      if (navigator.share) {
        // 移动端原生分享
        await navigator.share({ title: 'LingoArena 房间邀请', url });
      } else {
        // 桌面端复制链接
        await navigator.clipboard.writeText(url);
        setCopied('link');
        showToast('房间链接已复制，发送给好友即可', 'success');
        setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      showToast('分享失败', 'error');
    }
  };

  // ---- 是否所有玩家都已准备（以 WS player:ready_status 为准）----
  const allReady = players.length >= 2
    && players.every((p) => readyPlayerIds.includes(p.id));

  // ---- 是否只有房主在房间 ----
  const onlyHost = players.length <= 1;

  return (
    <div className="space-y-4">
      {/* ================================================================
          房间码卡片
          ================================================================ */}
      {roomCode && (
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-2">房间码</p>
          <div className="flex items-center justify-center gap-3">
            {/* 房间码大字显示 */}
            <span className="text-3xl font-mono font-bold tracking-[0.3em] text-violet-600">
              {roomCode}
            </span>
            {/* 复制按钮 */}
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg hover:bg-violet-50 transition-colors text-gray-400 hover:text-violet-600"
              title="复制房间码"
            >
              {copied === 'code' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* 分享房间链接按钮 */}
          <button
            onClick={handleShareLink}
            className="mt-4 w-full border border-violet-200 text-violet-700 py-2.5 rounded-lg
                       hover:bg-violet-50 transition-colors duration-150
                       flex items-center justify-center gap-2 text-sm font-medium"
          >
            {copied === 'link' ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                链接已复制
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                分享房间链接
              </>
            )}
          </button>
        </div>
      )}

      {/* ================================================================
          非精简模式：玩家列表 + 操作按钮
          ================================================================ */}
      {!minimal && (
        <>
          {/* ---- 玩家列表卡片 ---- */}
          <div className="card space-y-3">
            <h3 className="text-sm font-medium text-gray-500">玩家列表</h3>
            {players.map((player) => {
              const isMe = player.id === myId;             // 是否当前玩家
              const isPlayerHost = player.id === hostId;    // 是否房主
              const isReady = readyPlayerIds.includes(player.id);  // 是否已准备
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  {/* 玩家头像 + 昵称 */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-medium">
                      {player.nickname?.[0] || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">
                          {player.nickname}
                        </span>
                        {isPlayerHost && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">房主</span>
                        )}
                        {isMe && (
                          <span className="text-xs text-gray-400">(你)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 准备状态标签 */}
                  <div className="flex items-center gap-2">
                    {isReady ? (
                      <span className="badge bg-emerald-50 text-emerald-700">已准备</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-400">未准备</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---- 操作按钮卡片 ---- */}
          <div className="card">
            {onlyHost && players.length >= 1 ? (
              // 只有房主在 → 显示等待对手动画
              <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">等待对手加入...</p>
              </div>
            ) : isHost ? (
              // 房主视图：显示开始游戏按钮}
              <div className="space-y-3">
                <button
                  onClick={onStartGame}
                  disabled={!allReady}
                  className="btn-primary py-3 text-base"
                >
                  开始游戏
                </button>
                {!allReady && (
                  <p className="text-center text-sm text-gray-400">等待所有玩家准备...</p>
                )}
              </div>
            ) : (
              /* -- 游客视图：准备 / 取消准备按钮 -- */
              <button
                onClick={() => onReady(!readyPlayerIds.includes(myId))}
                className={`w-full py-3 rounded-lg font-medium text-base transition-colors duration-150
                           ${
                  readyPlayerIds.includes(myId)
                    ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {readyPlayerIds.includes(myId) ? '取消准备' : '准备'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
