export const metadata = {
  title: "Seramik Outlet & Şantiye Fazlası Stok Borsası | SeramikBak",
  description: "Yetkili seramik bayilerinin depo seri sonu, proje fazlası ve 2. kalite kelepir palet seramiklerini inceleyin. %60'a varan indirimlerle doğrudan bayiden satın alın.",
  alternates: {
    canonical: "https://www.seramikbak.com/outlet",
  },
  openGraph: {
    title: "Seramik Outlet & Şantiye Fazlası Stok Borsası | SeramikBak",
    description: "Yetkili seramik bayilerinden depo seri sonu, şantiye fazlası ve indirimli kelepir seramik paletleri.",
    url: "https://www.seramikbak.com/outlet",
    type: "website",
    locale: "tr_TR",
    siteName: "SeramikBak",
    images: [
      {
        url: "https://www.seramikbak.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeramikBak Outlet Borsası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seramik Outlet & Fırsat Paletleri | SeramikBak",
    description: "Yetkili bayilerden kelepir proje fazlası ve seri sonu seramik stokları.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const outletCatalogSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "SeramikBak Canlı Outlet & Şantiye Fazlası Borsası",
  "description": "81 ildeki yetkili seramik bayilerinin şantiye artığı, proje fazlası ve depo seri sonu kelepir seramik paletleri pazaryeri.",
  "url": "https://www.seramikbak.com/outlet",
  "isPartOf": {
    "@type": "WebSite",
    "name": "SeramikBak Global",
    "url": "https://www.seramikbak.com",
  },
};

export default function OutletLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(outletCatalogSchema) }}
      />
      {children}
    </>
  );
}
