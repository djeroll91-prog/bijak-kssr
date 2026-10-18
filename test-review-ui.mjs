/**
 * Ujian integrasi UI: sahkan ciri ulangan berjarak benar-benar muncul
 * dalam aplikasi yang dibina (dist/), menggunakan jsdom dengan data murid
 * yang sudah ada sejarah latihan.
 *
 * Jalankan: node test-review-ui.mjs
 */

import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const INDEX = join(DIST, 'index.html');
if (!existsSync(INDEX)) {
  console.error('FAIL: jalankan `npm run build` dahulu');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const errors = [];
const missing = [];

function load(pathname) {
  const clean = pathname.split('?')[0].split('#')[0];
  const file = join(DIST, clean.replace(/^\//, ''));
  if (!existsSync(file)) {
    missing.push(pathname);
    return { body: '', contentType: 'text/plain' };
  }
  return { body: readFileSync(file), contentType: MIME[extname(file)] || 'application/octet-stream' };
}

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => {
  if (!/Could not load/.test(e.message)) errors.push('jsdomError: ' + e.message);
});
virtualConsole.on('error', (m) => errors.push('console.error: ' + m));

const html = readFileSync(INDEX, 'utf8');
const moduleSrc = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/)?.[1];
const htmlForJsdom = html.replace(/<script[^>]*type="module"[^>]*><\/script>/, '');

/**
 * Data murid: topik "mt1-nombor" pernah gagal (masuk bank kesilapan) dan
 * "mt1-tambah" pernah lulus dengan jayanya. Kedua-dua patut dijadualkan
 * untuk ulangan hari ini selepas migrasi.
 */
function seededData() {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const attempt = (id, ts, topicId, title, subject, correct, total) => ({
    id, ts, year: 1, subject, topicId, topicTitle: title, correct, total, seconds: 60, retries: 0,
  });
  return {
    version: 1,
    activeProfileId: 'p-anak',
    lang: 'ms',
    celebratedBadges: [],
    settings: { sound: false, voice: false, motion: true, calm: false, contrast: false, dark: false, fontScale: 1 },
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 1, lastActiveDate: key, stars: 10, points: 20,
      seenTopics: ['mt1-nombor-hingga-100', 'mt1-tambah-tolak-100'], diagnostic: null, plan: null,
      attempts: [
        attempt('a1', Date.now() - 5000, 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 'matematik', 3, 8),
        attempt('a2', Date.now() - 4000, 'mt1-tambah-tolak-100', 'Tambah dan Tolak Hingga 100', 'matematik', 8, 8),
      ],
    }],
  };
}

const dom = new JSDOM(htmlForJsdom, {
  url: 'https://appassets.androidplatform.net/index.html',
  runScripts: 'dangerously',
  resources: {
    fetch(url) {
      const u = new URL(url);
      const res = load(u.pathname);
      return Promise.resolve(Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body));
    },
  },
  virtualConsole,
  pretendToBeVisual: true,
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = () => null;
    if (!window.AudioContext) {
      window.AudioContext = class {
        state = 'running';
        createGain() { return { gain: { value: 0 }, connect() {} }; }
        createOscillator() { return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }
        get destination() { return {}; }
        resume() { return Promise.resolve(); }
      };
    }
    if (!window.speechSynthesis) {
      Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [], cancel() {}, speak() {}, onvoiceschanged: null } });
    }
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.HTMLMediaElement.prototype.play = () => Promise.resolve();
    // Suntik data murid sebelum React bermula.
    window.localStorage.setItem('bijak-kssr/v1', JSON.stringify(seededData()));
  },
});

if (moduleSrc) {
  try {
    dom.window.eval(readFileSync(join(DIST, moduleSrc.replace(/^\.\//, '')), 'utf8'));
  } catch (e) {
    errors.push('bundle: ' + e.message);
  }
}
await new Promise((r) => setTimeout(r, 2500));

const doc = dom.window.document;
const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

check('Aplikasi dirender', (doc.getElementById('root')?.innerHTML.length ?? 0) > 200);
check('Tiada ralat JavaScript', errors.length === 0, errors.slice(0, 3).join(' | '));
check('Tiada aset hilang', missing.length === 0, missing.slice(0, 3).join(', '));

// Murid dibawa ke skrin utama.
check('Nama murid muncul', /Aisyah/.test(text), text.slice(0, 80));

// Data lama dinaik taraf dan kad ulangan muncul.
check('Kad "Masa Ulang" muncul', /Masa Ulang/.test(text));
check('Kiraan ulangan dipaparkan', /menunggu untuk diulang/.test(text));
check('Ruang Cuba Lagi muncul', /Ruang Cuba Lagi/.test(text));
check('Topik gagal disenaraikan', /Nombor Bulat Hingga 100/.test(text));
check('Bilangan gagal dipaparkan', /pernah tersalah 1 kali/.test(text));

// Kadar ulangan berjarak disimpan selepas migrasi.
{
  const raw = dom.window.localStorage.getItem('bijak-kssr/v1');
  const parsed = raw ? JSON.parse(raw) : null;
  const cards = parsed?.profiles?.[0]?.reviews ?? [];
  check('Kad ulangan disimpan ke storan', cards.length === 2, `${cards.length}`);
  check('Kad gagal ada lapses', cards.some((c) => c.lapses > 0), JSON.stringify(cards.map((c) => `${c.topicId}:${c.lapses}`)));
  check('Versi skema dinaikkan', parsed?.version === 3, `${parsed?.version}`);
  check('Rekod lama kekal', parsed?.profiles?.[0]?.attempts?.length === 2, `${parsed?.profiles?.[0]?.attempts?.length}`);
}

let failed = 0;
console.log('\n=== UJIAN UI ULANGAN BERJARAK (jsdom) ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
console.log(`\nCuplikan teks: ${text.slice(0, 260)}`);

dom.window.close();
process.exit(failed === 0 ? 0 : 1);
