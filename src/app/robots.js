export default function robots() {
  const disallowList = [
    '/admin/',
    '/api/',
    '/*?*lang=*',
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
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: disallowList,
      },
      {
        // Block AI model training & aggressive scraping bots to conserve server CPU
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
          'Bytespider',
          'CCBot',
          'anthropic-ai',
        ],
        disallow: '/',
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
