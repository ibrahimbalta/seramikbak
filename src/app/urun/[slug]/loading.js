import React from 'react';
import './product-detail.css';

export default function ProductDetailLoading() {
  return (
    <div className="sb-dark-page min-h-screen">
      {/* Skeleton Top Nav Bar */}
      <header className="sb-nav-bar">
        <div className="sb-nav-inner">
          <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse border border-white/10" />
          <div className="flex flex-col gap-1.5 flex-1 max-w-xs">
            <div className="w-16 h-2.5 bg-amber-400/20 rounded animate-pulse" />
            <div className="w-36 h-3.5 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse border border-white/10" />
            <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse border border-white/10" />
          </div>
        </div>
      </header>

      {/* Main Skeleton Shell */}
      <main className="sb-main-shell">
        <div className="sb-hero-layout">
          {/* Gallery Column Skeleton */}
          <div className="sb-gallery-col">
            <div className="sb-stage-card relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
            </div>

            <div className="sb-view-row">
              <div className="h-8 flex-1 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-8 flex-1 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-8 flex-1 bg-white/5 rounded-lg animate-pulse" />
            </div>

            <div className="sb-strip-3">
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
            </div>
          </div>

          {/* Details Column Skeleton */}
          <div className="sb-details-col">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-amber-400/20 rounded animate-pulse" />
              <div className="w-32 h-5 bg-white/5 rounded animate-pulse" />
            </div>

            <div className="w-3/4 h-8 bg-white/10 rounded-lg animate-pulse mt-1" />
            <div className="w-full h-12 bg-white/5 rounded-lg animate-pulse" />

            <div className="sb-specs-grid-4 mt-2">
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              <div className="h-14 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
            </div>

            <div className="sb-actions-panel mt-2">
              <div className="w-40 h-3 bg-white/10 rounded animate-pulse" />
              <div className="sb-grid-2">
                <div className="h-11 bg-amber-400/20 rounded-xl animate-pulse" />
                <div className="h-11 bg-white/10 rounded-xl animate-pulse" />
              </div>
              <div className="sb-grid-2 mt-2">
                <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
