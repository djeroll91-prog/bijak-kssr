/**
 * Pengesah enjin peperiksaan percubaan (kertas dua bahagian).
 *
 * Memastikan setiap subjek dan setiap tahun menghasilkan kertas yang sah:
 *   - Bilangan soalan tepat mengikut konfigurasi tahun.
 *   - Bahagian A = pilihan jawapan (4 pilihan), Bahagian B = jawapan taip.
 *   - Tiada soalan berulang, setiap soalan ada topik, penerangan, petunjuk.
 *   - Satu kertas = satu subjek; semua soalan daripada subjek yang dipilih.
 *   - Markah mengikut jawapan rasmi, termasuk jawapan taip.
 *   - Benih sama boleh diulang, benih berbeza menghasilkan kertas berbeza.
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
const { ALL_TOPICS, subjectsForYear } = await bundle('src/data/catalog.ts');
const { typedCorrect } = await bundle('src/lib/generators/written.ts');

const { buildExamPaper, examConfig, scoreExam, examGrade, formatClock, EXAM_TOPIC_ID } = exam;

const fails = [];
const ok = (cond, msg) => {
  if (!cond) fails.push(msg);
};

const years = [1, 2, 3, 4, 5, 6];
const seeds = [1, 42, 999, 123456];

/* 1. Setiap subjek setiap tahun menghasilkan kertas yang lengkap */
for (const year of years) {
  const cfg = examConfig(year);
  for (const subject of subjectsForYear(year)) {
    for (const seed of seeds) {
      const paper = buildExamPaper(year, subject, seed);
      const tag = `T${year}/${subject}/${seed}`;

      ok(paper.questions.length === cfg.questions,
        `${tag}: soalan ${paper.questions.length} != ${cfg.questions}`);

      // Satu kertas = satu subjek.
      for (const q of paper.questions) {
        const t = paper.topicOf.get(q.id);
        ok(Boolean(t), `${tag}: soalan ${q.id} tiada topik`);
        ok(t?.subject === subject, `${tag}: soalan ${q.id} subjek ${t?.subject}`);
        ok(t?.year === year, `${tag}: soalan ${q.id} tahun ${t?.year}`);
      }

      // Bahagian A/B tepat.
      const partA = paper.questions.filter((q) => q.part === 'A');
      const partB = paper.questions.filter((q) => q.part === 'B');
      ok(partA.length === cfg.partA, `${tag}: Bahagian A ${partA.length} != ${cfg.partA}`);
      ok(partB.length === cfg.partB, `${tag}: Bahagian B ${partB.length} != ${cfg.partB}`);
      for (const q of partA) {
        ok((q.options?.length ?? 0) === 4, `${tag}: ${q.id} Bahagian A perlu 4 pilihan`);
      }
      for (const q of partB) {
        ok(q.kind === 'shorttext', `${tag}: ${q.id} Bahagian B jenis ${q.kind}`);
        ok(String(q.answer).trim().length > 0, `${tag}: ${q.id} jawapan kosong`);
      }

      // Tiada pertindihan teks atau id.
      const prompts = paper.questions.map((q) => q.prompt.toLowerCase().replace(/\s+/g, ' ').trim());
      ok(new Set(prompts).size === prompts.length, `${tag}: ada soalan berulang`);
      const ids = paper.questions.map((q) => q.id);
      ok(new Set(ids).size === ids.length, `${tag}: ada id berulang`);

      // Setiap soalan ada penerangan dan petunjuk.
      for (const q of paper.questions) {
        ok(Boolean(q.explanation?.trim()), `${tag}: ${q.id} tiada penerangan`);
        ok(Boolean(q.hint?.trim()), `${tag}: ${q.id} tiada petunjuk`);
      }

      // Semua betul -> 100%; kosong -> 0%.
      const allRight = {};
      for (const q of paper.questions) allRight[q.id] = { ok: true, given: String(q.answer) };
      const full = scoreExam(paper, allRight);
      ok(full.pct === 100, `${tag}: semua betul sepatutnya 100%, dapat ${full.pct}`);
      ok(full.grade === 'A', `${tag}: 100% sepatutnya gred A, dapat ${full.grade}`);
      ok(full.passed === true, `${tag}: 100% sepatutnya lulus`);
      ok(full.correct === cfg.questions, `${tag}: bilangan betul ${full.correct} != ${cfg.questions}`);
      ok(full.items.reduce((s, it) => s + it.total, 0) === cfg.questions,
        `${tag}: jumlah pecahan topik salah`);
      ok(full.bySubject.reduce((s, x) => s + x.total, 0) === cfg.questions,
        `${tag}: jumlah pecahan subjek salah`);

      const zero = scoreExam(paper, {});
      ok(zero.pct === 0, `${tag}: kosong sepatutnya 0%, dapat ${zero.pct}`);
      ok(zero.passed === false, `${tag}: kosong tidak sepatutnya lulus`);

      // Jawapan rasmi soalan taip mesti diterima; jawapan sampah ditolak.
      for (const q of partB) {
        ok(typedCorrect(q, String(q.answer)), `${tag}: ${q.id} jawapan rasmi ditolak`);
        ok(!typedCorrect(q, ''), `${tag}: ${q.id} jawapan kosong diterima`);
        ok(!typedCorrect(q, 'zzzz-salah'), `${tag}: ${q.id} jawapan sampah diterima`);
      }
    }
  }
}

/* 2. Benih berbeza -> kertas berbeza; benih sama -> sama (boleh diulang) */
for (const year of years) {
  for (const subject of subjectsForYear(year)) {
    const a = buildExamPaper(year, subject, 1);
    const b = buildExamPaper(year, subject, 2);
    const setA = new Set(a.questions.map((q) => q.prompt));
    const same = b.questions.filter((q) => setA.has(q.prompt)).length;
    const overlap = same / Math.max(1, a.questions.length);
    ok(overlap < 0.5, `T${year}/${subject}: kertas terlalu serupa (${Math.round(overlap * 100)}% sama)`);

    const c = buildExamPaper(year, subject, 4242);
    const d = buildExamPaper(year, subject, 4242);
    ok(
      c.questions.map((q) => q.prompt).join('|') === d.questions.map((q) => q.prompt).join('|'),
      `T${year}/${subject}: benih sama menghasilkan kertas berbeza`,
    );
  }
}

/* 2b. Elak soalan percubaan lepas: percubaan baharu mesti berbeza */
for (const year of years) {
  for (const subject of subjectsForYear(year)) {
    const first = buildExamPaper(year, subject, 1);
    const prev = first.questions.map((q) => q.prompt);
    const second = buildExamPaper(year, subject, 2, prev);
    const prevSet = new Set(prev);
    const repeat = second.questions.filter((q) => prevSet.has(q.prompt)).length;
    const tag = `T${year}/${subject}`;

    ok(second.questions.length === first.questions.length,
      `${tag}: kertas kedua tidak lengkap (${second.questions.length})`);
    // Bank soalan kecil memaksa sedikit pertindihan; selebihnya mesti baharu.
    ok(repeat <= Math.floor(second.questions.length / 3),
      `${tag}: terlalu banyak ulangan selepas elak (${repeat}/${second.questions.length})`);
    ok(new Set(second.questions.map((q) => q.id)).size === second.questions.length,
      `${tag}: id bertindih pada kertas elak`);
    for (const q of second.questions) {
      ok(Boolean(second.topicOf.get(q.id)), `${tag}: soalan elak ${q.id} tiada topik`);
    }
  }
}

/* 3. Subjek Bahasa Inggeris tidak boleh terlepas label Bahasa Melayu */
for (const year of years) {
  if (!subjectsForYear(year).includes('english')) continue;
  const paper = buildExamPaper(year, 'english', 7);
  for (const q of paper.questions) {
    const opts = q.options ?? [];
    ok(!opts.includes('Betul') && !opts.includes('Salah'),
      `T${year}/english: label BM terlepas pada ${q.id}`);
    ok(!/Betul|Salah/.test(String(q.answer)), `T${year}/english: jawapan BM pada ${q.id}`);
  }
}

/* 4. Gred mengikut ambang */
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

/* 5. Format jam */
ok(formatClock(0) === '00:00', `formatClock(0) salah: ${formatClock(0)}`);
ok(formatClock(65) === '01:05', `formatClock(65) salah: ${formatClock(65)}`);
ok(formatClock(3600) === '60:00', `formatClock(3600) salah: ${formatClock(3600)}`);

/* 6. Konfigurasi tahun */
ok(examConfig(1).questions === 18 && examConfig(3).questions === 18, 'T1-T3 sepatutnya 18 soalan');
ok(examConfig(4).questions === 30 && examConfig(6).questions === 30, 'T4-T6 sepatutnya 30 soalan');
ok(examConfig(1).minutes === 35, 'T1-T3 sepatutnya 35 minit');
ok(examConfig(6).minutes === 60, 'T4-T6 sepatutnya 60 minit');
ok(examConfig(1).partA === 12 && examConfig(1).partB === 6, 'T1-T3 pecahan bahagian salah');
ok(examConfig(4).partA === 20 && examConfig(4).partB === 10, 'T4-T6 pecahan bahagian salah');

/* 7. ID topik ringkasan tidak bertembung dengan topik sebenar */
ok(!ALL_TOPICS.some((t) => t.id === EXAM_TOPIC_ID),
  `EXAM_TOPIC_ID "${EXAM_TOPIC_ID}" bertembung dengan topik sebenar`);

if (fails.length === 0) {
  console.log('verify-exam: ALL OK');
  console.log(`  Tahun diuji: ${years.join(', ')}`);
  console.log(`  Kertas: T1-T3 ${examConfig(1).questions} soalan (A ${examConfig(1).partA} + B ${examConfig(1).partB}) / ${examConfig(1).minutes} minit`);
  console.log(`          T4-T6 ${examConfig(4).questions} soalan (A ${examConfig(4).partA} + B ${examConfig(4).partB}) / ${examConfig(4).minutes} minit`);
} else {
  console.error(`verify-exam: ${fails.length} GAGAL`);
  for (const f of fails.slice(0, 40)) console.error(`  - ${f}`);
  process.exit(1);
}
