interface Props {
  myScore: number;
  opponentScore: number;
  myNickname: string;
  oppNickname: string;
}

export function ScoreSummary({ myScore, opponentScore, myNickname, oppNickname }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">最终比分</h3>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">{myNickname}</p>
          <p className="text-3xl font-bold text-indigo-600">{myScore}</p>
        </div>
        <span className="text-gray-300 text-xl">:</span>
        <div className="text-center">
          <p className="text-sm text-gray-500">{oppNickname}</p>
          <p className="text-3xl font-bold text-red-500">{opponentScore}</p>
        </div>
      </div>
    </div>
  );
}
