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
  XCircle,
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
  Lock,
  Home
} from 'lucide-react';

export default function UyelikPage() {
  const [authTab, setAuthTab] = useState('login'); // 'login', 'register', or 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: verify email, 2: new password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedUserName, setVerifiedUserName] = useState('');
  const [activeResetToken, setActiveResetToken] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Logged-in User Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'favorites', 'projects', 'settings'
  const [userFavorites, setUserFavorites] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('seramikbak_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setName(user.name);
      setEmail(user.email);
      loadDashboardData(user);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t === 'settings' || t === 'favorites' || t === 'projects' || t === 'overview') {
        setActiveTab(t);
      }

      const resetTokenParam = params.get('resetToken');
      if (resetTokenParam) {
        setAuthTab('forgot');
        setActiveResetToken(resetTokenParam);
        validateTokenOnMount(resetTokenParam);
      }
    }
    setIsCheckingAuth(false);
  }, []);

  const validateTokenOnMount = async (token) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate_token', resetToken: token })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetStep(2);
        if (data.email) setEmail(data.email);
        if (data.userName) setVerifiedUserName(data.userName);
        setSuccess(`✓ E-posta Güvenlik Doğrulaması Başarılı! Sn. ${data.userName} (${data.email}), lütfen yeni şifrenizi belirleyin.`);
      } else {
        setError(data.error || 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.');
        setResetStep(1);
      }
    } catch (err) {
      setError('Bağlantı doğrulama hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (resetStep === 1) {
        // Step 1: Send Password Reset Token Link via Email
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_email', email })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setEmailSentSuccess(true);
          setSuccess(data.message || `✓ Şifre sıfırlama bağlantısı e-posta adresinize (${email}) gönderildi.`);
        } else {
          setError(data.error || 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı. Lütfen e-posta adresinizi doğru yazdığınızdan emin olun.');
        }
      } else {
        // Step 2: Set New Password via Verified Token
        if (newPassword !== confirmPassword) {
          setError('Girilen yeni şifreler birbiriyle eşleşmiyor. Lütfen tekrar kontrol edin.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset_password', resetToken: activeResetToken, newPassword })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(data.message || '✓ Şifreniz başarıyla yenilendi! Hesabınıza giriş yapılıyor...');
          if (data.user) {
            localStorage.setItem('seramikbak_user', JSON.stringify(data.user));
          }
          setTimeout(() => {
            window.location.href = '/';
          }, 1200);
        } else {
          setError(data.error || 'Şifre güncellenirken bir hata oluştu.');
        }
      }
    } catch (err) {
      setError('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id && clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response.credential) {
                handleGoogleAuthSubmit({ credential: response.credential });
              }
            }
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleAuthSubmit = async ({ credential, email: overrideEmail, name: overrideName }) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          email: overrideEmail,
          name: overrideName
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`✓ Google Hesabı (${data.user.email}) ile Giriş Yapıldı! Hoş geldiniz ${data.user.name}.`);
        localStorage.setItem('seramikbak_user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setError(data.error || 'Google hesabı ile giriş başarısız oldu.');
      }
    } catch (err) {
      console.error('Google Auth Handler Error:', err);
      setError('Google girişi sırasında sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    setError('');
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '994830104230-v19gj9ts8ed2ngslcsfm0k8obpuulqb6.apps.googleusercontent.com';
    
    if (typeof window !== 'undefined' && window.google?.accounts) {
      setSuccess('Google Hesabınız doğrulanıyor, lütfen açılan Google penceresinden hesabınızı seçin...');
      
      try {
        if (window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response.credential) {
                handleGoogleAuthSubmit({ credential: response.credential });
              }
            }
          });
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              if (window.google.accounts.oauth2) {
                const tokenClient = window.google.accounts.oauth2.initTokenClient({
                  client_id: clientId,
                  scope: 'email profile',
                  callback: async (tokenResponse) => {
                    if (tokenResponse.access_token) {
                      try {
                        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        });
                        const info = await userinfoRes.json();
                        if (info.email) {
                          handleGoogleAuthSubmit({ email: info.email, name: info.name, picture: info.picture });
                        }
                      } catch (err) {
                        console.error('Failed to fetch userinfo:', err);
                      }
                    }
                  }
                });
                tokenClient.requestAccessToken();
              }
            }
          });
        }
      } catch (e) {
        console.warn('Google Prompt error:', e);
      }
    } else {
      setError('Google Servisleri yükleniyor, lütfen birkaç saniye bekleyip tekrar tıklayın.');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="uyelik-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <style jsx global>{`
          .loading-spinner-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: #0f172a;
            font-family: 'Inter', sans-serif;
          }
        `}</style>
        <div className="loading-spinner-container">
          <Loader2 className="animate-spin" size={32} style={{ color: '#b38e47' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Yükleniyor...</span>
        </div>
      </div>
    );
  }

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

          /* MOBILE RESPONSIVE DASHBOARD STYLES */
          @media (max-width: 768px) {
            .uyelik-page-wrapper {
              padding: 10px 8px !important;
            }
            .dashboard-container {
              border-radius: 16px !important;
              min-height: auto !important;
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06) !important;
            }
            .dashboard-header {
              padding: 14px 16px !important;
              flex-direction: row !important;
              flex-wrap: wrap !important;
              justify-content: space-between !important;
              gap: 10px !important;
            }
            .dashboard-nav {
              padding: 8px 10px !important;
              gap: 6px !important;
              overflow-x: auto !important;
              white-space: nowrap !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
            }
            .dashboard-nav::-webkit-scrollbar {
              display: none !important;
            }
            .dashboard-nav-btn {
              padding: 8px 14px !important;
              font-size: 0.78rem !important;
              flex-shrink: 0 !important;
              border-radius: 8px !important;
            }
            .dashboard-nav-btn.active {
              background: #ffffff !important;
              color: #0f172a !important;
              border: 1px solid #b38e47 !important;
              box-shadow: 0 2px 8px rgba(179, 142, 71, 0.15) !important;
            }
            .dashboard-content {
              padding: 16px 12px !important;
            }
            .dashboard-welcome-banner {
              padding: 18px 14px !important;
              border-radius: 14px !important;
              margin-bottom: 20px !important;
            }
            .dashboard-welcome-banner h2 {
              font-size: 1.2rem !important;
            }
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
              margin-bottom: 20px !important;
            }
            .stat-card {
              padding: 12px 10px !important;
              gap: 10px !important;
              border-radius: 12px !important;
            }
            .stat-icon {
              width: 36px !important;
              height: 36px !important;
            }
            .tools-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            .tool-card {
              padding: 16px 14px !important;
              border-radius: 14px !important;
            }
            .fav-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
            }
            .fav-img-box {
              height: 120px !important;
            }
            .fav-info {
              padding: 10px !important;
            }
            .project-card {
              padding: 14px 12px !important;
              border-radius: 12px !important;
            }
          }

          @media (max-width: 480px) {
            .stats-grid {
              grid-template-columns: 1fr !important;
            }
            .fav-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#b38e47', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem' }}>SB</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>SeramikBak</h3>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Müşteri Cockpit Paneli</span>
              </div>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/"
                style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Home size={13} />
                <span>Anasayfa</span>
              </Link>
              <button 
                onClick={handleLogout}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={13} />
                <span>Çıkış Yap</span>
              </button>
            </div>
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
    <div className="uyelik-light-page-wrapper">
      <style jsx global>{`
        .uyelik-light-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.05) 0%, #f8fafc 90%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          font-family: var(--font-body);
        }

        .uyelik-light-grid {
          max-width: 1180px;
          width: 100%;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 48px;
          align-items: start;
        }

        @media (max-width: 960px) {
          .uyelik-light-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        /* LEFT COLUMN LIGHT STYLING */
        .uyelik-left-content {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .back-to-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 700;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 7px 14px;
          border-radius: 20px;
          cursor: pointer;
          width: fit-content;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        .back-to-home-btn:hover {
          color: #b38e47;
          border-color: rgba(179, 142, 71, 0.4);
          transform: translateX(-2px);
        }

        .uyelik-top-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 20px;
          color: #8c6b30;
          font-size: 0.76rem;
          font-weight: 800;
          width: fit-content;
        }

        .uyelik-main-title {
          font-family: var(--font-title);
          font-size: 2.3rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .uyelik-main-title span {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .uyelik-subtitle-text {
          font-size: 0.95rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        /* CERAMIC MODEL TILES SHOWCASE GRID */
        .ceramic-showcase-box {
          background: #ffffff;
          border-radius: 20px;
          padding: 16px 18px;
          border: 1px solid rgba(179, 142, 71, 0.22);
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .showcase-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 800;
          color: #0f172a;
        }

        .showcase-header-row span {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #8c6b30;
        }

        .ceramic-tiles-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        @media (max-width: 600px) {
          .ceramic-tiles-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .tile-model-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 7px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }

        .tile-model-card:hover {
          background: #ffffff;
          border-color: rgba(179, 142, 71, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(179, 142, 71, 0.12);
        }

        .tile-model-img {
          width: 100%;
          height: 72px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
        }

        .tile-model-badge {
          position: absolute;
          bottom: 4px;
          left: 4px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          color: #ffd700;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tile-model-name {
          font-size: 0.74rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tile-model-spec {
          font-size: 0.66rem;
          color: #64748b;
          font-weight: 500;
        }

        /* SECTION TITLE & FEATURE CARDS (Inspired by Screenshot 2) */
        .features-section-title {
          font-family: var(--font-title);
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 6px 0 0 0;
        }

        .features-light-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-light-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-light-card:hover {
          transform: translateY(-2px);
          border-color: rgba(179, 142, 71, 0.35);
          box-shadow: 0 10px 24px rgba(179, 142, 71, 0.08);
        }

        .icon-box-rose { background: rgba(225, 29, 72, 0.08); color: #e11d48; }
        .icon-box-sky { background: rgba(2, 132, 199, 0.08); color: #0284c7; }
        .icon-box-amber { background: rgba(217, 119, 6, 0.08); color: #d97706; }
        .icon-box-emerald { background: rgba(16, 185, 129, 0.08); color: #059669; }

        .feature-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-card-body {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .feature-card-title {
          font-size: 0.88rem;
          font-weight: 750;
          color: #0f172a;
        }

        .feature-card-desc {
          font-size: 0.78rem;
          color: #475569;
          line-height: 1.4;
        }

        /* RIGHT FLOATING AUTH CARD */
        .uyelik-floating-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07);
          border: 1px solid rgba(212, 175, 55, 0.25);
          position: sticky;
          top: 40px;
        }

        .auth-tab-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .auth-tab-btn {
          background: transparent;
          border: none;
          padding: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .auth-tab-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-group label {
          font-size: 0.76rem;
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

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #b38e47 0%, #987532 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.3);
        }

        .divider-row {
          position: relative;
          text-align: center;
          margin: 16px 0;
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
          padding: 11px;
          border-radius: 10px;
          font-size: 0.86rem;
          font-weight: 700;
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

        .google-icon { width: 18px; height: 18px; }

        .forgot-link {
          display: block;
          text-align: center;
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          margin-top: 14px;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #b38e47;
        }

        .form-feedback {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 600;
          line-height: 1.45;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .form-feedback.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.06);
        }

        .form-feedback.success {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.06);
        }

        @media (max-width: 768px) {
          .uyelik-light-page-wrapper {
            padding: 16px 10px !important;
          }
          .uyelik-light-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .uyelik-floating-card {
            padding: 20px 16px !important;
            border-radius: 18px !important;
            position: static !important;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06) !important;
          }
          .uyelik-main-title {
            font-size: 1.6rem !important;
          }
          .ceramic-tiles-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .submit-btn, .google-btn {
            min-height: 44px !important;
            font-size: 0.86rem !important;
          }
        }
      `}</style>

      <div className="uyelik-light-grid">
        {/* LEFT COLUMN - PROPOSITION & CERAMIC TILES SHOWCASE */}
        <div className="uyelik-left-content">
          <button onClick={() => window.location.href = '/'} className="back-to-home-btn">
            <Home size={14} />
            <span>Anasayfaya Dön</span>
          </button>

          <div className="uyelik-top-pill">
            <Sparkles size={13} />
            <span>10.000+ Mimar & Usta Aramızda</span>
          </div>

          <h1 className="uyelik-main-title">
            İndirimlerden ve Fırsatlardan <span>ilk sen haberdar ol</span>
          </h1>
          <p className="uyelik-subtitle-text">
            SeramikBak'a üye olun, dilediğiniz seramik modellerini takip edin, bölgenizdeki bayilerden en avantajlı teklifleri toplayın.
          </p>

          {/* Small Ceramic Model Visual Cards Showcase (Requested by User) */}
          <div className="ceramic-showcase-box">
            <div className="showcase-header-row">
              <span>
                <Sparkles size={14} /> Popüler Seramik Modelleri & Bayi Fiyatları
              </span>
            </div>
            <div className="ceramic-tiles-row">
              <div className="tile-model-card" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                <div className="tile-model-img" style={{ backgroundImage: 'url("/hero/luxury_bathroom.png")' }}>
                  <span className="tile-model-badge">VitrA</span>
                </div>
                <span className="tile-model-name">Calacatta Gold</span>
                <span className="tile-model-spec">60x120 • Mermer</span>
              </div>

              <div className="tile-model-card" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                <div className="tile-model-img" style={{ backgroundImage: 'url("/hero/modern_living.png")' }}>
                  <span className="tile-model-badge">Kütahya</span>
                </div>
                <span className="tile-model-name">Albatros Antrasit</span>
                <span className="tile-model-spec">80x80 • Lapatto</span>
              </div>

              <div className="tile-model-card" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                <div className="tile-model-img" style={{ backgroundImage: 'url("/hero/scandinavian_kitchen.png")' }}>
                  <span className="tile-model-badge">Bien</span>
                </div>
                <span className="tile-model-name">Natural Oak</span>
                <span className="tile-model-spec">20x120 • Ahşap</span>
              </div>

              <div className="tile-model-card" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                <div className="tile-model-img" style={{ backgroundImage: 'url("/hero/hero_ceramics.jpg")' }}>
                  <span className="tile-model-badge">Ege Seramik</span>
                </div>
                <span className="tile-model-name">Travertino</span>
                <span className="tile-model-spec">60x120 • Mat</span>
              </div>
            </div>
          </div>

          {/* Neler Seni Bekliyor? Section & Feature Cards */}
          <h3 className="features-section-title">Neler Seni Bekliyor?</h3>
          <div className="features-light-list">
            <div className="feature-light-card">
              <div className="feature-card-icon icon-box-rose">
                <Heart size={20} />
              </div>
              <div className="feature-card-body">
                <div className="feature-card-title">Ürünleri Favorilerine Ekle</div>
                <div className="feature-card-desc">İstediğin seramik modelini takip et, sevdiklerinle ve ustalarla kolayca paylaş.</div>
              </div>
            </div>

            <div className="feature-light-card">
              <div className="feature-card-icon icon-box-sky">
                <Bell size={20} />
              </div>
              <div className="feature-card-body">
                <div className="feature-card-title">Fiyat & Kampanya Bildirimleri</div>
                <div className="feature-card-desc">Takip ettiğin seramik modelinde bir bayi indirim yaptığında anında haberin olsun.</div>
              </div>
            </div>

            <div className="feature-light-card">
              <div className="feature-card-icon icon-box-amber">
                <Building2 size={20} />
              </div>
              <div className="feature-card-body">
                <div className="feature-card-title">Toplu B2B Teklif Toplama</div>
                <div className="feature-card-desc">Projenizin metraj ihtiyaçlarını girin, bölgenizdeki tüm yetkili bayilerden fiyat toplayın.</div>
              </div>
            </div>

            <div className="feature-light-card">
              <div className="feature-card-icon icon-box-emerald">
                <Sparkles size={20} />
              </div>
              <div className="feature-card-body">
                <div className="feature-card-title">Yapay Zeka Destekli Görsel Arama</div>
                <div className="feature-card-desc">Seramiğin fotoğrafını yükleyin, yapay zekamız tüm markalar arasından en benzerini bulsun.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - FLOATING AUTH CARD */}
        <div className="uyelik-floating-card">
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

          {/* Feedback Messages */}
          {error && (
            <div className="form-feedback error">
              <XCircle size={18} style={{ flexShrink: 0, color: '#dc2626' }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="form-feedback success">
              <CheckCircle size={18} style={{ flexShrink: 0, color: '#15803d' }} />
              <span>{success}</span>
            </div>
          )}

          {authTab === 'forgot' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                  {resetStep === 1 ? 'Şifrenizi mi Unuttunuz?' : 'Yeni Şifrenizi Belirleyin'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4', margin: 0 }}>
                  {resetStep === 1 
                    ? 'Kayıtlı e-posta adresinizi girin, anında şifre yenileme adımlarına geçelim.' 
                    : `${email} hesabı için yeni şifrenizi oluşturun.`
                  }
                </p>
              </div>

              {resetStep === 1 ? (
                emailSentSuccess ? (
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📬</div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>E-postanızı Kontrol Edin</h4>
                    <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                      <strong>{email}</strong> adresinize tek kullanımlık güvenli şifre sıfırlama bağlantısı gönderilmiştir. Lütfen e-postanızın gelen kutusunu veya spam klasörünü kontrol edin.
                    </p>
                    <button 
                      type="button" 
                      onClick={() => { setEmailSentSuccess(false); setSuccess(''); setError(''); }}
                      style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Tekrar Mail Gönder
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <label>E-posta Adresiniz</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="ornek@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                      />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" size={18} /> : 'Şifre Sıfırlama Bağlantısı Gönder'}
                    </button>
                  </>
                )
              ) : (
                <>
                  <div className="input-group">
                    <label>Yeni Şifreniz</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="Yeni şifrenizi girin (Min. 4 karakter)" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Yeni Şifreniz (Tekrar)</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="Yeni şifrenizi tekrar girin" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input"
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Şifremi Güncelle ve Giriş Yap'}
                  </button>
                </>
              )}

              <button 
                type="button" 
                onClick={() => { setAuthTab('login'); setResetStep(1); setEmailSentSuccess(false); setActiveResetToken(''); setError(''); setSuccess(''); }} 
                className="google-btn"
                style={{ marginTop: '6px' }}
              >
                <ArrowLeft size={16} />
                <span>Giriş Ekranına Dön</span>
              </button>
            </form>
          ) : authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="input-group">
                <label>E-posta Adresiniz</label>
                <input 
                  type="email" 
                  required 
                  placeholder="ornek@email.com" 
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
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Giriş Yap'}
              </button>

              <div className="divider-row">
                <span className="divider-text">veya</span>
              </div>

              <button type="button" onClick={handleGoogleButtonClick} className="google-btn">
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google ile Giriş Yap</span>
              </button>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setAuthTab('forgot'); setError(''); setSuccess(''); }} 
                className="forgot-link"
              >
                Şifremi unuttum
              </a>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="input-group">
                <label>Adınız Soyadınız</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ahmet Yılmaz" 
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
                  placeholder="ornek@email.com" 
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
                  placeholder="Şifreniz (En az 6 karakter)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Hesap Oluştur'}
              </button>

              <div className="divider-row">
                <span className="divider-text">veya</span>
              </div>

              <button type="button" onClick={handleGoogleButtonClick} className="google-btn">
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google ile Hızlı Kayıt Ol</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
