import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { WinnerBanner } from '../components/results/WinnerBanner';
import { ScoreSummary } from '../components/results/ScoreSummary';
import { StatsTable } from '../components/results/StatsTable';
import { PlayAgainButton } from '../components/results/PlayAgainButton';

export default function ResultsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const gameEndData = useGameStore((s) => s.gameEndData);
  const players = useGameStore((s) => s.players);
  const reset = useGameStore((s) => s.reset);

  if (!isAuthenticated()) { navigate('/login', { replace: true }); return null; }

  useEffect(() => {
    if (!gameEndData) { navigate('/lobby', { replace: true }); }
    return () => reset();
  }, [gameEndData, navigate, reset]);

  if (!gameEndData) return null;

  const myId = String(user?.id ?? '');
  const opponent = players.find((p) => p.id !== myId) ?? { id: 'opponent', nickname: '对手' };
  const isWinner = gameEndData.winner === myId;
  const myScore = gameEndData.scores[myId] ?? 0;
  const oppScore = gameEndData.scores[opponent.id] ?? 0;
  const myName = user?.nickname || '你';

  return (
    <div className="page-bg">
      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <WinnerBanner isWinner={isWinner} nickname={myName} />
        <ScoreSummary myScore={myScore} opponentScore={oppScore} myNickname={myName} oppNickname={opponent.nickname} />
        <StatsTable myNickname={myName} oppNickname={opponent.nickname} myStats={gameEndData.stats[myId]} oppStats={gameEndData.stats[opponent.id]} />
        <PlayAgainButton />
      </main>
    </div>
  );
}
