export const metadata = {
  title: "Yetkili Seramik Bayileri ve Showroom Rehberi | SeramikBak",
  description: "Türkiye genelindeki yetkili Kütahya, Bien, Vitra, Ege ve Qua Seramik bayilerini keşfedin. Showroom adresi, stok sorgulama ve doğrudan fiyat teklifi alın.",
  openGraph: {
    title: "Yetkili Seramik Bayileri ve Showroom Rehberi | SeramikBak",
    description: "Türkiye genelindeki yetkili seramik bayilerini keşfedin. Showroom ziyareti, stok sorgulama ve fiyat teklifi alın.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yetkili Seramik Bayileri | SeramikBak',
    description: 'Türkiye genelindeki yetkili seramik bayilerini keşfedin.',
  },
};

export default function BayilerLayout({ children }) {
  return <>{children}</>;
}
