/**
 * Penjana latihan Sejarah (KSSR Semakan 2017).
 * Sejarah ialah mata pelajaran teras bermula Tahun 4.
 * Tema: Tahun 4 Sejarah Awal Negara, Tahun 5 Kedaulatan Negara,
 * Tahun 6 Kemakmuran Negara Kita.
 */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { fill, fillBlank, match, mcq, order, trueFalse } from './shared';
import { SJ_EXTRA_FACTS } from './sejarah-extra';

/* ------------------------------------------------------------------ */
/* Tahun 4 — Sejarah Awal Negara                                       */
/* ------------------------------------------------------------------ */

function sj4MariBelajarSejarah(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah maksud sejarah?', 'Kajian tentang peristiwa masa lalu manusia', ['Cerita rekaan masa depan', 'Kajian tentang tumbuhan', 'Kajian tentang cuaca']],
    ['Apakah sumber primer dalam sejarah?', 'Sumber asli daripada zaman peristiwa berlaku', ['Buku teks moden', 'Cerita dongeng', 'Filem rekaan']],
    ['Apakah contoh sumber sekunder?', 'Buku sejarah dan majalah', ['Artifak asli', 'Batu bersurat', 'Fosil']],
    ['Mengapakah kita perlu belajar sejarah?', 'Untuk mengambil iktibar dan menghargai masa lalu', ['Untuk menambah kerja rumah', 'Kerana ia membosankan', 'Untuk bermain']],
    ['Apakah maksud kronologi?', 'Susunan peristiwa mengikut urutan masa', ['Cerita berselindung', 'Peta negara', 'Senarai nama']],
    ...(SJ_EXTRA_FACTS['sj4-mari-belajar-sejarah'] ?? []),
  ];
  const skills = [
    { t: 'Mengenal pasti sumber sejarah', d: 'Mengetahui jenis sumber primer dan sekunder' },
    { t: 'Membuat kronologi', d: 'Menyusun peristiwa mengikut masa' },
    { t: 'Membandingkan', d: 'Mencari persamaan dan perbezaan peristiwa' },
    { t: 'Membuat inferens', d: 'Membuat kesimpulan daripada bukti' },
  ];
  return fill(count, (i) => {
    const mode = i % 2;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj4-mari',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `${q[0]} Jawapannya: ${q[1]}.`,
        emoji: '📜',
        cols: 1,
        speak: q[0],
      });
    }
    const picked = rng.sample(skills, 3);
    return match({
      prefix: 'sj4-mari',
      prompt: 'Padankan kemahiran sejarah dengan maksudnya.',
      pairs: picked.map((s) => ({ left: s.t, right: s.d })),
      explanation: 'Kemahiran sejarah membantu kita memahami peristiwa masa lalu.',
      emoji: '🔎',
    });
  });
}

function sj4ZamanAirBatu(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah ciri utama Zaman Air Batu?', 'Suhu Bumi sangat sejuk dan sebahagian besar ditutupi ais', ['Suhu sangat panas', 'Tiada air di Bumi', 'Tiada manusia sama sekali']],
    ['Apakah yang berlaku apabila suhu Bumi meningkat pada akhir Zaman Air Batu?', 'Ais mencair dan membentuk laut serta pulau', ['Ais bertambah tebal', 'Bumi menjadi gelap', 'Tumbuhan hilang terus']],
    ['Apakah kesan pencairan ais pada akhir Zaman Air Batu?', 'Terbentuknya laut dan pemisahan pulau-pulau', ['Terbentuknya gurun sahaja', 'Tiada kesan', 'Semua manusia hilang']],
    ['Apakah bukti Zaman Air Batu di Asia Tenggara?', 'Kesan perubahan aras laut dan bentuk muka bumi', ['Piramid', 'Tembok besar', 'Kota moden']],
    ...(SJ_EXTRA_FACTS['sj4-zaman-air-batu'] ?? []),
  ];
  return fill(count, (i) => {
    const mode = i % 2;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj4-ais',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🧊',
        cols: 1,
        speak: q[0],
      });
    }
    return trueFalse({
      prefix: 'sj4-ais',
      prompt: 'Zaman Air Batu berlaku sebelum kemunculan tamadun manusia moden.',
      isTrue: true,
      explanation: 'Betul! Zaman Air Batu berlaku beribu-ribu tahun dahulu sebelum tamadun moden.',
      emoji: '🌍',
    });
  });
}

function sj4ZamanPrasejarah(_y: number, rng: Rng, count: number): Question[] {
  const stages = [
    { t: 'Zaman Paleolitik', d: 'Menggunakan alat batu kasar dan memburu', e: '🪨' },
    { t: 'Zaman Mesolitik', d: 'Menggunakan alat batu sederhana halus', e: '🔨' },
    { t: 'Zaman Neolitik', d: 'Bercucuk tanam dan menternak haiwan', e: '🌾' },
    { t: 'Zaman Logam', d: 'Menggunakan alat logam dan menjalankan perdagangan', e: '⚒️' },
  ];
  const sites: [string, string][] = [
    ['Lembah Lenggong, Perak', 'Tapak arkeologi Zaman Paleolitik di Malaysia'],
    ['Niah, Sarawak', 'Tapak prasejarah penting di Sarawak'],
    ['Kota Tampan, Perak', 'Tempat penemuan alat batu zaman prasejarah'],
    ['Bukit Jawa', 'Tapak arkeologi dengan alat batu berusia lebih kurang 100,000 tahun'],
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const s = rng.pick(stages);
      return mcq(rng, {
        prefix: 'sj4-prasejarah',
        prompt: `${s.e} Apakah ciri ${s.t.toLowerCase()}?`,
        answer: s.d,
        distractors: stages.filter((x) => x.t !== s.t).map((x) => x.d),
        explanation: `${s.t}: ${s.d.toLowerCase()}.`,
        emoji: '🦴',
        cols: 1,
        speak: `Apakah ciri ${s.t}?`,
      });
    }
    if (mode === 1) {
      return order({
        prefix: 'sj4-prasejarah',
        prompt: 'Susun peringkat Zaman Prasejarah mengikut urutan yang betul.',
        items: rng.shuffle(stages.map((s) => s.t)),
        correctOrder: stages.map((s) => s.t),
        explanation: `Urutan: ${stages.map((s) => s.t).join(' → ')}.`,
        emoji: '⏳',
      });
    }
    const picked = rng.sample(sites, 3);
    return match({
      prefix: 'sj4-prasejarah',
      prompt: 'Padankan tapak arkeologi dengan keterangannya.',
      pairs: picked.map((s) => ({ left: s[0], right: s[1] })),
      explanation: 'Tapak arkeologi di Malaysia menyimpan bukti kehidupan prasejarah.',
      emoji: '🗺️',
    });
  });
}

function sj4KerajaanMelayuAwal(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah kerajaan Melayu Awal yang terkenal?', 'Kedah Tua', ['Melaka', 'Johor', 'Kuala Lumpur']],
    ['Apakah bentuk hubungan diplomatik kerajaan Melayu Awal?', 'Menghantar utusan dan hadiah kepada kerajaan lain', ['Berperang sentiasa', 'Tidak berhubung dengan sesiapa', 'Menutup semua pelabuhan']],
    ['Apakah kegiatan ekonomi utama kerajaan Melayu Awal?', 'Perdagangan di pelabuhan dan pertanian', ['Perlombongan emas sahaja', 'Industri moden', 'Pelancongan']],
    ['Mengapakah hubungan diplomatik penting?', 'Untuk menjamin keamanan dan melancarkan perdagangan', ['Untuk menambah masalah', 'Untuk menghentikan perdagangan', 'Untuk menghalang pelabuhan']],
    ...(SJ_EXTRA_FACTS['sj4-kerajaan-melayu-awal'] ?? []),
  ];
  const kingdoms = [
    { t: 'Kedah Tua', loc: 'Kedah, Malaysia', d: 'Kerajaan Melayu awal di utara Semenanjung' },
    { t: 'Srivijaya', loc: 'Sumatera', d: 'Kerajaan maritim yang menguasai Selat Melaka' },
    { t: 'Majapahit', loc: 'Jawa', d: 'Kerajaan besar di Jawa' },
    { t: 'Gangga Negara', loc: 'Perak', d: 'Kerajaan Melayu awal di Perak' },
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj4-kerajaan',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '👑',
        cols: 1,
        speak: q[0],
      });
    }
    if (mode === 1) {
      const k = rng.pick(kingdoms);
      return mcq(rng, {
        prefix: 'sj4-kerajaan',
        prompt: `Di manakah terletaknya ${k.t}?`,
        answer: k.loc,
        distractors: kingdoms.filter((x) => x.t !== k.t).map((x) => x.loc),
        explanation: `${k.t} terletak di ${k.loc}. ${k.d}.`,
        emoji: '🗺️',
        cols: 2,
        speak: `Di manakah ${k.t}?`,
      });
    }
    const picked = rng.sample(kingdoms, 3);
    return match({
      prefix: 'sj4-kerajaan',
      prompt: 'Padankan kerajaan Melayu Awal dengan lokasinya.',
      pairs: picked.map((k) => ({ left: k.t, right: k.loc })),
      explanation: 'Kerajaan Melayu Awal tersebar di Kepulauan Melayu.',
      emoji: '📍',
    });
  });
}

function sj4KesultananMelayuMelaka(_y: number, rng: Rng, count: number): Question[] {
  const figures = [
    { t: 'Parameswara', role: 'Pengasas Kesultanan Melayu Melaka' },
    { t: 'Tun Perak', role: 'Bendahara Melaka yang bijaksana' },
    { t: 'Hang Tuah', role: 'Laksamana Melaka yang gagah berani' },
  ];
  const facts: [string, string, string[]][] = [
    ['Siapakah pengasas Kesultanan Melayu Melaka?', 'Parameswara', ['Tun Perak', 'Hang Tuah', 'Sultan Iskandar']],
    ['Apakah jawatan Tun Perak dalam Kesultanan Melayu Melaka?', 'Bendahara', ['Laksamana', 'Penghulu', 'Temenggung']],
    ['Apakah jawatan Hang Tuah dalam Kesultanan Melayu Melaka?', 'Laksamana', ['Bendahara', 'Sultan', 'Penghulu']],
    ['Mengapakah Melaka menjadi pusat perdagangan yang terkenal?', 'Kedudukannya strategik di Selat Melaka', ['Kerana cuacanya sejuk', 'Kerana tiada penduduk', 'Kerana jauh dari laut']],
    ...(SJ_EXTRA_FACTS['sj4-kesultanan-melaka'] ?? []),
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj4-melaka',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🏰',
        cols: 1,
        speak: q[0],
      });
    }
    if (mode === 1) {
      const picked = rng.sample(figures, 3);
      return match({
        prefix: 'sj4-melaka',
        prompt: 'Padankan tokoh Kesultanan Melayu Melaka dengan jawatannya.',
        pairs: picked.map((f) => ({ left: f.t, right: f.role })),
        explanation: 'Setiap tokoh mempunyai peranan penting dalam Kesultanan Melayu Melaka.',
        emoji: '🎖️',
      });
    }
    const f = rng.pick(figures);
    return mcq(rng, {
      prefix: 'sj4-melaka',
      prompt: `Apakah peranan utama ${f.t}?`,
      answer: f.role,
      distractors: figures.filter((x) => x.t !== f.t).map((x) => x.role),
      explanation: `${f.t} ialah ${f.role.toLowerCase()}.`,
      emoji: '⚔️',
      cols: 1,
      speak: `Apakah peranan ${f.t}?`,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 5 — Kedaulatan Negara                                         */
/* ------------------------------------------------------------------ */

function sj5InstitusiRaja(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah maksud daulat?', 'Kekuasaan dan kewibawaan raja', ['Kekayaan raja', 'Kebijaksanaan menteri', 'Kekuatan tentera']],
    ['Apakah maksud derhaka?', 'Menderhaka kepada raja', ['Taat kepada raja', 'Menolong raja', 'Menghormati raja']],
    ['Apakah kedudukan raja pada masa kini?', 'Ketua negeri dan simbol perpaduan', ['Ketua kerajaan persekutuan', 'Ketua parti politik', 'Ketua tentera']],
    ['Negara manakah di Asia yang masih mengamalkan sistem beraja?', 'Thailand', ['Indonesia', 'Filipina', 'Vietnam']],
    ...(SJ_EXTRA_FACTS['sj5-institusi-raja'] ?? []),
  ];
  const monarchStates = [
    'Johor', 'Kedah', 'Kelantan', 'Pahang', 'Perak', 'Selangor', 'Terengganu', 'Negeri Sembilan', 'Perlis',
  ];
  return fill(count, (i) => {
    const mode = i % 2;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj5-raja',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '👑',
        cols: 1,
        speak: q[0],
      });
    }
    const picked = rng.sample(monarchStates, 3);
    return mcq(rng, {
      prefix: 'sj5-raja',
      prompt: 'Negeri manakah yang TIDAK mempunyai raja atau sultan?',
      answer: 'Melaka',
      distractors: picked,
      explanation: 'Melaka, Pulau Pinang, Sabah dan Sarawak tidak mempunyai raja atau sultan. Ketua negeri mereka ialah Yang di-Pertua Negeri.',
      emoji: '🏛️',
      cols: 2,
    });
  });
}

function sj5AgamaIslam(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah agama Persekutuan Malaysia?', 'Islam', ['Kristian', 'Buddha', 'Hindu']],
    ['Bagaimanakah Islam tersebar di Tanah Melayu?', 'Melalui pedagang dan pendakwah', ['Melalui peperangan sahaja', 'Melalui penjajahan Eropah', 'Melalui filem']],
    ['Apakah bukti arkeologi kedatangan Islam?', 'Batu bersurat Terengganu', ['Candi Borobudur', 'Tembok China', 'Piramid Mesir']],
    ['Apakah peranan agama Islam dalam pembentukan perpaduan?', 'Menggalakkan persaudaraan dan kebaikan', ['Menyebabkan perpecahan', 'Menghalang perdagangan', 'Mengurangkan penduduk']],
    ...(SJ_EXTRA_FACTS['sj5-agama-islam'] ?? []),
  ];
  return fill(count, (i) => {
    const q = rng.pick(facts);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'sj5-islam',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🕌',
        cols: 1,
        speak: q[0],
      });
    }
    return trueFalse({
      prefix: 'sj5-islam',
      prompt: 'Islam ialah agama Persekutuan seperti yang termaktub dalam Perlembagaan Persekutuan.',
      isTrue: true,
      explanation: 'Betul! Perkara 3 Perlembagaan Persekutuan menyatakan Islam ialah agama Persekutuan.',
      emoji: '📜',
    });
  });
}

function sj5BahasaMelayu(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah kedudukan Bahasa Melayu dalam Perlembagaan Persekutuan?', 'Bahasa kebangsaan dan bahasa rasmi', ['Bahasa asing', 'Bahasa sukuan sahaja', 'Bahasa kedua']],
    ['Mengapakah Bahasa Melayu penting sebagai warisan negara?', 'Ia bahasa perpaduan dan identiti negara', ['Ia bahasa yang sukar', 'Ia bahasa lama sahaja', 'Ia tidak digunakan']],
    ['Apakah peranan Bahasa Melayu dalam perpaduan?', 'Menyatukan rakyat pelbagai kaum', ['Memisahkan kaum', 'Mengurangkan komunikasi', 'Menghalang pendidikan']],
    ...(SJ_EXTRA_FACTS['sj5-bahasa-melayu'] ?? []),
  ];
  return fill(count, (i) => {
    const q = rng.pick(facts);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'sj5-bm',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🗣️',
        cols: 1,
        speak: q[0],
      });
    }
    return fillBlank(rng, {
      prefix: 'sj5-bm',
      prompt: 'Bahasa ____ ialah bahasa kebangsaan Malaysia.',
      answer: 'Melayu',
      options: ['Inggeris', 'Cina', 'Tamil'],
      explanation: 'Bahasa Melayu ialah bahasa kebangsaan Malaysia seperti termaktub dalam Perlembagaan.',
      emoji: '📖',
      cols: 2,
    });
  });
}

function sj5PenjajahanKemerdekaan(_y: number, rng: Rng, count: number): Question[] {
  const colonial: [string, string][] = [
    ['Portugis', '1511 - menakluki Melaka'],
    ['Belanda', '1641 - menguasai Melaka daripada Portugis'],
    ['British', '1824 - Perjanjian London dan penguasaan British'],
    ['Jepun', '1941 - 1945 - menduduki Tanah Melayu'],
  ];
  const figures = [
    { t: 'Tunku Abdul Rahman Putra Al-Haj', role: 'Bapa Kemerdekaan Malaysia' },
    { t: 'Tun Abdul Razak', role: 'Perdana Menteri kedua dan arkitek pembangunan' },
    { t: 'Tun Tan Cheng Lock', role: 'Pemimpin kaum Cina yang memperjuangkan kemerdekaan' },
    { t: 'Tun V.T. Sambanthan', role: 'Pemimpin kaum India yang memperjuangkan kemerdekaan' },
  ];
  const facts: [string, string, string[]][] = [
    ['Pada tahun bilakah Malaysia mencapai kemerdekaan?', '1957', ['1945', '1963', '1970']],
    ['Siapakah yang mengetuai rombongan menuntut kemerdekaan ke London?', 'Tunku Abdul Rahman Putra Al-Haj', ['Tun Abdul Razak', 'Tun Tan Cheng Lock', 'Tun V.T. Sambanthan']],
    ['Apakah tarikh kemerdekaan Malaysia?', '31 Ogos 1957', ['16 September 1963', '31 Ogos 1963', '16 September 1957']],
    ['Apakah maksud Merdeka?', 'Bebas daripada penjajahan', ['Penjajahan baru', 'Perang', 'Perpaduan sahaja']],
    ...(SJ_EXTRA_FACTS['sj5-penjajahan-kemerdekaan'] ?? []),
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj5-merdeka',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🇲🇾',
        cols: 1,
        speak: q[0],
      });
    }
    if (mode === 1) {
      const picked = rng.sample(figures, 3);
      return match({
        prefix: 'sj5-merdeka',
        prompt: 'Padankan tokoh kemerdekaan dengan peranannya.',
        pairs: picked.map((f) => ({ left: f.t, right: f.role })),
        explanation: 'Tokoh-tokoh ini berperanan penting dalam perjuangan kemerdekaan.',
        emoji: '🎖️',
      });
    }
    const picked = rng.sample(colonial, 3);
    return match({
      prefix: 'sj5-merdeka',
      prompt: 'Padankan kuasa penjajah dengan peristiwa berkaitan.',
      pairs: picked.map((c) => ({ left: c[0], right: c[1] })),
      explanation: 'Tanah Melayu pernah dijajah oleh beberapa kuasa asing.',
      emoji: '🗓️',
    });
  });
}

function sj5YangDiPertuanAgong(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Apakah kedudukan Yang di-Pertuan Agong?', 'Ketua Negara Malaysia', ['Ketua negeri Selangor', 'Ketua kerajaan', 'Ketua pembangkang']],
    ['Berapakah tempoh jawatan Yang di-Pertuan Agong?', 'Lima tahun', ['Dua tahun', 'Sepuluh tahun', 'Seumur hidup']],
    ['Apakah nama tempat bersemayam rasmi Yang di-Pertuan Agong?', 'Istana Negara', ['Istana Budaya', 'Istana Melaka', 'Istana Sultan']],
    ['Apakah alat kebesaran Yang di-Pertuan Agong?', 'Keris panjang dan tengkolok', ['Pedang kayu', 'Mahkota emas', 'Tongkat biasa']],
    ['Apakah maksud Raja Berperlembagaan?', 'Raja memerintah mengikut Perlembagaan', ['Raja memerintah tanpa undang-undang', 'Raja memerintah dengan tentera', 'Raja tidak berkuasa langsung']],
    ...(SJ_EXTRA_FACTS['sj5-yang-di-pertuan-agong'] ?? []),
  ];
  return fill(count, (i) => {
    const q = rng.pick(facts);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'sj5-agong',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '👑',
        cols: 1,
        speak: q[0],
      });
    }
    return trueFalse({
      prefix: 'sj5-agong',
      prompt: 'Yang di-Pertuan Agong dipilih daripada kalangan Raja-raja Melayu secara bergilir.',
      isTrue: true,
      explanation: 'Betul! Yang di-Pertuan Agong dipilih oleh Majlis Raja-Raja secara bergilir.',
      emoji: '📜',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Tahun 6 — Kemakmuran Negara Kita                                    */
/* ------------------------------------------------------------------ */

function sj6PembentukanMalaysia(_y: number, rng: Rng, count: number): Question[] {
  const states = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
    'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
  ];
  const facts: [string, string, string[]][] = [
    ['Pada tarikh bilakah Malaysia dibentuk?', '16 September 1963', ['31 Ogos 1957', '16 September 1957', '31 Ogos 1963']],
    ['Negeri manakah yang menyertai Malaysia pada tahun 1963?', 'Sabah, Sarawak dan Singapura', ['Johor dan Kedah', 'Perak dan Selangor', 'Pahang dan Kelantan']],
    ['Mengapakah Malaysia dibentuk?', 'Untuk memperkukuh keselamatan dan ekonomi', ['Untuk memisahkan negeri', 'Untuk mengurangkan penduduk', 'Untuk berperang']],
    ['Apakah nama rancangan pembentukan Malaysia?', 'Rancangan Malaysia', ['Rancangan Colombo', 'Rancangan Marshall', 'Rancangan Five Year']],
    ...(SJ_EXTRA_FACTS['sj6-pembentukan-malaysia'] ?? []),
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj6-pembentukan',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🇲🇾',
        cols: 1,
        speak: q[0],
      });
    }
    if (mode === 1) {
      return order({
        prefix: 'sj6-pembentukan',
        prompt: 'Susun peristiwa penting pembentukan Malaysia mengikut urutan masa.',
        items: rng.shuffle([
          '1957: Tanah Melayu mencapai kemerdekaan',
          '1961: Cadangan pembentukan Malaysia dikemukakan',
          '1963: Malaysia dibentuk pada 16 September',
        ]),
        correctOrder: [
          '1957: Tanah Melayu mencapai kemerdekaan',
          '1961: Cadangan pembentukan Malaysia dikemukakan',
          '1963: Malaysia dibentuk pada 16 September',
        ],
        explanation: 'Pembentukan Malaysia berlaku selepas Tanah Melayu merdeka pada 1957.',
        emoji: '🗓️',
      });
    }
    const picked = rng.sample(states, 3);
    return mcq(rng, {
      prefix: 'sj6-pembentukan',
      prompt: 'Negeri manakah BUKAN sebahagian daripada Malaysia?',
      answer: 'Singapura',
      distractors: picked,
      explanation: 'Singapura menyertai Malaysia pada 1963 tetapi keluar pada 1965. Kini ia negara berasingan.',
      emoji: '🗺️',
      cols: 2,
    });
  });
}

function sj6RukunNegara(_y: number, rng: Rng, count: number): Question[] {
  const principles = [
    'Kepercayaan kepada Tuhan',
    'Kesetiaan kepada Raja dan Negara',
    'Keluhuran Perlembagaan',
    'Kedaulatan Undang-undang',
    'Kesopanan dan Kesusilaan',
  ];
  const facts: [string, string, string[]][] = [
    ['Berapakah prinsip Rukun Negara?', 'Lima', ['Tiga', 'Empat', 'Enam']],
    ['Bilakah Rukun Negara diperkenalkan?', '1970', ['1957', '1963', '1980']],
    ['Mengapakah Rukun Negara diperkenalkan?', 'Untuk memperkukuh perpaduan selepas peristiwa 13 Mei 1969', ['Untuk menambah cukai', 'Untuk mengubah bahasa', 'Untuk menghalang pendidikan']],
    ['Apakah kepentingan Rukun Negara?', 'Membentuk jati diri dan perpaduan rakyat', ['Memisahkan kaum', 'Mengurangkan penduduk', 'Menghalang perdagangan']],
    ...(SJ_EXTRA_FACTS['sj6-rukun-negara'] ?? []),
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj6-rukun',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '📜',
        cols: 2,
        speak: q[0],
      });
    }
    if (mode === 1) {
      return order({
        prefix: 'sj6-rukun',
        prompt: 'Susun prinsip Rukun Negara mengikut urutan yang betul.',
        items: rng.shuffle(principles),
        correctOrder: principles,
        explanation: 'Urutan prinsip Rukun Negara: Kepercayaan kepada Tuhan, Kesetiaan kepada Raja dan Negara, Keluhuran Perlembagaan, Kedaulatan Undang-undang, Kesopanan dan Kesusilaan.',
        emoji: '🏛️',
      });
    }
    return trueFalse({
      prefix: 'sj6-rukun',
      prompt: `Prinsip "${rng.pick(principles)}" ialah salah satu prinsip dalam Rukun Negara.`,
      isTrue: true,
      explanation: 'Betul! Semua prinsip tersebut terkandung dalam Rukun Negara.',
      emoji: '✅',
    });
  });
}

function sj6KitaRakyatMalaysia(_y: number, rng: Rng, count: number): Question[] {
  const festivals: [string, string][] = [
    ['Hari Raya Aidilfitri', 'Perayaan umat Islam selepas Ramadan'],
    ['Tahun Baru Cina', 'Perayaan masyarakat Cina'],
    ['Deepavali', 'Perayaan cahaya masyarakat India'],
    ['Hari Gawai', 'Perayaan masyarakat Dayak di Sarawak'],
    ['Pesta Kaamatan', 'Perayaan masyarakat Kadazandusun di Sabah'],
  ];
  const people = [
    'Melayu', 'Cina', 'India', 'Orang Asli', 'Bumiputera Sarawak', 'Bumiputera Sabah',
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const f = rng.pick(festivals);
      return mcq(rng, {
        prefix: 'sj6-rakyat',
        prompt: `Apakah ${f[0]}?`,
        answer: f[1],
        distractors: festivals.filter((x) => x[0] !== f[0]).map((x) => x[1]),
        explanation: `${f[0]}: ${f[1]}.`,
        emoji: '🎉',
        cols: 1,
        speak: `Apakah ${f[0]}?`,
      });
    }
    if (mode === 1) {
      const picked = rng.sample(festivals, 3);
      return match({
        prefix: 'sj6-rakyat',
        prompt: 'Padankan perayaan dengan keterangannya.',
        pairs: picked.map((f) => ({ left: f[0], right: f[1] })),
        explanation: 'Malaysia kaya dengan pelbagai perayaan masyarakat.',
        emoji: '🎊',
      });
    }
    const picked = rng.sample(people, 3);
    return mcq(rng, {
      prefix: 'sj6-rakyat',
      prompt: 'Apakah kepentingan perpaduan kaum di Malaysia?',
      answer: 'Mengekalkan keharmonian dan kemakmuran negara',
      distractors: ['Menimbulkan perpecahan', 'Mengurangkan pembangunan', 'Menghalang pendidikan'],
      explanation: `Perpaduan antara ${picked.join(', ')} dan semua kaum mengekalkan keharmonian negara.`,
      emoji: '🤝',
      cols: 1,
    });
  });
}

function sj6PencapaianNegara(_y: number, rng: Rng, count: number): Question[] {
  const facts: [string, string, string[]][] = [
    ['Dalam bidang apakah Malaysia mencapai kejayaan di peringkat dunia?', 'Sukan badminton', ['Sukan musim sejuk', 'Lumba kereta Formula 1', 'Bola sepak Piala Dunia']],
    ['Apakah organisasi serantau yang dianggotai Malaysia?', 'ASEAN', ['NATO', 'EU', 'OPEC']],
    ['Apakah nama program kerjasama ekonomi Malaysia dengan negara lain?', 'Perdagangan antarabangsa', ['Perang ekonomi', 'Penutupan pelabuhan', 'Pembatasan perdagangan']],
    ['Apakah sumbangan Malaysia dalam ASEAN?', 'Menggalakkan keamanan dan kerjasama serantau', ['Menimbulkan konflik', 'Menutup sempadan', 'Menghentikan perdagangan']],
    ...(SJ_EXTRA_FACTS['sj6-pencapaian-negara'] ?? []),
  ];
  const leaders: [string, string][] = [
    ['Tunku Abdul Rahman Putra Al-Haj', 'Perdana Menteri pertama'],
    ['Tun Abdul Razak', 'Perdana Menteri kedua, Bapa Pembangunan'],
    ['Tun Hussein Onn', 'Perdana Menteri ketiga, Bapa Perpaduan'],
    ['Tun Dr. Mahathir Mohamad', 'Perdana Menteri keempat, Bapa Pemodenan'],
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj6-pencapaian',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '🏆',
        cols: 1,
        speak: q[0],
      });
    }
    if (mode === 1) {
      const picked = rng.sample(leaders, 3);
      return match({
        prefix: 'sj6-pencapaian',
        prompt: 'Padankan Perdana Menteri dengan gelaran mereka.',
        pairs: picked.map((l) => ({ left: l[0], right: l[1] })),
        explanation: 'Setiap Perdana Menteri menyumbang kepada pembangunan negara.',
        emoji: '🎖️',
      });
    }
    return trueFalse({
      prefix: 'sj6-pencapaian',
      prompt: 'Malaysia ialah salah satu negara pengasas ASEAN.',
      isTrue: true,
      explanation: 'Betul! Malaysia bersama Indonesia, Filipina, Singapura dan Thailand menubuhkan ASEAN pada 1967.',
      emoji: '🌏',
    });
  });
}

function sj6SejarahKita(_y: number, rng: Rng, count: number): Question[] {
  const timeline: [string, string][] = [
    ['1957', 'Kemerdekaan Tanah Melayu'],
    ['1963', 'Pembentukan Malaysia'],
    ['1965', 'Singapura keluar daripada Malaysia'],
    ['1969', 'Peristiwa 13 Mei'],
    ['1970', 'Pengenalan Rukun Negara'],
    ['1998', 'Sukan Komanwel di Kuala Lumpur'],
  ];
  const facts: [string, string, string[]][] = [
    ['Apakah iktibar daripada peristiwa sejarah Malaysia?', 'Menghargai keamanan dan perpaduan', ['Mengulangi kesilapan', 'Mengabaikan sejarah', 'Meningkatkan perpecahan']],
    ['Mengapakah kita perlu menghargai kemerdekaan?', 'Kerana ia hasil perjuangan dan pengorbanan tokoh terdahulu', ['Kerana ia mudah diperoleh', 'Kerana ia tidak penting', 'Kerana ia datang sendiri']],
    ['Apakah peranan generasi muda dalam mengekalkan kemerdekaan?', 'Menjaga perpaduan dan memajukan negara', ['Mengabaikan pelajaran', 'Menimbulkan kekacauan', 'Meruntuhkan perpaduan']],
    ...(SJ_EXTRA_FACTS['sj6-sejarah-kita'] ?? []),
  ];
  return fill(count, (i) => {
    const mode = i % 3;
    if (mode === 0) {
      const q = rng.pick(facts);
      return mcq(rng, {
        prefix: 'sj6-sejarah',
        prompt: q[0],
        answer: q[1],
        distractors: q[2],
        explanation: `Jawapannya: ${q[1]}.`,
        emoji: '💡',
        cols: 1,
        speak: q[0],
      });
    }
    if (mode === 1) {
      const picked = rng.sample(timeline, 3);
      return mcq(rng, {
        prefix: 'sj6-sejarah',
        prompt: `Apakah peristiwa penting pada tahun ${picked[0][0]}?`,
        answer: picked[0][1],
        distractors: picked.slice(1).map((x) => x[1]),
        explanation: `Pada tahun ${picked[0][0]}: ${picked[0][1]}.`,
        emoji: '📅',
        cols: 1,
      });
    }
    const sorted = [...timeline].sort((a, b) => Number(a[0]) - Number(b[0]));
    const picked = rng.sample(sorted, 3).sort((a, b) => Number(a[0]) - Number(b[0]));
    return order({
      prefix: 'sj6-sejarah',
      prompt: 'Susun peristiwa sejarah mengikut urutan masa (awal dahulu).',
      items: rng.shuffle(picked.map((x) => `${x[0]}: ${x[1]}`)),
      correctOrder: picked.map((x) => `${x[0]}: ${x[1]}`),
      explanation: `Urutan masa: ${picked.map((x) => x[0]).join(' → ')}.`,
      emoji: '⏳',
    });
  });
}

export const SEJARAH_GENERATORS: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'sj4-mari-belajar-sejarah': sj4MariBelajarSejarah,
  'sj4-zaman-air-batu': sj4ZamanAirBatu,
  'sj4-zaman-prasejarah': sj4ZamanPrasejarah,
  'sj4-kerajaan-melayu-awal': sj4KerajaanMelayuAwal,
  'sj4-kesultanan-melaka': sj4KesultananMelayuMelaka,
  'sj5-institusi-raja': sj5InstitusiRaja,
  'sj5-agama-islam': sj5AgamaIslam,
  'sj5-bahasa-melayu': sj5BahasaMelayu,
  'sj5-penjajahan-kemerdekaan': sj5PenjajahanKemerdekaan,
  'sj5-yang-di-pertuan-agong': sj5YangDiPertuanAgong,
  'sj6-pembentukan-malaysia': sj6PembentukanMalaysia,
  'sj6-rukun-negara': sj6RukunNegara,
  'sj6-kita-rakyat-malaysia': sj6KitaRakyatMalaysia,
  'sj6-pencapaian-negara': sj6PencapaianNegara,
  'sj6-sejarah-kita': sj6SejarahKita,
};
