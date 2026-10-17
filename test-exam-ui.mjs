/**
 * Ujian UI peperiksaan percubaan pada aplikasi yang dibina (dist/).
 *
 * Mengesahkan aliran penuh: intro -> mula -> jawab -> semak -> hantar ->
 * keputusan, dan bahawa soalan BERTUKAR antara percubaan.
 *
 * Jalankan: npm run build && node test-exam-ui.mjs
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

/** Profil murid Tahun 1 dengan beberapa percubaan latihan sedia ada. */
function seededData() {
  const d = new Date();
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
      seenTopics: [], diagnostic: null, plan: null,
      attempts: [
        { id: 'a1', ts: base + 1, year: 1, subject: 'matematik', topicId: 'mt1-nombor-hingga-100', topicTitle: 'Nombor Bulat Hingga 100', correct: 8, total: 10, seconds: 60, retries: 0 },
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
/** Teks soalan yang sedang dipaparkan. */
const promptText = () => (doc.querySelector('.q-prompt')?.textContent || '').replace(/\s+/g, ' ').trim();

/** Chip kiraan "a/b dijawab" pada HUD (chip kedua). */
const answeredChip = () => doc.querySelectorAll('.exam-hud .chip')[1]?.textContent || '';
/** Bilangan soalan yang sudah dijawab, dibaca dari chip kiraan. */
function answeredCount() {
  const m = answeredChip().match(/(\d+)\s*\/\s*(\d+)/);
  return m ? Number(m[1]) : 0;
}
function examTotal() {
  const m = answeredChip().match(/\d+\s*\/\s*(\d+)/);
  return m ? Number(m[1]) : 20;
}

/**
 * Jawab setiap soalan sehingga kertas penuh. Gelung berjaga-jaga mengulang
 * soalan yang jenis jawapannya gagal (contohnya padanan pasangan).
 */
async function answerAll(prompts) {
  let guard = 0;
  while (answeredCount() < examTotal() && guard < 140) {
    guard += 1;
    const p = promptText();
    if (p && !prompts.includes(p)) prompts.push(p);
    await answerOne();
    await sleep(170);
    if (answeredCount() < examTotal()) {
      click(btn('Seterusnya'));
      await sleep(170);
    }
  }
  return answeredCount();
}

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

/** Jawab soalan semasa walau apa jenisnya (mcq, nombor, padan, susun). */
async function answerOne() {
  // Jenis "nombor": tekan satu digit kemudian hantar.
  const pad = doc.querySelector('.numeric-pad');
  if (pad) {
    const one = [...pad.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '1');
    click(one);
    await sleep(50);
    const submit = [...pad.querySelectorAll('button')].find((b) => /Hantar/.test(b.textContent || ''));
    click(submit);
    return true;
  }

  // Jenis "susun": masukkan semua cip ke dalam bekas, kemudian hantar.
  const pool = doc.querySelector('.order-pool');
  if (pool) {
    for (const c of [...pool.querySelectorAll('.order-chip')]) {
      click(c);
      await sleep(40);
    }
    const submit = [...doc.querySelectorAll('button')].find((b) => /Hantar/.test(b.textContent || ''));
    click(submit);
    return true;
  }

  // Jenis "padan": sel kiri ada atribut data-sel, sel kanan tidak.
  const lefts = [...doc.querySelectorAll('.match-cell[data-sel]')];
  if (lefts.length > 0) {
    for (let li = 0; li < lefts.length; li += 1) {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const l = [...doc.querySelectorAll('.match-cell[data-sel]')][li];
        if (!l || l.disabled || l.getAttribute('data-done') === 'true') break;
        click(l);
        await sleep(60);
        const rights = [...doc.querySelectorAll('.match-cell:not([data-sel])')].filter((r) => !r.disabled);
        for (const r of rights) {
          click(r);
          await sleep(70);
          const after = [...doc.querySelectorAll('.match-cell[data-sel]')][li];
          if (after && after.getAttribute('data-done') === 'true') break;
          const reselect = [...doc.querySelectorAll('.match-cell[data-sel]')][li];
          if (reselect && !reselect.disabled && reselect.getAttribute('data-sel') !== 'true') {
            click(reselect);
            await sleep(60);
          }
        }
        const done = [...doc.querySelectorAll('.match-cell[data-sel]')][li];
        if (done && done.getAttribute('data-done') === 'true') break;
      }
    }
    return true;
  }

  // Lalai: pilihan berganda.
  const opts = [...doc.querySelectorAll('.option')];
  if (opts.length > 0) {
    click(opts[0]);
    return true;
  }
  return false;
}

// 0. Tips menjawab: buka, kembang satu kumpulan, sahkan tip dipaparkan.
click(btn('Tips Menjawab'));
await sleep(600);
check('Skrin tips dibuka', /Tips Menjawab/.test(text()), text().slice(0, 90));
check('Tip am dipaparkan', /Tip Am/.test(text()));
const tipGroups = doc.querySelectorAll('.tips-head');
check('Kumpulan tip mengikut subjek', tipGroups.length >= 4, `${tipGroups.length}`);
click(tipGroups[0]);
await sleep(400);
const tipCards = doc.querySelectorAll('.tips-group .card');
check('Tip boleh dikembangkan', tipCards.length > 0, `${tipCards.length} tip`);
check('Tiada ralat JS pada tips', errors.length === 0, errors.slice(0, 2).join(' | '));
click(btn('Kembali'));
await sleep(500);

// 1. Buka Peperiksaan Percubaan dari Utama.
click(btn('Peperiksaan Percubaan'));
await sleep(600);
check('Skrin intro peperiksaan dibuka', /Sedia untuk cuba/.test(text()), text().slice(0, 90));
check('Chip 20 soalan dipaparkan', /20 soalan/.test(text()));
check('Chip masa 30 minit dipaparkan', /30 minit/.test(text()));
check('Peraturan dipaparkan', /Peraturan Peperiksaan/.test(text()));
check('Tiada ralat JS semasa intro', errors.length === 0, errors.slice(0, 2).join(' | '));

// 2. Mula peperiksaan.
click(btn('Mula Peperiksaan'));
await sleep(700);
check('HUD pemasa muncul', doc.querySelector('.exam-hud') !== null);
check('Pemasa bermula 30:00', /29:5\d|30:00/.test(text()), (doc.querySelector('.exam-hud')?.textContent || '').trim());
check('Bar kemajuan soalan ada', doc.querySelector('.q-progress') !== null);

// 3. Jawab semua 20 soalan, catat teks soalan untuk semakan pertukaran.
const promptsA = [];
const answeredA = await answerAll(promptsA);
check('20 soalan dijawab', answeredA === 20, `${answeredA}/20`);
check('Kiraan dijawab dipaparkan', /20\/20 dijawab/.test(text()), text().slice(-160));

// 4. Butang semak muncul; buka semak.
check('Butang semak muncul', doc.querySelector('.exam-review-fab') !== null);
click(btn('Semak Jawapan'));
await sleep(500);
check('Grid lompat soalan dipaparkan', doc.querySelectorAll('.exam-jump').length === 20,
  `${doc.querySelectorAll('.exam-jump').length}`);

// 5. Hantar kertas.
click(btn('Hantar Kertas'));
await sleep(400);
check('Pengesahan hantar dipaparkan', /Hantar kertas sekarang/.test(text()));
// Sahkan dalam sheet.
const confirmBtn = buttons().filter((b) => /Hantar Kertas/.test(b.textContent || '')).pop();
click(confirmBtn);
await sleep(900);

// 6. Skrin keputusan.
check('Skrin keputusan dibuka', /Keputusan Peperiksaan/.test(text()), text().slice(0, 90));
check('Gred dipaparkan', /Gred/.test(text()));
check('Pecahan ikut subjek', /Pecahan Markah Ikut Subjek/.test(text()));
check('Pecahan ikut topik', /Pecahan Markah Ikut Topik/.test(text()));
check('Perbandingan percubaan', /Banding Percubaan/.test(text()));
check('Percubaan pertama dikesan', /percubaan pertama/.test(text()));

// 7. Semakan jawapan penuh.
click(btn('Tunjuk semakan jawapan'));
await sleep(400);
check('Semakan jawapan dipaparkan', doc.querySelectorAll('.review-item').length === 20,
  `${doc.querySelectorAll('.review-item').length}`);

// 8. Cuba percubaan baharu -> soalan mesti BERTUKAR.
click(btn('Cuba Percubaan Baharu'));
await sleep(700);
check('Kembali ke intro untuk percubaan baharu', /Sedia untuk cuba/.test(text()));
click(btn('Mula Peperiksaan'));
await sleep(700);
const promptsB = [];
await answerAll(promptsB);
const setA = new Set(promptsA);
const same = promptsB.filter((p) => setA.has(p)).length;
check('Soalan bertukar antara percubaan', same <= 10,
  `${same}/20 soalan sama (${20 - same} bertukar)`);

// 9. Hantar percubaan kedua dan sahkan perbandingan muncul.
click(btn('Semak Jawapan'));
await sleep(400);
click(btn('Hantar Kertas'));
await sleep(300);
const confirm2 = buttons().filter((b) => /Hantar Kertas/.test(b.textContent || '')).pop();
click(confirm2);
await sleep(900);
check('Keputusan percubaan kedua', /Keputusan Peperiksaan/.test(text()));
check('Percubaan ke-2 dipaparkan', /Percubaan ke-2/.test(text()), text().slice(0, 200));

check('Tiada ralat JS sepanjang aliran', errors.length === 0, errors.slice(0, 2).join(' | '));

let failed = 0;
console.log('\n=== UJIAN UI PEPERIKSAAN PERCUBAAN (jsdom) ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);

dom.window.close();
process.exit(failed === 0 ? 0 : 1);
