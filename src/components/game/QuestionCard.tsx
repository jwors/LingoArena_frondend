interface Props { chinese: string; round: number; }

export function QuestionCard({ chinese, round }: Props) {
  return (
    <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-sky-500 rounded-2xl p-6 text-center text-white shadow-lg relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <p className="text-xs text-white/60 mb-3 font-medium">第 {round} 题</p>
        <p className="text-3xl font-bold mb-3">{chinese}</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-lg text-sm text-white/80 backdrop-blur-sm">
          <span>⌨️</span>
          <span>请输入对应的英文单词</span>
        </div>
      </div>
    </div>
  );
}
