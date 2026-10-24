/**
 * Katalog topik Pendidikan Islam (KSSR Semakan 2017).
 *
 * DSKP Pendidikan Islam membahagikan mata pelajaran kepada TUJUH bidang:
 * al-Quran, Hadis, Akidah, Ibadah, Sirah, Adab dan Jawi.
 *
 * Nota tentang skop bidang mengikut tahun:
 *  - Bidang Hadis hanya bermula Tahun 3, jadi Tahun 1 dan Tahun 2 tiada
 *    topik Hadis. Ini mengikut susunan DSKP, bukan kekurangan kandungan.
 *  - Tahun 1 memecahkan al-Quran kepada dua topik (Tilawah dan Hafazan)
 *    kerana murid Tahun 1 memulakan bacaan huruf hijaiyah dari kosong.
 *
 * Setiap topik merujuk penjana soalan dengan id yang sama seperti id topik.
 */

import type { Note, PiField, Topic, YearNum } from '../types';

const G = {
  memory: 'padan-ingatan',
  order: 'susun-cepat',
  speed: 'teka-cepat',
};

interface Spec {
  year: YearNum;
  field: PiField;
  code: string;
  title: string;
  emoji: string;
  summary: string;
  notes: Note[];
  /** Id surah hafazan bagi topik al-Quran (lihat `data/surah.ts`). */
  surahs?: string[];
}

/** Bina topik daripada spesifikasi ringkas supaya fail kekal mudah dibaca. */
function T(id: string, s: Spec): Topic {
  return {
    id,
    year: s.year,
    subject: 'pendidikan-islam',
    field: s.field,
    code: s.code,
    title: s.title,
    emoji: s.emoji,
    summary: s.summary,
    generator: id,
    games: [G.memory, G.order, G.speed],
    notes: s.notes,
    surahs: s.surahs,
  };
}

/* ==================================================================== */
/* TAHUN 1                                                              */
/* ==================================================================== */

const T1: Topic[] = [
  T('pi1-quran-tilawah', {
    year: 1,
    field: 'al-quran',
    code: '1.1',
    title: 'Mengenal Huruf Hijaiyah',
    emoji: '📖',
    summary: 'Mengenal, menyebut dan menulis huruf hijaiyah serta barisnya.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Huruf Hijaiyah?',
        body: 'Huruf hijaiyah ialah huruf Arab yang digunakan untuk menulis al-Quran. Bilangannya 28 huruf, bermula alif dan berakhir ya.',
        emojiRow: 'ا ب ت ث ج',
      },
      {
        kind: 'example',
        title: 'Baris Asas',
        bullets: [
          'Fathah ( َ ) — bunyi "a", contoh: بَ = ba',
          'Kasrah ( ِ ) — bunyi "i", contoh: بِ = bi',
          'Dhammah ( ُ ) — bunyi "u", contoh: بُ = bu',
        ],
        emojiRow: '◌َ ◌ِ ◌ُ',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Kita membaca al-Quran dari KANAN ke KIRI, bukan kiri ke kanan seperti tulisan Rumi.',
      },
    ],
  }),
  T('pi1-quran-hafazan', {
    year: 1,
    field: 'al-quran',
    code: '1.2',
    title: 'Hafazan Surah Al-Fatihah',
    emoji: '🕋',
    summary: 'Menghafaz surah al-Fatihah dan al-Ikhlas serta memahami maksudnya.',
    surahs: ['al-fatihah', 'al-ikhlas'],
    notes: [
      {
        kind: 'tip',
        title: 'Surah Al-Fatihah',
        body: 'Al-Fatihah bermaksud "Pembukaan". Ia surah pertama dalam al-Quran dan mempunyai 7 ayat.',
        emojiRow: '🕌 📖 ⭐',
      },
      {
        kind: 'example',
        title: 'Kenapa Perlu Hafal?',
        bullets: [
          'Al-Fatihah dibaca dalam setiap rakaat solat',
          'Ia disebut "Ummul Kitab" — ibu kepada al-Quran',
          'Membacanya ialah rukun dalam solat',
        ],
      },
      {
        kind: 'fun',
        title: 'Cara Mudah Menghafal',
        body: 'Baca satu ayat, ulang 3 kali, kemudian sambung ayat seterusnya. Ulang setiap hari supaya tidak lupa.',
      },
    ],
  }),
  T('pi1-akidah-rukun-iman', {
    year: 1,
    field: 'akidah',
    code: '2.1',
    title: 'Rukun Iman',
    emoji: '🤲',
    summary: 'Enam rukun iman dan maksud beriman kepada Allah.',
    notes: [
      {
        kind: 'tip',
        title: 'Enam Rukun Iman',
        bullets: [
          'Percaya kepada Allah',
          'Percaya kepada malaikat',
          'Percaya kepada kitab-kitab Allah',
          'Percaya kepada rasul-rasul Allah',
          'Percaya kepada hari kiamat',
          'Percaya kepada qada dan qadar',
        ],
        emojiRow: '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Rukun Iman ada 6, manakala Rukun Islam ada 5. Jangan keliru antara keduanya!',
      },
      {
        kind: 'example',
        title: 'Cara Mudah Mengingat',
        bullets: [
          'Allah — kita percaya Allah itu Satu',
          'Malaikat — makhluk Allah daripada cahaya',
          'Kitab — Zabur, Taurat, Injil dan al-Quran',
          'Rasul — pesuruh Allah kepada manusia',
          'Hari Kiamat — hari semua amalan dihitung',
          'Qada dan Qadar — ketentuan Allah',
        ],
        emojiRow: '✨ 📚 🕌',
      },
    ],
  }),
  T('pi1-ibadah-bersuci', {
    year: 1,
    field: 'ibadah',
    code: '3.1',
    title: 'Bersuci dan Istinjak',
    emoji: '💧',
    summary: 'Cara bersuci daripada najis dan adab di dalam tandas.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Bersuci?',
        body: 'Bersuci (taharah) bermaksud membersihkan diri daripada najis dan hadas supaya ibadah diterima Allah.',
      },
      {
        kind: 'example',
        title: 'Adab di Dalam Tandas',
        bullets: [
          'Masuk dengan kaki kanan, keluar dengan kaki kiri',
          'Jangan bercakap dan jangan bawa al-Quran',
          'Guna air atau batu untuk istinjak',
          'Basuh tangan dengan sabun selepas selesai',
        ],
        emojiRow: '🚪 🧼 💧',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Kebersihan sebahagian daripada iman. Nabi Muhammad SAW mengajar kita menjaga kebersihan setiap hari.',
      },
    ],
  }),
  T('pi1-sirah-kelahiran-nabi', {
    year: 1,
    field: 'sirah',
    code: '4.1',
    title: 'Kelahiran Nabi Muhammad',
    emoji: '🌙',
    summary: 'Kisah kelahiran Nabi Muhammad SAW dan keluarganya.',
    notes: [
      {
        kind: 'tip',
        title: 'Nabi Muhammad SAW',
        body: 'Nabi Muhammad SAW dilahirkan di Mekah pada 12 Rabiulawal, pada Tahun Gajah. Baginda ialah nabi terakhir.',
        emojiRow: '🌙 🕋 ⭐',
      },
      {
        kind: 'example',
        title: 'Keluarga Baginda',
        bullets: [
          'Ayah: Abdullah bin Abdul Muttalib',
          'Ibu: Aminah binti Wahab',
          'Datuk: Abdul Muttalib',
          'Bapa saudara: Abu Talib',
          'Ibu susuan: Halimah as-Saadiah',
        ],
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Ayah baginda meninggal sebelum baginda lahir, dan ibu baginda meninggal ketika baginda berumur 6 tahun. Baginda dibesarkan oleh datuk dan bapa saudaranya.',
      },
    ],
  }),
  T('pi1-adab-ibu-bapa', {
    year: 1,
    field: 'adab',
    code: '5.1',
    title: 'Adab Terhadap Ibu Bapa',
    emoji: '💛',
    summary: 'Cara menghormati dan menyayangi ibu bapa serta guru.',
    notes: [
      {
        kind: 'tip',
        title: 'Berbuat Baik kepada Ibu Bapa',
        body: 'Ibu bapa ialah orang yang paling berjasa kepada kita. Allah menyuruh kita berbuat baik kepada mereka.',
        emojiRow: '👩 👨 💛',
      },
      {
        kind: 'example',
        title: 'Cara Menghormati',
        bullets: [
          'Bercakap dengan suara yang lembut',
          'Cium tangan mereka',
          'Tolong mereka di rumah',
          'Jangan sekali-kali meninggikan suara',
          'Doakan mereka setiap hari',
        ],
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Rasulullah SAW bersabda bahawa keredhaan Allah terletak pada keredhaan ibu bapa.',
      },
    ],
  }),
  T('pi1-jawi-huruf', {
    year: 1,
    field: 'jawi',
    code: '6.1',
    title: 'Mengenal Huruf Jawi',
    emoji: '✍️',
    summary: 'Mengenal huruf Jawi tunggal dan menulis nama sendiri dalam Jawi.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Tulisan Jawi?',
        body: 'Tulisan Jawi ialah tulisan Arab yang disesuaikan untuk bahasa Melayu. Ia warisan budaya negara kita.',
        emojiRow: '✍️ 🇲🇾 📜',
      },
      {
        kind: 'example',
        title: 'Huruf Jawi Tambahan',
        bullets: [
          'چ — ca (cha)',
          'ݢ — ga',
          'ڠ — nga',
          'ﭪ — pa',
          'ڽ — nya',
          'ۏ — va',
        ],
        emojiRow: 'چ ݢ ڠ ﭪ ڽ ۏ',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Tulisan Jawi digunakan secara meluas di Malaysia suatu masa dahulu. Kini kita belajar Jawi untuk mengekalkan warisan ini.',
      },
    ],
  }),
];

/* ==================================================================== */
/* TAHUN 2                                                              */
/* ==================================================================== */

const T2: Topic[] = [
  T('pi2-quran-bacaan', {
    year: 2,
    field: 'al-quran',
    code: '1.1',
    title: 'Bacaan dan Hafazan Surah Pendek',
    emoji: '📖',
    summary: 'Membaca dan menghafaz surah al-Falaq dan an-Nas.',
    surahs: ['al-falaq', 'an-nas'],
    notes: [
      {
        kind: 'tip',
        title: 'Dua Surah Perlindungan',
        bullets: [
          'Al-Falaq — 5 ayat, memohon perlindungan daripada kejahatan makhluk',
          'An-Nas — 6 ayat, memohon perlindungan daripada gangguan syaitan dan manusia',
          'Kedua-duanya dipanggil "al-Mu\'awwizatain", iaitu dua surah perlindungan',
        ],
        emojiRow: '🌅 🛡️ 🌙',
      },
      {
        kind: 'example',
        title: 'Maksud Al-Falaq',
        body: 'Al-Falaq bermaksud "Waktu Subuh". Surah ini mengajar kita memohon perlindungan Allah daripada segala kejahatan.',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nabi Muhammad ﷺ membaca surah al-Falaq dan an-Nas sebelum tidur, lalu mengusap badan dengan tangan.',
      },
    ],
  }),
  T('pi2-akidah-rukun-islam', {
    year: 2,
    field: 'akidah',
    code: '2.1',
    title: 'Rukun Islam dan Kalimah Syahadah',
    emoji: '🕋',
    summary: 'Lima rukun Islam dan maksud dua kalimah syahadah.',
    notes: [
      {
        kind: 'tip',
        title: 'Lima Rukun Islam',
        bullets: [
          'Mengucap dua kalimah syahadah',
          'Mendirikan solat',
          'Menunaikan zakat',
          'Berpuasa di bulan Ramadan',
          'Menunaikan haji (jika mampu)',
        ],
        emojiRow: '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣',
      },
      {
        kind: 'example',
        title: 'Dua Kalimah Syahadah',
        body: 'Syahadah bermaksud pengakuan. Kita mengaku bahawa tiada tuhan melainkan Allah, dan Nabi Muhammad ialah pesuruh Allah.',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Mengucap syahadah ialah langkah pertama seseorang memeluk Islam.',
      },
    ],
  }),
  T('pi2-ibadah-wuduk-solat', {
    year: 2,
    field: 'ibadah',
    code: '3.1',
    title: 'Wuduk dan Solat',
    emoji: '💧',
    summary: 'Cara mengambil wuduk dan solat lima waktu.',
    notes: [
      {
        kind: 'tip',
        title: 'Rukun Wuduk',
        bullets: [
          'Niat',
          'Membasuh muka',
          'Membasuh kedua tangan hingga siku',
          'Menyapu sebahagian kepala',
          'Membasuh kedua kaki hingga buku lali',
          'Tertib (mengikut urutan)',
        ],
        emojiRow: '💧 🖐️ 🦶',
      },
      {
        kind: 'example',
        title: 'Solat Lima Waktu',
        bullets: [
          'Subuh — 2 rakaat',
          'Zohor — 4 rakaat',
          'Asar — 4 rakaat',
          'Maghrib — 3 rakaat',
          'Isyak — 4 rakaat',
        ],
        emojiRow: '🌅 ☀️ 🌇 🌃',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Solat ialah tiang agama. Sesiapa yang mendirikan solat, dia mendirikan agamanya.',
      },
    ],
  }),
  T('pi2-sirah-keluarga-nabi', {
    year: 2,
    field: 'sirah',
    code: '4.1',
    title: 'Keluarga Nabi Muhammad',
    emoji: '🌙',
    summary: 'Ibu susuan, bapa saudara dan sifat mulia Nabi Muhammad SAW.',
    notes: [
      {
        kind: 'tip',
        title: 'Masa Kecil Baginda',
        body: 'Nabi Muhammad SAW disusukan oleh Halimah as-Saadiah di perkampungan Bani Saad. Baginda membesar sebagai anak yatim.',
        emojiRow: '🌙 👶 🏜️',
      },
      {
        kind: 'example',
        title: 'Sifat Mulia Sejak Kecil',
        bullets: [
          'Jujur dan tidak pernah berbohong',
          'Amanah menjaga barang orang',
          'Suka menolong orang lain',
          'Disebut "Al-Amin" yang bermaksud yang dipercayai',
        ],
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Penduduk Mekah memanggil baginda "Al-Amin" sebelum baginda menjadi nabi, kerana baginda sangat jujur dan amanah.',
      },
    ],
  }),
  T('pi2-adab-harian', {
    year: 2,
    field: 'adab',
    code: '5.1',
    title: 'Adab Makan dan Tidur',
    emoji: '🍽️',
    summary: 'Adab makan, minum dan tidur mengikut sunnah Nabi.',
    notes: [
      {
        kind: 'tip',
        title: 'Adab Makan',
        bullets: [
          'Basuh tangan sebelum makan',
          'Baca "Bismillah" sebelum makan',
          'Makan dengan tangan kanan',
          'Jangan bercakap ketika mulut penuh',
          'Habiskan makanan, jangan membazir',
          'Baca "Alhamdulillah" selepas makan',
        ],
        emojiRow: '🍽️ 🤲 🚫',
      },
      {
        kind: 'example',
        title: 'Adab Sebelum Tidur',
        bullets: [
          'Bersihkan diri dan gosok gigi',
          'Baca doa sebelum tidur',
          'Tidur mengiring ke kanan',
          'Tutup lampu dan pastikan bilik bersih',
        ],
        emojiRow: '🛏️ 🌙 🤲',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Makan berlebihan tidak digalakkan dalam Islam. Nabi SAW mengajar kita berhenti makan sebelum terlalu kenyang.',
      },
    ],
  }),
  T('pi2-jawi-sambung', {
    year: 2,
    field: 'jawi',
    code: '6.1',
    title: 'Huruf Jawi Bersambung',
    emoji: '✍️',
    summary: 'Menyambung huruf Jawi dan membaca suku kata.',
    notes: [
      {
        kind: 'tip',
        title: 'Huruf Bersambung',
        body: 'Huruf Jawi bersambung antara satu sama lain. Ada huruf yang boleh bersambung di kedua-dua belah, ada yang hanya di sebelah kanan sahaja.',
        emojiRow: '✍️ 🔗 📜',
      },
      {
        kind: 'example',
        title: 'Contoh Suku Kata',
        bullets: [
          'با = ba',
          'بي = bi',
          'بو = bu',
          'ما = ma',
          'مي = mi',
          'مو = mu',
        ],
        emojiRow: 'با بي بو ما',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nama "Melayu" dalam Jawi ialah ملايو. Cuba tulis nama sendiri dalam Jawi!',
      },
    ],
  }),
];

export const PI_TOPICS_12: Topic[] = [...T1, ...T2];

/* ==================================================================== */
/* TAHUN 3 — Bidang Hadis bermula di sini (mengikut DSKP)               */
/* ==================================================================== */

const T3: Topic[] = [
  T('pi3-quran-tajwid', {
    year: 3,
    field: 'al-quran',
    code: '1.1',
    title: 'Bacaan Bertajwid',
    emoji: '📖',
    summary: 'Membaca al-Quran dengan tajwid asas dan menghafaz surah al-Kafirun serta al-Asr.',
    surahs: ['al-kafirun', 'al-asr'],
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Tajwid?',
        body: 'Tajwid bermaksud membaca al-Quran dengan betul mengikut hukum tertentu, termasuk panjang dan pendek bacaan.',
        emojiRow: '📖 🎵 ✅',
      },
      {
        kind: 'example',
        title: 'Hukum Nun Sakinah',
        bullets: [
          'Idgham — nun bertemu huruf ya, nun, mim, wau',
          'Ikhfa — nun bertemu 15 huruf lain',
          'Iqlab — nun bertemu huruf ba',
          'Izhar — nun bertemu huruf halqi',
        ],
        emojiRow: 'نْ',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Membaca al-Quran dengan tajwid ialah cara Nabi Muhammad SAW membacanya.',
      },
    ],
  }),
  T('pi3-hadis-kebersihan', {
    year: 3,
    field: 'hadis',
    code: '2.1',
    title: 'Hadis Kebersihan',
    emoji: '🗣️',
    summary: 'Hadis tentang kebersihan dan cara mengamalkannya.',
    notes: [
      {
        kind: 'tip',
        title: 'Hadis Tentang Kebersihan',
        body: 'Nabi Muhammad SAW bersabda bahawa kebersihan itu sebahagian daripada iman. Ini bermakna menjaga kebersihan ialah perintah agama.',
        emojiRow: '🧼 ✨ 🗣️',
      },
      {
        kind: 'example',
        title: 'Amalan Kebersihan',
        bullets: [
          'Mandikan badan sekurang-kurangnya sekali sehari',
          'Gosok gigi setiap hari',
          'Potong kuku supaya pendek dan bersih',
          'Pakai pakaian yang bersih dan wangi',
        ],
        emojiRow: '🪥 ✂️ 👕',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Bersiwak (memberus gigi dengan kayu siwak) ialah sunnah Nabi yang diamalkan sebelum solat.',
      },
    ],
  }),
  T('pi3-akidah-asmaul-husna', {
    year: 3,
    field: 'akidah',
    code: '3.1',
    title: 'Asmaul Husna',
    emoji: '🤲',
    summary: 'Nama-nama Allah yang indah dan maksudnya.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Asmaul Husna?',
        body: 'Asmaul Husna bermaksud nama-nama Allah yang paling indah. Bilangannya 99 nama.',
        emojiRow: '🤲 ✨ 9️⃣9️⃣',
      },
      {
        kind: 'example',
        title: 'Contoh Asmaul Husna',
        bullets: [
          'Ar-Rahman — Maha Pemurah',
          'Ar-Rahim — Maha Penyayang',
          'Al-Malik — Maha Raja',
          'As-Salam — Maha Sejahtera',
          'Al-Alim — Maha Mengetahui',
        ],
        emojiRow: '💚 👑 🕊️',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Sesiapa yang menghafaz 99 nama Allah akan masuk syurga. Mulakan dengan 5 nama dahulu, kemudian tambah sedikit-sedikit.',
      },
    ],
  }),
  T('pi3-ibadah-puasa', {
    year: 3,
    field: 'ibadah',
    code: '4.1',
    title: 'Puasa Ramadan',
    emoji: '🌙',
    summary: 'Rukun puasa, perkara membatalkan puasa dan hikmahnya.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Puasa?',
        body: 'Puasa bermaksud menahan diri daripada makan, minum dan perkara yang membatalkannya bermula fajar hingga terbenam matahari.',
        emojiRow: '🌅 🌙 🚫',
      },
      {
        kind: 'example',
        title: 'Perkara Membatalkan Puasa',
        bullets: [
          'Makan dan minum dengan sengaja',
          'Muntah dengan sengaja',
          'Merokok',
          'Haiz (bagi perempuan)',
        ],
        emojiRow: '🚫 🍽️ 💧',
      },
      {
        kind: 'fun',
        title: 'Hikmah Puasa',
        body: 'Puasa melatih kita bersabar, bersyukur dengan nikmat makanan, dan merasai kesusahan orang miskin.',
      },
    ],
  }),
  T('pi3-sirah-perniagaan', {
    year: 3,
    field: 'sirah',
    code: '5.1',
    title: 'Nabi Muhammad Berniaga',
    emoji: '🌙',
    summary: 'Kisah baginda berniaga dan sifat jujur dalam perniagaan.',
    notes: [
      {
        kind: 'tip',
        title: 'Perniagaan Baginda',
        body: 'Sejak kecil, Nabi Muhammad SAW belajar berniaga daripada bapa saudaranya Abu Talib. Baginda berniaga hingga ke Syam.',
        emojiRow: '🐪 🏜️ 📦',
      },
      {
        kind: 'example',
        title: 'Sifat Jujur dalam Perniagaan',
        bullets: [
          'Tidak menipu berat dan sukatan',
          'Menyatakan kecacatan barang dengan jujur',
          'Tidak menaikkan harga sesuka hati',
          'Menyimpan janji dengan pelanggan',
        ],
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Kerana kejujurannya, Siti Khadijah melantik baginda menguruskan perniagaannya. Kemudian baginda berkahwin dengan beliau.',
      },
    ],
  }),
  T('pi3-adab-jiran', {
    year: 3,
    field: 'adab',
    code: '6.1',
    title: 'Adab Terhadap Jiran dan Rakan',
    emoji: '💛',
    summary: 'Cara bergaul dengan jiran dan rakan secara beradab.',
    notes: [
      {
        kind: 'tip',
        title: 'Adab dengan Jiran',
        body: 'Jiran ialah orang yang tinggal berhampiran rumah kita. Islam mengajar kita menjaga hubungan baik dengan jiran.',
        emojiRow: '🏠 🤝 💛',
      },
      {
        kind: 'example',
        title: 'Cara Beradab',
        bullets: [
          'Beri salam apabila bertemu',
          'Jangan ganggu jiran dengan bunyi bising',
          'Bantu jiran yang dalam kesusahan',
          'Kongsi makanan dengan jiran',
          'Jangan mengumpat atau mengejek',
        ],
        emojiRow: '👋 🍲 🤝',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nabi SAW bersabda bahawa Jibril berulang kali berpesan tentang jiran, sehingga baginda menyangka jiran boleh mewarisi harta.',
      },
    ],
  }),
  T('pi3-jawi-ayat', {
    year: 3,
    field: 'jawi',
    code: '7.1',
    title: 'Menulis Ayat dalam Jawi',
    emoji: '✍️',
    summary: 'Menulis perkataan dan ayat pendek dalam tulisan Jawi.',
    notes: [
      {
        kind: 'tip',
        title: 'Menulis Ayat Jawi',
        body: 'Ayat Jawi ditulis dari kanan ke kiri. Setiap perkataan dipisahkan dengan sedikit ruang.',
        emojiRow: '✍️ 📜 ⬅️',
      },
      {
        kind: 'example',
        title: 'Contoh Perkataan Jawi',
        bullets: [
          'بوكو = buku',
          'سكول‌ه = sekolah',
          'ايم = emak (ibu)',
          'باڤ = bapa',
          'موريد = murid',
        ],
        emojiRow: 'بوكو سكوله',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Akhbar Utusan Melayu pernah diterbitkan sepenuhnya dalam tulisan Jawi.',
      },
    ],
  }),
];

export const PI_TOPICS_3: Topic[] = T3;

/* ==================================================================== */
/* TAHUN 4                                                              */
/* ==================================================================== */

const T4: Topic[] = [
  T('pi4-quran-hukum', {
    year: 4,
    field: 'al-quran',
    code: '1.1',
    title: 'Hukum Bacaan Nun dan Mim',
    emoji: '📖',
    summary: 'Hukum nun sakinah, tanwin dan mim sakinah serta hafazan surah al-Qariah.',
    surahs: ['al-qariah'],
    notes: [
      {
        kind: 'tip',
        title: 'Nun Sakinah dan Tanwin',
        body: 'Nun sakinah ialah nun yang tidak berbaris. Tanwin ialah baris dua di hujung perkataan. Kedua-duanya mempunyai hukum bacaan yang sama.',
        emojiRow: 'نْ ◌ً ◌ٍ ◌ٌ',
      },
      {
        kind: 'example',
        title: 'Hukum Mim Sakinah',
        bullets: [
          'Ikhfa syafawi — mim sakinah bertemu ba',
          'Idgham mimi — mim sakinah bertemu mim',
          'Izhar syafawi — mim sakinah bertemu huruf lain',
        ],
        emojiRow: 'مْ',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Membaca dengan tajwid yang betul mengelakkan salah makna. Kadang-kadang satu huruf sahaja boleh mengubah maksud ayat.',
      },
    ],
  }),
  T('pi4-hadis-niat', {
    year: 4,
    field: 'hadis',
    code: '2.1',
    title: 'Hadis Niat',
    emoji: '🗣️',
    summary: 'Hadis tentang niat dan kepentingannya dalam setiap amalan.',
    notes: [
      {
        kind: 'tip',
        title: 'Hadis Niat',
        body: 'Nabi SAW bersabda bahawa setiap amalan bergantung kepada niat. Ini bermakna niat menentukan sama ada amalan kita diterima atau tidak.',
        emojiRow: '💭 🗣️ ✨',
      },
      {
        kind: 'example',
        title: 'Contoh Niat yang Betul',
        bullets: [
          'Belajar kerana ingin menuntut ilmu Allah',
          'Menolong ibu bapa kerana taat kepada mereka',
          'Bersedekah kerana ingin menolong orang susah',
          'Solat kerana menunaikan perintah Allah',
        ],
        emojiRow: '📚 🤲 💛',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Dua orang boleh melakukan perkara yang sama, tetapi pahala berbeza kerana niat mereka berbeza.',
      },
    ],
  }),
  T('pi4-akidah-sifat-20', {
    year: 4,
    field: 'akidah',
    code: '3.1',
    title: 'Sifat 20 Allah',
    emoji: '🤲',
    summary: 'Pengenalan sifat 20 yang wajib bagi Allah.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Sifat 20?',
        body: 'Sifat 20 ialah sifat-sifat yang wajib ada pada Allah. Kita wajib mengetahui dan mempercayainya.',
        emojiRow: '🤲 ✨ 2️⃣0️⃣',
      },
      {
        kind: 'example',
        title: 'Contoh Sifat 20',
        bullets: [
          'Wujud — Allah itu ada',
          'Qidam — Allah itu sedia ada, tiada permulaan',
          'Baqa — Allah itu kekal, tiada kesudahan',
          'Mukhalafuhu lil hawadith — Allah tidak serupa dengan makhluk',
          'Qiyamuhu binafsihi — Allah berdiri dengan sendiri',
        ],
        emojiRow: '♾️ 🕊️ 👑',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Selain 20 sifat yang wajib, ada sifat mustahil (yang tidak mungkin ada pada Allah) dan sifat harus.',
      },
    ],
  }),
  T('pi4-ibadah-zakat', {
    year: 4,
    field: 'ibadah',
    code: '4.1',
    title: 'Zakat dan Sedekah',
    emoji: '🕋',
    summary: 'Jenis zakat, syarat wajib zakat dan kelebihan bersedekah.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Zakat?',
        body: 'Zakat bermaksud mengeluarkan sebahagian harta tertentu untuk diberikan kepada golongan yang berhak.',
        emojiRow: '💰 🤲 🕋',
      },
      {
        kind: 'example',
        title: 'Jenis Zakat',
        bullets: [
          'Zakat fitrah — dibayar sebelum solat Aidilfitri',
          'Zakat harta — daripada wang, emas dan perniagaan',
          'Zakat ternakan — daripada lembu, kambing dan unta',
          'Zakat tanaman — daripada padi dan buah-buahan',
        ],
        emojiRow: '🌾 🐄 💵',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Sedekah berbeza daripada zakat. Zakat wajib dengan kadar tertentu, manakala sedekah sukarela dan boleh bila-bila masa.',
      },
    ],
  }),
  T('pi4-sirah-hijrah', {
    year: 4,
    field: 'sirah',
    code: '5.1',
    title: 'Hijrah ke Madinah',
    emoji: '🌙',
    summary: 'Peristiwa hijrah Nabi Muhammad SAW dan pengajarannya.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Hijrah?',
        body: 'Hijrah bermaksud perpindahan Nabi Muhammad SAW dan para sahabat dari Mekah ke Madinah pada tahun 622 Masihi.',
        emojiRow: '🐪 🌙 🕋',
      },
      {
        kind: 'example',
        title: 'Kisah Hijrah',
        bullets: [
          'Baginda berhijrah bersama Abu Bakar as-Siddiq',
          'Bersembunyi di Gua Thur selama 3 hari',
          'Dikejar oleh orang Quraisy',
          'Disambut oleh penduduk Madinah (Ansar)',
          'Tahun hijrah menjadi permulaan kalendar Islam',
        ],
        emojiRow: '🕳️ 🐍 🤝',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Kalendar Hijrah bermula daripada peristiwa ini. Itulah sebabnya tahun Islam dipanggil Tahun Hijrah.',
      },
    ],
  }),
  T('pi4-adab-majlis', {
    year: 4,
    field: 'adab',
    code: '6.1',
    title: 'Adab Majlis dan Ilmu',
    emoji: '💛',
    summary: 'Adab di dalam majlis ilmu dan cara menuntut ilmu.',
    notes: [
      {
        kind: 'tip',
        title: 'Adab Menuntut Ilmu',
        body: 'Islam mengajar kita menuntut ilmu dengan adab yang baik, kerana ilmu yang berkat datang dengan adab yang baik.',
        emojiRow: '📚 💛 🤲',
      },
      {
        kind: 'example',
        title: 'Adab dalam Majlis Ilmu',
        bullets: [
          'Beri salam sebelum masuk',
          'Duduk dengan sopan',
          'Dengar dengan teliti',
          'Angkat tangan sebelum bertanya',
          'Jangan bercakap ketika guru mengajar',
          'Hormati guru dan rakan sekelas',
        ],
        emojiRow: '🤚 👂 ✋',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Menuntut ilmu ialah kewajipan setiap Muslim lelaki dan perempuan, dari kecil hingga akhir hayat.',
      },
    ],
  }),
  T('pi4-jawi-imlak', {
    year: 4,
    field: 'jawi',
    code: '7.1',
    title: 'Imlak dan Ejaan Jawi',
    emoji: '✍️',
    summary: 'Menulis imlak dan mengeja perkataan Jawi dengan betul.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Imlak?',
        body: 'Imlak bermaksud menulis apa yang didengar. Guru membaca, murid menulis dalam Jawi.',
        emojiRow: '✍️ 👂 📜',
      },
      {
        kind: 'example',
        title: 'Kata Pinjaman dalam Jawi',
        bullets: [
          'کومڤيوتر = komputer',
          'تيليۏيشن = televisyen',
          'سايانس = sains',
          'ماتماتيک = matematik',
        ],
        emojiRow: '💻 📺 🔬',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Kata pinjaman Inggeris ditulis dalam Jawi dengan mengekalkan bunyi sebutannya.',
      },
    ],
  }),
];

export const PI_TOPICS_4: Topic[] = T4;

/* ==================================================================== */
/* TAHUN 5                                                              */
/* ==================================================================== */

const T5: Topic[] = [
  T('pi5-quran-mad', {
    year: 5,
    field: 'al-quran',
    code: '1.1',
    title: 'Hukum Mad',
    emoji: '📖',
    summary: 'Jenis-jenis mad dan kadar panjang bacaan serta hafazan surah al-Qadr.',
    surahs: ['al-qadr'],
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Mad?',
        body: 'Mad bermaksud memanjangkan bacaan. Panjangnya diukur dengan harakat — 2, 4 atau 6 harakat.',
        emojiRow: '📖 ➡️ 🎵',
      },
      {
        kind: 'example',
        title: 'Jenis Mad',
        bullets: [
          'Mad Asli (Tabii) — 2 harakat, paling asas',
          'Mad Wajib Muttasil — 4 atau 5 harakat',
          'Mad Jaiz Munfasil — 4 atau 5 harakat',
          'Mad Lazim — 6 harakat',
        ],
        emojiRow: '2️⃣ 4️⃣ 6️⃣',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Mad Asli ialah mad yang paling kerap dalam al-Quran. Kalau tersalah panjang, makna ayat boleh berubah.',
      },
    ],
  }),
  T('pi5-hadis-amanah', {
    year: 5,
    field: 'hadis',
    code: '2.1',
    title: 'Hadis Amanah',
    emoji: '🗣️',
    summary: 'Hadis tentang amanah dan tanda-tanda orang munafik.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Amanah?',
        body: 'Amanah bermaksud boleh dipercayai dalam menjaga sesuatu yang dipertanggungjawabkan kepada kita.',
        emojiRow: '🤝 🔒 ✨',
      },
      {
        kind: 'example',
        title: 'Tanda Orang Munafik',
        bullets: [
          'Apabila bercakap, dia berdusta',
          'Apabila berjanji, dia mungkir',
          'Apabila diberi amanah, dia khianat',
        ],
        emojiRow: '⚠️ 🚫 💔',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Sifat amanah membuatkan orang lain yakin kepada kita. Nabi SAW digelar Al-Amin kerana sifat ini.',
      },
    ],
  }),
  T('pi5-akidah-penyelewengan', {
    year: 5,
    field: 'akidah',
    code: '3.1',
    title: 'Menjauhi Penyelewengan Akidah',
    emoji: '🤲',
    summary: 'Perkara yang merosakkan akidah dan cara menjauhinya.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Penyelewengan Akidah?',
        body: 'Penyelewengan akidah ialah kepercayaan yang bercanggah dengan ajaran Islam, seperti mensyirikkan Allah.',
        emojiRow: '⚠️ 🤲 🚫',
      },
      {
        kind: 'example',
        title: 'Perkara Merosakkan Akidah',
        bullets: [
          'Syirik — menyekutukan Allah dengan sesuatu',
          'Percaya kepada ramalan nasib dan bomoh',
          'Menyembah berhala atau benda keramat',
          'Meninggalkan solat dengan sengaja',
          'Mempercayai kepercayaan karut',
        ],
        emojiRow: '🔮 🗿 ⛔',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Syirik ialah dosa yang paling besar dalam Islam kerana ia merosakkan asas keimanan kita kepada Allah.',
      },
    ],
  }),
  T('pi5-ibadah-haji-umrah', {
    year: 5,
    field: 'ibadah',
    code: '4.1',
    title: 'Haji dan Umrah',
    emoji: '🕋',
    summary: 'Rukun haji, rukun umrah dan perbezaannya.',
    notes: [
      {
        kind: 'tip',
        title: 'Haji dan Umrah',
        body: 'Haji ialah rukun Islam kelima, wajib sekali seumur hidup bagi yang mampu. Umrah boleh dilakukan bila-bila masa.',
        emojiRow: '🕋 🐑 ✈️',
      },
      {
        kind: 'example',
        title: 'Rukun Haji',
        bullets: [
          'Ihram — niat dan memakai pakaian ihram',
          'Wukuf di Arafah',
          'Tawaf — mengelilingi Kaabah 7 kali',
          'Sai — berjalan antara Safa dan Marwah',
          'Bercukur atau bergunting',
          'Tertib mengikut urutan',
        ],
        emojiRow: '🕋 ⛰️ 🔄',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Semua jemaah haji memakai pakaian yang sama. Ini melambangkan kesamarataan — kaya dan miskin tidak dapat dibezakan.',
      },
    ],
  }),
  T('pi5-sirah-madinah', {
    year: 5,
    field: 'sirah',
    code: '5.1',
    title: 'Nabi Muhammad di Madinah',
    emoji: '🌙',
    summary: 'Pembinaan masyarakat Madinah dan Piagam Madinah.',
    notes: [
      {
        kind: 'tip',
        title: 'Membina Masyarakat Madinah',
        body: 'Selepas hijrah, Nabi Muhammad SAW membina masyarakat baru di Madinah berdasarkan keadilan dan perpaduan.',
        emojiRow: '🕌 🤝 🏘️',
      },
      {
        kind: 'example',
        title: 'Usaha Baginda',
        bullets: [
          'Membina Masjid Nabawi',
          'Mempersaudarakan Muhajirin dan Ansar',
          'Menulis Piagam Madinah',
          'Memastikan keadilan untuk semua penduduk',
        ],
        emojiRow: '🕌 📜 ⚖️',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Piagam Madinah dianggap antara dokumen bertulis terawal yang menjamin hak setiap kumpulan dalam sebuah negara.',
      },
    ],
  }),
  T('pi5-adab-alam', {
    year: 5,
    field: 'adab',
    code: '6.1',
    title: 'Adab Terhadap Alam Sekitar',
    emoji: '🌿',
    summary: 'Tanggungjawab menjaga alam dan kebersihan persekitaran.',
    notes: [
      {
        kind: 'tip',
        title: 'Menjaga Alam',
        body: 'Alam ialah amanah daripada Allah. Manusia dilantik sebagai khalifah yang bertanggungjawab menjaganya.',
        emojiRow: '🌍 🌱 💚',
      },
      {
        kind: 'example',
        title: 'Amalan Menjaga Alam',
        bullets: [
          'Jangan buang sampah merata-rata',
          'Tanam pokok dan sayangi tumbuhan',
          'Hemat air dan elektrik',
          'Sayangi haiwan, jangan menyeksanya',
          'Kitar semula bahan yang boleh digunakan lagi',
        ],
        emojiRow: '♻️ 💧 🌳',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nabi SAW melarang membazir air walaupun ketika berwuduk di sungai. Membazir itu dilarang dalam Islam.',
      },
    ],
  }),
  T('pi5-jawi-khat', {
    year: 5,
    field: 'jawi',
    code: '7.1',
    title: 'Jawi dan Khat',
    emoji: '✍️',
    summary: 'Kemahiran menulis Jawi dan mengenal tulisan khat.',
    notes: [
      {
        kind: 'tip',
        title: 'Tulisan Khat',
        body: 'Khat ialah seni tulisan Arab yang indah. Tulisan Jawi berasal daripada tulisan Arab.',
        emojiRow: '✍️ 🎨 📜',
      },
      {
        kind: 'example',
        title: 'Jenis Khat',
        bullets: [
          'Khat Nasakh — paling biasa dalam buku',
          'Khat Thuluth — untuk hiasan dan tajuk',
          'Khat Riqah — tulisan kecil dan cepat',
          'Khat Kufi — tulisan geometri, banyak pada seni bina',
        ],
        emojiRow: '🕌 🖋️ 🎨',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Batu bersurat Terengganu yang berusia lebih 700 tahun ditulis dalam tulisan Jawi.',
      },
    ],
  }),
];

export const PI_TOPICS_5: Topic[] = T5;

/* ==================================================================== */
/* TAHUN 6                                                              */
/* ==================================================================== */

const T6: Topic[] = [
  T('pi6-quran-waqaf', {
    year: 6,
    field: 'al-quran',
    code: '1.1',
    title: 'Tanda Waqaf',
    emoji: '📖',
    summary: 'Tanda-tanda berhenti dalam bacaan al-Quran serta hafazan surah ad-Dhuha.',
    surahs: ['ad-dhuha'],
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Waqaf?',
        body: 'Waqaf bermaksud berhenti ketika membaca al-Quran. Tanda waqaf membantu kita berhenti di tempat yang betul.',
        emojiRow: '📖 ⏸️ ✅',
      },
      {
        kind: 'example',
        title: 'Tanda Waqaf Penting',
        bullets: [
          'مـ — wajib berhenti',
          'لا — tidak boleh berhenti',
          'ج — harus berhenti atau terus',
          'قلى — lebih baik berhenti',
          'صلى — lebih baik terus',
        ],
        emojiRow: '⏸️ ▶️ ⚠️',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Berhenti di tempat yang salah boleh mengubah maksud ayat. Itulah sebabnya waqaf sangat penting dalam tajwid.',
      },
    ],
  }),
  T('pi6-hadis-nikmat', {
    year: 6,
    field: 'hadis',
    code: '2.1',
    title: 'Hadis Menghargai Nikmat',
    emoji: '🗣️',
    summary: 'Hadis tentang kesihatan dan masa sebagai nikmat.',
    notes: [
      {
        kind: 'tip',
        title: 'Dua Nikmat yang Sering Dilupakan',
        body: 'Nabi SAW bersabda bahawa ramai manusia rugi kerana tidak menghargai dua nikmat: kesihatan dan masa lapang.',
        emojiRow: '💪 ⏰ 🗣️',
      },
      {
        kind: 'example',
        title: 'Cara Menghargai Nikmat',
        bullets: [
          'Jaga kesihatan dengan bersenam',
          'Makan makanan yang berkhasiat',
          'Gunakan masa untuk belajar',
          'Jangan buang masa dengan perkara sia-sia',
          'Bersyukur dengan apa yang ada',
        ],
        emojiRow: '🏃 🥗 📚',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Masa yang berlalu tidak boleh kembali. Itulah sebabnya Islam mengajar kita menghargai setiap detik.',
      },
    ],
  }),
  T('pi6-akidah-istiqamah', {
    year: 6,
    field: 'akidah',
    code: '3.1',
    title: 'Istiqamah dalam Ibadah',
    emoji: '🤲',
    summary: 'Bersikap istiqamah dan memperbaiki amalan berterusan.',
    notes: [
      {
        kind: 'tip',
        title: 'Apa Itu Istiqamah?',
        body: 'Istiqamah bermaksud berterusan dan teguh dalam melakukan kebaikan, walaupun sedikit tetapi tetap.',
        emojiRow: '🤲 ♾️ 💚',
      },
      {
        kind: 'example',
        title: 'Cara Beristiqamah',
        bullets: [
          'Solat lima waktu tanpa tinggal',
          'Baca al-Quran setiap hari walaupun sedikit',
          'Berbuat baik kepada semua orang',
          'Jauhi perkara yang dilarang',
          'Bersabar apabila menghadapi ujian',
        ],
        emojiRow: '🕌 📖 💪',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nabi SAW mengajar bahawa amalan yang sedikit tetapi berterusan lebih disukai Allah daripada amalan banyak yang kemudian berhenti.',
      },
    ],
  }),
  T('pi6-ibadah-fardhu', {
    year: 6,
    field: 'ibadah',
    code: '4.1',
    title: 'Fardhu Ain dan Fardhu Kifayah',
    emoji: '🕋',
    summary: 'Perbezaan fardhu ain dan fardhu kifayah serta contohnya.',
    notes: [
      {
        kind: 'tip',
        title: 'Fardhu Ain',
        body: 'Fardhu ain ialah kewajipan yang mesti dilakukan oleh SETIAP individu Muslim. Contohnya solat dan puasa.',
        emojiRow: '👤 ✅ 🕌',
      },
      {
        kind: 'example',
        title: 'Perbandingan',
        bullets: [
          'Fardhu ain: solat, puasa, menutup aurat',
          'Fardhu kifayah: solat jenazah, ilmu perubatan, ilmu agama',
          'Fardhu ain — setiap orang bertanggungjawab sendiri',
          'Fardhu kifayah — jika sebahagian melakukannya, yang lain terlepas',
        ],
        emojiRow: '👤 👥 ⚖️',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Menuntut ilmu agama ialah fardhu ain, manakala ilmu perubatan dan kejuruteraan ialah fardhu kifayah.',
      },
    ],
  }),
  T('pi6-sirah-khalifah', {
    year: 6,
    field: 'sirah',
    code: '5.1',
    title: 'Khulafa al-Rasyidin',
    emoji: '🌙',
    summary: 'Empat khalifah selepas Nabi Muhammad SAW.',
    notes: [
      {
        kind: 'tip',
        title: 'Empat Khalifah',
        bullets: [
          'Abu Bakar as-Siddiq',
          'Umar bin al-Khattab',
          'Uthman bin Affan',
          'Ali bin Abi Talib',
        ],
        emojiRow: '4️⃣ 👑 🤝',
      },
      {
        kind: 'example',
        title: 'Jasa Mereka',
        bullets: [
          'Abu Bakar — menyatukan umat selepas kewafatan Nabi',
          'Umar — meluaskan wilayah Islam dan menubuhkan pentadbiran',
          'Uthman — membukukan al-Quran dalam satu mushaf',
          'Ali — terkenal dengan keberanian dan ilmu',
        ],
        emojiRow: '📜 ⚖️ 📖',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Khulafa al-Rasyidin bermaksud "khalifah yang mendapat petunjuk". Mereka memerintah selama kira-kira 30 tahun.',
      },
    ],
  }),
  T('pi6-adab-sosial', {
    year: 6,
    field: 'adab',
    code: '6.1',
    title: 'Adab Kehidupan Bersosial',
    emoji: '💛',
    summary: 'Adab dalam masyarakat, jual beli dan hubungan sosial.',
    notes: [
      {
        kind: 'tip',
        title: 'Adab Bermasyarakat',
        body: 'Islam mengajar kita menjaga hubungan baik dengan semua orang, tanpa mengira bangsa atau agama.',
        emojiRow: '🤝 🌍 💛',
      },
      {
        kind: 'example',
        title: 'Adab dalam Jual Beli',
        bullets: [
          'Jujur tentang keadaan barang',
          'Jangan menipu timbangan',
          'Tunaikan janji dengan pelanggan',
          'Jangan menaikkan harga secara tidak adil',
          'Bersikap lembut dan sopan',
        ],
        emojiRow: '⚖️ 🤝 💰',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nabi SAW seorang peniaga yang jujur. Baginda mengajar bahawa peniaga yang jujur akan bersama para nabi di akhirat.',
      },
    ],
  }),
  T('pi6-jawi-warisan', {
    year: 6,
    field: 'jawi',
    code: '7.1',
    title: 'Jawi sebagai Warisan',
    emoji: '✍️',
    summary: 'Tulisan Jawi sebagai warisan budaya dan penggunaannya.',
    notes: [
      {
        kind: 'tip',
        title: 'Warisan Budaya',
        body: 'Tulisan Jawi ialah warisan budaya bangsa Malaysia. Ia digunakan dalam dokumen rasmi sejak berabad lamanya.',
        emojiRow: '✍️ 🇲🇾 📜',
      },
      {
        kind: 'example',
        title: 'Bukti Penggunaan Jawi',
        bullets: [
          'Batu Bersurat Terengganu (1303 Masihi)',
          'Surat-surat Sultan Melayu',
          'Akhbar Utusan Melayu',
          'Wang kertas Malaysia memaparkan tulisan Jawi',
        ],
        emojiRow: '🪨 ✉️ 💵',
      },
      {
        kind: 'fun',
        title: 'Tahukah Kamu?',
        body: 'Nama "Malaysia" dalam Jawi ialah مليسيا. Wang kertas Ringgit Malaysia juga memaparkan tulisan Jawi.',
      },
    ],
  }),
];

export const PI_TOPICS_6: Topic[] = T6;

/** Semua topik Pendidikan Islam Tahun 1 hingga 6. */
export const PI_TOPICS: Topic[] = [
  ...T1,
  ...T2,
  ...T3,
  ...T4,
  ...T5,
  ...T6,
];
