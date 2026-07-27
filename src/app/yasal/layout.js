export const metadata = {
  title: "Yasal Belgeler & Kullanım Koşulları | SeramikBak",
  description: "SeramikBak gizlilik politikası, KVKK aydınlatma metni, çerez politikası, kullanım şartları ve bayi üyelik sözleşmesi yasal metinleri.",
  alternates: { canonical: 'https://www.seramikbak.com/yasal' },
  openGraph: {
    title: "Yasal Belgeler & Kullanım Koşulları | SeramikBak",
    description: "SeramikBak gizlilik politikası, KVKK aydınlatma metni, çerez politikası ve kullanım şartları.",
    url: 'https://www.seramikbak.com/yasal',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak'
  },
  twitter: { card: 'summary', title: 'Yasal Belgeler | SeramikBak', description: 'SeramikBak yasal metinleri ve kullanım koşulları.' },
  robots: { index: true, follow: true, 'max-snippet': -1 }
};

export default function Layout({ children }) {
  return children;
}
