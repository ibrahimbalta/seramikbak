'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBell({ userType = 'DEALER', userId = null, title = 'Bildirimler', compact = false }) {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!supported) {
      alert('Bu tarayıcı anlık web bildirimlerini desteklemiyor.');
      return;
    }

    setLoading(true);
    setStatusMsg('');

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setStatusMsg('Bildirim izni verilmedi.');
        setTimeout(() => setStatusMsg(''), 3000);
        return;
      }

      // Register Push Subscription
      const reg = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('VAPID public key missing');
        // Fallback local notification
        new Notification('SeramikBak Bildirimleri Aktif!', {
          body: 'Yeni numune ve şartname talepleri anında ekranınıza düşecek.',
          icon: '/icon-192.png'
        });
        setStatusMsg('Bildirimler aktif!');
        setTimeout(() => setStatusMsg(''), 3000);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Save subscription to backend
      const res = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userType,
          userId
        })
      });

      if (res.ok) {
        setStatusMsg('Anlık bildirimler açıldı!');
        // Trigger immediate welcome notification via SW
        reg.showNotification('🔔 SeramikBak Bildirimleri Aktif!', {
          body: `${userType === 'ARCHITECT' ? 'Mimari' : 'Bayi'} portalı anlık bildirim sistemi hazır. Yeni talepler anında iletilecek.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      } else {
        setStatusMsg('Abonelik kaydedilemedi.');
      }
    } catch (err) {
      console.error('Push notification subscription error:', err);
      setStatusMsg('Bildirim servisine bağlanılamadı.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleSendTestPush = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          userId,
          title: '📦 [Test Bildirimi] SeramikBak Canlı Radar',
          body: '1.200 m² Calacatta 60x120 projesi için yeni bir numune inceleme talebi geldi!',
          url: userType === 'ARCHITECT' ? '/mimar' : '/bayi'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Test bildirimi iletildi!');
      } else {
        // Fallback local notification
        if (Notification.permission === 'granted') {
          new Notification('📦 [Test Bildirimi] SeramikBak', {
            body: 'Bildirim motoru çalışıyor! Yeni projeler anında ekranınızda belirecek.',
            icon: '/icon-192.png'
          });
          setStatusMsg('Yerel test bildirimi gönderildi!');
        } else {
          setStatusMsg('Önce bildirimlere izin vermelisiniz.');
        }
      }
    } catch (e) {
      setStatusMsg('Test bildirimi gönderilemedi.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  if (!supported) return null;

  const isGranted = permission === 'granted';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? '4px' : '8px' }}>
      <button
        onClick={handleToggleNotifications}
        disabled={loading}
        title={isGranted ? 'Bildirimler Aktif (Test Bildirimi Göndermek İçin Tıklayın)' : 'Web Anlık Bildirimlerini Aç'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? '0px' : '6px',
          background: isGranted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.12)',
          color: isGranted ? '#10b981' : '#d4af37',
          border: `1px solid ${isGranted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
          padding: compact ? '0' : '6px 12px',
          width: compact ? '34px' : 'auto',
          height: compact ? '34px' : 'auto',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: '700',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
          boxSizing: 'border-box'
        }}
      >
        {loading ? (
          <Loader2 size={compact ? 16 : 14} className="animate-spin" />
        ) : isGranted ? (
          <BellRing size={compact ? 16 : 14} style={{ color: '#10b981' }} />
        ) : (
          <Bell size={compact ? 16 : 14} style={{ color: '#d4af37' }} />
        )}

        {!compact && <span>{isGranted ? 'Bildirimler Açık' : 'Bildirimleri Aç'}</span>}

        {isGranted && (
          <span style={{
            position: compact ? 'absolute' : 'relative',
            top: compact ? '6px' : 'auto',
            right: compact ? '6px' : 'auto',
            width: '6px',
            height: '6px',
            background: '#10b981',
            borderRadius: '50%',
            boxShadow: '0 0 8px #10b981'
          }} />
        )}
      </button>

      {/* Quick Test Push button if already granted and not compact */}
      {isGranted && !compact && (
        <button
          onClick={handleSendTestPush}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            padding: '6px 8px',
            borderRadius: '8px',
            fontSize: '0.72rem',
            cursor: 'pointer'
          }}
          title="Bildirim Testi Yap"
        >
          Test Et
        </button>
      )}

      {statusMsg && (
        <span style={{ fontSize: '0.72rem', color: isGranted ? '#10b981' : '#d4af37', fontWeight: '600' }}>
          {statusMsg}
        </span>
      )}
    </div>
  );
}
