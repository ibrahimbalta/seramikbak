import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export default async function sitemap() {
  const baseUrl = 'https://www.seramikbak.com';

  // Static routes with optimized priorities
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/hakkimizda', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/iletisim', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/ilham', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/proje-talep', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/uyelik', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/yasal', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/marka', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/bayi', priority: 0.9, changeFrequency: 'weekly' },
  ].map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  // Dynamic Dealer paths from DB
  let dealerRoutes = [];
  try {
    const dealers = await prisma.dealer.findMany({
      select: { name: true, updatedAt: true }
    });
    dealerRoutes = dealers.map(dealer => ({
      url: `${baseUrl}/bayi/${slugify(dealer.name)}`,
      lastModified: dealer.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    }));
  } catch (err) {
    console.error('Sitemap dealer route generation error:', err);
  }

  return [...routes, ...dealerRoutes];
}
