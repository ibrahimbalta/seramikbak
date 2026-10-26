export const metadata = {
  title: "Yetkili Seramik & Fayans Ustası Bul | 81 İl Usta Rehberi | SeramikBak",
  description: "Bölgenizdeki sertifikalı, puanlanmış ve tecrübeli seramik, fayans ustalarıyla doğrudan iletişime geçin. Ücretsiz keşif ve garantili işçilik teklifi alın.",
  alternates: {
    canonical: "https://www.seramikbak.com/ustalar",
  },
  openGraph: {
    title: "Yetkili Seramik & Fayans Ustası Bul | SeramikBak",
    description: "Türkiye genelinde güvenilir, puanlanmış seramik ve fayans ustaları. Fotoğraflı iş portfolyolarını inceleyin, hemen fiyat teklifi isteyin.",
    url: "https://www.seramikbak.com/ustalar",
    type: "website",
    locale: "tr_TR",
    siteName: "SeramikBak",
    images: [
      {
        url: "https://www.seramikbak.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeramikBak Usta Rehberi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yetkili Seramik Ustaları | SeramikBak",
    description: "Bölgenizdeki sertifikalı seramik ve fayans ustalarıyla doğrudan iletişime geçin.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ustalarDirectorySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.seramikbak.com/ustalar#webpage",
      "name": "Türkiye Seramik & Fayans Ustası Rehberi | SeramikBak",
      "description": "81 ilde seramik, granit, vitrifiye ve kalebodur montajı yapan puanlanmış ustalar ve usta profilleri.",
      "url": "https://www.seramikbak.com/ustalar",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.seramikbak.com/#website",
        "name": "SeramikBak",
        "url": "https://www.seramikbak.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.seramikbak.com/ustalar#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana Sayfa",
          "item": "https://www.seramikbak.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Seramik Ustaları",
          "item": "https://www.seramikbak.com/ustalar"
        }
      ]
    }
  ]
};

export default function UstalarLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ustalarDirectorySchema) }}
      />
      {children}
    </>
  );
}
