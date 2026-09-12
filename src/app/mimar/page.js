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
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Send,
  Calendar,
  Grid,
  Palette,
  Maximize2,
  Calculator,
  Share2,
  Award,
  Sliders
} from 'lucide-react';
import Link from 'next/link';
import { matchCSBPoz, CSB_POZ_LIST } from '@/lib/csbPozMatcher';

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
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('');
  const [showAddTileModal, setShowAddTileModal] = useState(false);
  const [selectedTargetProjectId, setSelectedTargetProjectId] = useState(null);
  const [addTileUsageArea, setAddTileUsageArea] = useState('Zemin Kaplama');
  const [addTileAreaM2, setAddTileAreaM2] = useState('150');
  const brandScrollRef = useRef(null);

  const scrollBrands = (direction) => {
    if (brandScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      brandScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Spec-Writer State
  const [specLoading, setSpecLoading] = useState(false);
  const [specResult, setSpecResult] = useState(null);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [specViewMode, setSpecViewMode] = useState('document'); // 'document' | 'raw'

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
  const [pbrProductModal, setPbrProductModal] = useState(null);

  // Client Presentation Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Smart Quantity & Material BOQ Calculator State
  const [calcArea, setCalcArea] = useState('120');
  const [calcPattern, setCalcPattern] = useState('straight'); // straight (%7), diagonal (%10), herringbone (%12)
  const [calcTilePreset, setCalcTilePreset] = useState('60x120');
  const [calcJointMm, setCalcJointMm] = useState('2');
  const [calcIncludeSkirting, setCalcIncludeSkirting] = useState(true);
  const [calcIsWetArea, setCalcIsWetArea] = useState(false);
  const [calcCopiedBreakdown, setCalcCopiedBreakdown] = useState(false);

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

  // Initial load catalog products and brands for search/vault
  useEffect(() => {
    fetchBrands();
    fetchCatalog();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        setCatalogBrands(data || []);
      }
    } catch (err) {
      console.error('Brands fetch error:', err);
    }
  };

  const fetchCatalog = async (query = '', brandId = selectedBrandFilter, style = selectedStyleFilter) => {
    setCatalogLoading(true);
    try {
      let url = `/api/search?limit=60`;
      if (query && query.trim() !== '') url += `&q=${encodeURIComponent(query.trim())}`;
      if (brandId) url += `&brandId=${encodeURIComponent(brandId)}`;
      if (style) url += `&style=${encodeURIComponent(style)}`;
      
      const res = await fetch(url);
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

  const fetchProjects = async (archId, preferredActiveProjectId = null) => {
    const id = archId || architectInfo?.id;
    if (!id) return;
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/architect/projects?architectId=${id}`);
      if (res.ok) {
        const data = await res.json();
        const projectList = data.projects || [];
        setProjects(projectList);
        
        // Keep currently active project synchronized with fresh items
        const currentActiveId = preferredActiveProjectId || activeProject?.id;
        if (currentActiveId) {
          const updatedActive = projectList.find(p => p.id === currentActiveId);
          if (updatedActive) {
            setActiveProject(updatedActive);
          } else if (projectList.length > 0) {
            setActiveProject(projectList[0]);
          }
        } else if (projectList.length > 0) {
          setActiveProject(projectList[0]);
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

  // Register handler (Pending admin approval)
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
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
        if (data.pendingApproval) {
          setAuthSuccess(data.message || 'Mimarlık ofisi başvurunuz alındı. Sistem yöneticisi onayının ardından giriş yapabilirsiniz.');
          setAuthTab('login');
          setPassword('');
        } else {
          setArchitectInfo(data.architect);
          setIsLoggedIn(true);
          localStorage.setItem('seramikbak_architect', JSON.stringify(data.architect));
          fetchProjects(data.architect.id);
        }
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

  // Add Item to Project (Instant UI update + Server Sync)
  const handleAddItemToProject = async (product) => {
    const targetProjId = selectedTargetProjectId || activeProject?.id;
    if (!targetProjId) return;

    // Temporary item for instantaneous UI feedback
    const tempItemId = 'temp_' + Date.now();
    const newItem = {
      id: tempItemId,
      projectId: targetProjId,
      productId: product.id,
      usageArea: addTileUsageArea,
      areaM2: parseFloat(addTileAreaM2) || 100,
      createdAt: new Date().toISOString(),
      product: {
        ...product,
        brand: product.brand || { name: 'Üretici Marka' }
      }
    };

    // 1. Instant Optimistic State Update
    setActiveProject(prev => {
      if (!prev || prev.id !== targetProjId) return prev;
      return {
        ...prev,
        items: [newItem, ...(prev.items || [])]
      };
    });

    setProjects(prevList => {
      return prevList.map(proj => {
        if (proj.id !== targetProjId) return proj;
        return {
          ...proj,
          items: [newItem, ...(proj.items || [])]
        };
      });
    });

    setShowAddTileModal(false);

    // 2. Server Request
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
      const data = await res.json();
      if (res.ok && data.success) {
        // Replace temp item with real DB item
        const realItem = data.item;
        setActiveProject(prev => {
          if (!prev || prev.id !== targetProjId) return prev;
          return {
            ...prev,
            items: (prev.items || []).map(it => it.id === tempItemId ? realItem : it)
          };
        });
        setProjects(prevList => {
          return prevList.map(proj => {
            if (proj.id !== targetProjId) return proj;
            return {
              ...proj,
              items: (proj.items || []).map(it => it.id === tempItemId ? realItem : it)
            };
          });
        });
      } else {
        // Rollback on error
        await fetchProjects(architectInfo?.id, targetProjId);
      }
    } catch (err) {
      console.error('Add item error:', err);
      await fetchProjects(architectInfo?.id, targetProjId);
    }
  };

  // Remove Item from Project (Instant UI update + Server Sync)
  const handleRemoveItem = async (itemId) => {
    if (!itemId) return;

    // 1. Instant Optimistic State Update
    setActiveProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: (prev.items || []).filter(it => it.id !== itemId)
      };
    });

    setProjects(prevList => {
      return prevList.map(proj => {
        return {
          ...proj,
          items: (proj.items || []).filter(it => it.id !== itemId)
        };
      });
    });

    // 2. Server Request
    try {
      const res = await fetch('/api/architect/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_item', itemId })
      });
      if (!res.ok) {
        // Rollback on failure
        await fetchProjects(architectInfo?.id);
      }
    } catch (err) {
      console.error('Remove item error:', err);
      await fetchProjects(architectInfo?.id);
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
        body: JSON.stringify({ 
          projectId: target.id,
          projectMeta: {
            title: target.title,
            city: target.city,
            projectType: target.projectType,
            officeName: architectInfo?.officeName,
            name: architectInfo?.name
          }
        })
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

  // Open product directly in 3D Kiosk Visualizer Studio
  const handleOpenIn3DKiosk = (product) => {
    if (!product) return;
    try {
      const selectedObj = {
        ...product,
        textureUrl: product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg',
        imageUrl: product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg',
        unitPrice: product.unitPrice || 480
      };
      sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
      localStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
    } catch (e) {
      console.error('Kiosk storage error:', e);
    }
    const url = `/kiosk?productId=${encodeURIComponent(product.id)}&code=${encodeURIComponent(product.code || '')}`;
    window.open(url, '_blank');
  };

  // Download BIM / CAD / 4K Textures package (also triggers SpecInLead radar for brand!)
  const handleDownloadAsset = async (product, assetFormat) => {
    try {
      // 1. Notify Brand SpecInLead radar
      fetch('/api/bim/spec-in-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: product.brandId || product.brand?.id,
          productId: product.id,
          officeName: architectInfo?.officeName || 'Mimarlık Ofisi',
          architectName: architectInfo?.name || 'Mimar',
          email: architectInfo?.email || '',
          phone: architectInfo?.phone || '',
          city: architectInfo?.city || 'İstanbul',
          projectType: activeProject?.projectType || 'Mimari Tasarım',
          projectName: activeProject?.title || 'ArchStudio Projesi',
          fileType: assetFormat
        })
      }).catch(e => console.warn('BIM lead sync err:', e));

      // 2. Trigger real browser file download
      const downloadUrl = `/api/architect/download-asset?productId=${product.id}&format=${encodeURIComponent(assetFormat)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 3. Show confirmation modal
      setDownloadSuccessModal({
        product,
        assetFormat,
        fileName: `${product.code || 'SERAMIK'}_${assetFormat}`
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
        background: 'linear-gradient(135deg, #070b14 0%, #0d1527 50%, #0a0f1d 100%)',
        color: '#f8fafc',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px 12px 32px 12px' : '24px 16px',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {/* Subtle Architectural Grid Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        {/* Back Link */}
        <div style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 10
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Main Card */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(13, 21, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          borderRadius: isMobile ? '20px' : '24px',
          padding: isMobile ? '24px 18px' : '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.06)',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              color: '#090d16',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
              marginBottom: '14px'
            }}>
              <Compass size={26} />
            </div>
            <h1 style={{
              fontSize: isMobile ? '1.45rem' : '1.75rem',
              fontWeight: '800',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              color: '#fff'
            }}>
              SeramikBak <span style={{ color: '#d4af37' }}>ArchStudio</span>
            </h1>
            <p style={{ fontSize: isMobile ? '0.8rem' : '0.86rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Mimarlık ofisleri ve tasarımcılar için B2B şartname, numune ve 3D BIM stüdyosu.
            </p>
          </div>

          {/* Quick Demo Login Hero Button */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.07)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '14px',
            padding: '14px 12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={14} style={{ color: '#d4af37' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Hızlı Demo İnceleme
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
                borderRadius: '10px',
                padding: '12px 14px',
                fontWeight: '800',
                fontSize: isMobile ? '0.82rem' : '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                lineHeight: 1.3,
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.2)',
                boxSizing: 'border-box'
              }}
            >
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>Örnek Mimar Olarak Giriş Yap</span>
            </button>
            <span style={{ display: 'block', marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
              Tabanlıoğlu Mimarlık demo oturumuyla tüm modülleri hemen test edin.
            </span>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <button
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              style={{
                padding: '9px',
                border: 'none',
                borderRadius: '8px',
                background: authTab === 'login' ? '#d4af37' : 'transparent',
                color: authTab === 'login' ? '#090d16' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Mimar Girişi
            </button>
            <button
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
              style={{
                padding: '9px',
                border: 'none',
                borderRadius: '8px',
                background: authTab === 'register' ? '#d4af37' : 'transparent',
                color: authTab === 'register' ? '#090d16' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Yeni Ofis Kaydı
            </button>
          </div>

          {authSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.82rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.45
            }}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#6ee7b7', marginBottom: '2px' }}>Başvurunuz Alındı</strong>
                <span>{authSuccess}</span>
              </div>
            </div>
          )}

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
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  KURUMSAL E-POSTA ADRESİ
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="mimar@ofisiniz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ŞİFRE
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)'
                }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                <span>ArchStudio'ya Giriş Yap</span>
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                  MİMARLIK OFİSİ / ŞİRKET UNVANI *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Tabanlıoğlu Mimarlık"
                    value={regOfficeName}
                    onChange={(e) => setRegOfficeName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Building2 size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                    YETKİLİ MİMAR ADI *
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
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                    UNVAN
                  </label>
                  <select
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: '0.82rem',
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                    E-POSTA *
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
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                    TELEFON *
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
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                    ŞEHİR
                  </label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                    ODA SİCİL (OPSİYONEL)
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
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px', textTransform: 'uppercase' }}>
                  ŞİFRE *
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
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.82rem',
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
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)'
                }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
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
    <div 
      className="mimar-dashboard-root"
      style={{
        minHeight: '100vh',
        background: '#0a0f1d',
        color: '#f8fafc',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        overflowX: 'hidden'
      }}
    >
      {/* 1. SOLID LEFT SIDEBAR */}
      {!isMobile && (
        <aside 
          className="mimar-sidebar no-print"
          style={{
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
              { id: 'calculator', label: 'Akıllı Metraj & Sarf Malzeme', icon: <Calculator size={18} /> },
              { id: 'vault', label: '3D, BIM & PBR Malzeme', icon: <Box size={18} /> },
              { id: 'spec-writer', label: 'Şartname & ÇŞB Poz Sihirbazı', icon: <FileText size={18} /> },
              { id: 'samples', label: 'Numune Kutum', icon: <Package size={18} /> },
              { id: 'quotes', label: 'Proje Koruma & Teşvik', icon: <Building2 size={18} /> }
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
      <div className="mimar-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <header className="mimar-header no-print" style={{
          background: 'rgba(10, 15, 29, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: isMobile ? '12px 16px' : '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Compass size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '800', margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                    {architectInfo?.officeName}
                  </h4>
                  <span style={{ fontSize: '0.65rem', color: '#d4af37', fontWeight: '700' }}>
                    {activeTab === 'projects' && 'Projeler & Moodboard'}
                    {activeTab === 'calculator' && 'Akıllı Metraj & Sarf'}
                    {activeTab === 'vault' && '3D & BIM Varlıklar'}
                    {activeTab === 'spec-writer' && 'Şartname & ÇŞB Poz'}
                    {activeTab === 'samples' && 'Numune Kutum'}
                    {activeTab === 'quotes' && 'Proje Koruma & Teşvik'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  <span>Proje</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 style={{
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  margin: 0,
                  fontFamily: 'var(--font-title, "Outfit", sans-serif)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {activeTab === 'projects' && '📐 Projelerim & Moodboard Çalışma Alanı'}
                  {activeTab === 'calculator' && '🧮 Akıllı Metraj, Fire & Sarf Malzeme Hesaplayıcı'}
                  {activeTab === 'vault' && '🧱 3D / BIM & Render Varlık Kasası (4K PBR)'}
                  {activeTab === 'spec-writer' && '📄 TS EN 14411 Şartname & ÇŞB Poz Sihirbazı'}
                  {activeTab === 'samples' && '📦 Ücretsiz Mimari Numune Kutusu'}
                  {activeTab === 'quotes' && '🔒 Proje Koruma (Spec-Lock) & Teşvik Masası'}
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
            </>
          )}
        </header>

        {/* Global Notifications */}
        {sampleSuccessMsg && (
          <div className="no-print" style={{
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
          <div className="no-print" style={{
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
        <main className="mimar-main" style={{ padding: isMobile ? '16px 12px 80px 12px' : '32px', flex: 1, boxSizing: 'border-box' }}>

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
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setShowShareModal(true)}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        color: '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="İşverene onaylatmak için logosuz, beyaz etiketli sunum linki üretir"
                    >
                      <Share2 size={14} />
                      <span>Müşteri Sunum Linki</span>
                    </button>

                    <button
                      onClick={() => {
                        setCalcArea(activeProject.totalAreaM2 ? String(activeProject.totalAreaM2) : '150');
                        setActiveTab('calculator');
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
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
                      <Calculator size={14} />
                      <span>Metraj & Sarfiyat</span>
                    </button>

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
                      <span>Şartname Metni</span>
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
                      <span>Seramik Ekle</span>
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
                      {activeProject.items.map(item => {
                        const p = item.product;
                        const csb = matchCSBPoz(p, item.usageArea);
                        const isApproved = item.notes?.includes('[ONAYLANDI');
                        const hasRevision = item.notes?.includes('[REVİZYON');

                        return (
                          <div
                            key={item.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: isApproved ? '1.5px solid #22c55e' : (hasRevision ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)'),
                              borderRadius: '16px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}
                          >
                            {/* Tile Image & Badges */}
                            <div style={{ height: '170px', position: 'relative', background: '#090d18' }}>
                              <img
                                src={p.imageUrl}
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

                              {isApproved && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '10px',
                                  background: 'rgba(34, 197, 94, 0.95)',
                                  color: '#fff',
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <CheckCircle size={12} />
                                  <span>İşveren Onayladı</span>
                                </div>
                              )}

                              {hasRevision && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '10px',
                                  background: 'rgba(245, 158, 11, 0.95)',
                                  color: '#090d16',
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <AlertCircle size={12} />
                                  <span>Revizyon İletildi</span>
                                </div>
                              )}

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

                              {/* Specs Tags & Official CSB Poz */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                                  {p.width}x{p.height} cm
                                </span>
                                <span style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                                  {p.finish || 'Mat'}
                                </span>
                                <span style={{ fontSize: '0.68rem', background: 'rgba(180, 83, 9, 0.2)', color: '#fbbf24', border: '1px solid rgba(180, 83, 9, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }} title={csb.title}>
                                  🏛️ ÇŞB: {csb.pozNo}
                                </span>
                              </div>

                              {/* Item Notes */}
                              {item.notes && (
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(0,0,0,0.25)', padding: '6px 8px', borderRadius: '4px', lineHeight: 1.35 }}>
                                  {item.notes}
                                </div>
                              )}

                              {/* Actions Bar */}
                              <div style={{
                                marginTop: 'auto',
                                paddingTop: '12px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                gap: '6px'
                              }}>
                                <button
                                  onClick={() => handleOpenIn3DKiosk(p)}
                                  title="3D Kiosk'ta Canlı Odaya Uygula"
                                  style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)',
                                    color: '#d4af37',
                                    border: '1px solid rgba(212, 175, 55, 0.4)',
                                    borderRadius: '8px',
                                    padding: '6px 6px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Box size={12} />
                                  <span>3D Gör</span>
                                </button>

                                <button
                                  onClick={() => setPbrProductModal(p)}
                                  title="PBR Doku Haritaları ve Render Ayarları"
                                  style={{
                                    flex: 1,
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    color: '#c084fc',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: '8px',
                                    padding: '6px 6px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Sliders size={12} />
                                  <span>PBR Doku</span>
                                </button>

                                <button
                                  onClick={() => handleDownloadAsset(p, 'REVIT_BIM')}
                                  style={{
                                    flex: 1,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: '#cbd5e1',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '6px 6px',
                                    fontSize: '0.7rem',
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
                                    padding: '6px 6px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Package size={12} />
                                  <span>Numune</span>
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
          {/* TAB: SMART QUANTITY & MATERIAL CALCULATOR (BOQ) */}
          {/* ======================================================== */}
          {activeTab === 'calculator' && (() => {
            const netAreaVal = Math.max(1, parseFloat(calcArea) || 0);
            const wasteRate = calcPattern === 'straight' ? 0.07 : (calcPattern === 'diagonal' ? 0.10 : 0.12);
            const wasteM2 = Math.round(netAreaVal * wasteRate * 10) / 10;
            const grossAreaVal = Math.round((netAreaVal + wasteM2) * 10) / 10;

            let boxM2 = 1.44;
            let tileW = 60, tileH = 120, tileThickMm = 9;
            if (calcTilePreset === '60x60') { boxM2 = 1.44; tileW = 60; tileH = 60; }
            else if (calcTilePreset === '30x60') { boxM2 = 1.44; tileW = 30; tileH = 60; }
            else if (calcTilePreset === '80x80') { boxM2 = 1.28; tileW = 80; tileH = 80; }
            else if (calcTilePreset === '120x280') { boxM2 = 3.36; tileW = 120; tileH = 280; tileThickMm = 6; }

            const boxCount = Math.ceil(grossAreaVal / boxM2);
            const palletCount = Math.ceil(boxCount / 32);

            const adhesiveRateKg = (tileW >= 60 && tileH >= 60) ? 5.2 : 4.5;
            const totalAdhesiveKg = Math.round(grossAreaVal * adhesiveRateKg);
            const adhesiveBags = Math.ceil(totalAdhesiveKg / 25);

            const jointMmVal = parseFloat(calcJointMm) || 2;
            const groutKgPerM2 = ((tileW * 10 + tileH * 10) / ((tileW * 10) * (tileH * 10))) * tileThickMm * jointMmVal * 1.6;
            const totalGroutKg = Math.max(2, Math.round(grossAreaVal * groutKgPerM2 * 10) / 10);
            const groutBags5Kg = Math.ceil(totalGroutKg / 5);

            const skirtingMeters = calcIncludeSkirting ? Math.round(Math.sqrt(netAreaVal) * 4 * 0.85) : 0;
            const skirtingPieces = Math.ceil(skirtingMeters / (tileH / 100));

            const waterproofingKg = calcIsWetArea ? Math.round(netAreaVal * 2.5) : 0;

            const handleCopyBOQ = () => {
              const text = `
MİMARİ METRAJ & SARF MALZEME RAPORU (BOQ)
Standart: TS EN 14411 / TS EN 12004 C2TE S1 / TS EN 13888 CG2WA
--------------------------------------------------------------------------------
1. SERAMİK / PORSELEN KARO:
- Net Alan: ${netAreaVal} m²
- Döşeme Deseni: ${calcPattern === 'straight' ? 'Düz Döşeme (%7 Fire)' : (calcPattern === 'diagonal' ? '45° Diyagonal Döşeme (%10 Fire)' : 'Balıksırtı / Modüler (%12 Fire)')}
- Fire Miktarı: ${wasteM2} m²
- Brüt Sipariş Metrajı: ${grossAreaVal} m²
- Seçilen Ebat: ${calcTilePreset} cm (${boxM2} m²/kutu)
- Kutu (Paket) Adedi: ${boxCount} Kutu
- Tahmini Palet Sayısı: ${palletCount} Palet (32 kutu/palet)

2. YAPIŞTIRICI SARFİYATI (TS EN 12004 C2TE S1 FLEX):
- Toplam Harç: ~${totalAdhesiveKg} kg
- 25 kg Kraft Torba İhtiyacı: ${adhesiveBags} Torba

3. DERZ DOLGUSU (TS EN 13888 CG2WA):
- Derz Genişliği: ${jointMmVal} mm
- Toplam Derz Dolgusu: ~${totalGroutKg} kg
- 5 kg Paket İhtiyacı: ${groutBags5Kg} Paket

4. EK MALZEMELER:
- Süpürgelik: ${calcIncludeSkirting ? `${skirtingMeters} tül metre (~${skirtingPieces} adet)` : 'Dahil Değil'}
- Su Yalıtımı (TS EN 14891 Çift Kat Membran): ${calcIsWetArea ? `${waterproofingKg} kg (${Math.ceil(waterproofingKg / 20)} set)` : 'Dahil Değil'}
--------------------------------------------------------------------------------
Düzenleyen: ${architectInfo?.officeName || 'Mimari Proje Ofisi'}
Tarih: ${new Date().toLocaleDateString('tr-TR')}
`.trim();

              navigator.clipboard.writeText(text);
              setCalcCopiedBreakdown(true);
              setTimeout(() => setCalcCopiedBreakdown(false), 2500);
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header Banner */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', marginBottom: '8px' }}>
                      <Calculator size={13} />
                      MİMARİ METRAJ & BOQ MOTORU
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                      Akıllı Metraj, Kesim Firesi & Sarf Malzeme Hesaplayıcı
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                      Mekan net alanını girin; döşeme modeline göre fire oranını, paket/palet sayısını, C2TE S1 yapıştırıcı ve CG2WA derz dolgu sarfiyatını saniyeler içinde çıkarın.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleCopyBOQ}
                      style={{
                        background: calcCopiedBreakdown ? '#22c55e' : 'rgba(212, 175, 55, 0.15)',
                        color: calcCopiedBreakdown ? '#fff' : '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {calcCopiedBreakdown ? <CheckCheck size={16} /> : <Copy size={16} />}
                      <span>{calcCopiedBreakdown ? 'Metraj Kopyalandı ✓' : 'Metraj Raporunu Kopyala'}</span>
                    </button>
                  </div>
                </div>

                {/* Calculator Grid: Inputs on Left, Output BOQ on Right */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
                  gap: '24px'
                }}>
                  {/* Left: Input Form */}
                  <div style={{
                    background: '#0d1322',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
                      1. Mekan & Uygulama Parametreleri
                    </h4>

                    {/* Quick project loader if active project exists */}
                    {activeProject && (
                      <div style={{
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                          Aktif Proje: <strong>{activeProject.title}</strong> ({activeProject.totalAreaM2 || 150} m²)
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalcArea(String(activeProject.totalAreaM2 || 150))}
                          style={{
                            background: '#d4af37',
                            color: '#090d16',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          Verileri Aktar
                        </button>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                        NET KAPLAMA ALANI (M²) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={calcArea}
                        onChange={(e) => setCalcArea(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: '800',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Laying Pattern & Waste Ratio */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
                        DÖŞEME MODELİ & KESİM FİRESİ
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                          { id: 'straight', label: 'Düz Döşeme', waste: '+ %7 Fire' },
                          { id: 'diagonal', label: '45° Diyagonal', waste: '+ %10 Fire' },
                          { id: 'herringbone', label: 'Balıksırtı', waste: '+ %12 Fire' }
                        ].map(p => {
                          const isSel = calcPattern === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setCalcPattern(p.id)}
                              style={{
                                background: isSel ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                border: isSel ? '1.5px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: isSel ? '#d4af37' : '#cbd5e1',
                                borderRadius: '10px',
                                padding: '10px 8px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{p.label}</div>
                              <div style={{ fontSize: '0.7rem', color: isSel ? '#fbbf24' : '#64748b', marginTop: '2px' }}>{p.waste}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tile Preset */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
                        SERAMİK / PORSELEN KARO EBADI
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                        {['60x120', '60x60', '30x60', '80x80', '120x280'].map(sz => {
                          const isSel = calcTilePreset === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setCalcTilePreset(sz)}
                              style={{
                                background: isSel ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                border: isSel ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: isSel ? '#38bdf8' : '#cbd5e1',
                                borderRadius: '8px',
                                padding: '8px 6px',
                                fontSize: '0.8rem',
                                fontWeight: isSel ? '800' : '600',
                                cursor: 'pointer'
                              }}
                            >
                              {sz} cm
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Joint Width */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
                        DERZ ARTI DERİNLİĞİ / GENİŞLİĞİ
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {[
                          { val: '1.5', label: '1.5 mm (Lazer Rektifiye)' },
                          { val: '2', label: '2.0 mm (Standart)' },
                          { val: '3', label: '3.0 mm (Dış Mekan)' }
                        ].map(j => (
                          <button
                            key={j.val}
                            type="button"
                            onClick={() => setCalcJointMm(j.val)}
                            style={{
                              flex: 1,
                              background: calcJointMm === j.val ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                              border: calcJointMm === j.val ? '1.5px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                              color: calcJointMm === j.val ? '#d4af37' : '#cbd5e1',
                              borderRadius: '8px',
                              padding: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {j.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggles: Skirting & Waterproofing */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <input
                          type="checkbox"
                          checked={calcIncludeSkirting}
                          onChange={(e) => setCalcIncludeSkirting(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
                        />
                        <span>Porselen Süpürgelik İhtiyacını Otomatik Hesapla (Oda Çevre Tahmini)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <input
                          type="checkbox"
                          checked={calcIsWetArea}
                          onChange={(e) => setCalcIsWetArea(e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
                        />
                        <span>Islak Hacim / Banyo (Çift Kat TS EN 14891 Su Yalıtım Membranı Dahil)</span>
                      </label>
                    </div>
                  </div>

                  {/* Right: Output BOQ Breakdown Table */}
                  <div style={{
                    background: '#0d1322',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                        2. Resmi Malzeme & Sarfiyat Listesi (BOQ)
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '700' }}>
                        TS EN Uyumlu
                      </span>
                    </div>

                    {/* Result Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Tile Metric */}
                      <div style={{
                        background: 'rgba(212, 175, 55, 0.06)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '12px',
                        padding: '14px 16px'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Seramik / Porselen Karo Sipariş Metrajı
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>
                            {grossAreaVal} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>m²</span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            <div>Net: <strong>{netAreaVal} m²</strong> + Fire: <strong>{wasteM2} m²</strong></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: '#94a3b8' }}>
                          <span>Koli / Kutu: <strong style={{ color: '#fff' }}>{boxCount} Kutu</strong> ({boxM2} m²/kutu)</span>
                          <span>Palet: <strong style={{ color: '#fff' }}>~{palletCount} Palet</strong> (32 kutu)</span>
                        </div>
                      </div>

                      {/* Adhesive Metric */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '14px 16px'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                          TS EN 12004 C2TE S1 Flex Yapıştırıcı
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
                            {adhesiveBags} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Torba (25 kg)</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Toplam: <strong style={{ color: '#fff' }}>~{totalAdhesiveKg} kg</strong> harç
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                          Büyük ebat porselen karolarda çift taraflı (taraklı) yapıştırma sarfiyatına uygundur.
                        </div>
                      </div>

                      {/* Grout Metric */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '14px 16px'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                          TS EN 13888 CG2WA Yüksek Mukavemetli Derz Dolgusu
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
                            {groutBags5Kg} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kova / Paket (5 kg)</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Net Sarfiyat: <strong style={{ color: '#fff' }}>~{totalGroutKg} kg</strong> ({jointMmVal} mm derz)
                          </div>
                        </div>
                      </div>

                      {/* Optional Skirting & Waterproofing */}
                      {(calcIncludeSkirting || calcIsWetArea) && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          fontSize: '0.78rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          {calcIncludeSkirting && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Süpürgelik:</span>
                              <strong style={{ color: '#fff' }}>{skirtingMeters} tül metre (~{skirtingPieces} adet {tileH} cm)</strong>
                            </div>
                          )}
                          {calcIsWetArea && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>TS EN 14891 Su Yalıtım Membranı:</span>
                              <strong style={{ color: '#38bdf8' }}>~{waterproofingKg} kg ({Math.ceil(waterproofingKg / 20)} takım çift komponent)</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '10px' }}>
                      <button
                        onClick={handleCopyBOQ}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                          color: '#090d16',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={16} />
                        <span>{calcCopiedBreakdown ? 'Panoya Kopyalandı ✓' : 'Metraj Tablosunu Kopyala'}</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('spec-writer')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#cbd5e1',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FileText size={16} />
                        <span>Şartnameye Git</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
                      
                      {/* Floating 3D Kiosk Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenIn3DKiosk(p);
                        }}
                        title="3D Kiosk Odasında Canlı İncele"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(9, 13, 22, 0.88)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          color: '#d4af37',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        <Box size={12} />
                        <span>3D Kiosk</span>
                      </button>

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

                      {/* Action Buttons: 3D Kiosk View + BIM/Texture Downloads */}
                      <div style={{
                        marginTop: 'auto',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {/* 3D Kiosk Studio Button */}
                        <button
                          onClick={() => handleOpenIn3DKiosk(p)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                            color: '#090d16',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Box size={13} />
                          <span>3D Kiosk'ta Gör</span>
                          <ExternalLink size={11} style={{ opacity: 0.8 }} />
                        </button>

                        {/* Download Buttons */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px'
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

                        {/* Interactive PBR Preview Modal Trigger */}
                        <button
                          onClick={() => setPbrProductModal(p)}
                          style={{
                            width: '100%',
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            color: '#c084fc',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sliders size={12} />
                          <span>PBR Doku Haritaları & Render Ayarları</span>
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
            <div className="spec-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Screen Toolbar (Hidden on Print) */}
              <div className="no-print" style={{
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
                    İhale şartnameleri, müteahhit sözleşmeleri ve mahal listeleri için resmi formatta teknik şartname belgesi.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {specResult && (
                    <div style={{
                      display: 'flex',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '3px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <button
                        onClick={() => setSpecViewMode('document')}
                        style={{
                          background: specViewMode === 'document' ? 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)' : 'transparent',
                          color: specViewMode === 'document' ? '#090d16' : '#cbd5e1',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Resmi Belge
                      </button>
                      <button
                        onClick={() => setSpecViewMode('raw')}
                        style={{
                          background: specViewMode === 'raw' ? 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)' : 'transparent',
                          color: specViewMode === 'raw' ? '#090d16' : '#cbd5e1',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Metin (Kod)
                      </button>
                    </div>
                  )}

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
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#090d16',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.25)'
                    }}
                  >
                    <Printer size={16} />
                    <span>Yazdır / PDF İndir</span>
                  </button>
                </div>
              </div>

              {/* Screen Preview (Hidden on Print) */}
              <div className="no-print">
                {specResult ? (
                  specViewMode === 'document' ? (
                    /* Elegant A4 Screen Preview Card */
                    <div style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '16px',
                      padding: isMobile ? '24px 16px' : '48px 56px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                      maxWidth: '960px',
                      margin: '0 auto',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
                    }}>
                      {/* Document Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #0f172a', paddingBottom: '14px', marginBottom: '16px', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            T.C. ÇEVRE, ŞEHİRCİLİK VE İKLİM DEĞİŞİKLİĞİ BAKANLIĞI STANDARTLARINA UYGUN
                          </div>
                          <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0f172a', margin: '4px 0 2px 0', letterSpacing: '-0.3px' }}>
                            MİMARİ TEKNİK ŞARTNAME & MAHAL LİSTESİ
                          </h2>
                          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#b45309' }}>
                            TS EN 14411 (GRUP BIA PORSELEN & SERAMİK KARO STANDARDI)
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {architectInfo?.officeName || 'MİMARİ PROJE OFİSİ'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                            <div><strong>Belge No:</strong> SPEC-{activeProject?.id ? activeProject.id.slice(0, 8).toUpperCase() : 'DOC'}-{new Date().getFullYear()}</div>
                            <div><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div><strong>Durum:</strong> Nihai İhale & Sözleşme Eki</div>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Table */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: '12px 24px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '14px 18px',
                        marginBottom: '24px',
                        fontSize: '0.82rem'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '110px' }}>Proje Adı:</span> <strong style={{ color: '#0f172a' }}>{activeProject?.title || specResult?.projectTitle || 'Mimari Yapı Projesi'}</strong></div>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '110px' }}>Proje Lokasyonu:</span> <span style={{ color: '#0f172a' }}>{activeProject?.city || 'Türkiye'}</span></div>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '110px' }}>Yapı Tipi:</span> <span style={{ color: '#0f172a' }}>{activeProject?.projectType || 'Genel Proje'}</span></div>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '110px' }}>Toplam Alan:</span> <span style={{ color: '#0f172a' }}>{activeProject?.totalAreaM2 ? `${activeProject.totalAreaM2} m²` : 'Belirtilmedi'}</span></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '120px' }}>Mimari Müellif:</span> <strong style={{ color: '#0f172a' }}>{architectInfo?.officeName || 'Yetkili Mimar'}</strong></div>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '120px' }}>Proje Müellifi:</span> <span style={{ color: '#0f172a' }}>{architectInfo?.name || 'Mimar'}</span></div>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '120px' }}>Sicil / İletişim:</span> <span style={{ color: '#0f172a' }}>{architectInfo?.chamberNo ? `Sicil: ${architectInfo.chamberNo}` : (architectInfo?.phone || architectInfo?.email || 'Proje Müellifi')}</span></div>
                          <div><span style={{ color: '#64748b', fontWeight: '600', display: 'inline-block', minWidth: '120px' }}>Şartname Türü:</span> <span style={{ color: '#0f172a' }}>Resmi İmalat ve İhale Eki</span></div>
                        </div>
                      </div>

                      {/* Section 1 */}
                      <div style={{ marginBottom: '22px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '6px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          BÖLÜM 1: GENEL HÜKÜMLER VE İMALAT STANDARTLARI
                        </h4>
                        <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ margin: 0 }}><strong>1.1. Malzeme Standardı:</strong> Bütün seramik ve porselen karolar <strong>TS EN 14411 Grup BIa (Su emme oranı E ≤ %0.5)</strong> uluslararası normlarına tam haiz, 1. sınıf (A kalite) orijinal ambalajında şantiyeye teslim edilecektir.</p>
                          <p style={{ margin: 0 }}><strong>1.2. Yapıştırıcı Standardı:</strong> Kaplama uygulamasında TS EN 12004 standardına uygun, <strong>C2TE S1 sınıfı</strong> (çimento esaslı, kayma özelliği azaltılmış, açıkta bekleme süresi uzatılmış, yüksek elastikiyetli flex) yapıştırıcı kullanılacaktır.</p>
                          <p style={{ margin: 0 }}><strong>1.3. Derz Genişliği ve Dolgusu:</strong> Karolar rektifiyeli (lazer kesim) olup, homojen derz hattı için en az 2 mm derz artısı kullanılacaktır. Derz dolgusu <strong>TS EN 13888 CG2WA sınıfı</strong> (yüksek aşınma dayanımlı, su emmesi minimize edilmiş, leke tutmaz) harç ile tatbik edilecektir.</p>
                          <p style={{ margin: 0 }}><strong>1.4. Su Yalıtımı ve Yüzey Hazırlığı:</strong> Islak hacimlerde seramik kaplama öncesi süpürgelik kotuna kadar en az 2 kat polimer emülsiyon esaslı elastik su yalıtım membranı uygulanacaktır. Alt şap 350 dozlu, terazi ve gönyesinde olacaktır.</p>
                        </div>
                      </div>

                      {/* Section 2: Items */}
                      <div style={{ marginBottom: '22px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '6px', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          BÖLÜM 2: MAHAL LİSTESİ VE MALZEME TEKNİK ŞARTLARI
                        </h4>
                        {specResult?.specClauses && specResult.specClauses.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {specResult.specClauses.map((clause, idx) => (
                              <div key={idx} style={{
                                border: '1px solid #e2e8f0',
                                borderLeft: '4px solid #0f172a',
                                borderRadius: '6px',
                                padding: '14px 16px',
                                background: '#fbfcfd'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px', marginBottom: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#0f172a', color: '#fff', fontSize: '0.72rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                                      Madde {clause.clauseNo}
                                    </span>
                                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
                                      {(clause.usageArea || 'KAPLAMA').toUpperCase()} — {clause.productName} ({clause.brandName})
                                    </span>
                                  </div>
                                  {clause.areaM2 && (
                                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#b45309' }}>
                                      {clause.areaM2} m² (+ %8 Fire)
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
                                  {clause.clauseText}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <pre style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                            {specResult.fullSpecDoc}
                          </pre>
                        )}
                      </div>

                      {/* Section 3 */}
                      <div style={{ marginBottom: '28px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '6px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          BÖLÜM 3: KONTROL, KABUL VE NUMUNE ONAY PROSEDÜRÜ
                        </h4>
                        <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ margin: 0 }}><strong>3.1. Numune Onayı:</strong> İşe başlanmadan önce yüklenici firma tarafından işbu şartnamede tariflenen karolara ait üretici teknik bilgi föyleri (TDS) ve 15x15 cm kesit numuneler mimari kontrollüğün yazılı onayına sunulacaktır.</p>
                          <p style={{ margin: 0 }}><strong>3.2. Parti / Tonaj Bütünlüğü:</strong> Sahaya indirilen karoların tümü aynı üretim partisine (şarj/ton ve kalibre no) ait olacaktır. Farklı kalibre veya tonajdaki ürünlerin kabulü yapılmayacaktır.</p>
                          <p style={{ margin: 0 }}><strong>3.3. Yüzey Koruma:</strong> İmalatı tamamlanan zeminler teslim anına dek ağır hizmet tipi zemin koruma örtüleri ile tam koruma altına alınacaktır.</p>
                        </div>
                      </div>

                      {/* Section 4: Signatures */}
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '14px', marginTop: '24px' }}>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>MİMARİ PROJE MÜELLİFİ</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>(Tasarım & Kontrollük)</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>{architectInfo?.officeName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '14px' }}>{architectInfo?.name}</div>
                          <div style={{ border: '1px dashed #94a3b8', borderRadius: '6px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8', background: '#fff', marginBottom: '8px' }}>
                            Kaşe / Islak İmza
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tarih: ..... / ..... / 202...</div>
                        </div>

                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>YÜKLENİCİ / MÜTEAHHİT</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>(Uygulama ve Taahhüt)</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>Yetkili Yüklenici</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '14px' }}>Firma Yetkilisi</div>
                          <div style={{ border: '1px dashed #94a3b8', borderRadius: '6px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8', background: '#fff', marginBottom: '8px' }}>
                            Kaşe / Islak İmza
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tarih: ..... / ..... / 202...</div>
                        </div>

                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>İŞVEREN / DENETİM</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>(Kabul ve Onay Yetkilisi)</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>Yapı Denetim / Kontrol</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '14px' }}>Yetkili Mühendis</div>
                          <div style={{ border: '1px dashed #94a3b8', borderRadius: '6px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8', background: '#fff', marginBottom: '8px' }}>
                            Kaşe / Islak İmza
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tarih: ..... / ..... / 202...</div>
                        </div>
                      </div>

                      {/* Footer Note */}
                      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '24px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                        <span>İşbu şartname TS EN 14411 yapı standartlarına uygun resmi teknik şartname ve mahal listesidir.</span>
                        <span>Resmi Sözleşme & İhale Eki</span>
                      </div>
                    </div>
                  ) : (
                    /* Raw Monospace Dark Box */
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
                  )
                ) : (
                  /* Empty state */
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

              {/* Dedicated Print Layout (Rendered in DOM, visible ONLY on @media print) */}
              {specResult && (
                <div className="spec-print-document">
                  {/* Print Document Header */}
                  <div className="print-header">
                    <div className="print-header-left">
                      <div className="print-republic">T.C. ÇEVRE, ŞEHİRCİLİK VE İKLİM DEĞİŞİKLİĞİ BAKANLIĞI STANDARTLARINA UYGUN</div>
                      <h1 className="print-main-title">MİMARİ TEKNİK ŞARTNAME & MAHAL LİSTESİ</h1>
                      <div className="print-standard-tag">TS EN 14411 (GRUP BIA PORSELEN & SERAMİK KAROLAR)</div>
                    </div>
                    <div className="print-header-right">
                      <div className="print-brand-badge">{architectInfo?.officeName ? architectInfo.officeName.toUpperCase() : 'MİMARİ PROJE OFİSİ'}</div>
                      <div className="print-meta-item"><strong>Belge No:</strong> SPEC-{activeProject?.id ? activeProject.id.slice(0, 8).toUpperCase() : 'DOC'}-{new Date().getFullYear()}</div>
                      <div className="print-meta-item"><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="print-meta-item"><strong>Durum:</strong> Nihai İhale Formatı</div>
                    </div>
                  </div>

                  <div className="print-divider-thick" />

                  {/* Print Metadata Table */}
                  <div className="print-meta-grid">
                    <div className="print-meta-col">
                      <div className="print-row"><span className="label">Proje Adı:</span> <span className="val bold">{activeProject?.title || specResult?.projectTitle || 'Mimari Yapı Projesi'}</span></div>
                      <div className="print-row"><span className="label">Proje Lokasyonu:</span> <span className="val">{activeProject?.city || 'Türkiye'}</span></div>
                      <div className="print-row"><span className="label">Yapı Türü:</span> <span className="val">{activeProject?.projectType || 'Konut / Ticari'}</span></div>
                      <div className="print-row"><span className="label">Toplam Alan:</span> <span className="val">{activeProject?.totalAreaM2 ? `${activeProject.totalAreaM2} m²` : 'Belirtilmedi'}</span></div>
                    </div>
                    <div className="print-meta-col">
                      <div className="print-row"><span className="label">Mimari Müellif Ofis:</span> <span className="val bold">{architectInfo?.officeName || 'Yetkili Mimarlık'}</span></div>
                      <div className="print-row"><span className="label">Müellif Mimar:</span> <span className="val">{architectInfo?.name || 'Mimar'}</span></div>
                      <div className="print-row"><span className="label">Sicil / İletişim:</span> <span className="val">{architectInfo?.chamberNo ? `Sicil No: ${architectInfo.chamberNo}` : (architectInfo?.phone || architectInfo?.email || 'Proje Müellifi')}</span></div>
                      <div className="print-row"><span className="label">Şartname Niteliği:</span> <span className="val">Resmi Sözleşme & İhale Eki</span></div>
                    </div>
                  </div>

                  {/* Section 1 */}
                  <div className="print-section">
                    <h2 className="print-section-title">BÖLÜM 1: GENEL HÜKÜMLER VE İMALAT STANDARTLARI</h2>
                    <div className="print-clause">
                      <p><strong>1.1. Malzeme Standardı ve Kalite Sınıfı:</strong> Bu şartnamede geçen bütün seramik ve porselen karolar, <strong>TS EN 14411 Grup BIa (Su emme oranı E ≤ %0.5)</strong> uluslararası standartlarına tam haiz, 1. sınıf (A kalite) orijinal ambalajında şantiyeye teslim edilecektir. Standart dışı, defolu veya kalibre hatası olan ürünler kabul edilmeyecektir.</p>
                      <p><strong>1.2. Yapıştırıcı ve Harç Standartları:</strong> Zemin ve duvar kaplama imalatlarında TS EN 12004 standardına uygun, <strong>C2TE S1 sınıfı</strong> (çimento esaslı, kayma özelliği azaltılmış, açıkta bekleme süresi uzatılmış, yüksek elastikiyetli) flex yapıştırıcılar kullanılacaktır.</p>
                      <p><strong>1.3. Derz Genişliği ve Dolgusu:</strong> Karolar rektifiyeli (lazer kesim) olup derz kalınlığını homojen kılmak adına en az 2 mm derz artısı kullanılacaktır. Derz dolgusu <strong>TS EN 13888 CG2WA sınıfı</strong> (yüksek aşınma mukavemetli, su emmesi minimize edilmiş, leke tutmaz) harç ile eksiz tatbik edilecektir.</p>
                      <p><strong>1.4. Yalıtım ve Yüzey Hazırlığı:</strong> Islak hacimlerde seramik kaplama öncesi süpürgelik kotuna kadar en az 2 kat polimer emülsiyon esaslı elastik su yalıtım membranı tatbik edilecektir. Alt tesviye şapı 350 dozlu, terazi ve gönyesinde teslim alınacaktır.</p>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="print-section">
                    <h2 className="print-section-title">BÖLÜM 2: MAHAL LİSTESİ VE MALZEME TEKNİK ŞARTLARI</h2>
                    {specResult?.specClauses && specResult.specClauses.length > 0 ? (
                      specResult.specClauses.map((clause, idx) => (
                        <div key={idx} className="print-item-box">
                          <div className="print-item-header">
                            <span className="print-item-tag">Madde {clause.clauseNo}</span>
                            <span className="print-item-title">
                              {(clause.usageArea || 'KAPLAMA').toUpperCase()} — {clause.productName} ({clause.brandName})
                            </span>
                            {clause.areaM2 && <span className="print-item-m2">{clause.areaM2} m² (+ %8 Fire)</span>}
                          </div>
                          <div className="print-item-body">
                            <div className="print-item-clause-text">
                              {clause.clauseText}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <pre className="print-raw-text">{specResult.fullSpecDoc}</pre>
                    )}
                  </div>

                  {/* Section 3 */}
                  <div className="print-section">
                    <h2 className="print-section-title">BÖLÜM 3: KONTROL, KABUL VE NUMUNE ONAYI</h2>
                    <div className="print-clause">
                      <p><strong>3.1. Numune Onayı:</strong> İşe başlanmadan evvel yüklenici firma tarafından işbu şartnamede belirlenen karolara ait numuneler ve üretici teknik bilgi föyleri (TDS) mimari kontrollüğün yazılı onayına sunulacak; yazılı onay alınmadan imalata başlanmayacaktır.</p>
                      <p><strong>3.2. Parti / Tonaj Bütünlüğü:</strong> Sahaya sevk edilen karoların tümü aynı üretim şarjına (tonaj ve kalibre) ait olacaktır. Renk veya ebat farklılığı olan ürünlerin kabulü yapılmayacaktır.</p>
                      <p><strong>3.3. Yüzey Koruma:</strong> İmalatı tamamlanan zeminler teslim anına dek ağır hizmet tipi koruma örtüleri ile tam muhafaza altına alınacaktır.</p>
                    </div>
                  </div>

                  {/* Section 4: Signatures */}
                  <div className="print-signatures">
                    <div className="print-sig-col">
                      <div className="print-sig-title">MİMARİ PROJE MÜELLİFİ</div>
                      <div className="print-sig-sub">(Tasarım & Kontrollük)</div>
                      <div className="print-sig-office">{architectInfo?.officeName}</div>
                      <div className="print-sig-name">{architectInfo?.name}</div>
                      <div className="print-sig-box">Kaşe / Islak İmza</div>
                      <div className="print-sig-date">Tarih: ..... / ..... / 202...</div>
                    </div>
                    <div className="print-sig-col">
                      <div className="print-sig-title">YÜKLENİCİ / MÜTEAHHİT</div>
                      <div className="print-sig-sub">(Uygulama ve Taahhüt)</div>
                      <div className="print-sig-office">Yetkili Yüklenici</div>
                      <div className="print-sig-name">Firma Yetkilisi</div>
                      <div className="print-sig-box">Kaşe / Islak İmza</div>
                      <div className="print-sig-date">Tarih: ..... / ..... / 202...</div>
                    </div>
                    <div className="print-sig-col">
                      <div className="print-sig-title">İŞVEREN / DENETİM</div>
                      <div className="print-sig-sub">(Kabul ve Onay)</div>
                      <div className="print-sig-office">Yapı Denetim / İdare</div>
                      <div className="print-sig-name">Yetkili Mühendis</div>
                      <div className="print-sig-box">Kaşe / Islak İmza</div>
                      <div className="print-sig-date">Tarih: ..... / ..... / 202...</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="print-footer">
                    <span>İşbu şartname TS EN 14411 yapı standartlarına uygun resmi teknik şartname ve mahal listesidir.</span>
                    <span>Sözleşme & İhale Eki</span>
                  </div>
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
            <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Spec-Lock & Rewards Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
                gap: '16px'
              }}>
                {/* Spec-Lock Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.25) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '800', textTransform: 'uppercase' }}>
                      PROJE KORUMA SİSTEMİ (SPEC-LOCK)
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: '2px 0 6px 0' }}>
                      Şartnameniz Fabrika Düzeyinde Kilitlenir
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                      Şartnameye yazdığınız ürünler üretici fabrikaların B2B masasında ofisiniz adına rezerve edilir. Müteahhit başka markaya kaçamaz, ofisinizin şartname hakkı korunur.
                    </p>
                  </div>
                </div>

                {/* Reward Points Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(180, 83, 9, 0.2) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} style={{ color: '#d4af37' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase' }}>
                        Mimar Teşvik Puanı
                      </span>
                    </div>
                    <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#fff' }}>
                      {activeProject?.totalAreaM2 ? Math.round(activeProject.totalAreaM2) : 2500} P
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '8px 0' }}>
                    Projelerinizde şartnameye giren her 1 m² seramik için 1 Mimar Puanı kazanırsınız.
                  </div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.68rem' }}>
                    <span style={{ background: 'rgba(0,0,0,0.3)', padding: '3px 6px', borderRadius: '4px', color: '#fbbf24' }}>🎟️ Cersaie İtalya Bileti</span>
                    <span style={{ background: 'rgba(0,0,0,0.3)', padding: '3px 6px', borderRadius: '4px', color: '#fbbf24' }}>💻 3D Lisans Desteği</span>
                  </div>
                </div>
              </div>

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
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '8px' : '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#0a0f1d',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: isMobile ? '16px' : '22px',
            width: '100%',
            maxWidth: '1100px',
            height: isMobile ? '96vh' : '90vh',
            maxHeight: '900px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: isMobile ? '14px 16px' : '20px 24px',
              background: 'linear-gradient(180deg, rgba(19, 28, 47, 0.9) 0%, rgba(13, 21, 39, 0.9) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800'
                }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: '800', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
                    Katalogdan Projeye Karo Ekle
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.78rem' }}>
                    <span style={{ color: '#94a3b8' }}>Hedef Proje:</span>
                    <span style={{ color: '#d4af37', fontWeight: '700' }}>
                      {activeProject?.title || 'Seçili Proje'}
                    </span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span style={{ color: '#cbd5e1' }}>Toplam {catalogProducts.length} Karo Gösteriliyor</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddTileModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Project Context Bar: Usage Area & M2 */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              background: 'rgba(212, 175, 55, 0.05)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '14px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  UYGULAMA ALANI:
                </span>
                <select
                  value={addTileUsageArea}
                  onChange={(e) => setAddTileUsageArea(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#131c2f',
                    color: '#fff',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Zemin Kaplama">Zemin Kaplama</option>
                  <option value="Banyo Duvarı">Banyo Duvarı</option>
                  <option value="Mutfak Tezgahı / Alın">Mutfak Tezgahı / Alın</option>
                  <option value="Lobi / Karşılama Alanı">Lobi / Karşılama Alanı</option>
                  <option value="Dış Cephe Kaplama">Dış Cephe Kaplama</option>
                  <option value="Teras & Havuz Kenarı">Teras & Havuz Kenarı</option>
                  <option value="Islak Hacim Zemin">Islak Hacim Zemin</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TAHMİNİ METRAJ:
                </span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    value={addTileAreaM2}
                    onChange={(e) => setAddTileAreaM2(e.target.value)}
                    style={{
                      width: '100px',
                      padding: '8px 30px 8px 12px',
                      borderRadius: '8px',
                      background: '#131c2f',
                      color: '#fff',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '10px', fontSize: '0.72rem', color: '#94a3b8', pointerEvents: 'none' }}>m²</span>
                </div>
              </div>

              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>
                Seçtiğiniz karo otomatik olarak projenin şartname ve numune sepetine eklenecektir.
              </div>
            </div>

            {/* Filter Toolbar: Brands pills & Search */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flexShrink: 0
            }}>
              {/* Search input + Style dropdown */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Seri adı, renk, ebat (örn. 60x120, calacatta, antrasit)..."
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      fetchCatalog(e.target.value, selectedBrandFilter, selectedStyleFilter);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      background: '#131c2f',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {catalogSearch && (
                    <button
                      onClick={() => {
                        setCatalogSearch('');
                        fetchCatalog('', selectedBrandFilter, selectedStyleFilter);
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {/* Style filter */}
                <select
                  value={selectedStyleFilter}
                  onChange={(e) => {
                    setSelectedStyleFilter(e.target.value);
                    fetchCatalog(catalogSearch, selectedBrandFilter, e.target.value);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#131c2f',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Tüm Dokular & Stiller</option>
                  <option value="Mermer">Mermer Dokulu</option>
                  <option value="Beton">Beton / Çimento</option>
                  <option value="Ahşap">Ahşap Dokulu</option>
                  <option value="Taş">Doğal Taş / Traverten</option>
                  <option value="Metalik">Metalik / Pas</option>
                  <option value="Düz / Monokrom">Düz / Monokrom</option>
                </select>
              </div>

              {/* Brand Filter Pills Bar with Scroll Controls & Visible Scrollbar */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => scrollBrands('left')}
                  title="Sola Kaydır"
                  style={{
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#d4af37',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d4af37';
                    e.currentTarget.style.color = '#090d16';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                    e.currentTarget.style.color = '#d4af37';
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <div 
                  ref={brandScrollRef}
                  className="brand-pill-scroll"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    flex: 1,
                    scrollBehavior: 'smooth'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrandFilter('');
                      fetchCatalog(catalogSearch, '', selectedStyleFilter);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      border: selectedBrandFilter === '' ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: selectedBrandFilter === '' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedBrandFilter === '' ? '#d4af37' : '#cbd5e1',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s'
                    }}
                  >
                    Tüm Markalar
                  </button>
                  {catalogBrands.map(b => {
                    const isSelected = selectedBrandFilter === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          const newBrand = isSelected ? '' : b.id;
                          setSelectedBrandFilter(newBrand);
                          fetchCatalog(catalogSearch, newBrand, selectedStyleFilter);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#d4af37' : '#cbd5e1',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexShrink: 0,
                          transition: 'all 0.15s'
                        }}
                      >
                        <span>{b.name}</span>
                        {b._count?.products !== undefined && (
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                            color: isSelected ? '#fff' : '#94a3b8'
                          }}>
                            {b._count.products}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollBrands('right')}
                  title="Sağa Kaydır"
                  style={{
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#d4af37',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d4af37';
                    e.currentTarget.style.color = '#090d16';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                    e.currentTarget.style.color = '#d4af37';
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Products Grid Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '14px' : '22px',
              position: 'relative'
            }}>
              {catalogLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: '#d4af37' }} />
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Karo kataloğu taranıyor...</span>
                </div>
              ) : catalogProducts.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {catalogProducts.map(p => {
                    const brandName = p.brand?.name || 'Üretici Marka';
                    const img = p.imageUrl || p.textureUrl || '/textures/calacatta_gold.jpg';
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleAddItemToProject(p)}
                        style={{
                          background: '#11192b',
                          borderRadius: '14px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Thumbnail Container */}
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          height: isMobile ? '130px' : '150px',
                          background: '#1e293b',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img
                            src={img}
                            alt={p.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/textures/calacatta_gold.jpg';
                            }}
                          />

                          {/* Top Left Brand Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(10, 15, 29, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            color: '#d4af37',
                            letterSpacing: '0.4px'
                          }}>
                            {brandName}
                          </div>

                          {/* Top Right 3D Kiosk Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenIn3DKiosk(p);
                            }}
                            title="3D Kiosk'ta İncele"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(9, 13, 22, 0.88)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: '#d4af37',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.66rem',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              zIndex: 10
                            }}
                          >
                            <Box size={11} />
                            <span>3D</span>
                          </button>

                          {/* Hover Add Overlay Icon */}
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: '#d4af37',
                            color: '#090d16',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
                          }}>
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </div>

                        {/* Details */}
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h4 style={{
                            fontSize: '0.86rem',
                            fontWeight: '700',
                            margin: '0 0 6px 0',
                            color: '#fff',
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.4em'
                          }}>
                            {p.name}
                          </h4>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto', paddingTop: '8px' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              color: '#cbd5e1'
                            }}>
                              {p.width}x{p.height} cm
                            </span>
                            {p.finish && (
                              <span style={{
                                fontSize: '0.68rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                color: '#94a3b8'
                              }}>
                                {p.finish}
                              </span>
                            )}
                            {p.style && (
                              <span style={{
                                fontSize: '0.68rem',
                                background: 'rgba(212, 175, 55, 0.1)',
                                color: '#d4af37',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                {p.style}
                              </span>
                            )}
                          </div>

                          <div style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {addTileUsageArea}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d4af37' }}>
                              + Projeye Ekle
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#94a3b8'
                }}>
                  <Compass size={40} style={{ color: '#d4af37', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
                    Kriterlere Uygun Seramik Bulunamadı
                  </h4>
                  <p style={{ fontSize: '0.82rem', margin: 0 }}>
                    Lütfen arama terimini değiştirin veya diğer marka filtrelerini seçin.
                  </p>
                </div>
              )}
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

      {/* ----------------------------------------------------------- */}
      {/* MODAL 5: WHITE-LABEL CLIENT PRESENTATION SHARE */}
      {/* ----------------------------------------------------------- */}
      {showShareModal && activeProject && (
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
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                    Müşteri Sunum & Onay Linki
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{activeProject.title}</span>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '0.78rem',
              color: '#6ee7b7',
              lineHeight: 1.45
            }}>
              ✨ <strong>Tamamen White-Label (Markasız):</strong> Bu linkte SeramikBak adı yer almaz. Sayfa sizin mimarlık ofisinizin logosuyla açılır. İşveren karoları inceler, tek tıkla onaylar veya revizyon notu yazar.
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                PAYLAŞILABİLİR ÖZEL ONAY BAĞLANTISI
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/mimar/sunum/${activeProject.id}` : `/mimar/sunum/${activeProject.id}`}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? `${window.location.origin}/mimar/sunum/${activeProject.id}` : `/mimar/sunum/${activeProject.id}`;
                    navigator.clipboard.writeText(url);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2500);
                  }}
                  style={{
                    background: shareCopied ? '#22c55e' : 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {shareCopied ? 'Kopyalandı ✓' : 'Linki Kopyala'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${activeProject.title} projemiz için hazırladığımız mimari malzeme ve seramik seçimleri dosyasını inceleyip onaylayabilirsiniz: ${typeof window !== 'undefined' ? window.location.origin : ''}/mimar/sunum/${activeProject.id}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>WhatsApp ile İlet</span>
              </a>

              <a
                href={`/mimar/sunum/${activeProject.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={14} />
                <span>Önizlemeyi Aç</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 6: PBR MATERIAL TEXTURES & RENDER CONFIG */}
      {/* ----------------------------------------------------------- */}
      {pbrProductModal && (
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
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '20px',
            maxWidth: '640px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: '800', textTransform: 'uppercase' }}>
                  {pbrProductModal.brand?.name || 'Porselen'} • 4K PBR HARİTALARI
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '2px 0 0 0', color: '#fff' }}>
                  {pbrProductModal.name}
                </h3>
              </div>
              <button
                onClick={() => setPbrProductModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 4-Map Grid Showcase */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#090d18', borderRadius: '10px', padding: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                  <img src={pbrProductModal.imageUrl} alt="Albedo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fff' }}>Albedo</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Base Color</div>
              </div>

              <div style={{ background: '#090d18', borderRadius: '10px', padding: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px', background: 'linear-gradient(135deg, #1e293b, #475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '700' }}>
                  Roughness
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fff' }}>Roughness</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{pbrProductModal.finish || 'Mat'} (0.35)</div>
              </div>

              <div style={{ background: '#090d18', borderRadius: '10px', padding: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px', background: 'linear-gradient(135deg, #818cf8, #c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: '800' }}>
                  Normal
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fff' }}>Normal / Bump</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Derz & Rölyef</div>
              </div>

              <div style={{ background: '#090d18', borderRadius: '10px', padding: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '700' }}>
                  AO Map
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fff' }}>Ambient Occlusion</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Gölge & Derinlik</div>
              </div>
            </div>

            {/* Ready Engine Settings */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '14px',
              marginBottom: '18px',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: '800', color: '#d4af37', marginBottom: '6px' }}>
                🎯 V-Ray / Corona / Enscape / Lumion Hazır Ayar Parametreleri:
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                • <strong>IOR (Kırılma İndisi):</strong> 1.54 (Standart Sırlı Porselen)<br />
                • <strong>Reflection / Glossiness:</strong> {pbrProductModal.finish === 'Parlak' ? '0.94 (High Polish)' : '0.72 (Satin/Mat)'}<br />
                • <strong>Bump / Normal Amount:</strong> 15% (2 mm mikro derz rölyefi)<br />
                • <strong>Diffuse UVW Tiling:</strong> {pbrProductModal.width || 60}x{pbrProductModal.height || 120} cm gerçek ölçek
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`// V-Ray / Corona PBR Settings for ${pbrProductModal.name}\nIOR: 1.54\nGlossiness: ${pbrProductModal.finish === 'Parlak' ? '0.94' : '0.72'}\nReflection: 0.95\nBump: Normal_Map_15%\nScale: ${pbrProductModal.width}x${pbrProductModal.height}cm`);
                  alert('Render parametreleri panoya kopyalandı.');
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Parametreleri Kopyala
              </button>

              <button
                onClick={() => {
                  handleDownloadAsset(pbrProductModal, 'PBR_TEXTURES');
                  setPbrProductModal(null);
                }}
                style={{
                  flex: 1.2,
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                <span>PBR Paketini İndir (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="no-print mobile-bottom-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '62px',
          background: 'rgba(7, 11, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 900,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)'
        }}>
          {[
            { id: 'projects', label: 'Projeler', icon: <Layers size={18} /> },
            { id: 'calculator', label: 'Metraj', icon: <Calculator size={18} /> },
            { id: 'vault', label: '3D PBR', icon: <Box size={18} /> },
            { id: 'spec-writer', label: 'Şartname', icon: <FileText size={18} /> },
            { id: 'samples', label: 'Numune', icon: <Package size={18} /> },
            { id: 'quotes', label: 'Koruma', icon: <Building2 size={18} /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
                  padding: '6px 10px',
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

      {/* Custom Styles & Professional A4 Print Stylesheet */}
      <style jsx global>{`
        .brand-pill-scroll::-webkit-scrollbar {
          height: 6px !important;
        }
        .brand-pill-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04) !important;
          border-radius: 10px !important;
        }
        .brand-pill-scroll::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4) !important;
          border-radius: 10px !important;
        }
        .brand-pill-scroll::-webkit-scrollbar-thumb:hover {
          background: #d4af37 !important;
        }

        /* Screen Document Default (Hidden on Screen, visible on print) */
        .spec-print-document {
          display: none;
        }

        /* Official TS EN 14411 A4 Technical Specification Print Styles */
        @media print {
          @page {
            size: A4 portrait;
            margin: 14mm 15mm 15mm 15mm;
          }

          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif !important;
            font-size: 9pt !important;
            line-height: 1.45 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide ALL non-print portal elements */
          .no-print,
          aside,
          header,
          nav,
          button,
          .mimar-sidebar,
          .mimar-header,
          .mobile-bottom-bar,
          .brand-pill-scroll,
          div[style*="position: fixed"],
          div[style*="position: sticky"] {
            display: none !important;
          }

          /* Unconstrain portal layout for full page width */
          .mimar-dashboard-root {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          .mimar-content-wrapper {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .mimar-main {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .spec-tab-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Display the official document */
          .spec-print-document {
            display: block !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            padding-bottom: 8px !important;
          }

          .print-header-left {
            flex: 1 !important;
          }

          .print-republic {
            font-size: 7.5pt !important;
            font-weight: 700 !important;
            color: #475569 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            margin-bottom: 3px !important;
          }

          .print-main-title {
            font-size: 13.5pt !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            margin: 0 0 2px 0 !important;
            letter-spacing: -0.2px !important;
          }

          .print-standard-tag {
            font-size: 8.5pt !important;
            font-weight: 800 !important;
            color: #b45309 !important;
          }

          .print-header-right {
            text-align: right !important;
            min-width: 190px !important;
          }

          .print-brand-badge {
            font-size: 11pt !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            letter-spacing: 1px !important;
            margin-bottom: 3px !important;
          }

          .print-meta-item {
            font-size: 7.5pt !important;
            color: #475569 !important;
            line-height: 1.35 !important;
          }

          .print-divider-thick {
            height: 2.5px !important;
            background: #0f172a !important;
            margin: 6px 0 10px 0 !important;
          }

          .print-meta-grid {
            display: flex !important;
            gap: 16px !important;
            border: 1px solid #cbd5e1 !important;
            background: #f8fafc !important;
            padding: 8px 12px !important;
            border-radius: 4px !important;
            margin-bottom: 12px !important;
          }

          .print-meta-col {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
          }

          .print-row {
            font-size: 8pt !important;
            display: flex !important;
            gap: 6px !important;
          }

          .print-row .label {
            color: #64748b !important;
            min-width: 105px !important;
            font-weight: 600 !important;
          }

          .print-row .val {
            color: #0f172a !important;
          }

          .print-row .val.bold {
            font-weight: 700 !important;
          }

          .print-section {
            margin-bottom: 12px !important;
            page-break-inside: auto !important;
          }

          .print-section-title {
            font-size: 9pt !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            border-bottom: 1px solid #cbd5e1 !important;
            padding-bottom: 3px !important;
            margin: 0 0 6px 0 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.3px !important;
          }

          .print-clause p {
            font-size: 8pt !important;
            line-height: 1.45 !important;
            margin: 0 0 5px 0 !important;
            color: #1e293b !important;
            text-align: justify !important;
          }

          .print-item-box {
            border: 1px solid #cbd5e1 !important;
            border-left: 3.5px solid #0f172a !important;
            padding: 8px 10px !important;
            margin-bottom: 8px !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
          }

          .print-item-header {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            border-bottom: 1px dashed #cbd5e1 !important;
            padding-bottom: 3px !important;
            margin-bottom: 5px !important;
          }

          .print-item-tag {
            background: #0f172a !important;
            color: #ffffff !important;
            font-size: 7pt !important;
            font-weight: 800 !important;
            padding: 1px 5px !important;
            border-radius: 2px !important;
          }

          .print-item-title {
            font-size: 8pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            flex: 1 !important;
          }

          .print-item-m2 {
            font-size: 7.5pt !important;
            font-weight: 700 !important;
            color: #b45309 !important;
          }

          .print-item-clause-text {
            font-size: 7.8pt !important;
            line-height: 1.4 !important;
            color: #334155 !important;
            white-space: pre-wrap !important;
          }

          .print-raw-text {
            font-size: 7.8pt !important;
            line-height: 1.38 !important;
            white-space: pre-wrap !important;
            color: #0f172a !important;
            font-family: 'Courier New', Courier, monospace !important;
          }

          .print-signatures {
            display: flex !important;
            gap: 10px !important;
            margin-top: 14px !important;
            page-break-inside: avoid !important;
          }

          .print-sig-col {
            flex: 1 !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 4px !important;
            padding: 8px !important;
            text-align: center !important;
            background: #f8fafc !important;
          }

          .print-sig-title {
            font-size: 7.5pt !important;
            font-weight: 800 !important;
            color: #0f172a !important;
          }

          .print-sig-sub {
            font-size: 6.5pt !important;
            color: #64748b !important;
            margin-bottom: 4px !important;
          }

          .print-sig-office {
            font-size: 7.5pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
          }

          .print-sig-name {
            font-size: 7pt !important;
            color: #475569 !important;
            margin-bottom: 8px !important;
          }

          .print-sig-box {
            border: 1px dashed #94a3b8 !important;
            border-radius: 4px !important;
            height: 42px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 6.5pt !important;
            color: #94a3b8 !important;
            margin-bottom: 4px !important;
            background: #ffffff !important;
          }

          .print-sig-date {
            font-size: 6.5pt !important;
            color: #64748b !important;
          }

          .print-footer {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 6.5pt !important;
            color: #94a3b8 !important;
            border-top: 1px solid #e2e8f0 !important;
            padding-top: 4px !important;
            margin-top: 12px !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}
