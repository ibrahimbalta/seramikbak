import { Heart as HeartIcon } from 'lucide-react';
import TileVisualPreview from './TileVisualPreview';

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
        />
        
        {/* Compare button overlay */}
        <button 
          className={`card-compare-btn-overlay ${comparedProducts.some(p => p.id === product.id) ? 'active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); toggleCompareProduct(product); }}
          title="Karşılaştır"
        >
          <span className="compare-icon-indicator">
            {comparedProducts.some(p => p.id === product.id) ? '✓' : '+'}
          </span>
          <span>{comparedProducts.some(p => p.id === product.id) ? 'Seçildi' : 'Karşılaştır'}</span>
        </button>
        
        {/* Heart icon button overlay */}
        <button 
          className="card-favorites-heart-btn" 
          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
          title="Favorilerime Ekle"
        >
          <HeartIcon size={16} fill={isProductFavorited(product.id) ? 'var(--accent-gold)' : 'none'} stroke={isProductFavorited(product.id) ? 'var(--accent-gold)' : 'currentColor'} />
        </button>

        {/* Hover action layout */}
        <div className="card-quick-actions-row">
          <button 
            onClick={(e) => { e.stopPropagation(); navigateTo3DStudio(product); }}
            className="btn-primary card-action-btn-new"
          >
            3D Dene
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); navigateToDealers(product); }}
            className="btn-secondary card-action-btn-new"
          >
            Bayi Bul
          </button>
        </div>
      </div>

      {/* Card Meta Content */}
      <div className="card-text-details-new">
        <div className="card-badges-row-new">
          {(() => {
            const badge = getProductBadge(product, idx);
            return (
              <span className={`card-badge-tag-new ${badge.className}`}>
                {badge.text}
              </span>
            );
          })()}
          <span className="card-badge-tag-new grey">{product.finish}</span>
          {product.similarityScore !== undefined && product.similarityScore > 0 && (
            <span className="card-badge-tag-new gold animate-pulse">
              %{product.similarityScore} {product.isFallback ? 'Renk Uyumu' : 'Eşleşme'}
            </span>
          )}
        </div>
        
        <h4 className="card-title-new">{product.name}</h4>
        <p className="card-specs-new">{product.width}x{product.height} cm</p>
        <p className="card-brand-new">{product.brand?.name}</p>
      </div>
    </div>
  );
}
