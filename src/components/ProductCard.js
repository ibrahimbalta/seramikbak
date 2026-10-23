'use client';

import { Heart as HeartIcon } from 'lucide-react';
import TileVisualPreview from './TileVisualPreview';
import { useLanguage } from '@/lib/languageContext';

export default function ProductCard({
  product,
  idx,
  activeProduct,
  comparedProducts,
  isProductFavorited,
  toggleCompareProduct,
  handleToggleFavorite,
  navigateTo3DStudio,
  navigateToDealers,
  getProductBadge,
  handleProductCardClick
}) {
  const { t, translateFinish, translateStyle } = useLanguage();
  const hasAd = product.campaigns && product.campaigns.length > 0;
  const isCompared = comparedProducts.some(p => p.id === product.id);

  return (
    <div 
      onClick={() => handleProductCardClick(product)}
      className={`product-card-new glass-panel ${activeProduct?.id === product.id ? 'active' : ''} ${hasAd ? 'sponsored-card-new' : ''}`}
    >
      {/* Thumbnail Texture Container - Pure & Unobstructed */}
      <div className="card-texture-container-new">
        <TileVisualPreview 
          style={product.style} 
          color={product.color} 
          finish={product.finish}
          width={product.width}
          height={product.height}
          imageUrl={product.imageUrl}
          productName={product.name}
          brandName={product.brand?.name}
          priority={idx !== undefined && idx < 6}
        />
        
        {/* Heart icon button overlay - subtle top right */}
        <button 
          className="card-favorites-heart-btn" 
          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
          title={t('addToFavorites')}
          aria-label={t('addToFavorites')}
        >
          <HeartIcon size={15} fill={isProductFavorited(product.id) ? 'var(--accent-gold)' : 'none'} stroke={isProductFavorited(product.id) ? 'var(--accent-gold)' : 'currentColor'} />
        </button>

        {/* Quick Action Buttons (3D, Bayi) on Image */}
        <div className="card-quick-actions-row">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); navigateTo3DStudio(product); }}
            className="card-action-btn-new btn-action-3d"
            title="3D Sanal Mekanda Gör"
          >
            3D
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); navigateToDealers(product); }}
            className="card-action-btn-new btn-action-dealer"
            title="Yetkili Bayiler & Fiyat"
          >
            Bayi
          </button>
        </div>
      </div>

      {/* Card Meta Content */}
      <div className="card-text-details-new">
        <div className="card-badges-row-new">
          {hasAd ? (
            <span className="card-badge-tag-new gold">SPONSOR</span>
          ) : (() => {
            const badge = getProductBadge ? getProductBadge(product, idx) : null;
            if (!badge) return null;
            return (
              <span className={`card-badge-tag-new ${badge.className}`}>
                {badge.text}
              </span>
            );
          })()}
          {product.finish && (
            <span className="card-badge-tag-new grey">{translateFinish(product.finish) || product.finish}</span>
          )}
        </div>
        
        <h4 className="card-title-new">{product.name}</h4>
        <p className="card-specs-new">{product.width}x{product.height} cm • {translateStyle(product.style) || product.style}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <p className="card-brand-new" style={{ margin: 0 }}>{product.brand?.name}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleCompareProduct(product); }}
            title={t('comparePrices')}
            style={{
              background: isCompared ? 'var(--accent-gold)' : 'transparent',
              color: isCompared ? '#ffffff' : 'var(--text-muted)',
              border: isCompared ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '0.68rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <span>{isCompared ? '✓ Kıyas' : '+ Kıyas'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
