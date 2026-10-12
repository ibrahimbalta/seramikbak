'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ShieldCheck, Loader2 } from 'lucide-react';
import CatalogStudioTab from '@/components/brand/CatalogStudioTab';

export default function BrandCatalogsStandalonePage() {
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sb_brand_session');
      if (saved) {
        setBrandInfo(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse brand session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-amber-500 mb-2" />
      </div>
    );
  }

  if (!brandInfo) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Marka Oturumu Gerekli</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          Catalog Studio'yu kullanabilmek ve markanıza ait dijital katalogları yönetmek için lütfen marka paneline giriş yapın.
        </p>
        <Link
          href="/marka"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition"
        >
          Marka Girişine Git &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/marka"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={16} />
            <span>Marka Paneli</span>
          </Link>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-900">{brandInfo.name}</span>
            <span className="text-xs text-neutral-400">&bull;</span>
            <span className="text-xs text-amber-600 font-medium">Catalog Studio</span>
          </div>
        </div>

        <Link
          href="/marka"
          className="text-xs text-neutral-500 hover:text-neutral-800 transition"
        >
          Tüm Modüller &rarr;
        </Link>
      </header>

      {/* Main Studio Tab Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <CatalogStudioTab brandInfo={brandInfo} />
      </main>
    </div>
  );
}
