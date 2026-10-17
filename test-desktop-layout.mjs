/**
 * Ujian susun atur desktop (web) lwn telefon (APK).
 *
 * Dua jaminan yang diuji:
 *   1. APK (hos maya WebView) sentiasa mendapat `data-layout="phone"`.
 *   2. Pelayar (hos biasa) mendapat `data-layout="auto"`, dan peraturan CSS
 *      desktop dijangka hanya untuk saluran web.
 *
 * CSS tidak dinilai oleh jsdom (tiada enjin susun atur), jadi kami mengesahkan
 * pengesan saluran, kawalan pilihan dalam profil, dan kehadiran peraturan
 * desktop dalam fail CSS yang dibina.
 *
 * Jalankan: node test-desktop-layout.mjs
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
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};

const html = readFileSync(INDEX, 'utf8');
const moduleSrc = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/)?.[1];
const cssHref = html.match(/href="([^"]+\.css)"/)?.[1];
const htmlForJsdom = html.replace(/<script[^>]*type="module"[^>]*><\/script>/, '');
const bundle = moduleSrc ? readFileSync(join(DIST, moduleSrc.replace(/^\.\//, '')), 'utf8') : '';
const cssRaw = cssHref ? readFileSync(join(DIST, cssHref.replace(/^\//, '')), 'utf8') : '';
// Buang ruang dan tanda petikan supaya padanan tidak bergantung pada minifier.
const css = cssRaw.replace(/\s+/g, '').replace(/["']/g, '');

if (!bundle) { console.error('FAIL: bundel JS tidak dijumpai'); process.exit(1); }
if (!css) { console.error('FAIL: fail CSS tidak dijumpai'); process.exit(1); }

function load(pathname) {
  const clean = pathname.split('?')[0].split('#')[0];
  const file = join(DIST, clean.replace(/^\//, ''));
  if (!existsSync(file)) return { body: '', contentType: 'text/plain' };
  return { body: readFileSync(file), contentType: MIME[extname(file)] || 'application/octet-stream' };
}

const seededData = () => ({
  version: 2, activeProfileId: 'p-anak', lang: 'ms', celebratedBadges: [],
  settings: { sound: false, voice: false, motion: true, calm: false, contrast: false, dark: false, fontScale: 1 },
  profiles: [{
    id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
    badges: [], streakDays: 2, lastActiveDate: '2026-01-01', stars: 30, points: 60,
    seenTopics: [], attempts: [],
  }],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Muatkan aplikasi yang dibina pada hos tertentu. */
async function boot(host) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => {
    if (!/Could not load/.test(e.message)) errors.push('jsdomError: ' + e.message);
  });
  virtualConsole.on('error', (m) => errors.push('console.error: ' + m));

  const dom = new JSDOM(htmlForJsdom, {
    url: `https://${host}/index.html`,
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

  try { dom.window.eval(bundle); } catch (e) { errors.push('bundle: ' + e.message); }
  await sleep(2200);
  return { dom, doc: dom.window.document, errors };
}

let pass = 0, fail = 0;
const check = (name, ok, extra = '') => {
  if (ok) { pass++; console.log(`  LULUS  ${name}${extra ? '  [' + extra + ']' : ''}`); }
  else { fail++; console.log(`  GAGAL  ${name}${extra ? '  [' + extra + ']' : ''}`); }
};

console.log('\n=== UJIAN SUSUN ATUR DESKTOP (jsdom) ===\n');

// ---- 1. APK: kekal telefon ----
const apk = await boot('appassets.androidplatform.net');
const apkHtml = apk.doc.documentElement;
check('APK: data-shell = apk', apkHtml.dataset.shell === 'apk', apkHtml.dataset.shell);
check('APK: data-layout dikunci kepada phone', apkHtml.dataset.layout === 'phone', apkHtml.dataset.layout);
check('APK: tiada ralat JS', apk.errors.length === 0, apk.errors.slice(0, 1).join(''));
check('APK: bar tab atas tidak dipaparkan (dirender tetapi CSS sembunyi)',
  apk.doc.querySelectorAll('.web-nav').length === 1 && css.includes('[data-layout=phone].web-nav{display:none!important}'),
  `${apk.doc.querySelectorAll('.web-nav').length} + peraturan CSS`);
check('APK: nav bawah telefon dirender',
  apk.doc.querySelectorAll('.bottom-nav').length === 1,
  `${apk.doc.querySelectorAll('.bottom-nav').length}`);
check('APK: kawalan susun atur web disembunyikan',
  css.includes('[data-shell=apk][data-web-only=true]'),
  'peraturan CSS ada');

// ---- 2. Web: lalai auto ----
const web = await boot('djeroll91-prog.github.io');
const webHtml = web.doc.documentElement;
check('Web: data-shell = web', webHtml.dataset.shell === 'web', webHtml.dataset.shell);
check('Web: data-layout = auto', webHtml.dataset.layout === 'auto', webHtml.dataset.layout);
check('Web: tiada ralat JS', web.errors.length === 0, web.errors.slice(0, 1).join(''));
check('Web: bar tab atas dirender dalam DOM', web.doc.querySelectorAll('.web-nav').length === 1,
  `${web.doc.querySelectorAll('.web-nav').length}`);

// Tab sepadan dengan nav bawah (kesinambungan tingkah laku).
const topTabs = web.doc.querySelectorAll('.web-nav .web-tab').length;
check('Web: bar tab atas ada 6 tab', topTabs === 6, `${topTabs}`);

// Label tab diambil daripada i18n (BM).
const firstTab = web.doc.querySelector('.web-nav .web-tab')?.textContent?.trim();
check('Web: label tab pertama = Utama', firstTab === '🏠Utama', firstTab || 'tiada');

// Nama murid muncul dalam bar atas.
const who = web.doc.querySelector('.web-nav-who .nm')?.textContent?.trim();
check('Web: nama murid dalam bar atas', who === 'Aisyah', who || 'tiada');

// Tahun dipaparkan dalam bar atas.
const yr = web.doc.querySelector('.web-nav-who .yr')?.textContent?.trim();
check('Web: tahun murid dalam bar atas', yr === 'Tahun 1', yr || 'tiada');

// ---- 3. CSS web hadir dan dijaga ----
check('CSS: media query web (min-width: 1024px) ada', css.includes('min-width:1024px'));
check('CSS: peraturan web dijaga oleh :root:not([data-layout=phone])',
  css.includes(':root:not([data-layout=phone])'), 'guard ada');
check('CSS: bar tab atas melekat (position:sticky)',
  css.includes('.web-nav{display:none}') && css.includes('position:sticky'),
  'sticky ada');
check('CSS: bingkai telefon 460px dibuka pada web',
  css.includes('max-width:none') && css.includes('.app-shell.phone'), 'bingkai dibuka');
check('CSS: grid berbilang kolum untuk senarai', css.includes('repeat(auto-fill,minmax(340px,1fr))'));
check('CSS: nav bawah disembunyikan pada web', css.includes('.bottom-nav{display:none}'));
check('CSS: skrin fokus kekal satu kolum',
  css.includes('data-screen=quiz].screen-scroll>.stack'), 'kekangan ada');
check('CSS: tiada lagi bar sisi lama', !css.includes('.side-nav'), 'sidebar dibuang');

// ---- 4. Pilihan susun atur dalam profil ----
const click = (el) => {
  if (!el) return false;
  el.dispatchEvent(new web.dom.window.MouseEvent('click', { bubbles: true }));
  return true;
};
const findBtn = (label) =>
  [...web.doc.querySelectorAll('button')].find((b) => (b.textContent || '').includes(label));
click(findBtn('Profil'));
await sleep(700);
const layoutChip = web.doc.querySelector('.layout-switch');
check('Web: kawalan pilihan susun atur ada', !!layoutChip,
  layoutChip ? `${layoutChip.querySelectorAll('button').length} butang` : 'tiada');

console.log(`\n${pass}/${pass + fail} lulus\n`);
process.exit(fail === 0 ? 0 : 1);
