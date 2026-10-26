/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security: Hide Next.js fingerprint
  poweredByHeader: false,

  // Performance: Brotli & Gzip compression
  compress: true,

  // Performance & Security: Strip console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Performance: Instant page transitions with tree-shaken icons
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image Optimization CDN Domains
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.canakkaleseramik.com' },
      { protocol: 'https', hostname: '*.kutahyaseramik.com.tr' },
      { protocol: 'https', hostname: 'ngkutahyaseramik.com.tr' },
      { protocol: 'https', hostname: '*.ngkutahyaseramik.com.tr' },
      { protocol: 'https', hostname: '*.vitra.com.tr' },
      { protocol: 'https', hostname: 'img-salsify.mncdn.com' },
      { protocol: 'https', hostname: '*.bien.com.tr' },
      { protocol: 'https', hostname: 'bienseramik.b-cdn.net' },
      { protocol: 'https', hostname: '*.yurtbayseramik.com' },
      { protocol: 'https', hostname: 'image.yurtbayseramik.com' },
      { protocol: 'https', hostname: '*.seramiksan.com.tr' },
      { protocol: 'https', hostname: 'cdn.seramiksan.com' },
      { protocol: 'https', hostname: '*.egeseramik.com' },
      { protocol: 'https', hostname: 'www.egeseramik.com' },
      { protocol: 'https', hostname: '*.quagranite.com' },
      { protocol: 'https', hostname: 'quagranite.b-cdn.net' },
      { protocol: 'https', hostname: 'itcyapi.com' },
      { protocol: 'https', hostname: '*.itcyapi.com' },
      { protocol: 'https', hostname: '*.hititseramik.com.tr' },
      { protocol: 'https', hostname: '*.usakseramik.com' },
      { protocol: 'https', hostname: 'usakseramik.com' },
      { protocol: 'https', hostname: '*.termalseramik.com.tr' },
      { protocol: 'https', hostname: '*.graniser.com.tr' },
      { protocol: 'https', hostname: '*.seranit.com.tr' },
      { protocol: 'https', hostname: 'static.ticimax.cloud' },
      { protocol: 'https', hostname: '*.decovita.com.tr' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'www.seramikbak.com' },
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

  // Rewrites for static visualizer directory
  async rewrites() {
    return [
      {
        source: '/floor-tile-visualizer',
        destination: '/floor-tile-visualizer/index.html',
      },
      {
        source: '/floor-tile-visualizer/',
        destination: '/floor-tile-visualizer/index.html',
      },
      {
        source: '/tiles-visualizer',
        destination: '/tiles-visualizer/index.html',
      },
      {
        source: '/tiles-visualizer/',
        destination: '/tiles-visualizer/index.html',
      },
      {
        source: '/tile-engine',
        destination: '/tile-engine/index.html',
      },
      {
        source: '/tile-engine/',
        destination: '/tile-engine/index.html',
      },
    ];
  },

  // SEO & Security Headers
  async headers() {
    return [
      {
        // Embeddable routes: Kiosk 3D Visualizer, Brand 3D Studio & JavaScript SDK
        source: '/(kiosk|tasarim|studio-sdk.js)(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com; frame-src 'self' https: https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' data: blob: https: https://*.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://accounts.google.com; worker-src 'self' blob:; frame-ancestors *;",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },
      {
        // Non-embeddable routes: strict SAMEORIGIN protection for Admin, Bayi, Marka and portal dashboards
        source: '/((?!kiosk|tasarim|studio-sdk\\.js).*)',
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com; frame-src 'self' https: https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' data: blob: https: https://*.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://accounts.google.com; worker-src 'self' blob:; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
