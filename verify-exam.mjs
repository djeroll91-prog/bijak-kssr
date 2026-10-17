/**
 * Pengesah enjin peperiksaan percubaan.
 *
 * Memastikan kertas peperiksaan berkelakuan betul:
 *   - Setiap tahun menghasilkan kertas dengan bilangan soalan yang betul.
 *   - Tiada dua soalan dengan teks yang sama dalam satu kertas.
 *   - Benih berbeza menghasilkan kertas berbeza (soalan bertukar).
 *   - Soalan merangkumi semua subjek yang ada pada tahun itu.
 *   - Markah, gred dan pecahan subjek dikira dengan betul.
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function bundle(entry) {
  const out = join(mkdtempSync(join(tmpdir(), 'exam-')), 'b.mjs');
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: out,
    logLevel: 'error',
  });
  return import(out);
}

const exam = await bundle('src/lib/exam.ts');
const { ALL_TOPICS } = await bundle('src/data/catalog.ts');

const { buildExamPaper, examConfig, scoreExam, examGrade, formatClock, EXAM_TOPIC_ID } = exam;

const fails = [];
const ok = (cond, msg) => {
  if (!cond) fails.push(msg);
};

const years = [1, 2, 3, 4, 5, 6];

/* 1. Bilangan soalan dan topik/subjek liputan */
for (const year of years) {
  const cfg = examConfig(year);
  const paper = buildExamPaper(year, 12345 + year);
  ok(paper.questions.length === cfg.questions, `T${year}: soalan ${paper.questions.length} != ${cfg.questions}`);

  // Tiada pertindihan teks dalam satu kertas.
  const seen = new Map();
  for (const q of paper.questions) {
    const key = q.prompt.toLowerCase().replace(/\s+/g, ' ').trim();
    ok(!seen.has(key), `T${year}: soalan berulang "${q.prompt.slice(0, 40)}"`);
    seen.set(key, true);
  }

  // Semua subjek bagi tahun itu mesti muncul dalam kertas.
  const subjectsInYear = [...new Set(ALL_TOPICS.filter((t) => t.year === year).map((t) => t.subject))];
  for (const s of subjectsInYear) {
    ok(paper.subjects.includes(s), `T${year}: subjek ${s} tiada dalam kertas`);
  }

  // Setiap soalan mesti mempunyai topik yang diketahui.
  for (const q of paper.questions) {
    ok(paper.topicOf.has(q.id), `T${year}: soalan ${q.id} tiada topik`);
  }
}

/* 2. Benih berbeza -> kertas berbeza (soalan bertukar) */
for (const year of years) {
  const a = buildExamPaper(year, 1000 + year);
  const b = buildExamPaper(year, 9999 + year);
  const setA = new Set(a.questions.map((q) => q.prompt));
  const same = b.questions.filter((q) => setA.has(q.prompt)).length;
  const overlap = same / Math.max(1, a.questions.length);
  ok(overlap < 0.5, `T${year}: kertas terlalu serupa antara benih (${Math.round(overlap * 100)}% sama)`);
}

/* 3. Kertas sama benih -> sama (boleh diulang) */
for (const year of years) {
  const a = buildExamPaper(year, 4242);
  const b = buildExamPaper(year, 4242);
  const pa = a.questions.map((q) => q.prompt).join('|');
  const pb = b.questions.map((q) => q.prompt).join('|');
  ok(pa === pb, `T${year}: benih sama menghasilkan kertas berbeza`);
}

/* 4. Markah: semua betul -> 100% gred A lulus; semua salah -> 0% gred E */
for (const year of years) {
  const paper = buildExamPaper(year, 777);
  const allRight = {};
  const allWrong = {};
  for (const q of paper.questions) {
    allRight[q.id] = { ok: true };
    allWrong[q.id] = { ok: false };
  }
  const full = scoreExam(paper, allRight);
  ok(full.pct === 100, `T${year}: semua betul sepatutnya 100%, dapat ${full.pct}`);
  ok(full.grade === 'A', `T${year}: 100% sepatutnya gred A, dapat ${full.grade}`);
  ok(full.passed === true, `T${year}: 100% sepatutnya lulus`);
  ok(full.correct === paper.questions.length, `T${year}: bilangan betul salah`);

  const zero = scoreExam(paper, allWrong);
  ok(zero.pct === 0, `T${year}: semua salah sepatutnya 0%, dapat ${zero.pct}`);
  ok(zero.grade === 'E', `T${year}: 0% sepatutnya gred E, dapat ${zero.grade}`);
  ok(zero.passed === false, `T${year}: 0% tidak sepatutnya lulus`);

  // Jumlah pecahan topik mesti sama dengan jumlah soalan.
  const sumItems = full.items.reduce((s, it) => s + it.total, 0);
  ok(sumItems === paper.questions.length, `T${year}: jumlah pecahan topik ${sumItems} != ${paper.questions.length}`);
  const sumSubjects = full.bySubject.reduce((s, x) => s + x.total, 0);
  ok(sumSubjects === paper.questions.length, `T${year}: jumlah pecahan subjek ${sumSubjects} != ${paper.questions.length}`);
}

/* 5. Gred mengikut ambang */
const gradeCases = [
  [100, 'A'], [85, 'A'], [80, 'A'],
  [79, 'B'], [60, 'B'],
  [59, 'C'], [40, 'C'],
  [39, 'D'], [20, 'D'],
  [19, 'E'], [0, 'E'],
];
for (const [pct, want] of gradeCases) {
  ok(examGrade(pct) === want, `gred ${pct}% sepatutnya ${want}, dapat ${examGrade(pct)}`);
}

/* 6. Format jam */
ok(formatClock(0) === '00:00', `formatClock(0) salah: ${formatClock(0)}`);
ok(formatClock(65) === '01:05', `formatClock(65) salah: ${formatClock(65)}`);
ok(formatClock(3600) === '60:00', `formatClock(3600) salah: ${formatClock(3600)}`);

/* 7. Konfigurasi tahun */
ok(examConfig(1).questions === 20 && examConfig(3).questions === 20, 'T1-T3 sepatutnya 20 soalan');
ok(examConfig(4).questions === 40 && examConfig(6).questions === 40, 'T4-T6 sepatutnya 40 soalan');
ok(examConfig(1).minutes === 30, 'T1-T3 sepatutnya 30 minit');
ok(examConfig(6).minutes === 60, 'T4-T6 sepatutnya 60 minit');

/* 8. ID topik ringkasan tidak bertembung dengan topik sebenar */
ok(!ALL_TOPICS.some((t) => t.id === EXAM_TOPIC_ID), `EXAM_TOPIC_ID "${EXAM_TOPIC_ID}" bertembung dengan topik sebenar`);

if (fails.length === 0) {
  console.log('verify-exam: ALL OK');
  console.log(`  Tahun diuji: ${years.join(', ')}`);
  console.log(`  Kertas: T1-T3 ${examConfig(1).questions} soalan / ${examConfig(1).minutes} minit`);
  console.log(`          T4-T6 ${examConfig(4).questions} soalan / ${examConfig(4).minutes} minit`);
} else {
  console.error(`verify-exam: ${fails.length} GAGAL`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
