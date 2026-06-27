'use client';

import { useState, useEffect } from 'react';
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
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab: 'scraper', 'dealers', 'leads', 'saas', 'projects'
  const [activeTab, setActiveTab] = useState('scraper');

  // Database list states
  const [brands, setBrands] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saasConfigs, setSaasConfigs] = useState([]);

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
  const [newDealerAddress, setNewDealerAddress] = useState('');
  const [newDealerCity, setNewDealerCity] = useState('İstanbul');
  const [newDealerDistrict, setNewDealerDistrict] = useState('');
  const [newDealerLat, setNewDealerLat] = useState('40.9901');
  const [newDealerLng, setNewDealerLng] = useState('29.0278');
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [dealerSuccess, setDealerSuccess] = useState('');
  const [dealerError, setDealerError] = useState('');
  const [dealerSubTab, setDealerSubTab] = useState('active'); // active, pending

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

  // Price Crawler Bot State
  const [isCrawlingPrices, setIsCrawlingPrices] = useState(false);
  const [crawlSuccess, setCrawlSuccess] = useState('');
  const [crawlError, setCrawlError] = useState('');
  const [crawlLogs, setCrawlLogs] = useState([]);

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
        bauhausUrl: manualBauhausUrl || null
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
    setCrawlLogs(['[Fiyat Botu] Fiyat güncelleme botu başlatılıyor...']);

    try {
      const response = await fetch('/api/admin/crawl-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setCrawlLogs(data.logs || []);
        setCrawlSuccess(`Başarılı! ${data.count} adet ürünün fiyatları taranıp güncellendi.`);
        loadAdminProducts(1);
      } else {
        setCrawlError(data.error || 'Fiyatlar güncellenirken bir hata oluştu.');
        if (data.logs) {
          setCrawlLogs(data.logs);
        }
      }
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
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'products') {
      loadAdminProducts(1);
    }
  }, [adminProductsFilterBrand, adminProductsFilterStyle, adminProductsFilterFinish]);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre.');
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
          borderRadius: '28px',
          padding: '44px 40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
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
            
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
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
      {/* Header */}
      <header className="admin-header glass-panel">
        <div className="header-brand">
          <div className="logo-icon">SB</div>
          <div>
            <span className="logo-text">SeramikBak Yönetim Paneli</span>
            <span className="system-badge">Admin Yetkisi</span>
          </div>
        </div>

        {/* Inner Admin Navigation Tabs */}
        <div className="admin-tabs-nav">
          <button className={`admin-tab-link ${activeTab === 'scraper' ? 'active' : ''}`} onClick={() => setActiveTab('scraper')}>
            <Terminal size={14} />
            <span>Ürün Kazıma</span>
          </button>
          <button className={`admin-tab-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Settings size={14} />
            <span>Ürün Yönetimi</span>
          </button>
          <button className={`admin-tab-link ${activeTab === 'dealers' ? 'active' : ''}`} onClick={() => setActiveTab('dealers')}>
            <MapPin size={14} />
            <span>Bayi Teşkilatı</span>
          </button>
          <button className={`admin-tab-link ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
            <FileText size={14} />
            <span>Teklif Talepleri ({leads.length})</span>
          </button>
          <button className={`admin-tab-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <Building2 size={14} />
            <span>Proje Talepleri ({projects.length})</span>
          </button>
          <button className={`admin-tab-link ${activeTab === 'saas' ? 'active' : ''}`} onClick={() => setActiveTab('saas')}>
            <CreditCard size={14} />
            <span>SaaS Abonelikleri</span>
          </button>
        </div>

        <div className="header-actions">
          <Link href="/" className="btn-secondary flex-btn">
            <ArrowLeft size={16} />
            <span>Arama Portalına Git</span>
          </Link>
          <button onClick={() => setIsLoggedIn(false)} className="btn-logout">Çıkış Yap</button>
        </div>
      </header>

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
                color: scraperSubTab === 'crawler' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                color: scraperSubTab === 'excel' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                color: scraperSubTab === 'zip' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                color: scraperSubTab === 'pdf' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                color: scraperSubTab === 'feed' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                color: scraperSubTab === 'pricebot' ? 'var(--bg-primary)' : 'var(--text-primary)',
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

              <div className="form-group">
                <label>İletişim Telefonu</label>
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
                  color: dealerSubTab === 'active' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                  color: dealerSubTab === 'pending' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                          <div style={{ display: 'flex', gap: '6px' }}>
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
                      <th>Telefon</th>
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
                        <td>{d.phone}</td>
                        <td>
                          <button onClick={() => handleDeleteDealer(d.id)} className="btn-action-delete" title="Sil">
                            <Trash2 size={14} />
                          </button>
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

      {/* TAB 4: SAAS CONFIGURATION */}
      {activeTab === 'saas' && (
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
          ) : (
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
          )}
        </div>
      )}

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
                  color: productSubTab === 'list' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                  color: productSubTab === 'form' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
                  style={{ padding: '6px 12px', fontSize: '0.75rem', width: '180px' }}
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

      {/* Embedded CSS specific to this multi-tab console */}
      <style jsx>{`
        .admin-layout {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: var(--font-body);
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 28px;
          border-radius: var(--border-radius-md);
          background: #ffffff;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-gold);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 1.2rem;
          border-radius: var(--border-radius-sm);
        }

        .logo-text {
          font-family: var(--font-title);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }

        .system-badge {
          font-size: 0.65rem;
          color: var(--accent-gold);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-tabs-nav {
          display: flex;
          background: #f1f3f7;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 4px;
          gap: 4px;
        }

        .admin-tab-link {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .admin-tab-link:hover {
          color: var(--text-primary);
        }

        .admin-tab-link.active {
          background: #ffffff;
          color: var(--accent-gold);
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-logout {
          background: rgba(239, 68, 68, 0.06);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.8rem;
          padding: 8px 18px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: #ef4444;
          color: #ffffff;
        }

        /* Content Grid */
        .admin-grid {
          display: grid;
          grid-template-columns: 1.15fr 1.85fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .admin-grid {
            grid-template-columns: 1fr;
          }
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-tabs-nav {
            width: 100%;
            overflow-x: auto;
          }
        }

        @media (max-width: 768px) {
          .form-group-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .admin-card {
            padding: 16px;
          }
          .admin-filters-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .admin-card {
          padding: 24px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: var(--border-radius-md);
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
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-header p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.3;
        }

        .ingest-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .success-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(5, 150, 105, 0.05);
          border: 1px solid rgba(5, 150, 105, 0.2);
          color: var(--accent-green);
          padding: 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.78rem;
          font-weight: 500;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.78rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .form-select, .form-input {
          background-color: #f1f3f7;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 10px 14px;
          font-size: 0.8rem;
          color: var(--text-primary);
          outline: none;
          font-family: var(--font-body);
        }

        .form-input:focus {
          border-color: var(--accent-gold);
        }

        .segmented-control {
          display: flex;
          background-color: #f1f3f7;
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
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .segmented-control button.active {
          background-color: var(--accent-gold);
          color: #ffffff;
        }

        .flex-center-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Console Terminal Styles */
        .console-card {
          flex-grow: 1;
        }

        .console-terminal {
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          min-height: 290px;
          max-height: 480px;
          overflow-y: auto;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
          font-family: 'Courier New', Courier, monospace;
        }

        .console-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 250px;
          color: #475569;
          text-align: center;
          gap: 12px;
          font-size: 0.8rem;
        }

        .console-logs-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .console-line {
          font-size: 0.75rem;
          line-height: 1.4;
          color: #cbd5e1;
          display: flex;
          gap: 12px;
        }

        .console-line.err { color: #f87171; }
        .console-line.sys { color: #34d399; }
        .console-line.scr { color: #60a5fa; }

        .line-num {
          color: #475569;
          min-width: 20px;
          user-select: none;
          text-align: right;
        }

        .line-text {
          white-space: pre-wrap;
          word-break: break-all;
        }

        .console-typing-loader {
          padding-left: 32px;
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }

        .typing-dot {
          width: 5px;
          height: 5px;
          background-color: #60a5fa;
          border-radius: 50%;
          animation: typingBlink 1.4s infinite both;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBlink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }

        .flex-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          padding: 8px 18px;
        }

        /* Admin Table Styles */
        .table-responsive {
          overflow-x: auto;
          max-height: 480px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          text-align: left;
        }

        .admin-table th {
          background: #f8f9fc;
          padding: 12px 16px;
          color: var(--text-secondary);
          font-weight: 600;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .admin-table tr:hover td {
          background: rgba(0,0,0,0.01);
        }

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
      `}</style>
    </main>
  );
}
