import { WORD_BOOKS } from '../../types';
import type { WordBook } from '../../types';

interface Props { selected: string; onChange: (wb: WordBook) => void; }

export function WordBookSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {WORD_BOOKS.map((wb) => (
        <button key={wb.name} type="button" onClick={() => onChange(wb)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-sm active:scale-[0.98] ${
            selected === wb.name
              ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
          <span className="text-xl">{wb.emoji}</span>
          <span className="font-medium">{wb.label}</span>
        </button>
      ))}
    </div>
  );
}
