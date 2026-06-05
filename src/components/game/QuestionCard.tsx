// ============================================================
// QuestionCard — 题目卡片组件
// 显示：当前回合数、中文提示词、操作提示
// 渐变背景 + 装饰圆，视觉聚焦
// ============================================================

interface Props {
  chinese: string;  // 中文提示词（需要翻译成英文）
  round: number;    // 当前第几题
}

export function QuestionCard({ chinese, round }: Props) {
  return (
    <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-sky-500 rounded-2xl p-6 text-center text-white shadow-lg relative overflow-hidden">
      {/* 装饰性背景圆 */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10">
        {/* 回合数 */}
        <p className="text-xs text-white/60 mb-3 font-medium">第 {round} 题</p>
        {/* 中文提示词（大号醒目） */}
        <p className="text-3xl font-bold mb-3">{chinese}</p>
        {/* 操作提示 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-lg text-sm text-white/80 backdrop-blur-sm">
          <span>⌨️</span>
          <span>请输入对应的英文单词</span>
        </div>
      </div>
    </div>
  );
}
