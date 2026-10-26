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

      {/* LUXURY PORCELAIN LIGHT THEME STYLES (Matching Bayi Portal) */}
      <style jsx>{`
        .sb-portal-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          font-family: var(--font-body, "Plus Jakarta Sans", sans-serif);
          position: relative;
          box-sizing: border-box;
        }

        .sb-grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .sb-portal-card {
          position: relative;
          z-index: 2;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 38px 36px;
          width: 100%;
          max-width: 740px;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05);
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sb-portal-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .sb-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #475569;
          margin-bottom: 16px;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .sb-back-link:hover {
          color: #0f172a;
          border-color: #cbd5e1;
          background: #ffffff;
          transform: translateY(-1px);
        }

        .sb-logo-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          border: 1.5px solid #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.35rem;
          margin: 0 auto 12px auto;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12), 0 0 12px rgba(212, 175, 55, 0.2);
        }

        .sb-portal-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          font-family: var(--font-title, "Outfit", sans-serif);
          letter-spacing: -0.02em;
        }

        .sb-portal-subtitle {
          font-size: 0.84rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* Tab Switcher */
        .sb-tab-switcher {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          gap: 4px;
        }

        .sb-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #64748b;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sb-tab-btn.active {
          background: #ffffff;
          border-color: rgba(226, 232, 240, 0.9);
          color: #0f172a;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        /* Step Tracker */
        .sb-step-tracker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 26px;
          position: relative;
          padding: 0 10px;
        }

        .sb-step-track-line {
          position: absolute;
          top: 16px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: #e2e8f0;
          z-index: 1;
        }

        .sb-step-track-progress {
          position: absolute;
          top: 16px;
          left: 40px;
          height: 2px;
          background: #2563eb;
          z-index: 2;
          transition: width 0.3s ease;
        }

        .sb-step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
        }

        .sb-step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 800;
          transition: all 0.2s;
        }

        .sb-step-num.current {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .sb-step-num.done {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .sb-step-title {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
          margin-top: 6px;
        }

        .sb-step-title.active {
          color: #0f172a;
          font-weight: 800;
        }

        /* Form Controls */
        .sb-form-pane {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sb-form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .sb-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.01em;
        }

        .req {
          color: #ef4444;
        }

        .sb-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.84rem;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sb-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .sb-input-icon-wrap {
          position: relative;
        }

        .sb-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .sb-input.sb-has-icon {
          padding-left: 36px;
        }

        .sb-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Multi Select Chips */
        .sb-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sb-chip-btn {
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s;
        }

        .sb-chip-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .sb-chip-btn.selected {
          background: #eff6ff;
          border-color: #2563eb;
          color: #1d4ed8;
          font-weight: 700;
        }

        /* KVKK */
        .sb-kvkk-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-top: 4px;
          cursor: pointer;
        }

        .sb-checkbox {
          margin-top: 2px;
          accent-color: #2563eb;
        }

        .sb-kvkk-text {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.45;
        }

        .sb-link-gold {
          color: #2563eb;
          font-weight: 700;
          text-decoration: underline;
        }

        /* Alerts & Hints */
        .sb-hint-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          font-size: 0.78rem;
          color: #166534;
          line-height: 1.4;
        }

        .sb-alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-bottom: 14px;
        }

        /* Nav Actions */
        .sb-nav-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .sb-btn-primary {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          border: 1px solid #0f172a;
          border-radius: 9px;
          padding: 10px 22px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
          transition: all 0.2s;
        }

        .sb-btn-primary:hover:not(:disabled) {
          background: #0f172a;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
        }

        .sb-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sb-btn-secondary {
          background: #f8fafc;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          padding: 10px 18px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .sb-btn-secondary:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .sb-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Success Card */
        .sb-success-box {
          text-align: center;
          padding: 14px 0;
        }

        .sb-success-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .sb-success-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .sb-success-text {
          font-size: 0.86rem;
          color: #64748b;
          max-width: 520px;
          margin: 0 auto 20px auto;
          line-height: 1.5;
        }

        .sb-ref-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 18px;
          max-width: 380px;
          margin: 0 auto 22px auto;
        }

        .sb-ref-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .sb-ref-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .sb-ref-code {
          font-family: monospace;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          word-break: break-all;
        }

        .sb-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
        }

        .sb-success-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Tracking Pane */
        .sb-track-pane {
          display: flex;
          flex-direction: column;
        }

        .sb-track-search-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
        }

        .sb-track-search-row {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }

        .sb-field-hint {
          font-size: 0.72rem;
          color: #64748b;
          margin: 8px 0 0 0;
        }

        /* Tracking Result Card */
        .sb-result-card {
          margin-top: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }

        .sb-result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .sb-result-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 6px;
          margin-bottom: 4px;
        }

        .sb-result-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .sb-result-sub {
          font-size: 0.78rem;
          color: #64748b;
        }

        .sb-status-pill {
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.76rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .sb-status-pill.PENDING {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .sb-status-pill.APPROVED {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .sb-status-pill.REJECTED {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        /* Pipeline */
        .sb-pipeline {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid #f1f5f9;
        }

        .sb-pipe-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          opacity: 0.4;
        }

        .sb-pipe-step.done,
        .sb-pipe-step.active {
          opacity: 1;
        }

        .sb-pipe-dot {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-pipe-step.done .sb-pipe-dot {
          background: #0f172a;
          color: #ffffff;
        }

        .sb-pipe-step.active .sb-pipe-dot {
          background: #2563eb;
          color: #ffffff;
        }

        .sb-pipe-text {
          font-size: 0.7rem;
          font-weight: 700;
          color: #334155;
        }

        .sb-status-detail-box {
          display: flex;
          gap: 12px;
          padding: 12px 14px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .sb-detail-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #1e40af;
          margin: 0 0 4px 0;
        }

        .sb-detail-desc {
          font-size: 0.78rem;
          color: #3b82f6;
          margin: 0;
          line-height: 1.45;
        }

        .sb-spec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 10px;
        }

        .sb-spec-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sb-spec-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .sb-spec-val {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0f172a;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .sb-portal-layout {
            padding: 16px 12px;
          }

          .sb-portal-card {
            padding: 24px 18px;
            border-radius: 20px;
          }

          .sb-grid-2col {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .sb-track-search-row {
            flex-direction: column;
          }

          .sb-pipeline {
            grid-template-columns: 1fr;
            gap: 12px;
            text-align: left;
          }

          .sb-pipe-step {
            flex-direction: row;
            text-align: left;
          }

          .sb-spec-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </main>
  );
}
