/* ============================================================
   Tafahum Platform — evaluator
   Scores each message against the 7 rubric criteria (from the
   research proposal) + 4 dialogue skills, aggregates a session,
   and assembles the full report data.
   UMD module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CRITERIA_IDS = ['prep', 'interests', 'listening', 'options', 'criteria', 'relationship', 'outcome'];
  const DIALOGUE_IDS = ['listen', 'reframe', 'facilitate', 'tone'];

  /* per-message rating: returns points per criterion (0..~2) + evidence */
  function rateMessage(a, ctx) {
    ctx = ctx || {};
    const r = {
      prep: 0, interests: 0, listening: 0, options: 0, criteria: 0, relationship: 0,
      listen: 0, reframe: 0, facilitate: 0, tone: 0,
      evidence: {}
    };

    /* --- preparation & alternatives --- */
    if (a.intents.batna) { r.prep += 1.6; r.evidence.prep = a.evidence.batna || a.raw; }
    if (a.intents.criteria) r.prep += 0.3; /* anchoring to facts shows preparation */
    if (a.numbers.length && (a.hasReasons || a.intents.criteria)) r.prep += 0.3;
    if (ctx.isOpening && a.numbers.length && a.hasReasons) r.prep += 0.5;

    /* --- exploring interests --- */
    if (a.intents.questionInterests) { r.interests += 1.6; r.evidence.interests = a.evidence.interests || a.raw; }
    else if (a.intents.question && a.intents.mentionInterests) { r.interests += 1.0; r.evidence.interests = a.evidence.interests || a.raw; }
    else if (a.intents.question) r.interests += 0.3;
    if (a.intents.mutual) r.interests += 0.3;

    /* --- questions & listening --- */
    if (a.questionCount >= 1) r.listening += 0.7;
    if (a.questionCount >= 2) r.listening += 0.4;
    if (a.intents.paraphrase) { r.listening += 1.3; r.evidence.listening = a.evidence.options || a.raw; }
    if (a.intents.acknowledge) r.listening += 0.6;
    if (a.intents.thanks) r.listening += 0.2;

    /* --- inventing options --- */
    if (a.intents.option) { r.options += 1.5; r.evidence.options = a.evidence.options || a.raw; }
    if (a.intents.offer && a.intents.option) r.options += 0.4;
    if (a.intents.mutual) { r.options += 0.6; }
    if (a.intents.offerWithNumber && (a.hasReasons || a.intents.criteria || a.intents.option)) r.options += 0.3;

    /* --- objective criteria --- */
    if (a.intents.criteria) { r.criteria += 1.6; r.evidence.criteria = a.evidence.criteria || a.raw; }
    if (a.numbers.length && a.hasReasons) r.criteria += 0.4;
    if (a.intents.paraphrase && a.intents.criteria) r.criteria += 0.3;

    /* --- relationship --- */
    if (a.tone.rapport > 0) { r.relationship += Math.min(a.tone.rapport, 2) * 0.8; r.evidence.relationship = a.evidence.rapport || a.raw; }
    if (a.tone.aggressive > 0) r.relationship -= 1.6;
    if (a.intents.threat) r.relationship -= 0.8;
    if (a.intents.demand && !a.intents.criteria && !a.intents.option) r.relationship -= 0.4;

    /* --- dialogue skills --- */
    r.listen = r.listening * 0.9 + (a.intents.acknowledge ? 0.4 : 0);
    if (a.evidence.listening) r.evidence.listen = a.evidence.listening;
    if (a.intents.option || a.intents.mutual || a.intents.paraphrase) r.reframe += 1.2;
    if (a.intents.mutual) r.reframe += 0.4;
    if (a.evidence.options) r.evidence.reframe = a.evidence.options;
    if (a.intents.facilitate) { r.facilitate += 0.9; r.evidence.facilitate = a.raw; }
    if (a.intents.paraphrase) r.facilitate += 0.7;
    if (a.intents.agenda) r.facilitate += 0.5;
    if (a.intents.closing && (a.intents.option || a.intents.paraphrase)) r.facilitate += 0.4;
    r.tone = a.tone.aggressive > 0 ? -1.6 * Math.min(a.tone.aggressive, 2) : Math.min(a.tone.rapport, 3) * 0.7;

    /* cap positive points at 2 per criterion per message */
    for (const k of ['prep', 'interests', 'listening', 'options', 'criteria', 'relationship', 'listen', 'reframe', 'facilitate', 'tone'])
      if (r[k] > 2) r[k] = 2;

    r.valid = !a.empty && a.wordCount > 0;
    return r;
  }

  /* aggregate a finished session. session.messages carries per-message rating in msg.rating */
  const TUNE = { expectedPerTurn: 0.85 };

  function aggregate(session) {
    const userMsgs = session.messages.filter(m => m.role === 'user' && m.rating && m.rating.valid);
    const turns = Math.max(userMsgs.length, 1);
    const sum = {}, evidence = {};
    for (const id of CRITERIA_IDS.concat(DIALOGUE_IDS)) { sum[id] = 0; evidence[id] = []; }

    for (const m of userMsgs) {
      for (const k of Object.keys(sum)) {
        if (m.rating[k]) sum[k] += m.rating[k];
        if (m.rating.evidence && m.rating.evidence[k] && m.rating[k] > 0) {
          if (evidence[k].length < 3) evidence[k].push({ text: m.rating.evidence[k], excerpt: excerpt(m.text) });
        }
      }
    }

    const pct = {};
    for (const id of CRITERIA_IDS) if (id !== 'outcome') pct[id] = clampPct(sum[id] / (turns * TUNE.expectedPerTurn) * 60);
    for (const id of DIALOGUE_IDS) pct[id] = clampPct(sum[id] / (turns * 0.7) * 60);

    /* outcome & relationship come from engine result */
    const outcome = session.outcome || {};
    pct.outcome = clampPct(outcome.quality != null ? outcome.quality : 0);

    const behavioural = weightedMean(pct, CRITERIA_IDS.filter(c => c !== 'outcome'));
    const dialogue = weightedMean(pct, DIALOGUE_IDS);
    const overall = clamp(Math.round(0.5 * behavioural + 0.5 * pct.outcome), 0, 100);

    return {
      criteria: pct, dialogue: pct2dialogue(pct), evidence,
      behavioural: Math.round(behavioural), dialogueScore: Math.round(dialogue),
      overall, turns: userMsgs.length
    };
  }

  function pct2dialogue(pct) {
    const d = {}; for (const id of DIALOGUE_IDS) d[id] = pct[id]; return d;
  }
  function weightedMean(obj, keys) {
    let s = 0, n = 0;
    for (const k of keys) { s += obj[k] || 0; n++; }
    return n ? s / n : 0;
  }
  function clampPct(v) { return clamp(Math.round(v), 0, 100); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function excerpt(t) {
    t = String(t || '').replace(/\s+/g, ' ').trim();
    return t.length > 70 ? t.slice(0, 70) + '…' : t;
  }

  /* ---------- outcome quality from deal terms ---------- */
  function scoreOutcome(session, terms, relationship) {
    const dims = (session.scenario.dimensions || []);
    if (!terms || !terms.agreed || !dims.length) {
      /* qualitative deal: quality from interest coverage + relationship */
      const cov = clamp(terms && terms.interestCoverage != null ? terms.interestCoverage : 50, 0, 100);
      return clamp(Math.round(cov * 0.8 + relationship * 0.2), 0, 100);
    }
    let total = 0, weight = 0;
    for (const d of dims) {
      const v = terms.values[d.id];
      if (v == null) continue;
      const w = d.id === 'main' || !d.hidden ? 1 : 0.6;
      let s;
      if (d.direction === 'more') s = (v - d.userFloor) / Math.max(d.userGoal - d.userFloor, 1);
      else s = (d.userFloor - v) / Math.max(d.userFloor - d.userGoal, 1);
      s = clamp(s, -0.25, 1.15); /* overshoot slightly rewarded, undershoot allowed to go negative */
      total += s * w; weight += w;
    }
    let base = weight ? (total / weight) * 100 : 0;
    base = clamp(base * 0.85 + relationship * 0.15, 0, 100);
    return Math.round(base);
  }

  /* ---------- strengths / weaknesses narrative ---------- */
  function strengthsWeaknesses(agg, lang) {
    const pack = getPack(lang);
    const strengths = [], weaknesses = [], recommendations = [];

    for (const id of CRITERIA_IDS) {
      const v = agg.criteria[id];
      if (v >= 72) strengths.push({ id, score: v, evidence: agg.evidence[id] || [] });
      else if (v <= 45) weaknesses.push({ id, score: v, evidence: agg.evidence[id] || [] });
    }
    for (const id of DIALOGUE_IDS) {
      const v = agg.dialogue[id];
      if (v >= 72) strengths.push({ id, score: v, skill: true, evidence: agg.evidence[id] || [] });
      else if (v <= 45) weaknesses.push({ id, score: v, skill: true, evidence: agg.evidence[id] || [] });
    }

    for (const w of weaknesses) recommendations.push({ id: w.id, ...pack.reco(w.id) });
    if (!strengths.length && !weaknesses.length) {
      recommendations.push({ id: 'overall', ...pack.reco('overall') });
    }
    return { strengths, weaknesses, recommendations };
  }

  const RECO_AR = {
    prep: { what: 'حضّر بديلك قبل الجلسة: اكتب ما ستفعله إن لم يتحقق الاتفاق، واسأل الطرف الآخر عن بديله.', how: 'قبل أي جلسة قادمة، اكتب في ورقة: بديلي، بديلهم المتوقع، وحدّي الأدنى. اذكر البديل مرة واحدة داخل الجلسة بهدوء.' },
    interests: { what: 'استكشف مصالح الطرف الآخر مبكراً قبل عرض أي صيغة.', how: 'افتح الجولات الأولى بسؤالين عن الحاجات والمخاوف: «ما أكثر ما يهمكم في هذا الملف؟» و«ما الذي يقلقكم إن لم نتفق؟»' },
    listening: { what: 'ارفع جودة إصغائك: أعد صياغة موقفهم وتأكد قبل الرد.', how: 'بعد كل رد مهم من الطرف الآخر، لخّصه بجملة تبدأ بـ«إذن أنتم قلقون أساساً من...» ثم اسأل: «هل فهمت صحيحاً؟»' },
    options: { what: 'وسّع الخيارات قبل الحسم — ابتكر خيارات للمكسب المشترك.', how: 'اعرض على الأقل خيارين مختلفين قبل أي رقم نهائي، واستخدم عبارة «ما رأيك لو...» لبناء الخيارات معهم لا مقابلهم.' },
    criteria: { what: 'استند إلى معايير موضوعية بدل الضغط أو الإصرار.', how: 'اربط كل طلب بمعيار: لائحة، سقف معتمد، متوسط أسعار، رأي خبير — واسألهم عن المعيار الذي يستندون إليه.' },
    relationship: { what: 'حافظ على العلاقة حتى في الاختلاف — افصل الناس عن المشكلة.', how: 'تجنب صيغ الأمر والتهديد؛ استبدلها بـ«أقدّر قيودكم، وأبحث عن صيغة تريح الطرفين». اعتذر عند الخطأ فوراً.' },
    outcome: { what: 'طوّر جودة اتفاقك النهائي: بنود موثقة تحمي الطرفين.', how: 'أنهِ الجلسات بمحضر مكتوب: ما اتفقتم عليه، ما تبقى، من المسؤول، ومتى المراجعة.' },
    listen: { what: 'درّب نفسك على الإصغاء الفعّال — أسئلة متابعة وإعادة صياغة.', how: 'قاعدة الجلستين القادمتين: لكل جملتين من الطرف الآخر، سؤال متابعة واحد على الأقل.' },
    reframe: { what: 'أعد صياغة الخلاف كمسألة مشتركة بدل صراع مواقف.', how: 'حوّل «أريد X مقابل لا» إلى «كيف نحل معاً مشكلة Y؟» — عبر صياغة الخلاف بصيغة سؤال مشترك.' },
    facilitate: { what: 'تيسّر الجلسة: أجندة، تلخيص، ودفعة نحو النتيجة.', how: 'افتتح بترتيب النقاط، ولخّص ما اتفقتم عليه كل ثلاث جولات، واقترح خطوة تالية محددة في النهاية.' },
    tone: { what: 'اضبط النبرة: الحزم في الموضوع مع الاحترام في الشخص.', how: 'راقب صيغ التهديد والأمر؛ استبدلها بطلبات مشروطة: «نستطيع قبول X إذا التزمتم بـY».' },
    overall: { what: 'حافظ على هذا الأداء وتوسّع فيه في سيناريوهات أصعب.', how: 'جرّب سيناريو أعلى مستوى، وأعد الجلسة نفسها بعد أسبوع لتثبيت المهارة.' }
  };
  const RECO_EN = {
    prep: { what: 'Prepare your alternative before the session: write what you\u2019ll do if no deal, and ask about theirs.', how: 'Before any next session, note: my alternative, their likely alternative, my walk-away line. Mention yours once, calmly, inside the session.' },
    interests: { what: 'Explore the other side\u2019s interests early, before proposing any formula.', how: 'Open the first rounds with two questions about needs and fears: “What matters most to you in this file?” and “What worries you if we don\u2019t agree?”' },
    listening: { what: 'Raise your listening quality: restate and check before replying.', how: 'After each major reply, summarise it starting with “So your main concern is...” then ask: “Did I get that right?”' },
    options: { what: 'Widen options before deciding — invent options for mutual gain.', how: 'Offer at least two different options before any final number, and use “What if we...” to build options WITH them, not against them.' },
    criteria: { what: 'Anchor to objective criteria instead of pressure or insistence.', how: 'Tie each request to a standard: regulation, approved ceiling, market average, expert opinion — and ask which standard THEY rely on.' },
    relationship: { what: 'Preserve the relationship even in disagreement — separate people from the problem.', how: 'Avoid command and threat phrasing; replace with “I appreciate your constraints, and I\u2019m looking for a formula that works for both”. Apologise immediately when wrong.' },
    outcome: { what: 'Develop your final agreements: documented clauses protecting both sides.', how: 'Close sessions with written minutes: what was agreed, what remains, who owns it, and when it\u2019s reviewed.' },
    listen: { what: 'Train active listening — follow-up questions and restating.', how: 'Rule for your next two sessions: at least one follow-up question for every two sentences from the other side.' },
    reframe: { what: 'Reframe the conflict as a shared problem, not a clash of positions.', how: 'Turn “I want X vs no” into “how do we jointly solve Y?” — phrase the conflict as a shared question.' },
    facilitate: { what: 'Facilitate the session: agenda, summarising, driving to outcome.', how: 'Open by ordering the points, summarise agreements every three rounds, and propose a specific next step at the end.' },
    tone: { what: 'Manage your tone: firm on substance, respectful to the person.', how: 'Watch threat and command phrasing; replace with conditional requests: “We can accept X if you commit to Y.”' },
    overall: { what: 'Maintain this performance and stretch it in harder scenarios.', how: 'Try a higher-level scenario, and redo the same session a week later to consolidate the skill.' }
  };

  function getPack(lang) {
    return {
      reco(id) {
        const pack = lang === 'en' ? RECO_EN : RECO_AR;
        return pack[id] || pack.overall;
      }
    };
  }

  /* tier label helpers */
  function tier(score, lang) {
    if (score >= 85) return { key: 'great', label: lang === 'en' ? 'Excellent' : 'ممتاز' };
    if (score >= 70) return { key: 'good', label: lang === 'en' ? 'Good' : 'جيد' };
    if (score >= 50) return { key: 'ok', label: lang === 'en' ? 'Acceptable' : 'مقبول' };
    return { key: 'weak', label: lang === 'en' ? 'Needs development' : 'يحتاج تطويراً' };
  }

  return {
    CRITERIA_IDS, DIALOGUE_IDS,
    rateMessage, aggregate, scoreOutcome, strengthsWeaknesses, tier,
    RECO_AR, RECO_EN, TUNE
  };
});
