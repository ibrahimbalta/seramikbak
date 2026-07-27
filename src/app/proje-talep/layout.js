export const metadata = {
  title: "B2B Toplu Seramik & Proje Talepleri | SeramikBak",
  description: "Büyük ölçekli konut projeleri, oteller, restorasyonlar ve iş merkezleri için en iyi markalardan toplu seramik ve karo siparişi teklif talebi oluşturun.",
  alternates: { canonical: 'https://www.seramikbak.com/proje-talep' },
  openGraph: {
    title: "B2B Toplu Seramik & Proje Talepleri | SeramikBak",
    description: "Büyük ölçekli konut projeleri, oteller ve iş merkezleri için toplu seramik teklif talebi oluşturun.",
    url: 'https://www.seramikbak.com/proje-talep',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak'
  },
  twitter: { card: 'summary_large_image', title: 'B2B Toplu Seramik Talepleri | SeramikBak', description: 'Büyük projeler için toplu seramik teklif talebi oluşturun.' },
  robots: { index: true, follow: true }
};

export default function Layout({ children }) {
  return children;
}
