/** Penjana latihan Matematik — Tahun 5 dan Tahun 6. */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { dec, fill, fmt, mcq, numeric } from './shared';

const gcdOf = (a: number, b: number): number => (b === 0 ? a : gcdOf(b, a % b));

/* ------------------------------------------------------------------ */
/* Tahun 5                                                             */
/* ------------------------------------------------------------------ */

function mt5NomborJuta(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const n = rng.int(100001, 9999999);
    if (i % 4 === 0) {
      const s = String(n);
      const labels = ['juta', 'ratus ribu', 'puluh ribu', 'ribu', 'ratus', 'puluh', 'sa'];
      const units = [1000000, 100000, 10000, 1000, 100, 10, 1];
      const posIdx = rng.int(0, s.length - 1);
      const dv = Number(s[posIdx]);
      const unit = units[units.length - s.length + posIdx];
      return mcq(rng, {
        prefix: 'mt5-num',
        prompt: `Dalam ${fmt(n)}, apakah nilai digit ${dv}?`,
        answer: fmt(dv * unit),
        distractors: [fmt(dv), fmt(dv * unit * 10), fmt(dv * (unit / 10))],
        explanation: `Digit ${dv} berada di tempat ${labels[labels.length - s.length + posIdx]} = ${fmt(dv * unit)}.`,
        emoji: '📍',
        cols: 1,
      });
    }
    if (i % 4 === 1) {
      const roundK = rng.pick([1000, 10000, 100000]);
      const ans = Math.round(n / roundK) * roundK;
      return numeric({
        prefix: 'mt5-num',
        prompt: `Bundarkan ${fmt(n)} kepada ${fmt(roundK)} terdekat.`,
        answer: ans,
        explanation: `${fmt(n)} ≈ ${fmt(ans)}.`,
        emoji: '🎯',
        speak: `Bundarkan ${n} kepada ${roundK} terdekat.`,
      });
    }
    if (i % 4 === 2) {
      const a = rng.int(100000, 900000);
      const b = rng.int(1000, 9999);
      return numeric({
        prefix: 'mt5-num',
        prompt: `${fmt(a)} + ${fmt(b)} = ?`,
        answer: a + b,
        explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`,
        emoji: '➕',
        speak: `${a} tambah ${b}`,
      });
    }
    const a = rng.int(1000000, 9000000);
    const b = rng.int(10000, 900000);
    return numeric({
      prefix: 'mt5-num',
      prompt: `${fmt(a)} − ${fmt(b)} = ?`,
      answer: a - b,
      explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`,
      emoji: '➖',
      speak: `${a} tolak ${b}`,
    });
  });
}

function mt5PecahanPerpuluhanPeratus(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const a1 = rng.int(1, 6);
      const d1 = rng.int(a1 + 1, 12);
      const a2 = rng.int(1, 6);
      const d2 = rng.int(a2 + 1, 12);
      const num = a1 * d2 + a2 * d1;
      const den = d1 * d2;
      const g = gcdOf(num, den);
      return mcq(rng, {
        prefix: 'mt5-frac',
        prompt: `${a1}/${d1} + ${a2}/${d2} = ?`,
        answer: `${num / g}/${den / g}`,
        distractors: [`${a1 + a2}/${d1 + d2}`, `${num}/${den}`, `${num + g}/${den}`, `${num}/${den * 2}`],
        explanation: `Samakan penyebut kepada ${den}: ${num}/${den} = ${num / g}/${den / g}.`,
        emoji: '➕',
        cols: 1,
      });
    }
    if (mode === 1) {
      const a1 = rng.int(3, 9);
      const d1 = rng.int(a1 + 1, 12);
      const a2 = rng.int(1, a1 - 1);
      const d2 = rng.int(2, 12);
      const num = a1 * d2 - a2 * d1;
      const den = d1 * d2;
      const g = Math.abs(gcdOf(gcdOf(Math.abs(num), den), 1));
      if (num <= 0) {
        const x = rng.int(2, 6);
        const y = rng.int(x + 1, 10);
        return mcq(rng, {
          prefix: 'mt5-frac',
          prompt: `${x}/${y} + ${x}/${y} = ?`,
          answer: `${2 * x / gcdOf(2 * x, y)}/${y / gcdOf(2 * x, y)}`,
          distractors: [`${2 * x}/${2 * y}`, `${x}/${y}`, `${2 * x}/${y + 1}`, `${x + 1}/${y}`],
          explanation: `${x}/${y} + ${x}/${y} = ${2 * x}/${y} = ${2 * x / gcdOf(2 * x, y)}/${y / gcdOf(2 * x, y)}.`,
          emoji: '➕',
          cols: 1,
        });
      }
      return mcq(rng, {
        prefix: 'mt5-frac',
        prompt: `${a1}/${d1} − ${a2}/${d2} = ?`,
        answer: `${num / g}/${den / g}`,
        distractors: [`${a1 - a2}/${d1 - d2}`, `${num}/${den}`, `${num + 1}/${den}`, `${num}/${den + 1}`],
        explanation: `Samakan penyebut kepada ${den}: ${num}/${den} = ${num / g}/${den / g}.`,
        emoji: '➖',
        cols: 1,
      });
    }
    if (mode === 2) {
      const a = rng.int(1, 9);
      const d = rng.int(2, 9);
      const whole = rng.int(2, 12);
      const tot = whole * d + a;
      return mcq(rng, {
        prefix: 'mt5-frac',
        prompt: `${whole} ${a}/${d} sebagai pecahan tak wajar ialah ?`,
        answer: `${tot}/${d}`,
        distractors: [`${whole + a}/${d}`, `${tot}/${d + 1}`, `${whole * d}/${d + a}`, `${a}/${d + whole}`],
        explanation: `${whole} × ${d} = ${whole * d}. Tambah ${a} = ${tot}. Jadi ${tot}/${d}.`,
        emoji: '🔄',
        cols: 2,
      });
    }
    if (mode === 3) {
      const whole = rng.pick([80, 120, 150, 200, 240, 300, 400]);
      const pct = rng.pick([5, 10, 15, 20, 25, 40]);
      const ans = (whole * pct) / 100;
      return numeric({
        prefix: 'mt5-pct',
        prompt: `${pct}% daripada ${whole} = ?`,
        answer: Number(ans.toFixed(2)),
        explanation: `${pct}/100 × ${whole} = ${dec(ans)}.`,
        emoji: '💯',
        speak: `${pct} peratus daripada ${whole}`,
      });
    }
    const a = rng.int(100, 999) / 100;
    const b = rng.int(2, 9);
    return numeric({
      prefix: 'mt5-dec',
      prompt: `${a.toFixed(2)} × ${b} = ?`,
      promptSub: 'Tulis 2 tempat perpuluhan',
      answer: Number((a * b).toFixed(2)),
      explanation: `${a.toFixed(2)} × ${b} = ${(a * b).toFixed(2)}.`,
      emoji: '✖️',
      speak: `${a.toFixed(2)} darab ${b}`,
    });
  });
}

function mt5Wang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const price = rng.int(20, 480);
      const pct = rng.pick([10, 15, 20, 25, 30, 50]);
      const disc = (price * pct) / 100;
      return numeric({
        prefix: 'mt5-money',
        prompt: `Harga asal RM${price}. Diskaun ${pct}%.\nBerapakah harga selepas diskaun?`,
        promptSub: 'Tulis jawapan dalam RM (2 tempat perpuluhan)',
        answer: Number((price - disc).toFixed(2)),
        explanation: `Diskaun = RM${dec(disc)}. Harga baharu = RM${price} − RM${dec(disc)} = RM${dec(price - disc)}.`,
        emoji: '🏷️',
        speak: `Harga ${price} ringgit, diskaun ${pct} peratus.`,
      });
    }
    if (mode === 1) {
      const cost = rng.int(50, 3000);
      const rate = rng.pick([3, 4, 5, 6, 8]);
      const months = Math.ceil(cost / rate);
      return mcq(rng, {
        prefix: 'mt5-money',
        prompt: `Sebuah barang berharga RM${cost} dibayar ansuran RM${rate} sebulan.\nBerapa bulan untuk habis bayar?`,
        answer: `${months} bulan`,
        distractors: [`${months + 1} bulan`, `${months - 1} bulan`, `${cost} bulan`, `${rate} bulan`],
        explanation: `RM${cost} ÷ RM${rate} = ${dec(cost / rate, 1)} ≈ ${months} bulan.`,
        emoji: '💳',
        cols: 2,
      });
    }
    if (mode === 2) {
      const price = rng.int(5, 60);
      const qty = rng.int(3, 12);
      const paid = Math.ceil((price * qty) / 10) * 10 + rng.pick([0, 5, 10]);
      return numeric({
        prefix: 'mt5-money',
        prompt: `Sebuah buku RM${price}. Beli ${qty} buah dan bayar RM${paid}.\nBerapakah baki wang?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: Number((paid - price * qty).toFixed(2)),
        explanation: `RM${price} × ${qty} = RM${price * qty}. Baki = RM${paid} − RM${price * qty} = RM${paid - price * qty}.`,
        emoji: '💰',
        speak: `Satu buku ${price} ringgit, beli ${qty}. Bayar ${paid} ringgit. Berapa baki?`,
      });
    }
    const capital = rng.int(500, 5000);
    const profitPct = rng.pick([10, 20, 25, 30]);
    const profit = (capital * profitPct) / 100;
    return numeric({
      prefix: 'mt5-money',
      prompt: `Modal perniagaan RM${capital}. Untung ${profitPct}%.\nBerapakah jumlah untung?`,
      promptSub: 'Tulis jawapan dalam RM',
      answer: profit,
      explanation: `Untung = ${profitPct}% × RM${capital} = RM${dec(profit)}.`,
      emoji: '📈',
      speak: `Modal ${capital} ringgit, untung ${profitPct} peratus. Berapa untung?`,
    });
  });
}

function mt5MasaWaktu(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const h1 = rng.int(8, 11);
      const m1 = rng.pick([0, 15, 30, 45]);
      const h2 = h1 + rng.int(1, 4);
      const m2 = rng.pick([0, 15, 30, 45]);
      const t1 = h1 * 60 + m1;
      const t2 = h2 * 60 + m2;
      const diff = t2 - t1;
      return mcq(rng, {
        prefix: 'mt5-time',
        prompt: `Program bermula ${h1}:${String(m1).padStart(2, '0')} dan tamat ${h2}:${String(m2).padStart(2, '0')}.\nBerapakah tempoh?`,
        answer: `${Math.floor(diff / 60)} jam ${diff % 60} minit`,
        distractors: [
          `${Math.floor(diff / 60) + 1} jam ${diff % 60} minit`,
          `${Math.floor(diff / 60)} jam ${(diff % 60) + 15} minit`,
          `${h2 - h1} jam ${Math.abs(m2 - m1)} minit`,
        ],
        explanation: `Dari ${h1}:${String(m1).padStart(2, '0')} hingga ${h2}:${String(m2).padStart(2, '0')} = ${Math.floor(diff / 60)} jam ${diff % 60} minit.`,
        emoji: '⏱️',
        cols: 1,
      });
    }
    if (mode === 1) {
      const speed = rng.pick([40, 60, 80, 90, 100, 110]);
      const hours = rng.int(2, 8);
      return numeric({
        prefix: 'mt5-time',
        prompt: `Sebuah kereta bergerak ${speed} km/j selama ${hours} jam.\nBerapakah jarak yang dilalui?`,
        promptSub: 'Tulis jawapan dalam km',
        answer: speed * hours,
        explanation: `Jarak = laju × masa = ${speed} × ${hours} = ${speed * hours} km.`,
        emoji: '🚗',
        speak: `Laju ${speed} kilometer per jam selama ${hours} jam. Berapa jarak?`,
      });
    }
    if (mode === 2) {
      const dist = rng.int(120, 900);
      const time = rng.pick([2, 3, 4, 5, 6]);
      if (dist % time !== 0) {
        return numeric({
          prefix: 'mt5-time',
          prompt: `${time * 60} minit = ? jam`,
          answer: time,
          explanation: `60 minit = 1 jam, jadi ${time * 60} minit = ${time} jam.`,
          emoji: '⏳',
          speak: `${time * 60} minit sama dengan berapa jam?`,
        });
      }
      return numeric({
        prefix: 'mt5-time',
        prompt: `Jarak ${dist} km ditempuh dalam ${time} jam.\nBerapakah laju purata?`,
        promptSub: 'Tulis jawapan dalam km/j',
        answer: dist / time,
        explanation: `Laju = jarak ÷ masa = ${dist} ÷ ${time} = ${dist / time} km/j.`,
        emoji: '🏎️',
        speak: `Jarak ${dist} kilometer dalam ${time} jam. Berapa laju purata?`,
      });
    }
    const hours = rng.int(2, 10);
    const rate = rng.int(2, 12);
    return numeric({
      prefix: 'mt5-time',
      prompt: `Sebuah pam mengisi ${rate} liter air setiap jam.\nBerapa liter dalam ${hours} jam?`,
      promptSub: 'Tulis jawapan dalam liter',
      answer: rate * hours,
      explanation: `${rate} ℓ/j × ${hours} j = ${rate * hours} ℓ.`,
      emoji: '🚰',
      speak: `Pam mengisi ${rate} liter sejam selama ${hours} jam. Berapa liter?`,
    });
  });
}

function mt5Ukuran(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const km = rng.int(1, 40);
      const m = rng.pick([0, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt5-measure',
        prompt: `${km} km ${m} m = ? m`,
        answer: fmt(km * 1000 + m),
        distractors: [fmt(km * 100 + m), fmt(km * 1000 + m * 10), fmt(km * 10 + m)],
        explanation: `${km} km = ${fmt(km * 1000)} m. Tambah ${m} m = ${fmt(km * 1000 + m)} m.`,
        emoji: '📏',
        cols: 1,
      });
    }
    if (mode === 1) {
      const t = rng.int(1, 8);
      const kg = rng.pick([0, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt5-measure',
        prompt: `${t} tan ${kg} kg = ? kg`,
        answer: fmt(t * 1000 + kg),
        distractors: [fmt(t * 100 + kg), fmt(t * 1000 + kg * 10), fmt(t * 10 + kg)],
        explanation: `1 tan = 1000 kg. ${t} tan ${kg} kg = ${fmt(t * 1000 + kg)} kg.`,
        emoji: '⚖️',
        cols: 1,
      });
    }
    if (mode === 2) {
      const l = rng.int(2, 20);
      const ml = rng.pick([0, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt5-measure',
        prompt: `${l} ℓ ${ml} mℓ ÷ 2 = ?`,
        answer: `${Math.floor((l * 1000 + ml) / 2000)} ℓ ${((l * 1000 + ml) / 2) % 1000} mℓ`,
        distractors: [
          `${l} ℓ ${ml} mℓ`,
          `${Math.floor(l / 2)} ℓ ${ml} mℓ`,
          `${l * 2} ℓ ${ml * 2} mℓ`,
        ],
        explanation: `Jumlah ${fmt(l * 1000 + ml)} mℓ ÷ 2 = ${fmt((l * 1000 + ml) / 2)} mℓ.`,
        emoji: '🧴',
        cols: 1,
      });
    }
    const km = rng.int(2, 30);
    const m = rng.int(100, 900);
    return numeric({
      prefix: 'mt5-measure',
      prompt: `${km} km ${m} m × 3 = ? m`,
      answer: 3 * (km * 1000 + m),
      explanation: `${fmt(km * 1000 + m)} m × 3 = ${fmt(3 * (km * 1000 + m))} m.`,
      emoji: '🔁',
      speak: `${km} kilometer ${m} meter didarab tiga. Berapa meter?`,
    });
  });
}

function mt5Ruang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const w = rng.int(4, 30);
      const h = rng.int(4, 30);
      return numeric({
        prefix: 'mt5-space',
        prompt: `Segi empat tepat ${w} cm × ${h} cm.\nBerapakah luas?`,
        promptSub: 'Tulis jawapan dalam cm²',
        answer: w * h,
        explanation: `Luas = ${w} × ${h} = ${w * h} cm².`,
        emoji: '🟦',
        speak: `Segi empat tepat ${w} kali ${h}. Berapa luas?`,
      });
    }
    if (mode === 1) {
      const b = rng.int(6, 30) * 2;
      const h = rng.int(4, 20);
      return numeric({
        prefix: 'mt5-space',
        prompt: `Segi tiga bertapak ${b} cm dan tinggi ${h} cm.\nBerapakah luas?`,
        promptSub: 'Tulis jawapan dalam cm²',
        answer: (b * h) / 2,
        explanation: `Luas = ½ × ${b} × ${h} = ${(b * h) / 2} cm².`,
        emoji: '🔺',
        speak: `Segi tiga tapak ${b} tinggi ${h}. Berapa luas?`,
      });
    }
    if (mode === 2) {
      const w = rng.int(5, 20);
      const d = rng.int(4, 15);
      const h = rng.int(3, 12);
      const vol = w * d * h;
      return numeric({
        prefix: 'mt5-space',
        prompt: `Sebuah kuboid berukuran ${w} cm × ${d} cm × ${h} cm.\nBerapakah isi padu?`,
        promptSub: 'Tulis jawapan dalam cm³',
        answer: vol,
        explanation: `Isi padu = ${w} × ${d} × ${h} = ${fmt(vol)} cm³.`,
        emoji: '📦',
        speak: `Kuboid ${w} kali ${d} kali ${h}. Berapa isi padu?`,
      });
    }
    if (mode === 3) {
      const s = rng.int(3, 15);
      return mcq(rng, {
        prefix: 'mt5-space',
        prompt: `Sebuah kubus bersisi ${s} cm.\nBerapakah jumlah panjang sisi (jumlah tepi)?`,
        answer: `${12 * s} cm`,
        distractors: [`${6 * s} cm`, `${s * s} cm`, `${4 * s} cm`, `${6 * s * s} cm`],
        explanation: `Kubus mempunyai 12 tepi: 12 × ${s} = ${12 * s} cm.`,
        emoji: '🧊',
        cols: 2,
      });
    }
    const r = rng.int(2, 12);
    const c = rng.pick([2, 3, 4, 5]);
    const pi = 22 / 7;
    const circ = 2 * pi * r;
    return mcq(rng, {
      prefix: 'mt5-space',
      prompt: `Bulatan berjejari ${r} cm. Guna π = 22/7.\nBerapakah lilitan?`,
      answer: `${dec(circ)} cm`,
      distractors: [`${dec(pi * r * r)} cm`, `${dec(2 * r)} cm`, `${dec(circ * c)} cm`],
      explanation: `Lilitan = 2πr = 2 × 22/7 × ${r} = ${dec(circ)} cm.`,
      emoji: '⭕',
      cols: 1,
    });
  });
}

function mt5KoordinatNisbah(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const a = rng.int(1, 9);
      const b = rng.int(2, 9);
      const k = rng.int(2, 8);
      return mcq(rng, {
        prefix: 'mt5-ratio',
        prompt: `Nisbah ${a} : ${b}. Jika jumlah keseluruhan ${(a + b) * k}, apakah nilai bahagian pertama?`,
        answer: String(a * k),
        distractors: [String(b * k), String((a + b) * k), String(a + k), String(a * b)],
        explanation: `Satu bahagian = ${(a + b) * k} ÷ ${a + b} = ${k}. Bahagian pertama = ${a} × ${k} = ${a * k}.`,
        emoji: '⚖️',
        cols: 2,
      });
    }
    if (mode === 1) {
      const n = rng.pick([0.5, 0.25, 0.75, 1.5, 2.5, 0.4, 0.6]);
      const qty = rng.int(20, 200);
      return numeric({
        prefix: 'mt5-ratio',
        prompt: `${n} daripada ${qty} = ?`,
        answer: Number((n * qty).toFixed(2)),
        explanation: `${n} × ${qty} = ${dec(n * qty)}.`,
        emoji: '🔢',
        speak: `${n} daripada ${qty}`,
      });
    }
    if (mode === 2) {
      const x = rng.int(1, 8);
      const y = rng.int(1, 8);
      const dx = rng.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const nx = x + dx;
      if (nx < 1 || nx > 9) {
        return numeric({
          prefix: 'mt5-coord',
          prompt: `Titik P(${x}, ${y}) digerakkan ${Math.abs(dx) > 0 ? '' : ''}${dx > 0 ? dx + ' unit ke kanan' : Math.abs(dx) + ' unit ke kiri'}.\nBerapakah koordinat-x baharu?`,
          answer: Math.min(Math.max(nx, 1), 9),
          explanation: `Gerak ke kanan menambah, ke kiri mengurang koordinat-x.`,
          emoji: '🗺️',
          speak: `Titik P pada ${x} ${y}. Berapa koordinat x baharu?`,
        });
      }
      return numeric({
        prefix: 'mt5-coord',
        prompt: `Titik P(${x}, ${y}) bergerak ${Math.abs(dx)} unit ke ${dx > 0 ? 'kanan' : 'kiri'}.\nBerapakah koordinat-x baharu?`,
        answer: nx,
        explanation: `${x} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${nx}. Koordinat baharu (${nx}, ${y}).`,
        emoji: '➡️',
        speak: `Titik P ${x} ${y} bergerak ${Math.abs(dx)} unit ke ${dx > 0 ? 'kanan' : 'kiri'}. Berapa koordinat x?`,
      });
    }
    const a = rng.int(2, 8);
    const b = rng.int(2, 8);
    const c = rng.int(2, 6);
    return numeric({
      prefix: 'mt5-ratio',
      prompt: `Nisbah A : B = ${a} : ${b}. Jika A = ${a * c}, dan jumlah keseluruhan = ?`,
      answer: (a + b) * c,
      explanation: `A = ${a * c} bermakna darab ${c}. Jumlah = (${a} + ${b}) × ${c} = ${(a + b) * c}.`,
      emoji: '🧮',
      speak: `Nisbah ${a} kepada ${b}. Jika A ${a * c}, berapa jumlah?`,
    });
  });
}

function mt5Data(_y: number, rng: Rng, count: number): Question[] {
  const items = ['Roti', 'Nasi Lemak', 'Mi Goreng', 'Roti Canai', 'Kuih'];
  return fill(count, (i) => {
    const vals = items.map(() => rng.int(5, 50));
    const total = vals.reduce((s, v) => s + v, 0);
    const max = Math.max(...vals);
    const chart = items
      .map((s, k) => `${s.padEnd(12, ' ')} ${'▇'.repeat(Math.round(vals[k] / 4))} ${vals[k]}`)
      .join('\n');
    if (i % 4 === 0) {
      return numeric({
        prefix: 'mt5-data',
        prompt: `Jualan makanan kantin:\n${chart}\nBerapakah jumlah jualan?`,
        answer: total,
        explanation: `${vals.join(' + ')} = ${total}.`,
        emoji: '🍽️',
        speak: 'Berapa jumlah semua jualan?',
      });
    }
    if (i % 4 === 1) {
      const pct = Math.round((max / total) * 100);
      return numeric({
        prefix: 'mt5-data',
        prompt: `Jualan makanan kantin:\n${chart}\nBerapakah peratus jualan ${items[vals.indexOf(max)]} daripada jumlah?`,
        promptSub: 'Bundarkan kepada nombor bulat',
        answer: pct,
        explanation: `${max} ÷ ${total} × 100% = ${pct}%.`,
        emoji: '💯',
        speak: 'Berapa peratus jualan tertinggi daripada jumlah?',
      });
    }
    if (i % 4 === 2) {
      return mcq(rng, {
        prefix: 'mt5-data',
        prompt: `Jualan makanan kantin:\n${chart}\nApakah mod (nilai paling kerap muncul jika data dikumpulkan)?`,
        answer: items[vals.indexOf(max)],
        distractors: items.filter((_, k) => k !== vals.indexOf(max)),
        explanation: `${items[vals.indexOf(max)]} mempunyai jualan terbanyak (${max}).`,
        emoji: '📊',
        cols: 2,
      });
    }
    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return numeric({
      prefix: 'mt5-data',
      prompt: `Jualan harian (disusun): ${sorted.join(', ')}\nBerapakah median?`,
      answer: median,
      explanation: `Median ialah nilai tengah = ${median}.`,
      emoji: '📈',
      speak: 'Berapa median data ini?',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 6                                                             */
/* ------------------------------------------------------------------ */

function mt6NomborJuta(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const n = rng.int(1000000, 99999999);
    if (i % 4 === 0) {
      const s = String(n);
      const labels = ['puluh juta', 'juta', 'ratus ribu', 'puluh ribu', 'ribu', 'ratus', 'puluh', 'sa'];
      const posIdx = rng.int(0, s.length - 1);
      const dv = Number(s[posIdx]);
      const lbl = labels[labels.length - s.length + posIdx];
      return mcq(rng, {
        prefix: 'mt6-num',
        prompt: `Dalam ${fmt(n)}, apakah nilai tempat digit ${dv}?`,
        answer: lbl,
        distractors: labels.filter((l) => l !== lbl).slice(0, 4),
        explanation: `Dari kanan: sa, puluh, ratus, ribu, puluh ribu, ratus ribu, juta. Digit ${dv} di tempat ${lbl}.`,
        emoji: '📍',
        cols: 1,
      });
    }
    if (i % 4 === 1) {
      const roundK = rng.pick([1000, 10000, 100000, 1000000]);
      return numeric({
        prefix: 'mt6-num',
        prompt: `Bundarkan ${fmt(n)} kepada ${fmt(roundK)} terdekat.`,
        answer: Math.round(n / roundK) * roundK,
        explanation: `${fmt(n)} ≈ ${fmt(Math.round(n / roundK) * roundK)}.`,
        emoji: '🎯',
        speak: `Bundarkan ${n} kepada ${roundK} terdekat.`,
      });
    }
    if (i % 4 === 2) {
      const a = rng.int(1000000, 60000000);
      const b = rng.int(100000, 30000000);
      return numeric({
        prefix: 'mt6-num',
        prompt: `${fmt(a)} + ${fmt(b)} = ?`,
        answer: a + b,
        explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`,
        emoji: '➕',
        speak: `${a} tambah ${b}`,
      });
    }
    const a = rng.int(5000000, 90000000);
    const b = rng.int(100000, 4000000);
    return numeric({
      prefix: 'mt6-num',
      prompt: `${fmt(a)} − ${fmt(b)} = ?`,
      answer: a - b,
      explanation: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`,
      emoji: '➖',
      speak: `${a} tolak ${b}`,
    });
  });
}

function mt6PecahanPerpuluhanPeratus(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const a1 = rng.int(1, 8);
      const d1 = rng.int(a1 + 1, 12);
      const a2 = rng.int(1, 8);
      const d2 = rng.int(a2 + 1, 12);
      const num = a1 * d2 + a2 * d1;
      const den = d1 * d2;
      const g = gcdOf(num, den);
      return mcq(rng, {
        prefix: 'mt6-frac',
        prompt: `${a1}/${d1} + ${a2}/${d2} = ?`,
        answer: `${num / g}/${den / g}`,
        distractors: [`${a1 + a2}/${d1 + d2}`, `${num}/${den}`, `${num + 1}/${den}`, `${num}/${den + 1}`],
        explanation: `Penyebut sepunya ${den}: ${num}/${den} = ${num / g}/${den / g}.`,
        emoji: '➕',
        cols: 1,
      });
    }
    if (mode === 1) {
      const whole = rng.pick([2, 3, 4, 5]) * 100;
      const pct = rng.pick([5, 12, 15, 24, 35, 45]);
      return numeric({
        prefix: 'mt6-pct',
        prompt: `${pct}% daripada ${whole} = ?`,
        answer: (whole * pct) / 100,
        explanation: `${pct}/100 × ${whole} = ${dec((whole * pct) / 100)}.`,
        emoji: '💯',
        speak: `${pct} peratus daripada ${whole}`,
      });
    }
    if (mode === 2) {
      const a = rng.int(1000, 9999) / 100;
      const b = rng.int(2, 9);
      return numeric({
        prefix: 'mt6-dec',
        prompt: `${a.toFixed(2)} × ${b} = ?`,
        promptSub: 'Tulis 2 tempat perpuluhan',
        answer: Number((a * b).toFixed(2)),
        explanation: `${a.toFixed(2)} × ${b} = ${(a * b).toFixed(2)}.`,
        emoji: '✖️',
        speak: `${a.toFixed(2)} darab ${b}`,
      });
    }
    if (mode === 3) {
      const b = rng.int(2, 9);
      const q = rng.int(100, 900);
      return numeric({
        prefix: 'mt6-dec',
        prompt: `${(b * q).toFixed(2)} ÷ ${b} = ?`,
        promptSub: 'Tulis 2 tempat perpuluhan',
        answer: Number(((b * q) / b).toFixed(2)),
        explanation: `${(b * q).toFixed(2)} ÷ ${b} = ${q.toFixed(2)}.`,
        emoji: '➗',
        speak: `${b * q} bahagi ${b}`,
      });
    }
    const whole = rng.pick([80, 120, 200, 250, 400, 500]);
    const pct = rng.pick([10, 20, 25, 40, 60]);
    return numeric({
      prefix: 'mt6-pct',
      prompt: `Harga sebuah barang RM${whole}. Diskaun ${pct}%.\nBerapakah harga selepas diskaun?`,
      promptSub: 'Tulis jawapan dalam RM',
      answer: Number((whole - (whole * pct) / 100).toFixed(2)),
      explanation: `Diskaun RM${dec((whole * pct) / 100)}. Harga baharu RM${dec(whole - (whole * pct) / 100)}.`,
      emoji: '🏷️',
      speak: `Harga ${whole} ringgit, diskaun ${pct} peratus.`,
    });
  });
}

function mt6Wang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const price = rng.int(100, 2000);
      const pct = rng.pick([10, 15, 20, 25, 30]);
      const disc = (price * pct) / 100;
      return numeric({
        prefix: 'mt6-money',
        prompt: `Harga asal RM${price}. Diskaun ${pct}%.\nBerapakah harga selepas diskaun?`,
        promptSub: 'Tulis jawapan dalam RM (2 tempat perpuluhan)',
        answer: Number((price - disc).toFixed(2)),
        explanation: `Diskaun RM${dec(disc)}. Harga baharu RM${dec(price - disc)}.`,
        emoji: '🏷️',
        speak: `Harga ${price} ringgit diskaun ${pct} peratus.`,
      });
    }
    if (mode === 1) {
      const cost = rng.int(10, 200);
      const qty = rng.int(5, 40);
      const sold = rng.int(Math.ceil(qty * 0.6), qty);
      const sellPrice = cost + rng.int(2, 20);
      const profit = (sellPrice - cost) * sold;
      return numeric({
        prefix: 'mt6-money',
        prompt: `Peniaga beli ${qty} kotak pada RM${cost} sekotak dan jual ${sold} kotak pada RM${sellPrice} sekotak.\nBerapakah jumlah keuntungan?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: profit,
        explanation: `Untung sekotak = RM${sellPrice} − RM${cost} = RM${sellPrice - cost}. Jumlah = RM${sellPrice - cost} × ${sold} = RM${profit}.`,
        emoji: '📈',
        speak: `Berapa jumlah keuntungan?`,
      });
    }
    if (mode === 2) {
      const principal = rng.int(1000, 20000);
      const rate = rng.pick([2, 3, 4, 5]);
      const years = rng.int(2, 6);
      const interest = (principal * rate * years) / 100;
      return numeric({
        prefix: 'mt6-money',
        prompt: `Simpanan RM${fmt(principal)} dengan faedah mudah ${rate}% setahun selama ${years} tahun.\nBerapakah jumlah faedah?`,
        promptSub: 'Tulis jawapan dalam RM',
        answer: Number(interest.toFixed(2)),
        explanation: `Faedah = P × R × T / 100 = ${fmt(principal)} × ${rate} × ${years} / 100 = RM${dec(interest)}.`,
        emoji: '🏦',
        speak: `Simpanan ${principal} ringgit, faedah ${rate} peratus selama ${years} tahun.`,
      });
    }
    const total = rng.int(100, 4000);
    const people = rng.pick([4, 5, 6, 8, 10]);
    return numeric({
      prefix: 'mt6-money',
      prompt: `Bil RM${fmt(total)} dikongsi sama rata antara ${people} orang.\nBerapakah setiap orang bayar?`,
      promptSub: 'Tulis jawapan dalam RM (2 tempat perpuluhan)',
      answer: Number((total / people).toFixed(2)),
      explanation: `RM${fmt(total)} ÷ ${people} = RM${dec(total / people)}.`,
      emoji: '👥',
      speak: `${total} ringgit dikongsi ${people} orang. Setiap orang berapa?`,
    });
  });
}

function mt6MasaWaktu(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const speed = rng.pick([60, 70, 80, 90, 100, 110]);
      const time = rng.int(2, 9);
      return numeric({
        prefix: 'mt6-time',
        prompt: `Sebuah bas bergerak ${speed} km/j selama ${time} jam ${rng.pick([0, 30])} minit.\nBerapakah jumlah jarak (anggaran jam sahaja)?`,
        promptSub: 'Tulis jawapan dalam km',
        answer: speed * time,
        explanation: `Jarak ≈ ${speed} × ${time} = ${speed * time} km.`,
        emoji: '🚌',
        speak: `Laju ${speed} kilometer sejam selama ${time} jam. Berapa jarak?`,
      });
    }
    if (mode === 1) {
      const dist = rng.int(150, 900);
      const time = rng.pick([2, 3, 4, 5, 6]);
      if (dist % time !== 0) {
        return numeric({
          prefix: 'mt6-time',
          prompt: `${time * 120} minit = ? jam`,
          answer: time * 2,
          explanation: `120 minit = 2 jam, jadi ${time * 120} minit = ${time * 2} jam.`,
          emoji: '⏳',
          speak: `${time * 120} minit sama dengan berapa jam?`,
        });
      }
      return numeric({
        prefix: 'mt6-time',
        prompt: `Jarak ${dist} km dalam ${time} jam.\nBerapakah laju purata?`,
        promptSub: 'Tulis jawapan dalam km/j',
        answer: dist / time,
        explanation: `Laju = ${dist} ÷ ${time} = ${dist / time} km/j.`,
        emoji: '🏎️',
        speak: `Jarak ${dist} kilometer dalam ${time} jam. Berapa laju?`,
      });
    }
    if (mode === 2) {
      const tz = rng.pick([
        ['London', -8],
        ['New York', -13],
        ['Tokyo', 1],
        ['Sydney', 2],
        ['Dubai', -4],
        ['New Delhi', -2.5],
      ]);
      const h = rng.int(8, 20);
      const nh = ((h + Number(tz[1])) % 24 + 24) % 24;
      return mcq(rng, {
        prefix: 'mt6-time',
        prompt: `Pukul ${h}:00 di Malaysia. Malaysia ialah UTC+8.\nPukul berapakah di ${tz[0]}?`,
        answer: `${nh}:00`,
        distractors: [`${(nh + 3) % 24}:00`, `${(nh + 24 - 3) % 24}:00`, `${(nh + 8) % 24}:00`, `${(nh + 6) % 24}:00`],
        explanation: `Malaysia UTC+8, ${tz[0]} UTC${Number(tz[1]) >= 0 ? '+' : ''}${tz[1]}. Beza ${Number(tz[1]) - 8} jam, maka ${h}:00 → ${nh}:00.`,
        emoji: '🌏',
        cols: 2,
      });
    }
    if (mode === 3) {
      const days = rng.int(200, 900);
      return mcq(rng, {
        prefix: 'mt6-time',
        prompt: `${days} hari = ? tahun ? hari`,
        answer: `${Math.floor(days / 365)} tahun ${days % 365} hari`,
        distractors: [
          `${Math.floor(days / 360)} tahun ${days % 360} hari`,
          `${Math.floor(days / 365)} tahun ${(days % 365) + 5} hari`,
          `${days} tahun 0 hari`,
        ],
        explanation: `${days} ÷ 365 = ${Math.floor(days / 365)} baki ${days % 365}.`,
        emoji: '📅',
        cols: 1,
      });
    }
    const start = rng.int(8, 10);
    const mins = rng.pick([90, 120, 150, 180, 210]);
    const total = start * 60 + mins;
    const eh = Math.floor(total / 60) % 12 || 12;
    const em = total % 60;
    return mcq(rng, {
      prefix: 'mt6-time',
      prompt: `Perjalanan bermula ${start}:00 pagi dan mengambil masa ${mins} minit.\nPukul berapa tiba?`,
      answer: `${eh}:${String(em).padStart(2, '0')}`,
      distractors: [
        `${start + Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`,
        `${eh}:${String((em + 30) % 60).padStart(2, '0')}`,
        `${eh === 12 ? 1 : eh + 1}:${String(em).padStart(2, '0')}`,
      ],
      explanation: `${mins} minit = ${Math.floor(mins / 60)} jam ${mins % 60} minit. Tiba ${eh}:${String(em).padStart(2, '0')}.`,
      emoji: '🚗',
      cols: 2,
    });
  });
}

function mt6Ukuran(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const km = rng.int(2, 50);
      const m = rng.pick([0, 250, 500, 750]);
      return mcq(rng, {
        prefix: 'mt6-measure',
        prompt: `${km} km ${m} m = ? km`,
        answer: `${dec((km * 1000 + m) / 1000)} km`,
        distractors: [
          `${dec((km * 1000 + m) / 100)} km`,
          `${km}.${m} km`,
          `${dec((km * 1000 + m) / 10000)} km`,
        ],
        explanation: `${fmt(km * 1000 + m)} m ÷ 1000 = ${dec((km * 1000 + m) / 1000)} km.`,
        emoji: '📏',
        cols: 1,
      });
    }
    if (mode === 1) {
      const kg = rng.int(1, 9);
      const g = rng.int(100, 900);
      return mcq(rng, {
        prefix: 'mt6-measure',
        prompt: `${kg} kg ${g} g = ? kg`,
        answer: `${dec(kg + g / 1000, 3)} kg`,
        distractors: [`${dec(kg + g / 100, 3)} kg`, `${kg}.${g} kg`, `${dec(kg + g / 10000, 3)} kg`],
        explanation: `${g} g = ${dec(g / 1000, 3)} kg, jadi ${dec(kg + g / 1000, 3)} kg.`,
        emoji: '⚖️',
        cols: 1,
      });
    }
    if (mode === 2) {
      const l = rng.int(1, 9);
      const ml = rng.int(100, 900);
      return mcq(rng, {
        prefix: 'mt6-measure',
        prompt: `${l} ℓ ${ml} mℓ × 4 = ?`,
        answer: `${4 * l + Math.floor((4 * ml) / 1000)} ℓ ${(4 * ml) % 1000} mℓ`,
        distractors: [
          `${4 * l} ℓ ${4 * ml} mℓ`,
          `${4 * l} ℓ ${ml} mℓ`,
          `${l} ℓ ${4 * ml} mℓ`,
        ],
        explanation: `${l} ℓ ${ml} mℓ = ${fmt(l * 1000 + ml)} mℓ. × 4 = ${fmt(4 * (l * 1000 + ml))} mℓ.`,
        emoji: '🧴',
        cols: 1,
      });
    }
    const a = rng.int(2, 20);
    const b = rng.int(2, 20);
    const c = rng.int(2, 20);
    const vol = a * b * c;
    return numeric({
      prefix: 'mt6-measure',
      prompt: `Sebuah tangki ${a} m × ${b} m × ${c} m diisi penuh air.\nBerapakah isi padu dalam m³?`,
      promptSub: 'Tulis jawapan dalam m³',
      answer: vol,
      explanation: `Isi padu = ${a} × ${b} × ${c} = ${fmt(vol)} m³.`,
      emoji: '🛢️',
      speak: `Tangki ${a} kali ${b} kali ${c} meter. Berapa isi padu?`,
    });
  });
}

function mt6Ruang(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const w = rng.int(5, 30);
      const h = rng.int(5, 30);
      const want = rng.chance(0.5);
      return numeric({
        prefix: 'mt6-space',
        prompt: `Segi empat tepat ${w} cm × ${h} cm.\nBerapakah ${want ? 'luas (cm²)' : 'perimeter (cm)'}?`,
        answer: want ? w * h : 2 * (w + h),
        explanation: want
          ? `Luas = ${w} × ${h} = ${w * h} cm².`
          : `Perimeter = 2(${w} + ${h}) = ${2 * (w + h)} cm.`,
        emoji: '🟦',
        speak: `Segi empat tepat ${w} kali ${h}. Berapa ${want ? 'luas' : 'perimeter'}?`,
      });
    }
    if (mode === 1) {
      const b = rng.int(6, 40) * 2;
      const h = rng.int(4, 25);
      return numeric({
        prefix: 'mt6-space',
        prompt: `Segi tiga bertapak ${b} cm dan tinggi ${h} cm.\nBerapakah luas?`,
        promptSub: 'Tulis jawapan dalam cm²',
        answer: (b * h) / 2,
        explanation: `Luas = ½ × ${b} × ${h} = ${(b * h) / 2} cm².`,
        emoji: '🔺',
        speak: `Segi tiga tapak ${b} tinggi ${h}. Berapa luas?`,
      });
    }
    if (mode === 2) {
      const r = rng.int(3, 21);
      const pi = 22 / 7;
      const wantCirc = r % 7 !== 0;
      return mcq(rng, {
        prefix: 'mt6-space',
        prompt: `Bulatan berjejari ${r} cm. Guna π = 22/7.\nBerapakah ${wantCirc ? 'lilitan' : 'luas'}?`,
        answer: `${dec(wantCirc ? 2 * pi * r : pi * r * r)} cm${wantCirc ? '' : '²'}`,
        distractors: [
          `${dec(wantCirc ? pi * r * r : 2 * pi * r)} cm`,
          `${dec(2 * pi * r * r)} cm`,
          `${dec(pi * r)} cm`,
        ],
        explanation: wantCirc
          ? `Lilitan = 2πr = 2 × 22/7 × ${r} = ${dec(2 * pi * r)} cm.`
          : `Luas = πr² = 22/7 × ${r}² = ${dec(pi * r * r)} cm².`,
        emoji: '⭕',
        cols: 1,
      });
    }
    if (mode === 3) {
      const a = rng.int(4, 20);
      const b = rng.int(3, 15);
      const h = rng.int(3, 12);
      return mcq(rng, {
        prefix: 'mt6-space',
        prompt: `Sebuah prisma segi tiga: luas tapak ${a * b} cm², tinggi ${h} cm.\nBerapakah isi padu?`,
        promptSub: 'Tulis jawapan dalam cm³',
        answer: fmt(a * b * h),
        distractors: [fmt(a * b + h), fmt(a * b * h * 2), fmt(a * h + b)],
        explanation: `Isi padu = luas tapak × tinggi = ${a * b} × ${h} = ${fmt(a * b * h)} cm³.`,
        emoji: '🔺',
        cols: 1,
      });
    }
    const known = rng.pick([
      ['segi tiga sama sisi', 3, 60, 60, 60],
      ['segi tiga sama kaki', 3, 70, 55, 55],
      ['segi tiga bersudut tepat', 3, 90, 45, 45],
      ['segi tiga tak sama sisi', 3, 80, 60, 40],
      ['segi empat sama', 4, 90, 90, 90],
      ['pentagon sekata', 5, 108, 108, 108],
      ['heksagon sekata', 6, 120, 120, 120],
    ]);
    const sides = Number(known[1]);
    const ang = Number(known[2]);
    return mcq(rng, {
      prefix: 'mt6-space',
      prompt: `Sebuah ${known[0]} mempunyai ${sides} sisi.\nBerapakah saiz setiap sudut pedalaman?`,
      answer: `${ang}°`,
      distractors: [`${ang + 10}°`, `${ang - 15}°`, `${180 - ang}°`, `${ang * 2}°`],
      explanation: `${known[0]} mempunyai ${sides} sisi dengan setiap sudut pedalaman ${ang}°.`,
      emoji: '📐',
      cols: 2,
    });
  });
}

function mt6Koordinat(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const x = rng.int(1, 9);
      const y = rng.int(1, 9);
      return mcq(rng, {
        prefix: 'mt6-coord',
        prompt: `Titik Q berada pada koordinat (${x}, ${y}).\nApakah koordinat-y bagi titik Q?`,
        answer: String(y),
        distractors: [String(x), String(y + 1), String(Math.max(y - 1, 1)), String(x + y)],
        explanation: `Koordinat ditulis (x, y). Jadi bagi (${x}, ${y}), koordinat-y ialah ${y}.`,
        emoji: '🗺️',
        cols: 2,
      });
    }
    if (mode === 1) {
      const x = rng.int(2, 8);
      const y = rng.int(2, 8);
      const dx = rng.pick([-3, -2, -1, 1, 2, 3]);
      const dy = rng.pick([-3, -2, -1, 1, 2, 3]);
      const nx = Math.min(Math.max(x + dx, 1), 9);
      const ny = Math.min(Math.max(y + dy, 1), 9);
      return mcq(rng, {
        prefix: 'mt6-coord',
        prompt: `Titik R(${x}, ${y}) bergerak ${Math.abs(dx)} unit ke ${dx > 0 ? 'kanan' : 'kiri'} dan ${Math.abs(dy)} unit ke ${dy > 0 ? 'atas' : 'bawah'}.\nApakah koordinat baharu?`,
        answer: `(${nx}, ${ny})`,
        distractors: [`(${ny}, ${nx})`, `(${x}, ${ny})`, `(${nx}, ${y})`, `(${nx + 1}, ${ny})`],
        explanation: `${x} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${nx}; ${y} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${ny}. Koordinat baharu (${nx}, ${ny}).`,
        emoji: '📍',
        cols: 2,
      });
    }
    if (mode === 2) {
      const a = rng.int(2, 10);
      const b = rng.int(2, 10);
      const k = rng.int(2, 9);
      return numeric({
        prefix: 'mt6-ratio',
        prompt: `Nisbah x : y = ${a} : ${b}. Jika x = ${a * k}, berapakah y?`,
        answer: b * k,
        explanation: `x didarab ${k}, jadi y juga didarab ${k}: ${b} × ${k} = ${b * k}.`,
        emoji: '⚖️',
        speak: `Nisbah ${a} kepada ${b}. Jika x ${a * k}, berapa y?`,
      });
    }
    const speed = rng.pick([60, 70, 80, 90, 100]);
    const dist = speed * rng.int(2, 6);
    return numeric({
      prefix: 'mt6-ratio',
      prompt: `Sebuah kereta bergerak pada ${speed} km/j.\nBerapa jam untuk menempuh ${dist} km?`,
      promptSub: 'Tulis jawapan dalam jam',
      answer: dist / speed,
      explanation: `Masa = jarak ÷ laju = ${dist} ÷ ${speed} = ${dist / speed} jam.`,
      emoji: '🚗',
      speak: `Laju ${speed} kilometer sejam. Berapa jam untuk ${dist} kilometer?`,
    });
  });
}

function mt6DataKebolehjadian(_y: number, rng: Rng, count: number): Question[] {
  const names = ['Amin', 'Bella', 'Chandran', 'Devi', 'Farid', 'Ganesh', 'Hafiz', 'Iman'];
  return fill(count, (i) => {
    const mode = i % 5;
    if (mode === 0) {
      const picked = rng.sample(names, 5);
      const vals = picked.map(() => rng.int(40, 100));
      const total = vals.reduce((s, v) => s + v, 0);
      const chart = picked.map((s, k) => `${s.padEnd(10, ' ')} ${'▇'.repeat(Math.round(vals[k] / 8))} ${vals[k]}`).join('\n');
      return numeric({
        prefix: 'mt6-data',
        prompt: `Markah ujian Matematik 6 Gemilang:\n${chart}\nBerapakah markah purata?`,
        promptSub: 'Bundarkan kepada nombor bulat',
        answer: Math.round(total / picked.length),
        explanation: `Jumlah ${total} ÷ ${picked.length} = ${dec(total / picked.length, 1)} ≈ ${Math.round(total / picked.length)}.`,
        emoji: '📈',
        speak: 'Berapa markah purata?',
      });
    }
    if (mode === 1) {
      const picked = rng.sample(names, 6);
      const vals = picked.map(() => rng.int(20, 100));
      const sorted = [...vals].sort((a, b) => a - b);
      const median = (sorted[2] + sorted[3]) / 2;
      return numeric({
        prefix: 'mt6-data',
        prompt: `Markah (disusun): ${sorted.join(', ')}\nBerapakah median?`,
        answer: median,
        explanation: `Bilangan data genap, jadi median ialah purata dua nilai tengah: (${sorted[2]} + ${sorted[3]}) ÷ 2 = ${dec(median)}.`,
        emoji: '📊',
        speak: 'Berapa median data ini?',
      });
    }
    if (mode === 2) {
      const picked = rng.sample(names, 5);
      const vals = picked.map(() => rng.int(40, 100));
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const chart = picked.map((s, k) => `${s.padEnd(10, ' ')} ${'▇'.repeat(Math.round(vals[k] / 8))} ${vals[k]}`).join('\n');
      return numeric({
        prefix: 'mt6-data',
        prompt: `Markah ujian Matematik 6 Gemilang:\n${chart}\nBerapakah julat (beza markah tertinggi dan terendah)?`,
        answer: max - min,
        explanation: `Julat = ${max} − ${min} = ${max - min}.`,
        emoji: '📏',
        speak: 'Berapa julat markah?',
      });
    }
    if (mode === 3) {
      const red = rng.int(2, 8);
      const blue = rng.int(2, 8);
      const green = rng.int(2, 8);
      const total = red + blue + green;
      const wantRed = rng.chance(0.5);
      const num = wantRed ? red : blue;
      const color = wantRed ? 'merah' : 'biru';
      const g = gcdOf(num, total);
      return mcq(rng, {
        prefix: 'mt6-prob',
        prompt: `Sebuah beg berisi ${red} guli merah, ${blue} guli biru dan ${green} guli hijau.\nApakah kebolehjadian mendapat guli ${color}?`,
        answer: `${num / g}/${total / g}`,
        distractors: [`${num}/${total - num}`, `${total - num}/${total}`, `${num + 1}/${total}`, `1/${total}`],
        explanation: `Kebolehjadian = ${num}/${total} = ${num / g}/${total / g}.`,
        emoji: '🎲',
        cols: 1,
      });
    }
    const outcomes = rng.int(2, 12);
    const favourable = rng.int(1, outcomes - 1);
    return mcq(rng, {
      prefix: 'mt6-prob',
      prompt: `Sebuah roda dibahagi kepada ${outcomes} bahagian sama besar. ${favourable} bahagian berwarna kuning.\nApakah kebolehjadian mendapat kuning?`,
      answer: `${favourable}/${outcomes}`,
      distractors: [`${outcomes}/${favourable}`, `${favourable}/${outcomes - favourable}`, `${favourable + 1}/${outcomes}`, `1/${outcomes}`],
      explanation: `${favourable} bahagian kuning daripada ${outcomes} bahagian sama besar = ${favourable}/${outcomes}.`,
      emoji: '🎡',
      cols: 2,
    });
  });
}

export const MATEMATIK_GENERATORS_56: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'mt5-nombor-juta': mt5NomborJuta,
  'mt5-pecahan-perpuluhan-peratus': mt5PecahanPerpuluhanPeratus,
  'mt5-wang': mt5Wang,
  'mt5-masa-waktu': mt5MasaWaktu,
  'mt5-ukuran': mt5Ukuran,
  'mt5-ruang': mt5Ruang,
  'mt5-koordinat-nisbah': mt5KoordinatNisbah,
  'mt5-data': mt5Data,
  'mt6-nombor-juta': mt6NomborJuta,
  'mt6-pecahan-perpuluhan-peratus': mt6PecahanPerpuluhanPeratus,
  'mt6-wang': mt6Wang,
  'mt6-masa-waktu': mt6MasaWaktu,
  'mt6-ukuran': mt6Ukuran,
  'mt6-ruang': mt6Ruang,
  'mt6-koordinat': mt6Koordinat,
  'mt6-data-kebolehjadian': mt6DataKebolehjadian,
};
