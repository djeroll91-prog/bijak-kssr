/**
 * Pengesah "Cara jawab".
 *
 * Dua perkara diuji:
 *   1. KESELAMATAN — setiap langkah yang dipaparkan mesti berakhir dengan
 *      jawapan yang sama seperti jawapan rasmi soalan. Langkah yang salah
 *      lebih buruk daripada tiada langkah.
 *   2. LIPUTAN — berapa peratus soalan pengiraan mendapat langkah.
 *
 * Jalankan: node verify-steps.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = join(mkdtempSync(join(tmpdir(), 'vst-')), 'b.mjs');
await build({
  entryPoints: ['src/data/catalog.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
});
const { ALL_TOPICS, generateQuestions } = await import(out);

const fails = [];

/** Ambil nombor terakhir dalam teks langkah terakhir. */
function lastNumber(text) {
  const nums = text.match(/-?\d[\d,\s\u00a0]*(?:\.\d+)?/g);
  if (!nums) return null;
  const n = Number(nums[nums.length - 1].replace(/[,\s\u00a0]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function norm(s) {
  return String(s).replace(/[,\s\u00a0]/g, '');
}

let total = 0;
let withSteps = 0;
let numericish = 0;
const bySubject = {};
const perTopic = {};

for (const topic of ALL_TOPICS) {
  for (const seed of [3, 17, 91]) {
    const qs = generateQuestions(topic.id, 10, seed);
    for (const q of qs) {
      total += 1;
      const isCalc =
        (q.kind === 'numeric' || q.kind === 'shorttext' || q.kind === 'mcq') &&
        topic.subject !== 'english';
      if (isCalc) numericish += 1;

      if (!q.steps || q.steps.length === 0) continue;
      withSteps += 1;

      const key = `${topic.subject} T${topic.year}`;
      bySubject[key] = bySubject[key] || { steps: 0, total: 0 };
      bySubject[key].steps += 1;

      perTopic[topic.id] = (perTopic[topic.id] || 0) + 1;

      // Semakan keselamatan: langkah terakhir mesti berakhir dengan jawapan.
      const want = typeof q.answer === 'number' ? q.answer : norm(q.answer);
      const got = lastNumber(q.steps[q.steps.length - 1]);
      const okNum = typeof want === 'number' && got !== null && Math.abs(got - want) < 1e-6;
      const okText = typeof want === 'string' && norm(q.steps[q.steps.length - 1]).includes(want);
      if (!okNum && !okText) {
        fails.push({
          topic: topic.id,
          subject: topic.subject,
          prompt: q.prompt,
          answer: q.answer,
          steps: q.steps,
        });
      }
    }
  }
}

console.log(`Soalan diperiksa : ${total}`);
console.log(`Soalan boleh kira: ${numericish}`);
console.log(`Ada "Cara jawab" : ${withSteps} (${((withSteps / numericish) * 100).toFixed(1)}% daripada soalan boleh kira)`);

console.log('\nLiputan mengikut subjek/tahun:');
for (const k of Object.keys(bySubject).sort()) {
  console.log('  ', k, '=', bySubject[k].steps);
}

const topicsWith = Object.keys(perTopic).length;
console.log(`\nTopik yang ada langkah: ${topicsWith} / ${ALL_TOPICS.length}`);

if (fails.length) {
  console.log(`\nFAIL: ${fails.length} langkah tidak sepadan dengan jawapan rasmi:`);
  for (const f of fails.slice(0, 15)) {
    console.log(`\n  [${f.topic}] ${f.prompt}`);
    console.log(`    jawapan rasmi: ${f.answer}`);
    console.log(`    langkah akhir: ${f.steps[f.steps.length - 1]}`);
  }
  process.exit(1);
}
console.log('\nPASS: semua langkah sepadan dengan jawapan rasmi.');
