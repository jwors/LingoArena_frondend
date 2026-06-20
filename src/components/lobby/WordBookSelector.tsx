import type { WordBook } from '../../types';

interface Props {
  wordbooks: WordBook[];
  selectedId: number | null;
  loading?: boolean;
  onChange: (wb: WordBook) => void;
}

export function WordBookSelector({ wordbooks, selectedId, loading, onChange }: Props) {
  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-4">加载词库中...</p>;
  }

  if (wordbooks.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">暂无可用词库</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {wordbooks.map((wb) => (
        <button
          key={wb.id ?? wb.name}
          type="button"
          onClick={() => onChange(wb)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors duration-150 text-sm ${
            selectedId === wb.id
              ? 'border-violet-600 bg-violet-50 text-violet-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
        >
          <span className="text-xl">{wb.emoji}</span>
          <span className="font-medium text-center leading-tight">{wb.label}</span>
          {wb.level && (
            <span className="text-xs text-gray-400">{wb.level}</span>
          )}
        </button>
      ))}
    </div>
  );
}
