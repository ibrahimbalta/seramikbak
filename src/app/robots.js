export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/']
    },
    sitemap: 'https://seramikbak.vercel.app/sitemap.xml'
  };
}
