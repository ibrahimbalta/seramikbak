'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, AlertCircle, Loader2, X } from 'lucide-react';

const VARIANT_CONFIGS = {
  danger: {
    iconBg: 'bg-rose-100 text-rose-600',
    defaultIcon: Trash2,
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-200 focus:ring-rose-500'
  },
  warning: {
    iconBg: 'bg-amber-100 text-amber-600',
    defaultIcon: AlertTriangle,
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-amber-200 focus:ring-amber-500'
  },
  default: {
    iconBg: 'bg-slate-100 text-[#b4823c]',
    defaultIcon: AlertCircle,
    confirmBtn: 'bg-[#b4823c] hover:bg-[#9a6d30] active:bg-[#835d29] text-white shadow-amber-900/10 focus:ring-[#b4823c]'
  }
};

/**
 * SeramikBak Confirmation Modal Dialog
 * 
 * Replaces native `confirm()` with a luxury brand-aligned modal.
 * 
 * Usage:
 * <ConfirmModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={() => handleDelete()}
 *   title="Kataloğu Silmek İstediğinize Emin misiniz?"
 *   description="Bu işlem geri alınamaz. Tüm katalog verileri kalıcı olarak silinecektir."
 *   confirmText="Evet, Sil"
 *   cancelText="Vazgeç"
 *   variant="danger" // 'danger' | 'warning' | 'default'
 *   icon={<Trash2 size={24} />} // optional custom icon
 *   loading={isLoading} // optional external loading state
 * />
 */
export default function ConfirmModal({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  description = 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?',
  confirmText = 'Evet, Onayla',
  cancelText = 'Vazgeç',
  variant = 'default', // 'danger' | 'warning' | 'default'
  icon = null,
  loading = false
}) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isBusy = Boolean(loading || internalLoading);
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.default;
  const DefaultIcon = config.defaultIcon;

  // Handles animation states on open/close
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when modal is visible
  useEffect(() => {
    if (isRendered) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isRendered]);

  // Keyboard accessibility: ESC key close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isBusy && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBusy, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isBusy && onClose) {
      onClose();
    }
  };

  const handleConfirmClick = async () => {
    if (isBusy || !onConfirm) return;
    try {
      const result = onConfirm();
      if (result && typeof result.then === 'function') {
        setInternalLoading(true);
        await result;
        setInternalLoading(false);
      }
    } catch (error) {
      setInternalLoading(false);
      console.error('ConfirmModal onConfirm error:', error);
    }
  };

  if (!isRendered) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-7 border border-slate-100 transition-all duration-200 transform max-h-[90dvh] overflow-y-auto overscroll-contain ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Kapat"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon Circle */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${config.iconBg}`}
          >
            {icon ? (
              <div className="flex items-center justify-center">
                {icon}
              </div>
            ) : (
              <DefaultIcon className="w-7 h-7" />
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center">
          <h3
            id="confirm-modal-title"
            className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
          >
            {title}
          </h3>
          {description && (
            <p
              id="confirm-modal-description"
              className="text-sm text-neutral-600 mt-2 leading-relaxed"
            >
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 mt-6 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isBusy}
            className={`w-full sm:flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed ${config.confirmBtn}`}
          >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
