/**
 * Penjana latihan Pendidikan Islam (KSSR Semakan 2017).
 *
 * Kandungan disimpan sebagai bank fakta bagi setiap topik, kemudian satu
 * kilang menukarnya kepada lima jenis soalan yang berbeza:
 *   pilihan jawapan, betul/salah, padan pasangan, isi tempat kosong dan
 *   susun urutan.
 *
 * Pendekatan ini dipilih kerana bidang Pendidikan Islam banyak bergantung
 * pada istilah dan urutan (rukun, hukum tajwid, nama khalifah). Menulis satu
 * penjana bagi setiap topik akan mengulang corak yang sama 41 kali, sedangkan
 * bank fakta membolehkan kandungan dikemas kini tanpa menyentuh logik soalan.
 */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { surahById, type Surah } from '../../data/surah';
import { fill, fillBlank, match, mcq, order, trueFalse } from './shared';

/** Satu fakta: soalan, jawapan betul, dan pilihan yang salah. */
type Fact = [prompt: string, answer: string, distractors: string[]];

interface Bank {
  emoji: string;
  facts: Fact[];
  /** Pasangan pendek untuk soalan padan. */
  pairs?: [string, string][];
  /** Item untuk soalan susun urutan. */
  order?: { prompt: string; items: string[] };
  /** Pernyataan betul/salah. */
  tf?: [statement: string, isTrue: boolean][];
  /** Id surah hafazan untuk soalan berasaskan ayat (lihat `data/surah.ts`). */
  surahs?: string[];
}

const BANKS: Record<string, Bank> = {};

/**
 * Buang pasangan yang berkongsi label kiri atau kanan.
 *
 * Dua pasangan dengan label kiri sama ("Al-Falaq -> 5 ayat" dan
 * "Al-Falaq -> Waktu subuh") menghasilkan soalan padan yang kabur kerana
 * label itu boleh dipadankan dengan lebih daripada satu jawapan. Begitu juga
 * apabila dua pasangan berkongsi jawapan yang sama.
 */
function dedupeLeft(pairs: [string, string][]): [string, string][] {
  const seenL = new Set<string>();
  const seenR = new Set<string>();
  const out: [string, string][] = [];
  for (const p of pairs) {
    if (seenL.has(p[0]) || seenR.has(p[1])) continue;
    seenL.add(p[0]);
    seenR.add(p[1]);
    out.push(p);
  }
  return out;
}

/** Daftar bank fakta bagi satu topik. */
function bank(topicId: string, b: Bank): void {
  BANKS[topicId] = b;
}

/**
 * Bina soalan hafazan daripada teks surah sebenar.
 *
 * Soalan jenis ini menguji ayat, bukan fakta umum, jadi ia dijana daripada
 * `data/surah.ts` dan bukan disimpan dalam bank. Ini memastikan teks Arab
 * dan Rumi sentiasa sepadan dengan rujukan al-Quran, dan tiada ayat ditaip
 * dua kali (sekali dalam data, sekali dalam bank).
 */
function surahQuestions(ids: string[], rng: Rng, emoji: string): Question[] {
  const surahs = ids.map((id) => surahById(id)).filter((s): s is Surah => s !== undefined);
  if (surahs.length === 0) return [];

  // Kolam makna dan Rumi daripada semua surah terlibat, untuk pengganggu.
  const allAyahs = surahs.flatMap((s) => s.ayahs.map((a) => ({ surah: s, ayah: a })));
  const out: Question[] = [];

  // 1. Bilangan ayat setiap surah.
  for (const s of surahs) {
    const wrongs = [s.count - 1, s.count + 1, s.count + 2]
      .filter((n) => n > 0 && n !== s.count)
      .map((n) => `${n} ayat`);
    out.push(
      mcq(rng, {
        prefix: '',
        prompt: `Berapakah bilangan ayat surah ${s.name}?`,
        answer: `${s.count} ayat`,
        distractors: wrongs.slice(0, 3),
        explanation: `Surah ${s.name} mempunyai ${s.count} ayat.`,
        emoji,
        cols: 2,
      }),
    );
  }

  // 2. Maksud ayat: paparkan teks Arab, pilih terjemahan Melayu yang betul.
  for (const { ayah } of allAyahs) {
    const wrongs = allAyahs
      .filter((x) => x.ayah.ms !== ayah.ms)
      .map((x) => x.ayah.ms);
    const uniq = [...new Set(wrongs)].slice(0, 3);
    if (uniq.length < 3) continue;
    out.push(
      mcq(rng, {
        prefix: '',
        prompt: `Apakah maksud ayat ini?\n${ayah.ar}`,
        answer: ayah.ms,
        distractors: uniq,
        explanation: `Maksud ayat ${ayah.n}: ${ayah.ms}`,
        emoji,
        cols: 1,
      }),
    );
  }

  // 3. Susun ayat mengikut urutan. Teks Rumi sahaja (tanpa nombor ayat)
  //    supaya jawapan tidak bocor melalui label "1.", "2.".
  for (const s of surahs) {
    if (s.ayahs.length < 3) continue;
    const take = Math.min(3, s.ayahs.length);
    const items = s.ayahs.slice(0, take).map((a) => a.rumi);
    out.push(
      order({
        prefix: '',
        prompt: `Susun ${take} ayat pertama surah ${s.name} mengikut urutan yang betul.`,
        items: rng.shuffle(items),
        correctOrder: items,
        explanation: `Ayat 1 surah ${s.name}: ${s.ayahs[0].rumi}`,
        emoji,
      }),
    );
  }

  // 4. Betul/salah: uji sama ada Rumi sepadan dengan ayat yang ditunjukkan.
  //    Untuk pernyataan palsu, gantikan dengan Rumi ayat lain dalam surah yang
  //    sama supaya soalan itu benar-benar salah.
  for (const { surah, ayah } of allAyahs) {
    const other = surah.ayahs.find((a) => a.n !== ayah.n);
    const isTrue = !other || rng.chance(0.5);
    const shown = isTrue ? ayah : other;
    out.push(
      trueFalse({
        prefix: '',
        prompt: `Ayat ${ayah.n} surah ${surah.name} berbunyi: ${shown.rumi}`,
        isTrue,
        explanation: `Ayat ${ayah.n} surah ${surah.name} berbunyi: ${ayah.rumi}`,
        emoji,
      }),
    );
  }

  // 5. Padankan Rumi dengan maksudnya. Teks Arab tidak digunakan di sini
  //    kerana sel padan dipaparkan kiri-ke-kanan; ayat panjang juga menyukarkan
  //    padanan pada skrin kecil.
  for (const s of surahs) {
    const short = s.ayahs.filter((a) => a.rumi.length <= 40 && a.ms.length <= 60);
    if (short.length < 3) continue;
    const picked = rng.sample(short, 3);
    out.push(
      match({
        prefix: '',
        prompt: `Padankan bacaan Rumi surah ${s.name} dengan maksudnya.`,
        pairs: picked.map((a) => ({ left: a.rumi, right: a.ms })),
        explanation: `Setiap bacaan ada maksudnya. Cuba baca bersama maksud.`,
        emoji,
      }),
    );
  }

  // 6. Isi tempat kosong: ayat ke berapa dalam surah.
  for (const { surah, ayah } of allAyahs) {
    const others = surah.ayahs.filter((a) => a.n !== ayah.n);
    if (others.length < 3) continue;
    out.push(
      fillBlank(rng, {
        prefix: '',
        prompt: `Ayat ini ialah ayat ke berapa dalam surah ${surah.name}? ${ayah.ar}`,
        answer: `Ayat ${ayah.n}`,
        options: rng.sample(others, 3).map((a) => `Ayat ${a.n}`),
        explanation: `Ayat ini ialah ayat ${ayah.n} surah ${surah.name}.`,
        emoji,
      }),
    );
  }

  // Selang-seli mengikut jenis. Tanpa langkah ini, jenis yang jarang dijana
  // (susun urutan, padan) hampir tidak pernah terpilih kerana kalah bilangan
  // dengan jenis yang banyak (pilihan jawapan, isi tempat kosong).
  const buckets = new Map<string, Question[]>();
  for (const q of out) {
    const list = buckets.get(q.kind) ?? [];
    list.push(q);
    buckets.set(q.kind, list);
  }
  const lists = [...buckets.values()];
  const mixed: Question[] = [];
  for (let round = 0; mixed.length < out.length; round += 1) {
    for (const list of lists) {
      if (round < list.length) mixed.push(list[round]);
    }
  }
  return mixed;
}

/* ==================================================================== */
/* TAHUN 1                                                              */
/* ==================================================================== */

bank('pi1-quran-tilawah', {
  emoji: '📖',
  facts: [
    ['Berapakah bilangan huruf hijaiyah?', '28 huruf', ['26 huruf', '30 huruf', '20 huruf']],
    ['Huruf hijaiyah yang pertama ialah apa?', 'Alif', ['Ba', 'Ya', 'Mim']],
    ['Huruf hijaiyah yang terakhir ialah apa?', 'Ya', ['Alif', 'Nun', 'Wau']],
    ['Baris yang berbunyi "a" dipanggil apa?', 'Fathah', ['Kasrah', 'Dhammah', 'Sukun']],
    ['Baris yang berbunyi "i" dipanggil apa?', 'Kasrah', ['Fathah', 'Dhammah', 'Tanwin']],
    ['Baris yang berbunyi "u" dipanggil apa?', 'Dhammah', ['Fathah', 'Kasrah', 'Sukun']],
    ['Baris yang berbunyi "an" dipanggil apa?', 'Fathatain', ['Kasratain', 'Dhammatain', 'Sukun']],
    ['Baris yang berbunyi "in" dipanggil apa?', 'Kasratain', ['Fathatain', 'Dhammatain', 'Tanwin']],
    ['Baris yang berbunyi "un" dipanggil apa?', 'Dhammatain', ['Fathatain', 'Kasratain', 'Sukun']],
    ['Apakah tanda mati pada sesuatu huruf?', 'Sukun', ['Fathah', 'Kasrah', 'Dhammah']],
  ],
  pairs: [
    ['Fathah', 'Bunyi "a"'],
    ['Kasrah', 'Bunyi "i"'],
    ['Dhammah', 'Bunyi "u"'],
    ['Sukun', 'Tiada bunyi vokal'],
    ['Tanwin', 'Baris berganda'],
  ],
  order: {
    prompt: 'Susun tiga huruf hijaiyah pertama mengikut urutan.',
    items: ['Alif', 'Ba', 'Ta'],
  },
  tf: [
    ['Kita membaca al-Quran dari kanan ke kiri.', true],
    ['Huruf hijaiyah berjumlah 30 huruf.', false],
    ['Kita membaca huruf hijaiyah dari kiri ke kanan.', false],
    ['Fathah berbunyi "a".', true],
  ],
});

bank('pi1-quran-hafazan', {
  emoji: '🕋',
  surahs: ['al-fatihah', 'al-ikhlas'],
  facts: [
    ['Apakah maksud Al-Fatihah?', 'Pembukaan', ['Penutup', 'Kemurnian', 'Perlindungan']],
    ['Berapakah bilangan ayat surah Al-Fatihah?', '7 ayat', ['5 ayat', '6 ayat', '10 ayat']],
    ['Surah apakah yang pertama dalam al-Quran?', 'Al-Fatihah', ['Al-Ikhlas', 'An-Nas', 'Al-Baqarah']],
    ['Apakah gelaran bagi surah Al-Fatihah?', 'Ummul Kitab', ['Ummul Quran', 'Surah Agung', 'Surah Pertama']],
    ['Al-Fatihah dibaca dalam setiap apa?', 'Rakaat solat', ['Wuduk', 'Azan', 'Puasa']],
    ['Apakah ayat pertama surah Al-Fatihah?', 'Bismillahirrahmanirrahim', ['Alhamdulillahi rabbil alamin', 'Iyyaka nabudu', 'Siratal lazina']],
    ['Di manakah surah Al-Fatihah diturunkan?', 'Mekah', ['Madinah', 'Taif', 'Syam']],
    ['Apakah maksud Ar-Rahman?', 'Maha Pemurah', ['Maha Penyayang', 'Maha Besar', 'Maha Adil']],
    ['Al-Fatihah dibaca pada setiap rakaat apa?', 'Rakaat solat', ['Wuduk', 'Azan', 'Puasa']],
    ['Apakah maksud Al-Ikhlas?', 'Kemurnian iman', ['Pembukaan', 'Perlindungan', 'Manusia']],
    ['Berapakah bilangan ayat surah Al-Ikhlas?', '4 ayat', ['3 ayat', '5 ayat', '6 ayat']],
    ['Surah apakah yang menyatakan Allah itu Satu?', 'Al-Ikhlas', ['Al-Falaq', 'An-Nas', 'Al-Fatihah']],
    ['Apakah ayat pertama surah Al-Ikhlas?', 'Qul huwallahu ahad', ['Qul a\'uzu birabbil falaq', 'Bismillahirrahmanirrahim', 'Qul a\'uzu birabbin nas']],
    ['Apakah pahala membaca surah Al-Ikhlas?', 'Seperti membaca satu pertiga al-Quran', ['Seperti membaca sepuluh ayat', 'Seperti bersedekah', 'Seperti berpuasa sehari']],
  ],
  pairs: [
    ['Al-Fatihah', '7 ayat'],
    ['Ummul Kitab', 'Gelaran Al-Fatihah'],
    ['Rukun solat', 'Membaca Al-Fatihah'],
    ['Bismillah', 'Dengan nama Allah'],
    ['Al-Ikhlas', '4 ayat'],
    ['Al-Ikhlas', 'Kemurnian iman'],
  ],
  tf: [
    ['Al-Fatihah mempunyai 7 ayat.', true],
    ['Al-Fatihah ialah surah yang kedua dalam al-Quran.', false],
    ['Al-Fatihah wajib dibaca dalam solat.', true],
    ['Al-Fatihah ialah surah terpendek dalam al-Quran.', false],
    ['Surah Al-Ikhlas mempunyai 4 ayat.', true],
    ['Surah Al-Ikhlas menyatakan Allah itu Satu.', true],
  ],
});

bank('pi1-akidah-rukun-iman', {
  emoji: '🤲',
  facts: [
    ['Berapakah bilangan rukun iman?', '6', ['5', '4', '7']],
    ['Rukun iman yang pertama ialah apa?', 'Percaya kepada Allah', ['Percaya kepada malaikat', 'Percaya kepada rasul', 'Percaya kepada hari kiamat']],
    ['Rukun iman yang terakhir ialah apa?', 'Percaya kepada qada dan qadar', ['Percaya kepada Allah', 'Percaya kepada malaikat', 'Percaya kepada kitab']],
    ['Percaya kepada kitab-kitab Allah ialah rukun iman yang ke berapa?', 'Ketiga', ['Pertama', 'Kedua', 'Keempat']],
    ['Percaya kepada malaikat ialah rukun iman yang ke berapa?', 'Kedua', ['Pertama', 'Ketiga', 'Keempat']],
    ['Percaya kepada rasul ialah rukun iman yang ke berapa?', 'Keempat', ['Kedua', 'Ketiga', 'Kelima']],
    ['Percaya kepada hari kiamat ialah rukun iman yang ke berapa?', 'Kelima', ['Keempat', 'Keenam', 'Ketiga']],
    ['Siapakah yang mencipta seluruh alam ini?', 'Allah', ['Malaikat', 'Nabi', 'Manusia']],
  ],
  pairs: [
    ['Rukun Iman', '6 perkara'],
    ['Rukun Islam', '5 perkara'],
    ['Percaya kepada Allah', 'Rukun iman pertama'],
    ['Percaya kepada qada dan qadar', 'Rukun iman keenam'],
    ['Percaya kepada malaikat', 'Rukun iman kedua'],
    ['Percaya kepada rasul', 'Rukun iman keempat'],
  ],
  order: {
    prompt: 'Susun rukun iman yang pertama hingga ketiga.',
    items: ['Percaya kepada Allah', 'Percaya kepada malaikat', 'Percaya kepada kitab Allah'],
  },
  tf: [
    ['Rukun Iman ada 6.', true],
    ['Rukun Iman dan Rukun Islam sama bilangannya.', false],
    ['Rukun Iman yang pertama ialah percaya kepada Allah.', true],
    ['Rukun Iman ada 5 perkara.', false],
  ],
});

bank('pi1-ibadah-bersuci', {
  emoji: '💧',
  facts: [
    ['Apakah maksud bersuci?', 'Membersihkan diri daripada najis dan hadas', ['Membasuh muka', 'Memakai pakaian baru', 'Memotong kuku']],
    ['Apakah nama cara membersihkan diri selepas buang air?', 'Istinjak', ['Wuduk', 'Tayamum', 'Mandian']],
    ['Dengan kaki manakah kita masuk ke dalam tandas?', 'Kaki kanan', ['Kaki kiri', 'Mana-mana kaki', 'Kedua-dua kaki']],
    ['Apakah yang digunakan untuk istinjak?', 'Air atau batu', ['Sabun sahaja', 'Tisu wangi', 'Daun kering']],
    ['Kebersihan ialah sebahagian daripada apa?', 'Iman', ['Adat', 'Budaya', 'Sukan']],
    ['Apakah hukum beristinjak?', 'Wajib', ['Sunat', 'Makruh', 'Harus']],
    ['Apakah nama air yang suci lagi menyucikan?', 'Air mutlak', ['Air kopi', 'Air kotor', 'Air sabun']],
    ['Mengapakah kita perlu bersuci?', 'Supaya ibadah diterima', ['Supaya kenyang', 'Supaya pandai', 'Supaya cepat']],
    ['Apakah yang perlu dibersihkan selepas buang air?', 'Anggota sulit', ['Tangan', 'Muka', 'Kaki']],
  ],
  pairs: [
    ['Istinjak', 'Bersuci selepas buang air'],
    ['Masuk tandas', 'Kaki kanan'],
    ['Keluar tandas', 'Kaki kiri'],
    ['Air mutlak', 'Air yang suci menyucikan'],
  ],
  order: {
    prompt: 'Susun adab di dalam tandas mengikut urutan yang betul.',
    items: ['Masuk dengan kaki kanan', 'Selesai beristinjak', 'Keluar dengan kaki kiri'],
  },
  tf: [
    ['Kita masuk tandas dengan kaki kanan.', true],
    ['Kita boleh membawa al-Quran ke dalam tandas.', false],
    ['Bersuci bermaksud membersihkan diri daripada najis dan hadas.', true],
    ['Kita masuk tandas dengan kaki kiri.', false],
  ],
});

bank('pi1-sirah-kelahiran-nabi', {
  emoji: '🌙',
  facts: [
    ['Di manakah Nabi Muhammad SAW dilahirkan?', 'Mekah', ['Madinah', 'Taif', 'Syam']],
    ['Siapakah nama ibu Nabi Muhammad SAW?', 'Aminah binti Wahab', ['Halimah as-Saadiah', 'Khadijah binti Khuwailid', 'Fatimah binti Muhammad']],
    ['Siapakah nama ayah Nabi Muhammad SAW?', 'Abdullah bin Abdul Muttalib', ['Abu Talib', 'Abdul Muttalib', 'Abu Bakar']],
    ['Siapakah nama ibu susuan Nabi Muhammad SAW?', 'Halimah as-Saadiah', ['Aminah', 'Khadijah', 'Fatimah']],
    ['Pada bulan apakah Nabi Muhammad SAW dilahirkan?', 'Rabiulawal', ['Ramadan', 'Rejab', 'Syawal']],
    ['Pada tahun apakah Nabi Muhammad SAW dilahirkan?', 'Tahun Gajah', ['Tahun Kambing', 'Tahun Unta', 'Tahun Hijrah']],
    ['Siapakah nama datuk Nabi Muhammad SAW?', 'Abdul Muttalib', ['Abu Talib', 'Abdullah', 'Abu Bakar']],
    ['Berapakah umur Nabi ketika ibunya meninggal dunia?', '6 tahun', ['4 tahun', '8 tahun', '10 tahun']],
    ['Siapakah yang menjaga Nabi selepas datuknya meninggal?', 'Abu Talib', ['Abdullah', 'Abu Bakar', 'Umar']],
  ],
  pairs: [
    ['Aminah binti Wahab', 'Ibu Nabi Muhammad SAW'],
    ['Abdullah', 'Ayah Nabi Muhammad SAW'],
    ['Halimah as-Saadiah', 'Ibu susuan Nabi'],
    ['Abu Talib', 'Bapa saudara Nabi'],
    ['Tahun Gajah', 'Tahun kelahiran Nabi'],
  ],
  tf: [
    ['Nabi Muhammad SAW dilahirkan di Mekah.', true],
    ['Ayah Nabi Muhammad SAW masih hidup ketika baginda lahir.', false],
    ['Nabi Muhammad SAW dilahirkan pada Tahun Gajah.', true],
    ['Ibu Nabi Muhammad SAW bernama Khadijah.', false],
  ],
});

bank('pi1-adab-ibu-bapa', {
  emoji: '💛',
  facts: [
    ['Apakah yang perlu kita lakukan apabila bertemu ibu bapa?', 'Cium tangan mereka', ['Lari dari mereka', 'Minta wang', 'Berdiam diri']],
    ['Bagaimanakah cara bercakap dengan ibu bapa?', 'Dengan suara yang lembut', ['Dengan suara kuat', 'Sambil menjerit', 'Tanpa memandang mereka']],
    ['Apakah yang perlu kita lakukan untuk ibu bapa setiap hari?', 'Doakan mereka', ['Marah mereka', 'Abaikan mereka', 'Lupakan mereka']],
    ['Keredhaan Allah terletak pada keredhaan siapa?', 'Ibu bapa', ['Rakan', 'Jiran', 'Guru']],
    ['Apakah yang perlu kita lakukan apabila ibu bapa menyuruh kebaikan?', 'Patuh', ['Menolak', 'Lari', 'Diam']],
    ['Bolehkah kita membantah ibu bapa dengan kasar?', 'Tidak boleh', ['Boleh selalu', 'Boleh bila marah', 'Boleh sesuka hati']],
    ['Apakah yang diucapkan apabila ibu bapa memberi sesuatu?', 'Terima kasih', ['Biarkan', 'Tidak mengapa', 'Nanti']],
    ['Siapakah yang perlu dimuliakan selepas Allah dan Rasul?', 'Ibu bapa', ['Kawan', 'Jiran', 'Guru']],
  ],
  pairs: [
    ['Bercakap lembut', 'Adab terhadap ibu bapa'],
    ['Cium tangan', 'Tanda hormat'],
    ['Doakan mereka', 'Amalan setiap hari'],
    ['Patuh', 'Mengikut perintah yang baik'],
  ],
  tf: [
    ['Kita perlu mendoakan ibu bapa setiap hari.', true],
    ['Kita boleh meninggikan suara kepada ibu bapa.', false],
    ['Kita perlu mematuhi ibu bapa selagi tidak bercanggah dengan syarak.', true],
    ['Kita boleh memarahi ibu bapa apabila tidak puas hati.', false],
  ],
});

bank('pi1-jawi-huruf', {
  emoji: '✍️',
  facts: [
    ['Tulisan Jawi berasal daripada tulisan apa?', 'Tulisan Arab', ['Tulisan Rumi', 'Tulisan Cina', 'Tulisan Tamil']],
    ['Huruf Jawi "چ" berbunyi apa?', 'Ca', ['Ga', 'Nga', 'Pa']],
    ['Huruf Jawi "ݢ" berbunyi apa?', 'Ga', ['Ca', 'Nga', 'Nya']],
    ['Huruf Jawi "ڠ" berbunyi apa?', 'Nga', ['Ga', 'Nya', 'Va']],
    ['Huruf Jawi "ﭪ" berbunyi apa?', 'Pa', ['Va', 'Ca', 'Ga']],
    ['Huruf Jawi "ڽ" berbunyi apa?', 'Nya', ['Nga', 'Ga', 'Pa']],
    ['Huruf Jawi "ۏ" berbunyi apa?', 'Va', ['Pa', 'Ca', 'Nga']],
    ['Berapakah huruf tambahan dalam tulisan Jawi?', '7 huruf', ['5 huruf', '6 huruf', '8 huruf']],
    ['Apakah huruf pertama dalam abjad Jawi?', 'Alif', ['Ba', 'Ta', 'Ya']],
  ],
  pairs: [
    ['چ', 'Ca'],
    ['ݢ', 'Ga'],
    ['ڠ', 'Nga'],
    ['ﭪ', 'Pa'],
    ['ڽ', 'Nya'],
    ['ۏ', 'Va'],
  ],
  tf: [
    ['Tulisan Jawi ialah warisan budaya Malaysia.', true],
    ['Tulisan Jawi berasal daripada tulisan Rumi.', false],
    ['Huruf Jawi "چ" berbunyi ca.', true],
    ['Tulisan Jawi berasal daripada tulisan Latin.', false],
  ],
});

/* ==================================================================== */
/* TAHUN 2                                                              */
/* ==================================================================== */

bank('pi2-quran-bacaan', {
  emoji: '📖',
  surahs: ['al-falaq', 'an-nas'],
  facts: [
    ['Berapakah bilangan ayat surah al-Falaq?', '5 ayat', ['4 ayat', '6 ayat', '7 ayat']],
    ['Berapakah bilangan ayat surah an-Nas?', '6 ayat', ['5 ayat', '4 ayat', '7 ayat']],
    ['Apakah maksud al-Falaq?', 'Waktu subuh', ['Perlindungan', 'Kemurnian', 'Pembukaan']],
    ['Apakah maksud an-Nas?', 'Manusia', ['Perlindungan', 'Kemurnian', 'Waktu subuh']],
    ['Surah apakah yang memohon perlindungan daripada kejahatan?', 'Al-Falaq', ['Al-Ikhlas', 'An-Nas', 'Al-Fatihah']],
    ['Surah apakah yang memohon perlindungan daripada gangguan syaitan?', 'An-Nas', ['Al-Falaq', 'Al-Ikhlas', 'Al-Asr']],
    ['Apakah gelaran bagi surah al-Falaq dan an-Nas?', 'Al-Mu\'awwizatain', ['Al-Mu\'awwizat', 'Al-Musabbihat', 'Al-Fawatih']],
    ['Bilakah Nabi Muhammad membaca surah al-Falaq dan an-Nas?', 'Sebelum tidur', ['Sebelum makan', 'Selepas solat', 'Ketika berjalan']],
    ['Apakah ayat pertama surah al-Falaq?', 'Qul a\'uzu birabbil falaq', ['Qul a\'uzu birabbin nas', 'Qul huwallahu ahad', 'Inna a\'tainakal kausar']],
  ],
  pairs: [
    ['Al-Falaq', '5 ayat'],
    ['An-Nas', '6 ayat'],
    ['Al-Falaq', 'Waktu subuh'],
    ['An-Nas', 'Manusia'],
    ['Al-Mu\'awwizatain', 'Dua surah perlindungan'],
  ],
  order: {
    prompt: 'Susun surah mengikut bilangan ayat daripada paling sedikit.',
    items: ['Al-Falaq (5 ayat)', 'An-Nas (6 ayat)', 'Al-Asr (3 ayat)'],
  },
  tf: [
    ['Surah al-Falaq mempunyai 5 ayat.', true],
    ['Surah an-Nas mempunyai 4 ayat.', false],
    ['Surah al-Falaq bermaksud waktu subuh.', true],
    ['Surah an-Nas mempunyai 6 ayat.', true],
  ],
});

bank('pi2-akidah-rukun-islam', {
  emoji: '🕋',
  facts: [
    ['Berapakah bilangan rukun Islam?', '5', ['6', '4', '7']],
    ['Apakah rukun Islam yang pertama?', 'Mengucap dua kalimah syahadah', ['Mendirikan solat', 'Berpuasa', 'Menunaikan haji']],
    ['Apakah rukun Islam yang kelima?', 'Menunaikan haji', ['Berpuasa', 'Mengeluarkan zakat', 'Mendirikan solat']],
    ['Apakah maksud syahadah?', 'Pengakuan', ['Sembahyang', 'Puasa', 'Sedekah']],
    ['Apakah langkah pertama seseorang memeluk Islam?', 'Mengucap dua kalimah syahadah', ['Mendirikan solat', 'Berpuasa sebulan', 'Menunaikan haji']],
    ['Apakah rukun Islam yang kedua?', 'Mendirikan solat', ['Berpuasa', 'Mengeluarkan zakat', 'Menunaikan haji']],
    ['Apakah rukun Islam yang ketiga?', 'Mengeluarkan zakat', ['Berpuasa', 'Mendirikan solat', 'Menunaikan haji']],
    ['Apakah rukun Islam yang keempat?', 'Berpuasa di bulan Ramadan', ['Mengeluarkan zakat', 'Menunaikan haji', 'Mendirikan solat']],
    ['Siapakah yang wajib mendirikan solat?', 'Setiap muslim', ['Orang kaya', 'Lelaki sahaja', 'Orang dewasa sahaja']],
  ],
  pairs: [
    ['Syahadah', 'Rukun Islam pertama'],
    ['Solat', 'Rukun Islam kedua'],
    ['Zakat', 'Rukun Islam ketiga'],
    ['Haji', 'Rukun Islam kelima'],
    ['Puasa', 'Rukun Islam keempat'],
  ],
  order: {
    prompt: 'Susun rukun Islam yang pertama hingga keempat.',
    items: ['Mengucap dua kalimah syahadah', 'Mendirikan solat', 'Menunaikan zakat', 'Berpuasa di bulan Ramadan'],
  },
  tf: [
    ['Rukun Islam ada 5.', true],
    ['Puasa ialah rukun Islam yang pertama.', false],
    ['Rukun Islam yang pertama ialah mengucap dua kalimah syahadah.', true],
    ['Zakat ialah rukun Islam yang kelima.', false],
  ],
});

bank('pi2-ibadah-wuduk-solat', {
  emoji: '💧',
  facts: [
    ['Berapakah rukun wuduk?', '6', ['5', '4', '7']],
    ['Apakah perkara pertama dalam rukun wuduk?', 'Niat', ['Membasuh muka', 'Menyapu kepala', 'Membasuh kaki']],
    ['Berapakah rakaat solat Subuh?', '2 rakaat', ['3 rakaat', '4 rakaat', '5 rakaat']],
    ['Berapakah rakaat solat Maghrib?', '3 rakaat', ['2 rakaat', '4 rakaat', '5 rakaat']],
    ['Berapakah rakaat solat Zohor?', '4 rakaat', ['2 rakaat', '3 rakaat', '5 rakaat']],
    ['Solat ialah tiang apa?', 'Tiang agama', ['Tiang rumah', 'Tiang negara', 'Tiang sekolah']],
    ['Apakah yang membatalkan wuduk?', 'Keluar angin', ['Membaca al-Quran', 'Menyapu kepala', 'Berdoa']],
    ['Berapakah rakaat solat Isyak?', '4 rakaat', ['2 rakaat', '3 rakaat', '5 rakaat']],
    ['Berapakah bilangan solat fardu dalam sehari?', '5 waktu', ['4 waktu', '6 waktu', '3 waktu']],
    ['Apakah yang dibaca sebelum mengambil wuduk?', 'Bismillah', ['Alhamdulillah', 'Subhanallah', 'Allahu Akbar']],
  ],
  pairs: [
    ['Subuh', 'Waktu fajar'],
    ['Zohor', 'Waktu tengah hari'],
    ['Maghrib', 'Waktu terbenam matahari'],
    ['Isyak', 'Waktu malam'],
    ['Isyak', '4 rakaat'],
  ],
  order: {
    prompt: 'Susun rukun wuduk mengikut urutan yang betul.',
    items: ['Niat', 'Membasuh muka', 'Membasuh tangan hingga siku', 'Menyapu sebahagian kepala'],
  },
  tf: [
    ['Solat Subuh ialah 2 rakaat.', true],
    ['Solat Maghrib ialah 4 rakaat.', false],
    ['Wuduk ialah syarat sah solat.', true],
    ['Solat Isyak ialah 3 rakaat.', false],
  ],
});

bank('pi2-sirah-keluarga-nabi', {
  emoji: '🌙',
  facts: [
    ['Apakah gelaran yang diberikan penduduk Mekah kepada Nabi Muhammad SAW?', 'Al-Amin', ['Al-Fatih', 'Al-Karim', 'Al-Hakim']],
    ['Apakah maksud Al-Amin?', 'Yang dipercayai', ['Yang gagah', 'Yang pemurah', 'Yang bijak']],
    ['Di manakah Nabi Muhammad SAW disusukan?', 'Perkampungan Bani Saad', ['Mekah', 'Madinah', 'Taif']],
    ['Bagaimanakah keadaan Nabi Muhammad SAW semasa kecil?', 'Anak yatim', ['Anak kaya', 'Anak raja', 'Anak tunggal']],
    ['Siapakah yang mengasuh Nabi selepas datuknya meninggal?', 'Abu Talib', ['Abdul Muttalib', 'Abdullah', 'Abu Bakar']],
    ['Apakah pekerjaan Nabi Muhammad SAW semasa muda?', 'Berdagang', ['Bertani', 'Menangkap ikan', 'Tukang kayu']],
    ['Siapakah nama isteri pertama Nabi Muhammad SAW?', 'Khadijah binti Khuwailid', ['Aminah', 'Aisyah', 'Fatimah']],
    ['Ke manakah Nabi pergi berniaga?', 'Syam', ['Mesir', 'Yaman', 'Parsi']],
  ],
  pairs: [
    ['Al-Amin', 'Yang dipercayai'],
    ['Halimah as-Saadiah', 'Ibu susuan'],
    ['Bani Saad', 'Tempat baginda disusukan'],
    ['Berdagang', 'Pekerjaan Nabi semasa muda'],
  ],
  tf: [
    ['Nabi Muhammad SAW digelar Al-Amin kerana kejujurannya.', true],
    ['Nabi Muhammad SAW membesar sebagai anak yang kaya.', false],
    ['Nabi Muhammad SAW digelar Al-Amin kerana kejujurannya.', true],
    ['Nabi Muhammad SAW membesar bersama ibu bapanya.', false],
  ],
});

bank('pi2-adab-harian', {
  emoji: '🍽️',
  facts: [
    ['Apakah yang dibaca sebelum makan?', 'Bismillah', ['Alhamdulillah', 'Astaghfirullah', 'Subhanallah']],
    ['Apakah yang dibaca selepas makan?', 'Alhamdulillah', ['Bismillah', 'Insya-Allah', 'Masya-Allah']],
    ['Dengan tangan manakah kita makan?', 'Tangan kanan', ['Tangan kiri', 'Kedua-dua tangan', 'Mana-mana tangan']],
    ['Ke arah manakah kita mengiring ketika tidur?', 'Ke kanan', ['Ke kiri', 'Menelentang', 'Meniarap']],
    ['Apakah yang perlu dilakukan sebelum makan?', 'Basuh tangan', ['Gosok gigi', 'Bersukan', 'Baca buku']],
    ['Apakah yang perlu dilakukan selepas bangun tidur?', 'Basuh muka', ['Terus bermain', 'Terus makan', 'Terus berlari']],
    ['Apakah yang diucapkan ketika bersin?', 'Alhamdulillah', ['Bismillah', 'Insya-Allah', 'Masya-Allah']],
    ['Apakah yang diucapkan kepada orang yang bersin?', 'Yarhamukallah', ['Alhamdulillah', 'Insya-Allah', 'Masya-Allah']],
    ['Ke arah manakah kita mengiring ketika tidur?', 'Ke kanan', ['Ke kiri', 'Menelentang', 'Meniarap']],
  ],
  pairs: [
    ['Sebelum makan', 'Baca Bismillah'],
    ['Selepas makan', 'Baca Alhamdulillah'],
    ['Makan', 'Guna tangan kanan'],
    ['Bersin', 'Ucap Alhamdulillah'],
  ],
  order: {
    prompt: 'Susun adab makan mengikut urutan yang betul.',
    items: ['Basuh tangan', 'Baca Bismillah', 'Makan dengan tangan kanan', 'Baca Alhamdulillah'],
  },
  tf: [
    ['Kita makan dengan tangan kanan.', true],
    ['Kita boleh membazirkan makanan.', false],
    ['Kita membaca Bismillah sebelum makan.', true],
    ['Kita makan dengan tangan kiri.', false],
  ],
});

bank('pi2-jawi-sambung', {
  emoji: '✍️',
  facts: [
    ['Ke arah manakah tulisan Jawi ditulis?', 'Dari kanan ke kiri', ['Dari kiri ke kanan', 'Dari atas ke bawah', 'Dari bawah ke atas']],
    ['Apakah bunyi bagi "با"?', 'Ba', ['Bi', 'Bu', 'Ma']],
    ['Apakah bunyi bagi "بي"?', 'Bi', ['Ba', 'Bu', 'Mi']],
    ['Apakah bunyi bagi "مو"?', 'Mu', ['Ma', 'Mi', 'Bu']],
    ['Bagaimanakah nama "Melayu" ditulis dalam Jawi?', 'ملايو', ['مليسي', 'ملايس', 'ملاو']],
    ['Apakah bunyi bagi "تا"?', 'Ta', ['Ti', 'Tu', 'Na']],
    ['Apakah bunyi bagi "ني"?', 'Ni', ['Na', 'Nu', 'Mi']],
    ['Apakah bunyi bagi "سو"?', 'Su', ['Sa', 'Si', 'Bu']],
    ['Apakah bunyi bagi "کي"?', 'Ki', ['Ka', 'Ku', 'Gi']],
  ],
  pairs: [
    ['با', 'Ba'],
    ['بي', 'Bi'],
    ['بو', 'Bu'],
    ['مو', 'Mu'],
    ['تا', 'Ta'],
    ['ني', 'Ni'],
  ],
  tf: [
    ['Tulisan Jawi ditulis dari kanan ke kiri.', true],
    ['Huruf Jawi tidak boleh bersambung antara satu sama lain.', false],
    ['Huruf Jawi boleh bersambung antara satu sama lain.', true],
    ['Tulisan Jawi ditulis dari kiri ke kanan.', false],
  ],
});

/* ==================================================================== */
/* TAHUN 3                                                              */
/* ==================================================================== */

bank('pi3-quran-tajwid', {
  emoji: '📖',
  surahs: ['al-kafirun', 'al-asr'],
  facts: [
    ['Apakah maksud tajwid?', 'Membaca al-Quran dengan betul mengikut hukumnya', ['Menghafaz al-Quran', 'Menulis al-Quran', 'Menterjemah al-Quran']],
    ['Nun sakinah bertemu huruf ba hukumnya apa?', 'Iqlab', ['Idgham', 'Ikhfa', 'Izhar']],
    ['Nun sakinah bertemu huruf ya, nun, mim dan wau hukumnya apa?', 'Idgham', ['Iqlab', 'Izhar', 'Ikhfa']],
    ['Nun sakinah bertemu huruf halqi hukumnya apa?', 'Izhar', ['Idgham', 'Iqlab', 'Ikhfa']],
    ['Apakah maksud nun sakinah?', 'Nun yang tidak berbaris', ['Nun yang berbaris', 'Nun di hujung ayat', 'Nun yang dibaca panjang']],
    ['Nun sakinah bertemu huruf mim hukumnya apa?', 'Idgham', ['Iqlab', 'Izhar', 'Ikhfa']],
    ['Apakah maksud ikhfa?', 'Menyembunyikan bunyi nun', ['Menjelaskan bunyi nun', 'Menukar bunyi nun', 'Memasukkan bunyi nun']],
    ['Berapakah bilangan huruf halqi?', '6 huruf', ['5 huruf', '4 huruf', '7 huruf']],
    ['Apakah huruf halqi yang pertama?', 'Hamzah', ['Ha', 'Ain', 'Ghain']],
  ],
  pairs: [
    ['Idgham', 'Nun bertemu ya, nun, mim, wau'],
    ['Iqlab', 'Nun bertemu ba'],
    ['Izhar', 'Nun bertemu huruf halqi'],
    ['Ikhfa', 'Nun bertemu 15 huruf'],
  ],
  tf: [
    ['Tajwid bermaksud membaca al-Quran dengan betul.', true],
    ['Nun sakinah ialah nun yang berbaris.', false],
    ['Izhar berlaku apabila nun sakinah bertemu huruf halqi.', true],
    ['Iqlab berlaku apabila nun sakinah bertemu huruf lam.', false],
  ],
});

bank('pi3-hadis-kebersihan', {
  emoji: '🗣️',
  facts: [
    ['Apakah sabda Nabi SAW tentang kebersihan?', 'Kebersihan sebahagian daripada iman', ['Kebersihan tidak penting', 'Kebersihan untuk orang kaya', 'Kebersihan pada hari Jumaat sahaja']],
    ['Berapa kalikah kita perlu mandi sekurang-kurangnya?', 'Sekali sehari', ['Sekali seminggu', 'Sekali sebulan', 'Tidak perlu mandi']],
    ['Apakah sunnah Nabi berkaitan gigi?', 'Bersiwak', ['Makan gula', 'Tidur awal', 'Minum susu']],
    ['Mengapakah kita perlu memotong kuku?', 'Supaya pendek dan bersih', ['Supaya panjang', 'Supaya cantik', 'Supaya kuat']],
    ['Apakah maksud hadis?', 'Perkataan dan perbuatan Nabi', ['Firman Allah', 'Kata ulama', 'Kata sahabat']],
    ['Apakah sabda Nabi tentang kebersihan?', 'Kebersihan sebahagian daripada iman', ['Kebersihan tanda kaya', 'Kebersihan tanda pandai', 'Kebersihan tanda rajin']],
    ['Apakah yang perlu dibersihkan sebelum solat?', 'Diri dan pakaian', ['Rumah sahaja', 'Kasut sahaja', 'Buku sahaja']],
    ['Apakah contoh menjaga kebersihan badan?', 'Mandi setiap hari', ['Main lumpur', 'Tidak sikat rambut', 'Pakai baju kotor']],
  ],
  pairs: [
    ['Bersiwak', 'Memberus gigi cara sunnah'],
    ['Potong kuku', 'Menjaga kebersihan diri'],
    ['Kebersihan', 'Sebahagian daripada iman'],
    ['Hadis', 'Perkataan dan perbuatan Nabi'],
  ],
  tf: [
    ['Kebersihan ialah sebahagian daripada iman.', true],
    ['Kita perlu mandi sekali sebulan sahaja.', false],
    ['Kebersihan ialah sebahagian daripada iman.', true],
    ['Kita boleh solat dengan pakaian yang bernajis.', false],
  ],
});

bank('pi3-akidah-asmaul-husna', {
  emoji: '🤲',
  facts: [
    ['Berapakah bilangan Asmaul Husna?', '99', ['100', '50', '33']],
    ['Apakah maksud Ar-Rahman?', 'Maha Pemurah', ['Maha Penyayang', 'Maha Raja', 'Maha Mengetahui']],
    ['Apakah maksud Ar-Rahim?', 'Maha Penyayang', ['Maha Pemurah', 'Maha Suci', 'Maha Kuat']],
    ['Apakah maksud Al-Malik?', 'Maha Raja', ['Maha Pemurah', 'Maha Mengetahui', 'Maha Sejahtera']],
    ['Apakah maksud Al-Alim?', 'Maha Mengetahui', ['Maha Melihat', 'Maha Mendengar', 'Maha Raja']],
    ['Apakah maksud Asmaul Husna?', 'Nama-nama Allah yang baik', ['Sifat Nabi', 'Nama malaikat', 'Nama kitab']],
    ['Berapakah bilangan Asmaul Husna?', '99 nama', ['100 nama', '98 nama', '90 nama']],
    ['Apakah maksud Ar-Rahim?', 'Maha Penyayang', ['Maha Pemurah', 'Maha Adil', 'Maha Melihat']],
    ['Apakah maksud Al-Malik?', 'Maha Raja', ['Maha Pemurah', 'Maha Penyayang', 'Maha Mendengar']],
  ],
  pairs: [
    ['Ar-Rahman', 'Maha Pemurah'],
    ['Ar-Rahim', 'Maha Penyayang'],
    ['Al-Malik', 'Maha Raja'],
    ['Al-Alim', 'Maha Mengetahui'],
    ['Ar-Rahim', 'Maha Penyayang'],
    ['Al-Malik', 'Maha Raja'],
  ],
  tf: [
    ['Asmaul Husna berjumlah 99 nama.', true],
    ['Al-Malik bermaksud Maha Penyayang.', false],
    ['Allah mempunyai 99 nama yang baik.', true],
    ['Asmaul Husna bermaksud nama-nama manusia.', false],
  ],
});

bank('pi3-ibadah-puasa', {
  emoji: '🌙',
  facts: [
    ['Bilakah bermulanya puasa?', 'Bermula fajar', ['Bermula tengah malam', 'Bermula selepas Zohor', 'Bermula selepas Maghrib']],
    ['Bilakah berakhirnya puasa?', 'Terbenam matahari', ['Tengah hari', 'Selepas Subuh', 'Tengah malam']],
    ['Apakah maksud puasa?', 'Menahan diri daripada makan dan minum', ['Makan banyak', 'Tidur sepanjang hari', 'Bermain sahaja']],
    ['Apakah hukum puasa Ramadan?', 'Wajib', ['Sunat', 'Harus', 'Makruh']],
    ['Apakah yang membatalkan puasa?', 'Makan dan minum dengan sengaja', ['Tidur', 'Mandi', 'Bercakap']],
    ['Apakah maksud puasa?', 'Menahan diri daripada makan dan minum', ['Makan banyak', 'Tidur sahaja', 'Bersukan sahaja']],
    ['Apakah yang membatalkan puasa?', 'Makan dan minum', ['Membaca al-Quran', 'Solat', 'Berzikir']],
    ['Apakah nama makan sebelum fajar?', 'Sahur', ['Berbuka', 'Iftar', 'Moreh']],
    ['Apakah nama makan selepas terbenam matahari?', 'Berbuka', ['Sahur', 'Moreh', 'Sarapan']],
  ],
  pairs: [
    ['Puasa bermula', 'Fajar'],
    ['Puasa berakhir', 'Terbenam matahari'],
    ['Puasa Ramadan', 'Wajib'],
    ['Sahur', 'Makan sebelum fajar'],
    ['Berbuka', 'Makan selepas terbenam matahari'],
  ],
  tf: [
    ['Puasa bermula dari fajar hingga terbenam matahari.', true],
    ['Makan dengan sengaja tidak membatalkan puasa.', false],
    ['Kita berpuasa pada bulan Ramadan.', true],
    ['Sahur ialah makan selepas berbuka puasa.', false],
  ],
});

bank('pi3-sirah-perniagaan', {
  emoji: '🌙',
  facts: [
    ['Sejak kecil, Nabi Muhammad SAW belajar berniaga daripada siapa?', 'Abu Talib', ['Abu Bakar', 'Umar', 'Halimah']],
    ['Ke manakah Nabi Muhammad SAW berniaga?', 'Syam', ['Mesir', 'Yaman', 'Parsi']],
    ['Siapakah yang melantik baginda menguruskan perniagaannya?', 'Siti Khadijah', ['Aminah', 'Halimah', 'Fatimah']],
    ['Apakah sifat penting dalam perniagaan Islam?', 'Jujur', ['Menipu', 'Menaikkan harga sesuka hati', 'Menyembunyikan kecacatan']],
    ['Apakah gelaran Nabi sebelum menjadi rasul?', 'Al-Amin', ['Al-Fatih', 'Al-Karim', 'Al-Hakim']],
    ['Dengan siapa Nabi berniaga sebelum berkahwin?', 'Khadijah binti Khuwailid', ['Abu Talib', 'Abu Bakar', 'Umar']],
    ['Apakah sifat Nabi dalam perniagaan?', 'Jujur', ['Curang', 'Malas', 'Kedekut']],
    ['Apakah maksud Al-Amin?', 'Yang dipercayai', ['Yang gagah', 'Yang pemurah', 'Yang bijak']],
  ],
  pairs: [
    ['Abu Talib', 'Bapa saudara yang mengajar berniaga'],
    ['Syam', 'Tempat baginda berniaga'],
    ['Siti Khadijah', 'Melantik baginda mengurus perniagaan'],
    ['Syam', 'Tempat Nabi berniaga'],
  ],
  tf: [
    ['Nabi Muhammad SAW seorang peniaga yang jujur.', true],
    ['Baginda menipu berat dan sukatan dalam perniagaan.', false],
    ['Nabi Muhammad SAW berniaga dengan jujur.', true],
    ['Nabi Muhammad SAW dikenali sebagai penipu.', false],
  ],
});

bank('pi3-adab-jiran', {
  emoji: '💛',
  facts: [
    ['Apakah yang perlu kita berikan apabila bertemu jiran?', 'Salam', ['Wang', 'Hadiah', 'Nasihat']],
    ['Apakah yang tidak boleh dilakukan kepada jiran?', 'Mengganggu dengan bunyi bising', ['Memberi salam', 'Membantu mereka', 'Berkongsi makanan']],
    ['Apakah yang perlu kita lakukan jika jiran dalam kesusahan?', 'Membantu mereka', ['Mengabaikan mereka', 'Ketawa pada mereka', 'Menyebarkan berita']],
    ['Apakah yang dilarang dalam pergaulan?', 'Mengumpat dan mengejek', ['Memberi salam', 'Berkongsi makanan', 'Membantu jiran']],
    ['Apakah maksud jiran?', 'Orang yang tinggal berhampiran rumah kita', ['Orang yang jauh', 'Kawan sekolah', 'Guru']],
    ['Apakah yang perlu kita lakukan kepada jiran?', 'Berbuat baik', ['Bermusuhan', 'Mengabai', 'Membuat bising']],
    ['Apakah contoh berbuat baik kepada jiran?', 'Berkongsi makanan', ['Membuat bising', 'Mengacau rumah', 'Mengabai']],
    ['Apakah yang perlu dielakkan terhadap jiran?', 'Mengganggu mereka', ['Memberi salam', 'Berkongsi makanan', 'Menolong mereka']],
  ],
  pairs: [
    ['Beri salam', 'Adab bertemu jiran'],
    ['Bantu jiran', 'Adab kejiranan'],
    ['Mengumpat', 'Perbuatan yang dilarang'],
    ['Jiran', 'Orang yang tinggal berhampiran'],
  ],
  tf: [
    ['Kita perlu menjaga hubungan baik dengan jiran.', true],
    ['Mengganggu jiran dengan bunyi bising dibenarkan dalam Islam.', false],
    ['Kita perlu berbuat baik kepada jiran.', true],
    ['Kita boleh membuat bising sehingga mengganggu jiran.', false],
  ],
});

bank('pi3-jawi-ayat', {
  emoji: '✍️',
  facts: [
    ['Apakah maksud "بوكو"?', 'Buku', ['Bola', 'Baju', 'Batu']],
    ['Apakah maksud "سكوله"?', 'Sekolah', ['Kelas', 'Guru', 'Buku']],
    ['Apakah maksud "موريد"?', 'Murid', ['Guru', 'Sekolah', 'Kelas']],
    ['Akhbar Melayu yang pernah diterbitkan dalam Jawi ialah apa?', 'Utusan Melayu', ['Berita Harian', 'The Star', 'New Straits Times']],
    ['Ke arah manakah tulisan Jawi ditulis?', 'Kanan ke kiri', ['Kiri ke kanan', 'Atas ke bawah', 'Bawah ke atas']],
    ['Berapakah huruf tambahan dalam tulisan Jawi?', '7 huruf', ['5 huruf', '6 huruf', '8 huruf']],
    ['Apakah huruf pertama dalam abjad Jawi?', 'Alif', ['Ba', 'Ta', 'Ya']],
    ['Apakah nama tanda vokal dalam tulisan Jawi?', 'Baris', ['Titik', 'Koma', 'Tanda tanya']],
  ],
  pairs: [
    ['بوكو', 'Buku'],
    ['سكوله', 'Sekolah'],
    ['موريد', 'Murid'],
    ['Baris', 'Tanda vokal'],
  ],
  tf: [
    ['Utusan Melayu pernah diterbitkan dalam tulisan Jawi.', true],
    ['Ayat Jawi ditulis dari kiri ke kanan.', false],
    ['Tulisan Jawi ditulis dari kanan ke kiri.', true],
    ['Tulisan Jawi ditulis dari atas ke bawah.', false],
  ],
});

/* ==================================================================== */
/* TAHUN 4                                                              */
/* ==================================================================== */

bank('pi4-quran-hukum', {
  emoji: '📖',
  surahs: ['al-qariah'],
  facts: [
    ['Apakah maksud tanwin?', 'Baris dua di hujung perkataan', ['Nun yang tidak berbaris', 'Mim yang berbaris', 'Huruf mad']],
    ['Mim sakinah bertemu ba hukumnya apa?', 'Ikhfa syafawi', ['Idgham mimi', 'Izhar syafawi', 'Iqlab']],
    ['Mim sakinah bertemu mim hukumnya apa?', 'Idgham mimi', ['Ikhfa syafawi', 'Izhar syafawi', 'Iqlab']],
    ['Mim sakinah bertemu huruf lain hukumnya apa?', 'Izhar syafawi', ['Idgham mimi', 'Ikhfa syafawi', 'Iqlab']],
    ['Apakah maksud mad?', 'Memanjangkan bacaan', ['Memendekkan bacaan', 'Menghentikan bacaan', 'Memulakan bacaan']],
    ['Berapakah harakat mad asli?', '2 harakat', ['4 harakat', '6 harakat', '1 harakat']],
    ['Apakah huruf mad?', 'Alif, wau dan ya', ['Ba, ta dan tha', 'Mim, nun dan wau', 'Ha, ain dan ghain']],
    ['Apakah maksud waqaf?', 'Berhenti', ['Meneruskan', 'Memulakan', 'Mempercepat']],
  ],
  pairs: [
    ['Ikhfa syafawi', 'Mim sakinah bertemu ba'],
    ['Idgham mimi', 'Mim sakinah bertemu mim'],
    ['Izhar syafawi', 'Mim sakinah bertemu huruf lain'],
    ['Mad', 'Memanjangkan bacaan'],
    ['Waqaf', 'Berhenti'],
  ],
  tf: [
    ['Nun sakinah dan tanwin mempunyai hukum bacaan yang sama.', true],
    ['Mim sakinah bertemu ba hukumnya izhar syafawi.', false],
    ['Mad asli dibaca 2 harakat.', true],
    ['Waqaf bermaksud meneruskan bacaan tanpa henti.', false],
  ],
});

bank('pi4-hadis-niat', {
  emoji: '🗣️',
  facts: [
    ['Apakah yang menentukan penerimaan sesuatu amalan?', 'Niat', ['Masa', 'Tempat', 'Pakaian']],
    ['Apakah maksud hadis tentang niat?', 'Setiap amalan bergantung kepada niat', ['Setiap amalan bergantung kepada masa', 'Amalan tidak perlu niat', 'Niat hanya untuk solat']],
    ['Apakah niat yang betul untuk belajar?', 'Kerana menuntut ilmu Allah', ['Kerana dipaksa', 'Kerana mahu dipuji', 'Kerana bosan']],
    ['Apakah maksud niat?', 'Keinginan dalam hati', ['Perkataan di lidah', 'Perbuatan anggota', 'Tulisan di kertas']],
    ['Di manakah tempat niat?', 'Dalam hati', ['Di lidah', 'Di tangan', 'Di kertas']],
    ['Apakah sabda Nabi tentang niat?', 'Setiap amalan bergantung pada niat', ['Setiap amalan bergantung pada wang', 'Setiap amalan bergantung pada masa', 'Setiap amalan bergantung pada orang']],
    ['Apakah yang berlaku jika niat tidak betul?', 'Amalan tidak diterima', ['Amalan tetap diterima', 'Amalan bertambah', 'Amalan jadi sunat']],
  ],
  pairs: [
    ['Niat', 'Menentukan penerimaan amalan'],
    ['Belajar', 'Niat kerana menuntut ilmu'],
    ['Sedekah', 'Niat menolong orang susah'],
    ['Niat', 'Keinginan dalam hati'],
  ],
  tf: [
    ['Setiap amalan bergantung kepada niat.', true],
    ['Niat tidak penting dalam sesuatu amalan.', false],
    ['Niat tempatnya di dalam hati.', true],
    ['Niat mesti diucapkan dengan kuat.', false],
  ],
});

bank('pi4-akidah-sifat-20', {
  emoji: '🤲',
  facts: [
    ['Berapakah bilangan sifat yang wajib bagi Allah?', '20', ['99', '6', '5']],
    ['Apakah maksud sifat Wujud?', 'Allah itu ada', ['Allah itu kekal', 'Allah itu melihat', 'Allah itu mendengar']],
    ['Apakah maksud sifat Qidam?', 'Allah sedia ada, tiada permulaan', ['Allah kekal selamanya', 'Allah itu ada', 'Allah berkuasa']],
    ['Apakah maksud sifat Baqa?', 'Allah kekal, tiada kesudahan', ['Allah tiada permulaan', 'Allah itu ada', 'Allah mendengar']],
    ['Apakah maksud Qiyamuhu binafsihi?', 'Allah berdiri dengan sendiri', ['Allah tidak serupa makhluk', 'Allah Maha Mengetahui', 'Allah Maha Melihat']],
    ['Berapakah bilangan sifat wajib bagi Allah?', '20 sifat', ['10 sifat', '30 sifat', '99 sifat']],
    ['Apakah maksud sifat Wujud?', 'Ada', ['Tiada', 'Kekal', 'Hidup']],
    ['Apakah maksud sifat Qidam?', 'Sedia ada', ['Baharu', 'Kekal', 'Hidup']],
    ['Apakah maksud sifat Baqa?', 'Kekal', ['Binasa', 'Sedia ada', 'Hidup']],
  ],
  pairs: [
    ['Wujud', 'Allah itu ada'],
    ['Qidam', 'Tiada permulaan'],
    ['Baqa', 'Tiada kesudahan'],
    ['Qiyamuhu binafsihi', 'Berdiri dengan sendiri'],
    ['Wujud', 'Ada'],
    ['Baqa', 'Kekal'],
  ],
  tf: [
    ['Sifat 20 ialah sifat yang wajib ada pada Allah.', true],
    ['Allah serupa dengan makhluk-Nya.', false],
    ['Sifat wajib bagi Allah ada 20.', true],
    ['Allah bersifat binasa.', false],
  ],
});

bank('pi4-ibadah-zakat', {
  emoji: '🕋',
  facts: [
    ['Bilakah zakat fitrah dibayar?', 'Sebelum solat Aidilfitri', ['Selepas solat Aidilfitri', 'Pada bulan Rejab', 'Pada bulan Syawal']],
    ['Apakah maksud zakat?', 'Mengeluarkan sebahagian harta untuk yang berhak', ['Menyimpan harta', 'Membeli barang', 'Memberi hadiah kepada kawan']],
    ['Apakah perbezaan zakat dan sedekah?', 'Zakat wajib, sedekah sukarela', ['Kedua-duanya wajib', 'Kedua-duanya sukarela', 'Zakat sukarela, sedekah wajib']],
    ['Zakat daripada wang, emas dan perniagaan dipanggil apa?', 'Zakat harta', ['Zakat fitrah', 'Zakat ternakan', 'Zakat tanaman']],
    ['Apakah maksud zakat?', 'Memberi sebahagian harta kepada yang layak', ['Menyimpan harta', 'Membeli harta', 'Meminjam harta']],
    ['Berapakah kadar zakat fitrah?', '1 gantang', ['2 gantang', '3 gantang', 'Setengah gantang']],
    ['Siapakah yang wajib membayar zakat fitrah?', 'Setiap muslim', ['Orang kaya sahaja', 'Lelaki sahaja', 'Orang dewasa sahaja']],
    ['Bilakah zakat fitrah perlu dibayar?', 'Sebelum solat Aidilfitri', ['Selepas solat Aidilfitri', 'Awal Ramadan', 'Akhir tahun']],
  ],
  pairs: [
    ['Zakat fitrah', 'Dibayar sebelum Aidilfitri'],
    ['Zakat harta', 'Daripada wang dan emas'],
    ['Zakat ternakan', 'Daripada lembu dan kambing'],
    ['Sedekah', 'Sukarela, bila-bila masa'],
    ['Zakat fitrah', '1 gantang makanan asasi'],
  ],
  tf: [
    ['Zakat fitrah dibayar sebelum solat Aidilfitri.', true],
    ['Sedekah wajib dibayar dengan kadar tertentu.', false],
    ['Zakat fitrah dibayar sebelum solat Aidilfitri.', true],
    ['Zakat hanya untuk orang kaya.', false],
  ],
});

bank('pi4-sirah-hijrah', {
  emoji: '🌙',
  facts: [
    ['Dari manakah Nabi Muhammad SAW berhijrah?', 'Mekah ke Madinah', ['Madinah ke Mekah', 'Mekah ke Taif', 'Madinah ke Syam']],
    ['Siapakah yang menemani Nabi Muhammad SAW semasa hijrah?', 'Abu Bakar as-Siddiq', ['Umar al-Khattab', 'Uthman bin Affan', 'Ali bin Abi Talib']],
    ['Di manakah baginda bersembunyi semasa hijrah?', 'Gua Thur', ['Gua Hira', 'Gua Bukit', 'Gua Batu']],
    ['Berapa harikah baginda bersembunyi di dalam gua?', '3 hari', ['1 hari', '7 hari', '10 hari']],
    ['Apakah yang bermula daripada peristiwa hijrah?', 'Kalendar Hijrah', ['Kalendar Masihi', 'Kalendar Cina', 'Kalendar Hindu']],
    ['Apakah maksud hijrah?', 'Berpindah dari Mekah ke Madinah', ['Pulang ke Mekah', 'Pergi berniaga', 'Pergi menunaikan haji']],
    ['Siapakah yang menemani Nabi semasa hijrah?', 'Abu Bakar as-Siddiq', ['Umar al-Khattab', 'Uthman bin Affan', 'Ali bin Abi Talib']],
    ['Di manakah Nabi bersembunyi semasa hijrah?', 'Gua Thur', ['Gua Hira', 'Gua Nur', 'Gua Kahfi']],
    ['Siapakah yang menyambut Nabi di Madinah?', 'Penduduk Ansar', ['Penduduk Mekah', 'Penduduk Taif', 'Penduduk Syam']],
  ],
  pairs: [
    ['Abu Bakar as-Siddiq', 'Menemani baginda hijrah'],
    ['Gua Thur', 'Tempat baginda bersembunyi'],
    ['Madinah', 'Tempat baginda berhijrah'],
    ['Tahun Hijrah', 'Permulaan kalendar Islam'],
    ['Abu Bakar', 'Sahabat yang menemani hijrah'],
    ['Gua Thur', 'Tempat Nabi bersembunyi'],
  ],
  order: {
    prompt: 'Susun peristiwa hijrah mengikut urutan yang betul.',
    items: ['Baginda keluar dari Mekah', 'Bersembunyi di Gua Thur', 'Tiba di Madinah', 'Disambut oleh penduduk Madinah'],
  },
  tf: [
    ['Nabi Muhammad SAW berhijrah dari Mekah ke Madinah.', true],
    ['Baginda berhijrah bersama Umar al-Khattab.', false],
    ['Nabi berhijrah dari Mekah ke Madinah.', true],
    ['Nabi bersembunyi di Gua Hira semasa hijrah.', false],
  ],
});

bank('pi4-adab-majlis', {
  emoji: '💛',
  facts: [
    ['Apakah yang perlu dilakukan sebelum masuk ke majlis ilmu?', 'Beri salam', ['Terus duduk', 'Bercakap kuat', 'Bermain']],
    ['Apakah yang perlu dilakukan apabila guru sedang mengajar?', 'Dengar dengan teliti', ['Bercakap dengan rakan', 'Bermain telefon', 'Tidur']],
    ['Apakah hukum menuntut ilmu bagi setiap Muslim?', 'Wajib', ['Sunat', 'Harus', 'Makruh']],
    ['Apakah yang perlu dilakukan sebelum bertanya?', 'Angkat tangan dahulu', ['Terus bercakap', 'Menjerit', 'Berdiri']],
    ['Apakah maksud majlis?', 'Tempat orang berkumpul', ['Tempat makan', 'Tempat tidur', 'Tempat bermain']],
    ['Apakah adab ketika berada dalam majlis ilmu?', 'Duduk dengan sopan', ['Bercakap kuat', 'Bermain', 'Tidur']],
    ['Apakah yang perlu dilakukan apabila masuk majlis?', 'Memberi salam', ['Berdiam diri', 'Lari', 'Menjerit']],
    ['Apakah yang perlu dilakukan sebelum bercakap dalam majlis?', 'Minta izin', ['Terkam cakap', 'Menjerit', 'Diam sahaja']],
  ],
  pairs: [
    ['Sebelum masuk majlis', 'Beri salam'],
    ['Ketika guru mengajar', 'Dengar dengan teliti'],
    ['Sebelum bertanya', 'Angkat tangan'],
    ['Majlis', 'Tempat orang berkumpul'],
  ],
  order: {
    prompt: 'Susun adab dalam majlis ilmu mengikut urutan yang betul.',
    items: ['Beri salam sebelum masuk', 'Duduk dengan sopan', 'Dengar dengan teliti', 'Angkat tangan untuk bertanya'],
  },
  tf: [
    ['Menuntut ilmu ialah kewajipan setiap Muslim.', true],
    ['Kita boleh bercakap sesuka hati ketika guru mengajar.', false],
    ['Kita memberi salam apabila masuk majlis.', true],
    ['Kita boleh memotong cakap orang lain dalam majlis.', false],
  ],
});

bank('pi4-jawi-imlak', {
  emoji: '✍️',
  facts: [
    ['Apakah maksud imlak?', 'Menulis apa yang didengar', ['Membaca kuat', 'Menghafaz ayat', 'Melukis gambar']],
    ['Apakah maksud "کومڤيوتر"?', 'Komputer', ['Kalkulator', 'Kamera', 'Radio']],
    ['Apakah maksud "تيليۏيشن"?', 'Televisyen', ['Telefon', 'Radio', 'Komputer']],
    ['Apakah maksud "سايانس"?', 'Sains', ['Sejarah', 'Matematik', 'Bahasa']],
    ['Apakah maksud imlak?', 'Menulis apa yang didengar', ['Membaca dengan kuat', 'Menghafal', 'Menterjemah']],
    ['Apakah kemahiran yang dilatih dalam imlak?', 'Mendengar dan menulis', ['Membaca dan melukis', 'Bercakap dan menyanyi', 'Berlari dan melompat']],
    ['Apakah yang perlu didengar dengan teliti dalam imlak?', 'Sebutan perkataan', ['Warna kertas', 'Bunyi kipas', 'Suara luar']],
    ['Apakah yang perlu dilakukan selepas selesai imlak?', 'Semak ejaan', ['Buang kertas', 'Lari', 'Tidur']],
  ],
  pairs: [
    ['کومڤيوتر', 'Komputer'],
    ['تيليۏيشن', 'Televisyen'],
    ['سايانس', 'Sains'],
    ['ماتماتيک', 'Matematik'],
    ['Imlak', 'Menulis apa yang didengar'],
  ],
  tf: [
    ['Imlak bermaksud menulis apa yang didengar.', true],
    ['Kata pinjaman Inggeris tidak boleh ditulis dalam Jawi.', false],
    ['Imlak melatih kemahiran mendengar dan menulis.', true],
    ['Imlak bermaksud membaca al-Quran dengan kuat.', false],
  ],
});

/* ==================================================================== */
/* TAHUN 5                                                              */
/* ==================================================================== */

bank('pi5-quran-mad', {
  emoji: '📖',
  surahs: ['al-qadr'],
  facts: [
    ['Apakah maksud mad?', 'Memanjangkan bacaan', ['Memendekkan bacaan', 'Menghentikan bacaan', 'Mempercepatkan bacaan']],
    ['Berapakah harakat bagi Mad Asli?', '2 harakat', ['4 harakat', '6 harakat', '8 harakat']],
    ['Berapakah harakat bagi Mad Lazim?', '6 harakat', ['2 harakat', '4 harakat', '3 harakat']],
    ['Apakah nama lain bagi Mad Asli?', 'Mad Tabii', ['Mad Wajib', 'Mad Jaiz', 'Mad Lazim']],
    ['Berapakah harakat bagi Mad Wajib Muttasil?', '4 atau 5 harakat', ['2 harakat', '6 harakat', '8 harakat']],
    ['Berapakah harakat mad wajib muttasil?', '4 hingga 5 harakat', ['2 harakat', '6 harakat', '1 harakat']],
    ['Apakah maksud mad wajib muttasil?', 'Mad yang bertemu hamzah dalam satu kalimah', ['Mad yang berhenti', 'Mad pada hujung ayat', 'Mad yang pendek']],
    ['Apakah maksud mad jaiz munfasil?', 'Mad yang bertemu hamzah pada kalimah berbeza', ['Mad yang wajib', 'Mad yang pendek', 'Mad pada permulaan']],
    ['Apakah maksud mad aridisukun?', 'Mad yang berhenti pada huruf akhir', ['Mad yang panjang', 'Mad yang pendek', 'Mad yang wajib']],
  ],
  pairs: [
    ['Mad Asli', '2 harakat'],
    ['Mad Wajib Muttasil', '4 atau 5 harakat'],
    ['Mad Lazim', '6 harakat'],
    ['Mad wajib muttasil', 'Bertemu hamzah dalam satu kalimah'],
  ],
  order: {
    prompt: 'Susun jenis mad daripada yang paling pendek panjangnya.',
    items: ['Mad Asli (2 harakat)', 'Mad Wajib Muttasil (4 harakat)', 'Mad Lazim (6 harakat)'],
  },
  tf: [
    ['Mad Asli dipanjangkan 2 harakat.', true],
    ['Mad Lazim dipanjangkan 2 harakat sahaja.', false],
    ['Mad wajib muttasil dibaca 4 hingga 5 harakat.', true],
    ['Mad asli dibaca 6 harakat.', false],
  ],
});

bank('pi5-hadis-amanah', {
  emoji: '🗣️',
  facts: [
    ['Apakah maksud amanah?', 'Boleh dipercayai menjaga sesuatu', ['Suka bercakap', 'Suka menolong', 'Suka memberi']],
    ['Apabila orang munafik bercakap, dia apa?', 'Berdusta', ['Berkata benar', 'Berdiam', 'Bersenda']],
    ['Apabila orang munafik berjanji, dia apa?', 'Mungkir janji', ['Menepati janji', 'Melupakan janji', 'Menulis janji']],
    ['Apabila orang munafik diberi amanah, dia apa?', 'Khianat', ['Menjaga dengan baik', 'Mengembalikan dengan cepat', 'Bersyukur']],
    ['Apakah maksud amanah?', 'Sifat boleh dipercayai', ['Sifat pembohong', 'Sifat malas', 'Sifat kedekut']],
    ['Apakah contoh sifat amanah?', 'Menjaga barang yang dipinjam', ['Menyimpan barang orang', 'Mengambil barang orang', 'Merompak']],
    ['Apakah lawan sifat amanah?', 'Khianat', ['Jujur', 'Rajin', 'Pemurah']],
    ['Siapakah yang digelar Al-Amin?', 'Nabi Muhammad SAW', ['Abu Bakar', 'Umar', 'Ali']],
  ],
  pairs: [
    ['Bercakap', 'Berdusta (munafik)'],
    ['Berjanji', 'Mungkir (munafik)'],
    ['Diberi amanah', 'Khianat (munafik)'],
    ['Amanah', 'Boleh dipercayai'],
    ['Khianat', 'Lawan sifat amanah'],
  ],
  tf: [
    ['Orang munafik akan khianat apabila diberi amanah.', true],
    ['Amanah bermaksud suka bermain-main.', false],
    ['Amanah bermaksud boleh dipercayai.', true],
    ['Khianat ialah sifat yang baik.', false],
  ],
});

bank('pi5-akidah-penyelewengan', {
  emoji: '🤲',
  facts: [
    ['Apakah dosa yang paling besar dalam Islam?', 'Syirik', ['Mencuri', 'Berbohong', 'Mengumpat']],
    ['Apakah maksud syirik?', 'Menyekutukan Allah dengan sesuatu', ['Meninggalkan solat', 'Berkata dusta', 'Mengabaikan puasa']],
    ['Apakah hukum mempercayai ramalan nasib?', 'Dilarang', ['Dibenarkan', 'Sunat', 'Harus']],
    ['Apakah yang merosakkan akidah seseorang?', 'Menyembah berhala', ['Membaca al-Quran', 'Solat lima waktu', 'Bersedekah']],
    ['Apakah maksud akidah?', 'Kepercayaan kepada Allah', ['Amalan harian', 'Perkataan baik', 'Perbuatan sunat']],
    ['Apakah contoh penyelewengan akidah?', 'Menyembah selain Allah', ['Solat lima waktu', 'Berpuasa', 'Bersedekah']],
    ['Apakah hukum syirik?', 'Haram', ['Halal', 'Sunat', 'Makruh']],
    ['Apakah yang perlu dilakukan apabila melihat penyelewengan akidah?', 'Menasihati dengan baik', ['Ikut serta', 'Diam sahaja', 'Ketawa']],
  ],
  pairs: [
    ['Syirik', 'Menyekutukan Allah'],
    ['Ramalan nasib', 'Kepercayaan yang dilarang'],
    ['Menyembah berhala', 'Merosakkan akidah'],
    ['Syirik', 'Menyekutukan Allah'],
  ],
  tf: [
    ['Syirik ialah dosa yang paling besar dalam Islam.', true],
    ['Mempercayai ramalan nasib dibenarkan dalam Islam.', false],
    ['Syirik ialah menyekutukan Allah.', true],
    ['Syirik ialah amalan yang dibenarkan dalam Islam.', false],
  ],
});

bank('pi5-ibadah-haji-umrah', {
  emoji: '🕋',
  facts: [
    ['Haji ialah rukun Islam yang ke berapa?', 'Kelima', ['Pertama', 'Ketiga', 'Keempat']],
    ['Berapa kalikah haji wajib bagi yang mampu?', 'Sekali seumur hidup', ['Dua kali', 'Setiap tahun', 'Tiga kali']],
    ['Apakah maksud tawaf?', 'Mengelilingi Kaabah 7 kali', ['Berjalan antara Safa dan Marwah', 'Berhenti di Arafah', 'Memakai ihram']],
    ['Apakah maksud wukuf?', 'Berhenti di Arafah', ['Mengelilingi Kaabah', 'Berjalan antara Safa dan Marwah', 'Bercukur']],
    ['Apakah maksud sai?', 'Berjalan antara Safa dan Marwah', ['Mengelilingi Kaabah', 'Berhenti di Arafah', 'Memakai ihram']],
    ['Apakah maksud haji?', 'Mengunjungi Baitullah pada waktu tertentu', ['Melawat Mekah bila-bila masa', 'Berpuasa', 'Bersedekah']],
    ['Apakah rukun Islam yang kelima?', 'Menunaikan haji', ['Berpuasa', 'Mengeluarkan zakat', 'Mendirikan solat']],
    ['Bilakah haji dilaksanakan?', 'Bulan Zulhijjah', ['Bulan Ramadan', 'Bulan Syawal', 'Bulan Rejab']],
    ['Apakah perbezaan umrah dengan haji?', 'Umrah boleh dilakukan bila-bila masa', ['Umrah wajib', 'Haji sunat', 'Tiada perbezaan']],
  ],
  pairs: [
    ['Tawaf', 'Mengelilingi Kaabah 7 kali'],
    ['Sai', 'Berjalan antara Safa dan Marwah'],
    ['Wukuf', 'Berhenti di Arafah'],
    ['Ihram', 'Niat dan memakai pakaian ihram'],
    ['Haji', 'Dilakukan pada bulan Zulhijjah'],
    ['Umrah', 'Boleh dilakukan bila-bila masa'],
  ],
  order: {
    prompt: 'Susun rukun haji mengikut urutan yang betul.',
    items: ['Ihram', 'Wukuf di Arafah', 'Tawaf', 'Sai'],
  },
  tf: [
    ['Haji wajib sekali seumur hidup bagi yang mampu.', true],
    ['Umrah hanya boleh dilakukan pada bulan Ramadan sahaja.', false],
    ['Haji dilaksanakan pada bulan Zulhijjah.', true],
    ['Umrah hanya boleh dilakukan pada bulan Zulhijjah.', false],
  ],
});

bank('pi5-sirah-madinah', {
  emoji: '🌙',
  facts: [
    ['Apakah masjid yang dibina oleh Nabi Muhammad SAW di Madinah?', 'Masjid Nabawi', ['Masjidil Haram', 'Masjid Al-Aqsa', 'Masjid Quba']],
    ['Apakah dokumen yang ditulis baginda di Madinah?', 'Piagam Madinah', ['Perlembagaan Mekah', 'Piagam Mekah', 'Surat Quraisy']],
    ['Siapakah yang dipersaudarakan oleh baginda?', 'Muhajirin dan Ansar', ['Quraisy dan Ansar', 'Muhajirin dan Quraisy', 'Yahudi dan Quraisy']],
    ['Apakah maksud Ansar?', 'Penduduk Madinah yang menolong', ['Penduduk Mekah yang berhijrah', 'Orang Quraisy', 'Penduduk Taif']],
    ['Apakah nama kota Madinah sebelum hijrah?', 'Yathrib', ['Mekah', 'Taif', 'Syam']],
    ['Apakah yang dibina Nabi selepas tiba di Madinah?', 'Masjid', ['Istana', 'Sekolah', 'Pasar']],
    ['Apakah nama masjid pertama yang dibina Nabi?', 'Masjid Quba', ['Masjid Nabawi', 'Masjidil Haram', 'Masjid Aqsa']],
    ['Apakah yang dibentuk Nabi untuk menyatukan penduduk Madinah?', 'Piagam Madinah', ['Perlembagaan', 'Perjanjian Mekah', 'Ikrar']],
  ],
  pairs: [
    ['Masjid Nabawi', 'Masjid yang dibina di Madinah'],
    ['Piagam Madinah', 'Dokumen keadilan'],
    ['Ansar', 'Penduduk Madinah yang menolong'],
    ['Muhajirin', 'Penduduk Mekah yang berhijrah'],
    ['Yathrib', 'Nama Madinah sebelum hijrah'],
    ['Masjid Quba', 'Masjid pertama dibina Nabi'],
  ],
  tf: [
    ['Nabi Muhammad SAW membina Masjid Nabawi di Madinah.', true],
    ['Piagam Madinah ditulis oleh orang Quraisy.', false],
    ['Nabi membina Masjid Quba semasa hijrah.', true],
    ['Madinah sebelum hijrah dipanggil Taif.', false],
  ],
});

bank('pi5-adab-alam', {
  emoji: '🌿',
  facts: [
    ['Apakah peranan manusia terhadap alam?', 'Khalifah yang menjaga alam', ['Pemilik alam', 'Perosak alam', 'Pengguna bebas']],
    ['Apakah yang dilarang Nabi SAW ketika berwuduk?', 'Membazir air', ['Menggunakan air', 'Bersuci', 'Berdoa']],
    ['Apakah yang perlu dilakukan dengan sampah?', 'Buang di tempat yang betul', ['Buang merata-rata', 'Bakar di mana-mana', 'Simpan di jalan']],
    ['Bagaimanakah kita menjaga haiwan?', 'Sayangi, jangan menyeksanya', ['Pukul mereka', 'Biar kelaparan', 'Kurung selalu']],
    ['Apakah maksud menjaga alam?', 'Memelihara alam sekitar', ['Memusnahkan alam', 'Membina alam', 'Mengubah alam']],
    ['Apakah contoh menjaga alam sekitar?', 'Membuang sampah dalam tong', ['Menebang pokok sembarangan', 'Membuang sampah ke sungai', 'Membakar hutan']],
    ['Mengapakah kita perlu menjaga alam?', 'Kerana alam amanah Allah', ['Kerana alam milik kita', 'Kerana alam murah', 'Kerana alam cantik']],
    ['Apakah kesan membuang sampah ke sungai?', 'Banjir', ['Udara bersih', 'Air bersih', 'Tanah subur']],
  ],
  pairs: [
    ['Khalifah', 'Peranan manusia terhadap alam'],
    ['Membazir air', 'Perbuatan yang dilarang'],
    ['Kitar semula', 'Menjaga alam'],
    ['Membuang sampah', 'Ke dalam tong sampah'],
  ],
  tf: [
    ['Manusia dilantik sebagai khalifah untuk menjaga alam.', true],
    ['Membazir air dibenarkan ketika berwuduk di sungai.', false],
    ['Menjaga alam ialah tanggungjawab setiap muslim.', true],
    ['Kita boleh membuang sampah ke dalam sungai.', false],
  ],
});

bank('pi5-jawi-khat', {
  emoji: '✍️',
  facts: [
    ['Apakah maksud khat?', 'Seni tulisan Arab yang indah', ['Bacaan al-Quran', 'Hafazan surah', 'Terjemahan ayat']],
    ['Khat yang paling biasa dalam buku ialah apa?', 'Khat Nasakh', ['Khat Thuluth', 'Khat Riqah', 'Khat Kufi']],
    ['Khat yang digunakan untuk hiasan dan tajuk ialah apa?', 'Khat Thuluth', ['Khat Nasakh', 'Khat Riqah', 'Khat Kufi']],
    ['Batu bersurat Terengganu berusia berapa tahun?', 'Lebih 700 tahun', ['Lebih 100 tahun', 'Lebih 200 tahun', 'Lebih 300 tahun']],
    ['Apakah maksud khat?', 'Tulisan tangan yang cantik', ['Bacaan yang laju', 'Hafalan yang kuat', 'Suara yang merdu']],
    ['Apakah yang perlu ada untuk menulis khat yang cantik?', 'Latihan berterusan', ['Alat yang mahal', 'Kertas yang besar', 'Masa yang sedikit']],
    ['Apakah faedah menulis khat?', 'Melatih kesabaran', ['Melatih berlari', 'Melatih menyanyi', 'Melatih berenang']],
    ['Apakah nama jenis tulisan khat yang terkenal?', 'Thuluth', ['Rumi', 'Latin', 'Sanskrit']],
  ],
  pairs: [
    ['Khat Nasakh', 'Paling biasa dalam buku'],
    ['Khat Thuluth', 'Untuk hiasan dan tajuk'],
    ['Khat Kufi', 'Tulisan geometri'],
    ['Khat Riqah', 'Tulisan kecil dan cepat'],
    ['Khat', 'Tulisan tangan yang cantik'],
  ],
  tf: [
    ['Batu Bersurat Terengganu ditulis dalam tulisan Jawi.', true],
    ['Khat Nasakh ialah khat untuk hiasan tajuk sahaja.', false],
    ['Khat ialah tulisan tangan yang cantik.', true],
    ['Khat hanya boleh ditulis dengan komputer.', false],
  ],
});

/* ==================================================================== */
/* TAHUN 6                                                              */
/* ==================================================================== */

bank('pi6-quran-waqaf', {
  emoji: '📖',
  surahs: ['ad-dhuha'],
  facts: [
    ['Apakah maksud waqaf?', 'Berhenti ketika membaca al-Quran', ['Meneruskan bacaan', 'Memulakan bacaan', 'Mempercepat bacaan']],
    ['Apakah maksud tanda waqaf "مـ"?', 'Wajib berhenti', ['Tidak boleh berhenti', 'Harus berhenti', 'Lebih baik terus']],
    ['Apakah maksud tanda waqaf "لا"?', 'Tidak boleh berhenti', ['Wajib berhenti', 'Harus berhenti', 'Lebih baik berhenti']],
    ['Apakah maksud tanda waqaf "ج"?', 'Harus berhenti atau terus', ['Wajib berhenti', 'Tidak boleh berhenti', 'Lebih baik terus']],
    ['Apakah maksud waqaf lazim?', 'Wajib berhenti', ['Wajib terus', 'Sunat berhenti', 'Haram berhenti']],
    ['Apakah maksud waqaf mamnu?', 'Dilarang berhenti', ['Wajib berhenti', 'Sunat berhenti', 'Harus berhenti']],
    ['Mengapakah kita perlu belajar waqaf?', 'Supaya bacaan betul', ['Supaya cepat habis', 'Supaya kuat', 'Supaya merdu']],
    ['Apakah maksud waqaf jaiz?', 'Boleh berhenti atau terus', ['Wajib berhenti', 'Haram berhenti', 'Dilarang berhenti']],
  ],
  pairs: [
    ['مـ', 'Wajib berhenti'],
    ['لا', 'Tidak boleh berhenti'],
    ['ج', 'Harus berhenti atau terus'],
    ['قلى', 'Lebih baik berhenti'],
    ['Waqaf lazim', 'Hukum berhenti wajib'],
    ['Waqaf mamnu', 'Hukum dilarang berhenti'],
  ],
  tf: [
    ['Waqaf bermaksud berhenti ketika membaca al-Quran.', true],
    ['Berhenti di tempat yang salah tidak mengubah maksud ayat.', false],
    ['Waqaf lazim bermaksud wajib berhenti.', true],
    ['Waqaf mamnu bermaksud wajib berhenti.', false],
  ],
});

bank('pi6-hadis-nikmat', {
  emoji: '🗣️',
  facts: [
    ['Apakah dua nikmat yang sering dilupakan manusia?', 'Kesihatan dan masa lapang', ['Wang dan harta', 'Rumah dan kereta', 'Pakaian dan makanan']],
    ['Bagaimanakah kita menjaga kesihatan?', 'Bersenam dan makan berkhasiat', ['Tidur sepanjang hari', 'Makan makanan segera', 'Tidak bersenam']],
    ['Bagaimanakah kita menghargai masa?', 'Gunakan untuk belajar', ['Buang masa bermain', 'Tidur selalu', 'Menonton televisyen sepanjang hari']],
    ['Apakah maksud nikmat?', 'Pemberian Allah yang baik', ['Hukuman Allah', 'Ujian semata-mata', 'Balasan']],
    ['Apakah cara bersyukur atas nikmat?', 'Berterima kasih kepada Allah', ['Mengeluh', 'Membazir', 'Sombong']],
    ['Apakah yang berlaku jika kita tidak bersyukur?', 'Nikmat boleh ditarik', ['Nikmat bertambah', 'Nikmat kekal', 'Tiada kesan']],
    ['Apakah contoh nikmat kesihatan?', 'Boleh bernafas dan bergerak', ['Boleh mengeluh', 'Boleh marah', 'Boleh tidur lewat']],
  ],
  pairs: [
    ['Kesihatan', 'Nikmat yang perlu dijaga'],
    ['Masa lapang', 'Nikmat yang sering dilupakan'],
    ['Bersenam', 'Cara menjaga kesihatan'],
    ['Syukur', 'Berterima kasih atas nikmat'],
  ],
  tf: [
    ['Kesihatan dan masa lapang ialah dua nikmat yang sering dilupakan.', true],
    ['Masa yang berlalu boleh dikembalikan.', false],
    ['Kita perlu bersyukur atas nikmat Allah.', true],
    ['Nikmat Allah tidak perlu disyukuri.', false],
  ],
});

bank('pi6-akidah-istiqamah', {
  emoji: '🤲',
  facts: [
    ['Apakah maksud istiqamah?', 'Berterusan dan teguh dalam kebaikan', ['Berhenti beribadah', 'Melakukan sekali sahaja', 'Berubah-ubah pendirian']],
    ['Apakah amalan yang lebih disukai Allah?', 'Sedikit tetapi berterusan', ['Banyak tetapi sekali sahaja', 'Banyak pada bulan Ramadan', 'Sedikit dan jarang']],
    ['Apakah contoh istiqamah?', 'Solat lima waktu tanpa tinggal', ['Solat seminggu sekali', 'Solat bila rajin', 'Solat pada hari raya sahaja']],
    ['Apakah maksud istiqamah?', 'Kekal dalam ketaatan', ['Berubah-ubah', 'Cepat putus asa', 'Malas']],
    ['Apakah contoh istiqamah?', 'Solat lima waktu setiap hari', ['Solat sekali sahaja', 'Solat bila rajin', 'Tidak solat']],
    ['Apakah faedah istiqamah?', 'Hidup diberkati Allah', ['Hidup susah', 'Hidup gelap', 'Hidup letih']],
    ['Apakah yang membantu kita kekal istiqamah?', 'Doa dan azam kuat', ['Rakan yang malas', 'Tidur lewat', 'Bermain sahaja']],
  ],
  pairs: [
    ['Istiqamah', 'Berterusan dalam kebaikan'],
    ['Solat lima waktu', 'Contoh istiqamah'],
    ['Sedikit tetapi tetap', 'Amalan yang disukai Allah'],
    ['Istiqamah', 'Kekal dalam ketaatan'],
  ],
  tf: [
    ['Amalan yang sedikit tetapi berterusan lebih disukai Allah.', true],
    ['Istiqamah bermaksud melakukan ibadah sekali sahaja.', false],
    ['Istiqamah bermaksud kekal dalam ketaatan.', true],
    ['Istiqamah bermaksud berubah-ubah pendirian.', false],
  ],
});

bank('pi6-ibadah-fardhu', {
  emoji: '🕋',
  facts: [
    ['Apakah maksud fardhu ain?', 'Kewajipan setiap individu Muslim', ['Kewajipan sebahagian orang', 'Amalan sunat', 'Amalan harus']],
    ['Apakah maksud fardhu kifayah?', 'Kewajipan yang cukup jika sebahagian melakukannya', ['Kewajipan setiap individu', 'Amalan sunat', 'Amalan makruh']],
    ['Apakah contoh fardhu ain?', 'Solat lima waktu', ['Solat jenazah', 'Ilmu perubatan', 'Ilmu kejuruteraan']],
    ['Apakah contoh fardhu kifayah?', 'Solat jenazah', ['Solat lima waktu', 'Puasa Ramadan', 'Menutup aurat']],
    ['Apakah hukum menuntut ilmu agama?', 'Fardhu ain', ['Fardhu kifayah', 'Sunat', 'Harus']],
    ['Apakah maksud fardu?', 'Perkara yang wajib dilakukan', ['Perkara yang sunat', 'Perkara yang haram', 'Perkara yang harus']],
    ['Apakah hukum meninggalkan solat fardu?', 'Berdosa', ['Tidak mengapa', 'Dapat pahala', 'Sunat']],
    ['Berapakah bilangan solat fardu dalam sehari?', '5 waktu', ['4 waktu', '6 waktu', '3 waktu']],
    ['Apakah contoh ibadah fardu?', 'Solat lima waktu', ['Solat sunat', 'Puasa sunat', 'Sedekah']],
  ],
  pairs: [
    ['Fardhu ain', 'Kewajipan setiap individu'],
    ['Fardhu kifayah', 'Cukup jika sebahagian melakukannya'],
    ['Solat lima waktu', 'Contoh fardhu ain'],
    ['Solat jenazah', 'Contoh fardhu kifayah'],
    ['Fardu', 'Wajib dilakukan'],
    ['Sunat', 'Dapat pahala jika dilakukan'],
  ],
  tf: [
    ['Fardhu ain ialah kewajipan setiap individu Muslim.', true],
    ['Solat jenazah ialah contoh fardhu ain.', false],
    ['Solat fardu wajib ditunaikan.', true],
    ['Meninggalkan solat fardu tidak berdosa.', false],
  ],
});

bank('pi6-sirah-khalifah', {
  emoji: '🌙',
  facts: [
    ['Siapakah khalifah pertama?', 'Abu Bakar as-Siddiq', ['Umar bin al-Khattab', 'Uthman bin Affan', 'Ali bin Abi Talib']],
    ['Siapakah khalifah yang membukukan al-Quran dalam satu mushaf?', 'Uthman bin Affan', ['Abu Bakar as-Siddiq', 'Umar bin al-Khattab', 'Ali bin Abi Talib']],
    ['Siapakah khalifah yang meluaskan wilayah Islam?', 'Umar bin al-Khattab', ['Abu Bakar as-Siddiq', 'Uthman bin Affan', 'Ali bin Abi Talib']],
    ['Apakah maksud Khulafa al-Rasyidin?', 'Khalifah yang mendapat petunjuk', ['Khalifah yang kaya', 'Khalifah yang gagah', 'Khalifah yang muda']],
    ['Berapa lamakah mereka memerintah?', 'Kira-kira 30 tahun', ['Kira-kira 10 tahun', 'Kira-kira 50 tahun', 'Kira-kira 100 tahun']],
    ['Siapakah khalifah yang pertama?', 'Abu Bakar as-Siddiq', ['Umar al-Khattab', 'Uthman bin Affan', 'Ali bin Abi Talib']],
    ['Siapakah khalifah yang kedua?', 'Umar al-Khattab', ['Abu Bakar', 'Uthman', 'Ali']],
    ['Siapakah khalifah yang ketiga?', 'Uthman bin Affan', ['Abu Bakar', 'Umar', 'Ali']],
    ['Siapakah khalifah yang keempat?', 'Ali bin Abi Talib', ['Abu Bakar', 'Umar', 'Uthman']],
  ],
  pairs: [
    ['Abu Bakar as-Siddiq', 'Khalifah pertama'],
    ['Umar bin al-Khattab', 'Meluaskan wilayah Islam'],
    ['Uthman bin Affan', 'Membukukan al-Quran'],
    ['Ali bin Abi Talib', 'Terkenal dengan keberanian'],
    ['Abu Bakar', 'Khalifah pertama'],
    ['Umar', 'Khalifah kedua'],
    ['Uthman', 'Khalifah ketiga'],
  ],
  order: {
    prompt: 'Susun Khulafa al-Rasyidin mengikut urutan pemerintahan.',
    items: ['Abu Bakar as-Siddiq', 'Umar bin al-Khattab', 'Uthman bin Affan', 'Ali bin Abi Talib'],
  },
  tf: [
    ['Abu Bakar as-Siddiq ialah khalifah yang pertama.', true],
    ['Uthman bin Affan ialah khalifah yang pertama.', false],
    ['Abu Bakar as-Siddiq ialah khalifah yang pertama.', true],
    ['Ali bin Abi Talib ialah khalifah yang kedua.', false],
  ],
});

bank('pi6-adab-sosial', {
  emoji: '💛',
  facts: [
    ['Apakah yang perlu dilakukan dalam jual beli?', 'Jujur tentang keadaan barang', ['Menyembunyikan kecacatan', 'Menipu timbangan', 'Menaikkan harga sesuka hati']],
    ['Bagaimanakah kita bergaul dengan orang berlainan bangsa?', 'Jaga hubungan baik dengan semua', ['Jauhi mereka', 'Ejek mereka', 'Abaikan mereka']],
    ['Apakah ganjaran peniaga yang jujur?', 'Bersama para nabi di akhirat', ['Menjadi kaya', 'Terkenal', 'Dihormati semua orang']],
    ['Apakah maksud adab sosial?', 'Adab dalam pergaulan', ['Adab makan', 'Adab tidur', 'Adab belajar']],
    ['Apakah yang perlu dilakukan apabila berjumpa kawan?', 'Memberi salam', ['Berpaling', 'Berdiam diri', 'Lari']],
    ['Apakah yang perlu dielakkan dalam pergaulan?', 'Mengumpat', ['Memberi salam', 'Berkongsi', 'Tolong-menolong']],
    ['Apakah faedah beradab dalam pergaulan?', 'Disukai ramai', ['Dijauhi ramai', 'Dimarahi', 'Dipulaukan']],
  ],
  pairs: [
    ['Jujur', 'Sifat peniaga yang baik'],
    ['Menipu timbangan', 'Dilarang dalam jual beli'],
    ['Hormati semua orang', 'Adab bermasyarakat'],
    ['Memberi salam', 'Adab berjumpa kawan'],
  ],
  tf: [
    ['Peniaga yang jujur akan bersama para nabi di akhirat.', true],
    ['Kita hanya perlu berbuat baik kepada orang sebangsa sahaja.', false],
    ['Mengumpat ialah perbuatan yang dilarang.', true],
    ['Kita boleh mengumpat kawan.', false],
  ],
});

bank('pi6-jawi-warisan', {
  emoji: '✍️',
  facts: [
    ['Apakah batu bersurat terawal di Malaysia?', 'Batu Bersurat Terengganu', ['Batu Bersurat Kedah', 'Batu Bersurat Melaka', 'Batu Bersurat Perak']],
    ['Pada tahun berapakah Batu Bersurat Terengganu bertarikh?', '1303 Masihi', ['1503 Masihi', '1203 Masihi', '1403 Masihi']],
    ['Apakah nama "Malaysia" dalam Jawi?', 'مليسيا', ['ملايو', 'ملايس', 'مليسي']],
    ['Di manakah tulisan Jawi masih dipaparkan hari ini?', 'Wang kertas Malaysia', ['Papan tanda jalan', 'Iklan televisyen', 'Buku cerita Inggeris']],
    ['Apakah maksud warisan?', 'Peninggalan berharga daripada nenek moyang', ['Barang baharu', 'Barang pinjaman', 'Barang rosak']],
    ['Mengapakah Jawi dianggap warisan?', 'Kerana lama digunakan di Nusantara', ['Kerana baharu', 'Kerana mudah', 'Kerana murah']],
    ['Apakah yang perlu dilakukan untuk mengekalkan Jawi?', 'Belajar dan menggunakannya', ['Melupakannya', 'Membuangnya', 'Mengabaikannya']],
    ['Di manakah tulisan Jawi masih digunakan hari ini?', 'Wang kertas dan buku', ['Televisyen sahaja', 'Internet sahaja', 'Tiada tempat']],
  ],
  pairs: [
    ['Batu Bersurat Terengganu', 'Bukti terawal tulisan Jawi'],
    ['Wang kertas Malaysia', 'Masih memaparkan tulisan Jawi'],
    ['Utusan Melayu', 'Akhbar dalam tulisan Jawi'],
    ['Warisan', 'Peninggalan berharga'],
  ],
  tf: [
    ['Tulisan Jawi ialah warisan budaya Malaysia.', true],
    ['Tulisan Jawi tidak pernah digunakan dalam dokumen rasmi.', false],
    ['Tulisan Jawi ialah warisan budaya yang perlu dikekalkan.', true],
    ['Tulisan Jawi tidak pernah digunakan di Malaysia.', false],
  ],
});

/* ==================================================================== */
/* Kilang soalan                                                        */
/* ==================================================================== */

/**
 * Bina satu penjana bagi setiap topik dalam `BANKS`.
 *
 * Setiap penjana memutar jenis soalan mengikut indeks supaya satu sesi
 * latihan merangkumi pelbagai bentuk, bukan soalan pilihan jawapan sahaja.
 * Ini penting kerana murid tahun rendah cepat bosan dengan satu format.
 */
export const PENDIDIKAN_ISLAM_GENERATORS: Record<
  string,
  (year: number, rng: Rng, count: number) => Question[]
> = {};

for (const [topicId, b] of Object.entries(BANKS)) {
  const prefix = topicId;
  PENDIDIKAN_ISLAM_GENERATORS[topicId] = (_year, rng, count) => {
    // Fakta, pasangan dan pernyataan diacak mengikut benih. Tanpa langkah ini,
    // setiap benih menghasilkan urutan soalan yang sama, jadi kertas
    // peperiksaan bertindih walaupun benih berbeza.
    const facts = rng.shuffle(b.facts);
    // Buang pasangan yang berkongsi label kiri: soalan padan yang mempunyai
    // dua label kiri sama menjadi kabur dan tiada jawapan tunggal yang betul.
    const pairs = b.pairs ? dedupeLeft(rng.shuffle(b.pairs)) : undefined;
    const tfs = b.tf ? rng.shuffle(b.tf) : undefined;
    // Soalan hafazan dijana daripada teks surah, jadi ia berselang-seli dengan
    // soalan fakta supaya satu sesi menguji ayat dan fakta sekali gus.
    const surahQs = b.surahs ? rng.shuffle(surahQuestions(b.surahs, rng, b.emoji)) : [];

    return fill(count, (i) => {
      // Setiap soalan keempat ialah soalan hafazan, supaya ayat diuji tanpa
      // menenggelamkan soalan fakta dan jenis soalan lain dalam bank.
      if (surahQs.length > 0 && i % 4 === 2) {
        return surahQs[i % surahQs.length];
      }
      const f = facts[i % facts.length];

      // Susun urutan digunakan apabila bank menyediakannya, setiap 4 soalan.
      if (b.order && i % 4 === 3) {
        return order({
          prefix,
          prompt: b.order.prompt,
          items: rng.shuffle(b.order.items),
          correctOrder: b.order.items,
          explanation: `Urutan yang betul: ${b.order.items.join(' → ')}.`,
          emoji: b.emoji,
        });
      }

      // Padan pasangan setiap 3 soalan, jika bank menyediakannya.
      if (pairs && i % 3 === 2) {
        const picked = rng.sample(pairs, Math.min(3, pairs.length));
        return match({
          prefix,
          prompt: 'Padankan perkara berikut dengan pasangannya yang betul.',
          pairs: picked.map(([left, right]) => ({ left, right })),
          explanation: 'Setiap perkara ada pasangan yang betul dalam topik ini.',
          emoji: b.emoji,
        });
      }

      // Betul/salah setiap 5 soalan, jika bank menyediakannya.
      if (tfs && i % 5 === 4) {
        const [statement, isTrue] = tfs[i % tfs.length];
        return trueFalse({
          prefix,
          prompt: statement,
          isTrue,
          explanation: isTrue ? 'Pernyataan ini betul.' : 'Pernyataan ini salah.',
          emoji: b.emoji,
        });
      }

      // Isi tempat kosong setiap 3 soalan, supaya jawapan pendek diuji lain cara.
      if (i % 3 === 1 && f[1].length <= 22) {
        return fillBlank(rng, {
          prefix,
          prompt: `Lengkapkan: ${f[0]}`,
          answer: f[1],
          options: f[2],
          explanation: `${f[0]} Jawapannya: ${f[1]}.`,
          emoji: b.emoji,
        });
      }

      return mcq(rng, {
        prefix,
        prompt: f[0],
        answer: f[1],
        distractors: f[2],
        explanation: `${f[0]} Jawapannya: ${f[1]}.`,
        emoji: b.emoji,
        cols: 1,
      });
    });
  };
}

/** Bilangan topik yang ada penjana (untuk ujian). */
export const PI_BANK_COUNT = Object.keys(BANKS).length;

