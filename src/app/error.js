'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an observability service
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full text-center z-10 space-y-8 backdrop-blur-md bg-slate-900/60 p-8 sm:p-12 rounded-3xl border border-slate-800/80 shadow-2xl shadow-red-500/5">
        
        {/* Error Warning Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-medium tracking-wide">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Sistem Hatası (500)</span>
        </div>

        {/* Error Icon Graphic */}
        <div className="relative flex justify-center items-center my-4">
          <span className="text-8xl sm:text-9xl font-extrabold text-slate-800 tracking-tighter select-none opacity-40">
            500
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Beklenmeyen Bir Hata Oluştu
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            İsteğiniz işlenirken sunucularımızda geçici bir aksaklık yaşandı. Teknik ekibimiz bilgilendirildi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Yeniden Deneyin
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-medium hover:bg-slate-800 hover:text-white transition-all duration-200 active:scale-95"
          >
            <Home className="w-4 h-4 text-amber-400" />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Support Link */}
        <div className="pt-6 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Sorun devam ederse lütfen </span>
          <Link href="/iletisim" className="text-amber-400 underline hover:text-amber-300 transition-colors">
            destek ekibimizle iletişime geçin
          </Link>
        </div>

      </div>
    </div>
  );
}
