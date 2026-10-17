/**
 * Penjana latihan Sains (KSSR Semakan 2017).
 * Tema: Inkuiri Dalam Sains, Sains Hayat, Sains Fizikal, Sains Bahan,
 * Bumi dan Angkasa, Teknologi dan Kehidupan Lestari.
 */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { fill, fillBlank, match, mcq, order, trueFalse } from './shared';

/* ------------------------------------------------------------------ */
/* Tahun 1                                                             */
/* ------------------------------------------------------------------ */

function sn1DeriaBendaHidup(_y: number, rng: Rng, count: number): Question[] {
  const senses = [
    { organ: 'Mata', sense: 'Penglihatan', func: 'Melihat', e: '👁️' },
    { organ: 'Telinga', sense: 'Pendengaran', func: 'Mendengar', e: '👂' },
    { organ: 'Hidung', sense: 'Pembau', func: 'Menghidu', e: '👃' },
    { organ: 'Lidah', sense: 'Rasa', func: 'Merasa', e: '👅' },
    { organ: 'Kulit', sense: 'Sentuhan', func: 'Menyentuh', e: '🖐️' },
  ];
  const needs = ['Air', 'Makanan', 'Udara', 'Cahaya matahari'];
  const nonLiving = ['Batu', 'Kerusi', 'Meja', 'Pensel', 'Buku', 'Bola'];
  const living = ['Kucing', 'Ayam', 'Pokok', 'Ikan', 'Burung', 'Bunga'];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const s = rng.pick(senses);
      return mcq(rng, {
        prefix: 'sn1-deria',
        prompt: `${s.e} Apakah deria yang menggunakan organ ini?`,
        answer: s.sense,
        distractors: senses.filter((x) => x.sense !== s.sense).map((x) => x.sense),
        explanation: `Organ ${s.organ} digunakan untuk deria ${s.sense} — kita dapat ${s.func.toLowerCase()}.`,
        emoji: '🖐️',
        cols: 2,
        speak: `Organ ${s.organ} digunakan untuk deria apa?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(senses, 3);
      return match({
        prefix: 'sn1-deria',
        prompt: 'Padankan organ deria dengan deria yang betul.',
        pairs: picked.map((s) => ({ left: `${s.e} ${s.organ}`, right: s.sense })),
        explanation: 'Setiap organ deria mempunyai fungsi deria tertentu.',
        emoji: '🔗',
      });
    }
    if (mode === 2) {
      const need = rng.pick(needs);
      return mcq(rng, {
        prefix: 'sn1-deria',
        prompt: `Mengapakah benda hidup memerlukan ${need.toLowerCase()}?`,
        answer: needAnswers(need),
        distractors: [
          'Untuk menjadi lebih besar sahaja.',
          'Untuk kelihatan cantik.',
          'Untuk bermain sahaja.',
          'Benda hidup tidak memerlukannya.',
        ].filter((x) => x !== needAnswers(need)),
        explanation: `Benda hidup memerlukan ${need.toLowerCase()} — ${needAnswers(need).toLowerCase()}`,
        emoji: '🌱',
        cols: 1,
      });
    }
    const isLiving = rng.chance(0.5);
    const obj = isLiving ? rng.pick(living) : rng.pick(nonLiving);
    return trueFalse({
      prefix: 'sn1-deria',
      prompt: `"${obj}" ialah benda ${isLiving ? 'hidup' : 'bukan hidup'}.`,
      isTrue: true,
      explanation: isLiving
        ? `"${obj}" ialah benda hidup kerana ia membesar, bernafas dan memerlukan makanan serta air.`
        : `"${obj}" ialah benda bukan hidup kerana ia tidak bernafas, tidak membesar dan tidak memerlukan makanan.`,
      emoji: isLiving ? '🌿' : '🪨',
    });
  });
}

function needAnswers(need: string): string {
  switch (need) {
    case 'Air':
      return 'Untuk menjalankan proses dalam badan.';
    case 'Makanan':
      return 'Untuk membesar dan mendapat tenaga.';
    case 'Udara':
      return 'Untuk bernafas dan kekal hidup.';
    default:
      return 'Untuk tumbesaran yang sihat.';
  }
}

function sn1BendaHidupBukanHidup(_y: number, rng: Rng, count: number): Question[] {
  const groups = [
    { cat: 'Haiwan', items: ['Kucing', 'Ayam', 'Ikan', 'Burung', 'Lembu', 'Arnab'], e: '🐾' },
    { cat: 'Tumbuhan', items: ['Pokok', 'Bunga', 'Rumput', 'Paku pakis', 'Kaktus'], e: '🌿' },
    { cat: 'Benda Bukan Hidup', items: ['Batu', 'Meja', 'Buku', 'Pensel', 'Kerusi'], e: '🪨' },
  ];
  return fill(count, (i) => {
    if (i % 2 === 0) {
      const g = rng.pick(groups);
      const picked = rng.sample(g.items, 3);
      const other = rng.pick(groups.filter((x) => x.cat !== g.cat)).items[0];
      return mcq(rng, {
        prefix: 'sn1-hidup',
        prompt: `Antara berikut, yang manakah BUKAN ${g.cat.toLowerCase()}?\n${[...picked, other].join(', ')}`,
        answer: other,
        distractors: picked,
        explanation: `"${other}" bukan ${g.cat.toLowerCase()}.`,
        emoji: '🔍',
        cols: 2,
        speak: `Yang manakah bukan ${g.cat}?`,
      });
    }
    const g = rng.pick(groups);
    const picked = rng.sample(g.items, 3);
    return mcq(rng, {
      prefix: 'sn1-hidup',
      prompt: `Kumpulan manakah bagi senarai ini?\n${picked.join(', ')}`,
      answer: g.cat,
      distractors: groups.filter((x) => x.cat !== g.cat).map((x) => x.cat),
      explanation: `Semua ini ialah ${g.cat.toLowerCase()}.`,
      emoji: '🗂️',
      cols: 2,
    });
  });
}

function sn1MagnetPenyerapan(_y: number, rng: Rng, count: number): Question[] {
  const magnetic = ['Paku besi', 'Klip kertas', 'Pakau besi', 'Kunci besi', 'Gunting'];
  const nonMagnetic = ['Pensel kayu', 'Getah pemadam', 'Kertas', 'Plastik', 'Kaca', 'Buku'];
  const absorbent = ['Tisu', 'Span', 'Kain', 'Kertas'];
  const nonAbsorbent = ['Plastik', 'Kaca', 'Logam', 'Getah'];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const isMag = rng.chance(0.5);
      const obj = isMag ? rng.pick(magnetic) : rng.pick(nonMagnetic);
      return mcq(rng, {
        prefix: 'sn1-magnet',
        prompt: `Adakah "${obj}" boleh ditarik oleh magnet?`,
        answer: isMag ? 'Boleh' : 'Tidak boleh',
        distractors: ['Boleh', 'Tidak boleh'].filter((x) => x !== (isMag ? 'Boleh' : 'Tidak boleh')),
        explanation: isMag
          ? `"${obj}" mengandungi besi, jadi boleh ditarik oleh magnet.`
          : `"${obj}" bukan logam, jadi tidak boleh ditarik oleh magnet.`,
        emoji: '🧲',
        cols: 2,
        speak: `Adakah ${obj} boleh ditarik oleh magnet?`,
      });
    }
    if (mode === 1) {
      const isAbs = rng.chance(0.5);
      const obj = isAbs ? rng.pick(absorbent) : rng.pick(nonAbsorbent);
      return trueFalse({
        prefix: 'sn1-serap',
        prompt: `"${obj}" boleh menyerap air.`,
        isTrue: isAbs,
        explanation: isAbs
          ? `"${obj}" boleh menyerap air.`
          : `"${obj}" tidak menyerap air kerana permukaannya kalis air.`,
        emoji: '💧',
      });
    }
    const picked = rng.sample(magnetic, 3);
    return match({
      prefix: 'sn1-magnet',
      prompt: 'Padankan objek dengan keadaan boleh ditarik magnet atau tidak.',
      pairs: [...picked.map((p) => ({ left: p, right: 'Boleh ditarik magnet' })), { left: rng.pick(nonMagnetic), right: 'Tidak boleh ditarik magnet' }],
      explanation: 'Objek logam besi boleh ditarik magnet; objek bukan logam tidak.',
      emoji: '🧲',
    });
  });
}

function sn1BumiAsasBinaan(_y: number, rng: Rng, count: number): Question[] {
  const surfaces = [
    { t: 'Tanah', d: 'Tempat tumbuhan tumbuh dan haiwan tinggal' },
    { t: 'Air', d: 'Tempat ikan hidup dan sumber minuman' },
    { t: 'Batu', d: 'Bahan keras di permukaan bumi' },
    { t: 'Pasir', d: 'Butiran halus di tepi pantai' },
  ];
  const blocks = [
    { t: 'Kubus', d: 'Bongkah berbentuk segi empat sama' },
    { t: 'Kuboid', d: 'Bongkah berbentuk segi empat tepat' },
    { t: 'Silinder', d: 'Bongkah berbentuk bulat memanjang' },
    { t: 'Sfera', d: 'Bongkah berbentuk bulat penuh' },
  ];
  return fill(count, (i) => {
    if (i % 2 === 0) {
      const s = rng.pick(surfaces);
      return mcq(rng, {
        prefix: 'sn1-bumi',
        prompt: `Apakah kegunaan utama ${s.t}?`,
        answer: s.d,
        distractors: surfaces.filter((x) => x.t !== s.t).map((x) => x.d),
        explanation: `${s.t}: ${s.d}.`,
        emoji: '🌍',
        cols: 1,
        speak: `Apakah kegunaan ${s.t}?`,
      });
    }
    const picked = rng.sample(blocks, 3);
    return match({
      prefix: 'sn1-binaan',
      prompt: 'Padankan bongkah asas dengan bentuknya.',
      pairs: picked.map((b) => ({ left: b.t, right: b.d })),
      explanation: 'Setiap bongkah asas mempunyai bentuk tersendiri.',
      emoji: '🧱',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 1 (sambungan)                                                 */
/* ------------------------------------------------------------------ */

function sn1KemahiranSaintifik(_y: number, rng: Rng, count: number): Question[] {
  const skills = [
    { t: 'Memerhati', d: 'Menggunakan deria untuk mengkaji objek', e: '👁️' },
    { t: 'Mengelas', d: 'Mengumpulkan objek mengikut ciri yang sama', e: '🗂️' },
    { t: 'Mengukur', d: 'Menggunakan nombor dan alat ukur', e: '📏' },
    { t: 'Berkomunikasi', d: 'Menyampaikan maklumat kepada orang lain', e: '🗣️' },
  ];
  const rules = [
    'Jangan makan atau minum di dalam bilik sains',
    'Dengar arahan guru dengan teliti',
    'Jangan berlari di dalam bilik sains',
    'Cuci tangan selepas menjalankan eksperimen',
  ];
  const notRules = [
    'Boleh makan sambil bereksperimen',
    'Boleh berlari-lari di dalam bilik sains',
    'Boleh rasa semua bahan kimia',
    'Boleh tinggalkan alat tanpa dibersihkan',
  ];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const s = rng.pick(skills);
      return mcq(rng, {
        prefix: 'sn1-skill',
        prompt: `${s.e} Apakah maksud kemahiran "${s.t}"?`,
        answer: s.d,
        distractors: skills.filter((x) => x.t !== s.t).map((x) => x.d),
        explanation: `"${s.t}": ${s.d.toLowerCase()}.`,
        emoji: '🔬',
        cols: 1,
        speak: `Apakah maksud kemahiran ${s.t}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(skills, 3);
      return match({
        prefix: 'sn1-skill',
        prompt: 'Padankan kemahiran proses sains dengan maksudnya.',
        pairs: picked.map((s) => ({ left: s.t, right: s.d })),
        explanation: 'Kemahiran proses sains membantu kita menjalankan penyiasatan.',
        emoji: '🧭',
      });
    }
    if (mode === 2) {
      const good = rng.chance(0.5);
      const r = good ? rng.pick(rules) : rng.pick(notRules);
      return trueFalse({
        prefix: 'sn1-rules',
        prompt: `Peraturan bilik sains: "${r}."`,
        isTrue: good,
        explanation: good
          ? 'Betul! Peraturan ini menjaga keselamatan kita di bilik sains.'
          : 'Salah. Peraturan ini berbahaya dan tidak boleh dilakukan di bilik sains.',
        emoji: good ? '🦺' : '⚠️',
      });
    }
    const s = rng.pick(skills);
    return mcq(rng, {
      prefix: 'sn1-skill',
      prompt: `Kamu menggunakan deria untuk mengkaji sehelai daun. Kemahiran apakah ini?`,
      answer: 'Memerhati',
      distractors: skills.filter((x) => x.t !== 'Memerhati').map((x) => x.t),
      explanation: 'Menggunakan deria untuk mengkaji objek dipanggil memerhati.',
      emoji: s.e,
      cols: 2,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 2                                                             */
/* ------------------------------------------------------------------ */

function sn2Elektrik(_y: number, rng: Rng, count: number): Question[] {
  const components = [
    { t: 'Mentol', d: 'Menyala apabila arus elektrik mengalir', e: '💡' },
    { t: 'Bateri', d: 'Membekalkan tenaga elektrik', e: '🔋' },
    { t: 'Wayar', d: 'Menghubungkan komponen litar', e: '🔌' },
    { t: 'Suis', d: 'Membuka dan menutup litar', e: '🎚️' },
  ];
  const conductors = ['Paku besi', 'Duit syiling', 'Klip kertas', 'Grafit pensel'];
  const insulators = ['Getah', 'Kertas', 'Plastik', 'Kayu', 'Kaca'];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const c = rng.pick(components);
      return mcq(rng, {
        prefix: 'sn2-elektrik',
        prompt: `${c.e} Apakah fungsi ${c.t.toLowerCase()} dalam litar elektrik?`,
        answer: c.d,
        distractors: components.filter((x) => x.t !== c.t).map((x) => x.d),
        explanation: `${c.t}: ${c.d.toLowerCase()}.`,
        emoji: '⚡',
        cols: 1,
        speak: `Apakah fungsi ${c.t}?`,
      });
    }
    if (mode === 1) {
      const isConductor = rng.chance(0.5);
      const o = isConductor ? rng.pick(conductors) : rng.pick(insulators);
      return mcq(rng, {
        prefix: 'sn2-elektrik',
        prompt: `"${o}" ialah konduktor atau penebat elektrik?`,
        answer: isConductor ? 'Konduktor' : 'Penebat',
        distractors: ['Konduktor', 'Penebat'],
        explanation: isConductor
          ? `"${o}" ialah konduktor — mentol akan menyala apabila disambung dalam litar.`
          : `"${o}" ialah penebat — mentol tidak menyala kerana elektrik tidak dapat mengalir.`,
        emoji: isConductor ? '⚡' : '🚫',
        cols: 2,
        speak: `Adakah ${o} konduktor atau penebat?`,
      });
    }
    if (mode === 2) {
      const picked = rng.sample([...conductors, ...insulators], 3);
      return match({
        prefix: 'sn2-elektrik',
        prompt: 'Padankan bahan dengan jenisnya.',
        pairs: picked.map((o) => ({
          left: o,
          right: conductors.includes(o) ? 'Konduktor' : 'Penebat',
        })),
        explanation: 'Konduktor membenarkan elektrik mengalir; penebat tidak.',
        emoji: '🔗',
      });
    }
    const complete = rng.chance(0.5);
    return trueFalse({
      prefix: 'sn2-elektrik',
      prompt: complete
        ? 'Mentol menyala apabila litar elektrik lengkap.'
        : 'Mentol menyala walaupun suis terbuka.',
      isTrue: complete,
      explanation: complete
        ? 'Betul! Arus elektrik perlu laluan lengkap untuk menyalakan mentol.'
        : 'Salah. Apabila suis terbuka, litar tidak lengkap dan mentol tidak menyala.',
      emoji: '💡',
    });
  });
}

function sn2Campuran(_y: number, rng: Rng, count: number): Question[] {
  const larut = ['Gula', 'Garam', 'Sirap', 'Madu', 'Serbuk koko'];
  const takLarut = ['Pasir', 'Batu', 'Minyak', 'Serbuk kayu', 'Kacang'];
  const cara = [
    { t: 'Menapis', d: 'Mengasingkan pasir daripada air' },
    { t: 'Menuras', d: 'Mengasingkan air daripada beras' },
    { t: 'Menggunakan magnet', d: 'Mengasingkan besi daripada pasir' },
    { t: 'Mengenap', d: 'Membiarkan pasir mendap di dasar' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const isLarut = rng.chance(0.5);
      const b = isLarut ? rng.pick(larut) : rng.pick(takLarut);
      return mcq(rng, {
        prefix: 'sn2-campuran',
        prompt: `"${b}" larut atau tidak larut dalam air?`,
        answer: isLarut ? 'Larut' : 'Tidak larut',
        distractors: ['Larut', 'Tidak larut'],
        explanation: isLarut
          ? `"${b}" larut dalam air — ia hilang apabila dikacau.`
          : `"${b}" tidak larut dalam air — ia masih kelihatan.`,
        emoji: isLarut ? '💧' : '🏖️',
        cols: 2,
        speak: `Adakah ${b} larut dalam air?`,
      });
    }
    if (mode === 1) {
      const c = rng.pick(cara);
      return mcq(rng, {
        prefix: 'sn2-campuran',
        prompt: `Kaedah "${c.t}" digunakan untuk apa?`,
        answer: c.d,
        distractors: cara.filter((x) => x.t !== c.t).map((x) => x.d),
        explanation: `${c.t}: ${c.d.toLowerCase()}.`,
        emoji: '🥣',
        cols: 1,
      });
    }
    const picked = rng.sample([...larut, ...takLarut], 3);
    return match({
      prefix: 'sn2-campuran',
      prompt: 'Padankan bahan dengan sifat larutnya dalam air.',
      pairs: picked.map((b) => ({
        left: b,
        right: larut.includes(b) ? 'Larut' : 'Tidak larut',
      })),
      explanation: 'Bahan larut hilang dalam air; bahan tidak larut masih kelihatan.',
      emoji: '🔗',
    });
  });
}

function sn2PembiakanTumbesaran(_y: number, rng: Rng, count: number): Question[] {
  const animals = [
    { t: 'Kucing', breed: 'Melahirkan anak', e: '🐱' },
    { t: 'Ayam', breed: 'Bertelur', e: '🐔' },
    { t: 'Ikan', breed: 'Bertelur', e: '🐟' },
    { t: 'Lembu', breed: 'Melahirkan anak', e: '🐄' },
    { t: 'Burung', breed: 'Bertelur', e: '🐦' },
    { t: 'Katak', breed: 'Bertelur', e: '🐸' },
  ];
  const plants: { t: string; seed: string }[] = [
    { t: 'Pokok bunga', seed: 'Biji benih' },
    { t: 'Pokok kelapa', seed: 'Biji benih' },
    { t: 'Pokok keladi', seed: 'Ubi' },
    { t: 'Pokok pisang', seed: 'Tunas' },
    { t: 'Pokok ubi kayu', seed: 'Keratan batang' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const a = rng.pick(animals);
      return mcq(rng, {
        prefix: 'sn2-biakan',
        prompt: `${a.e} Bagaimanakah ${a.t.toLowerCase()} membiak?`,
        answer: a.breed,
        distractors: ['Bertelur', 'Melahirkan anak'].filter((x) => x !== a.breed),
        explanation: `${a.t} ${a.breed.toLowerCase()}.`,
        emoji: '🐾',
        cols: 2,
        speak: `Bagaimana ${a.t} membiak?`,
      });
    }
    if (mode === 1) {
      const p = rng.pick(plants);
      return mcq(rng, {
        prefix: 'sn2-tumbuhan',
        prompt: `Bagaimanakah ${p.t.toLowerCase()} boleh membiak?`,
        answer: p.seed,
        distractors: ['Biji benih', 'Ubi', 'Tunas', 'Keratan batang', 'Daun'].filter((x) => x !== p.seed),
        explanation: `${p.t} membiak melalui ${p.seed.toLowerCase()}.`,
        emoji: '🌱',
        cols: 2,
        speak: `Bagaimana ${p.t} membiak?`,
      });
    }
    const picked = rng.sample(animals.filter((a) => a.breed === 'Bertelur'), 2).concat(
      rng.sample(animals.filter((a) => a.breed === 'Melahirkan anak'), 1),
    );
    return match({
      prefix: 'sn2-biakan',
      prompt: 'Padankan haiwan dengan cara pembiakannya.',
      pairs: picked.map((a) => ({ left: `${a.e} ${a.t}`, right: a.breed })),
      explanation: 'Sesetengah haiwan bertelur, sesetengah melahirkan anak.',
      emoji: '🥚',
    });
  });
}

function sn2KeperluanManusia(_y: number, rng: Rng, count: number): Question[] {
  const steps = ['Bayi', 'Kanak-kanak', 'Remaja', 'Dewasa', 'Warga emas'];
  const foods = [
    { g: 'Karbohidrat', ex: 'Nasi, roti, ubi', e: '🍚' },
    { g: 'Protein', ex: 'Ikan, ayam, telur', e: '🍗' },
    { g: 'Vitamin', ex: 'Sayur, buah', e: '🥦' },
    { g: 'Lemak', ex: 'Minyak, mentega', e: '🥑' },
    { g: 'Air', ex: 'Air minuman', e: '💧' },
  ];
  const teeth = [
    { t: 'Gigi kacip', f: 'Memotong makanan' },
    { t: 'Gigi taring', f: 'Mengoyak makanan' },
    { t: 'Gigi geraham', f: 'Mengunyah makanan' },
  ];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const idx = rng.int(0, steps.length - 2);
      return mcq(rng, {
        prefix: 'sn2-manusia',
        prompt: `Selepas peringkat "${steps[idx]}", apakah peringkat seterusnya dalam tumbesaran manusia?`,
        answer: steps[idx + 1],
        distractors: steps.filter((_, k) => k !== idx + 1),
        explanation: `Urutan tumbesaran manusia: ${steps.join(' → ')}.`,
        emoji: '👶',
        cols: 2,
        speak: `Selepas ${steps[idx]}, apakah peringkat seterusnya?`,
      });
    }
    if (mode === 1) {
      const f = rng.pick(foods);
      return mcq(rng, {
        prefix: 'sn2-makanan',
        prompt: `${f.e} Apakah kelas makanan bagi ${f.ex.toLowerCase()}?`,
        answer: f.g,
        distractors: foods.filter((x) => x.g !== f.g).map((x) => x.g),
        explanation: `${f.ex} ialah ${f.g.toLowerCase()}.`,
        emoji: '🍽️',
        cols: 2,
      });
    }
    if (mode === 2) {
      const t = rng.pick(teeth);
      return mcq(rng, {
        prefix: 'sn2-gigi',
        prompt: `Apakah fungsi ${t.t.toLowerCase()}?`,
        answer: t.f,
        distractors: teeth.filter((x) => x.t !== t.t).map((x) => x.f),
        explanation: `${t.t} berfungsi untuk ${t.f.toLowerCase()}.`,
        emoji: '🦷',
        cols: 2,
        speak: `Apakah fungsi ${t.t}?`,
      });
    }
    return order({
      prefix: 'sn2-manusia',
      prompt: 'Susun peringkat tumbesaran manusia mengikut urutan yang betul.',
      items: rng.shuffle(steps),
      correctOrder: steps,
      explanation: `Urutan yang betul: ${steps.join(' → ')}.`,
      emoji: '📈',
    });
  });
}

function sn2TerangGelap(_y: number, rng: Rng, count: number): Question[] {
  const sources = ['Matahari', 'Lampu', 'Lilin', 'Obor', 'Bintang'];
  const nonSources = ['Bulan', 'Cermin', 'Buku', 'Meja'];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const isSource = rng.chance(0.6);
      const s = isSource ? rng.pick(sources) : rng.pick(nonSources);
      return mcq(rng, {
        prefix: 'sn2-terang',
        prompt: `Adakah "${s}" sumber cahaya?`,
        answer: isSource ? 'Ya' : 'Tidak',
        distractors: ['Ya', 'Tidak'].filter((x) => x !== (isSource ? 'Ya' : 'Tidak')),
        explanation: isSource
          ? `"${s}" mengeluarkan cahaya sendiri, jadi ia sumber cahaya.`
          : `"${s}" tidak mengeluarkan cahaya sendiri. Ia hanya memantulkan cahaya.`,
        emoji: '💡',
        cols: 2,
        speak: `Adakah ${s} sumber cahaya?`,
      });
    }
    if (mode === 1) {
      return trueFalse({
        prefix: 'sn2-terang',
        prompt: 'Bayang-bayang terbentuk apabila cahaya dihalang oleh objek legap.',
        isTrue: true,
        explanation: 'Betul! Objek legap menghalang cahaya dan membentuk bayang-bayang.',
        emoji: '🌑',
      });
    }
    return trueFalse({
      prefix: 'sn2-terang',
      prompt: 'Bulan ialah sumber cahaya kerana ia bersinar pada waktu malam.',
      isTrue: false,
      explanation: 'Bulan tidak mengeluarkan cahaya sendiri. Ia memantulkan cahaya matahari.',
      emoji: '🌙',
    });
  });
}

function sn2AsidAlkali(_y: number, rng: Rng, count: number): Question[] {
  const acids = ['Limau', 'Cuka', 'Asam', 'Yogurt'];
  const alkalis = ['Sabun', 'Ubat gigi', 'Soda bikarbonat', 'Abu kayu'];
  const neutral = ['Air tulen', 'Gula', 'Garam'];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const isAcid = rng.chance(0.5);
      const s = isAcid ? rng.pick(acids) : rng.pick(alkalis);
      return mcq(rng, {
        prefix: 'sn2-asid',
        prompt: `"${s}" ialah bahan ____.`,
        answer: isAcid ? 'berasid' : 'beralkali',
        distractors: ['berasid', 'beralkali', 'neutral'],
        explanation: isAcid ? `"${s}" bersifat berasid.` : `"${s}" bersifat beralkali.`,
        emoji: isAcid ? '🍋' : '🧼',
        cols: 2,
        speak: `Adakah ${s} berasid atau beralkali?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample([...acids, ...alkalis, ...neutral], 3);
      return match({
        prefix: 'sn2-asid',
        prompt: 'Padankan bahan dengan sifatnya.',
        pairs: picked.map((p) => ({
          left: p,
          right: acids.includes(p) ? 'Berasid' : alkalis.includes(p) ? 'Beralkali' : 'Neutral',
        })),
        explanation: 'Bahan boleh dikelaskan sebagai berasid, beralkali atau neutral.',
        emoji: '🧪',
      });
    }
    const s = rng.pick(neutral);
    return trueFalse({
      prefix: 'sn2-asid',
      prompt: `"${s}" ialah bahan neutral.`,
      isTrue: true,
      explanation: `Betul! "${s}" tidak berasid dan tidak beralkali — ia neutral.`,
      emoji: '💧',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 3                                                             */
/* ------------------------------------------------------------------ */

function sn3KemahiranSaintifik(_y: number, rng: Rng, count: number): Question[] {
  const skills = [
    { t: 'Memerhati', d: 'Menggunakan deria untuk mengkaji objek', e: '👁️' },
    { t: 'Mengelas', d: 'Mengumpulkan objek mengikut ciri yang sama', e: '🗂️' },
    { t: 'Mengukur', d: 'Menggunakan nombor dan alat ukur', e: '📏' },
    { t: 'Membuat inferens', d: 'Membuat andaian berdasarkan pemerhatian', e: '🧠' },
    { t: 'Meramal', d: 'Membuat jangkaan tentang apa yang akan berlaku', e: '🔮' },
    { t: 'Berkomunikasi', d: 'Menyampaikan maklumat kepada orang lain', e: '🗣️' },
  ];
  const rules = [
    'Tidak makan atau minum di dalam bilik sains',
    'Mendengar arahan guru dengan teliti',
    'Tidak berlari di dalam bilik sains',
    'Mencuci tangan selepas menjalankan eksperimen',
    'Berhati-hati dengan bahan kimia dan api',
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const s = rng.pick(skills);
      return mcq(rng, {
        prefix: 'sn3-skill',
        prompt: `${s.e} Apakah maksud kemahiran "${s.t}"?`,
        answer: s.d,
        distractors: skills.filter((x) => x.t !== s.t).map((x) => x.d),
        explanation: `"${s.t}": ${s.d.toLowerCase()}.`,
        emoji: '🔬',
        cols: 1,
        speak: `Apakah maksud ${s.t}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(skills, 3);
      return match({
        prefix: 'sn3-skill',
        prompt: 'Padankan kemahiran proses sains dengan maksudnya.',
        pairs: picked.map((s) => ({ left: s.t, right: s.d })),
        explanation: 'Kemahiran proses sains digunakan untuk menjalankan penyiasatan.',
        emoji: '🧭',
      });
    }
    return trueFalse({
      prefix: 'sn3-rules',
      prompt: `Peraturan bilik sains: "${rng.pick(rules)}."`,
      isTrue: true,
      explanation: 'Betul! Peraturan ini penting untuk keselamatan dan pembelajaran.',
      emoji: '🦺',
    });
  });
}

function sn3Pengukuran(_y: number, rng: Rng, count: number): Question[] {
  const tools = [
    { t: 'Pembaris', use: 'Panjang', unit: 'cm', e: '📏' },
    { t: 'Jangka suhu', use: 'Suhu', unit: '°C', e: '🌡️' },
    { t: 'Jam randik', use: 'Masa', unit: 's', e: '⏱️' },
    { t: 'Neraca', use: 'Jisim', unit: 'kg', e: '⚖️' },
    { t: 'Silinder penyukat', use: 'Isi padu cecair', unit: 'mℓ', e: '🧪' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const t = rng.pick(tools);
      return mcq(rng, {
        prefix: 'sn3-ukur',
        prompt: `${t.e} Apakah yang boleh diukur dengan ${t.t.toLowerCase()}?`,
        answer: t.use,
        distractors: tools.filter((x) => x.t !== t.t).map((x) => x.use),
        explanation: `${t.t} digunakan untuk mengukur ${t.use.toLowerCase()} dalam unit ${t.unit}.`,
        emoji: '📐',
        cols: 1,
        speak: `Apakah yang diukur dengan ${t.t}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(tools, 3);
      return match({
        prefix: 'sn3-ukur',
        prompt: 'Padankan alat pengukuran dengan kuantiti yang diukur.',
        pairs: picked.map((t) => ({ left: `${t.e} ${t.t}`, right: t.use })),
        explanation: 'Setiap alat pengukuran mempunyai kegunaan tertentu.',
        emoji: '🧰',
      });
    }
    const t = rng.pick(tools);
    return fillBlank(rng, {
      prefix: 'sn3-ukur',
      prompt: `Unit bagi ${t.use.toLowerCase()} ialah ____.`,
      answer: t.unit,
      options: tools.filter((x) => x.unit !== t.unit).map((x) => x.unit),
      explanation: `Unit bagi ${t.use.toLowerCase()} ialah ${t.unit}.`,
      emoji: '📊',
      cols: 2,
    });
  });
}

function sn3Ketumpatan(_y: number, rng: Rng, count: number): Question[] {
  const sinks = ['Batu', 'Paku besi', 'Kunci', 'Guli kaca', 'Syiling'];
  const floats = ['Gabu (plastik)', 'Kertas', 'Daun kering', 'Kayu', 'Jar herba'];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const isSink = rng.chance(0.5);
      const o = isSink ? rng.pick(sinks) : rng.pick(floats);
      return mcq(rng, {
        prefix: 'sn3-tumpat',
        prompt: `Adakah "${o}" tenggelam atau terapung dalam air?`,
        answer: isSink ? 'Tenggelam' : 'Terapung',
        distractors: ['Tenggelam', 'Terapung'].filter((x) => x !== (isSink ? 'Tenggelam' : 'Terapung')),
        explanation: isSink
          ? `"${o}" lebih tumpat daripada air, jadi ia tenggelam.`
          : `"${o}" kurang tumpat daripada air, jadi ia terapung.`,
        emoji: '🌊',
        cols: 2,
        speak: `Adakah ${o} tenggelam atau terapung?`,
      });
    }
    if (mode === 1) {
      return trueFalse({
        prefix: 'sn3-tumpat',
        prompt: 'Objek yang lebih tumpat daripada air akan tenggelam.',
        isTrue: true,
        explanation: 'Betul! Ketumpatan menentukan sama ada objek tenggelam atau terapung.',
        emoji: '⚖️',
      });
    }
    const picked = rng.sample([...sinks.slice(0, 2), ...floats.slice(0, 1)], 3);
    return match({
      prefix: 'sn3-tumpat',
      prompt: 'Padankan objek dengan keadaan dalam air.',
      pairs: picked.map((p) => ({
        left: p,
        right: sinks.includes(p) ? 'Tenggelam' : 'Terapung',
      })),
      explanation: 'Ketumpatan objek berbanding air menentukan hasilnya.',
      emoji: '🚢',
    });
  });
}

function sn3SistemSuria(_y: number, rng: Rng, count: number): Question[] {
  const planets = [
    { n: 'Utarid', pos: 1 },
    { n: 'Zuhrah', pos: 2 },
    { n: 'Bumi', pos: 3 },
    { n: 'Marikh', pos: 4 },
    { n: 'Musytari', pos: 5 },
    { n: 'Zuhal', pos: 6 },
    { n: 'Uranus', pos: 7 },
    { n: 'Neptun', pos: 8 },
  ];
  const facts: [string, string][] = [
    ['Bumi', 'Satu-satunya planet yang mempunyai hidupan'],
    ['Musytari', 'Planet terbesar dalam sistem suria'],
    ['Zuhal', 'Planet yang mempunyai gelang yang jelas'],
    ['Merah', 'Warna yang dikenali bagi planet Marikh'],
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const p = rng.pick(planets);
      return mcq(rng, {
        prefix: 'sn3-suria',
        prompt: `Planet "Bumi" ialah planet ke-3 daripada Matahari.\nPlanet "${p.n}" ialah planet ke berapa?`,
        answer: String(p.pos),
        distractors: planets.filter((x) => x.n !== p.n).map((x) => String(x.pos)),
        explanation: `${p.n} ialah planet ke-${p.pos} daripada Matahari.`,
        emoji: '🪐',
        cols: 2,
        speak: `Planet ${p.n} ialah planet ke berapa?`,
      });
    }
    if (mode === 1) {
      const f = rng.pick(facts);
      return fillBlank(rng, {
        prefix: 'sn3-suria',
        prompt: `${f[1]} ialah ciri bagi ____.`,
        answer: f[0],
        options: ['Bumi', 'Musytari', 'Zuhal', 'Marikh'].filter((x) => x !== f[0]),
        explanation: `${f[1]} — ${f[0]}.`,
        emoji: '🔭',
        cols: 2,
      });
    }
    return order({
      prefix: 'sn3-suria',
      prompt: 'Susun 4 planet pertama daripada Matahari mengikut urutan.',
      items: rng.shuffle(planets.slice(0, 4).map((p) => p.n)),
      correctOrder: planets.slice(0, 4).map((p) => p.n),
      explanation: `Urutan: ${planets.slice(0, 4).map((p) => p.n).join(' → ')}.`,
      emoji: '☀️',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 4-6                                                           */
/* ------------------------------------------------------------------ */

function sn4ProsesHidup(_y: number, rng: Rng, count: number): Question[] {
  const processes = [
    { t: 'Fotosintesis', d: 'Tumbuhan membuat makanan menggunakan cahaya matahari', e: '🌞' },
    { t: 'Respirasi', d: 'Proses mengeluarkan tenaga daripada makanan', e: '💨' },
    { t: 'Transpirasi', d: 'Kehilangan air melalui daun', e: '💧' },
    { t: 'Pencernaan', d: 'Memecahkan makanan kepada bentuk ringkas', e: '🍽️' },
  ];
  return fill(count, () => {
    const p = rng.pick(processes);
    return mcq(rng, {
      prefix: 'sn4-proses',
      prompt: `${p.e} Apakah maksud proses "${p.t}"?`,
      answer: p.d,
      distractors: processes.filter((x) => x.t !== p.t).map((x) => x.d),
      explanation: `"${p.t}": ${p.d.toLowerCase()}.`,
      emoji: '🔄',
      cols: 1,
      speak: `Apakah maksud ${p.t}?`,
    });
  });
}

function sn4PengelasanHaiwan(_y: number, rng: Rng, count: number): Question[] {
  const groups = [
    { g: 'Mamalia', items: ['Kucing', 'Lembu', 'Ikan paus', 'Kelawar', 'Gajah'], c: 'Berbulu, melahirkan anak, menyusukan anak' },
    { g: 'Burung', items: ['Ayam', 'Helang', 'Merpati', 'Burung hantu'], c: 'Berbulu pelepah, bertelur, mempunyai paruh' },
    { g: 'Reptilia', items: ['Buaya', 'Ular', 'Cicak', 'Penyu'], c: 'Bersisik kering, bertelur di darat' },
    { g: 'Amfibia', items: ['Katak', 'Salamander', 'Kodok'], c: 'Hidup di darat dan air, kulit lembap, bertelur di air' },
    { g: 'Ikan', items: ['Ikan kembung', 'Ikan emas', 'Jerung', 'Sepat'], c: 'Bernafas dengan insang, berenang dengan sirip' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const g = rng.pick(groups);
      const animal = rng.pick(g.items);
      return mcq(rng, {
        prefix: 'sn4-haiwan',
        prompt: `Kumpulan manakah bagi "${animal}"?`,
        answer: g.g,
        distractors: groups.filter((x) => x.g !== g.g).map((x) => x.g),
        explanation: `"${animal}" ialah ${g.g.toLowerCase()}: ${g.c.toLowerCase()}.`,
        emoji: '🐾',
        cols: 2,
        speak: `Kumpulan manakah bagi ${animal}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(groups, 3);
      return match({
        prefix: 'sn4-haiwan',
        prompt: 'Padankan kumpulan haiwan dengan cirinya.',
        pairs: picked.map((g) => ({ left: g.g, right: g.c })),
        explanation: 'Setiap kumpulan haiwan mempunyai ciri khusus.',
        emoji: '🗂️',
      });
    }
    const picked = rng.sample(groups, 3);
    return mcq(rng, {
      prefix: 'sn4-haiwan',
      prompt: 'Haiwan manakah yang bernafas menggunakan insang?',
      answer: 'Ikan',
      distractors: picked.map((g) => g.g).filter((x) => x !== 'Ikan'),
      explanation: 'Ikan bernafas menggunakan insang untuk mendapatkan oksigen daripada air.',
      emoji: '🐟',
      cols: 2,
    });
  });
}

function sn4Tenaga(_y: number, rng: Rng, count: number): Question[] {
  const forms = [
    { t: 'Tenaga cahaya', src: 'Matahari, lampu' },
    { t: 'Tenaga haba', src: 'Api, dapur, seterika' },
    { t: 'Tenaga bunyi', src: 'Pembesar suara, gendang' },
    { t: 'Tenaga elektrik', src: 'Bateri, penjana' },
    { t: 'Tenaga kinetik', src: 'Objek bergerak' },
    { t: 'Tenaga keupayaan', src: 'Objek pada ketinggian' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const f = rng.pick(forms);
      return mcq(rng, {
        prefix: 'sn4-tenaga',
        prompt: `Apakah sumber bagi ${f.t.toLowerCase()}?`,
        answer: f.src,
        distractors: forms.filter((x) => x.t !== f.t).map((x) => x.src),
        explanation: `${f.t} dihasilkan oleh ${f.src.toLowerCase()}.`,
        emoji: '⚡',
        cols: 1,
        speak: `Apakah sumber ${f.t}?`,
      });
    }
    if (mode === 1) {
      return trueFalse({
        prefix: 'sn4-litar',
        prompt: 'Litar elektrik yang lengkap memerlukan bateri, mentol dan wayar penyambung.',
        isTrue: true,
        explanation: 'Betul! Litar lengkap membenarkan arus elektrik mengalir.',
        emoji: '🔌',
      });
    }
    return order({
      prefix: 'sn4-tenaga',
      prompt: 'Susun komponen litar elektrik asas mengikut susunan yang betul (sumber → pengalir → beban).',
      items: rng.shuffle(['Bateri (sumber tenaga)', 'Wayar penyambung (pengalir)', 'Mentol (beban)']),
      correctOrder: ['Bateri (sumber tenaga)', 'Wayar penyambung (pengalir)', 'Mentol (beban)'],
      explanation: 'Arus elektrik mengalir dari bateri melalui wayar ke mentol.',
      emoji: '💡',
    });
  });
}

function sn4BahanJirim(_y: number, rng: Rng, count: number): Question[] {
  const states = [
    { s: 'Pepejal', c: 'Bentuk dan isi padu tetap' },
    { s: 'Cecair', c: 'Isi padu tetap, bentuk mengikut bekas' },
    { s: 'Gas', c: 'Bentuk dan isi padu tidak tetap' },
  ];
  const changes: [string, string][] = [
    ['Air menjadi ais', 'Pembekuan'],
    ['Ais menjadi air', 'Peleburan'],
    ['Air menjadi wap', 'Penyejatan'],
    ['Wap menjadi air', 'Kondensasi'],
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const st = rng.pick(states);
      return mcq(rng, {
        prefix: 'sn4-jirim',
        prompt: `Apakah ciri utama ${st.s.toLowerCase()}?`,
        answer: st.c,
        distractors: states.filter((x) => x.s !== st.s).map((x) => x.c),
        explanation: `${st.s}: ${st.c.toLowerCase()}.`,
        emoji: '🧊',
        cols: 1,
        speak: `Apakah ciri ${st.s}?`,
      });
    }
    if (mode === 1) {
      const c = rng.pick(changes);
      return mcq(rng, {
        prefix: 'sn4-jirim',
        prompt: `"${c[0]}" ialah proses apa?`,
        answer: c[1],
        distractors: changes.filter((x) => x[1] !== c[1]).map((x) => x[1]),
        explanation: `"${c[0]}" ialah ${c[1].toLowerCase()}.`,
        emoji: '🌡️',
        cols: 2,
      });
    }
    return trueFalse({
      prefix: 'sn4-jirim',
      prompt: 'Gas boleh dimampatkan kerana zarah-zarahnya berjauhan.',
      isTrue: true,
      explanation: 'Betul! Zarah gas berjauhan, jadi gas boleh dimampatkan.',
      emoji: '💨',
    });
  });
}

function sn5KitaranHidup(_y: number, rng: Rng, count: number): Question[] {
  const cycles: { t: string; stages: string[] }[] = [
    { t: 'Katak', stages: ['Telur', 'Berudu', 'Berudu berkaki', 'Katak muda', 'Katak dewasa'] },
    { t: 'Rama-rama', stages: ['Telur', 'Larva (ulat)', 'Pupa (kepompong)', 'Rama-rama dewasa'] },
    { t: 'Ayam', stages: ['Telur', 'Anak ayam', 'Ayam dewasa'] },
  ];
  return fill(count, (i) => {
    const mode = i % 2;
    const c = rng.pick(cycles);
    if (mode === 0) {
      return order({
        prefix: 'sn5-kitaran',
        prompt: `Susun kitaran hidup ${c.t.toLowerCase()} mengikut urutan yang betul.`,
        items: rng.shuffle(c.stages),
        correctOrder: c.stages,
        explanation: `Kitaran hidup ${c.t}: ${c.stages.join(' → ')}.`,
        emoji: '🔄',
      });
    }
    const idx = rng.int(0, c.stages.length - 2);
    return mcq(rng, {
      prefix: 'sn5-kitaran',
      prompt: `Dalam kitaran hidup ${c.t.toLowerCase()}, selepas peringkat "${c.stages[idx]}" ialah ____.`,
      answer: c.stages[idx + 1],
      distractors: c.stages.filter((_, k) => k !== idx + 1),
      explanation: `Urutan: ${c.stages.join(' → ')}.`,
      emoji: '🐸',
      cols: 1,
      speak: `Selepas ${c.stages[idx]} dalam kitaran ${c.t}?`,
    });
  });
}

function sn5Fotosintesis(_y: number, rng: Rng, count: number): Question[] {
  const facts = [
    'Tumbuhan hijau membuat makanan melalui fotosintesis.',
    'Klorofil menyerap cahaya matahari untuk fotosintesis.',
    'Fotosintesis menghasilkan glukosa dan oksigen.',
    'Fotosintesis memerlukan air, karbon dioksida dan cahaya matahari.',
    'Stomata pada daun membenarkan pertukaran gas.',
  ];
  return fill(count, (i) => {
    if (i % 2 === 0) {
      return trueFalse({
        prefix: 'sn5-fotosintesis',
        prompt: rng.pick(facts),
        isTrue: true,
        explanation: 'Betul! Ini ialah fakta tentang fotosintesis.',
        emoji: '🌱',
      });
    }
    const qs: [string, string, string[]][] = [
      ['Apakah yang diperlukan untuk fotosintesis?', 'Air, karbon dioksida dan cahaya matahari', ['Air dan gula sahaja', 'Oksigen dan nitrogen', 'Cahaya sahaja']],
      ['Apakah hasil fotosintesis?', 'Glukosa dan oksigen', ['Karbon dioksida dan air', 'Nitrogen dan haba', 'Protein dan lemak']],
      ['Apakah pigmen yang menyerap cahaya dalam daun?', 'Klorofil', ['Hemoglobin', 'Karoten', 'Melanin']],
      ['Di manakah stomata terletak?', 'Pada permukaan daun', ['Pada akar', 'Pada batang', 'Pada bunga']],
    ];
    const q = rng.pick(qs);
    return mcq(rng, {
      prefix: 'sn5-fotosintesis',
      prompt: q[0],
      answer: q[1],
      distractors: q[2],
      explanation: `Jawapannya: ${q[1]}.`,
      emoji: '🌿',
      cols: 1,
      speak: q[0],
    });
  });
}

function sn5JirimDanBahan(_y: number, rng: Rng, count: number): Question[] {
  const items: [string, string, string[]][] = [
    ['Apakah yang berlaku kepada jisim air semasa pembekuan?', 'Jisim kekal sama', ['Jisim bertambah', 'Jisim berkurang', 'Jisim menjadi sifar']],
    ['Mengapakah bau makanan boleh merebak di dalam bilik?', 'Zarah-zarah gas bergerak dan tersebar', ['Kerana makanan bergerak', 'Kerana udara berhenti', 'Kerana zarah gas berhenti']],
    ['Apakah proses perubahan pepejal terus kepada gas?', 'Pemejalwapan', ['Peleburan', 'Pembekuan', 'Kondensasi']],
    ['Bahan manakah yang merupakan konduktor haba yang baik?', 'Logam', ['Kayu', 'Plastik', 'Kaca']],
  ];
  return fill(count, (i) => {
    const q = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'sn5-jirim',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🔬',
        cols: 1,
        speak: q[0],
      });
    }
    return mcq(rng, {
      prefix: 'sn5-jirim',
      prompt: 'Bahan manakah yang merupakan penebat haba yang baik?',
      answer: 'Kayu',
      distractors: ['Besi', 'Tembaga', 'Aluminium'],
      explanation: 'Kayu ialah penebat haba kerana tidak mengalirkan haba dengan baik.',
      emoji: '🪵',
      cols: 2,
    });
  });
}

function sn5BumiAngkasaDanTeknologi(_y: number, rng: Rng, count: number): Question[] {
  const items: [string, string, string[]][] = [
    ['Apakah planet terdekat dengan Matahari?', 'Utarid', ['Zuhrah', 'Bumi', 'Marikh']],
    ['Apakah bintang terdekat dengan Bumi?', 'Matahari', ['Sirius', 'Alpha Centauri', 'Polaris']],
    ['Berapakah masa keseluruhan Bumi berputar pada paksinya?', '24 jam', ['12 jam', '365 hari', '30 hari']],
    ['Apakah yang menyebabkan siang dan malam?', 'Putaran Bumi pada paksinya', ['Peredaran Bumi mengelilingi Matahari', 'Putaran Bulan', 'Gerhana Matahari']],
    ['Apakah yang menyebabkan tahun?', 'Peredaran Bumi mengelilingi Matahari', ['Putaran Bumi pada paksinya', 'Putaran Bulan', 'Perubahan musim']],
  ];
  const tech: [string, string, string[]][] = [
    ['Apakah kegunaan takal dalam kehidupan harian?', 'Mengangkat beban berat dengan mudah', ['Menghasilkan elektrik', 'Menyimpan air', 'Menyejukkan makanan']],
    ['Apakah kegunaan tuas (pengungkit)?', 'Memudahkan kerja mengangkat atau mencungkil', ['Menyimpan tenaga', 'Mengalirkan air', 'Mengukur suhu']],
    ['Apakah bahan yang sesuai untuk penebat bunyi?', 'Kain tebal', ['Logam', 'Kaca', 'Batu']],
  ];
  return fill(count, (i) => {
    const q = rng.pick(i % 2 === 0 ? items : tech);
    return mcq(rng, {
      prefix: 'sn5-bumi',
      prompt: q[0],
      answer: q[1],
      distractors: q[2],
      explanation: `Jawapannya: ${q[1]}.`,
      emoji: '🌍',
      cols: 1,
      speak: q[0],
    });
  });
}

function sn6SistemBadan(_y: number, rng: Rng, count: number): Question[] {
  const systems: { t: string; f: string; o: string }[] = [
    { t: 'Sistem pencernaan', f: 'Memecahkan makanan dan menyerap nutrien', o: 'Mulut, esofagus, perut, usus kecil, usus besar' },
    { t: 'Sistem pernafasan', f: 'Menukar gas dan membekalkan oksigen', o: 'Hidung, trakea, peparu, diafragma' },
    { t: 'Sistem peredaran darah', f: 'Mengangkut darah, oksigen dan nutrien', o: 'Jantung, arteri, vena, kapilari' },
    { t: 'Sistem rangka', f: 'Menyokong badan dan melindungi organ', o: 'Tulang, sendi, rawan' },
    { t: 'Sistem saraf', f: 'Mengawal dan menyelaras badan', o: 'Otak, saraf tunjang, neuron' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    const s = rng.pick(systems);
    if (mode === 0) {
      return mcq(rng, {
        prefix: 'sn6-badan',
        prompt: `Apakah fungsi utama ${s.t.toLowerCase()}?`,
        answer: s.f,
        distractors: systems.filter((x) => x.t !== s.t).map((x) => x.f),
        explanation: `${s.t} berfungsi untuk ${s.f.toLowerCase()}.`,
        emoji: '🫀',
        cols: 1,
        speak: `Apakah fungsi ${s.t}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(systems, 3);
      return match({
        prefix: 'sn6-badan',
        prompt: 'Padankan sistem badan dengan fungsi utamanya.',
        pairs: picked.map((x) => ({ left: x.t, right: x.f })),
        explanation: 'Setiap sistem badan mempunyai fungsi khusus.',
        emoji: '🧬',
      });
    }
    return mcq(rng, {
      prefix: 'sn6-badan',
      prompt: `Organ manakah tergolong dalam ${s.t.toLowerCase()}?`,
      answer: s.o.split(',')[0],
      distractors: systems.filter((x) => x.t !== s.t)[0].o.split(', ').slice(0, 3),
      explanation: `${s.t} merangkumi: ${s.o}.`,
      emoji: '🔎',
      cols: 2,
    });
  });
}

function sn6InteraksiHidupan(_y: number, rng: Rng, count: number): Question[] {
  const relations: { t: string; d: string; ex: string }[] = [
    { t: 'Simbiosis mutualisme', d: 'Kedua-dua organisma mendapat manfaat', ex: 'Kerbau dan burung kerbau' },
    { t: 'Komensalisme', d: 'Satu organisma mendapat manfaat, satu lagi tidak terjejas', ex: 'Ikan remora dan jerung' },
    { t: 'Parasitisme', d: 'Satu organisma mendapat manfaat, satu lagi dirugikan', ex: 'Cacing pita dan manusia' },
    { t: 'Persaingan', d: 'Organisma bersaing untuk sumber yang sama', ex: 'Dua pokok bersaing untuk cahaya' },
    { t: 'Pemangsa dan mangsa', d: 'Satu organisma membunuh dan memakan yang lain', ex: 'Helang dan tikus' },
  ];
  return fill(count, (i) => {
    const mode = i % 2;
    const r = rng.pick(relations);
    if (mode === 0) {
      return mcq(rng, {
        prefix: 'sn6-interaksi',
        prompt: `Apakah maksud "${r.t}"?`,
        answer: r.d,
        distractors: relations.filter((x) => x.t !== r.t).map((x) => x.d),
        explanation: `${r.t}: ${r.d.toLowerCase()}. Contoh: ${r.ex}.`,
        emoji: '🤝',
        cols: 1,
        speak: `Apakah maksud ${r.t}?`,
      });
    }
    return mcq(rng, {
      prefix: 'sn6-interaksi',
      prompt: `Hubungan antara ${r.ex.toLowerCase()} ialah jenis interaksi apa?`,
      answer: r.t,
      distractors: relations.filter((x) => x.t !== r.t).map((x) => x.t),
      explanation: `${r.ex} menunjukkan ${r.t.toLowerCase()}: ${r.d.toLowerCase()}.`,
      emoji: '🔗',
      cols: 2,
    });
  });
}

function sn6TenagaKonservasi(_y: number, rng: Rng, count: number): Question[] {
  const qs: [string, string, string[]][] = [
    ['Apakah sumber tenaga boleh diperbaharui?', 'Cahaya matahari', ['Arang batu', 'Petroleum', 'Gas asli']],
    ['Mengapakah kita perlu berjimat cermat menggunakan tenaga elektrik?', 'Untuk memelihara sumber dan mengurangkan kos', ['Untuk menambah pencemaran', 'Untuk membazir tenaga', 'Kerana elektrik tidak berguna']],
    ['Apakah kesan penggunaan bahan api fosil yang berlebihan?', 'Pencemaran dan pemanasan global', ['Udara lebih bersih', 'Suhu menurun', 'Lebih banyak hutan']],
    ['Apakah sumber tenaga yang digunakan oleh panel solar?', 'Cahaya matahari', ['Angin', 'Air', 'Arang batu']],
    ['Tenaga manakah yang boleh diperbaharui?', 'Tenaga angin', ['Diesel', 'Arang batu', 'Petroleum']],
  ];
  return fill(count, (i) => {
    const q = rng.pick(qs);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'sn6-tenaga',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🔋',
        cols: 1,
        speak: q[0],
      });
    }
    return trueFalse({
      prefix: 'sn6-tenaga',
      prompt: 'Tenaga tidak boleh dicipta atau dimusnahkan, hanya boleh berubah bentuk.',
      isTrue: true,
      explanation: 'Betul! Ini ialah Hukum Keabadian Tenaga.',
      emoji: '⚡',
    });
  });
}

function sn6BumiUntukKehidupan(_y: number, rng: Rng, count: number): Question[] {
  const qs: [string, string, string[]][] = [
    ['Apakah lapisan gas yang melindungi Bumi daripada sinaran ultraviolet?', 'Lapisan ozon', ['Lapisan atmosfera bawah', 'Lapisan tanah', 'Lapisan air']],
    ['Apakah proses yang menapis air kotor menjadi bersih secara semula jadi?', 'Kitaran air', ['Pembakaran', 'Penyejatan asid', 'Penapisan kimia']],
    ['Mengapakah air penting untuk kehidupan?', 'Untuk menjalankan proses badan dan mengekalkan kesihatan', ['Untuk menambahkan pencemaran', 'Untuk mengurangkan oksigen', 'Untuk membahayakan hidupan']],
    ['Apakah sumber utama pencemaran udara?', 'Asap kenderaan dan kilang', ['Pokok dan tumbuhan', 'Air hujan', 'Angin laut']],
  ];
  return fill(count, (i) => {
    const q = rng.pick(qs);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'sn6-bumi',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🌎',
        cols: 1,
        speak: q[0],
      });
    }
    return order({
      prefix: 'sn6-bumi',
      prompt: 'Susun peringkat kitaran air mengikut urutan yang betul.',
      items: rng.shuffle(['Penyejatan', 'Kondensasi', 'Kerpasan (hujan)', 'Pengaliran ke sungai dan laut']),
      correctOrder: ['Penyejatan', 'Kondensasi', 'Kerpasan (hujan)', 'Pengaliran ke sungai dan laut'],
      explanation: 'Air menyejat, memeluwap, turun sebagai hujan dan mengalir kembali ke laut.',
      emoji: '💧',
    });
  });
}

/**
 * Kemahiran saintifik Tahap 2 (Tahun 4-6). DSKP menambah kemahiran mengawal
 * pemboleh ubah dan membuat hipotesis berbanding senarai Tahap 1.
 */
function snTahap2KemahiranSaintifik(_y: number, rng: Rng, count: number): Question[] {
  const skills = [
    { t: 'Memerhati', d: 'Menggunakan deria dan alat untuk mengkaji objek', e: '👁️' },
    { t: 'Mengelas', d: 'Mengumpulkan objek mengikut ciri yang sama', e: '🗂️' },
    { t: 'Mengukur dan menggunakan nombor', d: 'Mengukur dengan alat dan unit yang betul', e: '📏' },
    { t: 'Membuat inferens', d: 'Membuat andaian berdasarkan pemerhatian', e: '🧠' },
    { t: 'Meramal', d: 'Membuat jangkaan tentang apa yang akan berlaku', e: '🔮' },
    { t: 'Berkomunikasi', d: 'Menyampaikan maklumat dalam pelbagai bentuk', e: '🗣️' },
    { t: 'Mengawal pemboleh ubah', d: 'Menetapkan perkara yang diubah dan dimalarkan', e: '🎛️' },
    { t: 'Membuat hipotesis', d: 'Menyatakan jawapan awal yang boleh diuji', e: '💡' },
    { t: 'Menginterpretasi data', d: 'Menjelaskan maksud data yang dikumpul', e: '📊' },
    { t: 'Mendefinisi secara operasi', d: 'Menerangkan sesuatu berdasarkan cara ia diukur', e: '📝' },
    { t: 'Menggunakan hubungan masa dan ruang', d: 'Menghubungkan peristiwa mengikut masa dan tempat', e: '⏳' },
    { t: 'Mengelaskan', d: 'Menyusun objek mengikut urutan tertentu', e: '🔢' },
    { t: 'Menganalisis', d: 'Memecahkan maklumat kepada bahagian kecil', e: '🔍' },
    { t: 'Membuat kesimpulan', d: 'Menyatakan hasil akhir berdasarkan bukti', e: '🏁' },
    { t: 'Mengawal pemboleh ubah dimanipulasi', d: 'Perkara yang sengaja diubah dalam penyiasatan', e: '🎚️' },
    { t: 'Mengawal pemboleh ubah bergerak balas', d: 'Perkara yang berubah akibat perubahan yang dibuat', e: '📈' },
    { t: 'Mengawal pemboleh ubah dimalarkan', d: 'Perkara yang dikekalkan sama sepanjang penyiasatan', e: '🔒' },
    { t: 'Mengukur dengan unit piawai', d: 'Menggunakan unit seperti cm, g dan ml', e: '📐' },
    { t: 'Merekod data', d: 'Mencatat pemerhatian dalam jadual atau rajah', e: '🗒️' },
    { t: 'Membina graf', d: 'Melukis graf untuk menunjukkan data dengan jelas', e: '📉' },
    { t: 'Mengenal pasti masalah', d: 'Menentukan persoalan yang hendak dikaji', e: '❓' },
    { t: 'Menjalankan eksperimen', d: 'Melakukan ujian mengikut langkah yang betul', e: '🧪' },
    { t: 'Menghubung kait', d: 'Mengaitkan konsep baharu dengan yang lama', e: '🔗' },
  ];
  const rules = [
    'Tidak makan atau minum di dalam bilik sains',
    'Mendengar arahan guru dengan teliti',
    'Tidak berlari di dalam bilik sains',
    'Mencuci tangan selepas menjalankan eksperimen',
    'Berhati-hati dengan bahan kimia dan api',
  ];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const s = rng.pick(skills);
      return mcq(rng, {
        prefix: 'sn-skill2',
        prompt: `${s.e} Apakah maksud kemahiran "${s.t}"?`,
        answer: s.d,
        distractors: skills.filter((x) => x.t !== s.t).map((x) => x.d),
        explanation: `"${s.t}": ${s.d.toLowerCase()}.`,
        emoji: '🔬',
        cols: 1,
        speak: `Apakah maksud ${s.t}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(skills, 3);
      return match({
        prefix: 'sn-skill2',
        prompt: 'Padankan kemahiran proses sains dengan maksudnya.',
        pairs: picked.map((s) => ({ left: s.t, right: s.d })),
        explanation: 'Kemahiran proses sains digunakan sepanjang penyiasatan.',
        emoji: '🧭',
      });
    }
    if (mode === 2) {
      const s = rng.pick(skills);
      return trueFalse({
        prefix: 'sn-skill2',
        prompt: `Kemahiran "${s.t}" bermaksud ${s.d.toLowerCase()}.`,
        isTrue: true,
        explanation: `Betul! "${s.t}" ialah ${s.d.toLowerCase()}.`,
        emoji: s.e,
      });
    }
    const good = rng.chance(0.5);
    const r = rng.pick(rules);
    return trueFalse({
      prefix: 'sn-skill2',
      prompt: good
        ? `Peraturan bilik sains: "${r}."`
        : 'Kita boleh merasa semua bahan kimia untuk mengenal pastinya.',
      isTrue: good,
      explanation: good
        ? 'Betul! Peraturan ini menjaga keselamatan kita di bilik sains.'
        : 'Salah. Bahan kimia tidak boleh dirasa — ia mungkin berbahaya.',
      emoji: good ? '🦺' : '⚠️',
    });
  });
}

/** Peraturan bilik sains — standard kandungan 2.0 dalam setiap tahun Sains. */
function snPeraturanBilikSains(_y: number, rng: Rng, count: number): Question[] {
  const patuh = [
    'Mendengar arahan guru sebelum memulakan aktiviti',
    'Mencuci tangan selepas menjalankan eksperimen',
    'Menggunakan gogal dan sarung tangan apabila perlu',
    'Memberitahu guru dengan segera jika ada kemalangan',
    'Menyimpan alat sains di tempatnya selepas digunakan',
    'Memakai apron semasa menjalankan eksperimen',
    'Membaca arahan dengan teliti sebelum memulakan aktiviti',
    'Melaporkan alat yang rosak kepada guru',
    'Menjaga meja eksperimen supaya sentiasa bersih',
  ];
  const langgar = [
    'Makan dan minum di dalam bilik sains',
    'Berlari dan bergurau di dalam bilik sains',
    'Merasa bahan kimia untuk mengenal pastinya',
    'Membawa keluar alat sains tanpa kebenaran guru',
    'Membiarkan bahan mudah terbakar berhampiran api',
    'Menggunakan alat kaca yang retak',
    'Menyentuh alat elektrik dengan tangan basah',
    'Membuang bahan kimia ke dalam sinki tanpa arahan',
    'Mengabaikan arahan guru semasa eksperimen',
  ];
  const sebab = [
    { t: 'Tidak makan atau minum', d: 'Supaya kita tidak termakan bahan kimia berbahaya', e: '🚫🍽️' },
    { t: 'Tidak berlari', d: 'Supaya kita tidak tersandung atau memecahkan alat', e: '🏃🚫' },
    { t: 'Mencuci tangan', d: 'Supaya bahan kimia tidak masuk ke dalam badan', e: '🧼' },
    { t: 'Memakai gogal', d: 'Supaya mata kita dilindungi daripada percikan', e: '🥽' },
    { t: 'Tidak menggunakan alat kaca retak', d: 'Supaya kita tidak terluka', e: '🔪' },
    { t: 'Tidak menyentuh alat elektrik dengan tangan basah', d: 'Supaya kita tidak terkena renjatan elektrik', e: '⚡' },
    { t: 'Membaca arahan sebelum mula', d: 'Supaya eksperimen dijalankan dengan betul dan selamat', e: '📖' },
    { t: 'Memakai apron', d: 'Supaya pakaian kita tidak terkena bahan kimia', e: '🧥' },
    { t: 'Melaporkan alat yang rosak', d: 'Supaya alat rosak diganti dan tidak mendatangkan bahaya', e: '🔧' },
  ];
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const baik = rng.chance(0.5);
      const r = baik ? rng.pick(patuh) : rng.pick(langgar);
      return trueFalse({
        prefix: 'sn-rules',
        prompt: `Peraturan bilik sains: "${r}."`,
        isTrue: baik,
        explanation: baik
          ? 'Betul! Ini peraturan bilik sains yang mesti dipatuhi.'
          : 'Salah. Perbuatan ini melanggar peraturan dan boleh mendatangkan bahaya.',
        emoji: baik ? '🦺' : '⚠️',
      });
    }
    if (mode === 1) {
      const s = rng.pick(sebab);
      return mcq(rng, {
        prefix: 'sn-rules',
        prompt: `${s.e} Mengapa kita perlu mematuhi peraturan "${s.t}" di bilik sains?`,
        answer: s.d,
        distractors: sebab.filter((x) => x.t !== s.t).map((x) => x.d),
        explanation: `${s.t}: ${s.d.toLowerCase()}.`,
        emoji: '🧪',
        cols: 1,
      });
    }
    if (mode === 2) {
      const picked = rng.sample(sebab, 3);
      return match({
        prefix: 'sn-rules',
        prompt: 'Padankan peraturan bilik sains dengan sebabnya.',
        pairs: picked.map((s) => ({ left: s.t, right: s.d })),
        explanation: 'Setiap peraturan bilik sains ada sebab demi keselamatan kita.',
        emoji: '🔗',
      });
    }
    return mcq(rng, {
      prefix: 'sn-rules',
      prompt: 'Kamu tertumpah air di lantai bilik sains. Apakah yang patut kamu lakukan?',
      answer: 'Beritahu guru dengan segera',
      distractors: ['Biarkan sahaja', 'Lap dengan tangan kosong', 'Terus berlari keluar'],
      explanation: 'Lantai basah boleh menyebabkan tergelincir. Beritahu guru dengan segera.',
      emoji: '🆘',
      cols: 1,
    });
  });
}

export const SAINS_GENERATORS: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'sn1-kemahiran-saintifik': sn1KemahiranSaintifik,
  'sn2-kemahiran-saintifik': sn3KemahiranSaintifik,
  'sn4-kemahiran-saintifik': snTahap2KemahiranSaintifik,
  'sn5-kemahiran-saintifik': snTahap2KemahiranSaintifik,
  'sn6-kemahiran-saintifik': snTahap2KemahiranSaintifik,
  'sn-peraturan-bilik-sains': snPeraturanBilikSains,
  'sn1-deria-benda-hidup': sn1DeriaBendaHidup,
  'sn1-benda-hidup-bukan-hidup': sn1BendaHidupBukanHidup,
  'sn1-magnet-penyerapan': sn1MagnetPenyerapan,
  'sn1-bumi-asas-binaan': sn1BumiAsasBinaan,
  'sn2-elektrik': sn2Elektrik,
  'sn2-campuran': sn2Campuran,
  'sn2-pembiakan-tumbesaran': sn2PembiakanTumbesaran,
  'sn2-keperluan-manusia': sn2KeperluanManusia,
  'sn2-terang-gelap': sn2TerangGelap,
  'sn2-asid-alkali': sn2AsidAlkali,
  'sn3-kemahiran-saintifik': sn3KemahiranSaintifik,
  'sn3-pengukuran': sn3Pengukuran,
  'sn3-ketumpatan': sn3Ketumpatan,
  'sn3-sistem-suria': sn3SistemSuria,
  'sn4-proses-hidup': sn4ProsesHidup,
  'sn4-pengelasan-haiwan': sn4PengelasanHaiwan,
  'sn4-tenaga': sn4Tenaga,
  'sn4-bahan-jirim': sn4BahanJirim,
  'sn5-kitaran-hidup': sn5KitaranHidup,
  'sn5-fotosintesis': sn5Fotosintesis,
  'sn5-jirim-bahan': sn5JirimDanBahan,
  'sn5-bumi-angkasa-teknologi': sn5BumiAngkasaDanTeknologi,
  'sn6-sistem-badan': sn6SistemBadan,
  'sn6-interaksi-hidupan': sn6InteraksiHidupan,
  'sn6-tenaga-konservasi': sn6TenagaKonservasi,
  'sn6-bumi-kehidupan': sn6BumiUntukKehidupan,
};
