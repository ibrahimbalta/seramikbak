export default function robots() {
  const disallowList = [
    '/admin/',
    '/api/',
    '/*?*sort=*',
    '/*?*filter=*',
    '/*?*color=*',
    '/*?*finish=*',
    '/*?*size=*',
    '/*?*style=*',
    '/*?*area=*',
    '/*?*clear=*'
  ];

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
    ],
    sitemap: [
      'https://www.seramikbak.com/sitemap.xml',
    ],
    host: 'https://www.seramikbak.com',
  };
}
