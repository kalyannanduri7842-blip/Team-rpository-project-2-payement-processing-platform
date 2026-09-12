import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const success = (title: string, message?: string) => showToast('success', title, message);
  const error = (title: string, message?: string) => showToast('error', title, message);
  const warning = (title: string, message?: string) => showToast('warning', title, message);
  const info = (title: string, message?: string) => showToast('info', title, message);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          };

          const borderColors = {
            success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
            error: 'border-rose-500/30 bg-rose-950/90 text-rose-100',
            warning: 'border-amber-500/30 bg-amber-950/90 text-amber-100',
            info: 'border-sky-500/30 bg-sky-950/90 text-sky-100',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 transition-all animate-in slide-in-from-right duration-200 ${borderColors[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                {icons[toast.type]}
                <div>
                  <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
                  {toast.message && <p className="text-xs opacity-80 mt-1 leading-relaxed">{toast.message}</p>}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
