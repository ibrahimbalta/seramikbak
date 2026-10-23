'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import HtmlLookbookViewer from '@/components/brand/catalog/templates/HtmlLookbookViewer';

export default function PublicCatalogViewerPage() {
  const params = useParams();
  const slug = params?.slug;

  const [catalog, setCatalog] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (slug) {
      fetchCatalog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center p-6 text-stone-900 font-sans">
        <div className="w-12 h-12 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-4">
          <Loader2 size={24} className="animate-spin text-[#a87943]" />
        </div>
        <p className="text-xs font-mono font-semibold tracking-widest text-stone-600 uppercase">
          Katalog Hazırlanıyor...
        </p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center p-6 text-stone-900 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle size={28} />
        </div>
        <h1 className="text-xl font-bold mb-2 tracking-tight">Katalog Görüntülenemedi</h1>
        <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed">
          {error || 'İstenen dijital katalog bulunamadı veya henüz yayına alınmamış olabilir.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCatalog}
            className="px-4 py-2 rounded-md bg-[#a87943] text-white text-xs font-bold shadow-sm transition hover:brightness-95 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-white border border-stone-200 text-stone-700 text-xs font-bold transition hover:bg-stone-50"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <HtmlLookbookViewer
      catalog={catalog}
      products={products}
      mode="view"
    />
  );
}
