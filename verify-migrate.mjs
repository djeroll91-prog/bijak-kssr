/**
 * Semakan migrasi data (src/lib/storage.ts).
 *
 * Menguji data skema lama (v1, tanpa kad ulangan) dinaik taraf tanpa
 * kehilangan rekod latihan, dan kad ulangan dibina semula daripada sejarah.
 * Jalankan: node verify-migrate.mjs
 */

import { build } from 'esbuild';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Stub localStorage supaya modul storan boleh diuji dalam Node.
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  clear: () => mem.clear(),
};

async function load(entry) {
  const out = join(mkdtempSync(join(tmpdir(), 'vm-')), 'bundle.mjs');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
  return import(out);
}

const s = await load('src/lib/storage.ts');

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

const KEY = 'bijak-kssr/v1';

/** Data skema lama: tiada medan `reviews` langsung. */
function oldData() {
  return {
    version: 1,
    activeProfileId: 'p-lama',
    lang: 'ms',
    celebratedBadges: ['first-steps'],
    settings: { sound: true, voice: false, motion: true, calm: false, contrast: false, dark: false, fontScale: 1 },
    profiles: [
      {
        id: 'p-lama',
        name: 'Aiman',
        avatar: '🦊',
        year: 2,
        createdAt: 1700000000000,
        badges: ['first-steps'],
        streakDays: 4,
        lastActiveDate: '2026-01-05',
        stars: 42,
        points: 120,
        seenTopics: ['mt2-tambah'],
        diagnostic: null,
        plan: null,
        attempts: [
          { id: 'a1', ts: 1700000001000, year: 2, subject: 'matematik', topicId: 'mt2-tambah', topicTitle: 'Tambah', correct: 7, total: 8, seconds: 90, retries: 0 },
          { id: 'a2', ts: 1700000002000, year: 2, subject: 'matematik', topicId: 'mt2-tambah', topicTitle: 'Tambah', correct: 8, total: 8, seconds: 70, retries: 0 },
          { id: 'a3', ts: 1700000003000, year: 2, subject: 'sains', topicId: 'sn2-tumbuhan', topicTitle: 'Tumbuhan', correct: 3, total: 8, seconds: 110, retries: 0 },
        ],
      },
    ],
  };
}

// 1. Migrasi asas: rekod lama kekal.
{
  const d = s.migrate(oldData());
  check('Migrasi: profil kekal', d.profiles.length === 1, `${d.profiles.length}`);
  const p = d.profiles[0];
  check('Migrasi: nama kekal', p.name === 'Aiman', p.name);
  check('Migrasi: tahun kekal', p.year === 2, `${p.year}`);
  check('Migrasi: semua percubaan kekal', p.attempts.length === 3, `${p.attempts.length}`);
  check('Migrasi: bintang kekal', p.stars === 42, `${p.stars}`);
  check('Migrasi: mata kekal', p.points === 120, `${p.points}`);
  check('Migrasi: streak kekal', p.streakDays === 4, `${p.streakDays}`);
  check('Migrasi: lencana kekal', p.badges.includes('first-steps'));
  check('Migrasi: bahasa kekal', d.lang === 'ms', d.lang);
  check('Migrasi: versi dinaikkan', d.version === 2, `${d.version}`);
}

// 2. Kad ulangan dibina daripada sejarah lama.
{
  const d = s.migrate(oldData());
  const p = d.profiles[0];
  check('Migrasi: kad ulangan dibina', (p.reviews?.length ?? 0) === 2, `${p.reviews?.length}`);
  const tambah = p.reviews?.find((c) => c.topicId === 'mt2-tambah');
  check('Migrasi: topik lulus naik kotak', (tambah?.box ?? -1) > 0, `box=${tambah?.box}`);
  const tumbuhan = p.reviews?.find((c) => c.topicId === 'sn2-tumbuhan');
  check('Migrasi: topik lemah dikira gagal', (tumbuhan?.lapses ?? 0) > 0, `lapses=${tumbuhan?.lapses}`);
  check('Migrasi: subjek dijejaki betul', tumbuhan?.subject === 'sains', tumbuhan?.subject);
}

// 3. Data tanpa percubaan tidak membina kad kosong.
{
  const raw = oldData();
  raw.profiles[0].attempts = [];
  const d = s.migrate(raw);
  check('Migrasi: tiada percubaan -> tiada kad', (d.profiles[0].reviews?.length ?? 0) === 0, `${d.profiles[0].reviews?.length}`);
}

// 4. Data rosak tidak menjatuhkan aplikasi.
{
  check('Migrasi: null selamat', s.migrate(null).profiles.length === 0);
  check('Migrasi: teks selamat', s.migrate('rosak').profiles.length === 0);
  check('Migrasi: objek kosong selamat', s.migrate({}).profiles.length === 0);
  const bad = { profiles: [{ id: 'x', name: 'X', year: 99, attempts: [{ total: 0 }, { total: 5, correct: 99 }], reviews: [{ box: 99 }, 'rosak', {}] }] };
  const d = s.migrate(bad);
  const p = d.profiles[0];
  check('Migrasi: tahun dihadkan 1..6', p.year >= 1 && p.year <= 6, `${p.year}`);
  check('Migrasi: percubaan rosak dibuang', p.attempts.length === 1, `${p.attempts.length}`);
  check('Migrasi: markah dihadkan', p.attempts[0].correct <= p.attempts[0].total, `${p.attempts[0].correct}/${p.attempts[0].total}`);
  // Kad rosak dibuang; kad sebenar datang daripada backfill percubaan sah.
  check('Migrasi: kad tanpa topik dibuang', p.reviews?.every((c) => typeof c.topicId === 'string' && c.topicId.length > 0) ?? true);
  check('Migrasi: kotak rosak tidak melebihi had', p.reviews?.every((c) => c.box >= 0 && c.box <= 5) ?? true, p.reviews?.map((c) => c.box).join(','));
  check('Migrasi: kad sepadan dengan percubaan sah', (p.reviews?.length ?? 0) === 1, `${p.reviews?.length}`);
}

// 5. Simpan dan muat semula (perjalanan penuh melalui localStorage).
{
  mem.clear();
  const d = s.migrate(oldData());
  s.saveData(d);
  const again = s.loadData();
  check('Simpan/muat: percubaan kekal', again.profiles[0].attempts.length === 3, `${again.profiles[0].attempts.length}`);
  check('Simpan/muat: kad ulangan kekal', (again.profiles[0].reviews?.length ?? 0) === 2, `${again.profiles[0].reviews?.length}`);
  const box1 = d.profiles[0].reviews?.find((c) => c.topicId === 'mt2-tambah')?.box;
  const box2 = again.profiles[0].reviews?.find((c) => c.topicId === 'mt2-tambah')?.box;
  check('Simpan/muat: kotak ulangan sama', box1 === box2, `${box1} vs ${box2}`);
}

// 6. Migrasi tidak mengubah rekod yang sudah ada kad (tidak berulang).
{
  const d1 = s.migrate(oldData());
  const d2 = s.migrate(JSON.parse(JSON.stringify(d1)));
  const c1 = d1.profiles[0].reviews?.map((c) => `${c.topicId}:${c.box}:${c.lapses}`).sort().join('|');
  const c2 = d2.profiles[0].reviews?.map((c) => `${c.topicId}:${c.box}:${c.lapses}`).sort().join('|');
  check('Migrasi: tidak berulang apabila kad sudah ada', c1 === c2, `${c1} vs ${c2}`);
  check('Migrasi: jumlah kad stabil', d2.profiles[0].reviews?.length === 2, `${d2.profiles[0].reviews?.length}`);
}

// 7. Profil baharu bermula dengan senarai kad kosong (bukan undefined).
{
  const p = s.newProfile('Siti', '🐼', 1);
  check('Profil baharu: kad ulangan kosong', Array.isArray(p.reviews) && p.reviews.length === 0);
  check('Profil baharu: versi storan semasa', s.SCHEMA_VERSION === 2, `${s.SCHEMA_VERSION}`);
}

// 8. Statistik profil tidak terjejas oleh medan baharu.
{
  const d = s.migrate(oldData());
  const st = s.profileStats(d.profiles[0]);
  check('Statistik: jumlah soalan betul', st.questions === 24, `${st.questions}`);
  check('Statistik: jumlah betul dikira', st.correct === 18, `${st.correct}`);
}

let failed = 0;
console.log('\n=== SEMAKAN MIGRASI DATA ===\n');
for (const x of report) {
  console.log(`${x.ok ? '  LULUS' : '  GAGAL'}  ${x.name}${x.detail ? `  [${x.detail}]` : ''}`);
  if (!x.ok) failed += 1;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
console.log(failed === 0 ? 'ALL OK' : 'GAGAL');
process.exit(failed === 0 ? 0 : 1);
