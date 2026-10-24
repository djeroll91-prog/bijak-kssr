/**
 * Pengesah pematuhan DSKP (KSSR Semakan 2017).
 *
 * Memastikan kod standard kandungan yang dipaparkan kepada murid benar-benar
 * mengikut dokumen DSKP rasmi:
 *   - Tiada kod bertindih dalam subjek + tahun yang sama.
 *   - Setiap tahun Sains bermula 1.0 Kemahiran Saintifik dan 2.0 Peraturan Bilik Sains.
 *   - Setiap tahun Bahasa Melayu meliputi standard 1.0 hingga 5.0.
 *   - Sejarah menggunakan penomboran Tajuk berterusan (T4 1-5, T5 6-9, T6 10-12).
 *   - Label kod memaparkan "Tajuk" untuk Sejarah dan "DSKP" untuk subjek lain.
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = join(mkdtempSync(join(tmpdir(), 'dskp-')), 'b.mjs');
await build({
  entryPoints: ['src/data/catalog.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
});
const { ALL_TOPICS } = await import(out);

const labelOut = join(mkdtempSync(join(tmpdir(), 'lbl-')), 'b.mjs');
await build({
  entryPoints: ['src/lib/i18n.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: labelOut,
  logLevel: 'error',
});
const { topicCodeLabel } = await import(labelOut);

const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? '  LULUS' : '  GAGAL'}  ${name}${detail ? `  [${detail}]` : ''}`);
  if (!cond) fails.push(name);
};
const major = (code) => Number(String(code).split('.')[0]);

console.log('\n=== PENGESAHAN DSKP ===\n');

// 1. Tiada kod bertindih.
{
  const seen = new Map();
  for (const t of ALL_TOPICS) {
    const k = `${t.subject}|${t.year}|${t.code}`;
    seen.set(k, [...(seen.get(k) ?? []), t.id]);
  }
  const dup = [...seen.entries()].filter(([, v]) => v.length > 1);
  ok('Tiada kod bertindih dalam subjek + tahun', dup.length === 0, dup.map(([k]) => k).join(', '));
}

// 2. Sains: setiap tahun bermula 1.0 dan 2.0.
for (let y = 1; y <= 6; y += 1) {
  const ts = ALL_TOPICS.filter((t) => t.subject === 'sains' && t.year === y);
  const majors = new Set(ts.map((t) => major(t.code)));
  ok(`Sains T${y}: ada 1.0 Kemahiran Saintifik`, majors.has(1), [...majors].sort().join(','));
  ok(`Sains T${y}: ada 2.0 Peraturan Bilik Sains`, majors.has(2), [...majors].sort().join(','));
  const nombor = ts.map((t) => major(t.code)).sort((a, b) => a - b);
  const jujukan = nombor.every((n, i) => n === i + 1);
  ok(`Sains T${y}: penomboran 1..n tanpa jurang`, jujukan, nombor.join(','));
}

// 3. Bahasa Melayu: standard 1.0 hingga 5.0 hadir setiap tahun.
for (let y = 1; y <= 6; y += 1) {
  const ts = ALL_TOPICS.filter((t) => t.subject === 'bahasa-melayu' && t.year === y);
  const majors = new Set(ts.map((t) => major(t.code)));
  const hilang = [1, 2, 3, 4, 5].filter((n) => !majors.has(n));
  ok(`BM T${y}: standard 1.0-5.0 lengkap`, hilang.length === 0, `hilang ${hilang.join(',') || '-'}`);
  const luar = [...majors].filter((n) => n < 1 || n > 5);
  ok(`BM T${y}: tiada kod di luar 1.0-5.0`, luar.length === 0, luar.join(','));
}

// 4. Sejarah: penomboran Tajuk berterusan.
{
  const t4 = ALL_TOPICS.filter((t) => t.subject === 'sejarah' && t.year === 4).map((t) => major(t.code));
  const t5 = ALL_TOPICS.filter((t) => t.subject === 'sejarah' && t.year === 5).map((t) => major(t.code));
  const t6 = ALL_TOPICS.filter((t) => t.subject === 'sejarah' && t.year === 6).map((t) => major(t.code));
  ok('Sejarah T4: Tajuk 1-5', t4.every((n) => n >= 1 && n <= 5), t4.join(','));
  ok('Sejarah T5: Tajuk 6-9', t5.every((n) => n >= 6 && n <= 9), t5.join(','));
  ok('Sejarah T6: Tajuk 10-12', t6.every((n) => n >= 10 && n <= 12), t6.join(','));
  const sebelumT4 = ALL_TOPICS.filter((t) => t.subject === 'sejarah' && t.year < 4);
  ok('Sejarah hanya Tahun 4 ke atas', sebelumT4.length === 0, sebelumT4.map((t) => t.id).join(','));
}

// 5. Label kod mengikut subjek.
ok('Label Sejarah guna "Tajuk"', topicCodeLabel('ms', 'sejarah', '6.1') === 'Tajuk 6.1');
ok('Label Sejarah (EN) guna "Topic"', topicCodeLabel('en', 'sejarah', '6.1') === 'Topic 6.1');
ok('Label Sains guna "DSKP"', topicCodeLabel('ms', 'sains', '1.0') === 'DSKP 1.0');
ok('Label Matematik guna "DSKP"', topicCodeLabel('ms', 'matematik', '2.0') === 'DSKP 2.0');

// 6. Setiap topik ada penjana dan sekurang-kurangnya tiga nota.
{
  const nota = ALL_TOPICS.filter((t) => t.notes.length < 3);
  ok('Setiap topik ada >= 3 nota', nota.length === 0, nota.map((t) => t.id).join(','));
  const tanpa = ALL_TOPICS.filter((t) => !t.games || t.games.length === 0);
  ok('Setiap topik ada permainan', tanpa.length === 0, tanpa.map((t) => t.id).join(','));
}

// 7. Surah hafazan: id wujud, ayat cukup, dan tahun sepadan dengan topik.
{
  const surahOut = join(mkdtempSync(join(tmpdir(), 'srh-')), 'b.mjs');
  await build({
    entryPoints: ['src/data/surah.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: surahOut,
    logLevel: 'error',
  });
  const { SURAHS, surahById } = await import(surahOut);

  const ids = new Set(SURAHS.map((s) => s.id));
  ok('Setiap id surah unik', ids.size === SURAHS.length, `${ids.size}/${SURAHS.length}`);
  ok(
    'Setiap surah ada ayat yang lengkap',
    SURAHS.every((s) => s.ayahs.length === s.count && s.count > 0),
    SURAHS.filter((s) => s.ayahs.length !== s.count).map((s) => s.id).join(','),
  );
  ok(
    'Nombor ayat berterusan 1..n',
    SURAHS.every((s) => s.ayahs.every((a, i) => a.n === i + 1)),
    SURAHS.filter((s) => !s.ayahs.every((a, i) => a.n === i + 1)).map((s) => s.id).join(','),
  );
  ok(
    'Setiap ayat ada teks Arab, Rumi dan maksud',
    SURAHS.every((s) =>
      s.ayahs.every((a) => a.ar.trim() && a.rumi.trim() && a.ms.trim() && a.en.trim()),
    ),
    SURAHS.filter((s) => s.ayahs.some((a) => !a.ar.trim() || !a.rumi.trim() || !a.ms.trim() || !a.en.trim()))
      .map((s) => s.id)
      .join(','),
  );
  ok(
    'Teks Arab mengandungi huruf Arab',
    SURAHS.every((s) => s.ayahs.every((a) => /[\u0600-\u06ff]/.test(a.ar))),
    SURAHS.filter((s) => s.ayahs.some((a) => !/[\u0600-\u06ff]/.test(a.ar))).map((s) => s.id).join(','),
  );
  // Bismillah hanya kekal sebagai ayat pertama al-Fatihah. Jika ia terlekat
  // pada surah lain, soalan hafazan memaparkan ayat yang salah.
  ok(
    'Bismillah hanya pada al-Fatihah',
    SURAHS.every((s) => s.id === 'al-fatihah' || s.ayahs.every((a) => !a.ar.includes('بِسْمِ ٱللَّهِ'))),
    SURAHS.filter((s) => s.id !== 'al-fatihah' && s.ayahs.some((a) => a.ar.includes('بِسْمِ ٱللَّهِ')))
      .map((s) => s.id)
      .join(','),
  );

  // Setiap topik al-Quran yang merujuk surah mesti sepadan tahunnya.
  const pautan = ALL_TOPICS.filter((t) => t.surahs && t.surahs.length > 0);
  ok('Ada topik hafazan yang dipautkan', pautan.length > 0, `${pautan.length} topik`);
  for (const t of pautan) {
    const hilang = t.surahs.filter((id) => !surahById(id));
    ok(`Topik ${t.id}: semua id surah wujud`, hilang.length === 0, hilang.join(','));
    const silapTahun = t.surahs
      .map((id) => surahById(id))
      .filter((s) => s && s.year !== t.year)
      .map((s) => `${s.id}(${s.year})`);
    ok(`Topik ${t.id}: surah sepadan Tahun ${t.year}`, silapTahun.length === 0, silapTahun.join(','));
  }

  // Setiap tahun 1-6 mesti ada sekurang-kurangnya satu surah hafazan.
  for (let y = 1; y <= 6; y += 1) {
    const senarai = SURAHS.filter((s) => s.year === y);
    ok(`Tahun ${y}: ada surah hafazan`, senarai.length > 0, senarai.map((s) => s.name).join(', '));
  }
}

console.log(`\n${fails.length === 0 ? 'ALL OK' : `GAGAL: ${fails.length}`}\n`);
process.exit(fails.length === 0 ? 0 : 1);
