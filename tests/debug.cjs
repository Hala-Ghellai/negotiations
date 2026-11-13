'use strict';
const M = require('./modules.js');
const { TFA, TENG, TFS } = M;

const texts = [
  'أقترح متابعة شخصية برقم طلب حتى الإنجاز اليوم، مع اعتذار رسمي موثّق.',
  'همم، هذا رأي مثير للاهتمام بالنسبة لنا جميعاً.',
  'أقدّر وقتك، وأعتذر عن التقصير الحاصل. ما الذي يهمك أكثر في معالجة هذا الطلب؟'
];
for (const t of texts) {
  const a = TFA.analyze(t, 'ar');
  console.log(JSON.stringify({ t, flat: a.flat, question: a.intents.question, offer: a.intents.offer, option: a.intents.option, apology: a.intents.acknowledge, qc: a.questionCount, wc: a.wordCount }));
}

const c = TFS.SCENARIOS.find(x => !(x.dimensions || []).length);
console.log('scenario', c.id, 'packages', (c.packages || []).map(p => p.id));
const q = TENG.createSession(c, { lang: 'ar', seed: 'qual-1' });
const r1 = TENG.userTurn(q, texts[2]);
console.log('r1 frame', JSON.stringify({ qk: q.dialogue.lastFrame.questionKind, acts: q.dialogue.lastFrame.acts, pending: q.cp.pendingQuestion }));
console.log('r1', r1.messages.map(m => m.text));
const r2 = TENG.userTurn(q, texts[0]);
console.log('r2 frame', JSON.stringify({ qk: q.dialogue.lastFrame.questionKind, acts: q.dialogue.lastFrame.acts, values: q.dialogue.lastFrame.values, proposalValues: q.dialogue.lastFrame.proposalValues }));
console.log('r2', r2.messages.map(m => m.text));
console.log('pkgs', q.flags.packagesMatched);
console.log('match', TENG.matchPackage(q, texts[0]));

const s = TENG.createSession(TFS.getScenario('contractor'), { lang: 'ar', seed: 'cap-1' });
for (let i = 0; i < 25 && !s.ended; i++) {
  const r = TENG.userTurn(s, texts[1]);
  const f = s.dialogue.lastFrame;
  console.log(i + 1, 'qk=' + f.questionKind, 'primary=' + f.primary, 'counter=' + JSON.stringify(s.cp.lastCounter), '|', r.messages.map(m => m.text.slice(0, 80)).join(' || '));
}
console.log('ended', s.ended, s.endReason, s.turns);
