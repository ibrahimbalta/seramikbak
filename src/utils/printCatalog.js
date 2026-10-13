/**
 * printCatalog.js
 * Professional pre-flight checks and asset loader before invoking window.print().
 * Ensures:
 * 1. Web fonts (document.fonts) are fully loaded and rendered.
 * 2. All imagery (textures, product slabs, QR codes, logos) are loaded and decoded.
 * 3. Repaint settled before the OS print dialog opens.
 * 4. Graceful fallback on timeout or unsupported environments.
 */

export async function prepareAndPrintCatalog({
  stageId = 'catalog-print-stage',
  timeoutMs = 6000,
  onProgress
} = {}) {
  if (typeof window === 'undefined') return;

  try {
    onProgress?.({ stage: 'fonts', message: 'Yazı tipleri yükleniyor...' });

    // 1. Wait for document fonts
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((res) => setTimeout(res, 2500))
      ]);
    }

    onProgress?.({ stage: 'images', message: 'Yüksek çözünürlüklü görseller hazırlanıyor...' });

    // 2. Wait for all target images
    const targetContainer = (stageId && document.getElementById(stageId)) || document.body;
    const images = Array.from(targetContainer.querySelectorAll('img'));
    const pendingImages = images.filter((img) => !img.complete && img.src);

    if (pendingImages.length > 0) {
      const imagePromises = pendingImages.map((img) => {
        return new Promise((resolve) => {
          if (img.complete) return resolve();
          const cleanup = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            resolve();
          };
          const onLoad = cleanup;
          const onError = cleanup;
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
          // Attempt decode if browser supports it
          if (typeof img.decode === 'function') {
            img.decode().then(resolve).catch(resolve);
          }
        });
      });

      await Promise.race([
        Promise.all(imagePromises),
        new Promise((res) => setTimeout(res, timeoutMs))
      ]);
    }

    onProgress?.({ stage: 'rendering', message: 'Baskı sayfaları işleniyor...' });

    // 3. Short delay for style/layout recalculation and reflow
    await new Promise((res) => setTimeout(res, 150));

    onProgress?.({ stage: 'ready', message: 'Yazdırma penceresi açılıyor...' });

    // 4. Trigger system print dialog
    window.print();
  } catch (err) {
    console.warn('[prepareAndPrintCatalog] Print pre-flight warning:', err);
    window.print();
  }
}
