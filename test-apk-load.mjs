/**
 * Ujian integrasi: jalankan muatan web yang sebenarnya diekstrak daripada
 * dist/bijak-kssr.apk di dalam DOM sebenar (jsdom), melalui pemuat aset yang
 * meniru MainActivity.java.
 *
 * Ini menguji laluan sebenar aplikasi — bukan salinan kod — jadi ia menangkap
 * ralat muat naik, kehilangan aset, dan kerosakan JavaScript.
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const PAYLOAD = process.env.PAYLOAD_DIR || '/tmp/apk-payload';
const INDEX = join(PAYLOAD, 'index.html');

if (!existsSync(INDEX)) {
  console.error(`FAIL: muatan APK tidak dijumpai di ${PAYLOAD}`);
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
const requested = [];
const missing = [];

// Guna jsdom sebagai pelayan hos maya: setiap permintaan dipetakan ke fail
// payload, sama seperti AssetClient.shouldInterceptRequest dalam APK.
function load(pathname) {
  requested.push(pathname);
  const clean = pathname.split('?')[0].split('#')[0];
  const file = join(PAYLOAD, clean.replace(/^\//, ''));
  if (!existsSync(file)) {
    missing.push(pathname);
    return { body: '', contentType: 'text/plain', statusCode: 404 };
  }
  return {
    body: readFileSync(file),
    contentType: MIME[extname(file)] || 'application/octet-stream',
  };
}

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => {
  // Ralat muat sumber dijangka ditangkap melalui senarai `missing`.
  if (!/Could not load/.test(e.message)) errors.push('jsdomError: ' + e.message);
});
virtualConsole.on('error', (m) => errors.push('console.error: ' + m));

const html = readFileSync(INDEX, 'utf8');
// jsdom tidak melaksanakan <script type="module">, jadi jalankan bundel itu
// sendiri sebagai skrip klasik selepas DOM dibina (lihat `dom.window.eval`).
const moduleSrc = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/)?.[1];
const htmlForJsdom = html.replace(/<script[^>]*type="module"[^>]*><\/script>/, '');

const dom = new JSDOM(htmlForJsdom, {
  url: 'https://appassets.androidplatform.net/index.html',
  runScripts: 'dangerously',
  resources: {
    // jsdom tidak boleh memuat HTTPS hos maya ini; semua sumber diselesaikan
    // daripada payload supaya kita menguji fail yang benar-benar ada.
    fetch(url) {
      const u = new URL(url);
      const res = load(u.pathname);
      return Promise.resolve(Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body));
    },
  },
  virtualConsole,
  pretendToBeVisual: true,
  beforeParse(window) {
    // API pelayar yang tidak ada dalam jsdom tetapi ada dalam WebView Android.
    window.HTMLCanvasElement.prototype.getContext = () => null;
    if (!window.AudioContext) {
      window.AudioContext = class {
        state = 'running';
        createGain() {
          return { gain: { value: 0 }, connect() {} };
        }
        createOscillator() {
          return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} };
        }
        get destination() {
          return {};
        }
        resume() {
          return Promise.resolve();
        }
      };
    }
    if (!window.speechSynthesis) {
      Object.defineProperty(window, 'speechSynthesis', {
        value: { getVoices: () => [], cancel() {}, speak() {}, onvoiceschanged: null },
      });
    }
    window.HTMLElement.prototype.scrollIntoView = () => {};
  },
});

// Beri masa skrip dimuat dan React dirender.
// Jalankan bundel modul secara manual (jsdom melangkau type="module").
if (moduleSrc) {
  const bundlePath = join(PAYLOAD, moduleSrc.replace(/^\.\//, ''));
  try {
    dom.window.eval(readFileSync(bundlePath, 'utf8'));
  } catch (e) {
    errors.push('bundle: ' + e.message);
  }
}
await new Promise((r) => setTimeout(r, 2500));

const doc = dom.window.document;
const root = doc.getElementById('root');
const rootHtml = root ? root.innerHTML : '';
const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();

const report = [];
const check = (name, ok, detail = '') => {
  report.push({ name, ok, detail });
};

check('index.html dimuatkan', !!moduleSrc && existsSync(join(PAYLOAD, moduleSrc.replace(/^\.\//, ''))));
check('root React wujud', !!root);
check('React merender kandungan', rootHtml.length > 200, `${rootHtml.length} aksara`);
check('Tiada aset hilang', missing.length === 0, missing.join(', '));
check('Tiada ralat JavaScript', errors.length === 0, errors.slice(0, 3).join(' | '));

// Kandungan yang dijangka daripada aplikasi sebenar (dwibahasa BM lalai).
check('Teks Bahasa Melayu muncul', /Selamat Datang|Pilih Tahun|Utama|Subjek|Permainan|Kemajuan|Profil/.test(text));
check('Nama aplikasi muncul', /Bijak KSSR|Selamat/.test(text));
check('Ikon bintang/emoji muncul', /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(text));
check('Tiada istilah lapuk "Darjah"', !/Darjah/.test(text));

// Sahkan semua fail yang dirujuk index.html benar-benar diminta/dijumpai.
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((r) => !r.startsWith('http'));
for (const r of refs) {
  const present = existsSync(join(PAYLOAD, r.replace(/^\//, '')));
  check(`Aset wujud: ${r}`, present);
}

console.log('\n=== UJIAN MUATAN APK (jsdom) ===\n');
let failed = 0;
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
console.log(`\nCuplikan teks: ${text.slice(0, 220)}`);

dom.window.close();
process.exit(failed === 0 ? 0 : 1);
