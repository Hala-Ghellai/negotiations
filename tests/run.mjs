/* Tafahum — Node test runner.
   Usage:  node tests/run.mjs            (from the project root)
   The suite is plain CommonJS (UMD) so it also runs in the browser
   via test.html — this runner just loads it and prints results. */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const suite = require(path.join(here, 'suite.js'));

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

console.log('\nتفاهم — Tafahum platform test suite\n' + '='.repeat(52));

const t0 = Date.now();
const results = suite.run((line) => console.log(line));
const ms = Date.now() - t0;

const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok);

console.log('='.repeat(52));
console.log(`${passed}/${results.length} passed` + (failed.length ? ` — ${failed.length} FAILED` : ' — all green') + `  (${ms} ms)`);

if (failed.length) {
  console.log('\nFailures:');
  for (const f of failed) console.log('  ✗ ' + f.name + '\n      ' + f.err);
  process.exit(1);
}
