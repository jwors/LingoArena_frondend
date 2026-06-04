import { useState } from 'react';
import { showToast } from '../shared/Toast';
import type { Player } from '../../types';

interface WaitingLobbyProps {
  players: Player[];
  myId: string;
  hostId: string | null;
  readyPlayerIds: string[];
  roomCode: string | null;
  isHost: boolean;
  onReady: () => void;
  onStartGame: () => void;
  minimal?: boolean;
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
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

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

  const handleShareLink = async () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/lobby?roomCode=${roomCode}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LingoArena 房间邀请', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied('link');
        showToast('房间链接已复制，发送给好友即可', 'success');
        setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      showToast('分享失败', 'error');
    }
  };

  const guestReady = players.some((p) => !hostId || p.id !== hostId ? readyPlayerIds.includes(p.id) : false);
  const onlyHost = players.length <= 1;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Room Code Card */}
      {roomCode && (
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-2">房间码</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-bold tracking-[0.3em] text-violet-600">
              {roomCode}
            </span>
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

          {/* Share Button */}
          <button
            onClick={handleShareLink}
            className="mt-4 w-full bg-violet-100 text-violet-700 py-2.5 rounded-xl
                       hover:bg-violet-200 transition-all duration-200
                       flex items-center justify-center gap-2
                       active:scale-[0.98] text-sm font-medium"
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

      {!minimal && (
        <>
      {/* Players Card */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">玩家列表</h3>
        {players.map((player) => {
          const isMe = player.id === myId;
          const isPlayerHost = player.id === hostId;
          const isReady = readyPlayerIds.includes(player.id);
          return (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
            >
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
                      <span className="text-xs" title="房主">👑</span>
                    )}
                    {isMe && (
                      <span className="text-xs text-gray-400">(你)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isReady ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700">
                    ✅ 已准备
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-400">
                    ❌ 未准备
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        {onlyHost && players.length >= 1 ? (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">等待对手加入...</p>
          </div>
        ) : isHost ? (
          <div className="space-y-3">
            <button
              onClick={onStartGame}
              disabled={!guestReady}
              className="w-full bg-violet-600 text-white py-3 rounded-xl
                         hover:bg-violet-700 hover:shadow-lg
                         transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2
                         active:scale-[0.98] font-medium text-base"
            >
              <span>🚀</span>
              开始游戏
            </button>
            {!guestReady && (
              <p className="text-center text-sm text-gray-400">等待玩家准备...</p>
            )}
          </div>
        ) : (
          <button
            onClick={onReady}
            disabled={readyPlayerIds.includes(myId)}
            className={`w-full py-3 rounded-xl font-medium text-base
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       active:scale-[0.98]
                       ${
              readyPlayerIds.includes(myId)
                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
            }`}
          >
            {readyPlayerIds.includes(myId) ? (
              <>✅ 已准备</>
            ) : (
              <>⚔️ 准备</>
            )}
          </button>
        )}
      </div>
      </>
      )}
    </div>
  );
}
