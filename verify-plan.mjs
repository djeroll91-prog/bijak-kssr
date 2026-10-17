/**
 * Semakan enjin Program Belajar (src/lib/plan.ts).
 * Membina profil tiruan, menjana pelan dan memastikan setiap invarian
 * dipatuhi. Jalankan: node verify-plan.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const out = join(mkdtempSync(join(tmpdir(), 'p-')), 'bundle.mjs');
await build({
  entryPoints: ['src/lib/plan.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
});
const mod = await import(out);
const { buildPlan, planProgress, topicScores, weakTopics, untriedTopics, pickDiagnosticTopics, diagnosticSummary, DIAGNOSTIC_TOPIC_ID, PLAN_DAYS, TASKS_PER_DAY } = mod;

const catalogOut = join(mkdtempSync(join(tmpdir(), 'c-')), 'catalog.mjs');
await build({
  entryPoints: ['src/data/catalog.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: catalogOut,
  logLevel: 'error',
});
const { ALL_TOPICS } = await import(catalogOut);

const problems = [];
const check = (cond, msg) => {
  if (!cond) problems.push(msg);
};

function profileFor(year, attempts = [], diagnostic = null) {
  return {
    id: 'p-test',
    name: 'Ujian',
    avatar: '🦊',
    year,
    createdAt: Date.now(),
    attempts,
    badges: [],
    streakDays: 0,
    lastActiveDate: '2026-01-01',
    stars: 0,
    points: 0,
    seenTopics: [],
    diagnostic,
    plan: null,
  };
}

let attemptSeq = 0;
function attempt(topicId, correct, total) {
  const topic = ALL_TOPICS.find((t) => t.id === topicId);
  if (!topic) throw new Error(`topik tidak wujud: ${topicId}`);
  attemptSeq += 1;
  return {
    id: `a-${attemptSeq}`,
    ts: Date.now() + attemptSeq,
    year: topic.year,
    subject: topic.subject,
    topicId,
    topicTitle: topic.title,
    correct,
    total,
    seconds: 30,
    retries: 0,
  };
}

/* 1. Murid baharu: tiada percubaan → fokus pada topik belum cuba. */
{
  const p = profileFor(3);
  const plan = buildPlan(p, 12345);
  check(plan !== null, 'murid baharu patut dapat pelan');
  check(plan.tasks.length === PLAN_DAYS * TASKS_PER_DAY, `bilangan tugasan salah: ${plan.tasks.length}`);
  for (let d = 0; d < PLAN_DAYS; d += 1) {
    const day = plan.tasks.filter((t) => t.dayIndex === d);
    check(day.length === TASKS_PER_DAY, `hari ${d} ada ${day.length} tugasan`);
  }
  const last = plan.tasks[plan.tasks.length - 1];
  check(last.kind === 'game', `tugasan terakhir patut permainan, dapat ${last.kind}`);
  check(new Set(plan.focusTopicIds).size === plan.focusTopicIds.length, 'topik tumpuan ada pendua');
  for (const t of plan.tasks) {
    const topic = ALL_TOPICS.find((x) => x.id === t.topicId);
    check(Boolean(topic), `topik tugasan tidak wujud: ${t.topicId}`);
    check(topic && topic.year === 3, `topik tugasan bukan tahun 3: ${t.topicId}`);
  }
}

/* 2. Kelemahan diutamakan dan tugasan pemulihan diberi. */
{
  const mt1 = ALL_TOPICS.filter((t) => t.year === 2 && t.subject === 'matematik').slice(0, 2);
  const attempts = [
    attempt(mt1[0].id, 1, 8),
    attempt(mt1[1].id, 2, 8),
  ];
  const p = profileFor(2, attempts);
  const weak = weakTopics(p);
  check(weak.length === 2, `patut ada 2 topik lemah, dapat ${weak.length}`);
  check(weak[0].id === mt1[0].id, 'topik paling lemah patut di hadapan');

  const plan = buildPlan(p, 999);
  check(plan.weakTopicIds.includes(mt1[0].id), 'topik lemah tiada dalam weakTopicIds');
  const remedial = plan.tasks.filter((t) => t.kind === 'remedial');
  check(remedial.length > 0, 'tiada tugasan pemulihan untuk topik lemah');
  check(remedial.every((t) => plan.weakTopicIds.includes(t.topicId)), 'pemulihan untuk topik bukan lemah');
  check(plan.focusTopicIds.slice(0, 2).includes(mt1[0].id), 'topik lemah patut jadi tumpuan pertama');
}

/* 3. Markah baik tidak dianggap lemah. */
{
  const t0 = ALL_TOPICS.filter((t) => t.year === 5 && t.subject === 'sains')[0];
  const p = profileFor(5, [attempt(t0.id, 8, 8)]);
  check(!weakTopics(p).some((x) => x.id === t0.id), 'topik markah penuh tidak patut lemah');
  check(topicScores(p).get(t0.id).avg === 100, 'skor purata markah penuh patut 100');
}

/* 4. Kemajuan pelan dan kesan tanda siap. */
{
  const p = profileFor(4);
  const plan = buildPlan(p, 777);
  const p0 = planProgress(plan);
  check(p0.done === 0 && p0.pct === 0, 'pelan baharu patut 0%');
  check(p0.activeDay === 0, `hari aktif patut 0, dapat ${p0.activeDay}`);
  check(!p0.allDone, 'pelan baharu bukan selesai');

  // Siapkan semua tugasan hari 1 sahaja.
  plan.tasks = plan.tasks.map((t) => (t.dayIndex === 0 ? { ...t, done: true } : t));
  const p1 = planProgress(plan);
  check(p1.done === TASKS_PER_DAY, `hari 1 siap: dapat ${p1.done}`);
  check(p1.activeDay === 1, `hari aktif patut 1, dapat ${p1.activeDay}`);
  check(p1.dayComplete === false, 'hari aktif baharu belum lengkap');

  plan.tasks = plan.tasks.map((t) => ({ ...t, done: true }));
  const p2 = planProgress(plan);
  check(p2.pct === 100 && p2.allDone, 'semua siap patut 100%');
}

/* 5. Diagnosis: liputan subjek dan kesan ke atas skor. */
{
  for (const year of [1, 2, 3, 4, 5, 6]) {
    const topics = pickDiagnosticTopics(year, 4242);
    check(topics.length > 0, `tahun ${year}: diagnosis kosong`);
    check(topics.length <= 6, `tahun ${year}: terlalu banyak topik`);
    check(new Set(topics.map((t) => t.id)).size === topics.length, `tahun ${year}: topik diagnosis berulang`);
    check(topics.every((t) => t.year === year), `tahun ${year}: topik diagnosis dari tahun lain`);
  }
  // Tahun 4 ke atas ada Sejarah, jadi liputan subjek sepatutnya lebih luas.
  const y5 = pickDiagnosticTopics(5, 31);
  check(new Set(y5.map((t) => t.subject)).size >= 3, 'tahun 5 patut meliputi sekurang-kurangnya 3 subjek');

  const y2 = ALL_TOPICS.filter((t) => t.year === 2 && t.subject === 'matematik').slice(0, 2);
  const diag = {
    ts: Date.now(),
    year: 2,
    items: [
      { topicId: y2[0].id, subject: 'matematik', title: y2[0].title, correct: 1, total: 4 },
      { topicId: y2[1].id, subject: 'matematik', title: y2[1].title, correct: 4, total: 4 },
    ],
    correct: 5,
    total: 8,
    seconds: 90,
  };
  const p = profileFor(2, [], diag);
  const scores = topicScores(p);
  check(scores.get(y2[0].id).avg === 25, `skor diagnosis lemah patut 25, dapat ${scores.get(y2[0].id).avg}`);
  check(scores.get(y2[1].id).avg === 100, 'skor diagnosis baik patut 100');
  check(scores.get(y2[0].id).diagnostic === 25, 'skor diagnosis tiada dalam TopicScore');
  check(weakTopics(p).some((t) => t.id === y2[0].id), 'topik diagnosis lemah patut disenaraikan');

  const summary = diagnosticSummary(diag);
  check(summary.pct === 63, `peratus diagnosis patut 63, dapat ${summary.pct}`);
  check(summary.weakItems[0].topicId === y2[0].id, 'item paling lemah patut di hadapan');

  // Percubaan ringkasan diagnosis tidak boleh mengotorkan skor topik.
  const withSummary = profileFor(2, [attempt(y2[0].id, 4, 4)], diag);
  const withSummaryScores = topicScores(withSummary);
  check(
    !withSummaryScores.has(DIAGNOSTIC_TOPIC_ID),
    'ringkasan diagnosis tidak patut jadi topik biasa',
  );
}

/* 6. Topik belum cuba tidak bertindih dengan topik lemah. */
{
  const t0 = ALL_TOPICS.filter((t) => t.year === 6)[0];
  const p = profileFor(6, [attempt(t0.id, 1, 8)]);
  const weak = new Set(weakTopics(p).map((x) => x.id));
  const untried = untriedTopics(p).map((x) => x.id);
  check(!untried.some((id) => weak.has(id)), 'topik belum cuba bertindih dengan topik lemah');
  check(!untried.includes(t0.id), 'topik yang sudah dicuba tidak patut dalam belum cuba');
}

console.log(`Topik katalog: ${ALL_TOPICS.length}`);
if (problems.length === 0) console.log('ALL OK');
else {
  console.log(`Masalah (${problems.length}):`);
  for (const p of problems) console.log(' -', p);
  process.exitCode = 1;
}
