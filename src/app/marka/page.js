'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  User, 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  MapPin, 
  CreditCard, 
  Plus, 
  LogOut,
  Calendar,
  ExternalLink,
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function BrandPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Brand Session Info
  const [brandInfo, setBrandInfo] = useState(null);

  // Dashboard Metrics & Campaign States
  const [b2bStats, setB2bStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [brandProducts, setBrandProducts] = useState([]);
  
  // Ad Campaign Creator Form
  const [campaignBid, setCampaignBid] = useState('2.50');
  const [campaignBudget, setCampaignBudget] = useState('1000');
  const [campaignProduct, setCampaignProduct] = useState('');
  const [campaignSuccessMsg, setCampaignSuccessMsg] = useState('');
  const [campaignErrorMsg, setCampaignErrorMsg] = useState('');
  const [isStartingCampaign, setIsStartingCampaign] = useState(false);

  // SaaS Payment States
  const [bankDetails, setBankDetails] = useState({ bank_name: '', bank_recipient: '', bank_iban: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('PRO');
  const [paymentSenderName, setPaymentSenderName] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const [activePortalTab, setActivePortalTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const hasPending = b2bStats?.saas?.status === 'PENDING_APPROVAL' || b2bStats?.saas?.pendingStatus === 'PENDING_APPROVAL';
  const requestedPlan = b2bStats?.saas?.status === 'PENDING_APPROVAL' ? b2bStats.saas.plan : (b2bStats?.saas?.pendingStatus === 'PENDING_APPROVAL' ? b2bStats.saas.pendingPlan : null);
  const isRejected = b2bStats?.saas?.status === 'REJECTED' || b2bStats?.saas?.pendingStatus === 'REJECTED';

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('sb_brand_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setBrandInfo(session);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Session restore failed:', err);
      }
    }
  }, []);

  // Fetch stats and products once logged in
  useEffect(() => {
    if (isLoggedIn && brandInfo) {
      fetchB2bStats(brandInfo.id);
      fetchBrandProducts(brandInfo.id);
      loadBrandProjects(brandInfo.id);
      loadBankDetails();
    }
  }, [isLoggedIn, brandInfo]);

  const loadBankDetails = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setBankDetails({
          bank_name: data.bank_name,
          bank_recipient: data.bank_recipient,
          bank_iban: data.bank_iban
        });
      }
    } catch (err) {
      console.error('Failed to load bank settings:', err);
    }
  };

  const loadBrandProjects = async (brandId) => {
    if (!brandId) return;
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/projects/list?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchB2bStats = async (brandId) => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/b2b/stats?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setB2bStats(data);
      }
    } catch (err) {
      console.error('Failed to load brand stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchBrandProducts = async (brandId) => {
    try {
      const res = await fetch(`/api/search?brandId=${brandId}&limit=all`);
      if (res.ok) {
        const data = await res.json();
        setBrandProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch brand products:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/b2b/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setBrandInfo(data.brand);
        localStorage.setItem('sb_brand_session', JSON.stringify(data.brand));
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || 'Giriş başarısız oldu.');
      }
    } catch (err) {
      setLoginError('Sunucu bağlantı hatası.');
      console.error(err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sb_brand_session');
    setIsLoggedIn(false);
    setBrandInfo(null);
    setB2bStats(null);
    setBrandProducts([]);
    setUsername('');
    setPassword('');
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    if (!brandInfo || !campaignProduct) return;
    setIsStartingCampaign(true);
    setCampaignSuccessMsg('');
    setCampaignErrorMsg('');

    try {
      const res = await fetch('/api/b2b/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandInfo.id,
          productId: campaignProduct,
          bidAmount: parseFloat(campaignBid) || 2.50,
          budget: parseFloat(campaignBudget) || 1000
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCampaignSuccessMsg('Reklam kampanyası başarıyla başlatıldı ve yayına alındı!');
        setCampaignProduct('');
        fetchB2bStats(brandInfo.id);
      } else {
        setCampaignErrorMsg(data.error || 'Kampanya oluşturulamadı.');
      }
    } catch (err) {
      setCampaignErrorMsg('API bağlantı hatası.');
      console.error(err);
    } finally {
      setIsStartingCampaign(false);
    }
  };

  const handleSendPaymentNotification = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentSuccess('');
    setPaymentError('');

    try {
      const response = await fetch('/api/brands/saas-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandInfo.id,
          plan: selectedPaymentPlan,
          paymentSender: paymentSenderName,
          paymentDate: paymentDate,
          paymentNote: paymentNote
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPaymentSuccess(`Ödeme bildiriminiz başarıyla iletildi. Talebiniz admin onayına gönderilmiştir.`);
        fetchB2bStats(brandInfo.id);
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess('');
          setPaymentSenderName('');
          setPaymentDate('');
          setPaymentNote('');
        }, 3000);
      } else {
        setPaymentError(result.error || 'Ödeme bildirimi gönderilemedi.');
      }
    } catch (err) {
      setPaymentError('Bağlantı hatası.');
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="login-layout" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div className="login-card glass-panel" style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
        }}>
          <div className="login-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: 'var(--text-primary, #111)',
              marginBottom: '16px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              <ArrowLeft size={14} /> Ana Sayfaya Dön
            </Link>
            <div className="logo-icon" style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #111 0%, #444 100%)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.4rem',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}>SB</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111', margin: '0 0 6px 0' }}>B2B Marka Portalı</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Fabrika yetkilileri için analiz ve reklam yönetim paneli.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {loginError && (
              <div className="error-alert" style={{
                background: '#fee2e2',
                color: '#ef4444',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#333' }}>Kullanıcı Adı</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="vitra, kutahya, bien..." 
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: '12px',
                    border: '1px solid #ced4da',
                    fontSize: '0.9rem',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#888' }} />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#333' }}>Şifre</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: '12px',
                    border: '1px solid #ced4da',
                    fontSize: '0.9rem',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#888' }} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              style={{
                background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                transition: 'all 0.2s'
              }}
            >
              {loginLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Bağlanılıyor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Marka Girişi Yap</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#888' }}>
            Fabrika giriş şifresi demo olarak markanın adı + 123 şeklinde tanımlıdır (Örn: vitra / vitra123).
          </div>
        </div>
      </main>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* HEADER NAVBAR */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="brand-header-container" style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="brand-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.1rem'
            }}>SB</div>
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {brandInfo.name} B2B Portal
                {b2bStats?.saas && (
                  <span style={{ 
                    fontSize: '0.68rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: b2bStats.saas.plan === 'ENTERPRISE' ? 'linear-gradient(135deg, #111 0%, #333 100%)' : '#d4af37', 
                    color: b2bStats.saas.plan === 'ENTERPRISE' ? '#d4af37' : '#000', 
                    fontWeight: '700' 
                  }}>
                    {b2bStats.saas.plan} Üyelik
                  </span>
                )}
              </h1>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>Raporlama, Reklam Yönetimi ve Tüketici Analitiği</p>
            </div>
          </div>

          <div className="brand-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {b2bStats?.saas?.expiresAt && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                <span>Paket Bitiş: {new Date(b2bStats.saas.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}

            {/* Tab Navigation Buttons */}
            <div className="brand-tabs-nav" style={{ display: 'flex', gap: '4px', background: '#f1f3f5', borderRadius: '8px', padding: '3px', marginRight: '4px' }}>
              <button 
                onClick={() => setActivePortalTab('dashboard')}
                style={{
                  background: activePortalTab === 'dashboard' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: activePortalTab === 'dashboard' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: activePortalTab === 'dashboard' ? '#111' : '#6c757d',
                  boxShadow: activePortalTab === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Activity size={13} />
                <span>Analiz & Reklam</span>
              </button>
              <button 
                onClick={() => setActivePortalTab('b2b-projects')}
                style={{
                  background: activePortalTab === 'b2b-projects' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: activePortalTab === 'b2b-projects' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: activePortalTab === 'b2b-projects' ? '#111' : '#6c757d',
                  boxShadow: activePortalTab === 'b2b-projects' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Building2 size={13} />
                <span>Proje Talepleri (B2B)</span>
              </button>
            </div>

            <button 
              onClick={handleLogout} 
              style={{
                background: 'transparent',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ef4444'
              }}
            >
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* PORTAL MAIN CONTENT */}
      <main className="brand-main-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {activePortalTab === 'b2b-projects' ? (
          /* B2B PROJECTS TAB */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} style={{ color: '#d4af37' }} />
                  B2B Proje & Toplu Seramik Talepleri
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  İnşaat firmaları, müteahhitler ve mimarların projeleri için oluşturduğu toptan alım talepleri.
                </p>
              </div>
              
              {b2bStats?.saas && (
                <div style={{
                  background: b2bStats.saas.plan === 'ENTERPRISE' ? 'linear-gradient(135deg, #111 0%, #333 100%)' : b2bStats.saas.plan === 'PRO' ? 'rgba(212, 175, 55, 0.1)' : '#fee2e2',
                  color: b2bStats.saas.plan === 'ENTERPRISE' ? '#d4af37' : b2bStats.saas.plan === 'PRO' ? '#d4af37' : '#dc3545',
                  border: '1px solid ' + (b2bStats.saas.plan === 'ENTERPRISE' ? '#d4af37' : b2bStats.saas.plan === 'PRO' ? 'rgba(212,175,55,0.2)' : '#fca5a5'),
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  Mevcut Planınız: {b2bStats.saas.plan}
                </div>
              )}
            </div>

            {/* List of project requests */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {projectsLoading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                  <span>Proje talepleri yükleniyor...</span>
                </div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span>Şu anda aktif veya onaylanmış bir B2B proje talebi bulunmamaktadır.</span>
                </div>
              ) : (
                projects.map(proj => {
                  const isLocked = proj.isLocked;
                  const isMasked = proj.isMasked;

                  return (
                    <div key={proj.id} style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Top Row */}
                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              background: '#e0f2fe',
                              color: '#0284c7',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.68rem',
                              fontWeight: '700'
                            }}>{proj.projectType}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{proj.city} / {proj.district}</span>
                            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>•</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Aşama: {proj.constructionStep}</span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111', margin: '8px 0 0 0' }}>
                            {proj.projectName}
                          </h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Talep Tarihi</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {new Date(proj.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Main Details */}
                      <div className="brand-project-details-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {/* Column 1: Material */}
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Malzeme Tercihleri</h5>
                          {isLocked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.5 }}>
                              <div style={{ fontSize: '0.85rem' }}>Ebat: <strong>***</strong></div>
                              <div style={{ fontSize: '0.85rem' }}>Tarz: <strong>***</strong></div>
                              <div style={{ fontSize: '0.85rem' }}>Kullanım Alanı: <strong>***</strong></div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#334155' }}>
                              <div>Ebat: <strong>{proj.ceramicSizes}</strong></div>
                              <div>Tarz: <strong>{proj.ceramicStyles}</strong></div>
                              {proj.ceramicFinishes && <div>Yüzey: <strong>{proj.ceramicFinishes}</strong></div>}
                              {proj.ceramicColors && <div>Renk: <strong>{proj.ceramicColors}</strong></div>}
                              <div>Alan: <strong>{proj.usageAreas}</strong></div>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Volume */}
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Miktar ve Bütçe</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#334155' }}>
                            <div>Toplam Metraj: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{proj.quantityM2.toLocaleString('tr-TR')} m²</strong></div>
                            <div>Hedef Bütçe: <strong style={{ color: '#0284c7' }}>{proj.budgetM2}</strong></div>
                            <div>Teslim Süresi: <strong>{proj.deliveryTimeline}</strong></div>
                          </div>
                        </div>

                        {/* Column 3: Contact */}
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Müteahhit / İletişim</h5>
                          {isLocked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.5 }}>
                              <div style={{ fontSize: '0.82rem' }}>Firma: <strong>***</strong></div>
                              <div style={{ fontSize: '0.82rem' }}>Yetkili: <strong>***</strong></div>
                              <div style={{ fontSize: '0.82rem' }}>Telefon: <strong>***</strong></div>
                            </div>
                          ) : isMasked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                              <div>Firma: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.companyName}</strong></div>
                              <div>Yetkili: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.contactName}</strong></div>
                              <div>Telefon: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.contactPhone}</strong></div>
                              <div style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700', marginTop: '4px' }}>
                                ⚠️ İletişim bilgilerini görmek için ENTERPRISE pakete geçin.
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                              <div>Firma: <strong style={{ color: '#111' }}>{proj.companyName}</strong></div>
                              <div>Yetkili: <strong>{proj.contactName}</strong></div>
                              <div>Telefon: <a href={`tel:${proj.contactPhone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: '600' }}>{proj.contactPhone}</a></div>
                              <div>E-posta: <a href={`mailto:${proj.contactEmail}`} style={{ color: '#64748b' }}>{proj.contactEmail}</a></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes Section */}
                      {!isLocked && proj.notes && (
                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1' }}>
                          Proje Notu: "{proj.notes}"
                        </div>
                      )}

                      {/* Lock Overlays */}
                      {isLocked && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#dc3545',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px'
                          }}>
                            <Lock size={18} />
                          </div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111', margin: '0 0 4px 0' }}>B2B Proje Detayları Kilitli</h4>
                          <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 12px 0', maxWidth: '300px' }}>
                            Toplu ihale metrajlarını ve malzeme ihtiyaçlarını görmek için markanızın B2B aboneliğini yükseltin.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : statsLoading && !b2bStats ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }}>
            <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto', width: '32px', height: '32px' }} />
            <span>Marka verileri derleniyor...</span>
          </div>
        ) : b2bStats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {requestedPlan && (
              <div className="glass-panel" style={{
                background: '#fff9db',
                border: '1px solid #fde047',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#b45309',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                <Loader2 size={18} className="animate-spin" style={{ color: '#d97706', flexShrink: 0 }} />
                <div>
                  <strong>⏱️ Abonelik Talebi Onay Bekliyor:</strong> {requestedPlan} paket talebiniz alındı. Ödemeniz doğrulandıktan sonra admin onayıyla en kısa sürede aktifleşecektir.
                </div>
              </div>
            )}

            {isRejected && (
              <div className="glass-panel" style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#991b1b',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                <AlertCircle size={18} style={{ color: '#991b1b', flexShrink: 0 }} />
                <div>
                  <strong>❌ Talep Reddedildi:</strong> {b2bStats?.saas?.pendingPlan || b2bStats?.saas?.plan} paket talebiniz admin tarafından onaylanmadı. Detaylar ve destek için admin ile iletişime geçebilirsiniz.
                </div>
              </div>
            )}
            
            {/* METRICS SUMMARY */}
            <div className="brand-stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SaaS Planı</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-gold, #d4af37)', textShadow: '0 2px 4px rgba(212,175,55,0.1)' }}>{b2bStats.saas?.plan || 'BASIC'}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      color: b2bStats.saas?.status === 'ACTIVE' ? '#10b981' : (b2bStats.saas?.status === 'PENDING_APPROVAL' ? '#f59e0b' : '#ef4444'),
                      fontWeight: '700',
                      background: b2bStats.saas?.status === 'ACTIVE' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {b2bStats.saas?.status === 'ACTIVE' ? 'Aktif' : b2bStats.saas?.status === 'PENDING_APPROVAL' ? 'Onay Bekliyor' : b2bStats.saas?.status === 'REJECTED' ? 'Reddedildi' : b2bStats.saas?.status || 'YOK'}
                    </span>
                  </div>
                  {b2bStats.saas?.pendingStatus === 'PENDING_APPROVAL' && (
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '600' }}>
                      ⏱️ {b2bStats.saas.pendingPlan} Yükseltme Bekliyor
                    </span>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam Görüntülenme</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{b2bStats.summary?.totalViews}</span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>+12.4% (Bu Ay)</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Katalog & Detay Sayfası</span>
              </div>

              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tıklanma Oranı (CTR)</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>%{b2bStats.summary?.ctr}</span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>Sektör Ort. Üstü</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Tıklama / Gösterim Dağılımı</span>
              </div>

              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bayi Yönlendirmeleri</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>{b2bStats.summary?.totalLeads}</span>
                  <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '700' }}>9 Aktif Bayi</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Bayilere İletilen Müşteri Formları</span>
              </div>
            </div>

            {/* VISUAL ANALYTICS & MARKET BENCHMARKING ROW */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '24px',
              width: '100%'
            }} className="brand-campaign-grid">
              {/* Graphic Chart widget */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={18} style={{ color: '#2563eb' }} />
                  Etkileşim & Erişim Trend Analizi
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 24px 0' }}>Son 6 ayda markanıza ait ürünlerin aldığı tekil gösterim ve katalog görüntüleme eğrisi.</p>
                
                {/* Responsive SVG Chart */}
                <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                  <svg viewBox="0 0 500 200" width="100%" height="100%" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00"/>
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1"/>
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1"/>
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1"/>
                    <line x1="0" y1="180" x2="500" y2="180" stroke="#e2e8f0" strokeWidth="2"/>

                    {/* Chart Area Fill */}
                    <path d="M 0 180 Q 80 120 160 140 T 320 60 T 420 40 L 500 20 L 500 180 Z" fill="url(#chartGrad)"/>

                    {/* Chart Line */}
                    <path d="M 0 180 Q 80 120 160 140 T 320 60 T 420 40 L 500 20" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>

                    {/* Interactive dots */}
                    <circle cx="160" cy="140" r="5" fill="#2563eb" stroke="#fff" strokeWidth="2"/>
                    <circle cx="320" cy="60" r="5" fill="#2563eb" stroke="#fff" strokeWidth="2"/>
                    <circle cx="500" cy="20" r="5" fill="#10b981" stroke="#fff" strokeWidth="2"/>
                  </svg>
                  
                  {/* Labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>
                    <span>Ocak</span>
                    <span>Şubat</span>
                    <span>Mart</span>
                    <span>Nisan</span>
                    <span>Mayıs</span>
                    <span>Haziran (Aktif)</span>
                  </div>
                </div>
              </div>

              {/* Market Share circle gauge */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--accent-gold, #d4af37)' }} />
                    Pazar Payı Endeksi
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>SeramikBak pazar yeri genelinde markanızın görüntülenme payı.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  {/* Circle SVG Progress */}
                  <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                    <svg width="110" height="110" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--accent-gold, #d4af37)"
                        strokeDasharray="24.8, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>%24.8</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>2. En Büyük Marka</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Qua Granite'in ardından</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D / AR SHOWROOM ENGAGEMENT SECTION */}
            <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                3D Sanal Stüdyo & AR (Artırılmış Gerçeklik) Etkileşim Raporu
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 24px 0' }}>Kullanıcıların sanal stüdyoda ürünlerinizle yaptığı banyo tasarımları ve artırılmış gerçeklik etkileşim istatistikleri.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="campaign-inputs-grid">
                <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#7c3aed' }}>1.482 Kez</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5b21b6', marginTop: '4px' }}>3D Banyo Planlama</div>
                  <div style={{ fontSize: '0.68rem', color: '#7c3aed', marginTop: '2px' }}>Ürünlerinizle oda tasarlandı</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb' }}>492 Kez</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e40af', marginTop: '4px' }}>AR Evde Görselleştirme</div>
                  <div style={{ fontSize: '0.68rem', color: '#2563eb', marginTop: '2px' }}>Kamerayla zemin kaplama yapıldı</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#059669' }}>86 İstek</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#065f46', marginTop: '4px' }}>Doku Numune Talebi</div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '2px' }}>Gönderilen kargo numuneleri</div>
                </div>
              </div>
            </div>

            {/* DEALER NETWORK PERFORMANCE LEADERBOARD */}
            <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={18} style={{ color: '#059669' }} />
                    Yetkili Bayi Ağı Performans Liderlik Tablosu
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Yönlendirilen müşteri taleplerini en hızlı karşılayan ve satışa dönüştüren bayi analizleri.</p>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                  Toplam 9 Yetkili Bayi
                </span>
              </div>

              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                      <th style={{ padding: '12px 8px' }}>Bayi Adı</th>
                      <th style={{ padding: '12px 8px' }}>Bölge / Şehir</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center' }}>Yönlendirilen Lead</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center' }}>Satışa Dönüşüm Oranı</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center' }}>Ort. Yanıt Süresi</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center' }}>Müşteri Skoru</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>İstanbul Seramik Sarayı</td>
                      <td style={{ padding: '12px 8px', color: '#475569' }}>İstanbul / Kadıköy</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>38</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#059669' }}>%42</span>
                          <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '42%', height: '100%', background: '#059669' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#475569' }}>12 dk</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#eab308', fontWeight: '700' }}>⭐ 4.9</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>Ege Yapı Market</td>
                      <td style={{ padding: '12px 8px', color: '#475569' }}>İzmir / Bornova</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>26</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#059669' }}>%38</span>
                          <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '38%', height: '100%', background: '#059669' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#475569' }}>18 dk</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#eab308', fontWeight: '700' }}>⭐ 4.8</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>Ankara Yapı Tasarım</td>
                      <td style={{ padding: '12px 8px', color: '#475569' }}>Ankara / Çankaya</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>19</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#2563eb' }}>%29</span>
                          <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '29%', height: '100%', background: '#2563eb' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#475569' }}>32 dk</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#eab308', fontWeight: '700' }}>⭐ 4.5</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>Bursa Karo Dünyası</td>
                      <td style={{ padding: '12px 8px', color: '#475569' }}>Bursa / Nilüfer</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>14</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#ca8a04' }}>%21</span>
                          <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '21%', height: '100%', background: '#ca8a04' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#475569' }}>55 dk</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#eab308', fontWeight: '700' }}>⭐ 4.1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CAMPAIGNS & RECENT LEADS SPLIT */}
            <div className="brand-campaign-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px'
            }}>
              {/* Premium Campaigns Management */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} style={{ color: '#d4af37' }} />
                  Premium Reklam Yönetimi
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Arama sonuçlarında en üst sırada yer almak için ürün bazlı sponsorlu bütçe tanımlayın.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px', paddingRight: '8px' }}>
                  {b2bStats.campaigns.map(camp => (
                    <div key={camp.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <strong style={{ color: '#0f172a' }}>{camp.product?.name}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Kod: {camp.product?.code}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Tık: <strong>{camp.clicks}</strong></div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Maliyet: <strong>{camp.bidAmount} TL / tık</strong></div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>Kalan Bütçe: {camp.budget.toFixed(2)} TL</div>
                      </div>
                    </div>
                  ))}
                  {b2bStats.campaigns.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic', fontSize: '0.8rem' }}>
                      Henüz aktif bir reklam kampanyası bulunmamaktadır.
                    </div>
                  )}
                </div>

                <form onSubmit={handleCampaignSubmit} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: 0 }}>Yeni Reklam Kampanyası Başlat</h4>
                  
                  {campaignSuccessMsg && (
                    <div style={{ background: '#e6f7ed', color: '#10b981', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>{campaignSuccessMsg}</div>
                  )}
                  {campaignErrorMsg && (
                    <div style={{ background: '#fee2e2', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>{campaignErrorMsg}</div>
                  )}

                  <div className="campaign-inputs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Hedef Ürün</label>
                      <select 
                        value={campaignProduct} 
                        onChange={(e) => setCampaignProduct(e.target.value)} 
                        required
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                      >
                        <option value="">Seçiniz...</option>
                        {brandProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Tık Başına Teklif (TL)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={campaignBid} 
                        onChange={(e) => setCampaignBid(e.target.value)} 
                        required 
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Toplam Bütçe (TL)</label>
                      <input 
                        type="number" 
                        value={campaignBudget} 
                        onChange={(e) => setCampaignBudget(e.target.value)} 
                        required 
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isStartingCampaign}
                    style={{
                      background: '#0f172a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isStartingCampaign ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    <span>Reklam Kampanyasını Yayına Al</span>
                  </button>
                </form>
              </div>

              {/* Recent leads redirected to dealers */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0' }}>Yönlendirilen Son Bayi Teklifleri</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Ürünlerinizi fiziki olarak almak isteyen müşterilerin en yakın yetkili şubelerinize gönderdiği teklif formları.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {b2bStats.recentLeads.map(lead => (
                    <div key={lead.id} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{ color: '#0f172a' }}>{lead.clientName}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                        <div>Ürün: <strong>{lead.product?.name}</strong> ({lead.product?.code})</div>
                        <div style={{ textAlign: 'right' }}>Bayi: <strong>{lead.dealer?.name} ({lead.dealer?.city})</strong></div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                        Not: {lead.notes || 'Yok'}
                      </div>
                    </div>
                  ))}
                  {b2bStats.recentLeads.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b', fontStyle: 'italic' }}>
                      Henüz bayilerinize iletilen bir teklif talebi bulunmamaktadır.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MARKET TRENDS & STRIPE BILLING */}
            <div className="brand-trends-billing-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px'
            }}>
              {/* Market intelligence trends */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0' }}>B2B Pazar Trendleri (Tüketici Raporları)</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Kullanıcıların arama ve yoğunluk verilerine göre en popüler karolar ve lokasyonlar (PRO/Enterprise Özelliği).</p>

                <div className="brand-trends-tables-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>En Sık Aranan Kelimeler</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                          <th style={{ padding: '6px 0' }}>Kelime</th>
                          <th style={{ padding: '6px 0', textAlign: 'right' }}>Arama Adeti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b2bStats.topKeywords.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 0', color: '#334155' }}>{item.keyword}</td>
                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>{item.count}</td>
                          </tr>
                        ))}
                        {b2bStats.topKeywords.length === 0 && (
                          <tr><td colSpan="2" style={{ textAlign: 'center', padding: '12px 0', color: '#94a3b8' }}>Arama verisi yok.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>Arama Yoğunluğu Olan İller</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                          <th style={{ padding: '6px 0' }}>İl</th>
                          <th style={{ padding: '6px 0', textAlign: 'right' }}>Tıklama Adeti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b2bStats.topCities.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 0', color: '#334155' }}>{item.city}</td>
                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>{item.count}</td>
                          </tr>
                        ))}
                        {b2bStats.topCities.length === 0 && (
                          <tr><td colSpan="2" style={{ textAlign: 'center', padding: '12px 0', color: '#94a3b8' }}>Tıklama verisi yok.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SaaS Plan & Bank Transfer Payment Notification */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0' }}>SaaS Planı & Ödeme Yönetimi</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Markanızın yayın lisans planını yükseltin ve banka havalesi bildirimlerini yapın.</p>

                {/* Feature Comparison List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e40af' }}>💎 PRO PAKET ÖZELLİKLERİ</span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Sınırsız Ürün Listeleme & Detayları</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Premium Reklam Yönetimi (Öne Çıkarma)</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ B2B Pazar Trend Raporları (Kelime/İl)</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ B2B Proje Taleplerini Listeleme (M3/Ebat)</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>❌ Müteahhit/İnşaat İletişim Detayları (Kilitli)</li>
                    </ul>
                  </div>
                  <div style={{ background: '#fcfaf2', border: '1px solid #fde047', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ca8a04' }}>👑 ENTERPRISE PAKET ÖZELLİKLERİ</span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ PRO Paket İçeriğinin Tamamı</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Müteahhit/Mimar İletişim Detayları (Açık)</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Bayi Ağı Performans Liderlik Tablosu</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Öncelikli ERP/XML Entegrasyon Desteği</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Marka Pazar Payı & Rakip Raporları</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Lisans Seçenekleri:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => setSelectedPaymentPlan('PRO')} 
                        disabled={b2bStats?.saas?.plan === 'PRO'}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: selectedPaymentPlan === 'PRO' ? '#0f172a' : '#fff',
                          color: selectedPaymentPlan === 'PRO' ? '#fff' : '#0f172a',
                          fontWeight: '600',
                          cursor: b2bStats?.saas?.plan === 'PRO' ? 'default' : 'pointer',
                          opacity: b2bStats?.saas?.plan === 'PRO' ? 0.6 : 1
                        }}
                      >
                        PRO (₺11.990 / Yıl)
                      </button>
                      <button 
                        onClick={() => setSelectedPaymentPlan('ENTERPRISE')} 
                        disabled={b2bStats?.saas?.plan === 'ENTERPRISE'}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: selectedPaymentPlan === 'ENTERPRISE' ? '#0f172a' : '#fff',
                          color: selectedPaymentPlan === 'ENTERPRISE' ? '#fff' : '#0f172a',
                          fontWeight: '600',
                          cursor: b2bStats?.saas?.plan === 'ENTERPRISE' ? 'default' : 'pointer',
                          opacity: b2bStats?.saas?.plan === 'ENTERPRISE' ? 0.6 : 1
                        }}
                      >
                        ENTERPRISE (₺24.990 / Yıl)
                      </button>
                    </div>
                  </div>

                  {hasPending ? (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde047',
                      color: '#b45309',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      ⏱️ <strong>Abonelik Talebi Onay Bekliyor:</strong> {requestedPlan} paket talebiniz alındı. Banka transferiniz (Gönderen: {b2bStats?.saas?.paymentSender || 'Belirtilmedi'}, Dekont: {b2bStats?.saas?.paymentNote || '-'}) doğrulandıktan sonra admin onayıyla en kısa sürede aktifleşecektir.
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowPaymentModal(true)} 
                      disabled={b2bStats?.saas?.plan === selectedPaymentPlan}
                      style={{
                        background: b2bStats?.saas?.plan === selectedPaymentPlan ? '#f1f5f9' : 'var(--accent-gold, #d4af37)',
                        color: b2bStats?.saas?.plan === selectedPaymentPlan ? '#94a3b8' : '#000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: b2bStats?.saas?.plan === selectedPaymentPlan ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>{b2bStats?.saas?.plan === selectedPaymentPlan ? 'Zaten Aktif Planınız' : `${selectedPaymentPlan} Planı İçin Ödeme Bildirimi Yap`}</span>
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' }}>
                  <strong>SeramikBak B2B SaaS Lisanslama:</strong> Markalar lisans planlarıyla yıllık üye olurlar. Ödeme bildirimi yapıldıktan sonra sistem yetkilileri havalenizi onaylayarak plan özelliklerini aktif hale getirecektir.
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </main>

      {/* RESPONSIVE STYLES */}
      <style jsx>{`
        /* ===== TABLET (max-width: 1024px) ===== */
        @media (max-width: 1024px) {
          .brand-header-container {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px 16px !important;
          }
          .brand-header-brand {
            width: 100% !important;
          }
          .brand-header-actions {
            width: 100% !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          .brand-tabs-nav {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .brand-tabs-nav::-webkit-scrollbar {
            display: none !important;
          }
          .brand-main-content {
            padding: 20px 16px !important;
          }
          .brand-campaign-grid,
          .brand-trends-billing-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ===== MOBILE (max-width: 768px) ===== */
        @media (max-width: 768px) {
          .brand-header-container {
            padding: 10px 12px !important;
          }
          .brand-header-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .brand-tabs-nav {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .brand-tabs-nav button {
            flex: 1 !important;
            justify-content: center !important;
            padding: 8px 6px !important;
          }
          .brand-tabs-nav button span {
            display: none !important;
          }
          .brand-main-content {
            padding: 14px 10px !important;
          }
          .brand-campaign-grid {
            grid-template-columns: 1fr !important;
          }
          .login-card {
            padding: 24px 18px !important;
            border-radius: 16px !important;
          }
          .brand-project-details-split,
          .brand-stats-grid,
          .campaign-inputs-grid,
          .brand-trends-billing-grid,
          .brand-trends-tables-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        /* ===== SMALL MOBILE (max-width: 480px) ===== */
        @media (max-width: 480px) {
          .brand-header-brand h1 {
            font-size: 0.85rem !important;
          }
          .brand-tabs-nav button {
            padding: 8px 4px !important;
          }
          .brand-main-content {
            padding: 10px 8px !important;
          }
          .login-card {
            padding: 20px 14px !important;
          }
        }
      `}</style>

      {/* Bank Transfer Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: '520px',
            padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: '#64748b',
                fontWeight: '700'
              }}
            >
              ×
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Banka Havalesi ile Ödeme Bildirimi
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
              Seçtiğiniz <strong>{selectedPaymentPlan}</strong> paketini aktifleştirmek için lütfen aşağıdaki IBAN adresine havale yapın ve ödeme bildirim formunu doldurun.
            </p>

            {/* Bank details box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div><strong>Banka:</strong> {bankDetails.bank_name || 'Yükleniyor...'}</div>
              <div><strong>Alıcı:</strong> {bankDetails.bank_recipient || 'Yükleniyor...'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><strong>IBAN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{bankDetails.bank_iban || 'Yükleniyor...'}</span></div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bankDetails.bank_iban);
                    alert('IBAN panoya kopyalandı!');
                  }}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Kopyala
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                * Açıklama alanına markanızın adını (<strong>{brandInfo?.name}</strong>) yazmayı unutmayın.
              </div>
            </div>

            {/* Notification Form */}
            <form onSubmit={handleSendPaymentNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {paymentSuccess && (
                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} />
                  <span>{paymentSuccess}</span>
                </div>
              )}

              {paymentError && (
                <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  <span>{paymentError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>Ödeme Yapan Ad Soyad</label>
                <input 
                  type="text" 
                  value={paymentSenderName} 
                  onChange={(e) => setPaymentSenderName(e.target.value)} 
                  placeholder="Hesap Sahibi Adı Soyadı" 
                  required
                  style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>Ödeme Tarihi</label>
                <input 
                  type="date" 
                  value={paymentDate} 
                  onChange={(e) => setPaymentDate(e.target.value)} 
                  required
                  style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>Dekont No / Ek Açıklama</label>
                <input 
                  type="text" 
                  value={paymentNote} 
                  onChange={(e) => setPaymentNote(e.target.value)} 
                  placeholder="Referans No veya Not" 
                  style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={paymentLoading}
                  style={{
                    flex: 1,
                    background: 'var(--accent-gold, #d4af37)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    opacity: paymentLoading ? 0.7 : 1
                  }}
                >
                  {paymentLoading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
