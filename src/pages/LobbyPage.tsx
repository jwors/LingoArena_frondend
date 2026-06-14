// ============================================================
// LobbyPage — 游戏大厅
// 功能：创建房间 / 加入房间 / 显示用户信息
// ============================================================
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { CreateRoomPanel } from '../components/lobby/CreateRoomPanel';
import { JoinRoomPanel } from '../components/lobby/JoinRoomPanel';
import { showToast } from '../components/shared/Toast';
import { useEffect } from 'react';
import type { CreateRoomResponse } from '../api/room';
import { WORD_BOOKS } from '../types';
import { Logo } from '../components/shared/Logo';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  useWebSocket(); // 建立 WebSocket 通用连接（无房间参数）

  // 从分享链接进入时，自动填充房间码到输入框
  const roomCodeFromUrl = searchParams.get('roomCode') || '';

  // 有分享链接时提示用户
  useEffect(() => {
    if (roomCodeFromUrl) {
      showToast('已填充房间码，点击加入房间', 'info');
    }
  }, [roomCodeFromUrl]);

  // 未登录则跳转
  if (!token) { navigate('/login', { replace: true }); return null; }

  // ============================================================
  // handleCreated — 创建房间成功后的回调
  // 调 setRoom 填充 store（自动将房主标记为已准备），再导航到游戏房间页
  // ============================================================
  const handleCreated = (id: string, roomCode?: string, wordBookName?: string) => {
    if (roomCode) {
      const curUser = useAuthStore.getState().user;
      const player = curUser ? { id: String(curUser.id), nickname: curUser.nickname || '' } : null;
      const wordBook = WORD_BOOKS.find((wb) => wb.name === wordBookName)
        ?? { name: wordBookName || 'cet4', label: wordBookName || 'CET-4', emoji: '📘', color: 'blue' };
      useGameStore.getState().setRoom(
        id,
        player ? [player] : [],
        wordBook,
        String(curUser?.id ?? ''),
        roomCode,
      );
      navigate(`/room/${id}?roomCode=${roomCode ?? ''}`);
    }
  };

  // ============================================================
  // handleJoined — 加入房间成功后的回调
  // 使用 joinRoom API 返回的房间数据填充 store
  // ============================================================
  const handleJoined = (code: string, roomData?: CreateRoomResponse) => {
    if (roomData?.room) {
      const room = roomData.room;
      const wordBook = WORD_BOOKS.find((wb) => wb.name === room.wordbook_name)
        ?? { name: room.wordbook_name || '', label: room.wordbook_name || '', emoji: '📘', color: 'blue' };
      useGameStore.getState().setRoom(
        String(room.id),
        [{ id: String(room.host.id), nickname: room.host.nickname }],
        wordBook,
        String(room.host.id),
        code,
      );
    }
    navigate(`/room/${code}?joinWithCode=true`);
  };

  return (
    <div className="page-bg">
      {/* ---- 顶部导航栏 ---- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <Logo size="sm" />

        {/* 用户信息 + 退出登录 */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg">
              <div className="w-6 h-6 bg-violet-200 rounded-full flex items-center justify-center text-xs text-violet-700 font-medium">
                {user.nickname?.[0] || 'U'}
              </div>
              <span className="text-sm text-gray-700">{user.nickname}</span>
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login'); showToast('已退出登录', 'info'); }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
            退出
          </button>
        </div>
      </header>

      {/* ---- 主内容区 ---- */}
      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* 欢迎语 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            欢迎来到竞技场
          </h2>
          <p className="text-gray-500 mt-1 text-sm">创建或加入房间，开始单词对战</p>
        </div>

        <div className="space-y-6">
          <CreateRoomPanel onCreated={handleCreated} />
          <JoinRoomPanel initialCode={roomCodeFromUrl} onJoined={handleJoined} />
        </div>
      </main>
    </div>
  );
}
