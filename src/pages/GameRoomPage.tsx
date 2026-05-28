import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useWSStore } from '../stores/wsStore';
import { GameHeader } from '../components/game/GameHeader';
import { ScoreBoard } from '../components/game/ScoreBoard';
import { QuestionCard } from '../components/game/QuestionCard';
import { AnswerForm } from '../components/game/AnswerForm';
import { ResultFeedback } from '../components/game/ResultFeedback';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export default function GameRoomPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const connect = useWSStore((s) => s.connect);
  const disconnect = useWSStore((s) => s.disconnect);
  const send = useWSStore((s) => s.send);

  if (!isAuthenticated()) { navigate('/login', { replace: true }); return null; }

  useEffect(() => {
    if (!token || !roomId) return;
    connect(token, () => {
      send('room:join', { roomId });
      send('player:ready', { roomId });
    });
    return () => { disconnect(); reset(); };
  }, [token, roomId]);

  useEffect(() => {
    if (gameStatus === 'finished' && gameEndData) navigate('/results');
  }, [gameStatus, gameEndData, navigate]);

  if (!roomId) return <div className="p-8 text-center">无效的房间</div>;

  const myId = user?.id || '';
  const opponent = players.find((p) => p.id !== myId) || players[0] || null;
  const myScore = scores[myId] || 0;
  const oppScore = opponent ? (scores[opponent.id] || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <GameHeader opponent={opponent} wordBook={wordBook} timeLeft={timeLeft} opponentStatus={opponentStatus} gameMode={gameMode} currentTurnPlayerId={currentTurnPlayerId} myId={user?.id || ''} />
        <ScoreBoard myScore={myScore} opponentScore={oppScore} />
        {gameStatus === 'waiting' && (
          <div className="text-center py-12"><LoadingSpinner /><p className="text-gray-500 mt-4">等待对手加入...</p></div>
        )}
        {gameStatus === 'playing' && currentQuestion && (
          <>
            <QuestionCard chinese={currentQuestion.chinese} round={currentQuestion.round} />
            <ResultFeedback result={result} />
            <AnswerForm roomId={roomId} gameMode={gameMode} />
          </>
        )}
        {gameStatus === 'playing' && !currentQuestion && (
          <div className="text-center py-12"><LoadingSpinner /><p className="text-gray-500 mt-4">等待下一题...</p></div>
        )}
      </main>
    </div>
  );
}
