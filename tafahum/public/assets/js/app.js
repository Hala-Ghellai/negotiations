/* ============================================================
   Tafahum Platform — Laravel front-end application
   Pages are server-rendered (Blade) real URLs; the interactive
   simulation engine runs client-side. This glue layer:
     • renders the right view from location.pathname
     • keeps an in-memory live session (picker → chat → report)
       via history.pushState (no reload, liveSession survives)
     • persists everything to the Laravel API (/api/*) with a
       browser token, mirroring to localStorage when offline
   ============================================================ */
(function () {
  'use strict';
  const { $, $$, el, escapeHtml, clamp, uid, fmtDate, fmtClock, toast, icon, loadData, saveData } = TF;
  const t = (k, vars) => TFI.t(k, vars);

  /* ================= locale (server-rendered <html lang dir>) ================= */
  const LANG = document.documentElement.lang === 'en' ? 'en' : 'ar';
  TFI.setLang(LANG);

  /* ================= state ================= */
  let DATA = loadData();
  let liveSession = null;      /* active session object (not yet saved) */
  let sessionTimers = [];
  let startedAt = null;
  let clockTimer = null;
  let online = true;
  let offlineShown = false;

  function persist() { saveData(DATA); }

  /* ================= API layer ================= */
  const TOKEN_KEY = 'tf_token';
  const TOKEN = (() => {
    let tk = null;
    try { tk = localStorage.getItem(TOKEN_KEY); } catch (e) { /* private mode */ }
    if (!tk || typeof tk !== 'string' || tk.length < 6) {
      tk = 'tf-' + uid();
      try { localStorage.setItem(TOKEN_KEY, tk); } catch (e) { /* ignore */ }
    }
    return tk;
  })();

  async function api(method, path, body) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 9000);
    try {
      const res = await fetch(path, {
        method,
        signal: ctl.signal,
        headers: Object.assign({ Accept: 'application/json' }, body ? { 'Content-Type': 'application/json' } : {}),
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) {
        const err = new Error('HTTP ' + res.status);
        err.status = res.status;
        throw err;
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function apiTry(method, path, body) {
    try {
      return await api(method, path, body);
    } catch (err) {
      // A 4xx means the server is reachable (validation/conflict), so it is
      // not an offline condition — only network failures and 5xx are.
      if (!err || !err.status || err.status >= 500) markOffline();
      console.warn('[api] ' + method + ' ' + path + ' — ' + (err && err.message || err));
      return null;
    }
  }

  function markOffline() {
    online = false;
    if (!offlineShown) {
      offlineShown = true;
      toast(t('offline_notice') !== 'offline_notice'
        ? t('offline_notice')
        : (LANG === 'ar' ? 'تعذر الاتصال بالخادم — يعمل الوضع المحلي مؤقتاً' : 'Could not reach the server — local mode'), 'warn');
    }
  }

  /* boot sync: ensures the trainee row exists server-side and pulls settings */
  async function syncFromServer() {
    const res = await apiTry('POST', '/api/bootstrap', { token: TOKEN, lang: LANG });
    if (res && res.ok) {
      DATA.settings.name = (res.settings && res.settings.name) || DATA.settings.name || '';
      DATA.settings.lang = LANG;
      DATA.settings.coach = !res.settings || res.settings.coach !== false;
      DATA.settings.onboarded = !!(res.settings && res.settings.onboarded);
      if (res.diagnostic) DATA.diagnostic = res.diagnostic;
      if (res.progress) res.progress.forEach(id => { DATA.knowledge.read[id] = true; });
      persist();
    }
  }

  /* dashboard sync: sessions list (summaries) + diagnostic + progress */
  async function syncDashboard() {
    const res = await apiTry('GET', '/api/dashboard?token=' + encodeURIComponent(TOKEN));
    if (res && res.ok) {
      const byId = {};
      (res.sessions || []).forEach(x => { byId[x.id] = x; });
      DATA.sessions.forEach(x => {
        // Keep the richer local copy (full transcript) over a server summary.
        if (!byId[x.id] || (x.messages && !byId[x.id].messages)) byId[x.id] = x;
      });
      DATA.sessions = Object.values(byId).sort((a, b) =>
        new Date(b.endedAt || b.startedAt || 0) - new Date(a.endedAt || a.startedAt || 0));
      if (res.diagnostic) DATA.diagnostic = res.diagnostic;
      if (res.progress) res.progress.forEach(id => { DATA.knowledge.read[id] = true; });
      persist();
    }
  }

  /* ================= boot ================= */
  /* Temporarily disabled pages. Remove an entry to fully re-enable that page
     and its navigation link; views, routes and data stay untouched. */
  const DISABLED_ROUTES = ['dashboard', 'learn'];

  function isDisabledRoute(name) {
    return DISABLED_ROUTES.indexOf(String(name || '').toLowerCase()) !== -1;
  }
  function isDisabledPath(path) {
    const p = String(path || '').split('?')[0].replace(/\/+$/, '') || '/';
    return isDisabledRoute(p.replace(/^\//, ''));
  }
  function comingSoon() { toast(t('coming_soon')); }

  function syncDisabledNav() {
    $$('.nav-link').forEach(a => {
      const off = isDisabledRoute(a.dataset.nav);
      a.classList.toggle('nav-disabled', off);
      if (off) {
        a.setAttribute('aria-disabled', 'true');
        a.title = t('coming_soon');
      } else {
        a.removeAttribute('aria-disabled');
        a.removeAttribute('title');
      }
    });
  }

  /* Any link to a disabled page is intercepted: no navigation, just a toast. */
  function guardDisabledLinks(e) {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (isDisabledPath(href) || isDisabledRoute(a.dataset.nav)) {
      e.preventDefault();
      comingSoon();
    }
  }

  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    DATA.settings.lang = LANG;
    document.addEventListener('click', guardDisabledLinks);
    window.addEventListener('popstate', render);
    syncDisabledNav();
    syncFromServer().then(() => {
      render();
      if (!DATA.settings.onboarded) setTimeout(showOnboarding, 400);
    });
  }

  /* ================= routing (real URLs, server-rendered shells) ================= */
  const VIEWS = {
    home: viewHome,
    diagnostic: viewDiagnostic,
    learn: viewLearn,
    simulate: viewSimulate,
    session: viewSession,
    dashboard: viewDashboard,
    report: viewReport
  };

  function currentRoute() {
    const p = location.pathname.replace(/\/+$/, '') || '/';
    if (p === '/' || p === '') return { view: 'home', arg: null };
    const m = p.match(/^\/report\/([^\/]+)$/);
    if (m) return { view: 'report', arg: decodeURIComponent(m[1]) };
    const name = p.slice(1);
    return VIEWS[name] ? { view: name, arg: null } : { view: 'home', arg: null };
  }

  function urlParam(name) { return new URLSearchParams(location.search).get(name); }

  function render() {
    clearSessionTimers();
    const r = currentRoute();
    if (isDisabledRoute(r.view)) {
      comingSoon();
      history.replaceState({}, '', '/');
      return render();
    }
    setNav(r.view === 'session' ? 'simulate' : r.view === 'report' ? 'dashboard' : r.view);
    syncDisabledNav();
    const main = $('#view');
    main.innerHTML = '';
    window.scrollTo(0, 0);
    try {
      const out = VIEWS[r.view](r.arg, main);
      if (out && typeof out.catch === 'function') out.catch(e => showError(main, e));
    } catch (e) {
      showError(main, e);
    }
  }

  function showError(main, e) {
    console.error(e);
    main.append(el('div', { class: 'container' },
      el('div', { class: 'card error-card' }, el('h2', null, '⚠'), el('p', null, String((e && e.message) || e)))));
  }

  function setNav(nav) {
    $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
  }

  /* In-memory flows (picker → session → report) stay on pushState so
     liveSession survives; everything else is a normal page load. */
  function nav(path) {
    if (isDisabledPath(path)) { comingSoon(); return; }
    if (path === '/session' || path.indexOf('/report/') === 0) {
      if (location.pathname !== path) history.pushState({}, '', path);
      render();
    } else {
      location.href = path;
    }
  }

  /* ================= shared UI ================= */
  function container(...children) { return el('div', { class: 'container' }, ...children); }

  function pageHead(title, sub, iconName) {
    return el('header', { class: 'page-head' },
      el('div', { class: 'ph-icon', html: icon(iconName || 'compass', 26) }),
      el('div', { class: 'ph-text' },
        el('h1', null, title),
        sub ? el('p', null, sub) : null));
  }

  function sectionTitle(txt) {
    return el('h2', { class: 'sec-title' }, el('span', { class: 'sec-rule' }), txt);
  }

  /* ================= LOGO ================= */
  function logoSVG(size) {
    const s = size || 34;
    return `<svg width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#0d5c6b"/>
      <path d="M12 16h14a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-4l-4 4v-4h-2a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z" fill="#ffffff"/>
      <path d="M36 12h-6a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h2l4 4v-4a4 4 0 0 0 4-4v-3a4 4 0 0 0-4-4Z" fill="#c9a227" transform="translate(0,1)"/>
    </svg>`;
  }

  /* ================= HOME ================= */
  function viewHome(_arg, main) {
    const hero = el('section', { class: 'hero' },
      el('div', { class: 'container hero-grid' },
        el('div', { class: 'hero-copy' },
          el('span', { class: 'hero-eyebrow' }, t('hero_badge')),
          el('h1', { class: 'hero-title' },
            t('hero_title_1') + ' ',
            el('span', { class: 'hero-hl' }, t('hero_title_hl')),
            ' ' + t('hero_title_2')),
          el('p', { class: 'hero-sub' }, t('hero_sub')),
          el('div', { class: 'hero-cta' },
            el('a', {
              class: 'btn btn-primary btn-lg hero-btn-primary', href: '/diagnostic', onclick: e => {
                e.preventDefault();
                if (!DATA.settings.onboarded) showOnboarding(); else location.href = '/diagnostic';
              }
            }, icon('compass', 18), t('hero_cta')),
            el('a', { class: 'btn btn-lg hero-btn-ghost', href: '/simulate' }, icon('flask', 18), t('hero_cta2'))),
          el('ul', { class: 'hero-trust' },
            heroTrust('flask', t('hero_trust_1')),
            heroTrust('gauge', t('hero_trust_2')),
            heroTrust('doc', t('hero_trust_3')))),
        el('div', { class: 'hero-art' },
          el('div', { class: 'hero-chat' },
            chatDemo()))));

    const stats = el('section', { class: 'stats-band' },
      el('div', { class: 'container stats-grid' },
        stat(TFS.SCENARIOS.length + '+', t('stat_scenarios')),
        stat('2', t('stat_langs')),
        stat('7', t('stat_criteria')),
        stat(TFK.UNITS.length, t('stat_units'))));

    const why = el('section', { class: 'container' },
      sectionTitle(t('why_title')),
      el('p', { class: 'lead muted' }, t('why_sub')),
      el('div', { class: 'cards-3' },
        whyCard('shield', t('why_1_t'), t('why_1_d')),
        whyCard('users', t('why_2_t'), t('why_2_d')),
        whyCard('gauge', t('why_3_t'), t('why_3_d'))));

    /* journey */
    const journey = el('section', { class: 'band' },
      el('div', { class: 'container' },
        sectionTitle(t('journey_title')),
        el('p', { class: 'lead muted' }, t('journey_sub')),
        el('div', { class: 'journey-row' },
          [1, 2, 3, 4, 5].map(i => el('div', { class: 'journey-step' },
            el('div', { class: 'jnum' }, String(i)),
            el('b', null, t('j' + i + '_t')),
            el('p', null, t('j' + i + '_d')))))));

    /* components */
    const comps = el('section', { class: 'container' },
      sectionTitle(t('comps_title')),
      el('p', { class: 'lead muted' }, t('comps_sub')),
      el('div', { class: 'cards-mix' },
        compCard('flask', t('c_lab_t'), t('c_lab_d'), '/simulate'),
        compCard('compass', t('c_style_t'), t('c_style_d'), '/diagnostic'),
        compCard('book', t('c_lib_t'), t('c_lib_d'), '/learn'),
        compCard('gauge', t('c_dash_t'), t('c_dash_d'), '/dashboard'),
        compCard('chat', t('c_room_t'), t('c_room_d'), '/simulate')));

    /* theory */
    const theory = el('section', { class: 'band' },
      el('div', { class: 'container' },
        sectionTitle(t('theory_title')),
        el('p', { class: 'lead muted' }, t('theory_sub')),
        el('div', { class: 'theory-grid' },
          el('div', { class: 'theory-col' },
            [1, 2, 3, 4].map(i => el('div', { class: 'theory-item' },
              el('div', { class: 'ti-icon', html: icon('scale', 20) }),
              el('div', null, el('b', null, t('tp' + i + '_t')), el('p', null, t('tp' + i + '_d')))))),
          el('div', { class: 'theory-col gold' },
            [1, 2, 3].map(i => el('div', { class: 'theory-item' },
              el('div', { class: 'ti-icon gold', html: icon('chat', 20) }),
              el('div', null, el('b', null, t('td' + i + '_t')), el('p', null, t('td' + i + '_d')))))))));

    const finalCta = el('section', { class: 'container final-cta' },
      el('div', { class: 'cta-card' },
        el('h2', null, t('home_final_cta')),
        el('div', { class: 'hero-cta' },
          el('a', { class: 'btn btn-gold', href: '/diagnostic' }, icon('compass', 18), t('diag_start')),
          el('a', { class: 'btn btn-ghost', href: '/simulate' }, icon('flask', 18), t('nav_simulate')))));

    main.append(hero, stats, why, journey, comps, theory, finalCta);
  }

  function stat(v, l) { return el('div', { class: 'stat' }, el('b', null, String(v)), el('span', null, l)); }
  function whyCard(ic, title, desc) {
    return el('div', { class: 'card why-card' },
      el('div', { class: 'wc-icon', html: icon(ic, 22) }),
      el('b', null, title), el('p', null, desc));
  }
  function compCard(ic, title, desc, href) {
    const off = isDisabledPath(href);
    return el('a', { class: 'card comp-card' + (off ? ' is-disabled' : ''), href, 'aria-disabled': off ? 'true' : null },
      el('div', { class: 'wc-icon', html: icon(ic, 22) }),
      el('b', null, title), el('p', null, desc),
      el('span', { class: 'cc-arrow', html: icon('arrowRight', 16) }));
  }

  function heroTrust(iconName, label) {
    return el('li', null,
      el('span', { class: 'ht-icon', html: icon(iconName, 16) }),
      el('span', null, label));
  }

  function chatDemo() {
    const demo = {
      ar: [
        ['cp', 'أ. سامي الفيتوري', 'قرأت طلبكم بشأن زيادة الاعتماد. السقف المعتمد لا يسمح بأكثر من 5%... ما الذي جعل الوضع حرجاً بهذه السرعة؟'],
        ['user', 'أنت', 'أقدّر التزامكم بالسقف. قبل الأرقام: ما الذي يحميك نظامياً عند أي تجاوز؟'],
        ['coach', 'الموجّه', 'ممتاز — سؤال عن المصالح النظامية يفتح منطقة الحل. جرّب ربط الزيادة بمؤشرات موثقة.'],
        ['cp', 'أ. سامي الفيتوري', 'إن وُجدت مؤشرات أداء موثّقة تربط الصرف بنتائج الخدمة، أستطيع الدفاع عن زيادة استثنائية أمام اللجنة.']
      ],
      en: [
        ['cp', 'Mr. Sami Fituri', 'I\u2019ve read your allocation request. The approved ceiling allows at most 5%... What made the situation escalate this quickly?'],
        ['user', 'You', 'I appreciate your commitment to the ceiling. Before numbers: what procedurally protects you in any breach?'],
        ['coach', 'Coach', 'Excellent — a question about procedural interests opens the solution zone. Try tying the increase to documented KPIs.'],
        ['cp', 'Mr. Sami Fituri', 'If there are documented KPIs linking spending to service outcomes, I can defend an exceptional increase before the committee.']
      ]
    }[LANG];
    return demo.map(([role, who, text]) =>
      el('div', { class: 'msg msg-' + role },
        el('div', { class: 'msg-head' }, who),
        el('div', { class: 'msg-bubble' }, text)));
  }

  /* ================= DIAGNOSTIC ================= */
  function viewDiagnostic(_arg, main) {
    let idx = 0;
    const answers = [];

    if (DATA.diagnostic && !urlParam('retake')) {
      main.append(container(
        el('div', { class: 'diag-shell wide' },
          pageHead(t('diag_title'), t('diag_sub'), 'compass'),
          resultCard(DATA.diagnostic, true))));
      return;
    }

    const head = pageHead(t('diag_title'), t('diag_sub'), 'compass');
    const card = el('div', { class: 'card quiz-card' });
    const progress = el('div', { class: 'quiz-progress' });
    const body = el('div', { class: 'quiz-body' });
    card.append(progress, body);

    function renderQ() {
      progress.innerHTML = '';
      progress.append(
        el('span', { class: 'qp-count' }, t('diag_progress', { n: idx + 1, total: TFD.QUESTIONS.length })),
        el('span', { class: 'qp-bar' }, el('span', { class: 'qp-fill', style: { width: (idx / TFD.QUESTIONS.length * 100) + '%' } })));
      body.innerHTML = '';
      const q = TFD.QUESTIONS[idx];
      const L = v => v[LANG] || v.ar;
      body.append(
        el('p', { class: 'quiz-q' }, L(q.q)),
        el('p', { class: 'muted small' }, t('diag_q_ph')),
        el('div', { class: 'quiz-opts' },
          el('button', { class: 'quiz-opt', onclick: () => answer('a') }, el('span', { class: 'opt-letter' }, 'أ'), L(q.a)),
          el('button', { class: 'quiz-opt', onclick: () => answer('b') }, el('span', { class: 'opt-letter' }, 'ب'), L(q.b))));
    }

    function answer(ch) {
      answers[idx] = ch;
      idx++;
      if (idx < TFD.QUESTIONS.length) renderQ();
      else finish();
    }

    function finish() {
      const res = TFD.computeStyle(answers);
      DATA.diagnostic = { date: TF.todayISO(), style: res.dominant, secondary: res.secondary, scores: res.scores, answers };
      persist();
      /* store server-side (scores object keyed by style name) */
      apiTry('POST', '/api/diagnostic', { token: TOKEN, style: res.dominant, scores: res.scores });
      main.innerHTML = '';
      main.append(container(el('div', { class: 'diag-shell wide' },
        pageHead(t('diag_title'), t('diag_sub'), 'compass'),
        resultCard(DATA.diagnostic, false))));
      toast(t('diag_saved'), 'ok');
    }

    renderQ();
    main.append(container(el('div', { class: 'diag-shell' }, head, card)));
  }

  function resultCard(diag, showRestartBtn) {
    const styleName = t('style_' + diag.style);
    const prof = TFD.PROFILES[diag.style];
    const p = prof[LANG] || prof.ar;
    const styleIcon = { competing: 'flag', collaborating: 'users', compromising: 'scale', accommodating: 'heart', avoiding: 'clock' }[diag.style] || 'compass';

    const card = el('div', { class: 'card diag-result' },
      el('div', { class: 'dr-head' },
        el('div', { class: 'dr-icon', html: icon(styleIcon, 30) }),
        el('div', null,
          el('span', { class: 'muted small' }, t('diag_dominant')),
          el('h2', null, styleName)),
        el('span', { class: 'pill pill-ok' }, new Date(diag.date).toLocaleDateString(LANG === 'ar' ? 'ar-LY' : 'en-GB'))),
      el('p', { class: 'dr-desc' }, t('style_' + diag.style + '_d')),
      el('div', { class: 'dr-cols' },
        el('div', null, el('h3', { class: 'ok' }, t('diag_strengths')), el('ul', { class: 'rep-list plus' }, p.strengths.map(s => el('li', null, s)))),
        el('div', null, el('h3', { class: 'bad' }, t('diag_weaknesses')), el('ul', { class: 'rep-list avoid' }, p.weaknesses.map(s => el('li', null, s))))),
      el('h3', { class: 'gold-h' }, t('diag_advice')),
      el('ul', { class: 'rep-list' }, p.advice.map(s => el('li', null, s))),
      el('h3', { class: 'gold-h' }, t('diag_recommend')),
      el('div', { class: 'chips-row' },
        prof.recommend.map(id => {
          const sc = TFS.getScenario(id);
          return el('a', { class: 'chip-link', href: '/simulate' }, icon('flask', 15), (sc && (sc.title[LANG] || sc.title.ar)) || id);
        })),
      showRestartBtn ? el('div', { class: 'center-row', style: { marginTop: '18px' } },
        el('a', { class: 'btn btn-ghost', href: '/diagnostic?retake=1' }, icon('refresh', 16), t('diag_restart'))) : null,
      el('div', { class: 'center-row', style: { marginTop: '18px' } },
        el('a', { class: 'btn btn-gold', href: '/simulate' }, icon('flask', 16), t('nav_simulate'))));
    return card;
  }

  /* ================= LEARN ================= */
  function viewLearn(_arg, main) {
    const L = v => typeof v === 'string' ? v : (v[LANG] || v.ar);
    const done = TFK.UNITS.filter(u => DATA.knowledge.read[u.id]).length;

    main.append(container(
      pageHead(t('learn_title'), t('learn_sub'), 'book'),
      el('p', { class: 'lead muted' }, t('learn_progress', { n: done, total: TFK.UNITS.length })),
      el('p', { class: 'muted small' }, t('learn_locked_hint')),
      el('div', { class: 'units-grid' },
        TFK.UNITS.map((u, i) => {
          const read = !!DATA.knowledge.read[u.id];
          return el('div', { class: 'card unit-card' + (read ? ' done' : '') },
            el('div', { class: 'uc-head' },
              el('span', { class: 'uc-num' }, String(i + 1)),
              el('b', { class: 'uc-title' }, L(u.title)),
              read ? el('span', { class: 'pill pill-ok' }, icon('check', 12), t('learn_marked')) : null),
            el('p', { class: 'uc-intro' }, L(u.intro)),
            el('div', { class: 'uc-foot' },
              el('span', { class: 'uc-min' }, icon('clock', 13), u.minutes + ' ' + t('learn_min')),
              el('button', { class: 'btn btn-sm btn-ghost', onclick: () => openUnit(u) }, t('learn_read'))));
        }))));

    function openUnit(u) {
      const modal = el('div', { class: 'modal-back', onclick: e => { if (e.target === modal) modal.remove(); } });
      const box = el('div', { class: 'modal unit-modal' });
      const L2 = v => typeof v === 'string' ? v : (v[LANG] || v.ar);
      box.append(
        el('div', { class: 'modal-head' },
          el('b', null, L2(u.title)),
          el('button', { class: 'icon-btn', onclick: () => modal.remove(), html: icon('x', 16) })),
        el('div', { class: 'modal-body' },
          el('p', { class: 'uc-intro' }, L2(u.intro)),
          u.body.map(sec => el('div', { class: 'unit-sec' },
            el('h4', null, L2(sec.h)),
            sec.p.map(pp => el('p', null, L2(pp))))),
          el('div', { class: 'key-box' },
            el('b', null, t('learn_key')),
            el('ul', { class: 'rep-list plus' }, u.key.map(k => el('li', null, L2(k))))),
          quizBlock(u)),
        el('div', { class: 'modal-foot' },
          el('button', {
            class: 'btn btn-gold', onclick: () => {
              DATA.knowledge.read[u.id] = true;
              persist();
              apiTry('POST', '/api/progress', { token: TOKEN, unitId: u.id });
              modal.remove();
              render();
              toast(t('done'), 'ok');
            }
          }, icon('check', 15), t('done'))));
      modal.append(box);
      document.body.append(modal);
    }

    function quizBlock(u) {
      const wrap = el('div', { class: 'quiz-mini' }, el('b', null, t('learn_check')), el('p', null, L(u.quiz.q)));
      const opts = u.quiz.options.map((o, i) => el('button', {
        class: 'quiz-opt small',
        onclick: ev => {
          $$('.quiz-opt', wrap).forEach(b => b.classList.remove('sel-ok', 'sel-bad'));
          ev.currentTarget.classList.add(i === u.quiz.correct ? 'sel-ok' : 'sel-bad');
          const expl = $('.quiz-why', wrap);
          if (expl) expl.remove();
          wrap.append(el('p', { class: 'quiz-why ' + (i === u.quiz.correct ? 'ok' : 'bad') },
            (i === u.quiz.correct ? '✔ ' : '▲ ') + L(u.quiz.why)));
        }
      }, el('span', { class: 'opt-letter' }, String.fromCharCode(65 + i)), L(o)));
      opts.forEach(o => wrap.append(o));
      return wrap;
    }
  }

  /* ================= SIMULATE (picker) ================= */
  function viewSimulate(_arg, main) {
    const L = v => typeof v === 'string' ? v : (v[LANG] || v.ar || v.en);

    if (liveSession && !liveSession.ended) { nav('/session'); return; }

    let filter = 'all';
    const grid = el('div', { class: 'scen-grid' });
    const filters = el('div', { class: 'filters-row' });

    function chipBtn(val, label, icon_) {
      const b = el('button', { class: 'filter-chip' + (filter === val ? ' on' : ''), onclick: () => { filter = val; renderGrid(); $$('button', filters).forEach(x => x.classList.remove('on')); b.classList.add('on'); } }, icon_ ? icon(icon_, 14) : null, label);
      return b;
    }
    filters.append(
      chipBtn('all', t('sim_filters_all'), 'grid'),
      chipBtn('easy', t('sim_filter_easy'), 'star'),
      chipBtn('medium', t('sim_filter_med'), 'star'),
      chipBtn('hard', t('sim_filter_hard'), 'star'),
      chipBtn('dialogue', t('sim_filter_dial'), 'chat'),
      chipBtn('negotiation', t('sim_filter_neg'), 'scale'));

    const diffLabels = { 1: t('sim_diff1'), 2: t('sim_diff2'), 3: t('sim_diff3') };

    function scenCard(sc) {
      const done = DATA.sessions.filter(s => s.scenarioId === sc.id);
      const best = done.length ? Math.max(...done.map(s => s.outcome && s.outcome.overall || 0)) : null;
      return el('div', { class: 'card scen-card' },
        el('div', { class: 'sc-head' },
          el('span', { class: 'sc-diff d' + sc.difficulty }, diffLabels[sc.difficulty]),
          el('span', { class: 'sc-min' }, icon('clock', 13), sc.minutes + ' ' + t('minutes'))),
        el('h3', null, L(sc.title)),
        el('p', { class: 'sc-sum' }, L(sc.summary)),
        el('div', { class: 'sc-roles' },
          el('div', null, el('span', null, t('sim_for')), el('b', null, L(sc.traineeRole.title))),
          el('div', null, el('span', null, t('sim_vs')), el('b', null, L(sc.counterpart.name) + ' — ' + L(sc.counterpart.title)))),
        el('p', { class: 'sc-note muted small' }, t('sim_criteria_note')),
        el('div', { class: 'sc-foot' },
          done.length ? el('span', { class: 'sc-done' }, icon('medal', 13), t('sim_best', { score: best })) : null,
          el('button', { class: 'btn btn-gold', onclick: () => startScenario(sc) }, icon('play', 15), t('sim_start'))));
    }

    function renderGrid() {
      grid.innerHTML = '';
      let list = TFS.SCENARIOS;
      if (filter === 'easy') list = list.filter(s => s.difficulty === 1);
      if (filter === 'medium') list = list.filter(s => s.difficulty === 2);
      if (filter === 'hard') list = list.filter(s => s.difficulty === 3);
      if (filter === 'dialogue') list = list.filter(s => s.tags.includes('dialogue'));
      if (filter === 'negotiation') list = list.filter(s => s.tags.includes('negotiation'));
      list.forEach(sc => grid.append(scenCard(sc)));
    }

    /* custom builder */
    const customCard = el('div', { class: 'card custom-card' },
      el('div', { class: 'sc-head' }, el('span', { class: 'sc-diff d2' }, t('sim_custom_cta'))),
      el('h3', null, t('sim_custom_title')),
      el('p', { class: 'sc-sum' }, t('sim_custom_desc')),
      el('button', { class: 'btn btn-ghost', onclick: showCustomBuilder }, icon('plus', 15), t('sim_custom_cta')));

    main.append(container(
      pageHead(t('sim_title'), t('sim_sub'), 'flask'),
      filters, grid,
      el('div', { class: 'custom-wrap' }, customCard)));

    renderGrid();
  }

  function showCustomBuilder() {
    const f = {};
    const field = (key, label, ph, rows) => {
      f[key] = el(rows ? 'textarea' : 'input', {
        class: 'input', placeholder: ph, rows: rows || undefined
      });
      return el('label', { class: 'field' }, el('span', null, label), f[key]);
    };
    const modal = el('div', { class: 'modal-back', onclick: e => { if (e.target === modal) modal.remove(); } });
    const box = el('div', { class: 'modal unit-modal' });
    box.append(
      el('div', { class: 'modal-head' }, el('b', null, t('sim_custom_title')), el('button', { class: 'icon-btn', onclick: () => modal.remove(), html: icon('x', 16) })),
      el('div', { class: 'modal-body' },
        field('title', t('f_title'), t('f_title_ph')),
        field('context', t('f_context'), t('f_context_ph'), 3),
        field('myRole', t('f_myrole'), t('f_myrole_ph'), 2),
        field('cpRole', t('f_cprole'), t('f_cprole_ph')),
        field('cpName', t('f_cpname'), t('f_cpname_ph')),
        field('cpConstraint', t('f_cpconstraint'), t('f_cpconstraint_ph'))),
      el('div', { class: 'modal-foot' },
        el('button', { class: 'btn btn-ghost', onclick: () => modal.remove() }, t('cancel')),
        el('button', {
          class: 'btn btn-gold', onclick: () => {
            const title = f.title.value.trim();
            const context = f.context.value.trim();
            if (!title || !context) { toast(LANG === 'ar' ? 'العنوان والوصف مطلوبان' : 'Title and description are required', 'warn'); return; }
            const draft = TFS.customScenarioDraft();
            const scenario = TENG.completeCustomScenario(draft, {
              title, context,
              myRole: f.myRole.value.trim(),
              cpRole: f.cpRole.value.trim(),
              cpName: f.cpName.value.trim(),
              cpConstraint: f.cpConstraint.value.trim()
            }, LANG);
            modal.remove();
            startScenario(scenario);
          }
        }, icon('plus', 15), t('sim_custom_create'))));
    modal.append(box);
    document.body.append(modal);
  }

  /* ================= SESSION ================= */
  function startScenario(sc) {
    const opts = {
      lang: LANG,
      userName: DATA.settings.name || '',
      userStyle: DATA.diagnostic ? DATA.diagnostic.style : null,
      coachOn: DATA.settings.coach !== false,
      id: uid()
    };
    liveSession = TENG.createSession(sc, opts);
    startedAt = Date.now();
    nav('/session');
  }

  function clearSessionTimers() {
    sessionTimers.forEach(clearTimeout); sessionTimers = [];
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
  }

  function viewSession(_arg, main) {
    if (!liveSession) { location.replace('/simulate'); return; }
    const s = liveSession;
    const lang = s.lang;
    const L = v => typeof v === 'string' ? v : (v[lang] || v.ar || v.en || '');

    if (s.ended) { renderEvalScreen(main, s); return; }

    const wrap = el('div', { class: 'session-wrap' });

    /* header bar */
    const roundEl = el('b', { id: 'ses-round' }, t('ses_round', { n: s.turns }) + ' ' + t('ses_of_max', { max: s.maxTurns }));
    const timeEl = el('b', { id: 'ses-time' }, '00:00');
    const phaseEl = el('span', { class: 'phase-chip', id: 'ses-phase' }, phaseLabel(s.phase));

    const head = el('div', { class: 'ses-head card' },
      el('div', { class: 'ses-title' },
        el('b', null, L(s.scenario.title)),
        el('span', { class: 'muted small' }, t('sim_vs') + ': ' + L(s.scenario.counterpart.name) + ' — ' + L(s.scenario.counterpart.title))),
      el('div', { class: 'ses-meta' },
        phaseEl, roundEl,
        el('span', { class: 'ses-meta-item' }, icon('clock', 13), timeEl),
        el('button', { class: 'btn btn-sm btn-danger-ghost', onclick: confirmEnd }, icon('x', 13), t('ses_end'))));

    /* criteria sidebar */
    const critLabels = TFI.criteriaLabels(lang);
    const bars = {};
    const coachNoteEl = el('div', { class: 'coach-note muted', id: 'coach-note' },
      t(s.coachOn ? 'coach_empty' : 'coach_hidden'));
    const side = el('aside', { class: 'ses-side' },
      el('div', { class: 'card side-card' },
        el('b', { class: 'side-t' }, icon('gauge', 15), t('live_criteria')),
        el('p', { class: 'muted tiny' }, t('live_hint')),
        TFE.CRITERIA_IDS.filter(c => c !== 'outcome').map(c => {
          bars[c] = el('span', { class: 'score-fill' });
          return el('div', { class: 'score-row small' },
            el('span', { class: 'score-label' }, critLabels[c]),
            el('span', { class: 'score-track' }, bars[c]),
            el('b', { class: 'score-val', id: 'sv-' + c }, '—'));
        })),
      el('div', { class: 'card side-card coach-toggle' },
        el('b', { class: 'side-t' }, icon('bulb', 15), t('coach_label')),
        el('label', { class: 'switch' },
          el('input', {
            type: 'checkbox', checked: s.coachOn,
            onchange: e => {
              s.coachOn = e.target.checked;
              DATA.settings.coach = e.target.checked;
              persist();
              if (!s.coachOn) resetCoachNote(t('coach_hidden'));
            }
          }),
          el('span', { class: 'slider' })),
        el('p', { class: 'muted tiny' }, t('coach_toggle_hint')),
        coachNoteEl),
      el('div', { class: 'card side-card' },
        el('b', { class: 'side-t' }, icon('target', 15), t('sim_obj')),
        el('ul', { class: 'side-obj' }, (s.scenario.objectives || []).map(o => el('li', null, L(o))))));

    /* chat */
    const chat = el('div', { class: 'ses-chat card' });
    const feed = el('div', { class: 'chat-feed', id: 'chat-feed' });
    chat.append(feed);

    /* composer */
    const input = el('textarea', { class: 'composer-input', rows: 2, placeholder: t('composer_ph') });
    const sendBtn = el('button', { class: 'btn btn-gold btn-send', onclick: doSend }, icon('send', 16), t('send'));
    const chipsRow = el('div', { class: 'chips-row', id: 'chips-row' });
    const composer = el('div', { class: 'composer card' },
      el('div', { class: 'qp-title tiny muted' }, t('qp_title')),
      chipsRow,
      el('div', { class: 'composer-row' }, input, sendBtn));

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });

    wrap.append(el('div', { class: 'ses-grid' }, el('div', { class: 'ses-main' }, head, chat, composer), side));
    main.append(wrap);

    /* render existing messages */
    for (const m of s.messages) appendMsg(m, false);
    updateSidebar();
    updateChips();
    scrollFeed();
    startClock();

    /* ---------- interactions ---------- */
    let sending = false;
    function doSend() {
      if (sending || s.ended) return;
      const text = input.value.trim();
      if (!text) return;
      sending = true;
      input.value = '';
      input.disabled = true; sendBtn.disabled = true;

      const res = TENG.userTurn(s, text);
      appendMsg({ role: 'user', text, ts: Date.now() }, true);

      /* coaching feedback goes to the side panel, never into the dialogue */
      if (s.coachOn && res.rating && res.rating.valid) {
        const note = TFC.coachNote(s, res.analysis || TFA.analyze(text, lang), res.rating, s.turns);
        if (note) showCoachNote(note);
      }

      /* typing indicator + counterpart messages */
      showTyping();
      const delay = 700 + Math.random() * 700;
      sessionTimers.push(setTimeout(() => {
        hideTyping();
        for (const m of res.messages) appendMsg(m, true);
        if (res.ended) {
          finalizeSession(s);
          renderEvalScreen(main, s);
        } else {
          updateSidebar();
          updateChips();
          updateHead();
          scrollFeed();
          sending = false; input.disabled = false; sendBtn.disabled = false; input.focus();
        }
      }, delay));
    }

    function confirmEnd() {
      if (s.ended) return;
      const modal = el('div', { class: 'modal-back' });
      const box = el('div', { class: 'modal small-modal' },
        el('div', { class: 'modal-head' }, el('b', null, t('ses_end_confirm')), el('button', { class: 'icon-btn', html: icon('x', 16), onclick: () => modal.remove() })),
        el('div', { class: 'modal-body' },
          el('p', { class: 'muted small' }, t('ses_end_hint')),
          el('div', { class: 'center-col' },
            el('button', { class: 'btn btn-gold', onclick: () => { modal.remove(); endByUser('agreement'); } }, icon('check', 15), t('ses_end_agree')),
            el('button', { class: 'btn btn-danger-ghost', onclick: () => { modal.remove(); endByUser('walkaway'); } }, icon('x', 15), t('ses_end_walk')),
            el('button', { class: 'btn btn-ghost', onclick: () => modal.remove() }, t('ses_end_cancel')))));
      modal.append(box);
      document.body.append(modal);
    }

    function endByUser(type) {
      clearSessionTimers();
      TENG.endSession(s, type);
      finalizeSession(s);
      main.innerHTML = '';
      renderEvalScreen(main, s);
    }

    function showTyping() {
      const tip = el('div', { class: 'msg msg-cp typing', id: 'typing-ind' },
        el('div', { class: 'msg-bubble' }, el('span', { class: 'dots' }, el('i'), el('i'), el('i')), t('typing')));
      feed.append(tip);
      scrollFeed();
    }
    function hideTyping() { const tip = $('#typing-ind'); if (tip) tip.remove(); }

    function resetCoachNote(text) {
      coachNoteEl.className = 'coach-note muted';
      coachNoteEl.innerHTML = '';
      coachNoteEl.textContent = text;
    }

    function showCoachNote(note) {
      coachNoteEl.className = 'coach-note' + (note.tone ? ' tone-' + note.tone : '');
      coachNoteEl.innerHTML = '';
      coachNoteEl.append(el('b', { class: 'coach-note-t' }, note.title || ''));
      if (note.body) coachNoteEl.append(el('p', null, note.body));
      if (note.say) coachNoteEl.append(el('p', { class: 'coach-say' }, note.say));
    }

    function appendMsg(m, animate, tone) {
      /* Coach guidance lives in the side panel, not in the negotiation feed. */
      if (m.role === 'coach') return;
      const who = m.role === 'user' ? (DATA.settings.name || t('ses_you')) :
        m.role === 'cp' ? L(s.scenario.counterpart.name) :
        m.role === 'coach' ? t('coach_label') : t('sys_note');
      const node = el('div', { class: 'msg msg-' + m.role + (tone ? ' tone-' + tone : '') + (animate ? ' in' : '') },
        el('div', { class: 'msg-head' },
          el('span', { class: 'msg-who' }, who),
          el('span', { class: 'msg-time' }, TF.fmtTime(m.ts || Date.now()))),
        el('div', { class: 'msg-bubble' }, m.text));
      if (m.role === 'cp' && m.meta && m.meta.accepted) node.classList.add('deal-msg');
      feed.append(node);
      if (animate) scrollFeed();
    }

    function scrollFeed() { feed.scrollTop = feed.scrollHeight; }

    function updateHead() {
      const r = $('#ses-round'); if (r) r.textContent = t('ses_round', { n: s.turns }) + ' ' + t('ses_of_max', { max: s.maxTurns });
      const p = $('#ses-phase'); if (p) p.textContent = phaseLabel(s.phase);
    }

    function updateSidebar() {
      const agg = TFE.aggregate(s);
      for (const c of TFE.CRITERIA_IDS) {
        if (c === 'outcome') continue;
        const v = agg.criteria[c];
        const bar = bars[c]; if (!bar) continue;
        bar.style.width = Math.max(3, v) + '%';
        bar.style.background = v >= 72 ? '#2e8b57' : v >= 50 ? '#0d5c6b' : v >= 35 ? '#c77b1f' : '#b3492f';
        const sv = $('#sv-' + c); if (sv) sv.textContent = String(Math.round(v));
      }
    }

    function updateChips() {
      chipsRow.innerHTML = '';
      const chips = TFC.suggestChips(s, TFI);
      chips.forEach(c => chipsRow.append(el('button', {
        class: 'qchip',
        onclick: () => { input.value = c.label; input.focus(); }
      }, icon(c.icon || 'bulb', 14), c.label)));
    }

    function startClock() {
      timeEl.textContent = fmtClock(Date.now() - startedAt);
      clockTimer = setInterval(() => { timeEl.textContent = fmtClock(Date.now() - startedAt); }, 1000);
    }
  }

  function phaseLabel(p) { return t('phase_' + p); }

  function finalizeSession(s) {
    /* strip non-serialisable fields and store */
    const store = {
      id: s.id, scenarioId: s.scenarioId, custom: s.custom ? { title: s.custom.title, customInput: s.custom.customInput } : null,
      scenario: s.scenario, lang: s.lang, userName: s.userName, userStyle: s.userStyle,
      startedAt: s.startedAt, endedAt: s.endedAt || TF.todayISO(),
      turns: s.turns, maxTurns: s.maxTurns, phase: s.phase,
      messages: s.messages.filter(m => m.role !== 'coach')
        .map(m => ({ role: m.role, text: m.text, ts: m.ts, rating: m.rating ? { ...m.rating } : undefined })),
      flags: s.flags, outcome: s.outcome, evaluation: s.evaluation,
      coachOn: s.coachOn, ended: s.ended, endReason: s.endReason
    };
    /* ensure evaluation exists */
    if (!store.evaluation) store.evaluation = TFE.aggregate(store);
    if (!store.outcome) {
      store.outcome = { type: s.endReason || 'timeout', quality: 0, terms: { agreed: false }, relationship: TENG.relationshipScore(s), overall: store.evaluation.overall, behavioural: store.evaluation.behavioural };
    }
    DATA.sessions.unshift(store);
    if (DATA.sessions.length > 60) DATA.sessions.length = 60;
    persist();
    /* store server-side (idempotent upsert by session id) */
    apiTry('POST', '/api/sessions', { token: TOKEN, session: store });
    liveSession = store; /* keep for eval screen + report */
    toast(t('ev_saved'), 'ok');
  }

  /* ================= EVAL SCREEN ================= */
  function renderEvalScreen(main, s) {
    clearSessionTimers();
    const agg = s.evaluation || TFE.aggregate(s);
    const out = s.outcome || { type: 'timeout', quality: 0, relationship: 50 };
    const lang = s.lang;
    const critLabels = TFI.criteriaLabels(lang);
    const dialLabels = TFI.dialogueLabels(lang);
    const tier = TFE.tier(agg.overall, lang);
    const sw = TFE.strengthsWeaknesses(agg, lang);

    const scoreCard = (v, label, cls) => el('div', { class: 'ev-score ' + (cls || '') },
      el('b', null, String(Math.round(v))), el('span', null, label));

    const critRows = el('div', null, TFE.CRITERIA_IDS.map(c => {
      const v = agg.criteria[c];
      return el('div', { class: 'score-row' },
        el('span', { class: 'score-label' }, critLabels[c]),
        el('span', { class: 'score-track' }, el('span', { class: 'score-fill', style: { width: Math.max(3, v) + '%', background: barColor(v) } })),
        el('b', { class: 'score-val' }, String(Math.round(v))));
    }));

    const dialRows = el('div', null, TFE.DIALOGUE_IDS.map(c => {
      const v = agg.dialogue[c];
      return el('div', { class: 'score-row' },
        el('span', { class: 'score-label' }, dialLabels[c]),
        el('span', { class: 'score-track' }, el('span', { class: 'score-fill', style: { width: Math.max(3, v) + '%', background: barColor(v) } })),
        el('b', { class: 'score-val' }, String(Math.round(v))));
    }));

    const evCard = el('div', { class: 'card eval-hero' },
      el('div', { class: 'ev-tier tier-' + tier.key }, tier.label),
      el('h2', null, t('ev_title')),
      el('div', { class: 'ev-scores' },
        scoreCard(agg.overall, t('ev_overall'), 'gold'),
        scoreCard(agg.behavioural, t('ev_behavior')),
        scoreCard(agg.criteria.outcome, t('ev_outcome')),
        scoreCard(out.relationship, t('ev_relation'))),
      el('p', { class: 'ev-outcome' }, TFR.outcomeLabel(out.type, lang) + (out.terms && out.terms.text ? ' — ' + out.terms.text : '')),
      el('div', { class: 'ev-actions' },
        el('button', { class: 'btn btn-gold btn-lg', onclick: () => { nav('/report/' + s.id); } }, icon('doc', 17), t('ev_open_report')),
        el('button', { class: 'btn btn-ghost btn-lg', onclick: () => { liveSession = null; location.href = '/simulate'; } }, icon('flask', 17), t('ev_new')),
        el('button', { class: 'btn btn-ghost btn-lg', onclick: () => { location.href = '/dashboard'; } }, icon('gauge', 17), t('nav_dashboard'))));

    const grid = el('div', { class: 'ev-grid' },
      el('div', { class: 'card ev-card' }, el('h3', null, t('ev_criteria_title')), critRows),
      el('div', { class: 'card ev-card' }, el('h3', null, t('ev_dialogue_title')), dialRows),
      el('div', { class: 'card ev-card' },
        el('h3', { class: 'ok' }, t('ev_strengths')),
        sw.strengths.length ? el('ul', { class: 'rep-list plus' }, sw.strengths.map(x => el('li', null, (x.skill ? dialLabels[x.id] : critLabels[x.id]) + ' (' + Math.round(x.score) + ')'))) : el('p', { class: 'muted' }, t('none'))),
      el('div', { class: 'card ev-card' },
        el('h3', { class: 'bad' }, t('ev_weaknesses')),
        sw.weaknesses.length ? el('ul', { class: 'rep-list avoid' }, sw.weaknesses.map(x => el('li', null, (x.skill ? dialLabels[x.id] : critLabels[x.id]) + ' (' + Math.round(x.score) + ')'))) : el('p', { class: 'muted' }, t('none'))),
      el('div', { class: 'card ev-card ev-reco' },
        el('h3', { class: 'gold-h' }, t('ev_reco')),
        sw.recommendations.map(r => el('div', { class: 'reco-mini' }, el('b', null, r.skill ? dialLabels[r.id] : critLabels[r.id]), el('p', null, r.what)))));

    main.append(container(el('div', { class: 'eval-wrap' }, evCard, grid)));
  }

  function barColor(v) {
    if (v >= 72) return '#2e8b57';
    if (v >= 50) return '#0d5c6b';
    if (v >= 35) return '#c77b1f';
    return '#b3492f';
  }

  /* ================= REPORT ================= */
  async function viewReport(id, main) {
    let s = (liveSession && liveSession.id === id) ? liveSession : DATA.sessions.find(x => x.id === id);

    // A dashboard summary has no transcript; always pull the full record
    // for a deep link so the report is complete after a reload.
    if (s && !Array.isArray(s.messages)) s = null;

    if (!s) {
      /* fetch the full session from the API (deep link / shared URL) */
      main.append(container(el('div', { class: 'card error-card' },
        el('p', { class: 'muted' }, LANG === 'ar' ? 'جارٍ تحميل التقرير...' : 'Loading report...'))));
      const res = await apiTry('GET', '/api/sessions/' + encodeURIComponent(id));
      if (res && res.ok && res.session) {
        s = res.session;
        const idx = DATA.sessions.findIndex(x => x.id === s.id);
        if (idx >= 0) DATA.sessions[idx] = s;
        else DATA.sessions.unshift(s);
        persist();
      }
      main.innerHTML = '';
    }

    if (!s) {
      main.append(container(el('div', { class: 'card' }, el('p', null, t('rep_empty')), el('a', { class: 'btn btn-gold', href: '/simulate' }, t('nav_simulate')))));
      return;
    }
    const rep = TFR.assembleReport(s, DATA);
    const html = TFR.renderReportHTML(rep);
    const wrap = el('div', { class: 'report-wrap' });
    wrap.innerHTML = html;

    const actions = el('div', { class: 'report-actions card' },
      el('div', { class: 'ra-row' },
        el('button', {
          class: 'btn btn-gold btn-lg', onclick: async e => {
            const btn = e.currentTarget;
            btn.disabled = true;
            toast(t('rep_pdf_started'));
            try {
              await TFR.exportPDF(s, DATA);
              toast(t('rep_pdf_done'), 'ok');
            } catch (err) {
              console.error(err);
              toast(s.lang === 'ar' ? 'تعذر إنشاء PDF — جرّب الطباعة كبديل' : 'PDF failed — try print instead', 'warn');
            }
            btn.disabled = false;
          }
        }, icon('download', 17), t('download_pdf')),
        el('button', { class: 'btn btn-ghost btn-lg', onclick: () => window.print() }, icon('printer', 17), t('print')),
        el('a', { class: 'btn btn-ghost btn-lg', href: '/simulate' }, icon('flask', 17), t('ev_new')),
        el('a', { class: 'btn btn-ghost btn-lg', href: '/dashboard' }, icon('gauge', 17), t('nav_dashboard'))));

    const lang = s.lang;
    const page = wrap.querySelector('.report-page');
    main.append(actions, page ? page : wrap);
    TFR.mountCharts(page || wrap, rep);
  }

  /* ================= DASHBOARD ================= */
  async function viewDashboard(_arg, main) {
    const critLabels = TFI.criteriaLabels(LANG);
    await syncDashboard();
    const sessions = DATA.sessions;

    if (!sessions.length && !DATA.diagnostic) {
      main.append(container(
        pageHead(t('dash_title'), t('dash_sub'), 'gauge'),
        el('div', { class: 'card empty-card' },
          el('div', { class: 'ec-icon', html: icon('gauge', 34) }),
          el('p', null, t('dash_no_sessions')),
          el('a', { class: 'btn btn-gold', href: '/simulate' }, icon('flask', 16), t('nav_simulate')))));
      return;
    }

    const kpis = [];
    const avg = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.outcome ? s.outcome.overall : 0), 0) / sessions.length) : 0;
    const best = sessions.length ? Math.max(...sessions.map(s => s.outcome ? s.outcome.overall : 0)) : 0;

    /* weakest criterion across sessions */
    let weakest = null;
    if (sessions.length) {
      const sums = {}, counts = {};
      for (const s of sessions) {
        const ev = s.evaluation || TFE.aggregate(s);
        const crit = (ev && ev.criteria) || {};
        for (const c of TFE.CRITERIA_IDS) {
          sums[c] = (sums[c] || 0) + (crit[c] || 0); counts[c] = (counts[c] || 0) + 1;
        }
      }
      let minV = 101;
      for (const c of TFE.CRITERIA_IDS) {
        const v = sums[c] / counts[c];
        if (v < minV) { minV = v; weakest = c; }
      }
    }

    /* training days streak */
    const days = new Set(sessions.map(s => (s.endedAt || s.startedAt || '').slice(0, 10)).filter(Boolean));
    let streak = 0;
    for (let i = 0; ; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      if (days.has(d)) streak++; else if (i > 0) break; else if (!days.has(d)) break;
    }

    kpis.push(kpi(sessions.length, t('dash_kpi_sessions'), 'flask'));
    kpis.push(kpi(avg, t('dash_kpi_avg'), 'star'));
    kpis.push(kpi(best, t('dash_kpi_best'), 'medal'));
    if (weakest) kpis.push(kpi(critLabels[weakest], t('dash_kpi_criteria'), 'warn', true));
    kpis.push(kpi(streak, t('dash_kpi_streak'), 'clock'));

    /* trend */
    const trendWrap = el('div', { class: 'card dash-card' }, el('h3', null, t('dash_trend')));
    const trendCanvas = el('canvas', { class: 'trend-canvas' });
    trendWrap.append(trendCanvas);

    /* style card */
    const styleCard = DATA.diagnostic
      ? el('div', { class: 'card dash-card style-card' },
        el('h3', null, t('dash_style_card')),
        el('b', { class: 'style-name' }, t('style_' + DATA.diagnostic.style)),
        el('p', { class: 'muted small' }, t('style_' + DATA.diagnostic.style + '_d')),
        el('a', { class: 'btn btn-sm btn-ghost', href: '/diagnostic?retake=1' }, icon('refresh', 13), t('diag_restart')))
      : el('div', { class: 'card dash-card style-card' },
        el('h3', null, t('dash_style_card')),
        el('p', { class: 'muted' }, LANG === 'ar' ? 'لم تجري التشخيص بعد.' : 'No assessment yet.'),
        el('a', { class: 'btn btn-sm btn-gold', href: '/diagnostic' }, icon('compass', 13), t('diag_start')));

    /* knowledge progress */
    const unitsDone = TFK.UNITS.filter(u => DATA.knowledge.read[u.id]).length;
    const learnCard = el('div', { class: 'card dash-card' },
      el('h3', null, t('dash_knowledge')),
      el('div', { class: 'prog-row' },
        el('span', { class: 'prog-track' }, el('span', { class: 'prog-fill', style: { width: (unitsDone / TFK.UNITS.length * 100) + '%' } })),
        el('b', null, unitsDone + '/' + TFK.UNITS.length)),
      el('a', { class: 'btn btn-sm btn-ghost', href: '/learn' }, icon('book', 13), t('learn_read')));

    /* history table */
    const historyCard = el('div', { class: 'card dash-card history-card' }, el('h3', null, t('dash_history')));
    if (sessions.length) {
      const tbl = el('table', { class: 'hist-table' },
        el('thead', null, el('tr', null,
          el('th', null, t('rep_scenario')), el('th', null, t('date')),
          el('th', null, t('score')), el('th', null, ''))),
        el('tbody', null, sessions.map(s => el('tr', null,
          el('td', null, el('b', null, (s.scenario && s.scenario.title && (s.scenario.title[LANG] || s.scenario.title.ar)) || s.scenarioId)),
          el('td', { class: 'muted' }, fmtDate(s.endedAt || s.startedAt, LANG)),
          el('td', null, el('span', { class: 'pill ' + pillClass(s.outcome ? s.outcome.overall : 0) }, String(s.outcome ? s.outcome.overall : 0))),
          el('td', { class: 'hist-actions' },
            el('a', { class: 'icon-btn', href: '/report/' + s.id, title: t('view'), html: icon('eye', 15) }),
            el('button', {
              class: 'icon-btn', html: icon('download', 15), title: t('download_pdf'),
              onclick: async e => {
                const b = e.currentTarget; b.disabled = true;
                toast(t('rep_pdf_started'));
                let full = s.messages ? s : null;
                if (!full) {
                  const res = await apiTry('GET', '/api/sessions/' + encodeURIComponent(s.id));
                  if (res && res.ok) full = res.session;
                }
                if (full) {
                  try { await TFR.exportPDF(full, DATA); toast(t('rep_pdf_done'), 'ok'); } catch (err) { toast('PDF ⚠', 'warn'); }
                } else { toast('PDF ⚠', 'warn'); }
                b.disabled = false;
              }
            }),
            el('button', {
              class: 'icon-btn danger', html: icon('trash', 15), title: t('delete'),
              onclick: async () => {
                DATA.sessions = DATA.sessions.filter(x => x.id !== s.id);
                persist();
                await apiTry('DELETE', '/api/sessions/' + encodeURIComponent(s.id) + '?token=' + encodeURIComponent(TOKEN));
                render();
                toast(t('dash_deleted'), 'ok');
              }
            }))))));
      historyCard.append(tbl);
    } else {
      historyCard.append(el('p', { class: 'muted' }, t('dash_no_sessions')));
    }

    /* data controls */
    const dataCard = el('div', { class: 'card dash-card data-card' },
      el('h3', null, t('settings')),
      el('div', { class: 'ra-row' },
        el('button', { class: 'btn btn-sm btn-ghost', onclick: exportData }, icon('download', 13), t('dash_export')),
        el('button', { class: 'btn btn-sm btn-danger-ghost', onclick: resetData }, icon('trash', 13), t('dash_reset'))));

    main.append(container(
      pageHead(t('dash_title'), t('dash_sub'), 'gauge'),
      el('div', { class: 'kpi-grid' }, kpis),
      el('div', { class: 'dash-grid' }, trendWrap, styleCard, learnCard),
      historyCard,
      dataCard));

    /* draw sparkline */
    const vals = sessions.slice().reverse().map(s => s.outcome ? s.outcome.overall : 0);
    TFCH.drawSpark(trendCanvas, vals, {});
  }

  function kpi(v, label, ic, isText) {
    return el('div', { class: 'card kpi' },
      el('div', { class: 'kpi-icon', html: icon(ic, 20) }),
      el('div', null, el('b', null, isText ? v : String(v)), el('span', null, label)));
  }
  function pillClass(v) { return v >= 70 ? 'pill-ok' : v >= 50 ? 'pill-mid' : 'pill-bad'; }
  function exportData() {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tafahum-data-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
    toast(t('dash_exported'), 'ok');
  }
  async function resetData() {
    if (!confirm(t('dash_reset_confirm'))) return;
    DATA = TF.DEFAULT_DATA();
    DATA.settings.onboarded = true;
    DATA.settings.lang = LANG;
    persist();
    await apiTry('POST', '/api/reset', { token: TOKEN });
    render();
    toast(t('done'), 'ok');
  }

  /* ================= ONBOARDING ================= */
  function showOnboarding() {
    const modal = el('div', { class: 'modal-back' });
    const nameInput = el('input', { class: 'input', placeholder: t('ob_name_ph'), value: DATA.settings.name || '' });
    const box = el('div', { class: 'modal ob-modal' },
      el('div', { class: 'ob-hero' }, logoSVG(46),
        el('h2', null, t('ob_title')),
        el('p', { class: 'muted' }, t('ob_intro'))),
      el('div', { class: 'modal-body' },
        el('label', { class: 'field' }, el('span', null, t('ob_name')), nameInput),
        el('div', { class: 'field' },
          el('span', null, t('ob_lang')),
          el('div', { class: 'lang-row' },
            langBtn('ar', 'العربية'), langBtn('en', 'English'))),
        el('div', { class: 'ob-steps' },
          [1, 2, 3, 4, 5].map(i => el('div', { class: 'ob-step' }, el('span', { class: 'jnum sm' }, String(i)), t('ob_s' + i))))),
      el('div', { class: 'modal-foot' },
        el('button', { class: 'btn btn-gold btn-lg', onclick: () => { finishOb(); } }, icon('play', 15), t('ob_start'))));

    /* language switch is a server concern ( Blade chrome + <html lang dir> ):
       persist the choice then reload the page with ?lang= */
    function langBtn(l, label) {
      return el('button', {
        class: 'lang-btn' + (LANG === l ? ' on' : ''),
        onclick: async () => {
          await apiTry('POST', '/api/bootstrap', { token: TOKEN, lang: l, name: nameInput.value.trim() });
          location.href = location.pathname + '?lang=' + l;
        }
      }, label);
    }
    async function finishOb() {
      DATA.settings.name = nameInput.value.trim();
      DATA.settings.onboarded = true;
      DATA.settings.lang = LANG;
      persist();
      await apiTry('POST', '/api/bootstrap', {
        token: TOKEN, name: DATA.settings.name, lang: LANG,
        onboarded: true, coachOn: DATA.settings.coach !== false
      });
      modal.remove();
      render();
      toast(t('ob_title') + ' 🌱', 'ok');
    }
    modal.append(box);
    document.body.append(modal);
  }

  /* ================= SETTINGS modal + lang toggle (header wired in Blade) ================= */
  window.TFApp = {
    openSettings() {
      const modal = el('div', { class: 'modal-back', onclick: e => { if (e.target === modal) modal.remove(); } });
      const nameInput = el('input', { class: 'input', value: DATA.settings.name || '', placeholder: t('ob_name_ph') });
      const coachChk = el('input', { type: 'checkbox', checked: DATA.settings.coach !== false });
      const box = el('div', { class: 'modal small-modal' },
        el('div', { class: 'modal-head' }, el('b', null, t('settings')), el('button', { class: 'icon-btn', html: icon('x', 16), onclick: () => modal.remove() })),
        el('div', { class: 'modal-body' },
          el('label', { class: 'field' }, el('span', null, t('set_name')), nameInput),
          el('div', { class: 'field' },
            el('span', null, t('set_coach')),
            el('label', { class: 'switch' }, coachChk, el('span', { class: 'slider' })),
            el('p', { class: 'muted tiny' }, t('set_coach_d'))),
          el('div', { class: 'field' },
            el('span', null, t('set_lang')),
            el('div', { class: 'lang-row' },
              el('button', { class: 'lang-btn' + (LANG === 'ar' ? ' on' : ''), onclick: () => switchLang('ar') }, 'العربية'),
              el('button', { class: 'lang-btn' + (LANG === 'en' ? ' on' : ''), onclick: () => switchLang('en') }, 'English'))),
          el('div', { class: 'field about' }, el('span', null, t('set_about')), el('p', { class: 'muted tiny' }, t('set_about_d')))),
        el('div', { class: 'modal-foot' },
          el('button', { class: 'btn btn-ghost', onclick: () => modal.remove() }, t('close')),
          el('button', {
            class: 'btn btn-gold', onclick: async () => {
              DATA.settings.name = nameInput.value.trim();
              DATA.settings.coach = coachChk.checked;
              persist();
              await apiTry('POST', '/api/bootstrap', {
                token: TOKEN, name: DATA.settings.name, lang: LANG,
                onboarded: true, coachOn: coachChk.checked
              });
              modal.remove();
              toast(t('done'), 'ok');
            }
          }, t('save'))));
      async function switchLang(l) {
        await apiTry('POST', '/api/bootstrap', {
          token: TOKEN, lang: l, name: nameInput.value.trim(),
          onboarded: true, coachOn: coachChk.checked
        });
        location.href = location.pathname + '?lang=' + l;
      }
      modal.append(box);
      document.body.append(modal);
    },
    toggleLang() {
      const other = LANG === 'ar' ? 'en' : 'ar';
      location.href = location.pathname + '?lang=' + other;
    },
    logoSVG
  };

  document.addEventListener('DOMContentLoaded', boot);
  if (document.readyState !== 'loading') boot();
})();
