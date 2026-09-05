'use client';

import { useEffect, useState, useRef } from 'react';
import { Camera, Sparkles, QrCode, X, ExternalLink, Layers, Smartphone, Maximize2 } from 'lucide-react';
import * as THREE from 'three';
import { cropWhiteBorders } from '../utils/imageTextureUtils';

export default function ModelViewerAR({ product, onClose, onLaunchWebAR }) {
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [glbUrl, setGlbUrl] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const desktopCanvasRef = useRef(null);

  const tileWidthM = (product?.width || 60) / 100;
  const tileHeightM = (product?.height || 120) / 100;

  // Load Google <model-viewer> web component dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);

      if (window.customElements.get('model-viewer')) {
        setModelViewerLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      script.onload = () => setModelViewerLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  // Generate procedural 3D GLB model matching exact physical tile dimensions
  useEffect(() => {
    let active = true;

    const generateTileGLB = async () => {
      try {
        const scene = new THREE.Scene();
        const geometry = new THREE.BoxGeometry(tileWidthM, 0.012, tileHeightM);

        let texture;
        if (product?.imageUrl || product?.textureUrl) {
          const loader = new THREE.TextureLoader();
          const imgPath = product.textureUrl || product.imageUrl;
          const src = imgPath.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(imgPath)}` : imgPath;
          texture = await new Promise((resolve) => {
            loader.load(src, (tex) => {
              if (tex && tex.image) {
                const cleanImg = cropWhiteBorders(tex.image);
                const canvasTex = new THREE.CanvasTexture(cleanImg);
                canvasTex.wrapS = THREE.RepeatWrapping;
                canvasTex.wrapT = THREE.RepeatWrapping;
                resolve(canvasTex);
              } else {
                resolve(tex);
              }
            }, undefined, () => resolve(null));
          });
        }

        const material = new THREE.MeshStandardMaterial({
          color: texture ? 0xffffff : (product?.color?.toLowerCase().includes('antrasit') ? 0x22252a : 0xe2e8f0),
          map: texture || null,
          roughness: product?.finish === 'Parlak' ? 0.1 : 0.6,
          metalness: 0.05
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Dynamically import GLTFExporter
        const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();
        
        exporter.parse(
          scene,
          (gltf) => {
            if (!active) return;
            const blob = new Blob([gltf], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            setGlbUrl(url);
          },
          (err) => console.error('GLTF Export Error:', err),
          { binary: true }
        );
      } catch (err) {
        console.error('3D Model generation error:', err);
      }
    };

    generateTileGLB();

    return () => {
      active = false;
    };
  }, [product]);

  // Desktop WebGL 3D Preview Renderer
  useEffect(() => {
    if (!desktopCanvasRef.current || glbUrl) return;

    const width = desktopCanvasRef.current.clientWidth || 400;
    const height = desktopCanvasRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
    camera.position.set(0, 1.2, 1.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    desktopCanvasRef.current.innerHTML = '';
    desktopCanvasRef.current.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const geometry = new THREE.BoxGeometry(tileWidthM, 0.015, tileHeightM);
    const material = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.3 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [glbUrl, product]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&color=c5a059&bgcolor=0f172a`;

  return (
    <div className="ar-modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="ar-modal-box glass-panel" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#0f172a',
        border: '1px solid var(--accent-gold)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        color: '#fff'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(197, 160, 89, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>
                1:1 Canlı AR Modu (Evinizde Görün)
              </h4>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                {product?.name || 'Seramik Karo'} • {product?.width}x{product?.height} cm Gerçek Ölçek
              </span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 3D / AR Viewer Container */}
        <div style={{ position: 'relative', width: '100%', height: '360px', backgroundColor: '#020617' }}>
          {modelViewerLoaded && glbUrl ? (
            <model-viewer
              src={glbUrl}
              alt={`${product?.name || 'Seramik'} 3D Model`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1.5"
              touch-action="pan-y"
              style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}
            >
              <button 
                slot="ar-button"
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '12px 24px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  boxShadow: '0 8px 25px rgba(197, 160, 89, 0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  zIndex: 20
                }}
              >
                <Camera size={18} />
                <span>📷 Kamerayla Yere Yerleştir (AR)</span>
              </button>
            </model-viewer>
          ) : (
            <div ref={desktopCanvasRef} style={{ width: '100%', height: '100%' }} />
          )}

          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.65rem',
            color: 'var(--accent-gold)',
            fontWeight: '700',
            border: '1px solid rgba(197, 160, 89, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} />
            <span>1:1 FİZİKSEL GERÇEK ÖLÇEK</span>
          </div>
        </div>

        {/* Footer Controls & Info */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Google Play Hizmetleri gerektirmeyen canlı kamera tarayıcısı için:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {onLaunchWebAR && (
                <button
                  onClick={() => {
                    onClose();
                    onLaunchWebAR(product);
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} />
                  <span>📷 WebAR Scanner Aç</span>
                </button>
              )}

              <button 
                onClick={() => setShowQrModal(true)}
                style={{
                  fontSize: '0.75rem',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(197, 160, 89, 0.15)',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <QrCode size={14} />
                <span>Telefondan Okut (QR)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Desktop Users */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--accent-gold)',
            textAlign: 'center',
            maxWidth: '360px',
            width: '100%',
            position: 'relative',
            color: '#fff'
          }}>
            <button 
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <QrCode size={28} style={{ color: 'var(--accent-gold)', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '800' }}>
              Telefonunuzla Okutun
            </h4>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Kameranızla bu QR kodu okutun, telefonunuz açıldığında 1:1 AR kamerası otomatik aktifleşsin.
            </p>

            <div style={{
              background: '#fff',
              padding: '12px',
              borderRadius: '12px',
              display: 'inline-block',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
            }}>
              <img src={qrCodeUrl} alt="AR QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
            </div>

            <button 
              onClick={() => setShowQrModal(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-gold)',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Tamamdır
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
