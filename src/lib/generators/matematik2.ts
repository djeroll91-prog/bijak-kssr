/** Penjana latihan Matematik — Tahun 3 dan Tahun 4. */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { dec, fill, fillBlank, fmt, mcq, numeric, trueFalse } from './shared';
import { wordMs } from './matematik';

/* ------------------------------------------------------------------ */
/* Tahun 3                                                             */
/* ------------------------------------------------------------------ */

function mt3NomborHingga10000(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const n = rng.int(1001, 9999);
    const th = Math.floor(n / 1000);
    const h = Math.floor((n % 1000) / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    if (i % 4 === 0) {
      const fmted = `${th} ribu + ${h} ratus + ${t} puluh + ${o} sa`;
      return numeric({
        prefix: 'mt3-num',
        prompt: `${fmted} = ?`,
        answer: n,
        explanation: `${fmted} = ${fmt(n)}.`,
        emoji: '🔢',
        speak: `${th} ribu tambah ${h} ratus tambah ${t} puluh tambah ${o} sa.`,
      });
    }
    if (i % 4 === 1) {
      const digits = String(n).split('');
      const posIdx = rng.int(0, 3);
      const labels = ['ribu', 'ratus', 'puluh', 'sa'];
      const dv = Number(digits[posIdx]);
      const vals: Record<string, number> = { ribu: 1000, ratus: 100, puluh: 10, sa: 1 };
      return mcq(rng, {
        prefix: 'mt3-num',
        prompt: `Dalam nombor ${fmt(n)}, apakah nilai digit ${dv}?`,
        answer: fmt(dv * vals[labels[posIdx]]),
        distractors: [fmt(dv * vals[labels[posIdx]] * 10), fmt(dv), fmt(dv * vals[labels[posIdx]] / 10 || 1)],
        explanation: `Digit ${dv} berada di tempat ${labels[posIdx]}, jadi nilainya ${fmt(dv * vals[labels[posIdx]])}.`,
        emoji: '📍',
        cols: 1,
      });
    }
    if (i % 4 === 2) {
      const roundHundred = rng.chance(0.5);
      const ans = roundHundred ? Math.round(n / 100) * 100 : Math.round(n / 1000) * 1000;
      return numeric({
        prefix: 'mt3-num',
        prompt: `Bundarkan ${fmt(n)} kepada ${roundHundred ? 'ratus' : 'ribu'} terdekat.`,
        answer: ans,
        explanation: `${fmt(n)} dibundarkan menjadi ${fmt(ans)}.`,
        emoji: '🎯',
        speak: `Bundarkan ${n} kepada ${roundHundred ? 'ratus' : 'ribu'} terdekat.`,
      });
    }
    return fillBlank(rng, {
      prefix: 'mt3-num',
      prompt: `${fmt(n)} dalam perkataan ialah ____.`,
      answer: wordMs(n),
      options: [wordMs(n + 1000), wordMs(n - 1000), wordMs(n + 100), wordMs(n - 100)],
      explanation: `${fmt(n)} disebut "${wordMs(n)}".`,
      emoji: '🔤',
      cols: 1,
    });
  });
}

function mt3OperasiAsas(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const a = rng.int(1000, 6000);
      const b = rng.int(500, Math.max(10000 - a, 600));
      return numeric({
        prefix: 'mt3-op',
        prompt: `${fmt(a)} + ${fmt(b)} = ?`,
        answer: a + b,
        explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`,
        hint: 'Guna bentuk lazim (susun menegak).',
        emoji: '➕',
        speak: `${a} tambah ${b}`,
      });
    }
    if (mode === 1) {
      const a = rng.int(3000, 10000);
      const b = rng.int(500, a - 100);
      return numeric({
        prefix: 'mt3-op',
        prompt: `${fmt(a)} − ${fmt(b)} = ?`,
        answer: a - b,
        explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`,
        emoji: '➖',
        speak: `${a} tolak ${b}`,
      });
    }
    if (mode === 2) {
      const a = rng.int(12, 99);
      const b = rng.int(3, 9);
      return numeric({
        prefix: 'mt3-op',
        prompt: `${a} × ${b} = ?`,
        answer: a * b,
        explanation: `${a} × ${b} = ${fmt(a * b)}.`,
        hint: 'Darabkan sa dahulu, kemudian puluh.',
        emoji: '✖️',
        speak: `${a} darab ${b}`,
      });
    }
    const b = rng.int(3, 12);
    const q = rng.int(11, 99);
    const a = b * q;
    return numeric({
      prefix: 'mt3-op',
      prompt: `${fmt(a)} ÷ ${b} = ?`,
      answer: q,
      explanation: `${fmt(a)} ÷ ${b} = ${q} kerana ${q} × ${b} = ${fmt(a)}.`,
      emoji: '➗',
      speak: `${a} bahagi ${b}`,
    });
  });
}

function mt3PecahanPerpuluhan(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const den = rng.pick([10, 100]);
      const num = rng.int(1, den - 1);
      return mcq(rng, {
        prefix: 'mt3-frac',
        prompt: `${num}/${den} = ?`,
        answer: dec(num / den, 2),
        distractors: [dec(num / (den * 10), 3), `${num}.${den}`, dec(num / 10, 2), dec(num * 10, 2)],
        explanation: `${num}/${den} = ${dec(num / den, 2)} (perpuluhan).`,
        emoji: '🔟',
        cols: 2,
      });
    }
    if (mode === 1) {
      const d = rng.int(11, 99);
      return mcq(rng, {
        prefix: 'mt3-frac',
        prompt: `0.${String(d).padStart(2, '0')} sebagai pecahan ialah ?`,
        answer: `${d}/100`,
        distractors: [`${d}/10`, `${d}/1000`, `${d % 10}/${100}`, `${d}/10000`],
        explanation: `Dua tempat perpuluhan bermaksud per seratus: ${d}/100.`,
        emoji: '🧮',
        cols: 1,
      });
    }
    if (mode === 2) {
      const den = rng.pick([3, 4, 6, 8]);
      const num = rng.int(1, den - 1);
      // Gandaan penyebut supaya setiap bahagian nombor bulat.
      const k = rng.int(4, 12);
      const whole = den * k;
      return numeric({
        prefix: 'mt3-frac',
        prompt: `${num}/${den} daripada ${whole} = ?`,
        answer: k * num,
        explanation: `${whole} ÷ ${den} = ${k}, kemudian × ${num} = ${k * num}.`,
        emoji: '🍩',
        speak: `${num} per ${den} daripada ${whole}`,
      });
    }
    const pct = rng.pick([10, 20, 25, 50, 75]);
    return mcq(rng, {
      prefix: 'mt3-frac',
      prompt: `${pct}% = ?`,
      answer: `${pct}/100`,
      distractors: [`${pct}/10`, `${pct}/1000`, `${100 - pct}/100`, `${pct}/50`],
      explanation: `Peratus bermaksud per seratus: ${pct}% = ${pct}/100.`,
      emoji: '💯',
      cols: 2,
    });
  });
}

function mt3Wang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const items = rng.sample(
        [
          { n: 'Baju', p: rng.int(15, 120) },
          { n: 'Seluar', p: rng.int(20, 150) },
          { n: 'Kasut', p: rng.int(30, 200) },
          { n: 'Beg', p: rng.int(10, 90) },
        ],
        2,
      );
      const total = items.reduce((s, x) => s + x.p, 0);
      return numeric({
        prefix: 'mt3-money',
        prompt: `${items.map((x) => `${x.n} RM${x.p}`).join(' + ')} = ?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: total,
        explanation: `${items.map((x) => x.p).join(' + ')} = RM${total}.`,
        emoji: '🛍️',
        speak: `${items.map((x) => `${x.n} ${x.p} ringgit`).join(' tambah ')}. Berapa jumlah?`,
      });
    }
    if (mode === 1) {
      const per = rng.int(2, 25);
      const qty = rng.int(3, 12);
      return numeric({
        prefix: 'mt3-money',
        prompt: `Sebuah buku berharga RM${per}. Berapakah harga ${qty} buah buku?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: per * qty,
        explanation: `RM${per} × ${qty} = RM${per * qty}.`,
        emoji: '📚',
        speak: `Satu buku ${per} ringgit. Berapa harga ${qty} buku?`,
      });
    }
    const price = rng.int(11, 89);
    const percent = rng.pick([10, 20, 25, 50]);
    const disc = (price * percent) / 100;
    return numeric({
      prefix: 'mt3-money',
      prompt: `Harga asal RM${price}. Diskaun ${percent}%.\nBerapakah harga selepas diskaun?`,
      promptSub: 'Tulis jawapan dalam RM',
      answer: price - disc,
      explanation: `Diskaun = ${percent}% × RM${price} = RM${dec(disc)}. Harga baharu = RM${dec(price - disc)}.`,
      emoji: '🏷️',
      speak: `Harga ${price} ringgit, diskaun ${percent} peratus. Berapa harga baharu?`,
    });
  });
}

function mt3MasaWaktu(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const h = rng.int(1, 11);
      const m = rng.pick([0, 15, 30, 45]);
      const addMin = rng.pick([20, 30, 45, 60, 90]);
      const total = h * 60 + m + addMin;
      const nh = Math.floor(total / 60) % 12 || 12;
      const nm = total % 60;
      return mcq(rng, {
        prefix: 'mt3-time',
        prompt: `${h}:${String(m).padStart(2, '0')} + ${addMin} minit = ?`,
        answer: `${nh}:${String(nm).padStart(2, '0')}`,
        distractors: [
          `${h}:${String((m + addMin) % 60).padStart(2, '0')}`,
          `${nh === 12 ? 1 : nh + 1}:${String(nm).padStart(2, '0')}`,
          `${nh}:${String((nm + 15) % 60).padStart(2, '0')}`,
        ],
        explanation: `${addMin} minit selepas ${h}:${String(m).padStart(2, '0')} ialah ${nh}:${String(nm).padStart(2, '0')}.`,
        emoji: '⏰',
        cols: 2,
      });
    }
    if (mode === 1) {
      const y1 = rng.int(2010, 2020);
      const y2 = y1 + rng.int(3, 30);
      return numeric({
        prefix: 'mt3-time',
        prompt: `Berapakah tempoh dalam tahun dari ${y1} hingga ${y2}?`,
        answer: y2 - y1,
        explanation: `${y2} − ${y1} = ${y2 - y1} tahun.`,
        emoji: '⏳',
        speak: `Dari tahun ${y1} hingga ${y2}, berapa tahun?`,
      });
    }
    if (mode === 2) {
      const start = rng.int(7, 11);
      const dur = rng.int(2, 6);
      return mcq(rng, {
        prefix: 'mt3-time',
        prompt: `Program bermula ${start}:00 pagi dan tamat ${start + dur}:00 pagi.\nBerapakah tempohnya?`,
        answer: `${dur} jam`,
        distractors: [`${dur + 1} jam`, `${dur - 1} jam`, `${dur * 60} jam`],
        explanation: `${start + dur} − ${start} = ${dur} jam.`,
        emoji: '⏱️',
        cols: 2,
      });
    }
    const w = rng.int(2, 20);
    return numeric({
      prefix: 'mt3-time',
      prompt: `${w} minggu = ? hari`,
      answer: w * 7,
      explanation: `1 minggu = 7 hari, jadi ${w} minggu = ${w * 7} hari.`,
      emoji: '📅',
      speak: `${w} minggu sama dengan berapa hari?`,
    });
  });
}

function mt3Ukuran(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const km = rng.int(1, 20);
      const m = rng.pick([0, 200, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt3-measure',
        prompt: `${km} km ${m} m = ? m`,
        answer: fmt(km * 1000 + m),
        distractors: [fmt(km * 100 + m), fmt(km * 1000 + m * 10), fmt(km + m)],
        explanation: `${km} km = ${fmt(km * 1000)} m. Tambah ${m} m = ${fmt(km * 1000 + m)} m.`,
        emoji: '📏',
        cols: 1,
      });
    }
    if (mode === 1) {
      const kg = rng.int(1, 15);
      const g = rng.pick([0, 200, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt3-measure',
        prompt: `${kg} kg ${g} g = ? g`,
        answer: fmt(kg * 1000 + g),
        distractors: [fmt(kg * 100 + g), fmt(kg * 1000 + g * 10), fmt(kg + g)],
        explanation: `${kg} kg = ${fmt(kg * 1000)} g. Tambah ${g} g = ${fmt(kg * 1000 + g)} g.`,
        emoji: '⚖️',
        cols: 1,
      });
    }
    if (mode === 2) {
      const l = rng.int(1, 12);
      const ml = rng.pick([0, 200, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt3-measure',
        prompt: `${l} ℓ ${ml} mℓ = ? mℓ`,
        answer: fmt(l * 1000 + ml),
        distractors: [fmt(l * 100 + ml), fmt(l * 1000 + ml * 10), fmt(l + ml)],
        explanation: `${l} ℓ = ${fmt(l * 1000)} mℓ. Tambah ${ml} mℓ = ${fmt(l * 1000 + ml)} mℓ.`,
        emoji: '🧴',
        cols: 1,
      });
    }
    const a = rng.int(2, 9);
    const b = rng.int(100, 900);
    const totalMm = a * 1000 + b;
    return numeric({
      prefix: 'mt3-measure',
      prompt: `${a} m ${b} cm = ? cm`,
      answer: totalMm / 10,
      explanation: `${a} m = ${a * 100} cm. Tambah ${b} cm = ${a * 100 + b} cm.`,
      emoji: '📐',
      speak: `${a} meter ${b} sentimeter sama dengan berapa sentimeter?`,
    });
  });
}

function mt3BentukRuang(_y: number, rng: Rng, count: number): Question[] {
  const angles = [
    { n: 'sudut tepat', d: 90 },
    { n: 'sudut tirus', d: 45 },
    { n: 'sudut cakah', d: 130 },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const w = rng.int(3, 15);
      const h = rng.int(3, 15);
      return numeric({
        prefix: 'mt3-shape',
        prompt: `Sebuah segi empat tepat berukuran ${w} cm × ${h} cm.\nBerapakah perimeter?`,
        promptSub: 'Tulis jawapan dalam cm',
        answer: 2 * (w + h),
        explanation: `Perimeter = 2 × (${w} + ${h}) = ${2 * (w + h)} cm.`,
        emoji: '📐',
        speak: `Segi empat tepat ${w} sentimeter kali ${h} sentimeter. Berapa perimeter?`,
      });
    }
    if (i % 3 === 1) {
      const w = rng.int(3, 12);
      const h = rng.int(3, 12);
      return numeric({
        prefix: 'mt3-shape',
        prompt: `Sebuah segi empat tepat berukuran ${w} cm × ${h} cm.\nBerapakah luas?`,
        promptSub: 'Tulis jawapan dalam cm²',
        answer: w * h,
        explanation: `Luas = ${w} × ${h} = ${w * h} cm².`,
        emoji: '🟦',
        speak: `Segi empat tepat ${w} kali ${h}. Berapa luas?`,
      });
    }
    const ang = rng.pick(angles);
    return trueFalse({
      prefix: 'mt3-shape',
      prompt: `Sudut ${ang.d}° ialah ${ang.n}.`,
      isTrue: true,
      explanation:
        ang.d === 90
          ? 'Betul, 90° ialah sudut tepat.'
          : ang.d < 90
            ? 'Betul, kurang 90° ialah sudut tirus.'
            : 'Betul, lebih 90° ialah sudut cakah.',
      emoji: '📐',
    });
  });
}

function mt3Data(_y: number, rng: Rng, count: number): Question[] {
  const subjects = ['Matematik', 'Sains', 'Bahasa Melayu', 'English'];
  return fill(count, (i) => {
    const vals = subjects.map(() => rng.int(10, 40));
    const total = vals.reduce((s, v) => s + v, 0);
    const chart = subjects.map((s, k) => `${s}: ${vals[k]}`).join('\n');
    if (i % 3 === 0) {
      const maxIdx = vals.indexOf(Math.max(...vals));
      return mcq(rng, {
        prefix: 'mt3-data',
        prompt: `Markah ujian kelas 3 Cekal:\n${chart}\nSubjek manakah markah tertinggi?`,
        answer: subjects[maxIdx],
        distractors: subjects.filter((_, k) => k !== maxIdx),
        explanation: `${subjects[maxIdx]} tertinggi dengan ${vals[maxIdx]} markah.`,
        emoji: '📊',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      return numeric({
        prefix: 'mt3-data',
        prompt: `Markah ujian kelas 3 Cekal:\n${chart}\nBerapakah jumlah markah?`,
        answer: total,
        explanation: `${vals.join(' + ')} = ${total}.`,
        emoji: '🧮',
        speak: 'Berapa jumlah semua markah?',
      });
    }
    const avg = Math.round(total / subjects.length);
    return numeric({
      prefix: 'mt3-data',
      prompt: `Markah ujian kelas 3 Cekal:\n${chart}\nBerapakah markah purata?`,
      promptSub: 'Bundarkan kepada nombor bulat',
      answer: avg,
      explanation: `Jumlah ${total} ÷ ${subjects.length} = ${dec(total / subjects.length, 1)} ≈ ${avg}.`,
      emoji: '📈',
      speak: 'Berapa markah purata?',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 4                                                             */
/* ------------------------------------------------------------------ */

function mt4NomborHingga100000(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const n = rng.int(10001, 99999);
    if (i % 4 === 0) {
      const s = String(n);
      const posIdx = rng.int(0, 4);
      const labels = ['puluh ribu', 'ribu', 'ratus', 'puluh', 'sa'];
      const vals: Record<string, number> = { 'puluh ribu': 10000, ribu: 1000, ratus: 100, puluh: 10, sa: 1 };
      const dv = Number(s[posIdx]);
      return mcq(rng, {
        prefix: 'mt4-num',
        prompt: `Dalam nombor ${fmt(n)}, apakah nilai digit ${dv}?`,
        answer: fmt(dv * vals[labels[posIdx]]),
        distractors: [fmt(dv), fmt(dv * vals[labels[posIdx]] * 10), fmt(dv * vals[labels[posIdx]] / 10 || 1)],
        explanation: `Digit ${dv} di tempat ${labels[posIdx]} = ${fmt(dv * vals[labels[posIdx]])}.`,
        emoji: '📍',
        cols: 1,
      });
    }
    if (i % 4 === 1) {
      const roundK = rng.pick([10, 100, 1000, 10000]);
      const ans = Math.round(n / roundK) * roundK;
      return numeric({
        prefix: 'mt4-num',
        prompt: `Bundarkan ${fmt(n)} kepada ${fmt(roundK)} terdekat.`,
        answer: ans,
        explanation: `${fmt(n)} dibundarkan kepada ${fmt(roundK)} terdekat menjadi ${fmt(ans)}.`,
        emoji: '🎯',
        speak: `Bundarkan ${n} kepada ${roundK} terdekat.`,
      });
    }
    if (i % 4 === 2) {
      const a = rng.int(10000, 50000);
      const b = rng.int(10000, 50000);
      const wantBig = rng.chance(0.5);
      const ans = wantBig ? Math.max(a, b) : Math.min(a, b);
      return mcq(rng, {
        prefix: 'mt4-num',
        prompt: `Antara ${fmt(a)} dan ${fmt(b)}, manakah lebih ${wantBig ? 'besar' : 'kecil'}?`,
        answer: fmt(ans),
        distractors: [fmt(wantBig ? Math.min(a, b) : Math.max(a, b))],
        explanation: `${fmt(Math.min(a, b))} < ${fmt(Math.max(a, b))}.`,
        emoji: '⚖️',
        cols: 2,
      });
    }
    const seq = rng.pick([100, 1000, 10000]);
    const start = rng.int(10, 60) * seq;
    const isUp = rng.chance(0.5);
    return numeric({
      prefix: 'mt4-num',
      prompt: `Lengkapkan urutan: ${fmt(start)}, ${fmt(isUp ? start + seq : start - seq)}, ${fmt(isUp ? start + 2 * seq : start - 2 * seq)}, ____`,
      answer: isUp ? start + 3 * seq : start - 3 * seq,
      explanation: `Setiap nombor ${isUp ? 'bertambah' : 'berkurang'} ${fmt(seq)}.`,
      emoji: '🔢',
      speak: 'Apakah nombor seterusnya dalam urutan ini?',
    });
  });
}

function mt4Operasi(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const a = rng.int(10000, 60000);
      const b = rng.int(1000, Math.max(100000 - a, 2000));
      return numeric({
        prefix: 'mt4-op',
        prompt: `${fmt(a)} + ${fmt(b)} = ?`,
        answer: a + b,
        explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`,
        emoji: '➕',
        speak: `${a} tambah ${b}`,
      });
    }
    if (mode === 1) {
      const a = rng.int(30000, 100000);
      const b = rng.int(1000, a - 1000);
      return numeric({
        prefix: 'mt4-op',
        prompt: `${fmt(a)} − ${fmt(b)} = ?`,
        answer: a - b,
        explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`,
        emoji: '➖',
        speak: `${a} tolak ${b}`,
      });
    }
    if (mode === 2) {
      const a = rng.int(100, 999);
      const b = rng.int(3, 9);
      return numeric({
        prefix: 'mt4-op',
        prompt: `${fmt(a)} × ${b} = ?`,
        answer: a * b,
        explanation: `${fmt(a)} × ${b} = ${fmt(a * b)}.`,
        emoji: '✖️',
        speak: `${a} darab ${b}`,
      });
    }
    if (mode === 3) {
      const b = rng.int(3, 12);
      const q = rng.int(100, 900);
      return numeric({
        prefix: 'mt4-op',
        prompt: `${fmt(b * q)} ÷ ${b} = ?`,
        answer: q,
        explanation: `${fmt(b * q)} ÷ ${b} = ${q}.`,
        emoji: '➗',
        speak: `${b * q} bahagi ${b}`,
      });
    }
    const a = rng.int(100, 500);
    const b = rng.int(10, 99);
    const c = rng.int(2, 9);
    return numeric({
      prefix: 'mt4-op',
      prompt: `${fmt(a)} + ${fmt(b)} × ${c} = ?`,
      promptSub: 'Ingat: darab dahulu, kemudian tambah.',
      answer: a + b * c,
      explanation: `${b} × ${c} = ${fmt(b * c)} dahulu, kemudian ${fmt(a)} + ${fmt(b * c)} = ${fmt(a + b * c)}.`,
      emoji: '🧮',
      speak: `${a} tambah ${b} darab ${c}`,
    });
  });
}

function mt4PecahanPerpuluhanPeratus(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const den = rng.pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const n = rng.int(1, den - 1);
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(n, den);
      const ans = `${n / g}/${den / g}`;
      return mcq(rng, {
        prefix: 'mt4-frac',
        prompt: `Permudahkan ${n}/${den} kepada sebutan terendah.`,
        answer: ans,
        distractors: [`${n}/${den}`, `${n + 1}/${den}`, `${n}/${den - 1}`, `1/${den}`],
        explanation: `Bahagi pengangka dan penyebut dengan ${g}: ${n / g}/${den / g}.`,
        emoji: '🧩',
        cols: 2,
      });
    }
    if (mode === 1) {
      const a1 = rng.int(1, 5);
      const d1 = rng.int(a1 + 1, 9);
      const a2 = rng.int(1, 5);
      const d2 = rng.int(a2 + 1, 9);
      const num = a1 * d2 + a2 * d1;
      const den = d1 * d2;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(num, den);
      return mcq(rng, {
        prefix: 'mt4-frac',
        prompt: `${a1}/${d1} + ${a2}/${d2} = ?`,
        answer: `${num / g}/${den / g}`,
        distractors: [`${a1 + a2}/${d1 + d2}`, `${num}/${den + 1}`, `${num + 1}/${den}`, `${a1 + a2}/${d1}`],
        explanation: `Samakan penyebut: ${num}/${den} = ${num / g}/${den / g}.`,
        emoji: '➕',
        cols: 1,
      });
    }
    if (mode === 2) {
      const a = rng.int(100, 999) / 100;
      const b = rng.int(100, 999) / 100;
      const ans = Math.round((a + b) * 100) / 100;
      return numeric({
        prefix: 'mt4-dec',
        prompt: `${a.toFixed(2)} + ${b.toFixed(2)} = ?`,
        answer: ans,
        explanation: `Susun titik perpuluhan sejajar: ${a.toFixed(2)} + ${b.toFixed(2)} = ${ans.toFixed(2)}.`,
        emoji: '🔢',
        speak: `${a.toFixed(2)} tambah ${b.toFixed(2)}`,
      });
    }
    if (mode === 3) {
      const whole = rng.pick([40, 60, 80, 120, 200, 240]);
      const pct = rng.pick([10, 20, 25, 50, 75]);
      return numeric({
        prefix: 'mt4-pct',
        prompt: `${pct}% daripada ${whole} = ?`,
        answer: (whole * pct) / 100,
        explanation: `${pct}% × ${whole} = ${pct}/100 × ${whole} = ${(whole * pct) / 100}.`,
        emoji: '💯',
        speak: `${pct} peratus daripada ${whole}`,
      });
    }
    const pct = rng.pick([25, 50, 75, 20, 40, 60, 80]);
    const frac = `${pct}/100`;
    return mcq(rng, {
      prefix: 'mt4-pct',
      prompt: `${pct}% sebagai pecahan terendah ialah ?`,
      answer: frac === '50/100' ? '1/2' : frac === '25/100' ? '1/4' : frac === '75/100' ? '3/4' : frac === '20/100' ? '1/5' : frac === '40/100' ? '2/5' : frac === '60/100' ? '3/5' : frac === '80/100' ? '4/5' : frac,
      distractors: ['1/2', '1/4', '3/4', '2/5', '3/5', frac],
      explanation: `${pct}% = ${frac}, dipermudah menjadi pecahan terendah.`,
      emoji: '🔄',
      cols: 2,
    });
  });
}

function mt4Wang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const per = rng.int(5, 45);
      const qty = rng.int(4, 20);
      return numeric({
        prefix: 'mt4-money',
        prompt: `Harga sebuah buku RM${per}. Berapakah harga ${qty} buah buku?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: per * qty,
        explanation: `RM${per} × ${qty} = RM${per * qty}.`,
        emoji: '📚',
        speak: `Satu buku ${per} ringgit, ${qty} buku berapa?`,
      });
    }
    if (mode === 1) {
      const total = rng.int(50, 300);
      const people = rng.pick([3, 4, 5, 6, 8, 10]);
      const exact = Math.round((total / people) * 100) / 100;
      return numeric({
        prefix: 'mt4-money',
        prompt: `RM${total} dibahagi sama rata antara ${people} orang.\nBerapakah setiap orang dapat?`,
        promptSub: 'Tulis jawapan dalam RM (2 tempat perpuluhan)',
        answer: Number(exact.toFixed(2)),
        explanation: `RM${total} ÷ ${people} = RM${exact.toFixed(2)}.`,
        emoji: '👥',
        speak: `${total} ringgit dibahagi ${people} orang. Setiap orang berapa?`,
      });
    }
    const cost = rng.int(200, 900);
    const save = rng.int(20, 90);
    const months = Math.ceil((cost - save) / rng.pick([10, 20, 30, 50]));
    return numeric({
      prefix: 'mt4-money',
      prompt: `Ali mahu membeli basikal berharga RM${cost}.\nDia sudah menyimpan RM${save} dan menyimpan RM${Math.ceil((cost - save) / months)} sebulan.\nBerapa bulan diperlukan?`,
      answer: months,
      explanation: `Perlu RM${cost - save} lagi. RM${cost - save} ÷ RM${Math.ceil((cost - save) / months)} = ${months} bulan.`,
      emoji: '🚲',
      speak: `Berapa bulan perlu menyimpan?`,
    });
  });
}

function mt4MasaWaktu(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const h = rng.int(1, 10);
      const m = rng.pick([0, 15, 30, 45]);
      const dur = rng.pick([45, 75, 90, 120, 150]);
      const total = h * 60 + m + dur;
      const nh = Math.floor(total / 60) % 12 || 12;
      const nm = total % 60;
      return mcq(rng, {
        prefix: 'mt4-time',
        prompt: `Program bermula ${h}:${String(m).padStart(2, '0')} dan berlangsung ${dur} minit.\nBila tamat?`,
        answer: `${nh}:${String(nm).padStart(2, '0')}`,
        distractors: [
          `${h}:${String((m + dur) % 60).padStart(2, '0')}`,
          `${nh === 12 ? 1 : nh + 1}:${String(nm).padStart(2, '0')}`,
          `${nh}:${String((nm + 30) % 60).padStart(2, '0')}`,
        ],
        explanation: `${dur} minit = ${Math.floor(dur / 60)} jam ${dur % 60} minit.`,
        emoji: '⏰',
        cols: 2,
      });
    }
    if (mode === 1) {
      const days = rng.int(10, 200);
      return mcq(rng, {
        prefix: 'mt4-time',
        prompt: `${days} hari = ? minggu ? hari`,
        answer: `${Math.floor(days / 7)} minggu ${days % 7} hari`,
        distractors: [
          `${Math.floor(days / 7)} minggu ${(days % 7) + 1} hari`,
          `${Math.floor(days / 30)} bulan ${days % 30} hari`,
          `${days} minggu 0 hari`,
        ],
        explanation: `${days} ÷ 7 = ${Math.floor(days / 7)} minggu baki ${days % 7} hari.`,
        emoji: '📅',
        cols: 1,
      });
    }
    if (mode === 2) {
      const centuries = rng.int(1, 5);
      return numeric({
        prefix: 'mt4-time',
        prompt: `${centuries} abad = ? tahun`,
        answer: centuries * 100,
        explanation: `1 abad = 100 tahun, jadi ${centuries} abad = ${centuries * 100} tahun.`,
        emoji: '⏳',
        speak: `${centuries} abad sama dengan berapa tahun?`,
      });
    }
    const decades = rng.int(2, 9);
    return numeric({
      prefix: 'mt4-time',
      prompt: `${decades} dekad = ? tahun`,
      answer: decades * 10,
      explanation: `1 dekad = 10 tahun, jadi ${decades} dekad = ${decades * 10} tahun.`,
      emoji: '🕰️',
      speak: `${decades} dekad sama dengan berapa tahun?`,
    });
  });
}

function mt4Ukuran(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const km = rng.int(1, 30);
      const m = rng.pick([0, 100, 250, 400, 500, 750, 900]);
      return mcq(rng, {
        prefix: 'mt4-measure',
        prompt: `${km} km ${m} m = ? m`,
        answer: fmt(km * 1000 + m),
        distractors: [fmt(km * 100 + m), fmt(km * 1000 + m * 10), fmt(km * 10 + m)],
        explanation: `${km} km = ${fmt(km * 1000)} m. Tambah ${m} m = ${fmt(km * 1000 + m)} m.`,
        emoji: '📏',
        cols: 1,
      });
    }
    if (mode === 1) {
      const t = rng.int(1, 9);
      const kg = rng.pick([0, 100, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt4-measure',
        prompt: `${t} tan ${kg} kg = ? kg`,
        answer: fmt(t * 1000 + kg),
        distractors: [fmt(t * 100 + kg), fmt(t * 1000 + kg * 10), fmt(t * 10 + kg)],
        explanation: `1 tan = 1000 kg, jadi ${t} tan ${kg} kg = ${fmt(t * 1000 + kg)} kg.`,
        emoji: '⚖️',
        cols: 1,
      });
    }
    if (mode === 2) {
      const a = rng.int(2, 12);
      const b = rng.int(200, 900);
      return numeric({
        prefix: 'mt4-measure',
        prompt: `${a} ℓ ${b} mℓ + ${a} ℓ ${b} mℓ = ? mℓ`,
        answer: 2 * (a * 1000 + b),
        explanation: `${a * 1000 + b} mℓ × 2 = ${2 * (a * 1000 + b)} mℓ.`,
        emoji: '🧴',
        speak: `Dua kali ${a} liter ${b} mililiter. Berapa mililiter?`,
      });
    }
    const items = rng.sample(
      [
        { n: 'Buku', m: rng.int(200, 900), u: 'g' },
        { n: 'Kotak', m: rng.int(500, 2000), u: 'g' },
        { n: 'Beg', m: rng.int(1, 5) * 1000, u: 'g' },
      ],
      2,
    );
    const total = items.reduce((s, x) => s + x.m, 0);
    return mcq(rng, {
      prefix: 'mt4-measure',
      prompt: `${items.map((x) => `${x.n} ${fmt(x.m)} ${x.u}`).join(' + ')} = ? kg`,
      answer: `${dec(total / 1000)} kg`,
      distractors: [`${fmt(total)} kg`, `${dec(total / 100)} kg`, `${dec(total / 10000)} kg`],
      explanation: `${fmt(total)} g = ${dec(total / 1000)} kg.`,
      emoji: '🎒',
      cols: 1,
    });
  });
}

function mt4Ruang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const w = rng.int(4, 25);
      const h = rng.int(4, 25);
      const wantArea = rng.chance(0.5);
      return numeric({
        prefix: 'mt4-space',
        prompt: `Segi empat tepat ${w} cm × ${h} cm.\nBerapakah ${wantArea ? 'luas' : 'perimeter'}?`,
        promptSub: wantArea ? 'Tulis jawapan dalam cm²' : 'Tulis jawapan dalam cm',
        answer: wantArea ? w * h : 2 * (w + h),
        explanation: wantArea
          ? `Luas = ${w} × ${h} = ${w * h} cm².`
          : `Perimeter = 2 × (${w} + ${h}) = ${2 * (w + h)} cm.`,
        emoji: '📐',
        speak: `Segi empat tepat ${w} kali ${h} sentimeter. Berapa ${wantArea ? 'luas' : 'perimeter'}?`,
      });
    }
    if (mode === 1) {
      const s = rng.int(3, 20);
      return numeric({
        prefix: 'mt4-space',
        prompt: `Segi empat sama bersisi ${s} cm.\nBerapakah perimeter?`,
        promptSub: 'Tulis jawapan dalam cm',
        answer: 4 * s,
        explanation: `Perimeter segi empat sama = 4 × sisi = 4 × ${s} = ${4 * s} cm.`,
        emoji: '🟦',
        speak: `Segi empat sama sisi ${s} sentimeter. Berapa perimeter?`,
      });
    }
    if (mode === 2) {
      const b = rng.int(4, 20);
      const h = rng.int(3, 15);
      const area = (b * h) / 2;
      const isInt = Number.isInteger(area);
      if (!isInt) {
        return numeric({
          prefix: 'mt4-space',
          prompt: `Segi tiga bertapak ${b} cm dan tinggi ${h} cm.\nBerapakah perimeter segi empat sama sisi ${b} cm?`,
          promptSub: 'Tulis jawapan dalam cm',
          answer: 4 * b,
          explanation: `Perimeter = 4 × ${b} = ${4 * b} cm.`,
          emoji: '🔺',
          speak: `Segi empat sama sisi ${b}. Berapa perimeter?`,
        });
      }
      return numeric({
        prefix: 'mt4-space',
        prompt: `Segi tiga bertapak ${b} cm dan tinggi ${h} cm.\nBerapakah luas?`,
        promptSub: 'Tulis jawapan dalam cm²',
        answer: area,
        explanation: `Luas segi tiga = ½ × tapak × tinggi = ½ × ${b} × ${h} = ${area} cm².`,
        emoji: '🔺',
        speak: `Segi tiga tapak ${b} tinggi ${h}. Berapa luas?`,
      });
    }
    const ang = rng.pick([45, 90, 120, 135, 180]);
    const label = ang === 90 ? 'sudut tepat' : ang < 90 ? 'sudut tirus' : ang === 180 ? 'sudut garis lurus' : 'sudut cakah';
    return mcq(rng, {
      prefix: 'mt4-space',
      prompt: `Sudut ${ang}° ialah ____.`,
      answer: label,
      distractors: ['sudut tirus', 'sudut tepat', 'sudut cakah', 'sudut refleks'].filter((x) => x !== label),
      explanation: `Sudut ${ang}° ialah ${label}.`,
      emoji: '📐',
      cols: 1,
    });
  });
}

function mt4KoordinatNisbah(_y: number, rng: Rng, count: number): Question[] {
  const coords: [string, number, number][] = [
    ['A', 1, 1],
    ['B', 2, 3],
    ['C', 4, 1],
    ['D', 3, 4],
    ['E', 5, 2],
    ['F', 1, 5],
    ['G', 6, 3],
    ['H', 2, 5],
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const [name, x, y] = rng.pick(coords);
      return mcq(rng, {
        prefix: 'mt4-coord',
        prompt: `Titik ${name} berada pada koordinat (${x}, ${y}).\nApakah koordinat-x bagi titik ${name}?`,
        answer: String(x),
        distractors: [String(y), String(x + 1), String(Math.max(x - 1, 0))],
        explanation: `Koordinat ditulis (x, y). Bagi ${name}(${x}, ${y}), koordinat-x ialah ${x}.`,
        emoji: '🗺️',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      const [name, x, y] = rng.pick(coords);
      const mx = rng.int(x + 1, 8);
      const my = rng.int(y + 1, 7);
      const dx = mx - x;
      const dy = my - y;
      return numeric({
        prefix: 'mt4-coord',
        prompt: `Titik ${name}(${x}, ${y}) digerakkan ${dx} unit ke kanan.\nBerapakah koordinat-x yang baharu?`,
        answer: mx,
        explanation: `Gerak ke kanan menambah koordinat-x: ${x} + ${dx} = ${mx}. Koordinat baharu (${mx}, ${y}). (Gerak ke atas ${dy} unit pula akan menambah koordinat-y.)`,
        emoji: '➡️',
        speak: `Titik ${name} pada ${x} ${y} bergerak ${dx} unit ke kanan. Berapa koordinat x baharu?`,
      });
    }
    const a = rng.int(1, 9);
    const b = rng.int(2, 9);
    const k = rng.int(2, 6);
    return mcq(rng, {
      prefix: 'mt4-ratio',
      prompt: `Nisbah ${a} : ${b}. Jika nilai pertama ${a * k}, apakah nilai kedua?`,
      answer: String(b * k),
      distractors: [String(b + k), String(b * a), String(b * k + 1), String(a * k)],
      explanation: `Nisbah didarab dengan ${k}: ${a} : ${b} = ${a * k} : ${b * k}.`,
      emoji: '⚖️',
      cols: 2,
      speak: `Nisbah ${a} kepada ${b}. Jika ${a * k}, berapa nilai kedua?`,
    });
  });
}

function mt4Data(_y: number, rng: Rng, count: number): Question[] {
  const days = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'];
  return fill(count, (i) => {
    const vals = days.map(() => rng.int(5, 45));
    const total = vals.reduce((s, v) => s + v, 0);
    const chart = days.map((d, k) => `${d}: ${'▇'.repeat(Math.round(vals[k] / 5))} ${vals[k]}`).join('\n');
    if (i % 3 === 0) {
      return numeric({
        prefix: 'mt4-data',
        prompt: `Bilangan buku dibaca setiap hari:\n${chart}\nBerapakah jumlahnya?`,
        answer: total,
        explanation: `${vals.join(' + ')} = ${total}.`,
        emoji: '📚',
        speak: 'Berapa jumlah buku yang dibaca?',
      });
    }
    if (i % 3 === 1) {
      return numeric({
        prefix: 'mt4-data',
        prompt: `Bilangan buku dibaca setiap hari:\n${chart}\nBerapakah purata sehari?`,
        promptSub: 'Bundarkan kepada nombor bulat',
        answer: Math.round(total / days.length),
        explanation: `Jumlah ${total} ÷ ${days.length} = ${dec(total / days.length, 1)} ≈ ${Math.round(total / days.length)}.`,
        emoji: '📈',
        speak: 'Berapa purata buku sehari?',
      });
    }
    const maxIdx = vals.indexOf(Math.max(...vals));
    const minIdx = vals.indexOf(Math.min(...vals));
    return numeric({
      prefix: 'mt4-data',
      prompt: `Bilangan buku dibaca setiap hari:\n${chart}\nBerapakah beza antara hari terbanyak dan tersedikit?`,
      answer: vals[maxIdx] - vals[minIdx],
      explanation: `${days[maxIdx]} (${vals[maxIdx]}) − ${days[minIdx]} (${vals[minIdx]}) = ${vals[maxIdx] - vals[minIdx]}.`,
      emoji: '➖',
      speak: 'Berapa beza antara hari terbanyak dan tersedikit?',
    });
  });
}

export const MATEMATIK_GENERATORS_34: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'mt3-nombor-hingga-10000': mt3NomborHingga10000,
  'mt3-operasi-asas': mt3OperasiAsas,
  'mt3-pecahan-perpuluhan': mt3PecahanPerpuluhan,
  'mt3-wang': mt3Wang,
  'mt3-masa-waktu': mt3MasaWaktu,
  'mt3-ukuran': mt3Ukuran,
  'mt3-bentuk-ruang': mt3BentukRuang,
  'mt3-data': mt3Data,
  'mt4-nombor-hingga-100000': mt4NomborHingga100000,
  'mt4-operasi': mt4Operasi,
  'mt4-pecahan-perpuluhan-peratus': mt4PecahanPerpuluhanPeratus,
  'mt4-wang': mt4Wang,
  'mt4-masa-waktu': mt4MasaWaktu,
  'mt4-ukuran': mt4Ukuran,
  'mt4-ruang': mt4Ruang,
  'mt4-koordinat-nisbah': mt4KoordinatNisbah,
  'mt4-data': mt4Data,
};
