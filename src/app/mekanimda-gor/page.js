'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VisualizerStudio from '@/components/VisualizerStudio';

function MekanimdaGorContent() {
  const searchParams = useSearchParams();
  const slug = searchParams ? searchParams.get('slug') : null;

  return <VisualizerStudio initialSlug={slug} />;
}

export default function MekanimdaGorPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080c16',
        color: '#d4af37',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '1rem',
        fontWeight: '600'
      }}>
        Yapay Zekâ Mekân Stüdyosu Yükleniyor...
      </div>
    }>
      <main style={{ minHeight: '100vh', background: '#080c16' }}>
        <MekanimdaGorContent />
      </main>
    </Suspense>
  );
}
