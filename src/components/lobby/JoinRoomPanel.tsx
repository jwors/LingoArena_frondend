import { useState } from 'react';
import { joinRoom } from '../../api/room';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

interface Props { onJoined: (roomId: string) => void; }

export function JoinRoomPanel({ onJoined }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) { showToast('请输入房间码', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await joinRoom({ code: code.trim() });
      showToast('加入房间成功', 'success');
      onJoined(data.id);
    } catch { showToast('加入房间失败，请检查房间码', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">加入房间</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">房间码</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center text-lg tracking-widest font-mono" placeholder="ABC123" />
      </div>
      <button onClick={handleJoin} disabled={loading || code.length < 4}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center">
        {loading ? <LoadingSpinner /> : '加入房间'}
      </button>
    </div>
  );
}
