interface Props {
  isWinner: boolean;
  nickname: string;
}

export function WinnerBanner({ isWinner, nickname }: Props) {
  return (
    <div className={`text-center py-10 rounded-xl ${
      isWinner ? 'bg-amber-500' : 'bg-gray-600'
    }`}>
      <h2 className="text-2xl font-bold text-white">
        {isWinner ? '你赢了' : '本局失败'}
      </h2>
      <p className="text-white/80 mt-2 text-sm">{nickname}</p>
    </div>
  );
}
