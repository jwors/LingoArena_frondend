import { useEffect, useMemo, useState } from 'react';
import { createRoom, getApiErrorMessage } from '../../api/room';
import { listWordbooks, toDisplayWordBook } from '../../api/wordbook';
import { WordBookSelector } from './WordBookSelector';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';
import type { GameMode, WordBook } from '../../types';

interface Props {
  onCreated: (roomId: string, roomCode: string, wordBook: WordBook, gameMode: GameMode) => void;
}

export function CreateRoomPanel({ onCreated }: Props) {
  const [selectedWordbookId, setSelectedWordbookId] = useState<number | null>(null);
  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('rush');
  const [loading, setLoading] = useState(false);
  const [wordbooksLoading, setWordbooksLoading] = useState(true);
  const [displayWordbooks, setDisplayWordbooks] = useState<WordBook[]>([]);

  useEffect(() => {
    setWordbooksLoading(true);
    listWordbooks()
      .then((list) => {
        const display = list.map(toDisplayWordBook);
        setDisplayWordbooks(display);
        if (display.length === 0) {
          showToast('暂无可用词库', 'error');
        } else {
          setSelectedWordbookId((prev) => prev ?? display[0].id ?? null);
        }
      })
      .catch(() => showToast('词库列表加载失败', 'error'))
      .finally(() => setWordbooksLoading(false));
  }, []);

  const selectedWordbook = useMemo(
    () => displayWordbooks.find((wb) => wb.id === selectedWordbookId) ?? null,
    [displayWordbooks, selectedWordbookId],
  );

  const handleCreate = async () => {
    if (!selectedWordbookId) {
      showToast('请先选择词库', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data: { room } } = await createRoom({
        wordbookId: selectedWordbookId,
        gameMode,
        totalRounds: 10,
      });
      void roomName; // 后端 CreateRoomRequest 暂无 name 字段

      if (!room.wordbookId) {
        showToast('房间创建异常：词库未绑定', 'error');
        return;
      }

      showToast('房间创建成功', 'success');
      const wordBook = selectedWordbook ?? toDisplayWordBook({
        id: room.wordbookId,
        name: room.wordbookName ?? '',
      });
      onCreated(String(room.id), room.roomCode, wordBook, room.gameMode);
    } catch (err) {
      showToast(getApiErrorMessage(err, '创建房间失败'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="panel-header">
        <h3>创建房间</h3>
        <p>设置词库和模式，邀请好友来战</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择词库</label>
          <WordBookSelector
            wordbooks={displayWordbooks}
            selectedId={selectedWordbookId}
            loading={wordbooksLoading}
            onChange={(wb) => setSelectedWordbookId(wb.id ?? null)}
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">房间名称（可选）</label>
          <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
            className="input-field" placeholder="留空使用默认名称" />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || wordbooksLoading || !selectedWordbookId}
          className="btn-primary"
        >
          {loading ? <LoadingSpinner size="sm" /> : '创建房间'}
        </button>
      </div>
    </div>
  );
}
