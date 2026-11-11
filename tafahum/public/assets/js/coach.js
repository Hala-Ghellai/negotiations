/* ============================================================
   Tafahum Platform — coach
   Generates the live guidance note shown after each trainee
   message: reinforcement on what improved + a gap hint with
   concrete suggested phrasing. Bilingual.
   UMD module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./evaluator.js'));
  else root.TFC = factory(root.TFE);
})(typeof self !== 'undefined' ? self : this, function (TFE) {
  'use strict';

  /* micro-lessons injected every few rounds */
  const LESSONS = {
    ar: [
      { title: 'افصل الناس عن المشكلة', body: 'عالج الانفعال والعلاقة بمعزل عن موضوع الخلاف: اعترف بموقف الطرف الآخر قبل أن ترد على مضمونه.' },
      { title: 'المصالح لا المواقف', body: 'الموقف هو ما يقوله الطرف الآخر؛ المصلحة هي سبب قوله. اسأل «لماذا يهمكم هذا؟» بدل مجادلته على «ماذا تريدون».' },
      { title: 'وسّع الخيارات قبل الحسم', body: 'قبل الرقم النهائي، اعرض خيارين أو أكثر — التوسيع يكشف منطقة الاتفاق أسرع من المساومة المباشرة.' },
      { title: 'استند إلى معايير موضوعية', body: 'اللوائح والمتوسطات وآراء الخبراء تحمي الطرفين من المساءلة — الضغط لا يحمي أحداً.' },
      { title: 'اعرف بديلك قبل الجلسة', body: 'أفضل بديل للاتفاق المتفاوض عليه (BATNA) هو ما ستفعله إن فشل التفاوض، وبه تُقاس جدوى أي عرض.' },
      { title: 'أعد الصياغة لتثبيت الفهم', body: 'أن تلخّص موقف الطرف الآخر بكلماتك وتسأله «هل فهمت صحيحاً؟» يرفع الثقة ويكشف ما فاتك.' }
    ],
    en: [
      { title: 'Separate people from the problem', body: 'Address emotion and relationship apart from the substance: acknowledge the other side\u2019s situation before replying to its content.' },
      { title: 'Interests, not positions', body: 'A position is what they say; an interest is why they say it. Ask “why does this matter to you?” instead of arguing over “what you want”.' },
      { title: 'Widen options before deciding', body: 'Before the final number, put two or more options on the table — widening reveals the agreement zone faster than direct haggling.' },
      { title: 'Anchor to objective criteria', body: 'Regulations, averages and expert opinion protect both sides from accountability — pressure protects no one.' },
      { title: 'Know your alternative first', body: 'Your BATNA is what you\u2019ll do if negotiation fails; any offer is measured against it.' },
      { title: 'Reframe to lock understanding', body: 'Summarising the other side\u2019s position in your own words and asking “did I get that right?” raises trust and reveals what you missed.' }
    ]
  };

  /* hints per criterion — what to do + exact suggested sentence */
  const HINTS = {
    ar: {
      prep: { tip: 'اذكر بديلك بهدوء — لا كتهديد.', say: '«إن لم نصل إلى صيغة، سنضطر لإعادة ترتيب أولوياتنا — أفترض لديكم قيوداً مماثلة؟»' },
      interests: { tip: 'لم تسأل بعد عن مصالحهم — هذا مدخل الاتفاق.', say: '«ما أكثر ما يهمكم في هذا الملف؟ وما الذي يقلقكم إن لم نتفق؟»' },
      listening: { tip: 'أعد صياغة موقفهم لتتأكد من فهمك.', say: '«إن فهمت صحيحاً، فقلقكم الأساسي هو... — أصبت؟»' },
      options: { tip: 'ابتكر خياراً جديداً للمكسب المشترك بدل المساومة على الرقم.', say: '«ما رأيك لو وسّعنا الخيارات: صيغة مرحلية، أو ربط بمؤشرات، أو مشاركة في الالتزامات؟»' },
      criteria: { tip: 'استند إلى معيار موضوعي — اللوائح والسقوف تحمي الطرفين.', say: '«أقترح أن نحتكم إلى المعيار المعتمد في مثل هذه الحالات — ما المعيار الذي تستندون إليه؟»' },
      relationship: { tip: 'افصل الحزم في الموضوع عن الاحترام في الشخص.', say: '«أقدّر قيودكم، وأختلف معكم في هذا البند تحديداً — لا في المبدأ.»' },
      tone: { tip: 'راقب نبرتك — الحدة تصلّب الموقف المقابل.', say: 'استبدل صيغة الأمر بطلب مشروط: «نستطيع قبول X إذا التزمتم بـY».' }
    },
    en: {
      prep: { tip: 'State your alternative calmly — not as a threat.', say: '\u201CIf we don\u2019t reach a formula, we\u2019ll have to reorder priorities — I assume you face similar constraints?\u201D' },
      interests: { tip: 'You haven\u2019t asked about their interests yet — that\u2019s the gateway to agreement.', say: '\u201CWhat matters most to you in this file? And what worries you if we don\u2019t agree?\u201D' },
      listening: { tip: 'Restate their position to confirm your understanding.', say: '\u201CIf I understood correctly, your core concern is... — did I get that right?\u201D' },
      options: { tip: 'Invent a mutual-gain option instead of haggling the number.', say: '\u201CWhat if we widened the options: a phased formula, KPI linkage, or shared commitments?\u201D' },
      criteria: { tip: 'Anchor to an objective standard — rules and ceilings protect both sides.', say: '\u201CI suggest we defer to the standard used in such cases — which standard do you rely on?\u201D' },
      relationship: { tip: 'Keep firmness on substance separate from respect for the person.', say: '\u201CI appreciate your constraints, and I disagree on this clause specifically — not the principle.\u201D' },
      tone: { tip: 'Watch your tone — harshness hardens the other side.', say: 'Replace commands with conditional requests: \u201CWe can accept X if you commit to Y.\u201D' }
    }
  };

  /* positive reinforcement per intent */
  const PRAISE = {
    ar: {
      questionInterests: 'سؤالك عن مصالحهم خطوة ممتازة — هكذا تُفتح ملفات التفاوض.',
      criteria: 'احتكامك للمعايير الموضوعية يمنحك قوة نظامية — استمر فيه.',
      option: 'عرضك خياراً جديداً يوسّع منطقة الاتفاق — نقطة تحول في الجلسة.',
      rapport: 'الاعتراف بظروفهم يبني الثقة، والثقة هي وقود التنازلات.',
      batna: 'ذكر بديلك بهدوء (لا كتهديد) يعزز موقفك التفاوضي بذكاء.',
      paraphrase: 'إعادة الصياغة تلخص الفهم وتجمّع التقدم — مهارة تيسير واضحة.',
      offer: 'عرضك صيغة محددة يحوّل الجلسة من مواقف إلى تفاوض حقيقي.'
    },
    en: {
      questionInterests: 'Asking about their interests is an excellent move — that\u2019s how negotiation files open.',
      criteria: 'Anchoring to objective criteria gives you formal strength — keep it up.',
      option: 'Putting a new option on the table widens the agreement zone — a turning point.',
      rapport: 'Acknowledging their situation builds trust, and trust fuels concessions.',
      batna: 'Stating your alternative calmly (not as a threat) strengthens your position smartly.',
      paraphrase: 'Restating consolidates understanding and gathers progress — clear facilitation.',
      offer: 'Offering a specific formula converts the session from positions into real bargaining.'
    }
  };

  /* main entry: note = {title, body, say, tone: 'good'|'warn'|'hint'|'lesson'} */
  function coachNote(session, analysis, rating, turnNumber) {
    const lang = session.lang;
    const H = HINTS[lang] || HINTS.ar;
    const PR = PRAISE[lang] || PRAISE.ar;

    /* immediate tone warning overrides everything */
    if (analysis.tone.aggressive > 0) {
      return {
        tone: 'warn',
        title: lang === 'ar' ? 'النبرة تصلّب الموقف' : 'Your tone is hardening the position',
        body: lang === 'ar'
          ? 'رصدتُ حدة في رسالتك. الطرف الآخر سيرفع صلابته وقد يخفي مصالحه. افصل الحزم في الموضوع عن الاحترام في الشخص.'
          : 'I detected harshness in your message. The other side will raise their rigidity and may hide interests. Keep firmness on substance separate from respect for the person.',
        say: H.tone.say
      };
    }

    /* micro-lesson every 3 rounds when nothing urgent */
    if (turnNumber > 0 && turnNumber % 3 === 0) {
      const idx = Math.min(Math.floor(turnNumber / 3) - 1, LESSONS[lang].length - 1);
      const lesson = (LESSONS[lang] || LESSONS.ar)[idx];
      return { tone: 'lesson', title: lesson.title, body: lesson.body, say: null };
    }

    /* praise the best thing they did */
    const intents = analysis.intents;
    for (const k of ['paraphrase', 'questionInterests', 'option', 'criteria', 'batna', 'rapport', 'offer']) {
      if (intents[k]) {
        /* also find the top gap to combine */
        const gap = topGap(session, H);
        return {
          tone: 'good',
          title: PR[k],
          body: gap ? gap.tip : null,
          say: gap ? gap.say : null,
          gapId: gap ? gap.id : null
        };
      }
    }

    /* nothing notable -> hint on the biggest gap */
    const gap = topGap(session, H);
    if (gap) return { tone: 'hint', title: gap.tip, body: null, say: gap.say, gapId: gap.id };

    return null;
  }

  function topGap(session, H) {
    const F = session.flags;
    const order = [
      { id: 'interests', cond: F.askedInterests === 0 },
      { id: 'options', cond: F.proposedOption === 0 && session.turns >= 3 },
      { id: 'criteria', cond: F.citedCriteria === 0 && session.turns >= 4 },
      { id: 'listening', cond: F.paraphrased === 0 && session.turns >= 5 },
      { id: 'prep', cond: F.batnaStated === 0 && session.turns >= 6 },
      { id: 'relationship', cond: F.rapportMoves === 0 && session.turns >= 4 }
    ];
    for (const o of order) {
      if (o.cond) return { id: o.id, tip: H[o.id].tip, say: H[o.id].say };
    }
    return null;
  }

  /* suggested quick-chips for the composer, contextual to the session state */
  function suggestChips(session, i18n) {
    const lang = session.lang;
    const F = session.flags;
    const chips = [];
    const t = i18n.t;
    if (F.askedInterests === 0) chips.push({ id: 'interests', icon: 'target', label: t('chips.interests') });
    if (F.citedCriteria === 0) chips.push({ id: 'criteria', icon: 'scale', label: t('chips.criteria') });
    if (F.proposedOption === 0) chips.push({ id: 'option', icon: 'bulb', label: t('chips.option') });
    if (F.rapportMoves === 0) chips.push({ id: 'rapport', icon: 'heart', label: t('chips.rapport') });
    if (F.batnaStated === 0) chips.push({ id: 'batna', icon: 'shield', label: t('chips.batna') });
    if (F.paraphrased === 0) chips.push({ id: 'summarize', icon: 'layers', label: t('chips.summarize') });
    return chips.slice(0, 3);
  }

  return { coachNote, suggestChips, HINTS, PRAISE, LESSONS };
});
