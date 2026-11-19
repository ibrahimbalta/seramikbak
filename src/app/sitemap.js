import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { CATEGORY_DEFINITIONS } from '@/lib/categories';

export const revalidate = 86400;

export default async function sitemap() {
  const baseUrl = 'https://www.seramikbak.com';

  // Top 16 Turkish Ceramic Brands
  const TOP_BRANDS = [
    'Çanakkale Seramik',
    'NG Kütahya Seramik',
    'VitrA',
    'Bien Seramik',
    'Yurtbay Seramik',
    'Seramiksan',
    'Ege Seramik',
    'Qua Granite',
    'DuraTiles',
    'Decovita',
    'Graniser',
    'Güral Seramik',
    'Hitit Seramik',
    'Seranit',
    'Termal Seramik',
    'Uşak Seramik'
  ];

  // Key Provinces of Turkey for Local SEO Matrix
  const TURKEY_CITIES = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
    'Kocaeli', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli',
    'Şanlıurfa', 'Sakarya', 'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van', 'Batman',
    'Elazığ', 'Trabzon', 'Manisa', 'Sivas', 'Balıkesir', 'Kütahya', 'Uşak', 'Ordu',
    'Çanakkale', 'Afyonkarahisar', 'Nevşehir', 'Yalova', 'Aydın', 'Tekirdağ', 'Muğla'
  ];

  // 1. Static Core Routes with 5-Language Variants
  const staticPaths = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/mekanimda-gor', priority: 0.98, changeFrequency: 'daily' },
    { path: '/bayiler', priority: 0.96, changeFrequency: 'daily' },
    { path: '/ustalar', priority: 0.92, changeFrequency: 'weekly' },
    { path: '/proje-talep', priority: 0.90, changeFrequency: 'weekly' },
    { path: '/yapay-zeka', priority: 0.90, changeFrequency: 'daily' },
    { path: '/global-tanitim', priority: 0.88, changeFrequency: 'weekly' },
    { path: '/marka', priority: 0.88, changeFrequency: 'weekly' },
    { path: '/outlet', priority: 0.88, changeFrequency: 'daily' },
    { path: '/ilham', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/hakkimizda', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/iletisim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/uyelik', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/yasal', priority: 0.3, changeFrequency: 'yearly' }
  ];

  const staticRoutes = staticPaths.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  // 2. City x Brand Local SEO Matrix Routes
  let cityBrandRoutes = [];
  TURKEY_CITIES.forEach(city => {
    TOP_BRANDS.forEach(brand => {
      const brandSlug = slugify(brand);
      const citySlug = slugify(city);
      cityBrandRoutes.push({
        url: `${baseUrl}/bayi?city=${encodeURIComponent(city)}&brand=${encodeURIComponent(brand)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.88
      });
    });
  });

  // 3. Dynamic Product & Collection Routes from DB
  let productRoutes = [];
  try {
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, name: true, updatedAt: true, brand: { select: { name: true } } }
    });
    
    products.forEach(p => {
      const slug = p.slug || slugify(`${p.brand?.name || 'seramik'} ${p.name}`);
      productRoutes.push({
        url: `${baseUrl}/urun/${slug}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: 'daily',
        priority: 0.95
      });
    });
  } catch (err) {
    console.error('Sitemap product route generation error (using static fallback matrix):', err);
    TOP_BRANDS.slice(0, 8).forEach(brand => {
      const brandSlug = slugify(brand);
      productRoutes.push({
        url: `${baseUrl}/marka/${brandSlug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9
      });
    });
  }

  // 4. Dynamic Dealer Showroom Paths from DB
  let dealerRoutes = [];
  try {
    const dealers = await prisma.dealer.findMany({
      select: { id: true, name: true, updatedAt: true }
    });
    dealers.forEach(dealer => {
      const slug = slugify(dealer.name);
      dealerRoutes.push({
        url: `${baseUrl}/bayi/${slug}`,
        lastModified: dealer.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.85
      });
    });
  } catch (err) {
    console.error('Sitemap dealer route generation error (using static fallback matrix):', err);
    TURKEY_CITIES.slice(0, 10).forEach(city => {
      dealerRoutes.push({
        url: `${baseUrl}/bayi?city=${encodeURIComponent(city)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85
      });
    });
  }

  // 5. Dynamic Brand Hub Routes from DB
  let brandRoutes = [];
  try {
    const brands = await prisma.brand.findMany({
      select: { name: true, slug: true, updatedAt: true }
    });
    brands.forEach(brand => {
      const slug = brand.slug || slugify(brand.name);
      brandRoutes.push({
        url: `${baseUrl}/marka/${slug}`,
        lastModified: brand.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8
      });
    });
  } catch (err) {
    console.error('Sitemap brand route generation error (using static fallback matrix):', err);
    TOP_BRANDS.forEach(brand => {
      const slug = slugify(brand);
      brandRoutes.push({
        url: `${baseUrl}/marka/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8
      });
    });
  }

  // 6. Programmatic SEO Category Routes
  const categoryRoutes = Object.keys(CATEGORY_DEFINITIONS).map(slug => ({
    url: `${baseUrl}/kategori/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.95
  }));

  // 7. Programmatic SEO Permutations (/kesfet/{brand}-{size/room/color})
  let matrixRoutes = [];
  const matrixSizes = ['60x120', '80x80', '60x60', '20x120'];
  const matrixRooms = ['banyo-seramikleri', 'mutfak-seramikleri', 'salon-seramikleri', 'teras-seramikleri'];
  const matrixColors = ['bej', 'antrasit', 'beyaz', 'gri'];

  TOP_BRANDS.slice(0, 10).forEach(brand => {
    const bSlug = slugify(brand);
    // Brand + Size
    matrixSizes.forEach(s => {
      matrixRoutes.push({
        url: `${baseUrl}/kesfet/${bSlug}-${s}-seramik`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.92
      });
    });
    // Brand + Room
    matrixRooms.forEach(r => {
      matrixRoutes.push({
        url: `${baseUrl}/kesfet/${bSlug}-${r}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.90
      });
    });
    // Brand + Color
    matrixColors.forEach(c => {
      matrixRoutes.push({
        url: `${baseUrl}/kesfet/${bSlug}-${c}-seramik`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.88
      });
    });
  });

  return [
    ...staticRoutes, 
    ...categoryRoutes, 
    ...cityBrandRoutes, 
    ...matrixRoutes, 
    ...productRoutes, 
    ...dealerRoutes, 
    ...brandRoutes
  ];
}
