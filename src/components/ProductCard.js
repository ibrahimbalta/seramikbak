'use client';

import { Heart as HeartIcon, ShoppingBag } from 'lucide-react';
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
  onAddToCart,
  isInCart = false
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
            title="Yetkili Bayiler & Teklif"
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
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', gap: '6px' }}>
          <p className="card-brand-new" style={{ margin: 0, minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.brand?.name}>
            {product.brand?.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {onAddToCart && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                title={isInCart ? t('inCart') : t('addQuote')}
                style={{
                  height: '24px',
                  minWidth: '58px',
                  padding: '0 6px',
                  boxSizing: 'border-box',
                  background: isInCart ? '#059669' : '#fdfaf3',
                  color: isInCart ? '#ffffff' : '#a27b38',
                  border: isInCart ? '1px solid #059669' : '1px solid #e7d8bf',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{isInCart ? t('inCart') : t('addQuote')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleCompareProduct(product); }}
              title={t('comparePrices')}
              style={{
                height: '24px',
                minWidth: '58px',
                padding: '0 6px',
                boxSizing: 'border-box',
                background: isCompared ? '#b38e47' : '#ffffff',
                color: isCompared ? '#ffffff' : '#64748b',
                border: isCompared ? '1px solid #b38e47' : '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <span>{isCompared ? t('compared') : t('compare')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
