import "./globals.css";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.seramikbak.com"),
  title: {
    default: "SeramikBak | Global Ceramic Tile Engine, 3D Room Visualizer & B2B Portal",
    template: "%s | SeramikBak Global"
  },
  description: "Türkiye'nin ve dünyanın önde gelen seramik markalarını (Kütahya, Bien, Ege, Güral, Vitra) tek platformda sunan, Web 3D Sanal Stüdyo ve AR (Artırılmış Gerçeklik) destekli uluslararası seramik arama motoru ve ihracat portalı.",
  keywords: [
    // Turkish SEO Keywords
    "seramik", "fayans", "karo", "zemin kaplama", "duvar karosu",
    "banyo seramik", "mutfak fayans", "3d sanal stüdyo", "seramik bak",
    "kütahya seramik", "bien seramik", "ege seramik", "güral seramik", "vitra seramik",
    "seramik fiyatları", "seramik modelleri", "banyo tasarımı",
    "artırılmış gerçeklik", "AR", "seramik pazar yeri",
    "seramik bayi", "seramik showroom", "online seramik", "seramik ihracat",

    // Global English SEO Keywords
    "ceramic tiles", "porcelain tiles", "wall tiles", "floor tiles",
    "bathroom tile design", "marble porcelain slabs", "3D room visualizer",
    "Turkish ceramics export", "tile suppliers", "porcelain tiles wholesale",

    // German SEO Keywords (DE)
    "Keramikfliesen", "Feinsteinzeug", "Wandfliesen", "Bodenfliesen",
    "Badfliesen", "Marmorfliesen", "Türkische Keramik Export",

    // Arabic SEO Keywords (AR)
    "سيراميك", "بلاط", "سيراميك الحمامات", "سيراميك الأرضيات",
    "سيراميك تركي", "بلاط بورسلين", "تصدير السيراميك",

    // Russian SEO Keywords (RU)
    "Керамическая плитка", "керамогранит", "плитка для ванной",
    "напольная плитка", "турецкая плитка", "экспорт плитки"
  ],
  authors: [{ name: "SeramikBak Global", url: "https://www.seramikbak.com" }],
  creator: "SeramikBak",
  publisher: "SeramikBak",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.seramikbak.com",
    languages: {
      "tr-TR": "https://www.seramikbak.com",
      "en-US": "https://www.seramikbak.com?lang=en",
      "de-DE": "https://www.seramikbak.com?lang=de",
      "ar-SA": "https://www.seramikbak.com?lang=ar",
      "ru-RU": "https://www.seramikbak.com?lang=ru",
      "x-default": "https://www.seramikbak.com"
    },
  },
  openGraph: {
    title: "SeramikBak | Global Ceramic Tile Engine & 3D Visualizer",
    description: "Discover Turkish ceramic tile collections worldwide. Interactive 3D room visualizer, AR preview, and direct authorized dealer network.",
    url: "https://www.seramikbak.com",
    siteName: "SeramikBak Global",
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE", "ar_SA", "ru_RU"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeramikBak Global - Ceramic Tile Search Engine & 3D Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SeramikBak Global | Ceramic Tile Search Engine",
    description: "Explore top ceramic & porcelain tile brands worldwide with 3D Room Visualizer and AR portal.",
    images: ["/og-image.png"],
    creator: "@seramikbak",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "shopping",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SeramikBak"
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SeramikBak Global",
  "alternateName": ["Seramik Bak", "SeramikBak International"],
  "url": "https://www.seramikbak.com",
  "inLanguage": ["tr-TR", "en-US", "de-DE", "ar-SA", "ru-RU"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.seramikbak.com/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SeramikBak Global",
  "url": "https://www.seramikbak.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.seramikbak.com/icon-512.png",
    "width": 512,
    "height": 512
  },
  "description": "Türkiye'nin ve dünyanın önde gelen seramik markalarını buluşturan, 3D Sanal Stüdyo ve AR desteği sunan uluslararası B2B2C seramik platformu.",
  "sameAs": [
    "https://www.instagram.com/seramikbak",
    "https://www.facebook.com/seramikbak",
    "https://twitter.com/seramikbak"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "destek@seramikbak.com",
      "availableLanguage": ["Turkish", "English", "German", "Arabic", "Russian"]
    }
  ],
  "areaServed": [
    { "@type": "Country", "name": "Turkey" },
    { "@type": "Country", "name": "Germany" },
    { "@type": "Country", "name": "United States" },
    { "@type": "Country", "name": "Saudi Arabia" },
    { "@type": "Country", "name": "United Arab Emirates" },
    { "@type": "Country", "name": "Russia" },
    { "@type": "Country", "name": "United Kingdom" }
  ]
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Ana Sayfa",
      "item": "https://www.seramikbak.com"
    }
  ]
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

import { LanguageProvider } from "@/lib/languageContext";
import CookieBanner from "@/components/CookieBanner";

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SeramikBak" />
        <meta name="geo.region" content="TR" />
        <meta name="geo.placename" content="Türkiye" />
        <meta name="content-language" content="tr" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SeramikBak ServiceWorker registered:', reg.scope);
                  }).catch(function(err) {
                    console.warn('SeramikBak ServiceWorker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
