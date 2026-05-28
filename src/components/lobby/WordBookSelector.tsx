import { WORD_BOOKS } from '../../types';
import type { WordBook } from '../../types';

interface Props { selected: string; onChange: (wb: WordBook) => void; }

export function WordBookSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {WORD_BOOKS.map((wb) => (
        <button key={wb.name} type="button" onClick={() => onChange(wb)}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors text-sm ${
            selected === wb.name ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
          <span className="text-xl">{wb.emoji}</span>
          <span className="font-medium">{wb.label}</span>
        </button>
      ))}
    </div>
  );
}
