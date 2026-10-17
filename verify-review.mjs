/**
 * Semakan enjin ulangan berjarak (src/lib/review.ts).
 * Menguji jadual Leitner, penjadualan semula selepas gagal, bank kesilapan
 * dan backfill daripada rekod latihan lama. Jalankan: node verify-review.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

async function load(entry) {
  const out = join(mkdtempSync(join(tmpdir(), 'vr-')), 'bundle.mjs');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
  return import(out);
}

const r = await load('src/lib/review.ts');
const d = await load('src/lib/dates.ts');

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

const TODAY = '2026-01-10';
const outcome = (topicId, correct, total = 10) => ({
  topicId, subject: 'matematik', year: 1, correct, total,
});

// 1. Kad baharu: lulus mula kotak 0, ulang esok.
{
  const c = r.nextCard(undefined, outcome('t1', 10), TODAY);
  check('Kad baharu lulus: kotak 0', c.box === 0, `box=${c.box}`);
  check('Kad baharu lulus: due esok', c.dueDate === d.addDays(TODAY, 1), c.dueDate);
  check('Kad baharu lulus: streak 1', c.streak === 1, `streak=${c.streak}`);
}

// 2. Kad baharu gagal: kotak 0, tiada streak, lapses 1.
{
  const c = r.nextCard(undefined, outcome('t1', 2), TODAY);
  check('Kad baharu gagal: kotak 0', c.box === 0, `box=${c.box}`);
  check('Kad baharu gagal: streak 0', c.streak === 0, `streak=${c.streak}`);
  check('Kad baharu gagal: lapses 1', c.lapses === 1, `lapses=${c.lapses}`);
}

// 3. Markah lulus naik satu kotak; jarak ikut jadual.
{
  let c = r.nextCard(undefined, outcome('t1', 10), TODAY);
  c = r.nextCard(c, outcome('t1', 8), TODAY);
  check('Lulus 80%: kotak 1', c.box === 1, `box=${c.box}`);
  check('Kotak 1: due +3 hari', c.dueDate === d.addDays(TODAY, 3), c.dueDate);
  c = r.nextCard(c, outcome('t1', 8), TODAY);
  check('Lulus lagi: kotak 2', c.box === 2, `box=${c.box}`);
  check('Kotak 2: due +7 hari', c.dueDate === d.addDays(TODAY, 7), c.dueDate);
}

// 4. Markah penuh melompat dua kotak.
{
  let c = r.nextCard(undefined, outcome('t1', 10), TODAY);
  c = r.nextCard(c, outcome('t1', 10), TODAY);
  check('Markah penuh: kotak 2 (lompat 2)', c.box === 2, `box=${c.box}`);
}

// 5. Gagal selepas tinggi: jatuh ke kotak 0 dan dijadualkan cepat semula.
{
  let c = r.nextCard(undefined, outcome('t1', 10), TODAY);
  c = r.nextCard(c, outcome('t1', 10), TODAY);
  c = r.nextCard(c, outcome('t1', 10), TODAY);
  const high = c.box;
  c = r.nextCard(c, outcome('t1', 3), TODAY);
  check('Gagal selepas kotak tinggi: kembali ke 0', c.box === 0, `dari ${high} -> ${c.box}`);
  check('Gagal: due esok (ulang cepat)', c.dueDate === d.addDays(TODAY, 1), c.dueDate);
  check('Gagal: lapses bertambah', c.lapses === 1, `lapses=${c.lapses}`);
  check('Gagal: streak direset', c.streak === 0, `streak=${c.streak}`);
}

// 6. Kotak tidak melebihi had.
{
  let c = r.nextCard(undefined, outcome('t1', 10), TODAY);
  for (let i = 0; i < 10; i += 1) c = r.nextCard(c, outcome('t1', 10), TODAY);
  check('Kotak berhenti pada MAX_BOX', c.box === r.MAX_BOX, `box=${c.box}`);
  check('Jarak kotak tertinggi = 35 hari', r.intervalFor(c.box) === 35, `${r.intervalFor(c.box)}`);
}

// 7. Ambang lulus tepat pada 70%.
{
  const c70 = r.nextCard(undefined, outcome('t1', 7), TODAY);
  check('70% dikira lulus', c70.streak === 1, `streak=${c70.streak}`);
  const c69 = r.nextCard(undefined, outcome('t1', 6.9), TODAY);
  check('69% dikira gagal', c69.streak === 0, `streak=${c69.streak}`);
}

// 8. applyOutcomes tidak menggandakan kad untuk topik sama.
{
  let cards = r.applyOutcomes([], [outcome('t1', 10), outcome('t2', 5)], TODAY);
  cards = r.applyOutcomes(cards, [outcome('t1', 9)], TODAY);
  check('applyOutcomes: topik sama tidak berganda', cards.length === 2, `kad=${cards.length}`);
}

// 9. dueCards hanya kad yang tiba masa, tertunggak dahulu.
{
  let cards = r.applyOutcomes([], [outcome('a', 10), outcome('b', 10)], TODAY);
  cards = cards.map((c, i) => ({ ...c, dueDate: d.addDays(TODAY, i === 0 ? 0 : 5) }));
  const due = r.dueCards(cards, TODAY);
  check('dueCards: hanya yang tiba masa', due.length === 1 && due[0].topicId === 'a', due.map((c) => c.topicId).join(','));
  const later = r.dueCards(cards, d.addDays(TODAY, 5));
  check('dueCards: muncul apabila tiba masa', later.length === 2, `${later.length}`);
}

// 10. Bank kesilapan: hanya topik yang pernah gagal, paling banyak gagal dahulu.
{
  let cards = r.applyOutcomes([], [outcome('baik', 10), outcome('teruk', 2), outcome('sederhana', 3)], TODAY);
  cards = r.applyOutcomes(cards, [outcome('teruk', 1)], TODAY);
  cards = r.applyOutcomes(cards, [outcome('sederhana', 10)], TODAY);
  const mistakes = r.mistakeCards(cards);
  check('Bank kesilapan: hanya yang pernah gagal', mistakes.every((c) => c.lapses > 0), mistakes.map((c) => c.topicId).join(','));
  check('Bank kesilapan: paling banyak gagal dahulu', mistakes[0]?.topicId === 'teruk', mistakes[0]?.topicId);
  check('Bank kesilapan: topik pulih masih tersenarai', mistakes.some((c) => c.topicId === 'sederhana'));
}

// 11. Ringkasan ulangan.
{
  let cards = r.applyOutcomes([], [outcome('a', 10)], TODAY);
  for (let i = 0; i < 6; i += 1) cards = r.applyOutcomes(cards, [outcome('a', 10)], TODAY);
  const s = r.reviewSummary(cards, TODAY);
  check('Ringkasan: kad dikuasai dikira', s.mastered === 1, `mastered=${s.mastered}`);
  check('Ringkasan: jumlah betul', s.total === 1, `total=${s.total}`);
}

// 12. Backfill daripada rekod latihan lama.
{
  const profile = {
    id: 'p1', name: 'Ujian', avatar: '🦊', year: 1, createdAt: 0,
    badges: [], streakDays: 0, lastActiveDate: TODAY, stars: 0, points: 0, seenTopics: [],
    attempts: [
      { id: 'a1', ts: 1000, year: 1, subject: 'matematik', topicId: 'mt1-nombor', topicTitle: 'Nombor', correct: 8, total: 10, seconds: 60, retries: 0 },
      { id: 'a2', ts: 2000, year: 1, subject: 'matematik', topicId: 'mt1-nombor', topicTitle: 'Nombor', correct: 10, total: 10, seconds: 60, retries: 0 },
      { id: 'a3', ts: 3000, year: 1, subject: 'sains', topicId: 'sn1-magnet', topicTitle: 'Magnet', correct: 2, total: 10, seconds: 60, retries: 0 },
    ],
  };
  const cards = r.backfillReviews(profile, TODAY);
  check('Backfill: kad dibina daripada sejarah', cards.length === 2, `kad=${cards.length}`);
  const nombor = cards.find((c) => c.topicId === 'mt1-nombor');
  check('Backfill: topik lulus naik kotak', (nombor?.box ?? -1) > 0, `box=${nombor?.box}`);
  const magnet = cards.find((c) => c.topicId === 'sn1-magnet');
  check('Backfill: topik gagal ada lapses', (magnet?.lapses ?? 0) > 0, `lapses=${magnet?.lapses}`);
  const dueNow = r.dueCards(cards, TODAY).length;
  check('Backfill: tidak menyerbu hari pertama', dueNow <= r.DAILY_REVIEW_LIMIT, `due=${dueNow}`);
}

// 13. Data rosak tidak menjatuhkan enjin.
{
  check('nextCard: total 0 tidak pecah', r.nextCard(undefined, outcome('x', 0, 0), TODAY).box === 0);
  check('dueCards: senarai kosong selamat', r.dueCards([], TODAY).length === 0);
  check('reviewTopicIds: had dihormati', r.reviewTopicIds([], 6, TODAY).length === 0);
}

let failed = 0;
console.log('\n=== SEMAKAN ULANGAN BERJARAK ===\n');
for (const x of report) {
  console.log(`${x.ok ? '  LULUS' : '  GAGAL'}  ${x.name}${x.detail ? `  [${x.detail}]` : ''}`);
  if (!x.ok) failed += 1;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
console.log(failed === 0 ? 'ALL OK' : 'GAGAL');
process.exit(failed === 0 ? 0 : 1);
