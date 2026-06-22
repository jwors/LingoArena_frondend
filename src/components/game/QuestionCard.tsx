// ============================================================
// QuestionCard — 题目卡片组件
// 显示：当前回合数、中文提示词
// ============================================================

interface Props {
  chinese: string;
  round: number;
}

export function QuestionCard({ chinese, round }: Props) {
  return (
    <div className="card border-t-4 border-t-violet-600 text-center">
      <p className="text-xs text-gray-400 mb-2 font-medium tracking-wide uppercase">
        第 {round} 题
      </p>
      <p className="text-3xl font-semibold text-gray-900 mb-2">{chinese}</p>
      <p className="text-sm text-gray-500">输入对应的英文单词</p>
    </div>
  );
}
