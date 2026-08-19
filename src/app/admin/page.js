'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Settings, 
  Play, 
  Loader2, 
  ArrowLeft, 
  Lock, 
  User, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  MapPin,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  Building2,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutGrid,
  Package,
  Users,
  Megaphone,
  Globe,
  Wrench,
  Star,
  Mail,
  MessageSquare,
  RefreshCw,
  Truck,
  Key,
  Pencil,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import SecurityBackupTab from '@/components/admin/SecurityBackupTab';

export default function AdminPage() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab: 'scraper', 'dealers', 'leads', 'saas', 'projects'
  const [activeTab, setActiveTab] = useState('scraper');

  // Sidebar & Mobile State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ data: true, sales: true, finance: true, settings: true });

  const toggleGroup = useCallback((group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const handleTabSelect = useCallback((tab) => {
    setActiveTab(tab);
    if (isMobile) setSidebarOpen(false);
    if (tab === 'campaigns') { loadCampaigns(); loadAdminPodiumBids(); }
    if (tab === 'installers') loadAdminInstallers();
    if (tab === 'contact_messages') loadContactMessages();
    if (tab === 'sample_orders') loadSampleOrders();
  }, [isMobile]);

  const tabLabels = {
    scraper: 'Ürün Kazıma',
    products: 'Ürün Yönetimi',
    dealers: 'Bayi Teşkilatı',
    leads: 'Teklif Talepleri',
    projects: 'Proje Talepleri',
    saas: 'SaaS Abonelikleri',
    brands: 'Marka Hesapları',
    campaigns: 'Sponsorlu Reklamlar',
    pages: 'Kurumsal Sayfalar',
    installers: 'Seramik Ustaları',
    contact_messages: 'İletişim Mesajları',
    sample_orders: 'Numune Talepleri',
    security: 'Güvenlik & Yedekleme'
  };

  const tabIcons = {
    scraper: Terminal,
    products: Package,
    dealers: MapPin,
    leads: FileText,
    projects: Building2,
    saas: CreditCard,
    brands: Building2,
    campaigns: Sparkles,
    pages: Globe,
    installers: Wrench,
    contact_messages: Mail,
    sample_orders: Truck,
    security: ShieldCheck
  };

  // Database list states
  const [brands, setBrands] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [sampleOrders, setSampleOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saasConfigs, setSaasConfigs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  // Podium Auction Admin State
  const [adminPodiumBids, setAdminPodiumBids] = useState([]);
  const [adminPodiumLoading, setAdminPodiumLoading] = useState(false);

  // Scraper Sub-tab: 'crawler', 'excel', 'zip'
  const [scraperSubTab, setScraperSubTab] = useState('crawler');

  // Scraper Form State
  const [selectedBrand, setSelectedBrand] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [categoryStyle, setCategoryStyle] = useState('Mermer');
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Excel Form State
  const [excelTsv, setExcelTsv] = useState('');
  const [excelBrandId, setExcelBrandId] = useState('');
  const [excelStyle, setExcelStyle] = useState('Mermer');
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState('');
  const [excelError, setExcelError] = useState('');
  const [excelLogs, setExcelLogs] = useState([]);

  // ZIP Form State
  const [zipFile, setZipFile] = useState(null);
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState('');
  const [zipError, setZipError] = useState('');
  const [zipLogs, setZipLogs] = useState([]);

  // PDF Form State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBrandId, setPdfBrandId] = useState('');
  const [pdfStyle, setPdfStyle] = useState('Mermer');
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [pdfLogs, setPdfLogs] = useState([]);

  // Dealer Form State
  const [newDealerName, setNewDealerName] = useState('');
  const [newDealerBrandId, setNewDealerBrandId] = useState('');
  const [newDealerPhone, setNewDealerPhone] = useState('');
  const [newDealerEmail, setNewDealerEmail] = useState('');
  const [newDealerPassword, setNewDealerPassword] = useState('');
  const [newDealerAddress, setNewDealerAddress] = useState('');
  const [newDealerCity, setNewDealerCity] = useState('İstanbul');
  const [newDealerDistrict, setNewDealerDistrict] = useState('');
  const [newDealerLat, setNewDealerLat] = useState('40.9901');
  const [newDealerLng, setNewDealerLng] = useState('29.0278');
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [dealerSuccess, setDealerSuccess] = useState('');
  const [dealerError, setDealerError] = useState('');
  const [dealerSubTab, setDealerSubTab] = useState('active'); // active, pending

  // Dealer Credentials Editing State (Modal/Panel)
  const [editingDealerModalOpen, setEditingDealerModalOpen] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState('');
  const [editingDealerName, setEditingDealerName] = useState('');
  const [editingDealerEmail, setEditingDealerEmail] = useState('');
  const [editingDealerPhone, setEditingDealerPhone] = useState('');
  const [editingDealerPassword, setEditingDealerPassword] = useState('');
  const [editingDealerCity, setEditingDealerCity] = useState('');
  const [editingDealerDistrict, setEditingDealerDistrict] = useState('');
  const [editingDealerAddress, setEditingDealerAddress] = useState('');
  const [isSavingDealerEdit, setIsSavingDealerEdit] = useState(false);
  const [dealerEditSuccess, setDealerEditSuccess] = useState('');
  const [dealerEditError, setDealerEditError] = useState('');
  const [visibleDealerPassword, setVisibleDealerPassword] = useState(false);

  // SaaS Form State
  const [saasBrandId, setSaasBrandId] = useState('');
  const [saasPlan, setSaasPlan] = useState('PRO');
  const [saasStatus, setSaasStatus] = useState('ACTIVE');
  const [saasExpiresAt, setSaasExpiresAt] = useState('2027-12-31');
  const [isUpdatingSaas, setIsUpdatingSaas] = useState(false);
  const [saasSuccess, setSaasSuccess] = useState('');
  const [saasError, setSaasError] = useState('');

  // Dealer SaaS Form State
  const [saasSubTab, setSaasSubTab] = useState('brand'); // 'brand' or 'dealer'
  const [dealerSaasConfigs, setDealerSaasConfigs] = useState([]);
  const [saasDealerId, setSaasDealerId] = useState('');
  const [saasDealerPlan, setSaasDealerPlan] = useState('STANDART');
  const [saasDealerStatus, setSaasDealerStatus] = useState('ACTIVE');
  const [saasDealerExpiresAt, setSaasDealerExpiresAt] = useState('2027-12-31');
  const [isUpdatingDealerSaas, setIsUpdatingDealerSaas] = useState(false);
  const [dealerSaasSuccess, setDealerSaasSuccess] = useState('');
  const [dealerSaasError, setDealerSaasError] = useState('');

  // Bank Account & AI Settings State
  const [bankName, setBankName] = useState('');
  const [bankRecipient, setBankRecipient] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [grokApiKey, setGrokApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [scrapingApiKey, setScrapingApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState('deepseek');
  const [bankSettingsLoading, setBankSettingsLoading] = useState(false);
  const [bankSettingsSuccess, setBankSettingsSuccess] = useState('');
  const [bankSettingsError, setBankSettingsError] = useState('');

  // Corporate Pages Settings State
  const [pageAboutHeroTitle, setPageAboutHeroTitle] = useState('');
  const [pageAboutHeroSubtitle, setPageAboutHeroSubtitle] = useState('');
  const [pageAboutVision, setPageAboutVision] = useState('');
  const [pageAboutMission, setPageAboutMission] = useState('');
  const [pageAboutStats, setPageAboutStats] = useState([]);
  
  const [pageContactAddress, setPageContactAddress] = useState('');
  const [pageContactEmail, setPageContactEmail] = useState('');
  const [pageContactPhone, setPageContactPhone] = useState('');
  const [pageContactWhatsapp, setPageContactWhatsapp] = useState('');
  
  const [pageFaqList, setPageFaqList] = useState([]);
  const [pageIlhamList, setPageIlhamList] = useState([]);
  const [pageBlogList, setPageBlogList] = useState([]);
  
  const [pageYasalKvkk, setPageYasalKvkk] = useState('');
  const [pageYasalKullanim, setPageYasalKullanim] = useState('');
  const [pageYasalCerez, setPageYasalCerez] = useState('');
  const [pageYasalBayiSozlesme, setPageYasalBayiSozlesme] = useState('');

  const [pageManagerSubTab, setPageManagerSubTab] = useState('about'); // 'about', 'contact', 'blog', 'legal'
  
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  
  const [newIlhamTitle, setNewIlhamTitle] = useState('');
  const [newIlhamDesc, setNewIlhamDesc] = useState('');
  const [newIlhamStyle, setNewIlhamStyle] = useState('Ahşap');
  const [newIlhamTag, setNewIlhamTag] = useState('Minimalist');
  const [newIlhamImg, setNewIlhamImg] = useState('');
  const [uploadingIlhamImg, setUploadingIlhamImg] = useState(false);

  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogSummary, setNewBlogSummary] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Genel');
  const [newBlogReadTime, setNewBlogReadTime] = useState('3 dk okuma');
  const [newBlogContent, setNewBlogContent] = useState('');

  const [pageSettingsLoading, setPageSettingsLoading] = useState(false);
  const [pageSettingsSuccess, setPageSettingsSuccess] = useState('');
  const [pageSettingsError, setPageSettingsError] = useState('');

  // Product Management State
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminProductsTotal, setAdminProductsTotal] = useState(0);
  const [adminProductsPage, setAdminProductsPage] = useState(1);
  const [adminProductsTotalPages, setAdminProductsTotalPages] = useState(1);
  const [adminProductsSearch, setAdminProductsSearch] = useState('');
  const [adminProductsFilterBrand, setAdminProductsFilterBrand] = useState('');
  const [adminProductsFilterStyle, setAdminProductsFilterStyle] = useState('');
  const [adminProductsFilterFinish, setAdminProductsFilterFinish] = useState('');
  const [isLoadingAdminProducts, setIsLoadingAdminProducts] = useState(false);
  
  // Product Form State (Add/Edit Mode)
  const [productFormMode, setProductFormMode] = useState('add'); // 'add' or 'edit'
  const [editingProductId, setEditingProductId] = useState(null);
  const [manualName, setManualName] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualBrandId, setManualBrandId] = useState('');
  const [manualWidth, setManualWidth] = useState('60');
  const [manualHeight, setManualHeight] = useState('120');
  const [manualColor, setManualColor] = useState('Gri');
  const [manualFinish, setManualFinish] = useState('Mat');
  const [manualStyle, setManualStyle] = useState('Mermer');
  const [manualArea, setManualArea] = useState('Yer,Duvar,Banyo,Mutfak');
  const [manualIsPremium, setManualIsPremium] = useState(false);
  const [manualImageFile, setManualImageFile] = useState(null);
  const [manualTextureFile, setManualTextureFile] = useState(null);
  const [manualImageBase64, setManualImageBase64] = useState('');
  const [manualTextureBase64, setManualTextureBase64] = useState('');
  const [manualImageExt, setManualImageExt] = useState('jpg');
  const [manualTextureExt, setManualTextureExt] = useState('jpg');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSuccess, setProductSuccess] = useState('');
  const [productError, setProductError] = useState('');
  const [productSubTab, setProductSubTab] = useState('list'); // 'list' or 'form'

  // Feed Import State
  const [feedUrl, setFeedUrl] = useState('');
  const [feedBrandId, setFeedBrandId] = useState('');
  const [feedStyle, setFeedStyle] = useState('Mermer');
  const [isImportingFeed, setIsImportingFeed] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState('');
  const [feedError, setFeedError] = useState('');
  const [feedLogs, setFeedLogs] = useState([]);

  // Marketplace Manual Override States
  const [manualTrendyolPrice, setManualTrendyolPrice] = useState('');
  const [manualTrendyolUrl, setManualTrendyolUrl] = useState('');
  const [manualHepsiburadaPrice, setManualHepsiburadaPrice] = useState('');
  const [manualHepsiburadaUrl, setManualHepsiburadaUrl] = useState('');
  const [manualN11Price, setManualN11Price] = useState('');
  const [manualN11Url, setManualN11Url] = useState('');
  const [manualKoctasPrice, setManualKoctasPrice] = useState('');
  const [manualKoctasUrl, setManualKoctasUrl] = useState('');
  const [manualBauhausPrice, setManualBauhausPrice] = useState('');
  const [manualBauhausUrl, setManualBauhausUrl] = useState('');
  const [manualYerevdekorPrice, setManualYerevdekorPrice] = useState('');
  const [manualYerevdekorUrl, setManualYerevdekorUrl] = useState('');

  // Price Crawler Bot State
  const [isCrawlingPrices, setIsCrawlingPrices] = useState(false);
  const [crawlSuccess, setCrawlSuccess] = useState('');
  const [crawlError, setCrawlError] = useState('');
  const [crawlLogs, setCrawlLogs] = useState([]);

  // Brand Credentials Management State
  const [adminBrands, setAdminBrands] = useState([]);
  const [editingBrandId, setEditingBrandId] = useState('');
  const [editingUsername, setEditingUsername] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const [brandActionSuccess, setBrandActionSuccess] = useState('');
  const [brandActionError, setBrandActionError] = useState('');
  const [brandActionLoading, setBrandActionLoading] = useState(false);
  const [visiblePasswordId, setVisiblePasswordId] = useState('');

  const loadAdminBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      if (res.ok) {
        const data = await res.json();
        setAdminBrands(data);
      }
    } catch (err) {
      console.error('Failed to load admin brands:', err);
    }
  };

  const handleSaveBrandCredentials = async (e) => {
    e.preventDefault();
    if (!editingBrandId || !editingUsername || !editingPassword) {
      setBrandActionError('Lütfen tüm alanları doldurun.');
      return;
    }
    setBrandActionLoading(true);
    setBrandActionSuccess('');
    setBrandActionError('');
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBrandId,
          username: editingUsername,
          password: editingPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBrandActionSuccess('Marka bilgileri başarıyla güncellendi.');
        loadAdminBrands();
        setEditingBrandId('');
        setEditingUsername('');
        setEditingPassword('');
      } else {
        setBrandActionError(data.error || 'Güncelleme yapılamadı.');
      }
    } catch (err) {
      console.error(err);
      setBrandActionError('Sunucu bağlantı hatası.');
    } finally {
      setBrandActionLoading(false);
    }
  };

  // Fetch initial datasets
  const loadBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      setBrands(data);
      if (data.length > 0) {
        setSelectedBrand(data[0].id);
        setNewDealerBrandId(data[0].id);
        setSaasBrandId(data[0].id);
        setExcelBrandId(data[0].id);
        setPdfBrandId(data[0].id);
        setManualBrandId(data[0].id);
        setFeedBrandId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  const loadDealers = async () => {
    try {
      const res = await fetch('/api/admin/dealers');
      if (res.ok) {
        const data = await res.json();
        setDealers(data);
      }
    } catch (err) {
      console.error('Failed to load dealers:', err);
    }
  };

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadContactMessages = async () => {
    try {
      const res = await fetch('/api/admin/contact-messages');
      if (res.ok) {
        const data = await res.json();
        setContactMessages(data);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    }
  };

  const handleUpdateContactMessageStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        loadContactMessages();
      }
    } catch (err) {
      console.error('Failed to update contact message status:', err);
    }
  };

  const handleDeleteContactMessage = async (id) => {
    if (!confirm('Bu iletişim mesajını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/contact-messages?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadContactMessages();
      }
    } catch (err) {
      console.error('Failed to delete contact message:', err);
    }
  };

  const loadSampleOrders = async () => {
    try {
      const res = await fetch('/api/admin/sample-orders');
      if (res.ok) {
        const data = await res.json();
        setSampleOrders(data);
      }
    } catch (err) {
      console.error('Failed to load sample orders:', err);
    }
  };

  const handleUpdateSampleOrderStatus = async (id, status, cargoCompany, trackingNumber) => {
    try {
      const res = await fetch('/api/admin/sample-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, cargoCompany, trackingNumber })
      });
      if (res.ok) {
        loadSampleOrders();
      }
    } catch (err) {
      console.error('Failed to update sample order status:', err);
    }
  };

  const handleDeleteSampleOrder = async (id) => {
    if (!confirm('Bu numune talebini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/sample-orders?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadSampleOrders();
      }
    } catch (err) {
      console.error('Failed to delete sample order:', err);
    }
  };

  const handleUpdateProjectStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        loadProjects();
      } else {
        alert('Proje durumu güncellenirken hata oluştu.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Bu proje talebini tamamen silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadProjects();
      } else {
        alert('Proje silinirken hata oluştu.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSaasConfigs = async () => {
    try {
      const res = await fetch('/api/admin/saas');
      if (res.ok) {
        const data = await res.json();
        setSaasConfigs(data);
      }
    } catch (err) {
      console.error('Failed to load SaaS configs:', err);
    }
  };

  const loadDealerSaasConfigs = async () => {
    try {
      const res = await fetch('/api/admin/dealer-saas');
      if (res.ok) {
        const data = await res.json();
        setDealerSaasConfigs(data);
        if (data.length > 0 && !saasDealerId) {
          setSaasDealerId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load dealer SaaS configs:', err);
    }
  };

  const loadBankSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (response.ok) {
        setBankName(data.bank_name || '');
        setBankRecipient(data.bank_recipient || '');
        setBankIban(data.bank_iban || '');
        setDeepseekApiKey(data.deepseek_api_key || '');
        setGrokApiKey(data.grok_api_key || '');
        setGeminiApiKey(data.gemini_api_key || '');
        setScrapingApiKey(data.scraping_api_key || '');
        setAiProvider(data.ai_provider || 'deepseek');

        // Populate corporate page settings if they exist
        if (data.page_about_content) {
          setPageAboutHeroTitle(data.page_about_content.hero_title || '');
          setPageAboutHeroSubtitle(data.page_about_content.hero_subtitle || '');
          setPageAboutVision(data.page_about_content.vision || '');
          setPageAboutMission(data.page_about_content.mission || '');
          setPageAboutStats(data.page_about_content.stats || []);
        } else {
          setPageAboutHeroTitle('Seramik Seçimini Yeniden Tanımlıyoruz');
          setPageAboutHeroSubtitle('SeramikBak; üreticileri, bayileri ve tasarım severleri yapay zeka, Web 3D ve artırılmış gerçeklik teknolojileriyle bir araya getiren bağımsız, lüks bir dijital pazaryeri ve showroom ekosistemidir.');
          setPageAboutVision('Geleneksel ve zahmetli olan seramik alışverişi sürecini, fiziksel mağazalarda kaybolmadan, tamamen dijital, şeffaf ve kusursuz bir deneyime dönüştürmek. Üç boyutlu modelleme ve yapay zeka ile müşterilerin yaşam alanlarında seramikleri canlı olarak deneyimlemesini sağlayarak sektörün dijital lideri olmak.');
          setPageAboutMission('Tüm yerel ve küresel markaların kataloglarını zengin detaylarla tek bir arama motorunda birleştirmek; bayilerin potansiyel müşterilere zahmetsizce ulaşabileceği B2B SaaS araçları sunmak ve tüketicilerin hayallerindeki mimari tasarımları hızlı fiyat teklifleriyle gerçeğe dönüştürmelerini sağlamak.');
          setPageAboutStats([
            { num: '17', label: 'Karşılaştırılan Lider Marka & Üretici' },
            { num: '10,000+', label: 'Aktif Seramik & Karo Ürünü' },
            { num: '500+', label: 'Türkiye Genelinde Yetkili Bayi' },
            { num: '2.5 Saniye', label: 'AI Destekli Arama ve Öneri Hızı' }
          ]);
        }

        if (data.page_contact_content) {
          setPageContactAddress(data.page_contact_content.address || '');
          setPageContactEmail(data.page_contact_content.email || '');
          setPageContactPhone(data.page_contact_content.phone || '');
          setPageContactWhatsapp(data.page_contact_content.whatsapp || '');
        } else {
          setPageContactAddress('Kozyatağı Mahallesi, Bayar Caddesi, Plaza 34, Kat: 8, No: 12, Kadıköy / İstanbul, Türkiye');
          setPageContactEmail('destek@seramikbak.com');
          setPageContactPhone('0850 123 45 67');
          setPageContactWhatsapp('+90 850 123 45 67');
        }

        if (data.page_faq_list) {
          setPageFaqList(data.page_faq_list);
        } else {
          setPageFaqList([
            { q: "SeramikBak üzerinden doğrudan ürün siparişi verebiliyor muyum?", a: "SeramikBak, doğrudan satış yapan bir e-ticaret sitesi değildir; bağımsız bir dijital showroom ve arama motorudur. Beğendiğiniz ürünlerin detay sayfasından 'En Yakın Bayiyi Bul' butonuna basarak bölgenizdeki yetkili satıcılardan (bayilerden) anında teklif isteyebilir veya iletişime geçerek satın alma işlemlerinizi yapabilirsiniz." },
            { q: "Nasıl numune (örnek ürün) talep edebilirim?", a: "Ürünlerin detay sayfasında bulunan 'Bayiden Bilgi Al' formu üzerinden bayilere numune talebinizi iletebilirsiniz. Bayiler stok durumuna göre adresinize kargo ile numune karo gönderebilir veya sizi showrooma davet edebilir." },
            { q: "Yetkili bayi olarak platforma nasıl kaydolabilirim?", a: "Sitemizin üst barında yer alan veya sayfa altındaki 'Bayi Portalı' linkine tıklayarak 'Yeni Bayi Başvurusu' yapabilirsiniz. Bilgileriniz onaylandıktan sonra paneliniz aktifleşecek ve bölgenizden gelen satın alma taleplerini almaya başlayabileceksiniz." },
            { q: "3D Sanal Stüdyo'da kendi odamın fotoğrafını kullanabilir miyim?", a: "Evet! 3D Sanal Stüdyo alanında yer alan 'Kendi Odamı Tasarla' (Görsel Yükle) özelliğini kullanarak banyo, mutfak veya salonunuzun fotoğrafını yükleyebilirsiniz. Akıllı yapay zeka algoritması zemin veya duvar alanlarını saniyeler içinde analiz eder ve seçtiğiniz karoları odanıza döşer." },
            { q: "Farklı markaların ürün fiyatları neden değişiklik göstermektedir?", a: "Fiyatlar markaların üretim teknolojileri, malzeme kalitesi (porselen, seramik, rektifiyeli olması), boyutları ve bayilerin bölgesel nakliye/lojistik maliyetlerine göre değişiklik göstermektedir. Platformumuzdaki en ucuz bayi tekliflerini karşılaştırarak bütçenize en uygun satıcıyı seçebilirsiniz." }
          ]);
        }

        if (data.page_ilham_list) {
          setPageIlhamList(data.page_ilham_list);
        } else {
          setPageIlhamList([
            { title: 'İskandinav Ahşap Zarafeti', desc: 'Banyo ve mutfaklarda sıcacık, doğal bir doku.', style: 'Ahşap', tag: 'Minimalist', img: '/hero/scandinavian_kitchen.png' },
            { title: 'Lüks Calacatta Mermer', desc: 'Geniş banyolarda kesintisiz ve camsı parlak yansımalar.', style: 'Mermer', tag: 'Premium Luxury', img: '/hero/luxury_bathroom.png' },
            { title: 'Endüstriyel Beton & Loft', desc: 'Salon ve koridorlarda modern brütist gri tonlar.', style: 'Beton', tag: 'Modern', img: '/hero/modern_living.png' }
          ]);
        }

        if (data.page_blog_list) {
          setPageBlogList(data.page_blog_list);
        } else {
          setPageBlogList([
            { id: 1, title: 'Rektifiyeli Seramik Nedir? Derz Aralıkları Nasıl Olmalıdır?', summary: 'Seramiklerin kenarlarının lazerle kesilerek dikleştirilmesi işlemine rektifiye denir. Peki montajda nelere dikkat edilmeli?', category: 'Teknik Rehber', readTime: '4 dk okuma', content: '<h3>Rektifiyeli Seramik Nedir?</h3><p>Rektifiyeli seramik veya porselen karolar, pişirilme aşamasından sonra kenarlarının özel elmas bıçaklarla traşlanarak tam 90 derecelik dik açılara getirilmesi işlemidir...</p>' },
            { id: 2, title: 'Mat mı, Parlak (Cilalı) Porselen mi? Doğru Seçim Nasıl Yapılır?', summary: 'Zemin ve duvar karolarında mat ve parlak yüzeylerin kaymazlık, leke tutma ve ışık yansıtma karşılaştırması.', category: 'Tasarım İpuçları', readTime: '5 dk okuma', content: '<h3>Mat ve Parlak Karoların Karşılaştırması</h3><p>Seramik seçiminde en çok kararsız kalınan noktalardan biri yüzey bitişidir...</p>' },
            { id: 3, title: '2026 Banyo Tasarım Trendleri: Doğallığa Dönüş ve Toprak Tonları', summary: 'Bu yıl banyolarda mermer soğukluğundan ziyade sıcak traverten tonları, ham meşe ahşap dokuları ve yeşil bitkiler hakim.', category: 'Trendler', readTime: '3 dk okuma', content: '<h3>2026 Banyo Tasarımlarında Öne Çıkanlar</h3><p>Banyolar artık sadece temizlenilen alanlar değil; evlerin kişisel spa merkezleri ve dinlenme köşeleri haline geldi...</p>' }
          ]);
        }

        if (data.page_yasal_content) {
          setPageYasalKvkk(data.page_yasal_content.kvkk || '');
          setPageYasalKullanim(data.page_yasal_content.kullanim || '');
          setPageYasalCerez(data.page_yasal_content.cerez || '');
          setPageYasalBayiSozlesme(data.page_yasal_content['bayi-sozlesme'] || '');
        } else {
          setPageYasalKvkk('<p>SeramikBak Teknoloji A.Ş. olarak kişisel verilerinizin korunmasına önem veriyoruz...</p>');
          setPageYasalKullanim('<p>SeramikBak internet sitesini kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız...</p>');
          setPageYasalCerez('<p>Sitemizde kullanıcı deneyimini artırmak amacıyla çerezler kullanılmaktadır...</p>');
          setPageYasalBayiSozlesme('<p>SeramikBak Yetkili Bayi Üyelik Sözleşmesi...</p>');
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadAdminProducts = async (pageVal = adminProductsPage, searchVal = adminProductsSearch, brandVal = adminProductsFilterBrand, styleVal = adminProductsFilterStyle, finishVal = adminProductsFilterFinish) => {
    setIsLoadingAdminProducts(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageVal,
        limit: 10,
        search: searchVal,
        brandId: brandVal,
        style: styleVal,
        finish: finishVal
      });
      const res = await fetch(`/api/admin/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminProducts(data.products || []);
          setAdminProductsTotal(data.total || 0);
          setAdminProductsPage(data.page || 1);
          setAdminProductsTotalPages(data.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setIsLoadingAdminProducts(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Seçili seramik ürününü veritabanından tamamen silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadAdminProducts();
        loadBrands();
      } else {
        alert('Ürün silinemedi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Silme işlemi sırasında hata oluştu.');
    }
  };

  const handleEditProductClick = (product) => {
    setProductFormMode('edit');
    setEditingProductId(product.id);
    setManualName(product.name);
    setManualCode(product.code);
    setManualBrandId(product.brandId);
    setManualWidth(String(product.width));
    setManualHeight(String(product.height));
    setManualColor(product.color);
    setManualFinish(product.finish);
    setManualStyle(product.style);
    setManualArea(product.area);
    setManualIsPremium(product.isPremium);
    
    // Set marketplace overrides
    setManualTrendyolPrice(product.trendyolPrice ? String(product.trendyolPrice) : '');
    setManualTrendyolUrl(product.trendyolUrl || '');
    setManualHepsiburadaPrice(product.hepsiburadaPrice ? String(product.hepsiburadaPrice) : '');
    setManualHepsiburadaUrl(product.hepsiburadaUrl || '');
    setManualN11Price(product.n11Price ? String(product.n11Price) : '');
    setManualN11Url(product.n11Url || '');
    setManualKoctasPrice(product.koctasPrice ? String(product.koctasPrice) : '');
    setManualKoctasUrl(product.koctasUrl || '');
    setManualBauhausPrice(product.bauhausPrice ? String(product.bauhausPrice) : '');
    setManualBauhausUrl(product.bauhausUrl || '');
    setManualYerevdekorPrice(product.yerevdekorPrice ? String(product.yerevdekorPrice) : '');
    setManualYerevdekorUrl(product.yerevdekorUrl || '');

    setManualImageFile(null);
    setManualTextureFile(null);
    setManualImageBase64('');
    setManualTextureBase64('');
    setProductSuccess('');
    setProductError('');
    setProductSubTab('form');
  };

  const handleNewProductClick = () => {
    setProductFormMode('add');
    setEditingProductId(null);
    setManualName('');
    setManualCode('');
    if (brands.length > 0) {
      setManualBrandId(brands[0].id);
    }
    setManualWidth('60');
    setManualHeight('120');
    setManualColor('Gri');
    setManualFinish('Mat');
    setManualStyle('Mermer');
    setManualArea('Yer,Duvar,Banyo,Mutfak');
    setManualIsPremium(false);
    
    // Reset marketplace overrides
    setManualTrendyolPrice('');
    setManualTrendyolUrl('');
    setManualHepsiburadaPrice('');
    setManualHepsiburadaUrl('');
    setManualN11Price('');
    setManualN11Url('');
    setManualKoctasPrice('');
    setManualKoctasUrl('');
    setManualBauhausPrice('');
    setManualBauhausUrl('');
    setManualYerevdekorPrice('');
    setManualYerevdekorUrl('');

    setManualImageFile(null);
    setManualTextureFile(null);
    setManualImageBase64('');
    setManualTextureBase64('');
    setProductSuccess('');
    setProductError('');
    setProductSubTab('form');
  };

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop() || 'jpg';
    if (target === 'image') {
      setManualImageFile(file);
      setManualImageExt(ext);
    } else {
      setManualTextureFile(file);
      setManualTextureExt(ext);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (target === 'image') {
        setManualImageBase64(reader.result);
      } else {
        setManualTextureBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!manualName || !manualCode || !manualBrandId || !manualWidth || !manualHeight) {
      setProductError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setIsSavingProduct(true);
    setProductSuccess('');
    setProductError('');

    try {
      const payload = {
        name: manualName,
        code: manualCode,
        brandId: manualBrandId,
        width: parseFloat(manualWidth.replace(',', '.')),
        height: parseFloat(manualHeight.replace(',', '.')),
        color: manualColor,
        finish: manualFinish,
        style: manualStyle,
        area: manualArea,
        isPremium: manualIsPremium,
        imageExt: manualImageExt,
        textureExt: manualTextureExt,
        trendyolPrice: manualTrendyolPrice ? parseFloat(manualTrendyolPrice) : null,
        trendyolUrl: manualTrendyolUrl || null,
        hepsiburadaPrice: manualHepsiburadaPrice ? parseFloat(manualHepsiburadaPrice) : null,
        hepsiburadaUrl: manualHepsiburadaUrl || null,
        n11Price: manualN11Price ? parseFloat(manualN11Price) : null,
        n11Url: manualN11Url || null,
        koctasPrice: manualKoctasPrice ? parseFloat(manualKoctasPrice) : null,
        koctasUrl: manualKoctasUrl || null,
        bauhausPrice: manualBauhausPrice ? parseFloat(manualBauhausPrice) : null,
        bauhausUrl: manualBauhausUrl || null,
        yerevdekorPrice: manualYerevdekorPrice ? parseFloat(manualYerevdekorPrice) : null,
        yerevdekorUrl: manualYerevdekorUrl || null
      };

      if (manualImageBase64) {
        payload.imageBase64 = manualImageBase64;
      }
      if (manualTextureBase64) {
        payload.textureBase64 = manualTextureBase64;
      }

      let url = '/api/admin/products';
      let method = 'POST';

      if (productFormMode === 'edit') {
        payload.id = editingProductId;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setProductSuccess(productFormMode === 'edit' ? 'Ürün başarıyla güncellendi.' : 'Yeni ürün başarıyla kaydedildi.');
        const imgInput = document.getElementById('manualImageInput');
        const texInput = document.getElementById('manualTextureInput');
        if (imgInput) imgInput.value = '';
        if (texInput) texInput.value = '';
        setManualImageBase64('');
        setManualTextureBase64('');
        
        setTimeout(() => {
          setProductSubTab('list');
          loadAdminProducts(1);
          loadBrands();
        }, 1500);
      } else {
        setProductError(data.error || 'Ürün kaydedilirken hata oluştu.');
      }
    } catch (err) {
      setProductError('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleCrawlPrices = async (e) => {
    e.preventDefault();
    setIsCrawlingPrices(true);
    setCrawlSuccess('');
    setCrawlError('');
    
    let offset = 0;
    const limit = 5;
    let hasMore = true;
    let totalUpdated = 0;
    let accumulatedLogs = ['[Fiyat Botu] Fiyat güncelleme botu başlatılıyor...'];
    setCrawlLogs(accumulatedLogs);

    try {
      while (hasMore) {
        const response = await fetch('/api/admin/crawl-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit, offset })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP Hata: ${response.status} - ${text.substring(0, 100)}`);
        }

        const data = await response.json();
        if (data.success) {
          totalUpdated += data.count;
          accumulatedLogs = [...accumulatedLogs, ...(data.logs || [])];
          setCrawlLogs(accumulatedLogs);
          
          if (data.count === 0 || data.remaining <= 0) {
            hasMore = false;
          } else {
            offset += limit;
            // Delay between batches to prevent rate limits
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } else {
          throw new Error(data.error || 'Fiyatlar güncellenirken bir hata oluştu.');
        }
      }

      setCrawlSuccess(`Başarılı! Toplam ${totalUpdated} adet ürünün fiyatları taranıp güncellendi.`);
      loadAdminProducts(1);
    } catch (err) {
      setCrawlError('API bağlantı hatası: ' + err.message);
    } finally {
      setIsCrawlingPrices(false);
    }
  };

  const handleImportFeed = async (e) => {
    e.preventDefault();
    if (!feedUrl || !feedBrandId) {
      setFeedError('Lütfen marka seçin ve bir Feed URL adresi girin.');
      return;
    }

    setIsImportingFeed(true);
    setFeedSuccess('');
    setFeedError('');
    setFeedLogs(['[Entegrasyon] Sunucu bağlantısı kuruluyor...']);

    try {
      const response = await fetch('/api/admin/import-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: feedBrandId,
          feedUrl,
          defaultStyle: feedStyle
        })
      });

      const data = await response.json();
      if (data.success) {
        setFeedLogs(data.logs || []);
        setFeedSuccess(`Başarılı! ${data.count} adet ürün feed üzerinden başarıyla içe aktarıldı veya güncellendi.`);
        setFeedUrl('');
        loadAdminProducts(1);
      } else {
        setFeedError(data.error || 'Feed entegrasyonu sırasında bir hata oluştu.');
        if (data.logs) {
          setFeedLogs(data.logs);
        }
      }
    } catch (err) {
      setFeedError('API bağlantı hatası: ' + err.message);
    } finally {
      setIsImportingFeed(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadBrands();
      loadDealers();
      loadLeads();
      loadProjects();
      loadSaasConfigs();
      loadDealerSaasConfigs();
      loadAdminProducts(1);
      loadBankSettings();
      loadAdminBrands();
      loadCampaigns();
      loadAdminInstallers();
      loadContactMessages();
      loadSampleOrders();
    }
  }, [isLoggedIn]);

  // Installers Management State
  const [adminInstallers, setAdminInstallers] = useState([]);
  const [adminInstallersLoading, setAdminInstallersLoading] = useState(false);
  const [adminInstallerFilter, setAdminInstallerFilter] = useState('ALL'); // ALL, PENDING, VERIFIED
  const [adminInstallerSearch, setAdminInstallerSearch] = useState('');
  const [installerStats, setInstallerStats] = useState({ total: 0, pending: 0, verified: 0 });

  // Edit Installer Modal State
  const [editingInstaller, setEditingInstaller] = useState(null);
  const [editInstName, setEditInstName] = useState('');
  const [editInstCompany, setEditInstCompany] = useState('');
  const [editInstPhone, setEditInstPhone] = useState('');
  const [editInstCity, setEditInstCity] = useState('');
  const [editInstDistrict, setEditInstDistrict] = useState('');
  const [editInstExp, setEditInstExp] = useState(10);
  const [editInstSpecialties, setEditInstSpecialties] = useState('');
  const [editInstRating, setEditInstRating] = useState(5.0);
  const [editInstVerified, setEditInstVerified] = useState(true);
  const [editInstNotes, setEditInstNotes] = useState('');
  const [editInstLoading, setEditInstLoading] = useState(false);

  const loadAdminInstallers = async () => {
    setAdminInstallersLoading(true);
    try {
      let url = `/api/admin/installers?filter=${adminInstallerFilter}`;
      if (adminInstallerSearch) url += `&search=${encodeURIComponent(adminInstallerSearch)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminInstallers(data.installers || []);
          setInstallerStats(data.stats || { total: 0, pending: 0, verified: 0 });
        }
      }
    } catch (err) {
      console.error('Failed to load admin installers:', err);
    } finally {
      setAdminInstallersLoading(false);
    }
  };

  const handleToggleInstallerVerify = async (installerId, currentVerified) => {
    try {
      const res = await fetch('/api/admin/installers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: installerId,
          verified: !currentVerified
        })
      });
      const data = await res.json();
      if (data.success) {
        loadAdminInstallers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInstaller = async (installerId) => {
    if (!confirm('Bu usta kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/installers?id=${installerId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadAdminInstallers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditInstallerModal = (inst) => {
    setEditingInstaller(inst);
    setEditInstName(inst.name || '');
    setEditInstCompany(inst.companyName || '');
    setEditInstPhone(inst.phone || '');
    setEditInstCity(inst.city || '');
    setEditInstDistrict(inst.district || '');
    setEditInstExp(inst.experienceYears || 10);
    setEditInstSpecialties(inst.specialties || '');
    setEditInstRating(inst.rating || 5.0);
    setEditInstVerified(inst.verified !== undefined ? inst.verified : true);
    setEditInstNotes(inst.notes || '');
  };

  const handleSaveInstallerEdit = async (e) => {
    e.preventDefault();
    if (!editingInstaller) return;
    setEditInstLoading(true);
    try {
      const res = await fetch('/api/admin/installers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingInstaller.id,
          name: editInstName,
          companyName: editInstCompany,
          phone: editInstPhone,
          city: editInstCity,
          district: editInstDistrict,
          experienceYears: editInstExp,
          specialties: editInstSpecialties,
          rating: editInstRating,
          verified: editInstVerified,
          notes: editInstNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingInstaller(null);
        loadAdminInstallers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditInstLoading(false);
    }
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'products') {
      loadAdminProducts(1);
    }
  }, [adminProductsFilterBrand, adminProductsFilterStyle, adminProductsFilterFinish]);

  // Login handler - calls real API to set HTTP-only session cookie
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'admin' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
      } else {
        setLoginError(data.error || 'Hatalı kullanıcı adı veya şifre.');
      }
    } catch (err) {
      setLoginError('Sunucu bağlantı hatası.');
    }
  };

  // URL Ingestion handler
  const handleIngest = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !scrapeUrl) {
      setErrorMsg('Lütfen marka seçin ve URL girin.');
      return;
    }

    setIsScraping(true);
    setLogs([]);
    setSuccessMsg('');
    setErrorMsg('');

    // Detect if this is an ngkutahyaseramik.com.tr URL (SPA site → use sitemap scraper)
    const isNgKutahya = scrapeUrl.includes('ngkutahyaseramik.com.tr');
    const apiEndpoint = isNgKutahya ? '/api/admin/scrape-sitemap' : '/api/admin/ingest';

    const localLogs = isNgKutahya
      ? [
          `[Sitemap Scraper] NG Kütahya Seramik SPA sitesi algılandı...`,
          `[Sitemap Scraper] Sitemap XML stratejisi kullanılıyor (SPA uyumlu)...`,
          `[Sitemap Scraper] Sitemap URL: ${scrapeUrl.split('/urun')[0]}/tr-product/sitemap.xml`,
          `[Sitemap Scraper] Bağlantı kuruluyor...`,
        ]
      : [
          `[Scraper] Initializing Playwright sandbox browser...`,
          `[Scraper] User-Agent set: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...`,
          `[Scraper] Navigating to target URL: ${scrapeUrl}`,
          `[Scraper] Connection established. Status: 200 OK. Waiting for networkidle...`,
          `[Scraper] Emulating human behavior (scrolling viewport, delay 1.2s)...`
        ];

    for (let i = 0; i < localLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setLogs(prev => [...prev, localLogs[i]]);
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrand,
          url: scrapeUrl,
          categoryStyle
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show server-side logs with animation
        const startIdx = isNgKutahya ? 0 : 5;
        for (let i = startIdx; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 120));
          setLogs(prev => [...prev, data.logs[i]]);
        }
        const newMsg = data.newCount !== undefined
          ? `Başarılı! ${data.newCount} yeni ürün eklendi, ${data.updatedCount} mevcut ürün atlandı. Toplam: ${data.productsCount} ürün.`
          : `Başarılı! ${data.productsCount} adet yeni ürün başarıyla veritabanına aktarıldı ve normalize edildi.`;
        setSuccessMsg(newMsg);
        setScrapeUrl('');
      } else {
        setLogs(prev => [...prev, `[Error] Ingestion failed: ${data.error}`]);
        setErrorMsg(data.error || 'Veri aktarımı sırasında hata oluştu.');
      }
    } catch (err) {
      setLogs(prev => [...prev, `[Error] Connection failed: ${err.message}`]);
      setErrorMsg('API bağlantı hatası.');
    } finally {
      setIsScraping(false);
    }
  };

  // Excel Importer handler
  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!excelBrandId || !excelTsv) {
      setExcelError('Lütfen marka seçin ve Excel verisi yapıştırın.');
      return;
    }
    setIsImportingExcel(true);
    setExcelSuccess('');
    setExcelError('');
    setExcelLogs(['[İçe Aktarım] Sunucu bağlantısı kuruluyor...']);

    try {
      const response = await fetch('/api/admin/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: excelBrandId,
          tsvData: excelTsv,
          defaultStyle: excelStyle
        })
      });

      const data = await response.json();
      if (data.success) {
        setExcelLogs(data.logs || []);
        setExcelSuccess(`Başarılı! ${data.count} adet ürün başarıyla içe aktarıldı veya güncellendi.`);
        setExcelTsv('');
      } else {
        setExcelError(data.error || 'İçe aktarım sırasında bir hata oluştu.');
        if (data.logs) {
          setExcelLogs(data.logs);
        }
      }
    } catch (err) {
      setExcelError('API bağlantı hatası: ' + err.message);
    } finally {
      setIsImportingExcel(false);
    }
  };

  // ZIP Image Uploader handler
  const handleUploadZip = async (e) => {
    e.preventDefault();
    if (!zipFile) {
      setZipError('Lütfen bir ZIP dosyası seçin.');
      return;
    }
    setIsUploadingZip(true);
    setZipSuccess('');
    setZipError('');
    setZipLogs(['[Yükleme] ZIP dosyası sunucuya gönderiliyor...']);

    try {
      const formData = new FormData();
      formData.append('file', zipFile);

      const response = await fetch('/api/admin/import-zip', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setZipLogs(data.logs || []);
        setZipSuccess(`Başarılı! ${data.matchedCount} adet ürün görseli başarıyla eşleştirildi.`);
        setZipFile(null);
        const fileInput = document.getElementById('zipFileInput');
        if (fileInput) fileInput.value = '';
      } else {
        setZipError(data.error || 'ZIP dosyası yüklenirken veya işlenirken bir hata oluştu.');
        if (data.logs) {
          setZipLogs(data.logs);
        }
      }
    } catch (err) {
      setZipError('API bağlantı hatası: ' + err.message);
    } finally {
      setIsUploadingZip(false);
    }
  };

  // PDF Catalog Importer handler
  const handleImportPdf = async (e) => {
    e.preventDefault();
    if (!pdfFile || !pdfBrandId) {
      setPdfError('Lütfen marka seçin ve bir PDF dosyası yükleyin.');
      return;
    }
    setIsImportingPdf(true);
    setPdfSuccess('');
    setPdfError('');
    setPdfLogs(['[İçe Aktarım] PDF dosyası okunuyor...']);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setPdfLogs(prev => [...prev, '[İçe Aktarım] PDF dosyası sunucuya gönderiliyor...']);

      try {
        const response = await fetch('/api/admin/import-pdf', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-ai-key': localStorage.getItem('gemini_api_key') || ''
          },
          body: JSON.stringify({
            brandId: pdfBrandId,
            pdfData: base64Data,
            defaultStyle: pdfStyle
          })
        });

        const data = await response.json();
        if (data.success) {
          setPdfLogs(data.logs || []);
          setPdfSuccess(`Başarılı! ${data.count} adet ürün başarıyla PDF katalogdan içe aktarıldı.`);
          setPdfFile(null);
          const fileInput = document.getElementById('pdfFileInput');
          if (fileInput) fileInput.value = '';
        } else {
          setPdfError(data.error || 'PDF katalog içe aktarılırken bir hata oluştu.');
          if (data.logs) {
            setPdfLogs(data.logs);
          }
        }
      } catch (err) {
        setPdfError('API bağlantı hatası: ' + err.message);
      } finally {
        setIsImportingPdf(false);
      }
    };

    reader.onerror = () => {
      setIsImportingPdf(false);
      setPdfError('Dosya okunamadı.');
    };

    reader.readAsDataURL(pdfFile);
  };

  // Add Dealer handler
  const handleAddDealer = async (e) => {
    e.preventDefault();
    setIsAddingDealer(true);
    setDealerSuccess('');
    setDealerError('');

    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDealerName,
          brandId: newDealerBrandId,
          phone: newDealerPhone,
          email: newDealerEmail,
          password: newDealerPassword,
          address: newDealerAddress,
          city: newDealerCity,
          district: newDealerDistrict,
          lat: parseFloat(newDealerLat) || 40.9901,
          lng: parseFloat(newDealerLng) || 29.0278
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setDealerSuccess('Yeni yetkili bayi başarıyla sisteme kaydedildi.');
        setNewDealerName('');
        setNewDealerPhone('');
        setNewDealerEmail('');
        setNewDealerPassword('');
        setNewDealerAddress('');
        setNewDealerDistrict('');
        loadDealers();
      } else {
        setDealerError(data.error || 'Bayi kaydedilemedi.');
      }
    } catch (err) {
      setDealerError('API bağlantı hatası.');
    } finally {
      setIsAddingDealer(false);
    }
  };

  // Open Edit Dealer Credentials Modal handler
  const handleOpenEditDealerModal = (dealer) => {
    setEditingDealerId(dealer.id);
    setEditingDealerName(dealer.name || '');
    setEditingDealerEmail(dealer.email || '');
    setEditingDealerPhone(dealer.phone || '');
    setEditingDealerPassword(''); // Blank unless admin wants to change password
    setEditingDealerCity(dealer.city || 'İstanbul');
    setEditingDealerDistrict(dealer.district || '');
    setEditingDealerAddress(dealer.address || '');
    setDealerEditSuccess('');
    setDealerEditError('');
    setVisibleDealerPassword(false);
    setEditingDealerModalOpen(true);
  };

  // Generate random dealer password
  const handleGenerateRandomDealerPassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setEditingDealerPassword(`bayi${randomNum}`);
  };

  // Save Dealer Credentials & Info handler
  const handleSaveDealerCredentials = async (e) => {
    e.preventDefault();
    if (!editingDealerId) return;
    setIsSavingDealerEdit(true);
    setDealerEditSuccess('');
    setDealerEditError('');

    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDealerId,
          name: editingDealerName,
          email: editingDealerEmail,
          phone: editingDealerPhone,
          password: editingDealerPassword,
          city: editingDealerCity,
          district: editingDealerDistrict,
          address: editingDealerAddress
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDealerEditSuccess('Bayi giriş bilgileri ve şifresi başarıyla güncellendi!');
        loadDealers();
        setTimeout(() => {
          setEditingDealerModalOpen(false);
        }, 1200);
      } else {
        setDealerEditError(data.error || 'Güncelleme yapılırken bir hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setDealerEditError('Sunucu bağlantı hatası.');
    } finally {
      setIsSavingDealerEdit(false);
    }
  };

  // Delete Dealer handler
  const handleDeleteDealer = async (id) => {
    if (!confirm('Seçili yetkili bayi kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/dealers?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadDealers();
      } else {
        alert('Bayi silinemedi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Dealer Status handler (Approve/Reject)
  const handleUpdateDealerStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadDealers();
      } else {
        alert('İşlem başarısız: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Bağlantı hatası.');
    }
  };

  // Update Lead Status handler
  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadLeads();
      } else {
        alert('Talep güncellenemedi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Lead handler
  const handleDeleteLead = async (id) => {
    if (!confirm('Bu teklif talebini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadLeads();
      } else {
        alert('Talep silinemedi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update SaaS Config handler
  const handleUpdateSaas = async (e) => {
    e.preventDefault();
    setIsUpdatingSaas(true);
    setSaasSuccess('');
    setSaasError('');

    try {
      const res = await fetch('/api/admin/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: saasBrandId,
          plan: saasPlan,
          status: saasStatus,
          expiresAt: saasExpiresAt
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSaasSuccess('Marka SaaS planı başarıyla güncellendi.');
        loadSaasConfigs();
      } else {
        setSaasError(data.error || 'Güncelleme yapılamadı.');
      }
    } catch (err) {
      setSaasError('API bağlantı hatası.');
    } finally {
      setIsUpdatingSaas(false);
    }
  };

  // Update Dealer SaaS Config handler
  const handleUpdateDealerSaas = async (e) => {
    e.preventDefault();
    setIsUpdatingDealerSaas(true);
    setDealerSaasSuccess('');
    setDealerSaasError('');

    try {
      const res = await fetch('/api/admin/dealer-saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: saasDealerId,
          plan: saasDealerPlan,
          status: saasDealerStatus,
          expiresAt: saasDealerExpiresAt
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setDealerSaasSuccess('Bayi SaaS planı başarıyla güncellendi.');
        loadDealerSaasConfigs();
      } else {
        setDealerSaasError(data.error || 'Güncelleme yapılamadı.');
      }
    } catch (err) {
      setDealerSaasError('API bağlantı hatası.');
    } finally {
      setIsUpdatingDealerSaas(false);
    }
  };

  const handleUpdateBankSettings = async (e) => {
    e.preventDefault();
    setBankSettingsLoading(true);
    setBankSettingsSuccess('');
    setBankSettingsError('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName,
          bank_recipient: bankRecipient,
          bank_iban: bankIban,
          deepseek_api_key: deepseekApiKey,
          grok_api_key: grokApiKey,
          gemini_api_key: geminiApiKey,
          scraping_api_key: scrapingApiKey,
          ai_provider: aiProvider
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setBankSettingsSuccess('Sistem ve Yapay Zeka ayarları başarıyla güncellendi.');
        loadBankSettings();
      } else {
        setBankSettingsError(result.error || 'Ayarlar kaydedilirken hata oluştu.');
      }
    } catch (err) {
      setBankSettingsError('Bağlantı hatası.');
      console.error(err);
    } finally {
      setBankSettingsLoading(false);
    }
  };

  const handleUpdatePageSettings = async (e) => {
    e.preventDefault();
    setPageSettingsLoading(true);
    setPageSettingsSuccess('');
    setPageSettingsError('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_about_content: {
            hero_title: pageAboutHeroTitle,
            hero_subtitle: pageAboutHeroSubtitle,
            vision: pageAboutVision,
            mission: pageAboutMission,
            stats: pageAboutStats
          },
          page_contact_content: {
            address: pageContactAddress,
            email: pageContactEmail,
            phone: pageContactPhone,
            whatsapp: pageContactWhatsapp
          },
          page_faq_list: pageFaqList,
          page_ilham_list: pageIlhamList,
          page_blog_list: pageBlogList,
          page_yasal_content: {
            kvkk: pageYasalKvkk,
            kullanim: pageYasalKullanim,
            cerez: pageYasalCerez,
            'bayi-sozlesme': pageYasalBayiSozlesme
          }
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPageSettingsSuccess('Kurumsal sayfa içerikleri başarıyla kaydedildi ve canlı yayına alındı!');
        loadBankSettings();
      } else {
        setPageSettingsError(result.error || 'İçerikler kaydedilirken hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setPageSettingsError('Bağlantı hatası.');
    } finally {
      setPageSettingsLoading(false);
    }
  };

  const handleAddFaq = () => {
    if (!newFaqQ || !newFaqA) return;
    setPageFaqList(prev => [...prev, { q: newFaqQ, a: newFaqA }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleDeleteFaq = (indexToDelete) => {
    setPageFaqList(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleAddBlog = () => {
    if (!newBlogTitle || !newBlogContent) return;
    const newId = pageBlogList.length > 0 ? Math.max(...pageBlogList.map(b => b.id)) + 1 : 1;
    setPageBlogList(prev => [
      ...prev,
      {
        id: newId,
        title: newBlogTitle,
        summary: newBlogSummary,
        category: newBlogCategory,
        readTime: newBlogReadTime,
        content: newBlogContent
      }
    ]);
    setNewBlogTitle('');
    setNewBlogSummary('');
    setNewBlogContent('');
  };

  const handleDeleteBlog = (idToDelete) => {
    setPageBlogList(prev => prev.filter(b => b.id !== idToDelete));
  };

  const handleAddIlham = () => {
    if (!newIlhamTitle || !newIlhamImg) {
      alert('Lütfen başlık ve görsel alanlarını doldurun.');
      return;
    }
    setPageIlhamList(prev => [
      ...prev,
      {
        title: newIlhamTitle,
        desc: newIlhamDesc,
        style: newIlhamStyle || 'Ahşap',
        tag: newIlhamTag || 'Minimalist',
        img: newIlhamImg
      }
    ]);
    setNewIlhamTitle('');
    setNewIlhamDesc('');
    setNewIlhamImg('');
  };

  const handleDeleteIlham = (indexToDelete) => {
    setPageIlhamList(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleIlhamImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIlhamImg(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const res = await fetch('/api/dealers/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          filename: file.name,
          folder: 'seramikbak/ilham'
        })
      });

      const data = await res.json();
      const uploadedUrl = data.url || data.fileUrl;
      if (res.ok && uploadedUrl) {
        setNewIlhamImg(uploadedUrl);
      } else {
        setNewIlhamImg(base64Data);
      }
    } catch (err) {
      console.error(err);
      alert('Görsel yüklenirken hata oluştu.');
    } finally {
      setUploadingIlhamImg(false);
    }
  };

  const handleUpdateStat = (idx, field, value) => {
    setPageAboutStats(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleApproveRejectBrandSaaS = async (brandId, action) => {
    try {
      const res = await fetch('/api/admin/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadSaasConfigs();
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      console.error(err);
      alert('Bağlantı hatası.');
    }
  };

  const handleApproveRejectDealerSaaS = async (dealerId, action) => {
    try {
      const res = await fetch('/api/admin/dealer-saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadDealerSaasConfigs();
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      console.error(err);
      alert('Bağlantı hatası.');
    }
  };

  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.campaigns);
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadCampaigns();
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      console.error(err);
      alert('Bağlantı hatası.');
    }
  };

  const loadAdminPodiumBids = async () => {
    setAdminPodiumLoading(true);
    try {
      const res = await fetch('/api/admin/podium');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminPodiumBids(data.bids || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin podium bids:', err);
    } finally {
      setAdminPodiumLoading(false);
    }
  };

  const handleAdminPodiumAction = async (bidId, action) => {
    try {
      const res = await fetch('/api/admin/podium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'İşlem tamamlandı.');
        loadAdminPodiumBids();
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="login-layout" style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(212, 175, 55, 0.08)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          top: '20%',
          left: '30%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(14, 165, 233, 0.05)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          bottom: '20%',
          right: '30%',
          pointerEvents: 'none'
        }} />

        <div className="login-card" style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: 'clamp(18px, 4vw, 28px)',
          padding: 'clamp(24px, 5vw, 44px) clamp(20px, 4vw, 40px)',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(18px, 3vw, 28px)',
          zIndex: 1
        }}>
          <div className="login-header" style={{ textAlign: 'center' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'color 0.2s'
            }} onMouseOver={(e) => e.target.style.color = '#d4af37'} onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}>
              <ArrowLeft size={14} /> Ana Sayfaya Dön
            </Link>
            
            <div className="logo-icon" style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.6rem',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)'
            }}>SB</div>
            
            <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Yönetim Paneli Girişi
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              SeramikBak yönetici yetkilendirmesi gereklidir.
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loginError && (
              <div className="error-alert" style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '14px',
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

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.05em' }}>KULLANICI ADI</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="Kullanıcı adınızı girin" 
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 42px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.25s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.15)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(255, 255, 255, 0.4)' }} />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '750', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.05em' }}>ŞİFRE</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 42px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.25s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.15)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(255, 255, 255, 0.4)' }} />
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                color: '#0f172a',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontWeight: '750',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(212, 175, 55, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.25)';
              }}
            >
              <ShieldCheck size={16} />
              <span>Yönetici Girişi Yap</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.02em' }}>
            SeramikBak Yönetici Güvenlik Protokolü Aktiftir.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-layout">
      {/* Mobile Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">SB</div>
            <div>
              <span className="logo-text">SeramikBak</span>
              <span className="system-badge">Admin Yetkisi</span>
            </div>
          </div>
          {isMobile && (
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {/* Grup 1: Veri Yönetimi */}
          <div className="nav-group">
            <button className="nav-group-title" onClick={() => toggleGroup('data')}>
              <LayoutGrid size={15} />
              <span>Veri Yönetimi</span>
              {expandedGroups.data ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.data && (
              <div className="nav-group-items">
                <button className={`nav-item ${activeTab === 'scraper' ? 'active' : ''}`} onClick={() => handleTabSelect('scraper')}>
                  <Terminal size={16} />
                  <span>Ürün Kazıma</span>
                </button>
                <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabSelect('products')}>
                  <Package size={16} />
                  <span>Ürün Yönetimi</span>
                </button>
              </div>
            )}
          </div>

          {/* Grup 2: Satış & CRM */}
          <div className="nav-group">
            <button className="nav-group-title" onClick={() => toggleGroup('sales')}>
              <Users size={15} />
              <span>Satış & CRM</span>
              {expandedGroups.sales ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.sales && (
              <div className="nav-group-items">
                <button className={`nav-item ${activeTab === 'dealers' ? 'active' : ''}`} onClick={() => handleTabSelect('dealers')}>
                  <MapPin size={16} />
                  <span>Bayi Teşkilatı</span>
                </button>
                <button className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => handleTabSelect('leads')}>
                  <FileText size={16} />
                  <span>Teklif Talepleri</span>
                  {leads.length > 0 && <span className="nav-badge">{leads.length}</span>}
                </button>
                <button className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => handleTabSelect('projects')}>
                  <Building2 size={16} />
                  <span>Proje Talepleri</span>
                  {projects.length > 0 && <span className="nav-badge">{projects.length}</span>}
                </button>
                <button className={`nav-item ${activeTab === 'installers' ? 'active' : ''}`} onClick={() => handleTabSelect('installers')}>
                  <Wrench size={16} />
                  <span>Seramik Ustaları</span>
                  {installerStats.pending > 0 && <span className="nav-badge" style={{ background: '#ef4444' }}>{installerStats.pending}</span>}
                </button>
                <button className={`nav-item ${activeTab === 'contact_messages' ? 'active' : ''}`} onClick={() => handleTabSelect('contact_messages')}>
                  <Mail size={16} />
                  <span>İletişim Mesajları</span>
                  {contactMessages.filter(m => m.status === 'UNREAD').length > 0 && (
                    <span className="nav-badge" style={{ background: '#ef4444' }}>
                      {contactMessages.filter(m => m.status === 'UNREAD').length}
                    </span>
                  )}
                </button>
                <button className={`nav-item ${activeTab === 'sample_orders' ? 'active' : ''}`} onClick={() => handleTabSelect('sample_orders')}>
                  <Truck size={16} />
                  <span>Numune Talepleri</span>
                  {sampleOrders.filter(o => o.status === 'PENDING').length > 0 && (
                    <span className="nav-badge" style={{ background: '#f59e0b', color: '#0f172a' }}>
                      {sampleOrders.filter(o => o.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Grup 3: Finans & SaaS */}
          <div className="nav-group">
            <button className="nav-group-title" onClick={() => toggleGroup('finance')}>
              <CreditCard size={15} />
              <span>Finans & SaaS</span>
              {expandedGroups.finance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.finance && (
              <div className="nav-group-items">
                <button className={`nav-item ${activeTab === 'saas' ? 'active' : ''}`} onClick={() => handleTabSelect('saas')}>
                  <CreditCard size={16} />
                  <span>SaaS Abonelik</span>
                </button>
                <button className={`nav-item ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => handleTabSelect('campaigns')}>
                  <Sparkles size={16} />
                  <span>Sponsorlu Reklam</span>
                  {campaigns.filter(c => c.status === 'PENDING_APPROVAL').length > 0 && (
                    <span className="nav-badge gold">{campaigns.filter(c => c.status === 'PENDING_APPROVAL').length}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Grup 4: Ayarlar */}
          <div className="nav-group">
            <button className="nav-group-title" onClick={() => toggleGroup('settings')}>
              <Settings size={15} />
              <span>Ayarlar</span>
              {expandedGroups.settings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expandedGroups.settings && (
              <div className="nav-group-items">
                <button className={`nav-item ${activeTab === 'brands' ? 'active' : ''}`} onClick={() => handleTabSelect('brands')}>
                  <Building2 size={16} />
                  <span>Marka Hesapları</span>
                </button>
                <button className={`nav-item ${activeTab === 'pages' ? 'active' : ''}`} onClick={() => handleTabSelect('pages')}>
                  <Globe size={16} />
                  <span>Kurumsal Sayfalar</span>
                </button>
                <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => handleTabSelect('security')}>
                  <ShieldCheck size={16} />
                  <span>Güvenlik & Yedekleme</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="sidebar-footer-btn">
            <ArrowLeft size={16} />
            <span>Portala Git</span>
          </Link>
          <button onClick={() => setIsLoggedIn(false)} className="sidebar-footer-btn logout">
            <LogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          {isMobile && (
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
          )}
          <div className="topbar-title">
            {(() => { const Icon = tabIcons[activeTab]; return Icon ? <Icon size={20} className="topbar-icon" /> : null; })()}
            <h1>{tabLabels[activeTab]}</h1>
          </div>
          <div className="topbar-actions">
            <span className="topbar-user">
              <ShieldCheck size={16} />
              <span>Admin</span>
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">

      {/* TAB 1: DATA INGESTION & SCRAPER */}
      {activeTab === 'scraper' && (

        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Sub-tab Navigation */}
          <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '10px 16px', borderRadius: 'var(--border-radius-sm)', background: '#ffffff', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className={`admin-subtab-btn ${scraperSubTab === 'crawler' ? 'active' : ''}`}
              onClick={() => setScraperSubTab('crawler')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: scraperSubTab === 'crawler' ? 'var(--text-primary)' : 'transparent',
                color: scraperSubTab === 'crawler' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Terminal size={14} />
              <span>Akıllı Web Scraper</span>
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${scraperSubTab === 'excel' ? 'active' : ''}`}
              onClick={() => setScraperSubTab('excel')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: scraperSubTab === 'excel' ? 'var(--text-primary)' : 'transparent',
                color: scraperSubTab === 'excel' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={14} />
              <span>Excel / TSV İçe Aktar</span>
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${scraperSubTab === 'zip' ? 'active' : ''}`}
              onClick={() => setScraperSubTab('zip')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: scraperSubTab === 'zip' ? 'var(--text-primary)' : 'transparent',
                color: scraperSubTab === 'zip' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={14} />
              <span>ZIP Görsel Eşleştirme</span>
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${scraperSubTab === 'pdf' ? 'active' : ''}`}
              onClick={() => setScraperSubTab('pdf')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: scraperSubTab === 'pdf' ? 'var(--text-primary)' : 'transparent',
                color: scraperSubTab === 'pdf' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={14} />
              <span>PDF Katalogdan Yükle</span>
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${scraperSubTab === 'feed' ? 'active' : ''}`}
              onClick={() => setScraperSubTab('feed')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: scraperSubTab === 'feed' ? 'var(--text-primary)' : 'transparent',
                color: scraperSubTab === 'feed' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings size={14} />
              <span>XML / JSON Feed</span>
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${scraperSubTab === 'pricebot' ? 'active' : ''}`}
              onClick={() => setScraperSubTab('pricebot')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: scraperSubTab === 'pricebot' ? 'var(--text-primary)' : 'transparent',
                color: scraperSubTab === 'pricebot' ? '#ffffff' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={14} />
              <span>Pazaryeri & Fiyat Botu</span>
            </button>
          </div>

          <div className="admin-grid">
            {/* Left Form Panel */}
            {scraperSubTab === 'crawler' && (
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <Settings size={20} className="icon-gold" />
                  <div>
                    <h3>Akıllı Web Scraper</h3>
                    <p>Markaların katalog veya kategori URL&apos;lerini taratarak veritabanına normalize seriler ekleyin.</p>
                  </div>
                </div>

                <form onSubmit={handleIngest} className="ingest-form">
                  {successMsg && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Hedef Marka</label>
                    <select 
                      value={selectedBrand} 
                      onChange={(e) => setSelectedBrand(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Katalog / Kategori URL&apos;si</label>
                    <input 
                      type="url" 
                      value={scrapeUrl} 
                      onChange={(e) => setScrapeUrl(e.target.value)} 
                      required 
                      placeholder="https://ngkutahyaseramik.com.tr/urunler veya https://www.vitra.com.tr/c-duvar-karolari" 
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Kategori Tipi (Style)</label>
                    <div className="segmented-control">
                      {['Mermer', 'Beton', 'Ahşap', 'Taş'].map(style => (
                        <button 
                          key={style}
                          type="button" 
                          className={categoryStyle === style ? 'active' : ''} 
                          onClick={() => setCategoryStyle(style)}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isScraping}
                  >
                    {isScraping ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Kazınıyor ve Normalize Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Kazımayı Başlat & Normalize Et</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {scraperSubTab === 'excel' && (
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <FileText size={20} className="icon-gold" />
                  <div>
                    <h3>Excel / TSV İçe Aktarım</h3>
                    <p>Excel veya Google E-Tablolar üzerinden kopyalanan satırları doğrudan yapıştırarak toplu ürün ekleyin.</p>
                  </div>
                </div>

                <form onSubmit={handleImportExcel} className="ingest-form">
                  {excelSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{excelSuccess}</span>
                    </div>
                  )}

                  {excelError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{excelError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Hedef Marka</label>
                    <select 
                      value={excelBrandId} 
                      onChange={(e) => setExcelBrandId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Kategori Tipi (Varsayılan)</label>
                    <div className="segmented-control">
                      {['Mermer', 'Beton', 'Ahşap', 'Taş'].map(style => (
                        <button 
                          key={style}
                          type="button" 
                          className={excelStyle === style ? 'active' : ''} 
                          onClick={() => setExcelStyle(style)}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Kopyalanan Excel Verileri (TSV / CSV)</label>
                    <textarea 
                      value={excelTsv} 
                      onChange={(e) => setExcelTsv(e.target.value)} 
                      required 
                      placeholder="Ürün Adı&#9;Ürün Kodu&#9;Genişlik&#9;Yükseklik&#9;Renk&#9;Yüzey&#9;Stil&#9;Kullanım Alanı&#10;Borneo Antrasit&#9;BIEN-BOR-ANT&#9;60&#9;120&#9;Antrasit&#9;Mat&#9;Mermer&#9;Yer,Duvar" 
                      className="form-input"
                      rows={5}
                      style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                      <strong>Beklenen Sütun Formatı:</strong><br />
                      <code>Ürün Adı [Tab] Ürün Kodu [Tab] Genişlik (cm) [Tab] Yükseklik (cm) [Tab] Renk [Tab] Yüzey [Tab] Stil [Tab] Alan</code>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isImportingExcel}
                  >
                    {isImportingExcel ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>İçe Aktarılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Excel Verilerini İçe Aktar</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {scraperSubTab === 'zip' && (
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <Sparkles size={20} className="icon-gold" />
                  <div>
                    <h3>ZIP Görsel Eşleştirme</h3>
                    <p>Serilerin yüksek çözünürlüklü doku ve görsellerini içeren bir ZIP dosyasını yükleyin. Görsel isimleri ürün SKU kodu ile eşleşmelidir.</p>
                  </div>
                </div>

                <form onSubmit={handleUploadZip} className="ingest-form">
                  {zipSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{zipSuccess}</span>
                    </div>
                  )}

                  {zipError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{zipError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Doku ZIP Arşivi Seçin (.zip)</label>
                    <input 
                      type="file" 
                      id="zipFileInput"
                      accept=".zip"
                      onChange={(e) => setZipFile(e.target.files[0])}
                      required 
                      className="form-input"
                      style={{ padding: '8px' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                      <strong>Önemli Kurallar:</strong><br />
                      - ZIP içerisindeki görsel isimleri SKU kodları ile eşleşmelidir (ör. <code>BIEN-BOR-ANT.jpg</code>).<br />
                      - Desteklenen formatlar: <code>.jpg</code>, <code>.png</code>, <code>.webp</code>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isUploadingZip}
                  >
                    {isUploadingZip ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>ZIP Yükleniyor ve Açılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>ZIP Arşivini Yükle & Eşleştir</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {scraperSubTab === 'pdf' && (
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <FileText size={20} className="icon-gold" />
                  <div>
                    <h3>PDF Katalogdan Ürün Aktar</h3>
                    <p>Markanın PDF kataloğunu yükleyin. Gemini AI tüm ürün satırlarını otomatik analiz edip sisteme ekler.</p>
                  </div>
                </div>

                <form onSubmit={handleImportPdf} className="ingest-form">
                  {pdfSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{pdfSuccess}</span>
                    </div>
                  )}

                  {pdfError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{pdfError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Hedef Marka</label>
                    <select 
                      value={pdfBrandId} 
                      onChange={(e) => setPdfBrandId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Varsayılan Stil</label>
                    <div className="segmented-control">
                      {['Mermer', 'Beton', 'Ahşap', 'Taş'].map(style => (
                        <button 
                          key={style}
                          type="button" 
                          className={pdfStyle === style ? 'active' : ''} 
                          onClick={() => setPdfStyle(style)}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Katalog PDF Dosyası Seçin (.pdf)</label>
                    <input 
                      type="file" 
                      id="pdfFileInput"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      required 
                      className="form-input"
                      style={{ padding: '8px' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                      <strong>Önemli Kurallar:</strong><br />
                      - Yüklenen katalog veya broşür PDF formatında olmalıdır.<br />
                      - Gemini AI kataloğu analiz ederek seramik isimlerini, SKU kodlarını, ebatlarını ve renklerini ayıklar.
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isImportingPdf}
                  >
                    {isImportingPdf ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Katalog Analiz Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>PDF Kataloğu Analiz Et & İçe Aktar</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {scraperSubTab === 'feed' && (
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <Settings size={20} className="icon-gold" />
                  <div>
                    <h3>XML / JSON Feed Entegrasyonu</h3>
                    <p>B2B distribütör veya üretici XML/JSON ürün besleme linkini girerek ürün kataloglarını senkronize edin.</p>
                  </div>
                </div>

                <form onSubmit={handleImportFeed} className="ingest-form">
                  {feedSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{feedSuccess}</span>
                    </div>
                  )}

                  {feedError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{feedError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Hedef Marka</label>
                    <select 
                      value={feedBrandId} 
                      onChange={(e) => setFeedBrandId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Varsayılan Stil</label>
                    <div className="segmented-control">
                      {['Mermer', 'Beton', 'Ahşap', 'Taş'].map(style => (
                        <button 
                          key={style}
                          type="button" 
                          className={feedStyle === style ? 'active' : ''} 
                          onClick={() => setFeedStyle(style)}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Feed URL Adresi (XML veya JSON)</label>
                    <input 
                      type="url" 
                      value={feedUrl} 
                      onChange={(e) => setFeedUrl(e.target.value)} 
                      required 
                      placeholder="https://bayi.bien.com.tr/xml/products.xml" 
                      className="form-input"
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                      <strong>Otomatik Ayrıştırma Kuralları:</strong><br />
                      - Sistem içeriğin XML veya JSON olduğunu otomatik tespit eder.<br />
                      - Standart etiketler (ad, kod, en, boy, renk, yüzey, kategori) otomatik eşleştirilir.
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isImportingFeed}
                  >
                    {isImportingFeed ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Feed Verileri Çekiliyor & Aktarılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Feed Entegrasyonunu Başlat</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {scraperSubTab === 'pricebot' && (
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <CreditCard size={20} className="icon-gold" />
                  <div>
                    <h3>Pazaryeri & Fiyat Botu</h3>
                    <p>Pazaryerlerindeki (Trendyol, Hepsiburada, n11, Koçtaş, Bauhaus) seramik fiyatlarını ve ürün linklerini otomatik taratın.</p>
                  </div>
                </div>

                <form onSubmit={handleCrawlPrices} className="ingest-form">
                  {crawlSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{crawlSuccess}</span>
                    </div>
                  )}

                  {crawlError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{crawlError}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <strong>Fiyat Botu Nasıl Çalışır?</strong>
                    <ul style={{ paddingLeft: '16px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Veritabanındaki tüm ürünlerin SKU kodlarını tarar.</li>
                      <li>Trendyol, Hepsiburada, n11, Koçtaş ve Bauhaus üzerinde ilgili SKU kodlarını arar.</li>
                      <li>Bulunan fiyatları ve ürün detay linklerini otomatik günceller.</li>
                      <li>Her marka için lisans durumunu ve fiyat formülünü hesaba katar.</li>
                    </ul>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isCrawlingPrices}
                  >
                    {isCrawlingPrices ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Fiyatlar Güncelleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Fiyat Botunu Şimdi Çalıştır</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Right Output Console Terminal */}
            <div className="admin-card console-card glass-panel">
              <div className="card-header">
                <Terminal size={20} className="icon-blue" />
                <div>
                  <h3>İşlem Konsol Terminali</h3>
                  <p>Arka plandaki veri normalizasyonu ve aktarım sürecini canlı izleyin.</p>
                </div>
              </div>

              <div className="console-terminal">
                {scraperSubTab === 'crawler' && (
                  logs.length === 0 ? (
                    <div className="console-empty">
                      <Terminal size={32} />
                      <p>Bekleniyor... Bir URL girin ve &apos;Kazımayı Başlat&apos; butonuna tıklayın.</p>
                    </div>
                  ) : (
                    <div className="console-logs-list">
                      {logs.map((log, idx) => {
                        let isError = log.includes('[Error]');
                        let isSystem = log.includes('[System]');
                        let isScraper = log.includes('[Scraper]');
                        return (
                          <div 
                            key={idx} 
                            className={`console-line ${isError ? 'err' : isSystem ? 'sys' : isScraper ? 'scr' : ''}`}
                          >
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{log}</span>
                          </div>
                        );
                      })}
                      {isScraping && (
                        <div className="console-typing-loader">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                    </div>
                  )
                )}

                {scraperSubTab === 'excel' && (
                  excelLogs.length === 0 ? (
                    <div className="console-empty">
                      <Terminal size={32} />
                      <p>Excel/TSV verilerini yapıştırın ve &apos;İçe Aktar&apos; butonuna basın.</p>
                    </div>
                  ) : (
                    <div className="console-logs-list">
                      {excelLogs.map((log, idx) => {
                        let isError = log.includes('[Hata]');
                        let isSuccess = log.includes('[Eşleştirildi]');
                        let isSystem = log.includes('[İçe Aktarım]') || log.includes('[Tamamlandı]');
                        return (
                          <div 
                            key={idx} 
                            className={`console-line ${isError ? 'err' : isSuccess ? 'sys' : isSystem ? 'scr' : ''}`}
                          >
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{log}</span>
                          </div>
                        );
                      })}
                      {isImportingExcel && (
                        <div className="console-typing-loader">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                    </div>
                  )
                )}

                {scraperSubTab === 'zip' && (
                  zipLogs.length === 0 ? (
                    <div className="console-empty">
                      <Terminal size={32} />
                      <p>Görsel ZIP dosyasını seçin ve &apos;Yükle & Eşleştir&apos; butonuna basın.</p>
                    </div>
                  ) : (
                    <div className="console-logs-list">
                      {zipLogs.map((log, idx) => {
                        let isError = log.includes('[Hata]');
                        let isMatch = log.includes('[Eşleşti]');
                        let isSystem = log.includes('[Medya Yükleme]') || log.includes('[Tamamlandı]') || log.includes('[Eşleştirme]') || log.includes('[Medya Temizliği]');
                        return (
                          <div 
                            key={idx} 
                            className={`console-line ${isError ? 'err' : isMatch ? 'sys' : isSystem ? 'scr' : ''}`}
                          >
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{log}</span>
                          </div>
                        );
                      })}
                      {isUploadingZip && (
                        <div className="console-typing-loader">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                    </div>
                  )
                )}

                {scraperSubTab === 'pdf' && (
                  pdfLogs.length === 0 ? (
                    <div className="console-empty">
                      <Terminal size={32} />
                      <p>Katalog PDF dosyasını seçin ve &apos;Analiz Et & İçe Aktar&apos; butonuna basın.</p>
                    </div>
                  ) : (
                    <div className="console-logs-list">
                      {pdfLogs.map((log, idx) => {
                        let isError = log.includes('[Hata]');
                        let isSuccess = log.includes('[Eşleştirildi]');
                        let isSystem = log.includes('[İçe Aktarım]') || log.includes('[Tamamlandı]') || log.includes('[Gemini AI]');
                        return (
                          <div 
                            key={idx} 
                            className={`console-line ${isError ? 'err' : isSuccess ? 'sys' : isSystem ? 'scr' : ''}`}
                          >
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{log}</span>
                          </div>
                        );
                      })}
                      {isImportingPdf && (
                        <div className="console-typing-loader">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                    </div>
                  )
                )}

                {scraperSubTab === 'feed' && (
                  feedLogs.length === 0 ? (
                    <div className="console-empty">
                      <Terminal size={32} />
                      <p>Feed URL adresini girin ve &apos;Entegrasyonu Başlat&apos; butonuna basın.</p>
                    </div>
                  ) : (
                    <div className="console-logs-list">
                      {feedLogs.map((log, idx) => {
                        let isError = log.includes('[Hata]');
                        let isSuccess = log.includes('[Eşleştirildi]');
                        let isSystem = log.includes('[Feed Entegrasyonu]') || log.includes('[Tamamlandı]') || log.includes('[Ayrıştırma]');
                        return (
                          <div 
                            key={idx} 
                            className={`console-line ${isError ? 'err' : isSuccess ? 'sys' : isSystem ? 'scr' : ''}`}
                          >
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{log}</span>
                          </div>
                        );
                      })}
                      {isImportingFeed && (
                        <div className="console-typing-loader">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                    </div>
                  )
                )}

                {scraperSubTab === 'pricebot' && (
                  crawlLogs.length === 0 ? (
                    <div className="console-empty">
                      <Terminal size={32} />
                      <p>Fiyat tarayıcıyı başlatmak için sol paneldeki butona tıklayın.</p>
                    </div>
                  ) : (
                    <div className="console-logs-list">
                      {crawlLogs.map((log, idx) => {
                        let isError = log.includes('[Hata]');
                        let isSuccess = log.includes('[Eşleşti]') || log.includes('[Tamamlandı]');
                        let isSystem = log.includes('[Fiyat Botu]') || log.includes('[Tarama]');
                        return (
                          <div 
                            key={idx} 
                            className={`console-line ${isError ? 'err' : isSuccess ? 'sys' : isSystem ? 'scr' : ''}`}
                          >
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{log}</span>
                          </div>
                        );
                      })}
                      {isCrawlingPrices && (
                        <div className="console-typing-loader">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEALER MANAGEMENT */}
      {activeTab === 'dealers' && (
        <div className="admin-grid animate-fade-in">
          {/* Left Form: Add Dealer */}
          <div className="admin-card glass-panel">
            <div className="card-header">
              <Plus size={20} className="icon-gold" />
              <div>
                <h3>Yeni Yetkili Bayi Kaydet</h3>
                <p>Markaların müşterileri yönlendireceği fiziki Showroom adreslerini ve GPS koordinatlarını girin.</p>
              </div>
            </div>

            <form onSubmit={handleAddDealer} className="ingest-form">
              {dealerSuccess && (
                <div className="success-alert">
                  <CheckCircle size={18} />
                  <span>{dealerSuccess}</span>
                </div>
              )}

              {dealerError && (
                <div className="error-alert">
                  <AlertCircle size={18} />
                  <span>{dealerError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Bayi / Showroom Adı</label>
                <input 
                  type="text" 
                  value={newDealerName} 
                  onChange={(e) => setNewDealerName(e.target.value)} 
                  required 
                  placeholder="NG Kütahya Kadıköy Bayi" 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Yetkili Marka</label>
                <select 
                  value={newDealerBrandId} 
                  onChange={(e) => setNewDealerBrandId(e.target.value)} 
                  required
                  className="form-select"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>İl</label>
                  <input type="text" value={newDealerCity} onChange={(e) => setNewDealerCity(e.target.value)} required className="form-input" />
                </div>
                <div className="form-group">
                  <label>İlçe</label>
                  <input type="text" value={newDealerDistrict} onChange={(e) => setNewDealerDistrict(e.target.value)} required placeholder="Kadıköy" className="form-input" />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>İletişim Telefonu (Kullanıcı Adı)</label>
                  <input 
                    type="tel" 
                    value={newDealerPhone} 
                    onChange={(e) => setNewDealerPhone(e.target.value)} 
                    required 
                    placeholder="0216 123 4567" 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>E-posta (Kullanıcı Adı)</label>
                  <input 
                    type="email" 
                    value={newDealerEmail} 
                    onChange={(e) => setNewDealerEmail(e.target.value)} 
                    placeholder="bayi@firma.com" 
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Giriş Şifresi (Opsiyonel)</label>
                <input 
                  type="text" 
                  value={newDealerPassword} 
                  onChange={(e) => setNewDealerPassword(e.target.value)} 
                  placeholder="Boş bırakılırsa varsayılan: bayi123" 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Açık Adres</label>
                <textarea 
                  value={newDealerAddress} 
                  onChange={(e) => setNewDealerAddress(e.target.value)} 
                  required 
                  placeholder="Bağdat Cad. No:45 Kadıköy" 
                  className="form-input" 
                  rows={2}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Enlem (Latitude)</label>
                  <input type="text" value={newDealerLat} onChange={(e) => setNewDealerLat(e.target.value)} required className="form-input" />
                </div>
                <div className="form-group">
                  <label>Boylam (Longitude)</label>
                  <input type="text" value={newDealerLng} onChange={(e) => setNewDealerLng(e.target.value)} required className="form-input" />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full-btn flex-center-btn"
                disabled={isAddingDealer}
              >
                {isAddingDealer ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Bayi Teşkilatına Ekle</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Table: Dealers Directory */}
          <div className="admin-card console-card glass-panel">
            <div className="card-header">
              <MapPin size={20} className="icon-blue" />
              <div>
                <h3>Kayıtlı Yetkili Bayi Listesi ({dealers.length} Bayi)</h3>
                <p>Sistemde kayıtlı olan tüm resmi ve yetkili bayi harita koordinatları.</p>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="subtab-header" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button 
                type="button"
                className={`admin-subtab-btn ${dealerSubTab === 'active' ? 'active' : ''}`}
                onClick={() => setDealerSubTab('active')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: dealerSubTab === 'active' ? 'var(--text-primary)' : 'transparent',
                  color: dealerSubTab === 'active' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Aktif Bayiler ({dealers.filter(d => d.status === 'APPROVED' || !d.status).length})
              </button>
              <button 
                type="button"
                className={`admin-subtab-btn ${dealerSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setDealerSubTab('pending')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: dealerSubTab === 'pending' ? 'var(--text-primary)' : 'transparent',
                  color: dealerSubTab === 'pending' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Bayi Başvuruları ({dealers.filter(d => d.status === 'PENDING_APPROVAL').length})
                {dealers.filter(d => d.status === 'PENDING_APPROVAL').length > 0 && (
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    animation: 'pulse 1.5s infinite'
                  }}></span>
                )}
              </button>
            </div>

            {dealerSubTab === 'pending' ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Bayi Adı</th>
                      <th>Marka</th>
                      <th>Bölge</th>
                      <th>Telefon / E-posta</th>
                      <th>Onay İşlemi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealers.filter(d => d.status === 'PENDING_APPROVAL').map(d => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.name}</strong>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.address}</div>
                        </td>
                        <td><span className="badge-brand">{d.brand?.name}</span></td>
                        <td>{d.district}, {d.city}</td>
                        <td>
                          <div>{d.phone}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.email || '-'}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button 
                              type="button" 
                              onClick={() => handleOpenEditDealerModal(d)} 
                              className="btn-action-edit" 
                              title="Giriş Bilgilerini ve Şifreyi Güncelle"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                background: 'rgba(212, 175, 55, 0.12)',
                                color: '#b48811',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Key size={13} />
                              <span>Şifre/Bilgi</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleUpdateDealerStatus(d.id, 'APPROVED')} 
                              className="btn-action-approve"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                background: '#e6f7ed',
                                color: '#10b981',
                                border: '1px solid #10b981',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Onayla
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleUpdateDealerStatus(d.id, 'REJECTED')} 
                              className="btn-action-reject"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Reddet
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {dealers.filter(d => d.status === 'PENDING_APPROVAL').length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Bekleyen bayi başvurusu bulunmamaktadır.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Bayi Adı</th>
                      <th>Marka</th>
                      <th>Bölge</th>
                      <th>Telefon / E-posta</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealers.filter(d => d.status === 'APPROVED' || !d.status).map(d => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.name}</strong>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.address}</div>
                        </td>
                        <td><span className="badge-brand">{d.brand?.name}</span></td>
                        <td>{d.district}, {d.city}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{d.phone}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{d.email || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>E-posta yok</span>}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button 
                              type="button" 
                              onClick={() => handleOpenEditDealerModal(d)} 
                              className="btn-action-edit" 
                              title="Giriş Bilgilerini ve Şifreyi Güncelle"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                background: 'rgba(212, 175, 55, 0.12)',
                                color: '#b48811',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Key size={13} />
                              <span>Şifre/Bilgi</span>
                            </button>
                            <button onClick={() => handleDeleteDealer(d.id)} className="btn-action-delete" title="Sil">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {dealers.filter(d => d.status === 'APPROVED' || !d.status).length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Kayıtlı bayi bulunmamaktadır.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LEADS (TEKLİF TALEPLERİ) TRACKING */}
      {activeTab === 'leads' && (
        <div className="admin-card glass-panel w-full animate-fade-in">
          <div className="card-header">
            <FileText size={20} className="icon-gold" />
            <div>
              <h3>Gelen Müşteri Fiyat Teklif Talepleri</h3>
              <p>Müşterilerin anasayfa üzerinden bayilere gönderdiği palet bazlı metraj teklif talepleri.</p>
            </div>
          </div>

          <div className="table-responsive" style={{ marginTop: '12px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Müşteri Bilgileri</th>
                  <th>Hedef Ürün</th>
                  <th>Hedef Yetkili Bayi</th>
                  <th>Notlar / İstek</th>
                  <th>Gönderim Tarihi</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.clientName}</strong>
                      <div style={{ fontSize: '0.7rem' }}>{l.clientPhone}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.clientEmail}</div>
                    </td>
                    <td>
                      <span className="badge-brand" style={{ display: 'block', marginBottom: '2px' }}>{l.dealer?.brand?.name}</span>
                      <strong>{l.product?.name}</strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SKU: {l.product?.code}</div>
                    </td>
                    <td>
                      <strong>{l.dealer?.name}</strong>
                    </td>
                    <td>
                      <p style={{ maxWidth: '240px', fontSize: '0.72rem', whiteSpace: 'pre-wrap' }}>{l.notes}</p>
                    </td>
                    <td>{new Date(l.createdAt).toLocaleString('tr-TR')}</td>
                    <td>
                      <select 
                        value={l.status} 
                        onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                        className={`status-select ${l.status.toLowerCase()}`}
                      >
                        <option value="PENDING">Beklemede</option>
                        <option value="RESPONDED">Cevaplandı</option>
                        <option value="COMPLETED">Tamamlandı</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteLead(l.id)} className="btn-action-delete" title="Sil">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Henüz fiyat teklif talebi alınmamıştır.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CONTACT MESSAGES (İLETİŞİM MESAJLARI) */}
      {activeTab === 'contact_messages' && (
        <div>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 4px 0' }}>Gelen İletişim & Destek Mesajları</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                İletişim sayfasından gönderilen müşteri sorularını, destek taleplerini ve bildirimleri yönetin.
              </p>
            </div>
            <button 
              onClick={loadContactMessages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} /> Yenile
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Toplam Mesaj</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{contactMessages.length}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '4px' }}>Okunmamış Mesajlar</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444' }}>{contactMessages.filter(m => m.status === 'UNREAD').length}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#22c55e', marginBottom: '4px' }}>Yanıtlandı / İşlendi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#22c55e' }}>{contactMessages.filter(m => m.status === 'REPLIED').length}</div>
            </div>
          </div>

          <div className="table-responsive" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Gönderen</th>
                  <th>İletişim</th>
                  <th>Konu</th>
                  <th>Mesaj İçeriği</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {contactMessages.map(m => (
                  <tr key={m.id} style={{ background: m.status === 'UNREAD' ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{m.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{m.email}</div>
                      {m.phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.phone}</div>}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid var(--border-color)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '600'
                      }}>{m.subject || 'Genel Destek'}</span>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.45',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-color)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        maxHeight: '110px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {m.message}
                      </div>
                    </td>
                    <td>
                      <select 
                        value={m.status} 
                        onChange={(e) => handleUpdateContactMessageStatus(m.id, e.target.value)}
                        style={{
                          background: m.status === 'UNREAD' ? 'rgba(239, 68, 68, 0.15)' : m.status === 'REPLIED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.08)',
                          color: m.status === 'UNREAD' ? '#ef4444' : m.status === 'REPLIED' ? '#22c55e' : '#cbd5e1',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="UNREAD" style={{ background: '#0f172a', color: '#ef4444' }}>🔴 Okunmadı</option>
                        <option value="READ" style={{ background: '#0f172a', color: '#cbd5e1' }}>🟡 İnceleniyor</option>
                        <option value="REPLIED" style={{ background: '#0f172a', color: '#22c55e' }}>🟢 Yanıtlandı</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteContactMessage(m.id)} 
                        className="btn-action-delete" 
                        title="Mesajı Sil"
                        style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {contactMessages.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      Henüz gelen iletişim mesajı bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SAMPLE ORDERS (NUMUNE TALEPLERİ) */}
      {activeTab === 'sample_orders' && (
        <div>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 4px 0' }}>Numune Karo Sipariş Talepleri</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Müşterilerin adreslerine talep ettikleri ücretsiz numune karoları ve kargo takip numaralarını yönetin.
              </p>
            </div>
            <button 
              onClick={loadSampleOrders}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} /> Yenile
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Toplam Numune Talebi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{sampleOrders.length}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '4px' }}>Bekleyen Talepler</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>{sampleOrders.filter(o => o.status === 'PENDING').length}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '4px' }}>Kargolanan Numuneler</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#3b82f6' }}>{sampleOrders.filter(o => o.status === 'SHIPPED').length}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#22c55e', marginBottom: '4px' }}>Teslim Edilenler</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#22c55e' }}>{sampleOrders.filter(o => o.status === 'DELIVERED').length}</div>
            </div>
          </div>

          <div className="table-responsive" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Talep Edilen Ürün</th>
                  <th>Müşteri Bilgileri</th>
                  <th>Teslimat Adresi</th>
                  <th>Bayi</th>
                  <th>Kargo Takip Bilgisi</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sampleOrders.map(o => (
                  <tr key={o.id} style={{ background: o.status === 'PENDING' ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {o.product?.imageUrl && (
                          <img src={o.product.imageUrl} alt={o.product.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{o.product?.brand?.name} - {o.product?.name}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{o.product?.width}x{o.product?.height} cm • {o.product?.finish}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{o.clientName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{o.clientPhone}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.clientEmail}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>{o.city} / {o.district}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '2px' }}>{o.address}</div>
                      {o.notes && <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontStyle: 'italic', marginTop: '4px' }}>Not: {o.notes}</div>}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-blue)' }}>{o.dealer?.name || 'Genel Merkez'}</span>
                    </td>
                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                          type="text" 
                          placeholder="Kargo Firması (Örn: Yurtiçi)" 
                          defaultValue={o.cargoCompany || ''}
                          onBlur={(e) => handleUpdateSampleOrderStatus(o.id, undefined, e.target.value, undefined)}
                          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.76rem' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Takip Kodu" 
                          defaultValue={o.trackingNumber || ''}
                          onBlur={(e) => handleUpdateSampleOrderStatus(o.id, undefined, undefined, e.target.value)}
                          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.76rem' }}
                        />
                      </div>
                    </td>
                    <td>
                      <select 
                        value={o.status} 
                        onChange={(e) => handleUpdateSampleOrderStatus(o.id, e.target.value, undefined, undefined)}
                        style={{
                          background: o.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : o.status === 'SHIPPED' ? 'rgba(59, 130, 246, 0.15)' : o.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: o.status === 'PENDING' ? '#f59e0b' : o.status === 'SHIPPED' ? '#3b82f6' : o.status === 'DELIVERED' ? '#22c55e' : '#ef4444',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="PENDING" style={{ background: '#0f172a', color: '#f59e0b' }}>🟡 Beklemede</option>
                        <option value="SHIPPED" style={{ background: '#0f172a', color: '#3b82f6' }}>🚚 Kargolandı</option>
                        <option value="DELIVERED" style={{ background: '#0f172a', color: '#22c55e' }}>🟢 Teslim Edildi</option>
                        <option value="CANCELLED" style={{ background: '#0f172a', color: '#ef4444' }}>🔴 İptal</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteSampleOrder(o.id)} 
                        className="btn-action-delete" 
                        title="Sil"
                        style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {sampleOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      Henüz numune karo talebi oluşturulmamıştır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SAAS CONFIGURATION */}
      {activeTab === 'saas' && (() => {
        const pendingBrands = saasConfigs.filter(item => item.saas?.status === 'PENDING_APPROVAL' || item.saas?.pendingStatus === 'PENDING_APPROVAL');
        const pendingDealers = dealerSaasConfigs.filter(item => item.saas?.status === 'PENDING_APPROVAL' || item.saas?.pendingStatus === 'PENDING_APPROVAL');
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Sub-tab Navigation */}
          <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '10px 16px', borderRadius: 'var(--border-radius-sm)', background: '#ffffff', border: '1px solid var(--border-color)', width: '100%' }}>
            <button 
              type="button" 
              className={`admin-subtab-btn ${saasSubTab === 'brand' ? 'active' : ''}`}
              onClick={() => setSaasSubTab('brand')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: saasSubTab === 'brand' ? 'var(--accent-gold, #d4af37)' : 'transparent',
                color: saasSubTab === 'brand' ? '#000' : 'var(--text-muted, #666)',
                cursor: 'pointer'
              }}
            >
              Marka SaaS Lisansları
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${saasSubTab === 'dealer' ? 'active' : ''}`}
              onClick={() => setSaasSubTab('dealer')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: saasSubTab === 'dealer' ? 'var(--accent-gold, #d4af37)' : 'transparent',
                color: saasSubTab === 'dealer' ? '#000' : 'var(--text-muted, #666)',
                cursor: 'pointer'
              }}
            >
              Bayi SaaS Abonelikleri (Yıllık Paketler)
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${saasSubTab === 'pending' ? 'active' : ''}`}
              onClick={() => setSaasSubTab('pending')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: saasSubTab === 'pending' ? 'var(--accent-gold, #d4af37)' : 'transparent',
                color: saasSubTab === 'pending' ? '#000' : 'var(--text-muted, #666)',
                cursor: 'pointer'
              }}
            >
              Onay Talepleri ({pendingBrands.length + pendingDealers.length})
            </button>
            <button 
              type="button" 
              className={`admin-subtab-btn ${saasSubTab === 'bank_settings' ? 'active' : ''}`}
              onClick={() => setSaasSubTab('bank_settings')}
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                background: saasSubTab === 'bank_settings' ? 'var(--accent-gold, #d4af37)' : 'transparent',
                color: saasSubTab === 'bank_settings' ? '#000' : 'var(--text-muted, #666)',
                cursor: 'pointer'
              }}
            >
              Sistem & Yapay Zeka Ayarları
            </button>
          </div>

          {saasSubTab === 'brand' ? (
            <div className="admin-grid">
              {/* Left Form: Configure SaaS */}
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <Settings size={20} className="icon-gold" />
                  <div>
                    <h3>Marka SaaS Planı Yönetimi</h3>
                    <p>Markaların listelenme lisanslarını, abonelik planlarını ve bitiş sürelerini güncelleyin.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateSaas} className="ingest-form">
                  {saasSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{saasSuccess}</span>
                    </div>
                  )}

                  {saasError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{saasError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Hedef Marka</label>
                    <select 
                      value={saasBrandId} 
                      onChange={(e) => setSaasBrandId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Abonelik Katmanı</label>
                    <select 
                      value={saasPlan} 
                      onChange={(e) => setSaasPlan(e.target.value)} 
                      required
                      className="form-select"
                    >
                      <option value="FREE">FREE (Standart Listeleme)</option>
                      <option value="PRO">PRO (Analytics & Ad Manager)</option>
                      <option value="ENTERPRISE">ENTERPRISE (Premium 3D Studio & Kiosk)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Abonelik Durumu</label>
                    <select 
                      value={saasStatus} 
                      onChange={(e) => setSaasStatus(e.target.value)} 
                      required
                      className="form-select"
                    >
                      <option value="ACTIVE">Aktif (Faturalandırıldı)</option>
                      <option value="PAUSED">Askıya Alındı</option>
                      <option value="EXPIRED">Süresi Bitti</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Plan Bitiş Tarihi</label>
                    <input 
                      type="date" 
                      value={saasExpiresAt} 
                      onChange={(e) => setSaasExpiresAt(e.target.value)} 
                      required
                      className="form-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isUpdatingSaas}
                  >
                    {isUpdatingSaas ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>SaaS Aboneliğini Güncelle</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right List: Brands SaaS Plan Status */}
              <div className="admin-card console-card glass-panel">
                <div className="card-header">
                  <CreditCard size={20} className="icon-blue" />
                  <div>
                    <h3>Marka SaaS Lisans Raporu</h3>
                    <p>Türkiye geneli üreticilerin güncel lisanslama planları ve geçerlilik süreleri.</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Üretici Marka</th>
                        <th>Aktif Plan</th>
                        <th>Durum</th>
                        <th>Lisans Bitiş Tarihi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saasConfigs.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td>
                            <span className={`badge-saas-plan ${item.saas?.plan?.toLowerCase() || 'none'}`}>
                              {item.saas?.plan || 'YOK'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-saas-status ${item.saas?.status?.toLowerCase() || 'none'}`}>
                              {item.saas?.status === 'ACTIVE' ? 'Aktif' : item.saas?.status === 'PAUSED' ? 'Askıda' : item.saas?.status === 'EXPIRED' ? 'Bitti' : 'Lisanssız'}
                            </span>
                          </td>
                          <td>
                            {item.saas?.expiresAt ? new Date(item.saas.expiresAt).toLocaleDateString('tr-TR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : saasSubTab === 'dealer' ? (
            <div className="admin-grid">
              {/* Left Form: Configure Dealer SaaS */}
              <div className="admin-card glass-panel">
                <div className="card-header">
                  <Settings size={20} className="icon-gold" />
                  <div>
                    <h3>Bayi SaaS Planı Yönetimi</h3>
                    <p>Bayilerin leads paneli erişim lisanslarını ve bitiş sürelerini güncelleyin.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateDealerSaas} className="ingest-form">
                  {dealerSaasSuccess && (
                    <div className="success-alert">
                      <CheckCircle size={18} />
                      <span>{dealerSaasSuccess}</span>
                    </div>
                  )}

                  {dealerSaasError && (
                    <div className="error-alert">
                      <AlertCircle size={18} />
                      <span>{dealerSaasError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Hedef Bayi</label>
                    <select 
                      value={saasDealerId} 
                      onChange={(e) => setSaasDealerId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {dealers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Abonelik Paketi</label>
                    <select 
                      value={saasDealerPlan} 
                      onChange={(e) => setSaasDealerPlan(e.target.value)} 
                      required
                      className="form-select"
                    >
                      <option value="LITE">LITE (Aylık/Sınırlı)</option>
                      <option value="STANDART">STANDART (Yıllık Paket)</option>
                      <option value="PREMIUM">PREMIUM (Yıllık/Öncelikli)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Abonelik Durumu</label>
                    <select 
                      value={saasDealerStatus} 
                      onChange={(e) => setSaasDealerStatus(e.target.value)} 
                      required
                      className="form-select"
                    >
                      <option value="ACTIVE">Aktif (Faturalandırıldı)</option>
                      <option value="PAUSED">Askıya Alındı</option>
                      <option value="EXPIRED">Süresi Bitti</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Plan Bitiş Tarihi</label>
                    <input 
                      type="date" 
                      value={saasDealerExpiresAt} 
                      onChange={(e) => setSaasDealerExpiresAt(e.target.value)} 
                      required
                      className="form-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full-btn flex-center-btn"
                    disabled={isUpdatingDealerSaas}
                  >
                    {isUpdatingDealerSaas ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Bayi SaaS Aboneliğini Güncelle</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right List: Dealers SaaS Plan Status */}
              <div className="admin-card console-card glass-panel">
                <div className="card-header">
                  <CreditCard size={20} className="icon-blue" />
                  <div>
                    <h3>Bayi SaaS Lisans Raporu</h3>
                    <p>Bayi teşkilatının güncel lisanslama planları ve geçerlilik süreleri.</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Yetkili Bayi</th>
                        <th>Markası</th>
                        <th>Aktif Plan</th>
                        <th>Durum</th>
                        <th>Lisans Bitiş</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerSaasConfigs.map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.district || ''}, {item.city}</div>
                          </td>
                          <td>{item.brandName}</td>
                          <td>
                            <span className={`badge-saas-plan ${item.saas?.plan?.toLowerCase() || 'none'}`}>
                              {item.saas?.plan || 'YOK'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-saas-status ${item.saas?.status?.toLowerCase() || 'none'}`}>
                              {item.saas?.status === 'ACTIVE' ? 'Aktif' : item.saas?.status === 'PAUSED' ? 'Askıda' : item.saas?.status === 'EXPIRED' ? 'Bitti' : 'Lisanssız'}
                            </span>
                          </td>
                          <td>
                            {item.saas?.expiresAt ? new Date(item.saas.expiresAt).toLocaleDateString('tr-TR') : '-'}
                          </td>
                        </tr>
                      ))}
                      {dealerSaasConfigs.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                            Kayıtlı bayi bulunamadı veya listelenemedi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : saasSubTab === 'pending' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              {/* BRAND REQUESTS */}
              <div className="admin-card glass-panel w-full" style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="card-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <Settings size={20} className="icon-gold" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Marka SaaS Onay Talepleri</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Platforma üye olmak veya paketini yükseltmek isteyen markaların listesi.</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Üretici Marka</th>
                        <th style={{ padding: '10px' }}>Talebi</th>
                        <th style={{ padding: '10px' }}>Mevcut Plan</th>
                        <th style={{ padding: '10px' }}>İstenen Plan</th>
                        <th style={{ padding: '10px' }}>Ödeme Bilgisi</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBrands.map(item => {
                        const isNew = item.saas?.status === 'PENDING_APPROVAL';
                        const requestedPlanName = isNew ? item.saas?.plan : item.saas?.pendingPlan;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                            <td style={{ padding: '12px' }}><strong>{item.name}</strong></td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                background: isNew ? '#e0f2fe' : '#fef3c7',
                                color: isNew ? '#0369a1' : '#b45309',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '700'
                              }}>
                                {isNew ? 'Yeni Başvuru' : 'Paket Değişikliği'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{isNew ? 'YOK' : item.saas?.plan}</td>
                            <td style={{ padding: '12px' }}>
                              <span className={`badge-saas-plan ${requestedPlanName?.toLowerCase() || 'none'}`}>
                                {requestedPlanName}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {item.saas?.paymentSender ? (
                                <div style={{ lineHeight: '1.4' }}>
                                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.saas.paymentSender}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tarih: {item.saas.paymentDate || 'N/A'}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontStyle: 'italic', fontWeight: '500' }}>Not: {item.saas.paymentNote || '-'}</div>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Ödeme Bildirimi Yok</span>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleApproveRejectBrandSaaS(item.id, 'approve')}
                                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleApproveRejectBrandSaaS(item.id, 'reject')}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', marginLeft: '6px' }}
                              >
                                Reddet
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {pendingBrands.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                            Onay bekleyen marka talebi bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DEALER REQUESTS */}
              <div className="admin-card glass-panel w-full" style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="card-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <Settings size={20} className="icon-blue" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Bayi SaaS Onay Talepleri</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Müşteri formları ekranına erişim için yetki veya yükseltme bekleyen bayiler.</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
                        <th style={{ padding: '10px' }}>Bayi Adı & Konum</th>
                        <th style={{ padding: '10px' }}>Talebi</th>
                        <th style={{ padding: '10px' }}>Mevcut Plan</th>
                        <th style={{ padding: '10px' }}>İstenen Plan</th>
                        <th style={{ padding: '10px' }}>Ödeme Bilgisi</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDealers.map(item => {
                        const isNew = item.saas?.status === 'PENDING_APPROVAL';
                        const requestedPlanName = isNew ? item.saas?.plan : item.saas?.pendingPlan;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                            <td style={{ padding: '12px' }}>
                              <strong>{item.name}</strong>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.district || ''}, {item.city}</div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                background: isNew ? '#e0f2fe' : '#fef3c7',
                                color: isNew ? '#0369a1' : '#b45309',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '700'
                              }}>
                                {isNew ? 'Yeni Başvuru' : 'Paket Değişikliği'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{isNew ? 'YOK' : item.saas?.plan}</td>
                            <td style={{ padding: '12px' }}>
                              <span className={`badge-saas-plan ${requestedPlanName?.toLowerCase() || 'none'}`}>
                                {requestedPlanName}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {item.saas?.paymentSender ? (
                                <div style={{ lineHeight: '1.4' }}>
                                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.saas.paymentSender}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tarih: {item.saas.paymentDate || 'N/A'}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontStyle: 'italic', fontWeight: '500' }}>Not: {item.saas.paymentNote || '-'}</div>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Ödeme Bildirimi Yok</span>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleApproveRejectDealerSaaS(item.id, 'approve')}
                                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleApproveRejectDealerSaaS(item.id, 'reject')}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', marginLeft: '6px' }}
                              >
                                Reddet
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {pendingDealers.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                            Onay bekleyen bayi talebi bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-grid animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div className="admin-card glass-panel" style={{ padding: '28px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}>
                <div className="card-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <Settings size={20} className="icon-gold" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Sistem ve Yapay Zeka Ayarları</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Banka IBAN hesap detayları ile AI (DeepSeek, Gemini, Grok) API anahtarı ayarları.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateBankSettings} className="ingest-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bankSettingsSuccess && (
                    <div className="success-alert" style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} />
                      <span>{bankSettingsSuccess}</span>
                    </div>
                  )}

                  {bankSettingsError && (
                    <div className="error-alert" style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} />
                      <span>{bankSettingsError}</span>
                    </div>
                  )}

                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--accent-gold, #d4af37)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resmi Banka Hesap Bilgileri</strong>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Banka Adı</label>
                    <input 
                      type="text" 
                      value={bankName} 
                      onChange={(e) => setBankName(e.target.value)} 
                      placeholder="Örn: Akbank" 
                      required
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Alıcı Ad Soyad / Ticari Ünvan</label>
                    <input 
                      type="text" 
                      value={bankRecipient} 
                      onChange={(e) => setBankRecipient(e.target.value)} 
                      placeholder="Örn: KolayWebci Yazılım ve Danışmanlık A.Ş." 
                      required
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>IBAN Numarası</label>
                    <input 
                      type="text" 
                      value={bankIban} 
                      onChange={(e) => setBankIban(e.target.value)} 
                      placeholder="Örn: TR98 0004 6001 5000 1234 5678 90" 
                      required
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginTop: '14px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--accent-gold, #d4af37)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🤖 Yapay Zeka (AI) Entegrasyon Ayarları</strong>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Aktif Yapay Zeka Sağlayıcısı</label>
                    <select 
                      value={aiProvider} 
                      onChange={(e) => setAiProvider(e.target.value)}
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                    >
                      <option value="deepseek">DeepSeek (Tavsiye Edilen - Akıllı Metin & Asistan)</option>
                      <option value="gemini">Google Gemini (3D Studio Görsel Üretimi)</option>
                      <option value="grok">xAI Grok (Çoklu Model)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>DeepSeek API Anahtarı (Asistan & Chat için)</label>
                    <input 
                      type="password" 
                      value={deepseekApiKey} 
                      onChange={(e) => setDeepseekApiKey(e.target.value)} 
                      placeholder="sk-..." 
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Google Gemini API Anahtarı (3D Oda Görsel Üretimi için)</label>
                    <input 
                      type="password" 
                      value={geminiApiKey} 
                      onChange={(e) => setGeminiApiKey(e.target.value)} 
                      placeholder="AIzaSy..." 
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>xAI Grok API Anahtarı</label>
                    <input 
                      type="password" 
                      value={grokApiKey} 
                      onChange={(e) => setGrokApiKey(e.target.value)} 
                      placeholder="xai-..." 
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginTop: '14px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--accent-gold, #d4af37)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔍 Fiyat Güncelleme Botu (Scrape.do Proxy)</strong>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>Scrape.do Proxy API Anahtarı</label>
                    <input 
                      type="password" 
                      value={scrapingApiKey} 
                      onChange={(e) => setScrapingApiKey(e.target.value)} 
                      placeholder="Scrape.do panelinden aldığınız token anahtarı" 
                      style={{ padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <small style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Trendyol, Hepsiburada, n11 ve diğer pazaryerlerindeki bot engellerini aşarak güncel fiyatları hatasız çekmek için Scrape.do API key gereklidir.
                    </small>
                  </div>

                  <button 
                    type="submit" 
                    disabled={bankSettingsLoading}
                    style={{ 
                      background: 'var(--accent-gold, #d4af37)', 
                      color: '#000', 
                      border: 'none', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      fontSize: '0.85rem', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      marginTop: '16px',
                      opacity: bankSettingsLoading ? 0.7 : 1
                    }}
                  >
                    {bankSettingsLoading ? 'Kaydediliyor...' : 'Tüm Sistem Ayarlarını Kaydet'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* TAB 4.5: B2B PROJECT DEMANDS */}
      {activeTab === 'projects' && (
        <div className="admin-card glass-panel w-full animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#ffffff', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div className="card-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <Building2 size={24} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>B2B Proje & Toplu Seramik Talepleri</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                İnşaat firmaları, müteahhitler ve mimarların projeleri için oluşturduğu toplu seramik alım ihaleleri ve talepleri.
              </p>
            </div>
          </div>

          <div className="table-responsive" style={{ marginTop: '12px', overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '12px', fontWeight: '700' }}>Firma & Yetkili</th>
                  <th style={{ padding: '12px', fontWeight: '700' }}>Proje Detayı & Konum</th>
                  <th style={{ padding: '12px', fontWeight: '700' }}>Miktar & Bütçe</th>
                  <th style={{ padding: '12px', fontWeight: '700' }}>Teknik Tercihler</th>
                  <th style={{ padding: '12px', fontWeight: '700' }}>Tarih</th>
                  <th style={{ padding: '12px', fontWeight: '700' }}>Durum</th>
                  <th style={{ padding: '12px', fontWeight: '700', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#0f172a' }}>{p.companyName}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '2px' }}>{p.contactName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.contactPhone}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.contactEmail}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#0f172a' }}>{p.projectName}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>{p.projectType} • {p.constructionStep}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.city} / {p.district}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{p.quantityM2.toLocaleString('tr-TR')} m²</span>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px', fontWeight: '600' }}>{p.budgetM2.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Süre: {p.deliveryTimeline}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.78rem', maxWidth: '240px' }}>
                      <div style={{ marginBottom: '2px' }}>Tarz: <strong style={{ color: '#475569' }}>{p.ceramicStyles}</strong></div>
                      <div style={{ marginBottom: '2px' }}>Ebat: <strong style={{ color: '#475569' }}>{p.ceramicSizes}</strong></div>
                      {p.ceramicFinishes && <div style={{ marginBottom: '2px' }}>Yüzey: <strong style={{ color: '#475569' }}>{p.ceramicFinishes}</strong></div>}
                      {p.ceramicColors && <div style={{ marginBottom: '2px' }}>Renk: <strong style={{ color: '#475569' }}>{p.ceramicColors}</strong></div>}
                      <div>Alan: <strong style={{ color: '#475569' }}>{p.usageAreas}</strong></div>
                      {p.notes && <div style={{ marginTop: '4px', padding: '4px 6px', background: '#f8fafc', borderRadius: '4px', fontSize: '0.72rem', fontStyle: 'italic', borderLeft: '2px solid #cbd5e1' }}>Not: {p.notes}</div>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(p.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        display: 'inline-block',
                        background: p.status === 'APPROVED' ? '#e6f7ed' : p.status === 'COMPLETED' ? '#e0f2fe' : p.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                        color: p.status === 'APPROVED' ? '#10b981' : p.status === 'COMPLETED' ? '#0284c7' : p.status === 'REJECTED' ? '#ef4444' : '#d97706',
                        border: '1px solid ' + (p.status === 'APPROVED' ? '#a7f3d0' : p.status === 'COMPLETED' ? '#bae6fd' : p.status === 'REJECTED' ? '#fca5a5' : '#fde68a')
                      }}>
                        {p.status === 'PENDING' ? 'İncelemede' : p.status === 'APPROVED' ? 'Onaylandı' : p.status === 'COMPLETED' ? 'Tamamlandı' : 'Reddedildi'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap', maxWidth: '160px', marginLeft: 'auto' }}>
                        {p.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateProjectStatus(p.id, 'APPROVED')}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.opacity = '0.9'}
                            onMouseOut={(e) => e.target.style.opacity = '1'}
                          >
                            Onayla
                          </button>
                        )}
                        {p.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateProjectStatus(p.id, 'COMPLETED')}
                            style={{
                              background: '#0284c7',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Kapat
                          </button>
                        )}
                        {p.status !== 'REJECTED' && p.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateProjectStatus(p.id, 'REJECTED')}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Reddet
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontStyle: 'italic' }}>
                      Henüz oluşturulmuş proje talebi bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MANUAL PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Sub-tab Navigation */}
          <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '10px 16px', borderRadius: 'var(--border-radius-sm)', background: '#ffffff', border: '1px solid var(--border-color)', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className={`admin-subtab-btn ${productSubTab === 'list' ? 'active' : ''}`}
                onClick={() => setProductSubTab('list')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: productSubTab === 'list' ? 'var(--text-primary)' : 'transparent',
                  color: productSubTab === 'list' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={14} />
                <span>Kayıtlı Ürün Listesi ({adminProductsTotal})</span>
              </button>
              <button 
                type="button" 
                className={`admin-subtab-btn ${productSubTab === 'form' ? 'active' : ''}`}
                onClick={handleNewProductClick}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: productSubTab === 'form' ? 'var(--text-primary)' : 'transparent',
                  color: productSubTab === 'form' ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={14} />
                <span>{productFormMode === 'edit' ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</span>
              </button>
            </div>
            
            {productSubTab === 'list' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={adminProductsSearch}
                  onChange={(e) => {
                    setAdminProductsSearch(e.target.value);
                    loadAdminProducts(1, e.target.value);
                  }}
                  placeholder="SKU veya isim ara..."
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%', maxWidth: '180px' }}
                />
              </div>
            )}
          </div>

          {productSubTab === 'list' ? (
            <div className="admin-card glass-panel w-full">
              {/* Filters Panel */}
              <div className="admin-filters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.65rem' }}>Marka Filtresi</label>
                  <select 
                    value={adminProductsFilterBrand}
                    onChange={(e) => setAdminProductsFilterBrand(e.target.value)}
                    className="form-select"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <option value="">Tüm Markalar</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.65rem' }}>Stil Filtresi</label>
                  <select 
                    value={adminProductsFilterStyle}
                    onChange={(e) => setAdminProductsFilterStyle(e.target.value)}
                    className="form-select"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <option value="">Tüm Stiller</option>
                    {['Mermer', 'Beton', 'Ahşap', 'Taş'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.65rem' }}>Yüzey Filtresi</label>
                  <select 
                    value={adminProductsFilterFinish}
                    onChange={(e) => setAdminProductsFilterFinish(e.target.value)}
                    className="form-select"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  >
                    <option value="">Tüm Yüzeyler</option>
                    {['Mat', 'Parlak', 'Lapatto'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Table */}
              {isLoadingAdminProducts ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
                  <Loader2 size={32} className="animate-spin text-gold" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ürünler yükleniyor...</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Görsel</th>
                        <th>Ürün Adı</th>
                        <th>SKU Kodu</th>
                        <th>Marka</th>
                        <th>Ebat (cm)</th>
                        <th>Stil / Yüzey</th>
                        <th>Kullanım Alanı</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.map(p => (
                        <tr key={p.id}>
                          <td>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={p.imageUrl || '/textures/calacatta_gold.jpg'} 
                              alt={p.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            />
                          </td>
                          <td>
                            <strong>{p.name}</strong>
                            {p.isPremium && <span style={{ marginLeft: '6px', fontSize: '0.6rem', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>PREMIUM</span>}
                          </td>
                          <td><code>{p.code}</code></td>
                          <td><span className="badge-brand">{p.brand?.name}</span></td>
                          <td>{p.width} x {p.height}</td>
                          <td>{p.style} / {p.finish}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', maxWidth: '160px' }}>
                              {p.area.split(',').map((a, idx) => (
                                <span key={idx} style={{ fontSize: '0.62rem', background: '#f1f5f9', color: '#475569', padding: '1px 4px', borderRadius: '2px' }}>{a}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => handleEditProductClick(p)} 
                                className="btn-action-approve"
                                style={{
                                  padding: '5px',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Düzenle"
                              >
                                <Settings size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)} 
                                className="btn-action-delete"
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {adminProducts.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Filtrelere uygun seramik ürünü bulunamadı.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {adminProductsTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
                  <button 
                    disabled={adminProductsPage <= 1}
                    onClick={() => loadAdminProducts(adminProductsPage - 1)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Önceki
                  </button>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Sayfa {adminProductsPage} / {adminProductsTotalPages}
                  </span>
                  <button 
                    disabled={adminProductsPage >= adminProductsTotalPages}
                    onClick={() => loadAdminProducts(adminProductsPage + 1)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Product Add/Edit Form */
            <div className="admin-card glass-panel w-full" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div className="card-header">
                <Plus size={20} className="icon-gold" />
                <div>
                  <h3>{productFormMode === 'edit' ? 'Seramik Ürününü Düzenle' : 'Manuel Yeni Seramik Ekle'}</h3>
                  <p>Arama motorunda ve 3D Sanal Stüdyo kaplama modülünde gösterilecek seramik teknik detaylarını girin.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProduct} className="ingest-form">
                {productSuccess && (
                  <div className="success-alert">
                    <CheckCircle size={18} />
                    <span>{productSuccess}</span>
                  </div>
                )}

                {productError && (
                  <div className="error-alert">
                    <AlertCircle size={18} />
                    <span>{productError}</span>
                  </div>
                )}

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Ürün Adı *</label>
                    <input 
                      type="text" 
                      value={manualName} 
                      onChange={(e) => setManualName(e.target.value)} 
                      required 
                      placeholder="Örn: Borneo Antrasit"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>SKU Ürün Kodu *</label>
                    <input 
                      type="text" 
                      value={manualCode} 
                      onChange={(e) => setManualCode(e.target.value)} 
                      required 
                      placeholder="Örn: BIEN-BOR-ANT"
                      className="form-input"
                      disabled={productFormMode === 'edit'}
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Üretici Marka *</label>
                    <select 
                      value={manualBrandId} 
                      onChange={(e) => setManualBrandId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Premium Ürün mü?</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        id="manualIsPremiumInput"
                        checked={manualIsPremium} 
                        onChange={(e) => setManualIsPremium(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="manualIsPremiumInput" style={{ cursor: 'pointer', textTransform: 'none', fontWeight: '500', fontSize: '0.8rem' }}>Evet, bu bir lüks premium üründür.</label>
                    </div>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Genişlik (cm) *</label>
                    <input 
                      type="number" 
                      value={manualWidth} 
                      onChange={(e) => setManualWidth(e.target.value)} 
                      required 
                      placeholder="60"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Yükseklik (cm) *</label>
                    <input 
                      type="number" 
                      value={manualHeight} 
                      onChange={(e) => setManualHeight(e.target.value)} 
                      required 
                      placeholder="120"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Seramik Rengi *</label>
                    <input 
                      type="text" 
                      value={manualColor} 
                      onChange={(e) => setManualColor(e.target.value)} 
                      required 
                      placeholder="Antrasit, Beyaz, Gri..."
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Yüzey Kaplaması *</label>
                    <select 
                      value={manualFinish} 
                      onChange={(e) => setManualFinish(e.target.value)}
                      required
                      className="form-select"
                    >
                      <option value="Mat">Mat</option>
                      <option value="Parlak">Parlak</option>
                      <option value="Lapatto">Lapatto</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Stil Kategorisi *</label>
                    <select 
                      value={manualStyle} 
                      onChange={(e) => setManualStyle(e.target.value)}
                      required
                      className="form-select"
                    >
                      <option value="Mermer">Mermer</option>
                      <option value="Beton">Beton</option>
                      <option value="Ahşap">Ahşap</option>
                      <option value="Taş">Taş</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Kullanım Alanları *</label>
                    <input 
                      type="text" 
                      value={manualArea} 
                      onChange={(e) => setManualArea(e.target.value)} 
                      required 
                      placeholder="Yer,Duvar,Banyo,Mutfak..."
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Küçük Önizleme Görseli</label>
                    <input 
                      type="file" 
                      id="manualImageInput"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image')}
                      className="form-input"
                      style={{ padding: '8px' }}
                    />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Katalog aramada görünecek küçük resim (Seçilmezse stilin varsayılanı atanır).
                    </div>
                  </div>
                  <div className="form-group">
                    <label>3D Doku Kaplanacak Görsel</label>
                    <input 
                      type="file" 
                      id="manualTextureInput"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'texture')}
                      className="form-input"
                      style={{ padding: '8px' }}
                    />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      3D stüdyoda zemine/duvara perspektif döşenecek yüksek kaliteli doku (Seamless).
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>Pazaryeri & Yapı Market Fiyat Entegrasyonu (İsteğe Bağlı)</h4>
                  
                  <div className="form-group-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group">
                      <label>Trendyol Fiyatı (TL/m²)</label>
                      <input 
                        type="number" 
                        value={manualTrendyolPrice} 
                        onChange={(e) => setManualTrendyolPrice(e.target.value)} 
                        placeholder="Örn: 584"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Trendyol Ürün Linki</label>
                      <input 
                        type="url" 
                        value={manualTrendyolUrl} 
                        onChange={(e) => setManualTrendyolUrl(e.target.value)} 
                        placeholder="https://www.trendyol.com/..."
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group">
                      <label>Hepsiburada Fiyatı (TL/m²)</label>
                      <input 
                        type="number" 
                        value={manualHepsiburadaPrice} 
                        onChange={(e) => setManualHepsiburadaPrice(e.target.value)} 
                        placeholder="Örn: 610"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Hepsiburada Ürün Linki</label>
                      <input 
                        type="url" 
                        value={manualHepsiburadaUrl} 
                        onChange={(e) => setManualHepsiburadaUrl(e.target.value)} 
                        placeholder="https://www.hepsiburada.com/..."
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group">
                      <label>n11 Fiyatı (TL/m²)</label>
                      <input 
                        type="number" 
                        value={manualN11Price} 
                        onChange={(e) => setManualN11Price(e.target.value)} 
                        placeholder="Örn: 597"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>n11 Ürün Linki</label>
                      <input 
                        type="url" 
                        value={manualN11Url} 
                        onChange={(e) => setManualN11Url(e.target.value)} 
                        placeholder="https://www.n11.com/..."
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group">
                      <label>Koçtaş Fiyatı (TL/m²)</label>
                      <input 
                        type="number" 
                        value={manualKoctasPrice} 
                        onChange={(e) => setManualKoctasPrice(e.target.value)} 
                        placeholder="Örn: 643"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Koçtaş Ürün Linki</label>
                      <input 
                        type="url" 
                        value={manualKoctasUrl} 
                        onChange={(e) => setManualKoctasUrl(e.target.value)} 
                        placeholder="https://www.koctas.com.tr/..."
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group">
                      <label>Bauhaus Fiyatı (TL/m²)</label>
                      <input 
                        type="number" 
                        value={manualBauhausPrice} 
                        onChange={(e) => setManualBauhausPrice(e.target.value)} 
                        placeholder="Örn: 669"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bauhaus Ürün Linki</label>
                      <input 
                        type="url" 
                        value={manualBauhausUrl} 
                        onChange={(e) => setManualBauhausUrl(e.target.value)} 
                        placeholder="https://www.bauhaus.com.tr/..."
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary flex-center-btn"
                    style={{ flex: 2 }}
                    disabled={isSavingProduct}
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>{productFormMode === 'edit' ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet & Ekle'}</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setProductSubTab('list')}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    İptal Et
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BRAND USER ACCOUNTS */}
      {activeTab === 'brands' && (
        <div className="admin-card glass-panel w-full animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#ffffff', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div className="card-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <Building2 size={24} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Marka Kullanıcı Hesapları</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Fabrika yetkililerinin B2B Marka Portalı&apos;na giriş yaparken kullanacağı kullanıcı adı ve şifre bilgilerini yönetin.
              </p>
            </div>
          </div>

          {brandActionSuccess && (
            <div style={{ padding: '12px 16px', background: 'rgba(5, 150, 105, 0.08)', color: 'var(--accent-green)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
              {brandActionSuccess}
            </div>
          )}

          {brandActionError && (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
              {brandActionError}
            </div>
          )}

          {editingBrandId ? (
            // Edit Mode Form
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '700' }}>
                {adminBrands.find(b => b.id === editingBrandId)?.name || 'Marka'} Hesabını Düzenle
              </h4>
              <form onSubmit={handleSaveBrandCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Kullanıcı Adı</label>
                    <input 
                      type="text"
                      value={editingUsername}
                      onChange={(e) => setEditingUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      required
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Şifre</label>
                    <input 
                      type="text"
                      value={editingPassword}
                      onChange={(e) => setEditingPassword(e.target.value)}
                      required
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={brandActionLoading} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                    {brandActionLoading ? 'Kaydediliyor...' : 'Güncelle ve Kaydet'}
                  </button>
                  <button type="button" onClick={() => setEditingBrandId('')} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                    İptal Et
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Marka Adı</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Kullanıcı Adı</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Giriş Şifresi</th>
                  <th style={{ textAlign: 'center', padding: '12px', width: '120px' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {adminBrands.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Yükleniyor veya kayıtlı marka bulunamadı.</td>
                  </tr>
                ) : (
                  adminBrands.map((b) => {
                    const isPasswordVisible = visiblePasswordId === b.id;
                    return (
                      <tr key={b.id}>
                        <td style={{ padding: '12px', fontWeight: '700' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {b.logoUrl && (
                              <img src={b.logoUrl} alt={b.name} style={{ height: '24px', maxWidth: '60px', objectFit: 'contain', background: '#f8fafc', padding: '2px', borderRadius: '4px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            )}
                            <span>{b.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0f172a' }}>
                          {b.username || <em style={{ color: '#94a3b8' }}>Tanımlanmamış</em>}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                          {b.password ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{isPasswordVisible ? b.password : '••••••••'}</span>
                              <button 
                                type="button"
                                onClick={() => setVisiblePasswordId(isPasswordVisible ? '' : b.id)}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}
                              >
                                {isPasswordVisible ? 'Gizle' : 'Göster'}
                              </button>
                            </div>
                          ) : (
                            <em style={{ color: '#94a3b8' }}>Tanımlanmamış</em>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBrandId(b.id);
                              setEditingUsername(b.username || '');
                              setEditingPassword(b.password || '');
                              setBrandActionSuccess('');
                              setBrandActionError('');
                            }}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: '600', borderRadius: '4px' }}
                          >
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: SPONSORLU REKLAM KAMPANYALARI */}
      {activeTab === 'campaigns' && (
        <div className="admin-card glass-panel w-full animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#ffffff', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div className="card-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Sparkles size={24} style={{ color: '#d4af37' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Sponsorlu Reklam & Vitrin Başvuruları</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Markaların ana sayfada öne çıkmak için havale ile yaptığı reklam süre başvurularını yönetin ve onaylayın.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Onay Bekleyenler</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>
                {campaigns.filter(c => c.status === 'PENDING_APPROVAL').length}
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Aktif Yayında Olanlar</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                {campaigns.filter(c => c.status === 'ACTIVE' && (!c.expiresAt || new Date(c.expiresAt) > new Date())).length}
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Toplam Toplanan Gelir</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                {campaigns.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.price : 0), 0).toLocaleString('tr-TR')} TL
              </div>
            </div>
          </div>

          {campaignsLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
              <Loader2 className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
              <span>Reklam başvuruları yükleniyor...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
              Hiç reklam başvurusu bulunmamaktadır.
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px' }}>Marka</th>
                    <th style={{ padding: '12px' }}>Hedef Ürün</th>
                    <th style={{ padding: '12px' }}>Süre</th>
                    <th style={{ padding: '12px' }}>Tutar</th>
                    <th style={{ padding: '12px' }}>Dekont No</th>
                    <th style={{ padding: '12px' }}>Tarihler</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Durum</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(camp => {
                    const isExpired = camp.expiresAt && new Date(camp.expiresAt) < new Date();
                    
                    let statusLabel = 'Onay Bekliyor';
                    let statusColor = '#d97706';
                    let statusBg = '#fffbeb';

                    if (isExpired) {
                      statusLabel = 'Süresi Dolmuş';
                      statusColor = '#64748b';
                      statusBg = '#f1f5f9';
                    } else if (camp.status === 'ACTIVE') {
                      statusLabel = 'Yayında';
                      statusColor = '#10b981';
                      statusBg = '#ecfdf5';
                    } else if (camp.status === 'REJECTED') {
                      statusLabel = 'Reddedildi';
                      statusColor = '#ef4444';
                      statusBg = '#fef2f2';
                    } else if (camp.status === 'PAUSED') {
                      statusLabel = 'Durduruldu';
                      statusColor = '#4b5563';
                      statusBg = '#f3f4f6';
                    }

                    return (
                      <tr key={camp.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                        <td style={{ padding: '12px', fontWeight: '700' }}>{camp.brand?.name}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {camp.product?.imageUrl && (
                              <img src={camp.product.imageUrl} alt={camp.product.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                            )}
                            <div>
                              <div>{camp.product?.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Kod: {camp.product?.code}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{camp.durationDays} Gün</td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#10b981' }}>{camp.price} TL</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{camp.paymentRef || '-'}</td>
                        <td style={{ padding: '12px', fontSize: '0.75rem', color: '#475569' }}>
                          {camp.expiresAt ? (
                            <>
                              <div>Başlangıç: {new Date(camp.updatedAt).toLocaleDateString('tr-TR')}</div>
                              <div>Bitiş: {new Date(camp.expiresAt).toLocaleDateString('tr-TR')}</div>
                            </>
                          ) : (
                            <em style={{ color: '#94a3b8' }}>Aktif değil</em>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.7rem', background: statusBg, color: statusColor, padding: '4px 8px', borderRadius: '20px', fontWeight: '700', display: 'inline-block' }}>
                            {statusLabel}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {camp.status === 'PENDING_APPROVAL' && (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleCampaignAction(camp.id, 'approve')}
                                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleCampaignAction(camp.id, 'reject')}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Reddet
                              </button>
                            </div>
                          )}
                          {camp.status === 'ACTIVE' && !isExpired && (
                            <button
                              onClick={() => handleCampaignAction(camp.id, 'cancel')}
                              style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                            >
                              Yayını Durdur
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 🏆 PODIUM AUCTION MANAGEMENT PANEL */}
          <div style={{ marginTop: '24px', borderTop: '2px dashed #e2e8f0', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: '#d4af37' }} />
                  Haftalık Podyum İhale Kontrol Yönetimi
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Markaların ana sayfa açılışında pop-up olarak yayınlanan Podyum Vitrini için verdiği haftalık teklifleri yönetin.
                </p>
              </div>

              <button
                onClick={loadAdminPodiumBids}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Yenile
              </button>
            </div>

            {adminPodiumLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                <Loader2 className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                <span>Podyum teklifleri yükleniyor...</span>
              </div>
            ) : adminPodiumBids.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px', fontSize: '0.84rem' }}>
                Henüz podyum reklam ihalesine verilmiş hiçbir teklif bulunmamaktadır.
              </div>
            ) : (
              <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#090d16', color: '#cbd5e1', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Hafta / Yıl</th>
                      <th style={{ padding: '12px' }}>Marka</th>
                      <th style={{ padding: '12px' }}>Hedef Ürün</th>
                      <th style={{ padding: '12px' }}>Slogan / Başlık</th>
                      <th style={{ padding: '12px' }}>Teklif Tutarı</th>
                      <th style={{ padding: '12px' }}>Dekont No</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Durum</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPodiumBids.map(bid => {
                      let statusTag = { label: 'Onay Bekliyor', bg: '#fef3c7', color: '#d97706' };
                      if (bid.status === 'WINNER_ACTIVE') statusTag = { label: '🏆 Kazanan (Aktif Podyumda)', bg: '#dcfce7', color: '#15803d' };
                      if (bid.status === 'OUTBID') statusTag = { label: '⚠️ Geçildi', bg: '#ffedd5', color: '#c2410c' };
                      if (bid.status === 'REJECTED') statusTag = { label: '❌ Reddedildi', bg: '#fee2e2', color: '#b91c1c' };

                      return (
                        <tr key={bid.id} style={{ borderBottom: '1px solid #e2e8f0', background: bid.status === 'WINNER_ACTIVE' ? '#f0fdf4' : 'transparent' }}>
                          <td style={{ padding: '12px', fontWeight: '800' }}>Hafta {bid.weekNumber} ({bid.year})</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>{bid.brand?.name}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {bid.product?.imageUrl && (
                                <img 
                                  src={bid.product.imageUrl} 
                                  alt={bid.product.name} 
                                  style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src = '/textures/concrete_light_grey.jpg'; }} 
                                />
                              )}
                              <div>
                                <div>{bid.product?.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Kod: {bid.product?.code}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>{bid.title || '-'}</td>
                          <td style={{ padding: '12px', fontWeight: '900', color: '#d4af37', fontSize: '0.9rem' }}>
                            ₺{bid.bidAmount.toLocaleString('tr-TR')}
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace' }}>{bid.paymentRef || '-'}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.7rem', background: statusTag.bg, color: statusTag.color, padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
                              {statusTag.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {bid.status !== 'WINNER_ACTIVE' && (
                                <button
                                  onClick={() => handleAdminPodiumAction(bid.id, 'APPROVE')}
                                  style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '800' }}
                                >
                                  Podyumu Onayla & Yayınla
                                </button>
                              )}
                              {bid.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleAdminPodiumAction(bid.id, 'REJECT')}
                                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '700' }}
                                >
                                  Reddet
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: CORPORATE PAGES MANAGEMENT */}
      {activeTab === 'pages' && (
        <div className="admin-card glass-panel w-full animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#ffffff', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div className="card-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FileText size={24} style={{ color: 'var(--accent-gold)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Kurumsal Sayfa İçerik Yönetimi</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Hakkımızda, İletişim, SSS, İlham Galerisi, Blog ve Yasal metinlerin içeriklerini dinamik olarak düzenleyin.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
            {[
              { id: 'about', label: 'Hakkımızda' },
              { id: 'contact', label: 'İletişim & SSS' },
              { id: 'blog', label: 'İlham & Blog' },
              { id: 'legal', label: 'Yasal Metinler' }
            ].map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setPageManagerSubTab(sub.id);
                  setPageSettingsSuccess('');
                  setPageSettingsError('');
                }}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: pageManagerSubTab === sub.id ? 'var(--accent-gold, #d4af37)' : 'transparent',
                  color: pageManagerSubTab === sub.id ? '#000' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleUpdatePageSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pageSettingsSuccess && (
              <div style={{ padding: '12px 16px', background: 'rgba(5, 150, 105, 0.08)', color: 'var(--accent-green)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                {pageSettingsSuccess}
              </div>
            )}

            {pageSettingsError && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                {pageSettingsError}
              </div>
            )}

            {/* Sub-tab 1: About Us */}
            {pageManagerSubTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Hero Başlığı</label>
                  <input 
                    type="text" 
                    value={pageAboutHeroTitle} 
                    onChange={(e) => setPageAboutHeroTitle(e.target.value)} 
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Hero Alt Başlık / Giriş Paragrafı</label>
                  <textarea 
                    value={pageAboutHeroSubtitle} 
                    onChange={(e) => setPageAboutHeroSubtitle(e.target.value)} 
                    rows={3}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>
                <div className="form-group-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Vizyonumuz</label>
                    <textarea 
                      value={pageAboutVision} 
                      onChange={(e) => setPageAboutVision(e.target.value)} 
                      rows={5}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', resize: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Misyonumuz</label>
                    <textarea 
                      value={pageAboutMission} 
                      onChange={(e) => setPageAboutMission(e.target.value)} 
                      rows={5}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', resize: 'none' }}
                    />
                  </div>
                </div>

                {/* About Stats management */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '800' }}>İstatistik Sayaçları</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {pageAboutStats && pageAboutStats.map((stat, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>Sayaç {idx + 1}</div>
                        <input 
                          type="text" 
                          value={stat.num} 
                          placeholder="Değer (örn: 100+)"
                          onChange={(e) => handleUpdateStat(idx, 'num', e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                        />
                        <input 
                          type="text" 
                          value={stat.label} 
                          placeholder="Etiket (örn: Markalar)"
                          onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Contact & FAQs */}
            {pageManagerSubTab === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Müşteri Hizmetleri Telefonu</label>
                    <input 
                      type="text" 
                      value={pageContactPhone} 
                      onChange={(e) => setPageContactPhone(e.target.value)} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>WhatsApp Destek Numarası</label>
                    <input 
                      type="text" 
                      value={pageContactWhatsapp} 
                      onChange={(e) => setPageContactWhatsapp(e.target.value)} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <div className="form-group-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Destek E-Posta Adresi</label>
                    <input 
                      type="email" 
                      value={pageContactEmail} 
                      onChange={(e) => setPageContactEmail(e.target.value)} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Merkez Ofis Adresi</label>
                    <textarea 
                      value={pageContactAddress} 
                      onChange={(e) => setPageContactAddress(e.target.value)} 
                      rows={2}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', resize: 'none' }}
                    />
                  </div>
                </div>

                {/* FAQ Manager */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: '800' }}>Sıkça Sorulan Sorular (SSS) Yönetimi</h4>
                  
                  {/* List of existing FAQs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {pageFaqList && pageFaqList.map((faq, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Soru: {faq.q}</div>
                          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>Cevap: {faq.a}</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteFaq(idx)} 
                          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Sil
                        </button>
                      </div>
                    ))}
                    {(!pageFaqList || pageFaqList.length === 0) && <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Kayıtlı soru bulunmuyor.</p>}
                  </div>

                  {/* Add FAQ Sub-form */}
                  <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569' }}>Yeni Soru Ekle</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={newFaqQ} 
                        placeholder="Soru metni..."
                        onChange={(e) => setNewFaqQ(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <textarea 
                        value={newFaqA} 
                        placeholder="Cevap metni..."
                        rows={2}
                        onChange={(e) => setNewFaqA(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', resize: 'none' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddFaq}
                      style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', alignSelf: 'flex-start', cursor: 'pointer' }}
                    >
                      Soru Listesine Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Inspiration & Blogs */}
            {pageManagerSubTab === 'blog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. ILHAM GALLERY MANAGEMENT */}
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                    🎨 İlham Galerisi & Stil Kombinasyonları Yönetimi
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>
                    /ilham sayfasının üst kısmında görüntülenen ilham görsellerini, stillerini ve açıklamalarını buradan yönetin.
                  </p>

                  {/* List of İlham Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    {pageIlhamList && pageIlhamList.map((item, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '130px', background: '#e2e8f0', position: 'relative' }}>
                          <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                            {item.tag || 'Stil'}
                          </span>
                        </div>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{item.title}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#b38e47', fontWeight: '700' }}>Stil: {item.style}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteIlham(idx)}
                              style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!pageIlhamList || pageIlhamList.length === 0) && (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', gridColumn: '1/-1' }}>Kayıtlı ilham görseli bulunmuyor.</p>
                    )}
                  </div>

                  {/* Add New İlham Card Form */}
                  <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>✨ Yeni İlham Kartı Ekle</div>
                    
                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Başlık</label>
                        <input
                          type="text"
                          value={newIlhamTitle}
                          placeholder="Örn: İskandinav Ahşap Zarafeti"
                          onChange={(e) => setNewIlhamTitle(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Açıklama</label>
                        <input
                          type="text"
                          value={newIlhamDesc}
                          placeholder="Örn: Banyo ve mutfaklarda doğal doku."
                          onChange={(e) => setNewIlhamDesc(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Stil Filtresi</label>
                        <input
                          type="text"
                          value={newIlhamStyle}
                          placeholder="Örn: Ahşap, Mermer, Beton"
                          onChange={(e) => setNewIlhamStyle(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Rozet Etiketi (Tag)</label>
                        <input
                          type="text"
                          value={newIlhamTag}
                          placeholder="Örn: Minimalist, Premium Luxury, Modern"
                          onChange={(e) => setNewIlhamTag(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Görsel (Cihazdan Yükleyin veya URL Girin)</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newIlhamImg}
                          placeholder="Görsel URL (veya aşağıdaki butonla cihazınızdan seçin)"
                          onChange={(e) => setNewIlhamImg(e.target.value)}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                        <label style={{ background: '#3b82f6', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {uploadingIlhamImg ? 'Yükleniyor...' : '📁 Görsel Yükle'}
                          <input type="file" accept="image/*" onChange={handleIlhamImageUpload} disabled={uploadingIlhamImg} style={{ display: 'none' }} />
                        </label>
                      </div>
                      {newIlhamImg && (
                        <div style={{ marginTop: '6px', height: '60px', width: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <img src={newIlhamImg} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddIlham}
                      style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', alignSelf: 'flex-start', cursor: 'pointer', marginTop: '4px' }}
                    >
                      ➕ İlham Kartını Listeye Ekle
                    </button>
                  </div>
                </div>

                {/* 2. BLOG ARTICLES MANAGEMENT */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>📖 Blog & Teknik Rehber Yazıları Yönetimi</h4>
                
                {/* List of articles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {pageBlogList && pageBlogList.map((blog) => (
                    <div key={blog.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ background: 'rgba(179, 142, 71, 0.1)', color: '#8c6b30', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{blog.category}</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{blog.readTime}</span>
                        </div>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{blog.title}</h5>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{blog.summary}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteBlog(blog.id)} 
                        style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                  {(!pageBlogList || pageBlogList.length === 0) && <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Kayıtlı blog yazısı bulunmuyor.</p>}
                </div>

                {/* Add Blog Form */}
                <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>Yeni Blog Yazısı Ekle</div>
                  <div className="form-group-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Yazı Başlığı</label>
                      <input 
                        type="text" 
                        value={newBlogTitle} 
                        placeholder="Örn: Rektifiyeli Seramik Avantajları"
                        onChange={(e) => setNewBlogTitle(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Kategori</label>
                      <input 
                        type="text" 
                        value={newBlogCategory} 
                        placeholder="Örn: Teknik Rehber, Trendler"
                        onChange={(e) => setNewBlogCategory(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Okuma Süresi</label>
                      <input 
                        type="text" 
                        value={newBlogReadTime} 
                        placeholder="Örn: 4 dk okuma"
                        onChange={(e) => setNewBlogReadTime(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Kısa Özet (Summary)</label>
                      <input 
                        type="text" 
                        value={newBlogSummary} 
                        placeholder="Listeleme sayfasında görünecek kısa açıklama..."
                        onChange={(e) => setNewBlogSummary(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Yazı Detay İçeriği (HTML formatında)</label>
                    <textarea 
                      value={newBlogContent} 
                      placeholder="<h3>Başlık</h3><p>Paragraf yazısı...</p>"
                      rows={5}
                      onChange={(e) => setNewBlogContent(e.target.value)} 
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontFamily: 'monospace', resize: 'none' }}
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddBlog}
                    style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', alignSelf: 'flex-start', cursor: 'pointer' }}
                  >
                    Yazıyı Listeye Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* Sub-tab 4: Legal documents */}
            {pageManagerSubTab === 'legal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>KVKK ve Gizlilik Politikası Metni (HTML formatında)</label>
                  <textarea 
                    value={pageYasalKvkk} 
                    onChange={(e) => setPageYasalKvkk(e.target.value)} 
                    rows={6}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Kullanım Koşulları Metni (HTML formatında)</label>
                  <textarea 
                    value={pageYasalKullanim} 
                    onChange={(e) => setPageYasalKullanim(e.target.value)} 
                    rows={6}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Çerez Politikası Metni (HTML formatında)</label>
                  <textarea 
                    value={pageYasalCerez} 
                    onChange={(e) => setPageYasalCerez(e.target.value)} 
                    rows={6}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '750' }}>Bayi Üyelik Sözleşmesi Metni (HTML formatında)</label>
                  <textarea 
                    value={pageYasalBayiSozlesme} 
                    onChange={(e) => setPageYasalBayiSozlesme(e.target.value)} 
                    rows={6}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'none' }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={pageSettingsLoading}
              style={{
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-hover) 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(179,142,71,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px',
                width: 'fit-content',
                opacity: pageSettingsLoading ? 0.7 : 1
              }}
            >
              {pageSettingsLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <span>Kurumsal Değişiklikleri Canlıya Al</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Installers Management & Approval */}
      {activeTab === 'installers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={22} style={{ color: '#d4af37' }} />
                <span>Seramik Ustaları Yönetimi & Onay Paneli</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Kullanıcıların başvurduğu seramik ustası ve uygulayıcı ekipleri onaylayın, bilgileri güncelleyin veya silin.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={adminInstallerFilter}
                onChange={(e) => {
                  setAdminInstallerFilter(e.target.value);
                  setTimeout(() => loadAdminInstallers(), 50);
                }}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '600' }}
              >
                <option value="ALL">Tüm Ustalar ({installerStats.total})</option>
                <option value="PENDING">Onay Bekleyenler ({installerStats.pending})</option>
                <option value="VERIFIED">Onaylı Ustalar ({installerStats.verified})</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>Toplam Kayıtlı Usta</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a' }}>{installerStats.total} Usta</span>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626', display: 'block', marginBottom: '4px' }}>⏳ Onay Bekleyen Başvurular</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ef4444' }}>{installerStats.pending} Başvuru</span>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857', display: 'block', marginBottom: '4px' }}>✅ Onaylı Rehber Ustaları</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#059669' }}>{installerStats.verified} Usta</span>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Kayıtlı Seramik Ustaları Listesi
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {adminInstallers.length} kayıt listeleniyor
              </span>
            </div>

            {adminInstallersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
                <span>Ustalar yükleniyor...</span>
              </div>
            ) : adminInstallers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Wrench size={32} style={{ margin: '0 auto 8px auto', color: '#cbd5e1' }} />
                <span>Seçili filtrede henüz kayıtlı usta bulunmuyor.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                      <th style={{ padding: '12px 10px', fontWeight: '700' }}>Usta / Firma</th>
                      <th style={{ padding: '12px 10px', fontWeight: '700' }}>İletişim</th>
                      <th style={{ padding: '12px 10px', fontWeight: '700' }}>Konum (Şehir/İlçe)</th>
                      <th style={{ padding: '12px 10px', fontWeight: '700' }}>Tecrübe & Puan</th>
                      <th style={{ padding: '12px 10px', fontWeight: '700' }}>Uzmanlık</th>
                      <th style={{ padding: '12px 10px', fontWeight: '700' }}>Durum</th>
                      <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminInstallers.map(inst => (
                      <tr key={inst.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 10px' }}>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{inst.name}</div>
                          {inst.companyName && <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{inst.companyName}</div>}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <a
                            href={`https://wa.me/${inst.phone.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#059669', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>📞 {inst.phone}</span>
                          </a>
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{ fontWeight: '700', color: '#334155' }}>{inst.city}</span>
                          {inst.district && <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>{inst.district}</span>}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: '#fef08a', color: '#854d0e', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', fontSize: '0.72rem' }}>
                              ★ {inst.rating || 5.0}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{inst.experienceYears} Yıl</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 10px', maxWidth: '200px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {inst.specialties}
                          </span>
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          {inst.verified ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={12} />
                              Onaylı Usta
                            </span>
                          ) : (
                            <span style={{ background: '#fef2f2', color: '#b91c1c', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              ⏳ Onay Bekliyor
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleToggleInstallerVerify(inst.id, inst.verified)}
                              title={inst.verified ? 'Onayı Kaldır' : 'Ustayı Onayla ve Yayınla'}
                              style={{
                                background: inst.verified ? '#f1f5f9' : '#10b981',
                                color: inst.verified ? '#475569' : '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {inst.verified ? 'Onayı Kaldır' : '✅ Onayla'}
                            </button>

                            <button
                              onClick={() => openEditInstallerModal(inst)}
                              style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              ✏️ Düzenle
                            </button>

                            <button
                              onClick={() => handleDeleteInstaller(inst.id)}
                              style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* EDIT INSTALLER MODAL */}
          {editingInstaller && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }} onClick={() => setEditingInstaller(null)}>
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                maxWidth: '500px',
                width: '100%',
                padding: '24px',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Usta Bilgilerini Düzenle</h3>
                  <button onClick={() => setEditingInstaller(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
                </div>

                <form onSubmit={handleSaveInstallerEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Adı Soyadı</label>
                    <input
                      type="text"
                      value={editInstName}
                      onChange={(e) => setEditInstName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Firma Adı</label>
                      <input
                        type="text"
                        value={editInstCompany}
                        onChange={(e) => setEditInstCompany(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Telefon</label>
                      <input
                        type="text"
                        value={editInstPhone}
                        onChange={(e) => setEditInstPhone(e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Şehir</label>
                      <input
                        type="text"
                        value={editInstCity}
                        onChange={(e) => setEditInstCity(e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>İlçe</label>
                      <input
                        type="text"
                        value={editInstDistrict}
                        onChange={(e) => setEditInstDistrict(e.target.value)}
                        style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Tecrübe (Yıl)</label>
                      <input
                        type="number"
                        value={editInstExp}
                        onChange={(e) => setEditInstExp(e.target.value)}
                        style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Uzmanlık Alanları</label>
                    <input
                      type="text"
                      value={editInstSpecialties}
                      onChange={(e) => setEditInstSpecialties(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Değerlendirme Puanı</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={editInstRating}
                        onChange={(e) => setEditInstRating(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Onay Durumu</label>
                      <select
                        value={editInstVerified ? 'true' : 'false'}
                        onChange={(e) => setEditInstVerified(e.target.value === 'true')}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      >
                        <option value="true">✅ Onaylı Usta</option>
                        <option value="false">⏳ Onay Bekliyor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Tanıtım Notu</label>
                    <textarea
                      rows={2}
                      value={editInstNotes}
                      onChange={(e) => setEditInstNotes(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={editInstLoading}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      marginTop: '6px'
                    }}
                  >
                    {editInstLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: SECURITY & BACKUP CENTER */}
      {activeTab === 'security' && (
        <SecurityBackupTab />
      )}

        </div>{/* end admin-content */}
      </div>{/* end admin-main */}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-bar">
          <button className={`bottom-btn ${activeTab === 'scraper' ? 'active' : ''}`} onClick={() => handleTabSelect('scraper')}>
            <Terminal size={18} />
            <span>Kazıma</span>
          </button>
          <button className={`bottom-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabSelect('products')}>
            <Package size={18} />
            <span>Ürünler</span>
          </button>
          <button className={`bottom-btn ${activeTab === 'dealers' ? 'active' : ''}`} onClick={() => handleTabSelect('dealers')}>
            <MapPin size={18} />
            <span>Bayiler</span>
          </button>
          <button className={`bottom-btn ${activeTab === 'saas' ? 'active' : ''}`} onClick={() => handleTabSelect('saas')}>
            <CreditCard size={18} />
            <span>SaaS</span>
          </button>
          <button className="bottom-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
            <span>Menü</span>
          </button>
        </nav>
      )}

      {/* Embedded CSS */}
      <style jsx>{`
        /* ===== LAYOUT ===== */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
          font-family: var(--font-body);
        }

        /* ===== SIDEBAR ===== */
        .admin-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid var(--border-color);
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #d4af37 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 1rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(179, 142, 71, 0.25);
        }

        .logo-text {
          font-family: var(--font-title);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          line-height: 1.2;
        }

        .system-badge {
          font-size: 0.62rem;
          color: var(--accent-gold);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: block;
        }

        .sidebar-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .sidebar-close:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }

        /* ===== SIDEBAR NAV ===== */
        .sidebar-nav {
          flex: 1;
          padding: 12px 12px;
          overflow-y: auto;
        }

        .nav-group {
          margin-bottom: 4px;
        }

        .nav-group-title {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-group-title span {
          flex: 1;
          text-align: left;
        }
        .nav-group-title:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }

        .nav-group-items {
          padding: 2px 0 6px 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px 9px 22px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.82rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          position: relative;
        }
        .nav-item span {
          flex: 1;
          text-align: left;
        }
        .nav-item:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: rgba(var(--accent-gold-rgb), 0.08);
          color: var(--accent-gold-hover);
          font-weight: 600;
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--accent-gold);
          border-radius: 0 3px 3px 0;
        }

        .nav-badge {
          background: rgba(37, 99, 235, 0.1);
          color: var(--accent-blue);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }
        .nav-badge.gold {
          background: rgba(var(--accent-gold-rgb), 0.12);
          color: var(--accent-gold);
        }

        /* ===== SIDEBAR FOOTER ===== */
        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-footer-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sidebar-footer-btn:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }
        .sidebar-footer-btn.logout {
          color: #ef4444;
        }
        .sidebar-footer-btn.logout:hover {
          background: rgba(239, 68, 68, 0.06);
        }

        /* ===== MAIN CONTENT ===== */
        .admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-dark);
        }

        /* ===== TOP BAR ===== */
        .admin-topbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 28px;
          background: #ffffff;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .hamburger-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .hamburger-btn:hover {
          background: var(--bg-input);
        }

        .topbar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .topbar-title h1 {
          font-family: var(--font-title);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .topbar-icon {
          color: var(--accent-gold);
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .topbar-user {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(5, 150, 105, 0.06);
          color: var(--accent-green);
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        /* ===== ADMIN CONTENT ===== */
        .admin-content {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ===== MOBILE BOTTOM BAR ===== */
        .mobile-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          background: #ffffff;
          border-top: 1px solid var(--border-color);
          padding: 6px 8px;
          padding-bottom: max(6px, env(safe-area-inset-bottom));
          z-index: 200;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
        }

        .bottom-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 4px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.62rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .bottom-btn.active {
          color: var(--accent-gold);
        }
        .bottom-btn:hover {
          background: var(--bg-input);
        }

        /* ===== MOBILE SIDEBAR OVERLAY ===== */
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 99;
          backdrop-filter: blur(2px);
        }

        /* ===== CARDS ===== */
        .admin-card {
          padding: 24px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }

        .card-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .icon-gold { color: var(--accent-gold); }
        .icon-blue { color: var(--accent-blue); }

        .card-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-header p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.3;
        }

        /* ===== FORMS ===== */
        .ingest-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .form-select, .form-input {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 10px 14px;
          font-size: 0.82rem;
          color: var(--text-primary);
          outline: none;
          font-family: var(--font-body);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus, .form-select:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 3px rgba(var(--accent-gold-rgb), 0.08);
        }

        /* ===== SEGMENTED CONTROLS ===== */
        .segmented-control {
          display: flex;
          background-color: var(--bg-input);
          padding: 3px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .segmented-control button {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.78rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .segmented-control button.active {
          background: #ffffff;
          color: var(--accent-gold);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        /* ===== CONSOLE ===== */
        .console-terminal {
          background: #0f172a;
          border-radius: var(--border-radius-sm);
          min-height: 280px;
          max-height: 480px;
          overflow-y: auto;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .console-empty {
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.25);
          font-family: var(--font-title);
          font-size: 0.78rem;
          letter-spacing: 0.03em;
        }

        .console-line {
          display: flex;
          gap: 10px;
          padding: 3px 0;
          font-family: 'Courier New', monospace;
          font-size: 0.72rem;
          line-height: 1.5;
        }
        .console-line .timestamp {
          color: rgba(255, 255, 255, 0.25);
          flex-shrink: 0;
        }
        .console-line .message {
          color: rgba(255, 255, 255, 0.7);
          word-break: break-all;
        }
        .console-line .message.success { color: #4ade80; }
        .console-line .message.error { color: #f87171; }
        .console-line .message.warning { color: #fbbf24; }

        /* ===== BUTTONS ===== */
        .flex-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .flex-center-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .success-alert {
          background: rgba(5, 150, 105, 0.06);
          color: var(--accent-green);
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(5, 150, 105, 0.15);
        }
        .error-alert {
          background: rgba(239, 68, 68, 0.06);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        /* ===== GRID ===== */
        .admin-grid {
          display: grid;
          grid-template-columns: 1.15fr 1.85fr;
          gap: 24px;
          align-items: start;
        }

        /* ===== TABLE ===== */
        .table-responsive {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 520px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
        }

        .admin-table th {
          background: linear-gradient(135deg, rgba(var(--accent-gold-rgb), 0.06) 0%, rgba(var(--accent-gold-rgb), 0.02) 100%);
          color: var(--text-secondary);
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .admin-table td {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .admin-table tr:hover td {
          background: rgba(0,0,0,0.015);
        }

        /* ===== BADGES ===== */
        .badge-brand {
          background: rgba(37, 99, 235, 0.06);
          color: var(--accent-blue-hover);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .badge-saas-plan {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }
        .badge-saas-plan.free { background: #e2e8f0; color: #475569; }
        .badge-saas-plan.pro { background: rgba(37, 99, 235, 0.08); color: var(--accent-blue-hover); }
        .badge-saas-plan.enterprise { background: rgba(197, 160, 89, 0.12); color: var(--accent-gold); }

        .badge-saas-status {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .badge-saas-status.active { background: rgba(5, 150, 105, 0.08); color: var(--accent-green); }
        .badge-saas-status.paused { background: rgba(217, 119, 6, 0.08); color: var(--accent-orange); }
        .badge-saas-status.expired { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

        .status-select {
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.72rem;
          outline: none;
          font-weight: 600;
        }
        .status-select.pending { color: var(--accent-orange); border-color: rgba(217, 119, 6, 0.3); }
        .status-select.responded { color: var(--accent-blue-hover); border-color: rgba(37, 99, 235, 0.3); }
        .status-select.completed { color: var(--accent-green); border-color: rgba(5, 150, 105, 0.3); }

        .btn-action-delete {
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: #ef4444;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action-delete:hover {
          background: #ef4444;
          color: #ffffff;
        }

        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            height: 100vh;
            height: 100dvh;
            z-index: 1000;
            width: 280px;
            max-width: 85vw;
            min-width: 0 !important;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-main {
            width: 100%;
            min-width: 0;
            flex: 1;
          }

          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 999;
          }

          .admin-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .admin-content {
            padding: 16px;
            padding-bottom: 84px;
            gap: 16px;
          }

          .admin-topbar {
            padding: 12px 16px;
          }

          .form-group-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .admin-topbar {
            padding: 10px 14px;
            gap: 10px;
          }

          .topbar-title h1 {
            font-size: 1rem;
          }

          .topbar-user {
            padding: 4px 10px;
            font-size: 0.72rem;
          }

          .admin-content {
            padding: 12px;
            padding-bottom: 88px;
            gap: 14px;
          }

          .admin-card {
            padding: 16px;
            border-radius: var(--border-radius-sm);
            gap: 16px;
          }

          .card-header {
            padding-bottom: 12px;
            gap: 10px;
          }

          .card-header h3 {
            font-size: 0.95rem;
          }

          .segmented-control {
            flex-wrap: wrap;
            gap: 4px;
          }

          .segmented-control button {
            padding: 6px 8px;
            font-size: 0.72rem;
            min-width: 70px;
          }

          .table-responsive {
            max-height: none;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 8px;
          }

          .admin-table th {
            padding: 10px 12px;
            font-size: 0.65rem;
            white-space: nowrap;
          }

          .admin-table td {
            padding: 8px 12px;
            font-size: 0.75rem;
            white-space: nowrap;
          }

          .form-input, .form-select {
            padding: 8px 12px;
            font-size: 0.8rem;
          }

          .console-terminal {
            min-height: 200px;
            max-height: 350px;
            padding: 12px;
          }

          .flex-btn, .flex-center-btn {
            width: 100%;
            justify-content: center;
          }

          /* Form grid fallback for inline styles on small screens */
          .admin-filters-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .admin-content {
            padding: 10px;
            padding-bottom: 90px;
          }

          .admin-card {
            padding: 14px;
          }

          .mobile-bottom-bar {
            padding: 4px 6px;
            padding-bottom: max(6px, env(safe-area-inset-bottom));
          }

          .bottom-btn {
            font-size: 0.6rem;
            padding: 4px 2px;
          }
        }
      `}</style>
      {/* DEALER CREDENTIALS & PROFILE EDIT MODAL */}
      {editingDealerModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--accent-gold)'
                }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                    Bayi Giriş Bilgileri & Şifre Güncelle
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {editingDealerName} bayisinin kullanıcı adı ve şifresini yenileyin.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingDealerModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveDealerCredentials} style={{ padding: '24px' }}>
              {dealerEditSuccess && (
                <div style={{
                  padding: '12px 16px',
                  background: '#e6f7ed',
                  color: '#10b981',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={18} />
                  <span>{dealerEditSuccess}</span>
                </div>
              )}

              {dealerEditError && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fee2e2',
                  color: '#ef4444',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} />
                  <span>{dealerEditError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Bayi / Showroom Adı
                  </label>
                  <input 
                    type="text" 
                    value={editingDealerName} 
                    onChange={(e) => setEditingDealerName(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      E-posta Adresi (Kullanıcı Adı)
                    </label>
                    <input 
                      type="email" 
                      value={editingDealerEmail} 
                      onChange={(e) => setEditingDealerEmail(e.target.value)} 
                      placeholder="ornek@bayi.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Giriş Telefonu (Kullanıcı Adı)
                    </label>
                    <input 
                      type="tel" 
                      value={editingDealerPhone} 
                      onChange={(e) => setEditingDealerPhone(e.target.value)} 
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '750', color: '#334155' }}>
                      Yeni Şifre
                    </label>
                    <button 
                      type="button" 
                      onClick={handleGenerateRandomDealerPassword}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontSize: '0.73rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ⚡ Otomatik Rastgele Şifre Üret
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={visibleDealerPassword ? "text" : "password"} 
                      value={editingDealerPassword} 
                      onChange={(e) => setEditingDealerPassword(e.target.value)} 
                      placeholder="Şifreyi değiştirmek istemiyorsanız boş bırakın"
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setVisibleDealerPassword(!visibleDealerPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {visibleDealerPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    * Bayi, giriş yaparken <strong>e-posta adresini</strong> veya <strong>telefon numarasını</strong> kullanıcı adı olarak kullanabilir.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      İl
                    </label>
                    <input 
                      type="text" 
                      value={editingDealerCity} 
                      onChange={(e) => setEditingDealerCity(e.target.value)} 
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      İlçe
                    </label>
                    <input 
                      type="text" 
                      value={editingDealerDistrict} 
                      onChange={(e) => setEditingDealerDistrict(e.target.value)} 
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Açık Adres
                  </label>
                  <textarea 
                    value={editingDealerAddress} 
                    onChange={(e) => setEditingDealerAddress(e.target.value)} 
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingDealerModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingDealerEdit}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSavingDealerEdit ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Güncelle ve Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
