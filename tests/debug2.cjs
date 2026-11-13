'use strict';
const M = require('./modules.js');
const { TFA, TENG, TFS, TFDG } = M;

const filler = 'همم، هذا رأي مثير للاهتمام بالنسبة لنا جميعاً.';
const s = TENG.createSession(TFS.getScenario('contractor'), { lang: 'ar', seed: 'cap-1' });
const a = TFA.analyze(filler, 'ar');
const f = TFDG.interpret(s, filler, a);
console.log('analyze', JSON.stringify({ flat: a.flat, intents: a.intents, numbers: a.numbers }));
console.log('frame', JSON.stringify({ acts: f.acts, stance: f.stance, target: f.target, values: f.values, proposalValues: f.proposalValues, qk: f.questionKind, pendingAnswer: f.pendingAnswer, ambiguity: f.ambiguity }));
for (const w of ['موافق', 'مناسب', 'مقبول', 'حسنا', 'تمام', 'طيب', 'ماشي', 'اتفق', 'نقبل', 'اقبل', 'راض']) {
  if (a.flat.indexOf(w) !== -1) console.log('accept term found:', w, 'at', a.flat.indexOf(w));
}
