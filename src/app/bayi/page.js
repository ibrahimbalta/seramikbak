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
  Layers
} from 'lucide-react';
import Link from 'next/link';

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

  // Portal navigation: 'dashboard', 'b2b-projects', 'subscription', 'settings'
  const [activePortalTab, setActivePortalTab] = useState('dashboard');

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
  const [profileShowroomImages, setProfileShowroomImages] = useState('');
  const [profileVirtualTourUrl, setProfileVirtualTourUrl] = useState('');
  const [profileSpecialConcepts, setProfileSpecialConcepts] = useState('');
  const [profileAboutText, setProfileAboutText] = useState('');
  const [profileLogisticsServices, setProfileLogisticsServices] = useState('shipping,showroom_stock,credit_card,install_support');
  const [profileFeaturedProducts, setProfileFeaturedProducts] = useState([]);
  const [profileDealerCampaigns, setProfileDealerCampaigns] = useState([]);
  const [profileReferenceProjects, setProfileReferenceProjects] = useState([]);
  const [profileDealerFaqs, setProfileDealerFaqs] = useState([]);
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
        setProfileShowroomImages(session.showroomImages || '');
        setProfileVirtualTourUrl(session.virtualTourUrl || '');
        setProfileSpecialConcepts(session.specialConcepts || '');
        setProfileAboutText(session.aboutText || '');
        setProfileLogisticsServices(session.logisticsServices || 'shipping,showroom_stock,credit_card,install_support');
        setProfileFeaturedProducts(safeParseJSON(session.featuredProducts, []));
        setProfileDealerCampaigns(safeParseJSON(session.dealerCampaigns, []));
        setProfileReferenceProjects(safeParseJSON(session.referenceProjects, []));
        setProfileDealerFaqs(safeParseJSON(session.dealerFaqs, []));
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
        setProfileShowroomImages(data.dealer.showroomImages || '');
        setProfileVirtualTourUrl(data.dealer.virtualTourUrl || '');
        setProfileSpecialConcepts(data.dealer.specialConcepts || '');
        setProfileAboutText(data.dealer.aboutText || '');
        setProfileLogisticsServices(data.dealer.logisticsServices || 'shipping,showroom_stock,credit_card,install_support');
        setProfileFeaturedProducts(safeParseJSON(data.dealer.featuredProducts, []));
        setProfileDealerCampaigns(safeParseJSON(data.dealer.dealerCampaigns, []));
        setProfileReferenceProjects(safeParseJSON(data.dealer.referenceProjects, []));
        setProfileDealerFaqs(safeParseJSON(data.dealer.dealerFaqs, []));
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
          showroomImages: profileShowroomImages,
          virtualTourUrl: profileVirtualTourUrl,
          specialConcepts: profileSpecialConcepts,
          aboutText: profileAboutText,
          logisticsServices: profileLogisticsServices,
          featuredProducts: JSON.stringify(profileFeaturedProducts),
          dealerCampaigns: JSON.stringify(profileDealerCampaigns),
          referenceProjects: JSON.stringify(profileReferenceProjects),
          dealerFaqs: JSON.stringify(profileDealerFaqs),
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
          showroomImages: profileShowroomImages,
          virtualTourUrl: profileVirtualTourUrl,
          specialConcepts: profileSpecialConcepts,
          aboutText: profileAboutText,
          logisticsServices: profileLogisticsServices,
          featuredProducts: JSON.stringify(profileFeaturedProducts),
          dealerCampaigns: JSON.stringify(profileDealerCampaigns),
          referenceProjects: JSON.stringify(profileReferenceProjects),
          dealerFaqs: JSON.stringify(profileDealerFaqs)
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
      <main className="login-layout-split" style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#0f172a'
      }}>
        {/* LEFT BRANDING/BENEFITS COLUMN */}
        <div className="login-left-panel" style={{
          flex: '1.2',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle gold decoration sphere */}
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

          {/* Logo & Back button */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'color 0.2s',
              marginBottom: '40px'
            }} className="hover-white">
              <ArrowLeft size={16} /> <span>Ana Sayfaya Dön</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.3rem',
                boxShadow: '0 8px 20px rgba(179, 142, 71, 0.25)'
              }}>SB</div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>SeramikBak</h2>
                <span style={{ fontSize: '0.72rem', color: '#b38e47', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>B2B İş Ortaklığı Ağı</span>
              </div>
            </div>
          </div>

          {/* Main Proposition */}
          <div style={{ position: 'relative', zIndex: 10, margin: '40px 0' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              lineHeight: '1.2',
              marginBottom: '20px',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Müşterileriniz Sizleri Dijitalde Keşfetsin
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '36px', maxWidth: '520px' }}>
              SeramikBak B2B Bayi Ağı'na katılarak, bölgenizdeki seramik alıcılarına doğrudan ulaşın, sıcak satış teklifleri toplayın ve toplu inşaat ihalelerine teklif sunun.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { icon: <TrendingUp size={20} />, title: "Doğrudan Teklif Talepleri", desc: "Ziyaretçilerin seçtikleri seramik modelleri için konumlarına en yakın yetkili bayi olarak anında sıcak teklifler alın." },
                { icon: <Building2 size={20} />, title: "B2B Toplu Proje İhaleleri", desc: "Müteahhit ve mimarların sisteme yüklediği binlerce metrekarelik toplu seramik alım taleplerine teklif sunun." },
                { icon: <Activity size={20} />, title: "Kiosk Teşhir Modu", desc: "Showroomunuzda sergilediğiniz veya dijitaldeki 25.000+ seramiği kendi bayi fiyatlarınızla müşterilere sunun." },
                { icon: <ShieldCheck size={20} />, title: "Detaylı Bölge Analitiği", desc: "Bölgenizde hangi seramik markalarının, renklerinin ve boyutlarının daha çok arandığını canlı veriyle analiz edin." }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#b38e47',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>{item.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b38e47' }}>120+</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Yetkili Bayi</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>24.500+</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Yönlendirilen Talep</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>100%</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Güvenli B2B Altyapı</div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM COLUMN */}
        <div className="login-right-panel" style={{
          flex: '1',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff',
          overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '460px', width: '100%', margin: '0 auto' }}>
            
            {/* Header for mobile view (shows logo if left panel hidden) */}
            <div className="mobile-header-only" style={{ marginBottom: '32px', display: 'none', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.1rem'
              }}>SB</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>SeramikBak Bayi Portalı</h2>
            </div>

            {/* Tab Switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '32px'
            }}>
              <button
                type="button"
                onClick={() => { setRegisterTab('login'); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                style={{
                  background: registerTab === 'login' ? '#ffffff' : 'transparent',
                  border: 'none',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  color: registerTab === 'login' ? '#0f172a' : '#64748b',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: registerTab === 'login' ? '0 4px 12px rgba(15, 23, 42, 0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => { setRegisterTab('register'); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                style={{
                  background: registerTab === 'register' ? '#ffffff' : 'transparent',
                  border: 'none',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  color: registerTab === 'register' ? '#0f172a' : '#64748b',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: registerTab === 'register' ? '0 4px 12px rgba(15, 23, 42, 0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Bayilik Başvurusu
              </button>
            </div>

            {/* LOGIN FORM */}
            {registerTab === 'login' ? (
              <div className="login-form-wrapper">
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>Yetkili Girişi</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Portalınıza erişmek için bilgilerinizi doğrulayın.</p>
                </div>

                {loginError && (
                  <div style={{
                    background: '#fee2e2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>E-posta veya Telefon</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        required
                        placeholder="bayi@seramik.com veya 0216..."
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 40px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          background: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        className="form-input-field"
                      />
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şifre</label>
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
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          background: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        className="form-input-field"
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: '#0f172a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '14px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      transition: 'all 0.2s'
                    }}
                    className="hover-gold-bg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Doğrulanıyor...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Portal Girişi Yap</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <div className="register-form-wrapper">
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>Bayilik Başvurusu</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Başvurunuz sisteme kaydedilecek ve onay sürecine alınacaktır.</p>
                </div>

                {regSuccess && (
                  <div style={{
                    background: '#ecfdf5',
                    color: '#10b981',
                    border: '1px solid #a7f3d0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    <CheckCircle size={16} />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {regError && (
                  <div style={{
                    background: '#fee2e2',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Bayi Adı / Şube</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        placeholder="Örn: Qua Seramik Kadıköy"
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Yetkili Marka</label>
                      <select
                        value={regBrandId}
                        onChange={(e) => setRegBrandId(e.target.value)}
                        required
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#fff' }}
                      >
                        <option value="">Seçiniz...</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>E-posta</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="bayi@mail.com"
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Telefon</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                        placeholder="0216 123 4567"
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şifre</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min. 6 karakter"
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>İlçe</label>
                      <input
                        type="text"
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        required
                        placeholder="Kadıköy"
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şehir</label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        required
                        placeholder="İstanbul"
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şube Açık Adresi</label>
                    <textarea
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      required
                      placeholder="Göztepe Mah. Bağdat Cad. No:120"
                      rows={2}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Lat Lng Section with Geocoding helper */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px dashed #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#475569' }}>Harita Konum Koordinatları</span>
                      <button
                        type="button"
                        onClick={handleGeocode}
                        disabled={isGeocoding}
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isGeocoding ? <Loader2 size={10} className="animate-spin" /> : <MapPin size={10} />}
                        <span>{isGeocoding ? 'Aranıyor...' : 'Adresten Konumu Bul'}</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: '600', color: '#64748b' }}>Enlem (Lat)</label>
                        <input
                          type="text"
                          value={regLat}
                          onChange={(e) => setRegLat(e.target.value)}
                          required
                          placeholder="Örn: 40.9901"
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: '600', color: '#64748b' }}>Boylam (Lng)</label>
                        <input
                          type="text"
                          value={regLng}
                          onChange={(e) => setRegLng(e.target.value)}
                          required
                          placeholder="Örn: 29.0278"
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <small style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: '1.2' }}>
                      * Müşterilere en yakın yetkili bayi olarak gösterilmeniz için koordinatlar gereklidir. Adresten bulamazsa manuel koordinat yazabilirsiniz.
                    </small>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    style={{
                      background: '#b38e47',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '14px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(179, 142, 71, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      marginTop: '6px'
                    }}
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
              marginTop: '40px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '20px'
            }}>
              🔒 SeramikBak SSL ve Yetkili Bayi Ağ Güvenliği Koruması Altındadır.
            </div>

          </div>
        </div>

        {/* Global utility styles inside component */}
        <style jsx global>{`
          .hover-white:hover {
            color: #ffffff !important;
          }
          .hover-gold-bg:hover:not(:disabled) {
            background: #b38e47 !important;
            box-shadow: 0 4px 14px rgba(179, 142, 71, 0.3) !important;
          }
          .form-input-field:focus {
            border-color: #b38e47 !important;
            box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.1) !important;
          }
          
          /* RESPONSIVE LAYOUT RULES */
          @media (max-width: 991px) {
            .login-left-panel {
              display: none !important;
            }
            .login-right-panel {
              flex: 1 !important;
              padding: 40px 20px !important;
            }
            .mobile-header-only {
              display: flex !important;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      color: '#212529',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* HEADER NAVBAR */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e9ecef',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div className="dealer-header-container" style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="dealer-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #111 0%, #333 100%)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.1rem'
            }}>SB</div>
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {dealerInfo.name} 
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: '#e9ecef', color: '#495057', fontWeight: '700' }}>
                  {dealerInfo.brandName} Bayisi
                </span>
                {saasInfo && (
                  <span style={{ 
                    fontSize: '0.68rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: saasInfo.plan === 'PREMIUM' ? 'linear-gradient(135deg, #111 0%, #333 100%)' : '#d4af37', 
                    color: saasInfo.plan === 'PREMIUM' ? '#d4af37' : '#000', 
                    fontWeight: '700' 
                  }}>
                    {saasInfo.plan} Üyelik
                  </span>
                )}
                {!saasInfo && (
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', fontWeight: '700' }}>
                    Aboneliksiz / Süresi Dolmuş
                  </span>
                )}
              </h1>
              <p style={{ fontSize: '0.7rem', color: '#6c757d', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} /> {dealerInfo.district}, {dealerInfo.city}
              </p>
            </div>
          </div>

          <div className="dealer-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saasInfo?.expiresAt && (
              <div style={{ fontSize: '0.75rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                <Calendar size={12} />
                <span>Paket Bitiş: {new Date(saasInfo.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}

            <div className="dealer-tabs-nav" style={{ display: 'flex', gap: '4px', background: '#f1f3f5', borderRadius: '8px', padding: '3px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setActivePortalTab('dashboard'); setShowSettings(false); }}
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
                <span>Panel</span>
              </button>
              <button 
                onClick={() => { setActivePortalTab('b2b-projects'); setShowSettings(false); }}
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
              <button 
                onClick={() => { setActivePortalTab('analytics'); setShowSettings(false); }}
                style={{
                  background: activePortalTab === 'analytics' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: activePortalTab === 'analytics' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: activePortalTab === 'analytics' ? '#111' : '#6c757d',
                  boxShadow: activePortalTab === 'analytics' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <TrendingUp size={13} />
                <span>Bölge Analitiği</span>
              </button>
              <button 
                onClick={() => { setActivePortalTab('subscription'); setShowSettings(false); }}
                style={{
                  background: activePortalTab === 'subscription' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: activePortalTab === 'subscription' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: activePortalTab === 'subscription' ? '#111' : '#6c757d',
                  boxShadow: activePortalTab === 'subscription' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <CreditCard size={13} />
                <span>Abonelik</span>
              </button>
              <button 
                onClick={() => { setActivePortalTab('inventory'); setShowSettings(false); }}
                style={{
                  background: activePortalTab === 'inventory' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: activePortalTab === 'inventory' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: activePortalTab === 'inventory' ? '#111' : '#6c757d',
                  boxShadow: activePortalTab === 'inventory' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Package size={13} />
                <span>Envanter & Stok</span>
              </button>
              <button 
                onClick={() => { setActivePortalTab('settings'); setShowSettings(true); }}
                style={{
                  background: activePortalTab === 'settings' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: activePortalTab === 'settings' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: activePortalTab === 'settings' ? '#111' : '#6c757d',
                  boxShadow: activePortalTab === 'settings' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Settings size={13} />
                <span>Ayarlar</span>
              </button>
            </div>

            <button 
              onClick={handleLogout} 
              style={{
                background: 'transparent',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#dc3545'
              }}
            >
              <LogOut size={13} />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* PORTAL MAIN CONTENT */}
      <main className="dealer-main-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {activePortalTab === 'b2b-projects' ? (
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
                    <div key={proj.id} style={{
                      background: '#fff',
                      border: '1px solid #e9ecef',
                      borderRadius: '16px',
                      padding: '24px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
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
                            <div>Toplam Metraj: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{proj.quantityM2.toLocaleString('tr-TR')} m²</strong></div>
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
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', position: 'relative' }}>
                            <button type="button" onClick={() => removeCampaign(idx)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                            <input 
                              type="text" 
                              value={camp.title} 
                              onChange={(e) => updateCampaign(idx, 'title', e.target.value)} 
                              placeholder="Kampanya Başlığı (Örn: Lapatto Serisinde %10 İndirim)"
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
                            />
                            <textarea 
                              value={camp.desc} 
                              onChange={(e) => updateCampaign(idx, 'desc', e.target.value)} 
                              placeholder="Kampanya Açıklaması/Koşulları..."
                              rows={2}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            />
                            <input 
                              type="text" 
                              value={camp.expiresAt} 
                              onChange={(e) => updateCampaign(idx, 'expiresAt', e.target.value)} 
                              placeholder="Geçerlilik Tarihi (Örn: 31 Ağustos'a kadar)"
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
                            />
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
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', position: 'relative' }}>
                            <button type="button" onClick={() => removeReferenceProject(idx)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                            <input 
                              type="text" 
                              value={proj.title} 
                              onChange={(e) => updateReferenceProject(idx, 'title', e.target.value)} 
                              placeholder="Proje Adı (Örn: Rixos Hotel Lobby Kaplaması)"
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
                            />
                            <input 
                              type="text" 
                              value={proj.imageUrl} 
                              onChange={(e) => updateReferenceProject(idx, 'imageUrl', e.target.value)} 
                              placeholder="Proje Görsel URL'si (http://... veya /textures/...)"
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
                            />
                            <textarea 
                              value={proj.desc} 
                              onChange={(e) => updateReferenceProject(idx, 'desc', e.target.value)} 
                              placeholder="Kullanılan ürünler ve proje detayı..."
                              rows={2}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            />
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
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', position: 'relative' }}>
                            <button type="button" onClick={() => removeFaq(idx)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                            <input 
                              type="text" 
                              value={faq.q} 
                              onChange={(e) => updateFaq(idx, 'q', e.target.value)} 
                              placeholder="Soru (Örn: Şehir dışı nakliye yapıyor musunuz?)"
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none' }}
                            />
                            <textarea 
                              value={faq.a} 
                              onChange={(e) => updateFaq(idx, 'a', e.target.value)} 
                              placeholder="Cevap..."
                              rows={2}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            />
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
                    gap: '8px',
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
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={22} style={{ color: '#b38e47' }} />
                  Bölgesel Arama & Seramik Analitiği
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#6c757d', margin: 0 }}>
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Detaylı Analiz Kilitli</h3>
                <p style={{ fontSize: '0.82rem', color: '#6c757d', maxWidth: '450px', margin: 0 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                
                {/* Card 1: Popular Search Queries */}
                <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 16px 0', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔍 En Sık Aranan Kelimeler
                  </h4>
                  {regionalAnalytics.popularQueries.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', padding: '12px 0' }}>Bölgenizde yeterli arama kaydı yok.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {regionalAnalytics.popularQueries.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: '600' }}>"{item.query}"</span>
                            <span style={{ color: '#6c757d' }}>{item.count} arama</span>
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
                <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 16px 0', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏢 Popüler Marka İncelemeleri
                  </h4>
                  {regionalAnalytics.popularBrands.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', padding: '12px 0' }}>Bölgenizde yeterli marka verisi yok.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {regionalAnalytics.popularBrands.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: '600' }}>{item.name}</span>
                            <span style={{ color: '#6c757d' }}>{item.count} görüntülenme</span>
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
                <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 16px 0', borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📐 Boyut & Tarz Tercihleri
                  </h4>
                  {regionalAnalytics.popularStyles.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', padding: '12px 0' }}>Bölgenizde yeterli ebat verisi yok.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {regionalAnalytics.popularStyles.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: '600' }}>{item.style}</span>
                            <span style={{ color: '#6c757d' }}>{item.count} kez incelendi</span>
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
              background: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', color: '#111' }}>Paket Karşılaştırma Tablosu</h3>
              <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: '0 0 20px 0' }}>Tüm paketlerin detaylı özellik karşılaştırması</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e9ecef', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#6c757d' }}>Özellik</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#64748b', textAlign: 'center' }}>LITE</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#b45309', textAlign: 'center', background: '#fffbeb' }}>STANDART</th>
                      <th style={{ padding: '12px 16px', fontWeight: '700', color: '#111', textAlign: 'center' }}>PREMIUM</th>
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
                      <tr key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td style={{ padding: '13px 16px', fontWeight: '600', color: '#374151' }}>{row.feature}</td>
                        {[row.lite, row.standart, row.premium].map((val, ci) => (
                          <td key={ci} style={{ padding: '13px 16px', textAlign: 'center', background: ci === 1 ? '#fffbf5' : 'transparent' }}>
                            {val === true ? <Check size={16} style={{ color: '#10b981', margin: '0 auto' }} /> 
                              : val === false ? <X size={16} style={{ color: '#e2e8f0', margin: '0 auto' }} /> 
                              : <span style={{ fontWeight: '600', color: ci === 2 ? '#7c3aed' : '#374151' }}>{val}</span>}
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
              background: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 20px 0', color: '#111' }}>Sık Sorulan Sorular</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { q: 'Abonelik süresi dolunca ne olur?', a: 'Aboneliğiniz sona erdiğinde gelen müşteri talepleri görünmeye devam eder ancak müşteri iletişim bilgileri maskelenir. Yenileme yaparak erişiminizi geri kazanabilirsiniz.' },
                  { q: 'Paket yükseltme yapabilir miyim?', a: 'Evet, dilediğiniz zaman daha üst bir pakete geçiş yapabilirsiniz. Mevcut sürenize kalan gün sayısı kadar indirim uygulanır.' },
                  { q: 'Ödeme nasıl yapılır?', a: 'Kredi kartı, banka havalesi/EFT ve sanal POS ile güvenli ödeme yapabilirsiniz. Fatura otomatik olarak e-posta adresinize gönderilir.' },
                  { q: 'İptal/iade politikası nedir?', a: 'İlk 14 gün içinde koşulsuz iade garantisi sunulmaktadır. 14 gün sonrası için kalan süre üzerinden orantılı iade yapılır.' },
                ].map((faq, i) => (
                  <div key={i} style={{ padding: '16px 20px', background: '#f8f9fa', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '0 0 6px 0', color: '#111' }}>{faq.q}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, lineHeight: '1.5' }}>{faq.a}</p>
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

            <div className="inventory-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '24px' }}>
              
              {/* LEFT SIDE: UPLOAD & SYNC */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Excel/CSV Card */}
                <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} style={{ color: 'var(--accent-gold)' }} />
                    Excel / CSV ile Yükleme
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    Aşağıdaki alana Excel'den kopyaladığınız CSV formatındaki ürün kodları ve stok miktarlarını yapıştırarak toplu güncelleme yapabilirsiniz.
                  </p>
                  
                  <div style={{ marginBottom: '14px' }}>
                    <a 
                      href="data:text/csv;charset=utf-8,UrunKodu,StokMiktari,Fiyat,Durum%0ADECO-AGREGA-120X240,150,1250,IN_STOCK%0ADECO-TRAVERTEN-60X120,0,0,DISPLAY_ONLY" 
                      download="seramikbak_stok_sablonu.csv"
                      style={{ fontSize: '0.75rem', color: '#b38e47', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      📥 CSV Şablonu İndir
                    </a>
                  </div>

                  <form onSubmit={handleCsvUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      value={csvContentInput}
                      onChange={(e) => setCsvContentInput(e.target.value)}
                      placeholder="UrunKodu,StokMiktari,Fiyat,Durum&#10;DECO-AGREGA-120X240,150,1250,IN_STOCK&#10;DECO-TRAVERTEN-60X120,0,0,DISPLAY_ONLY"
                      rows={6}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontFamily: 'monospace', resize: 'vertical' }}
                    />
                    <button 
                      type="submit" 
                      disabled={csvLoading || !csvContentInput.trim()}
                      style={{
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
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
                <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} style={{ color: 'var(--accent-gold)' }} />
                    XML Feed Canlı Entegrasyon
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    Muhasebe veya ERP (Logo, Nebim vb.) sisteminizdeki seramik stok XML linkini kaydederek envanterin her gün otomatik güncellenmesini sağlayabilirsiniz.
                  </p>

                  <form onSubmit={handleSaveXmlFeed} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <input 
                      type="url"
                      value={xmlFeedUrlInput}
                      onChange={(e) => setXmlFeedUrlInput(e.target.value)}
                      placeholder="https://firmamiz.com/xml/stok-feed"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                    <button 
                      type="submit"
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
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
              <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Aktif Showroom Envanteri</h3>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                    {inventoryList.length} Ürün Listeleniyor
                  </span>
                </div>

                {inventoryLoading ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                    <span>Envanter yükleniyor...</span>
                  </div>
                ) : inventoryList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                    <Package size={32} style={{ margin: '0 auto 10px auto', color: '#cbd5e1' }} />
                    <span style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Envanterinizde henüz ürün bulunmuyor.</span>
                    <span style={{ fontSize: '0.75rem' }}>Sol taraftaki panelden CSV yükleyebilir veya üstteki butondan manuel ekleyebilirsiniz.</span>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                          <th style={{ padding: '10px', color: '#64748b' }}>Ürün</th>
                          <th style={{ padding: '10px', color: '#64748b' }}>Stok (m²)</th>
                          <th style={{ padding: '10px', color: '#64748b' }}>Özel Fiyat (₺)</th>
                          <th style={{ padding: '10px', color: '#64748b' }}>Durum</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryList.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={item.product?.imageUrl} alt={item.product?.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', background: '#f8fafc' }} />
                              <div>
                                <span style={{ fontWeight: '700', color: '#0f172a', display: 'block' }}>{item.product?.name}</span>
                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Kod: {item.product?.code}</span>
                              </div>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="number"
                                defaultValue={item.stock}
                                onBlur={(e) => handleUpdateInventoryItem(item.productId, e.target.value, item.price, item.status)}
                                style={{ width: '60px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="number"
                                defaultValue={item.price || ''}
                                placeholder="Liste"
                                onBlur={(e) => handleUpdateInventoryItem(item.productId, item.stock, e.target.value, item.status)}
                                style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateInventoryItem(item.productId, item.stock, item.price, e.target.value)}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', background: '#fff' }}
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
                background: '#fff',
                border: '1px solid #e9ecef',
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
                  background: '#f1f3f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#495057'
                }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d', margin: '0 0 4px 0' }}>Toplam Teklif Talebi</h4>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#111' }}>{stats.totalLeads} Adet</span>
                </div>
              </div>

              <div className="glass-panel" style={{
                background: '#fff',
                border: '1px solid #e9ecef',
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
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706'
                }}>
                  <Activity size={22} className="animate-pulse" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d', margin: '0 0 4px 0' }}>Bekleyen Talepler</h4>
                  <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#d97706' }}>{stats.pendingLeads} Adet</span>
                </div>
              </div>

              <div className="glass-panel" style={{
                background: '#fff',
                border: '1px solid #e9ecef',
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
                  background: '#e6f7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d', margin: '0 0 4px 0' }}>Cevaplanan Talepler</h4>
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
                background: '#fff',
                border: '1px solid #e9ecef',
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
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 2px 0' }}>Kiosk Teşhir Modu</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: 0 }}>Bu cihazı veya mağazadaki bir tableti dijital kiosk ekranına dönüştürün.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.open('/?kiosk=true', '_blank')}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
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
                background: '#fff',
                border: '1px solid #e9ecef',
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
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 2px 0' }}>Bölgesel Arama Analizleri</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: 0 }}>{dealerInfo?.city} şehrindeki tüketicilerin en çok aradığı modelleri analiz edin.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePortalTab('analytics')}
                  style={{
                    width: '100%',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: 'none',
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
              background: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0' }}>Bana Yönlendirilen Müşteri Teklifleri</h3>
                  <p style={{ fontSize: '0.78rem', color: '#6c757d', margin: 0 }}>Ziyaretçilerin size en yakın konumda olmanız sebebiyle gönderdiği palet/metraj bazlı seramik talepleri.</p>
                </div>
                <button 
                  onClick={loadDealerLeads} 
                  disabled={leadsLoading} 
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
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
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                  <span>Talepler yükleniyor...</span>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e9ecef', textAlign: 'left', color: '#495057', fontWeight: '700' }}>
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
                        <tr key={lead.id} style={{ borderBottom: '1px solid #e9ecef', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px' }}>
                            <strong style={{ display: 'block', color: '#111' }}>{lead.clientName}</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#495057', marginTop: '2px' }}>
                              <Phone size={10} /> {lead.clientPhone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6c757d', marginTop: '2px' }}>
                              <Mail size={10} /> {lead.clientEmail}
                            </div>
                            
                            {/* Badges for requested services */}
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {lead.requestedUsta && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', background: '#fff7ed', color: '#ea580c', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid #ffedd5' }}>
                                  🛠️ Usta Talebi
                                </span>
                              )}
                              {lead.requestedArchitect && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid #dbeafe' }}>
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
                                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e9ecef' }} 
                                />
                              )}
                              <div>
                                <strong style={{ color: '#111' }}>{lead.product?.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#888' }}>SKU: {lead.product?.code}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px', maxWidth: '240px', color: '#495057', lineHeight: '1.4' }}>
                            {lead.notes || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Not bırakılmadı</span>}
                            
                            {lead.projectDimensions && (
                              <div style={{ marginTop: '6px', fontSize: '0.75rem', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#334155' }}>
                                <strong>Ölçüler:</strong> {lead.projectDimensions}
                              </div>
                            )}
                            
                            {lead.projectPhotoUrl && (
                              <div style={{ marginTop: '6px' }}>
                                <a 
                                  href={lead.projectPhotoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}
                                >
                                  🖼️ Fotoğraf / Kroki Gör ↗
                                </a>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: '#6c757d', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            {lead.status === 'PENDING' && (
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #fef3c7' }}>
                                Bekliyor
                              </span>
                            )}
                            {lead.status === 'RESPONDED' && (
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #d1fae5' }}>
                                Teklif Verildi
                              </span>
                            )}
                            {lead.status === 'COMPLETED' && (
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #dbeafe' }}>
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
                                  border: '1px solid #ced4da',
                                  background: '#fff',
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
                                  color: '#dc3545',
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
                          <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#888' }}>
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
          .dealer-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
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
            padding: 10px 8px !important;
          }
          .login-card {
            padding: 20px 14px !important;
          }
        }

        /* ===== PORTAL SETTINGS CUSTOM STYLES ===== */
        .settings-container {
          max-width: 850px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .settings-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }
        .settings-section {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
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

        .portal-input {
          transition: all 0.2s ease-in-out !important;
          background-color: #f8fafc !important;
        }
        .portal-input:focus {
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.12) !important;
          background-color: #ffffff !important;
        }
        .hover-gold-btn {
          transition: all 0.2s ease-in-out !important;
        }
        .hover-gold-btn:hover {
          background-color: var(--accent-gold) !important;
          color: #ffffff !important;
          border-color: var(--accent-gold) !important;
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

        /* Mobile overrides */
        @media (max-width: 768px) {
          .settings-card {
            padding: 20px !important;
            border-radius: 16px !important;
          }
          .settings-section {
            padding: 16px !important;
            gap: 16px !important;
          }
          .settings-grid-2,
          .settings-grid-address {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
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
                * Açıklama alanına bayinizin adını (<strong>{dealerInfo?.name}</strong>) yazmayı unutmayın.
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

              <div style={{ display: 'flex', gap: '12px' }}>
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
    </div>
  );
}
