/* ============================================================
   Tafahum Platform — message analyzer (bilingual AR/EN)
   Turns a free-text negotiation message into structured
   intents, extracted numbers and tone signals.
   UMD module (browser global TFA + Node require).

   Matching happens on a fully normalized form (see normalize()):
   diacritics stripped, hamza variants folded to bare alef,
   Arabic ya folded, typographic quotes folded, Arabic-Indic
   digits converted, lower-cased. Pattern sources go through
   the SAME normalize() (the RXN bank) so user text and
   patterns always live in one orthographic space.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- normalization ---------- */
  function normalize(s) {
    return String(s || '')
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))) /* Arabic-Indic digits -> ASCII */
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')            /* diacritics + tatweel */
      .replace(/[\u0622\u0623\u0625\u0627]/g, 'ا')           /* alef variants -> bare alef */
      .replace(/\u0649/g, 'ي')                                 /* alef maqsura -> ya */
      .replace(/[\u2018\u2019\u201B]/g, "'")                   /* typographic quotes */
      .replace(/\u066A/g, '%')                                 /* Arabic percent sign */
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ---------- keyword banks (written normalized-friendly) ----------
     The trailing (?![a-z\u0621-\u064A]) guard replaces \b, which does
     not fire between Arabic letters (they are not \w in JS). */

  const RX = {
    questionWords: /(\?|؟|^|\s)(ما|ماذا|لماذا|كيف|هل|وش|ليش|ايس|مين|اين|متى|كم|ايش|شكون|شنو|why|what|how|when|where|who|which|how much|how many)(?![a-z\u0621-\u064A])/i,
    greeting: /^\s*(السلام|مرحب|اهلا|صباح|مساء|hello|hi|good morning|good afternoon|greetings|dear)(?![a-z])/i,
    thanks: /(شكرا|مشكور|يعطيك|thank|thanks|appreciated)/i,
    please: /(من فضلك|لو سمحت|please|kindly)/i,

    /* interests / needs of the other side */
    askInterests: /(مصالح|مصلح|يهمك|يهمكم|تحتاج|تحتاجون|مخاوف|تخشى|تخشون|تقلق|قلقكم|اولوياتكم|ما الذي|الا يهم|يهمنا ان نعرف|interest|concern|worry|afraid|fear|care about|what matters|matters most|matters to|priorit|need)/i,
    mentionInterests: /(مصالح|مصلح|مخاوف|حاجات|interests|needs|concerns)/i,
    paraphrase: /(بمعنى|اي ان|يعني|دعني اتأكد|فهمت ان|اذا فهمت|لخص|خلاصة|lets summarize|in other words|so,|if i understand|let me make sure|to summarize|just to confirm)/i,
    acknowledge: /(اوه|صحيح|فهمت|واضح|معك حق|اتصور|اقدر اتخيل|منطقي|i see|understood|fair|makes sense|noted|right,)/i,

    /* offers / demands / concessions */
    offerWords: /(اقترح|نقترح|اعرض|نعرض|نقدم|اقدم|نوافق|نقبل|اقبل|لنقل|رح نعطي|جاهز ن|ما رأيك لو|لو زدنا|لو قللنا|نشترط|offer|propose|suggest|we can|we could|how about|let'?s say|willing to|accept(?!able))/i,
    demandWords: /(يجب عليكم|لا بديل|مستحيل|افرض|افرض عليكم|مطالبتي واضحة|لا تقبل|لن اقبل|must|no alternative|impossible|you have to|we insist|non-negotiable|we demand)/i,
    threatWords: /(سنضطر|سنتصاعد|سرفع|سبلاغ|خلاف ذلك|والا|وإلا|سأشتكي|سنوقف|سأنسحب|سنسحب|تصعيد|otherwise|we will escalate|we will go to|we will stop|we will withdraw|complain)/i,
    concedeWords: /(موافق|نقبل|اتفق معك|لن اصر|مستعد|بشرط|حسنا|فليكن|اتركوا|نستطيع التنازل|agree|deal|accepted|fine,|okay,|we accept|concede|settle for)/i,

    /* aggression & respect */
    aggressive: /(غير مقبول|مستحيل|عيب|فاشل|غلط|هراء|كلام فارغ|مضيعة|تماطل|تتلاعب|تحاول تخدع|غير جدي|سخيف|unacceptable|ridiculous|nonsense|absurd|you are wrong|you're wrong|stop playing|wasting|liar|cheat)/i,
    respect: /(حضرتك|استاذ|استاذة|مهندس|دكتور|سيدتي|سيدي|سعادة|mr\.|mrs\.|ms\.|eng\.|dr\.|sir|madam|respect)/i,
    empathy: /(اتفهم|اقدر|اعرف ان|نعرف ضغط|ظروفكم|صعب عليكم|understand your|appreciate your|know the pressure|your situation|hard on you)/i,

    /* option generation */
    optionWords: /(خيار|خيارات|بدائل|ما رأيك لو|ماذا لو|لو جربنا|مثلا|حلول|فكرة|نشكل|نصمم|اقترح|نقترح|اعرض|نعرض|حزمة|باقة|option|alternative|what if|why don't we|idea|solution|propose that|let's try|could we|we propose|propose|suggest)/i,
    mutualWords: /(الطرفين|كسب مشترك|نستفيد معا|مكسب للجميع|win-win|mutual|both sides|both of us|everybody wins|joint)/i,

    /* objective criteria */
    criteriaWords: /(معيار|معايير|قانون|لائحة|نظام|لوائح|تشريع|ميزانية|سقف|مجلس الادارة|مراجعة|تدقيق|اسعار السوق|متوسط|خبراء|توصية|standard|criteria|regulation|law|policy|budget|ceiling|audit|benchmark|average|expert|guideline|precedent|published)/i,

    /* BATNA / alternatives */
    batnaWords: /(بديل|بدائل|خيار آخر اذا|ان لم نتفق|عدم الاتفاق|ننسحب|خارج الطاولة|walk away|alternative|if we (?:don'?t|do not) agree|no deal|outside|batna|elsewhere|other (?:vendor|supplier|contractor))/i,

    /* facilitation */
    agendaWords: /(اجندة|لنبدأ ب|نرتب|خطة الجلسة|نقاط النقاش|اقترح ان نرتب|اول نقطة|agenda|let'?s start with|structure the|first point|order of|roadmap|plan for this)/i,
    summarizeWords: /(لخص|خلص|خلاصة|ملخص|تلخيص|جمعنا|وصلنا الى|بقيت نقطة|summar|so far|we agreed|remaining point|wrap)/i,

    /* closing */
    closingWords: /(ننهي|نحسم|نتفق على|نوثق|نختم|محضر|نغلق|نوقع|finalize|close|let'?s agree|document|sign|wrap up|settle this)/i,

    /* reasons */
    reasonWords: /(لان|لأن|بسبب|سببه|مسوغ|مبرر|because|since|due to|justify|reason)/i,

    /* numeric offer words nearby numbers */
    offerNumberCtx: /(زيادة|خصم|تمديد|تخفيض|اقل من|اكثر من|بحد|نسبة|increase|decrease|discount|extension|at most|at least|percent|بالمئة|بالمائه)/i
  };

  /* the same banks, sources passed through normalize() */
  function normRx(rx) {
    return new RegExp(normalize(rx.source), rx.flags.replace('g', ''));
  }
  const RXN = {};
  for (const k of Object.keys(RX)) RXN[k] = normRx(RX[k]);

  const NUM_UNIT = /(\d+(?:[.,]\d+)?)\s*(%|٪|بالمئة|بالمائه|percent|يوم|ايام|day|days|أسبوع|اسبوع|اسابيع|week|weeks|شهر|اشهر|شهور|month|months|موظف|كادر|كوادر|staff|people|مليون|million|ألف|الف|thousand|k\b|دولار|دينار|ريال)?/gi;

  /* ---------- main entry ---------- */
  function analyze(text, lang) {
    const raw = String(text || '').trim();
    const normalized = normalize(raw);
    const words = normalized.split(/\s+/).filter(Boolean);
    const out = {
      raw, flat: normalized,
      lang: lang || (isArabic(raw) ? 'ar' : 'en'),
      empty: raw.length === 0,
      wordCount: words.length,
      isShort: words.length > 0 && words.length < 6,
      questionCount: countQuestions(normalized),
      numbers: extractNumbers(normalized),
      intents: {},
      tone: {},
      hasReasons: RXN.reasonWords.test(normalized)
    };

    const i = out.intents;
    i.greeting = RXN.greeting.test(normalized);
    i.thanks = RXN.thanks.test(normalized);
    i.please = RXN.please.test(normalized);
    i.question = out.questionCount > 0 || RXN.questionWords.test(normalized);
    i.questionInterests = i.question && (RXN.askInterests.test(normalized) || RXN.mentionInterests.test(normalized));
    i.mentionInterests = RXN.mentionInterests.test(normalized);
    i.paraphrase = RXN.paraphrase.test(normalized) || RXN.summarizeWords.test(normalized);
    i.acknowledge = RXN.acknowledge.test(normalized);
    i.offer = RXN.offerWords.test(normalized);
    i.demand = RXN.demandWords.test(normalized);
    i.threat = RXN.threatWords.test(normalized);
    i.concede = RXN.concedeWords.test(normalized);
    i.option = RXN.optionWords.test(normalized);
    i.mutual = RXN.mutualWords.test(normalized);
    i.criteria = RXN.criteriaWords.test(normalized);
    i.batna = RXN.batnaWords.test(normalized);
    i.agenda = RXN.agendaWords.test(normalized);
    i.facilitate = i.agenda || i.paraphrase || RXN.summarizeWords.test(normalized);
    i.closing = RXN.closingWords.test(normalized);
    i.offerWithNumber = i.offer && out.numbers.length > 0 && RXN.offerNumberCtx.test(normalized);

    /* tone */
    const aggrHits = countMatches(normalized, RXN.aggressive) + (i.demand ? 1 : 0) + (i.threat ? 1 : 0);
    out.tone.aggressive = aggrHits;
    out.tone.respect = (RXN.respect.test(normalized) ? 1 : 0) + (i.thanks ? 1 : 0) + (i.please ? 1 : 0);
    out.tone.empathy = RXN.empathy.test(normalized) ? 1 : 0;
    out.tone.rapport = out.tone.respect + out.tone.empathy + (i.acknowledge ? 1 : 0);

    /* interest-focused framing (vs positional) */
    out.tone.interestFocused = (i.questionInterests || i.mentionInterests || i.mutual) ? 1 : 0;
    out.tone.positional = (i.demand || (i.offer && out.numbers.length && !out.hasReasons && !i.criteria && !i.mutual)) ? 1 : 0;

    /* evidence spans (rough excerpts for the report) */
    out.evidence = {
      interests: firstMatchExcerpt(raw, normalized, [RXN.askInterests, RXN.mentionInterests]),
      criteria: firstMatchExcerpt(raw, normalized, [RXN.criteriaWords]),
      options: firstMatchExcerpt(raw, normalized, [RXN.optionWords, RXN.mutualWords]),
      rapport: firstMatchExcerpt(raw, normalized, [RXN.empathy, RXN.thanks, RXN.please]),
      batna: firstMatchExcerpt(raw, normalized, [RXN.batnaWords]),
      aggression: firstMatchExcerpt(raw, normalized, [RXN.aggressive, RXN.demandWords, RXN.threatWords])
    };

    /* overall quality label */
    out.substantive = (i.offer || i.questionInterests || i.criteria || i.option || i.batna || out.numbers.length > 0);
    out.vague = !out.substantive && !i.question && !i.paraphrase && !i.acknowledge;

    return out;
  }

  /* ---------- helpers ---------- */
  function isArabic(s) { return /[\u0600-\u06FF]/.test(String(s || '')); }

  function countQuestions(normalized) {
    const marks = (String(normalized).match(/[?؟]/g) || []).length;
    const qw = countMatches(normalized, RXN.questionWords);
    return Math.max(marks, qw > 0 && marks === 0 ? 1 : 0);
  }

  function countMatches(text, rx) {
    const re = new RegExp(rx.source, rx.flags.replace('g', '') + 'g');
    let n = 0; while (re.exec(text)) { n++; if (n > 5) break; }
    return n;
  }

  /* numbers are extracted from the NORMALIZED text so their .index
     shares the same coordinate space as regex matches on it. */
  function extractNumbers(text) {
    const out = [];
    const re = new RegExp(NUM_UNIT.source, NUM_UNIT.flags);
    const s = String(text || '');
    let m;
    while ((m = re.exec(s))) {
      const value = parseFloat(m[1].replace(',', '.'));
      if (isNaN(value)) continue;
      out.push({ value, unit: (m[2] || '').toLowerCase(), raw: m[0], index: m.index });
    }
    return out.slice(0, 8);
  }

  /* excerpt from the raw message when the raw matches (keeps original
     spelling); falls back to the normalized text otherwise. */
  function firstMatchExcerpt(raw, normalized, rxs) {
    for (const src of [String(raw), String(normalized)]) {
      for (const rx of rxs) {
        const re = new RegExp(rx.source, rx.flags.replace('g', ''));
        const m = re.exec(src);
        if (m) return excerptAround(src, m.index, m[0].length);
      }
    }
    return null;
  }

  function excerptAround(s, idx, len) {
    const start = Math.max(0, idx - 30);
    const end = Math.min(s.length, idx + len + 40);
    let ex = s.slice(start, end).replace(/\s+/g, ' ').trim();
    if (ex.length > 90) ex = ex.slice(0, 90) + '…';
    return ex.length ? ex : null;
  }

  return { analyze, RX, RXN, normalize, extractNumbers, isArabic };
});
