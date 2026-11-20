/* ==========================================================================
   Lista de Reposición — lógica de la app
   - Catálogo: catalog.js (variable global CATALOGO)
   - Datos: LocalStorage (clave versionada), autoguardado en cada cambio
   ========================================================================== */
(function () {
  'use strict';

  const APP_VERSION = '1.0.0';
  const KEY = 'reposicion.v1';              // estado actual
  const KEY_BAK = 'reposicion.v1.bak';      // copia del estado anterior (red de seguridad)
  const KEY_CORRUPT = 'reposicion.v1.corrupt'; // copia de datos ilegibles (no se pisa nunca a ciegas)
  const MAX = 9999;

  /* ---------- utilidades ---------- */
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const slug = (s) =>
    norm(s).replace(/\+/g, ' mas ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (n) => Math.max(0, Math.min(MAX, n | 0));
  const $ = (sel, root) => (root || document).querySelector(sel);

  /* ---------- catálogo aplanado ---------- */
  const CATS = [];
  const PRODUCTS = [];
  const BYID = {};
  const BYCAT = {};

  CATALOGO.forEach((cat) => {
    const c = { id: cat.id, nombre: cat.nombre, emoji: cat.emoji, hue: cat.hue, grupos: [], productos: [] };
    cat.grupos.forEach((g) => {
      const gg = { nombre: g.nombre, productos: [] };
      g.productos.forEach((p) => {
        const nombre = typeof p === 'string' ? p : p.n;
        let id = typeof p === 'string' ? slug(nombre) : p.id;
        if (BYID[id]) { let k = 2; while (BYID[id + '-' + k]) k++; id = id + '-' + k; }
        const prod = { id, nombre, cat: c, key: norm(cat.nombre + ' ' + g.nombre + ' ' + nombre) };
        BYID[id] = prod;
        PRODUCTS.push(prod);
        c.productos.push(prod);
        gg.productos.push(prod);
      });
      c.grupos.push(gg);
    });
    CATS.push(c);
    BYCAT[c.id] = c;
  });

  /* ---------- estado y almacenamiento ---------- */
  let storageOK = true;
  let loadNotice = '';   // aviso a mostrar si hubo problemas al leer
  let saveFailed = false;

  const emptyState = () => ({ v: 1, items: {}, updated: Date.now() });

  function sanitize(s) {
    const out = emptyState();
    if (s && typeof s.items === 'object' && s.items) {
      Object.keys(s.items).forEach((id) => {
        const it = s.items[id] || {};
        const c = clamp(parseInt(it.c, 10) || 0);
        const u = clamp(parseInt(it.u, 10) || 0);
        if (c || u) out.items[id] = { c, u };
      });
    }
    return out;
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); }
    catch (e) { storageOK = false; return emptyState(); }
    if (!raw) return emptyState();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.items !== 'object') throw new Error('formato');
      return sanitize(parsed);
    } catch (e) {
      // Datos ilegibles: se guarda copia y se intenta recuperar la copia anterior.
      try { localStorage.setItem(KEY_CORRUPT, raw); } catch (_) {}
      try {
        const b = localStorage.getItem(KEY_BAK);
        if (b) {
          const sb = JSON.parse(b);
          if (sb && typeof sb.items === 'object') {
            loadNotice = 'Los datos guardados estaban dañados. Se recuperó la copia anterior de la lista.';
            return sanitize(sb);
          }
        }
      } catch (_) {}
      loadNotice = 'Los datos guardados estaban dañados y no se pudieron recuperar. Se empezó una lista nueva.';
      return emptyState();
    }
  }

  let state = load();

  function save() {
    state.updated = Date.now();
    try {
      const prev = localStorage.getItem(KEY);
      const json = JSON.stringify(state);
      localStorage.setItem(KEY, json);
      if (localStorage.getItem(KEY) !== json) throw new Error('verificación');
      if (prev && prev !== json) localStorage.setItem(KEY_BAK, prev);
      storageOK = true;
      saveFailed = false;
      showSaved();
      requestPersist();
      return true;
    } catch (e) {
      saveFailed = true;
      showSaveError();
      return false;
    }
  }

  let persistAsked = false;
  function requestPersist() {
    if (persistAsked) return;
    persistAsked = true;
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}
  }

  /* ---------- indicador de guardado ---------- */
  const saveEl = $('#save');
  function fmtTime(d) {
    return d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  }
  function showSaved() {
    saveEl.className = 'save ok flash';
    saveEl.textContent = '✓ Guardado ' + fmtTime(new Date());
    clearTimeout(showSaved.t);
    showSaved.t = setTimeout(() => saveEl.classList.remove('flash'), 700);
    const b = $('#banner-save'); if (b) b.remove();
  }
  function showSaveError() {
    saveEl.className = 'save err';
    saveEl.textContent = '⚠ No se pudo guardar';
    if (!$('#banner-save')) {
      const d = document.createElement('div');
      d.id = 'banner-save';
      d.className = 'banner err';
      d.textContent = 'No se pudo guardar en este navegador (almacenamiento lleno, bloqueado o modo privado). Lo que cargues ahora puede perderse al cerrar la app.';
      main.prepend(d);
    }
  }
  function showIdle() {
    saveEl.className = 'save';
    saveEl.textContent = storageOK ? 'Autoguardado activo' : '⚠ Sin almacenamiento';
  }

  /* ---------- consultas sobre el estado ---------- */
  const qty = (id) => state.items[id] || { c: 0, u: 0 };
  const isReg = (id) => !!state.items[id];

  function counts() {
    const perCat = {};
    CATS.forEach((c) => (perCat[c.id] = 0));
    let total = 0, cajas = 0, unid = 0, orphans = 0;
    Object.keys(state.items).forEach((id) => {
      const it = state.items[id];
      cajas += it.c; unid += it.u;
      if (BYID[id]) { perCat[BYID[id].cat.id]++; total++; } else { orphans++; total++; }
    });
    return { perCat, total, cajas, unid, orphans };
  }

  function setQty(id, field, val) {
    val = clamp(val);
    const it = Object.assign({ c: 0, u: 0 }, state.items[id]);
    it[field] = val;
    if (!it.c && !it.u) delete state.items[id]; else state.items[id] = it;
    save();
    refreshCard(id);
    updateProgress();
  }

  /* ---------- DOM base ---------- */
  const main = $('#main');
  const searchInput = $('#q');
  const subnav = $('#subnav');
  const tabCats = $('#tab-cats');
  const tabRes = $('#tab-res');
  const tabBadge = $('#tab-badge');
  const toastEl = $('#toast');
  const modalEl = $('#modal');

  /* ---------- vistas ---------- */
  function cardHtml(p, note) {
    const q = qty(p.id);
    return `<article class="prod${isReg(p.id) ? ' has' : ''}" data-id="${esc(p.id)}">
  <h3 class="pname">${esc(p.nombre)}</h3>${note ? `<div class="pnote">${esc(note)}</div>` : ''}
  ${rowHtml('c', 'CAJAS', q.c)}
  ${rowHtml('u', 'UNIDADES', q.u)}
</article>`;
  }

  function rowHtml(field, label, val) {
    const lbl = field === 'c' ? 'cajas' : 'unidades';
    return `<div class="row${val ? ' on' : ''}" data-field="${field}">
    <span class="lbl">${label}</span>
    <button class="b minus" data-act="dec" aria-label="Menos ${lbl}">−</button>
    <input class="num" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="${label}" value="${val}">
    <button class="b plus" data-act="inc" aria-label="Más ${lbl}">+</button>
    <button class="x" data-act="clr" aria-label="Borrar ${lbl}">✕</button>
  </div>`;
  }

  function viewHome() {
    const k = counts();
    const cards = CATS.map((c) => {
      const n = c.productos.length;
      return `<a class="cat" href="#/c/${c.id}" style="--h:${c.hue}">
  <span class="emo" aria-hidden="true">${c.emoji}</span>
  <span class="cn">${esc(c.nombre)}</span>
  <span class="cc">${n} ${n === 1 ? 'producto' : 'productos'}</span>
  <span class="cb" data-cat-badge="${c.id}"></span>
  <span class="bar"><i data-cat-bar="${c.id}"></i></span>
</a>`;
    }).join('');
    return `<section class="hero">
  <div class="hero-n" data-total>${k.total}</div>
  <div class="hero-t">productos con cantidades cargadas<small>de ${PRODUCTS.length} en el catálogo</small></div>
</section>
<div class="cats">${cards}</div>
<button class="finish" data-act="finish">FINALIZAR Y BORRAR LISTA</button>
<p class="note">Los datos se guardan solo en este navegador del iPhone (no hay copia en la nube). Si borrás los datos del sitio o de Safari, se pierde la lista.</p>
<p class="ver">Versión ${APP_VERSION} · ${modeText()}</p>`;
  }

  function isStandalone() {
    try {
      return !!(navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));
    } catch (_) { return false; }
  }
  function modeText() {
    return isStandalone()
      ? 'abierta como app instalada'
      : 'abierta en Safari (los datos de Safari y los de la app instalada son separados)';
  }

  function viewCat(c) {
    const body = c.grupos
      .map((g) => `<h2 class="grp">${esc(g.nombre)}</h2>` + g.productos.map((p) => cardHtml(p)).join(''))
      .join('');
    return `<header class="cat-head" style="--h:${c.hue}">
  <span class="emo" aria-hidden="true">${c.emoji}</span>
  <h1>${esc(c.nombre)}</h1>
  <span class="cb" data-cat-badge="${c.id}"></span>
</header>
${body}
<button class="clear-cat" data-act="clrcat" data-cat="${c.id}">Borrar cantidades de ${esc(c.nombre)}</button>`;
  }

  function viewSearch(q) {
    const toks = norm(q).split(/\s+/).filter(Boolean);
    const res = PRODUCTS.filter((p) => toks.every((t) => p.key.includes(t)));
    if (!res.length) {
      return `<div class="empty"><div class="big">🔍</div><p>Sin resultados para «${esc(q)}»</p></div>`;
    }
    let html = `<p class="resinfo">${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}</p>`;
    CATS.forEach((c) => {
      const r = res.filter((p) => p.cat === c);
      if (!r.length) return;
      html += `<h2 class="grp" style="--h:${c.hue}">${c.emoji} ${esc(c.nombre)}</h2>` + r.map((p) => cardHtml(p)).join('');
    });
    return html;
  }

  function viewResumen() {
    const k = counts();
    if (!k.total) {
      return `<div class="empty"><div class="big">📋</div><p>Todavía no cargaste cantidades.</p><a class="btn" href="#/">Ir a las categorías</a></div>`;
    }
    let html = `<section class="sum">
  <div><b data-sum="total">${k.total}</b><span>productos</span></div>
  <div><b data-sum="cajas">${k.cajas}</b><span>cajas</span></div>
  <div><b data-sum="unid">${k.unid}</b><span>unidades</span></div>
</section>`;
    CATS.forEach((c) => {
      const r = c.productos.filter((p) => isReg(p.id));
      if (!r.length) return;
      html += `<h2 class="grp" style="--h:${c.hue}">${c.emoji} ${esc(c.nombre)}</h2>` + r.map((p) => cardHtml(p)).join('');
    });
    const orph = Object.keys(state.items).filter((id) => !BYID[id]);
    if (orph.length) {
      html += `<h2 class="grp">Otros (ya no están en el catálogo)</h2>` +
        orph.map((id) => cardHtml({ id, nombre: id }, 'Producto fuera del catálogo')).join('');
    }
    html += `<button class="finish" data-act="finish">FINALIZAR Y BORRAR LISTA</button>`;
    return html;
  }

  /* ---------- ruteo ---------- */
  function currentCat() {
    const h = location.hash || '#/';
    if (h.indexOf('#/c/') === 0) return BYCAT[h.slice(4)] || null;
    return null;
  }

  function renderChips(active) {
    if (!active && !searchInput.value.trim()) { subnav.innerHTML = ''; subnav.hidden = true; return; }
    subnav.hidden = false;
    subnav.innerHTML =
      `<a class="chip home" href="#/">‹ Inicio</a>` +
      CATS.map((c) =>
        `<a class="chip${active && active.id === c.id ? ' active' : ''}" href="#/c/${c.id}" style="--h:${c.hue}" data-chip="${c.id}">${c.emoji} ${esc(c.nombre)}</a>`
      ).join('');
    const a = $('.chip.active', subnav);
    if (a) { try { subnav.scrollLeft = a.offsetLeft - 12; } catch (_) {} }
  }

  function render(opts) {
    opts = opts || {};
    const q = searchInput.value.trim();
    const h = location.hash || '#/';
    let html, cat = null, tab = 'cats';
    if (q) {
      html = viewSearch(q);
    } else if (h.indexOf('#/c/') === 0) {
      cat = BYCAT[h.slice(4)];
      if (!cat) { location.hash = '#/'; return; }
      html = viewCat(cat);
    } else if (h === '#/resumen') {
      html = viewResumen(); tab = 'res';
    } else {
      html = viewHome();
    }
    main.innerHTML = html;
    if (loadNotice) {
      const d = document.createElement('div');
      d.className = 'banner warn';
      d.innerHTML = `${esc(loadNotice)} <button data-act="dismiss">Entendido</button>`;
      main.prepend(d);
    }
    if (!storageOK || saveFailed) {
      const d = document.createElement('div');
      d.id = 'banner-save'; d.className = 'banner err';
      d.textContent = 'Este navegador no permite guardar datos. Lo que cargues puede perderse al cerrar la app.';
      main.prepend(d);
    }
    renderChips(cat);
    tabCats.classList.toggle('active', tab === 'cats');
    tabRes.classList.toggle('active', tab === 'res');
    updateProgress();
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', () => {
    if (searchInput.value) searchInput.value = '';
    render();
  });

  /* ---------- progreso ---------- */
  function updateProgress() {
    const k = counts();
    document.querySelectorAll('[data-total]').forEach((el) => (el.textContent = k.total));
    CATS.forEach((c) => {
      const n = k.perCat[c.id], tot = c.productos.length;
      document.querySelectorAll(`[data-cat-badge="${c.id}"]`).forEach((el) => {
        el.textContent = n + (n === 1 ? ' registrado' : ' registrados');
        el.classList.toggle('on', n > 0);
      });
      document.querySelectorAll(`[data-cat-bar="${c.id}"]`).forEach((el) => {
        el.style.width = (tot ? (n / tot) * 100 : 0) + '%';
      });
    });
    const s = (name, v) => document.querySelectorAll(`[data-sum="${name}"]`).forEach((el) => (el.textContent = v));
    s('total', k.total); s('cajas', k.cajas); s('unid', k.unid);
    tabBadge.textContent = k.total;
    tabBadge.hidden = !k.total;
  }

  function refreshCard(id) {
    document.querySelectorAll(`.prod[data-id="${CSS.escape(id)}"]`).forEach((card) => {
      const q = qty(id);
      card.classList.toggle('has', isReg(id));
      card.querySelectorAll('.row').forEach((row) => {
        const v = q[row.dataset.field];
        const inp = $('.num', row);
        if (inp !== document.activeElement) inp.value = v;
        row.classList.toggle('on', v > 0);
      });
    });
  }

  /* ---------- toast, confirmación y deshacer ---------- */
  let toastTimer;
  function toast(msg, actionLabel, action) {
    clearTimeout(toastTimer);
    toastEl.innerHTML = `<span>${esc(msg)}</span>` + (actionLabel ? `<button type="button">${esc(actionLabel)}</button>` : '');
    toastEl.classList.add('show');
    const btn = $('button', toastEl);
    if (btn) btn.onclick = () => { toastEl.classList.remove('show'); action && action(); };
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), actionLabel ? 9000 : 2200);
  }

  function confirmDialog(opts) {
    return new Promise((resolve) => {
      modalEl.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">
  <h2>${esc(opts.title)}</h2>
  <p>${esc(opts.text)}</p>
  <button class="ok ${opts.danger ? 'danger' : ''}" data-r="1">${esc(opts.ok)}</button>
  <button class="cancel" data-r="0">Cancelar</button>
</div>`;
      modalEl.hidden = false;
      const done = (v) => { modalEl.hidden = true; modalEl.innerHTML = ''; modalEl.onclick = null; resolve(v); };
      modalEl.onclick = (e) => {
        const r = e.target.closest('[data-r]');
        if (r) done(r.dataset.r === '1');
        else if (e.target === modalEl) done(false);
      };
    });
  }

  function withUndo(label, fn) {
    const snap = JSON.stringify(state.items);
    fn();
    save();
    render({ keepScroll: true });
    toast(label, 'Deshacer', () => {
      try { state.items = sanitize({ items: JSON.parse(snap) }).items; } catch (_) { return; }
      save();
      render({ keepScroll: true });
      toast('Cantidades restauradas');
    });
  }

  /* ---------- eventos ---------- */
  main.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const card = btn.closest('.prod');
    const row = btn.closest('.row');

    if (act === 'inc' || act === 'dec') {
      const id = card.dataset.id, f = row.dataset.field;
      const cur = qty(id)[f];
      setQty(id, f, cur + (act === 'inc' ? 1 : -1));
    } else if (act === 'clr') {
      const id = card.dataset.id, f = row.dataset.field;
      const cur = qty(id)[f];
      if (!cur) return;
      const snap = cur;
      setQty(id, f, 0);
      toast((f === 'c' ? 'Cajas' : 'Unidades') + ' borradas', 'Deshacer', () => { setQty(id, f, snap); });
    } else if (act === 'clrcat') {
      const c = BYCAT[btn.dataset.cat];
      const n = c.productos.filter((p) => isReg(p.id)).length;
      if (!n) { toast('No hay cantidades en ' + c.nombre); return; }
      const ok = await confirmDialog({
        title: '¿Borrar ' + c.nombre + '?',
        text: 'Se borran las cajas y unidades de ' + n + (n === 1 ? ' producto' : ' productos') + ' de esta categoría. El catálogo no se toca.',
        ok: 'Borrar categoría', danger: true
      });
      if (ok) withUndo('Categoría borrada', () => { c.productos.forEach((p) => delete state.items[p.id]); });
    } else if (act === 'finish') {
      const k = counts();
      if (!k.total) { toast('La lista ya está vacía'); return; }
      const ok = await confirmDialog({
        title: '¿Finalizar y borrar la lista?',
        text: 'Se borran todas las cantidades (' + k.total + (k.total === 1 ? ' producto' : ' productos') + '). El catálogo y las categorías quedan intactos y empezás una lista nueva.',
        ok: 'Sí, borrar todo', danger: true
      });
      if (ok) {
        withUndo('Lista nueva lista ✓', () => { state.items = {}; });
        if ((location.hash || '#/') !== '#/') location.hash = '#/';
      }
    } else if (act === 'dismiss') {
      loadNotice = '';
      btn.closest('.banner').remove();
    }
  });

  main.addEventListener('input', (e) => {
    const inp = e.target;
    if (!inp.classList.contains('num')) return;
    const card = inp.closest('.prod'), row = inp.closest('.row');
    let t = inp.value.replace(/\D/g, '').slice(0, 4);
    if (t !== inp.value) inp.value = t;
    setQty(card.dataset.id, row.dataset.field, t === '' ? 0 : parseInt(t, 10));
  });

  main.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('num')) {
      const el = e.target;
      setTimeout(() => { try { el.select(); } catch (_) {} }, 0);
    }
  });

  main.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('num')) {
      const card = e.target.closest('.prod'), row = e.target.closest('.row');
      e.target.value = qty(card.dataset.id)[row.dataset.field];
      if (pendingReload) setTimeout(maybeReload, 50);
    }
  });

  searchInput.addEventListener('input', () => render({ keepScroll: true }));
  $('#q-clear').addEventListener('click', () => {
    searchInput.value = '';
    render({ keepScroll: true });
    searchInput.focus();
  });
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchInput.blur(); });

  /* ---------- actualizaciones del Service Worker ---------- */
  let pendingReload = false;
  const isTyping = () => document.activeElement && document.activeElement.classList &&
    document.activeElement.classList.contains('num');
  function maybeReload() {
    if (isTyping()) { pendingReload = true; return; }
    location.reload();
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const hadController = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || reloaded) return;   // primera instalación: no recargar
        reloaded = true;
        maybeReload();
      });
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        reg.update().catch(() => {});
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) reg.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }

  /* ---------- inicio ---------- */
  showIdle();
  render();
})();
