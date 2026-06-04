import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { CreateRoomPanel } from '../components/lobby/CreateRoomPanel';
import { JoinRoomPanel } from '../components/lobby/JoinRoomPanel';
import { showToast } from '../components/shared/Toast';
import { useEffect } from 'react';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  useWebSocket();

  // 从分享链接进入时，自动填充房间码
  const roomCodeFromUrl = searchParams.get('roomCode') || '';

  useEffect(() => {
    if (roomCodeFromUrl) {
      showToast('已填充房间码，点击加入房间', 'info');
    }
  }, [roomCodeFromUrl]);

  if (!token) { navigate('/login', { replace: true }); return null; }

  const handleCreated = (id: string, roomCode?: string) => {
    // 在导航前先设置 store，确保 GameRoomPage 挂载时已有状态
    if (roomCode) {
      const curUser = useAuthStore.getState().user;
      useGameStore.setState({
        roomCode,
        roomId: id,
        status: 'waiting',
        hostId: String(curUser?.id ?? ''),
        players: curUser ? [{ id: String(curUser.id), nickname: curUser.nickname || '' }] : [],
        scores: {},
      });
    }
    navigate(`/room/${id}?roomCode=${roomCode ?? ''}`);
  };

  const handleJoined = (code: string) => {
    navigate(`/room/${code}?joinWithCode=true`);
  };

  return (
    <div className="page-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-sky-500 rounded-xl flex items-center justify-center">
            <span className="text-base">⚔️</span>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent">
            LingoArena
          </h1>
        </div>
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

      {/* Main */}
      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900">
            欢迎来到竞技场 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">创建或加入房间，开始你的单词对战</p>
        </div>

        <div className="space-y-6 animate-slide-up">
          <CreateRoomPanel onCreated={handleCreated} />
          <JoinRoomPanel initialCode={roomCodeFromUrl} onJoined={handleJoined} />
        </div>
      </main>
    </div>
  );
}
