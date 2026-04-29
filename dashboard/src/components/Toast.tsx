import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration = 5000) => {
    const id = `toast-${Date.now()}-${toastIdCounter++}`;
    const newToast: Toast = { id, type, message, title, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showToast('success', message, title);
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast('error', message, title, 8000); // Errors stay longer
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast('warning', message, title);
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast('info', message, title);
  }, [showToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
    }
  };

  const getColorClasses = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'info': return 'text-blue-600';
    }
  };

  const getMessageColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-emerald-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-amber-800';
      case 'info': return 'text-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
        {toasts.map((toast) => {
          const Icon = getIcon(toast.type);
          const bgClass = getColorClasses(toast.type);
          const iconColor = getIconColor(toast.type);
          const messageColor = getMessageColor(toast.type);

          return (
            <div
              key={toast.id}
              className={`animate-slide-in flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border ${bgClass}`}
              style={{
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className={`font-semibold text-sm ${messageColor} mb-0.5`}>
                    {toast.title}
                  </p>
                )}
                <p className={`text-sm ${messageColor}`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded hover:bg-white/60 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
