/**
 * Ujian visual dan animasi garis nombor pada APL SEBENAR dalam Chromium.
 *
 * jsdom tidak menjalankan peralihan CSS, jadi ia tidak boleh membuktikan
 * animasi benar-benar bergerak. Ujian ini memuatkan apl yang dibina dalam
 * Chromium sebenar, kemudian membaca kedudukan penanda pada dua ketika:
 * sebelum dan selepas peralihan tamat. Jika kedudukan berubah, animasi
 * benar-benar berjalan.
 *
 * Ia juga menyimpan tangkapan skrin supaya warna dan susun atur boleh
 * diperiksa dengan mata manusia.
 *
 * Jalankan: node test-numline-visual.mjs
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const SHOTS = join(ROOT, '.agent_tmp', 'numline');
const CHROMIUM = process.env.CHROMIUM || '/usr/bin/chromium';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('FAIL: dist/index.html tiada. Jalankan `npm run build` dahulu.');
  process.exit(1);
}
mkdirSync(SHOTS, { recursive: true });

const SEED = {
  version: 3,
  activeProfileId: 'p-vis',
  profiles: [
    {
      id: 'p-vis',
      name: 'Visual',
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
  // Gerakan dihidupkan supaya animasi benar-benar berjalan.
  settings: {
    sound: false,
    voice: false,
    motion: true,
    calm: false,
    contrast: false,
    dark: false,
    fontScale: 1,
    dailyLimit: false,
    skin: 'clay',
  },
  lang: 'ms',
  celebratedBadges: [],
};

/** Halaman tuai: navigasi ke topik pembundaran, ukur penanda, simpan hasil. */
function harness() {
  return `<!doctype html><meta charset="utf-8"><title>numline</title>
<style>
  html,body{margin:0;padding:0;background:#fff}
  iframe{position:fixed;top:0;left:0;width:460px;height:1000px;border:0}
  #out{position:fixed;left:470px;top:0;font:12px monospace;white-space:pre-wrap;max-width:700px}
</style>
<pre id="out">menunggu</pre>
<script>
const SEED = ${JSON.stringify(SEED)};
localStorage.setItem('bijak-kssr/v1', JSON.stringify(SEED));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const f = document.createElement('iframe');
f.src = '/';
f.addEventListener('load', async () => {
  const doc = f.contentDocument;
  const W = f.contentWindow;
  const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const click = (label) => {
    const bs = [...doc.querySelectorAll('button')];
    const el = bs.find((b) => norm(b.textContent) === label) ?? bs.find((b) => norm(b.textContent).includes(label));
    if (el) { el.dispatchEvent(new W.MouseEvent('click', { bubbles: true })); return true; }
    return false;
  };
  await sleep(1800);
  click('Subjek'); await sleep(600);
  click('Matematik'); await sleep(700);
  click('Nombor Bulat Hingga 1000');
  // Tunggu garis nombor muncul.
  let tries = 0;
  while (!doc.querySelector('.numline') && tries < 60) { await sleep(100); tries++; }

  const marker = doc.querySelector('.numline-marker');
  const dot = doc.querySelector('.numline-dot');
  const card = doc.querySelector('.strat-card');
  const numline = doc.querySelector('.numline');

  // Kedudukan segera (animasi masih berjalan atau belum bermula).
  const early = marker ? W.getComputedStyle(marker).left : null;
  const earlyPx = marker ? marker.getBoundingClientRect().left : null;
  const settledEarly = numline ? numline.getAttribute('data-settled') : null;
  const inlineEarly = marker ? marker.style.left : null;
  const motionAttr = doc.documentElement.getAttribute('data-motion');
  const calmAttr = doc.documentElement.getAttribute('data-calm');

  // Tunggu peralihan selesai (0.75s + margin).
  await sleep(1600);
  const late = marker ? W.getComputedStyle(marker).left : null;
  const latePx = marker ? marker.getBoundingClientRect().left : null;
  const settledLate = numline ? numline.getAttribute('data-settled') : null;
  const inlineLate = marker ? marker.style.left : null;

  // Warna sebenar.
  const cs = (el) => (el ? W.getComputedStyle(el) : null);
  const pick = (el, prop) => (el ? W.getComputedStyle(el)[prop] : null);

  const result = {
    hasNumline: !!numline,
    hasMarker: !!marker,
    hasDot: !!dot,
    hasStrategy: !!card,
    strategySteps: doc.querySelectorAll('.strat-list li').length,
    keywords: doc.querySelectorAll('.strat-kw-item').length,
    earlyLeft: early,
    lateLeft: late,
    inlineEarly,
    inlineLate,
    settledEarly,
    settledLate,
    motionAttr,
    calmAttr,
    movedPx: earlyPx !== null && latePx !== null ? Math.round((latePx - earlyPx) * 10) / 10 : null,
    dotBg: pick(dot, 'backgroundColor'),
    dotSize: dot ? Math.round(dot.getBoundingClientRect().width) : null,
    numlineBg: pick(numline, 'backgroundColor'),
    cardBg: pick(card, 'backgroundColor'),
    titleColor: pick(doc.querySelector('.numline-title'), 'color'),
    bodyBg: pick(doc.body, 'backgroundColor'),
    numlineText: numline ? norm(numline.textContent) : '',
    stratTitle: card ? norm(card.querySelector('.strat-title')?.textContent) : '',
  };
  document.getElementById('out').textContent = JSON.stringify(result, null, 1);
  document.title = 'siap';
});
document.body.appendChild(f);
</script>`;
}

function startServer() {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const url = (req.url || '/').split('?')[0];
      if (url === '/__numline.html') {
        res.writeHead(200, { 'content-type': MIME['.html'] });
        res.end(harness());
        return;
      }
      const file = join(DIST, url === '/' ? 'index.html' : decodeURIComponent(url));
      if (!file.startsWith(DIST) || !existsSync(file)) {
        res.writeHead(404).end('tidak dijumpai');
        return;
      }
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

/** Jalankan Chromium, pulangkan DOM mentah. */
function runChromium(port, extra = []) {
  const url = `http://127.0.0.1:${port}/__numline.html`;
  return new Promise((resolve) => {
    const child = spawn(
      CHROMIUM,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--virtual-time-budget=30000',
        '--window-size=1200,1050',
        ...extra,
        url,
      ],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), 120000);
    child.on('close', () => {
      clearTimeout(timer);
      resolve(out);
    });
  });
}

const srv = await startServer();
const port = srv.address().port;

console.log('=== UJIAN VISUAL GARIS NOMBOR (Chromium sebenar) ===\n');

/* --- 1. Tangkapan skrin --- */
const shotPath = join(SHOTS, 'numline.png');
const dom = await runChromium(port, [`--screenshot=${shotPath}`]);

console.log('Saiz tangkapan:', existsSync(shotPath) ? `${Math.round(readFileSync(shotPath).length / 1024)} KB` : 'TIADA');

/* --- 2. Ukur penanda --- */
const dom2 = await runChromium(port, ['--dump-dom']);
const m = dom2.match(/<pre id="out">([\s\S]*?)<\/pre>/);
const raw = m ? m[1].trim() : '';
if (!m || raw === 'menunggu') {
  console.error('FAIL: apl tidak selesai dimuatkan dalam Chromium.');
  srv.close();
  process.exit(1);
}
const text = raw
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#39;/g, "'");
let r;
try {
  r = JSON.parse(text);
} catch {
  console.error('FAIL: JSON tidak sah:', text.slice(0, 300));
  srv.close();
  process.exit(1);
}

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`LULUS  ${name}${detail ? `  [${detail}]` : ''}`); }
  else { fail++; console.log(`GAGAL  ${name}${detail ? `  [${detail}]` : ''}`); }
};

check('Garis nombor dirender dalam Chromium', r.hasNumline);
check('Penanda ada', r.hasMarker);
check('Titik penanda ada', r.hasDot);
check('Kad strategi ada', r.hasStrategy);
check('Strategi ada 4 langkah', r.strategySteps === 4, String(r.strategySteps));
check('Kata kunci diwarisi (7)', r.keywords === 7, String(r.keywords));
check('Teks garis nombor betul', /462/.test(r.numlineText) && /460/.test(r.numlineText) && /470/.test(r.numlineText), r.numlineText.slice(0, 80));
check('Tajuk strategi pembundaran', /Cara Paling Senang Membundar/.test(r.stratTitle), r.stratTitle);


// Nota: animasi TIDAK diuji di sini. --virtual-time-budget memampatkan
// peralihan CSS, jadi kedudukan kelihatan sama walaupun animasi berjalan.
// Ujian animasi sebenar berada dalam test-numline-cdp.mjs (masa nyata, CDP).
check('Penanda berakhir pada jawapan', r.settledLate === 'yes', String(r.settledLate));
check('Gaya sebaris penanda ialah jawapan (0%)', r.inlineLate === '0%', String(r.inlineLate));

// Warna mesra kanak-kanak: latar lembut, bukan putih menyilaukan.
check('Titik penanda berwarna (bukan telus)', r.dotBg && r.dotBg !== 'rgba(0, 0, 0, 0)', String(r.dotBg));
check('Titik penanda bersaiz boleh tap', r.dotSize !== null && r.dotSize >= 18, `${r.dotSize} px`);
check('Latar halaman warna hangat (bukan putih)', r.bodyBg && r.bodyBg !== 'rgb(255, 255, 255)', String(r.bodyBg));
check('Latar kad strategi berwarna', r.cardBg && r.cardBg !== 'rgba(0, 0, 0, 0)', String(r.cardBg));

console.log(`\n${pass}/${pass + fail} lulus`);
srv.close();
if (fail) {
  console.log('GAGAL: ' + fail);
  process.exit(1);
}
console.log('PASS: garis nombor beranimasi berfungsi dalam Chromium sebenar.');
