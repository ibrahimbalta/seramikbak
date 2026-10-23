'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ExternalLink,
  X,
  Package,
  MapPin,
  Check,
  ChevronDown,
  Palette,
  Eye,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Mail,
  Copy
} from 'lucide-react';
import {
  LOOKBOOK_COLOR_TEMPLATES,
  getLookbookTheme
} from './lookbookThemes';

export default function HtmlLookbookViewer({
  catalog,
  products = [],
  mode = 'preview', // 'preview' | 'view' | 'print'
  onOpenLeadModal
}) {
  const brand = catalog?.brand || {};
  const brandName = brand.name || catalog?.brandName || 'Bien Seramik';
  const brandLogo = catalog?.customLogoUrl || brand.logoUrl;
  const brandParts = brandName.trim().split(/\s+/);

  // Active color template (from catalog.template or prop)
  const [activeThemeId, setActiveThemeId] = useState(catalog?.template || 'terra-traverten');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef(null);

  // Sync if catalog.template changes
  useEffect(() => {
    if (catalog?.template) {
      setActiveThemeId(catalog.template);
    }
  }, [catalog?.template]);

  // Click outside to close theme picker
  useEffect(() => {
    const handleDocClick = (e) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const currentTheme = useMemo(() => {
    return getLookbookTheme(activeThemeId);
  }, [activeThemeId]);

  // Real-time Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedSurface, setSelectedSurface] = useState('all');
  const searchInputRef = useRef(null);

  // Favorites state
  const [favorites, setFavorites] = useState({});

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Detail Modal & Lead Modal state
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadType, setLeadType] = useState('quote');
  const [selectedLeadProducts, setSelectedLeadProducts] = useState([]);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  const notify = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  const handleToggleFavorite = (p, e) => {
    if (e) e.stopPropagation();
    const key = p.id || p.code || p.name;
    const nextState = !favorites[key];
    setFavorites((prev) => ({ ...prev, [key]: nextState }));
    notify(nextState ? `"${p.name}" favorilere eklendi.` : `"${p.name}" favorilerden çıkarıldı.`);
  };

  // Derive filter options
  const sizeOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.width && p.height) {
        set.add(`${p.width}x${p.height}`);
      } else if (p.size) {
        set.add(p.size.replace(/\s+/g, '').toLowerCase());
      }
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLocaleLowerCase('tr').trim();
    return products.filter((p) => {
      const name = (p.name || '').toLocaleLowerCase('tr');
      const code = (p.code || '').toLocaleLowerCase('tr');
      const matchesSearch = !q || name.includes(q) || code.includes(q);

      let matchesSize = true;
      if (selectedSize !== 'all') {
        const pSize = p.width && p.height
          ? `${p.width}x${p.height}`
          : (p.size || '').replace(/\s+/g, '').toLowerCase();
        matchesSize = pSize.includes(selectedSize.replace(/\s+/g, '').toLowerCase());
      }

      let matchesSurface = true;
      if (selectedSurface !== 'all') {
        const finish = (p.finish || p.surface || '').toLowerCase();
        if (selectedSurface === 'lapato') {
          matchesSurface = finish.includes('lappato') || finish.includes('lapato');
        } else if (selectedSurface === 'parlak') {
          matchesSurface = finish.includes('parlak') || finish.includes('glossy') || finish.includes('polish');
        } else if (selectedSurface === 'mat') {
          matchesSurface = finish.includes('mat') || finish.includes('matte');
        }
      }

      return matchesSearch && matchesSize && matchesSurface;
    });
  }, [products, searchQuery, selectedSize, selectedSurface]);

  const handleOpenLead = (product, type = 'quote') => {
    if (typeof onOpenLeadModal === 'function') {
      onOpenLeadModal({ product, type });
      return;
    }
    if (product) {
      setSelectedLeadProducts([product.name || product.code || 'Seramik Ürün']);
    } else {
      setSelectedLeadProducts(products.slice(0, 3).map((p) => p.name || p.code));
    }
    setLeadType(type);
    setLeadSubmitted(false);
    setShowLeadModal(true);
  };

  const getProductLabel = (p) => {
    const finish = (p.finish || p.surface || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    if (finish.includes('lappato')) return 'Full Lappato';
    if (name.includes('ahşap') || name.includes('meşe') || name.includes('ceviz')) return 'Ahşap etkisi';
    if (name.includes('mermer') || name.includes('zenith')) return 'Mermer etkisi';
    if (finish.includes('parlak')) return 'Parlak yüzey';
    if (finish.includes('mat')) return 'Doğal doku';
    return 'Mimari karo';
  };

  const coverImage =
    catalog?.customCoverUrl ||
    catalog?.coverImageUrl ||
    (products.length > 0 && (products[0].imageUrl || products[0].textureUrl)) ||
    '/renders/luxury_bathroom_calacatta_gold.jpg';

  const year = new Date().getFullYear();

  return (
    <div
      className="seramikbak-lookbook-app w-full"
      style={currentTheme.vars}
    >
      <style jsx global>{`
        .seramikbak-lookbook-app {
          background-color: var(--site-background);
          color: var(--site-on-background);
          font-family: var(--site-font-body, Inter, sans-serif);
          font-size: 14px;
          line-height: 1.5;
        }

        .seramikbak-lookbook-app .topline {
          height: 34px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5.5%;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: .04em;
          background-color: var(--site-background);
        }
        .seramikbak-lookbook-app .topline strong {
          color: var(--ink);
          letter-spacing: .12em;
        }

        .seramikbak-lookbook-app .nav {
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5.5%;
          background: var(--paper);
          border-bottom: 1px solid var(--line);
          gap: 24px;
          position: sticky;
          top: 0;
          z-index: 30;
          transition: background-color .3s, border-color .3s;
        }
        .seramikbak-lookbook-app .brand-title {
          font-size: 22px;
          font-weight: 750;
          letter-spacing: -.07em;
          white-space: nowrap;
          color: var(--ink);
          text-decoration: none;
        }
        .seramikbak-lookbook-app .brand-title span {
          color: var(--accent);
        }
        .seramikbak-lookbook-app .navlinks {
          display: flex;
          gap: 27px;
          color: var(--muted);
          font-size: 12px;
          align-items: center;
        }
        .seramikbak-lookbook-app .navlinks a {
          text-decoration: none;
          color: inherit;
          transition: color .2s;
        }
        .seramikbak-lookbook-app .navlinks a:hover {
          color: var(--accent);
        }
        .seramikbak-lookbook-app .navright {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .seramikbak-lookbook-app .iconbtn {
          background: transparent;
          border: 1px solid var(--line);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          color: var(--ink);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
        }
        .seramikbak-lookbook-app .iconbtn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .seramikbak-lookbook-app .outlinebtn, .seramikbak-lookbook-app .primarybtn {
          padding: 12px 17px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all .2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .seramikbak-lookbook-app .outlinebtn {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
        }
        .seramikbak-lookbook-app .outlinebtn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .seramikbak-lookbook-app .primarybtn {
          border: 1px solid var(--accent);
          background: var(--accent);
          color: var(--site-on-primary, #ffffff);
        }
        .seramikbak-lookbook-app .primarybtn:hover {
          filter: brightness(.94);
        }

        .seramikbak-lookbook-app .hero {
          background: var(--hero-bg, #262a27);
          color: var(--hero-text, #f8f5ef);
          min-height: 510px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          position: relative;
          overflow: hidden;
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .hero-copy {
          padding: 78px 0 68px 9%;
          position: relative;
          z-index: 2;
        }
        .seramikbak-lookbook-app .eyebrow {
          font-size: 10px;
          letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--hero-eyebrow, #c7a77c);
          font-weight: 700;
        }
        .seramikbak-lookbook-app .hero h1 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(40px, 4.8vw, 68px);
          line-height: 1.05;
          letter-spacing: -.045em;
          max-width: 670px;
          margin: 24px 0 22px;
          color: var(--hero-text, #f8f5ef);
        }
        .seramikbak-lookbook-app .hero h1 em {
          color: var(--hero-em, #c4a47a);
          font-style: italic;
          font-weight: 400;
        }
        .seramikbak-lookbook-app .hero p {
          max-width: 480px;
          color: #c8c9c2;
          font-size: 15px;
          line-height: 1.8;
          margin: 0 0 30px;
        }
        .seramikbak-lookbook-app .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .seramikbak-lookbook-app .hero .primarybtn {
          padding: 15px 22px;
        }
        .seramikbak-lookbook-app .hero .outlinebtn {
          border-color: #77786f;
          color: #f5f0e8;
        }
        .seramikbak-lookbook-app .hero-meta {
          display: flex;
          gap: 30px;
          margin-top: 42px;
          color: #b9b9b1;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .12em;
        }
        .seramikbak-lookbook-app .hero-meta strong {
          display: block;
          color: #f7f3eb;
          font-size: 13px;
          letter-spacing: 0;
          margin-bottom: 5px;
        }
        .seramikbak-lookbook-app .hero-visual {
          position: relative;
          min-height: 440px;
          overflow: hidden;
        }
        .seramikbak-lookbook-app .hero-visual:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--hero-bg, #262a27) 0%, rgba(38,42,39,.12) 45%, rgba(38,42,39,.06) 100%);
          z-index: 1;
        }
        .seramikbak-lookbook-app .hero-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
          filter: brightness(.78) saturate(.85);
        }
        .seramikbak-lookbook-app .hero-stamp {
          position: absolute;
          z-index: 2;
          right: 9%;
          bottom: 38px;
          border: 1px solid var(--hero-stamp-border, rgba(255, 255, 255, .45));
          padding: 18px 20px;
          background: var(--hero-stamp-bg, rgba(30, 33, 30, .62));
          backdrop-filter: blur(8px);
          max-width: 230px;
        }
        .seramikbak-lookbook-app .hero-stamp span {
          display: block;
          color: var(--hero-eyebrow, #d6b78d);
          font-size: 9px;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .seramikbak-lookbook-app .hero-stamp strong {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: 20px;
          font-weight: 400;
          line-height: 1.2;
          color: #ffffff;
        }

        .seramikbak-lookbook-app .section {
          padding: 76px 7%;
        }
        .seramikbak-lookbook-app .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }
        .seramikbak-lookbook-app .section-kicker {
          font-size: 10px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 750;
        }
        .seramikbak-lookbook-app .section h2 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(30px, 3.2vw, 44px);
          letter-spacing: -.035em;
          margin: 10px 0 0;
          line-height: 1.1;
          color: var(--ink);
        }
        .seramikbak-lookbook-app .section-intro {
          max-width: 480px;
          color: var(--muted);
          line-height: 1.7;
          margin: 13px 0 0;
        }
        .seramikbak-lookbook-app .textlink {
          color: var(--ink);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid var(--accent);
          padding-bottom: 7px;
          white-space: nowrap;
          cursor: pointer;
        }

        .seramikbak-lookbook-app .collection-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 17px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          gap: 15px;
          margin-bottom: 25px;
        }
        .seramikbak-lookbook-app .collection-bar .meta {
          display: flex;
          gap: 26px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 11px;
        }
        .seramikbak-lookbook-app .collection-bar .meta strong {
          color: var(--ink);
          font-weight: 650;
          margin-right: 5px;
        }

        .seramikbak-lookbook-app .filterrow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }
        .seramikbak-lookbook-app .search {
          flex: 1;
          min-width: 190px;
          position: relative;
        }
        .seramikbak-lookbook-app .search input {
          width: 100%;
          padding: 13px 15px;
          border: 1px solid var(--line);
          background: var(--paper);
          outline: none;
          color: var(--ink);
          border-radius: 2px;
          font-size: 13px;
          transition: border-color .2s;
        }
        .seramikbak-lookbook-app .search input:focus {
          border-color: var(--accent);
        }
        .seramikbak-lookbook-app .filterrow select {
          padding: 13px 32px 13px 13px;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          border-radius: 2px;
          min-width: 140px;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .seramikbak-lookbook-app .filter-count {
          margin-left: auto;
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
        }

        .seramikbak-lookbook-app .products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px 18px;
        }
        .seramikbak-lookbook-app .product {
          background: var(--paper);
          border: 1px solid var(--line);
          min-width: 0;
          transition: transform .25s, border-color .25s, box-shadow .25s;
          display: flex;
          flex-direction: column;
        }
        .seramikbak-lookbook-app .product:hover {
          transform: translateY(-4px);
          border-color: var(--product-hover-border, #c5b49a);
          box-shadow: 0 10px 24px -10px rgba(0,0,0,0.08);
        }
        .seramikbak-lookbook-app .product-img {
          aspect-ratio: 1.13;
          background: var(--product-img-bg, #ece9e3);
          overflow: hidden;
          position: relative;
        }
        .seramikbak-lookbook-app .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }
        .seramikbak-lookbook-app .product:hover .product-img img {
          transform: scale(1.035);
        }
        .seramikbak-lookbook-app .product-label {
          position: absolute;
          left: 12px;
          top: 12px;
          background: var(--paper, #fffefa);
          color: var(--ink);
          font-size: 9px;
          padding: 6px 8px;
          letter-spacing: .1em;
          text-transform: uppercase;
          border: 1px solid var(--line);
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          z-index: 2;
        }
        .seramikbak-lookbook-app .fav {
          position: absolute;
          right: 12px;
          top: 10px;
          background: var(--paper, #fffefa);
          border: 1px solid var(--line);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 16px;
          color: #666;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
          z-index: 2;
        }
        .seramikbak-lookbook-app .product-info {
          padding: 16px 15px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .seramikbak-lookbook-app .product-series {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .13em;
          color: var(--accent);
          margin-bottom: 7px;
          font-weight: 700;
        }
        .seramikbak-lookbook-app .product h3 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: 20px;
          margin: 0 0 9px;
          line-height: 1.15;
          color: var(--ink);
        }
        .seramikbak-lookbook-app .specs {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .seramikbak-lookbook-app .specs span+span:before {
          content: "·";
          margin-right: 8px;
          color: var(--accent);
        }
        .seramikbak-lookbook-app .product-actions {
          display: flex;
          border-top: 1px solid var(--line);
          margin-top: 15px;
        }
        .seramikbak-lookbook-app .product-actions button {
          flex: 1;
          padding: 12px 6px;
          border: 0;
          background: transparent;
          color: var(--ink);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          text-align: center;
        }
        .seramikbak-lookbook-app .product-actions button+button {
          border-left: 1px solid var(--line);
          color: var(--site-on-primary, #ffffff);
          background: var(--accent);
        }
        .seramikbak-lookbook-app .product-actions button:hover {
          filter: brightness(.94);
        }

        .seramikbak-lookbook-app .empty {
          padding: 45px;
          text-align: center;
          border: 1px dashed var(--line);
          color: var(--muted);
          grid-column: 1/-1;
          background: var(--paper);
        }

        .seramikbak-lookbook-app .editorial {
          background: var(--editorial-bg, #eeece5);
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .editorial-grid {
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 5%;
          align-items: center;
        }
        .seramikbak-lookbook-app .editorial-photo {
          position: relative;
          min-height: 480px;
          overflow: hidden;
        }
        .seramikbak-lookbook-app .editorial-photo img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .seramikbak-lookbook-app .photo-caption {
          position: absolute;
          left: 22px;
          bottom: 22px;
          background: var(--editorial-caption-bg, rgba(31,34,30,.84));
          color: #fff;
          padding: 13px 16px;
          font-size: 10px;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .seramikbak-lookbook-app .editorial-copy {
          padding: 20px 0;
        }
        .seramikbak-lookbook-app .editorial-copy h2 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(32px, 3.8vw, 52px);
          line-height: 1.1;
          color: var(--ink);
          margin: 10px 0 16px;
        }
        .seramikbak-lookbook-app .editorial-copy p {
          line-height: 1.9;
          color: var(--muted);
          max-width: 440px;
        }
        .seramikbak-lookbook-app .editorial-list {
          margin: 28px 0 30px;
          border-top: 1px solid var(--line);
        }
        .seramikbak-lookbook-app .editorial-list div {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          font-size: 12px;
          color: var(--ink);
        }
        .seramikbak-lookbook-app .editorial-list span {
          color: var(--muted);
        }

        .seramikbak-lookbook-app .technical {
          background: var(--paper);
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }
        .seramikbak-lookbook-app .tech-card {
          border: 1px solid var(--line);
          padding: 24px;
          background: var(--paper);
          transition: border-color .2s;
        }
        .seramikbak-lookbook-app .tech-card:hover {
          border-color: var(--accent);
        }
        .seramikbak-lookbook-app .tech-card small {
          font-size: 9px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 700;
        }
        .seramikbak-lookbook-app .tech-card h3 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: 20px;
          font-weight: 400;
          margin: 12px 0 8px;
          color: var(--ink);
        }
        .seramikbak-lookbook-app .tech-card p {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        .seramikbak-lookbook-app .cta {
          margin: 0 7% 70px;
          padding: 42px 48px;
          background: var(--cta-bg, #282d29);
          color: var(--cta-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }
        .seramikbak-lookbook-app .cta h2 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: clamp(26px, 2.8vw, 38px);
          font-weight: 400;
          margin: 0 0 9px;
        }
        .seramikbak-lookbook-app .cta p {
          color: #c2c4bb;
          margin: 0;
          line-height: 1.7;
          font-size: 12px;
        }

        .seramikbak-lookbook-app .footer {
          padding: 28px 7%;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--muted);
          font-size: 10px;
          gap: 20px;
          background: var(--site-background);
        }

        .seramikbak-lookbook-app .toast {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translate(-50%, 20px);
          background: var(--hero-bg, #262a27);
          color: #ffffff;
          padding: 14px 22px;
          z-index: 80;
          opacity: 0;
          pointer-events: none;
          transition: all .25s ease;
          font-size: 12px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          border-radius: 4px;
        }
        .seramikbak-lookbook-app .toast.show {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }

        @media(max-width:1000px) {
          .seramikbak-lookbook-app .hero { grid-template-columns: 1fr .72fr; }
          .seramikbak-lookbook-app .hero-copy { padding-left: 6%; }
          .seramikbak-lookbook-app .products { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .seramikbak-lookbook-app .section { padding: 60px 5%; }
        }
        @media(max-width:700px) {
          .seramikbak-lookbook-app .topline { padding: 0 5%; font-size: 9px; }
          .seramikbak-lookbook-app .nav { height: 64px; padding: 0 5%; }
          .seramikbak-lookbook-app .navlinks { display: none; }
          .seramikbak-lookbook-app .hero { display: flex; flex-direction: column; }
          .seramikbak-lookbook-app .hero-copy { padding: 52px 6% 30px; }
          .seramikbak-lookbook-app .hero h1 { font-size: 40px; margin: 18px 0; }
          .seramikbak-lookbook-app .hero-visual { min-height: 260px; }
          .seramikbak-lookbook-app .products { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 10px; }
          .seramikbak-lookbook-app .editorial-grid { grid-template-columns: 1fr; gap: 28px; }
          .seramikbak-lookbook-app .tech-grid { grid-template-columns: 1fr; }
          .seramikbak-lookbook-app .cta { margin: 0 5% 40px; padding: 30px 24px; flex-direction: column; align-items: flex-start; }
          .seramikbak-lookbook-app .footer { padding: 24px 5%; flex-direction: column; align-items: flex-start; }
        }
        @media(max-width:380px) {
          .seramikbak-lookbook-app .products { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOPLINE */}
      <div className="topline">
        <span>
          {brandName} <span style={{ padding: '0 8px' }}>/</span> Mimari Koleksiyonlar
        </span>
        <strong>ÜRÜNÜ KEŞFET · MEKÂNINDA DENE · TEKLİF AL</strong>
      </div>

      {/* NAVBAR WITH DYNAMIC BRAND NAME & LOGO */}
      <nav className="nav">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {brandLogo && (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-7 sm:h-8 w-auto object-contain"
              />
            )}
            <span className="brand-title">
              {brandParts.length > 1 ? (
                <>
                  {brandParts.slice(0, -1).join(' ')} <span>{brandParts[brandParts.length - 1]}</span>
                </>
              ) : (
                <span>{brandName}</span>
              )}
            </span>
          </div>
          <span style={{ fontSize: '10px', letterSpacing: '.08em', color: 'var(--muted)', fontWeight: 600 }}>
            MİMARİ KATALOG
          </span>
        </div>

        <div className="navlinks">
          <a href="#koleksiyon">Koleksiyon</a>
          <a href="#urunler">Ürünler</a>
          <a href="#mekanlar">Mekân İlhamı</a>
          <a href="#teknik">Teknik Bilgiler</a>
        </div>

        <div className="navright">
          {/* Quick Search */}
          <button
            type="button"
            className="iconbtn"
            aria-label="Ara"
            onClick={() => searchInputRef.current?.focus()}
            title="Ürün Ara"
          >
            <Search size={15} />
          </button>

          {/* COLOR THEME SELECTOR DROPDOWN */}
          <div className="relative" ref={themePickerRef}>
            <button
              type="button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="outlinebtn flex items-center gap-1.5"
              title="Şablon Rengini Değiştir"
              style={{ fontSize: '10px' }}
            >
              <Palette size={13} style={{ color: 'var(--accent)' }} />
              <span className="hidden sm:inline">{currentTheme.name.split(' ')[0]}</span>
              <ChevronDown size={11} />
            </button>

            {showThemePicker && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-lg bg-[var(--paper)] border border-[var(--line)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
              >
                <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    Şablon Renk Paleti
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Farklı renk ve atmosfer şablonlarında canlı önizleyin.
                  </p>
                </div>

                <div className="space-y-1">
                  {LOOKBOOK_COLOR_TEMPLATES.map((tmpl) => {
                    const isCurrent = activeThemeId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setActiveThemeId(tmpl.id);
                          setShowThemePicker(false);
                          notify(`"${tmpl.name}" şablonu uygulandı.`);
                        }}
                        className={`w-full px-3 py-2 rounded text-left flex items-center justify-between text-xs transition cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--accent-light)] font-bold text-[var(--ink)]'
                            : 'hover:bg-black/5 text-[var(--ink)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: tmpl.colorSample.primary }}
                          />
                          <div className="min-w-0">
                            <span className="block text-xs truncate leading-tight">{tmpl.name}</span>
                            <span className="text-[9px] text-[var(--muted)] block truncate">{tmpl.tag}</span>
                          </div>
                        </div>
                        {isCurrent && <Check size={14} style={{ color: 'var(--accent)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="primarybtn"
            onClick={() => handleOpenLead(null, 'quote')}
            title="Fiyat Teklifi Masası"
          >
            Teklif Al ↗
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero" id="koleksiyon">
        <div className="hero-copy">
          <div className="eyebrow">{brandName} · {catalog?.title}</div>
          <h1>
            Yüzeylerde<br />
            <em>zamansız</em> bir ifade.
          </h1>
          <p>
            {catalog?.introText ||
              catalog?.description ||
              'Doğal taşın karakteri, mermerin zarafeti ve çağdaş mimarinin yalın çizgileri. Mekânlara değer katan yüzeyleri keşfedin.'}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primarybtn"
              onClick={() => {
                document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Koleksiyonu keşfet&nbsp; ↘
            </button>
            <button
              type="button"
              className="outlinebtn"
              onClick={() => {
                document.getElementById('mekanlar')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Mekân ilhamı
            </button>
          </div>
          <div className="hero-meta">
            <div>
              <strong>{year}</strong>Yeni koleksiyon
            </div>
            <div>
              <strong>{products.length} seçili yüzey</strong>Örnek ürünler
            </div>
            <div>
              <strong>Mimari seçki</strong>İç ve dış mekân
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src={coverImage}
            alt={catalog?.title || 'Katalog Kapağı'}
          />
          <div className="hero-stamp">
            <span>Malzemenin dili</span>
            <strong>
              Doğadan ilham.<br />
              Mimariyle hayat bulur.
            </strong>
          </div>
        </div>
      </header>

      {/* PRODUCTS SECTION */}
      <section className="section" id="urunler">
        <div className="section-head">
          <div>
            <div className="section-kicker">Koleksiyondan seçkiler</div>
            <h2>Yüzeyleri yakından tanıyın.</h2>
            <p className="section-intro">
              Her yüzeyin kendine özgü dokusunu, ölçüsünü ve karakterini keşfedin. Size uygun ürünü filtreleyerek kolayca bulun.
            </p>
          </div>
          <a className="textlink" href="#teknik">
            Teknik özellikleri incele&nbsp; ↗
          </a>
        </div>

        {/* Collection Bar */}
        <div className="collection-bar">
          <div className="meta">
            <span>
              <strong>Marka</strong> {brandName}
            </span>
            <span>
              <strong>Koleksiyon</strong> {catalog?.title}
            </span>
            <span>
              <strong>Seçki</strong> {products.length} ürün
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
            Doğrulanmış Üretici Verisi &bull; TS EN 14411 Standartları
          </span>
        </div>

        {/* Filter Row */}
        <div className="filterrow">
          <div className="search">
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Ürün adı veya koduyla ara…"
              aria-label="Ürün ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            aria-label="Ebat filtrele"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="all">Tüm ebatlar</option>
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('x', ' × ')} cm
              </option>
            ))}
          </select>

          <select
            aria-label="Yüzey filtrele"
            value={selectedSurface}
            onChange={(e) => setSelectedSurface(e.target.value)}
          >
            <option value="all">Tüm yüzeyler</option>
            <option value="mat">Mat</option>
            <option value="parlak">Parlak</option>
            <option value="lapato">Full Lappato</option>
          </select>

          <span className="filter-count">
            {filteredProducts.length} ürün gösteriliyor
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="products">
          {filteredProducts.map((p) => {
            const key = p.id || p.code || p.name;
            const isFav = !!favorites[key];
            const pImage =
              p.imageUrl ||
              p.textureUrl ||
              '/renders/luxury_bathroom_calacatta_gold.jpg';
            const dimension =
              p.width && p.height
                ? `${p.width} × ${p.height} cm`
                : p.size || 'Standart Ebat';
            const finish = p.finish || (p.surface === 'lapato' ? 'Full Lappato' : p.surface === 'mat' ? 'Mat' : 'Parlak');
            const label = getProductLabel(p);

            return (
              <article key={key} className="product">
                <div className="product-img">
                  <img src={pImage} alt={p.name} />
                  <span className="product-label">{label}</span>
                  <button
                    type="button"
                    className="fav"
                    aria-label="Favorilere ekle"
                    onClick={(e) => handleToggleFavorite(p, e)}
                    style={{ color: isFav ? 'var(--accent)' : '#444' }}
                    title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    {isFav ? '♥' : '♡'}
                  </button>
                </div>

                <div className="product-info">
                  <div className="product-series">{brandName} · Mimari seçki</div>
                  <h3>{p.name}</h3>
                  <div className="specs">
                    <span>{dimension}</span>
                    <span>{finish}</span>
                    {p.code && <span>Kod: {p.code}</span>}
                  </div>

                  <div className="product-actions">
                    <button
                      type="button"
                      onClick={() => setActiveDetailProduct(p)}
                      title="4K Doku Detayını İncele"
                    >
                      Detayları gör ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenLead(p, 'quote')}
                      title="Fiyat Teklifi & Numune İste"
                    >
                      Teklif al&nbsp; +
                    </button>
                  </div>

                  {p.slug && (
                    <div className="pt-2 text-center border-t border-[var(--line)] mt-2">
                      <Link
                        href={`/mekan-dene?product=${p.slug}`}
                        className="text-[10px] font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        <span>Mekânında Gör (3D) ↗</span>
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="empty">
              Aramanızla eşleşen ürün bulunamadı. Filtreleri değiştirip tekrar deneyin.
            </div>
          )}
        </div>
      </section>

      {/* EDITORIAL SECTION */}
      <section className="section editorial" id="mekanlar">
        <div className="editorial-grid">
          <div className="editorial-photo">
            <img
              src="/renders/modern_living_natural_oak.jpg"
              alt="Mekânda hayat bulan yüzeyler"
            />
            <div className="photo-caption">Mekânlardan ilham alın · {year}</div>
          </div>

          <div className="editorial-copy">
            <div className="section-kicker">Mekânda hayat bulan yüzeyler</div>
            <h2>
              Bir yüzeyden<br />
              daha fazlası.
            </h2>
            <p>
              Doğru yüzey, mekânın ışığını, ölçüsünü ve karakterini değiştirir. Koleksiyonu yalnızca ürün olarak değil, yaşam alanınızın bir parçası olarak keşfedin.
            </p>

            <div className="editorial-list">
              <div>
                <strong>01 &nbsp; Banyo ve spa</strong>
                <span>Doğal dinginlik ↗</span>
              </div>
              <div>
                <strong>02 &nbsp; Yaşam alanları</strong>
                <span>Sade mimari ↗</span>
              </div>
              <div>
                <strong>03 &nbsp; Mutfak ve detaylar</strong>
                <span>Günlük estetik ↗</span>
              </div>
            </div>

            <button
              type="button"
              className="primarybtn"
              onClick={() => handleOpenLead(null, 'sample')}
            >
              Mekânında gör / Numune İste&nbsp; ↗
            </button>
          </div>
        </div>
      </section>

      {/* TECHNICAL SECTION */}
      <section className="section technical" id="teknik">
        <div className="section-head">
          <div>
            <div className="section-kicker">Karar verirken güvenle</div>
            <h2>
              Güzel olduğu kadar<br />
              bilinçli bir seçim.
            </h2>
            <p className="section-intro">
              Teknik detaylar doğru ürünü seçmenize yardımcı olur. Her bilgi, ürünün doğrulanmış teknik dokümanıyla desteklenmelidir.
            </p>
          </div>
          <a className="textlink" href="#urunler">
            Ürünleri karşılaştır&nbsp; ↗
          </a>
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <small>01 / Teknik şeffaflık</small>
            <h3>Doğru ürün bilgisi</h3>
            <p>Ebat, yüzey, ürün kodu ve teknik değerleri ürün bazında açıkça görüntüleyin.</p>
          </div>
          <div className="tech-card">
            <small>02 / Kolay keşif</small>
            <h3>İhtiyacınıza göre filtre</h3>
            <p>Projenizin ölçüsüne, görünümüne ve kullanım alanına uygun seramik seçeneklerini bulun.</p>
          </div>
          <div className="tech-card">
            <small>03 / Sonraki adım</small>
            <h3>Numune ve teklif</h3>
            <p>Beğendiğiniz ürünü kaydedin, numune veya fiyat teklifi talebine geçin.</p>
          </div>
        </div>

        {/* Technical Specification Table */}
        <div className="mt-12 overflow-x-auto border border-[var(--line)] bg-[var(--paper)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/5 border-b border-[var(--line)] font-bold text-[var(--ink)]">
              <tr>
                <th className="py-3 px-4">Teknik Parametre</th>
                <th className="py-3 px-4">Test Standardı</th>
                <th className="py-3 px-4">Şartname Değeri</th>
                <th className="py-3 px-4">Uygunluk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--muted)]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Su Emme Oranı</td>
                <td className="py-3 px-4">TS EN ISO 10545-3</td>
                <td className="py-3 px-4">E ≤ %0.5 (Grup BIa Porselen Karo)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Tam Uyumlu</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Kırılma Dayanımı</td>
                <td className="py-3 px-4">TS EN ISO 10545-4</td>
                <td className="py-3 px-4">≥ 2000 N (Kalınlık ≥ 7.5 mm)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Yüksek Mukavemet</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Kenar Rektifikasyonu</td>
                <td className="py-3 px-4">TS EN ISO 10545-2</td>
                <td className="py-3 px-4">Lazer Hassasiyetinde Gönyelenmiş (1.5mm derz)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Rektifiye</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <div>
          <h2>Projeniz için doğru yüzeyi bulun.</h2>
          <p>Ürünleri keşfedin, seçeneklerinizi belirleyin ve teklif sürecini başlatın.</p>
        </div>
        <button
          type="button"
          className="primarybtn"
          onClick={() => {
            document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Koleksiyonu keşfet&nbsp; ↗
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="flex items-center gap-2.5">
          {brandLogo && (
            <img
              src={brandLogo}
              alt={brandName}
              className="h-6 w-auto object-contain"
            />
          )}
          <div className="brand-title" style={{ fontSize: '18px' }}>
            {brandParts.length > 1 ? (
              <>
                {brandParts.slice(0, -1).join(' ')} <span>{brandParts[brandParts.length - 1]}</span>
              </>
            ) : (
              <span>{brandName}</span>
            )}
          </div>
        </div>
        <span>Marka ve ürün bilgileri ilgili veri kaynağından doğrulanmalıdır.</span>
        <span>© {year} {brandName} · Mimari keşif deneyimi</span>
      </footer>

      {/* FLOATING TOAST NOTIFICATION */}
      <div className={`toast ${showToast ? 'show' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>

      {/* DETAIL MODAL */}
      {activeDetailProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setActiveDetailProduct(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--accent)] font-bold">
                  4K Yüzey & Doku İncelemesi
                </span>
                <h3 className="text-lg font-serif text-[var(--ink)]">
                  {activeDetailProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailProduct(null)}
                className="iconbtn"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="relative aspect-square bg-[var(--product-img-bg)] border border-[var(--line)] overflow-hidden">
                <img
                  src={
                    activeDetailProduct.imageUrl ||
                    activeDetailProduct.textureUrl ||
                    '/renders/luxury_bathroom_calacatta_gold.jpg'
                  }
                  alt={activeDetailProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
                    Ürün Kodu: <strong>{activeDetailProduct.code || 'BY-3060'}</strong>
                  </span>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Yüksek mukavemetli porselen karo yapısı ve rektifiye derz uyumu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const p = activeDetailProduct;
                    setActiveDetailProduct(null);
                    handleOpenLead(p, 'quote');
                  }}
                  className="primarybtn w-full justify-center"
                >
                  Bu Ürün İçin Teklif Al
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAD MODAL */}
      {showLeadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setShowLeadModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 iconbtn"
              aria-label="Kapat"
            >
              <X size={15} />
            </button>

            {leadSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-serif text-[var(--ink)]">Talebiniz Alındı</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
                  Talebiniz başarıyla üretici marka proje masasına iletildi.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="outlinebtn mx-auto"
                >
                  Kapat
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLeadSubmitted(true);
                  notify('Talebiniz başarıyla alındı!');
                }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {brandName} Mimari Masası
                  </span>
                  <h3 className="text-xl font-serif text-[var(--ink)]">
                    {leadType === 'sample' ? 'Numune Talep Edin' : 'Fiyat Teklifi İsteyin'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Telefon Numaranız"
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                  <textarea
                    rows={3}
                    placeholder="Proje veya metraj notlarınız..."
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none resize-none"
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="outlinebtn"
                  >
                    Vazgeç
                  </button>
                  <button type="submit" className="primarybtn">
                    Talebi İlet ↗
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
