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
    default: "SeramikBak | Akıllı Seramik Arama Motoru, 3D Sanal Stüdyo & AR Portalı",
    template: "%s | SeramikBak"
  },
  description: "Türkiye'nin lider seramik markalarını (Kütahya, Bien, Ege, Güral) tek çatı altında toplayan, Web 3D Sanal Stüdyo ve AR (Artırılmış Gerçeklik) entegrasyonu sunan yeni nesil B2B2C seramik pazar yeri.",
  keywords: [
    "seramik", "fayans", "karo", "zemin kaplama", "duvar karosu",
    "banyo seramik", "mutfak fayans", "3d sanal stüdyo", "seramik bak",
    "kütahya seramik", "bien seramik", "ege seramik", "güral seramik",
    "seramik fiyatları", "seramik modelleri", "banyo tasarımı",
    "artırılmış gerçeklik", "AR", "seramik pazar yeri",
    "seramik bayi", "seramik showroom", "online seramik",
    "seramik karşılaştırma", "seramik teklif"
  ],
  authors: [{ name: "SeramikBak", url: "https://www.seramikbak.com" }],
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
    },
  },
  openGraph: {
    title: "SeramikBak | Akıllı Seramik Arama Motoru, 3D Sanal Stüdyo & AR Portalı",
    description: "Türkiye'nin lider seramik markalarını tek çatı altında toplayan, Web 3D Sanal Stüdyo ve AR entegrasyonu sunan yeni nesil B2B2C seramik pazar yeri.",
    url: "https://www.seramikbak.com",
    siteName: "SeramikBak",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeramikBak - Akıllı Seramik Arama Motoru",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SeramikBak | Akıllı Seramik Arama Motoru",
    description: "Türkiye'nin lider seramik markalarını tek çatı altında toplayan yeni nesil B2B2C seramik pazar yeri.",
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
  verification: {
    // Google Search Console ve Bing doğrulama kodları buraya eklenecek
    // google: 'GOOGLE_VERIFICATION_CODE',
    // yandex: 'YANDEX_VERIFICATION_CODE',
  },
  category: "shopping",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SeramikBak",
  "alternateName": "Seramik Bak",
  "url": "https://www.seramikbak.com",
  "inLanguage": "tr-TR",
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
  "name": "SeramikBak",
  "url": "https://www.seramikbak.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.seramikbak.com/icon-512.png",
    "width": 512,
    "height": 512
  },
  "description": "Türkiye'nin lider seramik markalarını tek çatı altında toplayan, Web 3D Sanal Stüdyo ve AR (Artırılmış Gerçeklik) entegrasyonu sunan yeni nesil B2B2C seramik arama motoru ve pazar yeri.",
  "sameAs": [
    "https://www.instagram.com/seramikbak",
    "https://www.facebook.com/seramikbak",
    "https://twitter.com/seramikbak"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "müşteri desteği",
    "email": "destek@seramikbak.com",
    "availableLanguage": "Turkish"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Türkiye"
  }
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
        </LanguageProvider>
      </body>
    </html>
  );
}
