interface Props {
  isWinner: boolean;
  nickname: string;
}

export function WinnerBanner({ isWinner, nickname }: Props) {
  return (
    <div className={`text-center py-10 rounded-2xl relative overflow-hidden ${
      isWinner
        ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500'
        : 'bg-gradient-to-br from-gray-400 to-gray-500'
    }`}>
      {/* Decorative elements */}
      {isWinner && (
        <>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-8 text-3xl animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute top-6 right-8 text-3xl animate-bounce" style={{ animationDelay: '0.15s' }}>✨</div>
            <div className="absolute bottom-4 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎉</div>
            <div className="absolute bottom-4 right-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.45s' }}>🎉</div>
          </div>
        </>
      )}

      <div className="relative z-10">
        <p className="text-5xl mb-3">{isWinner ? '🏆' : '💪'}</p>
        <h2 className="text-3xl font-bold text-white">{isWinner ? '你赢了！' : '很遗憾，你输了'}</h2>
        <p className="text-white/80 mt-2">{nickname}</p>
      </div>
    </div>
  );
}
