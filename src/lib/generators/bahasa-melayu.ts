/**
 * Penjana latihan Bahasa Melayu (KSSR Semakan 2017).
 * Fokus: kemahiran bahasa (mendengar & bertutur, membaca, menulis),
 * tatabahasa dan seni bahasa.
 */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { fill, fillBlank, match, mcq, order, trueFalse } from './shared';

const SUKU_KATA_1: Record<string, [string, string]> = {
  'ba': ['baju', 'batu'],
  'bo': ['botol', 'bola'],
  'bu': ['buku', 'bulan'],
  'ca': ['cawan', 'cakap'],
  'da': ['dada', 'dapur'],
  'du': ['duri', 'duduk'],
  'ga': ['gajah', 'gaji'],
  'ja': ['jalan', 'jam'],
  'ka': ['kaki', 'kain'],
  'la': ['lampu', 'laut'],
  'ma': ['makan', 'mata'],
  'na': ['nasi', 'naga'],
  'pa': ['padi', 'paku'],
  'ra': ['rumah', 'raja'],
  'sa': ['sapu', 'satu'],
  'ta': ['tangan', 'tali'],
};

const PERKATAAN_KVKV = [
  'baju', 'bola', 'buku', 'bulan', 'cawan', 'dada', 'dapur', 'duri', 'duduk',
  'gajah', 'gaji', 'jalan', 'kaki', 'kain', 'lampu', 'laut', 'makan', 'mata',
  'nasi', 'naga', 'padi', 'paku', 'rumah', 'raja', 'sapu', 'tangan', 'tali',
];

const KATA_NAMA = ['Ali', 'rumah', 'meja', 'sekolah', 'buku', 'guru', 'Murid', 'kerusi'];
const KATA_KERJA = ['berlari', 'makan', 'menulis', 'membaca', 'tidur', 'melompat', 'menyanyi', 'menangis'];
const KATA_ADJEKTIF = ['cantik', 'besar', 'rajin', 'pintar', 'harum', 'sejuk', 'comel', 'tinggi'];

/* ------------------------------------------------------------------ */
/* Tahun 1                                                             */
/* ------------------------------------------------------------------ */

function bm1HurufSukuKata(_y: number, rng: Rng, count: number): Question[] {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const keys = Object.keys(SUKU_KATA_1);
      const k = rng.pick(keys);
      const [word] = SUKU_KATA_1[k];
      return mcq(rng, {
        prefix: 'bm1-huruf',
        prompt: `Perkataan "${word}" bermula dengan suku kata apa?`,
        answer: k,
        distractors: keys.filter((x) => x !== k).slice(0, 3),
        explanation: `"${word}" dieja ${k}-${word.slice(k.length)}, bermula dengan suku kata "${k}".`,
        emoji: '🔤',
        cols: 2,
        speak: `Perkataan ${word} bermula dengan suku kata apa?`,
      });
    }
    if (mode === 1) {
      const word = rng.pick(PERKATAAN_KVKV);
      const idx = rng.int(1, word.length - 1);
      const missing = word[idx];
      const masked = word.slice(0, idx) + '_' + word.slice(idx + 1);
      return mcq(rng, {
        prefix: 'bm1-huruf',
        prompt: `Lengkapkan perkataan: ${masked}`,
        promptSub: 'Pilih huruf yang betul.',
        answer: missing,
        distractors: vowels.filter((v) => v !== missing).concat(['r', 'm', 'p', 'k']).slice(0, 3),
        explanation: `Perkataan yang betul ialah "${word}".`,
        emoji: '✏️',
        cols: 2,
        speak: `Lengkapkan perkataan ${masked}`,
      });
    }
    if (mode === 2) {
      const keys = Object.keys(SUKU_KATA_1);
      const picked = rng.sample(keys, 3);
      return match({
        prefix: 'bm1-huruf',
        prompt: 'Padankan suku kata dengan perkataan yang betul.',
        pairs: picked.map((k) => ({ left: k, right: SUKU_KATA_1[k][0] })),
        explanation: 'Suku kata awal mesti sepadan dengan perkataan.',
        emoji: '🔗',
      });
    }
    const word = rng.pick(PERKATAAN_KVKV);
    const v = rng.pick(vowels);
    return fillBlank(rng, {
      prefix: 'bm1-huruf',
      prompt: `Pilih perkataan yang mengandungi huruf "${v}".`,
      answer: word.includes(v) ? word : 'baju',
      options: rng.shuffle(PERKATAAN_KVKV).slice(0, 3).concat(['baju']),
      explanation: `"${word}" mengandungi huruf vokal "${v}".`,
      emoji: '🅰️',
      cols: 1,
    });
  });
}

function bm1MembacaPerkataan(_y: number, rng: Rng, count: number): Question[] {
  const easy = PERKATAAN_KVKV;
  const items = [
    { w: 'baju', e: '👕' },
    { w: 'bola', e: '⚽' },
    { w: 'bulan', e: '🌙' },
    { w: 'gajah', e: '🐘' },
    { w: 'lampu', e: '💡' },
    { w: 'laut', e: '🌊' },
    { w: 'nasi', e: '🍚' },
    { w: 'rumah', e: '🏠' },
    { w: 'raja', e: '👑' },
    { w: 'tangan', e: '✋' },
    { w: 'mata', e: '👁️' },
    { w: 'kaki', e: '🦶' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const it = rng.pick(items);
      return mcq(rng, {
        prefix: 'bm1-baca',
        prompt: `${it.e} Apakah nama benda ini?`,
        answer: it.w,
        distractors: rng.shuffle(items.filter((x) => x.w !== it.w)).slice(0, 3).map((x) => x.w),
        explanation: `Gambar ${it.e} ialah "${it.w}".`,
        emoji: '🖼️',
        cols: 2,
        speak: `Apakah nama benda ini?`,
      });
    }
    if (i % 3 === 1) {
      const it = rng.pick(items);
      return mcq(rng, {
        prefix: 'bm1-baca',
        prompt: `Pilih gambar bagi perkataan "${it.w}".`,
        answer: it.e,
        distractors: rng.shuffle(items.filter((x) => x.w !== it.w)).slice(0, 3).map((x) => x.e),
        explanation: `"${it.w}" ialah ${it.e}.`,
        emoji: '🔍',
        cols: 2,
        speak: `Pilih gambar bagi perkataan ${it.w}`,
      });
    }
    const word = rng.pick(easy);
    const first = word[0];
    return mcq(rng, {
      prefix: 'bm1-baca',
      prompt: `Apakah huruf pertama dalam perkataan "${word}"?`,
      answer: first.toUpperCase(),
      distractors: rng.shuffle('abcdefghijklmnopqrstuvwxyz'.split('')).filter((c) => c !== first).slice(0, 3).map((c) => c.toUpperCase()),
      explanation: `Huruf pertama "${word}" ialah "${first.toUpperCase()}".`,
      emoji: '🔠',
      cols: 2,
      speak: `Apakah huruf pertama dalam ${word}?`,
    });
  });
}

function bm1MenulisAyat(_y: number, rng: Rng, count: number): Question[] {
  const sentences = [
    { s: 'Saya suka makan nasi lemak.', w: 'suka' },
    { s: 'Ayah pergi ke pejabat.', w: 'pergi' },
    { s: 'Emak memasak di dapur.', w: 'memasak' },
    { s: 'Adik bermain bola di padang.', w: 'bermain' },
    { s: 'Kami belajar di sekolah.', w: 'belajar' },
    { s: 'Burung terbang di langit.', w: 'terbang' },
    { s: 'Kucing itu tidur di sofa.', w: 'tidur' },
    { s: 'Guru mengajar kami Matematik.', w: 'mengajar' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(sentences);
    if (i % 3 === 0) {
      return order({
        prefix: 'bm1-tulis',
        prompt: 'Susun perkataan menjadi ayat yang betul.',
        items: rng.shuffle(it.s.replace('.', '').split(' ')),
        correctOrder: it.s.replace('.', '').split(' '),
        explanation: `Ayat yang betul: "${it.s}"`,
        emoji: '🧩',
      });
    }
    if (i % 3 === 1) {
      const words = it.s.replace('.', '').split(' ');
      const idx = rng.int(0, words.length - 1);
      const masked = words.map((w, k) => (k === idx ? '____' : w)).join(' ');
      return mcq(rng, {
        prefix: 'bm1-tulis',
        prompt: `Lengkapkan ayat:\n${masked}`,
        answer: words[idx],
        distractors: rng.shuffle(words.filter((w) => w !== words[idx])).slice(0, 3),
        explanation: `Ayat lengkap: "${it.s}"`,
        emoji: '✏️',
        cols: 1,
        speak: 'Lengkapkan ayat ini.',
      });
    }
    return trueFalse({
      prefix: 'bm1-tulis',
      prompt: `Ayat "${it.s}" bermula dengan huruf besar dan berakhir dengan noktah.`,
      isTrue: true,
      explanation: 'Ayat yang betul bermula dengan huruf besar dan berakhir dengan noktah.',
      emoji: '📝',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 2                                                             */
/* ------------------------------------------------------------------ */

function bm2KataNamaKerja(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const w = rng.pick(KATA_NAMA);
      return mcq(rng, {
        prefix: 'bm2-tatabahasa',
        prompt: `Perkataan "${w}" ialah kata nama / kata kerja / kata adjektif?`,
        answer: 'Kata nama',
        distractors: ['Kata kerja', 'Kata adjektif', 'Kata sendi'],
        explanation: `"${w}" ialah kata nama kerana ia menamakan orang, tempat atau benda.`,
        emoji: '🏷️',
        cols: 1,
        speak: `Perkataan ${w} ialah kata apa?`,
      });
    }
    if (mode === 1) {
      const w = rng.pick(KATA_KERJA);
      return mcq(rng, {
        prefix: 'bm2-tatabahasa',
        prompt: `Perkataan "${w}" ialah jenis kata apa?`,
        answer: 'Kata kerja',
        distractors: ['Kata nama', 'Kata adjektif', 'Kata bilangan'],
        explanation: `"${w}" ialah kata kerja kerana ia menunjukkan perbuatan.`,
        emoji: '🏃',
        cols: 1,
        speak: `Perkataan ${w} ialah kata apa?`,
      });
    }
    if (mode === 2) {
      const w = rng.pick(KATA_ADJEKTIF);
      return mcq(rng, {
        prefix: 'bm2-tatabahasa',
        prompt: `Perkataan "${w}" ialah jenis kata apa?`,
        answer: 'Kata adjektif',
        distractors: ['Kata nama', 'Kata kerja', 'Kata ganti nama'],
        explanation: `"${w}" ialah kata adjektif kerana ia menerangkan sifat.`,
        emoji: '🌈',
        cols: 1,
        speak: `Perkataan ${w} ialah kata apa?`,
      });
    }
    const picked = rng.sample(KATA_KERJA, 3);
    return match({
      prefix: 'bm2-tatabahasa',
      prompt: 'Padankan kata kerja dengan gambar yang sesuai.',
      pairs: picked.map((w) => ({ left: w, right: emojiForVerb(w) })),
      explanation: 'Setiap kata kerja menunjukkan perbuatan tertentu.',
      emoji: '🎭',
    });
  });
}

function emojiForVerb(w: string): string {
  const map: Record<string, string> = {
    berlari: '🏃',
    makan: '🍽️',
    menulis: '✍️',
    membaca: '📖',
    tidur: '😴',
    melompat: '🤸',
    menyanyi: '🎤',
    menangis: '😭',
  };
  return map[w] ?? '⭐';
}

function bm2ImbuhanAsas(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { base: 'lari', pre: 'ber', ans: 'berlari', e: '🏃' },
    { base: 'makan', pre: 'me', ans: 'memakan', e: '🍽️' },
    { base: 'tulis', pre: 'me', ans: 'menulis', e: '✍️' },
    { base: 'baca', pre: 'me', ans: 'membaca', e: '📖' },
    { base: 'nyanyi', pre: 'me', ans: 'menyanyi', e: '🎤' },
    { base: 'ajar', pre: 'me', ans: 'mengajar', e: '👩‍🏫' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'bm2-imbuhan',
        prompt: `Kata dasar "${it.base}" dengan awalan "${it.pre}-" menjadi apa?`,
        answer: it.ans,
        distractors: rng.shuffle(items.filter((x) => x.ans !== it.ans)).slice(0, 3).map((x) => x.ans),
        explanation: `Kata dasar "${it.base}" menerima awalan ${it.pre}- menjadi "${it.ans}".`,
        emoji: '🔤',
        cols: 1,
        speak: `Kata dasar ${it.base} dengan awalan ${it.pre}.`,
      });
    }
    if (i % 3 === 1) {
      const words = it.ans.replace('.', '').split('');
      const idx = rng.int(0, 1);
      const masked = words.map((c, k) => (k === idx ? '_' : c)).join('');
      return mcq(rng, {
        prefix: 'bm2-imbuhan',
        prompt: `Lengkapkan: ${masked} ${it.e}`,
        promptSub: `Petunjuk: kata dasar "${it.base}"`,
        answer: words[idx],
        distractors: ['m', 'n', 'b', 'p', 'g'].filter((c) => c !== words[idx]).slice(0, 3),
        explanation: `Kata yang betul ialah "${it.ans}".`,
        emoji: '🧩',
        cols: 2,
      });
    }
    return mcq(rng, {
      prefix: 'bm2-imbuhan',
      prompt: `Apakah kata dasar bagi "${it.ans}"?`,
      answer: it.base,
      distractors: rng.shuffle(items.filter((x) => x.base !== it.base)).slice(0, 3).map((x) => x.base),
      explanation: `"${it.ans}" berasal daripada kata dasar "${it.base}".`,
      emoji: '🌱',
      cols: 2,
      speak: `Apakah kata dasar bagi ${it.ans}?`,
    });
  });
}

function bm2KataGantiNama(_y: number, rng: Rng, count: number): Question[] {
  const cases = [
    { ctx: 'Amin seorang murid lelaki. ____ suka membaca buku.', ans: 'Dia', d: ['Mereka', 'Kami', 'Anda'] },
    { ctx: 'Siti dan Ali berkawan baik. ____ selalu bermain bersama.', ans: 'Mereka', d: ['Dia', 'Saya', 'Anda'] },
    { ctx: 'Saya dan keluarga pergi bercuti. ____ menaiki kereta.', ans: 'Kami', d: ['Dia', 'Mereka', 'Anda'] },
    { ctx: 'Puan Lim, bolehkah ____ menolong saya?', ans: 'Anda', d: ['Dia', 'Mereka', 'Kami'] },
    { ctx: '"____ mahu ke kantin," kata Ravi kepada gurunya.', ans: 'Saya', d: ['Dia', 'Mereka', 'Anda'] },
  ];
  return fill(count, (i) => {
    const c = rng.pick(cases);
    if (i % 2 === 0) {
      return fillBlank(rng, {
        prefix: 'bm2-ganti',
        prompt: c.ctx,
        answer: c.ans,
        options: c.d,
        explanation: `Kata ganti nama yang sesuai ialah "${c.ans}".`,
        emoji: '👤',
        cols: 2,
        speak: c.ctx.replace('____', 'apa'),
      });
    }
    return mcq(rng, {
      prefix: 'bm2-ganti',
      prompt: `Ayat: ${c.ctx}\nKata ganti nama "${c.ans}" merujuk kepada siapa?`,
      answer: pronounRef(c.ans),
      distractors: ['Orang lain', 'Benda', 'Tempat', 'Haiwan'].filter((x) => x !== pronounRef(c.ans)),
      explanation: `"${c.ans}" ialah kata ganti nama ${pronounRef(c.ans).toLowerCase()}.`,
      emoji: '🔎',
      cols: 2,
    });
  });
}

function pronounRef(p: string): string {
  if (p === 'Saya') return 'Diri sendiri';
  if (p === 'Anda') return 'Orang kedua';
  if (p === 'Dia') return 'Orang ketiga tunggal';
  if (p === 'Mereka') return 'Orang ketiga jamak';
  if (p === 'Kami') return 'Kumpulan diri sendiri';
  return 'Orang';
}

function bm2Peribahasa(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { p: 'Rajin berusaha tangga kejayaan', m: 'Usaha yang bersungguh-sungguh membawa kejayaan.' },
    { p: 'Sedikit-sedikit lama-lama menjadi bukit', m: 'Usaha sedikit demi sedikit akhirnya berjaya.' },
    { p: 'Berakit-rakit ke hulu, berenang-renang ke tepian', m: 'Bersusah dahulu, senang kemudian.' },
    { p: 'Bagai aur dengan tebing', m: 'Saling menolong dan tolong-menolong.' },
    { p: 'Air dicincang tidak akan putus', m: 'Pertelingkahan adik-beradik tidak berpanjangan.' },
  ];
  return fill(count, (i) => {
    if (i % 2 === 0) {
      const picked = rng.sample(items, 3);
      return match({
        prefix: 'bm2-peribahasa',
        prompt: 'Padankan peribahasa dengan maksudnya.',
        pairs: picked.map((x) => ({ left: x.p, right: x.m })),
        explanation: 'Setiap peribahasa mempunyai maksud tersirat.',
        emoji: '📜',
      });
    }
    const it = rng.pick(items);
    return mcq(rng, {
      prefix: 'bm2-peribahasa',
      prompt: `Apakah maksud peribahasa "${it.p}"?`,
      answer: it.m,
      distractors: rng.shuffle(items.filter((x) => x.p !== it.p)).slice(0, 3).map((x) => x.m),
      explanation: `"${it.p}" bermaksud: ${it.m}`,
      emoji: '📖',
      cols: 1,
      speak: `Apakah maksud peribahasa ${it.p}?`,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 3                                                             */
/* ------------------------------------------------------------------ */

function bm3Tatabahasa(_y: number, rng: Rng, count: number): Question[] {
  const tenses: [string, string, string][] = [
    ['Amin ____ buku di perpustakaan semalam.', 'membaca', 'kata kerja'],
    ['Emak ____ nasi lemak setiap pagi.', 'memasak', 'kata kerja'],
    ['Adik ____ sangat comel.', 'sangat', 'kata penguat'],
    ['Kucing itu tidur ____ sofa.', 'di', 'kata sendi nama'],
    ['Buku ini ____ kepunyaan Ali.', 'ialah', 'kata hubung'],
    ['Kami pergi ke sekolah ____ bas.', 'dengan', 'kata sendi nama'],
    ['____kah kamu sudah makan?', 'Sudah', 'kata tanya'],
    ['Rumah itu sangat ____.', 'besar', 'kata adjektif'],
  ];
  return fill(count, (i) => {
    const [sentence, ans, kind] = rng.pick(tenses);
    if (i % 3 === 0) {
      const pool = tenses.filter((t) => t[1] !== ans).map((t) => t[1]);
      return mcq(rng, {
        prefix: 'bm3-tatabahasa',
        prompt: sentence,
        promptSub: `Pilih jawapan yang betul (${kind}).`,
        answer: ans,
        distractors: rng.shuffle(pool).slice(0, 3),
        explanation: `Jawapan yang betul ialah "${ans}" — ${kind}.`,
        emoji: '📝',
        cols: 1,
        speak: sentence.replace('____', 'apa'),
      });
    }
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'bm3-tatabahasa',
        prompt: `Kata "${ans}" dalam ayat "${sentence.replace('____', ans)}" ialah jenis kata apa?`,
        answer: kind,
        distractors: ['kata nama', 'kata kerja', 'kata adjektif', 'kata sendi nama'].filter((k) => k !== kind),
        explanation: `"${ans}" ialah ${kind}.`,
        emoji: '🏷️',
        cols: 1,
        speak: `Kata ${ans} ialah apa?`,
      });
    }
    return trueFalse({
      prefix: 'bm3-tatabahasa',
      prompt: `Ayat "${sentence.replace('____', ans)}" boleh dibaca dan difahami.`,
      isTrue: true,
      explanation: `Ayat itu lengkap dengan "${ans}".`,
      emoji: '✅',
    });
  });
}

function bm3SimpulanBahasa(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'Kotak itu berat seperti batu.', m: 'Perbandingan', k: 'simpulan bahasa' },
    { s: 'Angin bertiup perlahan-lahan.', m: 'Personifikasi', k: 'personifikasi' },
    { s: 'Bulan tersenyum memandang kami.', m: 'Personifikasi', k: 'personifikasi' },
    { s: 'Dia cepat seperti kilat.', m: 'Perbandingan', k: 'simpulan bahasa' },
    { s: 'Daun kelapa melambai-lambai.', m: 'Personifikasi', k: 'personifikasi' },
    { s: 'Mukanya pucat seperti kapas.', m: 'Perbandingan', k: 'simpulan bahasa' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const picked = rng.sample(items, 3);
      return match({
        prefix: 'bm3-bahasa',
        prompt: 'Padankan ayat dengan jenis gaya bahasanya.',
        pairs: picked.map((x) => ({ left: x.s, right: x.m })),
        explanation: 'Perbandingan menggunakan kata "seperti", manakala personifikasi memberi sifat manusia kepada benda.',
        emoji: '🎨',
      });
    }
    const it = rng.pick(items);
    return mcq(rng, {
      prefix: 'bm3-bahasa',
      prompt: `Ayat "${it.s}" menggunakan gaya bahasa apa?`,
      answer: it.m,
      distractors: ['Perbandingan', 'Personifikasi', 'Sinkope', 'Hiperbola'].filter((x) => x !== it.m),
      explanation: `"${it.s}" ialah ${it.m.toLowerCase()}.`,
      emoji: '✨',
      cols: 2,
      speak: `Ayat ${it.s} menggunakan gaya bahasa apa?`,
    });
  });
}

function bm3KataBilangan(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { n: 'sebuah', o: 'rumah' },
    { n: 'sebuah', o: 'kereta' },
    { n: 'seekor', o: 'kucing' },
    { n: 'seekor', o: 'gajah' },
    { n: 'sebatang', o: 'pensel' },
    { n: 'sebatang', o: 'pokok' },
    { n: 'sekeping', o: 'kertas' },
    { n: 'sehelai', o: 'baju' },
    { n: 'sebiji', o: 'bola' },
    { n: 'sebuah', o: 'sekolah' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'bm3-bilangan',
        prompt: `Pilih penjodoh bilangan yang betul:\n____ ${it.o}`,
        answer: it.n,
        distractors: rng.shuffle(['sebuah', 'seekor', 'sebatang', 'sekeping', 'sehelai', 'sebiji'].filter((x) => x !== it.n)).slice(0, 3),
        explanation: `Penjodoh bilangan bagi "${it.o}" ialah "${it.n}".`,
        emoji: '🔢',
        cols: 2,
        speak: `Pilih penjodoh bilangan bagi ${it.o}.`,
      });
    }
    return fillBlank(rng, {
      prefix: 'bm3-bilangan',
      prompt: `${it.n} ____ dibeli oleh ayah.`,
      answer: it.o,
      options: rng.shuffle(items.filter((x) => x.o !== it.o)).slice(0, 3).map((x) => x.o),
      explanation: `"${it.n} ${it.o}" ialah pasangan yang betul.`,
      emoji: '🧩',
      cols: 2,
    });
  });
}

function bm3Pemahaman(_y: number, rng: Rng, count: number): Question[] {
  const passages = [
    {
      t: 'Amin suka membaca. Setiap petang, dia pergi ke perpustakaan sekolah. Dia membaca buku cerita dan majalah. Amin mendapat banyak pengetahuan daripada membaca.',
      q: 'Ke manakah Amin pergi setiap petang?',
      a: 'Perpustakaan sekolah',
      d: ['Padang permainan', 'Kantin sekolah', 'Rumah kawan'],
      why: 'Ayat kedua menyatakan Amin pergi ke perpustakaan sekolah setiap petang.',
    },
    {
      t: 'Siti menanam pokok bunga di halaman rumah. Dia menyiram pokok itu setiap pagi dan petang. Pokok bunga Siti tumbuh subur dan berbunga cantik.',
      q: 'Apakah yang Siti tanam?',
      a: 'Pokok bunga',
      d: ['Pokok kelapa', 'Pokok mangga', 'Sayur bayam'],
      why: 'Ayat pertama menyatakan Siti menanam pokok bunga.',
    },
    {
      t: 'Pada hari Sabtu, keluarga Ravi bergotong-royong membersihkan rumah. Ayah mencuci kereta, emak menyapu lantai, dan Ravi menyusun buku. Selepas itu, rumah mereka bersih dan kemas.',
      q: 'Apakah yang Ravi buat semasa gotong-royong?',
      a: 'Menyusun buku',
      d: ['Mencuci kereta', 'Menyapu lantai', 'Memasak'],
      why: 'Ayat kedua menyatakan Ravi menyusun buku.',
    },
    {
      t: 'Burung merpati boleh terbang tinggi di langit. Ia mempunyai sayap yang kuat dan mata yang tajam. Merpati juga boleh pulang ke rumahnya walaupun jauh.',
      q: 'Mengapakah merpati boleh terbang tinggi?',
      a: 'Kerana mempunyai sayap yang kuat',
      d: ['Kerana badannya besar', 'Kerana makan banyak', 'Kerana tinggal di rumah'],
      why: 'Ayat kedua menyatakan merpati mempunyai sayap yang kuat.',
    },
  ];
  return fill(count, (i) => {
    const p = rng.pick(passages);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'bm3-pemahaman',
        prompt: `Baca petikan ini:\n\n"${p.t}"\n\n${p.q}`,
        answer: p.a,
        distractors: p.d,
        explanation: p.why,
        emoji: '📖',
        cols: 1,
        speak: `${p.t} ${p.q}`,
      });
    }
    return mcq(rng, {
      prefix: 'bm3-pemahaman',
      prompt: `Baca petikan ini:\n\n"${p.t}"\n\nApakah tajuk yang paling sesuai untuk petikan ini?`,
      answer: p.q.replace('?', '').replace('Ke manakah Amin pergi setiap petang', 'Amin Suka Membaca').replace('Apakah yang Siti tanam', 'Siti Menanam Bunga').replace('Apakah yang Ravi buat semasa gotong-royong', 'Gotong-royong Keluarga').replace('Mengapakah merpati boleh terbang tinggi', 'Kelebihan Burung Merpati'),
      distractors: ['Cerita Haiwan', 'Makanan Sihat', 'Permainan Tradisional', 'Waktu Bercuti'],
      explanation: `Tajuk perlu menggambarkan isi utama petikan.`,
      emoji: '🏷️',
      cols: 1,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 4-6                                                           */
/* ------------------------------------------------------------------ */

function bm4KataSendiNama(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'Buku itu diletakkan ____ atas meja.', a: 'di' },
    { s: 'Kami belajar ____ sekolah setiap hari.', a: 'di' },
    { s: 'Dia berjalan ____ pasar.', a: 'ke' },
    { s: 'Surat itu dihantar ____ pos.', a: 'melalui' },
    { s: 'Ayah bekerja ____ pejabat.', a: 'di' },
    { s: 'Ikan itu berenang ____ dalam air.', a: 'di' },
    { s: 'Kami pergi ke Ipoh ____ bas.', a: 'dengan' },
    { s: '____ siapa buku ini?', a: 'Milik' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'bm4-sendi',
        prompt: it.s,
        answer: it.a,
        distractors: rng.shuffle(['di', 'ke', 'dalam', 'pada', 'dengan', 'daripada', 'oleh'].filter((x) => x !== it.a)).slice(0, 3),
        explanation: `Kata sendi nama yang sesuai ialah "${it.a}".`,
        emoji: '📎',
        cols: 2,
        speak: it.s.replace('____', 'apa'),
      });
    }
    return mcq(rng, {
      prefix: 'bm4-sendi',
      prompt: `Kata "${it.a}" dalam ayat "${it.s.replace('____', it.a)}" ialah kata apa?`,
      answer: 'Kata sendi nama',
      distractors: ['Kata nama', 'Kata kerja', 'Kata adjektif', 'Kata hubung'],
      explanation: `"${it.a}" ialah kata sendi nama.`,
      emoji: '🏷️',
      cols: 1,
    });
  });
}

function bm4Imbuhan(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { d: 'tulis', a: 'menulis', s: 'Adik ____ surat kepada kawannya.' },
    { d: 'baca', a: 'membaca', s: 'Kami ____ buku cerita bersama-sama.' },
    { d: 'ajar', a: 'mengajar', s: 'Cikgu Lim ____ Matematik di kelas kami.' },
    { d: 'masak', a: 'memasak', s: 'Ibu ____ rendang untuk hari raya.' },
    { d: 'cuci', a: 'mencuci', s: 'Ayah ____ kereta pada hari minggu.' },
    { d: 'sapu', a: 'menyapu', s: 'Kakak ____ lantai rumah.' },
    { d: 'pukul', a: 'memukul', s: 'Dia ____ gendang dengan kuat.' },
    { d: 'sahut', a: 'menyahut', s: 'Murid-murid ____ soalan guru.' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'bm4-imbuhan',
        prompt: it.s,
        promptSub: `Petunjuk: kata dasar "${it.d}"`,
        answer: it.a,
        distractors: rng.shuffle(items.filter((x) => x.a !== it.a)).slice(0, 3).map((x) => x.a),
        explanation: `"${it.d}" menerima awalan menjadi "${it.a}".`,
        emoji: '📝',
        cols: 1,
        speak: it.s.replace('____', 'apa'),
      });
    }
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'bm4-imbuhan',
        prompt: `Apakah kata dasar bagi "${it.a}"?`,
        answer: it.d,
        distractors: rng.shuffle(items.filter((x) => x.d !== it.d)).slice(0, 3).map((x) => x.d),
        explanation: `"${it.a}" berasal daripada "${it.d}".`,
        emoji: '🌱',
        cols: 2,
        speak: `Apakah kata dasar bagi ${it.a}?`,
      });
    }
    return mcq(rng, {
      prefix: 'bm4-imbuhan',
      prompt: `Awalan apakah digunakan untuk membentuk "${it.a}" daripada "${it.d}"?`,
      answer: it.a.startsWith('mem') ? 'mem-' : it.a.startsWith('men') ? 'men-' : it.a.startsWith('meng') ? 'meng-' : 'ber-',
      distractors: ['ber-', 'ter-', 'di-', 'pe-'],
      explanation: `Kata dasar "${it.d}" menerima awalan untuk menjadi "${it.a}".`,
      emoji: '🔤',
      cols: 2,
    });
  });
}

function bm4Peribahasa(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { p: 'Buah tangan', m: 'Hadiah atau cenderamata' },
    { p: 'Kaki bangku', m: 'Tidak tahu bermain bola' },
    { p: 'Ringan tulang', m: 'Rajin bekerja' },
    { p: 'Berat mata memandang, berat lagi bahu memikul', m: 'Kesusahan orang lain lebih berat daripada yang kita nampak' },
    { p: 'Malu bertanya sesat jalan', m: 'Jangan malu bertanya kerana ia dapat membantu' },
    { p: 'Sudah jatuh ditimpa tangga', m: 'Kemalangan yang bertimpa-timpa' },
    { p: 'Anak emas', m: 'Anak yang sangat disayangi' },
    { p: 'Panjang tangan', m: 'Suka mencuri' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const picked = rng.sample(items, 3);
      return match({
        prefix: 'bm4-peribahasa',
        prompt: 'Padankan simpulan bahasa dengan maksudnya.',
        pairs: picked.map((x) => ({ left: x.p, right: x.m })),
        explanation: 'Simpulan bahasa ialah ungkapan yang mempunyai maksud khas.',
        emoji: '📜',
      });
    }
    const it = rng.pick(items);
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'bm4-peribahasa',
        prompt: `Apakah maksud "${it.p}"?`,
        answer: it.m,
        distractors: rng.shuffle(items.filter((x) => x.p !== it.p)).slice(0, 3).map((x) => x.m),
        explanation: `"${it.p}" bermaksud ${it.m.toLowerCase()}.`,
        emoji: '📖',
        cols: 1,
        speak: `Apakah maksud ${it.p}?`,
      });
    }
    return fillBlank(rng, {
      prefix: 'bm4-peribahasa',
      prompt: `Pilih simpulan bahasa yang bermaksud "${it.m}".`,
      answer: it.p,
      options: rng.shuffle(items.filter((x) => x.p !== it.p)).slice(0, 3).map((x) => x.p),
      explanation: `"${it.m}" ialah maksud bagi "${it.p}".`,
      emoji: '🔎',
      cols: 1,
    });
  });
}

function bm4Karangan(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { t: 'Cuti-cuti Malaysia', plot: 'pergi ke Pulau Langkawi bersama keluarga' },
    { t: 'Hari Sukan Sekolah', plot: 'menyertai acara larian 100 meter' },
    { t: 'Kebaikan Membaca', plot: 'menambah pengetahuan dan meluaskan perbendaharaan kata' },
    { t: 'Kepentingan Menjaga Kebersihan', plot: 'menjaga kesihatan dan mengelakkan penyakit' },
    { t: 'Pengalaman Menarik', plot: 'bercuti ke rumah nenek di kampung' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return order({
        prefix: 'bm4-karangan',
        prompt: `Susun isi karangan bertajuk "${it.t}" mengikut urutan yang betul.`,
        items: rng.shuffle([
          'Pengenalan: memperkenalkan tajuk',
          'Isi 1: huraian idea pertama',
          'Isi 2: huraian idea kedua',
          'Kesimpulan: rumusan dan harapan',
        ]),
        correctOrder: [
          'Pengenalan: memperkenalkan tajuk',
          'Isi 1: huraian idea pertama',
          'Isi 2: huraian idea kedua',
          'Kesimpulan: rumusan dan harapan',
        ],
        explanation: 'Karangan yang baik mempunyai pengenalan, isi, dan kesimpulan.',
        emoji: '🗂️',
      });
    }
    return mcq(rng, {
      prefix: 'bm4-karangan',
      prompt: `Kamu menulis karangan bertajuk "${it.t}".\nApakah isi yang paling sesuai?`,
      answer: `Huraian tentang ${it.plot}.`,
      distractors: [
        'Huraian tentang makanan kegemaran saya.',
        'Huraian tentang cita-cita saya.',
        'Senarai nama kawan-kawan saya.',
        'Huraian tentang cuaca di kawasan rumah.',
      ],
      explanation: `Isi karangan perlu berkaitan dengan tajuk "${it.t}".`,
      emoji: '✍️',
      cols: 1,
      speak: `Apakah isi yang sesuai untuk karangan ${it.t}?`,
    });
  });
}

function bm5TatabahasaLanjut(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'Sekiranya saya seorang jutawan, saya akan membantu orang miskin.', j: 'Ayat majmuk', a: 'Sekiranya' },
    { s: 'Walaupun hujan lebat, dia tetap pergi ke sekolah.', j: 'Ayat majmuk', a: 'Walaupun' },
    { s: 'Ahmad membeli buku dan meminjam majalah di perpustakaan.', j: 'Ayat majmuk', a: 'dan' },
    { s: 'Dia bukan sahaja rajin, malah pintar.', j: 'Ayat majmuk', a: 'bukan sahaja' },
    { s: 'Kami tidak akan bermain sekiranya cuaca buruk.', j: 'Ayat majmuk', a: 'sekiranya' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'bm5-tatabahasa',
        prompt: `Apakah jenis ayat bagi: "${it.s}"?`,
        answer: it.j,
        distractors: ['Ayat tunggal', 'Ayat majmuk', 'Ayat tanya', 'Ayat seruan'].filter((x) => x !== it.j),
        explanation: `Ayat itu ialah ${it.j.toLowerCase()} kerana menggabungkan dua klausa.`,
        emoji: '🏗️',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'bm5-tatabahasa',
        prompt: `Apakah kata hubung dalam ayat "${it.s}"?`,
        answer: it.a,
        distractors: ['dan', 'atau', 'tetapi', 'kerana', 'walaupun', 'sekiranya', 'malah', 'bukan sahaja'].filter((x) => x !== it.a).slice(0, 3),
        explanation: `Kata hubung dalam ayat itu ialah "${it.a}".`,
        emoji: '🔗',
        cols: 2,
        speak: `Apakah kata hubung dalam ayat ini?`,
      });
    }
    return trueFalse({
      prefix: 'bm5-tatabahasa',
      prompt: `Ayat "${it.s}" menggunakan ayat majmuk.`,
      isTrue: true,
      explanation: 'Ayat majmuk menggabungkan lebih daripada satu klausa.',
      emoji: '✅',
    });
  });
}

function bm5PemahamanPetikan(_y: number, rng: Rng, count: number): Question[] {
  const passages = [
    {
      t: 'Kesedaran terhadap alam sekitar semakin penting pada masa kini. Pencemaran air, udara dan tanah telah menjejaskan kualiti hidup manusia. Oleh itu, setiap individu harus memainkan peranan untuk menjaga alam sekitar. Amalan kitar semula dan penggunaan tenaga boleh diperbaharui dapat mengurangkan kesan pencemaran.',
      q: 'Apakah peranan individu dalam menjaga alam sekitar?',
      a: 'Mengamalkan kitar semula',
      d: ['Membuang sampah merata-rata', 'Menggunakan tenaga lebih banyak', 'Membiarkan pencemaran berterusan'],
      why: 'Ayat terakhir menyatakan amalan kitar semula dapat mengurangkan pencemaran.',
    },
    {
      t: 'Kemajuan teknologi telah mengubah cara manusia berkomunikasi. Pada zaman dahulu, manusia menggunakan surat untuk berhubung. Kini, telefon pintar membolehkan kita menghubungi sesiapa sahaja dalam masa yang singkat. Walau bagaimanapun, penggunaan teknologi haruslah berhemah.',
      q: 'Apakah alat komunikasi pada zaman dahulu?',
      a: 'Surat',
      d: ['Telefon pintar', 'Komputer', 'Televisyen'],
      why: 'Ayat kedua menyatakan manusia menggunakan surat pada zaman dahulu.',
    },
    {
      t: 'Latihan fizikal amat penting untuk kesihatan. Bersukan selama tiga puluh minit sehari dapat menguatkan jantung dan otot. Ia juga membantu mengurangkan tekanan. Makanan seimbang perlu diambil bersama senaman untuk kesihatan yang optimum.',
      q: 'Berapakah tempoh bersukan yang disyorkan sehari?',
      a: 'Tiga puluh minit',
      d: ['Sepuluh minit', 'Satu jam', 'Dua jam'],
      why: 'Ayat kedua menyatakan tiga puluh minit sehari.',
    },
  ];
  return fill(count, (i) => {
    const p = rng.pick(passages);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'bm5-pemahaman',
        prompt: `Baca petikan ini:\n\n"${p.t}"\n\n${p.q}`,
        answer: p.a,
        distractors: p.d,
        explanation: p.why,
        emoji: '📚',
        cols: 1,
        speak: `${p.t} ${p.q}`,
      });
    }
    return mcq(rng, {
      prefix: 'bm5-pemahaman',
      prompt: `Baca petikan ini:\n\n"${p.t}"\n\nApakah isi utama petikan ini?`,
      answer: p.why.split('menyatakan')[0].trim() || p.a,
      distractors: ['Cerita haiwan', 'Sejarah tanah air', 'Resipi masakan', 'Pengembaraan'],
      explanation: 'Isi utama ialah idea pokok keseluruhan petikan.',
      emoji: '💡',
      cols: 1,
    });
  });
}

function bm5SeniBahasa(_y: number, rng: Rng, count: number): Question[] {
  const poems = [
    {
      jenis: 'Pantun',
      baris: [
        'Buah cempedak di luar pagar,',
        'Ambil galah tolong jolokkan;',
        'Saya budak baru belajar,',
        'Kalau salah tolong tunjukkan.',
      ],
      why: 'Rima akhir a-b-a-b dan dua baris pertama ialah pembayang.',
      maksud: 'Meminta tunjuk ajar kerana masih baru belajar.',
    },
    {
      jenis: 'Pantun',
      baris: [
        'Pisang emas dibawa belayar,',
        'Masak sebiji di atas peti;',
        'Hutang emas boleh dibayar,',
        'Hutang budi dibawa mati.',
      ],
      why: 'Rima akhir a-b-a-b dengan pembayang pada dua baris pertama.',
      maksud: 'Budi yang baik tidak dapat dibalas dengan wang.',
    },
    {
      jenis: 'Syair',
      baris: [
        'Wahai anak-anak sekalian,',
        'Rajinlah belajar setiap masa;',
        'Ilmu itu cahaya iman,',
        'Bekalan hidup di dunia.',
      ],
      why: 'Rima akhir a-a-a-a dan setiap baris membawa maksud.',
      maksud: 'Menyeru murid supaya rajin menuntut ilmu.',
    },
    {
      jenis: 'Syair',
      baris: [
        'Burung terbang di angkasa,',
        'Mencari makan di waktu pagi;',
        'Marilah kita menjaga bahasa,',
        'Bahasa Melayu lambang jati diri.',
      ],
      why: 'Rima akhir a-a-a-a tanpa pembayang.',
      maksud: 'Mengajak kita memartabatkan bahasa Melayu.',
    },
  ];
  const sajak = [
    { tajuk: 'Bahasa Ku', baris: ['Bahasa ku bukan sekadar bunyi,', 'ia nafas bangsa yang hidup,', 'terus bernyanyi dalam jiwaku.'], why: 'Sajak ialah puisi bebas; barisnya tidak terikat rima tetap.' },
    { tajuk: 'Hujan', baris: ['Hujan mengetuk bumbung,', 'seperti jari kecil mengetuk pintu,', 'meminta izin masuk.'], why: 'Sajak menggunakan bahasa indah dan tidak terikat aturan rima.' },
  ];
  return fill(count, (i) => {
    if (i % 4 === 3) {
      const s = rng.pick(sajak);
      return mcq(rng, {
        prefix: 'bm5-seni',
        prompt: `Apakah bentuk puisi bagi petikan ini?\n\n"${s.baris.join('\n')}"`,
        answer: 'Sajak',
        distractors: ['Pantun', 'Syair', 'Peribahasa'],
        explanation: s.why,
        emoji: '✨',
        cols: 2,
        speak: 'Apakah bentuk puisi bagi petikan ini?',
      });
    }
    const p = rng.pick(poems);
    if (i % 4 === 0) {
      return mcq(rng, {
        prefix: 'bm5-seni',
        prompt: `Apakah bentuk puisi ini?\n\n"${p.baris.join('\n')}"`,
        answer: p.jenis,
        distractors: ['Pantun', 'Syair', 'Sajak'],
        explanation: p.why,
        emoji: '🎭',
        cols: 2,
        speak: 'Apakah bentuk puisi ini?',
      });
    }
    if (i % 4 === 1) {
      return mcq(rng, {
        prefix: 'bm5-seni',
        prompt: `Baca ${p.jenis.toLowerCase()} ini:\n\n"${p.baris.join('\n')}"\n\nApakah maksudnya?`,
        answer: p.maksud,
        distractors: [
          'Menyatakan cara memasak makanan',
          'Menceritakan tempat percutian',
          'Menerangkan cara bermain bola',
          'Menghitung bilangan barang',
        ],
        explanation: `Maksud ${p.jenis.toLowerCase()} itu: ${p.maksud}`,
        emoji: '💡',
        cols: 1,
      });
    }
    return trueFalse({
      prefix: 'bm5-seni',
      prompt: p.jenis === 'Pantun'
        ? `Pantun ini mempunyai pembayang pada dua baris pertama.`
        : `${p.jenis} ini menggunakan rima akhir a-a-a-a.`,
      isTrue: true,
      explanation: p.why,
      emoji: '✅',
    });
  });
}

function bm5MembacaMenulisFungsional(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    {
      jenis: 'Iklan',
      teks: 'JUALAN BUKU MURAH!\nSemua buku cerita diskaun 30%.\nTarikh: 1 hingga 7 Mac.\nTempat: Kedai Buku Ilmu, Jalan Merbau.',
      soalan: 'Berapakah diskaun yang ditawarkan?',
      jawapan: '30%',
      salah: ['10%', '50%', '70%'],
      why: 'Iklan menyatakan diskaun 30%.',
    },
    {
      jenis: 'Iklan',
      teks: 'KELAS TUISYEN MATEMATIK\nSetiap Sabtu, 9 pagi hingga 11 pagi.\nHubungi Cikgu Ros: 012-3456789.',
      soalan: 'Pada hari apakah kelas tuisyen diadakan?',
      jawapan: 'Sabtu',
      salah: ['Ahad', 'Isnin', 'Jumaat'],
      why: 'Iklan menyatakan kelas pada setiap Sabtu.',
    },
    {
      jenis: 'Borang',
      teks: 'BORANG PENYERTAAN PERTANDINGAN MELUKIS\nNama: ________________\nTahun: ________________\nNama Sekolah: ________________\nTandatangan: ________________',
      soalan: 'Apakah maklumat yang perlu diisi dalam borang ini?',
      jawapan: 'Nama, tahun, nama sekolah dan tandatangan',
      salah: ['Warna kegemaran dan makanan', 'Nombor telefon dan gaji', 'Hobi dan cita-cita'],
      why: 'Borang meminta nama, tahun, nama sekolah dan tandatangan.',
    },
    {
      jenis: 'Notis',
      teks: 'NOTIS\nPerpustakaan sekolah akan ditutup pada 15 April kerana kerja penyelenggaraan. Murid diminta memulangkan buku sebelum tarikh itu.',
      soalan: 'Mengapakah perpustakaan ditutup?',
      jawapan: 'Kerana kerja penyelenggaraan',
      salah: ['Kerana cuti sekolah', 'Kerana tiada murid', 'Kerana buku habis'],
      why: 'Notis menyatakan penutupan kerana kerja penyelenggaraan.',
    },
    {
      jenis: 'Surat',
      teks: 'Surat kepada guru:\n\nTuan,\nSaya tidak dapat hadir ke sekolah pada 10 Mei kerana demam. Saya berharap tuan dapat memahami keadaan saya.\n\nYang benar,\nAminah',
      soalan: 'Mengapakah Aminah tidak dapat hadir ke sekolah?',
      jawapan: 'Kerana demam',
      salah: ['Kerana bercuti', 'Kerana terlambat', 'Kerana hujan'],
      why: 'Surat menyatakan Aminah demam.',
    },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'bm5-fungsi',
        prompt: `Baca bahan ini:\n\n"${it.teks}"\n\n${it.soalan}`,
        answer: it.jawapan,
        distractors: it.salah,
        explanation: it.why,
        emoji: '📋',
        cols: 1,
        speak: `${it.soalan}`,
      });
    }
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'bm5-fungsi',
        prompt: `Bahan berikut ialah jenis apa?\n\n"${it.teks}"`,
        answer: it.jenis,
        distractors: ['Iklan', 'Borang', 'Notis', 'Surat'],
        explanation: `Bahan itu ialah ${it.jenis.toLowerCase()}.`,
        emoji: '🗂️',
        cols: 2,
      });
    }
    return trueFalse({
      prefix: 'bm5-fungsi',
      prompt: it.jenis === 'Borang'
        ? 'Borang perlu diisi dengan maklumat yang tepat dan ditandatangani.'
        : `Bahan "${it.jenis}" ini digunakan untuk urusan harian.`,
      isTrue: true,
      explanation: it.why,
      emoji: '✅',
    });
  });
}

function bm6KaranganLanjut(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { t: 'Isu Pencemaran Alam', p: 'punca pencemaran dan langkah mengatasinya' },
    { t: 'Faedah Bersukan', p: 'kesihatan fizikal dan mental' },
    { t: 'Kepentingan Pendidikan', p: 'membina masa depan negara' },
    { t: 'Amalan Berjimat Cermat', p: 'mengurus wang dengan bijak' },
    { t: 'Perpaduan Kaum', p: 'mengekalkan keharmonian negara' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return order({
        prefix: 'bm6-karangan',
        prompt: `Susun rangka karangan "${it.t}" mengikut susunan yang betul.`,
        items: rng.shuffle([
          `Pengenalan: memperkenalkan ${it.t.toLowerCase()}`,
          'Isi 1: punca atau sebab',
          'Isi 2: kesan atau kepentingan',
          'Isi 3: langkah atau cadangan',
          'Kesimpulan: rumusan dan harapan',
        ]),
        correctOrder: [
          `Pengenalan: memperkenalkan ${it.t.toLowerCase()}`,
          'Isi 1: punca atau sebab',
          'Isi 2: kesan atau kepentingan',
          'Isi 3: langkah atau cadangan',
          'Kesimpulan: rumusan dan harapan',
        ],
        explanation: 'Karangan jenis perbincangan memerlukan pengenalan, isi-isi, dan kesimpulan yang tersusun.',
        emoji: '🗂️',
      });
    }
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'bm6-karangan',
        prompt: `Kamu menulis karangan bertajuk "${it.t}".\nApakah fokus kandungan yang paling sesuai?`,
        answer: `Membincangkan ${it.p}.`,
        distractors: [
          'Menceritakan pengalaman peribadi semata-mata.',
          'Menyenaraikan nama rakan sekelas.',
          'Menulis dialog sahaja.',
          'Menghuraikan cuaca harian.',
        ],
        explanation: `Karangan "${it.t}" perlu membincangkan ${it.p}.`,
        emoji: '✍️',
        cols: 1,
      });
    }
    return mcq(rng, {
      prefix: 'bm6-karangan',
      prompt: `Ayat manakah yang paling sesuai untuk menjadi kesimpulan karangan "${it.t}"?`,
      answer: `Kesimpulannya, semua pihak harus berganding bahu dalam menangani ${it.t.toLowerCase()}.`,
      distractors: [
        'Saya berasa gembira hari ini.',
        'Pada suatu hari, saya pergi ke kedai.',
        'Akhir sekali, saya ingin tidur.',
        'Sekian sahaja daripada saya.',
      ],
      explanation: 'Kesimpulan yang baik merumus isi dan menyeru tindakan.',
      emoji: '🎯',
      cols: 1,
    });
  });
}

function bm6SistemBahasa(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { wrong: 'Dia pergi ke pasar membeli sayur sayuran.', right: 'Dia pergi ke pasar untuk membeli sayur-sayuran.', k: 'kesalahan ejaan' },
    { wrong: 'saya suka makan nasi lemak.', right: 'Saya suka makan nasi lemak.', k: 'huruf besar' },
    { wrong: 'Kami semua murid-murid sekolah ini.', right: 'Kami semua murid sekolah ini.', k: 'kata ganda' },
    { wrong: 'Buku itu ada di atas atas meja.', right: 'Buku itu ada di atas meja.', k: 'kata berulang' },
    { wrong: 'Mereka-mereka sedang bermain bola.', right: 'Mereka sedang bermain bola.', k: 'kata ganti nama' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'bm6-sistem',
        prompt: `Betulkan ayat ini:\n"${it.wrong}"`,
        answer: it.right,
        distractors: rng.shuffle(items.filter((x) => x.right !== it.right)).slice(0, 3).map((x) => x.right),
        explanation: `Ayat yang betul: "${it.right}" — membetulkan ${it.k}.`,
        emoji: '✅',
        cols: 1,
        speak: `Betulkan ayat ini: ${it.wrong}`,
      });
    }
    return mcq(rng, {
      prefix: 'bm6-sistem',
      prompt: `Apakah jenis kesalahan dalam ayat "${it.wrong}"?`,
      answer: it.k,
      distractors: ['kesalahan ejaan', 'huruf besar', 'kata ganda', 'kata ganti nama'].filter((x) => x !== it.k),
      explanation: `Ayat itu mengandungi ${it.k}.`,
      emoji: '🔍',
      cols: 1,
    });
  });
}

function bm6Komsas(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: '"Bagaikan aur dengan tebing"', m: 'Saling tolong-menolong', t: 'peribahasa' },
    { s: '"Bunga yang segar itu harum semerbak."', m: 'Perbandingan/ deskripsi', t: 'gaya bahasa' },
    { s: '"Hujan menangis sepanjang malam."', m: 'Personifikasi', t: 'gaya bahasa' },
    { s: '"Dia berlari secepat kilat."', m: 'Hiperbola', t: 'gaya bahasa' },
    { s: '"Merah padam mukanya kerana malu."', m: 'Peribahasa', t: 'peribahasa' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const picked = rng.sample(items, 3);
      return match({
        prefix: 'bm6-komsas',
        prompt: 'Padankan ungkapan dengan maksudnya.',
        pairs: picked.map((x) => ({ left: x.s, right: x.m })),
        explanation: 'Ungkapan komsas mempunyai maksud kiasan.',
        emoji: '🎭',
      });
    }
    const it = rng.pick(items);
    return mcq(rng, {
      prefix: 'bm6-komsas',
      prompt: `Apakah maksud ungkapan ${it.s}?`,
      answer: it.m,
      distractors: rng.shuffle(items.filter((x) => x.m !== it.m)).slice(0, 3).map((x) => x.m),
      explanation: `${it.s} bermaksud ${it.m.toLowerCase()}.`,
      emoji: '📖',
      cols: 1,
    });
  });
}

/**
 * Standard 1.0 Mendengar dan Bertutur. Satu penjana untuk semua tahun —
 * aras soalan mengikut tahun supaya murid Tahun 1 dapat soalan mudah dan
 * murid Tahun 6 dapat soalan yang lebih mencabar.
 */
function bmMendengarBertutur(y: number, rng: Rng, count: number): Question[] {
  const situasi = [
    { s: 'Kamu bertemu guru pada waktu pagi.', j: 'Selamat pagi, cikgu.' },
    { s: 'Kamu hendak meminjam buku daripada kawan.', j: 'Bolehkah saya pinjam buku kamu?' },
    { s: 'Kamu tersalah langkah pada kaki rakan.', j: 'Maafkan saya, saya tidak sengaja.' },
    { s: 'Kawan kamu membantu mengangkat kerusi.', j: 'Terima kasih kerana menolong saya.' },
    { s: 'Kamu hendak bertanya arah ke tandas.', j: 'Maaf, boleh saya tahu di mana tandas?' },
    { s: 'Kamu hendak masuk ke kelas selepas loceng.', j: 'Maaf, cikgu. Boleh saya masuk?' },
    { s: 'Kamu mahu meminta rakan berhenti bising.', j: 'Tolong jangan bising, saya sedang membaca.' },
    { s: 'Kamu dipanggil menjawab soalan guru.', j: 'Ya, cikgu. Saya akan cuba menjawab.' },
  ];
  const nada = [
    { s: 'Kamu membaca pengumuman di perhimpunan sekolah.', n: 'Nada tegas dan jelas' },
    { s: 'Kamu menceritakan kisah lucu kepada kawan.', n: 'Nada ceria dan santai' },
    { s: 'Kamu meminta maaf kerana melakukan kesalahan.', n: 'Nada lembut dan bersungguh' },
    { s: 'Kamu membentangkan hasil kerja di hadapan kelas.', n: 'Nada yakin dan teratur' },
    { s: 'Kamu menenangkan kawan yang menangis.', n: 'Nada tenang dan penyayang' },
  ];
  const dengar = [
    { a: 'Sila ambil buku latihan dan buka halaman dua puluh.', t: 'Arahan supaya murid membuka buku latihan.' },
    { a: 'Jangan berlari di sepanjang koridor sekolah.', t: 'Larangan supaya murid tidak berlari.' },
    { a: 'Bawa payung kerana hari mungkin hujan petang ini.', t: 'Nasihat supaya murid bersedia dengan payung.' },
    { a: 'Tolong padamkan lampu sebelum keluar dari bilik.', t: 'Permintaan supaya mematikan lampu.' },
    { a: 'Semua murid berkumpul di padang selepas rehat.', t: 'Arahan supaya murid berkumpul di padang.' },
  ];
  const bertutur = [
    { a: 'Menjawab soalan guru dengan ayat lengkap', t: 'Kemahiran bertutur' },
    { a: 'Mendengar arahan sebelum bertindak', t: 'Kemahiran mendengar' },
    { a: 'Bercerita mengikut turutan yang betul', t: 'Kemahiran bertutur' },
    { a: 'Menulis jawapan di dalam buku', t: 'Bukan kemahiran bertutur' },
    { a: 'Mengangguk semasa rakan bercakap', t: 'Kemahiran mendengar' },
  ];
  // Tahap 1 (Tahun 1-3): sapaan dan arahan mudah. Tahap 2 (Tahun 4-6): nada dan situasi.
  const gunaNada = y >= 4;
  const gunaArahan = y >= 2;
  return fill(count, (i) => {
    const modes = gunaNada ? 5 : gunaArahan ? 4 : 3;
    const mode = i % modes;
    if (mode === 0) {
      const s = rng.pick(situasi);
      return mcq(rng, {
        prefix: 'bm-lisan',
        prompt: `🗣️ ${s.s} Apakah ucapan yang sesuai?`,
        answer: s.j,
        distractors: rng.shuffle([
          'Hoi, beri saya buku itu!',
          'Saya tidak tahu apa-apa.',
          'Jangan kacau saya.',
          'Itu bukan urusan saya.',
        ]).slice(0, 3),
        explanation: `Ucapan yang sopan ialah "${s.j}".`,
        emoji: '🗣️',
        cols: 1,
        speak: s.s,
      });
    }
    if (mode === 1) {
      const d = rng.pick(dengar);
      return mcq(rng, {
        prefix: 'bm-lisan',
        prompt: `👂 Dengar arahan ini: "${d.a}" Apakah maksudnya?`,
        answer: d.t,
        distractors: rng.shuffle(dengar.filter((x) => x.t !== d.t)).slice(0, 3).map((x) => x.t),
        explanation: `"${d.a}" bermaksud: ${d.t.toLowerCase()}`,
        emoji: '👂',
        cols: 1,
        speak: d.a,
      });
    }
    if (mode === 2) {
      const b = rng.pick(bertutur);
      return trueFalse({
        prefix: 'bm-lisan',
        prompt: `"${b.a}" ialah ${b.t.toLowerCase()}.`,
        isTrue: b.t.startsWith('Kemahiran'),
        explanation: `"${b.a}" — ${b.t}.`,
        emoji: '💬',
      });
    }
    if (mode === 3) {
      const picked = rng.sample(situasi, 3);
      return match({
        prefix: 'bm-lisan',
        prompt: 'Padankan situasi dengan ucapan yang sesuai.',
        pairs: picked.map((s) => ({ left: s.s, right: s.j })),
        explanation: 'Ucapan yang sopan mengikut situasi yang betul.',
        emoji: '🤝',
      });
    }
    const n = rng.pick(nada);
    return mcq(rng, {
      prefix: 'bm-lisan',
      prompt: `🎤 ${n.s} Apakah nada suara yang sesuai?`,
      answer: n.n,
      distractors: rng.shuffle(nada.filter((x) => x.n !== n.n)).slice(0, 3).map((x) => x.n),
      explanation: `${n.s} memerlukan ${n.n.toLowerCase()}.`,
      emoji: '🎤',
      cols: 1,
    });
  });
}

/** Standard 4.0 Seni Bahasa: pantun, sajak, peribahasa dan gaya bahasa. */
function bmSeniBahasa(y: number, rng: Rng, count: number): Question[] {
  const pantun = [
    { p: 'Buah cempedak di luar pagar, / Ambil galah tolong jolokkan; / Saya budak baru belajar, / Kalau salah tolong tunjukkan.', m: 'Nasihat dan kerendahan hati' },
    { p: 'Air pasang di tepi pantai, / Nampak jelas dari perahu; / Hati riang tidak terperi, / Dapat hadiah daripada guru.', m: 'Perasaan gembira' },
    { p: 'Bunga melati di dalam taman, / Harum semerbak sepanjang hari; / Belajar rajin setiap malam, / Kejayaan pasti menanti.', m: 'Galakan supaya rajin belajar' },
    { p: 'Pisang emas dibawa belayar, / Masak sebiji di atas peti; / Hutang emas boleh dibayar, / Hutang budi dibawa mati.', m: 'Jasa dan budi tidak boleh dilupakan' },
  ];
  const gaya = [
    { a: 'Angin berbisik di telinga saya.', t: 'Personifikasi' },
    { a: 'Wajahnya seputih kapas.', t: 'Simile (perbandingan)' },
    { a: 'Dia berlari secepat kilat.', t: 'Hiperbola' },
    { a: 'Dia membeli sebuah kereta baru.', t: 'Bahasa biasa' },
    { a: 'Suara itu bagaikan guruh di langit.', t: 'Simile (perbandingan)' },
  ];
  const peribahasa = [
    { a: 'Bagai aur dengan tebing', t: 'Saling menolong antara satu sama lain' },
    { a: 'Sedikit-sedikit lama-lama menjadi bukit', t: 'Usaha yang berterusan membawa kejayaan' },
    { a: 'Sediakan payung sebelum hujan', t: 'Bersedia sebelum berlakunya kesusahan' },
    { a: 'Seperti katak di bawah tempurung', t: 'Kurang pengetahuan tentang dunia luar' },
    { a: 'Tak kenal maka tak cinta', t: 'Perlu mengenal sesuatu sebelum menyayanginya' },
  ];
  const sajak = [
    { t: 'Bahasa Melayu', m: 'Memartabatkan bahasa kebangsaan' },
    { t: 'Kebersihan', m: 'Menjaga kebersihan diri dan alam sekitar' },
    { t: 'Kemerdekaan', m: 'Menghargai pengorbanan pejuang negara' },
    { t: 'Perpaduan', m: 'Hidup bersatu dalam masyarakat pelbagai kaum' },
  ];
  const adaLirik = y >= 3;
  return fill(count, (i) => {
    const modes = adaLirik ? 5 : 4;
    const mode = i % modes;
    if (mode === 0) {
      const x = rng.pick(pantun);
      return mcq(rng, {
        prefix: 'bm-seni',
        prompt: `📜 Apakah maksud pantun ini?\n\n${x.p}`,
        answer: x.m,
        distractors: rng.shuffle(pantun.filter((p) => p.m !== x.m)).slice(0, 3).map((p) => p.m),
        explanation: `Pantun ini menyampaikan maksud: ${x.m.toLowerCase()}.`,
        emoji: '📜',
        cols: 1,
      });
    }
    if (mode === 1) {
      const g = rng.pick(gaya);
      return mcq(rng, {
        prefix: 'bm-seni',
        prompt: `🎨 Apakah gaya bahasa dalam ayat ini?\n\n"${g.a}"`,
        answer: g.t,
        distractors: ['Personifikasi', 'Simile (perbandingan)', 'Hiperbola', 'Bahasa biasa'].filter((t) => t !== g.t).slice(0, 3),
        explanation: `"${g.a}" menggunakan gaya bahasa ${g.t.toLowerCase()}.`,
        emoji: '🎨',
        cols: 1,
      });
    }
    if (mode === 2) {
      const p = rng.pick(peribahasa);
      return mcq(rng, {
        prefix: 'bm-seni',
        prompt: `💬 Apakah maksud peribahasa "${p.a}"?`,
        answer: p.t,
        distractors: rng.shuffle(peribahasa.filter((x) => x.t !== p.t)).slice(0, 3).map((x) => x.t),
        explanation: `"${p.a}" bermaksud ${p.t.toLowerCase()}.`,
        emoji: '💬',
        cols: 1,
      });
    }
    if (mode === 3) {
      const picked = rng.sample(peribahasa, 3);
      return match({
        prefix: 'bm-seni',
        prompt: 'Padankan peribahasa dengan maksudnya.',
        pairs: picked.map((p) => ({ left: p.a, right: p.t })),
        explanation: 'Peribahasa ialah warisan bahasa yang indah.',
        emoji: '🧩',
      });
    }
    const s = rng.pick(sajak);
    return mcq(rng, {
      prefix: 'bm-seni',
      prompt: `🎼 Sajak bertajuk "${s.t}" bertemakan apa?`,
      answer: s.m,
      distractors: rng.shuffle(sajak.filter((x) => x.m !== s.m)).slice(0, 3).map((x) => x.m),
      explanation: `Sajak "${s.t}" bertemakan ${s.m.toLowerCase()}.`,
      emoji: '🎼',
      cols: 1,
    });
  });
}

export const BAHASA_MELAYU_GENERATORS: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'bm-mendengar-bertutur': bmMendengarBertutur,
  'bm-seni-bahasa': bmSeniBahasa,
  'bm1-huruf-suku-kata': bm1HurufSukuKata,
  'bm1-membaca-perkataan': bm1MembacaPerkataan,
  'bm1-menulis-ayat': bm1MenulisAyat,
  'bm2-kata-nama-kerja': bm2KataNamaKerja,
  'bm2-imbuhan-asas': bm2ImbuhanAsas,
  'bm2-kata-ganti-nama': bm2KataGantiNama,
  'bm2-peribahasa': bm2Peribahasa,
  'bm3-tatabahasa': bm3Tatabahasa,
  'bm3-simpulan-bahasa': bm3SimpulanBahasa,
  'bm3-kata-bilangan': bm3KataBilangan,
  'bm3-pemahaman': bm3Pemahaman,
  'bm4-kata-sendi-nama': bm4KataSendiNama,
  'bm4-imbuhan': bm4Imbuhan,
  'bm4-peribahasa': bm4Peribahasa,
  'bm4-karangan': bm4Karangan,
  'bm5-tatabahasa-lanjut': bm5TatabahasaLanjut,
  'bm5-pemahaman-petikan': bm5PemahamanPetikan,
  'bm5-seni-bahasa': bm5SeniBahasa,
  'bm5-membaca-menulis-fungsional': bm5MembacaMenulisFungsional,
  'bm6-karangan-lanjut': bm6KaranganLanjut,
  'bm6-sistem-bahasa': bm6SistemBahasa,
  'bm6-komsas': bm6Komsas,
};
