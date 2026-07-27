export const metadata = {
  title: "İletişim & Yetkili Bayi Başvurusu | SeramikBak",
  description: "SeramikBak müşteri hizmetleri ile iletişime geçin veya yetkili bayi başvurusunda bulunarak B2B bayi portalı ayrıcalıklarından hemen faydalanın.",
  alternates: { canonical: 'https://www.seramikbak.com/iletisim' },
  openGraph: {
    title: "İletişim & Yetkili Bayi Başvurusu | SeramikBak",
    description: "SeramikBak müşteri hizmetleri ile iletişime geçin veya yetkili bayi başvurusunda bulunarak B2B bayi portalı ayrıcalıklarından hemen faydalanın.",
    url: 'https://www.seramikbak.com/iletisim',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak'
  },
  twitter: { card: 'summary_large_image', title: 'İletişim & Yetkili Bayi Başvurusu | SeramikBak', description: 'SeramikBak müşteri hizmetleri ile iletişime geçin veya yetkili bayi başvurusunda bulunun.' },
  robots: { index: true, follow: true }
};

export default function Layout({ children }) {
  return children;
}
