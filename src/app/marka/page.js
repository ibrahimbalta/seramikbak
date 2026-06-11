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

  // Stripe Webhook Sandbox Simulation
  const [stripePlan, setStripePlan] = useState('PRO');
  const [stripeWebhookResult, setStripeWebhookResult] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  const [activePortalTab, setActivePortalTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

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
    }
  }, [isLoggedIn, brandInfo]);

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
      const res = await fetch('/api/search');
      if (res.ok) {
        const data = await res.json();
        // Filter products belonging to this brand
        const filtered = data.filter(p => p.brandId === brandId);
        setBrandProducts(filtered);
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

  const triggerStripeMockWebhook = async () => {
    if (!brandInfo) return;
    setStripeLoading(true);
    setStripeWebhookResult('');
    
    try {
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              client_reference_id: brandInfo.id,
              metadata: { plan: stripePlan }
            }
          }
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStripeWebhookResult(`Stripe Webhook Başarılı! Plan ${stripePlan} olarak güncellendi.`);
        // Reload stats to show upgraded tier
        fetchB2bStats(brandInfo.id);
        loadBrandProjects(brandInfo.id);
      } else {
        setStripeWebhookResult('Webhook hatası: ' + (result.error || 'Bilinmeyen Hata'));
      }
    } catch (err) {
      setStripeWebhookResult('Bağlantı hatası.');
      console.error(err);
    } finally {
      setStripeLoading(false);
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
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {b2bStats?.saas?.expiresAt && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                <span>Paket Bitiş: {new Date(b2bStats.saas.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}

            {/* Tab Navigation Buttons */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f3f5', borderRadius: '8px', padding: '3px', marginRight: '4px' }}>
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
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
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
            
            {/* METRICS SUMMARY */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0' }}>SaaS Abonelik Planı</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37' }}>{b2bStats.saas?.plan || 'BASIC'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>({b2bStats.saas?.status || 'ACTIVE'})</span>
                </div>
              </div>

              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0' }}>Toplam Görüntülenme</h4>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{b2bStats.summary?.totalViews}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Katalog & Detay Sayfası</span>
              </div>

              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0' }}>Tıklanma Oranı (CTR)</h4>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>%{b2bStats.summary?.ctr}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Tıklama / Gösterim Dağılımı</span>
              </div>

              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px 0' }}>Yönlendirilen Bayi Teklifi</h4>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>{b2bStats.summary?.totalLeads}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>Bayilere İletilen Müşteri Formları</span>
              </div>
            </div>

            {/* CAMPAIGNS & RECENT LEADS SPLIT */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px'
            }}>
              {/* Premium Campaigns Management */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px'
            }}>
              {/* Market intelligence trends */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0' }}>B2B Pazar Trendleri (Tüketici Raporları)</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Kullanıcıların arama ve yoğunluk verilerine göre en popüler karolar ve lokasyonlar (PRO/Enterprise Özelliği).</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

              {/* Stripe Webhook simulator sandbox */}
              <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0' }}>SaaS Plan Yönetimi & Stripe Test Alanı</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Markanızın platform katmanını test etmek amacıyla Stripe Webhook olaylarını simüle edin.</p>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Abonelik Katmanı:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => setStripePlan('PRO')} 
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: stripePlan === 'PRO' ? '#0f172a' : '#fff',
                          color: stripePlan === 'PRO' ? '#fff' : '#0f172a',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        PRO
                      </button>
                      <button 
                        onClick={() => setStripePlan('ENTERPRISE')} 
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: stripePlan === 'ENTERPRISE' ? '#0f172a' : '#fff',
                          color: stripePlan === 'ENTERPRISE' ? '#fff' : '#0f172a',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ENTERPRISE
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={triggerStripeMockWebhook} 
                    disabled={stripeLoading}
                    style={{
                      background: '#fff',
                      color: '#d4af37',
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      padding: '12px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {stripeLoading ? 'Webhook Gönderiliyor...' : `Stripe Webhook Simüle Et (${stripePlan})`}
                  </button>

                  {stripeWebhookResult && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#e6f7ed',
                      color: '#10b981',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.75rem'
                    }}>
                      <CheckCircle size={14} />
                      <span>{stripeWebhookResult}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' }}>
                  <strong>SeramikBak B2B SaaS modeli</strong> üzerinden markalar aylık abonelik ücretiyle üye olurlar. Webhook simülasyonu, canlı Stripe altyapısında ödeme yapıldığında abonelik durumunun nasıl otomatik güncellendiğini gösterir.
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}
