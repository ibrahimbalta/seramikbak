'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Bell, 
  Sparkles, 
  MapPin, 
  Shield, 
  ArrowLeft, 
  Loader2, 
  CheckCircle,
  Building2,
  Phone,
  User,
  LogOut,
  Settings,
  Trash2,
  ExternalLink,
  Layers,
  Activity,
  X,
  Lock
} from 'lucide-react';

export default function UyelikPage() {
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Logged-in User Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'favorites', 'projects', 'settings'
  const [userFavorites, setUserFavorites] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('seramikbak_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setName(user.name);
      setEmail(user.email);
      loadDashboardData(user);

      // Parse query tab parameter
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        if (t === 'settings' || t === 'favorites' || t === 'projects' || t === 'overview') {
          setActiveTab(t);
        }
      }
    }
  }, []);

  const loadDashboardData = async (user) => {
    setLoadingData(true);
    try {
      const favRes = await fetch(`/api/favorites/list?userId=${user.id}`);
      if (favRes.ok) {
        const favData = await favRes.json();
        if (Array.isArray(favData)) {
          setUserFavorites(favData);
        }
      }
      const projRes = await fetch(`/api/projects/list?email=${user.email}`);
      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.success && Array.isArray(projData.projects)) {
          setUserProjects(projData.projects);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seramikbak_user');
    setCurrentUser(null);
    window.location.href = '/uyelik';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Başarıyla giriş yapıldı. Anasayfaya yönlendiriliyorsunuz...');
        localStorage.setItem('seramikbak_user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      } else {
        setError(data.error || 'E-posta veya şifre hatalı.');
      }
    } catch (err) {
      setError('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Kayıt işleminiz başarıyla tamamlandı! Şimdi giriş yapabilirsiniz.');
        setAuthTab('login');
        setName('');
        setPassword('');
      } else {
        setError(data.error || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simulate premium Google OAuth login
    setError('');
    setSuccess('Google Hesabı ile giriş simüle edildi. Hoş geldiniz!');
    const mockUser = {
      id: 'google-oauth-id',
      name: 'Google Ziyaretçisi',
      email: email || 'google@seramikbak.com'
    };
    localStorage.setItem('seramikbak_user', JSON.stringify(mockUser));
    setTimeout(() => {
      window.location.href = '/';
    }, 1200);
  };

  if (currentUser) {
    return (
      <div className="uyelik-page-wrapper" style={{ padding: '24px 20px' }}>
        <style jsx global>{`
          .dashboard-container {
            max-width: 1200px;
            width: 100%;
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
            border: 1px solid rgba(226, 232, 240, 0.8);
            overflow: hidden;
            min-height: 80vh;
            display: flex;
            flex-direction: column;
          }
          .dashboard-header {
            padding: 24px 32px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #0f172a;
            color: #ffffff;
          }
          .dashboard-nav {
            display: flex;
            gap: 8px;
            padding: 16px 32px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            overflow-x: auto;
          }
          .dashboard-nav-btn {
            background: transparent;
            border: none;
            padding: 8px 16px;
            font-size: 0.82rem;
            font-weight: 600;
            color: #64748b;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            white-space: nowrap;
          }
          .dashboard-nav-btn.active {
            background: #ffffff;
            color: #0f172a;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          .dashboard-content {
            flex: 1;
            padding: 32px;
            background: #ffffff;
          }
          .dashboard-welcome-banner {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            padding: 32px;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            margin-bottom: 32px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .stat-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
          }
          .tool-card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 16px;
            transition: all 0.2s;
          }
          .tool-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          }
          .fav-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
          }
          .fav-card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.2s;
            background: #fff;
          }
          .fav-card:hover {
            box-shadow: 0 10px 20px rgba(0,0,0,0.04);
            transform: translateY(-2px);
          }
          .fav-img-box {
            width: 100%;
            height: 160px;
            background-size: cover;
            background-position: center;
            position: relative;
          }
          .fav-info {
            padding: 16px;
          }
          .project-card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
            background: #fff;
          }
          .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
            width: 100%;
          }
          .input-group label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #475569;
          }
          .auth-input {
            width: 100%;
            padding: 10px 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.82rem;
            color: #0f172a;
            outline: none;
            transition: all 0.2s;
          }
          .auth-input:focus {
            border-color: #b38e47;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.12);
          }
          .submit-btn {
            background: #0f172a;
            color: #ffffff;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .submit-btn:hover {
            background: #b38e47;
          }
          .form-feedback {
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .form-feedback.error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          .form-feedback.success {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
          }
        `}</style>

        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#b38e47', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem' }}>SB</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>SeramikBak</h3>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Müşteri Cockpit Paneli</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={13} />
              <span>Çıkış Yap</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="dashboard-nav">
            <button className={`dashboard-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <Activity size={14} />
              <span>Genel Bakış</span>
            </button>
            <button className={`dashboard-nav-btn ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
              <Heart size={14} />
              <span>Favori Ürünlerim ({userFavorites.length})</span>
            </button>
            <button className={`dashboard-nav-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              <Building2 size={14} />
              <span>Proje Taleplerim ({userProjects.length})</span>
            </button>
            <button className={`dashboard-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={14} />
              <span>Hesap Ayarları</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="dashboard-content">
            {loadingData ? (
              <div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>
                <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                <span>Bilgileriniz yükleniyor, lütfen bekleyin...</span>
              </div>
            ) : activeTab === 'overview' ? (
              /* ===== OVERVIEW TAB ===== */
              <div>
                <div className="dashboard-welcome-banner">
                  <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 8px 0' }}>Merhaba, {currentUser.name}!</h2>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, maxWidth: '600px' }}>
                    SeramikBak Müşteri Panelindesiniz. Beğendiğiniz ürünleri takip edebilir, toplu fiyat tekliflerinizi yönetebilir ve 3D stüdyomuzu dilediğiniz gibi kullanabilirsiniz.
                  </p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(212,175,55,0.1)', color: '#b38e47' }}>
                      <Heart size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Favori Ürünler</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>{userFavorites.length} Ürün</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(2,132,199,0.1)', color: '#0284c7' }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Toplu Talepler</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>{userProjects.length} Proje</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Fiyat Alarmları</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Aktif</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Hızlı Araçlar</h3>
                <div className="tools-grid">
                  <div className="tool-card">
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🎨 3D Sanal Stüdyo
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Beğendiğiniz seramik modellerini 3D banyo, mutfak veya salon sahnelerinde canlı olarak uygulayın.</p>
                    </div>
                    <button onClick={() => window.location.href = '/'} style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Layers size={13} />
                      <span>3D Stüdyoya Git</span>
                    </button>
                  </div>

                  <div className="tool-card">
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📸 Yapay Zeka ile Görsel Arama
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Elinizdeki bir seramik karosunun fotoğrafını yükleyin, yapay zekamız tüm markalardan eşleştirsin.</p>
                    </div>
                    <button onClick={() => window.location.href = '/'} style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Sparkles size={13} />
                      <span>Fotoğraftan Arama Yap</span>
                    </button>
                  </div>

                  <div className="tool-card">
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏢 Toplu B2B Teklif Toplama
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>İnşaat projenizin metraj ve seramik ebatlarını girerek bölgedeki tüm bayilerden toplu fiyat teklifi toplayın.</p>
                    </div>
                    <button onClick={() => window.location.href = '/proje-talep'} style={{ background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Building2 size={13} />
                      <span>Yeni Proje Talebi Başlat</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'favorites' ? (
              /* ===== FAVORITES TAB ===== */
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Kaydettiğiniz Favori Seramikler</h3>
                {userFavorites.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', border: '1.5px dashed #e2e8f0', borderRadius: '16px' }}>
                    <Heart size={32} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 4px 0' }}>Henüz favori ürününüz yok.</p>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Arama motorumuzda ürünlerin altındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</span>
                  </div>
                ) : (
                  <div className="fav-grid">
                    {userFavorites.map(fav => (
                      <div key={fav.id} className="fav-card">
                        <div className="fav-img-box" style={{ backgroundImage: `url(${fav.product?.imageUrl || '/ceramic_placeholder.png'})` }}>
                          <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#0f172a', color: '#d4af37', padding: '4px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                            {fav.product?.brand?.name}
                          </span>
                        </div>
                        <div className="fav-info">
                          <h4 style={{ fontSize: '0.82rem', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>{fav.product?.name}</h4>
                          <small style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', marginBottom: '12px' }}>
                            Ebat: {fav.product?.width}x{fav.product?.height} cm | Tarz: {fav.product?.style || 'Karo'}
                          </small>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => { localStorage.setItem('seramikbak_preselected_product', JSON.stringify(fav.product)); window.location.href = '/'; }}
                              style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                              <Layers size={11} />
                              <span>Stüdyoda Gör</span>
                            </button>
                            <button 
                              onClick={async () => {
                                await fetch('/api/favorites/toggle', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: currentUser.id, productId: fav.productId })
                                });
                                loadDashboardData(currentUser);
                              }}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}
                              title="Favorilerden Çıkar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'projects' ? (
              /* ===== B2B PROJECTS TAB ===== */
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>B2B Toplu Seramik Fiyat Teklifi Talepleriniz</h3>
                {userProjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', border: '1.5px dashed #e2e8f0', borderRadius: '16px' }}>
                    <Building2 size={32} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 4px 0' }}>Henüz toplu teklif talebiniz yok.</p>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Proje talebi formumuzu doldurarak bayilerden özel fiyatlar alabilirsiniz.</span>
                    <button 
                      onClick={() => window.location.href = '/proje-talep'}
                      style={{ display: 'block', margin: '16px auto 0 auto', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Talebi Başlat
                    </button>
                  </div>
                ) : (
                  <div>
                    {userProjects.map(proj => (
                      <div key={proj.id} className="project-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 2px 0', color: '#0f172a' }}>{proj.projectName}</h4>
                            <small style={{ color: '#64748b' }}>Proje Tipi: {proj.projectType} | Konum: {proj.city}, {proj.district}</small>
                          </div>
                          <span className="status-badge" style={{
                            background: proj.status === 'APPROVED' ? '#d1fae5' : proj.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                            color: proj.status === 'APPROVED' ? '#065f46' : proj.status === 'PENDING' ? '#92400e' : '#991b1b'
                          }}>
                            {proj.status === 'PENDING' ? 'Onay Bekliyor' : proj.status === 'APPROVED' ? 'Onaylandı / Bayilere Açık' : proj.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.8rem' }}>
                          <div><strong>Talep Metrajı:</strong> {proj.quantityM2.toLocaleString('tr-TR')} m²</div>
                          <div><strong>Bütçe Aralığı:</strong> {proj.budgetM2}</div>
                          <div><strong>Teslimat Zamanı:</strong> {proj.deliveryTimeline}</div>
                          <div><strong>İnşaat Aşaması:</strong> {proj.constructionStep}</div>
                        </div>
                        {proj.notes && (
                          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.78rem', color: '#475569' }}>
                            <strong>Müşteri Notu:</strong> {proj.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ===== SETTINGS TAB ===== */
              <div style={{ maxWidth: '450px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Hesap Bilgilerinizi Güncelleyin</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setError('');
                  setSuccess('');
                  setLoading(true);
                  try {
                    const res = await fetch('/api/admin/settings', { // simulated profile edit
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: currentUser.id, name, email, password })
                    });
                    if (res.ok) {
                      setSuccess('Hesap bilgileriniz başarıyla güncellendi.');
                      const updatedUser = { ...currentUser, name, email };
                      localStorage.setItem('seramikbak_user', JSON.stringify(updatedUser));
                      setCurrentUser(updatedUser);
                    } else {
                      setError('Güncelleme başarısız oldu.');
                    }
                  } catch (err) {
                    setError('Bağlantı hatası.');
                  } finally {
                    setLoading(false);
                  }
                }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {error && <div className="form-feedback error">{error}</div>}
                  {success && <div className="form-feedback success">{success}</div>}
                  <div className="input-group">
                    <label>Adınız Soyadınız</label>
                    <input type="text" className="auth-input" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>E-posta Adresiniz</label>
                    <input type="email" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Şifre Güncelleme (Boş bırakırsanız değişmez)</label>
                    <input type="password" className="auth-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    <span>Ayarları Kaydet</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uyelik-page-wrapper">
      <style jsx global>{`
        .uyelik-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 40px 20px;
        }

        .uyelik-container {
          max-width: 1080px;
          width: 100%;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
        }

        @media (max-width: 900px) {
          .uyelik-container {
            grid-template-columns: 1fr;
          }
          .uyelik-info-side {
            padding: 40px 30px !important;
          }
        }

        /* LEFT INFO SIDE */
        .uyelik-info-side {
          padding: 60px 50px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 30px;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .back-btn:hover {
          color: #ffffff;
        }

        .brand-badge {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          display: inline-block;
          width: fit-content;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }

        .info-title {
          font-size: 2.1rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.25;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }

        .info-title span {
          background: linear-gradient(135deg, #d4af37 0%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .info-subtitle {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 40px 0;
        }

        /* FEATURE ITEMS */
        .info-features-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-feature-item {
          display: flex;
          gap: 16px;
        }

        .feature-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-icon-box.purple {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
        }
        
        .feature-icon-box.blue {
          background: rgba(2, 132, 199, 0.15);
          color: #38bdf8;
        }

        .feature-icon-box.amber {
          background: rgba(217, 119, 6, 0.15);
          color: #fbbf24;
        }

        .feature-icon-box.green {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .feature-icon-box.rose {
          background: rgba(225, 29, 72, 0.15);
          color: #fda4af;
        }

        .feature-texts {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .feature-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
        }

        .feature-desc {
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        /* RIGHT FORM SIDE */
        .uyelik-form-side {
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 600px) {
          .uyelik-info-side, .uyelik-form-side {
            padding: 30px 20px !important;
          }
        }

        .auth-card-panel {
          width: 100%;
        }

        /* Tab Switcher */
        .auth-tab-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          margin-bottom: 30px;
        }

        .auth-tab-btn {
          background: transparent;
          border: none;
          padding: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .auth-tab-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        /* Form Inputs */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
        }

        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }

        .auth-input:focus {
          border-color: #b38e47;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .form-feedback {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .form-feedback.error {
          background: #fee2e2;
          color: #ef4444;
          border: 1px solid #fecaca;
        }

        .form-feedback.success {
          background: #ecfdf5;
          color: #10b981;
          border: 1px solid #a7f3d0;
        }

        .submit-btn {
          width: 100%;
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
        }

        .submit-btn:hover:not(:disabled) {
          background: #b38e47;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider-row {
          position: relative;
          text-align: center;
          margin: 20px 0;
        }

        .divider-row::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
          z-index: 1;
        }

        .divider-text {
          position: relative;
          z-index: 2;
          background: #ffffff;
          padding: 0 12px;
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
        }

        .google-btn {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .google-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .google-icon {
          width: 18px;
          height: 18px;
        }

        .forgot-link {
          display: block;
          text-align: center;
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          margin-top: 16px;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #b38e47;
        }
      `}</style>

      <div className="uyelik-container">
        
        {/* LEFT COLUMN - PROPOSITION */}
        <div className="uyelik-info-side">
          {/* Subtle gold decoration spheres */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <button onClick={() => window.location.href = '/'} className="back-btn">
              <ArrowLeft size={16} />
              <span>Anasayfaya Dön</span>
            </button>

            {/* Premium Ceramic Tile Banner - Larger size */}
            <div style={{
              width: '100%',
              height: '180px',
              borderRadius: '16px',
              backgroundImage: 'url("/ceramic_tile_premium.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1.5px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
              marginBottom: '28px'
            }} />

            <h1 className="info-title">
              Fırsatlardan ilk <span>sen haberdar ol</span>
            </h1>
            <p className="info-subtitle">
              SeramikBak'a üye olun, dilediğiniz seramik modellerini takip edin, bayilerden en avantajlı teklifleri toplayın.
            </p>
          </div>

          <div className="info-features-list" style={{ position: 'relative', zIndex: 10 }}>
            <div className="info-feature-item">
              <div className="feature-icon-box purple">
                <Heart size={20} />
              </div>
              <div className="feature-texts">
                <h4 className="feature-title">Ürünleri Favorilerine Ekle</h4>
                <p className="feature-desc">Beğendiğin karoları favori listelerine ekle, mimarlarla ve seramik ustalarıyla kolayca paylaş.</p>
              </div>
            </div>

            <div className="info-feature-item">
              <div className="feature-icon-box blue">
                <Bell size={20} />
              </div>
              <div className="feature-texts">
                <h4 className="feature-title">Fiyat & Kampanya Bildirimleri</h4>
                <p className="feature-desc">Takip ettiğin seramik modelinde bir bayi indirim yaptığında veya kampanya başladığında anında haberin olsun.</p>
              </div>
            </div>

            <div className="info-feature-item">
              <div className="feature-icon-box amber">
                <Building2 size={20} />
              </div>
              <div className="feature-texts">
                <h4 className="feature-title">Toplu B2B Teklif Toplama</h4>
                <p className="feature-desc">Projenizin metraj ve ebat ihtiyaçlarını girin, bölgenizdeki tüm yetkili bayilere teklif talebi gönderin.</p>
              </div>
            </div>

            <div className="info-feature-item">
              <div className="feature-icon-box green">
                <Sparkles size={20} />
              </div>
              <div className="feature-texts">
                <h4 className="feature-title">Yapay Zeka Destekli Görsel Arama</h4>
                <p className="feature-desc">Seramiğin fotoğrafını yükleyin, yapay zekamız tüm markalar arasından birebir aynısını veya en yakın benzerini bulsun.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - AUTH CARD */}
        <div className="uyelik-form-side">
          <div className="auth-card-panel">
            
            {/* Tab Switcher */}
            <div className="auth-tab-row">
              <button 
                onClick={() => { setAuthTab('login'); setError(''); setSuccess(''); }} 
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
              >
                Giriş Yap
              </button>
              <button 
                onClick={() => { setAuthTab('register'); setError(''); setSuccess(''); }} 
                className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
              >
                Hesap Oluştur
              </button>
            </div>

            {/* Error / Success Feedback */}
            {error && (
              <div className="form-feedback error" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="form-feedback success" style={{ marginBottom: '20px' }}>
                {success}
              </div>
            )}

            {/* LOGIN FORM */}
            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="input-group">
                  <label>E-posta Adresiniz</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="ornek@seramikbak.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <label>Şifreniz</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Giriş Yap</span>
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="input-group">
                  <label>Adınız Soyadınız / Firma Ünvanı</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ahmet Yılmaz veya Yılmaz Mimarlık" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <label>E-posta Adresiniz</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="ornek@seramikbak.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <label>Şifreniz</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Min. 6 Karakter" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Hesap Oluştur</span>
                </button>
              </form>
            )}

            {/* Simulated OAuth section */}
            <div className="divider-row">
              <span className="divider-text">veya</span>
            </div>

            <button onClick={handleGoogleLogin} className="google-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.7 14.97 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.84 2.98C6.01 7.22 8.78 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.45 12.3c0-.82-.07-1.6-.2-2.3H12v4.4h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.63 2.82c2.12-1.95 3.35-4.83 3.35-8.4z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.08 14.7c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.24 7.12C.45 8.7.01 10.3.01 12s.44 3.3 1.23 4.88l3.84-3.18z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.63-2.82c-1.2.8-2.73 1.28-4.33 1.28-3.22 0-5.99-2.18-6.96-5.16L1.2 16.58C3.16 20.47 7.2 23 12 23z"
                />
              </svg>
              <span>Google ile Giriş Yap</span>
            </button>

            <a href="#" onClick={(e) => { e.preventDefault(); setError('Şifre sıfırlama bağlantısı simüle edildi.'); }} className="forgot-link">
              Şifremi unuttum
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
