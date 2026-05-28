import type { AnswerResult } from '../../types';

interface Props { result: AnswerResult | null; }

export function ResultFeedback({ result }: Props) {
  if (!result) return null;
  return (
    <div className={`text-center py-3 rounded-xl font-medium ${result.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {result.correct ? '✓ 正确！' : '✗ 错误'}
    </div>
  );
}
