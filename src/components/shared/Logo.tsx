interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const SIZES = {
  sm: { box: 'w-7 h-7', text: 'text-base', gap: 'gap-2' },
  md: { box: 'w-9 h-9', text: 'text-lg', gap: 'gap-2.5' },
  lg: { box: 'w-12 h-12', text: 'text-2xl', gap: 'gap-3' },
} as const;

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = SIZES[size];

  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      <div className={`${s.box} bg-violet-600 rounded-lg flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" fill="none" aria-hidden="true">
          <path
            d="M7 6h10v2.5H11.5V18H7V6z"
            fill="white"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${s.text} font-semibold text-gray-900 tracking-tight`}>
          LingoArena
        </span>
      )}
    </div>
  );
}
