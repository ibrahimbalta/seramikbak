'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * SeramikBak Global Toast Notification Dispatcher
 * 
 * Usage examples:
 *   showToast('success', 'Katalog başarıyla kaydedildi!');
 *   showToast('error', 'Kaydetme işlemi başarısız oldu.');
 *   showToast('warning', 'Kaydedilmemiş değişiklikleriniz bulunuyor.');
 *   showToast('info', 'Bağlantı panoya kopyalandı.');
 * 
 * Or with options object:
 *   showToast({ type: 'success', message: 'Katalog yayınlandı!', title: 'Tebrikler', duration: 4000 });
 */
export function showToast(typeOrOptions, message, duration = 4000) {
  if (typeof window === 'undefined') return;

  let detail;
  if (typeof typeOrOptions === 'object' && typeOrOptions !== null) {
    detail = {
      type: typeOrOptions.type || 'info',
      message: typeOrOptions.message || '',
      title: typeOrOptions.title || null,
      duration: typeOrOptions.duration !== undefined ? typeOrOptions.duration : 4000
    };
  } else {
    detail = {
      type: typeOrOptions || 'info',
      message: message || '',
      title: null,
      duration: duration !== undefined ? duration : 4000
    };
  }

  window.dispatchEvent(new CustomEvent('seramikbak-toast', { detail }));
}

// Convenience helper aliases
showToast.success = (message, duration) => showToast('success', message, duration);
showToast.error = (message, duration) => showToast('error', message, duration);
showToast.warning = (message, duration) => showToast('warning', message, duration);
showToast.info = (message, duration) => showToast('info', message, duration);

const VARIANT_CONFIGS = {
  success: {
    icon: CheckCircle2,
    borderLeftClass: 'border-l-emerald-500',
    iconColorClass: 'text-emerald-500',
    iconBgClass: 'bg-emerald-50',
    progressBarClass: 'bg-emerald-500',
    defaultTitle: 'Başarılı'
  },
  error: {
    icon: AlertCircle,
    borderLeftClass: 'border-l-rose-500',
    iconColorClass: 'text-rose-500',
    iconBgClass: 'bg-rose-50',
    progressBarClass: 'bg-rose-500',
    defaultTitle: 'Hata'
  },
  warning: {
    icon: AlertTriangle,
    borderLeftClass: 'border-l-[#e07a2c]',
    iconColorClass: 'text-[#e07a2c]',
    iconBgClass: 'bg-amber-50',
    progressBarClass: 'bg-gradient-to-r from-[#b4823c] to-[#e07a2c]',
    defaultTitle: 'Uyarı'
  },
  info: {
    icon: Info,
    borderLeftClass: 'border-l-blue-500',
    iconColorClass: 'text-blue-500',
    iconBgClass: 'bg-blue-50',
    progressBarClass: 'bg-blue-500',
    defaultTitle: 'Bilgi'
  }
};

function ToastItem({ toast, onDismiss }) {
  const { id, type = 'info', title, message, duration = 4000 } = toast;
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const exitingRef = useRef(false);

  const config = VARIANT_CONFIGS[type] || VARIANT_CONFIGS.info;
  const IconComponent = config.icon;
  const toastTitle = title || config.defaultTitle;

  const dismissToast = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  }, [id, onDismiss]);

  // Trigger smooth entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  // Countdown & auto-dismiss with pause-on-hover capability
  useEffect(() => {
    if (isPaused || exitingRef.current || duration <= 0) return;

    const intervalStep = 25;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= intervalStep) {
          clearInterval(interval);
          dismissToast();
          return 0;
        }
        return prev - intervalStep;
      });
    }, intervalStep);

    return () => clearInterval(interval);
  }, [isPaused, duration, dismissToast]);

  const progressPercent = duration > 0 ? Math.max(0, Math.min(100, (remainingTime / duration) * 100)) : 0;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="assertive"
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white shadow-xl border border-slate-100 ${config.borderLeftClass} border-l-4 transition-all duration-300 ease-out transform ${
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        {/* Variant Icon Circle */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.iconBgClass} ${config.iconColorClass}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Title and Message */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {toastTitle}
          </h4>
          {message && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug break-words">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Kapat"
          className="flex-shrink-0 -mr-1 -mt-1 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      {duration > 0 && (
        <div className="h-[3px] w-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${config.progressBarClass} transition-[width] duration-75 ease-linear`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function CatalogToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    const id = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
    const newToast = {
      id,
      type: toastData.type || 'info',
      message: toastData.message || '',
      title: toastData.title || null,
      duration: toastData.duration !== undefined ? toastData.duration : 4000
    };

    setToasts((prev) => {
      // Max 3 visible at once: if already 3, discard oldest to keep max 3
      const currentList = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
      return [...currentList, newToast];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (e) => {
      if (e && e.detail) {
        addToast(e.detail);
      }
    };

    window.addEventListener('seramikbak-toast', handleToastEvent);
    return () => {
      window.removeEventListener('seramikbak-toast', handleToastEvent);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Bildirimler"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm sm:max-w-md pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </aside>
  );
}
