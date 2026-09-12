'use client';

import { useState, useEffect, use } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building2, 
  MapPin, 
  Calendar, 
  Check, 
  MessageSquare, 
  Sparkles,
  Maximize2,
  X,
  Phone,
  Mail,
  Share2
} from 'lucide-react';
import Image from 'next/image';

export default function ClientPresentationPage({ params }) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.projectId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [clientName, setClientName] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(null); // { item, action: 'approve' | 'revision' }
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load presentation data
  const loadData = async () => {
    try {
      const res = await fetch(`/api/architect/presentation/${projectId}`);
      if (!res.ok) {
        throw new Error('Sunum bulunamadı veya bağlantı süresi dolmuş.');
      }
      const data = await res.json();
      setProjectData(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Handle Client Approval or Revision Submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackModal) return;

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/architect/presentation/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: feedbackModal.item.id,
          action: feedbackModal.action,
          clientName: clientName || 'İşveren / Müşteri',
          clientNote: feedbackNote
        })
      });

      if (res.ok) {
        await loadData();
        setFeedbackModal(null);
        setFeedbackNote('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'İşlem gerçekleştirilemedi.');
      }
    } catch (err) {
      alert('Bağlantı hatası: ' + err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: '"Plus Jakarta Sans", sans-serif'
      }}>
        <Loader2 className="animate-spin" size={36} style={{ color: '#d4af37' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Mimari Sunum ve Onay Masası Yükleniyor...</p>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '20px',
        textAlign: 'center',
        fontFamily: '"Plus Jakarta Sans", sans-serif'
      }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Sunum Görüntülenemedi</h2>
        <p style={{ color: '#94a3b8', maxWidth: '420px', fontSize: '0.9rem' }}>
          {error || 'Bu projeye ait onay linki geçersiz veya kaldırılmış.'}
        </p>
      </div>
    );
  }

  const { title, projectType, city, totalAreaM2, architect, items } = projectData;
  const approvedCount = items.filter(i => i.approvalState === 'APPROVED').length;
  const totalCount = items.length;
  const approvalPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* WHITE-LABEL ARCHITECT HEADER */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                color: '#090d16',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.1rem'
              }}>
                {architect?.officeName ? architect.officeName.slice(0, 2).toUpperCase() : 'M'}
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '0.3px' }}>
                  {architect?.officeName || 'MİMARLIK OFİSİ'}
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                  {architect?.name ? `${architect.name} (${architect.title || 'Müellif Mimar'})` : 'Mimari Tasarım ve Uygulama Sunumu'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleCopyShareLink}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} />
              <span>{copiedLink ? 'Link Kopyalandı!' : 'Sunumu Paylaş'}</span>
            </button>

            {architect?.phone && (
              <a
                href={`tel:${architect.phone}`}
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#d4af37',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none'
                }}
              >
                <Phone size={14} />
                <span>Ofisle İletişim</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* PROJECT HERO & APPROVAL STATS */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px 20px 24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.5px' }}>
                <Sparkles size={13} />
                MİMARİ MALZEME & MAHAL ONAY DOSYASI
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: '0 0 8px 0' }}>
                {title}
              </h2>
              <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={14} /> {projectType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {city}
                </span>
                {totalAreaM2 && (
                  <span>Toplam Proje: <strong>{totalAreaM2} m²</strong></span>
                )}
              </div>
            </div>

            {/* Approval Progress Card */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '16px 20px',
              minWidth: '240px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>İşveren Onay Durumu</span>
                <span style={{ fontSize: '0.85rem', color: approvalPercent === 100 ? '#22c55e' : '#d4af37', fontWeight: '800' }}>
                  %{approvalPercent} Tamamlandı
                </span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  background: approvalPercent === 100 ? 'linear-gradient(90deg, #10b981, #22c55e)' : 'linear-gradient(90deg, #b38e47, #d4af37)',
                  width: `${approvalPercent}%`,
                  height: '100%',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '8px' }}>
                {approvedCount} / {totalCount} Mahal Karosu Onaylandı
              </div>
            </div>
          </div>

          {/* Client Identity Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>İşveren / Onaylayan:</span>
            <input
              type="text"
              placeholder="Adınızı veya Unvanınızı Girin (Örn: Ahmet Bey)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
                flex: 1,
                maxWidth: '320px'
              }}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              (Onay ve revizyonlarınız bu isimle mimarlık ofisine iletilecektir)
            </span>
          </div>
        </div>
      </div>

      {/* TILE SPACES GRID */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '20px 24px 80px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
            Mahal ve Malzeme Seçimleri ({items.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Lütfen her mahalin malzeme önerisini inceleyip onaylayınız.
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {items.map((item, idx) => {
            const p = item.product;
            const isApproved = item.approvalState === 'APPROVED';
            const hasRevision = item.approvalState === 'REVISION_REQUESTED';

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: isApproved 
                    ? '1.5px solid #22c55e' 
                    : (hasRevision ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)'),
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  boxShadow: isApproved ? '0 8px 24px rgba(34, 197, 94, 0.15)' : 'none'
                }}
              >
                {/* Image Showcase */}
                <div style={{ position: 'relative', height: '260px', background: '#0f172a' }}>
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      Görsel Hazırlanıyor
                    </div>
                  )}

                  {/* Usage Area Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(9, 13, 22, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#f8fafc',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {item.usageArea.toUpperCase()}
                  </div>

                  {/* Zoom Action */}
                  {p.imageUrl && (
                    <button
                      onClick={() => setZoomImage(p.imageUrl)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(9, 13, 22, 0.75)',
                        border: 'none',
                        color: '#fff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Maximize2 size={16} />
                    </button>
                  )}

                  {/* Approval Overlay Ribbon */}
                  {isApproved && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      background: 'rgba(34, 197, 94, 0.95)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <CheckCircle2 size={16} />
                      <span>İşveren Tarafından Onaylandı</span>
                    </div>
                  )}

                  {hasRevision && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      background: 'rgba(245, 158, 11, 0.95)',
                      color: '#090d16',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <AlertCircle size={16} />
                      <span>Revizyon / Değişiklik Notu İletildi</span>
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>
                        {p.brand?.name || 'Porselen Karo'}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: '2px 0 0 0' }}>
                        {p.name}
                      </h4>
                    </div>
                    {item.areaM2 && (
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '6px' }}>
                        {item.areaM2} m²
                      </span>
                    )}
                  </div>

                  {/* Technical Meta Specs */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 12px',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    margin: '12px 0'
                  }}>
                    <div>Ebat: <strong style={{ color: '#fff' }}>{p.width || 60}x{p.height || 120} cm</strong></div>
                    <div>Yüzey: <strong style={{ color: '#fff' }}>{p.finish || 'Mat'}</strong></div>
                    <div>Kalınlık: <strong style={{ color: '#fff' }}>{p.thickness || '9-10'} mm</strong></div>
                    <div>Kenar: <strong style={{ color: '#fff' }}>{p.rectified !== false ? 'Rektifiyeli' : 'Standart'}</strong></div>
                  </div>

                  {/* CSB Poz badge */}
                  {item.csbPoz && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '12px' }}>
                      Resmi Standart: <strong style={{ color: '#94a3b8' }}>{item.csbPoz.pozNo}</strong> ({item.csbPoz.standard})
                    </div>
                  )}

                  {/* Existing Notes */}
                  {item.notes && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderLeft: '3px solid #d4af37',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '14px',
                      lineHeight: '1.4'
                    }}>
                      {item.notes}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '10px' }}>
                    <button
                      onClick={() => setFeedbackModal({ item, action: 'approve' })}
                      style={{
                        flex: 1,
                        background: isApproved ? '#16a34a' : 'rgba(34, 197, 94, 0.15)',
                        border: isApproved ? 'none' : '1px solid rgba(34, 197, 94, 0.4)',
                        color: isApproved ? '#fff' : '#4ade80',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Check size={16} />
                      <span>{isApproved ? 'Onaylandı ✓' : 'Bu Karoyu Onayla'}</span>
                    </button>

                    <button
                      onClick={() => setFeedbackModal({ item, action: 'revision' })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#94a3b8',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      title="Değişiklik veya alternatif talep et"
                    >
                      <MessageSquare size={16} />
                      <span>Revize</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FEEDBACK & APPROVAL MODAL */}
      {feedbackModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {feedbackModal.action === 'approve' ? 'Seçimi Onayla' : 'Revizyon / Yorum İlet'}
              </h3>
              <button
                onClick={() => setFeedbackModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.45 }}>
              <strong>{feedbackModal.item.usageArea}</strong> için önerilen <strong>{feedbackModal.item.product.name}</strong> hakkında mimarlık ofisine iletilecek notunuz:
            </p>

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  İşveren / İsim Soyisim:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Adınız Soyadınız"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  {feedbackModal.action === 'approve' ? 'Onay Notu (Opsiyonel):' : 'Talep Edilen Değişiklik / Not:'}
                </label>
                <textarea
                  rows={4}
                  required={feedbackModal.action === 'revision'}
                  placeholder={feedbackModal.action === 'approve' ? 'Örn: Doku ve rengi beğendik, uygulamaya geçilebilir.' : 'Örn: Mat yerine yarı parlak doku tercih ediyoruz, alternatif bakabilir miyiz?'}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  style={{
                    flex: 1.5,
                    background: feedbackModal.action === 'approve' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {submittingAction ? <Loader2 className="animate-spin" size={16} /> : (feedbackModal.action === 'approve' ? 'Onayı İlet ✓' : 'Revizyonu Gönder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 110,
            cursor: 'zoom-out'
          }}
        >
          <img
            src={zoomImage}
            alt="Detay"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }}
          />
        </div>
      )}
    </div>
  );
}
