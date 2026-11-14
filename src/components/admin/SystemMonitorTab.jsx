'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Loader2,
  ShieldCheck,
  Database,
  Key,
  ExternalLink,
  Clock
} from 'lucide-react';

export default function SystemMonitorTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitor = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/system-monitor', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        setFeedback({ type: 'error', text: json.error || 'Monitör verisi alınamadı.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Sunucu ile bağlantı kurulamadı.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitor();
  }, [fetchMonitor]);

  // Auto-poll every 6 seconds when a CI run is queued or in_progress
  useEffect(() => {
    if (!autoRefresh || !data?.ci?.runs?.length) return;
    const hasActiveRun = data.ci.runs.some(
      (r) => r.status === 'queued' || r.status === 'in_progress'
    );
    if (!hasActiveRun) return;

    const timer = setInterval(() => {
      fetchMonitor(true);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRefresh, data, fetchMonitor]);

  const handleTriggerCI = async () => {
    setDispatching(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/system-monitor', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: 'success', text: json.message });
        setTimeout(() => fetchMonitor(true), 2500);
      } else {
        setFeedback({ type: 'error', text: json.error || 'Tetikleme başarısız.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'İstek gönderilirken hata oluştu.' });
    } finally {
      setDispatching(false);
    }
  };

  const renderBadge = (status, conclusion) => {
    if (status === 'queued' || status === 'in_progress') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
          background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a'
        }}>
          <Loader2 size={13} className="animate-spin" />
          {status === 'queued' ? 'Sırada' : 'Çalışıyor'}
        </span>
      );
    }
    if (conclusion === 'success' || status === 'PASS') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
          background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0'
        }}>
          <CheckCircle size={13} />
          Başarılı
        </span>
      );
    }
    if (status === 'WARN') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
          background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a'
        }}>
          <AlertCircle size={13} />
          Uyarı
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
        background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca'
      }}>
        <AlertCircle size={13} />
        {conclusion || status || 'Hata'}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: 20, borderRadius: 16, background: '#ffffff',
        border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={22} color="#b38e47" />
            Test, Derleme & Sistem Sağlığı Monitörü
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 4 }}>
            Canlı sunucu kontrollerini ve GitHub Actions CI (`npm test` + `next build`) sonuçlarını buradan takip edebilirsiniz.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Canlı Takip (6 sn)
          </label>
          <button
            type="button"
            onClick={() => fetchMonitor(false)}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
              background: '#f8fafc', color: '#0f172a', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
          <button
            type="button"
            onClick={handleTriggerCI}
            disabled={dispatching}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
            }}
          >
            {dispatching ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            CI Test & Build Çalıştır
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, fontSize: '0.84rem', fontWeight: 600,
          background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: feedback.type === 'success' ? '#15803d' : '#dc2626',
          border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {feedback.text}
        </div>
      )}

      {/* Live Server Probes */}
      <div style={{
        padding: 20, borderRadius: 16, background: '#ffffff',
        border: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="#059669" />
          Canlı Sunucu & Güvenlik Kontrolleri
        </h3>

        {loading && !data ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Kontroller çalıştırılıyor...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {(data?.probes || []).map((probe) => (
              <div key={probe.id} style={{
                padding: 14, borderRadius: 12, background: '#f8fafc',
                border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>{probe.name}</span>
                  {renderBadge(probe.status)}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>{probe.detail}</span>
              </div>
            ))}
          </div>
        )}

        {data?.envStatus && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={14} /> Ortam Değişkenleri Durumu
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.envStatus.map((env) => (
                <span key={env.key} style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                  background: env.configured ? '#ecfdf5' : '#fef2f2',
                  color: env.configured ? '#047857' : '#b91c1c',
                  border: `1px solid ${env.configured ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {env.configured ? '✓' : '✕'} {env.key}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GitHub Actions CI Monitor */}
      <div style={{
        padding: 20, borderRadius: 16, background: '#ffffff',
        border: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} color="#2563eb" />
            GitHub Actions CI (Otomatik Test & Build Akışı)
          </h3>
          {data?.checkedAt && (
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} />
              Son kontrol: {new Date(data.checkedAt).toLocaleTimeString('tr-TR')}
            </span>
          )}
        </div>

        {data?.ci && !data.ci.available ? (
          <div style={{ padding: 14, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.84rem' }}>
            {data.ci.error}
          </div>
        ) : data?.ci?.runs?.length === 0 ? (
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.84rem' }}>
            Henüz kayıtlı CI çalıştırması yok. İlk push veya tetiklemeden sonra sonuçlar burada görünecektir.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data?.ci?.runs || []).map((run) => (
              <div key={run.id} style={{
                padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>#{run.runNumber}</span>
                    {renderBadge(run.status, run.conclusion)}
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#475569', background: '#e2e8f0', padding: '2px 6px', borderRadius: 6 }}>
                      {run.commitSha}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({run.event})</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>
                    {run.commitMessage}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(run.createdAt).toLocaleString('tr-TR')}
                  </span>
                  <a
                    href={run.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none'
                    }}
                  >
                    Loglar <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
