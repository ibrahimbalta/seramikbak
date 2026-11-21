'use client';

import Link from 'next/link';
import { Compass, Home, Search, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-slate-400/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full text-center z-10 space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
        
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold tracking-wide">
          <Sparkles className="w-4 h-4 text-[#b38e47]" />
          <span>SeramikBak Portal</span>
        </div>

        {/* 404 Visual Icon */}
        <div className="relative flex justify-center items-center my-4">
          <span className="text-8xl sm:text-9xl font-black text-slate-100 tracking-tighter select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#b38e47] to-[#d4af37] p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-[#b38e47]" />
              </div>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Aradığınız Sayfa Bulunamadı
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            Ulaşmaya çalıştığınız seramik modeli, bayi veya sayfa kaldırılmış ya da adresi değişmiş olabilir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#b38e47] to-[#c89d4c] text-white font-bold hover:brightness-105 transition-all duration-200 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
          
          <Link
            href="/?search=true"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 active:scale-95"
          >
            <Search className="w-4 h-4 text-[#b38e47]" />
            Katalogda Ara
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <Link href="/bayiler" className="hover:text-[#b38e47] transition-colors">
            Bayilerimiz
          </Link>
          <span>•</span>
          <Link href="/ustalar" className="hover:text-[#b38e47] transition-colors">
            Usta Rehberi
          </Link>
          <span>•</span>
          <Link href="/iletisim" className="hover:text-[#b38e47] transition-colors">
            İletişim
          </Link>
        </div>

      </div>
    </div>
  );
}
