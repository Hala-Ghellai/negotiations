'use strict';
const M = require('./modules.js');
const { TFA, TFDG } = M;
const text = 'همم، هذا رأي مثير للاهتمام بالنسبة لنا جميعاً.';
const flat = TFA.normalize(text);
console.log('flat:', flat);
for (const [cat, arr] of Object.entries(TFDG.LEX)) {
  for (const w of arr) {
    if (TFDG.hasTerm(flat, w)) console.log('hit', cat, JSON.stringify(w));
  }
}
