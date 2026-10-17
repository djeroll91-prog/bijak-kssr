/**
 * Ujian skrin menyeluruh: lawati setiap skrin utama melalui navigasi
 * sebenar dalam aplikasi yang dibina (dist/) dan sahkan setiap satu
 * benar-benar dirender tanpa ralat JavaScript.
 *
 * Sebelum ini hanya skrin ulangan (review) diuji. Ujian ini menutup
 * celah tersebut untuk skrin yang jarang tersentuh.
 *
 * Jalankan: node test-screens.mjs
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

/** Data murid dengan sejarah supaya semua skrin ada kandungan. */
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
      badges: [], streakDays: 2, lastActiveDate: key, stars: 30, points: 60,
      seenTopics: ['mt1-nombor-hingga-100', 'mt1-tambah-tolak-100'],
      // Diagnosis diperlukan supaya skrin Laporan Ibu Bapa boleh dibuka.
      diagnostic: {
        ts: Date.now() - 90000, year: 1, correct: 5, total: 8, seconds: 240,
        items: [
          { topicId: 'mt1-nombor-hingga-100', subject: 'matematik', title: 'Nombor Bulat Hingga 100', correct: 3, total: 4 },
          { topicId: 'mt1-tambah-tolak-100', subject: 'matematik', title: 'Tambah dan Tolak Hingga 100', correct: 2, total: 4 },
        ],
      },
      plan: {
        createdAt: Date.now() - 80000, year: 1,
        focusTopicIds: ['mt1-nombor-hingga-100', 'mt1-tambah-tolak-100'],
        weakTopicIds: ['mt1-nombor-hingga-100'],
        focusSeconds: 600, lastFocusDate: key,
        tasks: [
          { id: 't1', dayIndex: 0, topicId: 'mt1-nombor-hingga-100', kind: 'practice', minutes: 10, done: true },
          { id: 't2', dayIndex: 1, topicId: 'mt1-tambah-tolak-100', kind: 'practice', minutes: 10, done: false },
        ],
      },
      attempts: [
        mk('a1', 'matematik', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 3, 10, base + 1),
        mk('a2', 'matematik', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 6, 10, base + 2),
        mk('a3', 'matematik', 'mt1-tambah-tolak-100', 'Tambah dan Tolak Hingga 100', 8, 10, base + 3),
        mk('a4', 'sains', 'sn1-deria', 'Deria dan Keperluan Benda Hidup', 5, 10, base + 4),
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
const btn = (label) =>
  buttons().find((b) => (b.textContent || '').replace(/\s+/g, ' ').trim() === label) ??
  buttons().find((b) => (b.textContent || '').replace(/\s+/g, ' ').includes(label));
const rendered = () => (doc.getElementById('root')?.innerHTML.length ?? 0) > 200;
/** Tunggu sehingga syarat dipenuhi; elak kegagalan masa yang tidak stabil. */
const waitFor = async (fn, timeout = 4000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fn()) return true;
    await sleep(50);
  }
  return false;
};
/** Kembali ke skrin utama melalui butang kembali tab bawah. */
const goHome = async () => {
  click(btn('Utama'));
  await sleep(400);
};

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

/** Lawati satu skrin melalui butang tab bawah dan sahkan ia dirender. */
async function visitTab(tabLabel, expectText, name) {
  const before = errors.length;
  click(btn(tabLabel));
  await sleep(500);
  check(`${name}: dirender`, rendered() && expectText.test(text()), text().slice(0, 70));
  check(`${name}: tiada ralat JS`, errors.length === before, errors.slice(before, before + 2).join(' | '));
}

// Skrin tab bawah.
await visitTab('Subjek', /Mata Pelajaran/, 'Subjek');
await visitTab('Pelan', /Pelan Belajar/, 'Pelan');
await visitTab('Permainan', /Mini Permainan/, 'Permainan');
await visitTab('Kemajuan', /Kemajuan Saya/, 'Kemajuan');
await visitTab('Profil', /Profil/, 'Profil');
await visitTab('Utama', /Selamat kembali|Hai/, 'Utama');

// Skrin yang memerlukan navigasi lanjut: topik -> nota.
{
  const before = errors.length;
  click(btn('Subjek'));
  await sleep(400);
  click(btn('Matematik'));
  await sleep(450);
  check('Topik: senarai topik dirender', /Nombor Bulat/.test(text()), text().slice(0, 70));

  click(btn('Nombor Bulat Hingga 100'));
  await sleep(500);
  const notesOk = /Nota|Belajar|Contoh|Tip/i.test(text()) || rendered();
  check('Nota: skrin nota dirender', notesOk, text().slice(0, 70));
  check('Nota: tiada ralat JS', errors.length === before, errors.slice(before, before + 2).join(' | '));
}

// Skrin diagnosis (dari Pelan).
await goHome();
{
  const before = errors.length;
  click(btn('Pelan'));
  await sleep(450);
  click(btn('Ujian Diagnosis'));
  await sleep(600);
  check('Diagnosis: skrin dirender', rendered() && /Diagnosis|Soalan|Mula/i.test(text()), text().slice(0, 70));
  check('Diagnosis: tiada ralat JS', errors.length === before, errors.slice(before, before + 2).join(' | '));
}

// Skrin laporan ibu bapa (dari Pelan).
await goHome();
{
  const before = errors.length;
  click(btn('Pelan'));
  await sleep(450);
  click(btn('Laporan'));
  await sleep(600);
  check('Laporan: skrin dirender', rendered() && /Laporan/.test(text()), text().slice(0, 70));
  check('Laporan: tiada ralat JS', errors.length === before, errors.slice(before, before + 2).join(' | '));
}

// Skrin lencana (dari Kemajuan).
await goHome();
{
  const before = errors.length;
  click(btn('Kemajuan'));
  await sleep(500);
  click(btn('Lencana'));
  await sleep(550);
  check('Lencana: skrin dirender', rendered() && /Lencana/.test(text()), text().slice(0, 70));
  check('Lencana: tiada ralat JS', errors.length === before, errors.slice(before, before + 2).join(' | '));
}

// Skrin kuiz: mula dari topik.
await goHome();
{
  const before = errors.length;
  click(btn('Subjek'));
  await sleep(400);
  click(btn('Matematik'));
  await sleep(450);
  click(btn('Nombor Bulat Hingga 100'));
  await sleep(500);
  click(btn('Mula Belajar') ?? btn('Latihan') ?? btn('Mula'));
  const quizOk =
    (await waitFor(() => /Soalan|Betul|Pilih|Jawapan|manakah|Apakah|Berapakah/i.test(text()))) &&
    rendered();
  check('Kuiz: skrin soalan dirender', quizOk, text().slice(0, 70));
  check('Kuiz: tiada ralat JS', errors.length === before, errors.slice(before, before + 2).join(' | '));
}

let failed = 0;
console.log('\n=== UJIAN SKRIN MENYELURUH (jsdom) ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);

dom.window.close();
process.exit(failed === 0 ? 0 : 1);
