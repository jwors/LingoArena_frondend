import type { AnswerResult } from '../../types';

interface Props { result: AnswerResult | null; }

export function ResultFeedback({ result }: Props) {
  if (!result) return null;
  return (
    <div className={`text-center py-3 rounded-xl font-medium animate-bounce-subtle ${
      result.correct
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    }`}>
      <span className="text-lg mr-1">{result.correct ? '✓' : '✗'}</span>
      {result.correct ? '正确！' : '错误'}
      {result.answer && !result.correct && (
        <span className="ml-2 text-sm opacity-80">正确答案: {result.answer}</span>
      )}
    </div>
  );
}
