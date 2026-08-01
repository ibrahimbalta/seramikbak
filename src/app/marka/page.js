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
  Building2,
  Menu,
  X,
  Search,
  Filter,
  Users,
  Megaphone,
  Briefcase,
  Layers,
  ChevronRight,
  Eye,
  MousePointerClick,
  Handshake,
  DollarSign,
  Package
} from 'lucide-react';
import Link from 'next/link';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli",
  "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop",
  "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

export default function BrandPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Brand Session Info
  const [brandInfo, setBrandInfo] = useState(null);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileTabChange = (tabId) => {
    setActivePortalTab(tabId);
    setShowMobileMoreMenu(false);
  };

  // Dashboard Metrics & Campaign States
  const [b2bStats, setB2bStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [brandProducts, setBrandProducts] = useState([]);
  
  // Trends Analytics states
  const [trendsData, setTrendsData] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [selectedTrendCity, setSelectedTrendCity] = useState('Tüm Türkiye');
  
  // Chart toggle metric: 'views', 'clicks', 'leads'
  const [chartMetric, setChartMetric] = useState('views');

  // Catalog search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('ALL');
  const [selectedFinish, setSelectedFinish] = useState('ALL');

  // Dealer Management states
  const [dealers, setDealers] = useState([]);
  const [dealersLoading, setDealersLoading] = useState(false);
  const [showAddDealerModal, setShowAddDealerModal] = useState(false);
  const [newDealerData, setNewDealerData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    lat: '40.9901',
    lng: '29.0278'
  });
  const [addDealerError, setAddDealerError] = useState('');
  const [addDealerLoading, setAddDealerLoading] = useState(false);

  // B2B Project Bidding states
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [biddingProject, setBiddingProject] = useState(null); // project selected for bidding
  const [bidPrice, setBidPrice] = useState('');
  const [bidProduct, setBidProduct] = useState('');
  const [bidTimeline, setBidTimeline] = useState('30 gün içinde');
  const [bidNote, setBidNote] = useState('');
  const [bids, setBids] = useState([]); // local localStorage-backed bids

  // Ad Campaign Creator Form
  const [campaignProduct, setCampaignProduct] = useState('');
  const [campaignDuration, setCampaignDuration] = useState('30'); // default 30 days
  const [campaignPaymentRef, setCampaignPaymentRef] = useState('');
  const [showCampaignPaymentModal, setShowCampaignPaymentModal] = useState(false);
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

  const hasPending = b2bStats?.saas?.status === 'PENDING_APPROVAL' || b2bStats?.saas?.pendingStatus === 'PENDING_APPROVAL';
  const requestedPlan = b2bStats?.saas?.status === 'PENDING_APPROVAL' ? b2bStats.saas.plan : (b2bStats?.saas?.pendingStatus === 'PENDING_APPROVAL' ? b2bStats.saas.pendingPlan : null);
  const isRejected = b2bStats?.saas?.status === 'REJECTED' || b2bStats?.saas?.pendingStatus === 'REJECTED';

  // Restore session & bids from localStorage on mount
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

    const savedBids = localStorage.getItem('sb_brand_bids');
    if (savedBids) {
      try {
        setBids(JSON.parse(savedBids));
      } catch (err) {
        console.error('Bids restore failed:', err);
      }
    }
  }, []);

  // Fetch stats, products, and dealers once logged in
  useEffect(() => {
    if (isLoggedIn && brandInfo) {
      fetchB2bStats(brandInfo.id);
      fetchBrandProducts(brandInfo.id);
      loadBrandProjects(brandInfo.id);
      loadBankDetails();
      fetchDealers();
      fetchB2bTrends(brandInfo.id);
    }
  }, [isLoggedIn, brandInfo]);

  const loadBankDetails = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setBankDetails({
          bank_name: data.bank_name || 'Akbank',
          bank_recipient: data.bank_recipient || 'KolayWebci SeramikBak Ltd. Şti.',
          bank_iban: data.bank_iban || 'TR87 0004 6000 1234 5678 9012 34'
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

  const fetchB2bTrends = async (brandId) => {
    setTrendsLoading(true);
    try {
      const res = await fetch(`/api/b2b/trends?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setTrendsData(data);
      }
    } catch (err) {
      console.error('Failed to load brand trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  };

  const fetchBrandProducts = async (brandId) => {
    try {
      const res = await fetch(`/api/search?brandId=${brandId}&limit=all&fullDetail=true`);
      if (res.ok) {
        const data = await res.json();
        setBrandProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch brand products:', err);
    }
  };

  const fetchDealers = async () => {
    if (!brandInfo) return;
    setDealersLoading(true);
    try {
      const res = await fetch('/api/admin/dealers');
      if (res.ok) {
        const allDealers = await res.json();
        // Filter dealers belonging to this brand
        const brandDealers = allDealers.filter(d => d.brandId === brandInfo.id);
        setDealers(brandDealers);
      }
    } catch (err) {
      console.error('Failed to fetch dealers:', err);
    } finally {
      setDealersLoading(false);
    }
  };

  const handleUpdateDealerStatus = async (dealerId, newStatus) => {
    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealerId, status: newStatus })
      });
      if (res.ok) {
        // Refresh dealer network
        fetchDealers();
      } else {
        const errData = await res.json();
        alert('Bayi durumu güncellenemedi: ' + (errData.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      console.error('Failed to update dealer status:', err);
    }
  };

  const handleAddDealer = async (e) => {
    e.preventDefault();
    setAddDealerError('');
    setAddDealerLoading(true);

    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDealerData,
          brandId: brandInfo.id
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowAddDealerModal(false);
        setNewDealerData({
          name: '',
          phone: '',
          address: '',
          city: '',
          district: '',
          lat: '40.9901',
          lng: '29.0278'
        });
        fetchDealers();
      } else {
        setAddDealerError(data.error || 'Bayi eklenemedi.');
      }
    } catch (err) {
      setAddDealerError('Bağlantı hatası.');
      console.error(err);
    } finally {
      setAddDealerLoading(false);
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
    setDealers([]);
    setUsername('');
    setPassword('');
    setActivePortalTab('dashboard');
  };

  const handleCampaignSubmit = (e) => {
    e.preventDefault();
    if (!brandInfo || !campaignProduct) return;
    setCampaignSuccessMsg('');
    setCampaignErrorMsg('');
    setShowCampaignPaymentModal(true);
  };

  const handleCampaignPaymentConfirm = async (e) => {
    e.preventDefault();
    if (!brandInfo || !campaignProduct || !campaignPaymentRef.trim()) return;
    setIsStartingCampaign(true);
    setCampaignSuccessMsg('');
    setCampaignErrorMsg('');

    // Determine price based on duration
    let price = 1500;
    if (campaignDuration === '7') price = 500;
    if (campaignDuration === '30') price = 1500;
    if (campaignDuration === '90') price = 4000;
    if (campaignDuration === '180') price = 7500;

    try {
      const res = await fetch('/api/b2b/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandInfo.id,
          productId: campaignProduct,
          durationDays: parseInt(campaignDuration, 10),
          paymentRef: campaignPaymentRef,
          price
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCampaignSuccessMsg('Reklam talebiniz alındı! Ödemeniz doğrulandıktan sonra admin tarafından onaylanıp yayına alınacaktır.');
        setShowCampaignPaymentModal(false);
        setCampaignProduct('');
        setCampaignPaymentRef('');
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

  const handleB2bBidSubmit = (e) => {
    e.preventDefault();
    if (!biddingProject || !bidProduct || !bidPrice) return;

    const selectedProduct = brandProducts.find(p => p.id === bidProduct);
    const newBid = {
      id: 'bid-' + Date.now(),
      projectId: biddingProject.id,
      projectName: biddingProject.projectName,
      companyName: biddingProject.companyName || biddingProject.projectName,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      priceM2: parseFloat(bidPrice),
      totalPrice: parseFloat(bidPrice) * biddingProject.quantityM2,
      timeline: bidTimeline,
      note: bidNote,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString()
    };

    const updatedBids = [...bids, newBid];
    setBids(updatedBids);
    localStorage.setItem('sb_brand_bids', JSON.stringify(updatedBids));

    // Clear form and modal
    setBiddingProject(null);
    setBidPrice('');
    setBidProduct('');
    setBidTimeline('30 gün içinde');
    setBidNote('');

    alert('Toptan seramik fiyat teklifiniz başarıyla simüle edildi ve proje sahiplerine iletildi!');
  };

  // Dynamic SVG Chart Coordinates Generator
  const generateChartPaths = () => {
    if (!b2bStats || !b2bStats.timeline || b2bStats.timeline.length === 0) {
      return { linePath: '', areaPath: '', maxVal: 10, points: [] };
    }

    const timeline = b2bStats.timeline;
    // Map values based on selected metric
    const values = timeline.map(day => {
      if (chartMetric === 'clicks') return day.clicks || 0;
      if (chartMetric === 'leads') return day.leads || 0;
      return day.views || 0;
    });

    const maxVal = Math.max(...values, 5); // Avoid division by zero, min height factor is 5
    const width = 500;
    const height = 200;
    const paddingLeft = 10;
    const paddingRight = 10;
    const paddingTop = 30;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = timeline.map((day, i) => {
      const x = paddingLeft + (i / (timeline.length - 1)) * chartWidth;
      const val = chartMetric === 'clicks' ? (day.clicks || 0) : (chartMetric === 'leads' ? (day.leads || 0) : (day.views || 0));
      const y = height - paddingBottom - (val / maxVal) * chartHeight;
      return { x, y, val, label: day.date };
    });

    // Build SVG Path
    let linePath = '';
    let areaPath = '';

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
      }

      areaPath = `M ${points[0].x} ${height - paddingBottom}`;
      for (let i = 0; i < points.length; i++) {
        areaPath += ` L ${points[i].x} ${points[i].y}`;
      }
      areaPath += ` L ${points[points.length - 1].x} ${height - paddingBottom} Z`;
    }

    return { linePath, areaPath, maxVal, points };
  };

  // Get Metallic membership badge style based on SaaS plan
  const getPlanBadgeStyle = (plan) => {
    if (plan === 'ENTERPRISE') {
      return {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: '#f8fafc',
        border: '1px solid #64748b',
        boxShadow: '0 0 10px rgba(148, 163, 184, 0.25)',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      };
    }
    if (plan === 'PRO') {
      return {
        background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #fef08a 100%)',
        color: '#1e293b',
        border: '1px solid #ca8a04',
        boxShadow: '0 0 12px rgba(212, 175, 55, 0.45)',
        fontWeight: '800'
      };
    }
    // BASIC or default
    return {
      background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
      color: '#f8fafc',
      border: '1px solid #cbd5e1'
    };
  };

  // 1. LOGIN LAYOUT (Premium Dark theme with gold highlight)
  if (!isLoggedIn) {
    return (
      <>
        <main className="login-layout" style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1f2937 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '12px' : '24px',
          fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)'
        }}>
          <div className="login-card glass-panel" style={{
            background: 'rgba(17, 24, 39, 0.75)',
            backdropFilter: 'var(--glass-backdrop, blur(16px))',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: 'var(--border-radius-lg, 24px)',
            padding: isMobile ? '24px 18px' : '44px 36px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.05)'
          }}>
          <div className="login-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'color 0.2s'
            }} className="hover-gold-text">
              <ArrowLeft size={14} /> Ana Sayfaya Dön
            </Link>
            <div className="logo-icon" style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #111 0%, #1e293b 100%)',
              color: '#d4af37',
              border: '1px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.6rem',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 20px rgba(212,175,55,0.3)'
            }}>SB</div>
            <h3 style={{ 
              fontSize: '1.6rem', 
              fontWeight: '800', 
              color: '#fff', 
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              letterSpacing: '-0.02em'
            }}>B2B Marka Portalı</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Seramik fabrikaları ve üretici yetkilileri için akıllı analiz, bayi ve reklam kontrol paneli.
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loginError && (
              <div className="error-alert" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kullanıcı Adı</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="vitra, kutahya, bien..." 
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  className="login-input"
                />
                <User size={16} style={{ position: 'absolute', left: '16px', top: '17px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Şifre</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  className="login-input"
                />
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '17px', color: '#94a3b8' }} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              style={{
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#111',
                border: 'none',
                borderRadius: '12px',
                padding: '15px',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                transition: 'all 0.2s'
              }}
              className="login-btn"
            >
              {loginLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Bağlanılıyor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Marka Paneline Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
            Demo Giriş Bilgileri:<br />
            Kullanıcı Adı: <strong>vitra</strong> / Şifre: <strong>vitra123</strong><br />
            Kullanıcı Adı: <strong>kutahya</strong> / Şifre: <strong>kutahya123</strong>
          </div>
        </div>
      </main>

      {/* Local styles for login */}
      <style jsx>{`
        @media (max-width: 768px) {
          .login-card {
            padding: 24px 18px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </>
  );
}

  const { linePath, areaPath, maxVal, points } = generateChartPaths();
  const currentPlan = b2bStats?.saas?.plan || 'BASIC';

  // 2. MAIN LOGGED-IN PORTAL LAYOUT (Sidebar Layout)
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflowX: 'hidden'
    }}>
      {/* SOLID SIDEBAR */}
      {!isMobile && (
        <aside style={{
          width: isSidebarCollapsed ? '70px' : '260px',
          background: '#090d16',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 200
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '24px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#fff',
              color: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.2rem',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(255,255,255,0.1)'
            }}>SB</div>
            {!isSidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {brandInfo.name}
                </h2>
                <span style={{ 
                  fontSize: '0.62rem', 
                  padding: '2px 6px', 
                  borderRadius: '8px', 
                  display: 'inline-block',
                  marginTop: '3px',
                  ...getPlanBadgeStyle(currentPlan)
                }}>
                  {currentPlan} ÜYE
                </span>
              </div>
            )}
          </div>

          {/* Sidebar Nav Items */}
          <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'dashboard', label: 'Gösterge Paneli', icon: <Activity size={18} /> },
              { id: 'products', label: 'Ürün Kataloğumuz', icon: <Layers size={18} /> },
              { id: 'b2b-projects', label: 'B2B Proje Talepleri', icon: <Building2 size={18} /> },
              { id: 'trends', label: 'Bölgesel Trendler', icon: <TrendingUp size={18} /> },
              { id: 'dealers', label: 'Bayi Ağı Yönetimi', icon: <Users size={18} /> },
              { id: 'campaigns', label: 'Reklam Yönetimi', icon: <Megaphone size={18} /> },
              { id: 'saas', label: 'Lisans & Ödemeler', icon: <CreditCard size={18} /> }
            ].map(item => {
              const isActive = activePortalTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePortalTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    color: isActive ? '#d4af37' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '700' : '500',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className="sidebar-link-btn"
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Collapse Toggle & Logout */}
          <div style={{
            padding: '12px 8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Menu size={16} />
              {!isSidebarCollapsed && <span>Paneli Daralt</span>}
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '700',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              {!isSidebarCollapsed && <span>Çıkış Yap</span>}
            </button>
          </div>
        </aside>
      )}

      {/* PORTAL CONTENT WRAPPER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* UPPER HEADER BAR */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: isMobile ? '12px 16px' : '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          {isMobile ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #111 0%, #1e293b 100%)',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '0.85rem'
                }}>SB</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{brandInfo.name}</h4>
                  <span style={{ fontSize: '0.62rem', color: '#d4af37', fontWeight: '700' }}>
                    {activePortalTab === 'dashboard' && 'Gösterge Paneli'}
                    {activePortalTab === 'products' && 'Ürün Kataloğu'}
                    {activePortalTab === 'b2b-projects' && 'B2B Talepleri'}
                    {activePortalTab === 'trends' && 'Pazar Trendleri'}
                    {activePortalTab === 'dealers' && 'Bayi Ağı'}
                    {activePortalTab === 'campaigns' && 'Reklam Yönetimi'}
                    {activePortalTab === 'saas' && 'Lisans & Ödemeler'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.6rem',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  ...getPlanBadgeStyle(currentPlan)
                }}>
                  {currentPlan} PLAN
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a', fontFamily: 'var(--font-title, "Outfit", sans-serif)' }}>
                  {activePortalTab === 'dashboard' && 'Gösterge Paneli'}
                  {activePortalTab === 'products' && 'Ürün Kataloğumuz'}
                  {activePortalTab === 'b2b-projects' && 'B2B Proje ve Toptan Talepler'}
                  {activePortalTab === 'trends' && 'Bölgesel Pazar Trendleri'}
                  {activePortalTab === 'dealers' && 'Yetkili Bayi Ağı Kontrolü'}
                  {activePortalTab === 'campaigns' && 'Vitrin & Reklam Yönetimi'}
                  {activePortalTab === 'saas' && 'SaaS Abonelik & Ödeme Yönetimi'}
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  {brandInfo.name} fabrikası için B2B2C yönetim merkezi.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {b2bStats?.saas?.expiresAt && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                    <Calendar size={12} style={{ color: '#d4af37' }} />
                    <span>Lisans Bitiş: <strong>{new Date(b2bStats.saas.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                  </div>
                )}
                <span style={{
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  ...getPlanBadgeStyle(currentPlan)
                }}>
                  {currentPlan} PLAN
                </span>
              </div>
            </div>
          )}
        </header>

        {/* PORTAL MAIN TAB CONTAINER */}
        <main style={{ padding: isMobile ? '16px 12px 80px 12px' : '32px', maxWidth: '1400px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          
          {statsLoading && !b2bStats ? (
            <div style={{ textAlign: 'center', padding: '120px 0', color: '#64748b' }}>
              <Loader2 className="animate-spin" style={{ margin: '0 auto 16px auto', width: '40px', height: '40px', color: '#d4af37' }} />
              <h4 style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Veriler Derleniyor</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Markanıza ait pazar istatistikleri ve analizler güncelleniyor...</p>
            </div>
          ) : !b2bStats ? (
            <div style={{ textAlign: 'center', padding: '64px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <AlertCircle size={32} style={{ color: '#ef4444', margin: '0 auto 12px auto' }} />
              <h4>Veri Yükleme Hatası</h4>
              <p style={{ color: '#64748b' }}>B2B istatistikleri yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.</p>
            </div>
          ) : (
            <>
              {requestedPlan && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde047',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#b45309',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '24px'
                }}>
                  <Loader2 size={18} className="animate-spin" style={{ color: '#d97706', flexShrink: 0 }} />
                  <div>
                    <strong>⏱️ Abonelik Yükseltme Onay Bekliyor:</strong> {requestedPlan} paket geçiş talebiniz alınmıştır. Gönderilen banka havaleniz doğrulandıktan sonra admin tarafından aktif edilecektir.
                  </div>
                </div>
              )}

              {isRejected && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '24px'
                }}>
                  <AlertCircle size={18} style={{ color: '#991b1b', flexShrink: 0 }} />
                  <div>
                    <strong>❌ Talebiniz Reddedildi:</strong> {b2bStats?.saas?.pendingPlan || b2bStats?.saas?.plan} abonelik talebiniz doğrulanırken bir sorun oluştu ve admin tarafından onaylanmadı.
                  </div>
                </div>
              )}

              {/* -------------------- TAB 1: DASHBOARD -------------------- */}
              {activePortalTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* METRICS SUMMARY GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }} className="stats-card hover-lift">
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SaaS Planı</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d4af37', textShadow: '0 2px 4px rgba(212,175,55,0.1)' }}>{currentPlan}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          color: b2bStats.saas?.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
                          fontWeight: '700',
                          background: b2bStats.saas?.status === 'ACTIVE' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {b2bStats.saas?.status === 'ACTIVE' ? 'Aktif' : 'Onay Bekliyor'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>B2B Projeler & Detay Analiz Erişimi</span>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} className="stats-card hover-lift">
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Katalog Görüntülenme</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{b2bStats.summary?.totalViews.toLocaleString('tr-TR')}</span>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>+12.4%</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>Müşterilerin katalog arama ve görüntülemeleri</span>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} className="stats-card hover-lift">
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tıklanma Oranı (CTR)</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>%{b2bStats.summary?.ctr}</span>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>Ortalamanın Üstü</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>Tıklama / Gösterim oranı</span>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} className="stats-card hover-lift">
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Müşteri Talepleri (Leads)</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669' }}>{b2bStats.summary?.totalLeads}</span>
                        <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '700' }}>{dealers.length} Aktif Bayi</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>Fiziki alım için bayilere iletilen teklif formları</span>
                    </div>

                  </div>

                  {/* VISUAL ANALYTICS & MARKET SHARE ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="brand-campaign-grid">
                    
                    {/* DYNAMIC TIMELINE CHART WIDGET */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} style={{ color: '#2563eb' }} />
                            Dinamik Mağaza Etkileşim Trendi
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Son 30 gündeki mağaza tıklama, gösterim ve teklif hareketliliği.</p>
                        </div>

                        {/* Metric Selector Buttons */}
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '2px' }}>
                          <button 
                            onClick={() => setChartMetric('views')}
                            style={{
                              border: 'none',
                              background: chartMetric === 'views' ? '#fff' : 'transparent',
                              color: chartMetric === 'views' ? '#0f172a' : '#64748b',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              boxShadow: chartMetric === 'views' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            Görüntülenme
                          </button>
                          <button 
                            onClick={() => setChartMetric('clicks')}
                            style={{
                              border: 'none',
                              background: chartMetric === 'clicks' ? '#fff' : 'transparent',
                              color: chartMetric === 'clicks' ? '#0f172a' : '#64748b',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              boxShadow: chartMetric === 'clicks' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            Tıklanma
                          </button>
                          <button 
                            onClick={() => setChartMetric('leads')}
                            style={{
                              border: 'none',
                              background: chartMetric === 'leads' ? '#fff' : 'transparent',
                              color: chartMetric === 'leads' ? '#0f172a' : '#64748b',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              boxShadow: chartMetric === 'leads' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            Bayi Talebi
                          </button>
                        </div>
                      </div>

                      {/* SVG Line Chart based on real timeline data */}
                      <div style={{ width: '100%', height: '220px', position: 'relative', marginTop: '16px' }}>
                        <svg viewBox="0 0 500 200" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="dynamicChartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={chartMetric === 'views' ? '#2563eb' : (chartMetric === 'clicks' ? '#b38e47' : '#059669')} stopOpacity="0.25"/>
                              <stop offset="100%" stopColor={chartMetric === 'views' ? '#2563eb' : (chartMetric === 'clicks' ? '#b38e47' : '#059669')} stopOpacity="0.00"/>
                            </linearGradient>
                          </defs>

                          {/* Horizontal grid lines */}
                          <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1"/>
                          <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1"/>
                          <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1"/>
                          <line x1="0" y1="180" x2="500" y2="180" stroke="#e2e8f0" strokeWidth="2"/>

                          {/* Render Dynamic Area Path */}
                          {areaPath && (
                            <path d={areaPath} fill="url(#dynamicChartGrad)"/>
                          )}

                          {/* Render Dynamic Line Path */}
                          {linePath && (
                            <path d={linePath} fill="none" stroke={chartMetric === 'views' ? '#2563eb' : (chartMetric === 'clicks' ? '#d4af37' : '#059669')} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          )}

                          {/* Glow dots for data points */}
                          {points.map((pt, idx) => {
                            // Only render dots every 4th element to keep graph clean
                            if (idx % 5 !== 0 && idx !== points.length - 1) return null;
                            const isLast = idx === points.length - 1;

                            return (
                              <g key={idx}>
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isLast ? "6" : "4"} 
                                  fill={chartMetric === 'views' ? '#2563eb' : (chartMetric === 'clicks' ? '#d4af37' : '#059669')} 
                                  stroke="#fff" 
                                  strokeWidth="2"
                                />
                                {/* Simple text bubble on hover simulator */}
                                <title>{pt.label}: {pt.val} {chartMetric === 'views' ? 'görüntülenme' : (chartMetric === 'clicks' ? 'tıklama' : 'talep')}</title>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Chart Y-axis scale value indicators */}
                        <div style={{ position: 'absolute', left: '-5px', top: '32px', fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700' }}>{maxVal}</div>
                        <div style={{ position: 'absolute', left: '-5px', top: '102px', fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700' }}>{Math.round(maxVal / 2)}</div>
                        <div style={{ position: 'absolute', left: '-5px', top: '172px', fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700' }}>0</div>

                        {/* Chart Date labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', padding: '0 5px' }}>
                          <span>{b2bStats.timeline?.[0]?.date || '30 gün önce'}</span>
                          <span>{b2bStats.timeline?.[14]?.date || '15 gün önce'}</span>
                          <span>{b2bStats.timeline?.[29]?.date || 'Bugün'}</span>
                        </div>
                      </div>
                    </div>

                    {/* MARKET SHARE ENDEKS */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'space-between' }} className="stats-card">
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={18} style={{ color: '#d4af37' }} />
                          Pazar Payı Endeksi
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>SeramikBak pazar yeri genelinde markanızın toplam görüntülenme payı.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', margin: '10px 0' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                          <svg width="120" height="120" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#f1f5f9"
                              strokeWidth="3.5"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="url(#goldGradient)"
                              strokeDasharray="24.8, 100"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#b38e47" />
                                <stop offset="100%" stopColor="#d4af37" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>%24.8</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>2. En Popüler Marka</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Qua Granite'in ardından</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 3D / AR STÜDYO Raporu */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                      3D Sanal Stüdyo & AR (Artırılmış Gerçeklik) Etkileşim Raporu
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Tüketicilerin sanal planlama modülü üzerinden ürünlerinizi banyolarına döşeme ve AR oda kaplama istatistikleri.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="campaign-inputs-grid">
                      <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7c3aed' }}>{b2bStats?.summary?.totalStudioTries || 0} Kez</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#5b21b6', marginTop: '4px' }}>3D Banyo Planlama</div>
                        <div style={{ fontSize: '0.68rem', color: '#7c3aed', marginTop: '2px' }}>Ürünlerinizle oda tasarlandı</div>
                      </div>
                      <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>{b2bStats?.summary?.totalArTries || 0} Kez</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', marginTop: '4px' }}>AR Evde Görselleştirme</div>
                        <div style={{ fontSize: '0.68rem', color: '#2563eb', marginTop: '2px' }}>Zemin canlı kamera ile test edildi</div>
                      </div>
                      <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669' }}>{b2bStats?.summary?.totalLeads || 0} İstek</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065f46', marginTop: '4px' }}>Teklif & İhale Talebi</div>
                        <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '2px' }}>Tüketici ve mimar talepleri</div>
                      </div>
                    </div>
                  </div>

                  {/* SUBMITTED B2B BIDS / OFFERS HISTORY */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Briefcase size={18} style={{ color: '#b38e47' }} />
                          B2B İhalelere Gönderilen Tekliflerimiz
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>B2B Proje Taleplerine fabrikamızın sunduğu toptan karo fiyat tekliflerinin durumu.</p>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: '#fffbeb', color: '#b45309', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                        Toplam {bids.length} Teklif Gönderildi
                      </span>
                    </div>

                    {bids.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        Henüz herhangi bir B2B inşaat projesi ihalesine teklif sunmadınız. "B2B Proje Talepleri" sekmesinden ihaleleri inceleyip teklif verebilirsiniz.
                      </div>
                    ) : isMobile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        {bids.map(bid => (
                          <div key={bid.id} style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{bid.projectName}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{bid.companyName}</span>
                              </div>
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: '#fef3c7',
                                color: '#d97706',
                                fontWeight: '700'
                              }}>
                                Onay Bekliyor
                              </span>
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>
                              <div>Ürün: <strong>{bid.productName}</strong></div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Kod: {bid.productCode}</div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                              <div>
                                <span style={{ color: '#64748b', display: 'block' }}>Birim Fiyat</span>
                                <strong style={{ color: '#0f172a' }}>₺{bid.priceM2} / m²</strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', display: 'block' }}>Toplam Teklif</span>
                                <strong style={{ color: '#059669' }}>₺{bid.totalPrice.toLocaleString('tr-TR')}</strong>
                              </div>
                            </div>
                            
                            <div style={{ fontSize: '0.72rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Teslim Süresi: <strong>{bid.timeline}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                              <th style={{ padding: '12px 8px' }}>Proje / Firma</th>
                              <th style={{ padding: '12px 8px' }}>Önerilen Ürün</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Birim Fiyat</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Toplam Teklif</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Teslim Süresi</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bids.map(bid => (
                              <tr key={bid.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{bid.projectName}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{bid.companyName}</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div>{bid.productName}</div>
                                  <span style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', color: '#475569' }}>Kod: {bid.productCode}</span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>₺{bid.priceM2} / m²</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700', color: '#059669' }}>₺{bid.totalPrice.toLocaleString('tr-TR')}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#475569' }}>{bid.timeline}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                  <span style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: '#fef3c7',
                                    color: '#d97706',
                                    fontWeight: '700'
                                  }}>
                                    Onay Bekliyor
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* -------------------- TAB 2: PRODUCTS -------------------- */}
              {activePortalTab === 'products' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={22} style={{ color: '#d4af37' }} />
                        Markamıza Ait Ürünler ve Pazar Analizi
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        SeramikBak portalında yayınlanan ürünlerinizin listesi, teknik özellikleri ve e-ticaret entegrasyon fiyatları.
                      </p>
                    </div>

                    <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '20px', fontWeight: '700' }}>
                      Toplam {brandProducts.length} Ürün Listeli
                    </span>
                  </div>

                  {/* Filter & Search Bar */}
                  <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ürün adı veya koduna göre ara..."
                        style={{
                          width: '100%',
                          padding: '10px 16px 10px 40px',
                          fontSize: '0.85rem',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#94a3b8' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Filter size={14} style={{ color: '#64748b' }} />
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Tarz:</span>
                      </div>
                      <select 
                        value={selectedStyle} 
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                      >
                        <option value="ALL">Tümü</option>
                        <option value="Mermer">Mermer</option>
                        <option value="Beton">Beton</option>
                        <option value="Ahşap">Ahşap</option>
                        <option value="Taş">Taş</option>
                        <option value="Seramik">Klasik Seramik</option>
                      </select>

                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginLeft: '6px' }}>Yüzey:</span>
                      <select 
                        value={selectedFinish} 
                        onChange={(e) => setSelectedFinish(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                      >
                        <option value="ALL">Tümü</option>
                        <option value="Mat">Mat</option>
                        <option value="Parlak">Parlak</option>
                        <option value="Lapatto">Lapatto</option>
                      </select>
                    </div>
                  </div>

                  {/* Product Grid */}
                  {brandProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
                      <Layers size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                      <span>Ürünleriniz yüklenemedi veya henüz yüklenmiş bir ürün bulunmamaktadır.</span>
                    </div>
                  ) : (
                    (() => {
                      const filtered = brandProducts.filter(p => {
                        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesStyle = selectedStyle === 'ALL' || p.style === selectedStyle;
                        const matchesFinish = selectedFinish === 'ALL' || p.finish === selectedFinish;
                        return matchesSearch && matchesStyle && matchesFinish;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <span>Seçilen filtrelere uyan hiçbir ürün bulunamadı.</span>
                          </div>
                        );
                      }

                      return (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '24px'
                        }}>
                          {filtered.map(prod => (
                            <div 
                              key={prod.id} 
                              style={{
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                                transition: 'all 0.25s'
                              }}
                              className="product-card hover-lift"
                            >
                              {/* Product Thumbnail */}
                              <div style={{ position: 'relative', height: '180px', background: '#f8fafc', overflow: 'hidden' }}>
                                <img 
                                  src={prod.imageUrl || '/test.jpg'} 
                                  alt={prod.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => { e.target.src = '/test.jpg'; }}
                                />
                                {prod.isPremium && (
                                  <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                                    color: '#000',
                                    fontSize: '0.62rem',
                                    fontWeight: '800',
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                  }}>
                                    ÖNE ÇIKAN (AD)
                                  </span>
                                )}
                                <span style={{
                                  position: 'absolute',
                                  bottom: '10px',
                                  left: '10px',
                                  background: 'rgba(9, 13, 22, 0.75)',
                                  color: '#fff',
                                  fontSize: '0.68rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  {prod.width}x{prod.height} cm
                                </span>
                              </div>

                              {/* Card Content */}
                              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div>
                                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>Kod: {prod.code}</div>
                                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                                    {prod.name}
                                  </h4>

                                  {/* Badges */}
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>{prod.style}</span>
                                    <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>{prod.finish} Yüzey</span>
                                    <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>{prod.color}</span>
                                  </div>
                                </div>

                                {/* Retail Store Price Integrations */}
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                                  <h5 style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Dijital Pazar Yeri Fiyatları</h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    
                                    {prod.trendyolPrice ? (
                                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#ea580c', fontWeight: '700' }}>Trendyol:</span>
                                        <strong style={{ color: '#0f172a' }}>₺{prod.trendyolPrice.toLocaleString('tr-TR')} / m²</strong>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.5 }}>
                                        <span>Trendyol:</span>
                                        <span>Yok</span>
                                      </div>
                                    )}

                                    {prod.koctasPrice ? (
                                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#2563eb', fontWeight: '700' }}>Koçtaş:</span>
                                        <strong style={{ color: '#0f172a' }}>₺{prod.koctasPrice.toLocaleString('tr-TR')} / m²</strong>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.5 }}>
                                        <span>Koçtaş:</span>
                                        <span>Yok</span>
                                      </div>
                                    )}

                                    {prod.hepsiburadaPrice && (
                                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#ff6000', fontWeight: '700' }}>Hepsiburada:</span>
                                        <strong style={{ color: '#0f172a' }}>₺{prod.hepsiburadaPrice.toLocaleString('tr-TR')} / m²</strong>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* -------------------- TAB 3: B2B PROJECTS -------------------- */}
              {activePortalTab === 'b2b-projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={22} style={{ color: '#d4af37' }} />
                        B2B Toplu Proje ve Seramik İhaleleri
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        Türkiye genelinde müteahhitler, inşaat firmaları ve mimarların projeleri için açtığı toptan seramik alım ilanları.
                      </p>
                    </div>

                    <div style={{
                      ...getPlanBadgeStyle(currentPlan),
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      Lisans Paketiniz: {currentPlan}
                    </div>
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
                        <span>Şu anda onaylanmış bir B2B proje talebi bulunmamaktadır.</span>
                      </div>
                    ) : (
                      projects.map(proj => {
                        const isLocked = proj.isLocked;
                        const isMasked = proj.isMasked;
                        const hasAlreadyBid = bids.some(b => b.projectId === proj.id);

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
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>İhale Tarihi</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                  {new Date(proj.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>

                            {/* Main Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                              
                              {/* Material preferences */}
                              <div>
                                <h5 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Malzeme Detayları</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                                  <div>Tercih Edilen Ebat: <strong>{proj.ceramicSizes}</strong></div>
                                  <div>Koleksiyon Tarzı: <strong>{proj.ceramicStyles}</strong></div>
                                  {proj.ceramicFinishes && <div>Yüzey Tipi: <strong>{proj.ceramicFinishes}</strong></div>}
                                  {proj.ceramicColors && <div>İstenen Renk: <strong>{proj.ceramicColors}</strong></div>}
                                  <div>Kullanım Alanı: <strong>{proj.usageAreas}</strong></div>
                                </div>
                              </div>

                              {/* Metraj and Timeline */}
                              <div>
                                <h5 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Hacim & Bütçe</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                                  <div>Gereken Metraj: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{proj.quantityM2.toLocaleString('tr-TR')} m²</strong></div>
                                  <div>Hedef Karo Bütçesi: <strong style={{ color: '#2563eb' }}>{proj.budgetM2}</strong></div>
                                  <div>Teslim İstek Süresi: <strong>{proj.deliveryTimeline}</strong></div>
                                </div>
                              </div>

                              {/* Contact info (Masked or open) */}
                              <div>
                                <h5 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>İnşaat Sahibi & İletişim</h5>
                                {isMasked ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#475569' }}>
                                    <div>Firma: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.companyName}</strong></div>
                                    <div>Yetkili: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.contactName}</strong></div>
                                    <div>Telefon: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.contactPhone}</strong></div>
                                    <div style={{ fontSize: '0.7rem', color: '#ca8a04', fontWeight: '700', marginTop: '4px', background: '#fef9c3', padding: '4px 8px', borderRadius: '6px' }}>
                                      ⚠️ Firma detayları ve doğrudan telefon numaraları için lisansınızı ENTERPRISE pakete yükseltin.
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                                    <div>Firma: <strong style={{ color: '#111' }}>{proj.companyName}</strong></div>
                                    <div>Yetkili: <strong>{proj.contactName}</strong></div>
                                    <div>Telefon: <a href={`tel:${proj.contactPhone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>{proj.contactPhone}</a></div>
                                    <div>E-posta: <a href={`mailto:${proj.contactEmail}`} style={{ color: '#64748b' }}>{proj.contactEmail}</a></div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Project note */}
                            {proj.notes && (
                              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1' }}>
                                Müteahhit Açıklaması: "{proj.notes}"
                              </div>
                            )}

                            {/* Bidding buttons */}
                            {!isLocked && (
                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                                {hasAlreadyBid ? (
                                  <span style={{
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <CheckCircle size={14} /> Fiyat Teklifiniz İletildi
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setBiddingProject(proj)}
                                    style={{
                                      background: '#090d16',
                                      color: '#d4af37',
                                      border: '1px solid #d4af37',
                                      borderRadius: '8px',
                                      padding: '8px 16px',
                                      fontSize: '0.8rem',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'all 0.2s'
                                    }}
                                    className="hover-gold-btn"
                                  >
                                    <Handshake size={14} />
                                    <span>Toptan Fiyat Teklifi Sun</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Lock Overlays for BASIC plan */}
                            {isLocked && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(255, 255, 255, 0.94)',
                                backdropFilter: 'blur(5px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                justifyContent: 'center',
                                padding: '24px',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '50%',
                                  background: '#fee2e2',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom: '10px'
                                }}>
                                  <Lock size={20} />
                                </div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>B2B İhale Detayları Kilitli</h4>
                                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0', maxWidth: '340px', lineHeight: '1.4' }}>
                                  Toplu malzeme ebatlarını, m² miktarını ve müteahhit ihtiyaç detaylarını görerek teklif sunabilmek için markanızın lisansını yükseltin.
                                </p>
                                <button
                                  onClick={() => setActivePortalTab('saas')}
                                  style={{
                                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Lisansı Yükselt
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* -------------------- TAB 4: DEALERS -------------------- */}
              {activePortalTab === 'dealers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={22} style={{ color: '#059669' }} />
                        Yetkili Bayi Ağı Yönetimi
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        Markanıza bağlı çalışan fiziki mağazaların (bayiler) listesi, konumları, satış ve aktivasyon onay süreçleri.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddDealerModal(true)}
                      style={{
                        background: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(5,150,105,0.2)'
                      }}
                    >
                      <Plus size={16} />
                      <span>Yeni Yetkili Bayi Ekle</span>
                    </button>
                  </div>

                  {/* Dealers List */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    {dealersLoading ? (
                      <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                        <span>Bayi listesi güncelleniyor...</span>
                      </div>
                    ) : dealers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Markanıza tanımlanmış hiçbir fiziki bayi bulunamadı. Sağ üstten yeni bir bayi tanımlayabilirsiniz.
                      </div>
                    ) : isMobile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        {dealers.map(dealer => (
                          <div key={dealer.id} style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{dealer.name}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#475569' }}>{dealer.city} / {dealer.district}</span>
                              </div>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                background: dealer.status === 'APPROVED' ? '#ecfdf5' : (dealer.status === 'PENDING_APPROVAL' ? '#fffbeb' : '#fef2f2'),
                                color: dealer.status === 'APPROVED' ? '#059669' : (dealer.status === 'PENDING_APPROVAL' ? '#d97706' : '#ef4444')
                              }}>
                                {dealer.status === 'APPROVED' ? 'Aktif' : (dealer.status === 'PENDING_APPROVAL' ? 'Onay Bekliyor' : 'Askıda')}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              <div>Adres: <strong style={{ color: '#475569' }}>{dealer.address}</strong></div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Koordinat: {dealer.lat.toFixed(4)}, {dealer.lng.toFixed(4)}</div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                              <a href={`tel:${dealer.phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700' }}>📞 {dealer.phone}</a>
                              
                              {dealer.status === 'APPROVED' ? (
                                <button 
                                  onClick={() => handleUpdateDealerStatus(dealer.id, 'REJECTED')}
                                  style={{
                                    border: 'none',
                                    background: 'rgba(239,68,68,0.08)',
                                    color: '#ef4444',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Askıya Al
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateDealerStatus(dealer.id, 'APPROVED')}
                                  style={{
                                    border: 'none',
                                    background: 'rgba(5,150,105,0.08)',
                                    color: '#059669',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Aktifleştir
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                              <th style={{ padding: '12px 8px' }}>Bayi Adı</th>
                              <th style={{ padding: '12px 8px' }}>Telefon</th>
                              <th style={{ padding: '12px 8px' }}>Şehir / Bölge</th>
                              <th style={{ padding: '12px 8px' }}>Adres</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Koordinat</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Durum</th>
                              <th style={{ padding: '12px 8px', textAlign: 'center' }}>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dealers.map(dealer => (
                              <tr key={dealer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>{dealer.name}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <a href={`tel:${dealer.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{dealer.phone}</a>
                                </td>
                                <td style={{ padding: '12px 8px', color: '#475569' }}>{dealer.city} / {dealer.district}</td>
                                <td style={{ padding: '12px 8px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dealer.address}>{dealer.address}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.72rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                                  {dealer.lat.toFixed(4)}, {dealer.lng.toFixed(4)}
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                  <span style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    background: dealer.status === 'APPROVED' ? '#ecfdf5' : (dealer.status === 'PENDING_APPROVAL' ? '#fffbeb' : '#fef2f2'),
                                    color: dealer.status === 'APPROVED' ? '#059669' : (dealer.status === 'PENDING_APPROVAL' ? '#d97706' : '#ef4444')
                                  }}>
                                    {dealer.status === 'APPROVED' ? 'Aktif' : (dealer.status === 'PENDING_APPROVAL' ? 'Onay Bekliyor' : 'Askıda')}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                  {dealer.status === 'APPROVED' ? (
                                    <button 
                                      onClick={() => handleUpdateDealerStatus(dealer.id, 'REJECTED')}
                                      style={{
                                        border: 'none',
                                        background: 'rgba(239,68,68,0.08)',
                                        color: '#ef4444',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Askıya Al
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleUpdateDealerStatus(dealer.id, 'APPROVED')}
                                      style={{
                                        border: 'none',
                                        background: 'rgba(5,150,105,0.08)',
                                        color: '#059669',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Aktifleştir
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* -------------------- TAB 5: CAMPAIGNS -------------------- */}
              {activePortalTab === 'campaigns' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Campaign Header */}
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Megaphone size={22} style={{ color: '#d4af37' }} />
                      Premium Vitrin ve Reklam Kampanyaları
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                      Kataloğunuzdaki seramikleri SeramikBak ana sayfasında "Yeni Koleksiyonlar" vitrininde yayına sokarak erişiminizi katlayın.
                    </p>
                  </div>

                  {/* Main Grid: Form/Mockup and Campaigns Table */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }} className="brand-campaign-grid">
                    
                    {/* Left: Purchase Form and LIVE Mockup */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Create campaign form */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a' }}>Yeni Vitrin İlanı Talep Et</h3>
                        
                        {campaignSuccessMsg && (
                          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '14px' }}>{campaignSuccessMsg}</div>
                        )}
                        {campaignErrorMsg && (
                          <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '14px' }}>{campaignErrorMsg}</div>
                        )}

                        <form onSubmit={handleCampaignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Öne Çıkarılacak Ürün</label>
                            <select 
                              value={campaignProduct} 
                              onChange={(e) => setCampaignProduct(e.target.value)} 
                              required
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
                            >
                              <option value="">Seçiniz...</option>
                              {brandProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Yayın Süresi</label>
                            <select
                              value={campaignDuration}
                              onChange={(e) => setCampaignDuration(e.target.value)}
                              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
                            >
                              <option value="7">1 Hafta (500 TL)</option>
                              <option value="30">1 Ay (1500 TL)</option>
                              <option value="90">3 Ay (4000 TL)</option>
                              <option value="180">6 Ay (7500 TL)</option>
                            </select>
                          </div>

                          <button 
                            type="submit" 
                            disabled={!campaignProduct}
                            style={{
                              background: '#090d16',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px',
                              fontWeight: '700',
                              fontSize: '0.82rem',
                              cursor: campaignProduct ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              opacity: campaignProduct ? 1 : 0.6
                            }}
                          >
                            <Plus size={16} />
                            <span>Ödeme Adımına Geç</span>
                          </button>
                        </form>
                      </div>

                      {/* LIVE AD PREVIEW MOCKUP */}
                      {campaignProduct && (
                        (() => {
                          const selectedProd = brandProducts.find(p => p.id === campaignProduct);
                          if (!selectedProd) return null;

                          return (
                            <div style={{
                              background: '#090d16',
                              border: '1px solid #d4af37',
                              borderRadius: '16px',
                              padding: '20px',
                              color: '#fff',
                              boxShadow: '0 8px 24px rgba(212,175,55,0.1)'
                            }}>
                              <h4 style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px' }}>
                                Canlı Ana Sayfa Vitrin Önizlemesi (Görsel Taslak)
                              </h4>
                              
                              <div style={{
                                width: '100%',
                                maxWidth: '240px',
                                margin: '0 auto',
                                background: '#fff',
                                borderRadius: '12px',
                                border: '2px solid #d4af37',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 0 15px rgba(212,175,55,0.4)'
                              }}>
                                <div style={{ height: '140px', position: 'relative', background: '#f8fafc' }}>
                                  <img 
                                    src={selectedProd.imageUrl || '/test.jpg'} 
                                    alt="Mockup" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  />
                                  <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                                    color: '#000',
                                    fontSize: '0.55rem',
                                    fontWeight: '900',
                                    padding: '2px 6px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                  }}>
                                    YENİ KOLEKSİYON
                                  </span>
                                </div>
                                <div style={{ padding: '10px', color: '#0f172a' }}>
                                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700' }}>{brandInfo.name.toUpperCase()}</div>
                                  <div style={{ fontSize: '0.78rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProd.name}</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.68rem', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 4px', borderRadius: '2px', fontSize: '0.6rem' }}>{selectedProd.width}x{selectedProd.height}</span>
                                    {selectedProd.trendyolPrice && <strong style={{ color: '#059669' }}>₺{selectedProd.trendyolPrice.toLocaleString('tr-TR')} / m²</strong>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}

                    </div>

                    {/* Right: Campaigns History Table */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a' }}>Mevcut Kampanyalarımız</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                        {b2bStats.campaigns.map(camp => {
                          const isExpired = camp.expiresAt && new Date(camp.expiresAt) < new Date();
                          
                          let statusLabel = 'Onay Bekliyor';
                          let statusColor = '#d97706';
                          let statusBg = '#fffbeb';
                          let isPulsing = true;

                          if (isExpired) {
                            statusLabel = 'Süresi Dolmuş';
                            statusColor = '#64748b';
                            statusBg = '#f1f5f9';
                            isPulsing = false;
                          } else if (camp.status === 'ACTIVE') {
                            statusLabel = 'Yayında';
                            statusColor = '#10b981';
                            statusBg = '#ecfdf5';
                          } else if (camp.status === 'REJECTED') {
                            statusLabel = 'Reddedildi';
                            statusColor = '#ef4444';
                            statusBg = '#fef2f2';
                            isPulsing = false;
                          }

                          return (
                            <div key={camp.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '16px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              fontSize: '0.8rem'
                            }}>
                              <div>
                                <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{camp.product?.name}</strong>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Kod: {camp.product?.code}</div>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  <span style={{ 
                                    fontSize: '0.65rem', 
                                    background: statusBg, 
                                    color: statusColor, 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}>
                                    {isPulsing && (
                                      <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: statusColor,
                                        display: 'inline-block'
                                      }} className="pulse-dot"></span>
                                    )}
                                    {statusLabel}
                                  </span>
                                  {camp.paymentRef && (
                                    <span style={{ fontSize: '0.62rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                                      Ref: {camp.paymentRef}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800', color: '#2563eb', fontSize: '0.82rem' }}>
                                  <MousePointerClick size={13} />
                                  <span>{camp.clicks || 0} Tıklama</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#7c3aed', fontSize: '0.72rem' }}>
                                  <Sparkles size={12} />
                                  <span>{camp.studioTries || 0} 3D Denenme</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}><strong>{camp.durationDays} Gün</strong> / ₺{camp.price}</div>
                                {camp.expiresAt && (
                                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    Bitiş: {new Date(camp.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {b2bStats.campaigns.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Henüz kayıtlı veya onay bekleyen hiçbir reklam ihaleniz bulunmamaktadır.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------- TAB 6: SAAS BILLING -------------------- */}
              {activePortalTab === 'saas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={22} style={{ color: '#d4af37' }} />
                      SaaS Lisans Planı ve Banka Havale Bildirimleri
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                      SeramikBak üretici portalı özellikleri, kilitli B2B proje ihalelerini açma, bayi ağ yönetimi ve lisans yükseltme ödemeleri.
                    </p>
                  </div>

                  {/* Feature Comparison Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    
                    {/* BASIC PLAN */}
                    <div style={{ 
                      background: '#fff', 
                      border: currentPlan === 'BASIC' ? '2px solid #64748b' : '1px solid #e2e8f0', 
                      borderRadius: '16px', 
                      padding: '24px',
                      position: 'relative'
                    }}>
                      {currentPlan === 'BASIC' && (
                        <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#64748b', color: '#fff', fontSize: '0.62rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>Aktif</span>
                      )}
                      <h4 style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Giriş Paketi</h4>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0' }}>BASIC PLAN</h3>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#475569' }}>
                        <li>✅ 20 Adete Kadar Ürün Listeleme</li>
                        <li>✅ Mağaza Ziyaretçi İstatistikleri</li>
                        <li>❌ B2B İnşaat Proje Detayları (Kilitli)</li>
                        <li>❌ Yetkili Bayi Ağı Yönetimi (Kilitli)</li>
                        <li>❌ Pazar Payı & Trend Raporları (Kilitli)</li>
                      </ul>
                    </div>

                    {/* PRO PLAN */}
                    <div style={{ 
                      background: '#fff', 
                      border: currentPlan === 'PRO' ? '2px solid #d4af37' : '1px solid #e2e8f0', 
                      borderRadius: '16px', 
                      padding: '24px',
                      position: 'relative',
                      boxShadow: currentPlan === 'PRO' ? '0 8px 24px rgba(212,175,55,0.15)' : 'none'
                    }}>
                      {currentPlan === 'PRO' && (
                        <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#d4af37', color: '#000', fontSize: '0.62rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>Aktif</span>
                      )}
                      <h4 style={{ fontSize: '0.78rem', color: '#b38e47', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Gelişmiş Paket</h4>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#b38e47', margin: '0 0 4px 0' }}>PRO PLAN</h3>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginBottom: '14px' }}>₺11.990 / Yıl</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#475569' }}>
                        <li>✅ Sınırsız Ürün Listeleme</li>
                        <li>✅ B2B İnşaat Proje Taleplerini Listeleme</li>
                        <li>✅ Vitrin Reklam İhalelerine Katılım</li>
                        <li>✅ B2B Pazar Trend Raporları (Kelime/İl)</li>
                        <li>❌ Müteahhit Doğrudan İletişim Numaraları (Kilitli)</li>
                      </ul>
                    </div>

                    {/* ENTERPRISE PLAN */}
                    <div style={{ 
                      background: '#fff', 
                      border: currentPlan === 'ENTERPRISE' ? '2px solid #0f172a' : '1px solid #e2e8f0', 
                      borderRadius: '16px', 
                      padding: '24px',
                      position: 'relative',
                      boxShadow: currentPlan === 'ENTERPRISE' ? '0 8px 24px rgba(15,23,42,0.15)' : 'none'
                    }}>
                      {currentPlan === 'ENTERPRISE' && (
                        <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#0f172a', color: '#fff', fontSize: '0.62rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>Aktif</span>
                      )}
                      <h4 style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Kurumsal Paket</h4>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', margin: '0 0 4px 0' }}>ENTERPRISE</h3>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginBottom: '14px' }}>₺24.990 / Yıl</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#475569' }}>
                        <li>✅ PRO Paket Özelliklerinin Tamamı</li>
                        <li>✅ Müteahhit/Mimar Doğrudan İletişim Numaraları</li>
                        <li>✅ Yetkili Bayi Ağı Aktivasyon & Yönetimi</li>
                        <li>✅ Rakip & Marka Pazar Payı Raporları</li>
                        <li>✅ ERP / XML Entegrasyon Desteği</li>
                      </ul>
                    </div>

                  </div>

                  {/* Plan Upgrade Selector & Bank form */}
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 8px 0' }}>Paket Yükseltme Ödeme Bildirimi Formu</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Banka havalesi ile gerçekleştirdiğiniz lisans bedeli ödemelerini buradan yönetime bildirin.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px' }} className="brand-campaign-grid">
                      {/* Left: Input values */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Lisans Tercihi:</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => setSelectedPaymentPlan('PRO')} 
                              disabled={currentPlan === 'PRO'}
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: selectedPaymentPlan === 'PRO' ? '#0f172a' : '#fff',
                                color: selectedPaymentPlan === 'PRO' ? '#fff' : '#0f172a',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              PRO
                            </button>
                            <button 
                              onClick={() => setSelectedPaymentPlan('ENTERPRISE')} 
                              disabled={currentPlan === 'ENTERPRISE'}
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: selectedPaymentPlan === 'ENTERPRISE' ? '#0f172a' : '#fff',
                                color: selectedPaymentPlan === 'ENTERPRISE' ? '#fff' : '#0f172a',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              ENTERPRISE
                            </button>
                          </div>
                        </div>

                        {hasPending ? (
                          <div style={{
                            background: '#fff9db',
                            border: '1px solid #fde047',
                            color: '#b45309',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            ⏱️ <strong>İşlem Onayda:</strong> {requestedPlan} paketi geçiş talebiniz doğrulanıyor. (Tutar: {requestedPlan === 'PRO' ? '11.990' : '24.990'} TL).
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowPaymentModal(true)} 
                            disabled={currentPlan === selectedPaymentPlan}
                            style={{
                              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                              color: '#000',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px',
                              fontWeight: '700',
                              fontSize: '0.82rem',
                              cursor: currentPlan === selectedPaymentPlan ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              opacity: currentPlan === selectedPaymentPlan ? 0.5 : 1
                            }}
                          >
                            <CheckCircle size={16} />
                            <span>{currentPlan === selectedPaymentPlan ? 'Zaten Bu Plana Sahipsiniz' : `${selectedPaymentPlan} Planı Ödeme Bildirimi Yap`}</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Bank wire guidelines */}
                      <div style={{ background: '#fcfaf2', border: '1px solid #fde047', borderRadius: '12px', padding: '24px', fontSize: '0.82rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '850', color: '#854d0e', margin: '0 0 10px 0' }}>Banka Havalesi Bilgileri</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#713f12' }}>
                          <div><strong>Alıcı Şirket:</strong> {bankDetails.bank_recipient}</div>
                          <div><strong>Banka:</strong> {bankDetails.bank_name}</div>
                          <div><strong>IBAN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{bankDetails.bank_iban}</span></div>
                          <div style={{ fontSize: '0.75rem', color: '#a16207', borderTop: '1px solid #fef08a', paddingTop: '8px', marginTop: '4px' }}>
                            * Havale açıklama alanına <strong>{brandInfo.name} Lisans Ödemesi</strong> yazmayı unutmayınız.
                          </div>
                        </div>
                      </div>

                  </div>
                  </div>

                </div>
              )}

              {/* -------------------- TAB 7: REGIONAL TRENDS -------------------- */}
              {activePortalTab === 'trends' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Tab header */}
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={22} style={{ color: '#d4af37' }} />
                      Bölgesel Tüketici Arama & Trend Analitiği
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                      Kullanıcıların site genelinde yaptığı aramaların, filtrelerin ve ürün etkileşimlerinin bölgesel analizi.
                    </p>
                  </div>

                  {currentPlan === 'BASIC' ? (
                    /* Premium Paywall Screen for BASIC users */
                    <div style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '56px 24px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '380px'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(212,175,55,0.08)',
                        color: '#d4af37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px solid rgba(212,175,55,0.2)'
                      }}>
                        <Lock size={26} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0f172a', margin: '0 0 10px 0' }}>Bölgesel Trend Raporları Kilitli</h3>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 24px 0', maxWidth: '440px', lineHeight: '1.5' }}>
                        Türkiye genelinde ve il bazında en çok aranan seramik ebatları, renk tercihleri, stil trendleri ve popüler arama kelimelerini görerek üretim planlamanızı optimize etmek için lisansınızı <strong>PRO PLAN</strong> pakete yükseltin.
                      </p>
                      <button
                        onClick={() => setActivePortalTab('saas')}
                        style={{
                          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                          color: '#000',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
                        }}
                      >
                        Lisansı Yükselt
                      </button>
                    </div>
                  ) : (
                    /* Dashboard for PRO & ENTERPRISE users */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Filter by city Row */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <MapPin size={18} style={{ color: '#2563eb' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Analiz Edilen Bölge:</span>
                          <select
                            value={selectedTrendCity}
                            onChange={(e) => setSelectedTrendCity(e.target.value)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: '600', color: '#0f172a', background: '#fff', cursor: 'pointer' }}
                          >
                            <option value="Tüm Türkiye">Tüm Türkiye (Genel)</option>
                            {TURKEY_CITIES.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
                          📅 Son 30 günlük verileri kapsar
                        </span>
                      </div>

                      {trendsLoading ? (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '80px 24px', textAlign: 'center', color: '#64748b' }}>
                          <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                          <span>Trend verileri analiz ediliyor...</span>
                        </div>
                      ) : (
                        (() => {
                          const cityTrends = trendsData?.trendsByCity?.[selectedTrendCity] || {
                            topColors: [],
                            topSizes: [],
                            topStyles: [],
                            topKeywords: []
                          };

                          const getMaxCount = (list) => {
                            if (!list || list.length === 0) return 1;
                            return Math.max(...list.map(item => item.count));
                          };

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="brand-campaign-grid">
                              
                              {/* 1. TOP SIZES */}
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                  📐 En Çok Aranan Ebatlar
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  {cityTrends.topSizes.map((item, idx) => {
                                    const percent = (item.count / getMaxCount(cityTrends.topSizes)) * 100;
                                    return (
                                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600' }}>
                                          <span style={{ color: '#0f172a' }}>{item.val}</span>
                                          <span style={{ color: '#2563eb' }}>{item.count} Arama</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                          <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: '4px' }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 2. TOP STYLES */}
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                  ✨ En Çok Tercih Edilen Stiller
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  {cityTrends.topStyles.map((item, idx) => {
                                    const percent = (item.count / getMaxCount(cityTrends.topStyles)) * 100;
                                    return (
                                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600' }}>
                                          <span style={{ color: '#0f172a' }}>{item.val} Görünümlü</span>
                                          <span style={{ color: '#059669' }}>{item.count} İnceleme</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                          <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '4px' }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 3. TOP COLORS */}
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                  🎨 Popüler Renkler
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                  {cityTrends.topColors.map((item, idx) => {
                                    const hexMap = {
                                      'Gri': '#8e939f',
                                      'Beyaz': '#ffffff',
                                      'Antrasit': '#2e3035',
                                      'Bej': '#f4ece1',
                                      'Kahverengi': '#8b5a2b',
                                      'Siyah': '#000000',
                                      'Yeşil': '#2e7d32',
                                      'Mavi': '#1565c0'
                                    };
                                    const dotBg = hexMap[item.val] || '#cbd5e1';
                                    const percent = (item.count / getMaxCount(cityTrends.topColors)) * 100;

                                    return (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: dotBg, border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0 }} />
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600' }}>
                                            <span style={{ color: '#0f172a' }}>{item.val}</span>
                                            <span style={{ color: '#475569' }}>{item.count} Tercih</span>
                                          </div>
                                          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: '#475569', borderRadius: '3px' }} />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 4. TOP KEYWORDS */}
                              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                  🔍 Popüler Arama Terimleri
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0' }}>
                                  {cityTrends.topKeywords.map((item, idx) => (
                                    <div key={idx} style={{
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '20px',
                                      padding: '8px 16px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      fontSize: '0.78rem',
                                      fontWeight: '600',
                                      color: '#334155'
                                    }}>
                                      <span>#{item.val}</span>
                                      <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.12)', color: '#b38e47', padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>
                                        {item.count}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '20px 0 0 0', lineHeight: '1.4' }}>
                                  * Bu kelimeler kullanıcıların arama çubuğuna doğrudan yazdığı arama sorgularını ifade eder.
                                </p>
                              </div>

                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}

                </div>
              )}

            </>
          )}

        </main>
      </div>

      {/* -------------------- MODAL: PROJEYE TEKLİF VERME -------------------- */}
      {biddingProject && (
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
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setBiddingProject(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px', color: '#0f172a' }}>
              B2B Toptan Fiyat Teklifi Sun
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
              <strong>{biddingProject.projectName}</strong> projesinin ihtiyacı olan <strong>{biddingProject.quantityM2.toLocaleString('tr-TR')} m²</strong> seramik için fabrika toptan fiyatınızı sunun.
            </p>

            <form onSubmit={handleB2bBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Önerdiğiniz Karo Modelimiz</label>
                <select
                  value={bidProduct}
                  onChange={(e) => setBidProduct(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">Seçiniz...</option>
                  {brandProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Kod: {p.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Teklif Birim Fiyatı (₺ / m²)</label>
                  <input 
                    type="number" 
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    required
                    min="1"
                    placeholder="M² fiyatı girin"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Teslimat Süresi</label>
                  <select
                    value={bidTimeline}
                    onChange={(e) => setBidTimeline(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
                  >
                    <option value="15 gün içinde">15 Gün içinde</option>
                    <option value="30 gün içinde">30 Gün içinde</option>
                    <option value="45 gün içinde">45 Gün içinde</option>
                    <option value="60 gün içinde">60 Gün içinde</option>
                  </select>
                </div>
              </div>

              {bidPrice && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#166534' }}>
                  Toplam Teklif Bedeli: <strong>₺{(parseFloat(bidPrice) * biddingProject.quantityM2).toLocaleString('tr-TR')}</strong> + KDV
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Teklif Notu / Sevkiyat Bilgisi</label>
                <textarea
                  value={bidNote}
                  onChange={(e) => setBidNote(e.target.value)}
                  placeholder="Ek notlar, lojistik teslim detayları veya nakliye koşullarınız..."
                  rows="3"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setBiddingProject(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)', color: '#000', fontWeight: '800', cursor: 'pointer' }}
                >
                  Teklifi Gönder
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: YENİ BAYİ TANIMLAMA -------------------- */}
      {showAddDealerModal && (
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
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowAddDealerModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Yeni Yetkili Bayi Tanımla
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
              Ürünlerinizi fiziki showroom'unda satan yetkili satıcınızı veri tabanına kaydedin.
            </p>

            {addDealerError && (
              <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '14px' }}>
                {addDealerError}
              </div>
            )}

            <form onSubmit={handleAddDealer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Bayi / Mağaza Adı</label>
                <input 
                  type="text" 
                  value={newDealerData.name} 
                  onChange={(e) => setNewDealerData({ ...newDealerData, name: e.target.value })}
                  placeholder="Örn: İstanbul Seramik Dünyası" 
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Telefon Numarası</label>
                  <input 
                    type="tel" 
                    value={newDealerData.phone} 
                    onChange={(e) => setNewDealerData({ ...newDealerData, phone: e.target.value })}
                    placeholder="Örn: 0216 123 45 67" 
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Şehir</label>
                  <input 
                    type="text" 
                    value={newDealerData.city} 
                    onChange={(e) => setNewDealerData({ ...newDealerData, city: e.target.value })}
                    placeholder="Örn: İstanbul" 
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>İlçe</label>
                  <input 
                    type="text" 
                    value={newDealerData.district} 
                    onChange={(e) => setNewDealerData({ ...newDealerData, district: e.target.value })}
                    placeholder="Örn: Kadıköy" 
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Adres</label>
                  <input 
                    type="text" 
                    value={newDealerData.address} 
                    onChange={(e) => setNewDealerData({ ...newDealerData, address: e.target.value })}
                    placeholder="Örn: Bağdat Cad. No:12" 
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Harita Enlem (Latitude)</label>
                  <input 
                    type="text" 
                    value={newDealerData.lat} 
                    onChange={(e) => setNewDealerData({ ...newDealerData, lat: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Harita Boylam (Longitude)</label>
                  <input 
                    type="text" 
                    value={newDealerData.lng} 
                    onChange={(e) => setNewDealerData({ ...newDealerData, lng: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddDealerModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={addDealerLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: '700', cursor: 'pointer', opacity: addDealerLoading ? 0.7 : 1 }}
                >
                  {addDealerLoading ? 'Ekleniyor...' : 'Bayiyi Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: LİSANS HAVALE BİLDİRİMİ -------------------- */}
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
            maxWidth: '500px',
            padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowPaymentModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Banka Havalesi Ödeme Bildirimi
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
              Seçtiğiniz <strong>{selectedPaymentPlan}</strong> paketini aktifleştirmek için lütfen aşağıdaki IBAN adresine transfer yapıp bildirim formunu doldurun.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>Banka:</strong> {bankDetails.bank_name}</div>
              <div><strong>Alıcı:</strong> {bankDetails.bank_recipient}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><strong>IBAN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{bankDetails.bank_iban}</span></div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bankDetails.bank_iban);
                    alert('IBAN panoya kopyalandı!');
                  }}
                  style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '600' }}
                >
                  Kopyala
                </button>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px', fontWeight: '700' }}>
                Ödenecek Tutar: <span style={{ color: '#059669', fontSize: '0.95rem' }}>{selectedPaymentPlan === 'PRO' ? '11.990' : '24.990'} TL</span>
              </div>
            </div>

            <form onSubmit={handleSendPaymentNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {paymentSuccess && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem' }}>{paymentSuccess}</div>}
              {paymentError && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem' }}>{paymentError}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Ödeme Yapan Ad Soyad</label>
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
                <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Ödeme Tarihi</label>
                <input 
                  type="date" 
                  value={paymentDate} 
                  onChange={(e) => setPaymentDate(e.target.value)} 
                  required
                  style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Dekont No / Ek Notlar</label>
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
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={paymentLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)', color: '#000', fontWeight: '800', cursor: 'pointer', opacity: paymentLoading ? 0.7 : 1 }}
                >
                  {paymentLoading ? 'İletiliyor...' : 'Bildirimi Gönder'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: REKLAM HAVALE BİLDİRİMİ -------------------- */}
      {showCampaignPaymentModal && (
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
            maxWidth: '500px',
            padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowCampaignPaymentModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
            >
              ×
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Vitrin Reklamı Ödeme Bilgileri
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
              Reklam yayın süresi: <strong>{campaignDuration === '7' ? '1 Hafta' : campaignDuration === '30' ? '1 Ay' : campaignDuration === '90' ? '3 Ay' : '6 Ay'}</strong>. Havalenizi tamamlayıp dekont işlem numarasını girin.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>Banka:</strong> {bankDetails.bank_name}</div>
              <div><strong>Alıcı:</strong> {bankDetails.bank_recipient}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><strong>IBAN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{bankDetails.bank_iban}</span></div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bankDetails.bank_iban);
                    alert('IBAN panoya kopyalandı!');
                  }}
                  style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '600' }}
                >
                  Kopyala
                </button>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px', fontWeight: '700' }}>
                Ödenecek Tutar: <span style={{ color: '#059669', fontSize: '0.95rem' }}>
                  {campaignDuration === '7' ? '500' : campaignDuration === '30' ? '1500' : campaignDuration === '90' ? '4000' : '7500'} TL
                </span>
              </div>
            </div>

            <form onSubmit={handleCampaignPaymentConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>Havale Dekont No / İşlem Kodu</label>
                <input 
                  type="text" 
                  value={campaignPaymentRef} 
                  onChange={(e) => setCampaignPaymentRef(e.target.value)} 
                  placeholder="İşlem veya Referans No" 
                  required
                  style={{ padding: '10px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setShowCampaignPaymentModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isStartingCampaign}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)', color: '#000', fontWeight: '800', cursor: 'pointer', opacity: isStartingCampaign ? 0.7 : 1 }}
                >
                  {isStartingCampaign ? 'Gönderiliyor...' : 'Ödemeyi Bildir'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(9, 13, 22, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          {[
            { id: 'dashboard', label: 'Panel', icon: <Activity size={20} /> },
            { id: 'products', label: 'Ürünler', icon: <Layers size={20} /> },
            { id: 'b2b-projects', label: 'B2B', icon: <Building2 size={20} /> },
            { id: 'dealers', label: 'Bayiler', icon: <Users size={20} /> },
            { id: 'more', label: 'Menü', icon: <Menu size={20} /> }
          ].map(tab => {
            const isActive = tab.id === 'more' ? showMobileMoreMenu : (activePortalTab === tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'more') {
                    setShowMobileMoreMenu(!showMobileMoreMenu);
                  } else {
                    handleMobileTabChange(tab.id);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#d4af37' : '#94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: isActive ? '700' : '500',
                  padding: '6px 12px',
                  transition: 'color 0.2s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile More Menu Drawer */}
      {isMobile && showMobileMoreMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'flex-end',
          flexDirection: 'column'
        }} onClick={() => setShowMobileMoreMenu(false)}>
          <div style={{
            background: '#111827',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            padding: '24px 20px 40px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: 0 }}>Tüm İşlemler</h3>
              <button 
                onClick={() => setShowMobileMoreMenu(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { id: 'dashboard', label: 'Gösterge Paneli', icon: <Activity size={18} /> },
                { id: 'products', label: 'Ürün Kataloğu', icon: <Layers size={18} /> },
                { id: 'b2b-projects', label: 'B2B Proje Talepleri', icon: <Building2 size={18} /> },
                { id: 'trends', label: 'Pazar Trendleri', icon: <TrendingUp size={18} /> },
                { id: 'dealers', label: 'Bayi Ağı Yönetimi', icon: <Users size={18} /> },
                { id: 'campaigns', label: 'Reklam Yönetimi', icon: <Megaphone size={18} /> },
                { id: 'saas', label: 'Lisans & Ödemeler', icon: <CreditCard size={18} /> }
              ].map(item => {
                const isActive = activePortalTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileTabChange(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      background: isActive ? 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)' : 'rgba(255, 255, 255, 0.03)',
                      border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      color: isActive ? '#090d16' : '#cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowMobileMoreMenu(false);
                  handleLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Güvenli Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Styles Override */}
      <style jsx>{`
        /* ===== MOBILE (max-width: 768px) ===== */
        @media (max-width: 768px) {
          .brand-campaign-grid,
          .campaign-inputs-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
