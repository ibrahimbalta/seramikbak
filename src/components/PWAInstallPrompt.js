'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    if (isIosDevice && isSafari) {
      setIsIOS(true);
    }

    // Check dismissed time
    const dismissedAt = localStorage.getItem('seramikbak_pwa_dismissed');
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (days < 5) return; // Hide for 5 days after dismissal
    }

    // Device detection: Mobile & Tablet check
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 1024;
    const isMobileOrTablet = isMobileUA || (isTouch && isSmallScreen);

    // Android / Chrome / Edge install prompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only automatically show prompt on mobile and tablet devices to keep desktop luxury UX clean
      if (isMobileOrTablet) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Global custom trigger so any button can open install prompt
    const handleCustomTrigger = () => {
      if (isIosDevice) {
        setShowIOSGuide(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            setShowPrompt(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        setShowPrompt(true);
      }
    };

    window.addEventListener('seramikbak:install-pwa', handleCustomTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('seramikbak:install-pwa', handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert('Tarayıcınızın sağ üst menüsünden (⋮ veya Ayarlar) "Uygulamayı Yükle" veya "Ana Ekrana Ekle" seçeneğini kullanabilirsiniz.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('seramikbak_pwa_dismissed', Date.now().toString());
  };

  if (isInstalled || (!showPrompt && !showIOSGuide)) {
    return null;
  }

  return (
    <>
      {/* Bottom Floating Install Banner */}
      {showPrompt && !showIOSGuide && (
        <div 
          className="pwa-mobile-install-banner"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '520px',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(9, 13, 22, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '16px 18px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            backdropFilter: 'blur(12px)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#090d16',
              border: '1.5px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}>
              <img src="/icon-192.png" alt="SeramikBak Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  SeramikBak Uygulaması
                </span>
                <span style={{ fontSize: '0.68rem', background: '#d4af37', color: '#090d16', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                  PRO
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Hızlı 3D giydirme ve anlık numune bildirimleri için ana ekrana ekleyin.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#090d16',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)'
              }}
            >
              <Download size={14} />
              <span>Yükle</span>
            </button>

            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>

        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            position: 'relative',
            color: '#fff',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)'
          }}>
            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Smartphone size={24} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                iPhone / iPad'e Nasıl Yüklenir?
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '18px' }}>
              Safari tarayıcısında SeramikBak'ı ana ekranınıza ekleyerek tıpkı App Store uygulaması gibi tam ekran ve bildirimlerle kullanabilirsiniz:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#d4af37', color: '#090d16', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem', flexShrink: 0 }}>1</span>
                <span>Safari alt menüsündeki <strong style={{ color: '#38bdf8' }}><Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Paylaş</strong> butonuna dokunun.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#d4af37', color: '#090d16', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem', flexShrink: 0 }}>2</span>
                <span>Açılan menüde aşağı kaydırıp <strong style={{ color: '#d4af37' }}><PlusSquare size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Ana Ekrana Ekle</strong> seçeneğine tıklayın.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#d4af37', color: '#090d16', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem', flexShrink: 0 }}>3</span>
                <span>Sağ üstteki <strong>"Ekle"</strong> butonuna basın. Uygulama ana ekranınıza gelecektir!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#090d16',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (min-width: 1025px) {
          .pwa-mobile-install-banner {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
