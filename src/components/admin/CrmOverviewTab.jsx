'use client';

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
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  TrendingUp,
  Activity,
} from 'lucide-react';

/**
 * Executive CRM Dashboard Overview tab for the SeramikBak Admin Panel.
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
  const unreadMessages = contactMessages.filter((m) => m.status === 'UNREAD');
  const pendingSamples = sampleOrders.filter((o) => o.status === 'PENDING');
  const pendingCampaigns = campaigns.filter((c) => c.status === 'PENDING_APPROVAL');
  const pendingInstallers = adminInstallers.filter((i) => !i.isVerified);

  const kpiCards = [
    {
      id: 'leads',
      label: 'Teklif Talepleri',
      value: leads.length,
      sub: 'Müşteri & metraj talepleri',
      icon: FileText,
      accent: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.08)',
      badge: leads.length > 0 ? `${leads.length} Aktif` : null,
      badgeTone: 'blue',
    },
    {
      id: 'projects',
      label: 'Proje Talepleri',
      value: projects.length,
      sub: 'Mimar & müteahhit projeleri',
      icon: Building2,
      accent: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)',
      badge: projects.length > 0 ? `${projects.length} Talep` : null,
      badgeTone: 'purple',
    },
    {
      id: 'dealers',
      label: 'Bayi Teşkilatı',
      value: dealers.length,
      sub: 'Yetkili satıcı & showroom',
      icon: MapPin,
      accent: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
      badge: `${dealerSaasConfigs.length} SaaS`,
      badgeTone: 'green',
    },
    {
      id: 'installers',
      label: 'Seramik Ustaları',
      value: installerStats.total,
      sub: `${installerStats.verified} onaylı rehber ustası`,
      icon: Wrench,
      accent: installerStats.pending > 0 ? '#dc2626' : '#059669',
      bg: installerStats.pending > 0 ? 'rgba(220, 38, 38, 0.08)' : 'rgba(5, 150, 105, 0.08)',
      badge: installerStats.pending > 0 ? `${installerStats.pending} Onay Bekliyor` : 'Tümü Onaylı',
      badgeTone: installerStats.pending > 0 ? 'red' : 'green',
    },
    {
      id: 'contact_messages',
      label: 'Mesaj & Numune',
      value: unreadMessages.length + pendingSamples.length,
      sub: `${unreadMessages.length} mesaj · ${pendingSamples.length} numune`,
      icon: Mail,
      accent: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
      badge: pendingCampaigns.length > 0 ? `+${pendingCampaigns.length} Reklam` : 'Güncel',
      badgeTone: 'amber',
    },
    {
      id: 'products',
      label: 'Katalog & Markalar',
      value: adminProductsTotal,
      sub: `${brands.length} aktif üretici marka`,
      icon: Package,
      accent: '#b38e47',
      bg: 'rgba(179, 142, 71, 0.12)',
      badge: `${saasConfigs.length} Marka SaaS`,
      badgeTone: 'gold',
    },
  ];

  // Unified Action Queue (most recent pending items across CRM modules)
  const queueItems = [
    ...pendingInstallers.slice(0, 3).map((inst) => ({
      key: `inst-${inst.id}`,
      tab: 'installers',
      title: inst.name || inst.companyName || 'Usta Başvurusu',
      meta: `${inst.city || 'Türkiye'} · ${inst.phone || 'Telefon yok'}`,
      tag: 'Usta Onayı',
      tone: 'red',
      initials: (inst.name || 'U').slice(0, 2).toUpperCase(),
    })),
    ...leads.slice(0, 3).map((lead) => ({
      key: `lead-${lead.id}`,
      tab: 'leads',
      title: lead.customerName || lead.name || 'Teklif Talebi',
      meta: `${lead.city || 'Şehir belirtilmedi'} · ${lead.areaM2 ? `${lead.areaM2} m²` : 'Metraj talebi'}`,
      tag: 'Teklif',
      tone: 'blue',
      initials: (lead.customerName || lead.name || 'T').slice(0, 2).toUpperCase(),
    })),
    ...projects.slice(0, 3).map((proj) => ({
      key: `proj-${proj.id}`,
      tab: 'projects',
      title: proj.projectName || proj.companyName || proj.contactName || 'Proje Talebi',
      meta: `${proj.city || 'Proje'} · ${proj.totalM2 ? `${proj.totalM2} m²` : 'B2B İhale'}`,
      tag: 'Proje',
      tone: 'purple',
      initials: (proj.projectName || proj.companyName || 'P').slice(0, 2).toUpperCase(),
    })),
    ...unreadMessages.slice(0, 2).map((msg) => ({
      key: `msg-${msg.id}`,
      tab: 'contact_messages',
      title: msg.name || msg.email || 'İletişim Mesajı',
      meta: msg.subject || 'Okunmamış destek mesajı',
      tag: 'Mesaj',
      tone: 'amber',
      initials: (msg.name || 'M').slice(0, 2).toUpperCase(),
    })),
  ].slice(0, 7);

  const verifiedRatio =
    installerStats.total > 0
      ? Math.round((installerStats.verified / installerStats.total) * 100)
      : 0;

  const quickModules = [
    { id: 'architects', label: 'Mimarlık & Tasarım', desc: 'Ofis & BIM talepleri', icon: Compass },
    { id: 'campaigns', label: 'Sponsorlu Reklam', desc: `${pendingCampaigns.length} bekleyen onay`, icon: Sparkles },
    { id: 'sample_orders', label: 'Numune Talepleri', desc: `${pendingSamples.length} bekleyen kargo`, icon: Truck },
    { id: 'saas', label: 'SaaS Abonelikleri', desc: `${saasConfigs.length + dealerSaasConfigs.length} aktif lisans`, icon: CreditCard },
    { id: 'scraper', label: 'Ürün Kazıma', desc: 'Katalog & veri aktarımı', icon: Terminal },
    { id: 'system_monitor', label: 'Sağlık Monitörü', desc: 'API & sistem durumu', icon: Activity },
  ];

  return (
    <div className="crm-overview-wrap">
      {/* Executive Welcome Banner */}
      <div className="crm-hero-banner">
        <div className="crm-hero-left">
          <div className="crm-hero-pill">
            <span className="crm-live-dot" />
            <span>CANLI CRM KOMUTA MERKEZİ</span>
          </div>
          <h2>SeramikBak Operasyon & CRM Özeti</h2>
          <p>
            Teklif talepleri, B2B proje başvuruları, bayi ağı ve usta onaylarını tek ekrandan takip edin.
          </p>
        </div>
        <div className="crm-hero-actions">
          <div className="crm-alert-summary">
            <Clock size={16} />
            <div>
              <strong>{pendingAlertsCount}</strong>
              <span>Bekleyen İşlem</span>
            </div>
          </div>
          <button
            type="button"
            className="crm-primary-cta"
            onClick={() => onSelectTab(pendingInstallers.length > 0 ? 'installers' : 'leads')}
          >
            <span>{pendingInstallers.length > 0 ? 'Usta Onaylarına Git' : 'Teklifleri İncele'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 6-Card KPI Grid */}
      <div className="crm-kpi-grid">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              className="crm-kpi-card"
              onClick={() => onSelectTab(card.id)}
            >
              <div className="crm-kpi-top">
                <div className="crm-kpi-icon" style={{ background: card.bg, color: card.accent }}>
                  <Icon size={18} />
                </div>
                {card.badge && (
                  <span className={`crm-tone-badge tone-${card.badgeTone}`}>{card.badge}</span>
                )}
              </div>
              <div className="crm-kpi-value">{card.value}</div>
              <div className="crm-kpi-label">{card.label}</div>
              <div className="crm-kpi-sub">{card.sub}</div>
            </button>
          );
        })}
      </div>

      {/* 2-Column Workspace */}
      <div className="crm-workspace-grid">
        {/* Left: Bekleyen Aksiyon Kuyruğu */}
        <div className="crm-panel">
          <div className="crm-panel-header">
            <div>
              <h3>Bekleyen Aksiyon Kuyruğu</h3>
              <p>Öncelikli onay ve müşteri talepleri</p>
            </div>
            <span className="crm-panel-count">{queueItems.length} Kayıt</span>
          </div>

          {queueItems.length === 0 ? (
            <div className="crm-empty-state">
              <CheckCircle2 size={28} color="#10b981" />
              <strong>Tüm bekleyen işlemler tamamlandı</strong>
              <span>Şu anda onay veya yanıt bekleyen yeni kayıt bulunmuyor.</span>
            </div>
          ) : (
            <div className="crm-queue-list">
              {queueItems.map((item) => (
                <div key={item.key} className="crm-queue-row">
                  <div className={`crm-avatar tone-${item.tone}`}>{item.initials}</div>
                  <div className="crm-queue-info">
                    <div className="crm-queue-title">{item.title}</div>
                    <div className="crm-queue-meta">{item.meta}</div>
                  </div>
                  <span className={`crm-tone-badge tone-${item.tone}`}>{item.tag}</span>
                  <button
                    type="button"
                    className="crm-row-action"
                    onClick={() => onSelectTab(item.tab)}
                  >
                    <span>İncele</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Ekosistem Durumu & Hızlı Modüller */}
        <div className="crm-right-stack">
          <div className="crm-panel">
            <div className="crm-panel-header">
              <div>
                <h3>Ekosistem & Onay Sağlığı</h3>
                <p>Aktif ağ metrikleri</p>
              </div>
              <TrendingUp size={17} color="#b38e47" />
            </div>

            <div className="crm-metric-bars">
              <div className="crm-bar-item">
                <div className="crm-bar-label">
                  <span>Onaylı Usta Oranı</span>
                  <strong>%{verifiedRatio} ({installerStats.verified}/{installerStats.total})</strong>
                </div>
                <div className="crm-bar-track">
                  <div className="crm-bar-fill" style={{ width: `${verifiedRatio}%`, background: '#10b981' }} />
                </div>
              </div>

              <div className="crm-bar-item">
                <div className="crm-bar-label">
                  <span>Kayıtlı Bayi & Marka Ağı</span>
                  <strong>{dealers.length} Bayi · {brands.length} Marka</strong>
                </div>
                <div className="crm-bar-track">
                  <div
                    className="crm-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(15, (dealers.length + brands.length) * 2))}%`,
                      background: '#d4af37',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="crm-panel">
            <div className="crm-panel-header">
              <div>
                <h3>Hızlı CRM Modülleri</h3>
                <p>Doğrudan geçiş</p>
              </div>
              <ShieldCheck size={17} color="#64748b" />
            </div>

            <div className="crm-shortcuts-grid">
              {quickModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    className="crm-shortcut-btn"
                    onClick={() => onSelectTab(mod.id)}
                  >
                    <div className="crm-shortcut-icon">
                      <Icon size={15} />
                    </div>
                    <div className="crm-shortcut-text">
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
        .crm-overview-wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .crm-hero-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px 28px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          border: 1px solid #334155;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.18);
          flex-wrap: wrap;
        }

        .crm-hero-left h2 {
          margin: 8px 0 6px 0;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .crm-hero-left p {
          margin: 0;
          font-size: 0.85rem;
          color: #94a3b8;
          max-width: 560px;
          line-height: 1.5;
        }

        .crm-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(212, 175, 55, 0.14);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #fcd34d;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .crm-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .crm-hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .crm-alert-summary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
        }
        .crm-alert-summary div {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .crm-alert-summary strong {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
        }
        .crm-alert-summary span {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .crm-primary-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3);
        }
        .crm-primary-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.42);
        }

        .crm-kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .crm-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .crm-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .crm-kpi-card {
          text-align: left;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
        }
        .crm-kpi-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -8px rgba(15, 23, 42, 0.09);
        }
        .crm-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
        }
        .crm-kpi-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .crm-kpi-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .crm-kpi-label {
          font-size: 0.86rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 6px;
        }
        .crm-kpi-sub {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }

        .crm-tone-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .tone-blue { background: rgba(37, 99, 235, 0.1); color: #1d4ed8; }
        .tone-purple { background: rgba(124, 58, 237, 0.1); color: #6d28d9; }
        .tone-green { background: rgba(5, 150, 105, 0.1); color: #047857; }
        .tone-red { background: rgba(220, 38, 38, 0.1); color: #b91c1c; }
        .tone-amber { background: rgba(217, 119, 6, 0.12); color: #b45309; }
        .tone-gold { background: rgba(212, 175, 55, 0.16); color: #926f22; }

        .crm-workspace-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .crm-workspace-grid {
            grid-template-columns: 1fr;
          }
        }

        .crm-right-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .crm-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
        }

        .crm-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .crm-panel-header h3 {
          margin: 0;
          font-size: 0.96rem;
          font-weight: 800;
          color: #0f172a;
        }
        .crm-panel-header p {
          margin: 2px 0 0 0;
          font-size: 0.75rem;
          color: #64748b;
        }
        .crm-panel-count {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .crm-queue-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .crm-queue-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 11px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          transition: all 0.15s ease;
        }
        .crm-queue-row:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }
        .crm-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.74rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .crm-queue-info {
          flex: 1;
          min-width: 0;
        }
        .crm-queue-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crm-queue-meta {
          font-size: 0.73rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crm-row-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.74rem;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .crm-row-action:hover {
          background: #0f172a;
          color: #d4af37;
          border-color: #0f172a;
        }

        .crm-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 28px 16px;
          color: #64748b;
          font-size: 0.8rem;
        }
        .crm-empty-state strong {
          color: #0f172a;
          font-size: 0.9rem;
        }

        .crm-metric-bars {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .crm-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.76rem;
          color: #475569;
          margin-bottom: 6px;
        }
        .crm-bar-label strong {
          color: #0f172a;
          font-weight: 700;
        }
        .crm-bar-track {
          height: 8px;
          border-radius: 9999px;
          background: #f1f5f9;
          overflow: hidden;
        }
        .crm-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .crm-shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 520px) {
          .crm-shortcuts-grid {
            grid-template-columns: 1fr;
          }
        }
        .crm-shortcut-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }
        .crm-shortcut-btn:hover {
          background: #ffffff;
          border-color: #d4af37;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }
        .crm-shortcut-icon {
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
        .crm-shortcut-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .crm-shortcut-text strong {
          font-size: 0.77rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crm-shortcut-text span {
          font-size: 0.69rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
