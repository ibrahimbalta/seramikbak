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

  const [visualizerSrc, setVisualizerSrc] = useState('/floor-tile-visualizer/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/floor-tile-visualizer/';
    const params = new URLSearchParams();

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
          setVisualizerSrc(qs ? `/floor-tile-visualizer/?${qs}` : '/floor-tile-visualizer/');
          setLoading(false);
        })
        .catch(() => {
          setVisualizerSrc('/floor-tile-visualizer/');
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
    <div className="flex flex-col w-full h-screen bg-[#06060c] overflow-hidden text-white">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-2.5 bg-[#0b0f19] border-b border-white/10 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Geri Dön</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 tracking-wider">
            <Sparkles size={14} className="text-indigo-400" />
            <span>SERAMİKBAK AI STÜDYO</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SegFormer Canlı
          </span>
        </div>
      </nav>

      {/* Main Visualizer App */}
      <main className="relative flex-1 w-full bg-[#06060c] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#06060c] z-10 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-400">Yapay Zekâ Mekân Stüdyosu Hazırlanıyor...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-[#06060c] text-amber-300 text-sm font-semibold">
        Yapay Zekâ Mekân Stüdyosu Yükleniyor...
      </div>
    }>
      <MekanimdaGorContent />
    </Suspense>
  );
}
