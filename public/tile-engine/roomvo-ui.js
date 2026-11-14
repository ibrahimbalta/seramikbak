/**
 * Mekânımda Gör — Roomvo/Keope tarzı arayüz katmanı.
 * Çekirdek görselleştirme motoru (script.js) window.TileEngine üzerinden sürülür.
 */
(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const engine = () => window.TileEngine;

    // ---------- Fallback katalog (API boş/erişilemez ise) ----------
    const FALLBACK = [
        ['Calacatta Gold', 'calacatta_gold', 60, 120, 'parlak'],
        ['Albatros Antrasit', 'albatros_antrasit', 60, 120, 'mat'],
        ['Loft Beton', 'loft_beton', 60, 60, 'mat'],
        ['Natural Oak', 'natural_oak', 20, 120, 'mat'],
        ['Teak Ahşap', 'teak_ahsap', 20, 120, 'mat'],
        ['Borneo Antrasit', 'borneo_antrasit', 60, 60, 'mat'],
        ['Magma Antrasit', 'magma_antrasit', 60, 120, 'lappato'],
        ['Portland Fume', 'portland_fume', 60, 60, 'mat'],
        ['Pulpis Gri', 'pulpis_gri', 60, 120, 'lappato'],
        ['Keops Bej', 'keops_bej', 60, 60, 'mat'],
        ['Sedir Akçaağaç', 'sedir_akcaagac', 20, 120, 'mat'],
        ['Sedir Gri', 'sedir_gri', 20, 120, 'mat'],
        ['Senzo Beyaz', 'senzo_beyaz', 60, 120, 'parlak'],
        ['Swan Bone', 'swan_bone', 60, 120, 'parlak'],
        ['Thor Gri', 'thor_gri', 60, 60, 'mat'],
        ['Travertino Classico', 'travertino_classico', 60, 120, 'mat'],
        ['Trax Óxido', 'trax_oxido', 60, 60, 'mat'],
        ['Vintage Gri', 'vintage_gri', 60, 60, 'mat'],
        ['Vista Antrasit', 'vista_antrasit', 60, 120, 'lappato'],
        ['Vista Bej', 'vista_bej', 60, 120, 'lappato'],
        ['Concrete Light Grey', 'concrete_light_grey', 60, 60, 'mat']
    ].map(([name, file, width, height, finish], i) => ({
        id: 'local-' + i,
        name,
        textureUrl: `/textures/${file}.jpg`,
        width,
        height,
        finish
    }));

    // ---------- State ----------
    const state = {
        products: [],
        page: 1,
        limit: 36,
        hasMore: false,
        search: '',
        finish: '',
        activeId: null,
        loading: false,
        usingFallback: false
    };

    // ---------- Elements ----------
    const tabs = $$('.rv-tab');
    const panes = $$('.rv-tabpane');
    const panel = $('#sidebar');
    const sheetHandle = $('#rv-sheet-handle');
    const catalogEl = $('#rv-catalog');
    const moreBtn = $('#rv-more-btn');
    const searchInput = $('#rv-search-input');
    const filterRow = $('#rv-filter-row');
    const hint = $('#rv-hint');
    const stage = $('#rv-stage');
    const container = $('#before-after-container');
    const compareBtn = $('#rv-compare-btn');
    const currentTileLabel = $('#rv-current-tile');
    const scenes = $$('.rv-scene');
    const roomFileInput = $('#room-file-input');
    const tileWSlider = $('#tile-w-slider');
    const tileHSlider = $('#tile-h-slider');
    const groutSlider = $('#grout-slider');
    const finishSelect = $('#finish-select');

    // ---------- Tabs ----------
    function openTab(name) {
        tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
        panes.forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
        }
    }
    tabs.forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab)));

    // ---------- Bottom sheet (mobil) ----------
    function cycleSheet() {
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
        } else if (panel.classList.contains('expanded')) {
            panel.classList.remove('expanded');
            panel.classList.add('collapsed');
        } else {
            panel.classList.add('expanded');
        }
    }
    if (sheetHandle) sheetHandle.addEventListener('click', cycleSheet);

    // ---------- Yardımcılar ----------
    function proxied(url) {
        if (!url) return url;
        const abs = /^(https?:)?\/\//i.test(url);
        return abs ? `/api/proxy?url=${encodeURIComponent(url)}` : url;
    }

    function mapFinish(f) {
        const s = (f || '').toLowerCase();
        if (s.includes('parlak') || s.includes('gloss') || s.includes('polish')) return 'glossy';
        if (s.includes('mat') || s.includes('rustic') || s.includes('beton') || s.includes('ahşap')) return 'matte';
        return 'satin';
    }

    function fire(el, type) {
        if (el) el.dispatchEvent(new Event(type, { bubbles: true }));
    }

    function hideHint() {
        if (hint) hint.classList.add('hidden');
    }

    // ---------- Katalog ----------
    function tileCard(p) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rv-tile' + (String(p.id) === String(state.activeId) ? ' active' : '');
        btn.dataset.id = p.id;
        const img = p.textureUrl || p.imageUrl || '';
        const w = p.width || 60;
        const h = p.height || 120;
        btn.innerHTML =
            '<div class="rv-tile-img"><img loading="lazy" alt=""></div>' +
            '<div class="rv-tile-meta"><div class="rv-tile-name"></div><div class="rv-tile-size"></div></div>';
        const imgEl = $('img', btn);
        imgEl.src = proxied(img);
        imgEl.alt = p.name || '';
        $('.rv-tile-name', btn).textContent = p.name || p.code || 'Seramik';
        $('.rv-tile-size', btn).textContent = `${w}×${h} cm`;
        btn.addEventListener('click', () => selectProduct(p));
        return btn;
    }

    function renderCatalog(append) {
        if (!append) catalogEl.innerHTML = '';
        if (!state.products.length) {
            catalogEl.innerHTML = '<div class="rv-catalog-empty">Aramanıza uygun seramik bulunamadı.</div>';
            moreBtn.style.display = 'none';
            return;
        }
        const frag = document.createDocumentFragment();
        const start = append ? catalogEl.querySelectorAll('.rv-tile').length : 0;
        state.products.slice(start).forEach((p) => frag.appendChild(tileCard(p)));
        catalogEl.appendChild(frag);
        moreBtn.style.display = state.hasMore ? 'inline-flex' : 'none';
    }

    function localFilter() {
        const q = state.search.toLowerCase();
        return FALLBACK.filter((p) => {
            const okQ = !q || p.name.toLowerCase().includes(q);
            const okF = !state.finish || (p.finish || '').includes(state.finish);
            return okQ && okF;
        });
    }

    async function loadCatalog(append) {
        if (state.loading) return;
        state.loading = true;
        if (!append) {
            state.page = 1;
            catalogEl.innerHTML = '<div class="rv-catalog-empty">Seramikler yükleniyor…</div>';
        }
        try {
            const params = new URLSearchParams({ limit: String(state.limit), page: String(state.page) });
            if (state.search) params.set('search', state.search);
            if (state.finish) params.set('finish', state.finish);
            const res = await fetch('/api/products?' + params.toString());
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const list = (data && data.products) || (Array.isArray(data) ? data : []);
            const usable = list.filter((p) => p && (p.textureUrl || p.imageUrl));
            if (!usable.length && !append && !state.search && !state.finish) {
                throw new Error('empty');
            }
            state.usingFallback = false;
            state.products = append ? state.products.concat(usable) : usable;
            state.hasMore = list.length >= state.limit;
        } catch (err) {
            state.usingFallback = true;
            state.products = localFilter();
            state.hasMore = false;
        } finally {
            state.loading = false;
        }
        renderCatalog(append);
    }

    // ---------- Seramik seçimi ----------
    async function selectProduct(p) {
        const e = engine();
        if (!e) return;
        state.activeId = p.id;
        $$('.rv-tile', catalogEl).forEach((el) => el.classList.toggle('active', el.dataset.id === String(p.id)));

        const w = Math.round(p.width || 60);
        const h = Math.round(p.height || 120);
        if (tileWSlider) { tileWSlider.value = Math.max(15, Math.min(180, w)); fire(tileWSlider, 'input'); }
        if (tileHSlider) { tileHSlider.value = Math.max(15, Math.min(240, h)); fire(tileHSlider, 'input'); }
        if (finishSelect) finishSelect.value = mapFinish(p.finish || p.surfaceType || p.name);

        const name = `${p.name || 'Seramik'} ${w}×${h}`;
        if (currentTileLabel) currentTileLabel.textContent = name;
        hideHint();

        e.showLoading('Seramik mekâna döşeniyor…');
        try {
            await e.loadTile(proxied(p.textureUrl || p.imageUrl), name);
            await e.execute(true);
        } finally {
            e.hideLoading();
        }
        if (window.matchMedia('(max-width: 900px)').matches) {
            panel.classList.remove('expanded');
            panel.classList.add('collapsed');
        }
    }

    // ---------- Sahneler ----------
    scenes.forEach((s) => {
        s.addEventListener('click', async () => {
            const e = engine();
            if (!e) return;
            scenes.forEach((x) => x.classList.toggle('active', x === s));
            e.showLoading('Mekân hazırlanıyor…');
            try {
                await e.loadRoom(s.dataset.room, s.dataset.name);
                await e.execute(true);
            } finally {
                e.hideLoading();
            }
            hideHint();
        });
    });

    if (roomFileInput) {
        roomFileInput.addEventListener('change', () => {
            if (roomFileInput.files && roomFileInput.files[0]) {
                scenes.forEach((x) => x.classList.remove('active'));
                hideHint();
            }
        });
    }

    // ---------- Önce / Sonra (basılı tut) ----------
    function setCompare(on) {
        if (!container) return;
        container.style.setProperty('--split', on ? '100%' : '0%');
        stage.classList.toggle('comparing', on);
    }
    if (compareBtn) {
        ['pointerdown'].forEach((ev) => compareBtn.addEventListener(ev, (e) => { e.preventDefault(); setCompare(true); }));
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => compareBtn.addEventListener(ev, () => setCompare(false)));
    }

    // ---------- Ayar kaydırıcıları: bırakınca otomatik uygula ----------
    let applyTimer = null;
    function queueApply() {
        clearTimeout(applyTimer);
        applyTimer = setTimeout(() => engine() && engine().execute(true), 250);
    }
    [tileWSlider, tileHSlider, groutSlider].forEach((el) => el && el.addEventListener('change', queueApply));

    // ---------- Arama & filtre ----------
    let searchTimer = null;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                state.search = searchInput.value.trim();
                loadCatalog(false);
            }, 300);
        });
    }
    if (filterRow) {
        filterRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.rv-pill');
            if (!pill) return;
            $$('.rv-pill', filterRow).forEach((p) => p.classList.toggle('active', p === pill));
            state.finish = pill.dataset.finish || '';
            loadCatalog(false);
        });
    }
    if (moreBtn) {
        moreBtn.addEventListener('click', () => {
            state.page += 1;
            loadCatalog(true);
        });
    }

    // ---------- Render sonrası ----------
    window.addEventListener('tileengine:rendered', () => {
        hideHint();
        setCompare(false);
    });

    // ---------- Başlangıç ----------
    (function init() {
        const params = new URLSearchParams(window.location.search);
        const productName = params.get('product');
        if (productName && currentTileLabel) currentTileLabel.textContent = productName;
        loadCatalog(false);
    })();
})();
