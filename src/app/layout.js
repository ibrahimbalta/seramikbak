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
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SeramikBak" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SeramikBak ServiceWorker registered:', reg.scope);
                  }).catch(function(err) {
                    console.warn('SeramikBak ServiceWorker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
