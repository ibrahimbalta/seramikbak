export const metadata = {
  title: "B2B Marka Portal Girişi | SeramikBak",
  description: "Seramik üretici markaları için B2B yönetim paneli. Sponsorlu kampanya yönetimi ve bölgesel pazar trendleri analizi.",
  alternates: { canonical: 'https://www.seramikbak.com/marka' },
  openGraph: {
    title: "B2B Marka Portal Girişi | SeramikBak",
    description: "Seramik üretici markaları için B2B yönetim paneli. Sponsorlu kampanya yönetimi ve bölgesel pazar trendleri analizi.",
    url: 'https://www.seramikbak.com/marka',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak'
  },
  twitter: { card: 'summary_large_image', title: 'B2B Marka Portal Girişi | SeramikBak', description: 'Seramik üretici markaları için B2B yönetim paneli ve kampanya yönetimi.' },
  robots: { index: true, follow: true }
};

export default function Layout({ children }) {
  return children;
}
