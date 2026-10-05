import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const bgColors = {
    info: 'bg-slate-900 text-white border-slate-700',
    success: 'bg-emerald-950 text-emerald-200 border-emerald-700',
    warning: 'bg-amber-950 text-amber-200 border-amber-700',
    error: 'bg-rose-950 text-rose-200 border-rose-700'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium ${bgColors[type]}`}>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};
