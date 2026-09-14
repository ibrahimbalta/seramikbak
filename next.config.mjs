/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image Optimization CDN Domains
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.canakkaleseramik.com',
      },
      {
        protocol: 'https',
        hostname: '*.kutahyaseramik.com.tr',
      },
      {
        protocol: 'https',
        hostname: '*.vitra.com.tr',
      },
      {
        protocol: 'https',
        hostname: '*.bien.com.tr',
      },
      {
        protocol: 'https',
        hostname: '*.yurtbayseramik.com',
      },
      {
        protocol: 'https',
        hostname: '*.seramiksan.com.tr',
      },
      {
        protocol: 'https',
        hostname: '*.egeseramik.com',
      },
      {
        protocol: 'https',
        hostname: '*.quagranite.com',
      },
      {
        protocol: 'https',
        hostname: 'www.seramikbak.com',
      },
    ],
  },

  // SEO: www redirect ve trailing slash normalizasyonu
  async redirects() {
    return [
      // /teklif-al -> /proje-talep redirect
      {
        source: '/teklif-al',
        destination: '/proje-talep',
        permanent: true,
      },
      // non-www → www redirect
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'seramikbak.com' }],
        destination: 'https://www.seramikbak.com/:path*',
        permanent: true,
      },
    ];
  },

  // SEO & Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
