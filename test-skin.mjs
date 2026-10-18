/**
 * Ujian gaya bahan bingkai (skin): clay / kulit / buku latihan.
 *
 * Yang diuji:
 *   1. Lalai ialah `clay` dan `data-skin` dipasang pada <html>.
 *   2. Memilih gaya lain mengemas kini atribut dan disimpan dalam data.
 *   3. Bahan hanya menyentuh bingkai (nav, topbar, shell) — bukan permukaan
 *      kandungan. Ini jaminan kebolehbacaan: teks tidak pernah di atas tekstur.
 *   4. Data lama tanpa medan `skin` dimigrasi kepada `clay`.
 *
 * CSS tidak dinilai oleh jsdom (tiada enjin susun atur), jadi kehadiran
 * peraturan disemak pada fail CSS yang dibina, seperti test-desktop-layout.
 *
 * Jalankan: node test-skin.mjs
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

/** Data ujian. `skin` boleh ditiadakan untuk meniru data skema lama. */
const seededData = (skin) => {
  const settings = {
    sound: false, voice: false, motion: true, calm: false, contrast: false,
    dark: false, fontScale: 1,
  };
  if (skin) settings.skin = skin;
  return {
    version: 3, activeProfileId: 'p-anak', lang: 'ms', celebratedBadges: [],
    settings,
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 2, lastActiveDate: '2026-01-01', stars: 30, points: 60,
      seenTopics: [], attempts: [],
    }],
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(skin) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => {
    if (!/Could not load/.test(e.message)) errors.push('jsdomError: ' + e.message);
  });
  virtualConsole.on('error', (m) => errors.push('console.error: ' + m));

  const dom = new JSDOM(htmlForJsdom, {
    url: 'https://djeroll91-prog.github.io/index.html',
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
      window.localStorage.setItem('bijak-kssr/v1', JSON.stringify(seededData(skin)));
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

console.log('\n=== UJIAN GAYA BAHAN (skin) ===\n');

// ---- 1. Lalai: clay ----
const base = await boot(undefined);
check('Lalai: data-skin = clay (data lama tanpa medan skin)',
  base.doc.documentElement.dataset.skin === 'clay',
  base.doc.documentElement.dataset.skin || 'tiada');
check('Lalai: tiada ralat JS', base.errors.length === 0, base.errors.slice(0, 1).join(''));

// ---- 2. Pemilih gaya wujud dalam Profil ----
const click = (el) => {
  if (!el) return false;
  el.dispatchEvent(new base.dom.window.MouseEvent('click', { bubbles: true }));
  return true;
};
const findBtn = (label) =>
  [...base.doc.querySelectorAll('button')].find((b) => (b.textContent || '').includes(label));

check('Profil: butang nav "Profil" dijumpai', click(findBtn('Profil')));
await sleep(700);
const skinChip = base.doc.querySelector('.skin-switch');
check('Profil: kawalan pilihan gaya ada', !!skinChip,
  skinChip ? `${skinChip.querySelectorAll('button').length} butang` : 'tiada');

const labels = skinChip
  ? [...skinChip.querySelectorAll('button')].map((b) => b.textContent.trim())
  : [];
check('Profil: label gaya dalam BM', labels.join(',') === 'Tanah liat,Kulit,Buku latihan', labels.join(','));

// ---- 3. Memilih kulit menukar atribut dan disimpan ----
const leatherBtn = skinChip
  ? [...skinChip.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Kulit')
  : null;
click(leatherBtn);
await sleep(400);
check('Pilih "Kulit": data-skin = leather',
  base.doc.documentElement.dataset.skin === 'leather',
  base.doc.documentElement.dataset.skin || 'tiada');

const saved = JSON.parse(base.dom.window.localStorage.getItem('bijak-kssr/v1') || '{}');
check('Pilih "Kulit": disimpan dalam data', saved?.settings?.skin === 'leather',
  String(saved?.settings?.skin));

const bookBtn = skinChip
  ? [...skinChip.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Buku latihan')
  : null;
click(bookBtn);
await sleep(400);
check('Pilih "Buku latihan": data-skin = book',
  base.doc.documentElement.dataset.skin === 'book',
  base.doc.documentElement.dataset.skin || 'tiada');

// ---- 4. Bahan hanya pada bingkai, bukan permukaan kandungan ----
// Peraturan bahan mesti disasarkan kepada bingkai sahaja. Jika mana-mana
// permukaan kandungan muncul dalam senarai pemilih bahan, teks boleh berakhir
// di atas tekstur dan kebolehbacaan akan rosak.
const SKIN_SELECTOR = /\[data-skin=(leather|book)\]/g;
const skinRules = css.match(new RegExp(`[^{}]*\\[data-skin=(?:leather|book)\\][^{}]*\\{`, 'g')) || [];
const contentSelectors = [
  '.card', '.option', '.note-block', '.q-prompt', '.subject-tile',
  '.topic-item', '.game-card', '.badge-card', '.settings-row', '.keypad',
];
const leaked = [];
for (const rule of skinRules) {
  for (const sel of contentSelectors) {
    // Elak padanan palsu: .card-extra bukan .card.
    if (new RegExp(`\\${sel}(?![a-z-])`).test(rule)) leaked.push(`${sel} dalam ${rule.slice(0, 60)}`);
  }
}
check('Bahan tidak menyentuh permukaan kandungan', leaked.length === 0,
  leaked.length ? leaked.slice(0, 2).join(' | ') : `${skinRules.length} peraturan bahan disemak`);

// ---- 5. Setiap bahan memasang paletnya sendiri ----
for (const skin of ['leather', 'book']) {
  const hasPalette = new RegExp(`\\[data-skin=${skin}\\]\\{`).test(css);
  check(`CSS: palet ${skin} memasang --skin-page`, hasPalette);
}
check('CSS: kulit ada palet mod gelap',
  /\[data-skin=leather\]\[data-theme=dark\]\{/.test(css));
check('CSS: buku ada palet mod gelap',
  /\[data-skin=book\]\[data-theme=dark\]\{/.test(css));

// ---- 6. Mod tenang mematikan tekstur ----
check('CSS: mod tenang mematikan tekstur bahan',
  /\[data-calm=on\].*?background-image:none/.test(css),
  'peraturan ada');
check('CSS: token bahan dipulihkan dalam mod tenang',
  /\[data-skin=leather\]\[data-calm=on\]/.test(css) && /\[data-skin=book\]\[data-calm=on\]/.test(css));

// ---- 7. Jumlah peraturan bahan munasabah ----
check('CSS: peraturan bahan wujud', skinRules.length >= 20, `${skinRules.length} peraturan`);

console.log(`\n${pass}/${pass + fail} lulus\n`);
process.exit(fail === 0 ? 0 : 1);
