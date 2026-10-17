/**
 * Ujian integrasi pemilih suara bacaan pada aplikasi yang dibina (dist/).
 *
 * Menjalankan aplikasi sebenar dalam jsdom dengan senarai suara tiruan yang
 * meniru laptop sebenar:
 *   1. Laptop dengan suara Melayu + Indonesia + Inggeris: suara Melayu
 *      dipilih secara automatik, dan amaran Indonesia TIDAK dipaparkan.
 *   2. Laptop tanpa suara Melayu (kes sebenar pengguna): suara Indonesia
 *      dipilih, dan amaran Indonesia dipaparkan.
 *   3. Pilihan pengguna disimpan ke localStorage dan dipakai semula selepas
 *      aplikasi dibuka semula.
 *   4. Butang "Automatik" membuang pilihan dan kembali ke pemilihan automatik.
 *   5. Laptop tanpa sebarang suara: mesej "tiada suara" dipaparkan.
 *
 * Jalankan: node test-voice-picker.mjs
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

/** Suara tiruan yang meniru peranti sebenar. */
const VOICES = {
  /** Laptop Windows/Mac biasa: tiada Melayu, ada Indonesia. */
  noMalay: [
    { voiceURI: 'Google Bahasa Indonesia', name: 'Google Bahasa Indonesia', lang: 'id-ID', localService: true },
    { voiceURI: 'Damayanti', name: 'Damayanti', lang: 'id-ID', localService: true },
    { voiceURI: 'Samantha', name: 'Samantha', lang: 'en-US', localService: true },
  ],
  /** Laptop dengan suara Melayu sistem. */
  withMalay: [
    { voiceURI: 'ms-my-x-rizwan', name: 'Microsoft Rizwan', lang: 'ms-MY', localService: true },
    { voiceURI: 'Google Bahasa Indonesia', name: 'Google Bahasa Indonesia', lang: 'id-ID', localService: true },
    { voiceURI: 'Daniel', name: 'Daniel', lang: 'en-GB', localService: true },
  ],
  /** Microsoft Edge: suara Melayu awan sahaja. */
  edge: [
    { voiceURI: 'edge-yasmin', name: 'Microsoft Yasmin Online (Natural) - Malay (Malaysia)', lang: 'ms-MY', localService: false },
    { voiceURI: 'edge-osman', name: 'Microsoft Osman Online (Natural) - Malay (Malaysia)', lang: 'ms-MY', localService: false },
    { voiceURI: 'Daniel', name: 'Daniel', lang: 'en-GB', localService: true },
  ],
  none: [],
};

function load(pathname) {
  const clean = pathname.split('?')[0].split('#')[0];
  const file = join(DIST, clean.replace(/^\//, ''));
  if (!existsSync(file)) return { body: '', contentType: 'text/plain' };
  return { body: readFileSync(file), contentType: MIME[extname(file)] || 'application/octet-stream' };
}

/** Data murid ringkas supaya skrin profil dirender. */
function seededData(extraSettings = {}) {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return {
    version: 2,
    activeProfileId: 'p-anak',
    lang: 'ms',
    celebratedBadges: [],
    settings: {
      sound: false, voice: true, motion: true, calm: false, contrast: false,
      dark: false, fontScale: 1, ...extraSettings,
    },
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 1, lastActiveDate: key, stars: 10, points: 20,
      seenTopics: [], diagnostic: null, plan: null, attempts: [],
    }],
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Buka aplikasi dengan senarai suara dan data tertentu. */
async function openApp(data, voiceList) {
  const errors = [];
  const spoken = [];
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
      // Enjin suara tiruan: merekod suara yang dipilih untuk setiap bacaan.
      const synth = {
        getVoices: () => voiceList.map((v) => ({ ...v })),
        cancel() {},
        speak(u) {
          spoken.push({ text: u.text, voice: u.voice ? u.voice.name : null, lang: u.lang });
        },
        onvoiceschanged: null,
        addEventListener() {},
        removeEventListener() {},
      };
      Object.defineProperty(window, 'speechSynthesis', { value: synth });
      // jsdom tiada pembina utterance; enjin suara memerlukannya.
      if (!window.SpeechSynthesisUtterance) {
        window.SpeechSynthesisUtterance = class {
          constructor(text) {
            this.text = text;
            this.voice = null;
            this.lang = '';
            this.rate = 1;
            this.pitch = 1;
            this.onend = null;
            this.onerror = null;
          }
        };
      }
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.HTMLMediaElement.prototype.play = () => Promise.resolve();
      if (!window.matchMedia) {
        window.matchMedia = (query) => ({
          matches: false, media: query, onchange: null,
          addListener() {}, removeListener() {},
          addEventListener() {}, removeEventListener() {},
          dispatchEvent() { return false; },
        });
      }
      window.localStorage.setItem('bijak-kssr/v1', JSON.stringify(data));
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
  const btn = (label) => buttons().find((b) => (b.textContent || '').replace(/\s+/g, ' ').includes(label));
  const gotoProfile = async () => {
    click(btn('Profil'));
    await sleep(400);
  };
  /** Baris tetapan mengikut teks tajuknya. */
  const row = (label) =>
    [...doc.querySelectorAll('.settings-row')].find((r) =>
      (r.querySelector('b')?.textContent || '').includes(label),
    );
  const stored = () => {
    const raw = dom.window.localStorage.getItem('bijak-kssr/v1');
    return raw ? JSON.parse(raw) : null;
  };

  return { dom, doc, errors, spoken, buttons, text, click, btn, row, gotoProfile, stored };
}

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

/* ------------------------------------------------------------------ */
/* 1. Ada suara Melayu: dipilih automatik, tiada amaran Indonesia      */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData(), VOICES.withMalay);
  await app.gotoProfile();

  check('Ada Melayu: baris pilih suara muncul', Boolean(app.row('Pilih Suara')), app.row('Pilih Suara')?.textContent);
  check(
    'Ada Melayu: suara Melayu ditunjuk sebagai aktif',
    /Microsoft Rizwan/.test(app.row('Pilih Suara')?.textContent || ''),
    app.row('Pilih Suara')?.textContent,
  );
  check('Ada Melayu: tiada amaran Indonesia', !/Suara Indonesia dipilih/.test(app.text()));
  check('Ada Melayu: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 2. Tiada suara Melayu: Indonesia dipilih + amaran jelas             */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData(), VOICES.noMalay);
  await app.gotoProfile();

  const active = app.row('Pilih Suara')?.textContent || '';
  check(
    'Tiada Melayu: suara Indonesia dipilih automatik',
    /Bahasa Indonesia|Damayanti/.test(active),
    active,
  );
  check('Tiada Melayu: amaran Indonesia dipaparkan', /Suara Indonesia dipilih/.test(app.text()));
  check('Tiada Melayu: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 3. Pilih suara: disimpan dan dipakai selepas dibuka semula          */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData(), VOICES.noMalay);
  await app.gotoProfile();

  app.click(app.row('Pilih Suara'));
  await sleep(350);
  check('Pemilih: helaian terbuka', /Pilih suara bacaan/.test(app.text()));

  // Pilih suara Indonesia "Damayanti" (muncul dalam tab Melayu).
  app.click(app.btn('Damayanti'));
  await sleep(350);

  const saved = app.stored()?.settings?.voiceMsUri;
  check('Pemilih: pilihan disimpan ke localStorage', saved === 'Damayanti', String(saved));
  check(
    'Pemilih: contoh suara dibaca dengan suara baharu',
    app.spoken.some((s) => s.voice === 'Damayanti'),
    JSON.stringify(app.spoken.at(-1)),
  );
  check('Pemilih: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();

  // Buka semula dengan pilihan yang telah disimpan.
  const app2 = await openApp(seededData({ voiceMsUri: 'Damayanti' }), VOICES.noMalay);
  await app2.gotoProfile();
  check(
    'Pemilih: pilihan dipakai semula selepas buka semula',
    /Damayanti/.test(app2.row('Pilih Suara')?.textContent || ''),
    app2.row('Pilih Suara')?.textContent,
  );
  app2.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 4. Butang "Automatik" membuang pilihan                              */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData({ voiceMsUri: 'Damayanti' }), VOICES.noMalay);
  await app.gotoProfile();

  app.click(app.row('Pilih Suara'));
  await sleep(350);
  app.click(app.btn('Automatik'));
  await sleep(350);

  const after = app.stored()?.settings?.voiceMsUri;
  check('Automatik: pilihan dibuang', !after, String(after));
  check('Automatik: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 5. Pilihan yang hilang dari peranti diabaikan dengan selamat        */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData({ voiceMsUri: 'suara-yang-tiada' }), VOICES.withMalay);
  await app.gotoProfile();

  check(
    'Pilihan hilang: kembali ke suara Melayu sistem',
    /Microsoft Rizwan/.test(app.row('Pilih Suara')?.textContent || ''),
    app.row('Pilih Suara')?.textContent,
  );
  check('Pilihan hilang: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 6. Tiada sebarang suara: mesej kosong, bukan senarai kosong         */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData(), VOICES.none);
  await app.gotoProfile();

  app.click(app.row('Pilih Suara'));
  await sleep(350);
  check('Tiada suara: mesej "tiada suara" dipaparkan', /Tiada suara ditemui/.test(app.text()));
  check('Tiada suara: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 7. Suara awan Edge dilabel jelas sebagai perlu internet             */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData(), VOICES.edge);
  await app.gotoProfile();

  check(
    'Edge: suara Melayu awan dipilih automatik',
    /Yasmin/.test(app.row('Pilih Suara')?.textContent || ''),
    app.row('Pilih Suara')?.textContent,
  );

  app.click(app.row('Pilih Suara'));
  await sleep(350);
  const sheet = app.doc.querySelector('.sheet')?.textContent?.replace(/\s+/g, ' ') || '';
  check('Edge: suara awan dilabel "Perlu internet"', /Perlu internet/.test(sheet), sheet.slice(0, 160));

  // Tab Inggeris: suara tempatan sepatutnya dilabel "Luar talian".
  app.click(app.btn('Bahasa Inggeris'));
  await sleep(300);
  const enSheet = app.doc.querySelector('.sheet')?.textContent?.replace(/\s+/g, ' ') || '';
  check('Edge: suara tempatan dilabel "Luar talian"', /Luar talian/.test(enSheet), enSheet.slice(0, 160));
  check('Edge: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

let failed = 0;
console.log('\n=== UJIAN PEMILIH SUARA BACAAN — jsdom ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
process.exit(failed === 0 ? 0 : 1);
