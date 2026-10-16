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
  AlertCircle,
  ShieldCheck,
  Check
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

  return (
    <div className="sb-project-page-root">
      {/* Header Info */}
      <div className="project-header">
        <Link href="/" className="sb-back-home-btn">
          <ArrowLeft size={15} /> Ana Sayfaya Dön
        </Link>

        <div className="sb-b2b-badge">
          <Sparkles size={13} /> B2B Kurumsal İş Ortaklığı
        </div>

        <h1 className="project-main-title">
          Mimar & Müteahhit Proje Talep Portalı
        </h1>
        <p className="project-main-desc">
          Büyük inşaat ve mimarlık projeleriniz için seramik, porselen karo ve granit ihtiyaçlarınızı iletin. 
          Türkiye'nin lider üreticilerinden ve en yakın yetkili bayilerinden doğrudan toptan/ihale fiyat teklifi alın.
        </p>
      </div>

      {/* Main Form Container Card */}
      <div className="project-form-container">
        {/* Mobile Pull Handle (App Feel) */}
        <div className="mobile-sheet-bar" />

        {success ? (
          /* Success Screen */
          <div className="success-view-card">
            <div className="success-icon-bubble">
              <CheckCircle size={40} />
            </div>
            
            <h2 className="success-title">Proje Talebiniz Başarıyla Alındı!</h2>
            <p className="success-desc">
              Talebiniz uzman B2B proje ekibimiz tarafından incelenecek ve en uygun üretici markalar ile bölgenizdeki yetkili bayilerin B2B sistemine iletilecektir.
              Özel iskonto teklifleri doğrudan iletişim kanallarınıza gönderilecektir.
            </p>

            <div className="ref-code-card">
              <span className="ref-label">Proje Takip Kodu</span>
              <span className="ref-value">{referenceId}</span>
            </div>

            <div className="success-actions-row">
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
                className="btn-new-demand"
              >
                Yeni Talep Oluştur
              </button>
              <Link href="/" className="btn-return-home">
                Kataloğa Dön
              </Link>
            </div>
          </div>
        ) : (
          /* Stepped Form Layout */
          <div>
            {/* Step Indicators */}
            <div className="step-indicators">
              {/* Background Track Line */}
              <div className="step-track-bg" />
              {/* Progress Bar Fill */}
              <div 
                className="step-track-fill" 
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} 
              />

              {/* Step 1 Pill */}
              <div className={`step-node ${step >= 1 ? 'is-active' : ''}`}>
                <div className={`step-circle ${step === 1 ? 'current' : step > 1 ? 'done' : ''}`}>
                  {step > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
                </div>
                <span className={`step-label ${step === 1 ? 'label-current' : ''}`}>İletişim & Şirket</span>
              </div>

              {/* Step 2 Pill */}
              <div className={`step-node ${step >= 2 ? 'is-active' : ''}`}>
                <div className={`step-circle ${step === 2 ? 'current' : step > 2 ? 'done' : ''}`}>
                  {step > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
                </div>
                <span className={`step-label ${step === 2 ? 'label-current' : ''}`}>Proje Detayları</span>
              </div>

              {/* Step 3 Pill */}
              <div className={`step-node ${step >= 3 ? 'is-active' : ''}`}>
                <div className={`step-circle ${step === 3 ? 'current' : ''}`}>
                  3
                </div>
                <span className={`step-label ${step === 3 ? 'label-current' : ''}`}>Seramik Tercihleri</span>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="sb-alert-error">
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Şirket & İletişim Bilgileri */}
            {step === 1 && (
              <div className="step-content-pane">
                <div className="section-title-bar">
                  <div className="section-icon-box">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="section-title">Kurumsal İletişim Bilgileri</h3>
                    <p className="section-subtitle">Bayilerin sizinle iletişime geçeceği yetkili bilgilerini giriniz.</p>
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="form-field-label">Şirket Adı <span className="req-star">*</span></label>
                  <input 
                    type="text" 
                    name="companyName" 
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Müteahhitlik Şirketi, Mimarlık Ofisi vb."
                    className="sb-input-field"
                  />
                </div>

                <div className="form-group-field">
                  <label className="form-field-label">Yetkili Adı Soyadı <span className="req-star">*</span></label>
                  <div className="input-with-icon-wrapper">
                    <input 
                      type="text" 
                      name="contactName" 
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Adınız ve Soyadınız"
                      className="sb-input-field with-icon"
                    />
                    <User size={18} className="field-icon" />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label className="form-field-label">İletişim Telefonu <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <input 
                        type="tel" 
                        name="contactPhone" 
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="0555 123 4567"
                        className="sb-input-field with-icon"
                      />
                      <Phone size={18} className="field-icon" />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label className="form-field-label">E-posta Adresi <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <input 
                        type="email" 
                        name="contactEmail" 
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="yetkili@sirketiniz.com"
                        className="sb-input-field with-icon"
                      />
                      <Mail size={18} className="field-icon" />
                    </div>
                  </div>
                </div>

                <div className="sb-info-card">
                  <Info size={18} className="info-icon" />
                  <p className="info-text">
                    Toptan ve proje fiyat tekliflerinin size en hızlı şekilde ulaştırılabilmesi için kurumsal e-posta ve telefon numaranızın doğruluğunu teyit ediniz.
                  </p>
                </div>

                <div className="form-step-nav-buttons single-end">
                  <button onClick={nextStep} className="btn-next-action">
                    Devam Et <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Proje Detayları */}
            {step === 2 && (
              <div className="step-content-pane">
                <div className="section-title-bar">
                  <div className="section-icon-box">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="section-title">Proje ve Şantiye Detayları</h3>
                    <p className="section-subtitle">Üretici ve bayilerin doğru metraj ve lojistik hesabı yapabilmesi için şantiye bilgilerini belirtin.</p>
                  </div>
                </div>

                <div className="form-grid-2col proj-main-grid">
                  <div className="form-group-field">
                    <label className="form-field-label">Proje Adı <span className="req-star">*</span></label>
                    <input 
                      type="text" 
                      name="projectName" 
                      value={formData.projectName}
                      onChange={handleInputChange}
                      placeholder="Örn: Vadi Konakları, Kule Plaza 2. Etap"
                      className="sb-input-field"
                    />
                  </div>

                  <div className="form-group-field">
                    <label className="form-field-label">Proje Tipi <span className="req-star">*</span></label>
                    <select 
                      name="projectType" 
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="sb-select-field"
                    >
                      {projectTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label className="form-field-label">İl <span className="req-star">*</span></label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Örn: İstanbul, Ankara, İzmir"
                      className="sb-input-field"
                    />
                  </div>

                  <div className="form-group-field">
                    <label className="form-field-label">İlçe <span className="req-star">*</span></label>
                    <input 
                      type="text" 
                      name="district" 
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Örn: Kadıköy, Çankaya, Bornova"
                      className="sb-input-field"
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label className="form-field-label">Tahmini Metraj İhtiyacı (m²) <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <input 
                        type="number" 
                        name="quantityM2" 
                        value={formData.quantityM2}
                        onChange={handleInputChange}
                        placeholder="Örn: 2500"
                        className="sb-input-field with-icon"
                      />
                      <Maximize2 size={18} className="field-icon" />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label className="form-field-label">Mevcut İnşaat Aşaması <span className="req-star">*</span></label>
                    <select 
                      name="constructionStep" 
                      value={formData.constructionStep}
                      onChange={handleInputChange}
                      className="sb-select-field"
                    >
                      {constructionSteps.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group-field">
                    <label className="form-field-label">Hedeflenen m² Bütçesi <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <select 
                        name="budgetM2" 
                        value={formData.budgetM2}
                        onChange={handleInputChange}
                        className="sb-select-field with-icon"
                      >
                        {budgetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <DollarSign size={18} className="field-icon" />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label className="form-field-label">Hedef Teslim Zamanı <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <select 
                        name="deliveryTimeline" 
                        value={formData.deliveryTimeline}
                        onChange={handleInputChange}
                        className="sb-select-field with-icon"
                      >
                        {timelines.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <Calendar size={18} className="field-icon" />
                    </div>
                  </div>
                </div>

                <div className="form-step-nav-buttons">
                  <button onClick={prevStep} className="btn-prev-action">
                    <ArrowLeft size={17} /> Geri Dön
                  </button>
                  <button onClick={nextStep} className="btn-next-action">
                    Devam Et <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Seramik İhtiyaç & Tercihleri */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="step-content-pane">
                <div className="section-title-bar">
                  <div className="section-icon-box">
                    <Layers2 size={20} />
                  </div>
                  <div>
                    <h3 className="section-title">Seramik İhtiyaç ve Tercihleri</h3>
                    <p className="section-subtitle">Projenizde kullanılacak karo boyutları, tasarım stilleri ve yüzey özelliklerini seçin.</p>
                  </div>
                </div>

                {/* Tarz Tercihi */}
                <div className="form-group-field">
                  <label className="form-field-label">Tercih Edilen Tarz / Desen (Çoklu Seçim) <span className="req-star">*</span></label>
                  <div className="chips-container">
                    {styleOptions.map(opt => {
                      const isSelected = formData.ceramicStyles.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('ceramicStyles', opt)}
                          className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} className="chip-check" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ebat Tercihi */}
                <div className="form-group-field">
                  <label className="form-field-label">Ebat Tercihi (Çoklu Seçim) <span className="req-star">*</span></label>
                  <div className="chips-container">
                    {sizeOptions.map(opt => {
                      const isSelected = formData.ceramicSizes.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('ceramicSizes', opt)}
                          className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} className="chip-check" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Yüzey Tercihi */}
                <div className="form-group-field">
                  <label className="form-field-label">Yüzey Bitişi Tercihleri (Çoklu Seçim)</label>
                  <div className="chips-container">
                    {finishOptions.map(opt => {
                      const isSelected = formData.ceramicFinishes.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('ceramicFinishes', opt)}
                          className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} className="chip-check" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kullanım Alanı */}
                <div className="form-group-field">
                  <label className="form-field-label">Kullanım Alanları (Çoklu Seçim) <span className="req-star">*</span></label>
                  <div className="chips-container">
                    {usageAreaOptions.map(opt => {
                      const isSelected = formData.usageAreas.includes(opt);
                      return (
                        <button 
                          key={opt}
                          type="button"
                          onClick={() => handleMultiSelect('usageAreas', opt)}
                          className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} className="chip-check" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-grid-2col">
                  {/* Renk Tercihi */}
                  <div className="form-group-field">
                    <label className="form-field-label">Renk Tercihleri (İsteğe Bağlı)</label>
                    <div className="input-with-icon-wrapper">
                      <input 
                        type="text" 
                        name="ceramicColors" 
                        value={formData.ceramicColors}
                        onChange={handleInputChange}
                        placeholder="Örn: Antrasit, Beyaz, Bej, Gri"
                        className="sb-input-field with-icon"
                      />
                      <Palette size={18} className="field-icon" />
                    </div>
                  </div>

                  {/* Teknik Şartlar/Detaylar */}
                  <div className="form-group-field">
                    <label className="form-field-label">İlave Notlar / Detaylı Şartname</label>
                    <input 
                      type="text" 
                      name="notes" 
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Örn: Donmaya dayanıklı porselen karo, R10 kaymazlık."
                      className="sb-input-field"
                    />
                  </div>
                </div>

                {/* KVKK Onay Kutusu */}
                <div className="kvkk-checkbox-row">
                  <input 
                    type="checkbox" 
                    id="kvkk-check" 
                    checked={kvkkAccepted} 
                    onChange={(e) => setKvkkAccepted(e.target.checked)} 
                    required
                    className="kvkk-checkbox-input"
                  />
                  <label htmlFor="kvkk-check" className="kvkk-checkbox-label">
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" className="kvkk-link">KVKK Aydınlatma Metni'ni</Link> okudum ve kabul ediyorum.
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="form-step-nav-buttons">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="btn-prev-action"
                  >
                    <ArrowLeft size={17} /> Geri Dön
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn-submit-demand"
                  >
                    {loading ? (
                      'Talep Gönderiliyor...'
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Talep Oluştur & İhaleyi Başlat
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* LUXURY PORCELAIN LIGHT THEME & MOBILE APP-GRADE CSS */}
      <style jsx>{`
        .sb-project-page-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
          background-image: radial-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          color: #0f172a;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          padding: 44px 20px 60px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .project-header {
          text-align: center;
          margin-bottom: 32px;
          max-width: 660px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sb-back-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 16px;
          background: #ffffff;
          padding: 8px 18px;
          border-radius: 100px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }

        .sb-back-home-btn:hover {
          color: #0f172a;
          border-color: #cbd5e1;
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .sb-b2b-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(179, 142, 71, 0.1);
          color: #b38e47;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.76rem;
          font-weight: 800;
          margin-bottom: 12px;
          border: 1px solid rgba(179, 142, 71, 0.25);
          letter-spacing: 0.02em;
        }

        .project-main-title {
          font-size: 2.1rem;
          font-weight: 900;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
          color: #0f172a;
          line-height: 1.25;
        }

        .project-main-desc {
          color: #64748b;
          font-size: 0.94rem;
          line-height: 1.55;
          margin: 0;
        }

        /* Container Card */
        .project-form-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 36px 40px;
          width: 100%;
          max-width: 760px;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.03);
          box-sizing: border-box;
          position: relative;
        }

        .mobile-sheet-bar {
          display: none;
        }

        /* Step Indicators */
        .step-indicators {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 34px;
          position: relative;
          padding: 0 10px;
        }

        .step-track-bg {
          position: absolute;
          top: 19px;
          left: 44px;
          right: 44px;
          height: 3px;
          background: #e2e8f0;
          z-index: 1;
          border-radius: 4px;
        }

        .step-track-fill {
          position: absolute;
          top: 19px;
          left: 44px;
          height: 3px;
          background: linear-gradient(90deg, #b38e47, #d4af37);
          z-index: 2;
          transition: width 0.35s ease;
          border-radius: 4px;
        }

        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
          position: relative;
        }

        .step-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          border: 2px solid #e2e8f0;
          transition: all 0.25s ease;
        }

        .step-circle.current {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 100%);
          color: #ffffff;
          border-color: #b38e47;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.35);
        }

        .step-circle.done {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .step-label {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
          margin-top: 8px;
          transition: all 0.2s ease;
        }

        .step-label.label-current {
          color: #0f172a;
          font-weight: 800;
        }

        /* Section Headings */
        .step-content-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-title-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 14px;
          margin-bottom: 4px;
        }

        .section-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(179, 142, 71, 0.1);
          color: #b38e47;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .section-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        /* Form Controls */
        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
        }

        .req-star {
          color: #ef4444;
        }

        .sb-input-field {
          width: 100%;
          min-height: 46px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.92rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .sb-input-field:focus {
          border-color: #b38e47;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .sb-select-field {
          width: 100%;
          min-height: 46px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.92rem;
          outline: none;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sb-select-field:focus {
          border-color: #b38e47;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .input-with-icon-wrapper {
          position: relative;
        }

        .sb-input-field.with-icon,
        .sb-select-field.with-icon {
          padding-left: 42px;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .proj-main-grid {
          grid-template-columns: 1.4fr 1fr;
        }

        /* Info Card */
        .sb-info-card {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          align-items: flex-start;
          margin-top: 4px;
        }

        .info-icon {
          color: #b38e47;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-text {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.45;
        }

        /* Error Alert */
        .sb-alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.86rem;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .alert-icon {
          color: #ef4444;
          flex-shrink: 0;
        }

        /* Multi-Select Chips */
        .chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip-btn {
          padding: 9px 15px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s ease;
          min-height: 38px;
        }

        .chip-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
          transform: translateY(-1px);
        }

        .chip-btn.selected {
          background: rgba(179, 142, 71, 0.12);
          border-color: #b38e47;
          color: #8c6a27;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(179, 142, 71, 0.15);
        }

        .chip-check {
          color: #b38e47;
        }

        /* KVKK Checkbox */
        .kvkk-checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 10px;
          margin-bottom: 4px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .kvkk-checkbox-input {
          margin-top: 3px;
          cursor: pointer;
          accent-color: #b38e47;
          width: 17px;
          height: 17px;
        }

        .kvkk-checkbox-label {
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.45;
          cursor: pointer;
          user-select: none;
        }

        .kvkk-link {
          color: #b38e47;
          font-weight: 700;
          text-decoration: underline;
        }

        /* Navigation Buttons */
        .form-step-nav-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .form-step-nav-buttons.single-end {
          justify-content: flex-end;
        }

        .btn-prev-action {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 46px;
          transition: all 0.2s ease;
        }

        .btn-prev-action:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-next-action {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 12px 28px;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 46px;
          box-shadow: 0 4px 15px rgba(179, 142, 71, 0.25);
          transition: all 0.2s ease;
        }

        .btn-next-action:hover {
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.35);
          transform: translateY(-1px);
        }

        .btn-submit-demand {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 13px 32px;
          font-weight: 800;
          font-size: 0.92rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 48px;
          box-shadow: 0 6px 22px rgba(179, 142, 71, 0.3);
          transition: all 0.2s ease;
        }

        .btn-submit-demand:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-submit-demand:hover:not(:disabled) {
          box-shadow: 0 8px 25px rgba(179, 142, 71, 0.4);
          transform: translateY(-1px);
        }

        /* Success View Card */
        .success-view-card {
          text-align: center;
          padding: 24px 0 10px 0;
        }

        .success-icon-bubble {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #f0fdf4;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
          border: 1px solid #bbf7d0;
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.12);
        }

        .success-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 10px 0;
        }

        .success-desc {
          color: #64748b;
          font-size: 0.94rem;
          line-height: 1.6;
          margin: 0 0 24px 0;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .ref-code-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          max-width: 320px;
          margin: 0 auto 28px auto;
        }

        .ref-label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .ref-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          font-family: monospace;
          color: #b38e47;
          letter-spacing: 0.05em;
        }

        .success-actions-row {
          display: flex;
          justify-content: center;
          gap: 14px;
        }

        .btn-new-demand {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 46px;
        }

        .btn-new-demand:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-return-home {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 100%);
          color: #ffffff;
          text-decoration: none;
          border: none;
          border-radius: 12px;
          padding: 12px 26px;
          font-weight: 800;
          font-size: 0.88rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 46px;
          box-shadow: 0 4px 15px rgba(179, 142, 71, 0.25);
          transition: all 0.2s ease;
        }

        .btn-return-home:hover {
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.35);
          transform: translateY(-1px);
        }

        /* ===== TABLET RESPONSIVE (max-width: 768px) ===== */
        @media (max-width: 768px) {
          .sb-project-page-root {
            padding: 24px 14px 40px 14px;
          }

          .project-header {
            margin-bottom: 22px;
          }

          .project-main-title {
            font-size: 1.55rem;
          }

          .project-form-container {
            padding: 24px 18px;
            border-radius: 20px;
          }

          .step-indicators {
            margin-bottom: 26px;
            padding: 0;
          }

          .step-circle {
            width: 34px;
            height: 34px;
            font-size: 0.82rem;
          }

          .step-track-bg, .step-track-fill {
            top: 17px;
            left: 30px;
            right: 30px;
          }

          .step-label {
            font-size: 0.72rem;
          }

          .form-grid-2col, .proj-main-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .form-step-nav-buttons {
            flex-direction: column-reverse;
            gap: 10px;
          }

          .form-step-nav-buttons button {
            width: 100%;
            justify-content: center;
            min-height: 48px;
            font-size: 0.92rem;
          }

          .success-actions-row {
            flex-direction: column-reverse;
            gap: 10px;
          }

          .success-actions-row button,
          .success-actions-row a {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }
        }

        /* ===== SMARTPHONE APP FEEL (max-width: 480px) ===== */
        @media (max-width: 480px) {
          .sb-project-page-root {
            padding: 16px 10px 30px 10px;
          }

          .mobile-sheet-bar {
            display: block;
            width: 36px;
            height: 4px;
            border-radius: 10px;
            background: #cbd5e1;
            margin: -12px auto 16px auto;
          }

          .project-main-title {
            font-size: 1.35rem;
          }

          .project-main-desc {
            font-size: 0.85rem;
          }

          .project-form-container {
            padding: 18px 14px;
            border-radius: 18px;
          }

          .step-circle {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .step-track-bg, .step-track-fill {
            top: 16px;
            left: 20px;
            right: 20px;
          }

          .step-label {
            font-size: 0.68rem;
            text-align: center;
            max-width: 75px;
          }

          .chip-btn {
            padding: 8px 12px;
            font-size: 0.78rem;
            min-height: 36px;
          }

          .sb-input-field, .sb-select-field {
            font-size: 0.95rem; /* Prevents auto-zoom on iOS Safari */
          }
        }
      `}</style>
    </div>
  );
}
