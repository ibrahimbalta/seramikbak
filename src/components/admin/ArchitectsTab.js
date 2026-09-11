'use client';

import { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  FolderKanban, 
  Package, 
  Trash2, 
  RefreshCw, 
  Search, 
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';

export default function ArchitectsTab() {
  const [architects, setArchitects] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('PENDING_APPROVAL'); // 'ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchArchitects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/architects?status=${filter}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setArchitects(data.architects || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Fetch architects error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitects();
  }, [filter]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(id);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/admin/architects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({
          type: 'success',
          text: newStatus === 'APPROVED' ? 'Mimar hesabı başarıyla ONAYLANDI.' : 'Mimar başvurusu REDDEDİLDİ.'
        });
        fetchArchitects();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'İşlem başarısız.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, officeName) => {
    if (!confirm(`"${officeName}" kaydını ve tüm bağlı projelerini silmek istediğinize emin misiniz?`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/architects?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: 'Mimar kaydı silindi.' });
        fetchArchitects();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Silme işlemi başarısız.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Bağlantı hatası.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredList = architects.filter(arch => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      arch.officeName?.toLowerCase().includes(term) ||
      arch.name?.toLowerCase().includes(term) ||
      arch.email?.toLowerCase().includes(term) ||
      arch.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-grid animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Stats Banner */}
      <div className="admin-card glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={24} style={{ color: '#d4af37' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Mimarlar & İç Tasarımcılar (ArchStudio)
              </h2>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Portal üzerinden başvuru yapan mimarlık ofislerini inceleyin, onaylayın veya erişim yetkilerini yönetin.
            </p>
          </div>

          <button 
            onClick={fetchArchitects} 
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>

        {/* Status Filter Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => setFilter('PENDING_APPROVAL')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: filter === 'PENDING_APPROVAL' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
              background: filter === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b' }}>ONAY BEKLEYENLER</span>
              <Clock size={16} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f59e0b' }}>
              {counts.pending}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Yeni başvuran ofisler</span>
          </button>

          <button
            onClick={() => setFilter('APPROVED')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: filter === 'APPROVED' ? '2px solid #10b981' : '1px solid var(--border-color)',
              background: filter === 'APPROVED' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981' }}>ONAYLI MİMARLAR</span>
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10b981' }}>
              {counts.approved}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aktif stüdyo kullanıcıları</span>
          </button>

          <button
            onClick={() => setFilter('REJECTED')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: filter === 'REJECTED' ? '2px solid #ef4444' : '1px solid var(--border-color)',
              background: filter === 'REJECTED' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ef4444' }}>REDDEDİLENLER</span>
              <XCircle size={16} style={{ color: '#ef4444' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ef4444' }}>
              {counts.rejected}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Girişi engellenenler</span>
          </button>

          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: filter === 'ALL' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
              background: filter === 'ALL' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#3b82f6' }}>TÜMÜ</span>
              <Compass size={16} style={{ color: '#3b82f6' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>
              {counts.total}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam mimar arşivi</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: feedbackMsg.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="admin-card glass-panel" style={{ padding: '24px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '18px', position: 'relative', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Ofis adı, mimar, e-posta veya şehir ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div className="table-responsive">
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '12px 10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ofis & Mimar</th>
                <th style={{ padding: '12px 10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>İletişim</th>
                <th style={{ padding: '12px 10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Şehir / Oda No</th>
                <th style={{ padding: '12px 10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Projeler / Numuneler</th>
                <th style={{ padding: '12px 10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Durum</th>
                <th style={{ padding: '12px 10px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((arch) => {
                const isActionLoading = actionLoading === arch.id;
                const statusBadge = {
                  PENDING_APPROVAL: { text: 'Onay Bekliyor', bg: '#f59e0b', color: '#0f172a' },
                  APPROVED: { text: 'Onaylandı', bg: '#10b981', color: '#ffffff' },
                  REJECTED: { text: 'Reddedildi', bg: '#ef4444', color: '#ffffff' }
                }[arch.status] || { text: arch.status, bg: '#64748b', color: '#fff' };

                return (
                  <tr key={arch.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {arch.officeName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Award size={12} style={{ color: '#d4af37' }} />
                        <span>{arch.name}</span>
                        {arch.title && <span>({arch.title})</span>}
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{arch.email}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{arch.phone || '-'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{arch.city}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Oda No: {arch.chamberNo || '-'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.78rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)' }}>
                          <FolderKanban size={12} style={{ color: '#38bdf8' }} />
                          <strong>{arch.projects?.length || 0}</strong> Proje
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)' }}>
                          <Package size={12} style={{ color: '#a855f7' }} />
                          <strong>{arch.sampleOrders?.length || 0}</strong> Numune
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        background: statusBadge.bg,
                        color: statusBadge.color
                      }}>
                        {statusBadge.text}
                      </span>
                    </td>

                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {arch.status !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleUpdateStatus(arch.id, 'APPROVED')}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              background: '#e6f7ed',
                              color: '#10b981',
                              border: '1px solid #10b981',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Onayla
                          </button>
                        )}

                        {arch.status !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleUpdateStatus(arch.id, 'REJECTED')}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              background: '#fee2e2',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Reddet
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleDelete(arch.id, arch.officeName)}
                          title="Sil"
                          style={{
                            padding: '5px 8px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    {loading ? 'Yükleniyor...' : 'Kriterlere uygun mimar kaydı bulunamadı.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
