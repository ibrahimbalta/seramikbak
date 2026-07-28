'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  FileText, 
  Lock, 
  User, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Activity, 
  TrendingUp, 
  ArrowLeft,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Trash2,
  CreditCard,
  Crown,
  Zap,
  Star,
  Check,
  X,
  BadgeCheck,
  Clock,
  Package,
  ArrowRight,
  Building2,
  Upload,
  RefreshCw,
  Plus,
  Layers,
  Menu,
  Share2,
  Printer,
  Calculator,
  FileCheck,
  MessageSquare,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/slugify';
import QuotePDFTemplate from '@/components/QuotePDFTemplate';
import { calculateQuote } from '@/lib/quoteCalculator';

export default function DealerPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Logged-in Dealer Session State
  const [dealerInfo, setDealerInfo] = useState(null);
  
  // Dashboard Data State
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ totalLeads: 0, pendingLeads: 0, respondedLeads: 0 });
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [regionalAnalytics, setRegionalAnalytics] = useState({ popularQueries: [], popularBrands: [], popularStyles: [] });
  const [brandProducts, setBrandProducts] = useState([]);

  // Inventory & Stock Management State
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [xmlFeedUrlInput, setXmlFeedUrlInput] = useState('');
  const [xmlSyncLoading, setXmlSyncLoading] = useState(false);
  const [csvContentInput, setCsvContentInput] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [inventorySuccess, setInventorySuccess] = useState('');
  const [inventoryError, setInventoryError] = useState('');

  // Add Item Modal state
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [addInventoryProduct, setAddInventoryProduct] = useState('');
  const [addInventoryStock, setAddInventoryStock] = useState('0');
  const [addInventoryPrice, setAddInventoryPrice] = useState('');
  const [addInventoryStatus, setAddInventoryStatus] = useState('IN_STOCK');

  // Outlet & Proje Fazlası Borsası State
  const [outletListings, setOutletListings] = useState([]);
  const [outletLoading, setOutletLoading] = useState(false);
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
  const [outletTitle, setOutletTitle] = useState('');
  const [outletCategory, setOutletCategory] = useState('PROJE_FAZLASI');
  const [outletBadgeTag, setOutletBadgeTag] = useState('Kapatıyoruz / Proje Fazlası');
  const [outletQuantityM2, setOutletQuantityM2] = useState('');
  const [outletUnitPrice, setOutletUnitPrice] = useState('');
  const [outletOriginalPrice, setOutletOriginalPrice] = useState('');
  const [outletDimensions, setOutletDimensions] = useState('60x120 cm');
  const [outletColorFinish, setOutletColorFinish] = useState('');
  const [outletImageUrl, setOutletImageUrl] = useState('');
  const [outletNotes, setOutletNotes] = useState('');
  const [outletProductId, setOutletProductId] = useState('');
  const [outletSuccess, setOutletSuccess] = useState('');
  const [outletError, setOutletError] = useState('');

  // Dealer SaaS State
  const [saasInfo, setSaasInfo] = useState(null);
  const [bankDetails, setBankDetails] = useState({ bank_name: '', bank_recipient: '', bank_iban: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('STANDART');
  const [paymentSenderName, setPaymentSenderName] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Portal navigation: 'dashboard', 'quick-quote', 'b2b-projects', 'subscription', 'settings'
  const [activePortalTab, setActivePortalTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // 30-Second Quick Quote Builder States
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteCustomerName, setQuoteCustomerName] = useState('');
  const [quoteCustomerPhone, setQuoteCustomerPhone] = useState('');
  const [quoteCustomerEmail, setQuoteCustomerEmail] = useState('');
  const [quoteProjectName, setQuoteProjectName] = useState('Banyo & Zemin Seramik Yenileme');
  const [quoteProductName, setQuoteProductName] = useState('60x120 Calacatta Mermer Porselen');
  const [quoteProductCode, setQuoteProductCode] = useState('SB-60120');
  const [quoteProductImageUrl, setQuoteProductImageUrl] = useState('/hero/hero_ceramics.jpg');
  const [quoteAreaM2, setQuoteAreaM2] = useState(45);
  const [quoteWastePercent, setQuoteWastePercent] = useState(10);
  const [quoteUnitPriceM2, setQuoteUnitPriceM2] = useState(480);
  const [quoteDiscountPercent, setQuoteDiscountPercent] = useState(5);
  const [quoteIncludeAdhesive, setQuoteIncludeAdhesive] = useState(true);
  const [quoteAdhesiveUnitPriceBag, setQuoteAdhesiveUnitPriceBag] = useState(240);
  const [quoteAdhesiveManualBags, setQuoteAdhesiveManualBags] = useState('');
  const [quoteIncludeGrout, setQuoteIncludeGrout] = useState(true);
  const [quoteGroutUnitPriceKg, setQuoteGroutUnitPriceKg] = useState(45);
  const [quoteGroutManualKg, setQuoteGroutManualKg] = useState('');
  const [quoteLaborCostTotal, setQuoteLaborCostTotal] = useState(2500);
  const [quoteShippingCostTotal, setQuoteShippingCostTotal] = useState(750);
  const [quoteNotes, setQuoteNotes] = useState('Teklif geçerlilik süresi 15 gündür. Malzemeler paletli sevk edilir.');
  const [quoteCreating, setQuoteCreating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [savedQuotesList, setSavedQuotesList] = useState([]);

  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    if (!dealerInfo) return;
    setQuoteCreating(true);

    try {
      const res = await fetch('/api/dealers/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerInfo.id,
          customerName: quoteCustomerName,
          customerPhone: quoteCustomerPhone,
          customerEmail: quoteCustomerEmail,
          projectName: quoteProjectName,
          productName: quoteProductName,
          productCode: quoteProductCode,
          productImageUrl: quoteProductImageUrl,
          areaM2: quoteAreaM2,
          wastePercent: quoteWastePercent,
          unitPriceM2: quoteUnitPriceM2,
          discountPercent: quoteDiscountPercent,
          includeAdhesive: quoteIncludeAdhesive,
          adhesiveUnitPriceBag: quoteAdhesiveUnitPriceBag,
          adhesiveManualBags: quoteAdhesiveManualBags || null,
          includeGrout: quoteIncludeGrout,
          groutUnitPriceKg: quoteGroutUnitPriceKg,
          groutManualKg: quoteGroutManualKg || null,
          laborCostTotal: quoteLaborCostTotal,
          shippingCostTotal: quoteShippingCostTotal,
          notes: quoteNotes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedQuote(data.quote);
        setSavedQuotesList(prev => [data.quote, ...prev]);
        setShowQuoteModal(false);
      } else {
        alert(data.error || 'Teklif oluşturulurken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Quote Generation Error:', err);
      alert('Teklif oluşturulurken sistemsel bir hata oluştu.');
    } finally {
      setQuoteCreating(false);
    }
  };

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
    if (tabId === 'settings') {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  };

  const hasPending = saasInfo?.status === 'PENDING_APPROVAL' || saasInfo?.pendingStatus === 'PENDING_APPROVAL';
  const requestedPlan = saasInfo?.status === 'PENDING_APPROVAL' ? saasInfo.plan : (saasInfo?.pendingStatus === 'PENDING_APPROVAL' ? saasInfo.pendingPlan : null);
  const isRejected = saasInfo?.status === 'REJECTED' || saasInfo?.pendingStatus === 'REJECTED';

  // Profile Form State
  const [showSettings, setShowSettings] = useState(false);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLat, setProfileLat] = useState('');
  const [profileLng, setProfileLng] = useState('');
  const [profileLogoUrl, setProfileLogoUrl] = useState('');
  const [profileBannerUrl, setProfileBannerUrl] = useState('');
  const [profileShowroomImages, setProfileShowroomImages] = useState('');
  const [profileVirtualTourUrl, setProfileVirtualTourUrl] = useState('');
  const [profileSpecialConcepts, setProfileSpecialConcepts] = useState('');
  const [profileAboutText, setProfileAboutText] = useState('');
  const [profileLogisticsServices, setProfileLogisticsServices] = useState('shipping,showroom_stock,credit_card,install_support');
  const [profileFeaturedProducts, setProfileFeaturedProducts] = useState([]);
  const [profileDealerCampaigns, setProfileDealerCampaigns] = useState([]);
  const [profileReferenceProjects, setProfileReferenceProjects] = useState([]);
  const [profileDealerFaqs, setProfileDealerFaqs] = useState([]);
  const [profileDealerStats, setProfileDealerStats] = useState({ experience: '10+ Yıl', happyClients: '500+', showroomArea: '200 m²' });
  const [profilePdfCatalogUrl, setProfilePdfCatalogUrl] = useState('');
  const [profilePdfCatalogName, setProfilePdfCatalogName] = useState('');
  const [profileThemePreset, setProfileThemePreset] = useState('GOLD');
  const [profileThemePrimary, setProfileThemePrimary] = useState('#d4af37');
  const [actionStats, setActionStats] = useState({ views: 0, whatsapp: 0, phone: 0, directions: 0, pdfDownload: 0, totalInteractions: 0 });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const safeParseJSON = (str, fallback) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  };

  // Upload States
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploading360, setIsUploading360] = useState(false);
  const [upload360Success, setUpload360Success] = useState('');
  const [upload360Error, setUpload360Error] = useState('');

  // New Dealer Registration State
  const [registerTab, setRegisterTab] = useState('login'); // 'login' or 'register'
  const [brands, setBrands] = useState([]);
  const [regName, setRegName] = useState('');
  const [regBrandId, setRegBrandId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regLat, setRegLat] = useState('');
  const [regLng, setRegLng] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  // Load brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands');
        if (res.ok) {
          const data = await res.json();
          setBrands(data);
        }
      } catch (err) {
        console.error('Failed to load brands:', err);
      }
    };
    fetchBrands();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'register') {
        setRegisterTab('register');
      }
    }
  }, []);

  const handleGeocode = async () => {
    if (!regAddress || !regCity || !regDistrict) {
      setRegError('Konum bulabilmemiz için lütfen önce Şube Adresi, İlçe ve Şehir alanlarını doldurun.');
      return;
    }
    setIsGeocoding(true);
    setRegError('');
    setRegSuccess('');
    try {
      const query = `${regAddress} ${regDistrict} ${regCity}`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setRegLat(data[0].lat);
          setRegLng(data[0].lon);
          setRegSuccess('Harita konumunuz adresinizden başarıyla tespit edildi!');
        } else {
          // Fallback to district + city
          const fallbackQuery = `${regDistrict} ${regCity}`;
          const resFallback = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`);
          if (resFallback.ok) {
            const dataFallback = await resFallback.json();
            if (dataFallback && dataFallback.length > 0) {
              setRegLat(dataFallback[0].lat);
              setRegLng(dataFallback[0].lon);
              setRegSuccess('Tam adres bulunamadı, şube konumu ilçe merkezine göre ayarlandı.');
            } else {
              setRegError('Adresiniz haritada tespit edilemedi. Lütfen manuel koordinat girin.');
            }
          } else {
            setRegError('Konum bulucu servis yanıt vermedi. Lütfen manuel koordinat girin.');
          }
        }
      } else {
        setRegError('Konum bulucu servise erişilemedi. Lütfen manuel koordinat girin.');
      }
    } catch (err) {
      setRegError('Konum tespiti sırasında hata oluştu.');
      console.error(err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    if (!kvkkAccepted) {
      setRegError('Lütfen Bayi Sözleşmesi ve KVKK Aydınlatma Metni\'ni okuyup onaylayınız.');
      return;
    }
    setIsRegistering(true);

    try {
      const response = await fetch('/api/dealers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          brandId: regBrandId,
          phone: regPhone,
          email: regEmail,
          password: regPassword,
          address: regAddress,
          city: regCity,
          district: regDistrict,
          lat: parseFloat(regLat) || 40.9901,
          lng: parseFloat(regLng) || 29.0278
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setRegSuccess('Bayilik kayıt başvurunuz başarıyla alındı! Yönetici onayından sonra giriş yapabilirsiniz.');
        // Reset form
        setRegName('');
        setRegBrandId('');
        setRegEmail('');
        setRegPassword('');
        setRegPhone('');
        setRegAddress('');
        setRegCity('');
        setRegDistrict('');
        setRegLat('');
        setRegLng('');
        setKvkkAccepted(false);
        setTimeout(() => {
          setRegisterTab('login');
          setRegSuccess('');
        }, 5000);
      } else {
        setRegError(result.error || 'Başvuru gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      setRegError('Sunucu bağlantı hatası.');
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('sb_dealer_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setDealerInfo(session);
        setIsLoggedIn(true);
        // Initialize profile form
        setProfilePhone(session.phone || '');
        setProfileAddress(session.address || '');
        setProfilePassword(session.password || '');
        setProfileLat(session.lat ? String(session.lat) : '');
        setProfileLng(session.lng ? String(session.lng) : '');
        setProfileLogoUrl(session.logoUrl || '');
        setProfileBannerUrl(session.bannerUrl || '');
        setProfileShowroomImages(session.showroomImages || '');
        setProfileVirtualTourUrl(session.virtualTourUrl || '');
        setProfileSpecialConcepts(session.specialConcepts || '');
        setProfileAboutText(session.aboutText || '');
        setProfileLogisticsServices(session.logisticsServices || 'shipping,showroom_stock,credit_card,install_support');
        setProfileFeaturedProducts(safeParseJSON(session.featuredProducts, []));
        setProfileDealerCampaigns(safeParseJSON(session.dealerCampaigns, []));
        setProfileReferenceProjects(safeParseJSON(session.referenceProjects, []));
        setProfileDealerFaqs(safeParseJSON(session.dealerFaqs, []));
        setProfileDealerStats(safeParseJSON(session.dealerStats, { experience: '10+ Yıl', happyClients: '500+', showroomArea: '200 m²' }));
        setProfilePdfCatalogUrl(session.pdfCatalogUrl || '');
        setProfilePdfCatalogName(session.pdfCatalogName || '');
        setProfileThemePreset(session.themePreset || 'GOLD');
        setProfileThemePrimary(session.themePrimary || '#d4af37');
      } catch (err) {
        console.error('Session restore failed:', err);
      }
    }
  }, []);

  // Load leads and projects once logged in
  useEffect(() => {
    if (isLoggedIn && dealerInfo) {
      loadDealerLeads();
      loadDealerProjects();
      loadBankDetails();
      loadBrandProducts();
      loadDealerInventory();
      loadDealerOutletListings();
    }
  }, [isLoggedIn, dealerInfo]);

  const loadBrandProducts = async () => {
    if (!dealerInfo?.brandId) return;
    try {
      const res = await fetch(`/api/admin/products?brandId=${dealerInfo.brandId}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBrandProducts(data.products || []);
        }
      }
    } catch (err) {
      console.error('Failed to load brand products:', err);
    }
  };

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

  const loadDealerLeads = async () => {
    if (!dealerInfo) return;
    setLeadsLoading(true);
    try {
      const res = await fetch(`/api/dealers/my-leads?dealerId=${dealerInfo.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads);
          setStats(data.stats);
          setSaasInfo(data.saas);
          if (data.regionalAnalytics) {
            setRegionalAnalytics(data.regionalAnalytics);
          }
          if (data.actionStats) {
            setActionStats(data.actionStats);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadDealerInventory = async () => {
    if (!dealerInfo) return;
    setInventoryLoading(true);
    try {
      const res = await fetch(`/api/dealers/inventory?dealerId=${dealerInfo.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInventoryList(data.inventory || []);
          setXmlFeedUrlInput(data.xmlFeedUrl || '');
        }
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const loadDealerOutletListings = async () => {
    if (!dealerInfo) return;
    setOutletLoading(true);
    try {
      const res = await fetch(`/api/dealers/outlet?dealerId=${dealerInfo.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOutletListings(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load outlet listings:', err);
    } finally {
      setOutletLoading(false);
    }
  };

  const handleAddOutletListing = async (e) => {
    e.preventDefault();
    if (!dealerInfo || !outletTitle || !outletQuantityM2 || !outletUnitPrice) {
      setOutletError('Lütfen tüm zorunlu alanları (İlan Başlığı, Metraj, Birim İndirimli Fiyat) doldurun.');
      return;
    }
    setOutletError('');
    setOutletSuccess('');

    try {
      const res = await fetch('/api/dealers/outlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerInfo.id,
          productId: outletProductId || null,
          title: outletTitle,
          category: outletCategory,
          badgeTag: outletBadgeTag,
          quantityM2: outletQuantityM2,
          unitPrice: outletUnitPrice,
          originalPrice: outletOriginalPrice || null,
          dimensions: outletDimensions,
          colorFinish: outletColorFinish,
          imageUrl: outletImageUrl || null,
          notes: outletNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOutletSuccess('Outlet/Proje Fazlası ilanınız başarıyla eklendi!');
        setShowAddOutletModal(false);
        setOutletTitle('');
        setOutletQuantityM2('');
        setOutletUnitPrice('');
        setOutletOriginalPrice('');
        setOutletNotes('');
        setOutletImageUrl('');
        setOutletProductId('');
        loadDealerOutletListings();
      } else {
        setOutletError(data.error || 'İlan eklenirken hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setOutletError('Sistemsel hata oluştu.');
    }
  };

  const handleToggleOutletStatus = async (item) => {
    if (!dealerInfo) return;
    const newStatus = item.status === 'ACTIVE' ? 'SOLD' : 'ACTIVE';
    try {
      const res = await fetch('/api/dealers/outlet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          dealerId: dealerInfo.id,
          status: newStatus
        })
      });
      if (res.ok) {
        loadDealerOutletListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOutletListing = async (id) => {
    if (!dealerInfo || !confirm('Bu outlet/proje fazlası ilanını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/dealers/outlet?id=${id}&dealerId=${dealerInfo.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadDealerOutletListings();
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvContentInput.trim() || !dealerInfo) return;
    setCsvLoading(true);
    setInventorySuccess('');
    setInventoryError('');

    try {
      const res = await fetch('/api/dealers/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_csv',
          dealerId: dealerInfo.id,
          csvContent: csvContentInput
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventorySuccess(`CSV başarıyla yüklendi! ${data.successCount} ürün güncellendi/eklendi. ${data.errorCount} hata oluştu.`);
        if (data.errors && data.errors.length > 0) {
          setInventoryError(`Hatalar: ${data.errors.join(', ')}`);
        }
        setCsvContentInput('');
        loadDealerInventory();
      } else {
        setInventoryError(data.error || 'CSV yüklenirken hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setInventoryError('Bağlantı hatası.');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleSaveXmlFeed = async (e) => {
    e.preventDefault();
    if (!dealerInfo) return;
    setInventorySuccess('');
    setInventoryError('');

    try {
      const res = await fetch('/api/dealers/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_xml_feed',
          dealerId: dealerInfo.id,
          xmlFeedUrl: xmlFeedUrlInput
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventorySuccess('XML Feed linki başarıyla kaydedildi.');
        setXmlFeedUrlInput(data.xmlFeedUrl || '');
      } else {
        setInventoryError(data.error || 'Link kaydedilemedi.');
      }
    } catch (err) {
      console.error(err);
      setInventoryError('Bağlantı hatası.');
    }
  };

  const handleXmlSync = async () => {
    if (!dealerInfo) return;
    setXmlSyncLoading(true);
    setInventorySuccess('');
    setInventoryError('');

    try {
      const res = await fetch('/api/dealers/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'xml_sync',
          dealerId: dealerInfo.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventorySuccess(`XML eşitleme tamamlandı! ${data.successCount} ürün başarıyla eşitlendi.`);
        loadDealerInventory();
      } else {
        setInventoryError(data.error || 'XML eşitleme başarısız oldu.');
      }
    } catch (err) {
      console.error(err);
      setInventoryError('Bağlantı hatası veya zaman aşımı.');
    } finally {
      setXmlSyncLoading(false);
    }
  };

  const handleDeleteInventoryItem = async (productId) => {
    if (!dealerInfo || !confirm('Bu ürünü envanterinizden silmek istediğinize emin misiniz?')) return;
    setInventorySuccess('');
    setInventoryError('');

    try {
      const res = await fetch('/api/dealers/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_item',
          dealerId: dealerInfo.id,
          productId
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventorySuccess('Ürün envanterden silindi.');
        loadDealerInventory();
      } else {
        setInventoryError(data.error || 'Ürün silinemedi.');
      }
    } catch (err) {
      console.error(err);
      setInventoryError('Bağlantı hatası.');
    }
  };

  const handleUpdateInventoryItem = async (productId, stock, price, status) => {
    if (!dealerInfo) return;
    setInventorySuccess('');
    setInventoryError('');

    try {
      const res = await fetch('/api/dealers/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_item',
          dealerId: dealerInfo.id,
          productId,
          stock: parseFloat(stock) || 0,
          price: price ? parseFloat(price) : null,
          status: status || 'IN_STOCK'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventorySuccess('Ürün envanterinizde güncellendi.');
        loadDealerInventory();
      } else {
        setInventoryError(data.error || 'Güncelleme başarısız.');
      }
    } catch (err) {
      console.error(err);
      setInventoryError('Bağlantı hatası.');
    }
  };

  const handleAddInventoryItem = async (e) => {
    e.preventDefault();
    if (!dealerInfo || !addInventoryProduct) return;
    setInventorySuccess('');
    setInventoryError('');

    try {
      const res = await fetch('/api/dealers/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_item',
          dealerId: dealerInfo.id,
          productId: addInventoryProduct,
          stock: parseFloat(addInventoryStock) || 0,
          price: addInventoryPrice ? parseFloat(addInventoryPrice) : null,
          status: addInventoryStatus
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInventorySuccess('Ürün başarıyla envantere eklendi.');
        setShowAddInventoryModal(false);
        setAddInventoryProduct('');
        setAddInventoryStock('0');
        setAddInventoryPrice('');
        setAddInventoryStatus('IN_STOCK');
        loadDealerInventory();
      } else {
        setInventoryError(data.error || 'Ürün eklenemedi.');
      }
    } catch (err) {
      console.error(err);
      setInventoryError('Bağlantı hatası.');
    }
  };

  const loadDealerProjects = async () => {
    if (!dealerInfo) return;
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/projects/list?dealerId=${dealerInfo.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.error('Failed to load B2B projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSendPaymentNotification = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentSuccess('');
    setPaymentError('');

    try {
      const response = await fetch('/api/dealers/saas-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerInfo.id,
          plan: selectedPaymentPlan,
          paymentSender: paymentSenderName,
          paymentDate: paymentDate,
          paymentNote: paymentNote
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPaymentSuccess(`Ödeme bildiriminiz başarıyla iletildi. Talebiniz admin onayına gönderilmiştir.`);
        loadDealerLeads();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/dealers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setDealerInfo(data.dealer);
        localStorage.setItem('sb_dealer_session', JSON.stringify(data.dealer));
        setIsLoggedIn(true);

        // Initialize profile form fields
        setProfilePhone(data.dealer.phone || '');
        setProfileAddress(data.dealer.address || '');
        setProfilePassword(password); // use the successfully typed password
        setProfileLat(data.dealer.lat ? String(data.dealer.lat) : '');
        setProfileLng(data.dealer.lng ? String(data.dealer.lng) : '');
        setProfileLogoUrl(data.dealer.logoUrl || '');
        setProfileBannerUrl(data.dealer.bannerUrl || '');
        setProfileShowroomImages(data.dealer.showroomImages || '');
        setProfileVirtualTourUrl(data.dealer.virtualTourUrl || '');
        setProfileSpecialConcepts(data.dealer.specialConcepts || '');
        setProfileAboutText(data.dealer.aboutText || '');
        setProfileLogisticsServices(data.dealer.logisticsServices || 'shipping,showroom_stock,credit_card,install_support');
        setProfileFeaturedProducts(safeParseJSON(data.dealer.featuredProducts, []));
        setProfileDealerCampaigns(safeParseJSON(data.dealer.dealerCampaigns, []));
        setProfileReferenceProjects(safeParseJSON(data.dealer.referenceProjects, []));
        setProfileDealerFaqs(safeParseJSON(data.dealer.dealerFaqs, []));
        setProfileDealerStats(safeParseJSON(data.dealer.dealerStats, { experience: '10+ Yıl', happyClients: '500+', showroomArea: '200 m²' }));
        setProfileThemePreset(data.dealer.themePreset || 'GOLD');
        setProfileThemePrimary(data.dealer.themePrimary || '#d4af37');
      } else {
        setLoginError(data.error || 'Giriş başarısız oldu.');
      }
    } catch (err) {
      setLoginError('Sunucu bağlantı hatası.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sb_dealer_session');
    setIsLoggedIn(false);
    setDealerInfo(null);
    setLeads([]);
    setEmailOrPhone('');
    setPassword('');
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    if (!dealerInfo) return;
    try {
      const res = await fetch('/api/dealers/my-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          dealerId: dealerInfo.id,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        loadDealerLeads();
      } else {
        alert('Durum güncellenemedi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!dealerInfo) return;
    if (!confirm('Bu teklif talebini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/dealers/my-leads?leadId=${leadId}&dealerId=${dealerInfo.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadDealerLeads();
      } else {
        alert('Talep silinemedi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/dealers/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: reader.result,
            filename: file.name,
            folder: 'seramikbak/logos'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileLogoUrl(data.url);
        } else {
          alert(data.error || 'Logo yüklenemedi.');
        }
      } catch (err) {
        console.error(err);
        alert('Bağlantı hatası.');
      } finally {
        setIsUploadingLogo(false);
      }
    };
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingBanner(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/dealers/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: reader.result,
            filename: file.name,
            folder: 'seramikbak/banners'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileBannerUrl(data.url);
        } else {
          alert(data.error || 'Banner görseli yüklenemedi.');
        }
      } catch (err) {
        console.error(err);
        alert('Bağlantı hatası.');
      } finally {
        setIsUploadingBanner(false);
      }
    };
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('PDF dosyası maksimum 25MB olabilir.');
      return;
    }
    setIsUploadingPdf(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/dealers/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: reader.result,
            filename: file.name,
            folder: 'seramikbak/catalogs'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfilePdfCatalogUrl(data.url);
          if (!profilePdfCatalogName) {
            setProfilePdfCatalogName(file.name.replace(/\.[^/.]+$/, ""));
          }
        } else {
          alert(data.error || 'PDF kataloğu yüklenemedi.');
        }
      } catch (err) {
        console.error(err);
        alert('Bağlantı hatası.');
      } finally {
        setIsUploadingPdf(false);
      }
    };
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/dealers/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: reader.result,
            filename: file.name,
            folder: 'seramikbak/showroom_photos'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const currentImages = profileShowroomImages ? profileShowroomImages.split(',').filter(Boolean) : [];
          currentImages.push(data.url);
          setProfileShowroomImages(currentImages.join(', '));
        } else {
          alert(data.error || 'Dosya yüklenemedi.');
        }
      } catch (err) {
        console.error(err);
        alert('Bağlantı hatası.');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
  };

  const handle360ImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUpload360Error('Görsel boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }
    setIsUploading360(true);
    setUpload360Error('');
    setUpload360Success('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/dealers/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: reader.result,
            filename: file.name,
            folder: 'seramikbak/showroom_360'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileVirtualTourUrl(data.url);
          setUpload360Success('360° Panoramik fotoğraf başarıyla yüklendi!');
        } else {
          setUpload360Error(data.error || 'Dosya yüklenemedi.');
        }
      } catch (err) {
        console.error(err);
        setUpload360Error('Bağlantı hatası oluştu.');
      } finally {
        setIsUploading360(false);
      }
    };
  };

  const toggleLogisticsService = (service) => {
    let services = profileLogisticsServices ? profileLogisticsServices.split(',').filter(Boolean) : [];
    if (services.includes(service)) {
      services = services.filter(s => s !== service);
    } else {
      services.push(service);
    }
    setProfileLogisticsServices(services.join(','));
  };

  const toggleFeaturedProduct = (productId) => {
    if (profileFeaturedProducts.includes(productId)) {
      setProfileFeaturedProducts(profileFeaturedProducts.filter(id => id !== productId));
    } else {
      setProfileFeaturedProducts([...profileFeaturedProducts, productId]);
    }
  };

  const addCampaign = () => {
    setProfileDealerCampaigns([...profileDealerCampaigns, { title: '', desc: '', expiresAt: '' }]);
  };

  const updateCampaign = (index, field, value) => {
    const updated = [...profileDealerCampaigns];
    updated[index][field] = value;
    setProfileDealerCampaigns(updated);
  };

  const removeCampaign = (index) => {
    setProfileDealerCampaigns(profileDealerCampaigns.filter((_, i) => i !== index));
  };

  const addReferenceProject = () => {
    setProfileReferenceProjects([...profileReferenceProjects, { title: '', desc: '', imageUrl: '' }]);
  };

  const updateReferenceProject = (index, field, value) => {
    const updated = [...profileReferenceProjects];
    updated[index][field] = value;
    setProfileReferenceProjects(updated);
  };

  const removeReferenceProject = (index) => {
    setProfileReferenceProjects(profileReferenceProjects.filter((_, i) => i !== index));
  };

  const addFaq = () => {
    setProfileDealerFaqs([...profileDealerFaqs, { q: '', a: '' }]);
  };

  const updateFaq = (index, field, value) => {
    const updated = [...profileDealerFaqs];
    updated[index][field] = value;
    setProfileDealerFaqs(updated);
  };

  const removeFaq = (index) => {
    setProfileDealerFaqs(profileDealerFaqs.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!dealerInfo) return;
    setIsSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dealerInfo.id,
          phone: profilePhone,
          address: profileAddress,
          password: profilePassword,
          lat: parseFloat(profileLat) || dealerInfo.lat,
          lng: parseFloat(profileLng) || dealerInfo.lng,
          logoUrl: profileLogoUrl,
          bannerUrl: profileBannerUrl,
          showroomImages: profileShowroomImages,
          virtualTourUrl: profileVirtualTourUrl,
          specialConcepts: profileSpecialConcepts,
          aboutText: profileAboutText,
          logisticsServices: profileLogisticsServices,
          featuredProducts: JSON.stringify(profileFeaturedProducts),
          dealerCampaigns: JSON.stringify(profileDealerCampaigns),
          referenceProjects: JSON.stringify(profileReferenceProjects),
          dealerFaqs: JSON.stringify(profileDealerFaqs),
          dealerStats: JSON.stringify(profileDealerStats),
          pdfCatalogUrl: profilePdfCatalogUrl,
          pdfCatalogName: profilePdfCatalogName,
          themePreset: profileThemePreset,
          themePrimary: profileThemePrimary,
          status: 'APPROVED' // Keep approved status
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setProfileSuccess('Profil bilgileriniz başarıyla güncellendi.');
        // Update local state and storage session
        const updatedSession = {
          ...dealerInfo,
          phone: profilePhone,
          address: profileAddress,
          lat: parseFloat(profileLat) || dealerInfo.lat,
          lng: parseFloat(profileLng) || dealerInfo.lng,
          logoUrl: profileLogoUrl,
          bannerUrl: profileBannerUrl,
          showroomImages: profileShowroomImages,
          virtualTourUrl: profileVirtualTourUrl,
          specialConcepts: profileSpecialConcepts,
          aboutText: profileAboutText,
          logisticsServices: profileLogisticsServices,
          featuredProducts: JSON.stringify(profileFeaturedProducts),
          dealerCampaigns: JSON.stringify(profileDealerCampaigns),
          referenceProjects: JSON.stringify(profileReferenceProjects),
          dealerFaqs: JSON.stringify(profileDealerFaqs),
          dealerStats: JSON.stringify(profileDealerStats),
          pdfCatalogUrl: profilePdfCatalogUrl,
          pdfCatalogName: profilePdfCatalogName,
          themePreset: profileThemePreset,
          themePrimary: profileThemePrimary
        };
        setDealerInfo(updatedSession);
        localStorage.setItem('sb_dealer_session', JSON.stringify(updatedSession));
      } else {
        setProfileError(data.error || 'Profil güncellenemedi.');
      }
    } catch (err) {
      setProfileError('Bağlantı hatası.');
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

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
            padding: isMobile ? '24px 16px' : '40px',
            width: '100%',
            maxWidth: registerTab === 'login' ? '450px' : '700px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.05)',
            transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box'
          }}>
          {/* Header */}
          <div className="login-header" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: '16px',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'color 0.2s'
            }} className="hover-gold-text">
              <ArrowLeft size={14} /> Ana Sayfaya Dön
            </Link>
            <div className="logo-icon" style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #111 0%, #1e293b 100%)',
              color: '#d4af37',
              border: '1px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.4rem',
              margin: '0 auto 12px auto',
              boxShadow: '0 0 15px rgba(212,175,55,0.25)'
            }}>SB</div>
            <h3 style={{ 
              fontSize: '1.45rem', 
              fontWeight: '800', 
              color: '#fff', 
              margin: '0 0 6px 0',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              letterSpacing: '-0.02em'
            }}>Bayi İş Ortaklığı Portalı</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Yetkili satıcılar için stok, teklif ve müşteri talepleri yönetim merkezi.
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <button
              type="button"
              onClick={() => { setRegisterTab('login'); setLoginError(''); setRegError(''); setRegSuccess(''); }}
              style={{
                background: registerTab === 'login' ? '#d4af37' : 'transparent',
                border: 'none',
                padding: '10px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: registerTab === 'login' ? '#090d16' : '#94a3b8',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Yetkili Girişi
            </button>
            <button
              type="button"
              onClick={() => { setRegisterTab('register'); setLoginError(''); setRegError(''); setRegSuccess(''); }}
              style={{
                background: registerTab === 'register' ? '#d4af37' : 'transparent',
                border: 'none',
                padding: '10px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: registerTab === 'register' ? '#090d16' : '#94a3b8',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Bayilik Başvurusu
            </button>
          </div>

          {/* LOGIN FORM */}
          {registerTab === 'login' ? (
            <div className="login-form-wrapper">
              {loginError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '18px'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-posta veya Telefon</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      placeholder="bayi@seramik.com veya 0216..."
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 42px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.85rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      className="login-input"
                    />
                    <User size={15} style={{ position: 'absolute', left: '15px', top: '15px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Şifre</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 42px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.85rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      className="login-input"
                    />
                    <Lock size={15} style={{ position: 'absolute', left: '15px', top: '15px', color: '#94a3b8' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    transition: 'all 0.2s'
                  }}
                  className="login-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Doğrulanıyor...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Bayi Girişi Yap</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div className="register-form-wrapper">
              {regSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '18px'
                }}>
                  <CheckCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{regSuccess}</span>
                </div>
              )}

              {regError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '18px'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="campaign-inputs-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Bayi Adı / Şube</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      placeholder="Örn: Seramik Sarayı Kadıköy"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none'
                      }}
                      className="login-input"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Yetkili Marka</label>
                    <select
                      value={regBrandId}
                      onChange={(e) => setRegBrandId(e.target.value)}
                      required
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        background: '#0f172a',
                        color: '#fff',
                        outline: 'none'
                      }}
                      className="login-input"
                    >
                      <option value="">Seçiniz...</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="campaign-inputs-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>E-posta</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="bayi@mail.com"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none'
                      }}
                      className="login-input"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Telefon</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                      placeholder="0216 123 4567"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none'
                      }}
                      className="login-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Şifre</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Min. 6 karakter"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      outline: 'none'
                    }}
                    className="login-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="campaign-inputs-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>İlçe</label>
                    <input
                      type="text"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      required
                      placeholder="Kadıköy"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none'
                      }}
                      className="login-input"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Şehir</label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      required
                      placeholder="İstanbul"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none'
                      }}
                      className="login-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Şube Açık Adresi</label>
                  <textarea
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    required
                    placeholder="Göztepe Mah. Bağdat Cad. No:120"
                    rows={2}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                    className="login-input"
                  />
                </div>

                {/* Lat Lng Geocoding helper */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: isMobile ? '8px' : '0px'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#cbd5e1', textAlign: isMobile ? 'center' : 'left' }}>Harita Koordinatları</span>
                    <button
                      type="button"
                      onClick={handleGeocode}
                      disabled={isGeocoding}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        color: '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      {isGeocoding ? <Loader2 size={10} className="animate-spin" /> : <MapPin size={10} />}
                      <span>{isGeocoding ? 'Aranıyor...' : 'Adresten Konumu Bul'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: '600', color: '#94a3b8' }}>Enlem (Lat)</label>
                      <input
                        type="text"
                        value={regLat}
                        onChange={(e) => setRegLat(e.target.value)}
                        required
                        placeholder="Örn: 40.9901"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          outline: 'none',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: '600', color: '#94a3b8' }}>Boylam (Lng)</label>
                      <input
                        type="text"
                        value={regLng}
                        onChange={(e) => setRegLng(e.target.value)}
                        required
                        placeholder="Örn: 29.0278"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          outline: 'none',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '6px' }}>
                  <input 
                    type="checkbox" 
                    id="kvkk-check" 
                    checked={kvkkAccepted} 
                    onChange={(e) => setKvkkAccepted(e.target.checked)} 
                    required
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="kvkk-check" style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" style={{ color: '#d4af37', fontWeight: '600', textDecoration: 'underline' }}>KVKK Aydınlatma Metni'ni</Link> ve <Link href="/yasal?tab=bayi-sozlesme" target="_blank" style={{ color: '#d4af37', fontWeight: '600', textDecoration: 'underline' }}>Bayi Üyelik Sözleşmesi'ni</Link> okudum, kabul ediyorum.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  style={{
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    marginTop: '6px'
                  }}
                  className="login-btn"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Başvuru İletiliyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Kayıt Başvurusunu Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer security badge */}
          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '0.72rem',
            color: '#64748b',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '16px'
          }}>
            🔒 SSL ve Yetkili Bayi Ağ Güvenliği Koruması Altındadır.
          </div>

        </div>
      </main>

      {/* Local styles for login/registration */}
      <style jsx>{`
        @media (max-width: 768px) {
          .login-card {
            padding: 24px 16px !important;
            border-radius: 16px !important;
          }
          .campaign-inputs-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1f2937 100%)',
      color: '#ffffff',
      fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflowX: 'hidden'
    }}>
      {/* Sol Sidebar Navigasyon */}
      {!isMobile && (
        <aside style={{
          width: isSidebarCollapsed ? '70px' : '280px',
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(212, 175, 55, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          flexShrink: 0
        }}>
          {/* Top Part of Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Logo & Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #111 0%, #1e293b 100%)',
                    color: '#d4af37',
                    border: '1px solid #d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1rem',
                    boxShadow: '0 0 10px rgba(212,175,55,0.2)'
                  }}>SB</div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', margin: 0 }}>SeramikBak</h4>
                    <span style={{ fontSize: '0.62rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bayi Portalı</span>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isSidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
              </button>
            </div>

            {/* Profile Card inside Sidebar */}
            {!isSidebarCollapsed && dealerInfo && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dealerInfo.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={10} />
                  <span>{dealerInfo.district}, {dealerInfo.city}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', fontWeight: '700' }}>
                    {dealerInfo.brandName} Bayisi
                  </span>
                  {saasInfo && (
                    <span style={{ 
                      fontSize: '0.62rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: saasInfo.plan === 'PREMIUM' ? 'linear-gradient(135deg, #111 0%, #333 100%)' : '#d4af37', 
                      color: saasInfo.plan === 'PREMIUM' ? '#d4af37' : '#000', 
                      fontWeight: '700' 
                    }}>
                      {saasInfo.plan}
                    </span>
                  )}
                </div>

                {/* Showroom Public Page Link */}
                <a
                  href={`/bayi/${dealerInfo.name ? slugify(dealerInfo.name) : dealerInfo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    textDecoration: 'none',
                    marginTop: '4px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2)'
                  }}
                  title="Showroom / Bayi Sayfanızı Müşteri Tarafında Görüntüleyin"
                >
                  <ExternalLink size={12} />
                  <span>Showroom Sayfamı Gör</span>
                </a>
              </div>
            )}

            {/* Navigation Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'dashboard', label: 'Gösterge Paneli', icon: <Activity size={18} /> },
                { id: 'quick-quote', label: 'PDF Teklif Oluştur', icon: <Calculator size={18} /> },
                { id: 'b2b-projects', label: 'Proje Talepleri (B2B)', icon: <Building2 size={18} /> },
                { id: 'analytics', label: 'Bölge Analitiği', icon: <TrendingUp size={18} /> },
                { id: 'inventory', label: 'Envanter & Stok', icon: <Package size={18} /> },
                { id: 'outlet-exchange', label: 'Outlet & Proje Fazlası', icon: <Sparkles size={18} /> },
                { id: 'subscription', label: 'Abonelik Yönetimi', icon: <CreditCard size={18} /> },
                { id: 'settings', label: 'Şube Ayarları', icon: <Settings size={18} /> },
              ].map(link => {
                const isActive = activePortalTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActivePortalTab(link.id);
                      if (link.id === 'settings') {
                        setShowSettings(true);
                      } else {
                        setShowSettings(false);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 14px',
                      background: isActive ? 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isActive ? '#090d16' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? '800' : '600',
                      textAlign: 'left',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      transition: 'all 0.2s'
                    }}
                    title={link.label}
                    className={isActive ? "" : "hover-gold-text"}
                  >
                    {link.icon}
                    {!isSidebarCollapsed && <span>{link.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Part of Sidebar - Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '600',
              textAlign: 'left',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s'
            }}
            title="Güvenli Çıkış"
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Çıkış Yap</span>}
          </button>
        </aside>
      )}

      {/* Content Area on the right */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky Top Header */}
        <header style={{
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          padding: isMobile ? '12px 16px' : '16px 24px'
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
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', margin: 0 }}>{dealerInfo ? dealerInfo.name : 'SeramikBak'}</h4>
                  <span style={{ fontSize: '0.62rem', color: '#d4af37', fontWeight: '700' }}>
                    {activePortalTab === 'dashboard' && 'Gösterge Paneli'}
                    {activePortalTab === 'quick-quote' && 'PDF Teklif'}
                    {activePortalTab === 'b2b-projects' && 'Proje Talepleri'}
                    {activePortalTab === 'analytics' && 'Arama Analitiği'}
                    {activePortalTab === 'inventory' && 'Envanter & Stok'}
                    {activePortalTab === 'outlet-exchange' && 'Outlet & Proje Fazlası'}
                    {activePortalTab === 'subscription' && 'Abonelik & SaaS'}
                    {activePortalTab === 'settings' && 'Şube Ayarları'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dealerInfo && (
                  <a
                    href={`/bayi/${dealerInfo.name ? slugify(dealerInfo.name) : dealerInfo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.62rem',
                      color: '#d4af37',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                    title="Showroom Sayfası"
                  >
                    <ExternalLink size={10} />
                    <span>Showroom</span>
                  </a>
                )}
                {saasInfo && (
                  <span style={{
                    fontSize: '0.6rem',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: saasInfo.plan === 'PREMIUM' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                    color: saasInfo.plan === 'PREMIUM' ? '#d4af37' : '#cbd5e1',
                    fontWeight: '700'
                  }}>
                    {saasInfo.plan}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  {activePortalTab === 'dashboard' && 'Gösterge Paneli'}
                  {activePortalTab === 'quick-quote' && 'PDF Teklif Oluştur'}
                  {activePortalTab === 'b2b-projects' && 'B2B Proje Talepleri'}
                  {activePortalTab === 'analytics' && 'Bölgesel Arama Analitiği'}
                  {activePortalTab === 'inventory' && 'Envanter & Stok Yönetimi'}
                  {activePortalTab === 'outlet-exchange' && 'Bayiden Outlet & Proje Fazlası Borsası'}
                  {activePortalTab === 'subscription' && 'Abonelik & SaaS Yönetimi'}
                  {activePortalTab === 'settings' && 'Şube Ayarları & Görünüm'}
                </h2>
                {dealerInfo && (
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} style={{ color: '#d4af37' }} />
                    <span>{dealerInfo.district}, {dealerInfo.city}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>|</span>
                    <span>{dealerInfo.brandName} Yetkili Bayisi</span>
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {dealerInfo && (
                  <a
                    href={`/bayi/${dealerInfo.name ? slugify(dealerInfo.name) : dealerInfo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#d4af37',
                      fontWeight: '800',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover-gold-solid-btn"
                    title="Canlı Showroom Sayfanızı Yeni Sekmede Açın"
                  >
                    <ExternalLink size={13} />
                    <span>Showroom Sayfamı Gör</span>
                  </a>
                )}

                {saasInfo?.expiresAt && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    color: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Calendar size={13} style={{ color: '#d4af37' }} />
                    <span>Paket Bitiş: {new Date(saasInfo.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* PORTAL MAIN CONTENT */}
        <main className="dealer-main-content" style={{ padding: isMobile ? '16px 12px 80px 12px' : '32px', maxWidth: '1400px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          {activePortalTab === 'quick-quote' ? (
            /* QUICK QUOTE BUILDER TAB */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calculator size={24} style={{ color: '#d4af37' }} />
                    Kurumsal PDF Teklif Hazırlayıcı
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                    Müşterilerinize kendi logonuz, otomatik fire/derz hesabı ve WhatsApp paylaşım linkiyle profesyonel teklif hazırlayın.
                  </p>
                </div>
              </div>

              {/* Live Calculation Preview & Interactive Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr', gap: '24px', alignItems: 'start' }}>
                {/* Quick Quote Form Card */}
                <div className="quote-form-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: '#d4af37' }} />
                    Teklif ve Müşteri Parametreleri
                  </h3>

                  <form onSubmit={handleGenerateQuote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Müşteri Adı / Unvanı *</label>
                        <input 
                          type="text" 
                          value={quoteCustomerName} 
                          onChange={(e) => setQuoteCustomerName(e.target.value)} 
                          placeholder="Örn: Ahmet Yılmaz" 
                          required 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>WhatsApp / Telefon *</label>
                        <input 
                          type="text" 
                          value={quoteCustomerPhone} 
                          onChange={(e) => setQuoteCustomerPhone(e.target.value)} 
                          placeholder="Örn: 0532 123 45 67" 
                          required 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Proje / Mekan Adı</label>
                        <input 
                          type="text" 
                          value={quoteProjectName} 
                          onChange={(e) => setQuoteProjectName(e.target.value)} 
                          placeholder="Örn: Vadi Konutları Banyo Yenileme" 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Müşteri E-Posta (İsteğe Bağlı)</label>
                        <input 
                          type="email" 
                          value={quoteCustomerEmail} 
                          onChange={(e) => setQuoteCustomerEmail(e.target.value)} 
                          placeholder="Örn: ahmet@mail.com" 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Seçilen Seramik Modeli</label>
                        <input 
                          type="text" 
                          value={quoteProductName} 
                          onChange={(e) => setQuoteProductName(e.target.value)} 
                          placeholder="Örn: 60x120 Calacatta Mermer Porselen" 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Stok / SKU Kodu</label>
                        <input 
                          type="text" 
                          value={quoteProductCode} 
                          onChange={(e) => setQuoteProductCode(e.target.value)} 
                          placeholder="Örn: QUA-CAL-60120" 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Net Uygulama Alanı (m²) *</label>
                        <input 
                          type="number" 
                          value={quoteAreaM2} 
                          onChange={(e) => setQuoteAreaM2(e.target.value)} 
                          min={1} 
                          required 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Kesim Firesi Oranı (%)</label>
                        <select 
                          value={quoteWastePercent} 
                          onChange={(e) => setQuoteWastePercent(e.target.value)} 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        >
                          <option value={5}>%5 Fire (Düz / Standart Döşeme)</option>
                          <option value={10}>%10 Fire (Diyagonal / Balıksırtı)</option>
                          <option value={15}>%15 Fire (Girintili Çıkıntılı Mimari Plan)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Seramik m² Liste Fiyatı (₺) *</label>
                        <input 
                          type="number" 
                          value={quoteUnitPriceM2} 
                          onChange={(e) => setQuoteUnitPriceM2(e.target.value)} 
                          min={0} 
                          required 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Müşteri İskonto İndirimi (%)</label>
                        <input 
                          type="number" 
                          value={quoteDiscountPercent} 
                          onChange={(e) => setQuoteDiscountPercent(e.target.value)} 
                          min={0} 
                          max={100} 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                    </div>

                    {/* Consumables Toggle & Manual Input Section */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>Yapıştırıcı Harç & Derz Sarfiyat</div>

                      {/* Adhesive Row */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={quoteIncludeAdhesive} 
                            onChange={(e) => setQuoteIncludeAdhesive(e.target.checked)} 
                          />
                          <span>Yapıştırıcı Harç (25kg Torba) Ekle</span>
                        </label>
                        {quoteIncludeAdhesive && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '26px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Torba Adedi (Boş = otomatik)</label>
                              <input 
                                type="number" 
                                value={quoteAdhesiveManualBags} 
                                onChange={(e) => setQuoteAdhesiveManualBags(e.target.value)} 
                                placeholder="Otomatik" 
                                min={0} 
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} 
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Torba Birim Fiyatı (₺)</label>
                              <input 
                                type="number" 
                                value={quoteAdhesiveUnitPriceBag} 
                                onChange={(e) => setQuoteAdhesiveUnitPriceBag(e.target.value)} 
                                min={0} 
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} 
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Grout Row */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={quoteIncludeGrout} 
                            onChange={(e) => setQuoteIncludeGrout(e.target.checked)} 
                          />
                          <span>Derz Dolgusu (kg) Ekle</span>
                        </label>
                        {quoteIncludeGrout && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '26px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Derz Miktarı kg (Boş = otomatik)</label>
                              <input 
                                type="number" 
                                value={quoteGroutManualKg} 
                                onChange={(e) => setQuoteGroutManualKg(e.target.value)} 
                                placeholder="Otomatik" 
                                min={0} 
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} 
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700' }}>Derz Birim Fiyatı (₺/kg)</label>
                              <input 
                                type="number" 
                                value={quoteGroutUnitPriceKg} 
                                onChange={(e) => setQuoteGroutUnitPriceKg(e.target.value)} 
                                min={0} 
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>İşçilik & Uygulama Tutarı (₺)</label>
                        <input 
                          type="number" 
                          value={quoteLaborCostTotal} 
                          onChange={(e) => setQuoteLaborCostTotal(e.target.value)} 
                          min={0} 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Lojistik & Sevk Tutarı (₺)</label>
                        <input 
                          type="number" 
                          value={quoteShippingCostTotal} 
                          onChange={(e) => setQuoteShippingCostTotal(e.target.value)} 
                          min={0} 
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={quoteCreating} 
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '14px 20px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        marginTop: '10px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                      }}
                    >
                      {quoteCreating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>PDF Teklif Hazırlanıyor...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck size={18} style={{ color: '#d4af37' }} />
                          <span>PDF Teklif Üret & Onayla</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Live Calculation Preview Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(() => {
                    const calc = calculateQuote({
                      areaM2: quoteAreaM2,
                      wastePercent: quoteWastePercent,
                      unitPriceM2: quoteUnitPriceM2,
                      discountPercent: quoteDiscountPercent,
                      includeAdhesive: quoteIncludeAdhesive,
                      adhesiveUnitPriceBag: quoteAdhesiveUnitPriceBag,
                      adhesiveManualBags: quoteAdhesiveManualBags || null,
                      includeGrout: quoteIncludeGrout,
                      groutUnitPriceKg: quoteGroutUnitPriceKg,
                      groutManualKg: quoteGroutManualKg || null,
                      laborCostTotal: quoteLaborCostTotal,
                      shippingCostTotal: quoteShippingCostTotal
                    });

                    return (
                      <div className="quote-calc-card" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #d4af37', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 30px rgba(212,175,55,0.12)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CANLI HESAPLAMA ÖNİZLEME</span>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>Canlı Metraj</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.83rem', color: '#475569' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Net Kaplama Alanı:</span>
                            <strong>{calc.netAreaM2} m²</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Kesim Firesi (+%{calc.wastePercent}):</span>
                            <strong>+{calc.wasteM2} m²</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: '800', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                            <span>Sipariş Seramik Miktarı:</span>
                            <strong style={{ color: '#d4af37' }}>{calc.totalTileM2} m²</strong>
                          </div>

                          {calc.includeAdhesive && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                              <span>Gerekli Yapıştırıcı Harç:</span>
                              <strong>{calc.adhesiveBagsCount} Torba ({calc.totalAdhesiveKg} kg)</strong>
                            </div>
                          )}

                          {calc.includeGrout && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                              <span>Gerekli Derz Dolgusu:</span>
                              <strong>{calc.totalGroutKg} kg</strong>
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                            <span>Ara Toplam (KDV Hariç):</span>
                            <span>₺{calc.subtotalBeforeVat.toLocaleString('tr-TR')}</span>
                          </div>
                          {calc.tileDiscountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: '#dc2626' }}>
                              <span>İskonto İndirimi (%{calc.discountPercent}):</span>
                              <span>-₺{calc.tileDiscountAmount.toLocaleString('tr-TR')}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                            <span>KDV Tutarı (%20):</span>
                            <span>₺{calc.vatAmount.toLocaleString('tr-TR')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginTop: '6px', background: 'rgba(212,175,55,0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)' }}>
                            <span>GENEL TOPLAM:</span>
                            <span style={{ color: '#b38e47' }}>₺{calc.grandTotal.toLocaleString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* List of Recent Quotes */}
                  {savedQuotesList.length > 0 && (
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>Hazırlanan Son Teklifler</h4>
                      {savedQuotesList.map(q => (
                        <div key={q.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{q.customerName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{q.projectName} • ₺{(q?.calculations?.grandTotal || 0).toLocaleString('tr-TR')}</div>
                          </div>
                          <button 
                            onClick={() => setGeneratedQuote(q)}
                            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            PDF Göster
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activePortalTab === 'b2b-projects' ? (
          /* B2B PROJECTS TAB */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="b2b-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} style={{ color: '#d4af37' }} />
                  B2B Proje & Toplu Seramik İhaleleri
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#6c757d', margin: 0 }}>
                  İnşaat firmaları, mimarlar ve müteahhitler tarafından oluşturulmuş güncel toplu seramik ihtiyaç havuzu.
                </p>
              </div>
              
              <div style={{
                background: saasInfo?.plan === 'PREMIUM' ? 'rgba(212, 175, 55, 0.1)' : saasInfo?.plan === 'STANDART' ? '#e9ecef' : '#fee2e2',
                color: saasInfo?.plan === 'PREMIUM' ? '#d4af37' : saasInfo?.plan === 'STANDART' ? '#495057' : '#dc3545',
                border: '1px solid ' + (saasInfo?.plan === 'PREMIUM' ? 'rgba(212,175,55,0.2)' : saasInfo?.plan === 'STANDART' ? '#ced4da' : '#fca5a5'),
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                Mevcut Planınız: {saasInfo?.plan || 'LITE / YOK'}
              </div>
            </div>

            {/* List of project requests */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {projectsLoading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6c757d' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                  <span>Proje talepleri yükleniyor...</span>
                </div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6c757d', background: '#fff', borderRadius: '16px', border: '1px solid #e9ecef' }}>
                  <span>Şu anda aktif veya onaylanmış bir B2B proje talebi bulunmamaktadır.</span>
                </div>
              ) : (
                projects.map(proj => {
                  const isLocked = proj.isLocked;
                  const isMasked = proj.isMasked;

                  return (
                    <div key={proj.id} className="project-card glass-panel" style={{
                      borderRadius: '16px',
                      padding: '24px',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Top Row: Meta and Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f3f5', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
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
                            <span style={{ fontSize: '0.72rem', color: '#6c757d' }}>{proj.city} / {proj.district}</span>
                            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>•</span>
                            <span style={{ fontSize: '0.72rem', color: '#6c757d' }}>Aşama: {proj.constructionStep}</span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111', margin: '8px 0 0 0' }}>
                            {proj.projectName}
                          </h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>Talep Tarihi</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {new Date(proj.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Main Details Split */}
                      <div className="dealer-project-details-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {/* Column 1: Material Requirements */}
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Malzeme Tercihleri</h5>
                          {isLocked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.5 }}>
                              <div style={{ fontSize: '0.85rem' }}>Ebat: <strong>***</strong></div>
                              <div style={{ fontSize: '0.85rem' }}>Tarz: <strong>***</strong></div>
                              <div style={{ fontSize: '0.85rem' }}>Kullanım Alanı: <strong>***</strong></div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                              <div>Ebat: <strong>{proj.ceramicSizes}</strong></div>
                              <div>Tarz: <strong>{proj.ceramicStyles}</strong></div>
                              {proj.ceramicFinishes && <div>Yüzey: <strong>{proj.ceramicFinishes}</strong></div>}
                              {proj.ceramicColors && <div>Renk: <strong>{proj.ceramicColors}</strong></div>}
                              <div>Alan: <strong>{proj.usageAreas}</strong></div>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Volume & Timeline */}
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Miktar ve Bütçe</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                            <div>Toplam Metraj: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{(proj?.quantityM2 || 0).toLocaleString('tr-TR')} m²</strong></div>
                            <div>Hedef Bütçe: <strong style={{ color: '#0284c7' }}>{proj.budgetM2}</strong></div>
                            <div>Teslim Süresi: <strong>{proj.deliveryTimeline}</strong></div>
                          </div>
                        </div>

                        {/* Column 3: Contact Info (Protected by SaaS Tier) */}
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#888', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Müteahhit / İletişim</h5>
                          {isLocked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.5 }}>
                              <div style={{ fontSize: '0.82rem' }}>Firma: <strong>***</strong></div>
                              <div style={{ fontSize: '0.82rem' }}>Yetkili: <strong>***</strong></div>
                              <div style={{ fontSize: '0.82rem' }}>Telefon: <strong>***</strong></div>
                            </div>
                          ) : isMasked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                              <div>Firma: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.companyName}</strong></div>
                              <div>Yetkili: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.contactName}</strong></div>
                              <div>Telefon: <strong style={{ filter: 'blur(3.5px)', userSelect: 'none' }}>{proj.contactPhone}</strong></div>
                              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginTop: '4px' }}>
                                ⚠️ İletişim bilgilerini görmek için PREMIUM pakete geçin.
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
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
                            Toplu ihale metrajlarını ve malzeme ihtiyaçlarını görmek için bayiliğinizin aboneliğini aktifleştirin.
                          </p>
                          <button
                            onClick={() => setActivePortalTab('subscription')}
                            style={{
                              background: '#111',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Abonelik Paketlerini İncele
                          </button>
                        </div>
                      )}

                      {!isLocked && isMasked && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f3f5', paddingTop: '12px', marginTop: '4px' }}>
                          <button
                            onClick={() => setActivePortalTab('subscription')}
                            style={{
                              background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                              color: '#d4af37',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Crown size={14} style={{ color: '#d4af37' }} />
                            <span>İletişimi Açmak İçin Premium'a Geç</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activePortalTab === 'settings' ? (
          /* SETTINGS TAB */
          <div className="settings-container">
            <div className="settings-card">
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a', fontFamily: 'var(--font-title)' }}>Bayi Profil Bilgileri Güncelleme</h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Aşağıdaki alanları güncelleyerek müşterilere gösterilen şube kartınızı güncel tutun.</p>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {profileSuccess && (
                  <div style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={18} />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div style={{
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* SECTION 1: TEMEL BİLGİLER */}
                <div className="settings-section">
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '14px', background: 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    İletişim & Güvenlik
                  </h3>
                  
                  <div className="settings-grid-2">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şube İletişim Telefonu</label>
                      <input 
                        type="text" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)} 
                        required 
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', transition: 'all 0.2s' }}
                        className="portal-input"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şube Giriş Şifresi</label>
                      <input 
                        type="password" 
                        value={profilePassword} 
                        onChange={(e) => setProfilePassword(e.target.value)} 
                        required 
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', transition: 'all 0.2s' }}
                        className="portal-input"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ADRES & KONUM */}
                <div className="settings-section">
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '14px', background: 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    Şube Adres & Konum
                  </h3>
                  
                  <div className="settings-grid-address">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Açık Adres</label>
                      <textarea 
                        value={profileAddress} 
                        onChange={(e) => setProfileAddress(e.target.value)} 
                        required 
                        rows={4}
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', transition: 'all 0.2s' }}
                        className="portal-input"
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Enlem (Latitude)</label>
                        <input 
                          type="text" 
                          value={profileLat} 
                          onChange={(e) => setProfileLat(e.target.value)} 
                          required 
                          style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', transition: 'all 0.2s' }}
                          className="portal-input"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Boylam (Longitude)</label>
                        <input 
                          type="text" 
                          value={profileLng} 
                          onChange={(e) => setProfileLng(e.target.value)} 
                          required 
                          style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', transition: 'all 0.2s' }}
                          className="portal-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION: ŞUBE TEMA & RENK AYARLARI */}
                <div className="settings-section" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '14px', background: profileThemePrimary || 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    🎨 Şube Sayfası Tema & Vurgu Rengi Ayarları
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 20px 0' }}>
                    Showroom sayfanızın genel tema konseptini ve buton/vurgu renklerini kurumsal kimliğinize göre seçin.
                  </p>

                  {/* Preset Themes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Hazır Tema Paletleri</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                      {[
                        { id: 'GOLD', name: 'Gold Luxury', color: '#d4af37', icon: '👑' },
                        { id: 'SAPPHIRE', name: 'Royal Sapphire', color: '#3b82f6', icon: '💎' },
                        { id: 'EMERALD', name: 'Emerald Premium', color: '#10b981', icon: '🌿' },
                        { id: 'RUBY', name: 'Ruby Elegance', color: '#f43f5e', icon: '🍷' },
                        { id: 'VIOLET', name: 'Amethyst Violet', color: '#8b5cf6', icon: '⚡' }
                      ].map((preset) => {
                        const isSelected = profileThemePreset === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setProfileThemePreset(preset.id);
                              setProfileThemePrimary(preset.color);
                            }}
                            style={{
                              border: isSelected ? `2px solid ${preset.color}` : '1px solid #cbd5e1',
                              background: isSelected ? 'rgba(248, 250, 252, 0.9)' : '#ffffff',
                              borderRadius: '12px',
                              padding: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? `0 4px 14px ${preset.color}25` : 'none'
                            }}
                          >
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: preset.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}>
                              {preset.icon}
                            </div>
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block', lineHeight: 1.2 }}>{preset.name}</span>
                              <span style={{ fontSize: '0.68rem', color: preset.color, fontWeight: '700' }}>{preset.color}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Özel Renk Kodu (Hex / Picker)</label>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kurumsal markanıza özel hex renk kodunu manuel belirleyin</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                      <input 
                        type="color" 
                        value={profileThemePrimary || '#d4af37'} 
                        onChange={(e) => {
                          setProfileThemePrimary(e.target.value);
                          setProfileThemePreset('CUSTOM');
                        }}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                      />
                      <input 
                        type="text" 
                        value={profileThemePrimary || '#d4af37'} 
                        onChange={(e) => {
                          setProfileThemePrimary(e.target.value);
                          setProfileThemePreset('CUSTOM');
                        }}
                        placeholder="#d4af37"
                        style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: LOGO & SHOWROOM GALERİSİ */}
                <div className="settings-section">
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '14px', background: 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    Logo & Showroom Görselleri
                  </h3>
                  
                  {/* Logo Group */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Bayi Logo URL</label>
                    <div className="settings-upload-row">
                      {profileLogoUrl && (
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={profileLogoUrl} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <input 
                        type="text" 
                        value={profileLogoUrl} 
                        onChange={(e) => setProfileLogoUrl(e.target.value)} 
                        placeholder="/logos/kutahya.png veya görsel url'i"
                        style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '12px 18px',
                        background: '#ffffff',
                        border: '1.5px solid var(--accent-gold)',
                        color: 'var(--accent-gold)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        userSelect: 'none',
                        transition: 'all 0.2s'
                      }} className="hover-gold-btn">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          style={{ display: 'none' }} 
                          disabled={isUploadingLogo}
                        />
                        {isUploadingLogo ? 'Yükleniyor...' : 'Logo Yükle'}
                      </label>
                    </div>
                  </div>

                  {/* Banner Background Image Group */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Sayfa Hero Banner Arka Plan Görseli</label>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Showroom başlık kartı arka plan fotoğrafı</span>
                    </div>
                    <div className="settings-upload-row">
                      {profileBannerUrl && (
                        <div style={{ width: '80px', height: '50px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={profileBannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <input 
                        type="text" 
                        value={profileBannerUrl} 
                        onChange={(e) => setProfileBannerUrl(e.target.value)} 
                        placeholder="/hero/hero_ceramics.jpg veya Cihazınızdan Banner Yükleyin"
                        style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '12px 18px',
                        background: '#ffffff',
                        border: '1.5px solid var(--accent-gold)',
                        color: 'var(--accent-gold)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        userSelect: 'none',
                        transition: 'all 0.2s'
                      }} className="hover-gold-btn">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleBannerUpload} 
                          style={{ display: 'none' }} 
                          disabled={isUploadingBanner}
                        />
                        {isUploadingBanner ? 'Yükleniyor...' : 'Banner Yükle'}
                      </label>
                    </div>
                  </div>

                  {/* PDF Catalog Group */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>İndirilebilir Ürün Kataloğu & Broşür (PDF)</label>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Müşterilerin indirebileceği PDF kataloğunuz</span>
                    </div>

                    <div className="catalog-inputs-grid" style={{ display: 'grid', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={profilePdfCatalogName} 
                        onChange={(e) => setProfilePdfCatalogName(e.target.value)} 
                        placeholder="Katalog Başlığı (Örn: 2026 Seramik Kataloğu)"
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                      <input 
                        type="text" 
                        value={profilePdfCatalogUrl} 
                        onChange={(e) => setProfilePdfCatalogUrl(e.target.value)} 
                        placeholder="PDF Linki veya Dosya Yükleyin"
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '12px 18px',
                        background: '#ffffff',
                        border: '1.5px solid var(--accent-gold)',
                        color: 'var(--accent-gold)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        userSelect: 'none',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }} className="hover-gold-btn">
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          onChange={handlePdfUpload} 
                          style={{ display: 'none' }} 
                          disabled={isUploadingPdf}
                        />
                        {isUploadingPdf ? 'Yükleniyor...' : 'PDF Yükle'}
                      </label>
                    </div>
                  </div>

                  {/* Showroom Photos Group */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Showroom Fotoğrafları</label>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Cihazınızdan fotoğraf yükleyin veya aşağıdaki kutuya linkleri virgülle ayırarak girin.</span>
                      </div>
                      
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#ffffff',
                        border: '1.5px solid var(--accent-gold)',
                        color: 'var(--accent-gold)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        transition: 'all 0.2s'
                      }} className="hover-gold-btn">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          style={{ display: 'none' }}
                          disabled={isUploadingPhoto}
                        />
                        {isUploadingPhoto ? 'Görsel Yükleniyor...' : '+ Cihazdan Fotoğraf Ekle'}
                      </label>
                    </div>

                    {/* Interactive Showroom Image Previews */}
                    {profileShowroomImages && profileShowroomImages.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: '#ffffff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                        {profileShowroomImages.split(',').map(s => s.trim()).filter(Boolean).map((url, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }} className="showroom-thumb-wrapper">
                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              type="button" 
                              onClick={() => {
                                const current = profileShowroomImages.split(',').map(s => s.trim()).filter(Boolean);
                                const updated = current.filter(u => u !== url);
                                setProfileShowroomImages(updated.join(', '));
                              }} 
                              style={{
                                position: 'absolute',
                                top: '3px',
                                right: '3px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              title="Görseli Kaldır"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea 
                      value={profileShowroomImages} 
                      onChange={(e) => setProfileShowroomImages(e.target.value)} 
                      placeholder="https://gorsel1.jpg, https://gorsel2.jpg"
                      rows={2}
                      style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                      className="portal-input"
                    />
                  </div>
                </div>

                {/* SECTION: SHOWROOM İSTATİSTİKLERİ */}
                <div className="settings-section">
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '14px', background: 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    Showroom Başlık İstatistikleri (Hero Kartı)
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '2px 0 12px 0' }}>Canlı bayi profilinizdeki üst kartta görünen 3 ana istatistiği özelleştirin.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Deneyim İstatistiği</label>
                      <input 
                        type="text" 
                        value={profileDealerStats.experience || ''} 
                        onChange={(e) => setProfileDealerStats({ ...profileDealerStats, experience: e.target.value })} 
                        placeholder="Örn: 10+ Yıl veya 15 Yıl"
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Mutlu Müşteri İstatistiği</label>
                      <input 
                        type="text" 
                        value={profileDealerStats.happyClients || ''} 
                        onChange={(e) => setProfileDealerStats({ ...profileDealerStats, happyClients: e.target.value })} 
                        placeholder="Örn: 500+ veya 1000+"
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1' }}>Showroom Alanı</label>
                      <input 
                        type="text" 
                        value={profileDealerStats.showroomArea || ''} 
                        onChange={(e) => setProfileDealerStats({ ...profileDealerStats, showroomArea: e.target.value })} 
                        placeholder="Örn: 200 m² veya 350 m²"
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: 3D SANAL TUR & KONSEPTLER */}
                <div className="settings-section">
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '14px', background: 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    3D Sanal Tur & Konseptler
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>3D Showroom / Sanal Tur URL (Matterport veya 360° Panorama Görsel Linki)</label>
                      <input 
                        type="text" 
                        value={profileVirtualTourUrl} 
                        onChange={(e) => setProfileVirtualTourUrl(e.target.value)} 
                        placeholder="https://my.matterport.com/show/?m=... veya 360° görsel linki"
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        className="portal-input"
                      />
                    </div>

                    {/* Elegant 360 Panorama Upload Box */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(179,142,71,0.08)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block' }}>Kendi 360° Panoramik Görselinizi Yükleyin</span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Matterport üyeliğiniz yoksa cep telefonunuzun panoramik moduyla çektiğiniz 360 resmi yükleyin!</span>
                          </div>
                        </div>

                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 18px',
                          background: 'linear-gradient(135deg, var(--accent-gold) 0%, #a27e3c 100%)',
                          color: '#ffffff',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          boxShadow: '0 4px 10px rgba(179, 142, 71, 0.2)',
                          transition: 'all 0.2s'
                        }} className="hover-gold-solid-btn">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handle360ImageUpload} 
                            style={{ display: 'none' }}
                            disabled={isUploading360}
                          />
                          {isUploading360 ? 'Yükleniyor...' : '360° Görsel Seç & Yükle'}
                        </label>
                      </div>

                      {upload360Success && (
                        <div style={{ fontSize: '0.72rem', color: '#059669', background: '#ecfdf5', padding: '8px 12px', borderRadius: '8px', border: '1px solid #a7f3d0', fontWeight: '600' }}>
                          ✓ {upload360Success}
                        </div>
                      )}
                      {upload360Error && (
                        <div style={{ fontSize: '0.72rem', color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', fontWeight: '600' }}>
                          ⚠️ {upload360Error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Özel Teşhir Konseptleri</label>
                    <input 
                      type="text" 
                      value={profileSpecialConcepts} 
                      onChange={(e) => setProfileSpecialConcepts(e.target.value)} 
                      placeholder="Mermer Serisi Alanı, Banyo Tasarımları vb."
                      style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                      className="portal-input"
                    />
                  </div>
                </div>

                {/* SECTION 5: GELİŞMİŞ PROFİL ÖZELLİKLERİ */}
                <div className="settings-section">
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '4px', height: '14px', background: 'var(--accent-gold)', borderRadius: '2px' }}></span>
                    Gelişmiş Profil Özellikleri (Showroom Pazarlama)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* About Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Hakkımızda / Şube Açıklaması</label>
                      <textarea 
                        value={profileAboutText} 
                        onChange={(e) => setProfileAboutText(e.target.value)} 
                        placeholder="Şubenizin geçmişi, showroom büyüklüğü ve müşterilerinize sunduğunuz hizmetler hakkında kısa bir bilgi yazın..."
                        rows={4}
                        style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                        className="portal-input"
                      />
                    </div>

                    {/* Logistics checkboxes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Sunulan Şube Hizmetleri (Rozetler)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', marginTop: '6px' }}>
                        {[
                          { id: 'shipping', label: '🚚 Nakliye/Sevk Desteği' },
                          { id: 'showroom_stock', label: '🏬 Showroom & Hazır Stok' },
                          { id: 'credit_card', label: '💳 Kredi Kartına Taksit' },
                          { id: 'install_support', label: '🛠️ Uygulayıcı / Usta Desteği' }
                        ].map(service => {
                          const isChecked = (profileLogisticsServices || '').split(',').includes(service.id);
                          return (
                            <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => toggleLogisticsService(service.id)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
                              />
                              <span>{service.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Featured Products */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Öne Çıkan Ürünler (Maks. 6 Adet)</label>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '-6px' }}>Şube vitrininizde sergilenecek ürünleri seçin.</span>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc' }} className="scrollbar-hidden">
                        {brandProducts.length > 0 ? brandProducts.map(prod => {
                          const isChecked = profileFeaturedProducts.includes(prod.id);
                          return (
                            <label key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => toggleFeaturedProduct(prod.id)}
                                style={{ width: '15px', height: '15px', accentColor: 'var(--accent-gold)' }}
                              />
                              <span>{prod.name} ({prod.code})</span>
                            </label>
                          );
                        }) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Markanıza ait ürün bulunamadı.</span>
                        )}
                      </div>
                    </div>

                    {/* Campaigns */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Aktif Şube Kampanyaları</label>
                        <button type="button" onClick={addCampaign} style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', color: 'var(--accent-gold)' }}>+ Kampanya Ekle</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profileDealerCampaigns.map((camp, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', position: 'relative' }}>
                            <button type="button" onClick={() => removeCampaign(idx)} style={{ position: 'absolute', top: '12px', right: '14px', background: '#fee2e2', border: 'none', color: '#dc2626', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', padding: '4px 8px', borderRadius: '6px' }}>Kampanyayı Sil ✕</button>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Kampanya Başlığı</label>
                              <input 
                                type="text" 
                                value={camp.title} 
                                onChange={(e) => updateCampaign(idx, 'title', e.target.value)} 
                                placeholder="Örn: Lapatto Serisinde %10 İndirim"
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-input"
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Kampanya Açıklaması / Koşulları</label>
                              <textarea 
                                value={camp.desc} 
                                onChange={(e) => updateCampaign(idx, 'desc', e.target.value)} 
                                placeholder="Kampanya koşulları ve detaylı bilgi..."
                                rows={2}
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', resize: 'vertical', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-textarea"
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Son Geçerlilik Tarihi</label>
                              <input 
                                type="text" 
                                value={camp.expiresAt} 
                                onChange={(e) => updateCampaign(idx, 'expiresAt', e.target.value)} 
                                placeholder="Örn: 31 Ağustos'a kadar geçerli"
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-input"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reference Projects */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Referans Projeler (Portföy)</label>
                        <button type="button" onClick={addReferenceProject} style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', color: 'var(--accent-gold)' }}>+ Proje Ekle</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profileReferenceProjects.map((proj, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', position: 'relative' }}>
                            <button type="button" onClick={() => removeReferenceProject(idx)} style={{ position: 'absolute', top: '12px', right: '14px', background: '#fee2e2', border: 'none', color: '#dc2626', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', padding: '4px 8px', borderRadius: '6px' }}>Projeyi Sil ✕</button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Proje Adı / Başlığı</label>
                              <input 
                                type="text" 
                                value={proj.title} 
                                onChange={(e) => updateReferenceProject(idx, 'title', e.target.value)} 
                                placeholder="Örn: Rixos Hotel Lobby Kaplaması"
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-input"
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Proje Görsel URL'si</label>
                              <input 
                                type="text" 
                                value={proj.imageUrl} 
                                onChange={(e) => updateReferenceProject(idx, 'imageUrl', e.target.value)} 
                                placeholder="Örn: https://... veya /textures/..."
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-input"
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Kullanılan Ürünler ve Proje Detayı</label>
                              <textarea 
                                value={proj.desc} 
                                onChange={(e) => updateReferenceProject(idx, 'desc', e.target.value)} 
                                placeholder="Kullanılan seramik modelleri, metrekare ve proje açıklaması..."
                                rows={2}
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', resize: 'vertical', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-textarea"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Sıkça Sorulan Sorular (FAQ)</label>
                        <button type="button" onClick={addFaq} style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', color: 'var(--accent-gold)' }}>+ Soru Ekle</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profileDealerFaqs.map((faq, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', position: 'relative' }}>
                            <button type="button" onClick={() => removeFaq(idx)} style={{ position: 'absolute', top: '12px', right: '14px', background: '#fee2e2', border: 'none', color: '#dc2626', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', padding: '4px 8px', borderRadius: '6px' }}>Soruyu Sil ✕</button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Soru</label>
                              <input 
                                type="text" 
                                value={faq.q} 
                                onChange={(e) => updateFaq(idx, 'q', e.target.value)} 
                                placeholder="Örn: Şehir dışı nakliye hizmetiniz var mı?"
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-input"
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#1e293b' }}>Cevap</label>
                              <textarea 
                                value={faq.a} 
                                onChange={(e) => updateFaq(idx, 'a', e.target.value)} 
                                placeholder="Cevap detayları..."
                                rows={2}
                                style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #94a3b8', fontSize: '0.85rem', outline: 'none', resize: 'vertical', color: '#000000', background: '#ffffff', fontWeight: '600' }}
                                className="dealer-card-textarea"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSavingProfile}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #a27e3c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    fontWeight: '800',
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 24px rgba(179, 142, 71, 0.25)',
                    fontFamily: 'var(--font-title)'
                  }}
                  className="portal-submit-btn"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Değişiklikler Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Değişiklikleri Kaydet</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : activePortalTab === 'analytics' ? (
          /* ===== REGIONAL ANALYTICS TAB ===== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="analytics-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
                  <TrendingUp size={22} style={{ color: '#d4af37' }} />
                  Bölgesel Arama & Seramik Analitiği
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0 }}>
                  {dealerInfo?.city} şehrindeki tüketicilerin seramik arama, marka ve ebat/tarz tercihlerini canlı analiz edin.
                </p>
              </div>
            </div>

            {/* Check Subscription Tier: must be STANDART or PREMIUM */}
            {(!saasInfo || (saasInfo.plan !== 'STANDART' && saasInfo.plan !== 'PREMIUM')) ? (
              <div style={{
                background: '#fff',
                border: '1px solid #e9ecef',
                borderRadius: '20px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Lock size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Detaylı Analiz Kilitli</h3>
                <p style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '450px', margin: 0 }}>
                  Şehrinizdeki popüler seramik modellerini, arama terimlerini ve ebat taleplerini görebilmek için Standart veya Premium pakete yükseltin.
                </p>
                <button
                  onClick={() => setActivePortalTab('subscription')}
                  style={{
                    background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                    color: '#d4af37',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Paketleri İncele & Etkinleştir
                </button>
              </div>
            ) : (
              /* ACTIVE SUBSCRIPTION - RENDER LIVE ANALYTICS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* ACTION & CONTACT ANALYTICS DASHBOARD CARD */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  color: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} style={{ color: '#d4af37' }} />
                        Müşteri İletişim & Aksiyon Analitiği
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                        Canlı showroom sayfanızdan gerçekleşen doğrudan müşteri iletişim tıklamaları ve aksiyonları.
                      </p>
                    </div>
                    <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '6px 14px', borderRadius: '12px', fontSize: '0.78rem', color: '#d4af37', fontWeight: '800' }}>
                      Toplam Aksiyon: {actionStats.totalInteractions}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {/* Stat 1: WhatsApp */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', display: 'block', lineHeight: 1 }}>{actionStats.whatsapp}</span>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginTop: '4px', display: 'block' }}>WhatsApp Tıklamaları</span>
                      </div>
                    </div>

                    {/* Stat 2: Phone */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', display: 'block', lineHeight: 1 }}>{actionStats.phone}</span>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginTop: '4px', display: 'block' }}>Telefon Araması</span>
                      </div>
                    </div>

                    {/* Stat 3: Directions */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
                        <Compass size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', display: 'block', lineHeight: 1 }}>{actionStats.directions}</span>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginTop: '4px', display: 'block' }}>Yol Tarifi / Navigasyon</span>
                      </div>
                    </div>

                    {/* Stat 4: PDF Downloads */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', flexShrink: 0 }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', display: 'block', lineHeight: 1 }}>{actionStats.pdfDownload}</span>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginTop: '4px', display: 'block' }}>Katalog İndirme (PDF)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  
                  {/* Card 1: Popular Search Queries */}
                  <div className="analytics-white-card" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 16px 0', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                    🔍 En Sık Aranan Kelimeler
                  </h4>
                  {regionalAnalytics.popularQueries.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '12px 0', fontWeight: '500' }}>Bölgenizde yeterli arama kaydı yok.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {regionalAnalytics.popularQueries.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>"{item.query}"</span>
                            <span style={{ color: '#475569', fontWeight: '600' }}>{item.count} arama</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (item.count / regionalAnalytics.popularQueries[0].count) * 100)}%`,
                              height: '100%',
                              background: '#b38e47',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 2: Popular Ceramic Brands */}
                <div className="analytics-white-card" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 16px 0', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                    🏢 Popüler Marka İncelemeleri
                  </h4>
                  {regionalAnalytics.popularBrands.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '12px 0', fontWeight: '500' }}>Bölgenizde yeterli marka verisi yok.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {regionalAnalytics.popularBrands.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</span>
                            <span style={{ color: '#475569', fontWeight: '600' }}>{item.count} görüntülenme</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (item.count / regionalAnalytics.popularBrands[0].count) * 100)}%`,
                              height: '100%',
                              background: '#0284c7',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Popular Sizes and Styles */}
                <div className="analytics-white-card" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 16px 0', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                    📐 Boyut & Tarz Tercihleri
                  </h4>
                  {regionalAnalytics.popularStyles.length === 0 ? (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '12px 0', fontWeight: '500' }}>Bölgenizde yeterli ebat verisi yok.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {regionalAnalytics.popularStyles.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.style}</span>
                            <span style={{ color: '#475569', fontWeight: '600' }}>{item.count} kez incelendi</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (item.count / regionalAnalytics.popularStyles[0].count) * 100)}%`,
                              height: '100%',
                              background: '#8b5cf6',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        ) : activePortalTab === 'subscription' ? (
          /* ===== SUBSCRIPTION TAB ===== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Current Subscription Status Banner */}
            <div style={{
              background: saasInfo ? 'linear-gradient(135deg, #111 0%, #1a1a2e 50%, #16213e 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '20px',
              padding: '32px 36px',
              color: saasInfo ? '#fff' : '#991b1b',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {saasInfo && (
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {saasInfo ? <Crown size={22} style={{ color: '#d4af37' }} /> : <AlertCircle size={22} />}
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                      {saasInfo ? `${saasInfo.plan} Yıllık Paket` : 'Aktif Aboneliğiniz Bulunmuyor'}
                    </h2>
                    {saasInfo && (
                      <span style={{
                        background: saasInfo.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : (saasInfo.status === 'PENDING_APPROVAL' ? 'rgba(245,158,11,0.2)' : (saasInfo.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)')),
                        color: saasInfo.status === 'ACTIVE' ? '#34d399' : (saasInfo.status === 'PENDING_APPROVAL' ? '#f59e0b' : (saasInfo.status === 'REJECTED' ? '#ef4444' : '#fca5a5')),
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '700'
                      }}>
                        {saasInfo.status === 'ACTIVE' ? '● Aktif' : saasInfo.status === 'PENDING_APPROVAL' ? '● Onay Bekliyor' : saasInfo.status === 'PAUSED' ? '● Askıda' : saasInfo.status === 'REJECTED' ? '● Reddedildi' : '● Süresi Dolmuş'}
                      </span>
                    )}
                    {saasInfo && saasInfo.pendingStatus === 'PENDING_APPROVAL' && (
                      <span style={{
                        background: 'rgba(245,158,11,0.2)',
                        color: '#f59e0b',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        marginLeft: '6px'
                      }}>
                        ● {saasInfo.pendingPlan} Yükseltme Onay Bekliyor
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.8 }}>
                    {saasInfo 
                      ? `Paket bitiş tarihi: ${new Date(saasInfo.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}` 
                      : 'Müşteri bilgilerine tam erişim ve teklif yönetimi için bir paket seçin.'}
                  </p>
                </div>
                {saasInfo && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '16px 24px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '600', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kalan Süre</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#d4af37' }}>
                      {Math.max(0, Math.ceil((new Date(saasInfo.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))} Gün
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Cards */}
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', color: '#111' }}>Yıllık Bayi Abonelik Paketleri</h3>
                <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: 0 }}>İhtiyacınıza uygun paketi seçin ve müşteri taleplerini yönetin. Tüm paketler yıllık faturalandırılır.</p>
              </div>

              {requestedPlan && (
                <div className="glass-panel" style={{
                  background: '#fffbeb',
                  border: '1px solid #fde047',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#b45309',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  <Loader2 size={18} className="animate-spin" style={{ color: '#d97706', flexShrink: 0 }} />
                  <div>
                    <strong>⏱️ Abonelik Talebi Onay Bekliyor:</strong> {requestedPlan} paket talebiniz alındı. Banka transferiniz (Gönderen: {saasInfo?.paymentSender || 'Belirtilmedi'}, Dekont: {saasInfo?.paymentNote || '-'}) doğrulandıktan sonra admin onayıyla en kısa sürede aktifleşecektir.
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="glass-panel" style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  <AlertCircle size={18} style={{ color: '#991b1b', flexShrink: 0 }} />
                  <div>
                    <strong>❌ Talep Reddedildi:</strong> {saasInfo?.pendingPlan || saasInfo?.plan} paket talebiniz admin tarafından onaylanmadı. Detaylar ve destek için admin ile iletişime geçebilirsiniz.
                  </div>
                </div>
              )}

              <div className="dealer-pricing-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                alignItems: 'stretch'
              }}>
                {/* LITE Plan */}
                <div style={{
                  background: '#fff',
                  border: saasInfo?.plan === 'LITE' ? '2px solid #d4af37' : '1px solid #e9ecef',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: saasInfo?.plan === 'LITE' ? '0 8px 30px rgba(212,175,55,0.12)' : '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'all 0.3s',
                }}>
                  {saasInfo?.plan === 'LITE' && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#d4af37', color: '#000', padding: '4px 16px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BadgeCheck size={13} /> Mevcut Paketiniz
                    </div>
                  )}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                      <Zap size={24} color="#64748b" />
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 4px 0', color: '#334155' }}>LITE</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Küçük bayiler için temel paket</p>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#111' }}>₺2.990</span>
                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}> / yıl</span>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Aylık ₺249 karşılığı</div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { text: 'Müşteri adı ve telefon bilgisi', included: true },
                      { text: 'Aylık 50 müşteri talebi limiti', included: true },
                      { text: 'Temel talep yönetimi', included: true },
                      { text: 'E-posta destek', included: true },
                      { text: 'Öncelikli listeleme', included: false },
                      { text: 'Anlık bildirimler', included: false },
                      { text: 'Reklam kampanyaları', included: false },
                    ].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: f.included ? '#334155' : '#cbd5e1' }}>
                        {f.included ? <Check size={15} style={{ color: '#10b981', flexShrink: 0 }} /> : <X size={15} style={{ color: '#e2e8f0', flexShrink: 0 }} />}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setSelectedPaymentPlan('LITE'); setShowPaymentModal(true); }}
                    disabled={saasInfo?.plan === 'LITE' || hasPending}
                    style={{
                      marginTop: '28px',
                      background: saasInfo?.plan === 'LITE' ? '#e9ecef' : (requestedPlan === 'LITE' ? '#fffbeb' : '#f1f3f5'),
                      color: saasInfo?.plan === 'LITE' ? '#adb5bd' : (requestedPlan === 'LITE' ? '#d97706' : '#111'),
                      border: requestedPlan === 'LITE' ? '1px solid #fde047' : '1px solid #dee2e6',
                      borderRadius: '12px',
                      padding: '13px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: (saasInfo?.plan === 'LITE' || hasPending) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {saasInfo?.plan === 'LITE' ? <CheckCircle size={16} /> : (requestedPlan === 'LITE' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />)}
                    <span>{saasInfo?.plan === 'LITE' ? 'Aktif Paketiniz' : (requestedPlan === 'LITE' ? 'Onay Bekliyor...' : 'Lite Paketi Seç')}</span>
                  </button>
                </div>

                {/* STANDART Plan - Highlighted */}
                <div style={{
                  background: 'linear-gradient(180deg, #fffbeb 0%, #fff 30%)',
                  border: saasInfo?.plan === 'STANDART' ? '2px solid #d4af37' : '2px solid #f59e0b',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 12px 40px rgba(245,158,11,0.12)',
                  transform: 'scale(1.02)',
                  transition: 'all 0.3s'
                }}>
                  {saasInfo?.plan === 'STANDART' ? (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#d4af37', color: '#000', padding: '4px 16px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BadgeCheck size={13} /> Mevcut Paketiniz
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', padding: '4px 16px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} /> En Popüler
                    </div>
                  )}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                      <Star size={24} color="#fff" />
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 4px 0', color: '#92400e' }}>STANDART</h4>
                    <p style={{ fontSize: '0.75rem', color: '#b45309', margin: 0 }}>Büyüyen bayiler için önerilen paket</p>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#111' }}>₺5.990</span>
                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}> / yıl</span>
                    <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '2px' }}>Aylık ₺499 karşılığı · %20 tasarruf</div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { text: 'Tam müşteri bilgisi (ad, tel, e-posta)', included: true },
                      { text: 'Sınırsız müşteri talebi', included: true },
                      { text: 'Gelişmiş talep yönetimi', included: true },
                      { text: 'Öncelikli telefon + e-posta destek', included: true },
                      { text: 'Arama sonuçlarında öncelikli listeleme', included: true },
                      { text: 'Anlık SMS/E-posta bildirimleri', included: true },
                      { text: 'Reklam kampanyaları', included: false },
                    ].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: f.included ? '#334155' : '#cbd5e1' }}>
                        {f.included ? <Check size={15} style={{ color: '#f59e0b', flexShrink: 0 }} /> : <X size={15} style={{ color: '#e2e8f0', flexShrink: 0 }} />}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setSelectedPaymentPlan('STANDART'); setShowPaymentModal(true); }}
                    disabled={saasInfo?.plan === 'STANDART' || hasPending}
                    style={{
                      marginTop: '28px',
                      background: saasInfo?.plan === 'STANDART' ? '#fef3c7' : (requestedPlan === 'STANDART' ? '#fffbeb' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'),
                      color: saasInfo?.plan === 'STANDART' ? '#b45309' : (requestedPlan === 'STANDART' ? '#d97706' : '#fff'),
                      border: requestedPlan === 'STANDART' ? '1px solid #fde047' : 'none',
                      borderRadius: '12px',
                      padding: '13px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: (saasInfo?.plan === 'STANDART' || hasPending) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: (saasInfo?.plan === 'STANDART' || hasPending) ? 'none' : '0 4px 12px rgba(245,158,11,0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {saasInfo?.plan === 'STANDART' ? <CheckCircle size={16} /> : (requestedPlan === 'STANDART' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />)}
                    <span>{saasInfo?.plan === 'STANDART' ? 'Aktif Paketiniz' : (requestedPlan === 'STANDART' ? 'Onay Bekliyor...' : 'Standart Paketi Seç')}</span>
                  </button>
                </div>

                {/* PREMIUM Plan */}
                <div style={{
                  background: 'linear-gradient(180deg, #f5f3ff 0%, #fff 30%)',
                  border: saasInfo?.plan === 'PREMIUM' ? '2px solid #d4af37' : '1px solid #e9ecef',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: saasInfo?.plan === 'PREMIUM' ? '0 8px 30px rgba(212,175,55,0.12)' : '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'all 0.3s'
                }}>
                  {saasInfo?.plan === 'PREMIUM' && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#d4af37', color: '#000', padding: '4px 16px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BadgeCheck size={13} /> Mevcut Paketiniz
                    </div>
                  )}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #111 0%, #333 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                      <Crown size={24} color="#d4af37" />
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 4px 0', color: '#111' }}>PREMIUM</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: 0 }}>Kurumsal bayiler için tam donanım</p>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#111' }}>₺11.990</span>
                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}> / yıl</span>
                    <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: '2px' }}>Aylık ₺999 karşılığı · VIP Ayrıcalıklar</div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { text: 'Tam müşteri bilgisi + adres detayı', included: true },
                      { text: 'Sınırsız müşteri talebi', included: true },
                      { text: 'Gelişmiş CRM entegrasyonu', included: true },
                      { text: '7/24 VIP Destek Hattı', included: true },
                      { text: 'En üst sırada öncelikli listeleme', included: true },
                      { text: 'Anlık SMS/E-posta/WhatsApp bildirim', included: true },
                      { text: 'Sponsorlu reklam kampanyaları', included: true },
                    ].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                        <Check size={15} style={{ color: '#7c3aed', flexShrink: 0 }} />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setSelectedPaymentPlan('PREMIUM'); setShowPaymentModal(true); }}
                    disabled={saasInfo?.plan === 'PREMIUM' || hasPending}
                    style={{
                      marginTop: '28px',
                      background: saasInfo?.plan === 'PREMIUM' ? '#f3f4f6' : (requestedPlan === 'PREMIUM' ? '#fffbeb' : 'linear-gradient(135deg, #111 0%, #333 100%)'),
                      color: saasInfo?.plan === 'PREMIUM' ? '#6b7280' : (requestedPlan === 'PREMIUM' ? '#d97706' : '#d4af37'),
                      border: requestedPlan === 'PREMIUM' ? '1px solid #fde047' : 'none',
                      borderRadius: '12px',
                      padding: '13px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      cursor: (saasInfo?.plan === 'PREMIUM' || hasPending) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: (saasInfo?.plan === 'PREMIUM' || hasPending) ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {saasInfo?.plan === 'PREMIUM' ? <CheckCircle size={16} /> : (requestedPlan === 'PREMIUM' ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />)}
                    <span>{saasInfo?.plan === 'PREMIUM' ? 'Aktif Paketiniz' : (requestedPlan === 'PREMIUM' ? 'Onay Bekliyor...' : 'Premium Paketi Seç')}</span>
                  </button>
                </div>
              </div>
            </div>



            {/* Feature Comparison Table */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>Paket Karşılaştırma Tablosu</h3>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 20px 0' }}>Tüm paketlerin detaylı özellik karşılaştırması</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.12)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#cbd5e1' }}>Özellik</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#cbd5e1', textAlign: 'center' }}>LITE</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#f59e0b', textAlign: 'center', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px 8px 0 0' }}>STANDART</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#ffffff', textAlign: 'center' }}>PREMIUM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Yıllık Ücret', lite: '₺2.990', standart: '₺5.990', premium: '₺11.990' },
                      { feature: 'Müşteri Bilgi Erişimi', lite: 'Ad + Telefon', standart: 'Tam Bilgi', premium: 'Tam + Adres' },
                      { feature: 'Aylık Talep Limiti', lite: '50', standart: 'Sınırsız', premium: 'Sınırsız' },
                      { feature: 'Öncelikli Listeleme', lite: false, standart: true, premium: 'VIP Üst Sıra' },
                      { feature: 'Anlık Bildirimler', lite: false, standart: true, premium: true },
                      { feature: 'Destek Kanalı', lite: 'E-posta', standart: 'Tel + E-posta', premium: '7/24 VIP' },
                      { feature: 'Reklam Kampanyaları', lite: false, standart: false, premium: true },
                      { feature: 'CRM Entegrasyonu', lite: false, standart: false, premium: true },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <td style={{ padding: '13px 16px', fontWeight: '600', color: '#ffffff' }}>{row.feature}</td>
                        {[row.lite, row.standart, row.premium].map((val, ci) => (
                          <td key={ci} style={{ padding: '13px 16px', textAlign: 'center', background: ci === 1 ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                            {val === true ? <Check size={16} style={{ color: '#10b981', margin: '0 auto' }} /> 
                              : val === false ? <X size={16} style={{ color: 'rgba(255, 255, 255, 0.15)', margin: '0 auto' }} /> 
                              : <span style={{ fontWeight: '600', color: ci === 2 ? '#a78bfa' : '#cbd5e1' }}>{val}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 20px 0', color: '#ffffff' }}>Sık Sorulan Sorular</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { q: 'Abonelik süresi dolunca ne olur?', a: 'Aboneliğiniz sona erdiğinde gelen müşteri talepleri görünmeye devam eder ancak müşteri iletişim bilgileri maskelenir. Yenileme yaparak erişiminizi geri kazanabilirsiniz.' },
                  { q: 'Paket yükseltme yapabilir miyim?', a: 'Evet, dilediğiniz zaman daha üst bir pakete geçiş yapabilirsiniz. Mevcut sürenize kalan gün sayısı kadar indirim uygulanır.' },
                  { q: 'Ödeme nasıl yapılır?', a: 'Kredi kartı, banka havalesi/EFT ve sanal POS ile güvenli ödeme yapabilirsiniz. Fatura otomatik olarak e-posta adresinize gönderilir.' },
                  { q: 'İptal/iade politikası nedir?', a: 'İlk 14 gün içinde koşulsuz iade garantisi sunulmaktadır. 14 gün sonrası için kalan süre üzerinden orantılı iade yapılır.' },
                ].map((faq, i) => (
                  <div key={i} style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '0 0 6px 0', color: '#ffffff' }}>{faq.q}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activePortalTab === 'inventory' ? (
          /* ===== INVENTORY & STOCK MANAGEMENT TAB ===== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={22} style={{ color: 'var(--accent-gold)' }} />
                  Bayi Envanter & Stok Yönetimi
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Showroomunuzda sergilenen veya deponuzda bulunan hazır ürünlerin stok ve fiyat bilgilerini güncelleyin.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (brandProducts.length === 0) {
                    loadBrandProducts();
                  }
                  setShowAddInventoryModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #b38e47 0%, #8c6b30 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(179, 142, 71, 0.2)'
                }}
              >
                <Plus size={14} />
                <span>Manuel Ürün Ekle</span>
              </button>
            </div>

            {inventorySuccess && (
              <div style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                <span>{inventorySuccess}</span>
              </div>
            )}

            {inventoryError && (
              <div style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{inventoryError}</span>
              </div>
            )}

            <div className="inventory-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1.9fr', gap: '24px' }}>
              
              {/* LEFT SIDE: UPLOAD & SYNC */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Excel/CSV Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 12px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} style={{ color: 'var(--accent-gold)' }} />
                    Excel / CSV ile Yükleme
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    Aşağıdaki alana Excel'den kopyaladığınız CSV formatındaki ürün kodları ve stok miktarlarını yapıştırarak toplu güncelleme yapabilirsiniz.
                  </p>
                  
                  <div style={{ marginBottom: '14px' }}>
                    <a 
                      href="data:text/csv;charset=utf-8,UrunKodu,StokMiktari,Fiyat,Durum%0ADECO-AGREGA-120X240,150,1250,IN_STOCK%0ADECO-TRAVERTEN-60X120,0,0,DISPLAY_ONLY" 
                      download="seramikbak_stok_sablonu.csv"
                      style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      📥 CSV Şablonu İndir
                    </a>
                  </div>

                  <form onSubmit={handleCsvUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      value={csvContentInput}
                      onChange={(e) => setCsvContentInput(e.target.value)}
                      placeholder={"UrunKodu,StokMiktari,Fiyat,Durum\nDECO-AGREGA-120X240,150,1250,IN_STOCK\nDECO-TRAVERTEN-60X120,0,0,DISPLAY_ONLY"}
                      rows={6}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', fontSize: '0.78rem', fontFamily: 'monospace', resize: 'vertical' }}
                    />
                    <button 
                      type="submit" 
                      disabled={csvLoading || !csvContentInput.trim()}
                      style={{
                        background: 'var(--accent-gold)',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        cursor: csvLoading ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {csvLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      <span>Stok Listesini Yükle</span>
                    </button>
                  </form>
                </div>

                {/* XML Feed Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 12px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} style={{ color: 'var(--accent-gold)' }} />
                    XML Feed Canlı Entegrasyon
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    Muhasebe veya ERP (Logo, Nebim vb.) sisteminizdeki seramik stok XML linkini kaydederek envanterin her gün otomatik güncellenmesini sağlayabilirsiniz.
                  </p>

                  <form onSubmit={handleSaveXmlFeed} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <input 
                      type="url"
                      value={xmlFeedUrlInput}
                      onChange={(e) => setXmlFeedUrlInput(e.target.value)}
                      placeholder="https://firmamiz.com/xml/stok-feed"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', fontSize: '0.8rem' }}
                    />
                    <button 
                      type="submit"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Kaydet
                    </button>
                  </form>

                  <button 
                    onClick={handleXmlSync}
                    disabled={xmlSyncLoading || !xmlFeedUrlInput}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      color: '#d4af37',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: (xmlSyncLoading || !xmlFeedUrlInput) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {xmlSyncLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    <span>Şimdi Eşitle (Canlı Sync)</span>
                  </button>
                </div>

              </div>

              {/* RIGHT SIDE: CURRENT INVENTORY TABLE */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>Aktif Showroom Envanteri</h3>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                    {inventoryList.length} Ürün Listeleniyor
                  </span>
                </div>

                {inventoryLoading ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#cbd5e1' }}>
                    <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                    <span>Envanter yükleniyor...</span>
                  </div>
                ) : inventoryList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#cbd5e1', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}>
                    <Package size={32} style={{ margin: '0 auto 10px auto', color: 'var(--accent-gold)' }} />
                    <span style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Envanterinizde henüz ürün bulunmuyor.</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sol taraftaki panelden CSV yükleyebilir veya üstteki butondan manuel ekleyebilirsiniz.</span>
                  </div>
                ) : isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    {inventoryList.map(item => (
                      <div key={item.id} style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={item.product?.imageUrl} alt={item.product?.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', background: '#f8fafc' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Kod: {item.product?.code}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteInventoryItem(item.productId)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ display: 'block', color: '#64748b', fontSize: '0.7rem', marginBottom: '4px' }}>Stok (m²)</span>
                            <input 
                              type="number"
                              defaultValue={item.stock}
                              onBlur={(e) => handleUpdateInventoryItem(item.productId, e.target.value, item.price, item.status)}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', marginBottom: '4px' }}>Özel Fiyat (₺)</span>
                            <input 
                              type="number"
                              defaultValue={item.price || ''}
                              placeholder="Liste"
                              onBlur={(e) => handleUpdateInventoryItem(item.productId, item.stock, e.target.value, item.status)}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', marginBottom: '4px' }}>Durum</span>
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateInventoryItem(item.productId, item.stock, item.price, e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', boxSizing: 'border-box' }}
                          >
                            <option value="IN_STOCK">🟢 Stokta Var</option>
                            <option value="DISPLAY_ONLY">🟡 Teşhir Ürünü</option>
                            <option value="ORDER_ONLY">🔵 Sipariş Üzerine</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.12)', textAlign: 'left' }}>
                          <th style={{ padding: '10px', color: '#cbd5e1' }}>Ürün</th>
                          <th style={{ padding: '10px', color: '#cbd5e1' }}>Stok (m²)</th>
                          <th style={{ padding: '10px', color: '#cbd5e1' }}>Özel Fiyat (₺)</th>
                          <th style={{ padding: '10px', color: '#cbd5e1' }}>Durum</th>
                          <th style={{ padding: '10px', textAlign: 'right', color: '#cbd5e1' }}>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryList.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={item.product?.imageUrl} alt={item.product?.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', background: 'rgba(255, 255, 255, 0.05)' }} />
                              <div>
                                <span style={{ fontWeight: '700', color: '#ffffff', display: 'block' }}>{item.product?.name}</span>
                                <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Kod: {item.product?.code}</span>
                              </div>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="number"
                                defaultValue={item.stock}
                                onBlur={(e) => handleUpdateInventoryItem(item.productId, e.target.value, item.price, item.status)}
                                style={{ width: '60px', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="number"
                                defaultValue={item.price || ''}
                                placeholder="Liste"
                                onBlur={(e) => handleUpdateInventoryItem(item.productId, item.stock, e.target.value, item.status)}
                                style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateInventoryItem(item.productId, item.stock, item.price, e.target.value)}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', color: '#ffffff' }}
                              >
                                <option value="IN_STOCK">🟢 Stokta Var</option>
                                <option value="DISPLAY_ONLY">🟡 Teşhir Ürünü</option>
                                <option value="ORDER_ONLY">🔵 Sipariş Üzerine</option>
                              </select>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <button 
                                onClick={() => handleDeleteInventoryItem(item.productId)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : activePortalTab === 'outlet-exchange' ? (
          /* ===== OUTLET & PROJE FAZLASI BORSASI TAB ===== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={22} style={{ color: '#ef4444' }} />
                  Bayiden Outlet & Proje Fazlası Borsası
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Deponuzda kalan son 30-50 m² şantiye fazlası, seri sonu veya 2. kalite paletlerinizi ilan vererek nakde çevirin.
                </p>
              </div>
              <button
                onClick={() => {
                  if (brandProducts.length === 0) loadBrandProducts();
                  setShowAddOutletModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Plus size={14} />
                <span>Yeni Outlet / Proje Fazlası İlanı Ekle</span>
              </button>
            </div>

            {outletSuccess && (
              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>
                ✅ {outletSuccess}
              </div>
            )}

            {/* Quick Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Aktif İlan Sayısı</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>
                  {outletListings.filter(i => i.status === 'ACTIVE').length} Adet İlan
                </span>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Toplam Fırsat Stok</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>
                  {outletListings.reduce((acc, curr) => acc + (curr.quantityM2 || 0), 0).toLocaleString('tr-TR')} m²
                </span>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Tahmini Stok Değeri</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>
                  ₺{outletListings.reduce((acc, curr) => acc + ((curr.unitPrice || 0) * (curr.quantityM2 || 0)), 0).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Outlet Listings Grid */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Yayınlanan Outlet & Proje Fazlası İlanlarınız
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {outletListings.length} kayıt gösteriliyor
                </span>
              </div>

              {outletLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
                  <span>Outlet ilanları yükleniyor...</span>
                </div>
              ) : outletListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <Sparkles size={36} style={{ color: '#ef4444', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Deponuzda Henüz İlan Verilmiş Stok Bulunmuyor</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                    Deponuzdaki 30-50 m² şantiye fazlası veya 2. kalite paletleri ekleyerek hemen showroom sayfanızda fırsat etiketiyle sergileyin.
                  </p>
                  <button
                    onClick={() => {
                      if (brandProducts.length === 0) loadBrandProducts();
                      setShowAddOutletModal(true);
                    }}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    + İlk İlanı Ekle
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {outletListings.map((item) => {
                    const discountPercent = item.originalPrice && item.originalPrice > item.unitPrice
                      ? Math.round(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)
                      : null;

                    return (
                      <div key={item.id} style={{
                        border: item.status === 'ACTIVE' ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: item.status === 'ACTIVE' ? '#ffffff' : '#f8fafc',
                        opacity: item.status === 'ACTIVE' ? 1 : 0.65,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <div style={{ position: 'relative', height: '150px', background: '#f1f5f9' }}>
                          <img
                            src={item.imageUrl || item.product?.imageUrl || '/textures/calacatta_gold.jpg'}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '10px'
                          }}>
                            {item.badgeTag || 'Proje Fazlası'}
                          </span>

                          {item.status === 'SOLD' && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(15, 23, 42, 0.75)',
                              color: '#fff',
                              fontWeight: '900',
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              letterSpacing: '1px'
                            }}>
                              SATILDI / PASİF
                            </div>
                          )}
                        </div>

                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: '1.3' }}>
                              {item.title}
                            </h4>
                          </div>

                          <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '10px' }}>
                            {item.dimensions && <span>📏 {item.dimensions}</span>}
                            {item.colorFinish && <span>🎨 {item.colorFinish}</span>}
                          </div>

                          {item.notes && (
                            <p style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '8px 10px', borderRadius: '8px', margin: 0, lineHeight: '1.4' }}>
                              {item.notes}
                            </p>
                          )}

                          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Kalan Stok</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>📦 {item.quantityM2} m²</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              {discountPercent && (
                                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '800', display: 'block' }}>%{discountPercent} İndirimli</span>
                              )}
                              <span style={{ fontSize: '1rem', fontWeight: '900', color: '#ef4444' }}>
                                ₺{item.unitPrice.toLocaleString('tr-TR')} <span style={{ fontSize: '0.65rem', color: '#64748b' }}>/m²</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '6px' }}>
                            <button
                              onClick={() => handleToggleOutletStatus(item)}
                              style={{
                                background: item.status === 'ACTIVE' ? '#f1f5f9' : '#ecfdf5',
                                color: item.status === 'ACTIVE' ? '#475569' : '#047857',
                                border: '1px solid #cbd5e1',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {item.status === 'ACTIVE' ? 'Satıldı İşaretle' : 'Yeniden Aktif Et'}
                            </button>
                            <button
                              onClick={() => handleDeleteOutletListing(item.id)}
                              style={{
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                              title="Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ADD OUTLET LISTING MODAL */}
            {showAddOutletModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  maxWidth: '560px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: '#ef4444' }} />
                      Yeni Outlet / Proje Fazlası İlanı
                    </h3>
                    <button onClick={() => setShowAddOutletModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      <X size={20} />
                    </button>
                  </div>

                  {outletError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
                      ⚠️ {outletError}
                    </div>
                  )}

                  <form onSubmit={handleAddOutletListing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Markanızın Mevcut Ürününden Seçin (İsteğe Bağlı)
                      </label>
                      <select
                        value={outletProductId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setOutletProductId(pId);
                          const found = brandProducts.find(p => p.id === pId);
                          if (found) {
                            setOutletTitle(`${found.width}x${found.height} ${found.name} (${found.style} Karo)`);
                            setOutletDimensions(`${found.width}x${found.height} cm`);
                            setOutletColorFinish(`${found.finish || ''} ${found.color || ''}`.trim());
                            if (found.imageUrl) setOutletImageUrl(found.imageUrl);
                          }
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      >
                        <option value="">-- Kataloğunuzdan ürün seçin veya aşağıya yazın --</option>
                        {brandProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.width}x{p.height} cm</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        İlan / Ürün Başlığı *
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: 60x120 Calacatta Gold Parlak Porselen - Şantiye Fazlası Palet"
                        value={outletTitle}
                        onChange={(e) => setOutletTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Kategori *
                        </label>
                        <select
                          value={outletCategory}
                          onChange={(e) => setOutletCategory(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        >
                          <option value="PROJE_FAZLASI">Proje Fazlası (Şantiye Artığı)</option>
                          <option value="SERI_SONU">Seri Sonu (Kapatıyoruz)</option>
                          <option value="IKINCI_KALITE">2. Kalite Palet</option>
                          <option value="OUTLET">Depo Outlet</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Fırsat Etiketi / Rozeti
                        </label>
                        <select
                          value={outletBadgeTag}
                          onChange={(e) => setOutletBadgeTag(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        >
                          <option value="Kapatıyoruz / Proje Fazlası">Kapatıyoruz / Proje Fazlası</option>
                          <option value="2. Kalite Fırsat Palet">2. Kalite Fırsat Palet</option>
                          <option value="Seri Sonu Kapatıyoruz">Seri Sonu Kapatıyoruz</option>
                          <option value="Son Paletler Şok Fiyat">Son Paletler Şok Fiyat</option>
                          <option value="Şantiye Artığı Kelepir">Şantiye Artığı Kelepir</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Mevcut Stok (m²) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Örn: 45"
                          value={outletQuantityM2}
                          onChange={(e) => setOutletQuantityM2(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Outlet Fiyatı (₺/m²) *
                        </label>
                        <input
                          type="number"
                          placeholder="Örn: 285"
                          value={outletUnitPrice}
                          onChange={(e) => setOutletUnitPrice(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Orijinal Liste Fiyatı (₺/m²)
                        </label>
                        <input
                          type="number"
                          placeholder="Örn: 580"
                          value={outletOriginalPrice}
                          onChange={(e) => setOutletOriginalPrice(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Ebat Bilgisi
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: 60x120 cm"
                          value={outletDimensions}
                          onChange={(e) => setOutletDimensions(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Renk / Yüzey Tipi
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: Parlak Beyaz Mermer"
                          value={outletColorFinish}
                          onChange={(e) => setOutletColorFinish(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Ürün Fotoğrafı URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://... veya /textures/calacatta_gold.jpg"
                        value={outletImageUrl}
                        onChange={(e) => setOutletImageUrl(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Depo Notu / Durum Açıklaması
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Örn: Kadıköy lüks konut projesinden kalan paketli sıfır ürünler. Banyo yenilemek için ideal."
                        value={outletNotes}
                        onChange={(e) => setOutletNotes(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddOutletModal(false)}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                      >
                        İlanı Yayınla
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== DASHBOARD VIEW ===== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* No Subscription Warning Banner */}
            {!saasInfo && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid #fbbf24',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={22} style={{ color: '#92400e', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', fontWeight: '700', color: '#92400e' }}>Aktif Aboneliğiniz Bulunmuyor</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#a16207' }}>Müşteri bilgilerine tam erişim için bir yıllık paket seçin.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActivePortalTab('subscription')}
                  style={{
                    background: '#111',
                    color: '#d4af37',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CreditCard size={15} />
                  <span>Paketleri İncele</span>
                </button>
              </div>
            )}
            {/* STATS COUNT GRID */}
            <div className="dealer-stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px'
            }}>
              <div className="glass-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1'
                }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', margin: '0 0 4px 0' }}>Toplam Teklif Talebi</h4>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>{stats.totalLeads} Adet</span>
                </div>
              </div>

              <div className="glass-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(217, 119, 6, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706'
                }}>
                  <Activity size={22} className="animate-pulse" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', margin: '0 0 4px 0' }}>Bekleyen Talepler</h4>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#d97706' }}>{stats.pendingLeads} Adet</span>
                </div>
              </div>

              <div className="glass-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', margin: '0 0 4px 0' }}>Cevaplanan Talepler</h4>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10b981' }}>{stats.respondedLeads} Adet</span>
                </div>
              </div>
            </div>

            {/* QUICK B2B TOOLS GRID */}
            <div className="dealer-tools-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '28px'
            }}>
              {/* Kiosk Mode tool */}
              <div className="glass-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 2px 0', color: '#ffffff' }}>Kiosk Teşhir Modu</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Bu cihazı veya mağazadaki bir tableti dijital kiosk ekranına dönüştürün.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.open('/?kiosk=true', '_blank')}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Kiosk Teşhir Modunu Aç</span>
                </button>
              </div>

              {/* Analytics tool */}
              <div className="glass-panel" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(2,132,199,0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 2px 0', color: '#ffffff' }}>Bölgesel Arama Analizleri</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{dealerInfo?.city} şehrindeki tüketicilerin en çok aradığı modelleri analiz edin.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePortalTab('analytics')}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <TrendingUp size={13} />
                  <span>Detaylı Bölge Analitiğini Gör</span>
                </button>
              </div>
            </div>

            {/* LEADS LIST PANEL */}
            <div className="glass-panel" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0', color: '#ffffff' }}>Bana Yönlendirilen Müşteri Teklifleri</h3>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>Ziyaretçilerin size en yakın konumda olmanız sebebiyle gönderdiği palet/metraj bazlı seramik talepleri.</p>
                </div>
                <button 
                  onClick={loadDealerLeads} 
                  disabled={leadsLoading} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {leadsLoading ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
                  <span>Listeyi Yenile</span>
                </button>
              </div>

              {leadsLoading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#cbd5e1' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                  <span>Talepler yükleniyor...</span>
                </div>
              ) : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {leads.map(lead => (
                    <div key={lead.id} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>{lead.clientName}</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                            <a href={`tel:${lead.clientPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--accent-gold)', fontWeight: '600' }}>
                              <Phone size={11} /> {lead.clientPhone}
                            </a>
                            <a href={`mailto:${lead.clientEmail}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#cbd5e1' }}>
                              <Mail size={11} /> {lead.clientEmail}
                            </a>
                          </div>
                        </div>
                        
                        <select 
                          value={lead.status} 
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(15, 23, 42, 0.6)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: '700'
                          }}
                        >
                          <option value="PENDING">⏱️ Bekliyor</option>
                          <option value="RESPONDED">Fiyat İletildi</option>
                          <option value="COMPLETED">Satış Tamamlandı</option>
                        </select>
                      </div>

                      {(lead.requestedUsta || lead.requestedArchitect) && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {lead.requestedUsta && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid rgba(234, 88, 12, 0.25)' }}>
                              🛠️ Usta Talebi
                            </span>
                          )}
                          {lead.requestedArchitect && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                              📐 Mimar Talebi
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
                        {lead.product?.imageUrl && (
                          <img 
                            src={lead.product.imageUrl} 
                            alt={lead.product.name} 
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} 
                          />
                        )}
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: '#ffffff', display: 'block' }}>{lead.product?.name}</strong>
                          <span style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>SKU: {lead.product?.code}</span>
                        </div>
                      </div>

                      {lead.notes && (
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                          {lead.notes}
                        </div>
                      )}

                      {lead.projectDimensions && (
                        <div style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                          <strong>Ölçüler:</strong> {lead.projectDimensions}
                        </div>
                      )}

                      {lead.projectPhotoUrl && (
                        <div>
                          <a 
                            href={lead.projectPhotoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 'bold', textDecoration: 'underline' }}
                          >
                            🖼️ Fotoğraf / Kroki Gör ↗
                          </a>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '4px', fontSize: '0.72rem', color: '#94a3b8' }}>
                        <span>{new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}
                        >
                          <Trash2 size={13} /> Sil
                        </button>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      Henüz size yönlendirilmiş bir müşteri teklif talebi bulunmamaktadır.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.12)', textAlign: 'left', color: '#cbd5e1', fontWeight: '700' }}>
                        <th style={{ padding: '12px 16px' }}>Müşteri Bilgileri</th>
                        <th style={{ padding: '12px 16px' }}>Ürün Detayı</th>
                        <th style={{ padding: '12px 16px' }}>Müşteri Notu</th>
                        <th style={{ padding: '12px 16px' }}>Tarih</th>
                        <th style={{ padding: '12px 16px' }}>Durum</th>
                        <th style={{ padding: '12px 16px' }}>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px' }}>
                            <strong style={{ display: 'block', color: '#ffffff' }}>{lead.clientName}</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                              <Phone size={10} /> {lead.clientPhone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                              <Mail size={10} /> {lead.clientEmail}
                            </div>
                            
                            {/* Badges for requested services */}
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {lead.requestedUsta && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid rgba(234, 88, 12, 0.25)' }}>
                                  🛠️ Usta Talebi
                                </span>
                              )}
                              {lead.requestedArchitect && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                                  📐 Mimar Talebi
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {lead.product?.imageUrl && (
                                <img 
                                  src={lead.product.imageUrl} 
                                  alt={lead.product.name} 
                                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
                                />
                              )}
                              <div>
                                <strong style={{ color: '#ffffff' }}>{lead.product?.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#cbd5e1' }}>SKU: {lead.product?.code}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px', maxWidth: '240px', color: '#cbd5e1', lineHeight: '1.4' }}>
                            {lead.notes || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not bırakılmadı</span>}
                            
                            {lead.projectDimensions && (
                              <div style={{ marginTop: '6px', fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                                <strong>Ölçüler:</strong> {lead.projectDimensions}
                              </div>
                            )}
                            
                            {lead.projectPhotoUrl && (
                              <div style={{ marginTop: '6px' }}>
                                <a 
                                  href={lead.projectPhotoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 'bold', textDecoration: 'underline' }}
                                >
                                  🖼️ Fotoğraf / Kroki Gör ↗
                                </a>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            {lead.status === 'PENDING' && (
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                                Bekliyor
                              </span>
                            )}
                            {lead.status === 'RESPONDED' && (
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                Teklif Verildi
                              </span>
                            )}
                            {lead.status === 'COMPLETED' && (
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                                Satış Yapıldı
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <select 
                                value={lead.status} 
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  background: 'rgba(15, 23, 42, 0.6)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                <option value="PENDING">Bekliyor</option>
                                <option value="RESPONDED">Fiyat İletildi</option>
                                <option value="COMPLETED">Satış Tamamlandı</option>
                              </select>
                              <button 
                                onClick={() => handleDeleteLead(lead.id)} 
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Müşteri Talebini Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#cbd5e1' }}>
                            Henüz size yönlendirilmiş bir müşteri teklif talebi bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* RESPONSIVE STYLES */}
      <style jsx>{`
        /* ===== PORTAL GLASSMORPHIC DARK THEME ===== */
        .glass-panel {
          background: rgba(17, 24, 39, 0.7) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(212, 175, 55, 0.15) !important;
          color: #ffffff !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
        }

        .dealer-main-content h1, 
        .dealer-main-content h2, 
        .dealer-main-content h3, 
        .dealer-main-content h4, 
        .dealer-main-content h5 {
          color: #ffffff !important;
          font-family: var(--font-title, "Outfit", sans-serif);
        }

        .dealer-main-content p {
          color: #94a3b8 !important;
        }

        .dealer-main-content strong {
          color: #ffffff !important;
        }

        /* Tables styling */
        .dealer-main-content table {
          width: 100%;
          border-collapse: collapse;
          color: #cbd5e1 !important;
        }

        .dealer-main-content table th {
          background: rgba(255, 255, 255, 0.03) !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 14px 16px !important;
          font-size: 0.8rem;
        }

        .dealer-main-content table td {
          padding: 14px 16px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: #cbd5e1 !important;
          font-size: 0.82rem;
        }

        .dealer-main-content table tr:hover {
          background: rgba(255, 255, 255, 0.01) !important;
        }

        /* Inputs, textareas, selects */
        /* Inputs, textareas, selects */
        .dealer-main-content input,
        .dealer-main-content select,
        .dealer-main-content textarea {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease-in-out;
        }

        .dealer-main-content input:focus,
        .dealer-main-content select:focus,
        .dealer-main-content textarea:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #d4af37;
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }

        .dealer-main-content label {
          color: #cbd5e1;
          font-weight: 700;
        }

        /* Settings specific styles - High Contrast Light & Black Text Theme */
        .settings-container {
          max-width: 850px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .settings-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease;
        }

        .settings-card h2 {
          color: #0f172a !important;
        }

        .settings-card h3 {
          color: #0f172a !important;
        }

        .settings-card p {
          color: #475569 !important;
        }

        .settings-card label {
          color: #1e293b !important;
          font-weight: 800 !important;
        }

        .settings-card span {
          color: #334155 !important;
        }

        .settings-section {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
        }

        .analytics-white-card {
          background: #ffffff !important;
          color: #0f172a !important;
        }

        .analytics-white-card h4 {
          color: #0f172a !important;
        }

        /* ===== QUOTE FORM CARD — White card dark text overrides ===== */
        .quote-form-card {
          background: #ffffff !important;
          color: #1e293b !important;
        }

        .quote-form-card h3,
        .quote-form-card h4 {
          color: #0f172a !important;
        }

        .quote-form-card label {
          color: #334155 !important;
          font-weight: 700 !important;
        }

        .quote-form-card span {
          color: #334155 !important;
        }

        .quote-form-card input,
        .quote-form-card select,
        .quote-form-card textarea {
          background-color: #ffffff !important;
          border: 1.5px solid #94a3b8 !important;
          color: #0f172a !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          opacity: 1 !important;
          caret-color: #0f172a !important;
        }

        .quote-form-card input:focus,
        .quote-form-card select:focus,
        .quote-form-card textarea:focus {
          background-color: #ffffff !important;
          border-color: #d4af37 !important;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.25) !important;
          color: #0f172a !important;
        }

        .quote-form-card input::placeholder,
        .quote-form-card select::placeholder,
        .quote-form-card textarea::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }

        .quote-form-card .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ===== QUOTE CALC PREVIEW CARD — White card dark text ===== */
        .quote-calc-card {
          background: #ffffff !important;
          color: #475569 !important;
        }

        .quote-calc-card span {
          color: #475569 !important;
        }

        .quote-calc-card strong {
          color: #0f172a !important;
        }

        /* ===== PAYMENT MODAL CARD — White card dark text ===== */
        .payment-modal-card {
          background: #ffffff !important;
          color: #0f172a !important;
        }

        .payment-modal-card h3,
        .payment-modal-card h4 {
          color: #0f172a !important;
        }

        .payment-modal-card p,
        .payment-modal-card div,
        .payment-modal-card span {
          color: #334155 !important;
        }

        .payment-modal-card strong {
          color: #0f172a !important;
        }

        .payment-modal-card label {
          color: #334155 !important;
          font-weight: 700 !important;
        }

        .payment-modal-card input,
        .payment-modal-card select,
        .payment-modal-card textarea {
          background-color: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          color: #0f172a !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          opacity: 1 !important;
          caret-color: #0f172a !important;
        }

        .payment-modal-card input:focus,
        .payment-modal-card select:focus,
        .payment-modal-card textarea:focus {
          background-color: #ffffff !important;
          border-color: #d4af37 !important;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.25) !important;
          color: #0f172a !important;
        }

        .payment-modal-card input::placeholder,
        .payment-modal-card textarea::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }

        .catalog-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 10px;
          align-items: center;
        }

        .settings-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .settings-grid-address {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
        }

        .settings-upload-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        /* 100% PURE BLACK TEXT FOR ALL SETTINGS INPUTS, TEXTAREAS & SELECTS */
        .settings-card input,
        .settings-card textarea,
        .settings-card select,
        .portal-input,
        .dealer-card-input,
        .dealer-card-textarea {
          background-color: #ffffff !important;
          border: 1.5px solid #94a3b8 !important;
          color: #000000 !important;
          font-weight: 700 !important;
          font-size: 0.88rem !important;
          opacity: 1 !important;
          caret-color: #000000 !important;
          box-sizing: border-box !important;
          max-width: 100% !important;
        }

        .settings-card input:focus,
        .settings-card textarea:focus,
        .settings-card select:focus,
        .portal-input:focus,
        .dealer-card-input:focus,
        .dealer-card-textarea:focus {
          background-color: #ffffff !important;
          border-color: #d4af37 !important;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.25) !important;
          color: #000000 !important;
        }

        .settings-card input::placeholder,
        .settings-card textarea::placeholder,
        .portal-input::placeholder,
        .dealer-card-input::placeholder,
        .dealer-card-textarea::placeholder {
          color: #64748b !important;
          opacity: 1 !important;
          font-weight: 500 !important;
        }

        .hover-gold-btn {
          transition: all 0.2s ease-in-out !important;
        }

        .hover-gold-btn:hover {
          background-color: #b38e47 !important;
          color: #090d16 !important;
          border-color: #b38e47 !important;
        }

        .hover-gold-solid-btn {
          transition: all 0.25s ease-in-out !important;
        }

        .hover-gold-solid-btn:hover {
          opacity: 0.95 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(179, 142, 71, 0.3) !important;
        }

        .showroom-thumb-wrapper:hover button {
          transform: scale(1.1) !important;
        }

        .portal-submit-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .portal-submit-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px rgba(179, 142, 71, 0.32) !important;
        }

        .portal-submit-btn:active {
          transform: translateY(0) !important;
        }

        /* Hover links inside portal */
        .hover-gold-text {
          transition: color 0.2s;
        }
        .hover-gold-text:hover {
          color: #d4af37 !important;
        }

        /* ===== TABLET (max-width: 1024px) ===== */
        @media (max-width: 1024px) {
          .dealer-header-container {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px 16px !important;
          }
          .dealer-header-brand {
            width: 100% !important;
          }
          .dealer-header-actions {
            width: 100% !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            gap: 8px !important;
          }
          .dealer-tabs-nav {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            flex: 1 !important;
            scrollbar-width: none !important;
          }
          .dealer-tabs-nav::-webkit-scrollbar {
            display: none !important;
          }
          .dealer-main-content {
            padding: 20px 16px !important;
          }
          .b2b-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }

        /* ===== MOBILE (max-width: 768px) ===== */
        @media (max-width: 768px) {
          .dealer-header-container {
            padding: 10px 12px !important;
          }
          .dealer-header-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .dealer-tabs-nav {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .dealer-tabs-nav button {
            flex: 1 !important;
            justify-content: center !important;
            padding: 8px 6px !important;
            font-size: 0.7rem !important;
          }
          .dealer-tabs-nav button span {
            display: none !important;
          }
          .dealer-main-content {
            padding: 14px 10px !important;
          }
          .login-card {
            padding: 24px 18px !important;
            border-radius: 16px !important;
          }
          .dealer-project-details-split,
          .dealer-pricing-grid,
          .dealer-stats-grid,
          .campaign-inputs-grid,
          .inventory-dashboard-grid,
          .quote-form-card .form-group-row,
          .catalog-inputs-grid,
          .settings-grid-2,
          .settings-grid-address {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .settings-card {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .settings-section {
            padding: 14px !important;
            gap: 14px !important;
          }
        }

        /* ===== SMALL MOBILE (max-width: 480px) ===== */
        @media (max-width: 480px) {
          .dealer-header-brand h1 {
            font-size: 0.85rem !important;
          }
          .dealer-tabs-nav button {
            padding: 8px 4px !important;
            min-width: 0 !important;
          }
          .dealer-main-content {
            padding: 10px 6px !important;
          }
          .login-card {
            padding: 20px 14px !important;
          }
          .modal-form-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .payment-modal-card {
            padding: 18px 14px !important;
            max-width: 95vw !important;
          }
        }

        @media (max-width: 580px) {
          .settings-upload-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .settings-upload-row > div {
            align-self: center !important;
          }
          .modal-form-row {
            flex-direction: column !important;
            gap: 12px !important;
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
          <div className="payment-modal-card" style={{
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
              background: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              color: '#0f172a'
            }}>
              <div><strong style={{ color: '#0f172a' }}>Banka:</strong> <span style={{ color: '#0f172a', fontWeight: '700' }}>{bankDetails.bank_name || 'Akbank'}</span></div>
              <div><strong style={{ color: '#0f172a' }}>Alıcı:</strong> <span style={{ color: '#0f172a', fontWeight: '700' }}>{bankDetails.bank_recipient || 'SeramikBak Yazılım A.Ş.'}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div><strong style={{ color: '#0f172a' }}>IBAN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>{bankDetails.bank_iban || 'TR98 0004 6001 5000 1234 5678 90'}</span></div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(bankDetails.bank_iban || 'TR98 0004 6001 5000 1234 5678 90');
                    alert('IBAN panoya kopyalandı!');
                  }}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  Kopyala
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', borderTop: '1px solid #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                * Açıklama alanına bayinizin adını (<strong style={{ color: '#0f172a' }}>{dealerInfo?.name}</strong>) yazmayı unutmayın.
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

      {/* Manuel Ürün Ekleme Modali */}
      {showAddInventoryModal && (
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
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: '480px',
            padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowAddInventoryModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 20px 0', color: '#0f172a' }}>Manüel Envanter Ekle</h3>

            <form onSubmit={handleAddInventoryItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Ürün Seçin</label>
                <select 
                  value={addInventoryProduct}
                  onChange={(e) => setAddInventoryProduct(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
                >
                  <option value="">Ürün Seçiniz...</option>
                  {brandProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                  ))}
                </select>
              </div>

              <div className="modal-form-row" style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Stok Miktarı (m²)</label>
                  <input 
                    type="number"
                    value={addInventoryStock}
                    onChange={(e) => setAddInventoryStock(e.target.value)}
                    required
                    min="0"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Özel Fiyat (₺ / m²)</label>
                  <input 
                    type="number"
                    value={addInventoryPrice}
                    onChange={(e) => setAddInventoryPrice(e.target.value)}
                    placeholder="Liste Fiyatı"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Durum</label>
                <select 
                  value={addInventoryStatus}
                  onChange={(e) => setAddInventoryStatus(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
                >
                  <option value="IN_STOCK">🟢 Stokta Var</option>
                  <option value="DISPLAY_ONLY">🟡 Teşhir Ürünü</option>
                  <option value="ORDER_ONLY">🔵 Sipariş Üzerine</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddInventoryModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #b38e47 0%, #8c6b30 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Envantere Ekle
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
            { id: 'b2b-projects', label: 'Talepler', icon: <Building2 size={20} /> },
            { id: 'inventory', label: 'Stok', icon: <Package size={20} /> },
            { id: 'settings', label: 'Ayarlar', icon: <Settings size={20} /> },
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
                { id: 'quick-quote', label: 'PDF Teklif Oluştur', icon: <Calculator size={18} /> },
                { id: 'b2b-projects', label: 'Proje Talepleri', icon: <Building2 size={18} /> },
                { id: 'analytics', label: 'Bölge Analitiği', icon: <TrendingUp size={18} /> },
                { id: 'inventory', label: 'Envanter & Stok', icon: <Package size={18} /> },
                { id: 'subscription', label: 'Abonelik & SaaS', icon: <CreditCard size={18} /> },
                { id: 'settings', label: 'Şube Ayarları', icon: <Settings size={18} /> }
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

      {/* Generated Corporate PDF Quote Template Modal */}
      {generatedQuote && (
        <QuotePDFTemplate 
          quote={generatedQuote} 
          onClose={() => setGeneratedQuote(null)} 
        />
      )}
      </div>
    </div>
  );
}
