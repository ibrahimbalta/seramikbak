import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export default async function sitemap() {
  const baseUrl = 'https://seramikbak.vercel.app';

  // Static routes
  const routes = [
    '',
    '/hakkimizda',
    '/iletisim',
    '/ilham',
    '/proje-talep',
    '/uyelik',
    '/yasal',
    '/marka'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8
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
