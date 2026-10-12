'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Printer,
  Share2,
  Download,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';
import CatalogTemplateRenderer from '@/components/brand/catalog/templates/CatalogTemplateRenderer';

export default function PublicCatalogViewerPage() {
  const params = useParams();
  const slug = params?.slug;

  const [catalog, setCatalog] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchCatalog();
    }
  }, [slug]);

  const fetchCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/brand/catalogs/public/${slug}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCatalog(data.catalog);
        setProducts(data.catalog.products || []);
      } else {
        setError(data.error || 'Katalog bulunamadı veya henüz yayına alınmamış.');
      }
    } catch (err) {
      setError('Bağlantı hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Notify download count to API
    fetch(`/api/brand/catalogs/public/${slug}?download=true`).catch(() => {});
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: catalog?.title || 'SeramikBak Dijital Lookbook',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Katalog bağlantısı panoya kopyalandı:\n' + window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 size={36} className="animate-spin text-amber-500 mb-3" />
        <h2 className="text-lg font-semibold">Dijital Katalog Yükleniyor...</h2>
        <p className="text-xs text-neutral-400 mt-1">Yüksek çözünürlüklü seramik yüzeyleri hazırlanıyor.</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Katalog Görüntülenemedi</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">{error || 'İstenen katalog bulunamadı.'}</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-white text-neutral-900 font-semibold text-sm hover:bg-neutral-100 transition"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const brand = catalog.brand || {};

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col text-white">
      {/* Top Floating Action Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">SeramikBak</span>
          </Link>

          <div className="h-4 w-px bg-white/20" />

          <div>
            <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
              {catalog.title}
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">
              {brand.name} &bull; {products.length} Seramik Ürün
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Paylaş</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <Printer size={15} />
            <span>PDF İndir / Yazdır</span>
          </button>
        </div>
      </header>

      {/* Main Lookbook Container */}
      <main className="flex-1 p-4 md:p-8 flex justify-center overflow-x-hidden">
        <div className="w-full max-w-5xl">
          <CatalogTemplateRenderer
            catalog={catalog}
            products={products}
            mode="preview"
          />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-neutral-500 no-print">
        <p>&copy; {new Date().getFullYear()} {brand.name} &bull; Dijital Lookbook powered by <Link href="/" className="text-amber-500 hover:underline">SeramikBak.com</Link></p>
      </footer>
    </div>
  );
}
