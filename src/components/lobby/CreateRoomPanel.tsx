import { useState } from 'react';
import { createRoom } from '../../api/room';
import { WordBookSelector } from './WordBookSelector';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';
import type { GameMode } from '../../types';

interface Props { onCreated: (roomId: string) => void; }

export function CreateRoomPanel({ onCreated }: Props) {
  const [selectedBook, setSelectedBook] = useState('cet4');
  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('rush');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await createRoom({ wordBook: selectedBook, name: roomName || undefined, mode: gameMode });
      showToast('房间创建成功', 'success');
      onCreated(data.id);
    } catch { showToast('创建房间失败', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">创建房间</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择词库</label>
        <WordBookSelector selected={selectedBook} onChange={(wb) => setSelectedBook(wb.name)} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">游戏模式</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setGameMode('rush')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors text-sm ${
              gameMode === 'rush' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="text-xl">⚡</span>
            <span className="font-medium">抢答制</span>
            <span className="text-xs text-gray-400">先答对先得分</span>
          </button>
          <button type="button" onClick={() => setGameMode('turn')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors text-sm ${
              gameMode === 'turn' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="text-xl">🔄</span>
            <span className="font-medium">回合制</span>
            <span className="text-xs text-gray-400">轮流答题</span>
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">房间名称（可选）</label>
        <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="留空使用默认名称" />
      </div>
      <button onClick={handleCreate} disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center">
        {loading ? <LoadingSpinner /> : '创建房间'}
      </button>
    </div>
  );
}
