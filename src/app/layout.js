import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.seramikbak.com"),
  title: {
    default: "SeramikBak | Türkiye'nin Seramik Arama Motoru, 3D Mekân & Bayi Ağı",
    template: "%s | SeramikBak"
  },
  description: "Binlerce seramik ve fayans modelini keşfedin, 3D odanızda canlı deneyin. 81 ildeki yetkili seramik bayilerinden anında ücretsiz fiyat teklifi ve usta desteği alın.",
  keywords: [
    // 16 Dev Türk Seramik Markası
    "çanakkale seramik", "ng kütahya seramik", "vitra seramik", "bien seramik", "yurtbay seramik",
    "seramiksan", "ege seramik", "qua granite", "duratiles", "decovita",
    "graniser", "güral seramik", "hitit seramik", "seranit", "termal seramik", "uşak seramik",
    
    // Turkish Core SEO Keywords
    "seramik sektöründe yapay zeka", "yapay zeka banyo tasarımı", "fotoğraftan seramik bulma", "görsel seramik arama",
    "akıllı seramik showroom", "AI ceramic visualizer", "tile visual search AI",
    "seramik", "fayans", "karo", "zemin kaplama", "duvar karosu", "seramik modelleri", "seramik fiyatları",
    "banyo seramik", "mutfak fayans", "3d sanal stüdyo", "seramik bak", "seramik bayi", "istanbul seramik bayi",
    "ankara seramik bayi", "izmir seramik bayi", "bursa seramik bayi", "antalya seramik bayi", "konya seramik bayi",

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
      "fr-FR": "https://www.seramikbak.com?lang=fr",
      "es-ES": "https://www.seramikbak.com?lang=es",
      "ar-SA": "https://www.seramikbak.com?lang=ar",
      "ru-RU": "https://www.seramikbak.com?lang=ru",
      "x-default": "https://www.seramikbak.com"
    },
  },
  openGraph: {
    title: "SeramikBak | Türkiye'nin Seramik Arama Motoru, 3D Mekân & Bayi Ağı",
    description: "Binlerce seramik ve fayans modelini keşfedin, 3D odanızda canlı deneyin. 81 ildeki yetkili seramik bayilerinden anında ücretsiz fiyat teklifi ve usta desteği alın.",
    url: "https://www.seramikbak.com",
    siteName: "SeramikBak",
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE", "fr_FR", "es_ES", "ar_SA", "ru_RU"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeramikBak - Seramik Arama Motoru & 3D Stüdyo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SeramikBak | Türkiye'nin Seramik Arama Motoru, 3D Mekân & Bayi Ağı",
    description: "Binlerce seramik ve fayans modelini keşfedin, 3D odanızda canlı deneyin. 81 ildeki yetkili bayilerden anında teklif alın.",
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
  verification: {
    google: "lzFkAOZfa_Y-zaO3BIE_v9ZJIuwdjiFCbx0HapjNy0Y",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SeramikBak Global",
  "alternateName": ["Seramik Bak", "SeramikBak International"],
  "url": "https://www.seramikbak.com",
  "inLanguage": ["tr-TR", "en-US", "de-DE", "fr-FR", "es-ES", "ar-SA", "ru-RU"],
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
  "description": "Türkiye'nin ve dünyanın önde gelen seramik markalarını buluşturan, yapay zeka destekli görsel arama, 3D Sanal Stüdyo ve AR desteği sunan uluslararası B2B2C seramik ekosistemi.",
  "knowsAbout": [
    "Artificial Intelligence in Ceramics",
    "Yapay Zeka Destekli Seramik Arama",
    "Fotoğraftan Karo Eşleştirme (Visual Tile Search)",
    "Web 3D Ceramic Room Visualizer",
    "Smart Tile Metraj & Waste Optimization",
    "Digital Ceramic Showroom Kiosk"
  ],
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

const siteNavigationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SiteNavigationElement",
      "name": "Seramik & Karo Kataloğu",
      "description": "Binlerce banyo, mutfak ve zemin seramik modelini filtreleyin ve keşfedin.",
      "url": "https://www.seramikbak.com/kategori/banyo-seramikleri"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "3D Mekânımda Gör",
      "description": "Odanızın fotoğrafını yükleyin veya 3D sanal banyoda seramik modellerini canlı deneyin.",
      "url": "https://www.seramikbak.com/mekanimda-gor"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Yetkili Seramik Bayileri",
      "description": "81 ildeki en yakın yetkili seramik bayilerini haritada bulun ve fiyat teklifi alın.",
      "url": "https://www.seramikbak.com/bayiler"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Seramik Ustaları Rehberi",
      "description": "Bölgenizdeki sertifikalı ve puanlanmış seramik ve fayans ustalarıyla iletişime geçin.",
      "url": "https://www.seramikbak.com/ustalar"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "B2B Proje & Teklif Al",
      "description": "Mimar ve müteahhitler için toptan seramik ve özel proje fiyat teklifleri oluşturun.",
      "url": "https://www.seramikbak.com/proje-talep"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Üretici Marka Portalı",
      "description": "Türkiye'nin lider seramik markaları, fabrika katalogları ve bayi ağı.",
      "url": "https://www.seramikbak.com/marka"
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
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import CatalogToast from "@/components/ui/CatalogToast";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${outfit.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SeramikBak" />
        <meta name="geo.region" content="TR" />
        <meta name="geo.placename" content="Türkiye" />
        <meta name="content-language" content="tr" />
        <meta name="google-site-verification" content="lzFkAOZfa_Y-zaO3BIE_v9ZJIuwdjiFCbx0HapjNy0Y" />
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.pathname.startsWith('/marka') || window.location.pathname.startsWith('/bayi') || window.location.pathname.startsWith('/admin')) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                    }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      reg.update();
                    }).catch(function(err) {
                      console.warn('SeramikBak ServiceWorker registration failed:', err);
                    });
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <CookieBanner />
          <PWAInstallPrompt />
          <CatalogToast />
        </LanguageProvider>
      </body>
    </html>
  );
}
