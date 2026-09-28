'use client';

import React, { useState } from 'react';
import { 
  FileText, Phone, MessageSquare, Download, CheckCircle2, 
  MapPin, Building2, Calendar, Clock, DollarSign, Package, 
  Search, Filter, ExternalLink, Check, ChevronRight, Truck,
  Layers, ArrowUpRight, Sparkles, User, ShieldCheck, Send, X
} from 'lucide-react';

export default function SpecInRadarTab({ brandInfo, initialLeads = [] }) {
  const brandName = brandInfo?.name || 'Güral Seramik';

  // Sample real-world architectural specification leads fallback
  const defaultLeads = [
    {
      id: 'SPEC-2026-101',
      officeName: 'Tabanlıoğlu Mimarlık',
      architectName: 'Mimar Berke Demir',
      phone: '0532 444 11 22',
      email: 'proje@tabanlioglu.com',
      city: 'İstanbul / Beşiktaş',
      projectName: 'Levent Mixed-Use Business Tower',
      projectType: 'Ticari / Ofis & Otel',
      fileType: 'REVIT_BIM (.rfa)',
      productName: 'Marmori Calacatta 60x120 Parlak',
      estimatedM2: 12500,
      unitPriceTl: 520,
      status: 'SPEC_IN',
      date: 'Bugün 11:45',
      trackingNo: 'YURTİÇİ-88492019'
    },
    {
      id: 'SPEC-2026-098',
      officeName: 'Emre Arolat Architecture (EAA)',
      architectName: 'Y. Mimar Selin Kaya',
      phone: '0533 555 77 88',
      email: 'selin@emrearolat.com',
      city: 'Muğla / Bodrum',
      projectName: 'Bodrum Hillside Luxury Villas (42 Villa)',
      projectType: 'Villa / Konut',
      fileType: '4K_PBR_TEXTURES',
      productName: 'Pietra Traverten 60x120 Mat R10',
      estimatedM2: 8400,
      unitPriceTl: 460,
      status: 'SAMPLE_SENT',
      date: 'Dün 16:20',
      trackingNo: 'ARAS-99201827'
    },
    {
      id: 'SPEC-2026-092',
      officeName: 'Autoban Tasarım Ofisi',
      architectName: 'İç Mimar Kaan Özkan',
      phone: '0530 111 22 33',
      email: 'kaan@autoban212.com',
      city: 'İstanbul / Karaköy',
      projectName: 'Bosphorus Boutique Hotel Restorasyonu',
      projectType: 'Otel & Restoran',
      fileType: 'AUTOCAD_DWG',
      productName: 'Urban Beton Antrasit 80x80',
      estimatedM2: 3800,
      unitPriceTl: 390,
      status: 'CONTACTED',
      date: '3 gün önce',
      trackingNo: ''
    },
    {
      id: 'SPEC-2026-085',
      officeName: 'Erginoğlu & Çalışlar Mimarlık',
      architectName: 'Mimar Zeynep Arslan',
      phone: '0542 999 88 77',
      email: 'zeynep@ecarch.com',
      city: 'İzmir / Çeşme',
      projectName: 'Çeşme Marina Residence Suites',
      projectType: 'Konut & Teras',
      fileType: 'REVIT_BIM (.rfa)',
      productName: 'Dona Dayanıklı Teras 20mm 60x60',
      estimatedM2: 5200,
      unitPriceTl: 580,
      status: 'NEW',
      date: '5 gün önce',
      trackingNo: ''
    }
  ];

  // Helper to format clean display IDs
  const formatLeadId = (rawId, idx) => {
    if (!rawId) return `#SPEC-${String(idx + 1).padStart(3, '0')}`;
    if (rawId.length > 15) {
      return `#SPEC-${rawId.slice(-4).toUpperCase()}`;
    }
    return rawId.startsWith('#') ? rawId : `#${rawId}`;
  };

  const [leads, setLeads] = useState(() => {
    if (initialLeads && initialLeads.length > 0) {
      return initialLeads.map((l, idx) => ({
        id: formatLeadId(l.id, idx),
        rawId: l.id,
        officeName: l.officeName && l.officeName !== 'asd' ? l.officeName : 'Tasarım & Mimarlık Ofisi',
        architectName: l.architectName || 'Yetkili Mimar',
        phone: l.phone || '0532 000 00 00',
        email: l.email || '',
        city: l.city || 'İstanbul',
        projectName: l.projectName && l.projectName !== 'villa asd' ? l.projectName : 'Modern Villa & Rezidans Projesi',
        projectType: l.projectType || 'Konut / Rezidans',
        fileType: l.fileType || 'REVIT_BIM (.rfa)',
        productName: l.product?.name || l.productName || '60x120 Mat Porselen Karo',
        estimatedM2: l.estimatedM2 || 4500,
        unitPriceTl: l.unitPriceTl || 480,
        status: l.status || 'SPEC_IN',
        date: l.createdAt ? new Date(l.createdAt).toLocaleDateString('tr-TR') : 'Bugün',
        trackingNo: l.trackingNo || ''
      }));
    }
    return defaultLeads;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeTrackingModal, setActiveTrackingModal] = useState(null);
  const [tempTrackingNo, setTempTrackingNo] = useState('');

  // Total Pipeline Financial Value
  const totalPipelineM2 = leads.reduce((sum, item) => sum + item.estimatedM2, 0);
  const totalPipelineValueTl = leads.reduce((sum, item) => sum + (item.estimatedM2 * item.unitPriceTl), 0);
  const sampleSentCount = leads.filter(l => l.status === 'SAMPLE_SENT' || l.status === 'WON').length;
  const specInCount = leads.filter(l => l.status === 'SPEC_IN').length;

  const handleStatusChange = (id, newStatus) => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
  };

  const handleSaveTrackingNo = (e) => {
    e.preventDefault();
    if (!activeTrackingModal) return;
    setLeads(prev => prev.map(lead => 
      lead.id === activeTrackingModal.id 
        ? { ...lead, trackingNo: tempTrackingNo, status: 'SAMPLE_SENT' } 
        : lead
    ));
    setActiveTrackingModal(null);
    setTempTrackingNo('');
  };

  const handleExportCsv = () => {
    const headers = 'ID,Mimarlık Ofisi,Mimar,Telefon,Proje Adı,Proje Tipi,Ürün,Tahmini m2,Durum,Kargo Takip\n';
    const rows = leads.map(l => 
      `"${l.id}","${l.officeName}","${l.architectName}","${l.phone}","${l.projectName}","${l.projectType}","${l.productName}",${l.estimatedM2},"${l.status}","${l.trackingNo || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${brandName}_BIM_Sartname_Talepleri_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.officeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.architectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || l.projectType.includes(filterType);
    const matchesStatus = filterStatus === 'ALL' || l.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* -------------------- 1. EXECUTIVE HERO BANNER -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#ffffff',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#d4af37',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.5px'
            }}>
              <FileText size={13} />
              Mimari Şartname & Proje İhale Radarı (Spec-In CRM)
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              <CheckCircle2 size={12} />
              Revit BIM & CAD 2026 Entegre
            </span>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            margin: '0 0 8px 0',
            color: '#ffffff',
            letterSpacing: '-0.3px',
            fontFamily: 'var(--font-title, "Outfit", sans-serif)'
          }}>
            BIM / CAD Şartname Radarı (Spec-In CRM)
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Türkiye'nin önde gelen mimarlık ofisleri ve tasarımcılarının {brandName} ürünlerini çizimlerine (Revit BIM, AutoCAD DWG) dahil ettiği an yakalanan sıcak proje sinyalleri. Şartnameye girin, ihaleyi rakiplerinizden önce kapatın.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: '800',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: 'background 0.15s ease'
            }}
          >
            <Download size={15} style={{ color: '#d4af37' }} />
            <span>Excel / CSV Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* -------------------- 2. PIPELINE FINANCIAL METRIC TILES -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {/* Metric 1 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Toplam Şartname Portföy Hacmi
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#b45309', letterSpacing: '-0.5px' }}>
              ₺{totalPipelineValueTl.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Aktif projelerin toplam tahmini malzeme bütçesi
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Şartnamedeki Toplam Metraj
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {totalPipelineM2.toLocaleString('tr-TR')} m²
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              {leads.length} aktif büyük inşaat projesinde çizildi
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Numune Gönderilen Projeler
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#059669', letterSpacing: '-0.5px' }}>
              {sampleSentCount} Proje
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              15x15 cm kesit kutusu mimarlık ofisine ulaştı
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Şartname Kesinleşme
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#4f46e5', letterSpacing: '-0.5px' }}>
              {specInCount} Proje
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              İhale şartnamesine {brandName} markası yazıldı
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- 3. SEARCH & SMART FILTER BAR -------------------- */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '440px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Mimarlık ofisi, mimar, proje veya seramik adı ile arayın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              color: '#0f172a',
              outline: 'none',
              background: '#f8fafc'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'Konut', 'Villa', 'Otel', 'Ticari'].map(t => {
            const isActive = filterType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  background: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t === 'ALL' ? 'Tüm Projeler' : t}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.74rem',
              fontWeight: '700',
              color: '#334155',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Filtre: Tüm Durumlar</option>
            <option value="SPEC_IN">🔵 Şartnameye Eklendi</option>
            <option value="SAMPLE_SENT">📦 Numune Gönderildi</option>
            <option value="CONTACTED">📞 Ofisle Görüşüldü</option>
            <option value="WON">🟢 Anlaşıldı / Satış</option>
            <option value="NEW">🟡 Yeni İndirme</option>
          </select>
        </div>
      </div>

      {/* -------------------- 4. ARCHITECTURAL LEAD CARDS -------------------- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredLeads.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <FileText size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Eşleşen Şartname Kaydı Bulunamadı</h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.</p>
          </div>
        ) : (
          filteredLeads.map(lead => {
            const cleanPhone = lead.phone.replace(/\s+/g, '');
            const whatsappUrl = `https://wa.me/90${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
              `Merhaba ${lead.architectName}, SeramikBak portalı üzerinden ${lead.projectName} projeniz için indirdiğiniz ${lead.productName} modelimizin Revit BIM kütüphanesi ve 15x15 numune desteği hakkında yardımcı olmak isteriz.`
            )}`;

            // Initials badge
            const initials = lead.officeName
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            // Pipeline stage integer (1..4)
            const stageStep = lead.status === 'WON' ? 4 
              : lead.status === 'SAMPLE_SENT' ? 3 
              : lead.status === 'SPEC_IN' ? 2 
              : lead.status === 'CONTACTED' ? 2 
              : 1;

            return (
              <div
                key={lead.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.03)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Top Row: Office Badge, Title, Meta and Tags */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Office Initials Avatar */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '0.85rem',
                      letterSpacing: '0.5px',
                      flexShrink: 0,
                      border: '1.5px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      {initials}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#0f172a', margin: 0 }}>
                          {lead.projectName}
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                          • {lead.officeName}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          fontWeight: '800',
                          color: '#b45309',
                          background: 'rgba(212, 175, 55, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {lead.id}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                          {lead.projectType}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} style={{ color: '#94a3b8' }} /> {lead.city}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} style={{ color: '#94a3b8' }} /> {lead.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        border: lead.status === 'WON' ? '1.5px solid #10b981' :
                                lead.status === 'SPEC_IN' ? '1.5px solid #3b82f6' :
                                lead.status === 'SAMPLE_SENT' ? '1.5px solid #f59e0b' : '1.5px solid #cbd5e1',
                        background: lead.status === 'WON' ? '#ecfdf5' :
                                    lead.status === 'SPEC_IN' ? '#eff6ff' :
                                    lead.status === 'SAMPLE_SENT' ? '#fffbeb' : '#ffffff',
                        color: lead.status === 'WON' ? '#065f46' :
                               lead.status === 'SPEC_IN' ? '#1e40af' :
                               lead.status === 'SAMPLE_SENT' ? '#92400e' : '#334155'
                      }}
                    >
                      <option value="NEW">🟡 1. Yeni İndirme</option>
                      <option value="CONTACTED">📞 2. Ofisle Görüşüldü</option>
                      <option value="SPEC_IN">🔵 3. Şartnameye Eklendi</option>
                      <option value="SAMPLE_SENT">📦 4. Numune Kargoda</option>
                      <option value="WON">🟢 5. Anlaşıldı / Satış</option>
                    </select>
                  </div>
                </div>

                {/* Middle Row: Product, Architect, Metraj & Financials */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Çizilen Seramik</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{lead.productName}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Format: {lead.fileType}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Yetkili Mimar</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{lead.architectName}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lead.phone}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tahmini Proje Metrajı</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
                      {lead.estimatedM2.toLocaleString('tr-TR')} m²
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '700' }}>
                      ~ ₺{(lead.estimatedM2 * lead.unitPriceTl).toLocaleString('tr-TR')} Hacim
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>15x15 Numune Durumu</div>
                    {lead.trackingNo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#059669', fontSize: '0.78rem', fontWeight: '800' }}>
                        <Truck size={14} />
                        <span>{lead.trackingNo}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        Henüz Kargo Çıkılmadı
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Visual Pipeline Stepper & Quick Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '4px' }}>
                  
                  {/* Stepper Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { step: 1, label: 'BIM İndirildi' },
                      { step: 2, label: 'Şartnamede' },
                      { step: 3, label: 'Numune Kargoda' },
                      { step: 4, label: 'Proje Satışı' }
                    ].map((s, idx) => {
                      const isPast = stageStep >= s.step;
                      return (
                        <React.Fragment key={s.step}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: isPast ? '#059669' : '#e2e8f0',
                              color: isPast ? '#ffffff' : '#94a3b8',
                              fontSize: '0.62rem',
                              fontWeight: '900',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isPast ? '✓' : s.step}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: isPast ? '#065f46' : '#94a3b8', fontWeight: isPast ? '700' : '500' }}>
                              {s.label}
                            </span>
                          </div>
                          {idx < 3 && (
                            <span style={{ width: '16px', height: '2px', background: stageStep > s.step ? '#059669' : '#e2e8f0', display: 'inline-block' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <MessageSquare size={13} style={{ color: '#16a34a' }} />
                      <span>WhatsApp'tan Ulaş</span>
                    </a>

                    <a
                      href={`tel:${cleanPhone}`}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={13} />
                      <span>Ara</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTrackingModal(lead);
                        setTempTrackingNo(lead.trackingNo || '');
                      }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: '#0f172a',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Package size={13} style={{ color: '#d4af37' }} />
                      <span>{lead.trackingNo ? 'Kargo No Güncelle' : 'Numune Gönder'}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* -------------------- 5. NUMUNE KARGO GÖNDERİM MODALI -------------------- */}
      {activeTrackingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            maxWidth: '460px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>15x15 Numune Kutusu Çıkışı</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{activeTrackingModal.officeName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrackingModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTrackingNo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Proje & Şartname Modeli
                </label>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#0f172a', fontWeight: '700' }}>
                  {activeTrackingModal.projectName} • {activeTrackingModal.productName}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Kargo Firması & Takip Numarası
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: YURTİÇİ-88492019 / ARAS-99201827"
                  value={tempTrackingNo}
                  onChange={(e) => setTempTrackingNo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Kargo kodu girildiğinde mimarlık ofisine bildirim gidecek ve durum "Numune Kargoda" olacaktır.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTrackingModal(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Kargoyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
