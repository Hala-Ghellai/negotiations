/* ============================================================
   Tafahum Platform — diagnostic quiz (Thomas–Kilmann based)
   12 situations x 2 options -> dominant + secondary style.
   UMD module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STYLES = ['competing', 'collaborating', 'compromising', 'accommodating', 'avoiding'];

  /* each question: two options, each maps to a style */
  const QUESTIONS = [
    {
      id: 1,
      q: { ar: 'في اجتماع حساس، يرفض مدير إدارة أخرى طلبك المهم بصيغة قاطعة. ماذا تفعل؟', en: 'In a sensitive meeting, another directorate\u2019s head flatly rejects your important request. What do you do?' },
      a: { ar: 'أرفع الموضوع للإدارة العليا ليُحسم لصالحك.', en: 'I escalate to top management to settle it in my favour.' }, styleA: 'competing',
      b: { ar: 'أطلب جلسة خاصة لأفهم أسباب الرفض الحقيقية قبل أي رد.', en: 'I request a private meeting to understand the real reasons behind the refusal first.' }, styleB: 'collaborating'
    },
    {
      id: 2,
      q: { ar: 'أثناء تفاوض على ملف عمل، يشعرك الطرف الآخر أنه مستعجل. ماذا تفعل؟', en: 'During a work-file negotiation, you sense the other side is in a hurry. What do you do?' },
      a: { ar: 'أستغل استعجاله وأثبّت شروطي كاملة.', en: 'I exploit their hurry and lock in my full terms.' }, styleA: 'competing',
      b: { ar: 'أقترح حلاً وسطاً سريعاً يرضي الطرفين جزئياً.', en: 'I propose a quick middle outcome partially satisfying both.' }, styleB: 'compromising'
    },
    {
      id: 3,
      q: { ar: 'زميل قديم يخالفك في نقطة إجرائية وأنت محق نظامياً. ماذا تفعل؟', en: 'A long-standing colleague disagrees with you on a procedure where you are procedurally right. What do you do?' },
      a: { ar: 'أتجاهل الخلاف حفاظاً على العلاقة القديمة.', en: 'I let it slide to preserve the old relationship.' }, styleA: 'accommodating',
      b: { ar: 'أفتح النقاش بالنظام المعتمد أمامه بهدوء وحزم.', en: 'I open the discussion on the approved regulation — calmly but firmly.' }, styleB: 'competing'
    },
    {
      id: 4,
      q: { ar: 'مهمة عاجلة تتطلب اتفاق فريقين متخاصمين. ماذا تفعل؟', en: 'An urgent task requires agreement between two feuding teams. What do you do?' },
      a: { ar: 'أدعو جلسة أستمع فيها لمصالح الفريقين معاً وأبني صيغة مشتركة.', en: 'I convene a session listening to both teams\u2019 interests and build a joint formula.' }, styleA: 'collaborating',
      b: { ar: 'أوزع المهام بإفادة من صلاحياتي وأنهي الجدل.', en: 'I distribute tasks using my authority and end the argument.' }, styleB: 'competing'
    },
    {
      id: 5,
      q: { ar: 'طلب منك مسؤول أعلى تنفيذ تعديل تراه مؤذياً للخدمة. ماذا تفعل؟', en: 'A senior official asks you to implement a change you believe harms the service. What do you do?' },
      a: { ar: 'أنفذ وأبقي تحفظي مسجل في مذكرة داخلية.', en: 'I implement it and record my reservation in an internal memo.' }, styleA: 'accommodating',
      b: { ar: 'أطلب موعداً لأعرض بدائل مدروسة قبل التنفيذ.', en: 'I request a meeting to present studied alternatives before implementation.' }, styleB: 'collaborating'
    },
    {
      id: 6,
      q: { ar: 'محاورك يصر على شرط تراه غير عادل لكن الجلسة طالت. ماذا تفعل؟', en: 'Your counterpart insists on a condition you see as unfair, but the session has dragged on. What do you do?' },
      a: { ar: 'أقترح منتصف الطريق لأختم وأرح الجميع.', en: 'I propose meeting halfway to close and relieve everyone.' }, styleA: 'compromising',
      b: { ar: 'أطلب استراحة قصيرة وأعيد جدولة النقاش لاحقاً وأنا مستعد.', en: 'I call a short break and reschedule the discussion later, prepared.' }, styleB: 'avoiding'
    },
    {
      id: 7,
      q: { ar: 'اكتشفت خطأ سيقابل به الطرف الآخر حساسية شديدة. ماذا تفعل؟', en: 'You discover a mistake the other side will react to very sensitively. What do you do?' },
      a: { ar: 'أصارحه مباشرة وأعرض معالجة مشتركة للأثر.', en: 'I tell them directly and offer joint handling of the impact.' }, styleA: 'collaborating',
      b: { ar: 'أصلح الخلل داخلياً وأتجنب فتح الموضوع أصلاً.', en: 'I fix the flaw internally and avoid raising the topic at all.' }, styleB: 'avoiding'
    },
    {
      id: 8,
      q: { ar: 'في تفاوض مع مورد قوي، عرض عليك صيغة أقل مما تريد لكنها مقبولة جزئياً.', en: 'In a negotiation with a strong supplier, they offer less than you want but partially acceptable.' },
      a: { ar: 'أقبلها وأبني علاقة أفضل للمستقبل.', en: 'I accept and build a better relationship for the future.' }, styleA: 'accommodating',
      b: { ar: 'أطرح بديلاً ثالثاً يوسّع الخيارات قبل الرد.', en: 'I put a third option on the table widening choices before replying.' }, styleB: 'collaborating'
    },
    {
      id: 9,
      q: { ar: 'اجتماعان متزامنان: واحد لتأسيس شراكة جديدة وآخر لإنهاء خلاف قديم. تختار:', en: 'Two simultaneous meetings: one to found a new partnership, another to settle an old dispute. You pick:' },
      a: { ar: 'شراكة المستقبل — الخلاف القديم سيحل وحده.', en: 'The future partnership — the old dispute will settle itself.' }, styleA: 'avoiding',
      b: { ar: 'حسم الخلاف القديم أولاً — يستهلك طاقة الفريق يومياً.', en: 'Settling the old dispute first — it drains the team daily.' }, styleB: 'competing'
    },
    {
      id: 10,
      q: { ar: 'فريقك يختلف حول أولويات مشروع مشترك، والوقت ضيق.', en: 'Your team disagrees over shared-project priorities, time is short.' },
      a: { ar: 'أدير جلسة قصيرة نرتب فيها الأولويات بمعايير متفق عليها.', en: 'I run a short workshop ordering priorities by agreed standards.' }, styleA: 'collaborating',
      b: { ar: 'أعطي كل طرف جزءاً مما يريد ونمضي.', en: 'I give each side part of what they want and we move on.' }, styleB: 'compromising'
    },
    {
      id: 11,
      q: { ar: 'زميل جديد اقترح فكرة تلغي جزءاً من عملك القائم. ماذا تفعل؟', en: 'A new colleague proposed an idea cancelling part of your existing work. What do you do?' },
      a: { ar: 'أدعم الفكرة إن كانت أفضل للمؤسسة وأتطوع لتطبيقها معه.', en: 'I back the idea if better for the institution and volunteer to implement it with him.' }, styleA: 'collaborating',
      b: { ar: 'أستمع وأؤجل الرد حتى تنفصل المشاعر عن الموضوع.', en: 'I listen and postpone replying until feeling separates from substance.' }, styleB: 'avoiding'
    },
    {
      id: 12,
      q: { ar: 'أمام لجنة عليا، طُلب منك تنازل مؤلم مقابل وعد مستقبلي غامض.', en: 'Before a high committee, you\u2019re asked for a painful concession in exchange for a vague future promise.' },
      a: { ar: 'أشترط توثيق الوعد بمؤشرات ومواعيد قبل أي تنازل.', en: 'I condition the concession on documenting the promise with indicators and dates.' }, styleA: 'competing',
      b: { ar: 'أقبل بصورة جزئية وأحتفظ بجزء لجلسة قادمة.', en: 'I accept partially and keep a portion for a future session.' }, styleB: 'compromising'
    }
  ];

  const PROFILES = {
    competing: {
      ar: {
        strengths: ['حسم سريع عند القرارات الصعبة', 'وضوح الهدف وعدم تشتته', 'قدرة على تحمل الضغط العلني'],
        weaknesses: ['إجهاد العلاقات وتحويل الخلاف لصراع سلطة', 'تفويت خيارات المكسب المشترك', 'إخفاء معلومات الطرف الآخر لمصالحه'],
        advice: ['استخدم الحزم في الموضوع لا في الشخص', 'داخل جلساتك القادمة: اسأل عن مصالح الطرف الآخر قبل التصعيد', 'جرّب سيناريو «اللجنة الوطنية» لترويض الحسم الجماعي']
      },
      en: {
        strengths: ['Fast decisions on hard calls', 'Goal clarity without drift', 'Ability to carry public pressure'],
        weaknesses: ['Straining relationships into power struggle', 'Missing mutual-gain options', 'Counterparts hiding their interests from you'],
        advice: ['Direct firmness at substance, not person', 'In your next sessions: ask about the other side\u2019s interests before escalating', 'Try the “National committee” scenario to tame collective settlement']
      },
      recommend: ['budget', 'staffing']
    },
    collaborating: {
      ar: {
        strengths: ['بناء صيغ ترضي المصالح الحقيقية', 'كشف مصالح الأطراف بدل تخمينها', 'علاقات تدعم التعاون المستقبلي'],
        weaknesses: ['استثمار وقت طويل في ملفات بسيطة', 'خطر التحول لاسترضاء إن ضغط الوقت', 'قد يُقرأ ضعفاً أمام أسلوب منافس صريح'],
        advice: ['حافظ على التزامك بجدول زمني صريح داخل الجلسة', 'تدرّب على الإغلاق: صيغة، توثيق، موعد', 'جرّب سيناريو «عقد الصيانة» لاختبار حزمك تحت ضغط واقعي']
      },
      en: {
        strengths: ['Formulas satisfying real interests', 'Uncovering interests instead of guessing', 'Relationships supporting future cooperation'],
        weaknesses: ['Long time investment on simple files', 'Risk of drifting into appeasement under time pressure', 'May read as weakness to an openly competing style'],
        advice: ['Keep an explicit internal timetable in sessions', 'Train your closing: formula, documentation, date', 'Try the “Maintenance contract” scenario to test firmness under realistic pressure']
      },
      recommend: ['committee', 'schedule']
    },
    compromising: {
      ar: {
        strengths: ['سرعة الوصول لمنطقة اتفاق', 'واقعية تحترم قيود الوقت', 'إنصاف ظاهري يرضي الأطراف'],
        weaknesses: ['حلول نصفية تترك الطرفين نصف راضين', 'تفويت خيارات أفضل لا تظهر بالمساومة', 'قابلية التراجع المتكرر تحت الإصرار'],
        advice: ['قبل أي حل وسط: اسأل «ما المصلحة خلف الموقف؟» مرة واحدة على الأقل', 'جرّب عرض خيارين بدل تسوية واحدة', 'سيناريو «نظام الدوام» سيتحدى ميلك للتسوية المبكرة']
      },
      en: {
        strengths: ['Speed in reaching agreement zones', 'Realism respecting time constraints', 'Apparent fairness satisfying parties'],
        weaknesses: ['Half solutions leaving both sides half-satisfied', 'Missing better options haggling never reveals', 'Repeated retreat under insistence'],
        advice: ['Before any middle outcome: ask “what interest sits behind the position?” at least once', 'Try offering two options instead of one settlement', 'The “Flexible hours” scenario will challenge your early-settlement instinct']
      },
      recommend: ['schedule', 'citizen']
    },
    accommodating: {
      ar: {
        strengths: ['حفظ العلاقات وتهدئة التوتر', 'مرونة تُظهر احتراماً للأطراف', 'دعم قوي لثقافة التعاون'],
        weaknesses: ['تراكم الاستياء الصامت', 'ضعف موقفك المؤسسي أمام الأنظمة والمراجعة', 'دخول منطقة أقل من حدك الأدنى دون وعي'],
        advice: ['اكتب حدك الأدنى قبل الجلسة وتحقق منه قبل أي قبول', 'تدرّب على الرفض المحترم المشروط: «أستطيع قبول X بشرط Y»', 'سيناريو «الاعتماد المالي» سيتدربك على الحزم داخل القيود']
      },
      en: {
        strengths: ['Preserving relationships and calming tension', 'Flexibility showing respect to parties', 'Strong support for cooperation culture'],
        weaknesses: ['Silent resentment accumulating', 'Weak institutional standing before regulation and audit', 'Unconsciously entering below your minimum'],
        advice: ['Write your floor before the session and check it before any acceptance', 'Train respectful conditional refusal: “I can accept X on condition Y”', 'The “Budget allocation” scenario trains firmness within constraints']
      },
      recommend: ['budget', 'contractor']
    },
    avoiding: {
      ar: {
        strengths: ['خفض التوتر الحالي وتفادي القرارات المتسرعة', 'منح الوقت لجمع معلومات أفضل', 'تجنب التصعيد غير المنتج'],
        weaknesses: ['تكبر المشكلة وينكمش فضاء الحلول مع الوقت', 'قرارات تُحسم غيابياً ضدك', 'سمعة «متعذر الوصول لحسمه» تقلل وزنك التفاوضي'],
        advice: ['حدد موعداً صريحاً للعودة للموضوع — التجنب بلا موعد تفريط', 'ابدأ بجلسات قصيرة منخفضة المخاطر داخل المحاكاة', 'سيناريو «مستفيد غاضب» يتدربك على البقاء في الجلسة تحت الضغط']
      },
      en: {
        strengths: ['Lowering current tension and avoiding rushed decisions', 'Buying time to gather better information', 'Dodging unproductive escalation'],
        weaknesses: ['Problems grow while solution space shrinks with time', 'Decisions settled in your absence against you', 'A “hard to pin down” reputation lowers your negotiating weight'],
        advice: ['Set an explicit return date for the topic — avoidance without a date is neglect', 'Start with short, low-risk simulations', 'The “Angry beneficiary” scenario trains staying in the room under pressure']
      },
      recommend: ['citizen', 'staffing']
    }
  };

  function computeStyle(answers) {
    /* answers: array of 'a'|'b' parallel to QUESTIONS */
    const scores = {};
    STYLES.forEach(s => scores[s] = 0);
    QUESTIONS.forEach((q, i) => {
      const choice = answers[i];
      if (choice === 'a') scores[q.styleA]++;
      else if (choice === 'b') scores[q.styleB]++;
    });
    const sorted = STYLES.slice().sort((x, y) => scores[y] - scores[x]);
    return { dominant: sorted[0], secondary: sorted[1], scores };
  }

  return { QUESTIONS, PROFILES, STYLES, computeStyle };
});
