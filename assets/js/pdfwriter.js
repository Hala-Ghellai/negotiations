/* ============================================================
   Tafahum Platform — minimal PDF writer
   Builds a valid PDF from JPEG page images (DCTDecode XObjects)
   with zero external dependencies. Pure logic: node-testable.
   Page size can vary per page (MediaBox from image aspect).
   ============================================================ */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TFPDF = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* PDF points per A4 at our canvas scale.
     We render canvases at 1240x1754 (A4 @150dpi). We map that to
     the standard A4 595x842 pt MediaBox. */
  const A4_W = 595.28, A4_H = 841.89;

  function utf16bePdfString(str) {
    /* PDF text string as UTF-16BE with BOM, hex-encoded */
    const s = String(str || '');
    let out = 'FEFF';
    for (let i = 0; i < s.length; i++) {
      let code = s.codePointAt(i);
      if (code > 0xffff) {
        /* surrogate pair */
        code -= 0x10000;
        const hi = 0xd800 + (code >> 10), lo = 0xdc00 + (code & 0x3ff);
        out += hi.toString(16).padStart(4, '0') + lo.toString(16).padStart(4, '0');
      } else {
        out += code.toString(16).padStart(4, '0');
        if (code > 0xffff) i++; /* handled pair */
      }
    }
    return '<' + out + '>';
  }

  /* dataUrl: "data:image/jpeg;base64,...." -> Uint8Array */
  function jpegBytesFromDataUrl(dataUrl) {
    const b64 = String(dataUrl).split(',')[1] || '';
    return base64ToBytes(b64);
  }

  function base64ToBytes(b64) {
    b64 = String(b64).replace(/[^A-Za-z0-9+/=]/g, '');
    if (typeof atob === 'function') {
      const bin = atob(b64);
      return Uint8Array.from(bin, ch => ch.charCodeAt(0));
    }
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Map();
    for (let i = 0; i < ALPHABET.length; i++) lookup.set(ALPHABET[i], i);
    const out = [];
    for (let i = 0; i < b64.length; i += 4) {
      const c0 = lookup.get(b64[i]);
      const c1 = b64[i + 1] !== '=' ? lookup.get(b64[i + 1]) : null;
      const c2 = b64[i + 2] !== '=' ? lookup.get(b64[i + 2]) : null;
      const c3 = b64[i + 3] !== '=' ? lookup.get(b64[i + 3]) : null;
      if (c0 == null || c1 == null) break;
      out.push((c0 << 2) | (c1 >> 4));
      if (c2 != null) out.push(((c1 & 0xf) << 4) | (c2 >> 2));
      if (c3 != null) out.push(((c2 & 0x3) << 6) | c3);
    }
    return Uint8Array.from(out);
  }

  /* pages: [{jpeg: Uint8Array, w: number, h: number}] in pixels
     info: {title, author} optional */
  function buildPdf(pages, info) {
    if (!pages || !pages.length) throw new Error('no pages');

    const chunks = [];
    let offset = 0;
    const offsets = []; /* obj number -> byte offset */

    function push(bytes) {
      if (typeof bytes === 'string') bytes = asciiBytes(bytes);
      chunks.push(bytes); offset += bytes.length;
    }
    function pushStr(s) { push(asciiBytes(s)); }
    function mark(num) { offsets[num] = offset; }

    /* header */
    pushStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    const nPages = pages.length;
    /* object numbering:
       1 catalog, 2 pages, 3 info,
       then per page i (0-based): page=4+i*3, img=5+i*3, content=6+i*3 */
    const infoNum = 3;
    const firstPageNum = 4;

    /* 1: catalog */
    mark(1);
    pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    /* 2: pages (fill kids later via placeholder-free approach: build after kids known) */
    const kidsNums = [];
    for (let i = 0; i < nPages; i++) kidsNums.push(firstPageNum + i * 3);
    mark(2);
    pushStr('2 0 obj\n<< /Type /Pages /Count ' + nPages + ' /Kids [' + kidsNums.map(k => k + ' 0 R').join(' ') + '] >>\nendobj\n');

    /* 3: info */
    mark(3);
    const title = utf16bePdfString((info && info.title) || 'Tafahum Report');
    const author = utf16bePdfString((info && info.author) || 'Tafahum Platform');
    const producer = utf16bePdfString('Tafahum Negotiation Training Platform');
    pushStr('3 0 obj\n<< /Title ' + title + ' /Author ' + author + ' /Producer ' + producer + ' >>\nendobj\n');

    for (let i = 0; i < nPages; i++) {
      const pageNum = firstPageNum + i * 3, imgNum = pageNum + 1, contNum = pageNum + 2;
      const page = pages[i];
      /* scale canvas px -> pt via A4 mapping */
      const scalePt = Math.min(A4_W / page.w, A4_H / page.h);
      const wPt = page.w * scalePt, hPt = page.h * scalePt;

      /* page object */
      mark(pageNum);
      pushStr(pageNum + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
        fmt(wPt) + ' ' + fmt(hPt) + '] /Resources << /XObject << /Im' + i + ' ' + imgNum + ' 0 R >> >> /Contents ' + contNum + ' 0 R >>\nendobj\n');

      /* image object */
      mark(imgNum);
      pushStr(imgNum + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + page.w + ' /Height ' + page.h +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + page.jpeg.length + ' >>\nstream\n');
      push(page.jpeg);
      pushStr('\nendstream\nendobj\n');

      /* content stream: draw image scaled to full page */
      const content = 'q\n' + fmt(wPt) + ' 0 0 ' + fmt(hPt) + ' 0 0 cm\n/Im' + i + ' Do\nQ\n';
      mark(contNum);
      pushStr(contNum + ' 0 obj\n<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream\nendobj\n');
    }

    /* xref */
    const total = firstPageNum + nPages * 3;
    const xrefPos = offset;
    let xref = 'xref\n0 ' + (total + 1) + '\n0000000000 65535 f \n';
    for (let num = 1; num <= total; num++) {
      xref += String(offsets[num]).padStart(10, '0') + ' 00000 n \n';
    }
    pushStr(xref);
    pushStr('trailer\n<< /Size ' + (total + 1) + ' /Root 1 0 R /Info 3 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF\n');

    /* concat */
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(totalLen);
    let pos = 0;
    for (const c of chunks) { out.set(c, pos); pos += c.length; }
    return out;
  }

  function fmt(n) { return (Math.round(n * 100) / 100).toString(); }

  function asciiBytes(s) {
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      let c = s.charCodeAt(i);
      if (c > 127) { /* our only non-ascii usage is the binary comment line; encode raw */
        c = c & 0xff;
      }
      out[i] = c;
    }
    return out;
  }

  /* quick validation for tests: parse xref offsets */
  function validate(bytes) {
    const s = bytesToString(bytes);
    const errs = [];
    if (!s.startsWith('%PDF-')) errs.push('missing header');
    if (!s.trimEnd().endsWith('%%EOF')) errs.push('missing EOF');
    const sx = s.lastIndexOf('startxref');
    if (sx < 0) { errs.push('missing startxref'); return { ok: !errs.length, errs }; }
    const xrefPos = parseInt(s.slice(sx + 9).trim().split(/\s+/)[0], 10);
    if (!(xrefPos > 0)) errs.push('bad startxref pos');
    if (!s.slice(xrefPos, xrefPos + 4).startsWith('xref')) errs.push('xref not at startxref position');
    /* verify a couple of offsets */
    const re = /(\d{10}) 00000 n/g;
    const lines = s.slice(xrefPos).split('\n').filter(l => re.test(l));
    re.lastIndex = 0;
    const entries = [];
    let m;
    const xrefBlock = s.slice(xrefPos);
    while ((m = re.exec(xrefBlock))) entries.push(parseInt(m[1], 10));
    for (const off of entries) {
      if (!(off > 0 && off < bytes.length)) { errs.push('offset out of range: ' + off); break; }
      const head = s.slice(off, off + 12);
      if (!/^\d+ \d+ obj/.test(head)) { errs.push('offset does not point at an object: "' + head + '"'); break; }
    }
    const countPages = (s.match(/\/Type \/Page[^s]/g) || []).length;
    return { ok: !errs.length, errs, pages: countPages };
  }

  function bytesToString(bytes) {
    let s = '';
    const B = bytes;
    for (let i = 0; i < B.length; i += 4096) s += String.fromCharCode.apply(null, B.subarray(i, Math.min(i + 4096, B.length)));
    return s;
  }

  return { buildPdf, validate, jpegBytesFromDataUrl, base64ToBytes, utf16bePdfString, A4_W, A4_H };
});
