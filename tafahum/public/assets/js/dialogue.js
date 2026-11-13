/* ============================================================
   Tafahum Platform — contextual dialogue interpreter
   Turns a free-text trainee message into a discourse frame:
   dialogue acts, resolved references, grounded values, stance
   toward the last proposal, question type, conditions and
   ambiguity. It reads the WHOLE session state (last counterpart
   move, pending question, prior user positions, phase), so the
   same sentence can mean different things in different contexts.
   UMD module (browser global TFDG + Node require).
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./analyzer.js'));
  else root.TFDG = factory(root.TFA);
})(typeof self !== 'undefined' ? self : this, function (TFA) {
  'use strict';

  const L = (v, lang) => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v.ar || v.en || '';
  };

  const STOP = new Set(['على', 'الى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'من', 'في', 'ان', 'او', 'ثم', 'قد', 'كل', 'بعض', 'غير', 'بين', 'بعد', 'قبل', 'عند', 'حتى', 'اذا', 'كما', 'لكن', 'هو', 'هي', 'هم', 'نحن', 'انتم', 'يكون', 'تكون', 'وقد', 'ولا', 'وما', 'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'our']);

  /* Short particles that must match as whole words: they occur inside
     other Arabic words and would otherwise create false positives. */
  const WORD_ONLY = new Set(['اذا', 'ان', 'ما', 'لا', 'لم', 'لن', 'في', 'من', 'على', 'الى', 'عن', 'مع', 'هل', 'هو', 'هي', 'نحن', 'انتم', 'بس', 'مو', 'او', 'ثم', 'قد', 'كل']);

  const NEG = ['لا', 'لم', 'لن', 'ليس', 'ليست', 'لست', 'لسنا', 'غير', 'بلا', 'دون', 'not', 'no', 'never', 'without'];

  /* ---------- lexical cues (input understanding only; output is MSA) ---------- */
  const LEX = {
    accept: ['موافق', 'اوافق', 'نوافق', 'اقبل', 'نقبل', 'قبول', 'اتفق', 'اتفقنا', 'متفق', 'حسنا', 'حسن', 'تمام', 'ماشي', 'طيب', 'نمضي', 'مضينا', 'راض', 'مقبول', 'مناسب', 'لا مانع', 'بالتاكيد', 'طبعا', 'agree', 'accept', 'deal', 'okay', 'ok', 'fine', 'yes', 'willing'],
    reject: ['ارفض', 'نرفض', 'رفض', 'مرفوض', 'غير مقبول', 'لا اوافق', 'لن اوافق', 'لا اقبل', 'لن اقبل', 'لا يمكن', 'لن يمكن', 'مستحيل', 'غير كاف', 'لا يكفي', 'لا يكف', 'بعيد', 'مبالغ', 'غير منطقي', 'غير عادل', 'غير مناسب', 'لا يناسب', 'ليس مناسب', 'ليس كاف', 'غير واقعي', 'لا يحل', 'لا يعالج', 'لا يلبي', 'ما بدي', 'ما بدنا', 'ما نريد', 'لا نريد', 'رفضنا', 'reject', 'refuse', 'unacceptable', 'not enough', 'too much', 'too low', 'too high', 'impossible', 'not acceptable', 'cannot accept', 'wont accept', 'no deal'],
    condition: ['بشرط', 'شريطة', 'على ان', 'في حال', 'مقابل', 'بمقابل', 'رهنا', 'مرهون', 'conditional', 'provided', 'on condition', 'in exchange', 'subject to'],
    offer: ['اقترح', 'نقترح', 'اعرض', 'نعرض', 'نقدم', 'نطرح', 'صيغه', 'صيغة', 'حزمه', 'حزمة', 'باقه', 'باقة', 'خيار', 'بديل', 'فكره', 'فكرة', 'عرضنا', 'propose', 'offer', 'suggest', 'package', 'option', 'alternative', 'formula'],
    concession: ['نتنازل', 'تنازل', 'نخفض', 'نخفضه', 'نرفع', 'نزيد', 'نقلل', 'نعدل', 'تعديل', 'نتراجع', 'تراجع', 'نغير', 'تغيير', 'بدل', 'عوضا', 'نصل الى', 'نقبل ب', 'concede', 'reduce', 'increase', 'lower', 'raise', 'adjust', 'change', 'instead'],
    mindChange: ['غيرت رايي', 'اعدت النظر', 'تراجعت', 'عدلت موقفي', 'بدل ان', 'بدلا من', 'عوضا عن', 'في السابق', 'سابقا قلت', 'كنت قلت', 'الان اري', 'بعد التفكير', 'بعد المراجعه', 'change my mind', 'reconsider', 'on second thought', 'instead of', 'rather than', 'previously'],
    object: ['لكن', 'غير ان', 'اعتراض', 'نعترض', 'مشكله', 'اشكال', 'عيب', 'لا يعالج', 'لا يحل', 'يتجاهل', 'يغفل', 'لا ياخذ', 'نقص', 'قصور', 'محذور', 'تحفظ', 'متحفظ', 'however', 'but', 'objection', 'concern', 'problem', 'issue', 'does not address', 'doesnt address', 'overlooks', 'missing', 'flaw'],
    objectStrong: ['اعتراض', 'نعترض', 'مشكله', 'اشكال', 'عيب', 'لا يعالج', 'لا يحل', 'يتجاهل', 'يغفل', 'لا ياخذ', 'نقص', 'قصور', 'محذور', 'تحفظ', 'متحفظ', 'objection', 'concern', 'problem', 'issue', 'does not address', 'doesnt address', 'overlooks', 'missing', 'flaw'],
    explain: ['لان', 'بسبب', 'ذلك ان', 'نظرا', 'بصفه', 'مسوغ', 'مبرر', 'تبرير', 'السبب', 'يعود الى', 'because', 'since', 'due to', 'reason', 'justification', 'explanation', 'the point is'],
    clarify: ['ما معني', 'ماذا تعني', 'لم افهم', 'غير واضح', 'وضح', 'وضح لي', 'فسر', 'اشرح', 'توضيح', 'تقصد', 'ماذا تقصد', 'what do you mean', 'clarify', 'explain', 'unclear', 'not clear', 'what does'],
    why: ['لماذا', 'ما السبب', 'ما الذي يجعلك', 'علام', 'why', 'what makes'],
    how: ['كيف', 'باي طريقه', 'how'],
    when: ['متى', 'في اي وقت', 'when'],
    terms: ['شروط', 'بنود', 'تفاصيل', 'الصيغه', 'الصيغة', 'العرض', 'الرقم', 'النسبه', 'النسبة', 'المده', 'المدة', 'terms', 'details', 'clause'],
    defer: ['لاحقا', 'وقت اخر', 'نؤجل', 'تاجيل', 'نفكر', 'افكر', 'استشير', 'استشاور', 'ليس الان', 'not now', 'later', 'defer', 'think about', 'consult', 'another time'],
    apology: ['اعتذر', 'اعتذار', 'اسف', 'ناسف', 'اخطأنا', 'خطأنا', 'نتحمل المسؤوليه', 'our mistake', 'apolog', 'sorry', 'we were wrong', 'our fault'],
    smalltalk: ['كيف حالك', 'كيف حالكم', 'كيفك', 'اخبارك', 'يومك', 'اسبوعك', 'how are you', 'how is it going', 'how do you do', 'your day', 'weekend'],
    greeting: ['السلام', 'مرحب', 'اهلا', 'صباح', 'مساء', 'hello', 'hi', 'good morning', 'good afternoon', 'greetings', 'dear'],
    thanks: ['شكرا', 'مشكور', 'يعطيك', 'thank', 'thanks', 'appreciated'],
    urgency: ['عاجل', 'اليوم', 'بسرعه', 'وقت قصير', 'مهله ضيقه', 'urgent', 'today', 'deadline', 'asap'],
    walkaway: ['ننسحب', 'انسحاب', 'ننهي بلا اتفاق', 'خارج الطاوله', 'لا اتفاق', 'walk away', 'no deal', 'leave'],
    demand: ['يجب عليكم', 'لا بديل', 'مستحيل', 'نفرض', 'مطالبتي واضحه', 'لا تقبل', 'لن اقبل', 'must', 'no alternative', 'impossible', 'you have to', 'we insist', 'non-negotiable', 'we demand'],
    threat: ['سنضطر', 'سنتصاعد', 'سرفع', 'سبلاغ', 'خلاف ذلك', 'والا', 'ساشتكي', 'سنوقف', 'سانسحب', 'سنسحب', 'تصعيد', 'otherwise', 'we will escalate', 'we will go to', 'we will stop', 'we will withdraw', 'complain'],
    reference: ['هذا', 'هذه', 'ذلك', 'تلك', 'الاخير', 'الاخيره', 'عرضك', 'اقتراحك', 'صيغتك', 'رقمك', 'شرطك', 'سقفك', 'موقفك', 'كلامك', 'ما قلته', 'عرضكم', 'اقتراحكم', 'الصيغه الاخيره', 'الرقم الاخير', 'this', 'that', 'last offer', 'your offer', 'your proposal', 'your number', 'your condition'],
    uncertain: ['لا اعرف', 'لست متاكدا', 'ربما', 'قد يكون', 'لا املك قرارا', 'غير متاكد', 'not sure', 'maybe', 'perhaps', 'i dont know'],
    filler: ['همم', 'امم', 'اه', 'مثير للاهتمام', 'interesting', 'hmm', 'uh', 'well then'],
    weather: ['طقس', 'جو', 'مطر', 'حراره', 'weather', 'rain', 'temperature'],
    time: ['الوقت', 'الساعه', 'التاريخ', 'what time', 'date'],
    personal: ['عائلتك', 'زواجك', 'طعامك', 'هواياتك', 'فريقك', 'مباراه', 'family', 'hobby', 'football', 'match'],
    tech: ['برمجه', 'حاسوب', 'انترنت', 'programming', 'computer', 'internet']
  };

  function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function hasWord(text, w) {
    if (!w) return false;
    const re = new RegExp('(^|[^\\u0621-\\u064A])' + esc(w) + '($|[^\\u0621-\\u064A])', 'i');
    return re.test(text);
  }

  /* Arabic attaches proclitics (و، ف، ب، ل، ك، ال...) and inflectional
     suffixes to words. A plain substring test therefore reads "تمام"
     (agreement) inside "اهتمام" (interest) and "طيب" (fine) inside
     "طبيعي" (natural). termHit() accepts a match only when the part
     before it is a proclitic and the part after it is a recognised
     suffix (or a token boundary). */
  const PROCLITIC = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك', 'س'];
  const SUFFIX = ['', 'ه', 'ها', 'هم', 'هما', 'هن', 'ك', 'كم', 'كما', 'كن', 'ي', 'نا', 'تنا', 'تي',
    'ات', 'ون', 'ين', 'ان', 'ة', 'ت', 'تم', 'تن', 'وا', 'و', 'ا', 'أ', 'إ', 'يه', 'تها', 'تهم'];

  function termHit(text, term) {
    if (!term) return -1;
    if (term.indexOf(' ') !== -1) return text.indexOf(term);
    let from = 0;
    while (from <= text.length - term.length) {
      const idx = text.indexOf(term, from);
      if (idx < 0) return -1;
      const before = text.slice(0, idx);
      const prev = idx > 0 ? text[idx - 1] : '';
      const prevOk = !prev || !/[\u0621-\u064A]/.test(prev) || PROCLITIC.some(p => before.endsWith(p));
      if (prevOk) {
        const rest = text.slice(idx + term.length);
        const tail = (rest.match(/^[\u0621-\u064A]*/) || [''])[0];
        if (SUFFIX.indexOf(tail) !== -1) return idx;
      }
      from = idx + 1;
    }
    return -1;
  }

  function hasTerm(text, w) {
    if (!w) return false;
    if (WORD_ONLY.has(w) || w.length <= 2) return hasWord(text, w);
    return termHit(text, w) !== -1;
  }

  function hasAny(text, arr) {
    for (const w of arr) if (hasTerm(text, w)) return true;
    return false;
  }

  function findMarker(text, arr) {
    let best = null;
    for (const w of arr) {
      let idx = -1;
      if (WORD_ONLY.has(w) || w.length <= 2) {
        const re = new RegExp('(^|[^\\u0621-\\u064A])' + esc(w) + '($|[^\\u0621-\\u064A])', 'i');
        const m = re.exec(text);
        if (m) idx = m.index + (m[1] ? m[1].length : 0);
      } else {
        idx = termHit(text, w);
      }
      if (idx >= 0 && (!best || idx < best.index)) best = { index: idx, word: w };
    }
    return best;
  }

  function isNegatedAt(text, idx) {
    const before = text.slice(Math.max(0, idx - 34), idx);
    const toks = before.split(/\s+/).filter(Boolean).slice(-3);
    if (toks.some(t => NEG.indexOf(t) !== -1)) return true;
    return /(^|\s)(غير|ليس|ليست|لست|لسنا|لن|لم|لا)\s*$/.test(before);
  }

  function unitCat(u) {
    const s = TFA.normalize(u);
    if (!s) return 'none';
    if (s === '%' || s === 'بالمئة' || s === 'بالمئه' || s === 'percent') return 'pct';
    if (/^(يوم|ايام|day|days)$/.test(s)) return 'd';
    if (/^(اسبوع|اسابيع|week|weeks)$/.test(s)) return 'w';
    if (/^(شهر|اشهر|شهور|month|months)$/.test(s)) return 'mo';
    if (/^(موظف|كادر|كوادر|staff|people)$/.test(s)) return 'staff';
    return 'other';
  }

  function dimById(session, id) {
    return (session.scenario.dimensions || []).find(d => d.id === id) || null;
  }

  function dimSynonyms(d) {
    const words = [];
    const push = v => {
      if (!v) return;
      const n = TFA.normalize(String(v));
      for (const w of n.split(/\s+/)) if (w.length >= 3 && !STOP.has(w)) words.push(w);
    };
    push(d.id); push(L(d.label, 'ar')); push(L(d.label, 'en'));
    if (d.unit === '%') words.push('نسبه', 'نسبة', 'مئويه', 'بالمئه', 'زياده', 'اعتماد', 'سعر', 'قيمه', 'تمويل', 'مبلغ', 'percent', 'percentage', 'increase', 'price', 'funding', 'amount');
    if (d.unit === 'mo') words.push('شهر', 'اشهر', 'شهور', 'تجزئه', 'دفعات', 'مرحلي', 'phasing', 'months', 'installments');
    if (d.unit === 'd') words.push('يوم', 'ايام', 'تمديد', 'مهله', 'days', 'extension', 'deadline');
    if (d.unit === 'w') words.push('اسبوع', 'اسابيع', 'مراجعه', 'weeks', 'review');
    if (d.unit === '' || d.unit === 'staff') words.push('موظف', 'موظفين', 'كادر', 'عدد', 'اشخاص', 'staff', 'count', 'people');
    return words;
  }

  function scoreDims(session, norm) {
    const dlg = session.dialogue || {};
    const pending = (session.cp && session.cp.pendingQuestion) || null;
    const lastTopic = dlg.lastTopic || null;
    return (session.scenario.dimensions || []).map(d => {
      let score = 0;
      for (const w of dimSynonyms(d)) {
        if (w && norm.indexOf(w) !== -1) score += w.length >= 4 ? 2 : 1;
      }
      if (lastTopic === d.id) score += 2;
      if (pending && pending.dimId === d.id) score += 2;
      return { d, score };
    }).sort((a, b) => b.score - a.score);
  }

  function catMatch(d, cat) {
    const dcat = d.unit === '%' ? 'pct' : (d.unit || 'none');
    if (cat === 'pct') return dcat === 'pct';
    if (cat === 'staff') return dcat === 'none' || dcat === '' || dcat === 'staff';
    if (cat === 'none') return dcat === 'none' || dcat === '';
    return dcat === cat;
  }

  function mapValues(session, analysis, norm) {
    const dims = session.scenario.dimensions || [];
    const out = {};
    if (!dims.length || !analysis.numbers.length) return out;

    const scored = scoreDims(session, norm);
    const salient = scored.filter(x => x.score > 0).map(x => x.d);
    const byCat = {};
    for (const n of analysis.numbers) {
      if (!isFinite(n.value)) continue;
      const c = unitCat(n.unit);
      (byCat[c] = byCat[c] || []).push(n);
    }

    const used = new Set();
    for (const cat of Object.keys(byCat)) {
      let candidates = dims.filter(d => !used.has(d.id) && catMatch(d, cat));
      if (!candidates.length && (cat === 'none' || cat === 'staff' || cat === 'other')) {
        candidates = dims.filter(d => !used.has(d.id));
      }
      if (!candidates.length) continue;
      let target = candidates.find(d => salient.some(s => s.id === d.id)) || candidates[0];
      let n = byCat[cat][0];
      if (byCat[cat].length > 1 && /من\s+.+\s+الى/.test(norm)) n = byCat[cat][byCat[cat].length - 1];
      out[target.id] = n.value;
      used.add(target.id);
    }

    if (!Object.keys(out).length && analysis.numbers.length) {
      const free = dims.filter(d => !used.has(d.id));
      if (free.length === 1) out[free[0].id] = analysis.numbers[0].value;
      else if (salient.length === 1) out[salient[0].id] = analysis.numbers[0].value;
    }
    return out;
  }

  function formatValues(session, values) {
    const lang = session.lang || 'ar';
    const parts = [];
    for (const d of session.scenario.dimensions || []) {
      if (values[d.id] == null) continue;
      parts.push(L(d.label, lang) + ': ' + values[d.id] + (d.unit ? ' ' + unitLabel(d.unit, values[d.id], lang) : ''));
    }
    return parts.join(lang === 'ar' ? '، ' : '; ');
  }

  function unitLabel(u, v, lang) {
    v = Number(v) || 0;
    if (lang === 'ar') {
      if (u === 'mo') return v === 1 ? 'شهر' : (v === 2 ? 'شهرين' : v <= 10 ? 'أشهر' : 'شهراً');
      if (u === 'd') return v === 1 ? 'يوم' : (v === 2 ? 'يومين' : v <= 10 ? 'أيام' : 'يوماً');
      if (u === 'w') return v === 1 ? 'أسبوع' : (v === 2 ? 'أسبوعين' : v <= 10 ? 'أسابيع' : 'أسبوعاً');
      return u === '%' ? '%' : u;
    }
    if (u === 'mo') return v === 1 ? 'month' : 'months';
    if (u === 'd') return v === 1 ? 'day' : 'days';
    if (u === 'w') return v === 1 ? 'week' : 'weeks';
    return u === '%' ? '%' : u;
  }

  function lastProposal(session) {
    const cp = session.cp || {};
    if (cp.acceptedDeal) {
      return {
        kind: 'deal',
        text: cp.acceptedDeal.terms || formatValues(session, cp.acceptedDeal.values || {}),
        values: cp.acceptedDeal.values || {}
      };
    }
    if (cp.lastCounter) {
      return {
        kind: 'counter',
        text: cp.lastCounterText || formatValues(session, cp.lastCounter),
        values: cp.lastCounter,
        dimId: cp.lastCounterDim || null
      };
    }
    /* Only an actual proposal counts as "the last proposal". Falling back
       to the whole previous reply made clarification quotes grow turn after
       turn ("the formula is: the formula is: ..."). */
    const msgs = session.messages || [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role !== 'cp') continue;
      if (msgs[i].meta && msgs[i].meta.opening) {
        return { kind: 'opening', text: msgs[i].text };
      }
      break;
    }
    return null;
  }

  function stickingDim(session) {
    const dims = session.scenario.dimensions || [];
    const up = (session.dialogue && session.dialogue.userPositions) || {};
    let best = null, bestGap = -1;
    for (const d of dims) {
      const u = up[d.id] != null ? up[d.id] : d.userGoal;
      const gap = Math.abs(u - session.cp.position[d.id]) / Math.max(Math.abs(d.userGoal - d.cpStart), 1);
      if (gap > bestGap) { bestGap = gap; best = d; }
    }
    return best;
  }

  function constraintOf(session) {
    return L((session.scenario.counterpart || {}).constraint, session.lang) ||
      (session.lang === 'ar' ? 'القيود النظامية المعتمدة' : 'the approved procedural constraints');
  }

  function topicOf(session) {
    return L(session.scenario.title, session.lang) || (session.lang === 'ar' ? 'الملف المطروح' : 'the file at hand');
  }

  function interestOf(session, frame) {
    const interests = (session.scenario.counterpart && session.scenario.counterpart.interests) || [];
    for (const it of interests) {
      const txt = TFA.normalize(L(it.text, session.lang));
      const words = txt.split(/\s+/).filter(w => w.length >= 5).slice(0, 6);
      if (words.some(w => frame.flat.indexOf(w) !== -1)) return L(it.text, session.lang);
    }
    return frame.raw.slice(0, 120);
  }

  function previousPosition(session, dimId) {
    const dlg = session.dialogue;
    if (!dlg || !dlg.history) return null;
    for (let i = dlg.history.length - 1; i >= 0; i--) {
      const h = dlg.history[i];
      if (h.values && h.values[dimId] != null) return h.values[dimId];
    }
    return null;
  }

  /* Content words used to decide whether a short message actually answers
     the counterpart's pending question. This keeps fillers such as
     "همم، هذا رأي مثير للاهتمام" from being recorded as an answer. */
  function contentWords(text) {
    return String(text || '').split(/[^\u0621-\u064Aa-zA-Z0-9]+/)
      .filter(w => w.length >= 4 && !STOP.has(w));
  }

  function answersPending(session, analysis, norm, acts, questionLike, yesNo) {
    const pending = session.cp && session.cp.pendingQuestion;
    if (!pending || questionLike) return false;
    if (acts.offer || acts.reject || acts.accept || acts.object || acts.condition ||
        acts.explain || acts.uncertain || acts.defer) return true;
    if (yesNo || analysis.numbers.length) return true;
    if (hasAny(norm, LEX.filler)) return false;
    const pw = contentWords(pending.text);
    const uw = contentWords(norm);
    if (uw.some(w => pw.indexOf(w) !== -1)) return true;
    return analysis.wordCount >= 3;
  }

  function detectChange(session, values, norm) {
    for (const dim of Object.keys(values)) {
      const old = previousPosition(session, dim);
      if (old != null && old !== values[dim]) return { dimId: dim, old, new: values[dim] };
    }
    const m = norm.match(/من\s+(\d+(?:[.,]\d+)?)\s*(?:%|بالمئه|شهر|اشهر|يوم|ايام|اسبوع|اسابيع)?\s+الى\s+(\d+(?:[.,]\d+)?)/);
    if (m) {
      return { old: parseFloat(m[1].replace(',', '.')), new: parseFloat(m[2].replace(',', '.')), dimId: Object.keys(values)[0] || null };
    }
    return null;
  }

  function extractCondition(raw, norm) {
    if (!hasAny(norm, LEX.condition) && !/(^|\s)(if|provided)(\s|$)/.test(norm)) return null;
    let txt = String(raw || '').trim();
    const m = txt.match(/(?:بشرط|شريطة|على أن|على ان|في حال|إذا|اذا|مقابل|بمقابل)\s+(.+)$/i);
    if (m) txt = m[1];
    txt = txt.split(/\s+فأنا\s+|\s+فنحن\s+|\s+فسوف\s+/)[0];
    return txt.slice(0, 140);
  }

  function hasTopicOverlap(session, norm) {
    const sc = session.scenario || {};
    const chunks = [];
    const push = v => {
      if (!v) return;
      if (typeof v === 'string') chunks.push(v);
      else if (typeof v === 'object') { if (v.ar) chunks.push(v.ar); if (v.en) chunks.push(v.en); }
    };
    push(sc.title); push(sc.summary); push(sc.context);
    if (sc.counterpart) {
      push(sc.counterpart.constraint); push(sc.counterpart.title);
      for (const it of sc.counterpart.interests || []) push(it.text);
    }
    for (const d of sc.dimensions || []) push(d.label);
    for (const p of sc.packages || []) push(p.label);
    for (const o of sc.objectives || []) push(o);

    const vocab = new Set();
    for (const c of chunks) {
      for (const w of TFA.normalize(c).split(/\s+/)) if (w.length >= 4 && !STOP.has(w)) vocab.add(w);
    }
    for (const w of ['اتفاق', 'تفاوض', 'عرض', 'صيغه', 'صيغة', 'شرط', 'ميزانيه', 'سقف', 'موقف', 'مصلحه', 'مصلحة', 'بديل', 'زياده', 'تخفيض', 'مده', 'مدة', 'شروط', 'بنود', 'طرف', 'جلسه', 'جلسة']) vocab.add(w);
    for (const w of vocab) if (norm.indexOf(w) !== -1) return true;
    return false;
  }

  function isOffTopic(session, norm) {
    if (hasAny(norm, LEX.weather) || hasAny(norm, LEX.personal) || hasAny(norm, LEX.tech)) return !hasTopicOverlap(session, norm);
    if (hasAny(norm, LEX.time)) return !hasTopicOverlap(session, norm);
    return !hasTopicOverlap(session, norm) && !hasAny(norm, LEX.clarify) && !hasAny(norm, LEX.why) && !hasAny(norm, LEX.terms);
  }

  function answerOffTopic(session, frame) {
    const lang = session.lang || 'ar';
    const n = frame.flat;
    if (hasAny(n, LEX.smalltalk)) return lang === 'ar' ? 'أنا بخير، وأشكرك على سؤالك.' : 'I am well, thank you for asking.';
    if (hasAny(n, LEX.weather)) return lang === 'ar' ? 'لا أستطيع التحقق من حالة الطقس من داخل هذه الجلسة.' : 'I cannot verify the weather from inside this session.';
    if (hasAny(n, LEX.time)) {
      const d = new Date().toISOString().slice(0, 10);
      return lang === 'ar' ? 'التاريخ اليوم هو ' + d + '.' : 'Today\u2019s date is ' + d + '.';
    }
    if (hasAny(n, LEX.personal)) return lang === 'ar' ? 'أفضّل أن يبقى حديثي في نطاق الملف المهني، مع تقديري لسؤالك.' : 'I prefer to keep my remarks within the professional file, with appreciation for your question.';
    if (hasAny(n, LEX.tech)) return lang === 'ar' ? 'ليست لدي معطيات تقنية موثوقة داخل هذه الجلسة.' : 'I have no reliable technical data inside this session.';
    if (/(batna|بديل افضل|افضل بديل)/.test(n)) return lang === 'ar' ? 'البديل الأفضل للاتفاق المتفاوض عليه هو ما ستفعله إن لم يتحقق الاتفاق، وهو مقياس لأي عرض.' : 'The best alternative to a negotiated agreement is what you would do if no agreement is reached; it measures any offer.';
    if (/(zopa|منطقه الاتفاق)/.test(n)) return lang === 'ar' ? 'منطقة الاتفاق الممكنة هي تقاطع حدود الطرفين، حيث يمكن أن يقبل كلاهما.' : 'The zone of possible agreement is the overlap of the parties\u2019 limits, where both can accept.';
    if (/(مصلحه|مصالح|interest)/.test(n)) return lang === 'ar' ? 'المصلحة هي سبب الموقف، والموقف هو ما يُعلن صراحة؛ وفهم المصلحة يفتح خيارات أوسع.' : 'An interest is the reason behind a position, while a position is what is stated openly; understanding the interest widens options.';
    return lang === 'ar' ? 'لا أملك معطيات موثوقة عن هذا الموضوع داخل الجلسة.' : 'I have no reliable data on that subject inside this session.';
  }

  function explainState(session, frame) {
    const lang = session.lang || 'ar';
    const lp = lastProposal(session);
    const dim = (frame.target && frame.target.dimId && dimById(session, frame.target.dimId)) || stickingDim(session);
    const dimLabel = dim ? L(dim.label, lang) : (lang === 'ar' ? 'البند المطروح' : 'the item on the table');
    if (lp && lp.text) {
      return lang === 'ar'
        ? `الصيغة المطروحة الآن هي: ${lp.text}. وهي لا تتجاوز ${constraintOf(session)}؛ وأثرها المباشر يظهر في ${dimLabel}.`
        : `The formula on the table is: ${lp.text}. It does not exceed ${constraintOf(session)}; its direct effect appears in ${dimLabel}.`;
    }
    return lang === 'ar'
      ? `الإطار الحاكم هو ${constraintOf(session)}. وأي تعديل على ${dimLabel} يحتاج قيمة محددة ومسوّغاً قابلاً للتوثيق.`
      : `The governing frame is ${constraintOf(session)}. Any change to ${dimLabel} needs a specific value and a documentable justification.`;
  }

  function whyState(session, frame) {
    const lang = session.lang || 'ar';
    const dim = (frame.target && frame.target.dimId && dimById(session, frame.target.dimId)) || stickingDim(session);
    const dimLabel = dim ? L(dim.label, lang) : (lang === 'ar' ? 'البند المطروح' : 'the item on the table');
    return lang === 'ar'
      ? `لأن ${constraintOf(session)} ليس تفضيلاً شخصياً بل التزاماً نظامياً. و${dimLabel} مرتبط به مباشرة؛ وتجاوزه يحتاج مسوّغاً موثقاً أو صيغة مرحلية تحفظ الحد.`
      : `Because ${constraintOf(session)} is not a personal preference but a procedural obligation. ${dimLabel} is directly tied to it; breaching it needs documented justification or a phased formula that preserves the limit.`;
  }

  function initState() {
    return {
      lastTopic: null,
      userPositions: {},
      history: [],
      rejected: [],
      accepted: [],
      questions: [],
      clarifications: 0,
      unrelatedCount: 0,
      mindChanges: 0,
      lastFrame: null
    };
  }

  function interpret(session, text, analysis) {
    const raw = String(text || '').trim();
    const norm = analysis.flat;
    const dlg = session.dialogue || (session.dialogue = initState());
    const values = mapValues(session, analysis, norm);
    const condition = extractCondition(raw, norm);

    /* A number inside a pure question ("why 13%?") is a reference to a
       value under discussion, not a new proposal. Only a message that
       carries an offer cue (or is not a question at all) updates the
       trainee's substantive position. */
    const questionLike = !!analysis.intents.question || /[?؟]/.test(raw);
    const offerCue = !!analysis.intents.offer || hasAny(norm, LEX.offer);
    const proposalValues = (questionLike && !offerCue) ? {} : values;
    const change = detectChange(session, proposalValues, norm);

    const acc = findMarker(norm, LEX.accept);
    const rej = findMarker(norm, LEX.reject);
    let accept = false, reject = false;
    const targetBefore = (function () {
      const scored = scoreDims(session, norm).filter(x => x.score > 0);
      if (scored.length) {
        const d = scored[0].d;
        return { kind: 'dimension', dimId: d.id, label: L(d.label, session.lang), text: L(d.label, session.lang) };
      }
      const lp = lastProposal(session);
      if (hasAny(norm, LEX.reference) && lp) {
        return { kind: lp.kind, dimId: lp.dimId || null, text: lp.text, values: lp.values };
      }
      const pending = session.cp && session.cp.pendingQuestion;
      if (pending) return { kind: 'pending', text: pending.text, dimId: pending.dimId || null };
      return { kind: 'none' };
    })();

    /* Questions about the counterpart's rejection ("why do you refuse?")
       must not be read as the trainee rejecting the proposal. */
    const firstPersonStance = /(^|\s)(ارفض|نرفض|لا اوافق|لن اوافق|لا اقبل|لن اقبل|اوافق|نوافق|نقبل|اقبل|موافق)(\s|$)/.test(norm);
    if (questionLike && !firstPersonStance && !offerCue) { accept = false; reject = false; }
    else {
      if (rej) {
        reject = !isNegatedAt(norm, rej.index);
        if (!reject && targetBefore.kind !== 'none') accept = true;
      }
      if (acc) {
        if (isNegatedAt(norm, acc.index)) reject = true;
        else if (!reject) accept = true;
      }
    }

    const acts = {
      greeting: !!analysis.intents.greeting,
      thanks: !!analysis.intents.thanks,
      apology: hasAny(norm, LEX.apology) && !questionLike,
      smalltalk: hasAny(norm, LEX.smalltalk),
      offer: offerCue || Object.keys(proposalValues).length > 0,
      accept,
      reject,
      condition: !!condition,
      /* A bare contrast particle ("لكن") is not an objection when the same
         message carries a concrete proposal; a specific objection cue is.
         A question about an objection is answered as a question. */
      object: !accept && !questionLike && (hasAny(norm, LEX.objectStrong) ||
        (hasAny(norm, LEX.object) && !offerCue && !analysis.intents.option &&
         !Object.keys(proposalValues).length)),
      explain: !!analysis.hasReasons || hasAny(norm, LEX.explain),
      mindChange: hasAny(norm, LEX.mindChange) || !!change,
      defer: hasAny(norm, LEX.defer),
      close: !!analysis.intents.closing,
      walkaway: hasAny(norm, LEX.walkaway) && !analysis.intents.question,
      threat: !!analysis.intents.threat && !questionLike,
      demand: !!analysis.intents.demand && !questionLike,
      citeCriteria: !!analysis.intents.criteria,
      askInterests: !!analysis.intents.questionInterests,
      proposeOption: !!analysis.intents.option,
      stateBatna: !!analysis.intents.batna,
      summarize: !!analysis.intents.paraphrase,
      facilitate: !!analysis.intents.agenda || !!analysis.intents.facilitate,
      concede: !!analysis.intents.concede,
      uncertain: hasAny(norm, LEX.uncertain)
    };

    let stance = 'neutral';
    if (reject) stance = 'reject';
    else if (accept) stance = 'accept';
    if (Object.keys(proposalValues).length && (reject || !accept)) stance = 'counter';
    if (condition && (accept || reject)) stance = 'conditional';

    let questionKind = null;
    if (questionLike) {
      if (analysis.intents.questionInterests) questionKind = 'interests';
      else if (hasAny(norm, LEX.clarify)) questionKind = 'clarify';
      else if (hasAny(norm, LEX.why)) questionKind = 'why';
      else if (analysis.intents.batna) questionKind = 'batna';
      else if (hasAny(norm, LEX.terms) || targetBefore.kind !== 'none') questionKind = 'terms';
      else if (isOffTopic(session, norm)) questionKind = 'unrelated';
      else if (hasAny(norm, LEX.how)) questionKind = 'how';
      else if (hasAny(norm, LEX.when)) questionKind = 'when';
      else questionKind = 'general';
    }

    const pending = session.cp && session.cp.pendingQuestion;
    const yesNo = /(^|\s)(نعم|اجل|بلى|كلا|لا|yes|no|sure|absolutely)(\s|$)/.test(norm);
    const pendingAnswer = answersPending(session, analysis, norm, acts, questionLike, yesNo);

    const offTopic = !questionLike ? false : questionKind === 'unrelated';

    const substantive = acts.offer || acts.accept || acts.reject || acts.object || acts.condition || acts.explain ||
      acts.mindChange || acts.defer || acts.apology || acts.smalltalk || acts.greeting || acts.thanks ||
      acts.threat || acts.demand || acts.walkaway || acts.close || acts.citeCriteria || acts.askInterests ||
      acts.proposeOption || acts.stateBatna || acts.summarize || acts.facilitate || acts.concede ||
      acts.uncertain || !!questionKind || Object.keys(proposalValues).length > 0 || pendingAnswer;

    let ambiguity;
    if (substantive) ambiguity = { level: 0, reason: null };
    else if (analysis.wordCount === 0) ambiguity = { level: 1, reason: 'empty' };
    else if (analysis.wordCount < 4) ambiguity = { level: 0.6, reason: 'short' };
    else ambiguity = { level: 0.4, reason: 'no_target' };

    const frame = {
      raw,
      flat: norm,
      lang: session.lang || 'ar',
      wordCount: analysis.wordCount,
      acts,
      stance,
      target: targetBefore,
      values,
      proposalValues,
      change,
      condition,
      questionKind,
      pendingAnswer,
      answering: pendingAnswer ? (pending ? pending.kind || 'generic' : 'generic') : null,
      offTopic,
      ambiguity,
      explanation: acts.explain ? raw.slice(0, 140) : '',
      topics: scoreDims(session, norm).filter(x => x.score > 0).map(x => x.d.id),
      primary: primaryAct(acts, questionKind, proposalValues, stance)
    };
    frame.lastProposal = lastProposal(session);
    frame.stickingDim = stickingDim(session);
    return frame;
  }

  function primaryAct(acts, questionKind, values, stance) {
    if (acts.threat) return 'threat';
    if (acts.demand) return 'demand';
    if (Object.keys(values).length) return 'offer';
    if (acts.reject) return 'reject';
    if (acts.accept) return 'accept';
    if (acts.condition) return 'condition';
    if (acts.mindChange) return 'mindChange';
    if (acts.object) return 'object';
    if (questionKind) return 'question';
    if (acts.explain) return 'explain';
    if (acts.defer) return 'defer';
    if (acts.apology) return 'apology';
    if (acts.smalltalk) return 'smalltalk';
    if (acts.close) return 'close';
    if (acts.walkaway) return 'walkaway';
    if (acts.summarize) return 'summarize';
    if (acts.citeCriteria) return 'criteria';
    if (acts.askInterests) return 'interests';
    if (acts.proposeOption) return 'option';
    if (acts.stateBatna) return 'batna';
    if (acts.concede) return 'concede';
    if (acts.greeting) return 'greeting';
    if (acts.thanks) return 'thanks';
    return stance === 'neutral' ? 'unclear' : stance;
  }

  function remember(session, frame) {
    const dlg = session.dialogue || (session.dialogue = initState());
    dlg.lastFrame = frame;
    if (frame.topics && frame.topics.length) dlg.lastTopic = frame.topics[0];
    if (frame.target && frame.target.dimId) dlg.lastTopic = frame.target.dimId;
    const positions = frame.proposalValues || frame.values || {};
    for (const dim of Object.keys(positions)) dlg.userPositions[dim] = positions[dim];

    if (frame.stance === 'reject') {
      const lp = lastProposal(session);
      dlg.rejected.push({ turn: session.turns, text: lp ? lp.text : frame.raw.slice(0, 100), values: lp && lp.values ? Object.assign({}, lp.values) : null });
      if (dlg.rejected.length > 8) dlg.rejected.shift();
    }
    if (frame.stance === 'accept') {
      const lp = lastProposal(session);
      if (lp && lp.values) {
        dlg.accepted.push({ turn: session.turns, values: Object.assign({}, lp.values) });
        if (dlg.accepted.length > 8) dlg.accepted.shift();
      }
    }
    if (frame.questionKind) {
      dlg.questions.push({ turn: session.turns, kind: frame.questionKind });
      if (dlg.questions.length > 20) dlg.questions.shift();
    }
    if (frame.acts.mindChange) dlg.mindChanges++;
    if (frame.offTopic) dlg.unrelatedCount++;
    if (frame.ambiguity && frame.ambiguity.level > 0) dlg.clarifications++;

    dlg.history.push({
      turn: session.turns,
      primary: frame.primary,
      stance: frame.stance,
      topic: dlg.lastTopic,
      values: Object.assign({}, frame.proposalValues || frame.values),
      question: frame.questionKind || null,
      text: frame.raw.slice(0, 160)
    });
    if (dlg.history.length > 40) dlg.history.shift();
  }

  function slots(session, frame) {
    const dim = (frame.target && frame.target.dimId && dimById(session, frame.target.dimId)) || frame.stickingDim || stickingDim(session);
    const dims = session.scenario.dimensions || [];
    const dimA = dims[0] ? L(dims[0].label, session.lang) : '';
    const dimB = dims[1] ? L(dims[1].label, session.lang) : (dims[0] ? L(dims[0].label, session.lang) : '');
    const lp = frame.lastProposal || lastProposal(session);
    const pending = session.cp && session.cp.pendingQuestion;
    const change = frame.change;
    return {
      lastProposal: lp && lp.text ? lp.text : (session.lang === 'ar' ? 'الصيغة المطروحة' : 'the formula on the table'),
      dim: dim ? L(dim.label, session.lang) : (session.lang === 'ar' ? 'البند المطروح' : 'the item on the table'),
      dimA: dimA || (session.lang === 'ar' ? 'البند الأول' : 'the first item'),
      dimB: dimB || (session.lang === 'ar' ? 'البند الثاني' : 'the second item'),
      pending: pending && pending.text ? pending.text : '',
      condition: frame.condition || '',
      reason: frame.explanation || frame.raw.slice(0, 120),
      interest: interestOf(session, frame),
      old: change && change.old != null ? change.old : '',
      new: change && change.new != null ? change.new : '',
      answer: answerOffTopic(session, frame),
      explanation: explainState(session, frame),
      why: whyState(session, frame),
      summary: frame.raw.slice(0, 140),
      date: new Date().toISOString().slice(0, 10)
    };
  }

  function clarifyKind(session, frame) {
    if (session.cp && session.cp.pendingQuestion) return 'clarifyPending';
    if (session.cp && session.cp.lastCounter) return 'clarifyCounter';
    if (frame && frame.lastProposal && frame.lastProposal.kind !== 'opening') return 'clarifyCounter';
    return 'clarifyOpen';
  }

  return {
    LEX,
    initState,
    interpret,
    remember,
    slots,
    clarifyKind,
    lastProposal,
    stickingDim,
    formatValues,
    answerOffTopic,
    explainState,
    whyState,
    hasTopicOverlap,
    hasTerm,
    findMarker
  };
});
