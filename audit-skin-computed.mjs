/**
 * Audit gaya bahan bingkai (skin) ke atas APL SEBENAR.
 *
 * Spesimen sintetik boleh menyimpang daripada DOM sebenar. Audit ini memuatkan
 * apl yang dibina (React + CSS sebenar) di dalam iframe seorigin, kemudian
 * membaca gaya TERKIRA setiap elemen. Ia mengesahkan tiga perkara:
 *
 *   1. Bingkai (jalur nav, topbar) benar-benar bertukar bahan.
 *   2. Permukaan kandungan (kad) TIDAK bertukar — tekstur tidak boleh berada di
 *      belakang teks, kerana itu merosakkan kebolehbacaan.
 *   3. Setiap pasangan teks/latar memenuhi WCAG AA (nisbah >= 4.5).
 *
 * Semua kombinasi diukur dalam SATU pelancaran Chromium: selepas apl dimuatkan
 * sekali, atribut data-skin/data-theme/data-calm/data-contrast ditukar terus
 * pada <html> iframe dan gaya terkira dibaca semula. Ini mengelak 13 pelancaran
 * pelayar yang sangat perlahan.
 *
 * Pelayan statik kecil dimulakan sendiri, jadi audit ini tidak bergantung pada
 * pelayan dev yang sedang berjalan.
 *
 * Jalankan: node audit-skin-computed.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
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
  '.woff2': 'font/woff2',
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('FAIL: dist/index.html tiada. Jalankan `npm run build` dahulu.');
  process.exit(1);
}

/* ---------- Data ujian: profil Tahun 1 dengan skema penuh ---------- */
const SEED = {
  version: 3,
  activeProfileId: 'p-audit',
  profiles: [
    {
      id: 'p-audit',
      name: 'Audit',
      avatar: '🦊',
      year: 1,
      createdAt: 1792314178918,
      attempts: [],
      reviews: [],
      badges: [],
      streakDays: 0,
      lastActiveDate: '2026-10-18',
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
  lang: 'ms',
  celebratedBadges: [],
};

/** Halaman tuai: suntik keadaan, muatkan apl dalam iframe, ukur semua kombinasi. */
function harness() {
  return `<!doctype html><meta charset="utf-8"><title>audit</title>
<style>html,body{margin:0;padding:0}iframe{position:fixed;top:0;left:0;width:460px;height:900px;border:0}</style>
<pre id="out">menunggu</pre>
<script>
const SEED = ${JSON.stringify(SEED)};
localStorage.setItem('bijak-kssr/v1', JSON.stringify(SEED));

/** Latar berkesan: gabungkan warna latar elemen dengan nenek moyangnya. */
function effBg(el) {
  const stack = [];
  let node = el;
  while (node && node.nodeType === 1) {
    const c = getComputedStyle(node).backgroundColor;
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (m) {
      const p = m[1].split(',').map(Number);
      const a = p.length > 3 ? p[3] : 1;
      if (a > 0) stack.push({ rgb: p.slice(0, 3), a });
      if (a >= 0.999) break;
    }
    node = node.parentElement;
  }
  let out = [255, 255, 255];
  for (let i = stack.length - 1; i >= 0; i--) {
    const { rgb, a } = stack[i];
    out = [0, 1, 2].map((k) => rgb[k] * a + out[k] * (1 - a));
  }
  return out;
}

/** Warna teks berkesan (gabung alpha ke atas latar). */
function effFg(el, bg) {
  const m = getComputedStyle(el).color.match(/rgba?\\(([^)]+)\\)/);
  const p = m ? m[1].split(',').map(Number) : [0, 0, 0];
  const a = p.length > 3 ? p[3] : 1;
  return [0, 1, 2].map((k) => p[k] * a + bg[k] * (1 - a));
}

function lum(rgb) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function pair(el) {
  if (!el) return null;
  const bg = effBg(el);
  return { fg: effFg(el, bg), bg };
}

function measure(doc) {
  const nav = doc.querySelector('.bottom-nav');
  const topbar = doc.querySelector('.topbar');
  const card = doc.querySelector('.card');
  const navItem = nav ? nav.querySelector(".nav-item:not([data-active='true'])") : null;
  const navActive = nav ? nav.querySelector(".nav-item[data-active='true']") : null;
  const cardTitle = card ? card.querySelector('h1,h2,h3,b,strong') : null;
  const cardBody = card ? card.querySelector('p,small,span') : null;
  const topTitle = topbar ? topbar.querySelector('h1') : null;
  const topSub = topbar ? topbar.querySelector('p') : null;
  return {
    dataSkin: doc.documentElement.dataset.skin || null,
    dataTheme: doc.documentElement.dataset.theme || null,
    dataCalm: doc.documentElement.dataset.calm || null,
    dataContrast: doc.documentElement.dataset.contrast || null,
    hasCard: !!card,
    hasNav: !!nav,
    nav: pair(nav),
    navItem: pair(navItem),
    navActive: pair(navActive),
    cardBg: card ? effBg(card) : null,
    cardTitle: pair(cardTitle),
    cardBody: pair(cardBody),
    topTitle: pair(topTitle),
    topSub: pair(topSub),
  };
}

const f = document.createElement('iframe');
f.src = '/';
f.addEventListener('load', () => {
  setTimeout(() => {
    const out = [];
    const doc = f.contentDocument;
    const root = doc.documentElement;
    for (const skin of ['clay', 'leather', 'book']) {
      for (const dark of ['0', '1']) {
        for (const calm of ['0', '1']) {
          for (const contrast of ['0', '1']) {
            if (contrast === '1' && (dark === '1' || calm === '1')) continue;
            root.dataset.skin = skin;
            root.dataset.theme = dark === '1' ? 'dark' : 'light';
            root.dataset.calm = calm === '1' ? 'on' : 'off';
            root.dataset.contrast = contrast === '1' ? 'high' : 'normal';
            out.push(Object.assign({ wantSkin: skin, dark, calm, contrast }, measure(doc)));
          }
        }
      }
    }
    document.getElementById('out').textContent = JSON.stringify(out);
  }, 1500);
});
document.body.appendChild(f);
</script>`;
}

/* ---------- Pelayan statik kecil ---------- */
function startServer() {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const url = (req.url || '/').split('?')[0];
      if (url === '/__audit.html') {
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

/* ---------- Jalankan Chromium sekali, ambil JSON ----------
 * Guna spawn (tak segerak), BUKAN execFileSync: pelayan statik berjalan dalam
 * proses yang sama, jadi menyekat gelung peristiwa akan menyebabkan Chromium
 * menunggu selama-lamanya dan akhirnya tamat masa.
 */
function probe(port, attempt = 1) {
  const url = `http://127.0.0.1:${port}/__audit.html`;
  return new Promise((resolve) => {
    const child = spawn(
      CHROMIUM,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--virtual-time-budget=20000',
        '--dump-dom',
        url,
      ],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
    let dom = '';
    child.stdout.on('data', (d) => (dom += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), 120000);
    child.on('close', async () => {
      clearTimeout(timer);
      const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
      const raw = m ? m[1].trim() : '';
      if (!m || raw === 'menunggu') {
        return resolve(attempt < 3 ? await probe(port, attempt + 1) : { error: 'apl tidak selesai dimuatkan' });
      }
      const text = raw
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      try {
        resolve({ rows: JSON.parse(text) });
      } catch {
        resolve(attempt < 3 ? await probe(port, attempt + 1) : { error: 'JSON tidak sah: ' + text.slice(0, 120) });
      }
    });
  });
}

/* ---------- Penilaian ---------- */
const AA = 4.5;

/** Kecerahan relatif WCAG. */
function lum(rgb) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
/** Nisbah kontras WCAG antara dua warna. */
function ratio(a, b) {
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

let pass = 0;
let fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) pass++;
  else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const srv = await startServer();
const port = srv.address().port;
console.log('=== AUDIT GAYA BAHAN (apl sebenar) ===\n');

let rows = [];
try {
  const res = await probe(port);
  if (res.error) {
    console.log('GAGAL: ' + res.error);
    process.exit(1);
  }
  rows = res.rows;
} finally {
  srv.close();
}

const at = (skin, dark, calm, contrast) =>
  rows.find(
    (r) =>
      r.wantSkin === skin &&
      r.dark === dark &&
      r.calm === calm &&
      (r.contrast || '0') === (contrast || '0'),
  );

console.log('Bahan bingkai (jalur nav) berbanding permukaan kandungan:\n');
for (const r of rows) {
  const tag = `${r.wantSkin}${r.dark === '1' ? ' gelap' : ''}${r.calm === '1' ? ' tenang' : ''}${
    r.contrast === '1' ? ' kontras' : ''
  }`;
  const nav = r.nav ? r.nav.bg.map((v) => Math.round(v)).join(',') : '-';
  const card = r.cardBg ? r.cardBg.map((v) => Math.round(v)).join(',') : '-';
  console.log(`  ${tag.padEnd(24)} nav=(${nav})  kad=(${card})`);
}
console.log('');

for (const r of rows) {
  const tag = `${r.wantSkin}${r.dark === '1' ? ' gelap' : ''}${r.calm === '1' ? ' tenang' : ''}${
    r.contrast === '1' ? ' kontras' : ''
  }`;
  check(`${tag}: data-skin dipasang`, r.dataSkin === r.wantSkin, `dapat ${r.dataSkin}`);
  check(`${tag}: apl memaparkan kad kandungan`, r.hasCard, 'kad tidak dijumpai');
  check(`${tag}: jalur nav ada`, r.hasNav, 'jalur nav tidak dijumpai');

  // Bingkai mesti bertukar bahan berbanding clay pada mod yang sama.
  if (r.wantSkin !== 'clay' && r.nav) {
    const base = at('clay', r.dark, r.calm, r.contrast);
    if (base && base.nav) {
      const d = Math.max(...[0, 1, 2].map((k) => Math.abs(base.nav.bg[k] - r.nav.bg[k])));
      check(`${tag}: bingkai bertukar bahan`, d > 12, `beza hanya ${d.toFixed(0)}`);
    }
  }

  // Permukaan kandungan mesti kekal clay (tekstur tidak di belakang teks).
  const claySame = at('clay', r.dark, '0', '0');
  if (claySame && claySame.cardBg && r.cardBg) {
    const d = Math.max(...[0, 1, 2].map((k) => Math.abs(claySame.cardBg[k] - r.cardBg[k])));
    check(`${tag}: permukaan kandungan kekal legap`, d <= 2, `menyimpang ${d.toFixed(0)}`);
  }

  // Kontras teks/latar WCAG AA.
  const pairs = [
    ['label nav', r.navItem],
    ['label nav aktif', r.navActive],
    ['tajuk kad', r.cardTitle],
    ['teks kad', r.cardBody],
    ['tajuk topbar', r.topTitle],
    ['sub topbar', r.topSub],
  ];
  for (const [label, p] of pairs) {
    if (!p) continue;
    const c = ratio(p.fg, p.bg);
    check(`${tag}: kontras ${label} >= ${AA}`, c >= AA, `nisbah ${c.toFixed(2)}`);
  }
}

console.log(`Keputusan: ${pass} lulus, ${fail} gagal (${rows.length} kombinasi)`);
if (failures.length) {
  console.log('\nKegagalan:');
  for (const f of failures) console.log('  - ' + f);
}
console.log(
  fail === 0
    ? '\nALL OK — bahan, kebolehbacaan dan WCAG AA lulus.'
    : '\nGAGAL — sila baiki kegagalan di atas.',
);
process.exit(fail === 0 ? 0 : 1);
