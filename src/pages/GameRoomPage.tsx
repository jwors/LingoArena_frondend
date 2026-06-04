import { useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useWSStore } from '../stores/wsStore';
import { GameHeader } from '../components/game/GameHeader';
import { ScoreBoard } from '../components/game/ScoreBoard';
import { QuestionCard } from '../components/game/QuestionCard';
import { AnswerForm } from '../components/game/AnswerForm';
import { ResultFeedback } from '../components/game/ResultFeedback';
import { WaitingLobby } from '../components/game/WaitingLobby';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { StatsTable } from '../components/results/StatsTable';

export default function GameRoomPage() {
  const { id: param } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL params（必须在所有 hooks 之前，不是 hook）
  const joinWithCode = searchParams.get('joinWithCode') === 'true';
  const roomCodeFromParams = searchParams.get('roomCode') || undefined;
  const roomIdByParam = joinWithCode ? undefined : param;
  const roomCodeByParam = joinWithCode ? param : roomCodeFromParams;

  // --- 所有 hooks 必须无条件声明（React Rules of Hooks）---
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const gameStatus = useGameStore((s) => s.status);
  const gameEndData = useGameStore((s) => s.gameEndData);
  const players = useGameStore((s) => s.players);
  const scores = useGameStore((s) => s.scores);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const timeLeft = useGameStore((s) => s.timeLeft);
  const wordBook = useGameStore((s) => s.wordBook);
  const result = useGameStore((s) => s.result);
  const opponentStatus = useGameStore((s) => s.opponentStatus);
  const gameMode = useGameStore((s) => s.gameMode);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const reset = useGameStore((s) => s.reset);
  const readyPlayerIds = useGameStore((s) => s.readyPlayerIds);
  const hostId = useGameStore((s) => s.hostId);
  const roomCode = useGameStore((s) => s.roomCode);
  const resetToWaiting = useGameStore((s) => s.resetToWaiting);
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);
  const send = useWSStore((s) => s.send);

  // 状态兜底: 创建房间后或刷新后恢复 store 状态
  useEffect(() => {
    const curStatus = useGameStore.getState().status;
    if (curStatus === 'waiting') return;
    // 创建房间: roomCode 来自 URL ?roomCode= 参数
    // 加入房间: param 本身就是 roomCode
    const rc = roomCodeFromParams || (joinWithCode ? param : null);
    if (rc && param) {
      const curUser = useAuthStore.getState().user;
      useGameStore.setState({
        roomCode: rc,
        roomId: joinWithCode ? undefined : param,
        status: 'waiting',
        hostId: String(curUser?.id ?? ''),
        players: curUser ? [{ id: String(curUser.id), nickname: curUser.nickname || '' }] : [],
        scores: {},
      });
    }
  }, []);

  // 未登录则跳转
  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  // WebSocket 连接
  useEffect(() => {
    if (!token || !param) return;
    connect(token, roomIdByParam, roomCodeByParam);
    return () => {
      disconnect();
      reset();
    };
  }, [token, param]);

  // --- 条件返回（hooks 之后 OK）---
  if (!isAuthenticated()) return null;
  if (!param) return <div className="page-bg p-8 text-center">无效的房间</div>;

  const myId = String(user?.id || '');
  const myNickname = user?.nickname || '';
  const opponent = players.find((p) => p.id !== myId) || players[0] || null;
  const myScore = scores[myId] || 0;
  const oppScore = opponent ? (scores[opponent.id] || 0) : 0;

  const handleReady = () => send('player:ready', { roomId: param! });
  const handleStartGame = () => send('game:start', { roomId: param! });
  const handleBackToWaiting = useCallback(() => {
    resetToWaiting();
  }, [resetToWaiting]);
  console.log(gameStatus)
  console.log(roomCode)
  return (
    <div className="page-bg">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4 relative z-10 animate-fade-in">
        <GameHeader
          myNickname={myNickname}
          myId={myId}
          hostId={hostId}
          opponent={opponent}
          wordBook={wordBook}
          timeLeft={timeLeft}
          opponentStatus={opponentStatus}
          gameMode={gameMode}
          currentTurnPlayerId={currentTurnPlayerId}
        />
        <ScoreBoard myScore={myScore} opponentScore={oppScore} />

        {/* 游戏结束：显示结果，不跳转页面 */}
        {gameStatus === 'finished' && gameEndData && (
          <div className="space-y-4 animate-fade-in">
            {/* 双方积分 + 胜者皇冠 */}
            <div className="card text-center">
              <h3 className="text-sm font-medium text-gray-400 mb-4">游戏结束</h3>
              <div className="flex items-center justify-center gap-6">
                {/* 我方 */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
                      {myNickname?.[0] || '?'}
                    </div>
                    {gameEndData.winner === myId && (
                      <span className="absolute -top-2 -right-2 text-2xl drop-shadow-lg">👑</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{myNickname || '我'}</p>
                    <p className="text-xs text-gray-400">{hostId === myId ? '房主' : '游客'} · 你</p>
                  </div>
                  <p className="text-3xl font-bold text-violet-600 tabular-nums">{gameEndData.scores[myId] ?? 0}</p>
                </div>

                {/* 分隔 */}
                <span className="text-gray-300 text-2xl font-bold">:</span>

                {/* 对手 */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
                      {opponent?.nickname?.[0] || '?'}
                    </div>
                    {gameEndData.winner === opponent?.id && (
                      <span className="absolute -top-2 -right-2 text-2xl drop-shadow-lg">👑</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opponent?.nickname || '对手'}</p>
                    <p className="text-xs text-gray-400">
                      {hostId && opponent ? (hostId === opponent.id ? '房主' : '游客') : ''}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-rose-500 tabular-nums">{gameEndData.scores[opponent?.id ?? ''] ?? 0}</p>
                </div>
              </div>
            </div>

            <StatsTable
              myNickname={myNickname}
              oppNickname={opponent?.nickname || '对手'}
              myStats={gameEndData.stats[myId]}
              oppStats={gameEndData.stats[opponent?.id ?? '']}
            />
            <button
              onClick={handleBackToWaiting}
              className="w-full bg-violet-600 text-white py-3 rounded-xl
                         hover:bg-violet-700 hover:shadow-lg
                         transition-all duration-200 font-medium
                         active:scale-[0.98]"
            >
              🔄 返回房间
            </button>
          </div>
        )}

        {/* 房间码卡片：status 还没变为 waiting 时显示 */}
        {roomCode && gameStatus !== 'waiting' && gameStatus !== 'finished' && (
          <WaitingLobby
            players={players}
            myId={myId}
            hostId={hostId}
            readyPlayerIds={readyPlayerIds}
            roomCode={roomCode}
            isHost={!joinWithCode}
            onReady={handleReady}
            onStartGame={handleStartGame}
            minimal
          />
        )}
        {gameStatus === 'waiting' && (
          <WaitingLobby
            players={players}
            myId={myId}
            hostId={hostId}
            readyPlayerIds={readyPlayerIds}
            roomCode={roomCode}
            isHost={!joinWithCode}
            onReady={handleReady}
            onStartGame={handleStartGame}
          />
        )}
        {gameStatus === 'playing' && currentQuestion && (
          <>
            <QuestionCard chinese={currentQuestion.chinese} round={currentQuestion.round} />
            <ResultFeedback result={result} />
            <AnswerForm roomId={param!} gameMode={gameMode} />
          </>
        )}
        {gameStatus === 'playing' && !currentQuestion && (
          <div className="text-center py-12 animate-fade-in">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">等待下一题...</p>
          </div>
        )}
      </main>
    </div>
  );
}
