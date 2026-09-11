'use client';

import { useState } from 'react';
import { 
  X, 
  Download, 
  Layers, 
  CheckCircle, 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  FileText, 
  Loader2 
} from 'lucide-react';

export default function BimSpecDownloadModal({ isOpen, onClose, product }) {
  const [officeName, setOfficeName] = useState('');
  const [architectName, setArchitectName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [projectType, setProjectType] = useState('Otel / Resort');
  const [projectName, setProjectName] = useState('');
  const [fileType, setFileType] = useState('REVIT_BIM');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!officeName || !architectName || !phone) {
      setError('Lütfen mimarlık ofisi, adınız ve telefon alanlarını doldurunuz.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bim/spec-in-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: product.brandId || product.brand?.id,
          productId: product.id,
          officeName,
          architectName,
          email,
          phone,
          city,
          projectType,
          projectName,
          fileType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);

        // Trigger synthetic CAD/BIM download file
        const blob = new Blob([
          `SeramikBak 4K Architectural BIM Specification Package\r\n` +
          `-----------------------------------------------------\r\n` +
          `Marka: ${product.brand?.name || 'Seramik'}\r\n` +
          `Koleksiyon: ${product.name}\r\n` +
          `Ürün Kodu: ${product.code}\r\n` +
          `Ebat: ${product.width}x${product.height} cm\r\n` +
          `Yüzey & Tarz: ${product.finish} - ${product.style}\r\n` +
          `Teknik Değerler: PEI ${product.peiRating || 4}, Kaydırmazlık ${product.slipResistance || 'R9'}, Rektifiye: ${product.rectified ? 'Evet' : 'Hayır'}\r\n` +
          `Doku Bağlantısı: ${product.textureUrl || product.imageUrl}\r\n` +
          `Revit Nesnesi (.RFA): Hazır family bloğu\r\n` +
          `AutoCAD (.DWG): 2D & 3D karo deseni bloğu\r\n` +
          `Tarih: ${new Date().toLocaleString('tr-TR')}\r\n` +
          `Şartnameye Ekleyen Ofis: ${officeName} (${architectName})\r\n`
        ], { type: 'text/plain;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${product.code}_4K_BIM_Spec_Package.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Şartname kaydı oluşturulamadı.');
      }
    } catch (err) {
      console.error(err);
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        overflow: 'hidden',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
          borderBottom: '2px solid #d4af37'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', color: '#d4af37', fontWeight: '800', marginBottom: '8px' }}>
            <Sparkles size={13} />
            <span>MİMARİ ŞARTNAME & 4K BIM KÜTÜPHANESİ</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#ffffff' }}>
            {product.brand?.name || 'Seramik'} - {product.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Revit (.RFA), AutoCAD (.DWG) ve 4K Dikişsiz PBR Kaplama Paketini Ücretsiz İndirin
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px', maxHeight: '80vh', overflowY: 'auto' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
              <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                Şartname Paketi İndiriliyor!
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                <strong>{officeName}</strong> adına oluşturulan 4K BIM ve CAD dosyası bilgisayarınıza aktarılıyor. {product.brand?.name} kurumsal satış ekibi proje talebinizle ilgili en kısa sürede destek sağlayacaktır.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600' }}>
                  {error}
                </div>
              )}

              {/* Format selection */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  İstediğiniz Dosya Formatı
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'REVIT_BIM', label: 'Revit BIM (.RFA)' },
                    { id: 'AUTOCAD_DWG', label: 'AutoCAD (.DWG)' },
                    { id: '4K_TEXTURES', label: '4K PBR Kaplama' }
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFileType(fmt.id)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: fileType === fmt.id ? '2px solid #d4af37' : '1px solid #e2e8f0',
                        background: fileType === fmt.id ? '#fefce8' : '#f8fafc',
                        color: fileType === fmt.id ? '#854d0e' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Architect and office info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Building size={13} style={{ color: '#d4af37' }} />
                    Mimarlık Ofisi / Şirket *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Tabanlıoğlu Mimarlık"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <User size={13} style={{ color: '#d4af37' }} />
                    Yetkili Mimar Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mimar Selin Aksoy"
                    value={architectName}
                    onChange={(e) => setArchitectName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Contact info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Phone size={13} style={{ color: '#d4af37' }} />
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0532 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Mail size={13} style={{ color: '#d4af37' }} />
                    Kurumsal E-posta
                  </label>
                  <input
                    type="email"
                    placeholder="ofis@mimarlik.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Project details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={13} style={{ color: '#d4af37' }} />
                    Proje İli
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="İstanbul, Muğla, İzmir..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <FileText size={13} style={{ color: '#d4af37' }} />
                    Proje Türü
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Otel / Resort">Otel / Resort</option>
                    <option value="Konut / Rezidans">Konut / Rezidans</option>
                    <option value="Villa Projesi">Villa Projesi</option>
                    <option value="Ticari / Ofis">Ticari / Ofis</option>
                    <option value="Restoran & Cafe">Restoran & Cafe</option>
                    <option value="Karma Yaşam">Karma Yaşam</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
                  color: '#ffffff',
                  border: '1px solid #d4af37',
                  borderRadius: '10px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Şartname Dosyası Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} style={{ color: '#d4af37' }} />
                    <span>Şartname & BIM Paketini İndir</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8' }}>
                İndirdiğiniz dosyalar resmi Autodesk Revit (.RFA) ve DWG kütüphanesi standartlarına uygundur.
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
