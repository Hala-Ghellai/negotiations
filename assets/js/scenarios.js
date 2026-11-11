/* ============================================================
   Tafahum Platform — scenario library (bilingual)
   Each scenario follows the principled-negotiation structure:
   positions (dimensions), interests, BATNA hints, expert path,
   and a topic SWOT (levers of YOUR position in this file).
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CRITERIA_DEFAULT = { prep: 1, interests: 1, listening: 1, options: 1, criteria: 1, relationship: 1, outcome: 1 };

  /* personalities: rigidity 0..1, trustGrowth, aggressionSensitivity, rapportSensitivity, criteriaRespect */
  const PERSONALITIES = {
    guardian:   { rigidity: 0.78, trustGrowth: 0.9,  aggressionSensitivity: 1.35, rapportSensitivity: 1.0, criteriaRespect: 1.6 },
    pragmatic:  { rigidity: 0.55, trustGrowth: 1.25, aggressionSensitivity: 1.0,  rapportSensitivity: 1.3, criteriaRespect: 1.2 },
    pressured:  { rigidity: 0.62, trustGrowth: 1.05, aggressionSensitivity: 1.7,  rapportSensitivity: 1.4, criteriaRespect: 0.9 },
    collaborative: { rigidity: 0.42, trustGrowth: 1.5, aggressionSensitivity: 0.8, rapportSensitivity: 1.6, criteriaRespect: 1.3 }
  };

  const SCENARIOS = [
    /* ---------------------------------------------------------- 1 */
    {
      id: 'budget',
      difficulty: 2,
      tags: ['negotiation', 'internal'],
      minutes: 18,
      personality: 'guardian',
      title: { ar: 'زيادة الاعتماد المالي', en: 'The budget allocation increase' },
      summary: {
        ar: 'إدارة خدمية تحتاج زيادة اعتمادها المالي بعد ارتفاع الطلب على خدماتها، وإدارة الشؤون المالية ملتزمة بسقف الميزانية.',
        en: 'A service directorate needs a bigger allocation after demand for its services surged, while Finance is bound to the budget ceiling.'
      },
      context: {
        ar: 'ترتفع أعداد المستفيدين من خدماتكم منذ ثمانية أشهر بنسبة 40% تقريباً، وبدأت أزمة انتظار تهدد جودة الخدمة. طلتم من إدارة الشؤون المالية زيادة الاعتماد المالي بنسبة 25% حتى نهاية السنة. الإدارة تلتزم بسقف الميزانية المعتمد من مجلس الإدارة، وأي تجاوز يحتاج مسوّغات معيارية قوية وتصعيداً للجنة المالية.',
        en: 'Beneficiary numbers at your services have grown about 40% over eight months, and a waiting crisis now threatens service quality. You asked Finance for a 25% increase in this year\u2019s allocation. Finance is bound to the board-approved budget ceiling; any breach requires strong standards-based justification and escalation to the Finance Committee.'
      },
      traineeRole: {
        title: { ar: 'مدير الإدارة الخدمية', en: 'Director of the service directorate' },
        brief: {
          ar: 'هدفك: اتفاق يحفظ استمرار الخدمة ويحترم القيود النظامية — زيادة اعتماد لا تقل عن 12%، وتثبيت مستوى الخدمة. بديلك إن لم يتحقق اتفاق: خطة تقنين صارمة تقلل الخدمة وتؤثر على تقييمكم السنوي.',
          en: 'Your goal: an agreement that keeps services running and respects the regulatory constraints — an increase of at least 12%, with service levels preserved. Your alternative if no deal: a strict rationing plan that shrinks service and hurts your annual evaluation.'
        }
      },
      counterpart: {
        name: { ar: 'أ. سامي الفيتوري', en: 'Mr. Sami Fituri' },
        title: { ar: 'مدير إدارة الشؤون المالية', en: 'Director of Finance' },
        opening: {
          ar: 'أهلاً بك. قرأت طلبكم بشأن زيادة الاعتماد. لأكون صريحاً معك من البداية: السقف المعتمد من مجلس الإدارة لا يسمح بزيادة تتجاوز 5% في أحسن الأحوال، والالتزام بالسقف مسؤولية شخصية عليّ. قبل أن نصل إلى الأرقام، ما الذي جعل الوضع حرجاً بهذه السرعة؟',
          en: 'Welcome. I\u2019ve read your request for the increase. To be frank from the start: the board-approved ceiling allows at most a 5% increase, and holding that ceiling is a personal responsibility of mine. Before we get to numbers, what made the situation escalate this quickly?'
        },
        constraint: {
          ar: 'سقف الميزانية المعتمد من مجلس الإدارة',
          en: 'the board-approved budget ceiling'
        },
        interests: [
          { id: 'ceiling', weight: 3, revealAtTrust: 40,
            text: { ar: 'أي تجاوز للسقف يعرّضني لمساءلة أمام لجنة المالية والمراجعة الداخلية.', en: 'Any breach of the ceiling exposes me to accountability before the Finance Committee and internal audit.' } },
          { id: 'evidence', weight: 2, revealAtTrust: 55,
            text: { ar: 'أستطيع الدفاع عن زيادة استثنائية إذا وُجدت مؤشرات أداء موثّقة تربط الصرف بنتائج خدمية واضحة.', en: 'I can defend an exceptional increase if there are documented KPIs linking spending to clear service outcomes.' } },
          { id: 'recurrent', weight: 2, revealAtTrust: 70,
            text: { ar: 'أخشى فتح باب اعتمادات إضافية متكررة لكل إدارة؛ الحل يجب أن يكون استثنائياً ومؤطراً بزمن.', en: 'I fear opening the door to recurring supplementary allocations for every directorate; the solution must be exceptional and time-boxed.' } }
        ]
      },
      dimensions: [
        { id: 'increase', label: { ar: 'نسبة الزيادة على الاعتماد', en: 'Increase on the allocation' }, unit: '%',
          direction: 'more', userGoal: 25, userFloor: 12, cpStart: 5, cpFloor: 13 },
        { id: 'phasing', label: { ar: 'التجزئة على دفعات (شهور)', en: 'Phasing across months' }, unit: 'mo',
          direction: 'less', userGoal: 1, userFloor: 6, cpStart: 12, cpFloor: 5 }
      ],
      packages: [
        { id: 'phased', signals: ['مرحل', 'تدريج', 'دفعات', 'على مراحل', 'phased', 'stages', 'installments'],
          label: { ar: 'زيادة مرحلية مرتبطة بمراجعة', en: 'Phased increase tied to review' } },
        { id: 'kpi', signals: ['مؤشر', 'أداء', 'قياس', 'نتائج', 'kpi', 'indicator', 'measurable'],
          label: { ar: 'زيادة مرتبطة بمؤشرات أداء', en: 'KPI-linked increase' } },
        { id: 'efficiency', signals: ['ترشيد', 'كفاءة', 'وفر', 'إعادة توزيع', 'efficien', 'saving', 'reallocat'],
          label: { ar: 'وفر تشغيلي يعوّض جزءاً من الزيادة', en: 'Operational savings offsetting part of the increase' } }
      ],
      objectives: {
        ar: ['زيادة اعتماد تحفظ استمرار الخدمة', 'إطار زمني واضح للصرف', 'مسوّغات معيارية تحمي الطرفين من المساءلة'],
        en: ['An allocation increase that keeps services running', 'A clear spending timeframe', 'Standards-based justification protecting both sides from accountability']
      },
      expertPath: {
        strategy: {
          ar: 'لا تصارع السقف كموقف — حوّل الحوار إلى سؤال مشترك: كيف نحمي الخدمة والسقف معاً؟ استكشف مخاوف المساءلة لدى المدير المالي، ثم اعرض حزمة: زيادة مرحلية مرتبطة بمؤشرات أداء موثّقة، مع وفر تشغيلي يعوّض جزءاً. اربط كل بند بمعيار (متوسط الإنفاق على الخدمات المماثلة، تقارير المراجعة) لا بالضغط.',
          en: 'Don\u2019t fight the ceiling as a position — reframe into a joint question: how do we protect both the service and the ceiling? Explore the Finance Director\u2019s accountability fears, then offer a package: a phased increase tied to documented KPIs, with operational savings offsetting part of it. Anchor each element to a standard (comparable-service spending averages, audit reports), not to pressure.'
        },
        moves: [
          { ar: 'افتح ببيانات الطلب (40%) وربطها بمؤشر الخدمة، لا بالحاجة.', en: 'Open with demand data (40%) linked to the service indicator, not with need.' },
          { ar: 'اسأل مباشرة: «ما الذي يحميك نظامياً عند أي تجاوز للسقف؟» — سيكشف لك معيار المؤشرات.', en: 'Ask directly: “What protects you procedurally in any ceiling breach?” — it reveals the KPI standard.' },
          { ar: 'اعرض حزمة (مرحلية + مؤشرات + وفر) قبل التراجع عن نسبة الزيادة.', en: 'Present a package (phasing + KPIs + savings) before retreating on the increase percentage.' },
          { ar: 'اقبل تثبيت أي زيادة بموجب محضر موثّق يحمي الطرفين.', en: 'Accept anchoring any increase in a documented memo that protects both sides.' }
        ],
        avoid: [
          { ar: 'التهديد بالتصعيد للإدارة العليا في الجولات الأولى — يصلب الموقف ويكسر الثقة.', en: 'Threatening escalation to top management in early rounds — it hardens the position and breaks trust.' },
          { ar: 'المطالبة بكامل الـ25% ككتلة واحدة دون مسوّغ معياري.', en: 'Demanding the full 25% as one block without a standards-based justification.' }
        ]
      },
      topicSWOT: {
        strengths: [
          { ar: 'بيانات موثّقة عن ارتفاع الطلب (40%) تسند طلبك بمعيار موضوعي.', en: 'Documented data on the demand surge (40%) anchors your request objectively.' },
          { ar: 'تدهور الخدمة يهدد مؤشرات تخص الإدارة المالية أيضاً إن اتسع الانتظار.', en: 'Service decline threatens indicators Finance also owns if waiting grows.' },
          { ar: 'الحلول الإبداعية (المرحلية والمؤشرات والوفر) متوفرة ومتاحة داخل القيود.', en: 'Creative solutions (phasing, KPIs, savings) are available within the constraints.' }
        ],
        weaknesses: [
          { ar: 'سقف الميزانية صادر عن مجلس أعلى — الطرف الآخر لا يملك كسره وحده.', en: 'The ceiling is issued by a higher board — the other side cannot break it alone.' },
          { ar: 'بديلك خارج الاتفاق (التقنين) ضعيف ويؤذي تقييمك — قوة تفاوضية منخفضة.', en: 'Your outside alternative (rationing) is weak and hurts your evaluation — low negotiating power.' },
          { ar: 'الطلب جاء متأخراً؛ الميزانية في منتصف السنة تقلل المرونة.', en: 'The request came late; a mid-year budget leaves less flexibility.' }
        ]
      }
    },

    /* ---------------------------------------------------------- 2 */
    {
      id: 'contractor',
      difficulty: 3,
      tags: ['negotiation'],
      minutes: 20,
      personality: 'pressured',
      title: { ar: 'عقد الصيانة الطارئة', en: 'The emergency maintenance contract' },
      summary: {
        ar: 'مقاول ينفذ عقد صيانة لمرفق حكومي يطلب تمديد المهلة 30 يوماً وزيادة 15% على قيمة العقد، وأنت تريد إنجاز الأعمال في الوقت المتفق عليه دون تجاوز مخصصات العقد.',
        en: 'A contractor executing a maintenance contract for a government facility asks for a 30-day extension and a 15% price increase; you need the works finished on time within the contract allocation.'
      },
      context: {
        ar: 'المقاول أبلغكم عن تأخر وصول مواد مخصصة للمشروع وارتفاع أسعارها بعد التعاقد، وطلب تمديد المهلة 30 يوماً وزيادة 15%. التأخير يعطل تشغيل المرفق الذي يخدم المواطنين، وأي زيادة تحتاج مسوّغاً تعاقدياً (بنود القوة القاهرة أو آلية تسوية الأسعار في العقد). لديك غرامة تأخير تعاقدية، لكن تطبيقها قد يدفع المقاول للانسحاب وهو أفضل مقاول متاح في المنطقة.',
        en: 'The contractor reported delayed delivery of project materials and post-contract price rises, requesting a 30-day extension and a 15% increase. Delay stalls the citizen-facing facility, and any increase needs a contractual basis (force-majeure clauses or the price-adjustment mechanism). You hold contractual delay penalties, but enforcing them may push the contractor to quit — and they are the best available contractor in the region.'
      },
      traineeRole: {
        title: { ar: 'مدير إدارة المشاريع', en: 'Director of Projects' },
        brief: {
          ar: 'هدفك: إنجاز الأعمال خلال 12 يوماً إضافية كحد أقصى وبزيادة لا تتجاوز 8%، مع حماية العلاقة التعاقدية وبند تغطية واضح. بديلك إن لم يتفق المقاول: التفاوض مع مقاول ثانٍ أقل كفاءة وأبطأ.',
          en: 'Your goal: finish the works within at most 12 extra days and no more than an 8% increase, while protecting the contractual relationship with a clear coverage clause. Your alternative if the contractor won\u2019t agree: a second, less capable and slower contractor.'
        }
      },
      counterpart: {
        name: { ar: 'م. عبدالسلام المصراتي', en: 'Eng. Abdelsalam Misrati' },
        title: { ar: 'مدير شركة المقاولات', en: 'Contracting company manager' },
        opening: {
          ar: 'شكراً على اجتماعك بي في هذا الوقت. الوضع تغيّر عما وقّعنا عليه: المواد ارتفعت أسعارها فعلياً وتأخر وصولها من المورد، وفريقي واقف. طلبي واضح: تمديد 30 يوماً وزيادة 15% على قيمة الأعمال، وإلا لن أستطيع الاستمرار بهذه الجودة. أنا أحمي سمعتي، لكن لا أستطيع العمل بخسارة.',
          en: 'Thank you for meeting me at this hour. The situation changed from what we signed: material prices genuinely rose, delivery from the supplier slipped, and my crew is idle. My request is clear: a 30-day extension and a 15% increase, or I cannot continue at this quality. I\u2019m protecting my reputation, but I cannot work at a loss.'
        },
        constraint: {
          ar: 'التزامات الشركة تجاه الموردين وعمالتها',
          en: 'the company\u2019s obligations to suppliers and crew wages'
        },
        interests: [
          { id: 'cash', weight: 3, revealAtTrust: 45,
            text: { ar: 'المشكلة الحقيقية تدفق نقدي: أقوات العمالة والمورد قبل نهاية الشهر، والزيادة جزء منها تسوية قروض قصيرة.', en: 'The real issue is cash flow: crew wages and supplier payments fall due month-end, and part of the increase covers short-term loans.' } },
          { id: 'reputation', weight: 2, revealAtTrust: 60,
            text: { ar: 'سمعتنا أمامكم وفي السوق أهم من هامش هذا العقد؛ إشارة تعاون موثقة منكم تساوي لنا كثيراً.', en: 'Our reputation with you and in the market matters more than this contract\u2019s margin; a documented cooperation note from you is worth a lot to us.' } },
          { id: 'precedent', weight: 2, revealAtTrust: 70,
            text: { ar: 'أخشى أن يتحول أي تنازل اليوم إلى سقف مطالب في العقود القادمة معكم.', en: 'I fear any concession today becomes the ceiling of demands in our future contracts with you.' } }
        ]
      },
      dimensions: [
        { id: 'price', label: { ar: 'الزيادة على قيمة العقد', en: 'Increase on contract value' }, unit: '%',
          direction: 'less', userGoal: 3, userFloor: 8, cpStart: 15, cpFloor: 6 },
        { id: 'days', label: { ar: 'أيام التمديد', en: 'Extension days' }, unit: 'd',
          direction: 'less', userGoal: 5, userFloor: 12, cpStart: 30, cpFloor: 10 }
      ],
      packages: [
        { id: 'staged', signals: ['دفع', 'مرحل', 'مقدمة', 'على دفعات', 'advance', 'staged', 'milestone'],
          label: { ar: 'دفعات مرتبطة بإنجاز مراحل العمل', en: 'Payments tied to work milestones' } },
        { id: 'evidence', signals: ['فاتورة', 'مستند', 'إثبات', 'سعر السوق', 'invoice', 'document', 'proof', 'market price'],
          label: { ar: 'تسوية مبنيّة على مستندات أسعار موثّقة', en: 'Settlement based on documented price evidence' } },
        { id: 'penalty_hold', signals: ['غرام', 'تعليق', 'إعفاء', 'penalty', 'hold', 'waive'],
          label: { ar: 'تعليق غرامة التأخير مقابل جدول صارم', en: 'Suspending delay penalties for a strict schedule' } }
      ],
      objectives: {
        ar: ['إنجاز الأعمال في أقرب وقت ممكن', 'زيادة مبررة تعاقدياً لا تتجاوز المخصص', 'حماية العلاقة مع أفضل مقاول متاح'],
        en: ['Works finished as soon as possible', 'A contractually justified increase within allocation', 'The relationship with the best available contractor preserved']
      },
      expertPath: {
        strategy: {
          ar: 'افصل الموقف عن المشكلة: المقاول تحت ضغط نقدي حقيقي، والتهديد المباشر بالغرامة سيفجّر الجلسة. استكشف أولاً حجم الضغط النقدي وحدوده، ثم اعرض حزمة: تسوية سعرية موثقة بالمستندات فقط، دفعات مرتبطة بمراحل الإنجاز، وتعليق جزئي للغرامة مقابل جدول زمني صارم. استند دائماً إلى بنود العقد (آلية تسوية الأسعار) لا إلى العواطف.',
          en: 'Separate the position from the problem: the contractor is under real cash pressure, and brandishing penalties will blow up the session. First map the size and limits of that pressure, then offer a package: price settlement on documented evidence only, milestone-linked payments, and partial penalty suspension against a strict schedule. Always anchor to contract clauses (the price-adjustment mechanism), not emotions.'
        },
        moves: [
          { ar: 'اعترف بشرعية القلق المالي ثم اطلب المستندات: «أرني فواتير المورد لأبني لك مسوّغاً».', en: 'Acknowledge the cash concern, then ask for evidence: “Show me the supplier invoices so I can build your justification.”' },
          { ar: 'اربط أي زيادة ببند تسوية الأسعار في العقد — هذا يحمي الطرفين أمام المراجعة.', en: 'Tie any increase to the contract\u2019s price-adjustment clause — it protects both sides in audit.' },
          { ar: 'اعرض الدفعات المرحلية بدل الزيادة الكاملة: تحل تدفقه النقدي دون كسر سقفك.', en: 'Offer staged payments instead of the full increase: solves cash flow without breaking your ceiling.' },
          { ar: 'استخدم الغرامة ورقة تفاوض لا سيفاً: تعليقها مقابل التزام بجدول.', en: 'Use the penalty as a bargaining chip, not a sword: suspend it for schedule commitment.' }
        ],
        avoid: [
          { ar: 'رفض الزيادة قطعياً من أول جولة — سيدفع المقاول لقرار انسحاب يضر الجميع.', en: 'Flatly rejecting the increase in round one — it pushes the contractor toward a quit decision that harms everyone.' },
          { ar: 'تطبيق الغرامة كاملة فوراً داخل الجلسة — يكسر العلاقة ويعطّل المرفق أطول.', en: 'Enforcing the full penalty inside the session — breaks the relationship and stalls the facility longer.' }
        ]
      },
      topicSWOT: {
        strengths: [
          { ar: 'بنود العقد (غرامة التأخير وآلية التسوية) تعطيك سلطة تفاوضية نظامية.', en: 'Contract clauses (delay penalty and settlement mechanism) give you formal leverage.' },
          { ar: 'أنت العميل الأهم للمقاول في المنطقة — علاقة مستمرة تستحق عنده كثيراً.', en: 'You are the contractor\u2019s most important client in the region — an ongoing relationship is worth a lot to them.' },
          { ar: 'طلب التمديد يعترف ضمنياً بمسؤوليته عن التأخير.', en: 'The extension request implicitly acknowledges his responsibility for the delay.' }
        ],
        weaknesses: [
          { ar: 'بديلك (مقاول ثانٍ) أسوأ بكفاءة وسرعة — ضعف BATNA واضح.', en: 'Your alternative (a second contractor) is worse in skill and speed — a clear BATNA weakness.' },
          { ar: 'توقف المرفق يضغط على المواطنين وقد يتصاعد إعلامياً — عامل وقت يعمل ضدك.', en: 'Facility downtime pressures citizens and could escalate publicly — time works against you.' },
          { ar: 'أي زيادة خارج آلية العقد تعرّضك للمساءلة أمام المراجعة.', en: 'Any increase outside the contract mechanism exposes you to audit accountability.' }
        ]
      }
    },

    /* ---------------------------------------------------------- 3 */
    {
      id: 'staffing',
      difficulty: 2,
      tags: ['dialogue', 'internal'],
      minutes: 16,
      personality: 'pragmatic',
      title: { ar: 'إعادة توزيع الكوادر بين إدارتين', en: 'Redistributing staff between two directorates' },
      summary: {
        ar: 'إدارة خدمات مواطنين محمّلة بفائض عمل، وتريد انتقال 12 موظفاً من إدارة اللجان، ومديرها يرفض التفريغ الكامل لفريقه.',
        en: 'A citizen-services directorate is overloaded and wants 12 staff transferred from the Committees directorate, whose director refuses to strip his team.'
      },
      context: {
        ar: 'نفذت إدارتكم مبادرة خدمات رقمية ضاعفت المعاملات اليومية دون زيادة كوادر، بينما تقلص عمل اللجان بعد إعادة الهيكلة. طلبت رسمياً انتقال 12 موظفاً، ومدير إدارة اللجان رفض: فريقه مرتبط بدورات عمل معدة، وبعض الكوادر مدرّبة على أنظمة متخصصة. القرار النهائي للإدارة العليا، لكنها تريد اتفاقاً بين الطرفين قبل العرض عليها.',
        en: 'Your digital-services initiative doubled daily transactions without new headcount, while committee work shrank after restructuring. You formally requested 12 transfers; the Committees director refused: his team runs scheduled cycles and some staff are trained on specialised systems. The final decision belongs to top management, but they want an inter-party agreement before it goes up.'
      },
      traineeRole: {
        title: { ar: 'مدير إدارة خدمات المواطنين', en: 'Director of Citizen Services' },
        brief: {
          ar: 'هدفك: اتفاق على انتقال لا يقل عن 7 كوادر مع فترة إسناد وتدريب متبادل، يعرض على الإدارة العليا كصيغة موحدة. بديلك: توظيف مؤقت مكلف وبطء إجراءات.',
          en: 'Your goal: an agreement on at least 7 transfers with a backstop and cross-training period, presented to top management as a joint formula. Your alternative: costly temp hiring with slow procedures.'
        }
      },
      counterpart: {
        name: { ar: 'أ. نادية بن عمران', en: 'Ms. Nadia Ben Amran' },
        title: { ar: 'مدير إدارة اللجان', en: 'Director of Committees' },
        opening: {
          ar: 'سمعت بطلبكم، وصراحةً فوجئت بالطريقة: وصلني عرض جاهز بأسماء كوادري دون جلسة واحدة. أنا لست ضد مصلحة المؤسسة، لكن تفريغ فريقي بهذا الحجم يربك دورات اللجان المعدة حتى نهاية العام، وبعض الأسماء الوحيدة في تخصصها. ما الذي يجعل هذه الكوادر تحديداً ضرورية لكم؟',
          en: 'I heard your request, and frankly the manner surprised me: a ready-made list of my staff\u2019s names reached me without a single meeting. I\u2019m not against the institution\u2019s interest, but stripping my team at this scale derails committee cycles scheduled to year-end, and some of those names are unique in their specialty. What makes these particular staff essential for you?'
        },
        constraint: {
          ar: 'دورات عمل اللجان المعتمدة حتى نهاية العام',
          en: 'committee work-cycles approved through year-end'
        },
        interests: [
          { id: 'continuity', weight: 3, revealAtTrust: 40,
            text: { ar: 'أي تعطيل لدورات اللجان يعني تأخر تقارير قانونية عليّ مسؤول عنها شخصياً.', en: 'Any disruption to committee cycles delays statutory reports I am personally answerable for.' } },
          { id: 'specialists', weight: 2, revealAtTrust: 55,
            text: { ar: 'ثلاثة من الأسماء المطلوبة وحدهم يديرون نظام توزيع المحاضر؛ نقلهم يوقف العمل كلياً.', en: 'Three of the requested names solely run the minutes-distribution system; moving them halts the work entirely.' } },
          { id: 'respect', weight: 2, revealAtTrust: 65,
            text: { ar: 'الطريقة التي جاء بها الطلب — قائمة جاهزة دون حوار — جعلت الموضوع شخصياً عند فريقي. صفة «المفرَّغ منه» تدمّر الروح المعنوية.', en: 'The manner of the request — a ready list without dialogue — made it personal for my team. The label of “the one drained” destroys morale.' } }
        ]
      },
      dimensions: [
        { id: 'count', label: { ar: 'عدد الكوادر المنتقلة', en: 'Number of staff transferred' }, unit: '',
          direction: 'more', userGoal: 12, userFloor: 7, cpStart: 2, cpFloor: 8 },
        { id: 'support', label: { ar: 'أشهر الإسناد من فريقي بعد الانتقال', en: 'Backstop months from my team post-transfer' }, unit: 'mo',
          direction: 'less', userGoal: 0, userFloor: 3, cpStart: 6, cpFloor: 2 }
      ],
      packages: [
        { id: 'phased', signals: ['مرحل', 'على دفعات', 'شهرين ثم', 'تدريج', 'phased', 'batch', 'staggered'],
          label: { ar: 'انتقال مرحلي على دفعات بعد إنجاز دورات اللجان', en: 'Phased transfers in batches after committee cycles complete' } },
        { id: 'swap', signals: ['تبادل', 'مقابل', 'معاكس', 'swap', 'exchange', 'cross-train'],
          label: { ar: 'تبادل تدريبي متبادل بين الإدارتين', en: 'Cross-training exchange between the directorates' } },
        { id: 'specialists', signals: ['تخصص', 'نظام المحاضر', 'استثناء', 'specialist', 'minutes system', 'exclude', 'carve out'],
          label: { ar: 'استثناء المتخصصين وحدود انتقال واضحة', en: 'Carving out specialists with clear transfer limits' } }
      ],
      objectives: {
        ar: ['تلبية احتياج الخدمة دون تعطيل اللجان', 'فترة إسناد وتدريب محددة', 'صيغة مشتركة تعرض على الإدارة العليا'],
        en: ['Meet service needs without stalling committees', 'A defined backstop and training period', 'A joint formula to present to top management']
      },
      expertPath: {
        strategy: {
          ar: 'ابدأ بمعالجة الجرح العلاقي أولاً: اعتذر عن طريقة وصول القائمة، ثم ابحث معها معايير اختيار الكوادر بدل الأسماء. حوّل الحوار من «كم موظفاً آخذ» إلى «كيف نحمي الدورتين معاً»: انتقال مرحلي يبدأ بعد دورات اللجان، استثناء المتخصصين بحدود واضحة، وتبادل تدريبي يبني احتياطاً للطرفين.',
          en: 'Start by healing the relationship wound: apologise for how the list arrived, then explore selection criteria with her instead of names. Reframe from “how many staff I take” to “how we protect both workloads”: phased transfers starting after committee cycles, specialists carved out with clear limits, and a cross-training exchange building reserve capacity for both.'
        },
        moves: [
          { ar: 'افتتاح ناعم: اعتذار صريح عن أسلوب القائمة قبل أي نقاش رقمي.', en: 'Soft opening: a direct apology for the list\u2019s manner before any numbers.' },
          { ar: 'اسأل عن دورات اللجان وتواريخها — ستحصل على خريطة قيود حقيقية.', en: 'Ask about committee cycles and their dates — you\u2019ll get a real constraint map.' },
          { ar: 'اقترح البدء بالمجموعة غير المرتبطة بالمحاضر، وبعدها مرحلة ثانية.', en: 'Propose starting with the group not tied to minutes, with a second phase after.' },
          { ar: 'اعرض صيغة كتابية مشتركة ترفع للإدارة العليا باسمي الطرفين.', en: 'Offer a joint written formula submitted to top management under both names.' }
        ],
        avoid: [
          { ar: 'الذهاب للإدارة العليا الآن — سيتحول الموضوع صراع سلطة تحسمه الجهة الأعلى ربما ضدك.', en: 'Going over her head now — it becomes a power struggle the top may settle against you.' },
          { ar: 'الإصرار على الأسماء تحديداً — يحيّد الموضوع ويثبت التصلب.', en: 'Insisting on specific names — it personalises the issue and cements rigidity.' }
        ]
      },
      topicSWOT: {
        strengths: [
          { ar: 'طلبك مدعوم بأرقام معاملات مضاعفة — معيار موضوعي قوي.', en: 'Your request is backed by doubled transaction numbers — a strong objective standard.' },
          { ar: 'الإدارة العليا تريد حلاً اتفاقياً — كلاكما يحتاج الطرف الآخر للنجاح.', en: 'Top management wants an agreed solution — you both need each other to succeed.' },
          { ar: 'تقلص عمل اللجان موضوعي — فضاء حلول واسع (مرحلية، تبادل، استثناءات).', en: 'Committee-work shrinkage is factual — a wide solution space (phasing, exchange, carve-outs).' }
        ],
        weaknesses: [
          { ar: 'خطأ افتتاحي ارتكبته إدارتك (القائمة الجاهزة) أذى العلاقة قبل الجلسة.', en: 'Your directorate\u2019s opening mistake (the ready-made list) hurt the relationship before the session.' },
          { ar: 'بعض الكوادر المطلوبة أحادية التخصص — لا يمكن استبدالها بسرعة.', en: 'Some requested staff are sole specialists — not quickly replaceable.' },
          { ar: 'القرار النهائي خارج غرفة الجلسة — سلطتك على الحسم محدودة.', en: 'The final decision sits outside the room — your authority to settle is limited.' }
        ]
      }
    },

    /* ---------------------------------------------------------- 4 */
    {
      id: 'citizen',
      difficulty: 1,
      tags: ['dialogue'],
      minutes: 12,
      personality: 'pressured',
      title: { ar: 'مستفيد غاضب في مركز الخدمة', en: 'An angry beneficiary at the service centre' },
      summary: {
        ar: 'مواطن قدم من منطقة بعيدة ثلاث مرات لإنهاء معاملة، وطُلب منه في كل مرة مستند إضافي، والآن يهدد بالتصعيد. مهمتك: احتواء الغضب وحلّ المعاملة.',
        en: 'A citizen travelled from a remote area three times to finish one transaction, asked for an extra document each time, and now threatens escalation. Your task: contain the anger and resolve the transaction.'
      },
      context: {
        ar: 'أنت مشرف قاعة خدمات المواطنين. المواطن أمامك الآن بصوت مرتفع والقاعة ممتلئة. نظام المتابعة يظهر أن المعاملة فُقدت سجلها الأول بين الوحدات، والمستند الإضافي في زيارته الثالثة لم يكن مطلوباً أصلاً. لديك صلاحية إعادة الجدولة بأولوية وإصدار خطاب اعتذار رسمي، لكن بعض الإجراءات تحتاج وحدة أخرى قد تتأخر يوماً.',
        en: 'You are the citizen-services hall supervisor. The citizen is in front of you, voice raised, hall full. The tracking system shows the transaction\u2019s first record was lost between units, and the extra document demanded on his third visit was never actually required. You can re-schedule with priority and issue an official apology letter, but some steps need another unit that may take a day.'
      },
      traineeRole: {
        title: { ar: 'مشرف قاعة خدمات المواطنين', en: 'Citizen-services hall supervisor' },
        brief: {
          ar: 'هدفك: تهدئة الموقف، وإنهاء المعاملة اليوم إن أمكن أو بأقرب موعد بأولوية، وترميم ثقة المستفيد بالمركز. بديلك إن لم تنجح: شكوى رسمية تفتح تحقيقاً داخلياً.',
          en: 'Your goal: de-escalate, complete the transaction today if possible or at priority ASAP, and repair the beneficiary\u2019s trust in the centre. Your alternative if you fail: a formal complaint triggering an internal investigation.'
        }
      },
      counterpart: {
        name: { ar: 'الحاج عمران', en: 'Mr. Omran' },
        title: { ar: 'مستفيد من الخدمة', en: 'Service beneficiary' },
        opening: {
          ar: 'ثلاث مرات أجي من أطراف المدينة! الأولى قالوا «ناقص ورقة»، والثانية «النظام معلق»، والثالثة طلبت الورقة نفسها اللي قلتوا عليها أصلاً مو مطلوبة! أنتوا تتلاعبوا في الناس؟ خلاص، إما تحلها اليوم أو أروح للمدير العام والإذاعة، وعندي كل الأوراق موثقة!',
          en: 'Three times I\u2019ve come from the edge of the city! First they said “missing a paper”, then “system\u2019s down”, then they asked for the very paper they said wasn\u2019t needed! Are you people playing with us? Enough — either you solve it today or I go to the Director-General and the radio, and I have every paper documented!'
        },
        constraint: { ar: 'إجراءات الوحدة الأخرى', en: 'the other unit\u2019s procedures' },
        interests: [
          { id: 'respect', weight: 3, revealAtTrust: 35,
            text: { ar: 'الذي يحرقني ليس التأخير وحده — هو شعوري أن أحداً لا يعترف بالخطأ ويعتذر بوضوح.', en: 'What burns me isn\u2019t only the delay — it\u2019s feeling that nobody owns the mistake and clearly apologises.' } },
          { id: 'today', weight: 2, revealAtTrust: 50,
            text: { ar: 'التنقل إليكم يكلفني نصف يوم ووظيفة يومية لا أستطيع تعطيلها مراراً.', en: 'Getting to you costs me half a day and a daily job I can\u2019t keep skipping.' } },
          { id: 'assurance', weight: 2, revealAtTrust: 60,
            text: { ar: 'أريد ضماناً مكتوباً أن هذه المرة لن أعود للمربع الأول.', en: 'I want a written guarantee that this time I won\u2019t go back to square one.' } }
        ]
      },
      dimensions: [],
      packages: [
        { id: 'priority', signals: ['اليوم', 'أولوية', 'الآن', 'today', 'priority', 'now', 'immediately'],
          label: { ar: 'إنهاء عاجل بأولوية داخل اليوم', en: 'Urgent priority completion within today' } },
        { id: 'apology', signals: ['اعتذر', 'اعتذار', 'خطاب', 'مسؤولية', 'apolog', 'letter', 'own', 'responsib'],
          label: { ar: 'اعتذار رسمي موثّق واعتراف بالخطأ', en: 'A documented official apology owning the error' } },
        { id: 'followup', signals: ['متابعة', 'رقم', 'تواصل', 'أشخص', 'follow', 'track', 'contact', 'call'],
          label: { ar: 'متابعة شخصية برقم طلب حتى الإنجاز', en: 'Personal follow-up with a tracking number until done' } }
      ],
      objectives: {
        ar: ['تهدئة المستفيد واحترامه', 'مسار حل واضح ومحدد زمنياً', 'ضمان عدم تكرار المشكلة'],
        en: ['Calm and respect for the beneficiary', 'A clear, time-bound resolution path', 'Guarantee the problem does not repeat']
      },
      expertPath: {
        strategy: {
          ar: 'هذه جلسة حوار لا تفاوض أرقام: ركّز على الشخص قبل المشكلة. اعترف بالخطأ بوضوح وبلا تبريرات، اعتذر رسمياً، ثم اعرض مساراً محدداً زمنياً مع متابعة شخصية باسمك. لا تدافع عن النظام ولا تلم الوحدات الأخرى أمامه — الحياد الدفاعي يزيد الغضب. ختاماً: اعرض خيار التعويض الإجرائي (خطاب اعتذار + أولوية).',
          en: 'This is a dialogue session, not a numbers negotiation: focus on the person before the problem. Own the mistake clearly without excuses, apologise formally, then offer a time-bound path with personal follow-up under your name. Don\u2019t defend the system or blame other units in front of him — defensive neutrality fuels anger. Finally, offer procedural reparation (apology letter + priority).'
        },
        moves: [
          { ar: 'دعه يُفرغ شحنته أول مرة دون مقاطعة، ثم أعد صياغة شكواه بتعبيرك.', en: 'Let him vent fully once without interrupting, then restate his complaint in your own words.' },
          { ar: 'اعترف بالخطأ بلا «لكن»: «حدث خطأ إجرائي ونحن مسؤولون عنه».', en: 'Own the error without “but”: “A procedural error happened and we are responsible for it.”' },
          { ar: 'اربط كل وعد بزمن محدد واسم مسؤول — الغضب يهدأ بالتحديد لا بالعاطفة.', en: 'Tie every promise to a specific time and owner — anger calms with specificity, not emotion.' },
          { ar: 'اعرض خطاب الاعتذار الرسمي والمتابعة برقم طلب — يحول الشكوى إلى مسار.', en: 'Offer the official apology letter and tracked follow-up — it converts complaint into process.' }
        ],
        avoid: [
          { ar: 'شرح التعقيدات الإدارية له — يسمعها تبريراً مهما كانت صادقة.', en: 'Explaining administrative complexity — he will hear excuses no matter how true.' },
          { ar: 'وعود عامة («سنتابع بإذن الله») بلا زمن أو اسم — تعيد فقدان الثقة.', en: 'Vague promises (“we\u2019ll follow up”) without time or owner — re-loses trust.' }
        ]
      },
      topicSWOT: {
        strengths: [
          { ar: 'الحقيقة في صفك: الخطأ إجرائي وواضح في السجلات — الاعتراف به يمنحك مصداقية.', en: 'Truth is on your side: the error is procedural and visible in records — owning it grants credibility.' },
          { ar: 'لديك صلاحيات حقيقية (أولوية، خطاب اعتذار) تكفي لترميم الموقف.', en: 'You hold real powers (priority, apology letter) sufficient to repair the situation.' },
          { ar: 'المواطن يريد حلاً لا ثأراً — مصالحه قابلة للتلبيسك بقنوات متاحة.', en: 'The citizen wants a solution, not revenge — his interests are satisfiable with available channels.' }
        ],
        weaknesses: [
          { ar: 'القاعة عامة — أي تصعيد صوتي يؤثر على عشرات المستفيدين الآخرين.', en: 'The hall is public — any vocal escalation affects dozens of other beneficiaries.' },
          { ar: 'بعض الخطوات بيد وحدة أخرى خارج صلاحيتك المباشرة.', en: 'Some steps belong to another unit outside your direct authority.' },
          { ar: 'الجمهور الغاضب يملك قنوات تصعيد حقيقية (المدير العام، الإعلام).', en: 'An angry public holds real escalation channels (Director-General, media).' }
        ]
      }
    },

    /* ---------------------------------------------------------- 5 */
    {
      id: 'committee',
      difficulty: 3,
      tags: ['negotiation', 'multi', 'internal'],
      minutes: 22,
      personality: 'pragmatic',
      title: { ar: 'اللجنة الوطنية: تنسيق خطة مشتركة', en: 'The national committee: coordinating a joint plan' },
      summary: {
        ar: 'ثلاث جهات تمثلها شخصية الميسّر: تحتاج التزامات مشتركة وجدولاً موحداً وتوزيع تمويل، وكل جهة تحمي حدود صلاحياتها.',
        en: 'Three bodies (played by the facilitator character): you need joint commitments, a unified timeline and shared funding, while each body guards its authority boundaries.'
      },
      context: {
        ar: 'شُكلت لجنة وطنية لتنسيق خطة تجهيز مدن خدمات موحدة، تضم جهتكم وجهتين أخريين. الشخصية المقابلة تلعب دور ميسّر اللجنة الذي يمثل مواقف الجهتين الأخريين ويجمع التزامات الأطراف. مطلوب من الجلسة: عدد التزامات مشتركة موثقة، أسابيع حتى الإطلاق التجريبي، ونسبة تمويل مشترك من صندوق التنسيق. كل جهة تخشى فقدان صلاحياتها لمصلحة الجهاز الموحد.',
        en: 'A national committee was formed to coordinate the unified service-centres rollout, with your body and two others. The counterpart plays the committee facilitator voicing the other two bodies\u2019 positions and gathering commitments. The session must produce: documented joint commitments, weeks until the pilot launch, and a shared-funding ratio from the coordination fund. Every body fears losing authority to the unified apparatus.'
      },
      traineeRole: {
        title: { ar: 'ممثل جهتكم في اللجنة الوطنية', en: 'Your body\u2019s representative on the national committee' },
        brief: {
          ar: 'هدفك: اتفاق على 3 التزامات مشتركة على الأقل، إطلاق تجريبي خلال 10 أسابيع، وتمويل مشترك لا يقل عن 22%. بديلك: انسحاب من اللجنة يعني خطة موازية أضعف ومساءلة عن فشل التنسيق.',
          en: 'Your goal: agreement on at least 3 joint commitments, pilot launch within 10 weeks, and shared funding of at least 22%. Your alternative: withdrawing from the committee means a weaker parallel plan and accountability for coordination failure.'
        }
      },
      counterpart: {
        name: { ar: 'أ. فيصل الحضيري', en: 'Mr. Faisal Hadri' },
        title: { ar: 'ميسّر اللجنة الوطنية', en: 'National committee facilitator' },
        opening: {
          ar: 'رحلة الجلسة اليوم واضحة: نحتاج ختم الإطار في هذا الاجتماع. الجهتان الأخريان جاهزتان للالتزام، لكن لديهما تحفظان: الجدول الزمني لا يقل عن 22 أسبوعاً لأن دوراتهما الرقابية طويلة، والتمويل المشترك فوق 12% يحتاج موافقات مجلس. دوري أن أجمع صيغة تتحملها الأجهزة الثلاثة. ما الذي تستطيع جهتكم الالتزام به اليوم تحديداً؟',
          en: 'Today\u2019s path is clear: we need to seal the framework in this meeting. The other two bodies are ready to commit, with two reservations: a timeline of no less than 22 weeks because their oversight cycles are long, and shared funding above 12% needs board approvals. My role is to gather a formula all three apparatuses can bear. What exactly can your body commit to today?'
        },
        constraint: {
          ar: 'موافقات مجالس الجهات المشاركة',
          en: 'the participating bodies\u2019 board approvals'
        },
        interests: [
          { id: 'authority', weight: 3, revealAtTrust: 45,
            text: { ar: 'الجهتان تخشيان أن يتحول التمويل المشترك إلى سلطة موحدة تتجاوز صلاحياتهما القائمة.', en: 'Both bodies fear shared funding becoming a unified authority overriding their existing mandates.' } },
          { id: 'cycle', weight: 2, revealAtTrust: 60,
            text: { ar: 'دورات الرقابة الداخلية لديهما لا تُضغط أقل من 12 أسبوعاً مهما كانت الأولوية.', en: 'Their internal oversight cycles cannot compress below 12 weeks regardless of priority.' } },
          { id: 'credit', weight: 2, revealAtTrust: 70,
            text: { ar: 'كل جهة تريد حضوراً معنوياً واضحاً في الإنجاز النهائي أمام قياداتها.', en: 'Each body wants clear symbolic presence in the final delivery before its leadership.' } }
        ]
      },
      dimensions: [
        { id: 'commitments', label: { ar: 'عدد الالتزامات المشتركة الموثقة', en: 'Documented joint commitments' }, unit: '',
          direction: 'more', userGoal: 3, userFloor: 2, cpStart: 1, cpFloor: 2 },
        { id: 'weeks', label: { ar: 'أسابيع حتى الإطلاق التجريبي', en: 'Weeks until pilot launch' }, unit: 'w',
          direction: 'less', userGoal: 8, userFloor: 12, cpStart: 22, cpFloor: 12 },
        { id: 'funding', label: { ar: 'نسبة التمويل المشترك من الصندوق', en: 'Shared funding ratio from the fund' }, unit: '%',
          direction: 'more', userGoal: 40, userFloor: 22, cpStart: 12, cpFloor: 24 }
      ],
      packages: [
        { id: 'phased', signals: ['مرحل', 'دفعات', 'تجريبي ثم', 'phased', 'pilot', 'stage'],
          label: { ar: 'مراحل: تجريبي محدود ثم توسّع بعد النجاح', en: 'Phases: limited pilot then scale-up after success' } },
        { id: 'governance', signals: ['حوكمة', 'لجنة متابعة', 'صلاحيات', 'governance', 'steering', 'mandate'],
          label: { ar: 'حوكمة تحفظ صلاحيات الجهات مع تمويل مشترك', en: 'Governance preserving bodies\u2019 mandates with shared funding' } },
        { id: 'credit', signals: ['حضور', 'رعاية', 'معنوي', 'visibility', 'credit', 'recognition'],
          label: { ar: 'حضور معنوي متوازن للجهات الثلاث في الإنجاز', en: 'Balanced symbolic presence for all three bodies' } }
      ],
      objectives: {
        ar: ['إطار موثّق يتحمله الأطراف الثلاثة', 'جدول واقعي يراعي الدورات الرقابية', 'تمويل مشترك بحد أدنى مقبول'],
        en: ['A documented framework all three can bear', 'A realistic timeline respecting oversight cycles', 'Shared funding above the acceptable minimum']
      },
      expertPath: {
        strategy: {
          ar: 'في الملفات متعددة الأطراف لا تتفاوض ثنائياً مع الميسّر — ابنِ صيغة تجمع المصالح الثلاثة. استكشف مخاوف فقدان الصلاحيات أولاً (الخلفية الحقيقية للتحفظات)، ثم اعرض حزمة حوكمة: تمويل مشترك داخل مظلة لجنة متابعة تحفظ صلاحيات الجهات، جدول مرحلي يبدأ بتجريبي محدود، وحضور معنوي متوازن في الإنجاز.',
          en: 'In multi-party files don\u2019t bargain bilaterally with the facilitator — build a formula gathering all three interests. First explore the authority-loss fears (the real driver of reservations), then offer a governance package: shared funding under a steering committee preserving mandates, a phased timeline starting with a limited pilot, and balanced symbolic presence in delivery.'
        },
        moves: [
          { ar: 'اسأل عن حدود الدورات الرقابية بدل التراجع فوراً عن الجدول.', en: 'Ask about oversight-cycle limits instead of immediately retreating on the timeline.' },
          { ar: 'قدم التزامك أنت أولاً — القيادة بالمثال تحرك الأطراف المتحفظة.', en: 'Offer your own commitment first — leading by example moves hesitant parties.' },
          { ar: 'حوّل التمويل من رقم إلى بنية (مظلة، شروط صرف) — يهدد المخاوف أقل.', en: 'Convert funding from a number to a structure (umbrella, conditions) — it threatens the fears less.' },
          { ar: 'اطلب محضراً موثقاً بالالتزامات وحدودها — التوثيق هو الاتفاق هنا.', en: 'Ask for minutes documenting commitments and their limits — documentation is the agreement here.' }
        ],
        avoid: [
          { ar: 'الضغط بسلطة جهتك على الجهتين — سيوحدان ضدك.', en: 'Pressing with your body\u2019s authority on the two others — they will unite against you.' },
          { ar: 'قبول جدول متفائل لا تتحمله الدورات الرقابية — انهيار لاحق أشد.', en: 'Accepting an optimistic timeline oversight can\u2019t bear — a later collapse is worse.' }
        ]
      },
      topicSWOT: {
        strengths: [
          { ar: 'مصلحة التنسيق مشتركة ومعلنة — نقطة انطلاق متينة.', en: 'The coordination interest is shared and declared — a solid starting point.' },
          { ar: 'التمويل المشترك يوفر على الجميع مقارنة بالخطط الموازية.', en: 'Shared funding saves everyone versus parallel plans.' },
          { ar: 'دور الميسّر محايد نسبياً — يمكن بناء التحالفات عبره.', en: 'The facilitator\u2019s role is relatively neutral — alliances can be built through him.' }
        ],
        weaknesses: [
          { ar: 'ثلاثة أطراف بثلاث دورات رقابية — أي جدول سريع يصطدم بواحدة منها.', en: 'Three parties with three oversight cycles — any fast timeline hits one of them.' },
          { ar: 'انسحابك من اللجنة يضعك أمام مساءلة عن فشل التنسيق.', en: 'Withdrawing puts you before accountability for coordination failure.' },
          { ar: 'موافقات المجالس خارج الغرفة — حتى الاتفاق هنا مشروط.', en: 'Board approvals sit outside the room — even an agreement here is conditional.' }
        ]
      }
    },

    /* ---------------------------------------------------------- 6 */
    {
      id: 'schedule',
      difficulty: 2,
      tags: ['negotiation'],
      minutes: 15,
      personality: 'guardian',
      title: { ar: 'نظام الدوام المرن مع لجنة الموظفين', en: 'Flexible working hours with the staff committee' },
      summary: {
        ar: 'تريد إدخال دوام مرن لأربع أيام عن بُعد أسبوعياً، ولجنة الموظفين تريد خمسة أيام وبدون تجريبي محدود.',
        en: 'You want to introduce flexible working with four remote days a week; the staff committee demands five days with no limited pilot.'
      },
      context: {
        ar: 'أصدرت الإدارة قراراً مبدئياً بدوام مرن يتيح 4 أيام عن بُعد، مقابل قياس إنتاجية أسبوعية. لجنة الموظفين (تمثل الموظفين) ترفض: تطالب بـ5 أيام كاملة، ورفض «التجريبي» لأنه في تجارب سابقة صار دائماً. قرارات سابقة تشترط موافقة اللجنة على أي تعديل جوهري في الدوام.',
        en: 'Management issued a preliminary decision on flexible hours allowing 4 remote days against weekly productivity measurement. The staff committee rejects it: they demand the full 5 days and refuse a “pilot” because past pilots became permanent. Prior decisions require the committee\u2019s approval for any material change to working hours.'
      },
      traineeRole: {
        title: { ar: 'مدير إدارة الموارد البشرية', en: 'HR director' },
        brief: {
          ar: 'هدفك: اتفاق على 4 أيام عن بُعد (لا تقل عن 3) مع آلية قياس ومراجعة بعد شهرين، واعتماد موثق من اللجنة. بديلك: فرض القرار يفتح نزاعاً داخلياً ويضر الإنتاجية.',
          en: 'Your goal: agreement on 4 remote days (at least 3) with a measurement mechanism and a two-month review, with documented committee approval. Your alternative: imposing the decision opens internal conflict and hurts productivity.'
        }
      },
      counterpart: {
        name: { ar: 'أ. سالم القماطي', en: 'Mr. Salem Qamati' },
        title: { ar: 'رئيس لجنة الموظفين', en: 'Staff committee chair' },
        opening: {
          ar: 'باسم الموظفين، لا نعترض على المرونة أصلاً — نعترض على طريقة حصرها في 4 أيام مع «تجريبي» مؤقت. كل تجربة سابقة بدأت مؤقتة وبقيت دائمة عندما نجحت، لكن أُلغيت فور أول شكوى. طلبنا واضح: 5 أيام كاملة وبدون تجريبي، وإلا فسنطلب تحكيم الإدارة العليا. قبل أن نصر على المواقف، ما الذي تخشونه أنتم تحديداً من اليوم الخامس؟',
          en: 'On behalf of the staff, we don\u2019t object to flexibility at all — we object to capping it at 4 days with a temporary “pilot”. Every past pilot started temporary and stayed permanent when it succeeded, yet was cancelled at the first complaint. Our ask is clear: 5 full days, no pilot, or we\u2019ll seek top-management arbitration. Before we dig into positions, what exactly do you fear about the fifth day?'
        },
        constraint: {
          ar: 'اشتراط موافقة اللجنة النظامي على تعديل الدوام',
          en: 'the procedural requirement of committee approval for hours changes'
        },
        interests: [
          { id: 'trust', weight: 3, revealAtTrust: 40,
            text: { ar: 'الخوف الحقيقي ليس الخامس بل مصداقية الآلية: سابقة إلغاء التجارب عند أول شكوى جعلت الموظفين لا يصدقون «المؤقت».', en: 'The real fear isn\u2019t the fifth day but the mechanism\u2019s credibility: past pilots cancelled at the first complaint made staff stop believing “temporary”.' } },
          { id: 'fairness', weight: 2, revealAtTrust: 55,
            text: { ar: 'معيار العدالة بين الوحدات: بعض الوظائف لا يمكن عن بُعد، وبدون معيار توزيع عادل سيشتعل الحسد الداخلي.', en: 'Fairness across units: some roles can\u2019t be remote; without a fair distribution standard, internal envy ignites.' } },
          { id: 'voice', weight: 2, revealAtTrust: 68,
            text: { ar: 'اللجنة تريد حضوراً في مراجعة الآلية لا مجرد إبلاغ بالنتائج.', en: 'The committee wants presence in reviewing the mechanism, not merely being informed of results.' } }
        ]
      },
      dimensions: [
        { id: 'remote', label: { ar: 'أيام العمل عن بُعد أسبوعياً', en: 'Weekly remote days' }, unit: 'd',
          direction: 'less', userGoal: 4, userFloor: 5, cpStart: 5, cpFloor: 3 },
        { id: 'review', label: { ar: 'أسابيع المراجعة قبل التثبيت', en: 'Review weeks before making permanent' }, unit: 'w',
          direction: 'more', userGoal: 8, userFloor: 4, cpStart: 0, cpFloor: 4 }
      ],
      packages: [
        { id: 'safeguards', signals: ['معيار', 'شروط', 'ضوابط', 'standard', 'criteria', 'safeguard', 'rules'],
          label: { ar: 'ضوابط معيارية عادلة بين الوحدات', en: 'Fair standards across units' } },
        { id: 'joint_review', signals: ['مراجعة مشتركة', 'اللجنة', 'معاً', 'joint', 'together', 'review'],
          label: { ar: 'مراجعة مشتركة للجنة والإدارة بعد شهرين', en: 'Joint committee-management review after two months' } },
        { id: 'phase5', signals: ['الخامس', 'تدريجي', 'بعد النجاح', 'fifth', 'gradual', 'after success'],
          label: { ar: 'اليوم الخامس بعد نجاح المراجعة المشتركة', en: 'The fifth day after successful joint review' } }
      ],
      objectives: {
        ar: ['اتفاق موثق مع اللجنة', 'آلية قياس ومراجعة واضحة', 'معيار عادل بين الوحدات'],
        en: ['A documented agreement with the committee', 'A clear measurement and review mechanism', 'A fair standard across units']
      },
      expertPath: {
        strategy: {
          ar: 'لا تدافع عن «4 أيام» كرقم — ابحث عن الخوف الحقيقي خلف «5 أيام» و«التجريبي»: مصداقية الآلية والعدالة بين الوحدات. اعرض بديلاً عن التجريبي المفروض: تجريبي مشترك تراجعه اللجنة والإدارة معاً بمعايير معلنة، مع مسار واضح لليوم الخامس بعد نجاح المراجعة. أعط اللجنة حضوراً في المراجعة — مصلحتها الحقيقية.',
          en: 'Don\u2019t defend “4 days” as a number — explore the real fear behind “5 days” and “the pilot”: mechanism credibility and fairness across units. Replace an imposed pilot with a JOINT pilot reviewed by committee and management together under public standards, with a clear path to the fifth day after successful review. Give the committee presence in the review — its true interest.'
        },
        moves: [
          { ar: 'اسأل عن سابقة إلغاء التجارب — ستحصل على القصة التي تفسر الموقف.', en: 'Ask about the cancelled-pilot precedent — you\u2019ll get the story explaining the position.' },
          { ar: 'اقترب من مصلحة الحضور: «ما شكل المراجعة الذي يرضي اللجنة؟».', en: 'Approach the voice interest: “What review format satisfies the committee?”' },
          { ar: 'اعرض التجريبي المشترك بمعايير معلنة بدل التجريبي المفروض.', en: 'Offer a joint pilot with public standards instead of an imposed one.' },
          { ar: 'اربط اليوم الخامس بنتائج المراجعة لا بوعد لفظي.', en: 'Tie the fifth day to review outcomes, not verbal promises.' }
        ],
        avoid: [
          { ar: 'فرض القرار بالسلطة — اللجنة تملك شرط الموافقة النظامي وستستخدمه.', en: 'Imposing the decision by authority — the committee holds the procedural approval and will use it.' },
          { ar: 'رفض التجريبي رفضاً قاطعاً أو قبوله بلا ضوابط — كلاهما يقتل الثقة.', en: 'Either flatly refusing the pilot or accepting it without safeguards — both kill trust.' }
        ]
      },
      topicSWOT: {
        strengths: [
          { ar: 'الإدارة تملك سلطة الاقتراح ومبادرة القرار — أنت من يصمم الصيغة.', en: 'Management holds proposal and initiative authority — you design the formula.' },
          { ar: 'مصلحة المرونة مشتركة أصلاً — الخلاف على الآلية لا على المبدأ.', en: 'The flexibility interest is already shared — the dispute is over mechanism, not principle.' },
          { ar: 'توجد سوابق موثقة يمكن بناء معايير عادلة عليها.', en: 'Documented precedents exist to build fair standards on.' }
        ],
        weaknesses: [
          { ar: 'اللجنة تملك حق الموافقة النظامي — الرفض يسقط القرار كله.', en: 'The committee holds procedural approval — rejection kills the whole decision.' },
          { ar: 'سابقة إلغاء التجارب تضعف مصداقية أي وعد «مؤقت».', en: 'The cancelled-pilot precedent weakens any “temporary” promise.' },
          { ar: 'عدم قابلية بعض الوظائف للعمل عن بُعد يخلق حساسية عدالة.', en: 'Some roles can\u2019t be remote, creating fairness sensitivity.' }
        ]
      }
    }
  ];

  /* ---------- data normalization ----------
     `objectives` is authored compactly as {ar: [...], en: [...]} but every
     consumer (report, app views, engine) expects an array of bilingual
     entries — normalize once here. */
  for (const s of SCENARIOS) {
    if (s.objectives && !Array.isArray(s.objectives)) {
      const o = s.objectives;
      s.objectives = (o.ar || []).map((txt, i) => ({ ar: txt, en: (o.en || [])[i] || txt }));
    }
  }

  /* ---------- custom scenario support ---------- */
  function customScenarioDraft() {
    return {
      id: null, custom: true, difficulty: 2, tags: ['negotiation'], minutes: 15,
      personality: 'pragmatic',
      title: { ar: '', en: '' }, summary: { ar: '', en: '' },
      context: { ar: '', en: '' },
      traineeRole: { title: { ar: '', en: '' }, brief: { ar: '', en: '' } },
      counterpart: {
        name: { ar: '', en: '' }, title: { ar: '', en: '' }, opening: { ar: '', en: '' },
        constraint: { ar: '', en: '' }, interests: []
      },
      dimensions: [], packages: [], objectives: [], expertPath: null, topicSWOT: null,
      customInput: null
    };
  }

  /* Infer a rough dimension from numbers found in the user's custom text
     (e.g. "زيادة 30%" -> a percent axis). Falls back to qualitative mode. */
  function inferCustomDimensions(text) {
    const t = String(text || '');
    const pct = [];
    const re = /(\d{1,3})\s*(?:%|بالمئة|بالمائه|percent)/gi;
    let m; while ((m = re.exec(t))) pct.push(parseInt(m[1], 10));
    if (!pct.length) return [];
    const goal = pct[0];
    const cpStart = Math.max(1, Math.round(goal * 0.2));
    const cpFloor = Math.max(1, Math.round(goal * 0.55));
    return [{
      id: 'main', label: { ar: 'المطلب الرئيسي', en: 'Main request' }, unit: '%',
      direction: 'more', userGoal: goal, userFloor: cpFloor, cpStart, cpFloor
    }];
  }

  function getScenario(id) {
    return SCENARIOS.find(s => s.id === id) || null;
  }

  return {
    SCENARIOS, PERSONALITIES, CRITERIA_DEFAULT,
    customScenarioDraft, inferCustomDimensions, getScenario
  };
});
