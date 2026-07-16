'use client';

import { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Info, 
  DollarSign, 
  Layers2, 
  Palette, 
  Maximize2,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectDemandPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Şirket & İletişim
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    // Step 2: Proje Detayları
    projectName: '',
    projectType: 'Konut', // Konut, Ofis, Otel, AVM, Hastane, Diğer
    city: 'İstanbul',
    district: '',
    constructionStep: 'Kaba İnşaat', // Kaba İnşaat, İnce İşler, Bitmek Üzere, Restorasyon
    quantityM2: '',
    budgetM2: 'Orta (300-600 TL)', // Düşük (0-300 TL), Orta (300-600 TL), Yüksek (600+ TL)
    deliveryTimeline: '90 gün içinde', // 30 gün içinde, 60 gün içinde, 90 gün içinde, 120+ gün
    // Step 3: Seramik İhtiyacı
    ceramicStyles: [], // Multi-select -> string
    ceramicSizes: [], // Multi-select -> string
    ceramicColors: '',
    ceramicFinishes: [], // Multi-select -> string
    usageAreas: [], // Multi-select -> string
    notes: ''
  });

  // Options
  const projectTypes = ['Konut', 'Ofis', 'Otel', 'AVM', 'Hastane', 'Okul', 'Villa Projesi', 'Diğer'];
  const constructionSteps = ['Kaba İnşaat', 'İnce İşler / Şap Aşaması', 'Seramik Döşeme Aşaması', 'Restorasyon / Yenileme'];
  const budgetOptions = ['Ekonomik (0-300 TL / m²)', 'Standart (300-600 TL / m²)', 'Premium Lüks (600-1200 TL / m²)', 'Özel Proje (1200+ TL / m²)'];
  const timelines = ['30 gün içinde', '60 gün içinde', '90 gün içinde', '120 gün veya üzeri'];
  
  const styleOptions = ['Mermer Dokulu', 'Beton / Çimento Dokulu', 'Ahşap Dokulu', 'Doğal Taş Dokulu', 'Tek Renk / Minimalist', 'Metalik Görünümlü', 'Klasik / Dekoratif'];
  const sizeOptions = ['60x120 cm', '80x80 cm', '60x60 cm', '30x60 cm', '100x100 cm', 'Büyük Ebat (120x240+ cm)', 'Mozaik / Özel Kesim'];
  const finishOptions = ['Mat', 'Parlak / Full Lappato', 'Yarı Mat / Lappato', 'Rölyefli / Kaymaz (Anti-slip)'];
  const usageAreaOptions = ['İç Mekan Zemin', 'İç Mekan Duvar', 'Dış Cephe Kaplama', 'Dış Mekan Zemin / Teras', 'Islak Hacim (Banyo/Mutfak)', 'Havuz İçi ve Çevresi'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const validateStep1 = () => {
    if (!formData.companyName.trim()) return 'Şirket adı zorunludur.';
    if (!formData.contactName.trim()) return 'Yetkili kişi adı zorunludur.';
    if (!formData.contactPhone.trim()) return 'Telefon numarası zorunludur.';
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) return 'Geçerli bir e-posta adresi zorunludur.';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.projectName.trim()) return 'Proje adı zorunludur.';
    if (!formData.city.trim()) return 'İl alanı zorunludur.';
    if (!formData.district.trim()) return 'İlçe alanı zorunludur.';
    const qty = parseInt(formData.quantityM2, 10);
    if (isNaN(qty) || qty <= 0) return 'Lütfen 0\'dan büyük geçerli bir metraj (m²) girin.';
    return null;
  };

  const validateStep3 = () => {
    if (formData.ceramicStyles.length === 0) return 'Lütfen en az bir tarz tercihi seçin.';
    if (formData.ceramicSizes.length === 0) return 'Lütfen en az bir ebat tercihi seçin.';
    if (formData.usageAreas.length === 0) return 'Lütfen en az bir kullanım alanı seçin.';
    return null;
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setErrorMsg(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setErrorMsg(err); return; }
      setStep(3);
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!kvkkAccepted) {
      setErrorMsg('Lütfen KVKK Aydınlatma Metni\'ni okuyup onaylayınız.');
      return;
    }
    const err = validateStep3();
    if (err) { setErrorMsg(err); return; }

    setLoading(true);

    try {
      // Prepare body with comma separated values for multi-selects
      const payload = {
        ...formData,
        ceramicStyles: formData.ceramicStyles.join(', '),
        ceramicSizes: formData.ceramicSizes.join(', '),
        ceramicFinishes: formData.ceramicFinishes.join(', '),
        usageAreas: formData.usageAreas.join(', '),
        quantityM2: parseInt(formData.quantityM2, 10)
      };

      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setReferenceId(data.projectId);
        setKvkkAccepted(false);
      } else {
        setErrorMsg(data.error || 'Talep gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '40px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header Info */}
      <div className="project-header" style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '640px' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#cbd5e1',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '20px',
          background: 'rgba(255,255,255,0.05)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.2s'
        }}>
          <ArrowLeft size={14} /> Ana Sayfaya Dön
        </Link>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(212, 175, 55, 0.15)',
          color: '#d4af37',
          padding: '6px 12px',
          borderRadius: '100px',
          fontSize: '0.75rem',
          fontWeight: '700',
          marginBottom: '16px',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          <Sparkles size={12} /> B2B Kurumsal İş Ortaklığı
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mimar & Müteahhit Proje Talep Portalı
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
          Büyük inşaat projeleriniz için seramik, porselen karo ve granit ihtiyaçlarınızı iletin. Türkiye'nin lider markalarından ve en yakın yetkili bayilerinden doğrudan toptan/proje fiyat teklifi alın.
        </p>
      </div>

      {/* Form Container */}
      <div className="glass-panel project-form-container" style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '36px',
        width: '100%',
        maxWidth: '720px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        boxSizing: 'border-box'
      }}>
        {success ? (
          /* Success Page */
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle size={36} />
            </div>
            
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 8px 0' }}>Talebiniz Başarıyla Alındı!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 24px 0', padding: '0 20px' }}>
              Proje talebiniz moderatörlerimiz tarafından incelenecek ve en kısa sürede üretici markalar ile yetkili bayilerin B2B sistemine aktarılacaktır. Teklifler doğrudan iletişim kanallarınıza iletilecektir.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '16px',
              maxWidth: '360px',
              margin: '0 auto 30px auto'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Proje Takip Kodu</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'monospace', color: '#d4af37' }}>{referenceId}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                onClick={() => {
                  setFormData({
                    companyName: '',
                    contactName: '',
                    contactPhone: '',
                    contactEmail: '',
                    projectName: '',
                    projectType: 'Konut',
                    city: 'İstanbul',
                    district: '',
                    constructionStep: 'Kaba İnşaat',
                    quantityM2: '',
                    budgetM2: 'Orta (300-600 TL)',
                    deliveryTimeline: '90 gün içinde',
                    ceramicStyles: [],
                    ceramicSizes: [],
                    ceramicColors: '',
                    ceramicFinishes: [],
                    usageAreas: [],
                    notes: ''
                  });
                  setSuccess(false);
                  setStep(1);
                  setErrorMsg('');
                }}
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Yeni Talep Oluştur
              </button>
              <Link 
                href="/"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                  color: '#000',
                  textDecoration: 'none',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Kataloğa Dön
              </Link>
            </div>
          </div>
        ) : (
          /* Stepped Form Layout */
          <div>
            {/* Step Indicators */}
            <div className="step-indicators" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '36px',
              position: 'relative'
            }}>
              {/* Progress Line */}
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '40px',
                right: '40px',
                height: '2px',
                background: 'rgba(255,255,255,0.08)',
                zIndex: 1
              }} />
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '40px',
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                height: '2px',
                background: '#d4af37',
                zIndex: 2,
                transition: 'width 0.3s ease'
              }} />

              {/* Step 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step >= 1 ? '#d4af37' : '#1e293b',
                  color: step >= 1 ? '#000' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  border: '2px solid' + (step >= 1 ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                  transition: 'all 0.3s'
                }}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span style={{ fontSize: '0.72rem', color: step >= 1 ? '#cbd5e1' : '#64748b', fontWeight: '700', marginTop: '8px' }}>İletişim & Şirket</span>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step >= 2 ? '#d4af37' : '#1e293b',
                  color: step >= 2 ? '#000' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  border: '2px solid' + (step >= 2 ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                  transition: 'all 0.3s'
                }}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span style={{ fontSize: '0.72rem', color: step >= 2 ? '#cbd5e1' : '#64748b', fontWeight: '700', marginTop: '8px' }}>Proje Detayları</span>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step >= 3 ? '#d4af37' : '#1e293b',
                  color: step >= 3 ? '#000' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  border: '2px solid' + (step >= 3 ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                  transition: 'all 0.3s'
                }}>
                  3
                </div>
                <span style={{ fontSize: '0.72rem', color: step >= 3 ? '#cbd5e1' : '#64748b', fontWeight: '700', marginTop: '8px' }}>Seramik Tercihleri</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1 Form */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <Building2 size={20} style={{ color: '#d4af37' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Kurumsal İletişim Bilgileri</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Şirket Adı <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" 
                    name="companyName" 
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Müteahhitlik Şirketi, Mimarlık Ofisi vb."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Yetkili Adı Soyadı <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      name="contactName" 
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Ad Soyad"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 40px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                  </div>
                </div>

                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>İletişim Telefonu <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        name="contactPhone" 
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="0555 555 5555"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.03)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>E-posta Adresi <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" 
                        name="contactEmail" 
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="yetkili@firma.com"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.03)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', marginTop: '10px' }}>
                  <Info size={16} style={{ color: '#d4af37', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    Tekliflerin doğrulanabilmesi ve toptan satış yetkililerinin size ulaşabilmesi için kurumsal iletişim kanallarınızı doğru ve güncel girdiğinizden emin olun.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    onClick={nextStep}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Devam Et <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Form */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <FileText size={20} style={{ color: '#d4af37' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Proje Detayları</h4>
                </div>

                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Proje Adı <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      name="projectName" 
                      value={formData.projectName}
                      onChange={handleInputChange}
                      placeholder="Örn: Vadi Konakları, Kule Plaza"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Proje Tipi <span style={{ color: '#ef4444' }}>*</span></label>
                    <select 
                      name="projectType" 
                      value={formData.projectType}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#1e293b',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {projectTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>İl <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Örn: İstanbul, Ankara"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>İlçe <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      name="district" 
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Örn: Kadıköy, Çankaya"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Metraj İhtiyacı (m²) <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        name="quantityM2" 
                        value={formData.quantityM2}
                        onChange={handleInputChange}
                        placeholder="Örn: 2500"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.03)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Maximize2 size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Mevcut İnşaat Aşaması <span style={{ color: '#ef4444' }}>*</span></label>
                    <select 
                      name="constructionStep" 
                      value={formData.constructionStep}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#1e293b',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {constructionSteps.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Hedeflenen m² Bütçesi <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="budgetM2" 
                        value={formData.budgetM2}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1e293b',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        {budgetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <DollarSign size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Hedef Teslim Zamanı <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="deliveryTimeline" 
                        value={formData.deliveryTimeline}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1e293b',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        {timelines.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button 
                    onClick={prevStep}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: '600',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ArrowLeft size={16} /> Geri Dön
                  </button>
                  
                  <button 
                    onClick={nextStep}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Devam Et <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 Form */}
            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <Layers2 size={20} style={{ color: '#d4af37' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Seramik İhtiyaç ve Tercihleri</h4>
                </div>

                {/* Tarz Tercihi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Tercih Edilen Tarz / Desen (Çoklu Seçim) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {styleOptions.map(opt => {
                      const isSelected = formData.ceramicStyles.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('ceramicStyles', opt)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid' + (isSelected ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                            background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#d4af37' : '#cbd5e1',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ebat Tercihi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Ebat Tercihi (Çoklu Seçim) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {sizeOptions.map(opt => {
                      const isSelected = formData.ceramicSizes.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('ceramicSizes', opt)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid' + (isSelected ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                            background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#d4af37' : '#cbd5e1',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Yüzey Tercihi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Yüzey Bitişi Tercihleri (Çoklu Seçim)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {finishOptions.map(opt => {
                      const isSelected = formData.ceramicFinishes.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('ceramicFinishes', opt)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid' + (isSelected ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                            background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#d4af37' : '#cbd5e1',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kullanım Alanı */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Kullanım Alanları (Çoklu Seçim) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {usageAreaOptions.map(opt => {
                      const isSelected = formData.usageAreas.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('usageAreas', opt)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid' + (isSelected ? '#d4af37' : 'rgba(255,255,255,0.1)'),
                            background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#d4af37' : '#cbd5e1',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Renk Tercihi */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>Renk Tercihleri</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        name="ceramicColors" 
                        value={formData.ceramicColors}
                        onChange={handleInputChange}
                        placeholder="Örn: Antrasit, Beyaz, Bej"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.03)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Palette size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>

                  {/* Teknik Şartlar/Detaylar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>İlave Notlar / Detaylı Şartname</label>
                    <input 
                      type="text" 
                      name="notes" 
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Örn: Donmaya dayanıklı porselen karo, R10 kaymazlık."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="kvkk-check" 
                    checked={kvkkAccepted} 
                    onChange={(e) => setKvkkAccepted(e.target.checked)} 
                    required
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="kvkk-check" style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" style={{ color: '#d4af37', fontWeight: '600', textDecoration: 'underline' }}>KVKK Aydınlatma Metni'ni</Link> okudum ve kabul ediyorum.
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button 
                    type="button"
                    onClick={prevStep}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: '600',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ArrowLeft size={16} /> Geri Dön
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 32px',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)'
                    }}
                  >
                    {loading ? 'Talep Gönderiliyor...' : 'Talep Oluştur & İhaleyi Başlat'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* RESPONSIVE STYLES */}
      <style jsx>{`
        /* ===== TABLET (max-width: 768px) ===== */
        @media (max-width: 768px) {
          .project-header {
            margin-bottom: 24px !important;
          }
          .project-header h2 {
            font-size: 1.4rem !important;
          }
          .project-form-container {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
          .step-indicators {
            margin-bottom: 24px !important;
          }
          .step-indicators span {
            font-size: 0.62rem !important;
          }
          .form-grid-2col {
            grid-template-columns: 1fr !important;
          }
        }

        /* ===== SMALL MOBILE (max-width: 480px) ===== */
        @media (max-width: 480px) {
          .project-header h2 {
            font-size: 1.2rem !important;
          }
          .project-header p {
            font-size: 0.8rem !important;
          }
          .project-form-container {
            padding: 16px 12px !important;
            border-radius: 12px !important;
          }
          .step-indicators span {
            display: none !important;
          }
          .form-grid-2col {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
