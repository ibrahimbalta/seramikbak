export const metadata = {
  title: "3D Seramik Mekân Görselleştirme & Sanal Showroom | SeramikBak",
  description: "Odanızın veya banyonuzun fotoğrafını yükleyin, binlerce seramik ve karo modelini 3D mekânınızda canlı deneyin. Satın almadan önce sanal ortamda görün.",
  alternates: {
    canonical: "https://www.seramikbak.com/mekanimda-gor",
  },
  openGraph: {
    title: "3D Seramik Mekân Görselleştirme | SeramikBak",
    description: "Kendi banyonuzda veya salonunuzda seramikleri 3D canlı deneyin. En uygun modeli seçip yetkili bayiden anında fiyat alın.",
    url: "https://www.seramikbak.com/mekanimda-gor",
    type: "website",
    locale: "tr_TR",
    siteName: "SeramikBak",
    images: [
      {
        url: "https://www.seramikbak.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SeramikBak 3D Mekân Görselleştirme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Seramik Mekân Görselleştirme | SeramikBak",
    description: "Odanızın fotoğrafını yükleyin, seramik modellerini 3D sanal stüdyoda anında deneyin.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const visualizerAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SeramikBak 3D Mekânımda Gör & Sanal Stüdyo",
  "operatingSystem": "All",
  "applicationCategory": "DesignApplication",
  "url": "https://www.seramikbak.com/mekanimda-gor",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TRY",
  },
  "description": "Kullanıcıların kendi odalarının fotoğraflarını yükleyerek veya hazır 3D banyo şablonlarında gerçek seramik karolarını uygulayabileceği interaktif sanal showroom aracı.",
  "creator": {
    "@type": "Organization",
    "name": "SeramikBak Global",
    "url": "https://www.seramikbak.com",
  },
};

export default function MekanimdaGorLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(visualizerAppSchema) }}
      />
      {children}
    </>
  );
}
