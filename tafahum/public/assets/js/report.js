/* ============================================================
   Tafahum Platform — report assembly, HTML view and PDF export
   - assembleReport(): structured report data (node-testable)
   - renderReportHTML(): report page markup
   - exportPDF(): canvas pages -> minimal PDF writer -> download
   UMD module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./evaluator.js'), require('./scenarios.js'), require('./i18n.js'), require('./core.js'), require('./pdfwriter.js'), require('./charts.js'));
  } else root.TFR = factory(root.TFE, root.TFS, root.TFI, root.TF, root.TFPDF, root.TFCH);
})(typeof self !== 'undefined' ? self : this, function (TFE, TFS, TFI, TF, TFPDF, TFCH) {
  'use strict';

  /* ============ report data ============ */
  function assembleReport(session, data) {
    /* data: app storage data (for trainee name / style) */
    const lang = session.lang || 'ar';
    const scenario = session.scenario;
    const agg = session.evaluation || TFE.aggregate(session);
    const sw = TFE.strengthsWeaknesses(agg, lang);
    const t = (k, vars) => TFI.t(k, vars);
    const L = (b) => (b == null ? '' : typeof b === 'string' ? b : (b[lang] || b.ar || b.en || ''));

    const traineeName = (data && data.settings && data.settings.name) || session.userName || t('stranger');
    const userStyle = session.userStyle || (data && data.diagnostic && data.diagnostic.style) || null;

    /* split strengths/weaknesses into dialogue vs negotiation skills */
    const dialogueIds = TFE.DIALOGUE_IDS;
    const split = (list) => {
      const d = [], n = [];
      for (const item of list) (dialogueIds.includes(item.id) ? d : n).push(item);
      return { dialogue: d, negotiation: n };
    };
    const sSplit = split(sw.strengths), wSplit = split(sw.weaknesses);

    const durationMin = Math.max(1, Math.round((new Date(session.endedAt || Date.now()) - new Date(session.startedAt)) / 60000));

    return {
      meta: {
        platform: lang === 'ar' ? 'منصة تفاهم' : 'Tafahum Platform',
        title: t('rep_title'),
        trainee: traineeName,
        scenarioTitle: L(scenario.title),
        date: new Date(session.endedAt || session.startedAt).toISOString(),
        lang,
        durationMin,
        rounds: session.turns,
        style: userStyle ? t('style_' + userStyle) : '—',
        tier: TFE.tier(agg.overall, lang)
      },
      scenarioSection: {
        summary: L(scenario.summary),
        context: L(scenario.context),
        traineeRole: L(scenario.traineeRole && scenario.traineeRole.title),
        traineeBrief: L(scenario.traineeRole && scenario.traineeRole.brief),
        counterpartName: L(scenario.counterpart && scenario.counterpart.name),
        counterpartTitle: L(scenario.counterpart && scenario.counterpart.title),
        objectives: (scenario.objectives || []).map(L)
      },
      expertPath: scenario.expertPath ? {
        strategy: L(scenario.expertPath.strategy),
        moves: scenario.expertPath.moves.map(L),
        avoid: scenario.expertPath.avoid.map(L)
      } : null,
      topicSWOT: scenario.topicSWOT ? {
        strengths: scenario.topicSWOT.strengths.map(L),
        weaknesses: scenario.topicSWOT.weaknesses.map(L)
      } : null,
      transcript: session.messages.filter(m => m.role !== 'coach' || true).map(m => ({
        role: m.role, text: m.text, ts: m.ts
      })),
      scores: {
        overall: agg.overall,
        behavioural: agg.behavioural,
        outcome: agg.criteria.outcome,
        relationship: session.outcome ? session.outcome.relationship : null,
        outcomeType: session.outcome ? session.outcome.type : null,
        dealTerms: session.outcome && session.outcome.terms && session.outcome.terms.text || null
      },
      negotiationEval: {
        scores: agg.criteria,
        strengths: sSplit.negotiation,
        weaknesses: wSplit.negotiation
      },
      dialogueEval: {
        scores: agg.dialogue,
        strengths: sSplit.dialogue,
        weaknesses: wSplit.dialogue
      },
      recommendations: sw.recommendations,
      flags: session.flags || {}
    };
  }

  function outcomeLabel(type, lang) {
    const ar = { agreement: 'اتفاق موثّق', walkaway: 'انسحاب واعٍ', cp_walk: 'الطرف الآخر أنهى الجلسة', timeout: 'إغلاق بانتهاء الجولات' };
    const en = { agreement: 'Documented agreement', walkaway: 'Deliberate walk-away', cp_walk: 'Other party ended the session', timeout: 'Closed on round cap' };
    return (lang === 'en' ? en : ar)[type] || type;
  }
  function relationshipLabel(v, lang) {
    if (v == null) return '—';
    if (v >= 75) return lang === 'en' ? 'Excellent' : 'ممتازة';
    if (v >= 55) return lang === 'en' ? 'Good' : 'جيدة';
    if (v >= 35) return lang === 'en' ? 'Tense' : 'متوترة';
    return lang === 'en' ? 'Strained' : 'متعثرة';
  }

  /* ============ HTML view ============ */
  function renderReportHTML(rep, opts) {
    opts = opts || {};
    const lang = rep.meta.lang;
    const esc = TF.escapeHtml;
    const t = (k, vars) => TFI.t(k, vars);
    const critLabels = TFI.criteriaLabels(lang);
    const dialLabels = TFI.dialogueLabels(lang);

    const bars = (scores, labels, ids) => ids.map(id => `
      <div class="score-row">
        <span class="score-label">${esc(labels[id] || id)}</span>
        <span class="score-track"><span class="score-fill" style="width:${Math.max(2, scores[id])}%"></span></span>
        <b class="score-val">${Math.round(scores[id])}</b>
      </div>`).join('');

    const listItems = (arr, kind) => arr.map(item => `
      <div class="sw-item ${kind}">
        <div class="sw-head"><b>${esc(kind === 'plus' ? (lang === 'ar' ? 'نقطة قوة' : 'Strength') : (lang === 'ar' ? 'يحتاج ترميماً' : 'Needs repair'))} — ${esc(item.skill ? dialLabels[item.id] : critLabels[item.id])}</b>
        <span class="pill pill-${kind === 'plus' ? 'ok' : 'bad'}">${Math.round(item.score)}</span></div>
        ${item.evidence && item.evidence.length ? `<div class="sw-ev">${esc(t('rep_evidence'))}: «${esc(item.evidence[0].text)}»</div>` : ''}
      </div>`).join('');

    const recoItems = rep.recommendations.map(r => `
      <div class="reco-item">
        <b>${esc(r.skill ? dialLabels[r.id] : critLabels[r.id])}</b>
        <p>${esc(r.what)}</p>
        <div class="reco-how">${iconLamp()} ${esc(r.how)}</div>
      </div>`).join('');

    const transcript = rep.transcript.map(m => `
      <div class="tr-entry tr-${m.role}">
        <span class="tr-role">${m.role === 'user' ? esc(t('ses_you')) : m.role === 'cp' ? esc(t('ses_cp')) : m.role === 'coach' ? esc(t('coach_label')) : esc(t('sys_note'))}</span>
        <p>${esc(m.text)}</p>
      </div>`).join('');

    const d = new Date(rep.meta.date);
    const dateStr = TF.fmtDate(rep.meta.date, lang);

    return `
    <div class="report-page" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
      <header class="rep-cover">
        <div class="rep-cover-brand">${logoSVG()}<div><b>${esc(t('brand'))}</b><span>${esc(t('tagline'))}</span></div></div>
        <h1>${esc(t('rep_title'))}</h1>
        <div class="rep-cover-grid">
          <div><span>${esc(t('rep_trainee'))}</span><b>${esc(rep.meta.trainee)}</b></div>
          <div><span>${esc(t('rep_scenario'))}</span><b>${esc(rep.meta.scenarioTitle)}</b></div>
          <div><span>${esc(t('rep_date'))}</span><b>${dateStr}</b></div>
          <div><span>${esc(t('rep_rounds'))}</span><b>${rep.meta.rounds}</b></div>
          <div><span>${esc(t('rep_duration'))}</span><b>${rep.meta.durationMin} ${esc(t('minutes'))}</b></div>
          <div><span>${esc(t('rep_style'))}</span><b>${esc(rep.meta.style)}</b></div>
        </div>
        <div class="rep-cover-scores">
          <div class="big-score"><b>${rep.scores.overall}</b><span>${esc(t('ev_overall'))}</span></div>
          <div class="big-score"><b>${rep.scores.behavioural}</b><span>${esc(t('ev_behavior'))}</span></div>
          <div class="big-score"><b>${rep.scores.outcome}</b><span>${esc(t('ev_outcome'))}</span></div>
          <div class="big-score"><b>${esc(outcomeLabel(rep.scores.outcomeType, lang))}</b><span>${esc(t('rep_section_scores'))}</span></div>
        </div>
      </header>

      <section class="rep-sec">
        <h2>${esc(t('rep_section_scen'))}</h2>
        <p>${esc(rep.scenarioSection.summary)}</p>
        <p class="muted">${esc(rep.scenarioSection.context)}</p>
        <div class="rep-kv">
          <div><span>${esc(t('sim_for'))}</span><b>${esc(rep.scenarioSection.traineeRole)}</b></div>
          <div><span>${esc(t('sim_vs'))}</span><b>${esc(rep.scenarioSection.counterpartName)} — ${esc(rep.scenarioSection.counterpartTitle)}</b></div>
        </div>
        ${rep.scenarioSection.objectives.length ? `<div class="rep-obj">${rep.scenarioSection.objectives.map(o => `<div>${iconTarget()} ${esc(o)}</div>`).join('')}</div>` : ''}
        ${rep.scores.dealTerms ? `<div class="deal-banner">${iconCheck()} <b>${esc(t('ev_deal_terms'))}:</b> ${esc(rep.scores.dealTerms)}</div>` : ''}
      </section>

      ${rep.expertPath ? `
      <section class="rep-sec">
        <h2>${esc(t('rep_section_path'))}</h2>
        <p><b>${esc(t('rep_strategy'))}:</b> ${esc(rep.expertPath.strategy)}</p>
        <h3>${esc(t('rep_moves'))}</h3>
        <ul class="rep-list">${rep.expertPath.moves.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        <h3>${esc(t('rep_avoid'))}</h3>
        <ul class="rep-list avoid">${rep.expertPath.avoid.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
      </section>` : ''}

      ${rep.topicSWOT ? `
      <section class="rep-sec">
        <h2>${esc(t('rep_section_swot'))}</h2>
        <div class="sw-grid">
          <div class="sw-col">
            <h3>${esc(t('rep_topic_strengths'))}</h3>
            <ul class="rep-list plus">${rep.topicSWOT.strengths.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>
          <div class="sw-col">
            <h3>${esc(t('rep_topic_weaknesses'))}</h3>
            <ul class="rep-list avoid">${rep.topicSWOT.weaknesses.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>` : ''}

      <section class="rep-sec">
        <h2>${esc(t('rep_section_scores'))}</h2>
        <div class="rep-charts">
          <div class="chart-card"><h4>${esc(t('ev_criteria_title'))}</h4><canvas class="radar-neg" height="300"></canvas></div>
          <div class="chart-card"><h4>${esc(t('ev_dialogue_title'))}</h4><canvas class="radar-dial" height="300"></canvas></div>
        </div>
        <div class="bars-crit">${bars(rep.negotiationEval.scores, critLabels, TFE.CRITERIA_IDS)}</div>
        <div class="bars-dial">${bars(rep.dialogueEval.scores, dialLabels, TFE.DIALOGUE_IDS)}</div>
      </section>

      <section class="rep-sec">
        <h2>${esc(t('rep_section_dialogue'))}</h2>
        ${rep.dialogueEval.strengths.length ? `<h3 class="ok">${esc(t('rep_my_strengths_dialogue'))}</h3><div class="sw-list">${listItems(rep.dialogueEval.strengths, 'plus')}</div>` : `<p class="muted">${lang === 'ar' ? 'لم تظهر نقاط قوة بارزة في هذه المرحلة بعد.' : 'No standout strengths appeared in this stage yet.'}</p>`}
        ${rep.dialogueEval.weaknesses.length ? `<h3 class="bad">${esc(t('rep_my_weak_dialogue'))}</h3><div class="sw-list">${listItems(rep.dialogueEval.weaknesses, 'minus')}</div>` : ''}
      </section>

      <section class="rep-sec">
        <h2>${esc(t('rep_section_negotiation'))}</h2>
        ${rep.negotiationEval.strengths.length ? `<h3 class="ok">${esc(t('rep_my_strengths_neg'))}</h3><div class="sw-list">${listItems(rep.negotiationEval.strengths, 'plus')}</div>` : `<p class="muted">${lang === 'ar' ? 'لم تظهر نقاط قوة بارزة في هذه المرحلة بعد.' : 'No standout strengths appeared in this stage yet.'}</p>`}
        ${rep.negotiationEval.weaknesses.length ? `<h3 class="bad">${esc(t('rep_my_weak_neg'))}</h3><div class="sw-list">${listItems(rep.negotiationEval.weaknesses, 'minus')}</div>` : ''}
      </section>

      <section class="rep-sec">
        <h2>${esc(t('rep_section_transcript'))}</h2>
        <div class="tr-wrap">${transcript}</div>
      </section>

      <section class="rep-sec">
        <h2>${esc(t('rep_section_plan'))}</h2>
        ${recoItems || `<p class="muted">${esc(t('none'))}</p>`}
        <p class="rep-footer">${esc(t('rep_footer'))}</p>
      </section>
    </div>`;
  }

  /* after HTML injection, draw charts on canvases */
  function mountCharts(container, rep) {
    const lang = rep.meta.lang;
    const rtl = lang === 'ar';
    const critLabels = TFI.criteriaLabels(lang);
    const dialLabels = TFI.dialogueLabels(lang);
    const negIds = TFE.CRITERIA_IDS;
    const cnv1 = container.querySelector('.radar-neg');
    const cnv2 = container.querySelector('.radar-dial');
    if (cnv1) TFCH.drawRadar(cnv1, negIds.map(i => critLabels[i]), negIds.map(i => rep.negotiationEval.scores[i]), { dir: rtl ? 'rtl' : 'ltr', size: 300 });
    if (cnv2) TFCH.drawRadar(cnv2, TFE.DIALOGUE_IDS.map(i => dialLabels[i]), TFE.DIALOGUE_IDS.map(i => rep.dialogueEval.scores[i]), { dir: rtl ? 'rtl' : 'ltr', size: 300 });
  }

  /* ============ PDF export via canvas ============ */
  const PAGE_W = 1240, PAGE_H = 1754; /* A4 @150dpi */
  const MARGIN = 96, CONTENT_W = PAGE_W - MARGIN * 2;

  const BRAND = '#0d5c6b', INK = '#16323d', MUTED = '#5b7078', GOLD = '#c9a227',
    LINE = '#dce7ea', SOFT = '#f0f6f7', OK = '#2e8b57', BAD = '#b3492f', WARN = '#c77b1f';

  function Doc(rep) {
    this.rep = rep;
    this.lang = rep.meta.lang;
    this.rtl = this.lang === 'ar';
    this.pages = [];
    this.canvas = null; this.ctx = null;
    this.y = 0; this.pageNum = 0;
    this._newPage();
  }
  Doc.prototype._newPage = function () {
    const c = document.createElement('canvas');
    c.width = PAGE_W; c.height = PAGE_H;
    const ctx = c.getContext('2d');
    this.canvas = c; this.ctx = ctx; this.pageNum++;
    this.pages.push(c);
    /* white bg */
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    /* footer */
    ctx.fillStyle = MUTED; ctx.font = '500 16px ' + this.font(0);
    this._dir(ctx);
    ctx.textAlign = this.rtl ? 'left' : 'right';
    ctx.fillText((this.lang === 'ar' ? 'تفاهم — ' : 'Tafahum — ') + this.rep.meta.trainee, this.rtl ? MARGIN : PAGE_W - MARGIN, PAGE_H - 44);
    ctx.textAlign = this.rtl ? 'right' : 'left';
    ctx.fillText(String(this.pageNum), this.rtl ? PAGE_W - MARGIN : MARGIN, PAGE_H - 44);
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(MARGIN, PAGE_H - 68); ctx.lineTo(PAGE_W - MARGIN, PAGE_H - 68); ctx.stroke();
    this.y = 120;
  };
  Doc.prototype.font = function (weight) {
    return (weight ? weight + ' ' : '600 ') + "%SIZE%px 'Cairo','Segoe UI',Tahoma,sans-serif";
  };
  Doc.prototype._dir = function (ctx) { ctx.direction = this.rtl ? 'rtl' : 'ltr'; };
  Doc.prototype._x = function () { return this.rtl ? PAGE_W - MARGIN : MARGIN; };
  Doc.prototype._align = function (ctx) { ctx.textAlign = this.rtl ? 'right' : 'left'; };
  Doc.prototype.space = function (h) { this.y += h; };
  Doc.prototype.ensure = function (h) { if (this.y + h > PAGE_H - 110) this._newPage(); };

  Doc.prototype.wrapText = function (text, size, maxW, weight) {
    const ctx = this.ctx;
    ctx.font = (weight || '400') + ' ' + size + "px 'Cairo','Segoe UI',Tahoma,sans-serif";
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  Doc.prototype.p = function (text, opts) {
    opts = opts || {};
    const size = opts.size || 21, color = opts.color || INK, lh = opts.lh || size * 1.75, weight = opts.weight || '400';
    const lines = this.wrapText(text, size, opts.maxW || CONTENT_W, weight);
    this.ensure(lines.length * lh + 8);
    const ctx = this.ctx;
    for (const ln of lines) {
      this.ensure(lh);
      ctx.font = weight + ' ' + size + "px 'Cairo','Segoe UI',Tahoma,sans-serif";
      ctx.fillStyle = color; this._dir(ctx); this._align(ctx);
      ctx.fillText(ln, this._x(), this.y);
      this.y += lh;
    }
    this.y += opts.gap == null ? 8 : opts.gap;
  };
  Doc.prototype.h2 = function (text) {
    this.ensure(140);
    this.y += 16;
    const ctx = this.ctx;
    /* gold side bar */
    ctx.fillStyle = GOLD;
    const bx = this.rtl ? PAGE_W - MARGIN : MARGIN;
    ctx.fillRect(this.rtl ? bx - 6 : bx, this.y - 24, 6, 40);
    ctx.font = '700 30px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = BRAND; this._dir(ctx); this._align(ctx);
    ctx.fillText(text, this._x(), this.y);
    this.y += 18;
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(MARGIN, this.y); ctx.lineTo(PAGE_W - MARGIN, this.y); ctx.stroke();
    this.y += 26;
  };
  Doc.prototype.h3 = function (text, color) {
    this.ensure(70);
    const ctx = this.ctx;
    ctx.font = '700 23px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = color || INK; this._dir(ctx); this._align(ctx);
    ctx.fillText(text, this._x(), this.y);
    this.y += 34;
  };
  Doc.prototype.bullets = function (items, opts) {
    opts = opts || {};
    const ctx = this.ctx;
    for (const it of items) {
      const lines = this.wrapText(it, 20, CONTENT_W - 34, '400');
      this.ensure(lines.length * 33 + 6);
      /* bullet dot */
      const bx = this.rtl ? PAGE_W - MARGIN - 10 : MARGIN + 10;
      ctx.beginPath(); ctx.arc(bx, this.y - 7, 4, 0, Math.PI * 2);
      ctx.fillStyle = opts.dot || GOLD; ctx.fill();
      for (const ln of lines) {
        ctx.font = '400 20px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
        ctx.fillStyle = opts.color || INK; this._dir(ctx); this._align(ctx);
        ctx.fillText(ln, this.rtl ? PAGE_W - MARGIN - 30 : MARGIN + 30, this.y);
        this.y += 33;
      }
      this.y += 4;
    }
  };
  Doc.prototype.kv = function (rows) {
    const ctx = this.ctx;
    for (const [k, v] of rows) {
      const vLines = this.wrapText(v, 20, CONTENT_W - 260, '700');
      this.ensure(vLines.length * 31 + 10);
      ctx.font = '600 19px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
      ctx.fillStyle = MUTED; this._dir(ctx);
      ctx.textAlign = this.rtl ? 'right' : 'left';
      ctx.fillText(k + ':', this.rtl ? PAGE_W - MARGIN : MARGIN, this.y);
      ctx.font = '700 20px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
      ctx.fillStyle = INK;
      vLines.forEach((ln, i) => {
        ctx.fillText(ln, this.rtl ? PAGE_W - MARGIN - 250 : MARGIN + 250, this.y);
        if (i < vLines.length - 1) this.y += 31;
      });
      this.y += 34;
    }
  };
  Doc.prototype.scoreBars = function (rows) {
    const ctx = this.ctx;
    const labelW = 430, valW = 70;
    for (const row of rows) {
      this.ensure(46);
      const label = row.label;
      ctx.font = '600 19px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
      const x0 = this.rtl ? PAGE_W - MARGIN : MARGIN;
      const trackX = this.rtl ? MARGIN + valW : PAGE_W - MARGIN - valW - 0 - (CONTENT_W - labelW - valW);
      const tw = CONTENT_W - labelW - valW;
      /* label */
      ctx.fillStyle = INK; this._dir(ctx);
      ctx.textAlign = this.rtl ? 'right' : 'left';
      ctx.fillText(clipText(ctx, label, labelW - 20), this.rtl ? PAGE_W - MARGIN : MARGIN, this.y);
      /* track */
      const tx = this.rtl ? MARGIN + valW : MARGIN + labelW;
      ctx.fillStyle = '#e7eff1';
      rr(ctx, tx, this.y - 14, tw, 14, 7); ctx.fill();
      const v = Math.max(0, Math.min(100, row.value));
      const vw = Math.max(16, tw * v / 100);
      ctx.fillStyle = v >= 72 ? OK : v >= 50 ? BRAND : v >= 35 ? WARN : BAD;
      rr(ctx, this.rtl ? tx + tw - vw : tx, this.y - 14, vw, 14, 7); ctx.fill();
      /* value */
      ctx.font = '700 19px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
      ctx.fillStyle = INK;
      ctx.textAlign = this.rtl ? 'left' : 'right';
      ctx.fillText(String(Math.round(v)), this.rtl ? MARGIN + valW - 20 : PAGE_W - MARGIN - 8, this.y);
      ctx.textAlign = this.rtl ? 'right' : 'left';
      this.y += 44;
    }
    this.y += 10;
  };
  Doc.prototype.radar = function (labels, values, title) {
    this.ensure(480);
    const ctx = this.ctx;
    const size = 430, cx = PAGE_W / 2, cy = this.y + size / 2;
    /* reuse chart lib on a temp canvas then blit */
    const tmp = document.createElement('canvas');
    tmp.width = size; tmp.height = size;
    TFCH.drawRadar(tmp, labels, values, { dir: this.rtl ? 'rtl' : 'ltr', size, labelSize: 15, pad: 46 });
    ctx.drawImage(tmp, cx - size / 2, this.y);
    this.y += size + 20;
  };
  Doc.prototype.transcriptEntry = function (roleLabel, text, color, isCoach) {
    const ctx = this.ctx;
    const lines = this.wrapText(text, 18.5, CONTENT_W - 150, '400');
    this.ensure(lines.length * 28 + 52);
    /* bubble bg */
    const bx = this.rtl ? PAGE_W - MARGIN : MARGIN;
    const bubbleX = this.rtl ? PAGE_W - MARGIN - (CONTENT_W - 40) : MARGIN + (isCoach ? 40 : 0);
    const h = lines.length * 28 + 34;
    ctx.fillStyle = isCoach ? 'rgba(201,162,39,.08)' : roleLabel === 'cp' ? SOFT : 'rgba(13,92,107,.05)';
    rr(ctx, bubbleX, this.y - 20, CONTENT_W - 40, h, 12); ctx.fill();
    ctx.font = '700 17px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = color; this._dir(ctx); this._align(ctx);
    ctx.fillText(roleLabel, this.rtl ? PAGE_W - MARGIN - 24 : MARGIN + 24, this.y + 6);
    this.y += 34;
    ctx.font = '400 18.5px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = INK; this._dir(ctx); this._align(ctx);
    for (const ln of lines) {
      ctx.fillText(ln, this.rtl ? PAGE_W - MARGIN - 24 : MARGIN + 24, this.y);
      this.y += 28;
    }
    this.y += 24;
  };
  Doc.prototype.bigScores = function () {
    const ctx = this.ctx, r = this.rep;
    this.ensure(190);
    const items = [
      { v: r.scores.overall, l: this.lang === 'ar' ? 'النتيجة الإجمالية' : 'Overall' },
      { v: r.scores.behavioural, l: this.lang === 'ar' ? 'السلوكية' : 'Behavioural' },
      { v: r.scores.outcome, l: this.lang === 'ar' ? 'جودة الاتفاق' : 'Agreement quality' }
    ];
    const cardW = (CONTENT_W - 40) / 3;
    items.forEach((it, i) => {
      const x = this.rtl ? PAGE_W - MARGIN - cardW - i * (cardW + 20) : MARGIN + i * (cardW + 20);
      ctx.fillStyle = SOFT; rr(ctx, x, this.y - 26, cardW, 140, 14); ctx.fill();
      ctx.strokeStyle = LINE; ctx.lineWidth = 1; rr(ctx, x, this.y - 26, cardW, 140, 14); ctx.stroke();
      ctx.font = '800 56px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
      ctx.fillStyle = it.v >= 70 ? OK : it.v >= 50 ? BRAND : it.v >= 35 ? WARN : BAD;
      ctx.textAlign = 'center'; this._dir(ctx);
      ctx.fillText(String(it.v), x + cardW / 2, this.y + 46);
      ctx.font = '600 19px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
      ctx.fillStyle = MUTED;
      ctx.fillText(it.l, x + cardW / 2, this.y + 86);
    });
    this.y += 170;
  };
  Doc.prototype.cover = function () {
    const ctx = this.ctx, r = this.rep;
    /* brand band */
    ctx.fillStyle = BRAND; ctx.fillRect(0, 0, PAGE_W, 320);
    ctx.fillStyle = GOLD; ctx.fillRect(0, 320, PAGE_W, 8);
    ctx.font = '800 52px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = '#ffffff'; this._dir(ctx); this._align(ctx);
    ctx.fillText(this.lang === 'ar' ? 'منصة تفاهم' : 'Tafahum Platform', this._x(), 130);
    ctx.font = '500 22px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(this.lang === 'ar' ? 'من الحوار إلى الاتفاق — التدريب على التفاوض وإدارة الحوار' : 'From dialogue to agreement — negotiation & dialogue training', this._x(), 185);
    ctx.font = '800 40px ' + "'Cairo','Segoe UI',Tahoma,sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(r.meta.title, this._x(), 265);
    this.y = 400;
    this.kv([
      [this.lang === 'ar' ? 'المتدرب' : 'Trainee', r.meta.trainee],
      [this.lang === 'ar' ? 'السيناريو' : 'Scenario', r.meta.scenarioTitle],
      [this.lang === 'ar' ? 'التاريخ' : 'Date', TF.fmtDate(r.meta.date, this.lang)],
      [this.lang === 'ar' ? 'الجولات' : 'Rounds', String(r.meta.rounds)],
      [this.lang === 'ar' ? 'المدة' : 'Duration', r.meta.durationMin + (this.lang === 'ar' ? ' دقيقة' : ' min')],
      [this.lang === 'ar' ? 'الأسلوب الغالب' : 'Dominant style', r.meta.style],
      [this.lang === 'ar' ? 'النتيجة' : 'Outcome', outcomeLabel(r.scores.outcomeType, this.lang) + (r.scores.dealTerms ? ' — ' + r.scores.dealTerms : '')]
    ]);
    this.y += 10;
    this.bigScores();
  };
  Doc.prototype.finish = function () { return this.pages; };

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function clipText(ctx, s, maxW) {
    if (ctx.measureText(s).width <= maxW) return s;
    let t = s;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }

  /* main PDF pipeline */
  async function exportPDF(session, data) {
    const rep = assembleReport(session, data);
    const lang = rep.meta.lang;

    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { } }

    const doc = new Doc(rep);
    doc.cover();

    const t = (k, vars) => TFI.t(k, vars);
    const critLabels = TFI.criteriaLabels(lang);
    const dialLabels = TFI.dialogueLabels(lang);

    /* scenario */
    doc.h2(t('rep_section_scen'));
    doc.p(rep.scenarioSection.summary, { size: 22, weight: '700', color: INK });
    doc.p(rep.scenarioSection.context, { size: 20, color: MUTED });
    doc.kv([
      [t('sim_for'), rep.scenarioSection.traineeRole],
      [t('sim_vs'), rep.scenarioSection.counterpartName + ' — ' + rep.scenarioSection.counterpartTitle]
    ]);
    if (rep.scenarioSection.objectives.length) doc.bullets(rep.scenarioSection.objectives, { dot: BRAND });
    if (rep.scores.dealTerms) doc.p('✔ ' + t('ev_deal_terms') + ': ' + rep.scores.dealTerms, { size: 20, color: OK, weight: '700' });

    /* expert path */
    if (rep.expertPath) {
      doc.h2(t('rep_section_path'));
      doc.p(t('rep_strategy') + ': ' + rep.expertPath.strategy, { size: 20 });
      doc.h3(t('rep_moves'), BRAND);
      doc.bullets(rep.expertPath.moves);
      doc.h3(t('rep_avoid'), BAD);
      doc.bullets(rep.expertPath.avoid, { dot: BAD });
    }

    /* topic SWOT */
    if (rep.topicSWOT) {
      doc.h2(t('rep_section_swot'));
      doc.h3(t('rep_topic_strengths'), OK);
      doc.bullets(rep.topicSWOT.strengths, { dot: OK });
      doc.h3(t('rep_topic_weaknesses'), BAD);
      doc.bullets(rep.topicSWOT.weaknesses, { dot: BAD });
    }

    /* scores */
    doc.h2(t('rep_section_scores'));
    doc.radar(TFE.CRITERIA_IDS.map(i => critLabels[i]), TFE.CRITERIA_IDS.map(i => rep.negotiationEval.scores[i]));
    doc.scoreBars(TFE.CRITERIA_IDS.map(i => ({ label: critLabels[i], value: rep.negotiationEval.scores[i] })));
    doc.scoreBars(TFE.DIALOGUE_IDS.map(i => ({ label: dialLabels[i], value: rep.dialogueEval.scores[i] })));

    /* dialogue stage */
    doc.h2(t('rep_section_dialogue'));
    renderStage(doc, rep.dialogueEval, dialLabels, lang);
    /* negotiation stage */
    doc.h2(t('rep_section_negotiation'));
    renderStage(doc, rep.negotiationEval, critLabels, lang);

    /* transcript */
    doc.h2(t('rep_section_transcript'));
    const you = t('ses_you'), cp = t('ses_cp'), coach = t('coach_label');
    for (const m of rep.transcript) {
      if (m.role === 'user') doc.transcriptEntry(you, m.text, BRAND);
      else if (m.role === 'cp') doc.transcriptEntry(cp, m.text, MUTED);
      else if (m.role === 'coach') doc.transcriptEntry(coach, m.text, GOLD, true);
    }

    /* development plan */
    doc.h2(t('rep_section_plan'));
    for (const r of rep.recommendations) {
      doc.ensure(120);
      doc.p('• ' + (r.skill ? dialLabels[r.id] : critLabels[r.id]) + ': ' + r.what, { size: 21, weight: '700' });
      doc.p(r.how, { size: 19, color: MUTED });
    }
    doc.y += 24;
    doc.p(t('rep_footer'), { size: 16, color: MUTED });

    /* build pdf */
    const pages = doc.finish();
    const jpegs = pages.map(c => ({
      jpeg: TFPDF.jpegBytesFromDataUrl(c.toDataURL('image/jpeg', 0.9)),
      w: c.width, h: c.height
    }));
    const bytes = TFPDF.buildPdf(jpegs, {
      title: (lang === 'ar' ? 'تقرير جلسة — ' : 'Session report — ') + rep.meta.scenarioTitle,
      author: rep.meta.trainee
    });
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const fname = 'tafahum-report-' + rep.meta.scenarioTitle.replace(/[\\/:*?"<>|]/g, '').slice(0, 40) + '-' + new Date(rep.meta.date).toISOString().slice(0, 10) + '.pdf';
    downloadBlob(blob, fname);
    return fname;
  }

  function renderStage(doc, ev, labels, lang) {
    if (ev.strengths.length) {
      doc.h3(lang === 'ar' ? 'نقاط قوتك' : 'Your strengths', OK);
      for (const s of ev.strengths) {
        doc.p('✔ ' + labels[s.id] + ' (' + Math.round(s.score) + ')', { size: 20, weight: '700', color: OK });
        if (s.evidence.length) doc.p('«' + s.evidence[0].text + '»', { size: 18, color: MUTED });
      }
    } else {
      doc.p(lang === 'ar' ? 'لم تظهر نقاط قوة بارزة في هذه المرحلة.' : 'No standout strengths in this stage.', { size: 19, color: MUTED });
    }
    if (ev.weaknesses.length) {
      doc.h3(lang === 'ar' ? 'ما يجب ترميمه' : 'What to repair', BAD);
      for (const w of ev.weaknesses) {
        doc.p('▲ ' + labels[w.id] + ' (' + Math.round(w.score) + ')', { size: 20, weight: '700', color: BAD });
        if (w.evidence.length) doc.p('«' + w.evidence[0].text + '»', { size: 18, color: MUTED });
      }
    }
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.append(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 800);
  }

  /* small inline svg helpers for the HTML report */
  function logoSVG() {
    return `<svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#0d5c6b"/>
      <path d="M13 17h13a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-3l-4 4v-4h-2a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4Z" fill="#ffffff"/>
      <path d="M35 13h-5a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h2l3 3v-3h1a3 3 0 0 0 3-3v-4a4 4 0 0 0-4-4Z" fill="#c9a227"/>
    </svg>`;
  }
  function iconCheck() { return '<span class="ok">✔</span>'; }
  function iconTarget() { return '<span class="tgt">◎</span>'; }
  function iconLamp() { return '<span class="lamp">💡</span>'; }

  return { assembleReport, renderReportHTML, mountCharts, exportPDF, outcomeLabel, relationshipLabel };
});
