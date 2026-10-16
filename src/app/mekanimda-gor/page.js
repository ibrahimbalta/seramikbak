'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Home } from 'lucide-react';

function MekanimdaGorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = searchParams ? searchParams.get('slug') : null;
  const tileParam = searchParams ? searchParams.get('tile') : null;
  const productParam = searchParams ? searchParams.get('product') : null;

  const [visualizerSrc, setVisualizerSrc] = useState('/tile-engine/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/tile-engine/index.html';
    const params = new URLSearchParams();
    params.set('v', '4.0.0');

    if (tileParam) {
      params.set('tile', tileParam);
    }
    if (productParam) {
      params.set('product', productParam);
    }

    if (slug && !tileParam) {
      // Fetch product texture by slug
      fetch(`/api/products?search=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(data => {
          const list = data?.products || (Array.isArray(data) ? data : []);
          const prod = list.find(p => p.slug === slug || p.code === slug) || list[0];
          if (prod) {
            params.set('tile', prod.textureUrl || prod.imageUrl || '/textures/calacatta_gold.jpg');
            params.set('product', prod.name || slug);
          }
          const qs = params.toString();
          setVisualizerSrc(qs ? `/tile-engine/index.html?${qs}` : '/tile-engine/index.html');
          setLoading(false);
        })
        .catch(() => {
          setVisualizerSrc('/tile-engine/index.html?v=4.0.0');
          setLoading(false);
        });
      return;
    }

    const qs = params.toString();
    if (qs) {
      url += `?${qs}`;
    }
    setVisualizerSrc(url);
    setLoading(false);
  }, [slug, tileParam, productParam]);

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#f8fafc] overflow-hidden text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3 bg-white border-b border-slate-200 shrink-0 z-20 shadow-xs pt-[max(env(safe-area-inset-top),0.625rem)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Geri Dön</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#b38e47] px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#b38e47] tracking-wider">
            <Sparkles size={14} className="text-[#b38e47]" />
            <span>SERAMİKBAK AI STÜDYO</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300/70 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b38e47] animate-pulse"></span>
            Tile Detection Engine
          </span>
        </div>
      </nav>

      {/* Main Visualizer App */}
      <main className="relative flex-1 w-full bg-[#f8fafc] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8fafc] z-10 gap-3">
            <div className="w-8 h-8 border-2 border-[#b38e47] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-600">Yapay Zekâ Mekân Stüdyosu Hazırlanıyor...</p>
          </div>
        )}
        <iframe
          src={visualizerSrc}
          title="Floor Tile Visualizer"
          className="w-full h-full border-0"
          allow="camera; clipboard-write; fullscreen"
        />
      </main>
    </div>
  );
}

export default function MekanimdaGorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#f8fafc] text-[#b38e47] text-sm font-bold">
        Yapay Zekâ Mekân Stüdyosu Yükleniyor...
      </div>
    }>
      <MekanimdaGorContent />
    </Suspense>
  );
}
