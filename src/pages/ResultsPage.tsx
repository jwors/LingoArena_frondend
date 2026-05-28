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
  const gameEndData = useGameStore((s) => s.gameEndData);
  const players = useGameStore((s) => s.players);
  const reset = useGameStore((s) => s.reset);

  if (!isAuthenticated()) {
    navigate('/login', { replace: true });
    return null;
  }

  useEffect(() => {
    if (!gameEndData) {
      navigate('/lobby', { replace: true });
    }
    return () => reset();
  }, [gameEndData, navigate, reset]);

  if (!gameEndData) return null;

  const opponent = players.length > 1 ? players[1] : players[0] || { nickname: '对手' };
  const isWinner = gameEndData.winner === (players[0]?.id || '');
  const myScore = gameEndData.scores[players[0]?.id || ''] ?? 0;
  const oppScore = gameEndData.scores[opponent.id] ?? 0;
  const myName = players[0]?.nickname || '你';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <WinnerBanner isWinner={isWinner} nickname={myName} />
        <ScoreSummary myScore={myScore} opponentScore={oppScore} myNickname={myName} oppNickname={opponent.nickname} />
        <StatsTable myNickname={myName} oppNickname={opponent.nickname} myStats={gameEndData.stats[players[0]?.id || '']} oppStats={gameEndData.stats[opponent.id]} />
        <PlayAgainButton />
      </main>
    </div>
  );
}
