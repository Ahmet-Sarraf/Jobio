'use client';

import { useToastStore, Toast } from '@/store/useToastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BrutalToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => {
        const typeStyles = {
          success: {
            bg: 'bg-green-300',
            icon: <CheckCircle className="h-5 w-5 shrink-0" strokeWidth={2.5} />,
          },
          error: {
            bg: 'bg-brutal-pink',
            icon: <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={2.5} />,
          },
          info: {
            bg: 'bg-brutal-yellow',
            icon: <Info className="h-5 w-5 shrink-0" strokeWidth={2.5} />,
          },
        };

        const currentStyle = typeStyles[toast.type] || typeStyles.info;

        // Visual stack overlay effect using simple CSS transforms based on index
        const stackOffset = toasts.length - 1 - index;
        const transformStyle = {
          transform: `translateY(${-stackOffset * 8}px) scale(${1 - stackOffset * 0.03})`,
          zIndex: index,
        };

        return (
          <div
            key={toast.id}
            style={transformStyle}
            className={`pointer-events-auto flex items-center justify-between border-[3px] border-black p-4 shadow-brutal-sm transition-all duration-300 animate-in slide-in-from-bottom-5 font-black uppercase text-sm ${currentStyle.bg} text-black w-full hover:translate-y-[-2px]`}
          >
            <div className="flex items-center gap-3">
              {currentStyle.icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 p-1 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors duration-150 shadow-brutal-sm"
            >
              <X className="h-3 w-3" strokeWidth={3} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
