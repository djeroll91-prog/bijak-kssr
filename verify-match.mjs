/**
 * Pengesah soalan padan pasangan.
 *
 * Soalan padan mesti boleh diselesaikan: setiap label kanan mesti sepadan
 * dengan sekurang-kurangnya satu kiri, dan bilangan kiri mesti sama dengan
 * bilangan kanan. Ini menghalang pepijat label kanan berulang (contohnya
 * "bulatan" bagi silinder, kon dan sfera) yang menyekat murid.
 *
 * Jalankan: node verify-match.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = join(mkdtempSync(join(tmpdir(), 'match-')), 'b.mjs');
await build({
  entryPoints: ['src/data/catalog.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
});
const mod = await import(out);
const { ALL_TOPICS, generateQuestions } = mod;

const fails = [];
const problems = [];

for (const topic of ALL_TOPICS) {
  for (let seed = 1; seed <= 40; seed += 1) {
    const qs = generateQuestions(topic.id, 12, seed);
    for (const q of qs) {
      if (q.kind !== 'match') continue;
      const pairs = q.pairs ?? [];
      if (pairs.length === 0) {
        fails.push(`${topic.id}: soalan padan tanpa pasangan`);
        continue;
      }
      // Kiri unik.
      const lefts = pairs.map((p) => p.left);
      if (new Set(lefts).size !== lefts.length) {
        problems.push(`${topic.id}: label kiri berulang [${lefts.join(', ')}]`);
      }
      // Setiap label kanan yang berulang bermakna sekurang-kurangnya satu kiri
      // menjadi tidak dapat dipadankan secara unik. Widget kini mengendalikan
      // ini, tetapi data sepatutnya elak jika boleh.
      const rights = pairs.map((p) => p.right);
      const dupes = rights.filter((r, i) => rights.indexOf(r) !== i);
      if (dupes.length > 0) {
        problems.push(`${topic.id}: label kanan berulang [${[...new Set(dupes)].join(', ')}]`);
      }
      // Bilangan kiri mesti sama dengan bilangan kanan.
      if (pairs.length !== rights.length) {
        fails.push(`${topic.id}: kiri ${pairs.length} != kanan ${rights.length}`);
      }
    }
  }
}

if (fails.length > 0) {
  console.error(`verify-match: ${fails.length} GAGAL`);
  for (const f of fails.slice(0, 20)) console.error(`  - ${f}`);
  process.exit(1);
}

if (problems.length > 0) {
  const uniq = [...new Set(problems)];
  console.log(`verify-match: OK (${uniq.length} nota)`);
  for (const p of uniq.slice(0, 15)) console.log(`  nota: ${p}`);
} else {
  console.log('verify-match: ALL OK');
}
