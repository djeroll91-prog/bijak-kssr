/**
 * Ujian logik trend (src/lib/trend.ts).
 *
 * Semakan utama: penapisan mengikut subjek dan topik mesti benar-benar
 * mengasingkan percubaan, dan arah trend mesti mengesan peningkatan.
 *
 * Jalankan: node verify-trend.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = join(mkdtempSync(join(tmpdir(), 'trend-')), 'trend.mjs');
await build({
  entryPoints: ['src/lib/trend.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
});
const { trendPoints, trendDelta, subjectsWithData, topicsWithData } = await import(out);

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

const at = (subject, topicId, correct, total, ts = 0) => ({
  id: `a${ts}`, ts, year: 1, subject, topicId, topicTitle: topicId,
  correct, total, seconds: 60, retries: 0,
});

/* --- Penapisan skop --- */
{
  const attempts = [
    at('matematik', 'mt1-nombor', 2, 10, 1),
    at('matematik', 'mt1-nombor', 5, 10, 2),
    at('matematik', 'mt1-tambah', 9, 10, 3),
    at('sains', 'sn1-deria', 4, 10, 4),
  ];

  const all = trendPoints(attempts);
  check('Semua: 4 titik', all.length === 4, `${all.length}`);
  check('Semua: nilai betul', all.map((p) => p.value).join(',') === '20,50,90,40', all.map((p) => p.value).join(','));

  const mt = trendPoints(attempts, { subject: 'matematik' });
  check('Subjek matematik: 3 titik', mt.length === 3, `${mt.length}`);

  const oneTopic = trendPoints(attempts, { topicId: 'mt1-nombor' });
  check('Topik mt1-nombor: 2 titik', oneTopic.length === 2, `${oneTopic.length}`);
  check('Topik mt1-nombor: hanya nilainya', oneTopic.map((p) => p.value).join(',') === '20,50', oneTopic.map((p) => p.value).join(','));

  const both = trendPoints(attempts, { subject: 'matematik', topicId: 'mt1-nombor' });
  check('Subjek+topik: 2 titik', both.length === 2, `${both.length}`);

  // Skop yang tidak sepadan mesti kosong, bukan memulangkan semua.
  const none = trendPoints(attempts, { subject: 'sejarah' });
  check('Skop tiada data: kosong', none.length === 0, `${none.length}`);
}

/* --- Percubaan tanpa jumlah soalan dilangkau --- */
{
  const attempts = [at('sains', 'sn1-deria', 0, 0, 1), at('sains', 'sn1-deria', 5, 10, 2)];
  const pts = trendPoints(attempts);
  check('total=0 dilangkau', pts.length === 1, `${pts.length}`);
}

/* --- Had bilangan titik --- */
{
  const attempts = Array.from({ length: 40 }, (_, i) => at('sains', 'sn1-deria', i % 11, 10, i));
  const pts = trendPoints(attempts, {}, 12);
  check('Had 12 titik dihormati', pts.length === 12, `${pts.length}`);
  check('Label 1..12', pts.map((p) => p.label).join(',') === '1,2,3,4,5,6,7,8,9,10,11,12');
}

/* --- Arah trend --- */
{
  const up = [30, 40, 50, 60, 70, 80].map((v) => ({ label: 'x', value: v }));
  check('Meningkat: delta positif', trendDelta(up) > 0, `${trendDelta(up)}`);

  const down = [80, 70, 60, 50, 40, 30].map((v) => ({ label: 'x', value: v }));
  check('Menurun: delta negatif', trendDelta(down) < 0, `${trendDelta(down)}`);

  const flat = [50, 50, 50, 50, 50, 50].map((v) => ({ label: 'x', value: v }));
  check('Datar: delta sifar', trendDelta(flat) === 0, `${trendDelta(flat)}`);

  // Terlalu sedikit titik: jangan meneka arah.
  const few = [10, 90].map((v) => ({ label: 'x', value: v }));
  check('Titik sedikit: delta sifar', trendDelta(few) === 0, `${trendDelta(few)}`);
  check('Kosong: delta sifar', trendDelta([]) === 0);
}

/* --- Senarai skop --- */
{
  const attempts = [
    at('matematik', 'mt1-nombor', 1, 2, 1),
    at('sains', 'sn1-deria', 1, 2, 2),
    at('matematik', 'mt1-tambah', 1, 2, 3),
    at('matematik', 'mt1-nombor', 1, 2, 4),
  ];
  check('Subjek unik', subjectsWithData(attempts).join(',') === 'matematik,sains', subjectsWithData(attempts).join(','));
  check('Topik unik (semua)', topicsWithData(attempts).join(',') === 'mt1-nombor,sn1-deria,mt1-tambah', topicsWithData(attempts).join(','));
  check('Topik unik (matematik)', topicsWithData(attempts, 'matematik').join(',') === 'mt1-nombor,mt1-tambah', topicsWithData(attempts, 'matematik').join(','));
}

let failed = 0;
console.log('\n=== UJIAN LOGIK TREND ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
process.exit(failed === 0 ? 0 : 1);
