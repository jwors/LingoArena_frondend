import { useState, useEffect } from 'react';
import { joinRoom, type CreateRoomResponse } from '../../api/room';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

interface Props { onJoined: (roomCode: string, roomData?: CreateRoomResponse) => void; initialCode?: string; }

export function JoinRoomPanel({ onJoined, initialCode = '' }: Props) {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) { showToast('请输入房间码', 'error'); return; }
    setLoading(true);
    try {
      const res = await joinRoom({ room_code: code.trim() });
      showToast('加入房间成功', 'success');
      onJoined(code.trim(), res.data);
    } catch { showToast('加入房间失败，请检查房间码', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-lg">🚪</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">加入房间</h3>
          <p className="text-sm text-gray-500">输入好友提供的房间码</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">房间码</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6}
            className="input-field text-center text-lg tracking-widest font-mono" placeholder="ABC123" />
        </div>
        <button onClick={handleJoin} disabled={loading || code.length < 4}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-xl
                     hover:bg-emerald-700 hover:shadow-lg
                     transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center
                     active:scale-[0.98]">
          {loading ? <LoadingSpinner size="sm" /> : '加入房间'}
        </button>
      </div>
    </div>
  );
}
