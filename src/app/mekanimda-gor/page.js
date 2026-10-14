'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RoomRenovationModal from '@/components/RoomRenovationModal';

function MekanimdaGorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = searchParams ? searchParams.get('slug') : null;
  const tileParam = searchParams ? searchParams.get('tile') : null;
  const productParam = searchParams ? searchParams.get('product') : null;

  const [product, setProduct] = useState({
    name: productParam || 'Seramik Modeli',
    textureUrl: tileParam || '/textures/calacatta_gold.jpg',
    imageUrl: tileParam || '/textures/calacatta_gold.jpg',
    width: 60,
    height: 120
  });

  useEffect(() => {
    if (tileParam || productParam) {
      setProduct({
        name: productParam || 'Seramik Modeli',
        textureUrl: tileParam || '/textures/calacatta_gold.jpg',
        imageUrl: tileParam || '/textures/calacatta_gold.jpg',
        width: 60,
        height: 120
      });
    } else if (slug) {
      fetch(`/api/products?search=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(data => {
          const list = data?.products || (Array.isArray(data) ? data : []);
          const prod = list.find(p => p.slug === slug || p.code === slug) || list[0];
          if (prod) {
            setProduct(prod);
          }
        })
        .catch(() => {});
    }
  }, [slug, tileParam, productParam]);

  return (
    <RoomRenovationModal
      isOpen={true}
      onClose={() => router.push('/')}
      product={product}
    />
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
