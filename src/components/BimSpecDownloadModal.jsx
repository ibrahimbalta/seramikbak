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
  Loader2,
  ChevronDown
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
    <div className="bim-modal-backdrop" onClick={onClose}>
      <div className="bim-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bim-modal-header">
          {/* Top Bar with Badge & Symmetrical Close Button */}
          <div className="bim-modal-header-top">
            <div className="bim-badge">
              <Sparkles size={13} className="bim-sparkle-icon" />
              <span>MİMARİ ŞARTNAME & 4K BIM</span>
            </div>
            <button 
              type="button"
              className="bim-close-btn" 
              onClick={onClose}
              aria-label="Kapat"
            >
              <X size={17} />
            </button>
          </div>

          <h3 className="bim-modal-title">
            <span className="brand-name">{product.brand?.name || 'Seramik'}</span>
            <span className="title-sep"> — </span>
            <span className="prod-name">{product.name}</span>
          </h3>
          <p className="bim-modal-subtitle">
            Revit (.RFA), AutoCAD (.DWG) ve 4K Dikişsiz PBR Kaplama Paketini Ücretsiz İndirin
          </p>
        </div>

        {/* Content Body */}
        <div className="bim-modal-body">
          {success ? (
            <div className="bim-success-view">
              <div className="bim-success-icon-wrap">
                <CheckCircle size={52} className="bim-success-icon" />
              </div>
              <h4 className="bim-success-title">
                Şartname Paketi İndiriliyor!
              </h4>
              <p className="bim-success-desc">
                <strong>{officeName}</strong> adına oluşturulan 4K BIM ve CAD dosyası cihazınıza aktarılıyor. {product.brand?.name} yetkili proje ekibi teknik şartname desteği için sizinle iletişime geçecektir.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bim-form">
              
              {error && (
                <div className="bim-error-alert">
                  {error}
                </div>
              )}

              {/* Format selection */}
              <div className="bim-field-group">
                <label className="bim-section-label">
                  İstediğiniz Dosya Formatı
                </label>
                <div className="bim-format-grid">
                  {[
                    { id: 'REVIT_BIM', label: 'Revit BIM', ext: '(.RFA)' },
                    { id: 'AUTOCAD_DWG', label: 'AutoCAD', ext: '(.DWG)' },
                    { id: '4K_TEXTURES', label: '4K PBR', ext: 'Kaplama' }
                  ].map(fmt => {
                    const isSelected = fileType === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setFileType(fmt.id)}
                        className={`bim-format-card ${isSelected ? 'active' : ''}`}
                      >
                        <span className="fmt-main">{fmt.label}</span>
                        <span className="fmt-ext">{fmt.ext}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Architect and office info */}
              <div className="bim-fields-row">
                <div className="bim-input-wrapper">
                  <label className="bim-label">
                    <Building size={14} className="bim-label-icon" />
                    <span>Mimarlık Ofisi / Şirket *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Tabanlıoğlu Mimarlık"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    className="bim-input"
                  />
                </div>

                <div className="bim-input-wrapper">
                  <label className="bim-label">
                    <User size={14} className="bim-label-icon" />
                    <span>Yetkili Mimar Adı *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mimar Selin Aksoy"
                    value={architectName}
                    onChange={(e) => setArchitectName(e.target.value)}
                    className="bim-input"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="bim-fields-row">
                <div className="bim-input-wrapper">
                  <label className="bim-label">
                    <Phone size={14} className="bim-label-icon" />
                    <span>Telefon Numarası *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0532 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bim-input"
                  />
                </div>

                <div className="bim-input-wrapper">
                  <label className="bim-label">
                    <Mail size={14} className="bim-label-icon" />
                    <span>Kurumsal E-posta</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ofis@mimarlik.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bim-input"
                  />
                </div>
              </div>

              {/* Project details - Always 2 columns & perfectly aligned */}
              <div className="bim-fields-row bim-fields-row-2col">
                <div className="bim-input-wrapper">
                  <label className="bim-label">
                    <MapPin size={14} className="bim-label-icon" />
                    <span>Proje İli</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="İstanbul, İzmir..."
                    className="bim-input"
                  />
                </div>

                <div className="bim-input-wrapper">
                  <label className="bim-label">
                    <FileText size={14} className="bim-label-icon" />
                    <span>Proje Türü</span>
                  </label>
                  <div className="bim-select-container">
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="bim-select"
                    >
                      <option value="Otel / Resort">Otel / Resort</option>
                      <option value="Konut / Rezidans">Konut / Rezidans</option>
                      <option value="Villa Projesi">Villa Projesi</option>
                      <option value="Ticari / Ofis">Ticari / Ofis</option>
                      <option value="Restoran & Cafe">Restoran & Cafe</option>
                      <option value="Karma Yaşam">Karma Yaşam</option>
                    </select>
                    <ChevronDown size={15} className="bim-select-arrow" />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="bim-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Şartname Paketi Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} className="bim-download-icon" />
                    <span>Şartname & BIM Paketini İndir</span>
                  </>
                )}
              </button>

              <div className="bim-footer-note">
                İndirdiğiniz dosyalar resmi Autodesk Revit (.RFA) ve DWG kütüphanesi standartlarına uygundur.
              </div>

            </form>
          )}
        </div>

      </div>

      <style jsx>{`
        .bim-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(9, 13, 22, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: bimFadeIn 0.2s ease-out;
        }

        .bim-modal-dialog {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 540px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45), 0 0 30px rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.35);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          animation: bimSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Header */
        .bim-modal-header {
          background: linear-gradient(135deg, #090d16 0%, #162032 100%);
          padding: 20px 24px;
          color: #ffffff;
          border-bottom: 2px solid #d4af37;
          flex-shrink: 0;
        }

        .bim-modal-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .bim-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.68rem;
          color: #d4af37;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .bim-close-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .bim-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          transform: scale(1.05);
        }

        .bim-modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #ffffff;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .brand-name {
          color: #ffffff;
        }

        .title-sep {
          color: #d4af37;
        }

        .prod-name {
          color: #f1f5f9;
        }

        .bim-modal-subtitle {
          font-size: 0.76rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.45;
        }

        /* Body */
        .bim-modal-body {
          padding: 22px 24px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          flex: 1;
        }

        .bim-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .bim-error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .bim-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bim-section-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Format selector buttons */
        .bim-format-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .bim-format-card {
          padding: 8px 6px;
          min-height: 48px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .bim-format-card:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .bim-format-card.active {
          border-color: #d4af37;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          color: #854d0e;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
        }

        .fmt-main {
          font-size: 0.76rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .fmt-ext {
          font-size: 0.65rem;
          font-weight: 600;
          opacity: 0.85;
          white-space: nowrap;
        }

        /* Symmetrical Fields Grid */
        .bim-fields-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .bim-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .bim-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 18px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(.bim-label-icon) {
          color: #d4af37;
          flex-shrink: 0;
        }

        .bim-input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border-radius: 9px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.84rem;
          color: #0f172a;
          background: #ffffff;
          box-sizing: border-box;
          outline: none;
          transition: all 0.2s;
        }

        .bim-input::placeholder {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .bim-input:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        /* Custom Select styling */
        .bim-select-container {
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        .bim-select {
          width: 100%;
          height: 42px;
          padding: 0 32px 0 12px;
          border-radius: 9px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.84rem;
          color: #0f172a;
          background: #ffffff;
          box-sizing: border-box;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bim-select:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        :global(.bim-select-arrow) {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        /* Submit Button */
        .bim-submit-btn {
          margin-top: 4px;
          height: 46px;
          width: 100%;
          background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
          color: #ffffff;
          border: 1.5px solid #d4af37;
          border-radius: 11px;
          font-weight: 800;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.22);
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .bim-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #111827 0%, #253348 100%);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
          transform: translateY(-1px);
        }

        .bim-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        :global(.bim-download-icon) {
          color: #d4af37;
        }

        .bim-footer-note {
          text-align: center;
          font-size: 0.68rem;
          color: #94a3b8;
          line-height: 1.4;
          margin-top: -4px;
        }

        /* Success View */
        .bim-success-view {
          text-align: center;
          padding: 28px 12px;
        }

        .bim-success-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        :global(.bim-success-icon) {
          color: #10b981;
        }

        .bim-success-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .bim-success-desc {
          font-size: 0.82rem;
          color: #64748b;
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Mobile specific media query: 100% Symmetrical and Easy to use */
        @media (max-width: 540px) {
          .bim-modal-backdrop {
            padding: 8px;
            align-items: flex-end;
          }

          .bim-modal-dialog {
            border-radius: 20px 20px 14px 14px;
            max-height: 94vh;
          }

          .bim-modal-header {
            padding: 16px 18px;
          }

          .bim-modal-title {
            font-size: 1.05rem;
          }

          .bim-modal-subtitle {
            font-size: 0.72rem;
          }

          .bim-modal-body {
            padding: 16px 18px 20px 18px;
          }

          .bim-fields-row {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .bim-fields-row-2col {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .bim-input, .bim-select {
            height: 44px;
            font-size: 0.85rem;
          }

          .bim-label {
            font-size: 0.74rem;
            min-height: 18px;
          }

          .bim-submit-btn {
            height: 48px;
            font-size: 0.88rem;
          }
        }

        @keyframes bimFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bimSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
