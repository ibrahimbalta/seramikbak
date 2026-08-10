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
  handleProductCardClick,
  onOpenAR
}) {
  const { t, translateFinish, translateStyle } = useLanguage();
  const hasAd = product.campaigns && product.campaigns.length > 0;
  
  return (
    <div 
      onClick={() => handleProductCardClick(product)}
      className={`product-card-new glass-panel ${activeProduct?.id === product.id ? 'active' : ''} ${hasAd ? 'sponsored-card-new' : ''}`}
    >
      {/* Thumbnail Texture Container */}
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
        />
        
        {/* Compare button overlay */}
        <button 
          className={`card-compare-btn-overlay ${comparedProducts.some(p => p.id === product.id) ? 'active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); toggleCompareProduct(product); }}
          title={t('comparePrices')}
        >
          <span className="compare-icon-indicator">
            {comparedProducts.some(p => p.id === product.id) ? '✓' : '+'}
          </span>
          <span>{comparedProducts.some(p => p.id === product.id) ? '✓' : '+'}</span>
        </button>
        
        {/* Heart icon button overlay */}
        <button 
          className="card-favorites-heart-btn" 
          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
          title={t('addToFavorites')}
        >
          <HeartIcon size={16} fill={isProductFavorited(product.id) ? 'var(--accent-gold)' : 'none'} stroke={isProductFavorited(product.id) ? 'var(--accent-gold)' : 'currentColor'} />
        </button>

        {/* Hover action layout */}
        <div className="card-quick-actions-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); navigateTo3DStudio(product); }}
            className="btn-primary card-action-btn-new"
            style={{ fontSize: '0.65rem', padding: '6px 4px' }}
          >
            3D
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenAR ? onOpenAR(product) : navigateTo3DStudio(product); }}
            className="btn-primary card-action-btn-new"
            style={{ fontSize: '0.65rem', padding: '6px 4px', backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
            title="AR"
          >
            📷 AR
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); navigateToDealers(product); }}
            className="btn-secondary card-action-btn-new"
            style={{ fontSize: '0.65rem', padding: '6px 4px' }}
          >
            {t('dealers')}
          </button>
        </div>
      </div>

      {/* Card Meta Content */}
      <div className="card-text-details-new">
        <div className="card-badges-row-new">
          {hasAd && (
            <span className="card-badge-tag-new gold animate-pulse" style={{ animationDuration: '1.2s' }}>
              SPONSOR
            </span>
          )}
          {(() => {
            const badge = getProductBadge(product, idx);
            return (
              <span className={`card-badge-tag-new ${badge.className}`}>
                {badge.text}
              </span>
            );
          })()}
          <span className="card-badge-tag-new grey">{translateFinish(product.finish) || product.finish}</span>
        </div>
        
        <h4 className="card-title-new">{product.name}</h4>
        <p className="card-specs-new">{product.width}x{product.height} cm • {translateStyle(product.style) || product.style}</p>
        <p className="card-brand-new">{product.brand?.name}</p>
      </div>
    </div>
  );
}
