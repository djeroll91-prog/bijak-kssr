/**
 * Audit kontras warna WCAG 2.1 untuk Bijak KSSR.
 *
 * Menguji pasangan warna yang BENAR-BENAR digunakan oleh UI — teks di atas
 * latarnya — merentas semua mod (cerah, gelap, tenang, kontras tinggi).
 *
 * Peraturan penting: warna jenama/subjek dipakai dalam dua peranan serentak:
 *   1. sebagai latar penuh dengan teks --on-fill
 *   2. sebagai teks di atas permukaan cerah
 * Kedua-duanya diuji di sini supaya pertukaran warna tidak memecahkan salah
 * satu peranan.
 *
 * Jalankan: node audit-contrast.mjs
 */
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/theme.css', 'utf8');

function tokensIn(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(esc + '\\s*\\{([\\s\\S]*?)\\n\\}'));
  if (!m) throw new Error(`blok ${selector} tidak dijumpai`);
  const out = {};
  for (const t of m[1].matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})/g)) out[t[1]] = t[2];
  return out;
}

const light = tokensIn(':root');
const MODES = [
  ['cerah', light],
  ['gelap', { ...light, ...tokensIn(":root[data-theme='dark']") }],
  ['tenang', { ...light, ...tokensIn(":root[data-calm='on']") }],
  ['kontras tinggi', { ...light, ...tokensIn(":root[data-contrast='high']") }],
];

function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * [nama, var teks, var latar, ambang]
 * 4.5 = teks kecil; 3 = elemen bukan teks (gelang, sempadan, penunjuk).
 */
const PAIRS = [
  // Teks biasa
  ['teks pada permukaan', '--ink', '--surface', 4.5],
  ['teks pada latar', '--ink', '--bg', 4.5],
  ['teks lembut pada permukaan', '--ink-soft', '--surface', 4.5],
  ['teks lembut pada latar', '--ink-soft', '--bg', 4.5],
  ['teks samar pada permukaan', '--ink-faint', '--surface', 4.5],
  ['teks samar pada latar', '--ink-faint', '--bg', 4.5],
  ['teks samar pada permukaan lembut', '--ink-faint', '--surface-soft', 4.5],
  ['teks samar pada permukaan tenggelam', '--ink-faint', '--surface-sunken', 4.5],

  // Teks di atas blok berwarna
  ['teks atas jenama', '--on-fill', '--brand', 4.5],
  ['teks atas kejayaan', '--on-fill', '--success', 4.5],
  ['teks atas bahaya', '--on-fill', '--danger', 4.5],
  ['teks atas matematik', '--on-fill', '--sub-matematik', 4.5],
  ['teks atas bahasa-melayu', '--on-fill', '--sub-bahasa-melayu', 4.5],
  ['teks atas english', '--on-fill', '--sub-english', 4.5],
  ['teks atas sains', '--on-fill', '--sub-sains', 4.5],
  ['teks atas sejarah', '--on-fill', '--sub-sejarah', 4.5],

  // Cip semantik (teks berwarna atas latar -soft)
  ['cip kejayaan', '--success', '--success-soft', 4.5],
  ['cip amaran', '--warn', '--warn-soft', 4.5],
  ['cip bahaya', '--danger', '--danger-soft', 4.5],
  ['cip info', '--info', '--info-soft', 4.5],
  ['cip jenama', '--brand-deep', '--brand-soft', 4.5],

  // Warna sebagai teks / ikon atas permukaan
  ['kejayaan pada permukaan', '--success', '--surface', 4.5],
  ['kejayaan pada permukaan tenggelam', '--success', '--surface-sunken', 4.5],
  ['amaran pada permukaan', '--warn', '--surface', 4.5],
  ['bahaya pada permukaan', '--danger', '--surface', 4.5],
  ['info pada permukaan', '--info', '--surface', 4.5],
  ['aksen dalam atas permukaan', '--accent-deep', '--surface', 4.5],

  // Elemen bukan teks
  ['gelang matematik', '--sub-matematik', '--surface', 3],
  ['gelang bahasa-melayu', '--sub-bahasa-melayu', '--surface', 3],
  ['gelang english', '--sub-english', '--surface', 3],
  ['gelang sains', '--sub-sains', '--surface', 3],
  ['gelang sejarah', '--sub-sejarah', '--surface', 3],
  ['gelang jenama', '--brand', '--surface', 3],
  ['aksen sebagai penunjuk', '--accent-deep', '--surface', 3],

  // Teks gelap di atas blok aksen (kekal sama dalam semua mod)
  ['teks gelap atas aksen', '#4a3208', '--accent', 4.5],

  // Gradien hero & keputusan (nilai tetap, tidak ikut mod)
  ['hero hentian 1', '--ink-on-color', '#7464df', 4.5],
  ['hero hentian 2', '--ink-on-color', '#6c5ce7', 4.5],
  ['hero hentian 3', '--ink-on-color', '#5a48d6', 4.5],
  // Tahap logam guna dakwat gelap (warna sama seperti .btn-accent)
  ['keputusan emas 1', '#2e2410', '#ffce6a', 4.5],
  ['keputusan emas 2', '#2e2410', '#f7a83a', 4.5],
  ['keputusan emas 3', '#2e2410', '#e79a1c', 4.5],
  ['keputusan perak 1', '#2e2410', '#c3cede', 4.5],
  ['keputusan perak 2', '#2e2410', '#9aa9bf', 4.5],
  ['keputusan perak 3', '#2e2410', '#7e8ea6', 4.5],
  ['keputusan gangsa 1', '#2e2410', '#e8c1a0', 4.5],
  ['keputusan gangsa 2', '#2e2410', '#d9a878', 4.5],
  ['keputusan gangsa 3', '#2e2410', '#c08d5c', 4.5],
];

let total = 0;
const fails = [];
/** Nilai warna: token (--x) atau literal hex. */
const colourOf = (vars, ref) => (ref.startsWith('#') ? ref : vars[ref]);
for (const [modeName, vars] of MODES) {
  for (const [name, fgVar, bgVar, need] of PAIRS) {
    const fg = colourOf(vars, fgVar);
    const bg = colourOf(vars, bgVar);
    if (!fg || !bg) {
      fails.push(`[${modeName}] ${name}: token hilang (${fgVar}/${bgVar})`);
      continue;
    }
    total += 1;
    const r = ratio(fg, bg);
    if (r < need) {
      fails.push(
        `[${modeName}] ${name}: ${r.toFixed(2)}:1 (perlu ${need}:1) — ${fgVar}=${fg} pada ${bgVar}=${bg}`,
      );
    }
  }
}

console.log(`Pasangan diperiksa: ${total} (${MODES.length} mod x ${PAIRS.length} pasangan)`);
if (fails.length === 0) {
  console.log('ALL OK — semua pasangan lulus WCAG AA');
  process.exit(0);
}
console.log(`GAGAL (${fails.length}):`);
for (const f of fails) console.log(' -', f);
process.exit(1);
