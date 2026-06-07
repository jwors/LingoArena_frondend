// ============================================================
// GameRoomPage — 游戏主页面
// 根据 gameStatus 切换三种视图：
//   waiting  → WaitingLobby（等待区）
//   playing  → 答题界面（题目卡 + 输入框 + 反馈）
//   finished → 结果展示（比分 + 统计 + 返回按钮）
// ============================================================
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
  // ---- 从 URL 获取路由参数 ----
  const { id: param } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 参数解构（注意：这些不是 hooks，必须在所有 hooks 之前声明）
  const joinWithCode = searchParams.get('joinWithCode') === 'true';  // true=通过房间码加入
  const roomCodeFromParams = searchParams.get('roomCode') || undefined; // URL 中的房间码
  const roomIdByParam = joinWithCode ? undefined : param;       // 房主: roomId 取自 URL
  const roomCodeByParam = joinWithCode ? param : roomCodeFromParams;  // 游客: roomCode 取自 URL

  // ============================================================
  // Store 状态订阅（必须无条件声明，遵守 React Hooks 规则）
  // ============================================================
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
  const roomClosed = useGameStore((s) => s.roomClosed);
  const resetToWaiting = useGameStore((s) => s.resetToWaiting);
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);
  const send = useWSStore((s) => s.send);

  // ============================================================
  // 状态兜底 useEffect
  // 刷新页面或从大厅创建/加入房间后，从 URL 恢复 store 状态
  // ============================================================
  useEffect(() => {
    const curStatus = useGameStore.getState().status;
    if (curStatus === 'waiting') return;  // store 已有数据，跳过

    const rc = roomCodeFromParams || (joinWithCode ? param : null);
    if (rc && param) {
      const curUser = useAuthStore.getState().user;
      const selfPlayer = curUser ? { id: String(curUser.id), nickname: curUser.nickname || '' } : null;
      // joinWithCode=true → 游客通过房间码加入（直接访问链接/刷新页面）
      // joinWithCode=false → 房主（roomId 在 URL 路径中）
      useGameStore.getState().setRoom(
        joinWithCode ? '' : param,          // 游客无 roomId，等 WS 填充
        selfPlayer ? [selfPlayer] : [],
        { name: '', label: '', emoji: '📘', color: 'blue' },  // 占位，WS room:joined 会覆盖
        joinWithCode ? null : String(curUser?.id ?? ''),       // 房主已知，游客未知
        joinWithCode ? param : rc,           // 游客：roomCode=path param；房主：roomCode=URL query
      );
    }
  }, []);

  // ============================================================
  // 未登录 → 跳转登录页
  // ============================================================
  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  // ============================================================
  // WebSocket 连接：页面挂载时连接，卸载时断开并重置状态
  // ============================================================
  useEffect(() => {
    if (!token || !param) return;
    connect(token, roomIdByParam, roomCodeByParam);
    return () => {
      disconnect();
      reset();
    };
  }, [token, param]);

  // ============================================================
  // 房间被关闭 → 跳转回大厅
  // ============================================================
  useEffect(() => {
    if (roomClosed) navigate('/lobby', { replace: true });
  }, [roomClosed, navigate]);

  // ============================================================
  // 条件渲染（所有 hooks 之后，return 之前 OK）
  // ============================================================
  if (!isAuthenticated()) return null;
  if (!param) return <div className="page-bg p-8 text-center">无效的房间</div>;

  // ---- 计算当前玩家和对手信息 ----
  const myId = String(user?.id || '');
  const myNickname = user?.nickname || '';
  const opponent = players.find((p) => p.id !== myId) || players[0] || null;
  const myScore = scores[myId] || 0;
  const oppScore = opponent ? (scores[opponent.id] || 0) : 0;

  // ---- WebSocket 发送函数 ----
  const handleReady = (ready: boolean) => send('player:ready', { roomId: param!, ready });
  const handleStartGame = () => send('game:start', { roomId: param! });

  // 游戏结束 → 返回等待区
  const handleBackToWaiting = useCallback(() => {
    resetToWaiting();
  }, [resetToWaiting]);

  return (
    <div className="page-bg">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4 relative z-10 animate-fade-in">
        {/*
         * GameHeader — 顶栏
         * 显示：玩家昵称、词库、倒计时、对手状态、回合指示
         */}
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

        {/*
         * ScoreBoard — 计分板
         * 双方比分，先到 5 分胜
         */}
        <ScoreBoard myScore={myScore} opponentScore={oppScore} />

        {/* ================================================================
            视图 1: 游戏结束（finished）
            ================================================================ */}
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
                      <span className="absolute -top-2 -right-2 text-2xl drop-shadow-lg">★</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{myNickname || '我'}</p>
                    <p className="text-xs text-gray-400">{hostId === myId ? '房主' : '游客'} · 你</p>
                  </div>
                  <p className="text-3xl font-bold text-violet-600 tabular-nums">{gameEndData.scores[myId] ?? 0}</p>
                </div>

                {/* 分隔符 */}
                <span className="text-gray-300 text-2xl font-bold">:</span>

                {/* 对手 */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
                      {opponent?.nickname?.[0] || '?'}
                    </div>
                    {gameEndData.winner === opponent?.id && (
                      <span className="absolute -top-2 -right-2 text-2xl drop-shadow-lg">★</span>
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

            {/* 详细统计表格 */}
            <StatsTable
              myNickname={myNickname}
              oppNickname={opponent?.nickname || '对手'}
              myStats={gameEndData.stats[myId]}
              oppStats={gameEndData.stats[opponent?.id ?? '']}
            />

            {/* 返回房间按钮 */}
            <button
              onClick={handleBackToWaiting}
              className="w-full bg-violet-600 text-white py-3 rounded-xl
                         hover:bg-violet-700 hover:shadow-lg
                         transition-all duration-200 font-medium
                         active:scale-[0.98]"
            >
              返回房间
            </button>
          </div>
        )}

        {/*
         * 房间码卡片（精简模式）
         * status 为 'waiting' 时不显示（由下方完整 WaitingLobby 显示）
         */}
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

        {/* ================================================================
            视图 2: 等待区（waiting）
            ================================================================ */}
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

        {/* ================================================================
            视图 3: 游戏中（playing）
            ================================================================ */}
        {gameStatus === 'playing' && currentQuestion && (
          <>
            {/* 题目卡片：显示中文提示词 */}
            <QuestionCard chinese={currentQuestion.chinese} round={currentQuestion.round} />
            {/* 答题结果反馈：对/错 + 正确答案 */}
            <ResultFeedback result={result} />
            {/* 答案输入框 */}
            <AnswerForm roomId={param!} gameMode={gameMode} />
          </>
        )}

        {/* 游戏进行中但题目尚未加载：显示加载状态 */}
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
