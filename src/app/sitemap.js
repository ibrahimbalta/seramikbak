import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export default async function sitemap() {
  const baseUrl = 'https://www.seramikbak.com';
  const supportedLangs = ['tr', 'en', 'de', 'ar', 'ru'];

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
    { path: '/global-tanitim', priority: 0.95, changeFrequency: 'weekly' },
    { path: '/marka', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/bayi', priority: 0.9, changeFrequency: 'daily' },
    { path: '/outlet', priority: 0.9, changeFrequency: 'daily' },
    { path: '/ilham', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/proje-talep', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/ustalar', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/hakkimizda', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/iletisim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/uyelik', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/yasal', priority: 0.3, changeFrequency: 'yearly' }
  ];

  let staticRoutes = [];
  staticPaths.forEach(route => {
    supportedLangs.forEach(lang => {
      const langParam = lang === 'tr' ? '' : `?lang=${lang}`;
      staticRoutes.push({
        url: `${baseUrl}${route.path}${langParam}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority
      });
    });
  });

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
      select: { id: true, name: true, updatedAt: true, brand: { select: { name: true } } }
    });
    
    products.forEach(p => {
      const slug = slugify(`${p.brand?.name || 'seramik'} ${p.name}`);
      supportedLangs.forEach(lang => {
        const langParam = lang === 'tr' ? '' : `?lang=${lang}`;
        productRoutes.push({
          url: `${baseUrl}/?product=${p.id}&slug=${slug}${langParam ? `&lang=${lang}` : ''}`,
          lastModified: p.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.9
        });
      });
    });
  } catch (err) {
    console.error('Sitemap product route generation error:', err);
  }

  // 4. Dynamic Dealer Showroom Paths from DB
  let dealerRoutes = [];
  try {
    const dealers = await prisma.dealer.findMany({
      select: { id: true, name: true, updatedAt: true }
    });
    dealers.forEach(dealer => {
      const slug = slugify(dealer.name);
      supportedLangs.forEach(lang => {
        const langParam = lang === 'tr' ? '' : `?lang=${lang}`;
        dealerRoutes.push({
          url: `${baseUrl}/bayi/${slug}${langParam}`,
          lastModified: dealer.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.85
        });
      });
    });
  } catch (err) {
    console.error('Sitemap dealer route generation error:', err);
  }

  // 5. Dynamic Brand Hub Routes from DB
  let brandRoutes = [];
  try {
    const brands = await prisma.brand.findMany({
      select: { name: true, updatedAt: true }
    });
    brands.forEach(brand => {
      const slug = slugify(brand.name);
      supportedLangs.forEach(lang => {
        const langParam = lang === 'tr' ? '' : `?lang=${lang}`;
        brandRoutes.push({
          url: `${baseUrl}/marka/${slug}${langParam}`,
          lastModified: brand.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8
        });
      });
    });
  } catch (err) {
    console.error('Sitemap brand route generation error:', err);
  }

  return [...staticRoutes, ...cityBrandRoutes, ...productRoutes, ...dealerRoutes, ...brandRoutes];
}
