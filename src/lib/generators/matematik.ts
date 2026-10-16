/**
 * Penjana latihan Matematik (KSSR Semakan 2017) bagi Tahun 1 hingga Tahun 6.
 * Setiap penjana memilih nombor secara rawak supaya set soalan berbeza
 * setiap kali murid memulakan latihan.
 */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { dec, fill, fillBlank, fmt, match, mcq, numeric, trueFalse } from './shared';

/* ------------------------------------------------------------------ */
/* Tahun 1                                                             */
/* ------------------------------------------------------------------ */

function mt1NomborHingga100(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const mode = i % 4;
    const n = rng.int(11, 100);
    const tens = Math.floor(n / 10) % 10;
    const ones = n % 10;
    if (mode === 0) {
      return mcq(rng, {
        prefix: 'mt1-num',
        prompt: `Nombor apakah ini?\n${tens} puluh + ${ones} sa`,
        promptSub: 'Tulis nombornya.',
        answer: String(n),
        distractors: [String(tens * 10), String(tens * 10 + ones + 1), String(tens * 10 + ones - 1), String(n + 10)],
        explanation: `${tens} puluh ialah ${tens * 10}. Tambah ${ones} sa menjadi ${n}.`,
        emoji: '🔢',
        speak: `${tens} puluh tambah ${ones} sa, sama dengan berapa?`,
        cols: 2,
      });
    }
    if (mode === 1) {
      const bigger = n + rng.int(1, 20);
      const wantBig = rng.chance(0.5);
      const ans = wantBig ? Math.max(n, bigger) : Math.min(n, bigger);
      return mcq(rng, {
        prefix: 'mt1-num',
        prompt: `Antara ${n} dan ${bigger}, nombor manakah lebih ${wantBig ? 'besar' : 'kecil'}?`,
        answer: String(ans),
        distractors: [String(wantBig ? Math.min(n, bigger) : Math.max(n, bigger))],
        explanation: `Susun nombor dari kecil ke besar: ${Math.min(n, bigger)}, ${Math.max(n, bigger)}. Jadi ${ans} lebih ${wantBig ? 'besar' : 'kecil'}.`,
        emoji: '⚖️',
        cols: 2,
      });
    }
    if (mode === 2) {
      const after = rng.chance(0.5);
      const ans = after ? n + 1 : n - 1;
      return numeric({
        prefix: 'mt1-num',
        prompt: `Apakah nombor selepas ${n}?`.replace('selepas', after ? 'selepas' : 'sebelum'),
        answer: after ? n + 1 : n - 1,
        explanation: `${after ? 'Selepas' : 'Sebelum'} ${n} ialah ${ans}.`,
        emoji: '➡️',
        speak: `Apakah nombor ${after ? 'selepas' : 'sebelum'} ${n}?`,
      });
    }
    return fillBlank(rng, {
      prefix: 'mt1-num',
      prompt: `${n} dalam perkataan ialah ____.`,
      answer: wordMs(n),
      options: [wordMs(n + 1), wordMs(n - 1), wordMs(n + 10), wordMs(Math.max(n - 10, 1))],
      explanation: `${n} disebut "${wordMs(n)}".`,
      emoji: '🔤',
      cols: 1,
    });
  });
}

const ONES_MS = [
  'kosong',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'lapan',
  'sembilan',
];

const TEENS_MS: Record<number, string> = {
  10: 'sepuluh',
  11: 'sebelas',
  12: 'dua belas',
  13: 'tiga belas',
  14: 'empat belas',
  15: 'lima belas',
  16: 'enam belas',
  17: 'tujuh belas',
  18: 'lapan belas',
  19: 'sembilan belas',
};

const TENS_MS = [
  '',
  '',
  'dua puluh',
  'tiga puluh',
  'empat puluh',
  'lima puluh',
  'enam puluh',
  'tujuh puluh',
  'lapan puluh',
  'sembilan puluh',
];

/** Nama nombor dalam Bahasa Melayu sehingga 999 999. */
export function wordMs(n: number): string {
  if (n === 0) return 'kosong';
  if (n < 0) return `negatif ${wordMs(-n)}`;
  const parts: string[] = [];
  const ribu = Math.floor(n / 1000);
  const rest = n % 1000;
  if (ribu > 0) {
    parts.push(ribu === 1 ? 'seribu' : `${wordMs(ribu)} ribu`);
  }
  if (rest > 0) {
    const ratus = Math.floor(rest / 100);
    const bawah = rest % 100;
    if (ratus > 0) parts.push(ratus === 1 ? 'seratus' : `${ONES_MS[ratus]} ratus`);
    if (bawah >= 10 && bawah < 20) {
      parts.push(TEENS_MS[bawah]);
    } else if (bawah >= 20) {
      const puluh = Math.floor(bawah / 10);
      const sa = bawah % 10;
      parts.push(sa === 0 ? TENS_MS[puluh] : `${TENS_MS[puluh]} ${ONES_MS[sa]}`);
    } else if (bawah > 0) {
      parts.push(ONES_MS[bawah]);
    }
  }
  return parts.join(' ');
}

function mt1TambahTolak100(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const isAdd = i % 2 === 0;
    if (isAdd) {
      const a = rng.int(5, 60);
      const b = rng.int(5, 100 - a);
      const ans = a + b;
      return numeric({
        prefix: 'mt1-add',
        prompt: `${a} + ${b} = ?`,
        answer: ans,
        explanation: `${a} tambah ${b} sama dengan ${ans}.`,
        hint: 'Kira sa dahulu, kemudian puluh.',
        emoji: '➕',
        speak: `${a} tambah ${b}`,
      });
    }
    const a = rng.int(20, 100);
    const b = rng.int(5, a - 1);
    return numeric({
      prefix: 'mt1-sub',
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      explanation: `${a} tolak ${b} sama dengan ${a - b}.`,
      hint: 'Tolak sa dahulu, kemudian puluh.',
      emoji: '➖',
      speak: `${a} tolak ${b}`,
    });
  });
}

function mt1PecahanAsas(year: number, rng: Rng, count: number): Question[] {
  void year;
  const shapes: [string, string][] = [
    ['🍕', 'piza'],
    ['🍰', 'kek'],
    ['🍫', 'coklat'],
    ['🍊', 'oren'],
  ];
  return fill(count, (i) => {
    const [emoji, name] = rng.pick(shapes);
    const den = rng.pick([2, 3, 4]);
    const num = rng.int(1, den - 1);
    if (i % 2 === 0) {
      const bar = `${emoji.repeat(den)}`;
      return mcq(rng, {
        prefix: 'mt1-frac',
        prompt: `${bar}\n${num} daripada ${den} bahagian ${name} diwarnakan.\nApakah pecahannya?`,
        answer: `${num}/${den}`,
        distractors: [`${den}/${num}`, `${num}/${den + 1}`, `${num + 1}/${den}`, `1/${den}`],
        explanation: `${num} bahagian daripada ${den} bahagian sama besar ialah pecahan ${num}/${den}.`,
        emoji: '🍕',
        speak: `${num} daripada ${den} bahagian. Apakah pecahannya?`,
        cols: 2,
      });
    }
    const opts = [`${num}/${den}`, `${num}/${den - 1 > 0 ? den - 1 : den + 1}`, `${num + 1}/${den}`, `1/${den}`];
    return mcq(rng, {
      prefix: 'mt1-frac',
      prompt: `Pecahan manakah bermaksud ${num} bahagian daripada ${den} bahagian sama besar?`,
      answer: `${num}/${den}`,
      distractors: opts.filter((o) => o !== `${num}/${den}`),
      explanation: `Penyebut (${den}) ialah jumlah bahagian. Pengangka (${num}) ialah bahagian yang diambil.`,
      emoji: '🧩',
      cols: 2,
    });
  });
}

function mt1Wang(year: number, rng: Rng, count: number): Question[] {
  void year;
  const coins = [
    { v: 5, label: '5 sen' },
    { v: 10, label: '10 sen' },
    { v: 20, label: '20 sen' },
    { v: 50, label: '50 sen' },
  ];
  const notes = [
    { v: 100, label: 'RM1' },
    { v: 500, label: 'RM5' },
    { v: 1000, label: 'RM10' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const picked = rng.sample(coins, rng.int(2, 3));
      const total = picked.reduce((s, c) => s + c.v, 0);
      return numeric({
        prefix: 'mt1-money',
        prompt: `${picked.map((p) => p.label).join(' + ')} = ? sen`,
        answer: total,
        explanation: `${picked.map((p) => p.v).join(' + ')} = ${total} sen.`,
        emoji: '🪙',
        speak: `${picked.map((p) => p.label).join(' tambah ')}. Berapa sen?`,
      });
    }
    if (i % 3 === 1) {
      const picked = rng.sample(notes, rng.int(2, 3));
      const total = picked.reduce((s, c) => s + c.v, 0);
      return mcq(rng, {
        prefix: 'mt1-money',
        prompt: `${picked.map((p) => p.label).join(' + ')} = ?`,
        answer: `RM${dec(total / 100)}`,
        distractors: [
          `RM${dec(total / 100 + 1)}`,
          `RM${dec(total / 100 + 10)}`,
          `RM${dec(Math.max(total / 100 - 1, 0.5))}`,
        ],
        explanation: `${picked.map((p) => p.v).join(' + ')} = ${total} sen = RM${dec(total / 100)}.`,
        emoji: '💵',
        cols: 1,
      });
    }
    const price = rng.int(2, 9);
    const paid = price + rng.int(1, 5);
    return numeric({
      prefix: 'mt1-money',
      prompt: `Harga barang RM${price}.00. Kamu bayar RM${paid}.00.\nBerapakah baki wang?`,
      promptSub: 'Tulis jawapan dalam RM (contoh: 3)',
      answer: paid - price,
      explanation: `RM${paid} − RM${price} = RM${paid - price}.`,
      emoji: '🛒',
      speak: `Harga ${price} ringgit. Bayar ${paid} ringgit. Berapa baki?`,
    });
  });
}

function mt1MasaWaktu(year: number, rng: Rng, count: number): Question[] {
  void year;
  const days = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];
  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
  ];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const h = rng.int(1, 12);
      const m = rng.pick([0, 15, 30, 45]);
      const label = `${h}:${String(m).padStart(2, '0')}`;
      const mm = m === 0 ? "tepat" : `lebih ${m} minit`;
      return mcq(rng, {
        prefix: 'mt1-time',
        prompt: `Jam menunjukkan ${label}.\nPukul berapa?`,
        answer: `Pukul ${h} ${mm}`.trim(),
        distractors: [
          `Pukul ${h} ${m === 0 ? 'lebih 30 minit' : 'tepat'}`,
          `Pukul ${h === 12 ? 1 : h + 1} ${mm}`,
          `Pukul ${h - 1 < 1 ? 12 : h - 1} ${mm}`,
        ],
        explanation: `Jarum pendek pada ${h}, jarum panjang pada ${m} minit. Maka pukul ${h} ${mm}.`,
        emoji: '🕐',
        cols: 1,
        speak: `Jam menunjukkan ${h} ${mm}.`,
      });
    }
    if (mode === 1) {
      const idx = rng.int(0, 6);
      const after = rng.chance(0.5);
      const ans = days[(idx + (after ? 1 : 6)) % 7];
      return mcq(rng, {
        prefix: 'mt1-time',
        prompt: `Hari ini ${days[idx]}.\nApakah hari ${after ? 'esok' : 'semalam'}?`,
        answer: ans,
        distractors: days.filter((d) => d !== ans).slice(0, 3),
        explanation: `${days[idx]} ${after ? 'esok' : 'semalam'} ialah ${ans}.`,
        emoji: '📅',
        cols: 2,
      });
    }
    if (mode === 2) {
      const idx = rng.int(0, 11);
      const after = rng.chance(0.5);
      const ans = months[(idx + (after ? 1 : 11)) % 12];
      return mcq(rng, {
        prefix: 'mt1-time',
        prompt: `Bulan ${months[idx]}.\nApakah bulan ${after ? 'selepas' : 'sebelum'} itu?`,
        answer: ans,
        distractors: months.filter((m) => m !== ans).slice(0, 3),
        explanation: `${months[idx]} diikuti oleh ${months[(idx + 1) % 12]}.`,
        emoji: '🗓️',
        cols: 1,
      });
    }
    const unit = rng.pick(['hari', 'minggu', 'bulan', 'tahun']);
    const facts: Record<string, string> = {
      hari: '7 hari',
      minggu: '7 hari',
      bulan: '12 bulan',
      tahun: '12 bulan',
    };
    return trueFalse({
      prefix: 'mt1-time',
      prompt: `1 ${unit} sama dengan ${facts[unit]}.`,
      isTrue: true,
      explanation: `Betul! 1 ${unit} ialah ${facts[unit]}.`,
      emoji: '⏳',
    });
  });
}

function mt1BentukRuang(year: number, rng: Rng, count: number): Question[] {
  void year;
  const shapes2d = [
    { n: 'segi tiga', s: 3, e: '🔺' },
    { n: 'segi empat sama', s: 4, e: '🟦' },
    { n: 'segi empat tepat', s: 4, e: '▬' },
    { n: 'bulatan', s: 0, e: '⭕' },
    { n: 'pentagon', s: 5, e: '⬟' },
    { n: 'heksagon', s: 6, e: '⬢' },
  ];
  const shapes3d = [
    { n: 'kubus', e: '🧊', f: 'segi empat sama' },
    { n: 'kuboid', e: '📦', f: 'segi empat tepat' },
    { n: 'silinder', e: '🥫', f: 'bulatan' },
    { n: 'kon', e: '🍦', f: 'bulatan' },
    { n: 'sfera', e: '⚽', f: 'bulatan' },
  ];
  void shapes3d;
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const sh = rng.pick(shapes2d);
      return mcq(rng, {
        prefix: 'mt1-shape',
        prompt: `${sh.e}\nBentuk ini ialah ____.`,
        answer: sh.n,
        distractors: shapes2d.filter((s) => s.n !== sh.n).map((s) => s.n),
        explanation: `Bentuk ${sh.e} ialah ${sh.n}.`,
        emoji: '🔷',
        cols: 1,
      });
    }
    if (i % 3 === 1) {
      const sh = rng.pick(shapes2d.filter((s) => s.s > 0));
      return numeric({
        prefix: 'mt1-shape',
        prompt: `Berapakah bilangan sisi bagi ${sh.n}?`,
        answer: sh.s,
        explanation: `${sh.n} mempunyai ${sh.s} sisi.`,
        emoji: sh.e,
        speak: `Berapa sisi ${sh.n}?`,
      });
    }
    return match({
      prefix: 'mt1-shape',
      prompt: 'Padankan bentuk 3D dengan muka rata yang betul.',
      pairs: rng.sample(shapes3d, 3).map((s) => ({ left: `${s.e} ${s.n}`, right: s.f })),
      explanation: 'Setiap bentuk 3D mempunyai muka rata tertentu.',
      emoji: '🧊',
    });
  });
}

function mt1Data(year: number, rng: Rng, count: number): Question[] {
  void year;
  const fruits = [
    { n: 'Epal', e: '🍎' },
    { n: 'Pisang', e: '🍌' },
    { n: 'Oren', e: '🍊' },
    { n: 'Anggur', e: '🍇' },
    { n: 'Tembikai', e: '🍉' },
  ];
  return fill(count, (i) => {
    const picked = rng.sample(fruits, 4);
    const counts = picked.map(() => rng.int(1, 8));
    const maxIdx = counts.indexOf(Math.max(...counts));
    const minIdx = counts.indexOf(Math.min(...counts));
    const chart = picked
      .map((f, k) => `${f.e} ${f.n}: ${'🟪'.repeat(counts[k])} (${counts[k]})`)
      .join('\n');
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'mt1-data',
        prompt: `Piktograf buah kegemaran kelas 1 Bestari:\n${chart}\nBuah manakah paling banyak dipilih?`,
        answer: picked[maxIdx].n,
        distractors: picked.filter((_, k) => k !== maxIdx).map((f) => f.n),
        explanation: `${picked[maxIdx].n} mempunyai ${counts[maxIdx]} undi, paling banyak.`,
        emoji: '📊',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      return numeric({
        prefix: 'mt1-data',
        prompt: `Piktograf buah kegemaran:\n${chart}\nBerapakah jumlah undi untuk ${picked[minIdx].n}?`,
        answer: counts[minIdx],
        explanation: `${picked[minIdx].n} mendapat ${counts[minIdx]} undi.`,
        emoji: '📈',
        speak: `Berapa undi untuk ${picked[minIdx].n}?`,
      });
    }
    const total = counts.reduce((s, c) => s + c, 0);
    return numeric({
      prefix: 'mt1-data',
      prompt: `Piktograf buah kegemaran:\n${chart}\nBerapakah jumlah semua undi?`,
      answer: total,
      explanation: `${counts.join(' + ')} = ${total}.`,
      emoji: '🧮',
      speak: 'Berapa jumlah semua undi?',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 2                                                             */
/* ------------------------------------------------------------------ */

function mt2NomborHingga1000(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const n = rng.int(101, 999);
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    if (i % 4 === 0) {
      return numeric({
        prefix: 'mt2-num',
        prompt: `${h} ratus + ${t} puluh + ${o} sa = ?`,
        answer: n,
        explanation: `${h * 100} + ${t * 10} + ${o} = ${n}.`,
        emoji: '🔢',
        speak: `${h} ratus tambah ${t} puluh tambah ${o} sa.`,
      });
    }
    if (i % 4 === 1) {
      return fillBlank(rng, {
        prefix: 'mt2-num',
        prompt: `Nilai tempat bagi digit ${t} dalam ${n} ialah ____.`,
        answer: 'puluh',
        options: ['sa', 'ratus', 'ribu'],
        explanation: `Digit ${t} berada di tempat puluh, jadi nilainya ${t * 10}.`,
        emoji: '📍',
        cols: 2,
      });
    }
    if (i % 4 === 2) {
      return fillBlank(rng, {
        prefix: 'mt2-num',
        prompt: `${n} dalam perkataan ialah ____.`,
        answer: wordMs(n),
        options: [wordMs(n + 1), wordMs(n - 1), wordMs(n + 100), wordMs(n - 100)],
        explanation: `${n} disebut "${wordMs(n)}".`,
        emoji: '🔤',
        cols: 1,
      });
    }
    const rounded = rng.chance(0.5);
    const ans = rounded ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10;
    return numeric({
      prefix: 'mt2-num',
      prompt: `Bundarkan ${n} kepada ${rounded ? 'ratus' : 'puluh'} terdekat.`,
      answer: ans,
      explanation: `${n} dibundarkan kepada ${rounded ? 'ratus' : 'puluh'} terdekat menjadi ${ans}.`,
      emoji: '🎯',
      speak: `Bundarkan ${n} kepada ${rounded ? 'ratus' : 'puluh'} terdekat.`,
    });
  });
}

function mt2OperasiAsas(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const a = rng.int(100, 700);
      const b = rng.int(50, 999 - a > 50 ? 999 - a : 50);
      return numeric({
        prefix: 'mt2-op',
        prompt: `${a} + ${b} = ?`,
        answer: a + b,
        explanation: `${a} + ${b} = ${a + b}.`,
        hint: 'Susun nombor secara menegak, mula dari sa.',
        emoji: '➕',
        speak: `${a} tambah ${b}`,
      });
    }
    if (mode === 1) {
      const a = rng.int(200, 999);
      const b = rng.int(50, a - 1);
      return numeric({
        prefix: 'mt2-op',
        prompt: `${a} − ${b} = ?`,
        answer: a - b,
        explanation: `${a} − ${b} = ${a - b}.`,
        hint: 'Pinjam dari puluh atau ratus jika perlu.',
        emoji: '➖',
        speak: `${a} tolak ${b}`,
      });
    }
    if (mode === 2) {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.chance(0.5) ? rng.int(2, 5) : 0;
      const ans = c ? a * b * c : a * b;
      return numeric({
        prefix: 'mt2-op',
        prompt: c ? `${a} × ${b} × ${c} = ?` : `${a} × ${b} = ?`,
        answer: ans,
        explanation: c
          ? `${a} × ${b} = ${a * b}, kemudian ${a * b} × ${c} = ${ans}.`
          : `${a} × ${b} = ${ans}.`,
        hint: 'Darab ialah tambah berulang.',
        emoji: '✖️',
        speak: c ? `${a} darab ${b} darab ${c}` : `${a} darab ${b}`,
      });
    }
    const b = rng.int(2, 9);
    const q = rng.int(2, 12);
    const a = b * q;
    return mcq(rng, {
      prefix: 'mt2-op',
      prompt: `${a} ÷ ${b} = ?`,
      answer: String(q),
      distractors: [String(q + 1), String(q - 1), String(q + 2), String(b)],
      explanation: `${a} ÷ ${b} = ${q} kerana ${q} × ${b} = ${a}.`,
      emoji: '➗',
      cols: 2,
      speak: `${a} bahagi ${b}`,
    });
  });
}

function mt2Pecahan(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const den = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    const num = rng.int(1, den - 1);
    if (i % 3 === 0) {
      const bar = '🟪'.repeat(num) + '⬜'.repeat(den - num);
      return mcq(rng, {
        prefix: 'mt2-frac',
        prompt: `${bar}\nApakah pecahan bahagian berwarna?`,
        answer: `${num}/${den}`,
        distractors: [`${den}/${num}`, `${num}/${den + 1}`, `${num + 1}/${den}`, `1/${den}`],
        explanation: `${num} daripada ${den} bahagian sama besar = ${num}/${den}.`,
        emoji: '🧩',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      const half = den % 2 === 0 ? den / 2 : 0;
      const isHalf = half > 0 && num === half;
      return trueFalse({
        prefix: 'mt2-frac',
        prompt: `${num}/${den} ${isHalf ? 'sama dengan' : 'tidak sama dengan'} 1/2.`,
        isTrue: isHalf,
        explanation: isHalf
          ? `Betul, ${num}/${den} boleh dipermudah menjadi 1/2.`
          : `${num}/${den} bukan 1/2 kerana pengangka bukan separuh penyebut.`,
        emoji: '⚖️',
      });
    }
    const whole = rng.pick([12, 16, 20, 24, 30]);
    const part = whole / den;
    return numeric({
      prefix: 'mt2-frac',
      prompt: `${num}/${den} daripada ${whole} gula-gula = ?`,
      answer: part * num,
      explanation: `${whole} ÷ ${den} = ${part}. Kemudian ${part} × ${num} = ${part * num}.`,
      emoji: '🍬',
      speak: `${num} per ${den} daripada ${whole}.`,
    });
  });
}

function mt2Wang(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const items = rng.sample(
        [
          { n: 'Buku', p: rng.int(3, 20) },
          { n: 'Pensel', p: rng.int(1, 8) },
          { n: 'Pemadam', p: rng.int(1, 5) },
          { n: 'Pembaris', p: rng.int(2, 12) },
        ],
        2,
      );
      const total = items.reduce((s, x) => s + x.p, 0);
      return numeric({
        prefix: 'mt2-money',
        prompt: `${items.map((x) => `${x.n} RM${x.p}`).join(' + ')} = ?`,
        promptSub: 'Tulis jawapan dalam RM (contoh: 12)',
        answer: total,
        explanation: `${items.map((x) => x.p).join(' + ')} = RM${total}.`,
        emoji: '🛍️',
        speak: `${items.map((x) => `${x.n} ${x.p} ringgit`).join(' tambah ')}. Berapa jumlah?`,
      });
    }
    if (i % 3 === 1) {
      const price = rng.int(5, 40);
      const paid = rng.pick([50, 100]);
      return numeric({
        prefix: 'mt2-money',
        prompt: `Barang berharga RM${price}. Kamu bayar RM${paid}.\nBerapakah baki wang?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: paid - price,
        explanation: `RM${paid} − RM${price} = RM${paid - price}.`,
        emoji: '💰',
        speak: `Harga ${price} ringgit, bayar ${paid} ringgit. Baki?`,
      });
    }
    const sen = rng.int(5, 95);
    return mcq(rng, {
      prefix: 'mt2-money',
      prompt: `${sen} sen = ?`,
      answer: `RM${dec(sen / 100)}`,
      distractors: [`RM${dec(sen / 10)}`, `RM${dec(sen / 100 + 0.1)}`, `RM${sen}`],
      explanation: `100 sen = RM1, jadi ${sen} sen = RM${dec(sen / 100)}.`,
      emoji: '🪙',
      cols: 1,
    });
  });
}

function mt2MasaWaktu(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const h = rng.int(1, 12);
      const m = rng.pick([0, 10, 15, 20, 30, 40, 45, 50]);
      return mcq(rng, {
        prefix: 'mt2-time',
        prompt: `Jam dinding menunjukkan ${h}:${String(m).padStart(2, '0')}.\nPukul berapa?`,
        answer: m === 0 ? `Pukul ${h} tepat` : `Pukul ${h} lebih ${m} minit`,
        distractors: [
          `Pukul ${h} ${m === 0 ? 'lebih 30 minit' : 'tepat'}`,
          `Pukul ${h === 12 ? 1 : h + 1} ${m === 0 ? 'tepat' : `lebih ${m} minit`}`,
          `Pukul ${h - 1 < 1 ? 12 : h - 1} ${m === 0 ? 'tepat' : `lebih ${m} minit`}`,
        ],
        explanation: `Jarum panjang pada ${m} minit, jarum pendek pada ${h}.`,
        emoji: '🕐',
        cols: 1,
        speak: `Pukul berapa jika jam menunjukkan ${h} ${m} minit?`,
      });
    }
    if (mode === 1) {
      const h = rng.int(1, 11);
      const add = rng.pick([15, 30, 45, 60]);
      const total = h * 60 + add;
      const nh = Math.floor(total / 60) % 12 || 12;
      const nm = total % 60;
      return mcq(rng, {
        prefix: 'mt2-time',
        prompt: `Sekarang pukul ${h}:00. Tambah ${add} minit.\nPukul berapa sekarang?`,
        answer: `${nh}:${String(nm).padStart(2, '0')}`,
        distractors: [
          `${h}:${String(add).padStart(2, '0')}`,
          `${(h % 12) + 1}:${String(nm).padStart(2, '0')}`,
          `${nh}:${String((nm + 15) % 60).padStart(2, '0')}`,
        ],
        explanation: `${add} minit selepas ${h}:00 ialah ${nh}:${String(nm).padStart(2, '0')}.`,
        emoji: '⏰',
        cols: 2,
      });
    }
    if (mode === 2) {
      const mins = rng.pick([60, 120, 180]);
      return mcq(rng, {
        prefix: 'mt2-time',
        prompt: `${mins} minit = ? jam`,
        answer: `${mins / 60} jam`,
        distractors: [`${mins} jam`, `${mins / 60 + 1} jam`, `${mins / 30} jam`],
        explanation: `60 minit = 1 jam, jadi ${mins} minit = ${mins / 60} jam.`,
        emoji: '⏳',
        cols: 2,
      });
    }
    const totalDays = rng.pick([7, 14, 21, 28]);
    return numeric({
      prefix: 'mt2-time',
      prompt: `${totalDays} hari = ? minggu`,
      answer: totalDays / 7,
      explanation: `7 hari = 1 minggu, jadi ${totalDays} hari = ${totalDays / 7} minggu.`,
      emoji: '📅',
      speak: `${totalDays} hari sama dengan berapa minggu?`,
    });
  });
}

function mt2PanjangJisim(year: number, rng: Rng, count: number): Question[] {
  void year;
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const cm = rng.int(100, 900);
      return mcq(rng, {
        prefix: 'mt2-measure',
        prompt: `${cm} cm = ? m`,
        answer: `${dec(cm / 100)} m`,
        distractors: [`${cm} m`, `${dec(cm / 1000)} m`, `${dec(cm / 10)} m`],
        explanation: `100 cm = 1 m, jadi ${cm} cm = ${dec(cm / 100)} m.`,
        emoji: '📏',
        cols: 1,
      });
    }
    if (mode === 1) {
      const g = rng.int(1000, 9000);
      return mcq(rng, {
        prefix: 'mt2-measure',
        prompt: `${fmt(g)} g = ? kg`,
        answer: `${dec(g / 1000)} kg`,
        distractors: [`${g} kg`, `${dec(g / 100)} kg`, `${dec(g / 10000)} kg`],
        explanation: `1000 g = 1 kg, jadi ${fmt(g)} g = ${dec(g / 1000)} kg.`,
        emoji: '⚖️',
        cols: 1,
      });
    }
    const ml = rng.int(1, 9) * 500;
    return mcq(rng, {
      prefix: 'mt2-measure',
      prompt: `${fmt(ml)} mℓ = ? ℓ`,
      answer: `${dec(ml / 1000)} ℓ`,
      distractors: [`${ml} ℓ`, `${dec(ml / 100)} ℓ`, `${dec(ml / 10000)} ℓ`],
      explanation: `1000 mℓ = 1 ℓ, jadi ${fmt(ml)} mℓ = ${dec(ml / 1000)} ℓ.`,
      emoji: '🧴',
      cols: 1,
    });
  });
}

function mt2BentukRuang(year: number, rng: Rng, count: number): Question[] {
  void year;
  const shapes3d = [
    { n: 'kubus', e: '🧊', f: 6, s: 12, v: 8 },
    { n: 'kuboid', e: '📦', f: 6, s: 12, v: 8 },
    { n: 'silinder', e: '🥫', f: 3, s: 2, v: 0 },
    { n: 'kon', e: '🍦', f: 2, s: 1, v: 1 },
    { n: 'piramid', e: '🔺', f: 5, s: 8, v: 5 },
  ];
  return fill(count, (i) => {
    const sh = rng.pick(shapes3d);
    if (i % 3 === 0) {
      return numeric({
        prefix: 'mt2-shape',
        prompt: `${sh.e} ${sh.n} mempunyai berapa permukaan rata?`,
        answer: sh.f,
        explanation: `${sh.n} mempunyai ${sh.f} permukaan rata.`,
        emoji: '🧊',
        speak: `Berapa permukaan rata ${sh.n}?`,
      });
    }
    if (i % 3 === 1) {
      const opts = rng.sample(shapes3d, 3);
      return match({
        prefix: 'mt2-shape',
        prompt: 'Padankan bentuk 3D dengan bilangan permukaan rata.',
        pairs: opts.map((s) => ({ left: `${s.e} ${s.n}`, right: `${s.f} permukaan` })),
        explanation: 'Bilangan permukaan rata berbeza bagi setiap bentuk 3D.',
        emoji: '📦',
      });
    }
    return mcq(rng, {
      prefix: 'mt2-shape',
      prompt: `Bentuk 3D manakah yang boleh menggelongsor DAN menggelinding?`,
      answer: 'Silinder',
      distractors: ['Kubus', 'Sfera', 'Piramid'],
      explanation: 'Silinder mempunyai muka rata (boleh gelongsor) dan muka melengkung (boleh menggelinding).',
      emoji: '🥫',
      cols: 2,
    });
  });
}

function mt2Data(year: number, rng: Rng, count: number): Question[] {
  void year;
  const pets = [
    { n: 'Kucing', e: '🐱' },
    { n: 'Arnab', e: '🐰' },
    { n: 'Ikan', e: '🐟' },
    { n: 'Burung', e: '🐦' },
  ];
  return fill(count, (i) => {
    const counts = pets.map(() => rng.int(2, 10));
    const chart = pets.map((p, k) => `${p.e} ${p.n}: ${counts[k]}`).join('\n');
    const total = counts.reduce((s, c) => s + c, 0);
    if (i % 3 === 0) {
      const maxIdx = counts.indexOf(Math.max(...counts));
      return mcq(rng, {
        prefix: 'mt2-data',
        prompt: `Bilangan haiwan peliharaan:\n${chart}\nHaiwan manakah paling banyak?`,
        answer: pets[maxIdx].n,
        distractors: pets.filter((_, k) => k !== maxIdx).map((p) => p.n),
        explanation: `${pets[maxIdx].n} paling banyak dengan ${counts[maxIdx]}.`,
        emoji: '🐾',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      return numeric({
        prefix: 'mt2-data',
        prompt: `Bilangan haiwan peliharaan:\n${chart}\nBerapakah jumlah semua haiwan?`,
        answer: total,
        explanation: `${counts.join(' + ')} = ${total}.`,
        emoji: '📊',
        speak: 'Berapa jumlah semua haiwan peliharaan?',
      });
    }
    const a = rng.int(0, 3);
    let b = rng.int(0, 3);
    if (b === a) b = (b + 1) % 4;
    return numeric({
      prefix: 'mt2-data',
      prompt: `Bilangan haiwan peliharaan:\n${chart}\nBerapakah beza antara ${pets[a].n} dan ${pets[b].n}?`,
      answer: Math.abs(counts[a] - counts[b]),
      explanation: `${Math.max(counts[a], counts[b])} − ${Math.min(counts[a], counts[b])} = ${Math.abs(counts[a] - counts[b])}.`,
      emoji: '➖',
      speak: `Berapa beza antara ${pets[a].n} dan ${pets[b].n}?`,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Daftar penjana                                                      */
/* ------------------------------------------------------------------ */

export const MATEMATIK_GENERATORS: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'mt1-nombor-hingga-100': mt1NomborHingga100,
  'mt1-tambah-tolak-100': mt1TambahTolak100,
  'mt1-pecahan-asas': mt1PecahanAsas,
  'mt1-wang': mt1Wang,
  'mt1-masa-waktu': mt1MasaWaktu,
  'mt1-bentuk-ruang': mt1BentukRuang,
  'mt1-data': mt1Data,
  'mt2-nombor-hingga-1000': mt2NomborHingga1000,
  'mt2-operasi-asas': mt2OperasiAsas,
  'mt2-pecahan': mt2Pecahan,
  'mt2-wang': mt2Wang,
  'mt2-masa-waktu': mt2MasaWaktu,
  'mt2-panjang-jisim': mt2PanjangJisim,
  'mt2-bentuk-ruang': mt2BentukRuang,
  'mt2-data': mt2Data,
};
