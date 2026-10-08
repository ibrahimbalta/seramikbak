import prisma from '@/lib/prisma';
import VisualizerStudio from '@/components/VisualizerStudio';

export const metadata = {
  title: 'Mekânında Gör & Dene — AI Seramik Görselleştirme Stüdyosu | SeramikBak',
  description: 'Odanızın fotoğrafını yükleyin veya hazır banyo/mutfak şablonlarını seçin. SegFormer yapay zekâ teknolojisiyle gerçek seramik dokularını kendi mekanınızda deneyimleyin.',
  robots: { index: true, follow: true }
};

export default async function MekanimdaGorPage({ searchParams }) {
  const { slug } = (await searchParams) || {};
  let product = null;

  if (slug) {
    try {
      const targetSlug = slug.toLowerCase().trim();
      product = await prisma.product.findUnique({
        where: { slug: targetSlug },
        include: { brand: true }
      });

      if (!product) {
        product = await prisma.product.findFirst({
          where: {
            OR: [
              { code: { equals: slug, mode: 'insensitive' } },
              { slug: { equals: targetSlug, mode: 'insensitive' } }
            ]
          },
          include: { brand: true }
        });
      }

      if (product) {
        product = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          code: product.code,
          brand: product.brand?.name || 'SeramikBak',
          width: Number(product.width) || 60,
          height: Number(product.height) || 120,
          imageUrl: product.imageUrl,
          textureUrl: product.textureUrl || product.imageUrl,
          finish: product.surface || 'Parlak Rektifiye'
        };
      }
    } catch (e) {
      console.warn('[MekanimdaGorPage] Could not query product by slug:', e.message);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080c16' }}>
      <VisualizerStudio initialProduct={product} />
    </main>
  );
}
