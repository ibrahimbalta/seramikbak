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
  Phone
} from 'lucide-react';

export default function UyelikPage() {
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('seramikbak_user');
    if (savedUser) {
      window.location.href = '/';
    }
  }, []);

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
          background: #f8fafc;
          border-right: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
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
          color: #0f172a;
        }

        .brand-badge {
          background: rgba(179, 142, 71, 0.1);
          color: #b38e47;
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
          color: #0f172a;
          line-height: 1.25;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }

        .info-title span {
          background: linear-gradient(135deg, #b38e47 0%, #0f172a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .info-subtitle {
          font-size: 0.95rem;
          color: #475569;
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
          background: rgba(179, 142, 71, 0.1);
          color: #b38e47;
        }
        
        .feature-icon-box.blue {
          background: #e0f2fe;
          color: #0284c7;
        }

        .feature-icon-box.amber {
          background: #fef3c7;
          color: #d97706;
        }

        .feature-icon-box.green {
          background: #d1fae5;
          color: #059669;
        }

        .feature-icon-box.rose {
          background: #ffe4e6;
          color: #e11d48;
        }

        .feature-texts {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .feature-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
        }

        .feature-desc {
          font-size: 0.8rem;
          color: #64748b;
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
          <div>
            <button onClick={() => window.location.href = '/'} className="back-btn">
              <ArrowLeft size={16} />
              <span>Anasayfaya Dön</span>
            </button>

            {/* Premium Ceramic Tile Banner */}
            <div style={{
              width: '100%',
              height: '110px',
              borderRadius: '16px',
              backgroundImage: 'url("/ceramic_tile_premium.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1.5px solid rgba(179, 142, 71, 0.25)',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              marginBottom: '24px'
            }} />

            <h1 className="info-title">
              Fırsatlardan ilk <span>sen haberdar ol</span>
            </h1>
            <p className="info-subtitle">
              SeramikBak'a üye olun, dilediğiniz seramik modellerini takip edin, bayilerden en avantajlı teklifleri toplayın.
            </p>
          </div>

          <div className="info-features-list">
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
