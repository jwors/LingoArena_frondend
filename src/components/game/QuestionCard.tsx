interface Props { chinese: string; round: number; }

export function QuestionCard({ chinese, round }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg">
      <p className="text-xs text-indigo-200 mb-2">第 {round} 题</p>
      <p className="text-2xl font-bold">{chinese}</p>
      <p className="text-sm text-indigo-200 mt-3">请输入对应的英文单词</p>
    </div>
  );
}
