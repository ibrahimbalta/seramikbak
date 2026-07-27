export const metadata = {
  title: "Yetkili Seramik Bayileri & Showroom Rehberi | SeramikBak",
  description: "Türkiye genelindeki yetkili Kütahya, Bien, Ege ve Güral Seramik bayilerini keşfedin. Showroom ziyareti, stok sorgulama ve fiyat teklifi alın.",
  alternates: { canonical: 'https://www.seramikbak.com/bayi' },
  openGraph: {
    title: "Yetkili Seramik Bayileri & Showroom Rehberi | SeramikBak",
    description: "Türkiye genelindeki yetkili seramik bayilerini keşfedin. Showroom ziyareti, stok sorgulama ve fiyat teklifi alın.",
    url: 'https://www.seramikbak.com/bayi',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak'
  },
  twitter: { card: 'summary_large_image', title: 'Yetkili Seramik Bayileri | SeramikBak', description: 'Türkiye genelindeki yetkili seramik bayilerini keşfedin.' },
  robots: { index: true, follow: true }
};

export default function Layout({ children }) {
  return children;
}
