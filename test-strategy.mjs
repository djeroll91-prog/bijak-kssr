/**
 * Ujian ciri "cara tackle" dan animasi garis nombor pada skrin Nota.
 *
 * Dua ciri diuji di sini:
 *   1. Kad strategi menjawab (mengikut subjek, dan khas untuk pembundaran).
 *   2. Garis nombor beranimasi yang menunjukkan di mana nombor berada antara
 *      dua gandaan.
 *
 * Ujian ini memuatkan bundel sebenar dari dist/ dalam jsdom, kemudian
 * menavigasi seperti murid: Subjek -> Matematik -> topik. Ia mengesahkan
 * bahawa garis nombor HANYA muncul pada topik pembundaran, dan bahawa
 * kandungan bertukar bahasa apabila tetapan bahasa ditukar.
 *
 * Jalankan: node test-strategy.mjs
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

/** Data murid Tahun 2 (topik pembundaran berada di tahun ini). */
function seededData(lang) {
  return {
    version: 3,
    activeProfileId: 'p-test',
    profiles: [
      {
        id: 'p-test',
        name: 'Ujian',
        avatar: '🦊',
        year: 2,
        createdAt: Date.now(),
        attempts: [],
        reviews: [],
        badges: [],
        streakDays: 0,
        lastActiveDate: '2026-10-16',
        stars: 0,
        points: 0,
        seenTopics: [],
        diagnostic: null,
        plan: null,
      },
    ],
    settings: {
      sound: false,
      voice: false,
      motion: false,
      calm: false,
      contrast: false,
      dark: false,
      fontScale: 1,
      dailyLimit: true,
      skin: 'clay',
    },
    lang,
    celebratedBadges: [],
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Bina satu DOM dengan bahasa tertentu. */
async function boot(lang) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  // jsdom tidak memuatkan fail aset luaran (CSS, service worker). Itu bukan
  // ralat apl, jadi ia ditapis supaya ujian hanya menangkap ralat sebenar.
  const ignorable = /Could not load (link|script|img)|Not implemented: HTMLCanvasElement|Could not parse CSS/;
  virtualConsole.on('jsdomError', (e) => {
    if (!ignorable.test(e.message)) errors.push('jsdomError: ' + e.message);
  });
  virtualConsole.on('error', (m) => {
    if (!ignorable.test(String(m))) errors.push('console.error: ' + m);
  });

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
      window.localStorage.setItem('bijak-kssr/v1', JSON.stringify(seededData(lang)));
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
  return { dom, errors };
}

const report = [];
const check = (name, ok, detail = '') => {
  report.push({ name, ok, detail });
  console.log(`${ok ? 'LULUS' : 'GAGAL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};

/** Klik butang mengikut teks (padanan tepat dahulu, kemudian sebahagian). */
function clicker(dom) {
  const doc = dom.window.document;
  const buttons = () => [...doc.querySelectorAll('button')];
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  return (label) => {
    const el =
      buttons().find((b) => norm(b.textContent) === label) ??
      buttons().find((b) => norm(b.textContent).includes(label));
    if (!el) return false;
    el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    return true;
  };
}

const textOf = (dom) => (dom.window.document.body?.textContent || '').replace(/\s+/g, ' ').trim();

/** Navigasi ke skrin nota satu topik. */
async function openTopic(dom, subject, topicLabel) {
  const click = clicker(dom);
  click('Subjek');
  await sleep(400);
  click(subject);
  await sleep(450);
  click(topicLabel);
  await sleep(600);
}

/* ------------------------------------------------------------------ */
/* Bahasa Melayu: topik pembundaran                                    */
/* ------------------------------------------------------------------ */
{
  const { dom, errors } = await boot('ms');
  const doc = dom.window.document;
  await openTopic(dom, 'Matematik', 'Nombor Bulat Hingga 1000');

  const text = textOf(dom);
  const numline = doc.querySelector('.numline');
  const strat = doc.querySelector('.strat-card');

  check('Nota T2: skrin nota dirender', /Nota|Cara/i.test(text), text.slice(0, 60));
  check('Strategi: kad dipaparkan', !!strat);
  check('Strategi: tajuk pembundaran', /Cara Paling Senang Membundar/.test(text), '');
  check('Strategi: ada 4 langkah', doc.querySelectorAll('.strat-list li').length === 4, String(doc.querySelectorAll('.strat-list li').length));
  check('Strategi: ada 7 kata kunci', doc.querySelectorAll('.strat-kw-item').length === 7, String(doc.querySelectorAll('.strat-kw-item').length));
  check('Strategi: kata kunci "jumlah" dipaparkan', /jumlah/.test(text));

  check('Garis nombor: dipaparkan pada topik pembundaran', !!numline);
  check('Garis nombor: hujung kiri 460', /460/.test(numline?.textContent || ''));
  check('Garis nombor: hujung kanan 470', /470/.test(numline?.textContent || ''));
  check('Garis nombor: jawapan 462 ≈ 460', /462/.test(numline?.textContent || '') && /≈/.test(numline?.textContent || ''));
  check('Garis nombor: penanda titik tengah ada', !!doc.querySelector('.numline-mid'));
  check('Nota T2: tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));
  dom.window.close();
}

/* ------------------------------------------------------------------ */
/* Bahasa Melayu: topik BUKAN pembundaran (garis nombor tidak muncul)  */
/* ------------------------------------------------------------------ */
{
  const { dom, errors } = await boot('ms');
  const doc = dom.window.document;
  await openTopic(dom, 'Matematik', 'Operasi Asas');

  const text = textOf(dom);
  check('Nota operasi: garis nombor TIDAK dipaparkan', !doc.querySelector('.numline'));
  check('Nota operasi: kad strategi tetap ada', !!doc.querySelector('.strat-card'));
  check('Nota operasi: strategi matematik am', /Cara Tackle Soalan Matematik/.test(text), '');
  check('Nota operasi: tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));
  dom.window.close();
}

/* ------------------------------------------------------------------ */
/* Bahasa Inggeris: kandungan bertukar bahasa                          */
/* ------------------------------------------------------------------ */
{
  const { dom, errors } = await boot('en');
  const doc = dom.window.document;
  await openTopic(dom, 'Mathematics', 'Nombor Bulat Hingga 1000');

  const text = textOf(dom);
  check('EN: kad strategi dipaparkan', !!doc.querySelector('.strat-card'));
  check('EN: tajuk strategi Inggeris', /The Easiest Way to Round/.test(text), text.slice(0, 80));
  check('EN: garis nombor dipaparkan', !!doc.querySelector('.numline'));
  check('EN: teks garis nombor Inggeris', /Number line/i.test(doc.querySelector('.numline')?.textContent || ''));
  check('EN: tiada teks BM bocor dalam strategi', !/Cara Paling Senang/.test(text));
  check('EN: tiada ralat JS', errors.length === 0, errors.slice(0, 2).join(' | '));
  dom.window.close();
}

/* ------------------------------------------------------------------ */
const failed = report.filter((r) => !r.ok);
console.log(`\n${report.length - failed.length}/${report.length} lulus`);
if (failed.length) {
  console.log('GAGAL:');
  for (const f of failed) console.log(`  - ${f.name} ${f.detail}`);
  process.exit(1);
}
console.log('PASS: semua ujian strategi dan garis nombor lulus.');
