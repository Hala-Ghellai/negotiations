/* ============================================================
   Tafahum Platform — charts (radar + bars on canvas)
   Pure geometry helpers (node-testable) + canvas renderers.
   UMD module.
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFCH = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- pure geometry ---------- */
  function radarPoints(n, cx, cy, r, startAngle) {
    const pts = [];
    const a0 = startAngle == null ? -Math.PI / 2 : startAngle;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i * 2 * Math.PI) / n;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, angle: a });
    }
    return pts;
  }

  function ringLevels(r, steps) {
    const out = [];
    for (let i = 1; i <= steps; i++) out.push((r * i) / steps);
    return out;
  }

  /* ---------- canvas radar ----------
     opts: {labels[], values[] (0..100), size, colors, dir ('rtl'|'ltr'), font} */
  function drawRadar(canvas, labels, values, opts) {
    opts = opts || {};
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const size = opts.size || Math.min(canvas.clientWidth || 320, canvas.clientHeight || 320);
    canvas.width = size * dpr; canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2;
    const r = size / 2 - (opts.pad || 34);
    const n = Math.max(labels.length, values.length);
    const pts = radarPoints(n, cx, cy, r);
    const ink = opts.ink || '#16323d';
    const line = opts.line || '#d7e3e7';
    const brand = opts.brand || '#0d5c6b';
    const gold = opts.gold || '#c9a227';
    const font = opts.font || "'Cairo','Segoe UI',Tahoma,sans-serif";

    /* grid rings */
    for (const rr of ringLevels(r, 4)) {
      ctx.beginPath();
      pts.forEach((p, i) => {
        const px = cx + Math.cos(p.angle) * rr, py = cy + Math.sin(p.angle) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke();
    }
    /* spokes */
    for (const p of pts) {
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke();
    }

    /* value polygon */
    ctx.beginPath();
    pts.forEach((p, i) => {
      const v = Math.max(0, Math.min(100, values[i] == null ? 0 : values[i])) / 100;
      const px = cx + Math.cos(p.angle) * r * v, py = cy + Math.sin(p.angle) * r * v;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, 'rgba(13,92,107,.34)');
    grad.addColorStop(1, 'rgba(201,162,39,.30)');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = brand; ctx.lineWidth = 2; ctx.stroke();

    /* vertex dots */
    pts.forEach((p, i) => {
      const v = Math.max(0, Math.min(100, values[i] == null ? 0 : values[i])) / 100;
      const px = cx + Math.cos(p.angle) * r * v, py = cy + Math.sin(p.angle) * r * v;
      ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = gold; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke();
    });

    /* labels */
    ctx.font = `600 ${opts.labelSize || 11}px ${font}`;
    ctx.fillStyle = ink;
    const rtl = opts.dir === 'rtl';
    ctx.textAlign = rtl ? 'right' : 'left';
    ctx.direction = rtl ? 'rtl' : 'ltr';
    pts.forEach((p, i) => {
      const lx = cx + Math.cos(p.angle) * (r + 12);
      const ly = cy + Math.sin(p.angle) * (r + 12);
      let tx, ty;
      const cos = Math.cos(p.angle), sin = Math.sin(p.angle);
      if (Math.abs(cos) < 0.3) { ctx.textAlign = 'center'; tx = lx; }
      else if (rtl ? cos > 0 : cos < 0) { ctx.textAlign = 'end'; tx = lx; }
      else { ctx.textAlign = 'start'; tx = lx; }
      ty = ly + (sin > 0.3 ? 10 : sin < -0.3 ? -6 : 4);
      const label = String(labels[i] || '');
      wrapLabel(ctx, label, tx, ty, r * 0.6);
    });
    return pts;
  }

  function wrapLabel(ctx, label, x, y, maxWidth) {
    const words = String(label).split(/\s+/);
    if (ctx.measureText(label).width <= maxWidth || words.length === 1) {
      ctx.fillText(label, x, y); return;
    }
    /* two-line wrap at middle-ish */
    const mid = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, mid).join(' '), x, y - 5);
    ctx.fillText(words.slice(mid).join(' '), x, y + 9);
  }

  /* ---------- horizontal score bars ---------- */
  function drawBars(canvas, rows, opts) {
    opts = opts || {};
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const W = canvas.width / dpr || opts.width || 520;
    const rowH = opts.rowH || 34;
    const H = rows.length * rowH + 8;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);

    const rtl = opts.dir === 'rtl';
    const font = opts.font || "'Cairo','Segoe UI',Tahoma,sans-serif";
    const ink = opts.ink || '#16323d';
    const labelW = opts.labelW || Math.min(210, W * 0.42);
    const barW = W - labelW - 46;

    rows.forEach((row, i) => {
      const y = i * rowH + rowH / 2;
      /* label */
      ctx.font = `600 12.5px ${font}`;
      ctx.fillStyle = ink; ctx.direction = rtl ? 'rtl' : 'ltr';
      ctx.textAlign = rtl ? 'right' : 'left';
      const lx = rtl ? W - 4 : 4;
      const label = String(row.label || '');
      ctx.fillText(clipText(ctx, label, labelW - 12), lx, y - 7);
      /* track */
      const tx = rtl ? 4 : labelW, tw = barW;
      ctx.fillStyle = '#e7eff1';
      roundRect(ctx, tx, y - 1, tw, 9, 4.5); ctx.fill();
      /* value */
      const v = Math.max(0, Math.min(100, row.value == null ? 0 : row.value));
      const vw = Math.max(9, tw * v / 100);
      ctx.fillStyle = barColor(v);
      roundRect(ctx, rtl ? tx + tw - vw : tx, y - 1, vw, 9, 4.5); ctx.fill();
      /* number */
      ctx.font = `700 12px ${font}`;
      ctx.fillStyle = ink; ctx.textAlign = rtl ? 'left' : 'right';
      ctx.fillText(String(Math.round(v)), rtl ? 8 : W - 6, y + 3);
    });
    return true;
  }

  function barColor(v) {
    if (v >= 72) return '#2e8b57';
    if (v >= 50) return '#0d5c6b';
    if (v >= 35) return '#c77b1f';
    return '#b3492f';
  }

  function roundRect(ctx, x, y, w, h, r) {
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

  /* simple sparkline for the dashboard */
  function drawSpark(canvas, values, opts) {
    opts = opts || {};
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const W = opts.width || canvas.clientWidth || 220, H = opts.height || 46;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    if (!values || values.length < 2) { /* single dot */ 
      if (values && values.length === 1) { ctx.fillStyle = '#0d5c6b'; ctx.beginPath(); ctx.arc(W/2, H/2, 3, 0, 7); ctx.fill(); }
      return;
    }
    const min = Math.min(...values), max = Math.max(...values);
    const span = Math.max(max - min, 1);
    const pts = values.map((v, i) => ({
      x: (i / (values.length - 1)) * (W - 8) + 4,
      y: H - 6 - ((v - min) / span) * (H - 14)
    }));
    ctx.beginPath();
    pts.forEach((p, i) => { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
    ctx.strokeStyle = '#0d5c6b'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2); ctx.fillStyle = '#c9a227'; ctx.fill(); });
  }

  return { radarPoints, ringLevels, drawRadar, drawBars, drawSpark, barColor };
});
