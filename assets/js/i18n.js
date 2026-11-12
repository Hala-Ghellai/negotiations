/* ============================================================
   Tafahum Platform — i18n strings (Arabic + English)
   UMD module. t(key, vars) resolves from current language.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFI = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const AR = {
    brand: 'تفاهم', brandLatin: 'Tafahum',
    tagline: 'من الحوار إلى الاتفاق — منصة التدريب على التفاوض وإدارة الحوار',
    docTitle: 'تفاهم | منصة التدريب على التفاوض وإدارة الحوار',
    brand_sub: 'منصة التدريب على التفاوض وإدارة الحوار',

    /* nav */
    nav_home: 'الرئيسية', nav_diagnostic: 'مقياس الأسلوب', nav_learn: 'مكتبة المعرفة',
    nav_simulate: 'مختبر المحاكاة', nav_dashboard: 'لوحة الأداء',
    coming_soon: 'سيتوفر قريباً',
    settings: 'الإعدادات', lang_toggle: 'English', lang_switched: 'تم التحويل إلى العربية',

    /* generic */
    start: 'ابدأ', next: 'التالي', back: 'رجوع', finish: 'إنهاء', save: 'حفظ', cancel: 'إلغاء',
    close: 'إغلاق', download_pdf: 'تحميل التقرير PDF', print: 'طباعة', view: 'عرض',
    delete: 'حذف', confirm: 'تأكيد', send: 'إرسال', or: 'أو', minutes: 'دقيقة',
    yes: 'نعم', no: 'لا', of: 'من', none: 'لا يوجد', example: 'مثال',
    continue: 'متابعة', retry: 'إعادة المحاولة', done: 'تم', level: 'المستوى',
    turn: 'جولة', rounds: 'جولة', score: 'النتيجة', date: 'التاريخ', name: 'الاسم',

    /* onboarding */
    ob_title: 'أهلاً بك في منصة تفاهم',
    ob_intro: 'منصة تدريبية تحاكي مواقف التفاوض وإدارة الحوار الحكومية، وتقيس أداءك وفق محكّات علمية، وتمنحك تغذية راجعة فورية وتقريراً شاملاً بعد كل جلسة.',
    ob_name: 'ما اسمك؟ (يظهر في تقاريرك)',
    ob_name_ph: 'مثال: أحمد الفيتوري',
    ob_lang: 'اختر لغة التدريب',
    ob_steps: 'رحلتك في خمس مراحل',
    ob_s1: 'التشخيص: اعرف أسلوبك الغالب في إدارة الخلاف',
    ob_s2: 'التعلّم: وحدات قصيرة بأمثلة من الإدارة العامة',
    ob_s3: 'المحاكاة: تفاوض مع شخصية افتراضية في سيناريو حكومي',
    ob_s4: 'التغذية الراجعة: تقييم بمحكّات واضحة وملاحظات',
    ob_s5: 'المتابعة: لوحة أداء ترصد تطورك',
    ob_start: 'لنبدأ',

    /* home */
    hero_badge: 'المنصة الوطنية الرقمية لتنمية مهارات التفاوض وإدارة الحوار',
    hero_title: 'تدرّب على التفاوض كما تمارسه فعلاً',
    hero_title_1: 'تدرّب على', hero_title_hl: 'التفاوض', hero_title_2: 'كما تمارسه فعلاً',
    hero_sub: 'محاكاة تفاعلية داخل سيناريوهات حكومية، مع قياس علمي للأداء وتغذية راجعة فورية — بدلاً من ورش متفرقة لا تترك أثراً مؤسسياً.',
    hero_cta: 'ابدأ رحلة التدريب', hero_cta2: 'استكشف السيناريوهات',
    hero_trust_1: 'محاكاة تفاعلية', hero_trust_2: 'تقييم بمحكّات واضحة', hero_trust_3: 'تقرير إرشادي PDF',
    stat_scenarios: 'سيناريوهات حكومية', stat_langs: 'لغتان (عربي/إنجليزي)',
    stat_criteria: 'محكّات تقييم', stat_units: 'وحدات تعلّم قصيرة',
    why_title: 'لماذا هذه المنصة؟',
    why_sub: 'يُعامَل التفاوض في الإدارة العامة كمهارة شخصية أو مهمة للمسؤول الأعلى وحده. هنا، يصبح مساراً وطنياً مستمراً يمكن تعلّمه وقياسه وتطويره.',
    why_1_t: 'قيود المساءلة', 'why_1_d': 'الموظف العام يتفاوض داخل قيود التشريع واللوائح، فيميل إلى الخيارات الآمنة. ندربك على الإبداع داخل القيود لا خارجها.',
    why_2_t: 'مهارة مؤسسية', 'why_2_d': 'تدريب الأفراد وحده لا يكفي لتعلّم المؤسسة. قياس موحّد يسمح بالمقارنة بين الدفعات ويرصد الأثر مع الوقت.',
    why_3_t: 'تأثير قابل للقياس', 'why_3_d': 'تقييم بمحكّات واضحة قبل التدريب وبعده، مع مؤشرات تقدم للفرد وتقرير دوري للمؤسسة.',
    journey_title: 'رحلة المتدرب في خمس مراحل',
    journey_sub: 'كل مرحلة تنتج بيانات تغذّي لوحة الأداء، فيرى المتدرب والمؤسسة صورة واحدة للتقدّم.',
    j1_t: 'التشخيص', j1_d: 'اختبار قصير يحدد أسلوبك الغالب في إدارة الخلاف',
    j2_t: 'التعلّم', j2_d: 'وحدات قصيرة بالعربية بأمثلة من الإدارة العامة',
    j3_t: 'المحاكاة', j3_d: 'لعب أدوار مع شخصية افتراضية في سيناريو حكومي',
    j4_t: 'التغذية الراجعة', j4_d: 'تقييم بمحكّات واضحة وملاحظات بعد كل جولة',
    j5_t: 'المتابعة', j5_d: 'مؤشرات تقدم للفرد وتقرير دوري للمؤسسة',
    comps_title: 'مكوّنات المنصة',
    comps_sub: 'خمسة مكونات متكاملة تحوّل التفاوض من موهبة شخصية إلى قدرة مؤسسية.',
    c_lab_t: 'مختبر المحاكاة', c_lab_d: 'سيناريوهات تفاوض ثنائية ومتعددة الأطراف مع محكّات، ويمكنك بناء سيناريوك الخاص.',
    c_style_t: 'مقياس الأسلوب', c_style_d: 'تشخيص فردي وتقرير شخصي بنقاط القوة والضعف.',
    c_lib_t: 'مكتبة المعرفة', c_lib_d: 'وحدات ومقالات قصيرة وحالات دراسية من الإدارة العامة.',
    c_dash_t: 'لوحة الأداء', c_dash_d: 'متابعة تقدم الفرد والمؤسسة بمؤشرات واضحة.',
    c_room_t: 'غرفة الحوار', c_room_d: 'جلسات حوار موجّهة على قضايا الخلاف الداخلي بأسلوب تيسيري.',
    theory_title: 'الأساس النظري: التفاوض القائم على المبادئ',
    theory_sub: 'أربعة مبادئ من كتاب «الوصول إلى نعم» (Fisher & Ury)، تضيف إليها المنصة ثلاث مهارات لإدارة الحوار.',
    tp1_t: 'افصل الناس عن المشكلة', tp1_d: 'عالج الانفعالات والعلاقة بمعزل عن موضوع الخلاف.',
    tp2_t: 'ركّز على المصالح لا المواقف', tp2_d: 'اسأل عمّا وراء الموقف المعلن من حاجات ومخاوف.',
    tp3_t: 'ابتكر خيارات للمكسب المشترك', tp3_d: 'وسّع قائمة الخيارات قبل أن تحسم القرار.',
    tp4_t: 'استخدم معايير موضوعية', tp4_d: 'اعتمد على أنظمة أو أسعار أو آراء خبراء بدل الضغط.',
    td1_t: 'الإصغاء الفعّال', td1_d: 'فهم ما يُقال وما لم يُقال، وأعد صياغته للتأكد.',
    td2_t: 'إعادة صياغة الخلاف', td2_d: 'حوّل الخلاف من صراع مواقف إلى مشكلة مشتركة قابلة للحل.',
    td3_t: 'تيسير الجلسة', td3_d: 'رتّب الأجندة، تلخّص التقدم، وادفع الحوار نحو نتيجة.',
    home_final_cta: 'جاهز تبدأ؟ شخّص أسلوبك أولاً ثم ادخل مختبر المحاكاة',
    footer_rights: 'منصة تدريبية مبنية على مقترح بحثي — استخدام تعليمي',
    footer_note: 'البيانات محفوظة محلياً في متصفحك فقط',

    /* diagnostic */
    diag_title: 'مقياس الأسلوب', diag_sub: 'اختبار قصير (12 موقفاً) يحدد أسلوبك الغالب في إدارة الخلاف وفق نموذج توماس–كيلمان المعرّب.',
    diag_start: 'ابدأ الاختبار', diag_restart: 'إعادة الاختبار', diag_progress: 'سؤال {n} من {total}',
    diag_q_ph: 'اختر الإجابة الأقرب لما تفعله عادةً — لا ما تظنه صواباً.',
    diag_prev_style: 'آخر تشخيص: {style} — {date}',
    styles_title: 'أساليب إدارة الخلاف',
    style_competing: 'المنافس', style_collaborating: 'المتعاون', style_compromising: 'المتوسط',
    style_accommodating: 'المتساهل', style_avoiding: 'المتجنب',
    style_competing_d: 'تسعى لتحقيق هدفك مباشرة وتصرّ على موقفك. فعّال عند القرارات الصعبة، لكنه يرهق العلاقات ويفوّت الفرص المبتكرة.',
    style_collaborating_d: 'تبحث عن حل يلبّي مصالح الجميع وتستثمر في فهم الآخر. أعلى جودة اتفاق، ويحتاج وقتاً وثقة.',
    style_compromising_d: 'تقترح حلاً وسطاً سريعاً يرضي الطرفين جزئياً. عملي و سريع، لكنه قد يترك الطرفين غير راضين تماماً.',
    style_accommodating_d: 'تتنازل للحفاظ على العلاقة والانسجام. يبقي الود، لكنه يراكم الاستياء ويضعف موقفك المؤسسي.',
    style_avoiding_d: 'تؤجل المواجهة وتتجنب الخلاف. يخفف التوتر الحالي، لكن المشكلة تكبر والتأخر يقلل الخيارات.',
    diag_result_title: 'نتيجة التشخيص', diag_dominant: 'أسلوبك الغالب', diag_secondary: 'أسلوبك الثانوي',
    diag_strengths: 'نقاط قوتك المحتملة', diag_weaknesses: 'ما يجب أن ترمّمه', diag_advice: 'توصيات لك',
    diag_recommend: 'سيناريوهات مقترحة لك',
    diag_saved: 'تم حفظ نتيجة التشخيص — ستُستخدم في توجيهك داخل المحاكاة',
    diag_share: 'شارك أسلوبك',

    /* knowledge */
    learn_title: 'مكتبة المعرفة', learn_sub: 'وحدات قصيرة مبنية على التفاوض القائم على المبادئ، بأمثلة من واقع الإدارة العامة.',
    learn_read: 'قراءة', learn_min: 'دقائق', learn_marked: 'مكتملة', learn_progress: 'أنجزت {n} من {total} وحدات',
    learn_key: 'خلاصة الوحدة', learn_example_t: 'مثال من الموقع الحكومي', learn_check: 'اختبر فهمك',
    learn_correct: 'إجابة صحيحة', learn_wrong: 'إجابة غير صحيحة — راجع الخلاصة أعلاه',
    learn_locked_hint: 'رتبنا الوحدات من الأساس إلى التطبيق — أنجزها بالتسلسل للأفضل.',

    /* simulate */
    sim_title: 'مختبر المحاكاة', sim_sub: 'اختر سيناريو حكومي، وتفاوض مع شخصية افتراضية تتفاعل مع أسئلتك وعروضك ونبرتك. يقيّمك النظام وفق محكّات واضحة ويوجهك أثناء الجلسة.',
    sim_filters_all: 'الكل', sim_filter_easy: 'سهل', sim_filter_med: 'متوسط', sim_filter_hard: 'متقدم',
    sim_filter_dial: 'حوار', sim_filter_neg: 'تفاوض', sim_filter_multi: 'متعدد الأطراف',
    sim_custom_cta: 'أضف سيناريوك الخاص', sim_custom_title: 'بناء سيناريو مخصص',
    sim_custom_desc: 'صف الموقف الذي تريد التدرب عليه، وسيبني النظام محاكاة تفاوض حوله تلقائياً.',
    f_title: 'عنوان السيناريو', f_title_ph: 'مثال: تفاقم رسوم النظافة مع الشركة المشغلة',
    f_context: 'وصف الموقف والخلفية', f_context_ph: 'مثال: شركة النظافة تطلب زيادة 30% بسبب ارتفاع أسعار الوقود، والميزانية لا تتحمل أكثر من 10%...',
    f_myrole: 'دورك وهدفك', f_myrole_ph: 'مثال: أنا مدير عقود البلدية، هدفي تثبيت السعر مع ضمان مستوى الخدمة',
    f_cprole: 'الطرف الآخر', f_cprole_ph: 'مثال: مدير عام الشركة المشغلة',
    f_cpname: 'اسم الشخصية (اختياري)', f_cpname_ph: 'مثال: أ. عادل الزوي',
    f_cpconstraint: 'قيد يلتزم به الطرف الآخر (اختياري)', f_cpconstraint_ph: 'مثال: لا يستطيع مخالفة حد الأسعار المعمم',
    sim_custom_create: 'إنشاء المحاكاة', sim_custom_created: 'تم إنشاء السيناريو المخصص',
    sim_obj: 'هدف الجلسة', sim_for: 'أنت تلعب دور', sim_vs: 'الطرف الآخر',
    sim_diff1: 'سهل', sim_diff2: 'متوسط', sim_diff3: 'متقدم',
    sim_criteria_note: 'سيُقيَّم أداؤك وفق المحكّات السبعة: التحضير والبدائل، استكشاف المصالح، جودة الأسئلة والإصغاء، ابتكار الخيارات، المعايير الموضوعية، الحفاظ على العلاقة، وجودة الاتفاق.',
    sim_start: 'ابدأ المحاكاة', sim_best: 'أفضل نتيجة: {score}', sim_done_sessions: 'أكملتها {n} مرة',

    /* session */
    ses_scen: 'السيناريو', ses_round: 'الجولة {n}', ses_of_max: '/ {max}',
    ses_time: 'الوقت', ses_end: 'إنهاء الجلسة', ses_end_confirm: 'كيف تريد إنهاء الجلسة؟',
    ses_end_agree: 'إغلاق باتفاق', ses_end_walk: 'الانسحاب بلا اتفاق', ses_end_cancel: 'متابعة التفاوض',
    ses_end_hint: 'اختر «إغلاق باتفاق» إذا وُجدت صيغة مقبولة على الطاولة، أو «الانسحاب» إذا رأيت أن البديل خارج الطاولة أفضل.',
    ses_you: 'أنت', ses_cp: 'الطرف الآخر',
    coach_label: 'الموجّه', coach_on: 'التوجيه مفعّل', coach_off: 'وضع التقييم الصامت',
    coach_toggle_hint: 'أوقف التوجيه إن أردت تقييماً واقعياً دون مساعدات.',
    composer_ph: 'اكتب رسالتك التفاوضية... (أو استخدم الاقتراحات)',
    composer_send: 'إرسال', composer_hint: 'تلميح',
    typing: 'يكتب الآن...',
    qp_title: 'اقتراحات جاهزة',
    chips: {
      interests: '«ما أكثر ما يهمكم في هذا الملف؟»',
      criteria: '«ما المعيار الذي تستندون إليه في هذا القرار؟»',
      option: '«ما رأيك لو وسّعنا الخيارات قبل الحسم؟»',
      rapport: '«أقدّر ظروفكم، وأبحث عن حل يرضي الطرفين.»',
      batna: '«إن لم نتفق، ما الخيارات المتاحة أمام كلينا؟»',
      summarize: '«دعني ألخّص ما فهمته من موقفكم...»'
    },
    live_criteria: 'محكّات الأداء الحية', live_hint: 'مؤشرات تتحدث بعد كل رسالة — النتيجة النهائية تُحسب في التقرير.',
    phase: 'مرحلة الجلسة',
    phase_opening: 'الافتتاح', phase_exploration: 'استكشاف المصالح', phase_bargaining: 'التفاوض على الصيغة', phase_closing: 'الإغلاق',
    deal_on_table: 'صيغة اتفاق على الطاولة!', deal_confirm_cp: 'اقبل الصيغة واختم الجلسة لتوثيق الاتفاق',
    ses_ended: 'انتهت الجلسة', ses_cap: 'وصلنا الحد الأقصى للجولات — لننتقل للإغلاق',
    turn_cap_note: 'المحاكاة تُغلق تلقائياً عند الحد الأقصى حفاظاً على وقتك.',
    sys_note: 'نظام',

    /* evaluation */
    ev_title: 'نتيجة الجلسة', ev_overall: 'النتيجة الإجمالية', ev_behavior: 'النتيجة السلوكية (المحكّات)',
    ev_outcome: 'النتيجة الموضوعية (جودة الاتفاق)', ev_relation: 'حالة العلاقة',
    ev_tier_great: 'أداء ممتاز', ev_tier_good: 'أداء جيد', ev_tier_ok: 'أداء مقبول', ev_tier_weak: 'أداء يحتاج تطويراً',
    ev_criteria_title: 'أداؤك وفق المحكّات السبعة', ev_dialogue_title: 'مهارات إدارة الحوار',
    ev_strengths: 'نقاط قوتك', ev_weaknesses: 'نقاط تحتاج ترميماً', ev_reco: 'توصيات فورية',
    ev_open_report: 'التقرير الكامل + تحميل PDF', ev_new: 'محاكاة جديدة', ev_saved: 'حُفظت الجلسة في لوحة الأداء',
    outcome_agreement: 'اتفاق موثّق', outcome_impasse: 'لا اتفاق', outcome_walkaway: 'انسحاب واعٍ',
    outcome_cp_walk: 'الطرف الآخر أنهى الجلسة', outcome_timeout: 'إغلاق بانتهاء الجولات',
    rel_excellent: 'ممتازة', rel_good: 'جيدة', rel_tense: 'متوترة', rel_broken: 'متعثرة',
    ev_deal_terms: 'بنود الاتفاق',

    /* report */
    rep_title: 'تقرير الجلسة التدريبية', rep_generated: 'أُعدّ بواسطة منصة تفاهم',
    rep_trainee: 'المتدرب', rep_scenario: 'السيناريو', rep_date: 'التاريخ', rep_lang: 'لغة الجلسة',
    rep_duration: 'المدة', rep_rounds: 'عدد الجولات', rep_style: 'الأسلوب الغالب',
    rep_section_scen: 'السيناريو وخلفيته', rep_section_path: 'كيف كان يمكن أن تسير الجلسة',
    rep_strategy: 'الاستراتيجية الموصى بها', rep_moves: 'خطوات مقترحة', rep_avoid: 'ما يجب تجنبه',
    rep_section_swot: 'قرابة الموضوع: نقاط القوة والضعف',
    rep_topic_strengths: 'نقاط قوة موقفك في هذا الملف', rep_topic_weaknesses: 'نقاط ضعف موقفك في هذا الملف',
    rep_section_transcript: 'مختصر الحوار', rep_section_dialogue: 'تقييم مرحلة الحوار',
    rep_section_negotiation: 'تقييم مرحلة التفاوض',
    rep_my_strengths_dialogue: 'نقاط قوتك في إدارة الحوار', rep_my_weak_dialogue: 'نقاط ضعفك في الحوار — ما يجب ترميمه',
    rep_my_strengths_neg: 'نقاط قوتك في التفاوض', rep_my_weak_neg: 'نقاط ضعفك في التفاوض — ما يجب ترميمه',
    rep_section_scores: 'النتائج والمحكّات', rep_section_plan: 'خطة التطوير',
    rep_evidence: 'من حوارك', rep_exercises: 'تمارين مقترحة', rep_note: 'ملاحظة',
    rep_footer: 'أُنشئ هذا التقرير آلياً من جلسة محاكاة على منصة تفاهم — يظل توجيهياً ويستكمل بالممارسة والإشراف البشري.',
    rep_pdf_started: 'جاري تجهيز ملف PDF...', rep_pdf_done: 'تم تحميل التقرير PDF',
    rep_empty: 'لا توجد جلسات محفوظة بعد — أكمل محاكاة واحدة على الأقل',

    /* dashboard */
    dash_title: 'لوحة الأداء', dash_sub: 'مؤشرات تقدمك الفردية عبر الجلسات — صورة واحدة للتقدم تُبنى مع كل رسالة.',
    dash_kpi_sessions: 'جلسات مكتملة', dash_kpi_avg: 'متوسط النتيجة الإجمالية',
    dash_kpi_best: 'أفضل نتيجة', dash_kpi_criteria: 'أضعف محكّة لديك', dash_kpi_streak: 'أيام التدريب المتصلة',
    dash_history: 'سجل الجلسات', dash_style_card: 'أسلوبك الغالب', dash_knowledge: 'تقدم التعلم',
    dash_no_sessions: 'لم تكمل أي محاكاة بعد. ابدأ أولى جلساتك من مختبر المحاكاة.',
    dash_trend: 'تطور نتائجك', dash_strengths_dist: 'توزيع أدائك على المحكّات',
    dash_export: 'تصدير بياناتي (JSON)', dash_reset: 'تصفير كل البيانات',
    dash_reset_confirm: 'سيتم حذف كل الجلسات والتشخيص والتقدم نهائياً. متأكد؟',
    dash_exported: 'تم تصدير البيانات', dash_deleted: 'حُذفت الجلسة',

    /* settings */
    set_title: 'الإعدادات', set_name: 'الاسم', set_coach: 'التوجيه أثناء المحاكاة',
    set_coach_d: 'ملاحظات الموجّه تظهر بعد كل رسالة لتوجهك فورياً. أوقفه لوضع تقييم صامت.',
    set_lang: 'اللغة', set_about: 'عن المنصة',
    set_about_d: 'تفاهم منصة تدريب على التفاوض وإدارة الحوار مبنية على مقترح بحثي يستند إلى التفاوض القائم على المبادئ (Fisher & Ury) ونموذج توماس–كيلمان لأساليب إدارة الخلاف.',

    /* engine persona */
    cp_you_address: 'أستاذ {name}',
    stranger: 'المتدرب'
  };

  const EN = {
    brand: 'Tafahum', brandLatin: 'تفاهم',
    tagline: 'From dialogue to agreement — a platform for training in negotiation and dialogue management',
    docTitle: 'Tafahum | Negotiation & Dialogue Training Platform',
    brand_sub: 'Negotiation & dialogue training platform',

    nav_home: 'Home', nav_diagnostic: 'Style Assessment', nav_learn: 'Knowledge Library',
    nav_simulate: 'Simulation Lab', nav_dashboard: 'Performance Dashboard',
    coming_soon: 'Coming soon',
    settings: 'Settings', lang_toggle: 'العربية', lang_switched: 'Switched to English',

    start: 'Start', next: 'Next', back: 'Back', finish: 'Finish', save: 'Save', cancel: 'Cancel',
    close: 'Close', download_pdf: 'Download PDF report', print: 'Print', view: 'View',
    delete: 'Delete', confirm: 'Confirm', send: 'Send', or: 'or', minutes: 'min',
    yes: 'Yes', no: 'No', of: 'of', none: 'None', example: 'Example',
    continue: 'Continue', retry: 'Try again', done: 'Done', level: 'Level',
    turn: 'turn', rounds: 'turns', score: 'Score', date: 'Date', name: 'Name',

    ob_title: 'Welcome to Tafahum',
    ob_intro: 'A training platform that simulates governmental negotiation and dialogue situations, measures your performance against scientific criteria, and gives you instant feedback plus a full report after every session.',
    ob_name: 'What is your name? (shown on your reports)',
    ob_name_ph: 'e.g. Ahmed Fituri',
    ob_lang: 'Choose your training language',
    ob_steps: 'Your journey in five stages',
    ob_s1: 'Diagnose: discover your dominant conflict-management style',
    ob_s2: 'Learn: short units with public-administration examples',
    ob_s3: 'Simulate: negotiate with a virtual character in a government scenario',
    ob_s4: 'Feedback: clear-criteria evaluation with notes after each round',
    ob_s5: 'Track: a performance dashboard that follows your progress',
    ob_start: 'Let\u2019s begin',

    hero_badge: 'The national digital platform for negotiation and dialogue-management skills',
    hero_title: 'Train on negotiation the way you actually practice it',
    hero_title_1: 'Train on', hero_title_hl: 'negotiation', hero_title_2: 'the way you actually practice it',
    hero_sub: 'Interactive simulation inside government scenarios, with scientific performance measurement and instant feedback — instead of scattered workshops that leave no institutional trace.',
    hero_cta: 'Start your training journey', hero_cta2: 'Explore scenarios',
    hero_trust_1: 'Interactive simulation', hero_trust_2: 'Rubric-based evaluation', hero_trust_3: 'PDF guidance report',
    stat_scenarios: 'government scenarios', stat_langs: 'two languages (AR/EN)',
    stat_criteria: 'evaluation criteria', stat_units: 'short learning units',
    why_title: 'Why this platform?',
    why_sub: 'In public administration, negotiation is treated as a personal skill or the boss\u2019s job alone. Here it becomes a continuous national path that can be learned, measured and developed.',
    why_1_t: 'Accountability constraints', why_1_d: 'Civil servants negotiate inside legislation and regulation, leaning toward safe options. We train you to create within constraints, not outside them.',
    why_2_t: 'An institutional skill', why_2_d: 'Training individuals alone does not make an organisation learn. Unified measurement allows batch comparison and tracks impact over time.',
    why_3_t: 'Measurable impact', why_3_d: 'Criteria-based evaluation before and after training, with individual progress indicators and periodic institutional reports.',
    journey_title: 'The trainee journey in five stages',
    journey_sub: 'Every stage feeds the performance dashboard, so the trainee and the institution see one picture of progress.',
    j1_t: 'Diagnosis', j1_d: 'A short quiz identifies your dominant conflict-management style',
    j2_t: 'Learning', j2_d: 'Short Arabic units with public-administration examples',
    j3_t: 'Simulation', j3_d: 'Role play with a virtual character in a government scenario',
    j4_t: 'Feedback', j4_d: 'Clear-criteria evaluation and notes after every round',
    j5_t: 'Tracking', j5_d: 'Individual progress indicators and periodic institutional reports',
    comps_title: 'Platform components',
    comps_sub: 'Five integrated components that turn negotiation from personal talent into institutional capability.',
    c_lab_t: 'Simulation Lab', c_lab_d: 'Bilateral and multi-party negotiation scenarios with rubrics — and you can build your own.',
    c_style_t: 'Style Assessment', c_style_d: 'Individual diagnosis and a personal report of strengths and weaknesses.',
    c_lib_t: 'Knowledge Library', c_lib_d: 'Short units, articles and case studies from public administration.',
    c_dash_t: 'Performance Dashboard', c_dash_d: 'Individual and institutional progress tracking with clear indicators.',
    c_room_t: 'Dialogue Room', c_room_d: 'Guided dialogue sessions on internal disagreements, facilitated style.',
    theory_title: 'Theoretical basis: principled negotiation',
    theory_sub: 'Four principles from Getting to Yes (Fisher & Ury), extended by the platform with three dialogue-management skills.',
    tp1_t: 'Separate people from the problem', tp1_d: 'Address emotions and the relationship apart from the substance.',
    tp2_t: 'Focus on interests, not positions', tp2_d: 'Ask about the needs and fears behind the declared position.',
    tp3_t: 'Invent options for mutual gain', tp3_d: 'Expand the list of options before deciding.',
    tp4_t: 'Use objective criteria', tp4_d: 'Rely on systems, prices or expert opinion instead of pressure.',
    td1_t: 'Active listening', td1_d: 'Understand what is said and unsaid, and restate to confirm.',
    td2_t: 'Reframing the conflict', td2_d: 'Turn the clash of positions into a shared, solvable problem.',
    td3_t: 'Facilitating the session', td3_d: 'Set the agenda, summarise progress, and drive toward outcome.',
    home_final_cta: 'Ready to start? Diagnose your style first, then enter the Simulation Lab',
    footer_rights: 'A training platform built on a research proposal — educational use',
    footer_note: 'Your data is stored locally in your browser only',

    diag_title: 'Style Assessment',
    diag_sub: 'A short quiz (12 situations) identifying your dominant conflict-management style, based on the Thomas–Kilmann model.',
    diag_start: 'Start the quiz', diag_restart: 'Retake the quiz', diag_progress: 'Question {n} of {total}',
    diag_q_ph: 'Choose the answer closest to what you usually DO — not what you think is right.',
    diag_prev_style: 'Last assessment: {style} — {date}',
    styles_title: 'Conflict-management styles',
    style_competing: 'Competing', style_collaborating: 'Collaborating', style_compromising: 'Compromising',
    style_accommodating: 'Accommodating', style_avoiding: 'Avoiding',
    style_competing_d: 'You push directly for your goal and hold your position. Effective for hard decisions, but strains relationships and misses creative deals.',
    style_collaborating_d: 'You look for solutions that meet everyone\u2019s interests and invest in understanding the other side. Highest agreement quality, needs time and trust.',
    style_compromising_d: 'You quickly propose a middle outcome that partially satisfies both. Practical and fast, but may leave both sides only half satisfied.',
    style_accommodating_d: 'You yield to preserve harmony and the relationship. Keeps goodwill, but builds resentment and weakens your institutional position.',
    style_avoiding_d: 'You postpone and steer clear of conflict. Eases tension today, but problems grow and delay shrinks your options.',
    diag_result_title: 'Assessment result', diag_dominant: 'Your dominant style', diag_secondary: 'Your secondary style',
    diag_strengths: 'Your likely strengths', diag_weaknesses: 'What to repair', diag_advice: 'Recommendations for you',
    diag_recommend: 'Recommended scenarios',
    diag_saved: 'Assessment saved — it will guide the coach inside simulations',
    diag_share: 'Share your style',

    learn_title: 'Knowledge Library',
    learn_sub: 'Short units built on principled negotiation, with examples from public administration reality.',
    learn_read: 'Read', learn_min: 'min', learn_marked: 'Completed', learn_progress: 'You completed {n} of {total} units',
    learn_key: 'Unit takeaways', learn_example_t: 'Example from government practice', learn_check: 'Check your understanding',
    learn_correct: 'Correct answer', learn_wrong: 'Not quite — review the takeaways above',
    learn_locked_hint: 'Units are ordered from foundation to application — completing them in order works best.',

    sim_title: 'Simulation Lab',
    sim_sub: 'Pick a government scenario and negotiate with a virtual character that reacts to your questions, offers and tone. The system evaluates you against clear rubrics and coaches you during the session.',
    sim_filters_all: 'All', sim_filter_easy: 'Easy', sim_filter_med: 'Medium', sim_filter_hard: 'Advanced',
    sim_filter_dial: 'Dialogue', sim_filter_neg: 'Negotiation', sim_filter_multi: 'Multi-party',
    sim_custom_cta: 'Add your own scenario', sim_custom_title: 'Build a custom scenario',
    sim_custom_desc: 'Describe the situation you want to practise on, and the system will automatically build a negotiation simulation around it.',
    f_title: 'Scenario title', f_title_ph: 'e.g. Waste-management fee escalation with the operator',
    f_context: 'Situation and background', f_context_ph: 'e.g. The operator demands a 30% increase due to fuel prices; the budget cannot absorb more than 10%...',
    f_myrole: 'Your role and goal', f_myrole_ph: 'e.g. I am the municipality contracts director; my goal is to stabilise the price while securing service levels',
    f_cprole: 'The other party', f_cprole_ph: 'e.g. Director-General of the operator company',
    f_cpname: 'Character name (optional)', f_cpname_ph: 'e.g. Mr. Adel Zawi',
    f_cpconstraint: 'A constraint the other party must respect (optional)', f_cpconstraint_ph: 'e.g. Cannot breach the published price ceiling',
    sim_custom_create: 'Create simulation', sim_custom_created: 'Custom scenario created',
    sim_diff1: 'Easy', sim_diff2: 'Medium', sim_diff3: 'Advanced',
    sim_criteria_note: 'Your performance is evaluated on seven criteria: preparation & alternatives, exploring interests, question quality & listening, inventing options, objective criteria, preserving the relationship, and agreement quality.',
    sim_start: 'Start simulation', sim_best: 'Best score: {score}', sim_done_sessions: 'Completed {n} time(s)',
    sim_obj: 'Session objective', sim_for: 'You play', sim_vs: 'The other party',

    ses_scen: 'Scenario', ses_round: 'Round {n}', ses_of_max: '/ {max}',
    ses_time: 'Time', ses_end: 'End session', ses_end_confirm: 'How do you want to end the session?',
    ses_end_agree: 'Close with agreement', ses_end_walk: 'Walk away, no deal', ses_end_cancel: 'Keep negotiating',
    ses_end_hint: 'Choose “Close with agreement” if an acceptable formula is on the table, or “Walk away” if your outside alternative is better.',
    ses_you: 'You', ses_cp: 'Other party',
    coach_label: 'Coach', coach_on: 'Coaching on', coach_off: 'Silent assessment mode',
    coach_toggle_hint: 'Turn coaching off for a realistic assessment without assistance.',
    composer_ph: 'Type your negotiating message... (or use the suggestions)',
    composer_send: 'Send', composer_hint: 'Hint',
    typing: 'typing...',
    qp_title: 'Ready suggestions',
    chips: {
      interests: '\u201CWhat matters most to you in this file?\u201D',
      criteria: '\u201CWhat standard is this decision based on?\u201D',
      option: '\u201CWhat if we widen the options before deciding?\u201D',
      rapport: '\u201CI appreciate your situation, and I\u2019m looking for a formula that works for both of us.\u201D',
      batna: '\u201CIf we don\u2019t agree, what options do we each have?\u201D',
      summarize: '\u201CLet me summarise what I understood of your position...\u201D'
    },
    live_criteria: 'Live performance criteria', live_hint: 'Indicators update after every message — final scores are computed in the report.',
    phase: 'Session phase',
    phase_opening: 'Opening', phase_exploration: 'Exploring interests', phase_bargaining: 'Bargaining the formula', phase_closing: 'Closing',
    deal_on_table: 'A deal formula is on the table!', deal_confirm_cp: 'Accept it and close the session to document the agreement',
    ses_ended: 'Session ended', ses_cap: 'We reached the round cap — let\u2019s move to closing',
    turn_cap_note: 'The simulation closes automatically at the cap to protect your time.',
    sys_note: 'System',

    ev_title: 'Session result', ev_overall: 'Overall score', ev_behavior: 'Behavioural score (rubrics)',
    ev_outcome: 'Objective score (agreement quality)', ev_relation: 'Relationship status',
    ev_tier_great: 'Excellent performance', ev_tier_good: 'Good performance', ev_tier_ok: 'Acceptable performance', ev_tier_weak: 'Needs development',
    ev_criteria_title: 'Your performance on the seven criteria', ev_dialogue_title: 'Dialogue-management skills',
    ev_strengths: 'Your strengths', ev_weaknesses: 'Points needing repair', ev_reco: 'Immediate recommendations',
    ev_open_report: 'Full report + PDF download', ev_new: 'New simulation', ev_saved: 'Session saved to your dashboard',
    outcome_agreement: 'Documented agreement', outcome_impasse: 'No agreement', outcome_walkaway: 'Deliberate walk-away',
    outcome_cp_walk: 'The other party ended the session', outcome_timeout: 'Closed on round cap',
    rel_excellent: 'Excellent', rel_good: 'Good', rel_tense: 'Tense', rel_broken: 'Strained',
    ev_deal_terms: 'Deal terms',

    rep_title: 'Training session report', rep_generated: 'Produced by the Tafahum platform',
    rep_trainee: 'Trainee', rep_scenario: 'Scenario', rep_date: 'Date', rep_lang: 'Session language',
    rep_duration: 'Duration', rep_rounds: 'Rounds', rep_style: 'Dominant style',
    rep_section_scen: 'The scenario and its background', rep_section_path: 'How the session could have gone',
    rep_strategy: 'Recommended strategy', rep_moves: 'Suggested moves', rep_avoid: 'What to avoid',
    rep_section_swot: 'The subject at hand: strengths & weaknesses',
    rep_topic_strengths: 'Strengths of your position in this file', rep_topic_weaknesses: 'Weaknesses of your position in this file',
    rep_section_transcript: 'Dialogue digest', rep_section_dialogue: 'Dialogue-stage evaluation',
    rep_section_negotiation: 'Negotiation-stage evaluation',
    rep_my_strengths_dialogue: 'Your dialogue-management strengths', rep_my_weak_dialogue: 'Your dialogue weaknesses — what to repair',
    rep_my_strengths_neg: 'Your negotiation strengths', rep_my_weak_neg: 'Your negotiation weaknesses — what to repair',
    rep_section_scores: 'Scores & criteria', rep_section_plan: 'Development plan',
    rep_evidence: 'From your dialogue', rep_exercises: 'Suggested exercises', rep_note: 'Note',
    rep_footer: 'This report was generated automatically from a Tafahum simulation session — it remains guidance-oriented and is complemented by practice and human supervision.',
    rep_pdf_started: 'Preparing PDF file...', rep_pdf_done: 'Report PDF downloaded',
    rep_empty: 'No saved sessions yet — complete at least one simulation',

    dash_title: 'Performance dashboard',
    dash_sub: 'Your individual progress indicators across sessions — one picture of progress, built with every message.',
    dash_kpi_sessions: 'Completed sessions', dash_kpi_avg: 'Average overall score',
    dash_kpi_best: 'Best score', dash_kpi_criteria: 'Your weakest criterion', dash_kpi_streak: 'Consecutive training days',
    dash_history: 'Session history', dash_style_card: 'Your dominant style', dash_knowledge: 'Learning progress',
    dash_no_sessions: 'No completed simulations yet. Start your first session from the Simulation Lab.',
    dash_trend: 'Your score trend', dash_strengths_dist: 'Your criteria profile',
    dash_export: 'Export my data (JSON)', dash_reset: 'Reset all data',
    dash_reset_confirm: 'All sessions, assessment and progress will be permanently deleted. Are you sure?',
    dash_exported: 'Data exported', dash_deleted: 'Session deleted',

    set_title: 'Settings', set_name: 'Name', set_coach: 'Coaching during simulations',
    set_coach_d: 'Coach notes appear after each message for instant guidance. Turn off for silent assessment.',
    set_lang: 'Language', set_about: 'About the platform',
    set_about_d: 'Tafahum is a negotiation and dialogue-management training platform built on a research proposal grounded in principled negotiation (Fisher & Ury) and the Thomas–Kilmann conflict-style model.',

    cp_you_address: '{name}',
    stranger: 'Trainee'
  };

  /* criteria + dialogue-skill labels used across evaluator/report/dashboard */
  const CRITERIA_AR = {
    prep: 'التحضير وتحديد البدائل',
    interests: 'استكشاف مصالح الطرف الآخر',
    listening: 'جودة الأسئلة والإصغاء',
    options: 'ابتكار خيارات للمكسب المشترك',
    criteria: 'الاستناد إلى معايير موضوعية',
    relationship: 'الحفاظ على العلاقة',
    outcome: 'جودة الاتفاق النهائي'
  };
  const CRITERIA_EN = {
    prep: 'Preparation & alternatives',
    interests: 'Exploring the other side\u2019s interests',
    listening: 'Question quality & listening',
    options: 'Inventing options for mutual gain',
    criteria: 'Objective criteria',
    relationship: 'Preserving the relationship',
    outcome: 'Quality of the final agreement'
  };
  const DIALOGUE_AR = {
    listen: 'الإصغاء الفعّال',
    reframe: 'إعادة صياغة الخلاف',
    facilitate: 'تيسير الجلسة',
    tone: 'النبرة والاحترام'
  };
  const DIALOGUE_EN = {
    listen: 'Active listening',
    reframe: 'Reframing the conflict',
    facilitate: 'Facilitating the session',
    tone: 'Tone & respect'
  };

  let LANG = 'ar';
  const STRINGS = { ar: AR, en: EN };

  function setLang(l) { LANG = (l === 'en' ? 'en' : 'ar'); return LANG; }
  function getLang() { return LANG; }

  function t(key, vars) {
    const pack = STRINGS[LANG] || AR;
    let s = key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), pack);
    if (s == null) { s = key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), AR); }
    if (s == null) return key;
    if (typeof s === 'object') s = JSON.stringify(s);
    if (vars) for (const [k, v] of Object.entries(vars)) s = String(s).replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    return s;
  }

  function criteriaLabels(lang) { return (lang === 'en' ? CRITERIA_EN : CRITERIA_AR); }
  function dialogueLabels(lang) { return (lang === 'en' ? DIALOGUE_EN : DIALOGUE_AR); }

  return {
    setLang, getLang, t,
    criteriaLabels, dialogueLabels,
    packs: STRINGS,
    CRITERIA_AR, CRITERIA_EN, DIALOGUE_AR, DIALOGUE_EN,
    CRITERIA_IDS: ['prep', 'interests', 'listening', 'options', 'criteria', 'relationship', 'outcome'],
    DIALOGUE_IDS: ['listen', 'reframe', 'facilitate', 'tone']
  };
});
