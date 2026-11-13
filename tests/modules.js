/* ============================================================
   Tafahum Platform — Node module loader for the browser scripts.

   The Laravel layout loads the app as classic <script> files that
   share one global scope. `tafahum/package.json` declares
   "type": "module", so requiring those files directly would make
   Node parse them as ESM. To test the real load order (including
   dialogue.js before engine.js) we evaluate them in a single vm
   context with a `self` global, exactly like the browser does.
   ============================================================ */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DIR = path.join(__dirname, '..', 'tafahum', 'public', 'assets', 'js');

/* Same order as resources/views/layouts/app.blade.php (app.js is the
   DOM boot script and is intentionally not loaded here). */
const FILES = [
  'core.js',
  'i18n.js',
  'scenarios.js',
  'analyzer.js',
  'evaluator.js',
  'dialogue.js',
  'engine.js',
  'coach.js',
  'diagnostic.js',
  'knowledge.js',
  'charts.js',
  'pdfwriter.js',
  'report.js'
];

const sandbox = { console, setTimeout, clearTimeout };
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const file of FILES) {
  const full = path.join(DIR, file);
  vm.runInContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: full });
}

module.exports = {
  TF: sandbox.TF,
  TFI: sandbox.TFI,
  TFS: sandbox.TFS,
  TFA: sandbox.TFA,
  TFE: sandbox.TFE,
  TFDG: sandbox.TFDG,
  TENG: sandbox.TENG,
  TFC: sandbox.TFC,
  TFD: sandbox.TFD,
  TFK: sandbox.TFK,
  TFCH: sandbox.TFCH,
  TFPDF: sandbox.TFPDF,
  TFR: sandbox.TFR
};
