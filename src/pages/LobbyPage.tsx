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
  // 先填充 store，再导航到游戏房间页
  // ============================================================
  const handleCreated = (id: string, roomCode?: string) => {
    if (roomCode) {
      const curUser = useAuthStore.getState().user;
      useGameStore.setState({
        roomCode,
        roomId: id,
        status: 'waiting',
        hostId: String(curUser?.id ?? ''),
        players: curUser ? [{ id: String(curUser.id), nickname: curUser.nickname || '' }] : [],
        readyPlayerIds: curUser ? [String(curUser.id)] : [], // 房主默认已准备
        scores: {},
      });
    }
    navigate(`/room/${id}?roomCode=${roomCode ?? ''}`);
  };

  // ============================================================
  // handleJoined — 加入房间成功后的回调
  // 使用 joinRoom API 返回的房间数据填充 store
  // ============================================================
  const handleJoined = (code: string, roomData?: CreateRoomResponse) => {
    if (roomData?.room) {
      const room = roomData.room;
      // 用 API 返回的完整房间数据初始化 store
      useGameStore.setState({
        roomCode: code,
        roomId: String(room.id),
        status: 'waiting',
        hostId: String(room.host.id),               // 从 API 获取房主 ID
        players: [
          { id: String(room.host.id), nickname: room.host.nickname },  // 房主信息
        ],
        readyPlayerIds: [String(room.host.id)],     // 房主默认已准备
        scores: {},
      });
    }
    navigate(`/room/${code}?joinWithCode=true`);
  };

  return (
    <div className="page-bg">
      {/* ---- 顶部导航栏 ---- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 animate-slide-down">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-sky-500 rounded-xl flex items-center justify-center">
            <span className="text-base">⚔️</span>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent">
            LingoArena
          </h1>
        </div>

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
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900">
            欢迎来到竞技场 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">创建或加入房间，开始你的单词对战</p>
        </div>

        {/* 操作面板：创建房间 + 加入房间 */}
        <div className="space-y-6 animate-slide-up">
          <CreateRoomPanel onCreated={handleCreated} />
          <JoinRoomPanel initialCode={roomCodeFromUrl} onJoined={handleJoined} />
        </div>
      </main>
    </div>
  );
}
