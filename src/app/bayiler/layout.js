export const metadata = {
  title: "81 İl Yetkili Seramik Bayileri & Showroom Rehberi | SeramikBak",
  description: "Türkiye genelindeki yetkili seramik bayilerini haritada bulun. Vitra, Kütahya, Çanakkale, Bien ve tüm markalardan anında güncel stok ve fiyat teklifi alın.",
  alternates: {
    canonical: 'https://www.seramikbak.com/bayiler',
  },
  openGraph: {
    title: "81 İl Yetkili Seramik Bayileri & Showroom Rehberi | SeramikBak",
    description: "Türkiye genelindeki yetkili seramik bayilerini haritada bulun. Vitra, Kütahya, Çanakkale, Bien ve tüm markalardan anında güncel stok ve fiyat teklifi alın.",
    url: 'https://www.seramikbak.com/bayiler',
    siteName: 'SeramikBak',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '81 İl Yetkili Seramik Bayileri | SeramikBak',
    description: 'Türkiye genelindeki yetkili seramik bayilerini haritada bulun ve güncel teklif alın.',
  },
};

const bayilerDirectorySchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': 'Türkiye Yetkili Seramik Bayileri & Showroom Rehberi',
  'description': '81 ilde yetkili seramik üretici bayileri, showroom adresleri, canlı stok durumu ve doğrudan iskontolu fiyat teklifleri.',
  'url': 'https://www.seramikbak.com/bayiler',
  'isPartOf': {
    '@type': 'WebSite',
    'name': 'SeramikBak Global',
    'url': 'https://www.seramikbak.com'
  }
};

export default function BayilerLayout({ children }) {
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bayilerDirectorySchema) }}
      />
      {children}
    </div>
  );
}
