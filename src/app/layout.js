import "./globals.css";

export const metadata = {
  title: "SeramikBak | Akıllı Seramik Arama Motoru, 3D Sanal Stüdyo & AR Portalı",
  description: "Türkiye'nin lider seramik markalarını (Kütahya, Bien, Ege, Güral) tek çatı altında toplayan, Web 3D Sanal Stüdyo ve AR (Artırılmış Gerçeklik) entegrasyonu sunan yeni nesil B2B2C seramik pazar yeri.",
  keywords: "seramik, fayans, 3d sanal stüdyo, seramik bak, kütahya seramik, bien seramik, ege seramik, güral seramik, zemin kaplama, banyo tasarımı, artırılmış gerçeklik, AR, pazar yeri",
  authors: [{ name: "SeramikBak Geliştirme Ekibi" }]
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
