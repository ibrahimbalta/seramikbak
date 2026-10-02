export const metadata = {
  title: "Yetkili Seramik Bayileri ve Showroom Rehberi | SeramikBak",
  alternates: {
    canonical: 'https://www.seramikbak.com/bayiler',
  },
  openGraph: {
    title: "Yetkili Seramik Bayileri ve Showroom Rehberi | SeramikBak",
    description: "Türkiye genelindeki yetkili seramik bayilerini keşfedin. Showroom ziyareti, stok sorgulama ve fiyat teklifi alın.",
    url: 'https://www.seramikbak.com/bayiler',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yetkili Seramik Bayileri | SeramikBak',
    description: 'Türkiye genelindeki yetkili seramik bayilerini keşfedin.',
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
