import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { CreateRoomPanel } from '../components/lobby/CreateRoomPanel';
import { JoinRoomPanel } from '../components/lobby/JoinRoomPanel';
import { showToast } from '../components/shared/Toast';

export default function LobbyPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  useWebSocket();

  if (!token) { navigate('/login', { replace: true }); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">LingoArena</h1>
        <button onClick={() => { logout(); navigate('/login'); showToast('已退出登录', 'info'); }}
          className="text-sm text-gray-500 hover:text-gray-700">退出登录</button>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <CreateRoomPanel onCreated={(id) => navigate(`/room/${id}`)} />
        <JoinRoomPanel onJoined={(id) => navigate(`/room/${id}`)} />
      </main>
    </div>
  );
}
