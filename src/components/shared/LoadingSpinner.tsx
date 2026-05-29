interface LoadingSpinnerProps { size?: 'sm' | 'md'; }

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-5 h-5 border-2' : 'w-8 h-8 border-4';
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-violet-200 border-t-violet-600 rounded-full animate-spin`} />
    </div>
  );
}
