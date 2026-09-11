'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  Box, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  User, 
  Lock, 
  Compass, 
  Building2, 
  Package, 
  Tag, 
  Printer, 
  Copy, 
  CheckCheck, 
  Menu, 
  X, 
  Search, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Send,
  Calendar,
  Grid,
  Palette,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

const TURKEY_CITIES = [
  "Adana", "Ankara", "Antalya", "Aydın", "Balıkesir", "Bursa", "Çanakkale", "Denizli", 
  "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Kayseri", "Kocaeli", "Konya", 
  "Muğla", "Sakarya", "Samsun", "Tekirdağ", "Trabzon"
];

export default function ArchitectPortalPage() {
  // Session States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [architectInfo, setArchitectInfo] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regOfficeName, setRegOfficeName] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('İstanbul');
  const [regTitle, setRegTitle] = useState('Yüksek Mimar');
  const [regChamberNo, setRegChamberNo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Portal Layout States
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'vault', 'samples', 'spec-writer', 'quotes'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectType, setNewProjectType] = useState('Otel / Resort');
  const [newProjectCity, setNewProjectCity] = useState('Muğla / Bodrum');
  const [newProjectAreaM2, setNewProjectAreaM2] = useState('1500');
  const [newProjectNotes, setNewProjectNotes] = useState('');

  // Product Catalog Search & Add to Project
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showAddTileModal, setShowAddTileModal] = useState(false);
  const [selectedTargetProjectId, setSelectedTargetProjectId] = useState(null);
  const [addTileUsageArea, setAddTileUsageArea] = useState('Zemin Kaplama');
  const [addTileAreaM2, setAddTileAreaM2] = useState('150');

  // Spec-Writer State
  const [specLoading, setSpecLoading] = useState(false);
  const [specResult, setSpecResult] = useState(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  // Sample Box State
  const [samples, setSamples] = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleSelectedProducts, setSampleSelectedProducts] = useState([]);
  const [sampleAddress, setSampleAddress] = useState('');
  const [sampleCity, setSampleCity] = useState('İstanbul');
  const [sampleNotes, setSampleNotes] = useState('');
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [sampleSuccessMsg, setSampleSuccessMsg] = useState('');

  // Project Wholesale Tender Quote State
  const [tenderProjectName, setTenderProjectName] = useState('');
  const [tenderProjectType, setTenderProjectType] = useState('Lüks Konut / Rezidans');
  const [tenderCity, setTenderCity] = useState('İstanbul');
  const [tenderM2, setTenderM2] = useState('2500');
  const [tenderTargetDate, setTenderTargetDate] = useState('3 Ay İçinde');
  const [tenderNotes, setTenderNotes] = useState('');
  const [tenderLoading, setTenderLoading] = useState(false);
  const [tenderSuccessMsg, setTenderSuccessMsg] = useState('');

  // 3D & BIM Asset Vault State
  const [vaultSearch, setVaultSearch] = useState('');
  const [downloadSuccessModal, setDownloadSuccessModal] = useState(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Restore session from localStorage if exists
  useEffect(() => {
    const saved = localStorage.getItem('seramikbak_architect');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setArchitectInfo(parsed);
        setIsLoggedIn(true);
        fetchProjects(parsed.id);
        fetchSamples(parsed.id);
      } catch (e) {
        localStorage.removeItem('seramikbak_architect');
      }
    }
  }, []);

  // Initial load catalog products for search/vault
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async (query = '') => {
    setCatalogLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=48`);
      if (res.ok) {
        const data = await res.json();
        const prods = data.products || (Array.isArray(data) ? data : []);
        setCatalogProducts(prods);
      }
    } catch (err) {
      console.error('Catalog fetch error:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchProjects = async (archId) => {
    const id = archId || architectInfo?.id;
    if (!id) return;
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/architect/projects?architectId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0 && !activeProject) {
          setActiveProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchSamples = async (archId) => {
    const id = archId || architectInfo?.id;
    if (!id) return;
    setSamplesLoading(true);
    try {
      const res = await fetch(`/api/architect/samples?architectId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples || []);
      }
    } catch (err) {
      console.error('Fetch samples error:', err);
    } finally {
      setSamplesLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/architect/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArchitectInfo(data.architect);
        setIsLoggedIn(true);
        localStorage.setItem('seramikbak_architect', JSON.stringify(data.architect));
        fetchProjects(data.architect.id);
        fetchSamples(data.architect.id);
      } else {
        setAuthError(data.error || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setAuthError('Sunucu bağlantı hatası.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Demo Login handler
  const handleDemoLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/architect/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArchitectInfo(data.architect);
        setIsLoggedIn(true);
        localStorage.setItem('seramikbak_architect', JSON.stringify(data.architect));
        fetchProjects(data.architect.id);
        fetchSamples(data.architect.id);
      } else {
        setAuthError(data.error || 'Demo giriş açılamadı.');
      }
    } catch (err) {
      setAuthError('Sunucu bağlantı hatası.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/architect/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          officeName: regOfficeName,
          name: regName,
          email,
          phone: regPhone,
          password,
          city: regCity,
          title: regTitle,
          chamberNo: regChamberNo
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArchitectInfo(data.architect);
        setIsLoggedIn(true);
        localStorage.setItem('seramikbak_architect', JSON.stringify(data.architect));
        fetchProjects(data.architect.id);
      } else {
        setAuthError(data.error || 'Kayıt başarısız.');
      }
    } catch (err) {
      setAuthError('Sunucu bağlantı hatası.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setArchitectInfo(null);
    localStorage.removeItem('seramikbak_architect');
  };

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle) return;
    try {
      const res = await fetch('/api/architect/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_project',
          architectId: architectInfo.id,
          title: newProjectTitle,
          projectType: newProjectType,
          city: newProjectCity,
          totalAreaM2: newProjectAreaM2,
          notes: newProjectNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowNewProjectModal(false);
        setNewProjectTitle('');
        setNewProjectNotes('');
        await fetchProjects(architectInfo.id);
        setActiveProject(data.project);
      }
    } catch (err) {
      console.error('Create project failed:', err);
    }
  };

  // Add Item to Project
  const handleAddItemToProject = async (product) => {
    const targetProjId = selectedTargetProjectId || activeProject?.id;
    if (!targetProjId) return;

    try {
      const res = await fetch('/api/architect/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_item',
          projectId: targetProjId,
          productId: product.id,
          usageArea: addTileUsageArea,
          areaM2: addTileAreaM2
        })
      });
      if (res.ok) {
        setShowAddTileModal(false);
        await fetchProjects(architectInfo.id);
      }
    } catch (err) {
      console.error('Add item error:', err);
    }
  };

  // Remove Item from Project
  const handleRemoveItem = async (itemId) => {
    try {
      const res = await fetch('/api/architect/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_item', itemId })
      });
      if (res.ok) {
        await fetchProjects(architectInfo.id);
      }
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  // Generate Spec for active project
  const handleGenerateSpec = async (project) => {
    const target = project || activeProject;
    if (!target) return;
    setSpecLoading(true);
    setSpecResult(null);
    try {
      const res = await fetch('/api/architect/spec-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: target.id })
      });
      if (res.ok) {
        const data = await res.json();
        setSpecResult(data);
        setActiveTab('spec-writer');
      }
    } catch (err) {
      console.error('Spec generator error:', err);
    } finally {
      setSpecLoading(false);
    }
  };

  // Order Sample Box
  const handleOrderSampleBox = async (e) => {
    e.preventDefault();
    if (sampleSelectedProducts.length === 0 || !sampleAddress) return;
    setSampleSubmitting(true);
    try {
      const res = await fetch('/api/architect/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architectId: architectInfo.id,
          productIds: sampleSelectedProducts.map(p => p.id),
          officeAddress: sampleAddress,
          city: sampleCity,
          notes: sampleNotes,
          projectName: activeProject?.title || 'Mimari Proje'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSampleSuccessMsg(data.message);
        setSampleSelectedProducts([]);
        setShowSampleModal(false);
        fetchSamples(architectInfo.id);
        setTimeout(() => setSampleSuccessMsg(''), 6000);
      }
    } catch (err) {
      console.error('Order sample error:', err);
    } finally {
      setSampleSubmitting(false);
    }
  };

  // Download BIM / CAD / 4K Textures package (also triggers SpecInLead radar for brand!)
  const handleDownloadAsset = async (product, assetFormat) => {
    try {
      // Fire SpecInLead creation on the brand portal
      fetch('/api/bim/spec-in-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: product.brandId || product.brand?.id,
          productId: product.id,
          officeName: architectInfo.officeName,
          architectName: architectInfo.name,
          email: architectInfo.email,
          phone: architectInfo.phone,
          city: architectInfo.city,
          projectType: activeProject?.projectType || 'Mimari Tasarım',
          projectName: activeProject?.title || 'ArchStudio Projesi',
          fileType: assetFormat
        })
      }).catch(e => console.warn('BIM lead sync err:', e));

      setDownloadSuccessModal({
        product,
        assetFormat,
        fileName: `${product.code || 'SERAMIK'}_${assetFormat}.zip`
      });
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Submit Tender Quote
  const handleSubmitTender = async (e) => {
    e.preventDefault();
    setTenderLoading(true);
    try {
      const res = await fetch('/api/architect/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architectId: architectInfo.id,
          projectName: tenderProjectName,
          projectType: tenderProjectType,
          city: tenderCity,
          totalM2: tenderM2,
          targetCompletionDate: tenderTargetDate,
          notes: tenderNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTenderSuccessMsg(data.message);
        setTenderProjectName('');
        setTenderNotes('');
        setTimeout(() => setTenderSuccessMsg(''), 8000);
      }
    } catch (err) {
      console.error('Tender quote error:', err);
    } finally {
      setTenderLoading(false);
    }
  };

  // Copy Spec Text to Clipboard
  const handleCopySpec = () => {
    if (!specResult?.fullSpecDoc) return;
    navigator.clipboard.writeText(specResult.fullSpecDoc);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 3000);
  };

  // -------------------------------------------------------------
  // VIEW: AUTH SCREEN (If Not Logged In)
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #050811 100%)',
        color: '#f8fafc',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Architectural Grid Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          pointerEvents: 'none'
        }} />

        {/* Back Link */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Main Card */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.1)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              color: '#090d16',
              boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
              marginBottom: '16px'
            }}>
              <Compass size={28} />
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px'
            }}>
              SeramikBak <span style={{ color: '#d4af37' }}>ArchStudio</span>
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Mimarlık ofisleri, iç mimarlar ve proje liderleri için B2B şartname ve 3D varlık stüdyosu.
            </p>
          </div>

          {/* Quick Demo Login Hero Button */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} style={{ color: '#d4af37' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hızlı İnceleme
              </span>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={authLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#090d16',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              <span>Örnek Mimar Olarak Giriş Yap (Tabanlıoğlu Mimarlık)</span>
            </button>
            <span style={{ display: 'block', marginTop: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
              Tek tıkla hazır projeler, BIM dokuları ve şartname motorunu test edin.
            </span>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: authTab === 'login' ? '#d4af37' : 'transparent',
                color: authTab === 'login' ? '#090d16' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Mimar Girişi
            </button>
            <button
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: authTab === 'register' ? '#d4af37' : 'transparent',
                color: authTab === 'register' ? '#090d16' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Yeni Ofis Kaydı
            </button>
          </div>

          {authError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.82rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Kurumsal E-posta Adresi
                </label>
                <input
                  type="email"
                  required
                  placeholder="mimar@ofisiniz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Şifre
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                {authLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                <span>Giriş Yap</span>
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Mimarlık Ofisi / Şirket Unvanı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Tabanlıoğlu Mimarlık"
                  value={regOfficeName}
                  onChange={(e) => setRegOfficeName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Yetkili Mimar Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Unvan
                  </label>
                  <select
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Yüksek Mimar">Yüksek Mimar</option>
                    <option value="Mimar">Mimar</option>
                    <option value="İç Mimar">İç Mimar</option>
                    <option value="Tasarım Direktörü">Tasarım Direktörü</option>
                    <option value="Proje Yöneticisi">Proje Yöneticisi</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    E-posta *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ofis@mimar.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Şehir
                  </label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Mimarlar Odası Sicil (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="TMMOB Sicil No"
                    value={regChamberNo}
                    onChange={(e) => setRegChamberNo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Giriş Şifresi *
                </label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                {authLoading ? <Loader2 size={18} className="animate-spin" /> : <User size={18} />}
                <span>ArchStudio Hesabı Oluştur</span>
              </button>
            </form>
          )}

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#64748b' }}>
            Tüm 16 seramik markasının resmi şartname ve 3D BIM arşivi tek çatı altında.
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOGGED-IN ARCHSTUDIO DASHBOARD
  // -------------------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1d',
      color: '#f8fafc',
      fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflowX: 'hidden'
    }}>
      {/* 1. SOLID LEFT SIDEBAR */}
      {!isMobile && (
        <aside style={{
          width: isSidebarCollapsed ? '76px' : '280px',
          background: '#070b14',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          zIndex: 200,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              color: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.1rem',
              flexShrink: 0
            }}>
              <Compass size={22} />
            </div>
            {!isSidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {architectInfo?.officeName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '700' }}>
                    {architectInfo?.name}
                  </span>
                  <span style={{ fontSize: '0.62rem', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '1px 6px', borderRadius: '4px' }}>
                    PRO OFİS
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links (Scrollable) */}
          <nav style={{
            flex: 1,
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
          }}>
            {[
              { id: 'projects', label: 'Projelerim & Moodboard', icon: <Layers size={18} /> },
              { id: 'vault', label: '3D & BIM Varlık Kasası', icon: <Box size={18} /> },
              { id: 'spec-writer', label: 'Şartname Sihirbazı', icon: <FileText size={18} /> },
              { id: 'samples', label: 'Numune Kutum', icon: <Package size={18} /> },
              { id: 'quotes', label: 'Proje Fiyat & İskonto', icon: <Building2 size={18} /> }
            ].map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    color: isActive ? '#d4af37' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '700' : '500',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div style={{
            padding: '12px 10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0
          }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.78rem',
                borderRadius: '8px'
              }}
            >
              <ExternalLink size={15} />
              {!isSidebarCollapsed && <span>Siteye Göz At</span>}
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left'
              }}
            >
              <Menu size={16} />
              {!isSidebarCollapsed && <span>Menüyü Daralt</span>}
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '700',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              {!isSidebarCollapsed && <span>Çıkış Yap</span>}
            </button>
          </div>
        </aside>
      )}

      {/* 2. MAIN CONTENT WRAPPER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <header style={{
          background: 'rgba(10, 15, 29, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: isMobile ? '12px 16px' : '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '1.1rem' : '1.35rem',
              fontWeight: '800',
              margin: 0,
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {activeTab === 'projects' && '📐 Projelerim & Moodboard Çalışma Alanı'}
              {activeTab === 'vault' && '🧱 3D / BIM & Render Varlık Kasası (4K PBR)'}
              {activeTab === 'spec-writer' && '📄 TS EN 14411 Teknik Şartname Sihirbazı'}
              {activeTab === 'samples' && '📦 Ücretsiz Mimari Numune Kutusu'}
              {activeTab === 'quotes' && '💰 Proje İskontolu B2B Teklif Masası'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
              {architectInfo?.officeName} • {architectInfo?.city}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowNewProjectModal(true)}
              style={{
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#090d16',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>Yeni Proje Başlat</span>
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {sampleSuccessMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            padding: '12px 24px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={18} />
            <span>{sampleSuccessMsg}</span>
          </div>
        )}

        {tenderSuccessMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            padding: '12px 24px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={18} />
            <span>{tenderSuccessMsg}</span>
          </div>
        )}

        {/* Main Content Body */}
        <main style={{ padding: isMobile ? '16px 12px' : '32px', flex: 1 }}>

          {/* ======================================================== */}
          {/* TAB 1: PROJECTS & MOODBOARDS */}
          {/* ======================================================== */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Project selector bar */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Aktif Proje:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {projects.map(p => {
                      const isSel = activeProject?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setActiveProject(p)}
                          style={{
                            background: isSel ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSel ? '#d4af37' : '#cbd5e1',
                            border: isSel ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: isSel ? '700' : '500',
                            cursor: 'pointer'
                          }}
                        >
                          {p.title} ({p.items?.length || 0} Karo)
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeProject && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleGenerateSpec(activeProject)}
                      disabled={specLoading}
                      style={{
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {specLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                      <span>Şartname Metni Oluştur</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTargetProjectId(activeProject.id);
                        setShowAddTileModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                        color: '#090d16',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>Projeye Seramik Ekle</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Active Project Card / Moodboard Grid */}
              {activeProject ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '24px'
                }}>
                  {/* Project Info Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '18px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>
                        {activeProject.title}
                      </h2>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <span>📍 {activeProject.city}</span>
                        <span>🏢 {activeProject.projectType}</span>
                        <span>📐 {activeProject.totalAreaM2} m² Proje Alanı</span>
                        <span style={{ color: '#d4af37', fontWeight: '700' }}>
                          Durum: {activeProject.status === 'SPEC_IN' ? 'Şartname Aşaması' : 'Tasarım'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tile Grid (Items in Project) */}
                  {activeProject.items && activeProject.items.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '20px'
                    }}>
                      {activeProject.items.map((item) => {
                        const p = item.product;
                        return (
                          <div
                            key={item.id}
                            style={{
                              background: '#0e1526',
                              borderRadius: '16px',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            {/* Image Header with Usage Area Badge */}
                            <div style={{ position: 'relative', height: '180px', background: '#1e293b' }}>
                              <img
                                src={p.imageUrl || p.textureUrl || '/textures/calacatta_gold.jpg'}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                background: 'rgba(0, 0, 0, 0.75)',
                                backdropFilter: 'blur(8px)',
                                color: '#d4af37',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                              }}>
                                {item.usageArea} ({item.areaM2} m²)
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                title="Projeden Çıkar"
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: 'rgba(239, 68, 68, 0.85)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  width: '26px',
                                  height: '26px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Details Body */}
                            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {p.brand?.name || 'ÜRETİCİ MARKA'}
                                </span>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '2px 0 0 0', color: '#fff' }}>
                                  {p.name}
                                </h4>
                              </div>

                              {/* Specs Tags */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                                  {p.width}x{p.height} cm
                                </span>
                                <span style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                                  {p.finish || 'Mat'}
                                </span>
                                {p.slipResistance && (
                                  <span style={{ fontSize: '0.68rem', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                    {p.slipResistance}
                                  </span>
                                )}
                              </div>

                              {/* Actions Bar */}
                              <div style={{
                                marginTop: 'auto',
                                paddingTop: '12px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                gap: '8px'
                              }}>
                                <button
                                  onClick={() => handleDownloadAsset(p, 'REVIT_BIM')}
                                  style={{
                                    flex: 1,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: '#cbd5e1',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '6px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Box size={12} />
                                  <span>BIM (.rvt)</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSampleSelectedProducts([p]);
                                    setShowSampleModal(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    background: 'rgba(212, 175, 55, 0.12)',
                                    color: '#d4af37',
                                    border: '1px solid rgba(212, 175, 55, 0.25)',
                                    borderRadius: '8px',
                                    padding: '6px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Package size={12} />
                                  <span>Numune İste</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty Project State */
                    <div style={{
                      textAlign: 'center',
                      padding: '48px 24px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '16px',
                      border: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}>
                      <Compass size={36} style={{ color: '#d4af37', margin: '0 auto 12px auto' }} />
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 6px 0' }}>
                        Bu projede henüz seramik seçimi yok
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 18px 0' }}>
                        Katalogdan zemin, banyo duvarı veya cephe kaplaması için karo ekleyerek moodboard ve şartnameyi oluşturun.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedTargetProjectId(activeProject.id);
                          setShowAddTileModal(true);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                          color: '#090d16',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Katalogdan Karo Seç ve Ekle
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* No Projects at all */
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Layers size={48} style={{ color: '#64748b', margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Henüz Bir Proje Oluşturmadınız</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '400px', margin: '8px auto 20px auto' }}>
                    Ofisinizin tasarladığı otel, villa veya rezidans projelerini kaydederek seramik şartnamelerini tek tıkla üretin.
                  </p>
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#090d16',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    İlk Projeyi Başlat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: 3D & BIM ASSET VAULT (4K PBR TEXTURES) */}
          {/* ======================================================== */}
          {activeTab === 'vault' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>
                    Tüm Seramiklerin 3D & BIM Dosyaları
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Revit (.rvt), SketchUp (.skp), 3ds Max / Corona (.mat) ve 4K Seamless PBR haritaları.
                  </p>
                </div>

                <div style={{ position: 'relative', width: isMobile ? '100%' : '320px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Ürün adı, kod veya marka ara..."
                    value={vaultSearch}
                    onChange={(e) => {
                      setVaultSearch(e.target.value);
                      fetchCatalog(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Grid of Vault Assets */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '18px'
              }}>
                {catalogProducts.map(p => (
                  <div
                    key={p.id}
                    style={{
                      background: '#0d1322',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ position: 'relative', height: '160px', background: '#1e293b' }}>
                      <img
                        src={p.imageUrl || p.textureUrl || '/textures/calacatta_gold.jpg'}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#4ade80',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        4K Seamless
                      </span>
                    </div>

                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#d4af37', fontWeight: '700' }}>
                          {p.brand?.name || 'MARKA'}
                        </span>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '2px 0 0 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {p.width}x{p.height} cm • Kod: {p.code}
                        </span>
                      </div>

                      {/* Download Buttons */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        marginTop: 'auto',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        <button
                          onClick={() => handleDownloadAsset(p, 'REVIT_BIM')}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#cbd5e1',
                            borderRadius: '8px',
                            padding: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={11} />
                          <span>Revit .rvt</span>
                        </button>

                        <button
                          onClick={() => handleDownloadAsset(p, '4K_PBR_TEXTURES')}
                          style={{
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            color: '#d4af37',
                            borderRadius: '8px',
                            padding: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={11} />
                          <span>4K Doku (.zip)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SPEC-WRITER (TS EN 14411) */}
          {/* ======================================================== */}
          {activeTab === 'spec-writer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>
                    TS EN 14411 Teknik Şartname Sihirbazı
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                    İhale şartnameleri, müteahhit sözleşmeleri ve mahal listeleri için resmi formatta şartname metni.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCopySpec}
                    disabled={!specResult}
                    style={{
                      background: copiedSpec ? '#22c55e' : 'rgba(212, 175, 55, 0.15)',
                      color: copiedSpec ? '#fff' : '#d4af37',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {copiedSpec ? <CheckCheck size={16} /> : <Copy size={16} />}
                    <span>{copiedSpec ? 'Metin Kopyalandı ✓' : 'Metni Kopyala'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    disabled={!specResult}
                    style={{
                      background: '#1e293b',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Printer size={16} />
                    <span>Yazdır / PDF</span>
                  </button>
                </div>
              </div>

              {specResult ? (
                <div style={{
                  background: '#090d18',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)'
                }}>
                  <pre style={{
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0
                  }}>
                    {specResult.fullSpecDoc}
                  </pre>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <FileText size={40} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 6px 0' }}>
                    Henüz Şartname Oluşturulmadı
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
                    {activeProject ? `"${activeProject.title}" projesi için otomatik teknik şartname derleyin.` : 'Lütfen önce bir proje seçin.'}
                  </p>
                  {activeProject && (
                    <button
                      onClick={() => handleGenerateSpec(activeProject)}
                      disabled={specLoading}
                      style={{
                        background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                        color: '#090d16',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {specLoading ? 'Derleniyor...' : 'Şartnameyi Şimdi Üret'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: SAMPLE BOX ORDERS */}
          {/* ======================================================== */}
          {activeTab === 'samples' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>
                    Mimari Numune Kutularım
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Ofisinize ücretsiz kargolanan 15x15 cm kesit seramik numunelerinin durumunu takip edin.
                  </p>
                </div>

                <button
                  onClick={() => setShowSampleModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} />
                  <span>Yeni Numune Kutusu İste</span>
                </button>
              </div>

              {/* Sample list */}
              {samples.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {samples.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: '#0d1322',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: '#1e293b' }}>
                          <img
                            src={s.product?.imageUrl || '/textures/calacatta_gold.jpg'}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '700' }}>
                            {s.product?.brand?.name}
                          </span>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '2px 0 0 0', color: '#fff' }}>
                            {s.product?.name} (15x15 Kesit Numune)
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Teslimat: {s.officeAddress} ({s.city})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: s.status === 'PENDING' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: s.status === 'PENDING' ? '#eab308' : '#4ade80'
                        }}>
                          {s.status === 'PENDING' ? 'Fabrikadan Sevk Bekleniyor' : 'Kargoya Verildi'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Package size={40} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 6px 0' }}>
                    Henüz Numune Talebiniz Yok
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
                    Projeleriniz için istediğiniz seramikleri ücretsiz olarak ofisinize sipariş edebilirsiniz.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: B2B TENDER & PROJECT PRICING */}
          {/* ======================================================== */}
          {activeTab === 'quotes' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                background: '#0d1322',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                      Fabrikadan Doğrudan Proje İskontosu Talep Edin
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                      500 m² ve üzeri mimari projeleriniz için doğrudan üretici fabrikaların kurumsal satış birimlerinden özel teklif alın.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitTender} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                      Proje Adı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Bodrum Mandarin Luxury Villa Projesi"
                      value={tenderProjectName}
                      onChange={(e) => setTenderProjectName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#fff',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                        Yapı Tipi
                      </label>
                      <select
                        value={tenderProjectType}
                        onChange={(e) => setTenderProjectType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#fff',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="Otel / Resort">Otel / Resort</option>
                        <option value="Lüks Konut / Rezidans">Lüks Konut / Rezidans</option>
                        <option value="Ticari / Ofis / Plaza">Ticari / Ofis / Plaza</option>
                        <option value="Restoran / Kafe / Mağaza">Restoran / Kafe / Mağaza</option>
                        <option value="Sağlık / Hastane">Sağlık / Hastane</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                        Toplam Seramik Metrajı (m²) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="Örn: 3500"
                        value={tenderM2}
                        onChange={(e) => setTenderM2(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#fff',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                      Özel Şartlar ve Talepler
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Örn: Zeminlerde 120x240 Calacatta, ıslak hacimlerde R10 kaymazlık gerekmektedir. Şantiye teslim fiyatı talep ediyoruz."
                      value={tenderNotes}
                      onChange={(e) => setTenderNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: '#fff',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={tenderLoading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#090d16',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '8px'
                    }}
                  >
                    {tenderLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    <span>Üretici Fabrikalara Proje Teklifi Gönder</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* MODAL 1: CREATE NEW PROJECT */}
      {/* ----------------------------------------------------------- */}
      {showNewProjectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowNewProjectModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 16px 0', color: '#fff' }}>
              Yeni Mimari Proje Başlat
            </h3>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Proje Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Alaçatı Butik Otel"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Proje Tipi
                  </label>
                  <select
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Otel / Resort">Otel / Resort</option>
                    <option value="Konut / Daire">Konut / Daire</option>
                    <option value="Müstakil Villa">Müstakil Villa</option>
                    <option value="Ticari / Ofis">Ticari / Ofis</option>
                    <option value="Restoran / Kafe">Restoran / Kafe</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                    Lokasyon / Şehir
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: İzmir / Çeşme"
                    value={newProjectCity}
                    onChange={(e) => setNewProjectCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Toplam Kaplama Alanı (Tahmini m²)
                </label>
                <input
                  type="number"
                  placeholder="Örn: 800"
                  value={newProjectAreaM2}
                  onChange={(e) => setNewProjectAreaM2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Projeyi Oluştur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 2: ADD TILE FROM CATALOG TO PROJECT */}
      {/* ----------------------------------------------------------- */}
      {showAddTileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                  Projeye Seramik Seç & Ekle
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#d4af37' }}>
                  Hedef Proje: {activeProject?.title}
                </span>
              </div>
              <button
                onClick={() => setShowAddTileModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-bar inputs for usage area and areaM2 */}
            <div style={{
              padding: '14px 20px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>Uygulama Alanı</label>
                <select
                  value={addTileUsageArea}
                  onChange={(e) => setAddTileUsageArea(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="Zemin Kaplama">Zemin Kaplama</option>
                  <option value="Banyo Duvarı">Banyo Duvarı</option>
                  <option value="Mutfak Tezgahı / Alın">Mutfak Tezgahı / Alın</option>
                  <option value="Dış Cephe">Dış Cephe</option>
                  <option value="Teras / Havuz Kenarı">Teras / Havuz Kenarı</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>Metraj (m²)</label>
                <input
                  type="number"
                  value={addTileAreaM2}
                  onChange={(e) => setAddTileAreaM2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>Karo Ara</label>
                <input
                  type="text"
                  placeholder="Ara..."
                  value={catalogSearch}
                  onChange={(e) => {
                    setCatalogSearch(e.target.value);
                    fetchCatalog(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            </div>

            {/* Products List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '14px'
            }}>
              {catalogProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAddItemToProject(p)}
                  style={{
                    background: '#131c2f',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ height: '110px', background: '#1e293b' }}>
                    <img
                      src={p.imageUrl || '/textures/calacatta_gold.jpg'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '10px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#d4af37', fontWeight: '700' }}>
                      {p.brand?.name}
                    </span>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: '700', margin: '2px 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </h5>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {p.width}x{p.height} cm • {p.finish}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 3: REQUEST SAMPLE BOX */}
      {/* ----------------------------------------------------------- */}
      {showSampleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowSampleModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>
              Ücretsiz Mimari Numune Kutusu İste
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 18px 0' }}>
              Seçilen karolardan 15x15 cm kesit numune kutusu doğrudan ofisinize gönderilir.
            </p>

            <form onSubmit={handleOrderSampleBox} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Numune İstenecek Karo:
                </label>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.85rem',
                  color: '#d4af37',
                  fontWeight: '700'
                }}>
                  {sampleSelectedProducts.length > 0 
                    ? sampleSelectedProducts.map(p => p.name).join(', ') 
                    : (activeProject?.items?.[0]?.product?.name || 'Projedeki İlk Karo')}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Ofis Teslimat Adresi *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ofisinizin kargo adresi..."
                  value={sampleAddress}
                  onChange={(e) => setSampleAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>
                  Şehir *
                </label>
                <select
                  value={sampleCity}
                  onChange={(e) => setSampleCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                >
                  {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={sampleSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                {sampleSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Numune Kutusunu Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 4: ASSET DOWNLOAD SUCCESS NOTICE */}
      {/* ----------------------------------------------------------- */}
      {downloadSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0d1322',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>
              3D Varlık Paketi Hazırlandı
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
              <strong>{downloadSuccessModal.product?.name}</strong> için {downloadSuccessModal.assetFormat} paketi derlendi.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '0.78rem',
              color: '#cbd5e1'
            }}>
              İlgili seramik fabrikasına ({downloadSuccessModal.product?.brand?.name || 'Üretici'}) şartname ve indirme kaydınız (Spec-In Lead) iletildi.
            </div>

            <button
              onClick={() => setDownloadSuccessModal(null)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#090d16',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
