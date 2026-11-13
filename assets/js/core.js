/* ============================================================
   Tafahum Platform — core utilities, icons, storage, events
   UMD: works as browser global (window.TF) and in Node tests.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TF = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- tiny DOM helpers (browser only) ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else node.setAttribute(k, v);
      }
    }
    for (const c of children.flat(9)) {
      if (c == null || c === false) continue;
      if (c.nodeType) {
        node.append(c);
      } else if (c && c.__svg) {
        // Trusted inline icon markup produced by icon().
        const tpl = document.createElement('template');
        tpl.innerHTML = String(c);
        node.append(tpl.content);
      } else {
        // Everything else (including user text) stays a safe text node.
        node.append(document.createTextNode(String(c)));
      }
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- misc utils ---------- */
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const uid = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const todayISO = () => new Date().toISOString();

  function fmtDate(iso, lang) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(lang === 'ar' ? 'ar-LY' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) { return String(iso || ''); }
  }

  function fmtTime(ts) {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  function fmtClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /* deterministic PRNG so sessions / tests are reproducible */
  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length) % arr.length]; }

  /* normalize Arabic-Indic digits to western + strip diacritics/tatweel */
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  function normalizeDigits(s) {
    return String(s || '').replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)))
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  }
  function stripDiacritics(s) {
    return String(s || '')
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[\u0622\u0623\u0625]/g, '\u0627');
  }

  /* ---------- event bus + toasts (browser only) ---------- */
  const bus = {
    _m: {},
    on(ev, fn) { (this._m[ev] = this._m[ev] || []).push(fn); },
    emit(ev, data) { (this._m[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
  };

  function toast(msg, type) {
    if (typeof document === 'undefined') return;
    let holder = $('#toasts');
    if (!holder) { holder = el('div', { id: 'toasts' }); document.body.append(holder); }
    const t = el('div', { class: 'toast toast-' + (type || 'info') }, el('span', null, msg));
    holder.append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------- icons (inline SVG, feather-style) ---------- */
  const PATHS = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
    compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
    flask: 'M9 3h6M10 3v6l-5.5 9A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 9V3M7.5 15h9',
    gauge: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-7 4-4M12 7V5',
    chat: 'M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5ZM8.5 11h.01M12 11h.01M15.5 11h.01',
    bot: 'M9 3h6M12 3v3M7 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM2 11v4M22 11v4M9.5 11v.01M14.5 11v.01M9.5 15h5',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    send: 'M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z',
    bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z',
    download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    printer: 'M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6v-7Z',
    check: 'M20 6 9 17l-5-5',
    x: 'M18 6 6 18M6 6l12 12',
    warn: 'M12 3 2 20h20L12 3Zm0 6v6m0 3v.01',
    star: 'M12 2.5 15 9l7 .8-5.2 4.7L18.2 21 12 17.5 5.8 21l1.4-6.5L2 9.8 9 9l3-6.5Z',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-2-1.2L14.6 3H9.4L9 5.7a7.5 7.5 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 2 1.2l.4 2.7h5.2l.4-2.7a7.5 7.5 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 3',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z',
    shield: 'M12 2 4 5.5V11c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5.5L12 2Zm-2.5 9 2 2 3.5-4',
    scale: 'M12 3v18M7 21H17M3 7l4-2 4 2-2 7a2.5 2.5 0 0 1-4 0L3 7Zm18 0-4-2-4 2 2 7a2.5 2.5 0 0 0 4 0l2-7ZM8 5l4 2 4-2',
    plus: 'M12 5v14M5 12h14',
    trash: 'M3 6h18M8 6V4h8v2m1 0-1 15H6L5 6M10 11v6m4-6v6',
    refresh: 'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h5',
    medal: 'M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 0v7l-3-2-3 2v-7M8.5 9h.01M15.5 9h.01',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    flag: 'M4 21V4m0 1c6-3 10 3 16 0v9c-6 3-10-3-16 0',
    edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
    layers: 'M12 2 2 7l10 5 10-5-10-5Zm-10 12 10 5 10-5M2 12l10 5 10-5',
    mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-7-3a7 7 0 0 0 14 0M12 19v3',
    arrowRight: 'M4 12h16m0 0-6-6m6 6-6 6',
    pause: 'M9 4v16m6-16v16',
    play: 'M7 4l13 8-13 8V4Z',
    chevD: 'M6 9l6 6 6-6',
    link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    briefcase: 'M3 7h18v13H3V7Zm6 0V4h6v3M3 12h18',
    grid: 'M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z',
    heart: 'M12 20.5 4 12.7a5 5 0 0 1 8-6 5 5 0 0 1 8 6l-8 7.8Z'
  };

  function icon(name, size, cls) {
    const d = PATHS[name] || PATHS.doc;
    const s = size || 20;
    const svg = new String(`<svg class="ic ${cls || ''}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`);
    // Marked so el() can render it as markup, while ordinary strings stay text.
    svg.__svg = true;
    return svg;
  }

  /* ---------- storage ---------- */
  const KEY = 'tafahum.v1';
  const DEFAULT_DATA = () => ({
    settings: { lang: 'ar', name: '', coach: true, onboarded: false },
    diagnostic: null,        // {date, style, scores, answers}
    knowledge: { read: {} }, // unitId -> true (+quiz answers)
    sessions: [],            // finished sessions (serializable)
    version: 1
  });

  function loadData() {
    if (typeof localStorage === 'undefined') return DEFAULT_DATA();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_DATA();
      const d = JSON.parse(raw);
      const base = DEFAULT_DATA();
      return { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) }, knowledge: { ...base.knowledge, ...(d.knowledge || {}) } };
    } catch (e) { return DEFAULT_DATA(); }
  }
  function saveData(data) {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('storage save failed', e); }
  }

  return {
    $, $$, el, escapeHtml, clamp, uid, todayISO, fmtDate, fmtTime, fmtClock,
    hashSeed, mulberry32, pick, normalizeDigits, stripDiacritics,
    bus, toast, icon, PATHS,
    loadData, saveData, DEFAULT_DATA, KEY
  };
});
