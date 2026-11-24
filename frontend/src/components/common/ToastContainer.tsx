import React, { useEffect, useState } from 'react';
import { toast, ToastItem } from '../../utils/toast';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastItemProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastItemProps> = ({ item, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!item.duration || item.duration <= 0) return;

    const intervalTime = 50;
    const step = (intervalTime / item.duration) * 100;

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(interval);
            onDismiss(item.id);
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [item, isPaused, onDismiss]);

  const config = {
    error: {
      bg: 'bg-white border-rose-200 shadow-rose-900/10',
      badgeBg: 'bg-rose-50 text-rose-600',
      msgColor: 'text-rose-900',
      accentBorder: 'border-l-4 border-l-rose-500',
      progressColor: 'bg-rose-500',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-white border-amber-200 shadow-amber-900/10',
      badgeBg: 'bg-amber-50 text-amber-600',
      msgColor: 'text-amber-900',
      accentBorder: 'border-l-4 border-l-amber-500',
      progressColor: 'bg-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    success: {
      bg: 'bg-white border-emerald-200 shadow-emerald-900/10',
      badgeBg: 'bg-emerald-50 text-emerald-600',
      msgColor: 'text-emerald-900',
      accentBorder: 'border-l-4 border-l-emerald-500',
      progressColor: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    info: {
      bg: 'bg-white border-blue-200 shadow-blue-900/10',
      badgeBg: 'bg-blue-50 text-blue-600',
      msgColor: 'text-blue-900',
      accentBorder: 'border-l-4 border-l-blue-500',
      progressColor: 'bg-blue-500',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  }[item.type];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.bg} ${config.accentBorder} shadow-lg transition-all duration-300 ease-out transform translate-y-0 opacity-100 hover:shadow-xl`}
      role="alert"
    >
      <div className="p-3 sm:p-3.5 flex items-center gap-3">
        {/* Biểu tượng */}
        <div className={`p-1.5 rounded-lg ${config.badgeBg} shrink-0`}>
          {config.icon}
        </div>

        {/* Nội dung thông báo chỉ hiển thị message */}
        <div className="flex-1 min-w-0 pr-1">
          <p className={`text-sm ${config.msgColor} font-semibold leading-relaxed break-words`}>
            {item.message}
          </p>
        </div>

        {/* Nút đóng */}
        <button
          onClick={() => onDismiss(item.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Thanh đo thời gian đếm ngược */}
      {item.duration && item.duration > 0 && (
        <div className="w-full bg-slate-100 h-1">
          <div
            className={`h-full ${config.progressColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-4 right-4 z-[99999] pointer-events-none flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-3 sm:px-0"
    >
      {toasts.map((item) => (
        <ToastCard
          key={item.id}
          item={item}
          onDismiss={(id) => toast.dismiss(id)}
        />
      ))}
    </div>
  );
};
