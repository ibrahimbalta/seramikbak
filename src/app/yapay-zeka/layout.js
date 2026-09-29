export const metadata = {
  title: "Seramik Sektöründe Yapay Zeka Teknolojileri & 3D Tasarım | SeramikBak AI",
  description: "Türkiye'nin ilk seramik yapay zekası: Fotoğraftan seramik modeli bulma, akıllı 3D banyo görselleştirici, AI karo tasarım danışmanı ve fire azaltan metraj hesaplama motoru.",
  keywords: [
    "seramik sektöründe yapay zeka",
    "yapay zeka banyo tasarımı",
    "fotoğraftan seramik bulma",
    "görsel seramik arama",
    "akıllı seramik showroom",
    "seramik görselleştirici",
    "AI ceramic visualizer",
    "tile visual search AI",
    "seramik metraj hesaplama",
    "3d seramik stüdyosu",
    "yapay zeka fayans eşleştirme"
  ],
  alternates: {
    canonical: 'https://www.seramikbak.com/yapay-zeka',
    languages: {
      'tr-TR': 'https://www.seramikbak.com/yapay-zeka',
      'en-US': 'https://www.seramikbak.com/yapay-zeka?lang=en',
      'de-DE': 'https://www.seramikbak.com/yapay-zeka?lang=de',
      'x-default': 'https://www.seramikbak.com/yapay-zeka'
    }
  },
  openGraph: {
    title: "Seramik Sektöründe Yapay Zeka Teknolojileri | SeramikBak AI",
    description: "Fotoğraftan seramik tanıma, akıllı 3D banyo simülatörü, AI mekan tasarım danışmanı ve fire azaltan metraj hesaplama ekosistemi.",
    url: 'https://www.seramikbak.com/yapay-zeka',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'SeramikBak Global',
    images: [
      {
        url: 'https://www.seramikbak.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Seramik Sektöründe Yapay Zeka - SeramikBak AI'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Seramik Sektöründe Yapay Zeka | SeramikBak AI",
    description: "Fotoğraftan seramik tanıma, 3D banyo simülatörü ve akıllı metraj motoru.",
    images: ['https://www.seramikbak.com/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function Layout({ children }) {
  return children;
}
