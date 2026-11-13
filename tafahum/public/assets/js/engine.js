/* ============================================================
   Tafahum Platform — simulation engine
   The "virtual counterpart" brain: a stateful agent driven by
   principled-negotiation dynamics (trust, rigidity, interests,
   reservation points) reacting to the trainee's messages.
   Deterministic via seeded RNG (same session id -> same run).
   UMD module.

   Dimension semantics
   -------------------
   direction 'more' : higher values are better for the trainee.
     cpStart = counterpart's opening offer (below their maximum),
     cpFloor = the most the counterpart can carry (their ceiling).
     An offer v is acceptable to them when  v <= cpFloor.
   direction 'less' : lower values are better for the trainee.
     cpStart = counterpart's opening demand (above their minimum),
     cpFloor = the least the counterpart can carry (their minimum).
     An offer v is acceptable to them when  v >= cpFloor.
   userGoal  = the trainee's aspiration, userFloor = the trainee's
   reservation point (worst tolerable). A ZOPA exists when
   userFloor <= cpFloor ('more') or userFloor >= cpFloor ('less').
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./analyzer.js'), require('./evaluator.js'), require('./scenarios.js'), require('./core.js'), require('./dialogue.js'));
  } else root.TENG = factory(root.TFA, root.TFE, root.TFS, root.TF, root.TFDG);
})(typeof self !== 'undefined' ? self : this, function (TFA, TFE, TFS, TF, TDG) {
  'use strict';

  const clamp = TF.clamp, pick = TF.pick;

  /* ============ bilingual reply bank ============ */
  const BANK = {
    /* note: slots {name} {u} {constraint} {interest} {dim} {v} {unit} {topic} */
    openingAnswer_generic: {
      ar: ['شكراً على توضيحك. دعني أكون واضحاً: {constraint} ليس موقفاً شخصياً، بل التزام نظامي عليّ. ما الذي تقترحه تحديداً؟',
        'أقدّر المعلومة. من جهتي، الإطار الذي أعمل داخله هو {constraint}. قبل التفاصيل، أريد أن أفهم أولوياتكم في هذا الملف.'],
      en: ['Thank you for clarifying. Let me be plain: {constraint} is not a personal position — it\u2019s a procedural obligation on me. What exactly are you proposing?',
        'I appreciate the information. My working frame is {constraint}. Before details, I want to understand your priorities in this file.']
    },
    greeting: {
      ar: ['أهلاً وسهلاً. وقتك ثمين ومثلما، فدخلنا في صلب الموضوع إن سمحت.'],
      en: ['Welcome. Your time is as precious as mine, so let\u2019s get to the heart of it, if you don\u2019t mind.']
    },
    answerQuestion: {
      ar: ['سؤال وجيه. الإجابة المختصرة: {constraint} يحكم قراري، وما دامه قائماً فمرونتي محدودة. لكن أخبرني — ما الذي تبحث عنه تحديداً في إجابتي؟',
        'سؤال في محله. دعني أجبك بشفافية: {constraint}. وهنا سؤالي لك بالمقابل: {ask}'],
      en: ['A fair question. The short answer: {constraint} governs my decision, and while it stands my flexibility is limited. But tell me — what exactly are you looking for in my answer?',
        'A good question. Let me answer transparently: {constraint}. And here\u2019s my question back: {ask}']
    },
    revealInterest: {
      ar: ['بما أنك سألت بصراحة، سأخبرك بما لا أقوله عادة: {interest}',
        'حسناً، الشفافية تستحق الشفافية: {interest}'],
      en: ['Since you asked frankly, I\u2019ll tell you what I rarely say: {interest}',
        'Very well — transparency deserves transparency: {interest}']
    },
    deflectInterest: {
      ar: ['هذا سؤال تفصيلي أكثر مما يلزم الآن. لنركز على ما يمكن أن نتفق عليه عملياً.',
        'أفضّل أن نناقش الصيغ العملية أولاً، ثم تتبين التفاصيل.'],
      en: ['That\u2019s a more detailed question than needed right now. Let\u2019s focus on what we can practically agree on.',
        'I\u2019d rather discuss practical formulas first; the details will follow.']
    },
    aggression: {
      ar: ['سأتجاوز عن النبرة هذه المرة، لكن دعنا نحترم الجلسة: {constraint} لا أملك تجاوزه بالإصرار.',
        'الضغط لا يحرّك {constraint}. إن أردنا نتيجة، فالكلام الحاد ليس طريقها.'],
      en: ['I\u2019ll overlook the tone this once, but let\u2019s keep this session respectful: I cannot breach {constraint} through insistence.',
        'Pressure doesn\u2019t move {constraint}. If we want an outcome, harsh words aren\u2019t the route.']
    },
    aggressionFinal: {
      ar: ['بهذه النبرة لن تكون جلستنا منتجة. أقترح أن نستأنف في وقت آخر وبعيداً عن الاتهامات. مع السلامة.'],
      en: ['With this tone our session won\u2019t be productive. I suggest we resume another time, away from accusations. Good day.']
    },
    threat: {
      ar: ['التصعيد خيارك، لكنه ينهي الجلسة كما تعلم. أفهم أن لديك مسوّغات، لكن التوثيق بها لا التلويح بها.'],
      en: ['Escalation is your option, but as you know it ends this session. I understand you have justifications — document them, don\u2019t wave them.']
    },
    rapport: {
      ar: ['أقدّر لك هذا الكلام، وأعدك بمثل الصراحة. الحوار الهادئ هو ما يجعل الحلول ممكنة أصلاً.',
        'هذه الروح هي التي تفتح الملفات. بيني وبينك: {constraint} يقلقني أكثر مما يقلقك على الأرجح.'],
      en: ['I appreciate that, and I\u2019ll repay the candour. Calm dialogue is what makes solutions possible at all.',
        'That spirit is what opens files. Between us: {constraint} worries me more than it probably worries you.']
    },
    criteriaRespect: {
      ar: ['الآن نتحاور بلغة تفهمها الإدارة: المعايير. إن كان لمسوّغكم معيار موضوعي قابل للتوثيق، فذلك يغيّر شكل النقاش عندي.',
        'جيد أنك تحتج بالمعايير لا بالحاجة — هذا ما أستطيع الدفاع عنه أمام مراجعة.'],
      en: ['Now we\u2019re speaking a language administration understands: standards. If your justification rests on a documentable objective standard, that changes the shape of this discussion for me.',
        'Good — you\u2019re arguing from standards, not need. That is what I can defend before an audit.']
    },
    batnaProbe: {
      ar: ['سؤال مشروع: ما الذي ستفعلونه تحديداً إن لم نصل إلى صيغة اليوم؟'],
      en: ['A fair question: what exactly will you do if we reach no formula today?']
    },
    batnaStated: {
      ar: ['أفهم أن لديكم بديلاً، وأحترم أنكم ذكرتموه بهدوء لا كتهديد — هذا يغير حساباتي قليلاً.'],
      en: ['I understand you have an alternative, and I respect that you stated it calmly rather than as a threat — that shifts my calculus somewhat.']
    },
    optionEnthusiastic: {
      ar: ['فكرة {packLabel} تستحق الوقوف عندها — تلامس قلقي الحقيقي. إن بنيناها بأرقام معقولة، فقد نصل إلى صيغة أستطيع الدفاع عنها.',
        'هذا اتجاه بنّاء: {packLabel}. أعطني تخصيصاً رقمياً متحفظاً وسأدرسه بجدية أمام الجهة المعتمدة.'],
      en: ['The {packLabel} idea deserves a pause — it touches my real worry. If we build it with reasonable numbers, we might reach a formula I can defend.',
        'That\u2019s a constructive direction: {packLabel}. Give me a conservative numeric version and I\u2019ll study it seriously before the approving body.']
    },
    optionPartial: {
      ar: ['في {packLabel} شيء من الجدوى لكنه لا يكفي وحده — {constraint} يظل قائماً. طوّرها أكثر وسأدرسها.',
        'بداية جيدة لكنها ناقصة: {packLabel} يفتقر إلى إطار زمني ومعايير قياس. اكتملها وسنتحدث.'],
      en: ['There\u2019s something workable in {packLabel}, but not enough on its own — {constraint} still stands. Develop it further and I\u2019ll consider it.',
        'A promising start but incomplete: {packLabel} lacks a timeframe and measurement standards. Complete it and we\u2019ll talk.']
    },
    optionReject: {
      ar: ['هذا الخيار لا يحل مشكلتي الأساسية — {constraint} يبقى كما هو. لدينا مساحة للحل في غير هذا الاتجاه.'],
      en: ['That option doesn\u2019t solve my core problem — {constraint} remains as is. We have room for a solution in another direction.']
    },
    acceptOffer: {
      ar: ['حسناً، الصيغة التي عرضتها الآن أستطيع الدفاع عنها: {terms}. أقترح أن نوثّقها ونختم بها الجلسة — وأشكرك على طريقة الوصول إليها.',
        'موافق. {terms} — صيغة أستطيع تحملها أمام الجهات المعتمدة. لنختم الجلسة بهذا التوثيق.'],
      en: ['Very well, the formula you just proposed is one I can defend: {terms}. I suggest we document it and close the session — and credit the way you reached it.',
        'Agreed. {terms} — a formula I can carry before the approving bodies. Let\u2019s close the session with that documented.']
    },
    counterOffer: {
      ar: ['قريب، لكن ليس بعد. ما أستطيع تحمله اليوم: {counter}. وهذا ليس موقفاً تفاوضياً بل حدود {constraint}.',
        'لن أكذب عليك: {counter} هو أقصى ما يستقيم مع {constraint} في هذه المرحلة. إن كان عندك مسوّغ معياري أقوى فأنا مستمع.'],
      en: ['Close, but not yet. What I can carry today: {counter}. And that\u2019s not a bargaining position — it\u2019s the edge of {constraint}.',
        'I won\u2019t deceive you: {counter} is the most that squares with {constraint} at this stage. If you have a stronger standards-based justification, I\u2019m listening.']
    },
    rejectOffer: {
      ar: ['هذا الرقم لا يمكنني قبوله مطلقاً — يتجاوز {constraint} بحيث يعرّضني للمساءلة. طموحك مفهوم، لكن المسار أمامنا ليس هذا.',
        'كما أخبرتك في البداية: {constraint}. أي صيغة تتجاوزه أحتاج لها مسوّغاً معيارياً موثقاً لا إصراراً.'],
      en: ['That number I simply cannot accept — it crosses {constraint} in a way that exposes me to accountability. Your ambition is understandable, but this isn\u2019t the route.',
        'As I told you at the start: {constraint}. Any formula breaching it needs a documented standards-based justification, not insistence.']
    },
    cpProposal: {
      ar: ['دعني أخفف عنك الطريق بما أستطيع عرضه من طرفي: {counter}. أستطيع الدفاع عن هذا أمام الجهات، وهو في رأيي منطقة التقاء واقعية.',
        'سأضع على الطاولة ما لدي: {counter}. هذا سقفي المتاح ضمن {constraint}، وأظنه أرضية تفاهم معقولة.'],
      en: ['Let me shorten your path with what I can offer from my side: {counter}. I can defend that before the bodies, and in my view it\u2019s a realistic landing zone.',
        'I\u2019ll put on the table what I have: {counter}. That is my available ceiling within {constraint}, and I believe it\u2019s a reasonable meeting ground.']
    },
    /* Context-aware clarification. These are not generic error strings:
       each one names the last proposal, the pending question or the
       dimension currently in dispute, and offers concrete next moves. */
    clarifyPending: {
      ar: ['لم أتبيّن ما إذا كنت تجيب عن سؤالي: «{pending}». هل يمكنك تحديد موقفك منه بكلماتك، لا برقم فقط؟',
        'سؤالي السابق كان: «{pending}». وإجابتك تحتمل أكثر من معنى؛ وضّح لي: هل توافق على مضمونه أم تتحفظ عليه، ولماذا؟'],
      en: ['I could not tell whether you were answering my question: “{pending}”. Could you state your position on it in your own words, not just a number?',
        'My earlier question was: “{pending}”. Your reply admits more than one meaning; clarify whether you agree with its substance or reserve judgment, and why.']
    },
    clarifyCounter: {
      ar: ['لم يتبيّن لي موقفك من الصيغة الأخيرة: {lastProposal}. هل تقبلها، أم ترى تعديلاً على {dim}؟ وإن كان تعديلاً فبأي قيمة؟',
        'أريد أن أفهم قصدك على نحو صحيح: حديثك يحتمل أن يكون اعتراضاً على {dim}، أو طلباً لتوضيح {lastProposal}. أيّهما تقصد؟',
        'حتى لا أبني على فهم خاطئ: هل تقصد تعديلاً على {dim}، أم سؤالاً عن {constraint}؟ وكلاهما مدخل مشروع للحوار.'],
      en: ['I could not pin down your position on the last formula: {lastProposal}. Do you accept it, or do you see a change to {dim}? If a change, at what value?',
        'I want to understand you correctly: your message could be an objection to {dim}, or a request to clarify {lastProposal}. Which do you mean?',
        'So that I do not build on a misreading: do you mean a change to {dim}, or a question about {constraint}? Both are legitimate ways into the discussion.']
    },
    clarifyOpen: {
      ar: ['قبل أن نبني على ما ذكرت، أحتاج إلى تحديد بؤرة الحوار: هل تقصد {dimA} أم {dimB}؟ ويمكنك أيضاً أن تطرح اعتراضاً على {constraint} وسأتعامل معه.',
        'حديثك يحمل أكثر من احتمال. ما الأقرب إلى قصدك: تعديل على {dimA}، أم سؤال عن {dimB}، أم ملاحظة على {constraint}؟'],
      en: ['Before we build on what you said, I need to locate the focus: do you mean {dimA} or {dimB}? You may also raise an objection to {constraint}, and I will address it.',
        'Your message carries more than one possibility. Which is closest to your intent: a change to {dimA}, a question about {dimB}, or a remark on {constraint}?']
    },
    acknowledgeExplanation: {
      ar: ['أقدّر هذا التوضيح، فهو يفسّر دوافعك لا موقفك فقط. إذا كان ما ذكرته هو الأساس، فالمساحة التي أستطيع العمل داخلها هي {constraint}؛ فما القيمة التي تطلبها على {dim} في ضوء ذلك؟',
        'توضيحك مقبول منطقياً، ويغيّر زاوية نظري إلى حدّ ما. لكن {constraint} يظل حداً لا أتجاوزه منفرداً. هل نبني على {dim} رقماً محدداً؟'],
      en: ['I appreciate that explanation; it clarifies your motives, not merely your position. If that is the basis, the space I can work within is {constraint}; so what value do you seek on {dim} in light of it?',
        'Your explanation is logically sound and shifts my view somewhat. But {constraint} remains a limit I cannot cross alone. Shall we build a specific number on {dim}?']
    },
    handleObjection: {
      ar: ['اعتراضك على {dim} مفهوم، ولا أتجاهله. لكن {constraint} هو ما يحكم مرونتي؛ فهل نقترح معالجة للاعتراض داخل هذا الحد؟',
        'أسمع تحفظك على {dim}، وهو تحفظ مشروع. ما الذي يجعله غير كافٍ تحديداً: القيمة أم الضمانات المصاحبة؟'],
      en: ['Your objection on {dim} is understandable, and I do not ignore it. But {constraint} governs my flexibility; shall we address the objection within that limit?',
        'I hear your reservation on {dim}, and it is legitimate. What exactly makes it insufficient: the value or the accompanying safeguards?']
    },
    handleRejection: {
      ar: ['أتفهم رفضك للصيغة الأخيرة. لكن الرفض وحده لا يحرّك الملف؛ ما الذي يجعلها غير كافية: {dim}، أم الضمانات، أم الإطار الزمني؟',
        'سجّلت رفضك بوضوح. لأفهم حدود اعتراضك: هل ترفض المبدأ، أم ترى أن {dim} تحديداً يحتاج قيمة أخرى؟'],
      en: ['I understand your rejection of the last formula. But rejection alone does not move the file; what makes it insufficient: {dim}, the safeguards, or the timeframe?',
        'I have recorded your rejection clearly. To understand its limits: do you reject the principle, or does {dim} specifically need another value?']
    },
    handleRejectionShort: {
      ar: ['أفهم أنك ترفض الصيغة السابقة؛ ولذلك سأتعامل مع ما ذكرته الآن بوصفه اقتراحاً بديلاً لا مجرد اعتراض.',
        'رفضك واضح، واقتراحك الجديد هو ما سأدرسه الآن.'],
      en: ['I understand that you reject the previous formula; I will therefore treat what you have just stated as an alternative proposal, not merely an objection.',
        'Your rejection is clear, and your new proposal is what I will examine now.']
    },
    handleConditional: {
      ar: ['إذا كان شرطك هو «{condition}»، فهذا شرط قابل للنقاش. ما أستطيع التزامه داخل {constraint} هو {counter}؛ فهل يقترب هذا من شرطك؟',
        'أفهم أن قبولك مرهون بـ«{condition}». لنختبر ذلك عملياً: {counter} هو ما يمكنني حمله الآن؛ فهل يكفي لتحقيق شرطك؟'],
      en: ['If your condition is “{condition}”, it is open to discussion. What I can commit to within {constraint} is {counter}; does that come close to your condition?',
        'I understand that your acceptance is contingent on “{condition}”. Let us test it practically: {counter} is what I can carry now; is it enough to satisfy your condition?']
    },
    acceptConditional: {
      ar: ['أقبل الصيغة على أساس الشرط الذي ذكرته: «{condition}». {terms} — على أن يُوثّق الشرط صراحة في المحضر.',
        'موافق، بشرط أن يُثبت في المحضر: «{condition}». والصيغة هي: {terms}.'],
      en: ['I accept the formula on the basis of the condition you stated: “{condition}”. {terms} — provided the condition is explicitly documented in the minutes.',
        'Agreed, on condition that the minutes record: “{condition}”. The formula is: {terms}.']
    },
    counterConditional: {
      ar: ['شرطك «{condition}» مفهوم، لكن ما أستطيع حمله الآن هو {counter}؛ فهل يحقق هذا الشرط بما يكفي؟',
        'لا أستطيع تجاوز {constraint}، لكن {counter} يمثل أقصى ما يمكنني تقديمه الآن مقابل شرطك «{condition}». فهل نقترب من الاتفاق؟'],
      en: ['Your condition “{condition}” is understandable, but what I can carry now is {counter}; does that satisfy it sufficiently?',
        'I cannot cross {constraint}, but {counter} is the most I can offer now against your condition “{condition}”. Are we approaching agreement?']
    },
    handlePositionChange: {
      ar: ['سجّلت أن موقفك تغيّر من {old} إلى {new} على {dim}. هذا تحرّك مهم، وأقدّر صراحتك فيه. هل هذا موقفك النهائي أم نقطة انطلاق للحوار؟',
        'ألاحظ أنك عدت عن قيمة سابقة على {dim} ({old}) إلى {new}. أتعامل مع هذا باعتباره موقفك الحالي، وأقترح أن نبني عليه.'],
      en: ['I have noted that your position moved from {old} to {new} on {dim}. That is an important move, and I appreciate your candour. Is it your final position or a starting point?',
        'I notice you moved from an earlier value on {dim} ({old}) to {new}. I will treat this as your current position and suggest we build on it.']
    },
    handleMindChange: {
      ar: ['أقدّر أنك أعدت النظر في موقفك؛ هذا ليس ضعفاً بل مرونة. سأتعامل مع {new} كأساس جديد، لكنني أذكّر بأن {old} كان قد ذُكر سابقاً؛ فهل نثبت التغيير في محضر الجلسة؟',
        'أعدت النظر في موقفك، وهذا حقك الطبيعي في التفاوض. سأسجّل الانتقال من {old} إلى {new} على {dim}، وأعيد ترتيب حسابي على أساسه.'],
      en: ['I appreciate that you reconsidered; that is flexibility, not weakness. I will treat {new} as the new basis, while noting that {old} was stated earlier; shall we record the change in the minutes?',
        'You have reconsidered, which is your natural right in negotiation. I will record the move from {old} to {new} on {dim} and reorder my calculation accordingly.']
    },
    handleMindChangeGeneral: {
      ar: ['أقدّر إعلانك إعادة النظر في موقفك. ما الذي تغيّر تحديداً: القيمة على {dim}، أم ترتيب أولوياتك؟',
        'إعادة النظر خطوة مشروعة. لأبني عليها بدقة: ما الموقف الجديد الذي تريد أن أسجّله على {dim}؟'],
      en: ['I appreciate your announcement that you are reconsidering. What exactly changed: the value on {dim}, or your order of priorities?',
        'Reconsidering is a legitimate step. So that I build on it precisely: what new position should I record on {dim}?']
    },
    handleDefer: {
      ar: ['لا بأس بتأجيل الحسم؛ القرار المتعجل قد يضر الطرفين. أقترح أن نثبّت ما تحقق من نقاط، وأن نحدد موعداً لاستئناف {dim}.',
        'أحترم رغبتك في التأجيل. قبل ذلك، دعنا نوثّق النقاط التي اقتربت من الاتفاق حتى لا نبدأ من الصفر.'],
      en: ['Deferring the decision is acceptable; a hasty decision may harm both sides. I suggest we record the points already achieved and set a date to resume {dim}.',
        'I respect your wish to defer. Before that, let us document the points that came close to agreement so we do not start from scratch.']
    },
    handleApology: {
      ar: ['أقبل اعتذارك، وأقدّر تحمّلك المسؤولية علناً. هذا يخفف الاحتقان ويفتح باب الحل. لننتقل إلى ما يمكن إنجازه اليوم.',
        'الاعتذار الصريح خطوة مهمة، وأنا أقبله. المطلوب الآن أن يقترن بمسار واضح؛ فما الخطوة العملية التالية؟'],
      en: ['I accept your apology, and I appreciate your taking responsibility openly. That eases the tension and opens the way to a solution. Let us move to what can be done today.',
        'A clear apology is an important step, and I accept it. It now needs a clear path; what is the practical next step?']
    },
    handleSmalltalk: {
      ar: ['أشكر سؤالك، وأنا بخير. أفضّل أن نستثمر الوقت في ملف {topic}، لكن لا مانع من لحظة إنسانية قبل العودة إليه.',
        'أقدّر هذا التواصل الإنساني. لنعد بعد قليل إلى {topic}؛ فما الذي تريد أن نبدأ به؟'],
      en: ['Thank you for asking; I am well. I would rather invest the time in the {topic} file, though a human moment before returning to it is welcome.',
        'I appreciate this human exchange. Let us return shortly to {topic}; what would you like us to begin with?']
    },
    handleUnrelated: {
      ar: ['هذا سؤال خارج نطاق ملف {topic}، وسأجيب عنه باختصار: {answer}. أما ما يخدم جلستنا الآن فهو أن نعود إلى {dim}.',
        'لا أملك في هذه الجلسة معطيات موثوقة عن هذا الموضوع؛ وما أستطيع تأكيده أن الحوار يبقى داخل {topic}. هل نعود إلى {dim}؟'],
      en: ['That question falls outside the {topic} file, and I will answer it briefly: {answer}. What serves our session now is to return to {dim}.',
        'I have no reliable data on that subject inside this session; what I can affirm is that the dialogue remains within {topic}. Shall we return to {dim}?']
    },
    handleConfusion: {
      ar: ['سأوضح بلا تعقيد: {explanation}',
        'التوضيح المطلوب مشروع. {explanation}'],
      en: ['Let me explain without complication: {explanation}',
        'The requested clarification is legitimate. {explanation}']
    },
    handleQuestionTerms: {
      ar: ['الصيغة المطروحة الآن هي: {lastProposal}. والقيود الحاكمة هي {constraint}. أي بند تريد أن نفصّله أولاً: {dimA} أم {dimB}؟',
        'باختصار: {lastProposal}. وأثر ذلك يظهر أساساً في {dim}. هل تريد أن نشرح القيمة أم الضمانات المصاحبة؟'],
      en: ['The formula on the table is: {lastProposal}. The governing constraints are {constraint}. Which item shall we detail first: {dimA} or {dimB}?',
        'In short: {lastProposal}. Its effect appears mainly in {dim}. Would you like to discuss the value or the accompanying safeguards?']
    },
    handleQuestionWhy: {
      ar: ['{why}', '{why}'],
      en: ['{why}', '{why}']
    },
    handleQuestionHow: {
      ar: ['الطريق العملي هو أن نثبت أولاً قيمة على {dim} داخل {constraint}، ثم نربطها بضمانة قابلة للقياس. فإن اتفقنا على القيمة، يصبح التوثيق خطوة تالية لا عقبة.',
        'نبدأ من البند الأكثر أثراً: {dim}. نحدد له قيمة، ثم نضيف ضمانة زمنية أو معيارية تجعل الاتفاق قابلاً للدفاع أمام المراجعة.'],
      en: ['The practical path is to fix a value on {dim} within {constraint}, then attach a measurable safeguard. If we agree the value, documentation becomes the next step rather than an obstacle.',
        'We start with the most consequential item: {dim}. We set its value, then add a time-bound or standards-based safeguard that makes the agreement defensible in review.']
    },
    handleQuestionWhen: {
      ar: ['لا أستطيع تحديد موعد نهائي قبل أن نتفق على {dim}. لكن إذا ثبتت القيمة اليوم، يمكن أن يكون التنفيذ على مراحل تبدأ فوراً.',
        'الموعد مرتبط بما نتفق عليه على {dim}. أعطني قيمة واقعية، وأستطيع أن ألتزم بجدول زمني واضح داخل {constraint}.'],
      en: ['I cannot set a final date before we agree on {dim}. But if the value is fixed today, implementation can be phased and begin immediately.',
        'The date depends on what we agree for {dim}. Give me a realistic value, and I can commit to a clear timetable within {constraint}.']
    },
    handleAgreementNoDeal: {
      ar: ['أوافقك على الفهم، لكن الاتفاق يحتاج صيغة محددة لا نيّة عامة. هل نثبت {dim} بقيمة واضحة الآن؟',
        'اتفاقنا على المبدأ جيد، لكنه لا يكفي للتوثيق. ما القيمة التي تراها مناسبة على {dim}؟'],
      en: ['I agree with your understanding, but an agreement needs a specific formula, not a general intention. Shall we fix {dim} at a clear value now?',
        'Agreement on principle is good, but it is not enough to document. What value do you see as appropriate for {dim}?']
    },
    handleInterestStatement: {
      ar: ['أفهم أن ما يهمك هو {interest}. هذا يفسّر موقفك، ويساعدني على البحث عن صيغة تخدم هذا الاهتمام داخل {constraint}.',
        'شكراً لأنك أوضحت مصلحتك: {interest}. سأضعها في الاعتبار، فما الوزن النسبي الذي تعطيه لها مقابل {dim}؟'],
      en: ['I understand that what matters to you is {interest}. That explains your position and helps me search for a formula serving that interest within {constraint}.',
        'Thank you for clarifying your interest: {interest}. I will take it into account; what relative weight do you give it against {dim}?']
    },
    answerPendingBatna: {
      ar: ['أقدّر أنك أوضحت بديلك بهدوء. هذا لا يغيّر {constraint}، لكنه يجعلني أكثر جدية في البحث عن صيغة قبل أن نصل إلى البديل.',
        'فهمت بديلك. الوجود خارج الطاولة ممكن، لكنه ليس مجانياً على الطرفين. ما الذي يجعلك تفضّل الاتفاق على البديل؟'],
      en: ['I appreciate that you stated your alternative calmly. It does not change {constraint}, but it makes me more serious about finding a formula before reaching that alternative.',
        'I understand your alternative. Leaving the table is possible, but it is not costless for either side. What makes you prefer agreement to the alternative?']
    },
    answerPendingInterests: {
      ar: ['أشكرك على هذه الإجابة. ما فهمته أن أولويتك هي {interest}. هل أفهم أن {dim} أقل أهمية بالنسبة إليك؟',
        'إجابتك مفيدة. سأبني عليها: {interest} في المقدمة، ثم {dim}. هل هذا ترتيبك؟'],
      en: ['Thank you for that answer. What I understand is that your priority is {interest}. May I take it that {dim} is less important to you?',
        'Your answer is useful. I will build on it: {interest} first, then {dim}. Is that your ordering?']
    },
    handleUncertain: {
      ar: ['لا بأس أن تكون غير حاسم بعد؛ التفاوض لا يفرض يقيناً فورياً. ما الذي ينقصك للحسم: رقم واضح، أم ضمان، أم توضيح من جهتي؟',
        'أتفهم التردد. لنحوّله إلى سؤال عملي: ما الشرط الذي لو تحقق لقلت «نعم»؟'],
      en: ['It is acceptable not to be decisive yet; negotiation does not demand immediate certainty. What do you lack in order to decide: a clear number, a safeguard, or a clarification from me?',
        'I understand the hesitation. Let us turn it into a practical question: what condition, if met, would make you say “yes”?']
    },
    handlePartialAccept: {
      ar: ['أفهم أنك تقبل جزءاً وتتحفظ على {dim}. هذا مسار واقعي؛ لنثبت الجزء المقبول ونفاوض على الباقي.',
        'القبول الجزئي خطوة ذكية. ما الجزء الذي تقبله بالضبط، وما الجزء الذي تريد تعديله؟'],
      en: ['I understand that you accept part and reserve judgment on {dim}. That is a realistic path; let us fix the accepted part and negotiate the rest.',
        'Partial acceptance is a smart step. Which part do you accept exactly, and which part do you want changed?']
    },
    handleAnswerPending: {
      ar: ['أشكرك على إجابتك. سؤالي كان لاختبار وضوح الموقف لا لإحراجك؛ وما فهمته أن {summary}.',
        'إجابتك تصلح أساساً للحوار. سأربطها بـ{dim}، فإن كان لديك رقم محدد فأذكره.'],
      en: ['Thank you for your answer. My question was meant to test the clarity of the position, not to embarrass you; what I understood is that {summary}.',
        'Your answer is a workable basis for dialogue. I will connect it to {dim}; if you have a specific number, state it.']
    },
    handleQuestionGeneral: {
      ar: ['سؤال وجيه. الإجابة المختصرة: {constraint} يحكم قراري، وما دام قائماً فمرونتي محدودة. لكن أخبرني: ما الذي تبحث عنه تحديداً في إجابتي؟',
        'سؤال في محله. دعني أجبك بشفافية: {constraint}. وهنا سؤالي لك بالمقابل: {ask}'],
      en: ['A fair question. The short answer: {constraint} governs my decision, and while it stands my flexibility is limited. But tell me: what exactly are you looking for in my answer?',
        'A good question. Let me answer transparently: {constraint}. And here is my question back: {ask}']
    },
    explorationBeat: {
      ar: ['قبل أن نتمادى في المواقف، دعني أسأل: ما أسوأ سيناريو تتصوره لو لم نتفق؟ أجده مفيداً في ترتيب أولوياتنا.',
        'أريد أن أفهم شيئاً واحداً جيداً: ما الذي لا يمكنكم التنازل عنه مطلقاً في هذا الملف؟'],
      en: ['Before we dig into positions, let me ask: what\u2019s the worst scenario you imagine if we don\u2019t agree? I find it useful for ordering priorities.',
        'I want to understand one thing properly: what can you absolutely not concede in this file?']
    },
    urgency: {
      ar: ['بقي من وقت الجلسة القليل، ومواقفنا معروفة. أقترح أن نجمع ما بيننا في صيغة واحدة الآن.',
        'لنغتنم ما بقي من الجلسة: ما أرضية الحل التي تتحملها إدارتكم؟'],
      en: ['Little session time remains and our positions are clear. I suggest we gather what\u2019s between us into one formula now.',
        'Let\u2019s use what\u2019s left of the session: what settlement floor can your administration bear?']
    },
    finalOffer: {
      ar: ['هذه آخر صيغة أستطيع حملها اليوم: {counter}. أقبلها نختم، وأرجّئها نلتقي لاحقاً — لكنها لن تتحسن.'],
      en: ['This is the last formula I can carry today: {counter}. Accept and we close; postpone and we meet later — but it won\u2019t improve.']
    },
    timeout: {
      ar: ['انتهى وقت الجلسة المقرر. أشكر لك الحوار، وما لم نحسمه اليوم يمكن بناؤه في جلسة قادمة.'],
      en: ['The allotted session time has ended. I thank you for the dialogue — what we haven\u2019t settled today can be built in a coming session.']
    },
    walkaway: {
      ar: ['يبدو أن أرضياتنا لا تلتقي اليوم. أشكر لك الجلسة، وأرجو أن نحافظ على الاحترام حتى مع تعذر الاتفاق.'],
      en: ['It seems our floors don\u2019t meet today. I thank you for the session, and I hope we keep respect even without agreement.']
    },
    closingNoDeal: {
      ar: ['تطلب الإغلاق بلا صيغة على الطاولة؟ وثّق لي أولاً ما تقترح بالضبط، وسنرى إن كان قابلاً للحمل.'],
      en: ['You\u2019re asking to close with no formula on the table? Document exactly what you propose first, and we\u2019ll see if it\u2019s carriable.']
    },
    facilitation: {
      ar: ['طريقة ممتازة في إدارة الجلسة — أقدّر الترتيب. لنسر بهذا النظام: نقطة نقطة.'],
      en: ['An excellent way to run the session — I appreciate the structure. Let\u2019s proceed in that order, point by point.']
    }
  };

  /* counterpart questions it may throw at the trainee */
  const CPQ = {
    ar: ['ما الذي يجعلك واثقاً أن هذا الطلب يحسّن الخدمة فعلاً؟',
      'ما مؤشرات الأداء التي ستقبل أن تُقاس بها نتائج هذا القرار؟',
      'إن لم نتفق اليوم، فما خطتكم العملية البديلة؟',
      'ما الذي يحميك أنت نظامياً إن قبلتُم هذه الصيغة؟',
      'كيف تضمن أن هذا الاتفاق لن يتحول إلى سابقة ملزمة لكم؟',
      'من الجهة التي ستراجع نتائج هذا القرار عندكم، ومتى؟'],
    en: ['What makes you confident this request genuinely improves the service?',
      'Which performance indicators will you accept being measured by for this decision?',
      'If we don\u2019t agree today, what\u2019s your practical fallback plan?',
      'What procedurally protects YOU if you accept this formula?',
      'How do you guarantee this agreement won\u2019t become a binding precedent for you?',
      'Who reviews the outcomes of this decision on your side, and when?']
  };

  /* ============ session creation ============ */
  const MAX_TURNS = 16;

  function createSession(scenario, opts) {
    opts = opts || {};
    if (!scenario) throw new Error('scenario required');
    const lang = opts.lang || 'ar';
    const rng = TF.mulberry32(TF.hashSeed(opts.seed || TF.uid()));
    const persona = TFS.PERSONALITIES[scenario.personality] || TFS.PERSONALITIES.pragmatic;

    const session = {
      id: opts.id || TF.uid(),
      scenarioId: scenario.id || 'custom',
      custom: scenario.custom ? scenario : null,
      scenario, lang,
      userName: opts.userName || '',
      userStyle: opts.userStyle || null,
      coachOn: opts.coachOn !== false,
      startedAt: TF.todayISO(),
      turns: 0, maxTurns: MAX_TURNS,
      capped: false,
      phase: 'opening',
      messages: [],
      ratings: [],
      flags: {
        askedInterests: 0, citedCriteria: 0, proposedOption: 0, rapportMoves: 0,
        aggressionStrikes: 0, batnaStated: 0, paraphrased: 0, questionsAsked: 0,
        concessionsByUser: 0, offersByUser: 0, packagesMatched: [], counterpartQuestionsAsked: 0
      },
      cp: {
        persona,
        trust: persona.rigidity > 0.7 ? 30 : 40,
        mood: 'neutral',
        position: {},           /* dimension id -> current cp position */
        acceptedDeal: null,     /* {values, terms} */
        pendingDeal: null,
        revealedInterests: [],
        askedQuestion: null,
        lastCounter: null,
        lastCounterText: '',
        lastCounterDim: null,
        pendingQuestion: null   /* {kind, text, dimId} — an unanswered cp question */
      },
      dialogue: TDG.initState(),
      outcome: null,
      ended: false, endReason: null,
      rng
    };

    for (const d of scenario.dimensions || []) session.cp.position[d.id] = d.cpStart;

    const openingMsg = { role: 'cp', text: L(scenario.counterpart.opening, lang), ts: Date.now(), meta: { opening: true } };
    session.messages.push(openingMsg);
    return session;
  }

  /* ============ the user turn ============ */
  function userTurn(session, text) {
    if (session.ended) return { ended: true, messages: [] };
    const lang = session.lang;
    const rng = session.rng;

    const a = TFA.analyze(text, lang);
    const isOpening = session.turns === 0;
    const rating = TFE.rateMessage(a, { isOpening });
    rating.valid = rating.valid && a.wordCount > 0 && !a.empty;

    const userMsg = { role: 'user', text: String(text || '').trim(), ts: Date.now(), rating, analysis: { intents: a.intents, tone: a.tone, questionCount: a.questionCount } };
    session.messages.push(userMsg);
    session.ratings.push(rating);
    session.turns++;

    const frame = TDG.interpret(session, text, a);
    const cp = session.cp, P = cp.persona, F = session.flags;
    const pendingBefore = cp.pendingQuestion;
    const dims = session.scenario.dimensions || [];

    /* flags */
    if (a.intents.questionInterests) F.askedInterests++;
    if (a.intents.criteria) F.citedCriteria++;
    if (a.intents.option) F.proposedOption++;
    if (a.tone.rapport > 0) F.rapportMoves++;
    if (a.intents.batna) F.batnaStated++;
    if (a.intents.paraphrase) F.paraphrased++;
    if (a.questionCount > 0) F.questionsAsked++;
    if (a.intents.concede) F.concessionsByUser++;
    if (a.intents.offer || Object.keys(frame.proposalValues || {}).length) F.offersByUser++;
    if (a.tone.rapport > 0) cp.trust = clamp(cp.trust + 5 * P.rapportSensitivity * a.tone.rapport, 0, 100);
    if (a.intents.questionInterests) cp.trust = clamp(cp.trust + 6 * P.trustGrowth, 0, 100);
    if (a.intents.criteria) cp.trust = clamp(cp.trust + 4 * P.criteriaRespect, 0, 100);
    if (a.tone.aggressive > 0) {
      cp.trust = clamp(cp.trust - 12 * P.aggressionSensitivity, 0, 100);
      F.aggressionStrikes += a.tone.aggressive;
      cp.mood = 'tense';
    } else if (a.tone.rapport > 1 && cp.mood !== 'tense') cp.mood = 'warm';
    if (a.intents.batna && !a.intents.threat) cp.trust = clamp(cp.trust + 3, 0, 100);

    /* update phase */
    if (session.phase === 'opening' && session.turns >= 2) session.phase = 'exploration';
    if ((session.phase === 'exploration') && (session.flags.offersByUser > 0 || session.flags.proposedOption > 0)) session.phase = 'bargaining';
    if (session.phase === 'bargaining' && (session.turns >= 10 || cp.acceptedDeal)) session.phase = 'closing';

    /* ------- build the counterpart reply ------- */
    const replies = [];
    let endState = null;
    const slots = Object.assign(makeSlots(session), TDG.slots(session, frame));
    const values = frame.proposalValues || {};
    const hasValues = Object.keys(values).length > 0;
    const lastProposal = frame.lastProposal;

    /* Record the trainee's move before choosing the reply. */
    TDG.remember(session, frame);

    /* An answer consumes the counterpart's pending question. A new
       question may be registered after the reply is built. */
    if (frame.pendingAnswer) cp.pendingQuestion = null;

    function say(tpl, meta) {
      const m = cpMsg(session, pick(rng, tpl[lang]), slots, meta);
      replies.push(m);
      return m;
    }
    function setCounter(next, meta) {
      slots.counter = termsText(session, next, lang);
      applyPositions(session, next);
      cp.lastCounter = Object.assign({}, next);
      cp.lastCounterText = slots.counter;
      cp.lastCounterDim = salientDimId(session, frame, next);
      return slots.counter;
    }
    function finish(type) {
      endState = endSession(session, type, a);
      for (const r of replies) session.messages.push(r);
      return { messages: replies, ended: true, endState, rating, analysis: a };
    }
    function sealQualitative() {
      const terms = packageFormula(session) ||
        (lang === 'ar' ? 'صيغة تفاهم تحفظ مصالح الطرفين معاً' : 'a formula preserving both sides\u2019 interests');
      cp.acceptedDeal = { values: {}, terms };
      slots.terms = terms;
      session.phase = 'closing';
      say(BANK.acceptOffer, { accepted: true });
      return finish('agreement');
    }

    /* 0. repeated aggression: the counterpart leaves the table */
    if (F.aggressionStrikes >= 4 && a.tone.aggressive > 0) {
      say(BANK.aggressionFinal);
      return finish('cp_walk');
    }

    /* 1. a deal is already on the table and the trainee confirms it */
    if (cp.acceptedDeal && (frame.acts.close || (frame.acts.accept && !hasValues))) {
      slots.terms = cp.acceptedDeal.terms || termsText(session, cp.acceptedDeal.values || {}, lang);
      say(BANK.acceptOffer, { accepted: true, values: cp.acceptedDeal.values || {} });
      return finish('agreement');
    }

    /* 2. threats and aggression take precedence over substance */
    if (frame.acts.threat) {
      say(BANK.threat);
      cp.trust = clamp(cp.trust - 8, 0, 100);
    } else if (a.tone.aggressive > 0) {
      say(BANK.aggression);
      hardenPositions(session, 0.1);
    }
    /* 3. a concrete numeric proposal or counter-proposal */
    else if (hasValues) {
      const ev = evaluateOffer(session, a, rng, values);
      if (ev.accepted) {
        const terms = termsText(session, ev.values, lang);
        slots.terms = terms;
        applyPositions(session, ev.values);
        cp.acceptedDeal = { values: Object.assign({}, ev.values), terms };
        session.phase = 'closing';
        if (frame.condition) {
          slots.condition = frame.condition;
          say(BANK.acceptConditional, { accepted: true, values: ev.values });
        } else {
          say(BANK.acceptOffer, { accepted: true, values: ev.values });
        }
        if (frame.acts.close) return finish('agreement');
      } else if (ev.countered) {
        setCounter(ev.counter);
        if (frame.condition) {
          slots.condition = frame.condition;
          say(BANK.counterConditional, { counter: ev.counter });
        } else {
          say(BANK.counterOffer, { counter: ev.counter });
        }
      } else {
        const revised = ev.revised || currentPositions(session);
        if (ev.revised) applyPositions(session, ev.revised);
        slots.counter = termsText(session, revised, lang);
        say(BANK.rejectOffer);
      }
    }
    /* 4. an option or package proposal (qualitative or pre-numeric).
       This precedes apology/small-talk because a concrete proposal may
       legitimately contain an apology as one of its components. */
    else if (frame.acts.proposeOption && a.intents.offer && !hasValues) {
      const pk = matchPackage(session, a.raw);
      if (pk && pk.fit >= 2) {
        if (F.packagesMatched.indexOf(pk.id) === -1) F.packagesMatched.push(pk.id);
        slots.packLabel = L(pk.label, lang);
        say(BANK.optionEnthusiastic, { package: pk.id });
        softenPositions(session, 0.3);
      } else if (pk && pk.fit === 1) {
        slots.packLabel = pk ? L(pk.label, lang) : (lang === 'ar' ? 'الفكرة' : 'the idea');
        say(BANK.optionPartial);
      } else {
        say(BANK.optionReject);
      }
    }
    /* 5. a condition attached to acceptance or rejection, without numbers */
    else if (frame.condition) {
      slots.condition = frame.condition;
      if (dims.length) {
        softenPositions(session, 0.08);
        setCounter(currentPositions(session));
      } else {
        slots.counter = packageFormula(session) ||
          (lang === 'ar' ? 'التزام مكتوب بخطوات محددة' : 'a written commitment with defined steps');
      }
      say(BANK.counterConditional);
    }
    /* 6. explicit acceptance of the last counter on the table, or of a
       qualitative package formula in a scenario without dimensions */
    else if (frame.acts.accept) {
      if (cp.lastCounter || (lastProposal && lastProposal.kind === 'counter')) {
        const deal = cp.lastCounter || (lastProposal && lastProposal.values) || null;
        if (deal) {
          const terms = cp.lastCounterText || termsText(session, deal, lang);
          slots.terms = terms;
          applyPositions(session, deal);
          cp.acceptedDeal = { values: Object.assign({}, deal), terms };
          session.phase = 'closing';
          say(BANK.acceptOffer, { accepted: true, values: deal });
          return finish('agreement');
        }
      }
      if (!dims.length && F.packagesMatched.length) return sealQualitative();
      say(BANK.handleAgreementNoDeal);
    }
    /* 7. rejection without a new proposal */
    else if (frame.acts.reject) {
      if (frame.wordCount <= 7) say(BANK.handleRejectionShort);
      else say(BANK.handleRejection);
    }
    /* 8. an announced change of position without a new number */
    else if (frame.acts.mindChange) {
      say(BANK.handleMindChangeGeneral);
    }
    /* 9. an objection or reservation */
    else if (frame.acts.object) {
      say(BANK.handleObjection);
    }
    /* 10. deferral, uncertainty, apology or small talk */
    else if (frame.acts.defer) {
      say(BANK.handleDefer);
    } else if (frame.acts.uncertain) {
      say(BANK.handleUncertain);
    } else if (frame.acts.apology) {
      say(BANK.handleApology);
    } else if (frame.acts.smalltalk) {
      say(BANK.handleSmalltalk);
    }
    /* 11. questions, answered from the current state */
    else if (frame.questionKind) {
      const qk = frame.questionKind;
      if (qk === 'interests') {
        const reveal = nextInterest(session);
        if (reveal) {
          slots.interest = L(reveal.text, lang);
          cp.revealedInterests.push(reveal.id);
          say(BANK.revealInterest, { revealed: reveal.id });
        } else {
          slots.ask = contextQuestion(session, frame);
          cp.askedQuestion = 'interests';
          say(BANK.answerQuestion);
        }
      } else if (qk === 'clarify') {
        slots.explanation = TDG.explainState(session, frame);
        say(BANK.handleConfusion);
      } else if (qk === 'why') {
        say(BANK.handleQuestionWhy);
      } else if (qk === 'how') {
        say(BANK.handleQuestionHow);
      } else if (qk === 'when') {
        say(BANK.handleQuestionWhen);
      } else if (qk === 'batna') {
        cp.askedQuestion = 'batna';
        say(BANK.batnaProbe);
      } else if (qk === 'unrelated') {
        slots.answer = TDG.answerOffTopic(session, frame);
        say(BANK.handleUnrelated);
      } else if (qk === 'terms') {
        say(BANK.handleQuestionTerms);
      } else {
        slots.ask = contextQuestion(session, frame);
        cp.askedQuestion = 'generic';
        say(BANK.handleQuestionGeneral);
      }
    }
    /* 12. objective criteria */
    else if (frame.acts.citeCriteria) {
      say(BANK.criteriaRespect);
      softenPositions(session, 0.12 * P.criteriaRespect);
    }
    /* 13. BATNA stated calmly */
    else if (frame.acts.stateBatna) {
      say(BANK.batnaStated);
      softenPositions(session, 0.15);
    }
    /* 14. an explanation of motives or constraints */
    else if (frame.acts.explain) {
      say(BANK.acknowledgeExplanation);
      softenPositions(session, 0.08);
    }
    /* 15. an interest statement rather than a position */
    else if (a.intents.mentionInterests) {
      say(BANK.handleInterestStatement);
    }
    /* 16. facilitation, agenda or paraphrase */
    else if (frame.acts.facilitate || frame.acts.summarize) {
      say(BANK.facilitation);
    }
    /* 17. a concession without a number: reciprocate with a counter */
    else if (frame.acts.concede && !frame.acts.accept) {
      if (dims.length) {
        softenPositions(session, 0.2);
        setCounter(currentPositions(session));
      } else {
        slots.counter = packageFormula(session) ||
          (lang === 'ar' ? 'التزام مكتوب بخطوات محددة' : 'a written commitment with defined steps');
      }
      say(BANK.cpProposal);
    }
    /* 18. greeting or thanks (after questions, so a greeting with a
       question still gets the question answered) */
    else if (frame.acts.greeting) {
      say(BANK.greeting);
    } else if (frame.acts.thanks) {
      say(BANK.rapport);
    }
    /* 19. walking away or closing without a formula */
    else if (frame.acts.walkaway) {
      say(BANK.walkaway);
      return finish('walkaway');
    } else if (frame.acts.close) {
      if (!dims.length && F.packagesMatched.length) return sealQualitative();
      say(BANK.closingNoDeal);
    }
    /* 20. contextual clarification instead of a generic error */
    else if (frame.pendingAnswer) {
      say(BANK.handleAnswerPending);
    } else {
      const kind = TDG.clarifyKind(session, frame);
      say(BANK[kind]);
    }

    /* Remember the counterpart's latest question so the next turn can
       answer it, and so clarification can refer back to it. */
    if (!endState) registerPending(session, replies, frame);

    /* round cap: present the final formula exactly once */
    if (!endState && !cp.acceptedDeal && session.turns >= session.maxTurns && !session.capped) {
      session.capped = true;
      if (dims.length) {
        setCounter(finalOfferPositions(session));
      } else {
        slots.counter = packageFormula(session) ||
          (lang === 'ar' ? 'صيغة تفاهم نهائية تحفظ مصالح الطرفين' : 'a final formula preserving both sides\u2019 interests');
        cp.lastCounterText = slots.counter;
      }
      say(BANK.finalOffer, { final: true });
      session.phase = 'closing';
    }

    /* hard stop one grace message past the cap */
    if (!endState && session.turns > session.maxTurns + 1) {
      if (cp.acceptedDeal) {
        slots.terms = cp.acceptedDeal.terms || termsText(session, cp.acceptedDeal.values || {}, lang);
        say(BANK.acceptOffer, { accepted: true, values: cp.acceptedDeal.values || {} });
        return finish('agreement');
      }
      say(BANK.timeout);
      return finish('timeout');
    }

    for (const r of replies) session.messages.push(r);
    return { messages: replies, ended: false, endState: null, rating, analysis: a };
  }

  /* ---------- context helpers used by the reply planner ---------- */
  function lastQuestion(text) {
    const parts = String(text || '').match(/[^?؟]*[?؟]/g);
    if (!parts || !parts.length) return '';
    return parts[parts.length - 1].replace(/^[\s،,;:]+/, '').trim().slice(0, 240);
  }

  function salientDimId(session, frame, values) {
    const keys = Object.keys(values || {});
    if (!keys.length) return null;
    if (frame && frame.target && frame.target.dimId && keys.indexOf(frame.target.dimId) !== -1) return frame.target.dimId;
    if (frame && frame.topics) {
      const t = frame.topics.find(id => keys.indexOf(id) !== -1);
      if (t) return t;
    }
    return keys[0];
  }

  function contextQuestion(session, frame) {
    const lang = session.lang;
    const dims = session.scenario.dimensions || [];
    const dim = (frame && frame.stickingDim) || dims[0] || null;
    const label = dim ? L(dim.label, lang) : (lang === 'ar' ? 'البند المطروح' : 'the item on the table');
    const dimA = dims[0] ? L(dims[0].label, lang) : label;
    const dimB = dims[1] ? L(dims[1].label, lang) : label;

    if (session.cp.pendingQuestion && session.cp.pendingQuestion.text) {
      return lang === 'ar'
        ? 'لنعد إلى سؤالي السابق: ' + session.cp.pendingQuestion.text
        : 'Let us return to my earlier question: ' + session.cp.pendingQuestion.text;
    }
    if (session.cp.lastCounterText) {
      return lang === 'ar'
        ? `ما الذي ينقص الصيغة المطروحة من وجهة نظرك: القيمة على ${label} أم الضمانات المصاحبة؟`
        : `What is missing from the formula on the table in your view: the value on ${label} or the accompanying safeguards?`;
    }
    if (dims.length > 1) {
      return lang === 'ar'
        ? `ما البند الذي تريد أن نبدأ به: ${dimA} أم ${dimB}؟`
        : `Which item would you like us to begin with: ${dimA} or ${dimB}?`;
    }
    return lang === 'ar'
      ? `ما الخطوة العملية التي تقترحها الآن بخصوص ${label}؟`
      : `What practical step do you propose now regarding ${label}?`;
  }

  function registerPending(session, replies, frame) {
    for (let i = replies.length - 1; i >= 0; i--) {
      const q = lastQuestion(replies[i].text);
      if (!q) continue;
      const dimId = (frame && frame.target && frame.target.dimId) ||
        session.cp.lastCounterDim ||
        (frame && frame.stickingDim && frame.stickingDim.id) || null;
      const previous = session.cp.pendingQuestion && session.cp.pendingQuestion.text;
      session.cp.pendingQuestion = { kind: 'context', text: q, dimId };
      if (previous !== q) session.flags.counterpartQuestionsAsked++;
      return;
    }
  }

  /* ============ offer evaluation ============ */
  function evaluateOffer(session, a, rng, explicitMap) {
    const dims = session.scenario.dimensions || [];
    let explicit;   /* Map dimId -> value */
    if (explicitMap && Object.keys(explicitMap).length) {
      explicit = new Map();
      for (const k of Object.keys(explicitMap)) {
        if (isFinite(explicitMap[k])) explicit.set(k, explicitMap[k]);
      }
    } else {
      explicit = mapNumbersToDims(session, a);
    }
    const vals = {};
    for (const d of dims) vals[d.id] = explicit.has(d.id) ? explicit.get(d.id) : session.cp.position[d.id];

    const trustFactor = 0.5 + session.cp.trust / 200; /* 0.5..1 */
    /* a counterpart commits only once enough trust exists (or late in the session) */
    const canAccept = session.cp.trust >= 50 || session.turns >= 8;

    /* check every dimension the trainee actually offered a number for;
       unmentioned dimensions stay at the counterpart's current position
       (which is always within their own bounds). */
    let ok = true, worstExcess = 0;
    for (const d of dims) {
      if (!explicit.has(d.id)) continue;
      const v = explicit.get(d.id), floor = d.cpFloor;
      let excess = 0;
      if (d.direction === 'more' && v > floor) { ok = false; excess = relExcess(v, floor); }
      if (d.direction !== 'more' && v < floor) { ok = false; excess = relExcess(floor, v); }
      if (excess > worstExcess) worstExcess = excess;
    }

    if (ok && canAccept) return { accepted: true, values: vals, explicit: [...explicit.keys()] };

    /* far beyond tolerance -> firm rejection */
    if (worstExcess > 0.6) {
      const revised = {};
      for (const d of dims) revised[d.id] = session.cp.position[d.id];
      if (session.cp.trust > 55) {
        for (const d of dims) {
          const pos = session.cp.position[d.id], floor = d.cpFloor;
          revised[d.id] = d.direction === 'more'
            ? Math.round(pos + (floor - pos) * 0.12)
            : Math.round(pos - (pos - floor) * 0.12);
        }
      }
      return { accepted: false, countered: false, rejected: true, revised, values: vals };
    }

    /* otherwise counter: move from the current position toward the target
       (the trainee's ask when it is acceptable, the reservation point
       when it is not) — never crossing it in a single step. */
    const counter = {};
    const step = 0.45 * trustFactor;
    for (const d of dims) {
      const pos = session.cp.position[d.id], floor = d.cpFloor;
      if (!explicit.has(d.id)) { counter[d.id] = pos; continue; }
      const v = explicit.get(d.id);
      const target = d.direction === 'more'
        ? (v > floor ? floor : Math.min(v, floor))
        : (v < floor ? floor : Math.max(v, floor));
      const c = d.direction === 'more'
        ? pos + (target - pos) * step
        : pos - (pos - target) * step;
      counter[d.id] = Math.round(clampNum(c, Math.min(pos, floor), Math.max(pos, floor)));
    }
    return { accepted: false, countered: true, counter, values: vals, explicit: [...explicit.keys()] };
  }

  function relExcess(a, b) { return Math.abs(a - b) / Math.max(Math.abs(b), 1); }
  function clampNum(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* Map extracted numbers to dimensions by UNIT, not by order.
     A unit-less dimension also accepts counted people ("12 موظفاً").
     When several numbers share a unit, the one nearest the offer
     wording wins ("نقترح 20% رغم ارتفاع الطلب 40%" -> 20). */
  function mapNumbersToDims(session, a) {
    const dims = session.scenario.dimensions || [];
    const map = new Map();
    if (!dims.length || !a.numbers.length) return map;

    const offerRx = new RegExp(TFA.RXN.offerWords.source, TFA.RXN.offerWords.flags);
    const om = offerRx.exec(a.flat || '');
    const offerIdx = om ? om.index : -1;

    const byCat = {};
    for (const n of a.numbers) {
      if (!isFinite(n.value)) continue;
      const cat = unitCategory(n.unit);
      (byCat[cat] = byCat[cat] || []).push(n);
    }
    const dimCats = {};
    for (const d of dims) {
      const cat = d.unit === '%' ? 'pct' : (d.unit || 'none');
      (dimCats[cat] = dimCats[cat] || []).push(d);
    }

    for (const cat of Object.keys(byCat)) {
      const targets = (cat === 'none' || cat === 'staff')
        ? (dimCats['none'] || []).slice()
        : (dimCats[cat] || []).slice();
      if (!targets.length) continue; /* unit matches no dimension here -> drop */
      let chosen = byCat[cat][0];
      if (byCat[cat].length > 1 && offerIdx >= 0) {
        chosen = byCat[cat].slice().sort((x, y) => Math.abs(x.index - offerIdx) - Math.abs(y.index - offerIdx))[0];
      }
      const d = targets.find(x => !map.has(x.id));
      if (d) map.set(d.id, chosen.value);
    }
    return map;
  }

  function unitCategory(u) {
    const u2 = TFA.normalize(u);
    if (!u2) return 'none';
    if (u2 === '%' || u2 === 'بالمئة' || u2 === 'بالمائه' || u2 === 'percent') return 'pct';
    if (/^(يوم|ايام|day|days)$/.test(u2)) return 'd';
    if (/^(اسبوع|اسابيع|week|weeks)$/.test(u2)) return 'w';
    if (/^(شهر|اشهر|شهور|month|months)$/.test(u2)) return 'mo';
    if (/^(موظف|كادر|كوادر|staff|people)$/.test(u2)) return 'staff';
    return 'other'; /* money and anything unmatched */
  }

  function applyPositions(session, positions) {
    for (const [k, v] of Object.entries(positions)) session.cp.position[k] = v;
  }
  function currentPositions(session) {
    const out = {};
    for (const d of session.scenario.dimensions || []) out[d.id] = session.cp.position[d.id];
    return out;
  }
  function softenPositions(session, amount) {
    for (const d of session.scenario.dimensions || []) {
      const floor = d.cpFloor, pos = session.cp.position[d.id];
      session.cp.position[d.id] = Math.round(d.direction === 'more'
        ? pos + (floor - pos) * amount
        : pos - (pos - floor) * amount);
    }
  }
  function hardenPositions(session, amount) {
    for (const d of session.scenario.dimensions || []) {
      const start = d.cpStart, pos = session.cp.position[d.id];
      session.cp.position[d.id] = Math.round(d.direction === 'more'
        ? pos - (pos - start) * amount
        : pos + (start - pos) * amount);
    }
  }
  function finalOfferPositions(session) {
    const out = {};
    for (const d of session.scenario.dimensions || []) {
      const floor = d.cpFloor;
      const generosity = clamp(0.5 + session.cp.trust / 200, 0.3, 1); /* higher trust -> closer to floor (better for user) */
      const start = d.cpStart;
      out[d.id] = Math.round(d.direction === 'more'
        ? start + (floor - start) * generosity
        : start - (start - floor) * generosity);
    }
    return out;
  }

  function termsText(session, values, lang) {
    const dims = session.scenario.dimensions || [];
    const parts = [];
    for (const d of dims) {
      const v = values[d.id];
      if (v == null) continue;
      const lbl = L(d.label, lang);
      parts.push(lang === 'ar'
        ? `${lbl}: ${v}${d.unit ? ' ' + unitAr(d.unit, v) : ''}`
        : `${lbl}: ${v}${d.unit ? ' ' + unitEn(d.unit, v) : ''}`);
    }
    return parts.join(lang === 'ar' ? '، ' : '; ');
  }
  /* Textual formula assembled from the qualitative packages the trainee
     and the counterpart have already matched (scenarios without dimensions). */
  function packageFormula(session) {
    const matched = (session.flags && session.flags.packagesMatched) || [];
    const labels = (session.scenario.packages || [])
      .filter(p => matched.indexOf(p.id) !== -1)
      .map(p => L(p.label, session.lang));
    return labels.join(session.lang === 'ar' ? '؛ ' : '; ');
  }
  function unitAr(u, v) {
    v = Number(v) || 0;
    if (u === 'mo') return v === 1 ? 'شهر' : (v === 2 ? 'شهرين' : v <= 10 ? 'أشهر' : 'شهراً');
    if (u === 'd') return v === 1 ? 'يوم' : (v === 2 ? 'يومين' : v <= 10 ? 'أيام' : 'يوماً');
    if (u === 'w') return v === 1 ? 'أسبوع' : (v === 2 ? 'أسبوعين' : v <= 10 ? 'أسابيع' : 'أسبوعاً');
    return { '%': '%' }[u] || u;
  }
  function unitEn(u, v) {
    v = Number(v) || 0;
    if (u === 'mo') return v === 1 ? 'month' : 'months';
    if (u === 'd') return v === 1 ? 'day' : 'days';
    if (u === 'w') return v === 1 ? 'week' : 'weeks';
    return { '%': '%' }[u] || u;
  }

  /* package matching for qualitative options */
  function matchPackage(session, text) {
    const packs = session.scenario.packages || [];
    const norm = TFA.normalize(text);
    let best = null;
    for (const p of packs) {
      let fit = 0;
      for (const sig of p.signals) if (norm.includes(TFA.normalize(sig))) fit++;
      if (fit > 0 && (!best || fit > best.fit)) best = { id: p.id, label: p.label, fit };
    }
    return best;
  }

  function nextInterest(session) {
    const interests = (session.scenario.counterpart && session.scenario.counterpart.interests) || [];
    for (const it of interests) {
      if (session.cp.revealedInterests.includes(it.id)) continue;
      if (session.cp.trust >= (it.revealAtTrust || 50)) return it;
    }
    return null;
  }

  /* ============ ending ============ */
  function endSession(session, type, lastAnalysis) {
    if (session.ended) return session.outcome;
    session.ended = true;
    session.endReason = type;
    session.endedAt = TF.todayISO();

    const relationship = relationshipScore(session);
    const dims = session.scenario.dimensions || [];
    let quality = 0, terms = null, label = type;

    if (type === 'agreement') {
      let deal = session.cp.acceptedDeal;
      if (!deal && session.cp.lastCounter) {
        /* nothing formally accepted, but a counter is on the table:
           closing "with agreement" adopts it as the deal */
        deal = { values: { ...session.cp.lastCounter }, terms: termsText(session, session.cp.lastCounter, session.lang) };
        session.cp.acceptedDeal = deal;
      }
      if (deal) {
        terms = { agreed: true, values: deal.values || {}, text: deal.terms };
        quality = dims.length
          ? TFE.scoreOutcome(session, terms, relationship)
          : TFE.scoreOutcome(session, { agreed: true, interestCoverage: qualitativeCoverage(session) }, relationship);
        label = 'agreement';
      } else if (!dims.length) {
        /* qualitative (dialogue) scenario: quality from interest coverage */
        terms = { agreed: true, values: {}, text: '', interestCoverage: qualitativeCoverage(session) };
        quality = TFE.scoreOutcome(session, terms, relationship);
        label = 'agreement';
      } else {
        quality = clamp(20 + Math.round(relationship * 0.15) + (session.flags.packagesMatched.length ? 8 : 0), 0, 45);
        terms = { agreed: false };
        label = 'timeout';
      }
    } else if (type === 'walkaway') {
      /* deliberate walk-away: quality = BATNA quality if user explored it, else low */
      const batnaBonus = session.flags.batnaStated > 0 ? 18 : 0;
      const critBonus = session.flags.citedCriteria > 0 ? 7 : 0;
      quality = clamp(28 + batnaBonus + critBonus + Math.round(relationship * 0.1), 0, 70);
      terms = { agreed: false };
      label = 'walkaway';
    } else if (type === 'cp_walk') {
      quality = 8;
      terms = { agreed: false };
      label = 'cp_walk';
    } else { /* timeout / impasse */
      quality = clamp(20 + Math.round(relationship * 0.15) + (session.flags.packagesMatched.length ? 8 : 0), 0, 45);
      terms = { agreed: false };
      label = 'timeout';
    }

    /* set the outcome BEFORE aggregating: aggregate() reads outcome.quality */
    session.outcome = { type: label, quality, terms, relationship };
    const agg = TFE.aggregate(session);
    session.outcome.overall = agg.overall;
    session.outcome.behavioural = agg.behavioural;
    session.evaluation = agg;
    return session.outcome;
  }

  /* interest coverage for qualitative (no-numbers) scenarios */
  function qualitativeCoverage(session) {
    const F = session.flags;
    return clamp(Math.round(
      session.cp.trust * 0.55 +
      F.packagesMatched.length * 16 +
      F.proposedOption * 5 +
      F.paraphrased * 6 +
      F.askedInterests * 5), 0, 100);
  }

  function relationshipScore(session) {
    const base = session.cp.trust;
    const agg = session.flags;
    const penalty = agg.aggressionStrikes * 6;
    return clamp(Math.round(base - penalty + Math.min(agg.rapportMoves * 2, 12)), 0, 100);
  }

  /* ============ helpers ============ */
  function cpMsg(session, text, slots, meta) {
    return { role: 'cp', text: fill(text, slots || {}), ts: Date.now(), meta: meta || {} };
  }

  function fill(tpl, slots) {
    return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (slots[k] !== undefined && slots[k] !== null) ? String(slots[k]) : m);
  }

  function makeSlots(session) {
    const lang = session.lang;
    const cp = session.scenario.counterpart;
    const userName = session.userName;
    return {
      name: L(cp.name, lang) || (lang === 'ar' ? 'الطرف الآخر' : 'the other party'),
      u: userName ? (lang === 'ar' ? 'أستاذ ' + userName.split(' ')[0] : userName.split(' ')[0]) : (lang === 'ar' ? 'زميلي' : 'colleague'),
      constraint: L(cp.constraint, lang) || (lang === 'ar' ? 'القيود النظامية المعتمدة' : 'the approved procedural constraints'),
      topic: L(session.scenario.title, lang)
    };
  }

  function L(bilingual, lang) {
    if (bilingual == null) return '';
    if (typeof bilingual === 'string') return bilingual;
    return bilingual[lang] || bilingual.ar || bilingual.en || '';
  }

  /* custom scenario completion (fills generic counterpart pieces) */
  function completeCustomScenario(draft, input, lang) {
    lang = lang || 'ar';
    const s = JSON.parse(JSON.stringify(draft));
    const inLang = (v) => ({ ar: v, en: v }); /* user writes one language; reuse for both */
    s.title = inLang(input.title);
    s.summary = inLang(input.context.slice(0, 160));
    s.context = inLang(input.context);
    s.traineeRole = { title: { ar: 'أنت', en: 'You' }, brief: inLang(input.myRole || input.title) };
    s.counterpart.name = inLang(input.cpName || (lang === 'ar' ? 'الطرف الآخر' : 'Counterpart'));
    s.counterpart.title = inLang(input.cpRole || (lang === 'ar' ? 'ممثل الطرف الآخر' : 'Counterparty representative'));
    s.counterpart.constraint = inLang(input.cpConstraint || (lang === 'ar' ? 'القيود النظامية واللوائح المعتمدة' : 'approved procedural and regulatory constraints'));
    s.counterpart.interests = [
      { id: 'rules', weight: 3, revealAtTrust: 40, text: inLang(lang === 'ar' ? 'أي حل يجب أن يمر عبر اللوائح المعتمدة — تجاوزها يعرّضني للمساءلة.' : 'Any solution must pass through approved regulations — breaching them exposes me to accountability.') },
      { id: 'fairness', weight: 2, revealAtTrust: 55, text: inLang(lang === 'ar' ? 'أبحث عن صيغة عادلة يمكن الدفاع عنها أمام طرف ثالث، لا عن مكسب طرف على آخر.' : 'I seek a formula defensible before a third party, not one side\u2019s gain over the other.') },
      { id: 'workload', weight: 2, revealAtTrust: 70, text: inLang(lang === 'ar' ? 'لدي قيود تشغيلية حقيقية لا تظهر في الأوراق — الوقت والجهد المتاح محدودان.' : 'I have real operational constraints that don\u2019t appear on paper — time and effort are limited.') }
    ];
    s.counterpart.opening = inLang(lang === 'ar'
      ? `شكراً على ترتيب هذه الجلسة حول «${input.title}». قرأت خلفية الموضوع، وقبل أن أثبّت موقفاً: ما الذي تسعون إليه تحديداً، وما المسوّغ الذي تسندون إليه؟`
      : `Thank you for arranging this session on “${input.title}”. I\u2019ve read the background; before I fix a position: what exactly are you seeking, and on what justification do you rest it?`);
    s.dimensions = TFS.inferCustomDimensions((input.context || '') + ' ' + (input.myRole || ''));
    s.packages = [
      { id: 'phased', signals: ['مرحل', 'دفعات', 'تدريج', 'phased', 'stage', 'milestone'], label: inLang(lang === 'ar' ? 'حل مرحلي قابل للمراجعة' : 'A phased solution subject to review') },
      { id: 'criteria', signals: ['معيار', 'لوائح', 'نظام', 'standard', 'regulation', 'policy'], label: inLang(lang === 'ar' ? 'صيغة قائمة على معايير موضوعية' : 'A formula resting on objective standards') },
      { id: 'mutual', signals: ['مشترك', 'الطرفين', 'معاً', 'mutual', 'joint', 'both'], label: inLang(lang === 'ar' ? 'مكسب مشترك للطرفين' : 'Mutual gain for both sides') }
    ];
    s.objectives = [
      inLang(lang === 'ar' ? 'اتفاق واضح البنود يخدم هدفك المعلن' : 'A clear-clause agreement serving your stated goal'),
      inLang(lang === 'ar' ? 'حماية العلاقة المهنية مع الطرف الآخر' : 'Preserving the professional relationship with the other party')
    ];
    s.expertPath = {
      strategy: inLang(lang === 'ar'
        ? 'استكشف أولاً القيود والمصالح خلف موقف الطرف الآخر، ثم اعرض صيغة مرحلية مربوطة بمعايير موضوعية، واربط أي تنازل بتنازل مقابل. اذكر بديلك بهدوء مرة واحدة، واختم ببنود موثقة.'
        : 'First explore the constraints and interests behind the other party\u2019s position, then offer a phased formula tied to objective standards, linking every concession to a reciprocal one. State your alternative calmly once, and close with documented clauses.'),
      moves: [
        inLang(lang === 'ar' ? 'ابدأ بسؤالين عن مصالحهم ومخاوفهم قبل أي عرض.' : 'Open with two questions about their interests and fears before any offer.'),
        inLang(lang === 'ar' ? 'اربط طلبك بمعيار موضوعي قابل للتوثيق.' : 'Tie your request to a documentable objective standard.'),
        inLang(lang === 'ar' ? 'اعرض خيارين على الأقل قبل أي رقم نهائي.' : 'Offer at least two options before any final number.'),
        inLang(lang === 'ar' ? 'أنهِ ببنود مكتوبة ومسؤوليات واضحة.' : 'Close with written clauses and clear ownership.')
      ],
      avoid: [
        inLang(lang === 'ar' ? 'الضغط أو التهديد — يقابل بتصلب أكبر.' : 'Pressure or threats — met with greater rigidity.'),
        inLang(lang === 'ar' ? 'الحسم من أول جولة دون استكشاف.' : 'Settling in round one without exploration.')
      ]
    };
    s.topicSWOT = {
      strengths: [
        inLang(lang === 'ar' ? 'أنت من طلب الجلسة — مبادرة تمنحك إطار التصميم.' : 'You requested the session — initiative grants you design framing.'),
        inLang(lang === 'ar' ? 'المصلحة المشتركة في وجود حل موجودة أساساً.' : 'The shared interest in a solution exists to begin with.')
      ],
      weaknesses: [
        inLang(lang === 'ar' ? 'معلوماتك عن قيود الطرف الآخر الحقيقية ناقصة.' : 'Your information on the other party\u2019s real constraints is incomplete.'),
        inLang(lang === 'ar' ? 'بديلك إن لم يتحقق اتفاق غير محدد بدقة بعد.' : 'Your no-deal alternative is not yet precisely defined.')
      ]
    };
    s.customInput = input;
    return s;
  }

  return {
    BANK, CPQ, MAX_TURNS,
    createSession, userTurn, endSession,
    evaluateOffer, mapNumbersToDims, unitCategory, matchPackage, nextInterest, termsText, currentPositions,
    finalOfferPositions, relationshipScore, qualitativeCoverage, completeCustomScenario
  };
});
