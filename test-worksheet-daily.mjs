/**
 * Ujian ciri baharu: lembaran latihan boleh cetak dan had sesi harian.
 *
 * Dijalankan terhadap bundel dalam dist/ melalui jsdom, jadi ia menyentuh
 * laluan kod sebenar (skrin, penghalaan, penyimpanan) dan bukan tiruan.
 *
 * Jalankan: npm run build && node test-worksheet-daily.mjs
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

const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

/** Data murid: hari ini sudah siap sepenuhnya supaya had harian aktif. */
function seededData() {
  return {
    version: 3,
    activeProfileId: 'p-anak',
    lang: 'ms',
    celebratedBadges: [],
    settings: {
      sound: false, voice: false, motion: true, calm: false, contrast: false,
      dark: false, fontScale: 1, dailyLimit: true,
    },
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 3, lastActiveDate: todayKey, stars: 30, points: 60,
      seenTopics: [],
      plan: {
        createdAt: Date.now() - 80000, year: 1,
        focusTopicIds: ['mt1-nombor-hingga-100'],
        weakTopicIds: [],
        focusSeconds: 600, lastFocusDate: todayKey,
        // Semua tugasan hari ini selesai -> had harian mengunci hari seterusnya.
        tasks: [
          { id: 't1', dayIndex: 0, topicId: 'mt1-nombor-hingga-100', kind: 'practice', minutes: 10, done: true },
          { id: 't2', dayIndex: 0, topicId: 'mt1-tambah-tolak-100', kind: 'practice', minutes: 10, done: true },
          { id: 't3', dayIndex: 1, topicId: 'mt1-nombor-hingga-100', kind: 'practice', minutes: 10, done: false },
        ],
        dayCompletedOn: [todayKey],
      },
      attempts: [],
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
    window.print = () => { window.__printed = (window.__printed || 0) + 1; };
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
const waitFor = async (fn, timeout = 4000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fn()) return true;
    await sleep(50);
  }
  return false;
};

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

/* ---------------- 1. Had sesi harian ---------------- */

click(btn('Pelan'));
await sleep(600);
check('Had harian: mesej tunggu esok dipaparkan', /tunggu esok|esok/i.test(text()), text().slice(0, 160));
check(
  'Had harian: senarai tugasan disembunyikan',
  doc.querySelectorAll('.plan-task').length === 0,
  `${doc.querySelectorAll('.plan-task').length} .plan-task`,
);
check(
  'Had harian: panel kunci dipaparkan',
  Boolean(doc.querySelector('.daily-lock')),
  doc.querySelector('.daily-lock') ? 'ada .daily-lock' : 'tiada .daily-lock',
);
check('Had harian: tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));

// Matikan had harian: tugasan hari berikutnya mesti muncul semula.
click(btn('Profil'));
await sleep(600);
const limitToggle = [...doc.querySelectorAll('button[role="switch"]')].find((b) =>
  /sesi sehari|session limit/i.test(b.textContent || ''),
);
check('Had harian: suis ada dalam Profil', Boolean(limitToggle), 'suis tidak dijumpai');
click(limitToggle);
await sleep(500);
click(btn('Pelan'));
await sleep(600);
check(
  'Had harian: dimatikan -> tugasan muncul semula',
  doc.querySelectorAll('.plan-task').length > 0 && !doc.querySelector('.daily-lock'),
  `${doc.querySelectorAll('.plan-task').length} .plan-task`,
);
check('Had harian: tiada ralat JS selepas togol', errors.length === 0, errors.slice(0, 2).join(' | '));

// Hidupkan semula supaya baki ujian bermula daripada keadaan asal.
click(btn('Profil'));
await sleep(500);
click(limitToggle);
await sleep(400);

/* ---------------- 2. Lembaran latihan ---------------- */

// Kembali ke Utama, masuk Subjek -> Matematik -> butang lembaran.
click(btn('Subjek'));
await sleep(500);
click(btn('Matematik'));
await sleep(600);
const wsBtn = btn('Lembaran');
check('Lembaran: butang masuk ada pada skrin topik', Boolean(wsBtn), text().slice(0, 120));
click(wsBtn);
await sleep(700);

const sheetText = text();
check('Lembaran: skrin lembaran dirender', /Lembaran/i.test(sheetText), sheetText.slice(0, 140));
check('Lembaran: ada medan nama', /Nama/i.test(sheetText), sheetText.slice(0, 140));
check('Lembaran: ada soalan bernombor', /\b1\./.test(sheetText), sheetText.slice(0, 200));
check(
  'Lembaran: kunci jawapan tersembunyi dahulu',
  !doc.querySelector('.ws-key'),
  doc.querySelector('.ws-key') ? 'ada .ws-key' : 'tiada .ws-key',
);
check('Lembaran: tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));

// Tunjuk kunci jawapan.
click(btn('Kunci Jawapan'));
await sleep(500);
check(
  'Lembaran: kunci jawapan boleh ditunjuk',
  Boolean(doc.querySelector('.ws-key')),
  doc.querySelector('.ws-key') ? 'ada .ws-key' : 'tiada .ws-key',
);

// Jana set soalan baharu.
const before = text();
click(btn('Soalan Baharu'));
await sleep(500);
check('Lembaran: soalan baharu dijana', text() !== before, text().slice(0, 160));

// Cetak memanggil window.print.
const beforePrint = dom.window.__printed || 0;
click(btn('Cetak'));
await sleep(300);
check('Lembaran: cetak memanggil window.print', (dom.window.__printed || 0) > beforePrint, `${dom.window.__printed}`);

/* ---------------- 3. Lembaran daripada Nota ---------------- */

click(btn('Subjek'));
await sleep(500);
click(btn('Matematik'));
await sleep(600);
// Buka satu topik untuk sampai ke skrin nota.
const topicBtn = buttons().find((b) => /Nombor|Tambah|Wang|Bentuk/i.test(b.textContent || ''));
click(topicBtn);
await sleep(700);
check('Nota: butang lembaran ada', /Lembaran/i.test(text()), text().slice(0, 160));
check('Nota: tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));

/* ---------------- Laporan ---------------- */

const pass = report.filter((r) => r.ok).length;
for (const r of report) {
  console.log(`  ${r.ok ? 'LULUS' : 'GAGAL'}  ${r.name}${r.detail ? `  [${r.detail}]` : ''}`);
}
console.log(`\n${pass}/${report.length} lulus`);
if (pass !== report.length) process.exit(1);
