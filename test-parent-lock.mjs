/**
 * Ujian integrasi gerbang ibu bapa (PIN) pada aplikasi yang dibina (dist/).
 *
 * Menjalankan aplikasi sebenar dalam jsdom dan menekan butang sebenar:
 *   1. Tanpa PIN: "Padam Semua Data" terus berfungsi.
 *   2. Dengan PIN: dialog PIN muncul dan data TIDAK dipadam tanpa PIN betul.
 *   3. PIN salah ditolak.
 *   4. PIN betul membenarkan padam.
 *   5. Aliran tetapkan PIN menyimpan cincangan, bukan teks biasa.
 *
 * Cincangan jangkaan dikira dengan crypto Node (rujukan bebas), bukan
 * dengan fungsi dalam aplikasi, supaya salah laksana dapat dikesan.
 *
 * Jalankan: node test-parent-lock.mjs
 */

import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
const bundle = moduleSrc
  ? readFileSync(join(DIST, moduleSrc.replace(/^\.\//, '')), 'utf8')
  : '';

const SALT = 'bijak-kssr/parent-lock/v1';
/** Cincangan rujukan bebas bagi PIN '1234'. */
const REF_HASH_1234 = createHash('sha256').update(`${SALT}:1234`, 'utf8').digest('hex');

function load(pathname) {
  const clean = pathname.split('?')[0].split('#')[0];
  const file = join(DIST, clean.replace(/^\//, ''));
  if (!existsSync(file)) return { body: '', contentType: 'text/plain' };
  return { body: readFileSync(file), contentType: MIME[extname(file)] || 'application/octet-stream' };
}

/** Data murid ringkas supaya skrin utama dirender. */
function seededData(extraSettings = {}) {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return {
    version: 2,
    activeProfileId: 'p-anak',
    lang: 'ms',
    celebratedBadges: [],
    settings: {
      sound: false, voice: false, motion: true, calm: false, contrast: false,
      dark: false, fontScale: 1, ...extraSettings,
    },
    profiles: [{
      id: 'p-anak', name: 'Aisyah', avatar: '🐼', year: 1, createdAt: Date.now(),
      badges: [], streakDays: 1, lastActiveDate: key, stars: 10, points: 20,
      seenTopics: [], diagnostic: null, plan: null,
      attempts: [{
        id: 'a1', ts: Date.now(), year: 1, subject: 'matematik',
        topicId: 'mt1-nombor-hingga-100', topicTitle: 'Nombor Bulat Hingga 100',
        correct: 3, total: 8, seconds: 60, retries: 0,
      }],
    }],
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Buka aplikasi dengan data tertentu dan pulangkan alat bantu interaksi. */
async function openApp(data) {
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
      // jsdom tiada matchMedia; skrin Profile menggunakannya untuk mod gelap.
      if (!window.matchMedia) {
        window.matchMedia = (query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
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
  /** Cari butang yang teksnya mengandungi `label`. */
  const btn = (label) => buttons().find((b) => (b.textContent || '').replace(/\s+/g, ' ').includes(label));
  /** Tekan digit pada pad PIN. */
  const pressPin = async (pin) => {
    for (const d of pin) {
      const key = [...doc.querySelectorAll('.pin-key')].find((k) => k.textContent.trim() === d);
      if (!key) return false;
      click(key);
      await sleep(60);
    }
    await sleep(320);
    return true;
  };
  const stored = () => {
    const raw = dom.window.localStorage.getItem('bijak-kssr/v1');
    return raw ? JSON.parse(raw) : null;
  };
  const gotoProfile = async () => {
    click(btn('Profil'));
    await sleep(400);
  };

  return { dom, doc, errors, buttons, text, click, btn, pressPin, stored, gotoProfile };
}

const report = [];
const check = (name, ok, detail = '') => report.push({ name, ok, detail });

/* ------------------------------------------------------------------ */
/* 1. Tanpa PIN: padam terus berfungsi (ibu bapa tidak terkunci luar)  */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData());
  await app.gotoProfile();

  check('Tanpa PIN: tetapan muncul', /Kunci Ibu Bapa/.test(app.text()));
  check('Tanpa PIN: status "belum ditetapkan"', /PIN belum ditetapkan/.test(app.text()));

  app.click(app.btn('Padam Semua Data'));
  await sleep(350);
  const sheet = app.doc.querySelector('.sheet .btn-danger');
  check('Tanpa PIN: dialog sahkan muncul', Boolean(sheet));
  app.click(sheet);
  await sleep(400);

  const after = app.stored();
  check('Tanpa PIN: data dipadam tanpa halangan', (after?.profiles?.length ?? -1) === 0, `profil=${after?.profiles?.length}`);
  check('Tanpa PIN: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 2. Dengan PIN: data dilindungi                                      */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData({ parentPinHash: REF_HASH_1234 }));
  await app.gotoProfile();

  check('Dengan PIN: status "PIN aktif"', /PIN aktif/.test(app.text()));

  app.click(app.btn('Padam Semua Data'));
  await sleep(350);
  app.click(app.doc.querySelector('.sheet .btn-danger'));
  await sleep(400);

  check('Dengan PIN: dialog PIN muncul', /Masukkan PIN/.test(app.text()));
  check('Dengan PIN: pad nombor ada', app.doc.querySelectorAll('.pin-key').length === 11,
    `${app.doc.querySelectorAll('.pin-key').length}`);

  // PIN salah tidak boleh memadam.
  await app.pressPin('9999');
  const afterWrong = app.stored();
  check('PIN salah: data TIDAK dipadam', (afterWrong?.profiles?.length ?? -1) === 1, `profil=${afterWrong?.profiles?.length}`);
  check('PIN salah: mesej ralat dipapar', /PIN salah/.test(app.text()));

  // PIN betul membenarkan padam.
  await app.pressPin('1234');
  await sleep(500);
  const afterRight = app.stored();
  check('PIN betul: data dipadam', (afterRight?.profiles?.length ?? -1) === 0, `profil=${afterRight?.profiles?.length}`);
  check('Dengan PIN: tiada ralat JS', app.errors.length === 0, app.errors.slice(0, 2).join(' | '));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 3. Tetapkan PIN: simpan cincangan, bukan teks biasa                 */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData());
  await app.gotoProfile();

  app.click(app.btn('Kunci Ibu Bapa'));
  await sleep(400);
  check('Set PIN: dialog tetapan muncul', /Tetapkan PIN Ibu Bapa/.test(app.text()));

  await app.pressPin('1234');
  check('Set PIN: minta ulangan PIN', /Ulang PIN/.test(app.text()));
  await app.pressPin('1234');
  await sleep(400);

  const hash = app.stored()?.settings?.parentPinHash;
  check('Set PIN: cincangan disimpan', typeof hash === 'string' && /^[0-9a-f]{64}$/.test(hash), String(hash).slice(0, 16));
  check('Set PIN: cincangan sepadan rujukan', hash === REF_HASH_1234);
  check('Set PIN: PIN mentah TIDAK disimpan', !JSON.stringify(app.stored()).includes('"1234"'));
  check('Set PIN: status bertukar "PIN aktif"', /PIN aktif/.test(app.text()));
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 4. PIN tidak sepadan ditolak                                        */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData());
  await app.gotoProfile();

  app.click(app.btn('Kunci Ibu Bapa'));
  await sleep(400);
  await app.pressPin('1234');
  await app.pressPin('5678');
  await sleep(400);

  check('PIN tidak sepadan: ditolak', /PIN tidak sama/.test(app.text()));
  check('PIN tidak sepadan: tiada cincangan disimpan', !app.stored()?.settings?.parentPinHash);
  app.dom.window.close();
}

/* ------------------------------------------------------------------ */
/* 5. Tukar PIN mesti melalui PIN lama                                 */
/* ------------------------------------------------------------------ */
{
  const app = await openApp(seededData({ parentPinHash: REF_HASH_1234 }));
  await app.gotoProfile();

  app.click(app.btn('Kunci Ibu Bapa'));
  await sleep(400);
  check('Tukar PIN: minta PIN lama', /Masukkan PIN/.test(app.text()));

  await app.pressPin('0000');
  await sleep(300);
  check('Tukar PIN: PIN lama salah ditolak', /PIN salah/.test(app.text()));
  check('Tukar PIN: cincangan lama kekal', app.stored()?.settings?.parentPinHash === REF_HASH_1234);
  app.dom.window.close();
}

let failed = 0;
console.log('\n=== UJIAN GERBANG IBU BAPA (PIN) — jsdom ===\n');
for (const r of report) {
  console.log(`${r.ok ? '  LULUS' : '  GAGAL'}  ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
  if (!r.ok) failed++;
}
console.log(`\n${report.length - failed}/${report.length} lulus`);
process.exit(failed === 0 ? 0 : 1);
