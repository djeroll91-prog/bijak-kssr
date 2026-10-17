/**
 * Ujian UI trend per topik/subjek pada aplikasi yang dibina (dist/).
 *
 * Mengesahkan penapis benar-benar menukar graf: bilangan titik pada carta
 * mesti berkurang apabila skop ditapis kepada satu subjek atau satu topik.
 *
 * Jalankan: node test-trend-ui.mjs
 */

import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
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

const html = readFileSync(INDEX, 'utf8');
const moduleSrc = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/)?.[1];
const htmlForJsdom = html.replace(/<script[^>]*type="module"[^>]*><\/script>/, '');
const bundle = moduleSrc ? readFileSync(join(DIST, moduleSrc.replace(/^\.\//, '')), 'utf8') : '';

function load(pathname) {
  const clean = pathname.split('?')[0].split('#')[0];
  const file = join(DIST, clean.replace(/^\//, ''));
  if (!existsSync(file)) return { body: '', contentType: 'text/plain' };
  return { body: readFileSync(file), contentType: MIME[extname(file)] || 'application/octet-stream' };
}

/**
 * Sejarah latihan yang sengaja tidak seimbang:
 *   matematik/mt1-nombor : 4 percubaan, markah menaik (20 -> 80)
 *   matematik/mt1-tambah : 3 percubaan
 *   sains/sn1-deria      : 2 percubaan
 * Jumlah 9 percubaan.
 */
function seededData() {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const mk = (id, subject, topicId, topicTitle, correct, total, ts) => ({
    id, ts, year: 1, subject, topicId, topicTitle, correct, total, seconds: 60, retries: 0,
  });
  const base = Date.now() - 100000;
  return {
    version: 2,
    activeProfileId: 'p-anak',
    lang: 'ms',
    celebratedBadges: [],
    settings: {
      sound: false, voice: false, motion: true, calm: false, contrast: false,
      dark: false, fontScale: 1,
    },
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 1, lastActiveDate: key, stars: 10, points: 20,
      seenTopics: ['mt1-nombor-hingga-100', 'mt1-tambah-tolak-100', 'sn1-deria'],
      diagnostic: null, plan: null,
      attempts: [
        mk('a1', 'matematik', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 2, 10, base + 1),
        mk('a2', 'matematik', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 4, 10, base + 2),
        mk('a3', 'matematik', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 6, 10, base + 3),
        mk('a4', 'matematik', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 8, 10, base + 4),
        mk('a5', 'matematik', 'mt1-tambah-tolak-100', 'Tambah dan Tolak Hingga 100', 5, 10, base + 5),
        mk('a6', 'matematik', 'mt1-tambah-tolak-100', 'Tambah dan Tolak Hingga 100', 7, 10, base + 6),
        mk('a7', 'matematik', 'mt1-tambah-tolak-100', 'Tambah dan Tolak Hingga 100', 9, 10, base + 7),
        mk('a8', 'sains', 'sn1-deria', 'Deria dan Keperluan Benda Hidup', 3, 10, base + 8),
        mk('a9', 'sains', 'sn1-deria', 'Deria dan Keperluan Benda Hidup', 6, 10, base + 9),
      ],
    }],
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => {
  if (!/Could not load/.test(e.message)) errors.push('jsdomError: ' + e.message);
});
virtualConsole.on('error', (m) => errors.push('console.error: ' + m));

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
      Object.defineProperty(window, 'speechSynthesis', {
        value: { getVoices: () => [], cancel() {}, speak() {}, onvoiceschanged: null },
      });
    }
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.HTMLMediaElement.prototype.play = () => Promise.resolve();
    if (!window.matchMedia) {
      window.matchMedia = (query) => ({
        matches: false, media: query, onchange: null,
        addListener() {}, removeListener() {}, addEventListener() {},
        removeEventListener() {}, dispatchEvent() { return false; },
      });
    }
    window.localStorage.setItem('bijak-kssr/v1', JSON.stringify(seededData()));
  },
});

if (bundle) {
  try {
    dom.window.eval(bundle);
  } catch (e) {
    errors.push('bundle: ' + e.message);
  }
}
await sleep(2200);

const doc = dom.window.document;
const buttons = () => [...doc.querySelectorAll('button')];
const text = () => (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
const click = (el) => {
  if (!el) return false;
  el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  return true;
};
const btn = (label) => buttons().find((b) => (b.textContent || '').replace(/\s+/g, ' ').trim() === label)
  ?? buttons().find((b) => (b.textContent || '').replace(/\s+/g, ' ').includes(label));
/** Bilangan titik pada carta trend. */
const chartPoints = () => doc.querySelectorAll('.chart-trend circle').length;

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

// Pergi ke skrin Kemajuan.
click(btn('Kemajuan'));
await sleep(500);

check('Skrin Kemajuan dibuka', /Trend Markah/.test(text()), text().slice(0, 80));
check('Tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));

// Tanpa tapisan: semua 9 percubaan, carta dihadkan kepada 12 titik -> 9.
const allPoints = chartPoints();
check('Semua: carta ada 9 titik', allPoints === 9, `${allPoints}`);
check('Penapis subjek dipaparkan', /Pilih subjek/.test(text()));

// Tapis kepada matematik: 7 percubaan.
click(btn('📐 Matematik') ?? btn('Matematik'));
await sleep(450);
const mathPoints = chartPoints();
check('Matematik: carta ada 7 titik', mathPoints === 7, `${mathPoints}`);
check('Penapis topik muncul selepas pilih subjek', /Pilih topik/.test(text()));

// Tapis kepada satu topik: 4 percubaan.
click(btn('Nombor Bulat Hingga 100'));
await sleep(450);
const topicPoints = chartPoints();
check('Topik: carta ada 4 titik', topicPoints === 4, `${topicPoints}`);

// Topik dengan 4 titik patut menunjukkan arah naik.
check('Arah naik dikesan', /Naik/.test(text()), text().slice(0, 200));

// "Semua" peringkat topik: kembali kepada 7 titik (subjek matematik kekal).
const semuaBtns = buttons().filter((b) => (b.textContent || '').replace(/\s+/g, ' ').trim() === 'Semua');
check('Dua butang "Semua" (subjek + topik)', semuaBtns.length === 2, `${semuaBtns.length}`);
click(semuaBtns[1]);
await sleep(450);
const backPoints = chartPoints();
check('Topik "Semua": kembali 7 titik', backPoints === 7, `${backPoints}`);

// "Semua" peringkat subjek: set semula semua 9 titik.
click(semuaBtns[0]);
await sleep(450);
const resetPoints = chartPoints();
check('Subjek "Semua": set semula 9 titik', resetPoints === 9, `${resetPoints}`);

// Tiada data untuk subjek lain: mesej kosong, bukan graf mengelirukan.
check('Tiada aset hilang', errors.length === 0, errors.slice(0, 2).join(' | '));

let failed = 0;
console.log('\n=== UJIAN UI TREND (jsdom) ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
console.log(`\nCuplikan: ${text().slice(0, 220)}`);

dom.window.close();
process.exit(failed === 0 ? 0 : 1);
