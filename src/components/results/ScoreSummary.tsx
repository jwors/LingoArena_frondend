interface Props {
  myScore: number;
  opponentScore: number;
  myNickname: string;
  oppNickname: string;
}

export function ScoreSummary({ myScore, opponentScore, myNickname, oppNickname }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-400 mb-4 text-center">最终比分</h3>
      <div className="flex items-center justify-center gap-6">
        <div className="text-center flex-1">
          <p className="text-sm text-gray-500 mb-2">{myNickname}</p>
          <p className="text-4xl font-bold text-violet-600 tabular-nums">{myScore}</p>
        </div>
        <span className="text-gray-300 text-xl font-bold">:</span>
        <div className="text-center flex-1">
          <p className="text-sm text-gray-500 mb-2">{oppNickname}</p>
          <p className="text-4xl font-bold text-rose-500 tabular-nums">{opponentScore}</p>
        </div>
      </div>
    </div>
  );
}
