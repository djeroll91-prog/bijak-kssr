/**
 * Semakan atribusi guru (src/data/contributors.ts).
 * Memastikan setiap topik ada kredit guru, kredit kekal (deterministik)
 * dan beberapa guru dikreditkan merentas katalog. Jalankan: node verify-contributors.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

async function load(entry) {
  const out = join(mkdtempSync(join(tmpdir(), 'vc-')), 'bundle.mjs');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
  return import(out);
}

const cat = await load('src/data/catalog.ts');
const con = await load('src/data/contributors.ts');

let missing = 0;
const counts = new Map();
for (const t of cat.ALL_TOPICS) {
  const a = con.contributorFor(t.id);
  const b = con.contributorFor(t.id);
  if (!a || !a.name) missing += 1;
  if (a.name !== b.name) missing += 1;
  counts.set(a.name, (counts.get(a.name) || 0) + 1);
}

console.log('Topik:', cat.ALL_TOPICS.length);
console.log('Guru dikreditkan:', counts.size);
for (const [name, n] of [...counts.entries()].sort((x, y) => y[1] - x[1])) {
  console.log(`  ${name}: ${n} topik`);
}
console.log('Kredit hilang/tidak kekal:', missing);
console.log(counts.size >= 3 && missing === 0 ? 'ALL OK' : 'GAGAL');
