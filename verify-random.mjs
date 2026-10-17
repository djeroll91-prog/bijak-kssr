// Sahkan soalan dijana semula secara rawak untuk setiap sesi.
import { build } from 'esbuild';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const out = join(mkdtempSync(join(tmpdir(), 'r-')), 'b.mjs');
await build({ entryPoints: ['src/data/catalog.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const { generateQuestions, ALL_TOPICS } = await import(out);

// Banding kandungan penuh (prompt + pilihan + jawapan), bukan hanya teks prompt,
// supaya variasi pilihan jawapan juga dikira.
const sig = (q) => JSON.stringify([q.prompt, q.options ?? q.pairs ?? null, q.answer]);
const overlap = (a, b) => a.filter((x) => b.includes(x)).length;

let worst = 0;
let worstTopic = '';
const fixed = [];
for (const topic of ALL_TOPICS) {
  const a = generateQuestions(topic.id, 8, 11).map(sig);
  const b = generateQuestions(topic.id, 8, 22).map(sig);
  const o = overlap(a, b);
  if (o > worst) {
    worst = o;
    worstTopic = topic.id;
  }
  if (o === 8) fixed.push(topic.id);
}
console.log(`Topik paling bertindih antara dua sesi: ${worst}/8 (${worstTopic})`);
console.log(`Topik dengan set soalan tetap (${fixed.length}/${ALL_TOPICS.length}):`);
console.log(fixed.length ? fixed.join(', ') : '(tiada)');

const sets = [11, 22, 33].map((s) => generateQuestions('mt4-wang', 8, s).map(sig));
console.log('mt4-wang seed11 vs seed22 sama:', overlap(sets[0], sets[1]), '/8');
console.log('mt4-wang unik keseluruhan:', new Set([...sets[0], ...sets[1], ...sets[2]]).size, '/24');
