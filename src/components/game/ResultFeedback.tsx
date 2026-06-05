// ============================================================
// ResultFeedback — 答题结果反馈组件
// 正确 → 绿色提示 "✓ 正确！"
// 错误 → 红色提示 "✗ 错误" + 显示正确答案
// result 为 null 时不渲染（没有反馈需要显示）
// ============================================================
import type { AnswerResult } from '../../types';

interface Props {
  result: AnswerResult | null;  // 答题结果（null=无结果，不显示）
}

export function ResultFeedback({ result }: Props) {
  // 没有答题结果 → 不渲染任何内容
  if (!result) return null;

  return (
    <div className={`text-center py-3 rounded-xl font-medium animate-bounce-subtle ${
      result.correct
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'   // 正确：绿色
        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'           // 错误：红色
    }`}>
      <span className="text-lg mr-1">{result.correct ? '✓' : '✗'}</span>
      {result.correct ? '正确！' : '错误'}
      {/* 答错时显示正确答案 */}
      {result.answer && !result.correct && (
        <span className="ml-2 text-sm opacity-80">正确答案: {result.answer}</span>
      )}
    </div>
  );
}
