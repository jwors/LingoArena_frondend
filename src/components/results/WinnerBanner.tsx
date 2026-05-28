interface Props {
  isWinner: boolean;
  nickname: string;
}

export function WinnerBanner({ isWinner, nickname }: Props) {
  return (
    <div className={`text-center py-8 rounded-2xl ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
      <p className="text-4xl mb-2">{isWinner ? '🏆' : '💪'}</p>
      <h2 className="text-2xl font-bold text-white">{isWinner ? '你赢了！' : '很遗憾，你输了'}</h2>
      <p className="text-white/80 mt-1">{nickname}</p>
    </div>
  );
}
