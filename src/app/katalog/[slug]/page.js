'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Printer,
  Share2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
  QrCode,
  Sparkles,
  X,
  Layers
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

  // Interactive Product Search & QR Modal in Public Web Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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
    fetch(`/api/brand/catalogs/public/${slug}?download=true`).catch(() => {});
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: catalog?.title || 'SeramikBak Dijital Lookbook',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Katalog bağlantısı panoya kopyalandı:\n' + window.location.href);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

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
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
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

        {/* Center: Quick Product Search inside Catalog */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowProductDrawer(!showProductDrawer)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <Search size={14} className="text-amber-400" />
            <span>Katalogda Ürün Ara ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="QR Kod ile Paylaş"
          >
            <QrCode size={15} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Paylaş</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Printer size={15} />
            <span>PDF İndir / Yazdır</span>
          </button>
        </div>
      </header>

      {/* Collapsible Product Search & Direct Navigation Drawer */}
      {showProductDrawer && (
        <div className="bg-neutral-950 border-b border-white/10 px-4 md:px-8 py-5 no-print">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Katalog içindeki seramikleri ad, ebat veya renge göre filtrele..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowProductDrawer(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.imageUrl || p.textureUrl || '/placeholder.png'}
                      alt={p.name}
                      className="w-11 h-11 rounded-lg object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {p.width && p.height ? `${p.width}x${p.height} cm` : p.finish || ''}
                      </p>
                    </div>
                  </div>

                  {p.slug && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Link
                        href={`/urun/${p.slug}`}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[10px] flex items-center gap-1"
                      >
                        <span>Detay</span>
                        <ExternalLink size={10} />
                      </Link>
                      <Link
                        href={`/mekan-dene?product=${p.slug}`}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 text-[9px] font-semibold text-center"
                      >
                        Mekânda Gör
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Lookbook Container */}
      <main className="flex-1 p-4 md:p-8 flex justify-center overflow-x-hidden">
        <div className="w-full max-w-5xl">
          <CatalogTemplateRenderer catalog={catalog} products={products} mode="preview" />
        </div>
      </main>

      {/* QR Code Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-sm font-extrabold">Web Kataloğu QR Kodu</span>
              <button onClick={() => setShowQrModal(false)} className="text-neutral-400 hover:text-neutral-800">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 inline-block mx-auto">
              {products[0]?.qrCodeUrl ? (
                <img src={products[0].qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
              ) : (
                <QrCode size={140} className="text-neutral-900 mx-auto" />
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Mobil cihazınızın kamerasıyla okutarak <strong>{catalog.title}</strong> kataloğuna anında erişebilirsiniz.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-neutral-500 no-print">
        <p>
          &copy; {new Date().getFullYear()} {brand.name} &bull; Dijital Lookbook powered by{' '}
          <Link href="/" className="text-amber-500 hover:underline">
            SeramikBak.com
          </Link>
        </p>
      </footer>
    </div>
  );
}
