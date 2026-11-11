/* ============================================================
   Tafahum Platform — knowledge library (bilingual units)
   Short learning units built on principled negotiation,
   with public-administration examples + a self-check question.
   UMD module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFK = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UNITS = [
    {
      id: 'positions-interests', minutes: 4,
      title: { ar: 'المواقف مقابل المصالح', en: 'Positions vs interests' },
      intro: {
        ar: 'الموقف هو ما يطلبه الطرف الآخر؛ المصلحة هي سبب طلبه. أكثر التفاوضات تتعثر لأن الطرفين يتشابسان عند المواقف بينما الحل يقع عند المصالح.',
        en: 'A position is what the other side demands; an interest is why they demand it. Most negotiations stall because both sides lock on positions while the solution sits at interests.'
      },
      body: [
        {
          h: { ar: 'القاعدة', en: 'The rule' },
          p: [
            { ar: 'اسأل «لماذا يريدون هذا؟» و«لماذا يرفضون ذاك؟» — الإجابات هي المصالح، وهي عادة أوسع من الموقف المعلن.', en: 'Ask “why do they want this?” and “why do they refuse that?” — the answers are interests, usually broader than the declared position.' },
            { ar: 'المصالح تُقسم عادة: مصالح موضوعية (رقم، مدة، جودة) ومصالح علاقية (احترام، سمعة، أمان وظيفي) ومصالح نظامية (لوائح، مساءلة).', en: 'Interests usually divide into: substantive (number, time, quality), relational (respect, reputation, job security) and procedural (regulations, accountability).' }
          ]
        },
        {
          h: { ar: 'مثال من الإدارة العامة', en: 'Public-administration example' },
          p: [
            { ar: 'إدارة مالية ترفض زيادة اعتماد (موقف). السبب: خوف المدير من المساءلة أمام لجنة المراجعة (مصلحة نظامية). الحل: ربط الزيادة بمؤشرات موثقة يحتكم إليها المراجع — يلبي مصلحته النظامية ويمنحك طلبك.', en: 'A finance directorate rejects an allocation increase (position). The cause: the director\u2019s fear of audit-committee accountability (procedural interest). The fix: tie the increase to documented KPIs the auditor can defer to — satisfies the procedural interest and grants your request.' }
          ]
        }
      ],
      key: [
        { ar: 'الموقف ما يقوله الطرف؛ المصلحة سبب قوله.', en: 'A position is what they say; an interest is why they say it.' },
        { ar: 'لكل موقف متشدد مصالح قابلة للإشباع بطرق أخرى.', en: 'Behind every rigid position sit interests satisfiable other ways.' },
        { ar: 'السؤال «لماذا؟» أقوى أداة في التفاوض الحكومي.', en: 'The question “why?” is the strongest tool in government negotiation.' }
      ],
      quiz: {
        q: { ar: 'مدير إدارة يصر على رفض طلبكم. ما الخطوة الأولى وفق منهج المصالح؟', en: 'A director insists on rejecting your request. What is the first step under the interests approach?' },
        options: [
          { ar: 'أعرض بديلاً رقمياً أقل من طلبي', en: 'Offer a numerically lower alternative' },
          { ar: 'أسأل ما القلق النظامي أو العملي خلف الرفض', en: 'Ask what procedural or practical concern drives the refusal' },
          { ar: 'أرفع الموضوع لمرؤوسه الأعلى', en: 'Escalate to his superior' }
        ],
        correct: 1,
        why: { ar: 'الرفض المعلن موقف؛ المصالح خلفه هي ما سيفتح منطقة الحل — الخياران الآخران يصلّبان الموقف أو يفتحان صراع سلطة.', en: 'The declared refusal is a position; the interests behind it open the solution zone — the other two either harden it or open a power struggle.' }
      }
    },
    {
      id: 'batna', minutes: 5,
      title: { ar: 'بديلك إن لم تتفق (BATNA)', en: 'Your alternative if no deal (BATNA)' },
      intro: {
        ar: 'أفضل بديل للاتفاق المتفاوض عليه هو ما ستفعله فعلاً إذا فشل التفاوض. به تُقاس جدوى أي عرض على الطاولة — وأي اتفاق أقل من بديلك قرار خاطئ مهما كان «ودياً».',
        en: 'Your best alternative to a negotiated agreement is what you\u2019ll actually do if negotiation fails. Any offer on the table is measured against it — and any deal below your alternative is a wrong decision no matter how “friendly” it feels.'
      },
      body: [
        {
          h: { ar: 'كيف تبني بديلك', en: 'How to build your alternative' },
          p: [
            { ar: 'قبل الجلسة اكتب ثلاثة مسارات بديلة لو انهار التفاوض، قوّ كل مسار (قوته، كلفته، زمنه)، واختر الأقوى كبديلك الرسمي.', en: 'Before the session, write three fallback paths if talks collapse, rate each (strength, cost, time), and pick the strongest as your official alternative.' },
            { ar: 'اكتب أيضاً «حدك الأدنى»: أقل صيغة تقبلها دون أن تكون أردأ من بديلك. القبول تحت الحد قرار بالانسحاب الواعي لا التسليم.', en: 'Also write your “floor”: the least formula you accept without being worse than your alternative. Accepting below the floor is a deliberate walk-away decision, not surrender.' }
          ]
        },
        {
          h: { ar: 'البديل في القطاع العام', en: 'The alternative in the public sector' },
          p: [
            { ar: 'بديلك كموظف عام ليس دائماً «اتفاقاً مع طرف آخر» — قد يكون: خطة تقنين، تصعيد نظامي موثق، أو قرار تأجيل مسؤول. المهم أن تعرف قوته الحقيقية لا المفترضة.', en: 'Your alternative as a civil servant isn\u2019t always “a deal with someone else” — it may be: a rationing plan, a documented procedural escalation, or a responsible postponement. What matters is knowing its true, not assumed, strength.' },
            { ar: 'لا تلوّح ببديلك كتهديد؛ اذكره مرة واحدة بهدوء مسنداً لمعيار. التهديد يصلّب، والذكر الهادئ يعدّل حسابات الطرف الآخر.', en: 'Never wave your alternative as a threat; state it once, calmly, anchored to a standard. Threats harden; calm statements recalibrate the other side\u2019s math.' }
          ]
        }
      ],
      key: [
        { ar: 'BATNA هو المسار الأقوى خارج الطاولة، لا أي خيار.', en: 'BATNA is the strongest path off the table, not any option.' },
        { ar: 'اكتب حدك الأدنى قبل الجلسة ودوّنه أمامك.', en: 'Write your floor before the session and keep it in front of you.' },
        { ar: 'الاتفاق أقل من بديلك = قرار خاطئ.', en: 'A deal below your alternative = a wrong decision.' }
      ],
      quiz: {
        q: { ar: 'بديلك قوي جداً هذه المرة. ما التصرف الأصح داخل الجلسة؟', en: 'Your alternative is very strong this time. What is the correct in-session move?' },
        options: [
          { ar: 'أصرح به أول جولة وأهدد بالانسحاب', en: 'Declare it in round one and threaten to walk' },
          { ar: 'أحتفظ به معلوماً لي وأذكره مرة بهدوء عند الحاجة', en: 'Keep it known to myself and state it once, calmly, if needed' },
          { ar: 'أخفيه تماماً حتى آخر لحظة', en: 'Hide it entirely until the last moment' }
        ],
        correct: 1,
        why: { ar: 'التهديد المبكر يكسر الثقة ويصلّب الموقف؛ الإخفاء التام يفوّت عليك تعديل حساباتهم. الذكر الهادي المسند لمعيار هو الاستخدام الأمثل.', en: 'Early threats break trust and harden positions; full hiding forfeits recalibrating their math. Calm standard-anchored mention is optimal use.' }
      }
    },
    {
      id: 'mutual-gain', minutes: 4,
      title: { ar: 'ابتكار خيارات للمكسب المشترك', en: 'Inventing options for mutual gain' },
      intro: {
        ar: 'المساومة تفترض كعكة ثابتة الحجم؛ التفاوض الذكي يوسّع الكعكة قبل تقسيمها. الخيارات المبتكرة تظهر حين تفصل الاختراع عن الحكم.',
        en: 'Haggling assumes a fixed pie; smart negotiation grows the pie before dividing it. Creative options appear when you separate inventing from judging.'
      },
      body: [
        {
          h: { ar: 'أربع أدوات توسيع', en: 'Four widening tools' },
          p: [
            { ar: 'التجزئة الزمنية (مرحلية)، الربط بمؤشرات، تبادل بين أولويات مختلفة («أنت يهمك الزمن وأنا يهمني السعر»)، وتوسيع نطاق الاتفاق ليشمل بنوداً مرتبطة.', en: 'Time-slicing (phasing), indicator linkage, trading across different priorities (“time matters to you, price to me”), and broadening the deal to include adjacent items.' }
          ]
        },
        {
          h: { ar: 'قاعدة الجلسة', en: 'The session rule' },
          p: [
            { ar: 'قبل طرح أي رقم نهائي، اعرض خيارين أو أكثر بصيغة «ما رأيك لو...». كثرة الخيارات على الطاولة تقلل شعور الطرف الآخر بأنه محاصر.', en: 'Before any final number, offer two or more options phrased as “what if we...”. Many options on the table reduce the other side\u2019s sense of being cornered.' },
            { ar: 'في الإدارة العامة: الحزم الإبداعية (مرحلية + مؤشرات + وفر تشغيلي) تمر عبر المساءلة أسهل من التوسيع المباشر للأرقام.', en: 'In public administration: creative bundles (phasing + KPIs + operational savings) pass accountability more easily than direct number increases.' }
          ]
        }
      ],
      key: [
        { ar: 'افصل اختراع الخيارات عن تقييمها داخل الجلسة.', en: 'Separate option invention from option judging in-session.' },
        { ar: 'عرض خيارين يتفوق دائماً على عرض رقم واحد.', en: 'Offering two options always beats offering one number.' },
        { ar: 'الحزم المبتكرة تعبر قيود المساءلة أفضل من الأرقام المجردة.', en: 'Creative bundles cross accountability constraints better than bare numbers.' }
      ],
      quiz: {
        q: { ar: 'مقابلك متمسك بسقف ميزانية. ما الأقرب لخيار مكسب مشترك؟', en: 'Your counterpart is bound to a budget ceiling. Which is closest to a mutual-gain option?' },
        options: [
          { ar: 'زيادة أقل من طلبي كتسوية', en: 'A smaller increase as settlement' },
          { ar: 'زيادة مرحلية مرتبطة بمؤشرات أداء موثقة', en: 'A phased increase tied to documented KPIs' },
          { ar: 'طلب دعم من جهة أعلى لكسر السقف', en: 'Seeking higher support to break the ceiling' }
        ],
        correct: 1,
        why: { ar: 'الحل المرحلي بالمؤشرات يحمي مصلحته النظامية (المساءلة) ويمنحك هدفك تدريجياً — مكسب حقيقي للطرفين. التسوية نصف رضا، والتصعيد صراع سلطة.', en: 'The KPI-phased formula protects their procedural interest (accountability) and grants your goal gradually — real mutual gain. Settlement is half-satisfaction; escalation is power struggle.' }
      }
    },
    {
      id: 'objective-criteria', minutes: 4,
      title: { ar: 'المعايير الموضوعية', en: 'Objective criteria' },
      intro: {
        ar: 'الضغط يقابل بضغط مضاد؛ المعيار الموضوعي يقابل بقبول. المعايير تحمي الطرفين من المساءلة وتمنح التنازلات غطاءً نظامياً.',
        en: 'Pressure is met with counter-pressure; an objective standard is met with acceptance. Standards protect both sides from accountability and give concessions procedural cover.'
      },
      body: [
        {
          h: { ar: 'من أين تأتي المعايير', en: 'Where standards come from' },
          p: [
            { ar: 'اللوائح والقرارات المنظمة، متوسط الإنفاق/الأسعار على الحالات المماثلة، تقارير المراجعة، آراء خبراء محايدين، والسوابق الموثقة.', en: 'Governing regulations and decisions, spending/price averages for comparable cases, audit reports, neutral expert opinions, and documented precedents.' }
          ]
        },
        {
          h: { ar: 'كيف تستخدمها في الجلسة', en: 'How to use them in-session' },
          p: [
            { ar: 'اربط كل طلب بمعيار («وفق متوسط الحالات المماثلة...»)، واطلب من الطرف الآخر معياره («ما المعيار الذي تستندون إليه؟») — تحويل النقاش من إرادة إلى مرجعية.', en: 'Tie each request to a standard (“per the comparable-case average...”), and ask the other side for theirs (“which standard do you rely on?”) — converting the talk from wills to references.' },
            { ar: 'لا تنتصر بالمعيار فقط — عامل معيار الطرف الآخر باحترام مماثل، فهذا هو المبدأ الناظم لا سلاحاً أحادياً.', en: 'Don\u2019t merely win by standard — treat their standard with equal respect; it\u2019s a governing principle, not a one-sided weapon.' }
          ]
        }
      ],
      key: [
        { ar: 'المعيار الموضوعي غطاء نظامي للتنازل لا سلاح إذلال.', en: 'An objective standard is procedural cover for concession, not a humiliation weapon.' },
        { ar: 'اسأل عن معيارهم قبل أن تصر على معيارك.', en: 'Ask for their standard before insisting on yours.' },
        { ar: 'المساءلة الحكومية تجعل المعايير حليفك الأقوى.', en: 'Public-sector accountability makes standards your strongest ally.' }
      ],
      quiz: {
        q: { ar: 'المورد يطلب زيادة 20%. ما الاستخدام الأمثل للمعايير؟', en: 'A supplier demands a 20% increase. What\u2019s optimal use of criteria?' },
        options: [
          { ar: 'أقول له إن طلبه مبالغ فيه وغير مقبول', en: 'Tell him the request is exaggerated and unacceptable' },
          { ar: 'أطلب منه مستندات أسعار موثقة وأحتكم لمؤشر السوق المعتمد', en: 'Ask for documented price evidence and defer to the approved market index' },
          { ar: 'أعرض 10% مباشرة كتسوية', en: 'Offer 10% directly as settlement' }
        ],
        correct: 1,
        why: { ar: 'المستندات والمؤشر تحول النقاش من إرادة إلى مرجعية، وتحمي قرارك أمام المراجعة — وغالباً ما يكشف الفحص أن الزيادة الحقيقية أقل.', en: 'Evidence and the index convert the talk from wills to references and protect your decision in audit — and examination often reveals the real increase is smaller.' }
      }
    },
    {
      id: 'people-problem', minutes: 4,
      title: { ar: 'افصل الناس عن المشكلة', en: 'Separate people from the problem' },
      intro: {
        ar: 'الانفعال ليس خصماً في التفاوض بل عنصراً فيه. حين يختلط الشخص بالموضوع، يتحول كل خلاف فني إلى صراع كرامة.',
        en: 'Emotion isn\u2019t an enemy of negotiation but an element in it. When person mixes with problem, every technical disagreement becomes a struggle over dignity.'
      },
      body: [
        {
          h: { ar: 'ثلاث ممارسات', en: 'Three practices' },
          p: [
            { ar: 'الاعتراف قبل الرد («أقدّر ظروفكم...»)، الرد على المضمون لا النبرة، ووصف المشكلة بصيغة محايدة مشتركة («المشكلة أمامنا: كيف نحمي الخدمة والسقف معاً؟»).', en: 'Acknowledge before replying (“I appreciate your situation...”), reply to substance not tone, and describe the problem in a shared neutral frame (“the problem before us: how do we protect both service and ceiling?”).' },
            { ar: 'الاعتذار عند الخطأ الإجرائي ليس ضعفاً — هو أسرع أداة لتفكيك الغضب العام.', en: 'Apologising for a procedural error isn\u2019t weakness — it\u2019s the fastest tool for dismantling public anger.' }
          ]
        }
      ],
      key: [
        { ar: 'الاعتراف بالمشاعر يفكك نصف التصعيد.', en: 'Acknowledging feelings disarms half the escalation.' },
        { ar: 'ردّ على المضمون، لا على النبرة أبداً.', en: 'Reply to substance, never to tone.' },
        { ar: 'صيغ المشكلة المحايدة المشتركة تحيد الكرامة.', en: 'Shared neutral problem-framing neutralises dignity.' }
      ],
      quiz: {
        q: { ar: 'مواطن غاضب بصوت عالٍ يقول «أنتم تتلاعبون بنا». أول رد أَوْلى؟', en: 'An angry citizen says loudly “you people are playing with us”. Best first reply?' },
        options: [
          { ar: '«ل ن نحن نتلاعب، هذه إجراءات نظامية»', en: '\u201CWe are not playing; these are procedures\u201D' },
          { ar: '«سيدى اهدأ من فضلك»', en: '\u201CSir, please calm down\u201D' },
          { ar: '«أقدّر غضبك، ثلاث زيارات لموقف واحد شيء مُرّ حقاً. دعني أفهم ما حدث بالضبط»', en: '\u201CI appreciate your anger; three visits for one matter is truly bitter. Let me understand exactly what happened\u201D' }
        ],
        correct: 2,
        why: { ar: 'الاعتراف بالشعور ثم الطلب المحدد (ما حدث بالضبط) يفكك التصعيد ويعيد الجلسة إلى مسار حل. الدفاع والتهدئة المباشرة يزيدان الغضب.', en: 'Acknowledging the feeling then asking specifically (what exactly happened) disarms escalation and restores a resolution path. Defence and direct calming both raise anger.' }
      }
    },
    {
      id: 'active-listening', minutes: 4,
      title: { ar: 'الإصغاء الفعّال', en: 'Active listening' },
      intro: {
        ar: 'الإصغاء الفعّال ليس صمتاً مهذباً — هو هندسة الفهم: أسئلة متابعة، إعادة صياغة، وتأكيد قبل الرد.',
        en: 'Active listening isn\u2019t polite silence — it\u2019s engineering of understanding: follow-up questions, restating, and confirming before replying.'
      },
      body: [
        {
          h: { ar: 'التقنيات', en: 'The techniques' },
          p: [
            { ar: 'إعادة الصياغة («إذن قلقكم الأساسي هو... أصبت؟») تكشف سوء الفهم قبل أن يتحول لخلاف. أسئلة المتابعة المفتوحة («ما الذي يعنيه ذلك عملياً؟») تفتح معلومات لم يصرّح بها الطرف الآخر.', en: 'Restating (“so your core worry is... correct?”) exposes misunderstanding before it becomes conflict. Open follow-ups (“what does that mean practically?”) surface information the other side hadn\u2019t declared.' },
            { ar: 'قاعدة عملية: لكل جملتين من الطرف الآخر، سؤال متابعة واحد على الأقل.', en: 'A working rule: for every two sentences from the other side, at least one follow-up question.' }
          ]
        }
      ],
      key: [
        { ar: 'أعد الصياغة وتأكد قبل أي رد جوهري.', en: 'Restate and confirm before any substantive reply.' },
        { ar: 'الأسئلة المفتوحة (ما/كيف/لماذا) تفتح ما لم يصرح به.', en: 'Open questions (what/how/why) surface the undeclared.' },
        { ar: 'الإصغاء استثمار معلوماتي لا مجاملة.', en: 'Listening is an information investment, not courtesy.' }
      ],
      quiz: {
        q: { ar: 'قال لك المدير المالي: «أي تجاوز للسقف يعرّضني للمساءلة». ما رد الإصغاء الأصح؟', en: 'The finance director says: “any ceiling breach exposes me to accountability.” Which is the correct listening reply?' },
        options: [
          { ar: '«السقف قابل للمراجعة وستتم الزيادة»', en: '\u201CThe ceiling can be reviewed; the increase will happen\u201D' },
          { ar: '«إذن أنت قلق من المساءلة أمام لجنة المراجعة تحديداً؟»', en: '\u201CSo you\u2019re worried about audit-committee accountability specifically?\u201D' },
          { ar: '«سآخذ ذلك في الحسبان» ثم أتابع موضوعي', en: '\u201CI\u2019ll take that into account\u201D then continue my agenda' }
        ],
        correct: 1,
        why: { ar: 'إعادة الصياغة والتأكيد تكشف مصلحته النظامية الحقيقية وتبني الثقة — وبها تعرف أن مفتاح الحل هو التوثيق والمؤشرات.', en: 'Restating and confirming reveals the true procedural interest and builds trust — through it you learn the solution key is documentation and indicators.' }
      }
    },
    {
      id: 'reframing', minutes: 4,
      title: { ar: 'إعادة صياغة الخلاف', en: 'Reframing the conflict' },
      intro: {
        ar: 'إعادة الصياغة تقلب الخلاف من «أنا ضدك» إلى «نحن أمام مشكلة مشتركة». أداتها: تحويل الرفض والمواقف إلى أسئلة مشتركة قابلة للحل.',
        en: 'Reframing flips the conflict from “me against you” to “us facing a shared problem”. Its tool: converting refusals and positions into solvable shared questions.'
      },
      body: [
        {
          h: { ar: 'صيغة عملية', en: 'A working formula' },
          p: [
            { ar: '«أنت ترفض الزيادة» ← «كيف نحمي الخدمة والسقف معاً؟». «مطلبك مبالغ فيه» ← «ما المعيار الذي نحتكم له معاً في تقدير هذا البند؟». الهجوم يتحول لسؤال، والصراع لورشة.', en: '\u201CYou reject the increase\u201D \u2192 \u201Chow do we protect both service and ceiling?\u201D. \u201CYour demand is inflated\u201D \u2192 \u201CWhich standard shall we jointly defer to in assessing this item?\u201D. Attack becomes question; conflict becomes workshop.' }
          ]
        }
      ],
      key: [
        { ar: 'حوّل كل رفض تسمعه إلى سؤال مشترك بصوت عالٍ.', en: 'Convert every refusal you hear into a spoken shared question.' },
        { ar: 'الصيغة المشتركة تُبنى بكلمات «نحن/معاً» لا «أنا/أنت».', en: 'The shared frame is built with “we/together” words, not “I/you”.' }
      ],
      quiz: {
        q: { ar: 'قال لك مقاول: «لن أستمر بخسارة». ما إعادة الصياغة الأصح؟', en: 'A contractor says: “I won\u2019t continue at a loss.” Which reframing is right?' },
        options: [
          { ar: '«الخسارة والربح مسؤوليتك أنت»', en: '\u201CLoss and profit are your responsibility\u201D' },
          { ar: '«إذن المشكلة المشتركة أمامنا: كيف نغطي كلفة حقيقية موثقة دون كسر المخصص؟»', en: '\u201CSo the shared problem before us: how do we cover a documented real cost without breaking the allocation?\u201D' },
          { ar: '«سأدرس طلبك» وأتابع', en: '\u201CI\u2019ll study your request\u201D and move on' }
        ],
        correct: 1,
        why: { ar: 'إعادة الصياغة حوّلت موقفاً ثنائياً إلى مشكلة مشتركة بمعيارين (التوثيق والمخصص) — هذا هو جوهر المهارة.', en: 'The reframing turned a binary position into a shared problem with two standards (documentation and allocation) — the essence of the skill.' }
      }
    },
    {
      id: 'facilitation', minutes: 4,
      title: { ar: 'تيسير الجلسة', en: 'Facilitating the session' },
      intro: {
        ar: 'الجلسة بلا تيسير تجري صاحبها: تفرّغ طاقة في نقاط فرعية وتنتهي بلا توثيق. الميسّر الذكي يرتب الأجندة، يجمع التقدم في تلخيصات، ويدفع نحو الإغلاق.',
        en: 'An unfacilitated session runs its holder: energy drains into side points and it ends undocumented. The smart facilitator orders the agenda, gathers progress into summaries, and drives toward closure.'
      },
      body: [
        {
          h: { ar: 'أدوات التيسير', en: 'Facilitation tools' },
          p: [
            { ar: 'افتتاح بترتيب النقاط («أقترح: أولاً القيود، ثانياً الصيغ، ثالثاً التوثيق»)، تلخيص كل ثلاث جولات («وصلنا حتى الآن إلى...، وبقي...»)، وإغلاق بمحضر: ما اتُّفق، ما تبقى، من المسؤول، ومتى المراجعة.', en: 'Open by ordering points (“I suggest: first constraints, second formulas, third documentation”), summarise every three rounds (“we\u2019ve reached...; remaining is...”), and close with minutes: agreed, remaining, owner, review date.' },
            { ar: 'التيسير ليس سلباً لقيادة الجلسة من الطرف الآخر — بل إطار يلتقيان داخله بكرامة.', en: 'Facilitation isn\u2019t stealing the session\u2019s leadership from the other side — it\u2019s a frame you both meet inside, with dignity.' }
          ]
        }
      ],
      key: [
        { ar: 'رتب النقاط صراحة في أول دقيقة.', en: 'Order the points explicitly in the first minute.' },
        { ar: 'لخّص كل ثلاث جولات لتثبيت المكاسب.', en: 'Summarise every three rounds to bank gains.' },
        { ar: 'الإغلاق توثيق لا وداع.', en: 'Closure is documentation, not farewell.' }
      ],
      quiz: {
        q: { ar: 'الجلسة في جولتها الثامنة وتتفرع النقاط. ما الخطوة التيسيرية الأصح؟', en: 'The session is in round eight and points are branching. The right facilitation step?' },
        options: [
          { ar: 'أدع النقاش يسير خشية القطع', en: 'Let the discussion flow, fearing interruption' },
          { ar: 'ألخص المتفق عليه وأرتب المتبقي في نقطتين محددتين', en: 'Summarise what\u2019s agreed and order the remainder into two specific points' },
          { ar: 'أعرض حسماً سريعاً للنقطة الخلافية', en: 'Push a quick settlement of the disputed point' }
        ],
        correct: 1,
        why: { ar: 'التلخيص والترتيب يجمعان الطاقة في المسار ويكشفان نقطة الخلاف الفعلية — أسرع طريق للنتيجة الموثقة.', en: 'Summarising and ordering focus energy on the path and expose the actual point of dispute — the fastest route to a documented result.' }
      }
    }
  ];

  function getUnit(id) { return UNITS.find(u => u.id === id) || null; }

  return { UNITS, getUnit };
});
