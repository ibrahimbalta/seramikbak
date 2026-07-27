export const metadata = {
  title: "Seramik İlham Galerisi & Tasarım Fikirleri | SeramikBak",
  description: "En trend banyo tasarımı, mutfak fayans kombinleri ve lüks seramik modellerini içeren tasarım galerimizden ilham alın.",
  alternates: { canonical: 'https://www.seramikbak.com/ilham' },
  openGraph: {
    title: "Seramik İlham Galerisi & Tasarım Fikirleri | SeramikBak",
    description: "En trend banyo tasarımı, mutfak fayans kombinleri ve lüks seramik modellerini içeren tasarım galerimizden ilham alın.",
    url: 'https://www.seramikbak.com/ilham',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak'
  },
  twitter: { card: 'summary_large_image', title: 'Seramik İlham Galerisi | SeramikBak', description: 'En trend banyo ve mutfak seramik tasarım fikirleri.' },
  robots: { index: true, follow: true }
};

export default function Layout({ children }) {
  return children;
}
