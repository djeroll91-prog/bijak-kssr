/**
 * Penjana "Cara jawab" untuk soalan pengiraan.
 *
 * Kanak-kanak belajar paling pantas apabila melihat LANGKAH, bukan hanya
 * jawapan akhir. Modul ini menukar gesaan matematik kepada langkah kerja
 * yang konkrit, contohnya:
 *
 *   "Bundarkan 4,728 kepada ratus terdekat."
 *     1. 4,728 terletak antara 4,700 dan 4,800.
 *     2. Digit di tempat ratus ialah 7.
 *     3. Digit di sebelah kanannya (puluh) ialah 2.
 *     4. Sebab 2 kurang daripada 5, kekalkan 7 dan jadikan digit di kanan 0.
 *     5. 4,728 ≈ 4,700.
 *
 * PENGADANG KESELAMATAN
 * Setiap pengendali mengira jawapannya sendiri, kemudian membandingkan
 * dengan jawapan rasmi soalan. Langkah hanya dikembalikan jika kedua-duanya
 * SEPADAN. Jika tidak (gesaan tidak dikenali atau format berubah), fungsi
 * mengembalikan `undefined`. Aplikasi tidak akan pernah memaparkan cara
 * kerja yang salah — lebih baik tiada langkah daripada langkah salah.
 *
 * Soalan subjek English dilangkau kerana gesaannya berbahasa Inggeris;
 * langkah BM pada soalan Inggeris hanya akan mengelirukan.
 */

import type { Question, SubjectId } from '../data/types';
import { fmt } from './generators/shared';

/** Toleransi perbandingan nombor perpuluhan. */
const EPS = 1e-6;

/** Nama tempat, disusun mengikut kuasa 10: indeks 0 = sa. */
const PLACE_NAMES = ['sa', 'puluh', 'ratus', 'ribu', 'puluh ribu', 'ratus ribu', 'juta'];

/** Nama tempat bagi nilai tempat tertentu, cth. 100 → "ratus". */
function placeName(value: number): string | undefined {
  const i = Math.round(Math.log10(value));
  return Number.isInteger(i) && i >= 0 && i < PLACE_NAMES.length ? PLACE_NAMES[i] : undefined;
}

/** Nilai tempat bagi nama BM, cth. "ratus" → 100. */
const PLACE_VALUE: Record<string, number> = Object.fromEntries(
  PLACE_NAMES.map((name, i) => [name, 10 ** i]),
);

/** Tukar "4,728" atau "4 728" kepada nombor. */
function toNum(s: string): number {
  return Number(String(s).replace(/[,\s\u00a0]/g, ''));
}

/** Buang ruang dan koma untuk perbandingan teks jawapan. */
function normText(s: string): string {
  return String(s).toLowerCase().replace(/[,\s\u00a0]/g, '');
}

/** Jawapan rasmi sebagai nombor, atau null jika ia bukan angka. */
function answerNum(q: Question): number | null {
  if (typeof q.answer === 'number') return q.answer;
  if (typeof q.answer === 'string') {
    const n = toNum(q.answer);
    return Number.isFinite(n) && /^[\d.,\s\u00a0]+$/.test(q.answer) ? n : null;
  }
  return null;
}

/** Terima langkah hanya jika kiraan kita sepadan dengan jawapan rasmi. */
function guardNum(q: Question, computed: number): boolean {
  const want = answerNum(q);
  return want !== null && Math.abs(want - computed) < EPS;
}

/** Terima langkah teks hanya jika teks kita sepadan dengan jawapan rasmi. */
function guardText(q: Question, expected: string): boolean {
  return normText(expected) === normText(String(q.answer));
}

/* ------------------------------------------------------------------ */
/* Membundarkan                                                        */
/* ------------------------------------------------------------------ */

/**
 * Maklumat geometri pembundaran, untuk langkah bertulis dan animasi garis
 * nombor. Kedua-duanya berkongsi model ini supaya gambar dan ayat sentiasa
 * bercakap tentang nombor yang sama.
 */
export interface RoundingModel {
  n: number;
  k: number;
  lower: number;
  upper: number;
  digit: number;
  decider: number;
  computed: number;
  place: string;
  deciderPlace: string;
}

/** Hurai gesaan "Bundarkan X kepada Y terdekat" kepada model. */
export function roundingModel(prompt: string): RoundingModel | undefined {
  const m = prompt.match(
    /^Bundarkan\s+([\d][\d,\s\u00a0]*)\s+kepada\s+([\d][\d,\s\u00a0]*|puluh ribu|ratus ribu|puluh|ratus|ribu|juta)\s+terdekat\.?$/i,
  );
  if (!m) return undefined;

  const n = toNum(m[1]);
  const raw = m[2].trim();
  const k = /^\d/.test(raw) ? toNum(raw) : PLACE_VALUE[raw] ?? NaN;
  if (!Number.isFinite(n) || !Number.isFinite(k) || k < 10) return undefined;

  const place = placeName(k);
  const deciderPlace = placeName(k / 10);
  if (!place || !deciderPlace) return undefined;

  const lower = Math.floor(n / k) * k;
  const upper = lower + k;
  const digit = Math.floor(n / k) % 10;
  const decider = Math.floor(n / (k / 10)) % 10;
  return {
    n,
    k,
    lower,
    upper,
    digit,
    decider,
    computed: decider >= 5 ? upper : lower,
    place,
    deciderPlace,
  };
}

/**
 * Cara termudah membundar: cari dua gandaan yang mengapit nombor itu,
 * kemudian tentukan yang mana lebih dekat. Ini mengelak murid menghafal
 * peraturan tanpa faham.
 */
function roundingSteps(prompt: string, q: Question): string[] | undefined {
  const model = roundingModel(prompt);
  if (!model) return undefined;
  const { n, k, lower, upper, digit, decider, computed, place, deciderPlace } = model;
  if (!guardNum(q, computed)) return undefined;

  // Kes khas yang selalu mengelirukan murid: digit sasaran 9 dan bundar ke
  // atas. 9 menjadi 10, jadi digit itu jadi 0 dan 1 dibawa ke tempat kiri.
  const carries = decider >= 5 && digit === 9;
  const acts =
    decider >= 5
      ? carries
        ? `Sebab ${decider} ialah 5 atau lebih, tambah 1 pada ${digit}. ${digit} menjadi 10, jadi tulis 0 dan bawa 1 ke tempat ${placeName(k * 10) ?? 'kiri'}.`
        : `Sebab ${decider} ialah 5 atau lebih, tambah 1 pada ${digit} menjadi ${digit + 1}, dan jadikan digit di kanan 0.`
      : `Sebab ${decider} kurang daripada 5, kekalkan ${digit}, dan jadikan digit di kanan 0.`;

  return [
    `${fmt(n)} terletak antara ${fmt(lower)} dan ${fmt(upper)}.`,
    `Digit di tempat ${place} ialah ${digit}.`,
    `Digit di sebelah kanannya (${deciderPlace}) ialah ${decider}.`,
    acts,
    `${fmt(n)} ≈ ${fmt(computed)}.`,
  ];
}

/* ------------------------------------------------------------------ */
/* Nilai tempat                                                        */
/* ------------------------------------------------------------------ */

/** "3 ratus + 7 puluh + 2 sa = ?" → tunjuk nilai setiap tempat. */
function placeValueSteps(prompt: string, q: Question): string[] | undefined {
  const m = prompt.match(
    /^([\d]+)\s+ribu\s*\+\s*([\d]+)\s+ratus\s*\+\s*([\d]+)\s+puluh\s*\+\s*([\d]+)\s+sa\s*=\s*\?$/i,
  );
  if (m) {
    const th = Number(m[1]);
    const h = Number(m[2]);
    const t = Number(m[3]);
    const o = Number(m[4]);
    const computed = th * 1000 + h * 100 + t * 10 + o;
    if (!guardNum(q, computed)) return undefined;
    return [
      `${th} ribu = ${fmt(th * 1000)}`,
      `${h} ratus = ${fmt(h * 100)}`,
      `${t} puluh = ${fmt(t * 10)}`,
      `${o} sa = ${o}`,
      `Jumlahkan: ${fmt(th * 1000)} + ${fmt(h * 100)} + ${fmt(t * 10)} + ${o} = ${fmt(computed)}.`,
    ];
  }

  const m3 = prompt.match(/^([\d]+)\s+ratus\s*\+\s*([\d]+)\s+puluh\s*\+\s*([\d]+)\s+sa\s*=\s*\?$/i);
  if (m3) {
    const h = Number(m3[1]);
    const t = Number(m3[2]);
    const o = Number(m3[3]);
    const computed = h * 100 + t * 10 + o;
    if (!guardNum(q, computed)) return undefined;
    return [
      `${h} ratus = ${fmt(h * 100)}`,
      `${t} puluh = ${fmt(t * 10)}`,
      `${o} sa = ${o}`,
      `Jumlahkan: ${fmt(h * 100)} + ${fmt(t * 10)} + ${o} = ${fmt(computed)}.`,
    ];
  }

  const mp = prompt.match(/Nombor apakah ini\?\s*([\d]+)\s*puluh\s*\+\s*([\d]+)\s*sa/i);
  if (mp) {
    const t = Number(mp[1]);
    const o = Number(mp[2]);
    const computed = t * 10 + o;
    if (!guardNum(q, computed)) return undefined;
    return [
      `${t} puluh = ${fmt(t * 10)}`,
      `${o} sa = ${o}`,
      `Gabungkan: ${fmt(t * 10)} + ${o} = ${fmt(computed)}.`,
    ];
  }
  return undefined;
}

/**
 * "Dalam nombor 10,040, apakah nilai digit 1?" → tunjuk tempat digit itu.
 *
 * Hanya dijana apabila digit yang ditanya muncul SEKALI sahaja dalam nombor.
 * Jika digit berulang, kedudukannya tidak dapat dipastikan daripada gesaan,
 * jadi langkah dilangkau supaya tidak tersalah tempat.
 */
function digitValueSteps(prompt: string, q: Question): string[] | undefined {
  const m = prompt.match(/^Dalam nombor\s+([\d][\d,\s\u00a0]*),?\s*apakah nilai digit\s+(\d)\?$/i);
  if (!m) return undefined;
  const n = toNum(m[1]);
  const d = m[2];
  if (!Number.isFinite(n)) return undefined;
  const digits = String(Math.trunc(n));
  if (digits.split('').filter((c) => c === d).length !== 1) return undefined;
  const idx = digits.indexOf(d);
  const place = digits.length - 1 - idx;
  const name = PLACE_NAMES[place];
  if (!name) return undefined;
  const computed = Number(d) * 10 ** place;
  if (!guardNum(q, computed)) return undefined;
  return [
    `Tulis nombor itu: ${fmt(n)}.`,
    `Digit ${d} berada di tempat ${name}.`,
    `Nilainya = ${d} × ${fmt(10 ** place)} = ${fmt(computed)}.`,
  ];
}

/* ------------------------------------------------------------------ */
/* Operasi asas                                                        */
/* ------------------------------------------------------------------ */

/** Digit mengikut tempat, dari kanan. */
function digitsOf(n: number): number[] {
  const out: number[] = [];
  let x = Math.abs(Math.trunc(n));
  if (x === 0) return [0];
  while (x > 0) {
    out.push(x % 10);
    x = Math.floor(x / 10);
  }
  return out;
}

/** Langkah tambah secara menegak, termasuk kumpul semula. */
function addSteps(a: number, b: number, q: Question): string[] | undefined {
  const computed = a + b;
  if (!guardNum(q, computed)) return undefined;
  const da = digitsOf(a);
  const db = digitsOf(b);
  const width = Math.max(da.length, db.length);
  const steps: string[] = ['Susun menegak dan sejajarkan tempat sa, puluh, ratus.'];
  let carry = 0;
  for (let i = 0; i < width; i += 1) {
    const x = da[i] ?? 0;
    const y = db[i] ?? 0;
    const sum = x + y + carry;
    const pn = placeName(10 ** i) ?? `10^${i}`;
    if (i < width - 1 && sum >= 10) {
      steps.push(`${pn}: ${x} + ${y}${carry ? ` + ${carry}` : ''} = ${sum} → tulis ${sum % 10}, simpan 1.`);
      carry = 1;
    } else {
      steps.push(`${pn}: ${x} + ${y}${carry ? ` + ${carry}` : ''} = ${sum}.`);
      carry = 0;
    }
  }
  steps.push(`Jawapan: ${fmt(a)} + ${fmt(b)} = ${fmt(computed)}.`);
  return steps;
}

/** Langkah tolak secara menegak, termasuk pinjam. */
function subSteps(a: number, b: number, q: Question): string[] | undefined {
  if (b > a) return undefined;
  const computed = a - b;
  if (!guardNum(q, computed)) return undefined;
  const da = digitsOf(a);
  const db = digitsOf(b);
  const width = Math.max(da.length, db.length);
  const work = da.slice();
  const steps: string[] = ['Susun menegak dan sejajarkan tempat sa, puluh, ratus.'];
  for (let i = 0; i < width; i += 1) {
    const pn = placeName(10 ** i) ?? `10^${i}`;
    const y = db[i] ?? 0;
    let x = work[i] ?? 0;
    if (x < y) {
      let j = i + 1;
      while (j < work.length && work[j] === 0) {
        work[j] = 9;
        j += 1;
      }
      if (j >= work.length) return undefined;
      work[j] -= 1;
      x += 10;
      steps.push(`${pn}: ${x - 10} tidak cukup untuk tolak ${y} → pinjam 10 menjadi ${x}.`);
    }
    steps.push(`${pn}: ${x} − ${y} = ${x - y}.`);
    work[i] = x - y;
  }
  steps.push(`Jawapan: ${fmt(a)} − ${fmt(b)} = ${fmt(computed)}.`);
  return steps;
}

/** Langkah darab: pecahkan pengganda kepada nilai tempat. */
function mulSteps(a: number, b: number, q: Question): string[] | undefined {
  const computed = a * b;
  if (!guardNum(q, computed)) return undefined;
  const db = digitsOf(b);
  if (db.length > 1) {
    const parts: number[] = [];
    const steps: string[] = [`Pecahkan ${fmt(b)} kepada nilai tempat.`];
    for (let i = db.length - 1; i >= 0; i -= 1) {
      if (db[i] === 0) continue;
      parts.push(db[i] * 10 ** i);
    }
    for (const p of parts) steps.push(`${fmt(a)} × ${fmt(p)} = ${fmt(a * p)}`);
    steps.push(`Jumlahkan: ${parts.map((p) => fmt(a * p)).join(' + ')} = ${fmt(computed)}.`);
    return steps;
  }
  const steps: string[] = [`${fmt(a)} × ${b} bermaksud ${fmt(a)} ditambah ${b} kali.`];
  if (b <= 6) steps.push(`${Array.from({ length: b }, () => fmt(a)).join(' + ')} = ${fmt(computed)}`);
  steps.push(`Guna sifir ${b}: ${fmt(a)} × ${b} = ${fmt(computed)}.`);
  return steps;
}

/** Langkah bahagi melalui keluarga fakta (darab songsang). */
function divSteps(a: number, b: number, q: Question): string[] | undefined {
  if (b === 0) return undefined;
  const computed = a / b;
  if (!guardNum(q, computed) || !Number.isInteger(computed)) return undefined;
  return [
    `Tanya diri: ${fmt(b)} darab berapa sama dengan ${fmt(a)}?`,
    `${fmt(b)} × ${fmt(computed)} = ${fmt(a)}`,
    `Jadi ${fmt(a)} ÷ ${fmt(b)} = ${fmt(computed)}.`,
  ];
}

/** Gesaan aritmetik mudah: "a + b = ?" (termasuk pemisah ribuan). */
function arithmeticSteps(prompt: string, q: Question): string[] | undefined {
  const m = prompt.match(
    /^([\d][\d,]*(?:\.\d+)?)\s*([+\u2212\-\u00d7\u00f7*\/])\s*([\d][\d,]*(?:\.\d+)?)\s*=\s*\?$/,
  );
  if (!m) return undefined;
  const a = toNum(m[1]);
  const b = toNum(m[3]);
  const op = m[2];
  if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined;

  const isDecimal = m[1].includes('.') || m[3].includes('.');
  if (isDecimal) {
    const computed =
      op === '+'
        ? a + b
        : op === '\u2212' || op === '-'
          ? a - b
          : op === '\u00d7' || op === '*'
            ? a * b
            : a / b;
    if (!guardNum(q, computed)) return undefined;
    return [
      'Sejajarkan titik perpuluhan sebelum mula.',
      'Kira seperti nombor bulat, kemudian letak titik perpuluhan pada lajur yang sama.',
      `Jawapan: ${m[1]} ${op} ${m[3]} = ${computed}.`,
    ];
  }

  switch (op) {
    case '+':
      return addSteps(a, b, q);
    case '\u2212':
    case '-':
      return subSteps(a, b, q);
    case '\u00d7':
    case '*':
      return mulSteps(a, b, q);
    case '\u00f7':
    case '/':
      return divSteps(a, b, q);
    default:
      return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Penukaran unit                                                      */
/* ------------------------------------------------------------------ */

/** Penukaran unit tunggal: besar ke kecil (darab) dan kecil ke besar (bahagi). */
const UNIT_SIMPLE: { re: RegExp; factor: number; from: string; to: string; dir: 'x' | '/' }[] = [
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*m\s*=\s*\?\s*cm$/, factor: 100, from: 'm', to: 'cm', dir: 'x' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*km\s*=\s*\?\s*m$/, factor: 1000, from: 'km', to: 'm', dir: 'x' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*kg\s*=\s*\?\s*g$/, factor: 1000, from: 'kg', to: 'g', dir: 'x' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*\u2113\s*=\s*\?\s*m\u2113$/, factor: 1000, from: 'ℓ', to: 'mℓ', dir: 'x' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*cm\s*=\s*\?\s*mm$/, factor: 10, from: 'cm', to: 'mm', dir: 'x' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*tan\s*=\s*\?\s*kg$/, factor: 1000, from: 'tan', to: 'kg', dir: 'x' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*m\u2113\s*=\s*\?\s*\u2113$/, factor: 1000, from: 'mℓ', to: 'ℓ', dir: '/' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*g\s*=\s*\?\s*kg$/, factor: 1000, from: 'g', to: 'kg', dir: '/' },
  { re: /^([\d][\d,]*(?:\.\d+)?)\s*cm\s*=\s*\?\s*m$/, factor: 100, from: 'cm', to: 'm', dir: '/' },
];

/** Unit majmuk: "2 km 300 m = ? m" dan seumpamanya. */
const UNIT_COMPOUND: { re: RegExp; big: string; small: string; factor: number; to: 'small' | 'big' }[] = [
  { re: /^([\d]+)\s*km\s+([\d]+)\s*m\s*=\s*\?\s*m$/, big: 'km', small: 'm', factor: 1000, to: 'small' },
  { re: /^([\d]+)\s*km\s+([\d]+)\s*m\s*=\s*\?\s*km$/, big: 'km', small: 'm', factor: 1000, to: 'big' },
  { re: /^([\d]+)\s*kg\s+([\d]+)\s*g\s*=\s*\?\s*g$/, big: 'kg', small: 'g', factor: 1000, to: 'small' },
  { re: /^([\d]+)\s*kg\s+([\d]+)\s*g\s*=\s*\?\s*kg$/, big: 'kg', small: 'g', factor: 1000, to: 'big' },
  { re: /^([\d]+)\s*\u2113\s+([\d]+)\s*m\u2113\s*=\s*\?\s*m\u2113$/, big: 'ℓ', small: 'mℓ', factor: 1000, to: 'small' },
  { re: /^([\d]+)\s*tan\s+([\d]+)\s*kg\s*=\s*\?\s*kg$/, big: 'tan', small: 'kg', factor: 1000, to: 'small' },
];

function unitSteps(prompt: string, q: Question): string[] | undefined {
  for (const u of UNIT_SIMPLE) {
    const m = prompt.match(u.re);
    if (!m) continue;
    const n = toNum(m[1]);
    const computed = u.dir === 'x' ? n * u.factor : n / u.factor;
    if (!guardNum(q, computed)) return undefined;
    const act = u.dir === 'x' ? 'darab' : 'bahagi';
    return [
      `1 ${u.from} = ${fmt(u.factor)} ${u.to}.`,
      `Unit ${u.dir === 'x' ? 'besar ke kecil' : 'kecil ke besar'}: ${act}.`,
      `${m[1]} ${u.dir === 'x' ? '×' : '÷'} ${fmt(u.factor)} = ${fmt(computed)} ${u.to}.`,
    ];
  }

  for (const u of UNIT_COMPOUND) {
    const m = prompt.match(u.re);
    if (!m) continue;
    const big = Number(m[1]);
    const small = Number(m[2]);
    if (u.to === 'small') {
      const computed = big * u.factor + small;
      if (!guardNum(q, computed)) return undefined;
      return [
        `Tukar bahagian ${u.big} dahulu: ${big} ${u.big} = ${fmt(big * u.factor)} ${u.small}.`,
        `Kemudian tambah bahagian ${u.small}: ${fmt(big * u.factor)} + ${small} = ${fmt(computed)} ${u.small}.`,
      ];
    }
    const computed = big + small / u.factor;
    if (!guardNum(q, computed)) return undefined;
    return [
      `Bahagian ${u.big} kekal: ${big} ${u.big}.`,
      `Tukar bahagian ${u.small}: ${small} ${u.small} = ${small / u.factor} ${u.big}.`,
      `Gabungkan: ${big} + ${small / u.factor} = ${computed} ${u.big}.`,
    ];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Masa                                                                */
/* ------------------------------------------------------------------ */

/** Penukaran masa: "3 dekad = ? tahun", "180 minit = ? jam". */
const TIME_SIMPLE: { re: RegExp; factor: number; from: string; to: string; dir: 'x' | '/' }[] = [
  { re: /^([\d]+)\s*dekad\s*=\s*\?\s*tahun$/i, factor: 10, from: 'dekad', to: 'tahun', dir: 'x' },
  { re: /^([\d]+)\s*abad\s*=\s*\?\s*tahun$/i, factor: 100, from: 'abad', to: 'tahun', dir: 'x' },
  { re: /^([\d]+)\s*minggu\s*=\s*\?\s*hari$/i, factor: 7, from: 'minggu', to: 'hari', dir: 'x' },
  { re: /^([\d]+)\s*hari\s*=\s*\?\s*minggu$/i, factor: 7, from: 'hari', to: 'minggu', dir: '/' },
  { re: /^([\d]+)\s*minit\s*=\s*\?\s*jam$/i, factor: 60, from: 'minit', to: 'jam', dir: '/' },
];

function timeSteps(prompt: string, q: Question): string[] | undefined {
  for (const u of TIME_SIMPLE) {
    const m = prompt.match(u.re);
    if (!m) continue;
    const n = toNum(m[1]);
    const computed = u.dir === 'x' ? n * u.factor : n / u.factor;
    // Jawapan boleh berupa nombor ("90") atau teks ("3 jam").
    const withUnit = !['tahun', 'hari', 'minggu'].includes(u.to);
    if (!guardNum(q, computed) && !guardText(q, `${computed}${withUnit ? ` ${u.to}` : ''}`)) return undefined;
    const act = u.dir === 'x' ? 'darab' : 'bahagi';
    return [
      `1 ${u.from} = ${u.factor} ${u.to}.`,
      `Unit ${u.dir === 'x' ? 'besar ke kecil' : 'kecil ke besar'}: ${act}.`,
      `${n} ${u.dir === 'x' ? '×' : '÷'} ${u.factor} = ${computed}${withUnit ? ` ${u.to}` : ''}.`,
    ];
  }

  const mc = prompt.match(/^([\d]+)\s*hari\s*=\s*\?\s*minggu\s*\?\s*hari$/i);
  if (mc) {
    const n = Number(mc[1]);
    const w = Math.floor(n / 7);
    const d = n % 7;
    if (!guardText(q, `${w} minggu ${d} hari`)) return undefined;
    return [
      `1 minggu = 7 hari. Bahagi ${n} dengan 7.`,
      `${n} ÷ 7 = ${w} minggu baki ${d} hari.`,
      `Jawapan: ${w} minggu ${d} hari.`,
    ];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Wang                                                                */
/* ------------------------------------------------------------------ */

/** "9 sen = ?" → RM0.09, dan "5 sen + 50 sen + 10 sen = ? sen". */
function moneySteps(prompt: string, q: Question): string[] | undefined {
  const single = prompt.match(/^([\d]+)\s*sen\s*=\s*\?$/i);
  if (single) {
    const n = Number(single[1]);
    const rm = (n / 100).toFixed(2);
    if (!guardText(q, `RM${rm}`)) return undefined;
    return ['100 sen = RM1.00.', `${n} sen ÷ 100 = RM${rm}.`];
  }

  const sum = prompt.match(/^((?:[\d]+\s*sen\s*\+?\s*)+)=\s*\?\s*sen$/i);
  if (sum) {
    const parts = [...sum[1].matchAll(/([\d]+)\s*sen/g)].map((x) => Number(x[1]));
    const computed = parts.reduce((acc, v) => acc + v, 0);
    if (!guardNum(q, computed)) return undefined;
    return [`Tambah semua nilai sen: ${parts.join(' + ')}.`, `${parts.join(' + ')} = ${fmt(computed)} sen.`];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Pecahan dan peratus                                                 */
/* ------------------------------------------------------------------ */

/** "3/4 daripada 16 = ?" dan "75% daripada 40 = ?". */
function fractionSteps(prompt: string, q: Question): string[] | undefined {
  const mf = prompt.match(/^([\d]+)\/([\d]+)\s+daripada\s+([\d]+)\s*=\s*\?$/);
  if (mf) {
    const a = Number(mf[1]);
    const b = Number(mf[2]);
    const whole = Number(mf[3]);
    const computed = (a / b) * whole;
    if (!guardNum(q, computed)) return undefined;
    const steps = [`Bahagi dahulu: ${whole} ÷ ${b} = ${fmt(whole / b)}.`];
    if (a !== 1) steps.push(`Kemudian darab ${a}: ${fmt(whole / b)} × ${a} = ${fmt(computed)}.`);
    steps.push(`Jawapan: ${a}/${b} daripada ${whole} = ${fmt(computed)}.`);
    return steps;
  }

  const mp = prompt.match(/^([\d]+)%\s+daripada\s+([\d]+)\s*=\s*\?$/);
  if (mp) {
    const pct = Number(mp[1]);
    const whole = Number(mp[2]);
    const computed = (pct / 100) * whole;
    if (!guardNum(q, computed)) return undefined;
    return [
      `Peratus bermaksud "per seratus": ${pct}% = ${pct}/100.`,
      `Kira ${whole} ÷ 100 = ${fmt(whole / 100)}, kemudian × ${pct}.`,
      `${fmt(whole / 100)} × ${pct} = ${fmt(computed)}.`,
    ];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Bentuk dan ruang                                                    */
/* ------------------------------------------------------------------ */

/** Luas dan perimeter segi empat tepat serta luas segi tiga. */
function geometrySteps(prompt: string, q: Question): string[] | undefined {
  const rect = prompt.match(
    /berukuran\s+([\d]+)\s*cm\s*\u00d7\s*([\d]+)\s*cm\.?\s*Berapakah\s+(luas|perimeter)/i,
  );
  if (rect) {
    const w = Number(rect[1]);
    const h = Number(rect[2]);
    const wantArea = rect[3].toLowerCase() === 'luas';
    const computed = wantArea ? w * h : 2 * (w + h);
    if (!guardNum(q, computed)) return undefined;
    if (wantArea) {
      return ['Luas segi empat tepat = panjang × lebar.', `${w} × ${h} = ${fmt(computed)} cm².`];
    }
    return [
      'Perimeter = jumlah semua sisi.',
      `${w} + ${h} + ${w} + ${h} = ${fmt(computed)} cm.`,
      `Atau 2 × (${w} + ${h}) = ${fmt(computed)} cm.`,
    ];
  }

  const tri = prompt.match(/Segi tiga bertapak\s+([\d]+)\s*cm\s+dan tinggi\s+([\d]+)\s*cm/i);
  if (tri) {
    const b = Number(tri[1]);
    const h = Number(tri[2]);
    const computed = 0.5 * b * h;
    if (!guardNum(q, computed)) return undefined;
    return [
      'Luas segi tiga = ½ × tapak × tinggi.',
      `½ × ${b} × ${h}`,
      `= ${fmt(b * h)} ÷ 2 = ${fmt(computed)} cm².`,
    ];
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Titik masuk                                                         */
/* ------------------------------------------------------------------ */

/**
 * Jana langkah "cara jawab" bagi satu soalan, atau `undefined`.
 *
 * Langkah sedia ada pada soalan (ditetapkan penjana) sentiasa diutamakan
 * kerana penjana tahu konteksnya dengan lebih tepat.
 */
export function deriveSteps(
  q: Question,
  opts: { subject: SubjectId; year: number },
): string[] | undefined {
  if (q.steps && q.steps.length > 0) return q.steps;
  // Soalan Inggeris tidak boleh menerima langkah BM.
  if (opts.subject === 'english') return undefined;
  if (q.kind !== 'numeric' && q.kind !== 'shorttext' && q.kind !== 'mcq') return undefined;

  // Gesaan berbilang baris (soalan cerita) digabung menjadi satu baris.
  const prompt = q.prompt.replace(/\s*\n\s*/g, ' ').trim();

  return (
    roundingSteps(prompt, q) ??
    digitValueSteps(prompt, q) ??
    placeValueSteps(prompt, q) ??
    unitSteps(prompt, q) ??
    timeSteps(prompt, q) ??
    moneySteps(prompt, q) ??
    fractionSteps(prompt, q) ??
    geometrySteps(prompt, q) ??
    arithmeticSteps(prompt, q)
  );
}
