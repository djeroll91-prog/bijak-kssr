import { build } from 'esbuild';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const out = join(mkdtempSync(join(tmpdir(), 'v-')), 'bundle.mjs');
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
const problems = [];
let total = 0;
// Topik al-Quran yang mesti menghasilkan soalan hafazan berasaskan ayat.
const surahTopics = ['pi1-quran-hafazan', 'pi2-quran-bacaan', 'pi3-quran-tajwid', 'pi4-quran-hukum', 'pi5-quran-mad', 'pi6-quran-waqaf'];
const surahSeen = new Set();
for (const topic of ALL_TOPICS) {
  for (let seed = 1; seed <= 6; seed += 1) {
    let qs;
    try {
      qs = generateQuestions(topic.id, 8, seed);
    } catch (e) {
      problems.push(`${topic.id} seed${seed}: THROW ${e.message}`);
      continue;
    }
    if (qs.length === 0) {
      problems.push(`${topic.id}: 0 questions`);
      continue;
    }
    for (const q of qs) {
      total += 1;
      if (!q.prompt || !q.explanation) problems.push(`${topic.id}: missing prompt/explanation`);
      if (/[\u0600-\u06ff]/.test(q.prompt)) surahSeen.add(topic.id);
      if (q.options) {
        const uniq = new Set(q.options);
        if (uniq.size !== q.options.length) problems.push(`${topic.id}: dup options "${q.options}"`);
        if (!q.options.includes(String(q.answer))) problems.push(`${topic.id}: answer "${q.answer}" not in options [${q.options}]`);
        if (q.options.length < 2) problems.push(`${topic.id}: <2 options`);
      }
      if (q.kind === 'numeric' && !Number.isFinite(Number(q.answer))) problems.push(`${topic.id}: numeric answer "${q.answer}" not a number`);
      if (q.kind === 'order') {
        if (!Array.isArray(q.answer)) problems.push(`${topic.id}: order answer not array`);
        else if (q.items && q.items.length !== q.answer.length) problems.push(`${topic.id}: order items ${q.items.length} != answer ${q.answer.length}`);
        else if (q.answer.some((a) => !q.items.includes(a))) problems.push(`${topic.id}: order answer not subset of items`);
        // Label bernombor membocorkan jawapan susun urutan.
        if (q.items && q.items.some((it) => /^\s*\d+[.)]/.test(it))) {
          problems.push(`${topic.id}: order item leaks number "${q.items.find((it) => /^\s*\d+[.)]/.test(it))}"`);
        }
      }
      if (q.kind === 'match') {
        if (!q.pairs || q.pairs.length < 2) problems.push(`${topic.id}: match pairs <2`);
        else {
          const lefts = new Set(q.pairs.map((p) => p.left));
          if (lefts.size !== q.pairs.length) problems.push(`${topic.id}: match dup lefts`);
          // Label kanan berulang hanya nota kualiti (widget memadankan ikut
          // indeks), jadi ia dilaporkan oleh verify-match.mjs, bukan di sini.
        }
      }
    }
  }
}
for (const id of surahTopics) {
  if (!surahSeen.has(id)) problems.push(`${id}: tiada soalan hafazan berasaskan ayat dijana`);
}
console.log(`Topics: ${ALL_TOPICS.length}  Questions checked: ${total}`);
if (problems.length === 0) console.log('ALL OK');
else {
  const uniq = [...new Set(problems)];
  console.log(`Problems (${uniq.length} unique):`);
  uniq.slice(0, 40).forEach((p) => console.log(' -', p));
}
