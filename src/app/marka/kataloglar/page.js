'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Activity,
  Layers,
  Box,
  BarChart3,
  Award,
  UploadCloud,
  Building2,
  Globe,
  TrendingUp,
  Users,
  Megaphone,
  Tag,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Search,
  Bell,
  HelpCircle
} from 'lucide-react';
import CatalogStudioTab from '@/components/brand/CatalogStudioTab';

export default function BrandCatalogsStandalonePage() {
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalogSubSection, setCatalogSubSection] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sb_brand_session');
      if (saved) {
        setBrandInfo(JSON.parse(saved));
      }
      const savedCollapsed = localStorage.getItem('sb_brand_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsSidebarCollapsed(savedCollapsed === 'true');
      }
    } catch (e) {
      console.error('Failed to parse brand session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sb_brand_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-amber-500 mb-2" />
      </div>
    );
  }

  if (!brandInfo) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Marka Oturumu Gerekli</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          Catalog Studio&apos;yu kullanabilmek ve markanıza ait dijital katalogları yönetmek için lütfen marka paneline giriş yapın.
        </p>
        <Link
          href="/marka"
          className="px-6 py-2.5 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-semibold text-sm transition"
        >
          Marka Girişine Git &rarr;
        </Link>
      </div>
    );
  }

  const initials = (brandInfo.name || 'SB')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f6f4] flex flex-col lg:flex-row font-sans text-neutral-900">
      {/* Left Dark Sidebar matching reference image */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-[70px]' : 'w-64'} bg-[#11151f] text-slate-300 flex-col justify-between flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-white/5 transition-all duration-200`}>
        <div>
          {/* Top Brand Logo & Collapse Toggle */}
          <div className={`p-4 flex items-center border-b border-white/10 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {isSidebarCollapsed ? (
              <button
                type="button"
                onClick={toggleSidebar}
                title="Menüyü Genişlet"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-[#b4823c] text-neutral-950 font-black flex items-center justify-center text-sm shadow cursor-pointer hover:scale-105 transition"
              >
                SB
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-[#b4823c] text-neutral-950 font-black flex items-center justify-center text-sm shadow">
                    SB
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                      SeramikBak
                    </span>
                    <span className="text-[10px] text-slate-400">Markalar İçin Dijital Çözümler</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Menüyü Daralt"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>

          {/* Marka Paneli PRO Header */}
          {!isSidebarCollapsed && (
            <div className="px-4 pt-4 pb-2">
              <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Marka Paneli</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#b4823c] text-white text-[9px] font-extrabold uppercase">
                    PRO
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 rotate-90" />
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="px-3 py-2 space-y-1 text-xs">
            <Link
              href="/marka"
              title="Gösterge Paneli"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition ${isSidebarCollapsed ? 'justify-center !px-0' : ''}`}
            >
              <Activity size={16} />
              {!isSidebarCollapsed && <span>Gösterge Paneli</span>}
            </Link>

            <Link
              href="/marka"
              title="Ürün Kataloğum"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition ${isSidebarCollapsed ? 'justify-center !px-0' : ''}`}
            >
              <Layers size={16} />
              {!isSidebarCollapsed && <span>Ürün Kataloğum</span>}
            </Link>

            {/* Active Dijital Kataloglar (Studio) with Sub-Tree */}
            <div>
              <button
                type="button"
                onClick={() => setCatalogSubSection('all')}
                title="Dijital Kataloglar (Studio)"
                className={`w-full flex items-center px-3 py-2.5 rounded-xl bg-[#b4823c]/25 border border-[#b4823c]/40 text-amber-300 font-bold ${
                  isSidebarCollapsed ? 'justify-center !px-0' : 'justify-between'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={16} />
                  {!isSidebarCollapsed && <span>Dijital Kataloglar (Studio)</span>}
                </span>
                {!isSidebarCollapsed && <ChevronRight size={14} className="rotate-90" />}
              </button>

              {!isSidebarCollapsed && (
                <div className="ml-5 mt-1.5 mb-2 pl-3 border-l border-[#b4823c]/40 space-y-1">
                  {[
                    { id: 'all', label: 'Tüm Kataloglar' },
                    { id: 'inquiries', label: 'Gelen Teklifler' },
                    { id: 'create', label: 'Yeni Katalog Oluştur' },
                    { id: 'templates', label: 'Şablonlar' },
                    { id: 'published', label: 'Yayınlananlar' },
                    { id: 'draft', label: 'Taslaklar' },
                    { id: 'archived', label: 'Arşiv' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setCatalogSubSection(sub.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer ${
                        catalogSubSection === sub.id
                          ? 'text-amber-300 font-bold bg-white/5'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          catalogSubSection === sub.id ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                      />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              { label: '3D Kiosk & Embed SDK', icon: Box },
              { label: 'Pazar Trend Raporları', icon: BarChart3 },
              { label: 'Marka Sağlığı & SEO', icon: Award },
              { label: 'Toplu Ürün & ERP', icon: UploadCloud },
              { label: 'B2B Proje Talepleri', icon: Building2 },
              { label: 'Küresel Ülke Analitiği', icon: Globe },
              { label: 'Bölgesel Trendler', icon: TrendingUp },
              { label: 'Satış & Bayi Yönetimi', icon: Users },
              { label: 'Reklam Yönetimi', icon: Megaphone },
              { label: 'Outlet & Seri Sonu', icon: Tag },
              { label: 'Lisans & Ödemeler', icon: CreditCard }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href="/marka"
                  title={item.label}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition ${isSidebarCollapsed ? 'justify-center !px-0' : ''}`}
                >
                  <Icon size={16} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Collapse Toggle & Copyright */}
        <div className="p-3 border-t border-white/10 space-y-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Paneli Genişlet" : "Paneli Daralt"}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-amber-400/90 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer ${
              isSidebarCollapsed ? 'justify-center !px-0' : 'justify-start'
            }`}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!isSidebarCollapsed && <span>Paneli Daralt</span>}
          </button>
          {!isSidebarCollapsed && (
            <>
              <Link href="/iletisim" className="flex items-center justify-between hover:text-white transition px-2 py-1">
                <span className="flex items-center gap-2">
                  <HelpCircle size={15} />
                  <span>Yardım & Destek</span>
                </span>
                <ChevronRight size={13} />
              </Link>
              <p className="text-[10px] text-slate-500 pt-1 px-2">SeramikBak &copy; {new Date().getFullYear()}</p>
            </>
          )}
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top White Header with Global Search & Profile */}
        <header className="bg-white border-b border-neutral-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 w-full max-w-lg">
            <button
              type="button"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Sol Menüyü Genişlet" : "Sol Menüyü Daralt (Geniş Çalışma Alanı)"}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                isSidebarCollapsed
                  ? 'bg-[#11151f] text-[#d4af37] border-[#d4af37]'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
              }`}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              <span className="hidden sm:inline">{isSidebarCollapsed ? 'Menüyü Aç' : 'Daralt'}</span>
            </button>
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Katalog, ürün, koleksiyon veya şablon ara..."
                className="w-full pl-9 pr-12 py-2 rounded-xl bg-neutral-100/80 border border-neutral-200/80 text-xs focus:bg-white focus:outline-none focus:border-[#b4823c]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-neutral-500 hover:bg-neutral-100">
              <Bell size={18} />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-neutral-900 leading-none">{brandInfo.name}</p>
                <span className="text-[10px] text-neutral-400">Marka Yöneticisi</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Studio Content */}
        <main className={`flex-1 p-3 sm:p-5 lg:p-6 w-full mx-auto ${isSidebarCollapsed ? 'max-w-none' : 'max-w-[1600px]'} transition-all`}>
          <CatalogStudioTab brandInfo={brandInfo} externalSubSection={catalogSubSection} />
        </main>
      </div>
    </div>
  );
}
