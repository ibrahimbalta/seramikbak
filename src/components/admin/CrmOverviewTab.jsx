'use client';

import { useState } from 'react';
import {
  FileText,
  Building2,
  MapPin,
  Wrench,
  Mail,
  Package,
  Compass,
  Sparkles,
  CreditCard,
  Terminal,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  Activity,
  Layers,
  Filter,
} from 'lucide-react';

function MiniSparkline({ color = '#2563eb', points = '0,22 14,18 28,20 42,12 56,15 70,7 84,10 98,3' }) {
  return (
    <svg width="88" height="26" viewBox="0 0 98 26" fill="none" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * Modern executive CRM Dashboard Overview for SeramikBak Admin Panel.
 */
export default function CrmOverviewTab({
  leads = [],
  projects = [],
  dealers = [],
  brands = [],
  adminProductsTotal = 0,
  installerStats = { total: 0, pending: 0, verified: 0 },
  adminInstallers = [],
  contactMessages = [],
  sampleOrders = [],
  campaigns = [],
  saasConfigs = [],
  dealerSaasConfigs = [],
  pendingAlertsCount = 0,
  onSelectTab,
}) {
  const [queueFilter, setQueueFilter] = useState('ALL');

  const unreadMessages = contactMessages.filter((m) => m.status === 'UNREAD');
  const pendingSamples = sampleOrders.filter((o) => o.status === 'PENDING');
  const pendingCampaigns = campaigns.filter((c) => c.status === 'PENDING_APPROVAL');
  const pendingInstallers = adminInstallers.filter((i) => !i.isVerified);

  const primaryKpis = [
    {
      id: 'leads',
      label: 'Teklif Talepleri',
      value: leads.length,
      delta: `${projects.length} proje aktif`,
      icon: FileText,
      color: '#2563eb',
      soft: 'rgba(37, 99, 235, 0.1)',
      spark: '0,21 16,17 32,19 48,11 64,14 80,6 98,4',
    },
    {
      id: 'dealers',
      label: 'Yetkili Bayi Ağı',
      value: dealers.length,
      delta: `${dealerSaasConfigs.length} SaaS abonesi`,
      icon: MapPin,
      color: '#059669',
      soft: 'rgba(5, 150, 105, 0.1)',
      spark: '0,20 16,18 32,15 48,13 64,10 80,8 98,5',
    },
    {
      id: 'installers',
      label: 'Usta Başvuruları',
      value: installerStats.total,
      delta: installerStats.pending > 0 ? `${installerStats.pending} onay bekliyor` : 'Tümü onaylı',
      icon: Wrench,
      color: installerStats.pending > 0 ? '#dc2626' : '#059669',
      soft: installerStats.pending > 0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(5, 150, 105, 0.1)',
      spark: '0,18 16,20 32,14 48,16 64,9 80,11 98,6',
      alert: installerStats.pending > 0,
    },
    {
      id: 'products',
      label: 'Katalog Hacmi',
      value: adminProductsTotal,
      delta: `${brands.length} üretici marka`,
      icon: Package,
      color: '#b38e47',
      soft: 'rgba(179, 142, 71, 0.14)',
      spark: '0,22 16,19 32,16 48,14 64,11 80,7 98,3',
    },
  ];

  const allQueueItems = [
    ...pendingInstallers.map((inst) => ({
      key: `inst-${inst.id}`,
      type: 'installers',
      tab: 'installers',
      title: inst.name || inst.companyName || 'Usta Başvurusu',
      meta: `${inst.city || 'Türkiye'} · ${inst.phone || 'Telefon belirtilmedi'}`,
      tag: 'Usta Onayı',
      tone: 'red',
      initials: (inst.name || 'U').slice(0, 2).toUpperCase(),
    })),
    ...leads.map((lead) => ({
      key: `lead-${lead.id}`,
      type: 'leads',
      tab: 'leads',
      title: lead.customerName || lead.name || 'Teklif Talebi',
      meta: `${lead.city || 'Şehir yok'} · ${lead.areaM2 ? `${lead.areaM2} m²` : 'Metraj talebi'}`,
      tag: 'Teklif',
      tone: 'blue',
      initials: (lead.customerName || lead.name || 'T').slice(0, 2).toUpperCase(),
    })),
    ...projects.map((proj) => ({
      key: `proj-${proj.id}`,
      type: 'projects',
      tab: 'projects',
      title: proj.projectName || proj.companyName || proj.contactName || 'Proje Talebi',
      meta: `${proj.city || 'Proje'} · ${proj.totalM2 ? `${proj.totalM2} m²` : 'B2B İhale'}`,
      tag: 'Proje',
      tone: 'purple',
      initials: (proj.projectName || proj.companyName || 'P').slice(0, 2).toUpperCase(),
    })),
    ...unreadMessages.map((msg) => ({
      key: `msg-${msg.id}`,
      type: 'messages',
      tab: 'contact_messages',
      title: msg.name || msg.email || 'İletişim Mesajı',
      meta: msg.subject || 'Okunmamış mesaj',
      tag: 'Mesaj',
      tone: 'amber',
      initials: (msg.name || 'M').slice(0, 2).toUpperCase(),
    })),
  ];

  const filteredQueue = (
    queueFilter === 'ALL' ? allQueueItems : allQueueItems.filter((item) => item.type === queueFilter)
  ).slice(0, 7);

  // Ecosystem Donut Chart math
  const totalNetwork = Math.max(1, dealers.length + brands.length + installerStats.verified + pendingInstallers.length);
  const segDealers = (dealers.length / totalNetwork) * 100;
  const segBrands = (brands.length / totalNetwork) * 100;
  const segVerified = (installerStats.verified / totalNetwork) * 100;

  const pipelineStages = [
    { id: 'leads', label: 'Teklifler', count: leads.length, color: '#2563eb' },
    { id: 'projects', label: 'Projeler', count: projects.length, color: '#7c3aed' },
    { id: 'sample_orders', label: 'Numuneler', count: pendingSamples.length, color: '#d97706' },
    { id: 'campaigns', label: 'Reklam Onayı', count: pendingCampaigns.length, color: '#b38e47' },
    { id: 'contact_messages', label: 'Mesajlar', count: unreadMessages.length, color: '#059669' },
  ];

  const quickModules = [
    { id: 'architects', label: 'Mimarlık & Tasarım', desc: 'Ofis & BIM ağı', icon: Compass },
    { id: 'saas', label: 'SaaS Abonelikleri', desc: `${saasConfigs.length + dealerSaasConfigs.length} aktif paket`, icon: CreditCard },
    { id: 'scraper', label: 'Ürün Kazıma', desc: 'Veri & katalog alımı', icon: Terminal },
    { id: 'system_monitor', label: 'Sağlık Monitörü', desc: 'Sistem & API testi', icon: Activity },
  ];

  return (
    <div className="crm-v2-root">
      {/* Top Executive Strip */}
      <div className="crm-v2-header-card">
        <div className="crm-v2-header-copy">
          <div className="crm-v2-status-chip">
            <span className="crm-v2-dot" />
            <span>CANLI OPERASYON & CRM</span>
          </div>
          <h2>Hoş Geldiniz, Yönetici Özeti</h2>
          <p>
            Tüm müşteri talepleri, B2B proje ihaleleri, bayi ağı ve usta onay süreçleri gerçek zamanlı izleniyor.
          </p>
        </div>

        <div className="crm-v2-header-right">
          <div className="crm-v2-pending-pill">
            <Clock size={15} />
            <div>
              <strong>{pendingAlertsCount}</strong>
              <span>Açık Aksiyon</span>
            </div>
          </div>
          <button
            type="button"
            className="crm-v2-cta"
            onClick={() => onSelectTab(pendingInstallers.length > 0 ? 'installers' : 'leads')}
          >
            <span>{pendingInstallers.length > 0 ? 'Onay Kuyruğunu Aç' : 'Tekliflere Git'}</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* 4-Column KPI Strip with Sparklines */}
      <div className="crm-v2-kpi-row">
        {primaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.id}
              type="button"
              className={`crm-v2-kpi ${kpi.alert ? 'has-alert' : ''}`}
              onClick={() => onSelectTab(kpi.id)}
            >
              <div className="crm-v2-kpi-head">
                <div className="crm-v2-kpi-icon" style={{ background: kpi.soft, color: kpi.color }}>
                  <Icon size={17} />
                </div>
                <MiniSparkline color={kpi.color} points={kpi.spark} />
              </div>
              <div className="crm-v2-kpi-val">{kpi.value}</div>
              <div className="crm-v2-kpi-title">{kpi.label}</div>
              <div className="crm-v2-kpi-delta">{kpi.delta}</div>
            </button>
          );
        })}
      </div>

      {/* CRM Pipeline Funnel Bar */}
      <div className="crm-v2-pipeline-card">
        <div className="crm-v2-pipeline-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#b38e47" />
            <h3>Talep & Operasyon Hunisi</h3>
          </div>
          <span className="crm-v2-subtle">İlgili modüle gitmek için aşamaya tıklayın</span>
        </div>
        <div className="crm-v2-pipeline-grid">
          {pipelineStages.map((st) => (
            <button
              key={st.id}
              type="button"
              className="crm-v2-stage"
              onClick={() => onSelectTab(st.id)}
            >
              <div className="crm-v2-stage-bar" style={{ background: st.color }} />
              <div className="crm-v2-stage-top">
                <span>{st.label}</span>
                <strong>{st.count}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="crm-v2-grid">
        {/* Left: Filterable Action Queue */}
        <div className="crm-v2-card">
          <div className="crm-v2-card-head">
            <div>
              <h3>Bekleyen Aksiyon Kuyruğu</h3>
              <p>Hızlı inceleme ve onay akışı</p>
            </div>
            <div className="crm-v2-filter-pills">
              {[
                { id: 'ALL', label: 'Tümü' },
                { id: 'installers', label: 'Ustalar' },
                { id: 'leads', label: 'Teklifler' },
                { id: 'projects', label: 'Projeler' },
                { id: 'messages', label: 'Mesajlar' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setQueueFilter(f.id)}
                  className={`crm-v2-filter-btn ${queueFilter === f.id ? 'active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="crm-v2-empty">
              <CheckCircle2 size={28} color="#10b981" />
              <strong>Bu kategoride bekleyen kayıt yok</strong>
              <span>Tüm işlemler güncel görünüyor.</span>
            </div>
          ) : (
            <div className="crm-v2-list">
              {filteredQueue.map((item) => (
                <div key={item.key} className="crm-v2-row">
                  <div className={`crm-v2-avatar tone-${item.tone}`}>{item.initials}</div>
                  <div className="crm-v2-row-info">
                    <div className="crm-v2-row-title">{item.title}</div>
                    <div className="crm-v2-row-meta">{item.meta}</div>
                  </div>
                  <span className={`crm-v2-badge tone-${item.tone}`}>{item.tag}</span>
                  <button
                    type="button"
                    className="crm-v2-row-btn"
                    onClick={() => onSelectTab(item.tab)}
                  >
                    <span>Aç</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Ecosystem Donut + Quick Modules */}
        <div className="crm-v2-side">
          <div className="crm-v2-card">
            <div className="crm-v2-card-head">
              <div>
                <h3>Ekosistem Dağılımı</h3>
                <p>Aktif iş ortağı & usta ağı</p>
              </div>
              <Filter size={15} color="#94a3b8" />
            </div>

            <div className="crm-v2-donut-wrap">
              <div
                className="crm-v2-donut"
                style={{
                  background: `conic-gradient(
                    #059669 0% ${segDealers}%,
                    #b38e47 ${segDealers}% ${segDealers + segBrands}%,
                    #2563eb ${segDealers + segBrands}% ${segDealers + segBrands + segVerified}%,
                    #ef4444 ${segDealers + segBrands + segVerified}% 100%
                  )`,
                }}
              >
                <div className="crm-v2-donut-hole">
                  <strong>{dealers.length + brands.length + installerStats.total}</strong>
                  <span>Toplam Ağ</span>
                </div>
              </div>

              <div className="crm-v2-legend">
                <div className="crm-v2-legend-item">
                  <span className="dot" style={{ background: '#059669' }} />
                  <span>Yetkili Bayiler</span>
                  <strong>{dealers.length}</strong>
                </div>
                <div className="crm-v2-legend-item">
                  <span className="dot" style={{ background: '#b38e47' }} />
                  <span>Üretici Markalar</span>
                  <strong>{brands.length}</strong>
                </div>
                <div className="crm-v2-legend-item">
                  <span className="dot" style={{ background: '#2563eb' }} />
                  <span>Onaylı Ustalar</span>
                  <strong>{installerStats.verified}</strong>
                </div>
                <div className="crm-v2-legend-item">
                  <span className="dot" style={{ background: '#ef4444' }} />
                  <span>Bekleyen Usta</span>
                  <strong>{pendingInstallers.length}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="crm-v2-card">
            <div className="crm-v2-card-head">
              <div>
                <h3>Hızlı Modüller</h3>
                <p>Tek tıkla yönetim araçları</p>
              </div>
            </div>
            <div className="crm-v2-shortcuts">
              {quickModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    className="crm-v2-shortcut"
                    onClick={() => onSelectTab(mod.id)}
                  >
                    <div className="crm-v2-shortcut-ic">
                      <Icon size={15} />
                    </div>
                    <div>
                      <strong>{mod.label}</strong>
                      <span>{mod.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .crm-v2-root {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
        }

        .crm-v2-header-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px 28px;
          border-radius: 16px;
          background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.14), transparent 45%),
            linear-gradient(135deg, #0b1120 0%, #172033 100%);
          border: 1px solid #263248;
          color: #ffffff;
          box-shadow: 0 12px 30px -10px rgba(11, 17, 32, 0.35);
          flex-wrap: wrap;
        }
        .crm-v2-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fcd34d;
          font-size: 0.67rem;
          font-weight: 700;
          letter-spacing: 0.07em;
        }
        .crm-v2-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .crm-v2-header-copy h2 {
          margin: 10px 0 4px 0;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .crm-v2-header-copy p {
          margin: 0;
          font-size: 0.84rem;
          color: #94a3b8;
          max-width: 560px;
        }
        .crm-v2-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .crm-v2-pending-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 15px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
        }
        .crm-v2-pending-pill div {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .crm-v2-pending-pill strong {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
        }
        .crm-v2-pending-pill span {
          font-size: 0.69rem;
          color: #94a3b8;
        }
        .crm-v2-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 18px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b1120;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.28);
          transition: transform 0.15s ease;
        }
        .crm-v2-cta:hover {
          transform: translateY(-1px);
        }

        .crm-v2-kpi-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 1180px) {
          .crm-v2-kpi-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .crm-v2-kpi-row {
            grid-template-columns: 1fr;
          }
        }
        .crm-v2-kpi {
          text-align: left;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }
        .crm-v2-kpi:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -10px rgba(15, 23, 42, 0.1);
        }
        .crm-v2-kpi.has-alert {
          border-color: rgba(220, 38, 38, 0.25);
        }
        .crm-v2-kpi-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .crm-v2-kpi-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .crm-v2-kpi-val {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.05;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
        }
        .crm-v2-kpi-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 6px;
        }
        .crm-v2-kpi-delta {
          font-size: 0.74rem;
          color: #64748b;
          margin-top: 2px;
        }

        .crm-v2-pipeline-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 20px;
        }
        .crm-v2-pipeline-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .crm-v2-pipeline-head h3 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
        }
        .crm-v2-subtle {
          font-size: 0.73rem;
          color: #64748b;
        }
        .crm-v2-pipeline-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 900px) {
          .crm-v2-pipeline-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .crm-v2-stage {
          text-align: left;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .crm-v2-stage:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }
        .crm-v2-stage-bar {
          height: 3px;
          border-radius: 9999px;
          margin-bottom: 8px;
        }
        .crm-v2-stage-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.76rem;
          color: #475569;
          font-weight: 600;
        }
        .crm-v2-stage-top strong {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }

        .crm-v2-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .crm-v2-grid {
            grid-template-columns: 1fr;
          }
        }
        .crm-v2-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .crm-v2-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
        }
        .crm-v2-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 12px;
          margin-bottom: 14px;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
        }
        .crm-v2-card-head h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }
        .crm-v2-card-head p {
          margin: 2px 0 0 0;
          font-size: 0.74rem;
          color: #64748b;
        }

        .crm-v2-filter-pills {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .crm-v2-filter-btn {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 650;
          padding: 4px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .crm-v2-filter-btn.active {
          background: #0f172a;
          color: #fcd34d;
          border-color: #0f172a;
        }

        .crm-v2-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .crm-v2-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          transition: all 0.15s ease;
        }
        .crm-v2-row:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }
        .crm-v2-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.73rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .crm-v2-row-info {
          flex: 1;
          min-width: 0;
        }
        .crm-v2-row-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crm-v2-row-meta {
          font-size: 0.72rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crm-v2-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .tone-blue { background: rgba(37, 99, 235, 0.1); color: #1d4ed8; }
        .tone-purple { background: rgba(124, 58, 237, 0.1); color: #6d28d9; }
        .tone-red { background: rgba(220, 38, 38, 0.1); color: #b91c1c; }
        .tone-amber { background: rgba(217, 119, 6, 0.12); color: #b45309; }

        .crm-v2-row-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.73rem;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
        }
        .crm-v2-row-btn:hover {
          background: #0f172a;
          color: #fcd34d;
          border-color: #0f172a;
        }

        .crm-v2-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 30px 16px;
          color: #64748b;
          font-size: 0.8rem;
        }
        .crm-v2-empty strong {
          color: #0f172a;
          font-size: 0.9rem;
        }

        .crm-v2-donut-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .crm-v2-donut {
          width: 112px;
          height: 112px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .crm-v2-donut-hole {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1.1;
        }
        .crm-v2-donut-hole strong {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }
        .crm-v2-donut-hole span {
          font-size: 0.64rem;
          color: #64748b;
          font-weight: 600;
        }
        .crm-v2-legend {
          flex: 1;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .crm-v2-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          color: #475569;
        }
        .crm-v2-legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .crm-v2-legend-item strong {
          margin-left: auto;
          color: #0f172a;
          font-weight: 800;
        }

        .crm-v2-shortcuts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 520px) {
          .crm-v2-shortcuts {
            grid-template-columns: 1fr;
          }
        }
        .crm-v2-shortcut {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .crm-v2-shortcut:hover {
          background: #ffffff;
          border-color: #d4af37;
        }
        .crm-v2-shortcut-ic {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #0f172a;
          color: #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .crm-v2-shortcut strong {
          display: block;
          font-size: 0.77rem;
          font-weight: 700;
          color: #0f172a;
        }
        .crm-v2-shortcut span {
          display: block;
          font-size: 0.69rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
