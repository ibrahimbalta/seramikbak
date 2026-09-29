/**
 * SeramikBak 3D Studio & Showroom Kiosk JavaScript SDK
 * White-Label Embed & Modal Visualizer Plugin for Ceramic Brands & Showrooms
 * (c) SeramikBak - All Rights Reserved
 * 
 * Usage:
 * <button id="open-visualizer">3D Mekanda Gör</button>
 * <script src="https://www.seramikbak.com/studio-sdk.js" 
 *   data-brand="gural-seramik" 
 *   data-theme="#d4af37" 
 *   data-scene="banyo" 
 *   data-button-id="open-visualizer" 
 *   async>
 * </script>
 */
(function(window, document) {
  'use strict';

  // Prevent multiple instantiations
  if (window.SeramikBakStudio && window.SeramikBakStudio._loaded) {
    return;
  }

  // Detect script origin (fallback to production domain)
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('studio-sdk.js') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  var defaultOrigin = 'https://www.seramikbak.com';
  if (currentScript && currentScript.src) {
    try {
      var parsedUrl = new URL(currentScript.src);
      defaultOrigin = parsedUrl.origin;
    } catch (e) {}
  } else if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // If testing on the same origin (e.g. localhost:3000)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      defaultOrigin = window.location.origin;
    }
  }

  // State
  var activeModal = null;
  var previousBodyOverflow = '';

  // Inject Scoped CSS
  function injectStyles() {
    if (document.getElementById('sb-studio-styles')) return;

    var style = document.createElement('style');
    style.id = 'sb-studio-styles';
    style.textContent = `
      .sb-studio-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: rgba(8, 12, 22, 0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }
      .sb-studio-backdrop.sb-open {
        opacity: 1;
      }
      .sb-studio-modal {
        width: 100%;
        max-width: 1540px;
        height: 94vh;
        background: #0b0f19;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 30px 80px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: scale(0.96) translateY(12px);
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
        position: relative;
      }
      .sb-studio-backdrop.sb-open .sb-studio-modal {
        transform: scale(1) translateY(0);
      }
      .sb-studio-modal.sb-fullscreen {
        max-width: 100vw;
        height: 100vh;
        border-radius: 0;
        border: none;
      }
      .sb-studio-header {
        height: 54px;
        background: linear-gradient(180deg, #111827 0%, #0b0f19 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18px;
        user-select: none;
        box-sizing: border-box;
      }
      .sb-studio-title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sb-studio-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(212, 175, 55, 0.14);
        border: 1px solid rgba(212, 175, 55, 0.35);
        color: #d4af37;
        padding: 4px 10px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .sb-studio-title {
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .sb-studio-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sb-studio-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
        outline: none;
      }
      .sb-studio-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.25);
      }
      .sb-studio-btn-close:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
      }
      .sb-studio-frame-wrap {
        flex: 1;
        width: 100%;
        position: relative;
        background: #080c16;
      }
      .sb-studio-iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
      }
      .sb-studio-spinner {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: #0b0f19;
        color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        z-index: 5;
        transition: opacity 0.3s ease;
      }
      .sb-spinner-circle {
        width: 44px;
        height: 44px;
        border: 3px solid rgba(212, 175, 55, 0.2);
        border-top-color: #d4af37;
        border-radius: 50%;
        animation: sb-spin 0.8s linear infinite;
      }
      @keyframes sb-spin {
        to { transform: rotate(360deg); }
      }

      /* Floating Action Trigger Button (Optional) */
      .sb-studio-floating-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999990;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
        color: #ffffff;
        border: 1px solid rgba(212, 175, 55, 0.4);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 15px rgba(212, 175, 55, 0.2);
        border-radius: 50px;
        padding: 12px 22px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
      }
      .sb-studio-floating-btn:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 14px 38px rgba(0, 0, 0, 0.45), 0 0 22px rgba(212, 175, 55, 0.4);
        border-color: #d4af37;
      }
      .sb-studio-floating-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #d4af37;
        color: #0b0f19;
      }
    `;
    document.head.appendChild(style);
  }

  // Construct Visualizer URL
  function buildVisualizerUrl(options) {
    var opts = options || {};
    var base = opts.baseUrl || defaultOrigin;
    var brand = opts.brand || 'gural-seramik';
    var scene = opts.scene || 'banyo';
    var theme = opts.theme || '#d4af37';
    var productId = opts.productId || '';
    var code = opts.code || '';

    var url = base + '/kiosk?brand=' + encodeURIComponent(brand) + 
      '&embed=true' +
      '&scene=' + encodeURIComponent(scene) + 
      '&theme=' + encodeURIComponent(theme);

    if (productId) url += '&productId=' + encodeURIComponent(productId);
    if (code) url += '&code=' + encodeURIComponent(code);

    return url;
  }

  // Open Modal Visualizer
  function openModal(options) {
    injectStyles();

    if (activeModal) {
      closeModal();
    }

    var opts = options || {};
    var brandName = opts.brandName || (opts.brand ? opts.brand.replace(/-/g, ' ').toUpperCase() : 'SERAMİKBAK');
    var iframeSrc = buildVisualizerUrl(opts);

    // Save scroll
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.className = 'sb-studio-backdrop';

    // Modal
    var modal = document.createElement('div');
    modal.className = 'sb-studio-modal';

    // Header
    var header = document.createElement('div');
    header.className = 'sb-studio-header';

    header.innerHTML = `
      <div class="sb-studio-title-wrap">
        <div class="sb-studio-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          3D VİSUALİZER
        </div>
        <div class="sb-studio-title">${brandName} Canlı Mekan Stüdyosu</div>
      </div>
      <div class="sb-studio-actions">
        <button class="sb-studio-btn sb-studio-btn-expand" title="Tam Ekran" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
        <button class="sb-studio-btn sb-studio-btn-close" title="Kapat (ESC)" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;

    // Frame Container
    var frameWrap = document.createElement('div');
    frameWrap.className = 'sb-studio-frame-wrap';

    var spinner = document.createElement('div');
    spinner.className = 'sb-studio-spinner';
    spinner.innerHTML = `
      <div class="sb-spinner-circle"></div>
      <div>3D Sanal Showroom ve Seramik Koleksiyonu Hazırlanıyor...</div>
    `;

    var iframe = document.createElement('iframe');
    iframe.className = 'sb-studio-iframe';
    iframe.src = iframeSrc;
    iframe.setAttribute('allow', 'camera; accelerometer; gyroscope; fullscreen');
    iframe.setAttribute('title', brandName + ' 3D Seramik Stüdyosu');

    iframe.onload = function() {
      if (spinner && spinner.parentNode) {
        spinner.style.opacity = '0';
        setTimeout(function() {
          if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
        }, 300);
      }
    };

    frameWrap.appendChild(spinner);
    frameWrap.appendChild(iframe);

    modal.appendChild(header);
    modal.appendChild(frameWrap);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Event Handlers
    var closeBtn = header.querySelector('.sb-studio-btn-close');
    var expandBtn = header.querySelector('.sb-studio-btn-expand');

    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeModal();
    });

    expandBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      modal.classList.toggle('sb-fullscreen');
    });

    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    var handleKeyDown = function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Animate in
    requestAnimationFrame(function() {
      backdrop.classList.add('sb-open');
    });

    activeModal = {
      backdrop: backdrop,
      handleKeyDown: handleKeyDown
    };
  }

  // Close Modal Visualizer
  function closeModal() {
    if (!activeModal) return;

    var backdrop = activeModal.backdrop;
    var handleKeyDown = activeModal.handleKeyDown;

    document.removeEventListener('keydown', handleKeyDown);
    backdrop.classList.remove('sb-open');

    setTimeout(function() {
      if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      document.body.style.overflow = previousBodyOverflow || '';
      activeModal = null;
    }, 280);
  }

  // Inline Embed into a container
  function embedInto(containerId, options) {
    injectStyles();
    var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) {
      console.warn('SeramikBak Studio: Container element not found:', containerId);
      return;
    }

    var opts = options || {};
    var iframeSrc = buildVisualizerUrl(opts);
    var height = opts.height || '760px';

    container.innerHTML = `
      <div style="width:100%; height:${height}; border-radius:16px; overflow:hidden; box-shadow:0 14px 40px rgba(0,0,0,0.12); border:1px solid rgba(0,0,0,0.08); background:#0b0f19;">
        <iframe 
          src="${iframeSrc}" 
          style="width:100%; height:100%; border:none; display:block;" 
          allow="camera; accelerometer; gyroscope; fullscreen"
          loading="lazy"
          title="SeramikBak 3D Studio"
        ></iframe>
      </div>
    `;
  }

  // Auto-Initialize from Script Tag
  function autoInit() {
    if (!currentScript) return;

    var brand = currentScript.getAttribute('data-brand') || 'gural-seramik';
    var theme = currentScript.getAttribute('data-theme') || '#d4af37';
    var scene = currentScript.getAttribute('data-scene') || 'banyo';
    var buttonId = currentScript.getAttribute('data-button-id');
    var mode = currentScript.getAttribute('data-mode') || 'modal';
    var containerId = currentScript.getAttribute('data-container-id') || 'seramikbak-studio';
    var customBase = currentScript.getAttribute('data-base-url') || defaultOrigin;

    var config = {
      brand: brand,
      theme: theme,
      scene: scene,
      baseUrl: customBase
    };

    // 1. If explicit button ID is provided
    if (buttonId) {
      var bindButton = function() {
        var btn = document.getElementById(buttonId);
        if (btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(config);
          });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindButton);
      } else {
        bindButton();
      }
    }

    // 2. If inline mode requested or container exists
    if (mode === 'inline' || document.getElementById(containerId)) {
      var bindInline = function() {
        if (document.getElementById(containerId)) {
          embedInto(containerId, config);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindInline);
      } else {
        bindInline();
      }
    }

    // 3. If floating mode requested
    if (mode === 'floating') {
      var renderFloating = function() {
        injectStyles();
        var floatBtn = document.createElement('button');
        floatBtn.className = 'sb-studio-floating-btn';
        floatBtn.type = 'button';
        floatBtn.innerHTML = `
          <span class="sb-studio-floating-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </span>
          <span>3D Mekanında Gör</span>
        `;
        floatBtn.addEventListener('click', function() {
          openModal(config);
        });
        document.body.appendChild(floatBtn);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderFloating);
      } else {
        renderFloating();
      }
    }
  }

  // Public SDK Object
  window.SeramikBakStudio = {
    _loaded: true,
    version: '1.2.0',
    init: function(options) {
      if (options && options.buttonId) {
        var btn = document.getElementById(options.buttonId);
        if (btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(options);
          });
        }
      }
    },
    open: function(options) {
      openModal(options);
    },
    close: function() {
      closeModal();
    },
    embed: function(containerId, options) {
      embedInto(containerId, options);
    }
  };

  // Run Auto-Init
  autoInit();

})(window, document);
