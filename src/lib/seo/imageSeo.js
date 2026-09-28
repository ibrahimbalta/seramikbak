/**
 * Image SEO Helper for SeramikBak
 * Generates keyword-dense descriptive alt attributes, structured ImageObject data,
 * and next-gen responsive image optimization configurations.
 */

/**
 * Builds high-converting SEO Alt Text for product images
 * Example output: "VitrA Marmori Calacatta 60x120 cm Parlak Beyaz Mermer Görünümlü Banyo Zemin Seramiği"
 */
export function generateImageAltText(product, brandName) {
  if (!product) return 'Seramik ve Porselen Karo Koleksiyonu | SeramikBak';

  const bName = product.brand?.name || brandName || 'Seramik';
  const name = product.name || 'Model';
  const size = product.width && product.height ? `${product.width}x${product.height} cm` : '';
  const finish = product.finish ? `${product.finish} Yüzey` : '';
  const color = product.color ? `${product.color}` : '';
  const style = product.style ? `${product.style} Görünümlü` : '';
  const area = product.area ? `${product.area.split(',')[0]} İçin` : '';

  const parts = [bName, name, size, finish, color, style, area, 'Porselen Seramik Karosu']
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return parts;
}

/**
 * Generates responsive image sizes string for WebP/AVIF rendering
 */
export function getOptimizedImageProps({ src, alt, priority = false }) {
  return {
    src,
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quality: 85
  };
}
