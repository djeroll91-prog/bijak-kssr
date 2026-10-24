/**
 * Sahkan setiap "Contoh Kerja: Membundar" dalam notes-extra.ts.
 *
 * Nota boleh mengandungi kesilapan taip yang tidak akan ditangkap oleh
 * pengesah langkah soalan (kerana ia bukan soalan). Skrip ini membaca setiap
 * contoh, mengira semula pembundaran, dan membandingkan dengan jawapan yang
 * ditulis dalam nota.
 *
 * Jalankan: node verify-round-notes.mjs
 */

import { readFileSync } from 'node:fs';

const src = readFileSync('src/data/notes-extra.ts', 'utf8');

/** Nombor dalam nota ditulis dengan pemisah ruang, cth. "4 650 000". */
const toNum = (s) => Number(String(s).replace(/[\s,]/g, ''));

const PLACE = {
  puluh: 10,
  ratus: 100,
  ribu: 1000,
  'puluh ribu': 10000,
  'ratus ribu': 100000,
  juta: 1000000,
};

// Contoh berbentuk: "Bundarkan 3 750 kepada ratus terdekat. Ia terletak antara
// 3 700 dan 3 800." dan "... Jadi 3 750 ≈ 3 800." Kata "Ia" tidak wajib.
const RE_HEAD =
  /Bundarkan\s+([\d][\d\s]*?)\s+kepada\s+(puluh ribu|ratus ribu|puluh|ratus|ribu|juta)\s+terdekat\.\s*(?:Ia\s+|[\d][\d\s]*?\s+)?terletak antara\s+([\d][\d\s]*?)\s+dan\s+([\d][\d\s]*?)\./g;
const RE_ANSWER = /Jadi\s+([\d][\d\s]*?)\s*≈\s*([\d][\d\s]*?)\./g;

let checked = 0;
let bad = 0;

for (const m of src.matchAll(RE_HEAD)) {
  const n = toNum(m[1]);
  const k = PLACE[m[2]];
  const lower = toNum(m[3]);
  const upper = toNum(m[4]);

  const wantLower = Math.floor(n / k) * k;
  const wantUpper = wantLower + k;
  if (lower !== wantLower || upper !== wantUpper) {
    console.log(`GAGAL julat: ${n} kepada ${m[2]} → nota (${lower}, ${upper}), betul (${wantLower}, ${wantUpper})`);
    bad += 1;
    continue;
  }

  // Cari ayat jawapan untuk nombor yang sama.
  const tail = src.slice(m.index, m.index + 400);
  RE_ANSWER.lastIndex = 0;
  const a = RE_ANSWER.exec(tail);
  if (!a) {
    console.log(`GAGAL: tiada ayat jawapan bagi ${n}`);
    bad += 1;
    continue;
  }
  const statedN = toNum(a[1]);
  const stated = toNum(a[2]);
  if (statedN !== n) {
    console.log(`GAGAL: ayat jawapan menyebut ${statedN}, sepatutnya ${n}`);
    bad += 1;
    continue;
  }

  const decider = Math.floor(n / (k / 10)) % 10;
  const computed = decider >= 5 ? upper : lower;
  if (stated !== computed) {
    console.log(`GAGAL jawapan: ${n} kepada ${m[2]} → nota ${stated}, betul ${computed} (digit penentu ${decider})`);
    bad += 1;
    continue;
  }
  checked += 1;
  console.log(`OK  ${n} → ${m[2]} terdekat = ${computed}`);
}

console.log(`\n${checked} contoh betul, ${bad} salah`);
if (bad > 0) process.exit(1);
if (checked === 0) {
  console.log('GAGAL: tiada contoh dijumpai — semak semula corak nota.');
  process.exit(1);
}
console.log('PASS: semua contoh kerja dalam nota betul.');
