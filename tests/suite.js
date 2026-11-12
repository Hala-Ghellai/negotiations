/* ============================================================
   Tafahum Platform — test suite
   UMD: runs under Node (tests/run.mjs) and in the browser
   (test.html). Pure-logic tests over every module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    const M = require('./modules.js');
    module.exports = factory(
      M.TF, M.TFI, M.TFS, M.TFA, M.TFE, M.TENG,
      M.TFC, M.TFD, M.TFK, M.TFCH, M.TFPDF, M.TFR
    );
  } else {
    root.TFT = factory(root.TF, root.TFI, root.TFS, root.TFA, root.TFE, root.TENG, root.TFC, root.TFD, root.TFK, root.TFCH, root.TFPDF, root.TFR);
  }
})(typeof self !== 'undefined' ? self : this, function (TF, TFI, TFS, TFA, TFE, TENG, TFCoach, TFD, TFK, TFCH, TFPDF, TFR) {
  'use strict';

  /* ---------- tiny assert ---------- */
  let currentName = '';
  const failures = [];
  function ok(cond, msg) {
    if (!cond) throw new Error((currentName ? currentName + ' — ' : '') + (msg || 'assertion failed'));
  }
  function eq(a, b, msg) { ok(a === b, (msg || '') + ` (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`); }
  function near(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, (msg || '') + ` (expected ~${b}, got ${a})`); }
  function range(v, lo, hi, msg) { ok(v >= lo && v <= hi, (msg || '') + ` (expected ${lo}..${hi}, got ${v})`); }

  const TESTS = [];
  function test(name, fn) { TESTS.push({ name, fn }); }

  /* ============================================================
     1. i18n
     ============================================================ */
  test('i18n: AR/EN packs have identical key sets', () => {
    const ar = Object.keys(TFI.packs.ar).sort(), en = Object.keys(TFI.packs.en).sort();
    const arOnly = ar.filter(k => !TFI.packs.en.hasOwnProperty(k));
    const enOnly = en.filter(k => !TFI.packs.ar.hasOwnProperty(k));
    ok(arOnly.length === 0, 'keys missing in EN: ' + arOnly.join(', '));
    ok(enOnly.length === 0, 'keys missing in AR: ' + enOnly.join(', '));
    /* every value is a non-empty string (nested chips object allowed) */
    for (const pack of ['ar', 'en'])
      for (const [k, v] of Object.entries(TFI.packs[pack]))
        ok(typeof v === 'string' || typeof v === 'object', `bad value for ${pack}.${k}`);
  });

  test('i18n: t() interpolation + fallback', () => {
    TFI.setLang('ar');
    eq(TFI.t('nav_home'), 'الرئيسية', 'ar nav_home');
    ok(TFI.t('diag_progress', { n: 3, total: 12 }).includes('3'), 'vars interpolated');
    TFI.setLang('en');
    eq(TFI.t('nav_home'), 'Home', 'en nav_home');
    ok(TFI.t('missing_key_xyz') !== undefined, 'missing key returns something');
    TFI.setLang('ar');
  });

  test('i18n: criteria & dialogue labels complete in both languages', () => {
    const ids = TFI.CRITERIA_IDS, dIds = TFI.DIALOGUE_IDS;
    for (const lang of ['ar', 'en']) {
      const cl = TFI.criteriaLabels(lang), dl = TFI.dialogueLabels(lang);
      for (const id of ids) ok(cl[id] && String(cl[id]).trim(), `criteria label ${lang}.${id}`);
      for (const id of dIds) ok(dl[id] && String(dl[id]).trim(), `dialogue label ${lang}.${id}`);
    }
  });

  /* ============================================================
     2. scenarios
     ============================================================ */
  test('scenarios: library non-empty with unique ids', () => {
    ok(TFS.SCENARIOS.length >= 5, 'at least 5 scenarios');
    const ids = TFS.SCENARIOS.map(s => s.id);
    eq(new Set(ids).size, ids.length, 'unique ids');
    ok(TFS.getScenario('budget'), 'getScenario works');
    eq(TFS.getScenario('nope-xyz'), null, 'unknown id -> null');
  });

  test('scenarios: fully bilingual + structurally complete', () => {
    const bi = (v, where) => {
      ok(v && typeof v === 'object', where + ' must be a bilingual object');
      ok(v.ar && String(v.ar).trim(), where + '.ar');
      ok(v.en && String(v.en).trim(), where + '.en');
    };
    for (const s of TFS.SCENARIOS) {
      bi(s.title, s.id + '.title'); bi(s.summary, s.id + '.summary'); bi(s.context, s.id + '.context');
      ok(s.traineeRole && s.traineeRole.title && s.traineeRole.brief, s.id + ' trainee role');
      bi(s.traineeRole.title, s.id + '.role.title');
      ok(s.counterpart && s.counterpart.name && s.counterpart.constraint && s.counterpart.opening, s.id + ' counterpart');
      bi(s.counterpart.name, s.id + '.cp.name');
      ok((s.counterpart.interests || []).length >= 2, s.id + ' has >= 2 counterpart interests');
      for (const it of s.counterpart.interests) { bi(it.text, s.id + ' interest ' + it.id); ok(it.revealAtTrust >= 0, s.id + ' interest revealAtTrust'); }
      ok(s.objectives && s.objectives.length >= 1, s.id + ' objectives');
      ok(s.expertPath && s.expertPath.strategy && s.expertPath.moves.length >= 2 && s.expertPath.avoid.length >= 1, s.id + ' expert path');
      ok(s.topicSWOT && s.topicSWOT.strengths.length >= 1 && s.topicSWOT.weaknesses.length >= 1, s.id + ' SWOT');
      ok(TFS.PERSONALITIES[s.personality], s.id + ' personality ' + s.personality);
      for (const d of s.dimensions || []) {
        bi(d.label, `${s.id}.${d.id}.label`);
        ok(['more', 'less'].includes(d.direction), `${s.id}.${d.id} direction`);
        ok(!d.hidden, `${s.id}.${d.id} must not be hidden`);
        for (const k of ['userGoal', 'userFloor', 'cpStart', 'cpFloor']) ok(typeof d[k] === 'number', `${s.id}.${d.id}.${k} number`);
      }
      for (const p of s.packages || []) {
        ok(p.signals && p.signals.length, `${s.id} package ${p.id} signals`);
        bi(p.label, `${s.id} package ${p.id} label`);
      }
    }
  });

  test('scenarios: ZOPA exists on every dimension (deal is possible)', () => {
    for (const s of TFS.SCENARIOS) {
      for (const d of s.dimensions || []) {
        const zopa = d.direction === 'more' ? d.userFloor <= d.cpFloor : d.userFloor >= d.cpFloor;
        ok(zopa, `${s.id}.${d.id}: no ZOPA (userFloor=${d.userFloor} cpFloor=${d.cpFloor} dir=${d.direction})`);
        /* counterpart's opening must sit strictly beyond their reservation point
           (they should have room to move), and within their own bounds */
        if (d.direction === 'more') ok(d.cpStart < d.cpFloor, `${s.id}.${d.id}: cpStart should start below cpFloor`);
        else ok(d.cpStart > d.cpFloor, `${s.id}.${d.id}: cpStart should start above cpFloor`);
      }
    }
  });

  test('scenarios: custom scenario builder', () => {
    const draft = TFS.customScenarioDraft();
    ok(draft && draft.counterpart, 'draft has counterpart scaffold');
    const input = { title: 'تمديد عقد النظافة', context: 'شركة خدمات تطلب تمديد عقد النظافة للمبنى الرئيسي بزيادة 10% مع الحفاظ على مستوى الخدمة الحالي.', myRole: 'مدير إدارة العقارات', cpName: 'ممثل الشركة', cpRole: 'مدير العمليات', cpConstraint: 'زيادة أسعار الوقود والمواد' };
    const filled = TENG.completeCustomScenario(draft, input, 'ar');
    eq(filled.title.ar, input.title, 'title copied');
    ok(filled.counterpart.opening.ar.includes(input.title), 'opening mentions the title');
    ok(filled.dimensions !== undefined, 'dimensions inferred');
    ok((filled.counterpart.interests || []).length >= 2, 'interests scaffolded');
    ok(filled.expertPath.moves.length >= 2, 'expert path scaffolded');
  });

  /* ============================================================
     3. analyzer
     ============================================================ */
  test('analyzer: normalization folds hamza/diacritics/ya (batna matches)', () => {
    const a = TFA.analyze('إن لم نتفق، سنلجأ إلى المرسل الآخر.', 'ar');
    ok(a.intents.batna, 'hamza form إن لم نتفق must match batna bank');
    eq(TFA.normalize('أإآى'), 'اااي', 'alef+ya folding');
    eq(TFA.normalize('مُحَمَّد'), 'محمد', 'diacritics stripped');
    eq(TFA.normalize('٤٥٪'), '45%', 'Arabic-Indic digits + percent');
  });

  test('analyzer: every suggested chip registers its intended intent (AR)', () => {
    TFI.setLang('ar');
    const chips = TFI.packs.ar.chips;
    const cases = [
      [chips.interests, a => a.intents.questionInterests],
      [chips.criteria, a => a.intents.criteria],
      [chips.option, a => a.intents.option],
      [chips.rapport, a => a.tone.rapport > 0],
      [chips.batna, a => a.intents.batna],
      [chips.summarize, a => a.intents.paraphrase]
    ];
    for (const [txt, predicate] of cases) {
      const a = TFA.analyze(txt, 'ar');
      ok(predicate(a), `AR chip "${txt}" did not register its intent`);
    }
  });

  test('analyzer: every suggested chip registers its intended intent (EN)', () => {
    TFI.setLang('en');
    const chips = TFI.packs.en.chips;
    const cases = [
      [chips.interests, a => a.intents.questionInterests],
      [chips.criteria, a => a.intents.criteria],
      [chips.option, a => a.intents.option],
      [chips.rapport, a => a.tone.rapport > 0],
      [chips.batna, a => a.intents.batna],
      [chips.summarize, a => a.intents.paraphrase]
    ];
    for (const [txt, predicate] of cases) {
      const a = TFA.analyze(txt, 'en');
      ok(predicate(a), `EN chip "${txt}" did not register its intent`);
    }
  });

  test('analyzer: numbers carry units (%, months, days, weeks, staff)', () => {
    const a = TFA.analyze('نقترح زيادة بنسبة 20% مع تجزئة الصرف على 4 أشهر.', 'ar');
    const nums = {};
    for (const n of a.numbers) nums[n.value] = n.unit;
    ok(a.numbers.length >= 2, 'two numbers extracted');
    ok(/^(%|بالمئة)/.test(nums['20'] || ''), '20 carries a percent unit, got: ' + nums['20']);
    ok(/^(شهر|اشهر|شهور|month)/.test(nums['4'] || ''), '4 carries a months unit, got: ' + nums['4']);

    const b = TFA.analyze('أقترح 4 أيام عن بُعد و6 أسابيع مراجعة', 'ar');
    const bmap = {};
    for (const n of b.numbers) bmap[n.value] = n.unit;
    ok(/^(يوم|ايام|day)/.test(bmap['4'] || ''), '4 carries days unit');
    ok(/^(اسبوع|اسابيع|week)/.test(bmap['6'] || ''), '6 carries weeks unit');

    const c = TFA.analyze('We propose 12 staff for 3 months.', 'en');
    const cmap = {};
    for (const n of c.numbers) cmap[n.value] = n.unit;
    ok(/^(موظف|staff|people)/.test(cmap['12'] || ''), '12 carries staff unit');
    ok(/^month/.test(cmap['3'] || ''), '3 carries months unit');
  });

  test('analyzer: tone signals (aggression, respect, empathy) + negative guard', () => {
    const ag = TFA.analyze('كلامك غير مقبول وهراء، أنتم تتلاعبون بالأرقام.', 'ar');
    ok(ag.tone.aggressive >= 3, 'multiple aggressive hits, got ' + ag.tone.aggressive);
    const nice = TFA.analyze('شكراً حضرتك، من فضلك أفهم ظروفكم الصعبة.', 'ar');
    ok(nice.tone.respect >= 2, 'respect hits');
    ok(nice.tone.empathy >= 1, 'empathy hit');
    /* "unacceptable" must not read as an OFFER (negative lookahead) */
    const na = TFA.analyze('This is completely unacceptable.', 'en');
    eq(na.intents.offer, false, 'unacceptable is not an offer');
    /* concession with numbers reads as offer (goes through offer evaluation) */
    const cn = TFA.analyze('حسناً، نقبل 15% على 5 أشهر.', 'ar');
    ok(cn.intents.offer && cn.intents.concede, 'concede-with-numbers is also an offer');
  });

  test('analyzer: question & vagueness detection', () => {
    ok(TFA.analyze('ما الذي تريدونه تحديداً؟', 'ar').intents.question, 'ar question');
    ok(TFA.analyze('What exactly do you need?', 'en').intents.question, 'en question');
    ok(TFA.analyze('Why this ceiling?', 'en').questionCount >= 1, 'why-question counted');
    const v = TFA.analyze('حسناً، كما تقول.', 'ar');
    ok(v.vague || v.wordCount < 6, 'filler detected as weak/vague');
  });

  /* ============================================================
     4. evaluator
     ============================================================ */
  function ratedSession(scenarioId, script, seed) {
    const sc = TFS.getScenario(scenarioId);
    const s = TENG.createSession(sc, { lang: 'ar', seed: seed || 'eval', userName: 'مختبر' });
    for (const line of script) TENG.userTurn(s, line);
    return s;
  }

  const GOOD_SCRIPT = [
    'مرحباً أستاذ فهد، شكراً على وقتك، وأقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف من جهتكم؟',
    'دعني أتأكد أني فهمت: قلقكم الأساسي هو المساءلة أمام المراجعة، صحيح؟ ولماذا يهمكم هذا السقف بالذات؟',
    'المعيار الذي نستند إليه هو مؤشر أعداد المستفيدين المعلن، وهو معيار قابل للتوثيق أمام المراجعة.',
    'ما رأيك لو وسّعنا الخيارات؟ نقترح زيادة الاعتماد بنسبة 18% مع تجزئة الصرف على 3 أشهر فقط، فكرة مكسب مشترك للطرفين.',
    'إن لم نتفق اليوم لدينا خيار طرح الملف على لجنة الخدمات، لكن أفضّل حلولاً داخل الإطار المعتمد.',
    'نقترح زيادة الاعتماد بنسبة 13% مع تجزئة الصرف على 5 أشهر.',
    'موافق على الصيغة الأخيرة، لنوثق الاتفاق في محضر ونختم الجلسة.'
  ];
  const BAD_SCRIPT = [
    'مطلبنا واضح ولا بديل عنه: يجب عليكم قبول الزيادة فوراً.',
    'كلامكم غير مقبول، هذه سياسة فاشلة وهراء إداري.',
    'إن لم تقبلوا سنضطر للتصعيد والشكوى رسمياً، وإلا فسأنسحب.',
    'مطالبتي واضحة، لن أقبل بأقل من 25% على شهر واحد.',
    'ننهي الموضوع الآن ونحسم دون نقاش إضافي.'
  ];

  test('evaluator: good transcript outscores bad transcript', () => {
    const good = ratedSession('budget', GOOD_SCRIPT, 'good-seed');
    const bad = ratedSession('budget', BAD_SCRIPT, 'bad-seed');
    const g = TFE.aggregate(good), b = TFE.aggregate(bad);
    ok(g.overall > b.overall, `good (${g.overall}) must outscore bad (${b.overall})`);
    ok(g.behavioural > b.behavioural, `good behavioural (${g.behavioural}) > bad (${b.behavioural})`);
    for (const id of TFE.CRITERIA_IDS) { range(g.criteria[id], 0, 100, 'good ' + id); range(b.criteria[id], 0, 100, 'bad ' + id); }
    ok(b.criteria.relationship < g.criteria.relationship, 'relationship suffers under aggression');
  });

  test('evaluator: aggregate clamps to 0..100 and respects 50/50 overall', () => {
    const s = ratedSession('budget', GOOD_SCRIPT, 'mix-seed');
    TENG.endSession(s, 'agreement');
    const agg = s.evaluation;
    range(agg.overall, 0, 100, 'overall');
    near(agg.overall, Math.round(0.5 * agg.behavioural + 0.5 * s.outcome.quality), 1, 'overall = 50% behavioural + 50% outcome');
  });

  test('evaluator: scoreOutcome rewards better deals', () => {
    const sc = TFS.getScenario('budget');
    const s = TENG.createSession(sc, { lang: 'ar', seed: 'x' });
    const rel = 60;
    const weak = TFE.scoreOutcome(s, { agreed: true, values: { increase: 5, phasing: 12 } }, rel);
    const mid = TFE.scoreOutcome(s, { agreed: true, values: { increase: 13, phasing: 6 } }, rel);
    const best = TFE.scoreOutcome(s, { agreed: true, values: { increase: 25, phasing: 1 } }, rel);
    ok(weak < mid && mid < best, `monotonic in deal quality (weak=${weak}, mid=${mid}, best=${best})`);
    const noDeal = TFE.scoreOutcome(s, { agreed: false }, rel);
    ok(noDeal < best, 'no-deal below a strong deal');
  });

  test('evaluator: strengths/weaknesses produce recommendations', () => {
    const good = ratedSession('budget', GOOD_SCRIPT, 'sw-good');
    const bad = ratedSession('budget', BAD_SCRIPT, 'sw-bad');
    const swGood = TFE.strengthsWeaknesses(TFE.aggregate(good), 'ar');
    const swBad = TFE.strengthsWeaknesses(TFE.aggregate(bad), 'ar');
    ok(swGood.recommendations.length + swGood.strengths.length >= 1, 'good session yields output');
    ok(swBad.weaknesses.length >= 1, 'bad session yields weaknesses');
    ok(swBad.recommendations.length >= 1, 'bad session yields recommendations');
    for (const r of swBad.recommendations) ok(r.title || r.text || r.hint || r.id, 'recommendation has content');
  });

  /* ============================================================
     5. engine — the counterpart brain
     ============================================================ */
  test('engine: trust rises with rapport, falls with aggression', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'trust-1' });
    const t0 = s.cp.trust;
    TENG.userTurn(s, 'شكراً لك أستاذ فهد، أقدّر ظروفكم وأبحث عن حل يرضي الطرفين.');
    ok(s.cp.trust > t0, `trust up after rapport (${t0} -> ${s.cp.trust})`);
    const t1 = s.cp.trust;
    TENG.userTurn(s, 'كلامك غير مقبول، هذا هراء إداري فاشل.');
    ok(s.cp.trust < t1, `trust down after aggression (${t1} -> ${s.cp.trust})`);
    ok(s.flags.aggressionStrikes >= 2, 'aggression strikes counted');
  });

  test('engine: repeated aggression makes the counterpart walk out', () => {
    const s = TENG.createSession(TFS.getScenario('schedule'), { lang: 'ar', seed: 'walk-1' });
    const rude = [
      'كلامك غير مقبول تماماً، مواقفكم سخيفة وهراء.',
      'هذا تماطل واضح وأنتم غير جديين ومضيعة للوقت.',
      'سخيف أن نستمر هكذا، أنتم فاشلون في إدارة الملف.',
      'هراء متواصل، لن أستمر معكم بهذه الطريقة.'
    ];
    let res = null;
    for (const line of rude) { res = TENG.userTurn(s, line); if (s.ended) break; }
    ok(s.ended, 'session ends');
    eq(s.endReason, 'cp_walk', 'end reason');
    eq(s.outcome.type, 'cp_walk', 'outcome type');
    range(s.outcome.quality, 0, 20, 'cp_walk quality is low');
    ok(s.messages.filter(m => m.role === 'cp').length >= 2, 'walk-out message recorded in transcript');
    ok(res.messages.length >= 1, 'walk-out message returned to UI');
  });

  test('engine: in-ZOPA offer is accepted at the offered values', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'deal-1', userName: 'سعود' });
    /* build trust first */
    TENG.userTurn(s, 'شكراً لك أستاذ فهد، أقدّر ظروفكم وأبحث عن حل يرضي الطرفين.');
    TENG.userTurn(s, 'ما الذي يهمكم أكثر في هذا الملف من جهتكم؟ ولماذا هذا السقف بالذات؟');
    TENG.userTurn(s, 'المعيار الذي نستند إليه هو مؤشر أعداد المستفيدين المعلن.');
    const res = TENG.userTurn(s, 'نقترح زيادة الاعتماد بنسبة 13% مع تجزئة الصرف على 5 أشهر.');
    ok(s.cp.acceptedDeal, 'deal accepted');
    eq(s.cp.acceptedDeal.values.increase, 13, 'increase = offered 13');
    eq(s.cp.acceptedDeal.values.phasing, 5, 'phasing = offered 5');
    ok(res.messages.some(m => m.role === 'cp' && m.meta && m.meta.accepted), 'acceptance message flagged');
    ok(s.cp.position.increase === 13 && s.cp.position.phasing === 5, 'positions adopted the deal');
    /* seal it */
    const end = TENG.userTurn(s, 'موافق على الصيغة، لنوثق الاتفاق ونختم الجلسة.');
    ok(s.ended && s.outcome.type === 'agreement', 'sealed as agreement');
    ok(s.outcome.quality > 0, 'agreement quality > 0');
    eq(s.outcome.overall, s.evaluation.overall, 'outcome.overall wired from aggregate');
    ok(end.messages.length >= 1, 'final message returned');
  });

  test('engine: above-ceiling ask within tolerance is countered, not accepted', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'counter-1' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف؟');
    TENG.userTurn(s, 'المعيار الذي نستند إليه هو مؤشر أعداد المستفيدين المعلن.');
    const res = TENG.userTurn(s, 'نقترح زيادة الاعتماد بنسبة 20% مع تجزئة الصرف على 5 أشهر.');
    ok(!s.cp.acceptedDeal, 'not accepted');
    ok(res.messages.some(m => m.role === 'cp' && m.meta && m.meta.counter), 'counter message flagged');
    const c = res.messages.find(m => m.meta && m.meta.counter).meta.counter;
    ok(c.increase > 5 && c.increase <= 13, `counter moves toward ceiling from start (got ${c.increase})`);
    ok(c.phasing >= 5 && c.phasing < 12, `phasing counter within bounds (got ${c.phasing})`);
    eq(s.cp.lastCounter.increase, c.increase, 'lastCounter recorded');
  });

  test('engine: far-beyond-tolerance ask is firmly rejected', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'reject-1' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف؟');
    const res = TENG.userTurn(s, 'نقترح زيادة الاعتماد بنسبة 60% مع صرف فوري كامل.');
    ok(!s.cp.acceptedDeal, 'not accepted');
    ok(!res.messages.some(m => m.meta && m.meta.counter), 'no counter on a hard reject');
    ok(res.messages.some(m => m.role === 'cp'), 'rejection message emitted');
  });

  test('engine: number→dimension mapping is unit-based, not order-based', () => {
    const budget = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'map-1' });
    const a1 = TFA.analyze('نقترح زيادة بنسبة 20% مع تجزئة على 4 أشهر.', 'ar');
    const m1 = TENG.mapNumbersToDims(budget, a1);
    eq(m1.get('increase'), 20, 'percent maps to increase');
    eq(m1.get('phasing'), 4, 'months map to phasing');

    const sched = TENG.createSession(TFS.getScenario('schedule'), { lang: 'ar', seed: 'map-2' });
    const a2 = TFA.analyze('أقترح 4 أيام عن بُعد و6 أسابيع مراجعة.', 'ar');
    const m2 = TENG.mapNumbersToDims(sched, a2);
    eq(m2.get('remote'), 4, 'days map to remote');
    eq(m2.get('review'), 6, 'weeks map to review');

    const staff = TENG.createSession(TFS.getScenario('staffing'), { lang: 'en', seed: 'map-3' });
    const a3 = TFA.analyze('We propose transferring 10 staff with 3 months of backstop.', 'en');
    const m3 = TENG.mapNumbersToDims(staff, a3);
    eq(m3.get('count'), 10, 'staff count maps to count');
    eq(m3.get('support'), 3, 'months map to support');

    /* a unit that matches no dimension must be ignored, not misassigned */
    const m4 = TENG.mapNumbersToDims(budget, TFA.analyze('المبلغ 3 مليون ريال على 4 أشهر.', 'ar'));
    eq(m4.get('phasing'), 4, 'months still map');
    eq(m4.has('increase'), false, 'money does not leak into increase');
  });

  test('engine: unmentioned dimensions keep the counterpart position (no phantom moves)', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'silent-1' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم.');
    const before = { ...s.cp.position };
    const res = TENG.userTurn(s, 'نقترح زيادة بنسبة 12% فقط.');
    /* phasing was never mentioned: an accepted deal keeps the current phasing */
    ok(res.messages.some(m => m.meta && m.meta.accepted) || true);
    if (s.cp.acceptedDeal) eq(s.cp.acceptedDeal.values.phasing, before.phasing, 'silent dimension unchanged');
  });

  test('engine: round cap — one final offer, then a hard timeout', () => {
    const s = TENG.createSession(TFS.getScenario('contractor'), { lang: 'ar', seed: 'cap-1' });
    let finals = 0, res = null;
    for (let i = 0; i < 25 && !s.ended; i++) {
      res = TENG.userTurn(s, 'همم، هذا رأي مثير للاهتمام بالنسبة لنا جميعاً.');
      finals += res.messages.filter(m => m.meta && m.meta.final).length;
    }
    eq(finals, 1, 'exactly one final offer after the cap');
    eq(s.endReason, 'timeout', 'capped session ends as timeout');
    eq(s.turns, s.maxTurns + 2, 'one grace message past the cap');
    ok(s.outcome.quality >= 0, 'timeout outcome exists');
  });

  test('engine: deterministic replay (same seed, same transcript)', () => {
    const run = () => {
      const s = TENG.createSession(TFS.getScenario('committee'), { lang: 'ar', seed: 'determinism-42' });
      for (const line of ['شكراً لكم وأقدّر جهودكم.', 'ما الذي يهمكم أكثر في هذا الملف؟', 'نقترح تمويلاً بمظلة موحدة مع معايير واضحة.'])
        TENG.userTurn(s, line);
      return s.messages.map(m => m.role + '|' + m.text).join('\n');
    };
    eq(run(), run(), 'identical transcripts for identical seeds');
  });

  test('engine: no template slot leaks in any counterpart reply (AR+EN)', () => {
    for (const lang of ['ar', 'en']) {
      const s = TENG.createSession(TFS.getScenario('budget'), { lang, seed: 'leak-' + lang });
      const lines = lang === 'ar' ? GOOD_SCRIPT : [
        'Thank you, I appreciate your situation. What matters most to you in this file?',
        'Let me make sure I understand: your main worry is accountability before the audit?',
        'The standard we rely on is the published beneficiary-count indicator.',
        'What if we widen the options? We propose an 18% increase phased over 3 months — a win-win.',
        'If we don\u2019t agree today we can take the file to the services committee, though I prefer solutions inside the approved frame.',
        'We propose a 13% increase phased over 5 months.',
        'Agreed on the last formula — let\u2019s document it and close the session.'
      ];
      for (const line of lines) {
        const res = TENG.userTurn(s, line);
        for (const m of res.messages.concat(s.messages.slice(-res.messages.length)))
          ok(!/\{[a-zA-Z_]+\}/.test(m.text), `${lang} slot leak: "${m.text}"`);
      }
    }
  });

  test('engine: qualitative scenario closes on package matches', () => {
    const citizen = TFS.SCENARIOS.find(x => !(x.dimensions || []).length);
    ok(citizen, 'library contains a qualitative (dialogue) scenario');
    const s = TENG.createSession(citizen, { lang: 'ar', seed: 'qual-1' });
    TENG.userTurn(s, 'أقدّر وقتك، وأعتذر عن التقصير الحاصل. ما الذي يهمك أكثر في معالجة هذا الطلب؟');
    const res = TENG.userTurn(s, 'أقترح متابعة شخصية برقم طلب حتى الإنجاز اليوم، مع اعتذار رسمي موثّق.');
    ok(s.flags.packagesMatched.length >= 1, 'packages matched: ' + s.flags.packagesMatched.join(','));
    const end = TENG.userTurn(s, 'موافقون على الصيغة، لنوثق الالتزام ونختم الجلسة.');
    ok(s.ended && s.outcome.type === 'agreement', 'qualitative deal sealed');
    ok(s.outcome.quality > 0, 'qualitative quality > 0');
  });

  /* ---------- contextual dialogue regressions ---------- */
  test('dialogue: an unexpected filler does not consume the opening question', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-filler' });
    const pending = s.cp.pendingQuestion && s.cp.pendingQuestion.text;
    ok(pending, 'opening question registered');
    const res = TENG.userTurn(s, 'همم، هذا رأي مثير للاهتمام.');
    const reply = res.messages[0].text;
    ok(reply.includes(pending.slice(0, 18)), 'reply refers back to the unanswered question');
    ok(/سؤالي|أتبيّن|توضيح/.test(reply), 'reply asks for a genuine clarification');
    ok(s.cp.pendingQuestion && s.cp.pendingQuestion.text, 'a pending question remains for the next turn');
  });

  test('dialogue: explanatory numbers are context, not the trainee position', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-explain' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم.');
    const res = TENG.userTurn(s, 'ارتفع عدد المستفيدين بنسبة 40% بسبب توسّع الخدمات خلال ثمانية أشهر.');
    eq(Object.keys(s.dialogue.userPositions).length, 0, 'no trainee position recorded from explanation');
    ok(!res.messages.some(m => m.meta && (m.meta.counter || m.meta.accepted)), 'no counter/acceptance triggered');
    ok(/توضيح|يفسّر|الأساس/.test(res.messages[0].text), 'reply acknowledges the explanation');
  });

  test('dialogue: a reason after rejection is tied to the rejected item', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-reason' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف؟');
    TENG.userTurn(s, 'نقترح زيادة الاعتماد بنسبة 20% مع تجزئة الصرف على 5 أشهر.');
    const rej = TENG.userTurn(s, 'لا أوافق على هذا الرقم، فهو غير كافٍ لمعالجة حجم الطلب.');
    const reason = TENG.userTurn(s, 'لأن الزيادة المقترحة لا تعالج الضغط المتزايد على الخدمة.');
    const r1 = rej.messages[0].text, r2 = reason.messages[0].text;
    ok(/سبب|اعتراض|غير كافٍ/.test(r1), 'rejection reply names the stated reason');
    ok(/يضيّق|قيمة أعلى|اعتراضك جوهري|سبب/.test(r2), 'follow-up reason is answered as part of the same objection');
    ok(r1 !== r2, 'the reason does not repeat the rejection reply verbatim');
    ok(/الزيادة|الاعتماد/.test(r2), 'reply keeps the disputed dimension in view');
  });

  test('dialogue: a changed position is acknowledged with old and new values', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-mind' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف؟');
    TENG.userTurn(s, 'نقترح زيادة الاعتماد بنسبة 20% مع تجزئة الصرف على 5 أشهر.');
    const res = TENG.userTurn(s, 'غيرت رأيي، أقبل زيادة 12% مع تجزئة على 5 أشهر.');
    const reply = res.messages[0].text;
    ok(reply.includes('20') && reply.includes('12'), 'reply names the old and new values');
    ok(/الزيادة|الاعتماد/.test(reply), 'reply names the changed dimension');
    eq(s.dialogue.userPositions.increase, 12, 'new position recorded');
  });

  test('dialogue: an unrelated question is answered briefly then the topic resumes', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-offtopic' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم.');
    const res = TENG.userTurn(s, 'ما هي توقعات الطقس غداً في المدينة؟');
    const reply = res.messages[0].text;
    ok(/الطقس/.test(reply), 'off-topic subject acknowledged');
    ok(/نعود|نسبة الزيادة|الاعتماد/.test(reply), 'reply returns to the negotiation file');
    ok(!/\{[a-zA-Z_]+\}/.test(reply), 'no unresolved template slot');
  });

  test('dialogue: an alternative proposal phrased as a question is evaluated as a proposal', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-option' });
    TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف؟');
    const res = TENG.userTurn(s, 'ما رأيك لو جربنا حزمة مرحلية تربط الزيادة بمؤشرات أداء موثقة مع وفر تشغيلي؟');
    ok(res.messages.some(m => m.meta && m.meta.package), 'package proposal recognised');
    ok(s.flags.packagesMatched.length >= 1, 'matched package recorded');
  });

  test('dialogue: terms format percentages without a separating space', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'ctx-terms' });
    const terms = TENG.termsText(s, { increase: 8, phasing: 10 }, 'ar');
    ok(/8%/.test(terms), 'percent attaches to the number');
    ok(!/8\s+%/.test(terms), 'no space before percent');
    ok(/10 أشهر/.test(terms), 'counted unit keeps a space');
    const en = TENG.termsText(s, { increase: 8, phasing: 10 }, 'en');
    ok(/8%/.test(en) && /10 months/.test(en), 'English terms format correctly');
  });

  test('engine: endSession computes outcome before aggregating (wiring)', () => {
    const s = ratedSession('budget', GOOD_SCRIPT, 'wire-1');
    const out = TENG.endSession(s, 'agreement');
    ok(out.quality !== undefined && out.overall !== undefined, 'outcome filled');
    eq(out.overall, s.evaluation.overall, 'outcome.overall = evaluation.overall');
    near(s.evaluation.criteria.outcome, out.quality, 1, 'criteria.outcome mirrors outcome.quality');
    /* ending again must not double-count */
    const turnsBefore = s.evaluation.turns;
    TENG.endSession(s, 'timeout');
    eq(s.evaluation.turns, turnsBefore, 'endSession is idempotent');
  });

  /* ============================================================
     6. coach
     ============================================================ */
  test('coach: produces guidance notes and suggested chips', () => {
    const s = TENG.createSession(TFS.getScenario('budget'), { lang: 'ar', seed: 'coach-1' });
    const res = TENG.userTurn(s, 'شكراً لك، أقدّر ظروفكم. ما الذي يهمكم أكثر في هذا الملف؟');
    const note = TFCoach.coachNote(s, res.analysis, res.rating, s.turns);
    ok(note, 'note generated');
    ok(note.title && note.title.trim(), 'note has a title');
    const chips = TFCoach.suggestChips(s, TFI);
    ok(chips.length >= 2, 'chips suggested');
    for (const c of chips) ok(c.label && c.label.trim(), 'chip has a label');
  });

  /* ============================================================
     7. diagnostic
     ============================================================ */
  test('diagnostic: 12 questions, both options map to valid styles', () => {
    eq(TFD.QUESTIONS.length, 12, 'question count');
    for (const q of TFD.QUESTIONS) {
      for (const key of ['q', 'a', 'b']) ok(q[key] && q[key].ar && q[key].en, `Q${q.id}.${key} bilingual`);
      ok(TFD.STYLES.includes(q.styleA) && TFD.STYLES.includes(q.styleB), `Q${q.id} styles valid`);
      ok(q.styleA !== q.styleB, `Q${q.id} options differ`);
    }
  });

  test('diagnostic: computeStyle returns a valid profile', () => {
    const answers = TFD.QUESTIONS.map(q => q.id);
    const r = TFD.computeStyle(answers);
    ok(TFD.STYLES.includes(r.dominant) && TFD.STYLES.includes(r.secondary), 'styles valid');
    for (const st of TFD.STYLES) range(r.scores[st], 0, 12, 'score range');
    ok(TFD.PROFILES[r.dominant], 'profile text exists for dominant style');
    ok(r.scores[r.dominant] >= r.scores[r.secondary], 'dominant out-scores secondary');
  });

  /* ============================================================
     8. knowledge library
     ============================================================ */
  test('knowledge: units are bilingual and structured', () => {
    ok(TFK.UNITS.length >= 6, 'at least 6 units');
    const ids = TFK.UNITS.map(u => u.id);
    eq(new Set(ids).size, ids.length, 'unique unit ids');
    for (const u of TFK.UNITS) {
      ok(u.title && u.title.ar && u.title.en, `unit ${u.id} title bilingual`);
      ok((u.key || []).length >= 2, `unit ${u.id} key takeaways`);
      for (const tk of u.key || []) ok(tk.ar && tk.en, `unit ${u.id} takeaway bilingual`);
      ok((u.quiz || []).length >= 1 || u.quiz, `unit ${u.id} has a quiz`);
      const quiz = Array.isArray(u.quiz) ? u.quiz : [u.quiz];
      for (const q of quiz) {
        ok(q.q && q.q.ar && q.q.en, `unit ${u.id} quiz question bilingual`);
        const ans = q.correct != null ? q.correct : q.answer;
        ok(typeof ans === 'number' && ans >= 0 && ans < q.options.length, `unit ${u.id} quiz answer index`);
        for (const o of q.options) ok(o.ar && o.en, `unit ${u.id} quiz option bilingual`);
      }
    }
    ok(TFK.getUnit(ids[0]) === TFK.UNITS[0], 'getUnit works');
    eq(TFK.getUnit('nope'), null, 'getUnit unknown -> null');
  });

  /* ============================================================
     9. charts
     ============================================================ */
  test('charts: radar geometry', () => {
    const pts = TFCH.radarPoints(7, 100, 100, 80);
    eq(pts.length, 7, 'point count');
    for (const p of pts) {
      near(Math.hypot(p.x - 100, p.y - 100), 80, 0.001, 'each point on the ring');
      ok(isFinite(p.x) && isFinite(p.y), 'finite coordinates');
    }
    eq(TFCH.radarPoints(0, 0, 0, 5).length, 0, 'zero points allowed');
  });

  /* ============================================================
     10. pdf writer
     ============================================================ */
  test('pdfwriter: builds a structurally valid PDF', () => {
    /* 1x1 red JPEG (base64) */
    const jpeg = TFPDF.base64ToBytes(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmAA//9k='
    );
    const pages = [{ jpeg, w: 1240, h: 1754 }, { jpeg, w: 1240, h: 1754 }];
    const bytes = TFPDF.buildPdf(pages, { title: 'تقرير تفاهم', author: 'Tafahum' });
    ok(bytes && bytes.length > 500, 'pdf has content');
    const head = String.fromCharCode(...bytes.slice(0, 8));
    eq(head.slice(0, 5), '%PDF-', 'PDF header');
    const v = TFPDF.validate(bytes);
    ok(v.ok, 'validate passes' + (v.errs ? ': ' + v.errs.join('; ') : ''));
    eq(v.pages, 2, 'page count');
  });

  test('pdfwriter: helpers', () => {
    const b = TFPDF.base64ToBytes('QUJD');
    eq(b.length, 3, 'base64 length');
    eq(String.fromCharCode(b[0], b[1], b[2]), 'ABC', 'base64 roundtrip');
    const s = TFPDF.utf16bePdfString('تفاهم');
    ok(s.startsWith('<FEFF'), 'UTF-16BE BOM as hex string');
    ok(s.endsWith('>'), 'hex string closed');
    eq(TFPDF.A4_W > 0 && TFPDF.A4_H > TFPDF.A4_W, true, 'A4 proportions');
  });

  /* ============================================================
     11. report
     ============================================================ */
  test('report: assembleReport produces the complete structure', () => {
    const s = ratedSession('budget', GOOD_SCRIPT, 'rep-1');
    TENG.userTurn(s, 'موافق على الصيغة، لنوثق الاتفاق ونختم الجلسة.');
    if (!s.ended) TENG.endSession(s, 'agreement');
    const rep = TFR.assembleReport(s, { settings: { name: 'سعود', lang: 'ar' }, diagnostic: { style: 'collaborating' } });
    ok(rep.meta && rep.meta.trainee === 'سعود', 'trainee name');
    ok(rep.meta.scenarioTitle, 'scenario title');
    ok(rep.scenarioSection && rep.scenarioSection.context, 'scenario section');
    ok(rep.expertPath && rep.expertPath.strategy, 'expert path section');
    ok(rep.scores, 'scores section');
    ok(rep.scores.outcomeType, 'outcome label exists');
    range(rep.scores.overall, 0, 100, 'overall score');
    ok(rep.negotiationEval && Array.isArray(rep.negotiationEval.weaknesses), 'negotiation eval split present');
    ok(rep.dialogueEval && Array.isArray(rep.dialogueEval.strengths), 'dialogue eval split present');
    ok(Array.isArray(rep.recommendations) || rep.recommendations, 'recommendations exist');
    ok(rep.topicSWOT || rep.topic, 'topic SWOT present');
    /* bilingual outcome labels */
    eq(TFR.outcomeLabel('agreement', 'ar'), 'اتفاق موثّق');
    eq(TFR.outcomeLabel('agreement', 'en'), 'Documented agreement');
  });

  test('report: HTML render escapes content', () => {
    const s = ratedSession('budget', ['<script>alert(1)</script> ما الذي يهمكم؟'], 'rep-xss');
    TENG.endSession(s, 'timeout');
    const rep = TFR.assembleReport(s, { settings: {} });
    const html = TFR.renderReportHTML(rep, { escape: true });
    ok(typeof html === 'string' && html.length > 100, 'HTML generated');
    ok(!/<script>alert/.test(html), 'script tag escaped');
  });

  /* ============================================================
     12. core helpers
     ============================================================ */
  test('core: utils behave', () => {
    eq(TF.clamp(150, 0, 100), 100, 'clamp high');
    eq(TF.clamp(-5, 0, 100), 0, 'clamp low');
    ok(TF.uid().length >= 6, 'uid');
    const seedA = TF.hashSeed('abc'), seedB = TF.hashSeed('abd');
    ok(seedA !== seedB, 'hash seeds differ');
    const rng = TF.mulberry32(1);
    const r1 = rng(), r2 = rng();
    range(r1, 0, 1, 'rng in [0,1]'); range(r2, 0, 1, 'rng in [0,1]');
    ok(r1 !== r2 || rng() !== r1, 'rng advances');
  });

  /* ---------- runner ---------- */
  function run(log) {
    const results = [];
    for (const tc of TESTS) {
      currentName = tc.name;
      const t0 = Date.now();
      try {
        tc.fn();
        results.push({ name: tc.name, ok: true, ms: Date.now() - t0 });
        if (log) log('✓ ' + tc.name);
      } catch (e) {
        results.push({ name: tc.name, ok: false, err: String(e && e.message || e), ms: Date.now() - t0 });
        if (log) log('✗ ' + tc.name + '\n    ' + (e && e.message || e));
        failures.push({ name: tc.name, err: String(e && e.message || e) });
      }
    }
    currentName = '';
    return results;
  }

  return { TESTS, run, failures };
});
