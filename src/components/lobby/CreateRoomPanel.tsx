import { useState } from 'react';
import { createRoom } from '../../api/room';
import { WordBookSelector } from './WordBookSelector';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';
import type { GameMode } from '../../types';

interface Props { onCreated: (roomId: string, roomCode?: string, wordBookName?: string, gameMode?: GameMode) => void; }

export function CreateRoomPanel({ onCreated }: Props) {
  const [selectedBook, setSelectedBook] = useState('cet4');
  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('rush');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data: { room } } = await createRoom({ wordBook: selectedBook, name: roomName || undefined, mode: gameMode });
      showToast('房间创建成功', 'success');
      onCreated(String(room.id), room.room_code, selectedBook, gameMode);
    } catch { showToast('创建房间失败', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card">
      <div className="panel-header">
        <h3>创建房间</h3>
        <p>设置词库和模式，邀请好友来战</p>
      </div>

      <div className="space-y-4">
        {/* Word book */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择词库</label>
          <WordBookSelector selected={selectedBook} onChange={(wb) => setSelectedBook(wb.name)} />
        </div>

        {/* Game mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">游戏模式</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setGameMode('rush')}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-lg border transition-colors duration-150 text-sm ${
                gameMode === 'rush'
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
              <span className="font-medium">抢答制</span>
              <span className="text-xs text-gray-400">先答对先得分</span>
            </button>
            <button type="button" onClick={() => setGameMode('turn')}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-lg border transition-colors duration-150 text-sm ${
                gameMode === 'turn'
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
              <span className="font-medium">回合制</span>
              <span className="text-xs text-gray-400">轮流答题</span>
            </button>
          </div>
        </div>

        {/* Room name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">房间名称（可选）</label>
          <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
            className="input-field" placeholder="留空使用默认名称" />
        </div>

        <button onClick={handleCreate} disabled={loading} className="btn-primary">
          {loading ? <LoadingSpinner size="sm" /> : '创建房间'}
        </button>
      </div>
    </div>
  );
}
