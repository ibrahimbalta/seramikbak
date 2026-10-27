'use client';

import { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Ruler, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Search, 
  Clock, 
  FileText, 
  Check, 
  Copy, 
  Loader2,
  ShieldCheck,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import './proje-talep.css';

export default function ProjectDemandPage() {
  const [activeMainTab, setActiveMainTab] = useState('demand'); // 'demand' (Yeni Talep) | 'track' (Proje Takip)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [copied, setCopied] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // Tracking tab state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Şirket & İletişim
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    // Step 2: Proje Detayları
    projectName: '',
    projectType: 'Konut',
    city: 'İstanbul',
    district: '',
    constructionStep: 'Kaba İnşaat',
    quantityM2: '',
    budgetM2: 'Standart (300-600 TL / m²)',
    deliveryTimeline: '90 gün içinde',
    // Step 3: Seramik İhtiyacı
    ceramicStyles: [],
    ceramicSizes: [],
    ceramicColors: '',
    ceramicFinishes: [],
    usageAreas: [],
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
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setErrorMsg(err); return; }
      setStep(3);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(prev => Math.max(1, prev - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleTrackSubmit = async (e) => {
    e?.preventDefault();
    if (!trackingQuery.trim()) {
      setTrackingError('Lütfen bir proje takip kodu veya e-posta adresi girin.');
      return;
    }

    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/projects/status?q=${encodeURIComponent(trackingQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.project) {
        setTrackingResult(data.project);
      } else {
        setTrackingError(data.error || 'Bu bilgilere ait aktif bir proje talebi bulunamadı.');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setTrackingError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const copyReferenceCode = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <main className="sb-portal-layout">
      {/* Subtle Architectural Grid Background */}
      <div className="sb-grid-bg" />

      {/* Main Glass Panel Card (Consistent with Bayi Portal Design) */}
      <div className="sb-portal-card glass-panel">
        
        {/* Top Header */}
        <div className="sb-portal-header">
          <Link href="/" className="sb-back-link">
            <ArrowLeft size={14} /> Ana Sayfaya Dön
          </Link>
          
          <div className="sb-logo-badge">SB</div>

          <h1 className="sb-portal-title">
            Mimar & Müteahhit Proje Portalı
          </h1>
          <p className="sb-portal-subtitle">
            Büyük inşaat ve mimarlık projeleriniz için toptan seramik teklifleri alın veya mevcut talebinizi takip edin.
          </p>
        </div>

        {/* Tab Switcher (Bayilik Başvuru ile Birebir Aynı Tasarım) */}
        <div className="sb-tab-switcher">
          <button
            type="button"
            onClick={() => { setActiveMainTab('demand'); setErrorMsg(''); }}
            className={`sb-tab-btn ${activeMainTab === 'demand' ? 'active' : ''}`}
          >
            <Building2 size={15} />
            <span>Yeni Proje Talebi</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveMainTab('track'); setErrorMsg(''); }}
            className={`sb-tab-btn ${activeMainTab === 'track' ? 'active' : ''}`}
          >
            <Search size={15} />
            <span>Proje Takip & Durum</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: YENİ PROJE TALEBİ FORMU                             */}
        {/* ========================================================= */}
        {activeMainTab === 'demand' && (
          <div>
            {success ? (
              /* Success View */
              <div className="sb-success-box">
                <div className="sb-success-icon-wrap">
                  <CheckCircle size={36} />
                </div>
                
                <h2 className="sb-success-heading">Proje Talebiniz Başarıyla Alındı!</h2>
                <p className="sb-success-text">
                  Talebiniz uzman B2B mimari proje ekibimiz tarafından incelenecek ve bölgenizdeki yetkili bayilere iletilecektir.
                  Özel iskonto teklifleri doğrudan telefon ve e-posta adresinize gönderilecektir.
                </p>

                <div className="sb-ref-card">
                  <span className="sb-ref-label">Proje Takip Kodunuz</span>
                  <div className="sb-ref-row">
                    <span className="sb-ref-code">{referenceId}</span>
                    <button 
                      type="button" 
                      onClick={copyReferenceCode} 
                      className="sb-copy-btn"
                      title="Kodu Kopyala"
                    >
                      {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                      <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                <div className="sb-success-actions">
                  <button 
                    type="button"
                    onClick={() => {
                      setTrackingQuery(referenceId);
                      setActiveMainTab('track');
                      setTimeout(() => handleTrackSubmit(), 100);
                    }}
                    className="sb-btn-primary"
                  >
                    <Search size={15} />
                    <span>Talebi Şimdi Takip Et</span>
                  </button>

                  <button 
                    type="button"
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
                        budgetM2: 'Standart (300-600 TL / m²)',
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
                    className="sb-btn-secondary"
                  >
                    Yeni Talep Oluştur
                  </button>
                </div>
              </div>
            ) : (
              /* Stepped Form */
              <div>
                {/* Step Indicators */}
                <div className="sb-step-tracker">
                  <div className="sb-step-track-line" />
                  <div 
                    className="sb-step-track-progress" 
                    style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} 
                  />

                  <div className="sb-step-item">
                    <div className={`sb-step-num ${step === 1 ? 'current' : step > 1 ? 'done' : ''}`}>
                      {step > 1 ? <Check size={14} /> : '1'}
                    </div>
                    <span className={`sb-step-title ${step === 1 ? 'active' : ''}`}>İletişim & Şirket</span>
                  </div>

                  <div className="sb-step-item">
                    <div className={`sb-step-num ${step === 2 ? 'current' : step > 2 ? 'done' : ''}`}>
                      {step > 2 ? <Check size={14} /> : '2'}
                    </div>
                    <span className={`sb-step-title ${step === 2 ? 'active' : ''}`}>Proje Detayları</span>
                  </div>

                  <div className="sb-step-item">
                    <div className={`sb-step-num ${step === 3 ? 'current' : ''}`}>
                      3
                    </div>
                    <span className={`sb-step-title ${step === 3 ? 'active' : ''}`}>Seramik Tercihleri</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="sb-alert-error">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                  
                  {/* STEP 1: İletişim & Şirket */}
                  {step === 1 && (
                    <div className="sb-form-pane">
                      <div className="sb-form-group">
                        <label className="sb-label">Şirket / Ofis Adı <span className="req">*</span></label>
                        <div className="sb-input-icon-wrap">
                          <Building2 size={16} className="sb-input-icon" />
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Müteahhitlik Şirketi, Mimarlık Ofisi vb."
                            className="sb-input sb-has-icon"
                            required
                          />
                        </div>
                      </div>

                      <div className="sb-form-group">
                        <label className="sb-label">Yetkili Adı Soyadı <span className="req">*</span></label>
                        <div className="sb-input-icon-wrap">
                          <User size={16} className="sb-input-icon" />
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="Adınız ve Soyadınız"
                            className="sb-input sb-has-icon"
                            required
                          />
                        </div>
                      </div>

                      <div className="sb-grid-2col">
                        <div className="sb-form-group">
                          <label className="sb-label">İletişim Telefonu <span className="req">*</span></label>
                          <div className="sb-input-icon-wrap">
                            <Phone size={16} className="sb-input-icon" />
                            <input
                              type="tel"
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              placeholder="0555 123 4567"
                              className="sb-input sb-has-icon"
                              required
                            />
                          </div>
                        </div>

                        <div className="sb-form-group">
                          <label className="sb-label">Kurumsal E-posta <span className="req">*</span></label>
                          <div className="sb-input-icon-wrap">
                            <Mail size={16} className="sb-input-icon" />
                            <input
                              type="email"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              placeholder="yetkili@sirketiniz.com"
                              className="sb-input sb-has-icon"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sb-hint-box">
                        <ShieldCheck size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                        <span>Toptan ve proje fiyat tekliflerinin doğrudan size ulaşabilmesi için kurumsal bilgilerinizi eksiksiz giriniz.</span>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Proje Detayları */}
                  {step === 2 && (
                    <div className="sb-form-pane">
                      <div className="sb-grid-2col">
                        <div className="sb-form-group">
                          <label className="sb-label">Proje Adı <span className="req">*</span></label>
                          <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleInputChange}
                            placeholder="Örn: Vadi Konakları 2. Etap"
                            className="sb-input"
                            required
                          />
                        </div>

                        <div className="sb-form-group">
                          <label className="sb-label">Proje Tipi</label>
                          <select
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleInputChange}
                            className="sb-input"
                          >
                            {projectTypes.map(pt => (
                              <option key={pt} value={pt}>{pt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sb-grid-2col">
                        <div className="sb-form-group">
                          <label className="sb-label">İl <span className="req">*</span></label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="İstanbul"
                            className="sb-input"
                            required
                          />
                        </div>

                        <div className="sb-form-group">
                          <label className="sb-label">İlçe <span className="req">*</span></label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            placeholder="Kadıköy"
                            className="sb-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="sb-grid-2col">
                        <div className="sb-form-group">
                          <label className="sb-label">Toplam Metraj (m²) <span className="req">*</span></label>
                          <div className="sb-input-icon-wrap">
                            <Ruler size={16} className="sb-input-icon" />
                            <input
                              type="number"
                              name="quantityM2"
                              value={formData.quantityM2}
                              onChange={handleInputChange}
                              placeholder="Örn: 1500"
                              className="sb-input sb-has-icon"
                              min="1"
                              required
                            />
                          </div>
                        </div>

                        <div className="sb-form-group">
                          <label className="sb-label">İnşaat / Uygulama Aşaması</label>
                          <select
                            name="constructionStep"
                            value={formData.constructionStep}
                            onChange={handleInputChange}
                            className="sb-input"
                          >
                            {constructionSteps.map(cs => (
                              <option key={cs} value={cs}>{cs}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sb-grid-2col">
                        <div className="sb-form-group">
                          <label className="sb-label">Bütçe Aralığı</label>
                          <select
                            name="budgetM2"
                            value={formData.budgetM2}
                            onChange={handleInputChange}
                            className="sb-input"
                          >
                            {budgetOptions.map(bo => (
                              <option key={bo} value={bo}>{bo}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sb-form-group">
                          <label className="sb-label">Teslimat Zaman Planı</label>
                          <select
                            name="deliveryTimeline"
                            value={formData.deliveryTimeline}
                            onChange={handleInputChange}
                            className="sb-input"
                          >
                            {timelines.map(tl => (
                              <option key={tl} value={tl}>{tl}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Seramik Tercihleri */}
                  {step === 3 && (
                    <div className="sb-form-pane">
                      <div className="sb-form-group">
                        <label className="sb-label">Tercih Edilen Tarz / Doku (Çoklu Seçilebilir) <span className="req">*</span></label>
                        <div className="sb-chips-wrap">
                          {styleOptions.map(style => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => handleMultiSelect('ceramicStyles', style)}
                              className={`sb-chip-btn ${formData.ceramicStyles.includes(style) ? 'selected' : ''}`}
                            >
                              {formData.ceramicStyles.includes(style) && <Check size={13} />}
                              <span>{style}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sb-form-group">
                        <label className="sb-label">İstenen Ebatlar <span className="req">*</span></label>
                        <div className="sb-chips-wrap">
                          {sizeOptions.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleMultiSelect('ceramicSizes', size)}
                              className={`sb-chip-btn ${formData.ceramicSizes.includes(size) ? 'selected' : ''}`}
                            >
                              {formData.ceramicSizes.includes(size) && <Check size={13} />}
                              <span>{size}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sb-form-group">
                        <label className="sb-label">Kullanım Alanları <span className="req">*</span></label>
                        <div className="sb-chips-wrap">
                          {usageAreaOptions.map(area => (
                            <button
                              key={area}
                              type="button"
                              onClick={() => handleMultiSelect('usageAreas', area)}
                              className={`sb-chip-btn ${formData.usageAreas.includes(area) ? 'selected' : ''}`}
                            >
                              {formData.usageAreas.includes(area) && <Check size={13} />}
                              <span>{area}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sb-grid-2col">
                        <div className="sb-form-group">
                          <label className="sb-label">Tercih Edilen Renk Tonları</label>
                          <input
                            type="text"
                            name="ceramicColors"
                            value={formData.ceramicColors}
                            onChange={handleInputChange}
                            placeholder="Örn: Açık gri, bej, antrasit"
                            className="sb-input"
                          />
                        </div>

                        <div className="sb-form-group">
                          <label className="sb-label">Yüzey Bitişi</label>
                          <div className="sb-chips-wrap">
                            {finishOptions.map(finish => (
                              <button
                                key={finish}
                                type="button"
                                onClick={() => handleMultiSelect('ceramicFinishes', finish)}
                                className={`sb-chip-btn ${formData.ceramicFinishes.includes(finish) ? 'selected' : ''}`}
                              >
                                {formData.ceramicFinishes.includes(finish) && <Check size={13} />}
                                <span>{finish}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="sb-form-group">
                        <label className="sb-label">Ek Notlar / Özel Şartname Detayları</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={2}
                          placeholder="Belirli bir marka tercihi, numune talebi veya nakliye şartları varsa belirtebilirsiniz..."
                          className="sb-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      {/* KVKK Checkbox */}
                      <label className="sb-kvkk-row">
                        <input
                          type="checkbox"
                          checked={kvkkAccepted}
                          onChange={(e) => setKvkkAccepted(e.target.checked)}
                          className="sb-checkbox"
                          required
                        />
                        <span className="sb-kvkk-text">
                          <Link href="/yasal" target="_blank" className="sb-link-gold">KVKK Aydınlatma Metni</Link>'ni okudum, proje teklif süreçlerinin yürütülmesi amacıyla iletişim bilgilerimin yetkili bayilerle paylaşılmasını onaylıyorum.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Form Navigation Buttons */}
                  <div className="sb-nav-actions">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="sb-btn-secondary"
                      >
                        <ArrowLeft size={15} /> Geri
                      </button>
                    ) : <div />}

                    {step < 3 ? (
                      <button
                        type="submit"
                        className="sb-btn-primary"
                      >
                        Devam Et <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="sb-btn-primary"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="sb-spin" />
                            <span>Gönderiliyor...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            <span>Proje Talebini Gönder</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROJE TAKİP & DURUM SORGULAMA                       */}
        {/* ========================================================= */}
        {activeMainTab === 'track' && (
          <div className="sb-track-pane">
            <div className="sb-track-search-box">
              <label className="sb-label">Proje Takip Kodu veya Kayıtlı E-posta</label>
              <form onSubmit={handleTrackSubmit} className="sb-track-search-row">
                <div className="sb-input-icon-wrap" style={{ flex: 1 }}>
                  <Search size={16} className="sb-input-icon" />
                  <input
                    type="text"
                    value={trackingQuery}
                    onChange={(e) => setTrackingQuery(e.target.value)}
                    placeholder="Örn: clxx9... veya mimarlik@sirketiniz.com"
                    className="sb-input sb-has-icon"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={trackingLoading}
                  className="sb-btn-primary"
                  style={{ minWidth: '120px' }}
                >
                  {trackingLoading ? <Loader2 size={16} className="sb-spin" /> : <Search size={15} />}
                  <span>{trackingLoading ? 'Sorgulanıyor' : 'Sorgula'}</span>
                </button>
              </form>
              <p className="sb-field-hint">
                Talep oluşturduğunuzda size verilen referans kodunu veya talepte belirttiğiniz e-posta adresini giriniz.
              </p>
            </div>

            {/* Tracking Error */}
            {trackingError && (
              <div className="sb-alert-error" style={{ marginTop: '16px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{trackingError}</span>
              </div>
            )}

            {/* Tracking Result Card */}
            {trackingResult && (
              <div className="sb-result-card">
                <div className="sb-result-header">
                  <div>
                    <span className="sb-result-badge">Proje Talebi</span>
                    <h3 className="sb-result-title">{trackingResult.projectName}</h3>
                    <span className="sb-result-sub">{trackingResult.companyName} • {trackingResult.city} / {trackingResult.district}</span>
                  </div>

                  <div className={`sb-status-pill ${trackingResult.status}`}>
                    {trackingResult.status === 'PENDING' && '🟡 İncelemede'}
                    {trackingResult.status === 'APPROVED' && '🟢 Bayilere İletildi'}
                    {trackingResult.status === 'REJECTED' && '⚪ Arşivlendi'}
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="sb-pipeline">
                  <div className={`sb-pipe-step done`}>
                    <div className="sb-pipe-dot"><Check size={12} /></div>
                    <span className="sb-pipe-text">1. Talep Alındı</span>
                  </div>

                  <div className={`sb-pipe-step ${trackingResult.status === 'APPROVED' ? 'done' : 'active'}`}>
                    <div className="sb-pipe-dot">
                      {trackingResult.status === 'APPROVED' ? <Check size={12} /> : <Clock size={12} />}
                    </div>
                    <span className="sb-pipe-text">2. Teknik İnceleme</span>
                  </div>

                  <div className={`sb-pipe-step ${trackingResult.status === 'APPROVED' ? 'active' : ''}`}>
                    <div className="sb-pipe-dot">
                      <Building2 size={12} />
                    </div>
                    <span className="sb-pipe-text">3. Bayi İhale / Teklif Aşaması</span>
                  </div>
                </div>

                {/* Status Message Info */}
                <div className="sb-status-detail-box">
                  <Clock size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <div>
                    <h4 className="sb-detail-title">
                      {trackingResult.status === 'APPROVED'
                        ? 'Talebiniz Yetkili Bayi Ağına Başarıyla İletildi'
                        : 'Talebiniz Uzman B2B Ekibimiz Tarafından Değerlendiriliyor'}
                    </h4>
                    <p className="sb-detail-desc">
                      {trackingResult.status === 'APPROVED'
                        ? `${trackingResult.city} ve çevre illerdeki yetkili seramik üretici bayileri projeniz için metraj ve şartnameye uygun toptan fiyat tekliflerini hazırlamaktadır. Temsilciler doğrudan kayıtlı telefon ve e-posta adresiniz üzerinden iletişime geçecektir.`
                        : 'Proje detaylarınız ve metraj gereksinimleriniz teknik ekibimizce kontrol edilmektedir. İnceleme onaylandıktan sonra yetkili bayilere teklif için açılacaktır.'}
                    </p>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="sb-spec-grid">
                  <div className="sb-spec-item">
                    <span className="sb-spec-label">Metraj</span>
                    <span className="sb-spec-val">{trackingResult.quantityM2?.toLocaleString('tr-TR')} m²</span>
                  </div>
                  <div className="sb-spec-item">
                    <span className="sb-spec-label">Proje Tipi</span>
                    <span className="sb-spec-val">{trackingResult.projectType}</span>
                  </div>
                  <div className="sb-spec-item">
                    <span className="sb-spec-label">Bütçe Seviyesi</span>
                    <span className="sb-spec-val">{trackingResult.budgetM2}</span>
                  </div>
                  <div className="sb-spec-item">
                    <span className="sb-spec-label">Kayıt Tarihi</span>
                    <span className="sb-spec-val">
                      {trackingResult.createdAt ? new Date(trackingResult.createdAt).toLocaleDateString('tr-TR') : 'Bugün'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
