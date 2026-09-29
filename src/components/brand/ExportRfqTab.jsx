'use client';

import React, { useState } from 'react';
import { 
  Globe, Send, Download, CheckCircle2, ShieldCheck, 
  MapPin, Calendar, FileText, Check, DollarSign, Calculator,
  ExternalLink, Building2, Package, Clock, Truck, ArrowRight,
  TrendingUp, Sparkles, X, ChevronRight, Info, ShieldAlert
} from 'lucide-react';

export default function ExportRfqTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'Güral Seramik';

  // Sample real-world international B2B RFQ inquiries
  const [rfqList, setRfqList] = useState([
    {
      id: 'RFQ-DE-2026-081',
      country: 'Almanya',
      countryCode: 'DE',
      flag: '🇩🇪',
      city: 'Münih / Bavyera',
      company: 'Bavaria Bau & Fliesen GmbH',
      projectType: 'Rezidans & Otel Kompleksi (350 Daire)',
      requestedM2: 14500,
      requestedFormat: '60x120 cm Porselen Karo',
      surface: 'Mat / R10 Kaydırmazlık',
      certRequired: 'CE, EN 14411 Grup BIa, Dona Dayanıklı',
      deliveryPort: 'Hamburg Limanı (FOB/CIF)',
      date: 'Bugün',
      status: 'TEKLİF_BEKLİYOR',
      estimatedBudgetEur: 14500 * 16.5
    },
    {
      id: 'RFQ-US-2026-044',
      country: 'Amerika Birleşik Devletleri',
      countryCode: 'US',
      flag: '🇺🇸',
      city: 'Miami, Florida',
      company: 'Coastal Luxury Interiors LLC',
      projectType: 'Lüks Sahil Villaları & Teras Zeminleri',
      requestedM2: 8200,
      requestedFormat: '120x240 cm Dev Slab & 80x80 cm',
      surface: 'Parlak Calacatta & Mat Traverten',
      certRequired: 'ASTM C373 Su Emme < %0.5, DCOF > 0.42',
      deliveryPort: 'Miami Port (CIF)',
      date: 'Dün',
      status: 'TEKLİF_BEKLİYOR',
      estimatedBudgetEur: 8200 * 22.0
    },
    {
      id: 'RFQ-SA-2026-102',
      country: 'Suudi Arabistan',
      countryCode: 'SA',
      flag: '🇸🇦',
      city: 'Riyadh',
      company: 'Al-Madar Construction & Contracting',
      projectType: 'Ticari İş Merkezi & AVM Projesi',
      requestedM2: 28000,
      requestedFormat: '60x120 cm & 60x60 cm Porselen',
      surface: 'Mat Beton Dokulu & Gri / Kemik Renk',
      certRequired: 'SASO Sertifikası, ISO 10545, PEI 5',
      deliveryPort: 'Jeddah Islamic Port (FOB Mersin/İzmir)',
      date: '3 gün önce',
      status: 'İNCELENİYOR',
      estimatedBudgetEur: 28000 * 14.5
    },
    {
      id: 'RFQ-GB-2026-029',
      country: 'Birleşik Krallık',
      countryCode: 'GB',
      flag: '🇬🇧',
      city: 'Londra',
      company: 'Thames Urban Architecture Ltd.',
      projectType: 'Boutique Hotel & Restaurant Renovation',
      requestedM2: 4500,
      requestedFormat: '20x120 cm Ahşap Desen Porselen',
      surface: 'Mat Ahşap Meşe Dokusu',
      certRequired: 'UKCA, PTV 36+ Islak Kaydırmazlık',
      deliveryPort: 'Felixstowe Port (CIF)',
      date: '5 gün önce',
      status: 'TEKLİF_VERİLDİ',
      estimatedBudgetEur: 4500 * 19.5
    }
  ]);

  // Selected RFQ for proposal builder modal
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [fobPricePerM2, setFobPricePerM2] = useState('15.50');
  const [freightPerContainer, setFreightPerContainer] = useState('2200');
  const [productionDays, setProductionDays] = useState('25 gün');
  const [currency, setCurrency] = useState('EUR'); // 'EUR' | 'USD'
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [legalConsent, setLegalConsent] = useState(true);

  // Calculations for Proforma
  const m2 = selectedRfq ? selectedRfq.requestedM2 : 0;
  // Standard 20ft container carries ~1,300 m² of 60x120 tiles (approx 24-26 tons)
  const containersNeeded = Math.ceil(m2 / 1300);
  const totalFobAmount = Math.round(m2 * parseFloat(fobPricePerM2 || 0));
  const totalFreight = containersNeeded * parseFloat(freightPerContainer || 0);
  const totalCifAmount = totalFobAmount + totalFreight;

  const totalDemandM2 = rfqList.reduce((sum, item) => sum + item.requestedM2, 0);
  const totalPotentialEur = rfqList.reduce((sum, item) => sum + item.estimatedBudgetEur, 0);

  const handleOpenOfferModal = (rfq) => {
    setSelectedRfq(rfq);
    setOfferSubmitted(false);
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    setOfferSubmitted(true);
    setTimeout(() => {
      setRfqList(prev => prev.map(item => 
        item.id === selectedRfq.id ? { ...item, status: 'TEKLİF_VERİLDİ' } : item
      ));
      setSelectedRfq(null);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* -------------------- 1. EXECUTIVE HERO BANNER -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#ffffff',
        border: '1px solid rgba(56, 189, 248, 0.25)',
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
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.5px'
            }}>
              <Globe size={13} />
              Global Export Matchmaker • 7 Dilde Uluslararası İhale Havuzu
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
              Doğrulanmış B2B İthalatçılar
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
            Uluslararası İhracat Talepleri & Toptan Alım Masası
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Almanya, ABD, Körfez ülkeleri ve Birleşik Krallık'taki toptancı ve müteahhitlerin SeramikBak üzerinden açtığı yüksek metrajlı porselen seramik talepleri. Tek tıkla fabrikanız adına doğrudan FOB veya CIF proforma teklif verin.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          minWidth: '200px'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
            Aktif Küresel Talep
          </span>
          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>
            {totalDemandM2.toLocaleString('tr-TR')} m²
          </span>
          <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '800', marginTop: '2px' }}>
            ~ €{totalPotentialEur.toLocaleString('tr-TR')} İhracat Hacmi
          </span>
        </div>
      </div>

      {/* -------------------- 2. TOP METRIC STRIP -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Toplam Talep Hacmi</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Globe size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            {totalDemandM2.toLocaleString('tr-TR')} m²
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
            4 ülkeden gelen toptan porselen karo ihaleleri
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Konteyner Eşdeğeri</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <Truck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#b45309', marginTop: '10px' }}>
            ~{Math.ceil(totalDemandM2 / 1300)} Konteyner
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
            Standart 20ft (yaklaşık 25 ton/konteyner yükü)
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Ortalama İhale Metrajı</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#059669', marginTop: '10px' }}>
            13.800 m²
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
            Proje başına ortalama talep büyüklüğü
          </div>
        </div>
      </div>

      {/* -------------------- 3. INTERNATIONAL RFQ TABLE / BOARD -------------------- */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: '#0284c7' }} />
              <span>Bekleyen Uluslararası İhracat İhaleleri</span>
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Doğrudan fabrikanızdan teklif bekleyen global toptancı talepleri
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', background: '#f0f9ff', color: '#0369a1', fontWeight: '800', border: '1px solid #bae6fd' }}>
            {rfqList.length} Aktif İhale Fırsatı
          </span>
        </div>

        {/* Table Container */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px' }}>Ülke & Firma</th>
                <th style={{ padding: '14px 16px' }}>Proje & Lokasyon</th>
                <th style={{ padding: '14px 16px' }}>Talep Edilen Ebat & Yüzey</th>
                <th style={{ padding: '14px 16px' }}>Miktar (m²)</th>
                <th style={{ padding: '14px 16px' }}>Teslim Şartı / Liman</th>
                <th style={{ padding: '14px 16px' }}>Durum</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rfqList.map((rfq, idx) => (
                <tr
                  key={rfq.id}
                  style={{
                    borderBottom: idx < rfqList.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Country & Company */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{rfq.flag}</span>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{rfq.country}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{rfq.company}</div>
                      </div>
                    </div>
                  </td>

                  {/* Project Type */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{rfq.projectType}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={11} /> {rfq.city}
                    </div>
                  </td>

                  {/* Format & Surface */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{rfq.requestedFormat}</div>
                    <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '600' }}>{rfq.surface}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>{rfq.certRequired}</div>
                  </td>

                  {/* Quantity */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a' }}>
                      {rfq.requestedM2.toLocaleString('tr-TR')} m²
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      ~{Math.ceil(rfq.requestedM2 / 1300)}x 20ft Konteyner
                    </div>
                  </td>

                  {/* Port */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      color: '#334155',
                      fontSize: '0.72rem',
                      fontWeight: '700'
                    }}>
                      <Truck size={12} /> {rfq.deliveryPort}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      background: rfq.status === 'TEKLİF_BEKLİYOR' ? '#fffbeb' : rfq.status === 'TEKLİF_VERİLDİ' ? '#ecfdf5' : '#f8fafc',
                      color: rfq.status === 'TEKLİF_BEKLİYOR' ? '#b45309' : rfq.status === 'TEKLİF_VERİLDİ' ? '#065f46' : '#475569',
                      border: rfq.status === 'TEKLİF_BEKLİYOR' ? '1px solid #fde68a' : rfq.status === 'TEKLİF_VERİLDİ' ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                    }}>
                      {rfq.status === 'TEKLİF_BEKLİYOR' && '⏳ Teklif Bekliyor'}
                      {rfq.status === 'TEKLİF_VERİLDİ' && '✓ Teklif İletildi'}
                      {rfq.status === 'İNCELENİYOR' && '🔍 İnceleniyor'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenOfferModal(rfq)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: '#0f172a',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Send size={12} style={{ color: '#38bdf8' }} />
                      <span>{rfq.status === 'TEKLİF_VERİLDİ' ? 'Teklifi Güncelle' : 'Proforma Teklif Ver'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- 3.1 GÜVEN, DOĞRULAMA & HUKUKİ ÇEKİNCE MERKEZİ -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '18px'
      }}>
        {/* Kutu 1: Doğrulama Protokolü */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <ShieldCheck size={18} />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '850', color: '#0f172a' }}>
              B2B Doğrulama Standartları (KYB)
            </h4>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 10px 0' }}>
            Talepler havuza düşmeden önce 3 aşamalı kurumsal güvenlik filtresinden geçirilir:
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: '#334155', lineHeight: '1.7' }}>
            <li><strong>Vergi & VIES Kaydı:</strong> AB (VIES), ABD (EIN) ve yerel ticaret sicil numarası teyidi.</li>
            <li><strong>Kurumsal E-posta:</strong> @gmail, @hotmail engellenir; yalnızca kurumsal şirket domaini kabul edilir.</li>
            <li><strong>Satın Alma Yetkilisi:</strong> Kurumsal unvan ve telefon doğrulaması.</li>
          </ul>
        </div>

        {/* Kutu 2: Talepler Nereden Geliyor? */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Globe size={18} />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '850', color: '#0f172a' }}>
              Talepler Nereden Geliyor?
            </h4>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 10px 0' }}>
            Talepler doğrudan SeramikBak'ın global alıcı kanallarından toplanır:
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: '#334155', lineHeight: '1.7' }}>
            <li><strong>/proje-talep Portalı:</strong> Müteahhit ve mimarlık ofislerinin açtığı metrajlı projeler.</li>
            <li><strong>/global-tanitim Hub'ı:</strong> Uluslararası ihracat alıcılarının doğrudan girdiği ihaleler.</li>
            <li><strong>Mimari Spec-In:</strong> Proje şartnamelerine seramik yazdıran kurumsal satın almacılar.</li>
          </ul>
        </div>

        {/* Kutu 3: Hukuki Sorumluluk Reddi (Disclaimer) */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(234, 88, 12, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c2410c' }}>
              <ShieldAlert size={18} />
            </div>
            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '850', color: '#0f172a' }}>
              Hukuki Çekince & Yasal Bilgilendirme
            </h4>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
            <strong>6563 S.K. Uyarınca Aracı Hizmet Sağlayıcı:</strong> SeramikBak, alıcı ile üretici fabrikayı bir araya getiren bağımsız teknoloji platformudur. Taraflar arasındaki nihai akreditif (L/C), ödeme koşulları, gümrükleme, nakliye sigortası ve teslimat (Incoterms 2020) taahhütleri münhasıran alıcı ve fabrikanın kendi hukuki sorumluluğundadır. SeramikBak mali kefalet veya tahsilat garantisi vermez.
          </p>
        </div>
      </div>

      {/* -------------------- 4. PROFORMA PROPOSAL MODAL -------------------- */}
      {selectedRfq && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(5px)',
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Globe size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                    İhracat Proforma Teklifi Oluştur
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {selectedRfq.flag} {selectedRfq.country} • {selectedRfq.company}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {offerSubmitted ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>Proforma Teklifiniz İletildi!</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Teklif dokümanınız {selectedRfq.company} satın alma direktörüne iletildi. Durum takip ediliyor.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Inquiry Summary Box */}
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700' }}>TALEP EDİLEN METRAJ</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a' }}>{selectedRfq.requestedM2.toLocaleString('tr-TR')} m²</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700' }}>FORMAT & DOKU</span>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{selectedRfq.requestedFormat}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700' }}>TESLİM LİMANI</span>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{selectedRfq.deliveryPort}</div>
                    </div>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Fabrika Çıkış FOB Birim Fiyat (€ / m²)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={fobPricePerM2}
                      onChange={(e) => setFobPricePerM2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Konteyner Başına Tahmini Navlun (€)
                    </label>
                    <input
                      type="number"
                      step="50"
                      required
                      value={freightPerContainer}
                      onChange={(e) => setFreightPerContainer(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Live Proforma Calculation Breakdown */}
                <div style={{
                  background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#ffffff'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Otomatik Proforma Hesabı
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: '#cbd5e1' }}>Toplam Malzeme Bedeli (FOB):</span>
                    <strong style={{ color: '#ffffff' }}>€{totalFobAmount.toLocaleString('tr-TR')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '10px' }}>
                    <span style={{ color: '#cbd5e1' }}>Denizyolu Navlunu ({containersNeeded} Konteyner):</span>
                    <strong style={{ color: '#38bdf8' }}>€{totalFreight.toLocaleString('tr-TR')}</strong>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: '900' }}>
                    <span style={{ color: '#d4af37' }}>TOPLAM CIF BEDEL:</span>
                    <span style={{ color: '#34d399' }}>€{totalCifAmount.toLocaleString('tr-TR')}</span>
                  </div>
                </div>

                {/* Legal Consent Checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  color: '#475569',
                  lineHeight: '1.4'
                }}>
                  <input
                    type="checkbox"
                    required
                    checked={legalConsent}
                    onChange={(e) => setLegalConsent(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#0f172a' }}
                  />
                  <span>
                    <strong>Hukuki Beyan:</strong> 6563 S.K. uyarınca SeramikBak'ın aracı platform olduğunu, akreditif (L/C), ödeme tahsilatı, gümrük ve teslimat şartlarının münhasıran alıcı firma ile fabrikamız arasındaki ikili sözleşmeye tabi olduğunu kabul ediyorum.
                  </span>
                </label>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Send size={14} style={{ color: '#38bdf8' }} />
                    <span>Resmi Proforma Gönder</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
