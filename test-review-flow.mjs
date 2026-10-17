/**
 * Ujian interaksi penuh: klik kad "Masa Ulang", jawab soalan sebenar,
 * dan sahkan sesi ulangan berselang berjalan serta kad ulangan dikemas kini.
 *
 * Ini menguji laluan pengguna sebenar dalam bundel yang dibina, bukan kod
 * yang disalin. Jalankan: node test-review-flow.mjs
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

/** Tiga topik Tahun 1 pernah gagal supaya sesi ulangan merentas topik. */
function seededData() {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const attempt = (id, topicId, title, subject, correct, total) => ({
    id, ts: Date.now() - (10 - Number(id.slice(1))) * 1000, year: 1, subject, topicId, topicTitle: title,
    correct, total, seconds: 60, retries: 0,
  });
  return {
    version: 1, activeProfileId: 'p-anak', lang: 'ms', celebratedBadges: [],
    settings: { sound: false, voice: false, motion: false, calm: false, contrast: false, dark: false, fontScale: 1 },
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 1, lastActiveDate: key, stars: 10, points: 20,
      seenTopics: ['mt1-nombor-hingga-100', 'mt1-tambah-tolak-100', 'mt1-pecahan-asas'],
      diagnostic: null, plan: null,
      attempts: [
        attempt('a1', 'mt1-nombor-hingga-100', 'Nombor Bulat Hingga 100', 'matematik', 3, 8),
        attempt('a2', 'mt1-tambah-tolak-100', 'Tambah dan Tolak Hingga 100', 'matematik', 2, 8),
        attempt('a3', 'mt1-pecahan-asas', 'Pecahan Asas', 'matematik', 4, 8),
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const doc = dom.window.document;
const text = () => (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
const buttons = () => [...doc.querySelectorAll('button')];
const clickText = (re) => {
  const b = buttons().find((x) => re.test((x.textContent || '').replace(/\s+/g, ' ')));
  if (b) b.click();
  return Boolean(b);
};

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

await sleep(2500);

// Langkah 1: klik kad "Masa Ulang".
check('Kad ulangan ada pada skrin utama', /Masa Ulang/.test(text()));
const started = clickText(/Masa Ulang/);
check('Kad ulangan boleh diklik', started);

await sleep(900);
const quizText = text();
check('Skrin latihan dibuka', doc.querySelector('.options, .numeric-display') !== null && /\/6/.test(quizText), quizText.slice(0, 100));

// Kumpul label topik sepanjang sesi: bukti latihan berselang ialah soalan
// berturutan datang daripada topik berbeza.
const seenTopics = new Set();
const collectTopic = () => {
  for (const c of doc.querySelectorAll('.chip')) {
    const m = (c.textContent || '').match(/(Nombor Bulat Hingga 100|Tambah dan Tolak Hingga 100|Pecahan Asas)/);
    if (m) seenTopics.add(m[1]);
  }
};
collectTopic();

// Langkah 2: jawab semua soalan mengikut aliran sebenar UI.
// Pilihan (mcq) dijawab dengan klik terus; soalan berangka perlu tekan
// digit, kemudian "Hantar", kemudian "Seterusnya".
let answered = 0;
for (let i = 0; i < 30; i += 1) {
  const opts = [...doc.querySelectorAll('.option')].filter((o) => !o.disabled);
  if (opts.length > 0) {
    opts[0].click();
    answered += 1;
  } else {
    const submitBtn = buttons().find((b) => /Hantar|Submit/.test(b.textContent || ''));
    const digits = buttons().filter((b) => /^\d$/.test((b.textContent || '').trim()) && !b.disabled);
    if (digits.length > 0) {
      digits[0].click();
      await sleep(120);
      const sb = buttons().find((b) => /Hantar|Submit/.test(b.textContent || ''));
      if (sb) sb.click();
      answered += 1;
    } else if (submitBtn && !submitBtn.disabled) {
      submitBtn.click();
    }
  }
  await sleep(260);
  const next = buttons().find((b) => /Seterusnya|Selesai|Next|Finish/.test(b.textContent || ''));
  if (next) next.click();
  await sleep(300);
  collectTopic();
  if (/Keputusan|Markah|Syabas|Hebat|Bagus|Cuba Lagi|Cuba lagi|Ulang/i.test(text())) break;
}

check('Soalan boleh dijawab', answered > 0, `dijawab=${answered}`);
check('Skrin keputusan dicapai', /Keputusan|Markah|Syabas|Hebat|Bagus|Cuba Lagi|Cuba lagi|Ulang/i.test(text()), text().slice(0, 140));
// Bukti latihan berselang: satu sesi menyentuh lebih daripada satu topik.
check('Sesi merentas beberapa topik (berselang)', seenTopics.size >= 2, `topik=${seenTopics.size} [${[...seenTopics].join(', ')}]`);

// Langkah 3: kad ulangan dikemas kini selepas sesi.
await sleep(500);
const parsed = JSON.parse(dom.window.localStorage.getItem('bijak-kssr/v1') || '{}');
const p = parsed.profiles?.[0];
const cards = p?.reviews ?? [];
check('Kad ulangan dikemas kini', cards.length >= 3, `${cards.length}`);
check('Sesi ulangan direkodkan', (p?.attempts?.length ?? 0) >= 4, `${p?.attempts?.length}`);
const reviewed = cards.filter((c) => c.lastReviewed && c.streak >= 0);
check('Setiap topik dijejaki berasingan', reviewed.length >= 3, `${reviewed.length}`);
check('Topik diulang dijadualkan semula', cards.every((c) => typeof c.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.dueDate)), cards.map((c) => c.dueDate).join(','));
check('Kredit guru sesi ulangan tepat', /Disediakan oleh/.test(text()) && !/Disediakan oleh\s*$/m.test(text()), text().match(/Disediakan oleh[^📚]*/)?.[0] ?? '');
check('Tiada ralat JavaScript', errors.length === 0, errors.slice(0, 3).join(' | '));
check('Tiada aset hilang', missing.length === 0, missing.slice(0, 3).join(', '));

let failed = 0;
console.log('\n=== UJIAN ALIRAN SESI ULANGAN (jsdom) ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);

dom.window.close();
process.exit(failed === 0 ? 0 : 1);
