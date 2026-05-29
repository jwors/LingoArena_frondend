import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; type: ToastType; }

let toastId = 0;
let _toasts: ToastItem[] = [];
const listeners: Array<(t: ToastItem[]) => void> = [];

function emit() { listeners.forEach((l) => l([..._toasts])); }

export function showToast(message: string, type: ToastType = 'info') {
  const id = ++toastId;
  _toasts = [..._toasts, { id, message, type }];
  emit();
  setTimeout(() => { _toasts = _toasts.filter((t) => t.id !== id); emit(); }, 3000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.push(setToasts);
    return () => { const i = listeners.indexOf(setToasts); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}
          onClick={() => { _toasts = _toasts.filter((x) => x.id !== t.id); emit(); }}
          className={`px-4 py-2.5 rounded-xl text-white text-sm shadow-lg cursor-pointer
                     transition-all duration-200 animate-slide-down hover:shadow-xl ${
            t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-rose-500' : 'bg-violet-500'}`}>
          <span className="mr-1.5">{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
