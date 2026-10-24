/**
 * Ujian animasi garis nombor dalam MASA NYATA melalui Chrome DevTools Protocol.
 *
 * `--virtual-time-budget` (digunakan oleh ujian Chromium lain) mempercepat
 * pemasa supaya halaman cepat siap, tetapi ia juga memampatkan peralihan CSS.
 * Akibatnya kedudukan sebelum dan selepas kelihatan sama, jadi animasi tidak
 * dapat dibuktikan.
 *
 * Ujian ini menjalankan Chromium dengan masa sebenar dan membaca kedudukan
 * penanda melalui CDP. Ia membuktikan penanda benar-benar bergerak.
 *
 * Jalankan: node test-numline-cdp.mjs
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
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
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('FAIL: dist/index.html tiada. Jalankan `npm run build` dahulu.');
  process.exit(1);
}

const SEED = {
  version: 3,
  activeProfileId: 'p-cdp',
  profiles: [
    {
      id: 'p-cdp',
      name: 'Animasi',
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

function harness() {
  return `<!doctype html><meta charset="utf-8"><title>cdp</title>
<style>html,body{margin:0;padding:0;background:#fff}
iframe{position:fixed;top:0;left:0;width:460px;height:1000px;border:0}
#out{position:fixed;left:470px;top:0;font:12px monospace;white-space:pre-wrap;max-width:700px}</style>
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
  await sleep(1500);
  click('Subjek'); await sleep(500);
  click('Matematik'); await sleep(600);
  click('Nombor Bulat Hingga 1000');
  let tries = 0;
  while (!doc.querySelector('.numline') && tries < 80) { await sleep(100); tries++; }

  const numline = doc.querySelector('.numline');
  const marker = doc.querySelector('.numline-marker');
  const pos = () => (marker ? Math.round(marker.getBoundingClientRect().left * 10) / 10 : null);
  const at = [];

  // Rekod kedudukan setiap 120ms selama 2s (animasi 750ms).
  const t0 = performance.now();
  for (let i = 0; i < 18; i++) {
    at.push({ ms: Math.round(performance.now() - t0), left: pos(), inline: marker ? marker.style.left : null, settled: numline.getAttribute('data-settled') });
    await sleep(120);
  }

  const xs = at.map((a) => a.left).filter((x) => x !== null);
  const distinct = [...new Set(xs)];
  const result = {
    ok: true,
    settled: numline.getAttribute('data-settled'),
    motionAttr: doc.documentElement.getAttribute('data-motion'),
    calmAttr: doc.documentElement.getAttribute('data-calm'),
    samples: at,
    distinctPositions: distinct.length,
    minLeft: Math.min(...xs),
    maxLeft: Math.max(...xs),
    travelPx: Math.round((Math.max(...xs) - Math.min(...xs)) * 10) / 10,
    hasStrategy: !!doc.querySelector('.strat-card'),
  };
  document.getElementById('out').textContent = JSON.stringify(result);
  document.title = 'siap';
});
document.body.appendChild(f);
</script>`;
}

function startServer() {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const url = (req.url || '/').split('?')[0];
      if (url === '/__cdp.html') {
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

/* ---------- Klien CDP kecil ---------- */
function cdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      }
    });
    ws.addEventListener('error', reject);
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}, sessionId) {
          const mid = ++id;
          return new Promise((res, rej) => {
            pending.set(mid, { res, rej });
            ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
          });
        },
        close: () => ws.close(),
      }),
    );
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const srv = await startServer();
const port = srv.address().port;
const profile = mkdtempSync(join(tmpdir(), 'cdp-'));

console.log('=== UJIAN ANIMASI GARIS NOMBOR (masa nyata, CDP) ===\n');

const child = spawn(
  CHROMIUM,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1200,1050',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);

// Chromium menulis "DevTools listening on ws://..." ke stderr.
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  const timer = setTimeout(() => reject(new Error('CDP tamat masa')), 30000);
  child.stderr.on('data', (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) {
      clearTimeout(timer);
      resolve(m[1]);
    }
  });
  child.on('exit', () => reject(new Error('Chromium keluar awal')));
});

const client = await cdp(wsUrl);
const { targetId } = await client.send('Target.createTarget', { url: `http://127.0.0.1:${port}/__cdp.html` });
const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
await client.send('Runtime.enable', {}, sessionId);

// Poll sehingga harness selesai menulis JSON.
let result = null;
for (let i = 0; i < 100; i++) {
  await sleep(250);
  const { result: r } = await client.send(
    'Runtime.evaluate',
    { expression: "document.getElementById('out')?.textContent || ''", returnByValue: true },
    sessionId,
  );
  const txt = r?.value || '';
  if (txt && txt !== 'menunggu' && txt.startsWith('{')) {
    try {
      result = JSON.parse(txt);
      break;
    } catch {
      /* belum lengkap */
    }
  }
}

client.close();
child.kill('SIGKILL');
srv.close();

if (!result) {
  console.error('FAIL: harness tidak selesai. Jalankan semula jika mesin sibuk.');
  process.exit(1);
}

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`LULUS  ${name}${detail ? `  [${detail}]` : ''}`); }
  else { fail++; console.log(`GAGAL  ${name}${detail ? `  [${detail}]` : ''}`); }
};

check('Gerakan hidup (data-motion=on)', result.motionAttr === 'on', result.motionAttr);
check('Mod tenang mati', result.calmAttr === 'off', result.calmAttr);
check('Kad strategi dirender', result.hasStrategy);
check('Penanda berakhir pada jawapan (settled=yes)', result.settled === 'yes', result.settled);
check('Penanda melawat lebih daripada satu kedudukan', result.distinctPositions > 2, `${result.distinctPositions} kedudukan unik`);
check('Penanda bergerak sekurang-kurangnya 5px', result.travelPx >= 5, `${result.travelPx} px`);
check('Penanda bergerak ke KIRI (462 → 460)', result.maxLeft > result.minLeft, `${result.maxLeft} → ${result.minLeft}`);

console.log('\nJejak kedudukan (ms → left):');
for (const s of result.samples) console.log(`  ${String(s.ms).padStart(4)}ms  ${s.left}px  inline=${s.inline}  settled=${s.settled}`);

console.log(`\n${pass}/${pass + fail} lulus`);
if (fail) {
  console.log('GAGAL: ' + fail);
  process.exit(1);
}
console.log('PASS: animasi garis nombor benar-benar bergerak dalam Chromium.');
