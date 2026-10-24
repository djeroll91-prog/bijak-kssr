/**
 * Nota tambahan ringkas untuk setiap topik (DSKP KSSR Semakan 2017).
 * Nota ini digabungkan dengan nota asas dalam katalog supaya murid
 * mendapat lebih banyak penerangan pendek, petua dan fakta menarik
 * bagi setiap topik.
 */

import type { Note } from './types';

export const EXTRA_NOTES: Record<string, Note[]> = {
  /* ============================ MATEMATIK TAHUN 1 ============================ */
  'mt1-nombor-hingga-100': [
    {
      kind: 'tip',
      title: 'Cara Bandingkan Nombor',
      bullets: [
        'Lihat digit puluh dahulu, kemudian digit sa.',
        'Contoh: 63 lebih besar daripada 59 kerana 6 lebih besar daripada 5.',
        'Simbol > bermaksud lebih besar, < bermaksud lebih kecil.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Angka 0 hingga 9 dipanggil digit. Semua nombor besar dibina daripada digit-digit ini sahaja!',
    },
  ],
  'mt1-tambah-tolak-100': [
    {
      kind: 'tip',
      title: 'Cara Kira Pantas',
      bullets: [
        'Buat 10 dahulu: 8 + 5 = 8 + 2 + 3 = 13.',
        'Tolak dengan 10: 34 − 9 = 34 − 10 + 1 = 25.',
        'Semak jawapan dengan kiraan songsang: 13 − 5 = 8.',
      ],
    },
    {
      kind: 'example',
      title: 'Kata Kunci Soalan',
      bullets: [
        'Tambah: jumlah, semuanya, berapa banyak.',
        'Tolak: baki, tinggal, berapa kurang.',
      ],
    },
  ],
  'mt1-pecahan-asas': [
    {
      kind: 'tip',
      title: 'Bahagian yang Sama Besar',
      body: 'Pecahan hanya sah jika bahagiannya sama besar. Sebuah kek dipotong 4 bahagian sama besar, satu bahagian ialah 1/4.',
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Satu bahagian daripada dua (1/2) dipanggil "separuh". Satu daripada empat (1/4) dipanggil "suku".',
    },
  ],
  'mt1-wang': [
    {
      kind: 'tip',
      title: 'Kenal Wang Malaysia',
      bullets: [
        'Syiling: 5 sen, 10 sen, 20 sen, 50 sen.',
        'Nota: RM1, RM5, RM10, RM20, RM50, RM100.',
        'Simbol RM bermaksud Ringgit Malaysia; sen ialah nilai lebih kecil.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Baki',
      body: 'Amin ada RM5. Dia beli buku RM3. Baki wangnya ialah RM5 − RM3 = RM2.',
    },
  ],
  'mt1-masa-waktu': [
    {
      kind: 'tip',
      title: 'Cara Baca Jam',
      bullets: [
        'Jarum pendek menunjukkan jam, jarum panjang menunjukkan minit.',
        'Jarum panjang di 12 bermaksud tepat pada jam.',
        'Contoh: jarum pendek di 3 dan panjang di 12 = pukul 3 tepat.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: '1 hari ada 24 jam, 1 jam ada 60 minit, dan 1 minit ada 60 saat.',
    },
  ],
  'mt1-bentuk-ruang': [
    {
      kind: 'tip',
      title: 'Kenal Bentuk 2D',
      bullets: [
        'Segi tiga ada 3 sisi, segi empat ada 4 sisi.',
        'Bulatan tidak mempunyai sisi lurus.',
        'Segi empat sama semua sisinya sama panjang.',
      ],
    },
    {
      kind: 'fun',
      title: 'Cari di Sekeliling',
      body: 'Jam dinding berbentuk bulatan, pintu berbentuk segi empat tepat, dan bumbung rumah sering berbentuk segi tiga.',
    },
  ],
  'mt1-data': [
    {
      kind: 'tip',
      title: 'Cara Kumpul Data',
      bullets: [
        'Kira satu per satu menggunakan tanda kiraan.',
        'Setiap tanda kiraan mewakili satu benda.',
        'Susun data supaya mudah dibandingkan.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Carta bergambar membantu kita melihat kumpulan mana yang paling banyak dengan cepat!',
    },
  ],

  /* ============================ MATEMATIK TAHUN 2 ============================ */
  'mt2-nombor-hingga-1000': [
    {
      kind: 'tip',
      title: 'Nilai Tempat Hingga 1000',
      bullets: [
        'Setiap nombor tiga digit ada nilai ratus, puluh dan sa.',
        'Contoh: 752 = 700 + 50 + 2.',
        'Bundarkan kepada puluh terdekat: lihat digit sa.',
      ],
    },
    {
      kind: 'tip',
      title: 'Contoh Kerja: Membundar',
      bullets: [
        'Bundarkan 462 kepada puluh terdekat. 462 terletak antara 460 dan 470.',
        'Digit puluh ialah 6. Digit sa ialah 2.',
        'Sebab 2 kurang daripada 5, kekalkan 6. Jadi 462 ≈ 460.',
        'Bundarkan 758 kepada ratus terdekat. 758 terletak antara 700 dan 800.',
        'Digit ratus ialah 7. Digit puluh ialah 5.',
        'Sebab 5 sama dengan 5, tambah 1 pada 7 menjadi 8. Jadi 758 ≈ 800.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Untuk menulis 1000 dalam perkataan, kita tulis "seribu" — bukan "sepuluh ratus"!',
    },
  ],
  'mt2-operasi-asas': [
    {
      kind: 'tip',
      title: 'Susun Cara Menegak',
      bullets: [
        'Tulis nombor sejajar mengikut sa, puluh dan ratus.',
        'Tambah atau tolak dari kanan (sa) ke kiri.',
        'Jangan lupa mengumpul semula apabila lebih daripada 9.',
      ],
    },
    {
      kind: 'example',
      title: 'Darab Mudah',
      body: 'Darab ialah tambah berulang. Contoh: 3 × 4 bermaksud 4 + 4 + 4 = 12.',
    },
  ],
  'mt2-pecahan': [
    {
      kind: 'tip',
      title: 'Pecahan Setara',
      bullets: [
        'Pecahan setara sama nilainya walaupun angkanya berbeza.',
        'Contoh: 1/2 = 2/4 = 4/8.',
        'Cara dapat: darab pengangka dan penyebut dengan nombor yang sama.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Pengangka ialah nombor di atas, penyebut ialah nombor di bawah garisan pecahan.',
    },
  ],
  'mt2-wang': [
    {
      kind: 'tip',
      title: 'Tulis Nilai Wang',
      bullets: [
        'Selalu tulis RM dengan dua titik perpuluhan, contoh RM3.50.',
        '10 sen = RM0.10; 50 sen = RM0.50.',
        'Guna titik, bukan koma, untuk wang.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Harga Beberapa Barang',
      body: 'Sebuah buku RM4 dan sebatang pen RM2.50. Jumlah = RM4 + RM2.50 = RM6.50.',
    },
  ],
  'mt2-masa-waktu': [
    {
      kind: 'tip',
      title: 'Setengah Jam dan Suku Jam',
      bullets: [
        '30 minit = setengah jam.',
        '15 minit = suku jam.',
        'Contoh: 2:30 dibaca "pukul dua tiga puluh".',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: '1 minggu ada 7 hari dan 1 tahun ada 12 bulan.',
    },
  ],
  'mt2-panjang-jisim': [
    {
      kind: 'tip',
      title: 'Unit Ukuran Asas',
      bullets: [
        'Panjang: sentimeter (cm) dan meter (m).',
        'Jisim: gram (g) dan kilogram (kg).',
        'Isi padu: mililiter (mℓ) dan liter (ℓ).',
      ],
    },
    {
      kind: 'example',
      title: 'Tukar Unit',
      body: '1 meter = 100 cm, 1 kilogram = 1000 g, dan 1 liter = 1000 mℓ.',
    },
  ],
  'mt2-bentuk-ruang': [
    {
      kind: 'tip',
      title: 'Bentuk 3D',
      bullets: [
        'Kubus ada 6 muka segi empat sama.',
        'Kuboid ada 6 muka segi empat tepat.',
        'Sfera bulat penuh, seperti bola.',
      ],
    },
    {
      kind: 'fun',
      title: 'Cari di Rumah',
      body: 'Dadu berbentuk kubus, kotak kasut berbentuk kuboid, dan bola berbentuk sfera.',
    },
  ],
  'mt2-data': [
    {
      kind: 'tip',
      title: 'Carta Palang',
      bullets: [
        'Carta palang menggunakan palang untuk menunjukkan bilangan.',
        'Palang lebih tinggi bermaksud bilangan lebih banyak.',
        'Setiap palang mesti bermula dari garisan bawah yang sama.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Carta palang membantu kita membandingkan data dengan cepat tanpa mengira satu per satu.',
    },
  ],

  /* ============================ MATEMATIK TAHUN 3 ============================ */
  'mt3-nombor-hingga-10000': [
    {
      kind: 'tip',
      title: 'Bundar Kepada Ribu Terdekat',
      bullets: [
        'Lihat digit ratus untuk membundarkan kepada ribu terdekat.',
        '5 atau lebih → bundar ke atas; kurang 5 → kekalkan.',
        'Contoh: 4 600 dibundarkan kepada 5 000.',
      ],
    },
    {
      kind: 'tip',
      title: 'Contoh Kerja: Membundar',
      bullets: [
        'Bundarkan 3 750 kepada ratus terdekat. Ia terletak antara 3 700 dan 3 800.',
        'Digit ratus ialah 7. Digit puluh ialah 5.',
        'Sebab 5 sama dengan 5, tambah 1 pada 7 menjadi 8. Jadi 3 750 ≈ 3 800.',
        'Bundarkan 6 412 kepada ribu terdekat. Ia terletak antara 6 000 dan 7 000.',
        'Digit ribu ialah 6. Digit ratus ialah 4.',
        'Sebab 4 kurang daripada 5, kekalkan 6. Jadi 6 412 ≈ 6 000.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Tanda pemisah ruang (4 728) memudahkan kita membaca nombor besar.',
    },
  ],
  'mt3-operasi-asas': [
    {
      kind: 'tip',
      title: 'Bahagi dan Baki',
      bullets: [
        'Bahagi bermaksud mengagih sama banyak.',
        'Contoh: 17 ÷ 5 = 3 baki 2.',
        'Semak: (3 × 5) + 2 = 17.',
      ],
    },
    {
      kind: 'example',
      title: 'Operasi Bergabung',
      body: 'Selesaikan darab atau bahagi dahulu: 4 + 2 × 3 = 4 + 6 = 10.',
    },
  ],
  'mt3-pecahan-perpuluhan': [
    {
      kind: 'tip',
      title: 'Tukar Peratus',
      bullets: [
        'Peratus bermaksud "per seratus".',
        '50% = 50/100 = 1/2 = 0.5.',
        'Untuk tukar pecahan ke peratus, darab dengan 100%.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Diskaun di kedai sering ditulis dalam peratus, contoh "diskaun 20%".',
    },
  ],
  'mt3-wang': [
    {
      kind: 'tip',
      title: 'Kira Untung dan Rugi',
      bullets: [
        'Untung = harga jual − harga beli (jika jual lebih tinggi).',
        'Rugi = harga beli − harga jual (jika jual lebih rendah).',
        'Simpan kiraan wang dengan teliti.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Bil',
      body: '3 buah buku berharga RM6.50 setiap satu. Jumlah = 3 × RM6.50 = RM19.50.',
    },
  ],
  'mt3-masa-waktu': [
    {
      kind: 'tip',
      title: 'Kira Tempoh Masa',
      bullets: [
        'Tempoh = masa tamat − masa mula.',
        'Contoh: 9:15 pagi hingga 11:00 pagi = 1 jam 45 minit.',
        'Ingat 1 jam = 60 minit.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Kalendar Masihi ada 12 bulan; bulan Februari paling pendek dengan 28 atau 29 hari.',
    },
  ],
  'mt3-ukuran': [
    {
      kind: 'tip',
      title: 'Tukar Unit Besar dan Kecil',
      bullets: [
        '1 km = 1000 m; 1 m = 100 cm.',
        '1 kg = 1000 g.',
        '1 ℓ = 1000 mℓ.',
      ],
    },
    {
      kind: 'example',
      title: 'Jumlah Ukuran',
      body: '2 m 30 cm + 1 m 80 cm = 3 m 110 cm = 4 m 10 cm.',
    },
  ],
  'mt3-bentuk-ruang': [
    {
      kind: 'tip',
      title: 'Perimeter dan Luas',
      bullets: [
        'Perimeter segi empat tepat = 2 × (panjang + lebar).',
        'Luas segi empat tepat = panjang × lebar.',
        'Perimeter ialah ukuran sekeliling, luas ialah ruang di dalam.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Luas',
      body: 'Segi empat tepat 6 cm × 4 cm: Luas = 6 × 4 = 24 cm².',
    },
  ],
  'mt3-data': [
    {
      kind: 'tip',
      title: 'Carta Pai Mudah',
      bullets: [
        'Carta pai menunjukkan bahagian daripada keseluruhan.',
        'Seluruh bulatan mewakili 100%.',
        'Bahagian lebih besar bermaksud lebih banyak.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Mengumpul data bermaksud mengumpul maklumat, contoh bilangan murid yang suka setiap warna.',
    },
  ],

  /* ============================ MATEMATIK TAHUN 4 ============================ */
  'mt4-nombor-hingga-100000': [
    {
      kind: 'tip',
      title: 'Nilai Tempat Hingga Ratus Ribu',
      bullets: [
        '6 digit merangkumi ratus ribu hingga sa.',
        'Contoh: 254 318 = 200 000 + 50 000 + 4 000 + 300 + 10 + 8.',
        'Bundar kepada puluh ribu, ribu, atau ratus terdekat.',
      ],
    },
    {
      kind: 'tip',
      title: 'Contoh Kerja: Membundar',
      bullets: [
        'Bundarkan 27 480 kepada ribu terdekat. Ia terletak antara 27 000 dan 28 000.',
        'Digit ribu ialah 7. Digit ratus ialah 4.',
        'Sebab 4 kurang daripada 5, kekalkan 7. Jadi 27 480 ≈ 27 000.',
        'Bundarkan 35 800 kepada puluh ribu terdekat. Ia terletak antara 30 000 dan 40 000.',
        'Digit puluh ribu ialah 3. Digit ribu ialah 5.',
        'Sebab 5 sama dengan 5, tambah 1 pada 3 menjadi 4. Jadi 35 800 ≈ 40 000.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Nombor genap boleh dibahagi tepat dengan 2; nombor ganjil tidak boleh.',
    },
  ],
  'mt4-operasi': [
    {
      kind: 'tip',
      title: 'Urutan Operasi',
      bullets: [
        'Selesaikan operasi dalam kurungan dahulu.',
        'Kemudian darab dan bahagi (dari kiri ke kanan).',
        'Akhir sekali tambah dan tolak.',
      ],
    },
    {
      kind: 'example',
      title: 'Operasi Bergabung',
      body: '(20 + 4) ÷ 6 = 24 ÷ 6 = 4. Kurungan diselesaikan dahulu.',
    },
  ],
  'mt4-pecahan-perpuluhan-peratus': [
    {
      kind: 'tip',
      title: 'Hubungan Tiga Serangkai',
      bullets: [
        'Pecahan, perpuluhan dan peratus boleh mewakili nilai yang sama.',
        'Contoh: 3/4 = 0.75 = 75%.',
        'Untuk tukar perpuluhan ke peratus, darab dengan 100.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: '1% daripada RM100 ialah RM1 — peratus sangat berguna untuk mengira diskaun dan faedah.',
    },
  ],
  'mt4-wang': [
    {
      kind: 'tip',
      title: 'Simpanan dan Perbelanjaan',
      bullets: [
        'Simpanan = wang disimpan; perbelanjaan = wang dibelanjakan.',
        'Bajet membantu merancang perbelanjaan.',
        'Simpan sedikit setiap bulan supaya cukup untuk keperluan besar.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Faedah Mudah',
      body: 'Simpanan RM1 000 dengan faedah 5% setahun = 5/100 × RM1 000 = RM50 setahun.',
    },
  ],
  'mt4-masa-waktu': [
    {
      kind: 'tip',
      title: 'Sistem 24 Jam',
      bullets: [
        'Sistem 24 jam tidak menggunakan a.m. atau p.m.',
        'Contoh: 3:00 p.m. ditulis 15:00.',
        'Tengah malam ialah 00:00, tengah hari ialah 12:00.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Zon masa berbeza antara negara. Malaysia menggunakan satu zon masa sahaja!',
    },
  ],
  'mt4-ukuran': [
    {
      kind: 'tip',
      title: 'Unit Metrik',
      bullets: [
        'Panjang: mm, cm, m, km.',
        'Jisim: mg, g, kg, tan.',
        'Isi padu cecair: mℓ, ℓ.',
      ],
    },
    {
      kind: 'example',
      title: 'Tukar Unit',
      body: '2.5 km = 2 500 m; 3 000 mℓ = 3 ℓ.',
    },
  ],
  'mt4-ruang': [
    {
      kind: 'tip',
      title: 'Isi Padu Kuboid',
      bullets: [
        'Isi padu kuboid = panjang × lebar × tinggi.',
        'Unit isi padu ialah unit padu, contoh cm³.',
        'Isi padu mengukur ruang di dalam bentuk 3D.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Isi Padu',
      body: 'Kuboid 5 cm × 3 cm × 2 cm: Isi padu = 5 × 3 × 2 = 30 cm³.',
    },
  ],
  'mt4-koordinat-nisbah': [
    {
      kind: 'tip',
      title: 'Nisbah',
      bullets: [
        'Nisbah membandingkan dua kuantiti.',
        'Contoh nisbah 2 : 3 bermaksud 2 bahagian berbanding 3 bahagian.',
        'Permudahkan nisbah seperti pecahan, contoh 4 : 6 = 2 : 3.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Resipi menggunakan nisbah, contoh nasi : air = 1 : 2.',
    },
  ],
  'mt4-data': [
    {
      kind: 'tip',
      title: 'Mod, Median dan Min',
      bullets: [
        'Mod = nilai paling kerap muncul.',
        'Median = nilai tengah selepas disusun.',
        'Min (purata) = jumlah nilai ÷ bilangan nilai.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Min',
      body: 'Data 4, 6, 8, 10. Min = (4 + 6 + 8 + 10) ÷ 4 = 28 ÷ 4 = 7.',
    },
  ],

  /* ============================ MATEMATIK TAHUN 5 ============================ */
  'mt5-nombor-juta': [
    {
      kind: 'tip',
      title: 'Nombor Hingga 1 000 000',
      bullets: [
        '1 juta = 1 000 000 (7 digit).',
        'Bundar kepada ratus ribu atau juta terdekat.',
        'Gunakan pemisah ruang supaya mudah dibaca.',
      ],
    },
    {
      kind: 'tip',
      title: 'Contoh Kerja: Membundar',
      bullets: [
        'Bundarkan 348 000 kepada ratus ribu terdekat. Ia terletak antara 300 000 dan 400 000.',
        'Digit ratus ribu ialah 3. Digit puluh ribu ialah 4.',
        'Sebab 4 kurang daripada 5, kekalkan 3. Jadi 348 000 ≈ 300 000.',
        'Bundarkan 2 750 000 kepada juta terdekat. Ia terletak antara 2 000 000 dan 3 000 000.',
        'Digit juta ialah 2. Digit ratus ribu ialah 7.',
        'Sebab 7 ialah 5 atau lebih, tambah 1 pada 2 menjadi 3. Jadi 2 750 000 ≈ 3 000 000.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: '1 juta saat mengambil masa kira-kira 11 setengah hari!',
    },
  ],
  'mt5-pecahan-perpuluhan-peratus': [
    {
      kind: 'tip',
      title: 'Operasi Pecahan',
      bullets: [
        'Tambah/tolak: samakan penyebut dahulu.',
        'Darab: darab pengangka dan penyebut terus.',
        'Bahagi: darab dengan pecahan songsang.',
      ],
    },
    {
      kind: 'example',
      title: 'Peratus daripada Nombor',
      body: '20% daripada 150 = 20/100 × 150 = 30.',
    },
  ],
  'mt5-wang': [
    {
      kind: 'tip',
      title: 'Diskaun Harga',
      bullets: [
        'Diskaun mengurangkan harga asal.',
        'Harga selepas diskaun = harga asal − (peratus diskaun × harga asal).',
        'Contoh: RM80 dengan diskaun 25% = RM80 − RM20 = RM60.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Bank menyimpan wang kita dan memberi faedah sebagai ganjaran simpanan.',
    },
  ],
  'mt5-masa-waktu': [
    {
      kind: 'tip',
      title: 'Masa, Laju dan Jarak',
      bullets: [
        'Laju = Jarak ÷ Masa.',
        'Jarak = Laju × Masa.',
        'Masa = Jarak ÷ Laju.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Laju',
      body: 'Sebuah kereta bergerak 120 km dalam 2 jam. Laju = 120 ÷ 2 = 60 km/j.',
    },
  ],
  'mt5-ukuran': [
    {
      kind: 'tip',
      title: 'Tukar Unit dengan Perpuluhan',
      bullets: [
        '1.5 kg = 1 500 g.',
        '2.3 ℓ = 2 300 mℓ.',
        '0.5 km = 500 m.',
      ],
    },
    {
      kind: 'example',
      title: 'Operasi Ukuran',
      body: '3 kg 250 g − 1 kg 800 g = 1 kg 450 g.',
    },
  ],
  'mt5-ruang': [
    {
      kind: 'tip',
      title: 'Isi Padu Silinder',
      bullets: [
        'Isi padu silinder = π × r² × tinggi.',
        'r ialah jejari (separuh diameter).',
        'Gunakan π ≈ 3.142.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: '1 liter = 1 000 cm³, jadi isi padu boleh dinyatakan dalam liter atau cm³.',
    },
  ],
  'mt5-koordinat-nisbah': [
    {
      kind: 'tip',
      title: 'Koordinat Cartes',
      bullets: [
        'Koordinat ditulis (x, y).',
        'x ialah jarak mendatar dari paksi-y.',
        'y ialah jarak menegak dari paksi-x.',
      ],
    },
    {
      kind: 'example',
      title: 'Kadaran Langsung',
      body: 'Jika 3 buku berharga RM15, maka 5 buku berharga RM15 ÷ 3 × 5 = RM25.',
    },
  ],
  'mt5-data': [
    {
      kind: 'tip',
      title: 'Julat Data',
      bullets: [
        'Julat = nilai tertinggi − nilai terendah.',
        'Julat menunjukkan sebaran data.',
        'Contoh: data 5 hingga 20, julat = 20 − 5 = 15.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Graf garis sesuai untuk menunjukkan perubahan data mengikut masa.',
    },
  ],

  /* ============================ MATEMATIK TAHUN 6 ============================ */
  'mt6-nombor-juta': [
    {
      kind: 'tip',
      title: 'Nombor Besar Hingga 10 Juta',
      bullets: [
        'Nombor boleh sampai 10 000 000 (8 digit).',
        'Nilai tempat termasuk juta dan puluh juta.',
        'Bundar kepada juta terdekat: lihat digit ratus ribu.',
      ],
    },
    {
      kind: 'tip',
      title: 'Contoh Kerja: Membundar',
      bullets: [
        'Bundarkan 4 650 000 kepada juta terdekat. Ia terletak antara 4 000 000 dan 5 000 000.',
        'Digit juta ialah 4. Digit ratus ribu ialah 6.',
        'Sebab 6 ialah 5 atau lebih, tambah 1 pada 4 menjadi 5. Jadi 4 650 000 ≈ 5 000 000.',
        'Bundarkan 8 320 000 kepada juta terdekat. Ia terletak antara 8 000 000 dan 9 000 000.',
        'Digit juta ialah 8. Digit ratus ribu ialah 3.',
        'Sebab 3 kurang daripada 5, kekalkan 8. Jadi 8 320 000 ≈ 8 000 000.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Nombor negatif lebih kecil daripada sifar, contoh suhu −5°C lebih sejuk daripada 0°C.',
    },
  ],
  'mt6-pecahan-perpuluhan-peratus': [
    {
      kind: 'tip',
      title: 'Pecahan Tak Wajar dan Nombor Bercampur',
      bullets: [
        'Pecahan tak wajar: pengangka lebih besar daripada penyebut (7/4).',
        'Nombor bercampur: 1 3/4 = 7/4.',
        'Tukar dengan mendarab penyebut dengan nombor bulat, kemudian tambah pengangka.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Peratus Perubahan',
      body: 'Harga naik dari RM40 ke RM50. Perubahan = 10/40 × 100% = 25%.',
    },
  ],
  'mt6-wang': [
    {
      kind: 'tip',
      title: 'Faedah dan Dividen',
      bullets: [
        'Faedah mudah: faedah atas jumlah asal sahaja.',
        'Faedah kompaun: faedah atas jumlah asal dan faedah terkumpul.',
        'Dividen ialah bahagian keuntungan pelaburan.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Menyimpan wang secara berkala lama-kelamaan boleh menjadi jumlah yang besar!',
    },
  ],
  'mt6-masa-waktu': [
    {
      kind: 'tip',
      title: 'Zon Masa',
      bullets: [
        'Bumi dibahagikan kepada 24 zon masa.',
        'Setiap zon berbeza kira-kira 1 jam.',
        'Malaysia berada dalam satu zon masa (GMT+8).',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Perjalanan',
      body: 'Bertolak 8:15 pagi, perjalanan 3 jam 40 minit. Tiba pada 11:55 pagi.',
    },
  ],
  'mt6-ukuran': [
    {
      kind: 'tip',
      title: 'Isi Padu Cecair',
      bullets: [
        '1 ℓ = 1 000 mℓ.',
        'Isi padu kuboid juga boleh jadi kapasiti bekas.',
        '1 cm³ = 1 mℓ; 1 000 cm³ = 1 ℓ.',
      ],
    },
    {
      kind: 'example',
      title: 'Campuran Cecair',
      body: '1.5 ℓ jus + 750 mℓ air = 2 ℓ 250 mℓ.',
    },
  ],
  'mt6-ruang': [
    {
      kind: 'tip',
      title: 'Rumus Ruang',
      bullets: [
        'Isi padu prisma = luas tapak × tinggi.',
        'Jumlah sudut segi tiga = 180°.',
        'Jumlah sudut segi empat = 360°.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Piramid dan kon mempunyai satu puncak dan tapak; sfera tiada puncak atau sisi.',
    },
  ],
  'mt6-koordinat': [
    {
      kind: 'tip',
      title: 'Nisbah dan Kadaran',
      bullets: [
        'Kadaran: dua nisbah yang sama nilai.',
        'Contoh: 2 : 3 = 4 : 6.',
        'Kadaran langsung: dua kuantiti bertambah bersama.',
      ],
    },
    {
      kind: 'example',
      title: 'Kira Skala',
      body: 'Peta berskala 1 : 100 000. 3 cm pada peta = 300 000 cm = 3 km sebenar.',
    },
  ],
  'mt6-data-kebolehjadian': [
    {
      kind: 'tip',
      title: 'Kebolehjadian',
      bullets: [
        'Nilai antara 0 (mustahil) hingga 1 (pasti).',
        'Kebolehjadian = bilangan kes sesuai ÷ jumlah kes.',
        'Contoh: 2 guli merah daripada 8 guli = 2/8 = 1/4.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Cuaca hujan atau panas tidak dapat dipastikan, tetapi kita boleh sebut kebolehjadiannya.',
    },
  ],

  /* ============================ BAHASA MELAYU ============================ */
  'bm1-huruf-suku-kata': [
    {
      kind: 'tip',
      title: 'Bunyi Vokal dan Konsonan',
      bullets: [
        'Vokal: a, e, i, o, u.',
        'Konsonan: huruf selain vokal, contoh b, c, d.',
        'Suku kata = gabungan huruf yang dibunyikan sekali, contoh ba-ju.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tepuk Suku Kata',
      body: 'Tepuk tangan sekali untuk setiap suku kata: ma-ta (2 tepukan), se-ko-lah (3 tepukan).',
    },
  ],
  'bm1-membaca-perkataan': [
    {
      kind: 'tip',
      title: 'Cara Membaca Perkataan Baharu',
      bullets: [
        'Sebut suku kata satu per satu dahulu.',
        'Gabungkan: ba + pa = bapa.',
        'Ulang beberapa kali supaya lancar.',
      ],
    },
    {
      kind: 'example',
      title: 'Contoh Perkataan',
      bullets: ['buku = bu-ku', 'meja = me-ja', 'sekolah = se-ko-lah'],
    },
  ],
  'bm1-menulis-ayat': [
    {
      kind: 'tip',
      title: 'Struktur Ayat Mudah',
      bullets: [
        'Ayat mesti ada subjek dan predikat.',
        'Subjek ialah pelaku, predikat ialah perbuatan.',
        'Contoh: "Ali bermain bola."',
      ],
    },
    {
      kind: 'fun',
      title: 'Tanda Baca',
      body: 'Ayat penyata diakhiri dengan noktah (.). Ayat tanya diakhiri dengan tanda tanya (?).',
    },
  ],
  'bm2-kata-nama-kerja': [
    {
      kind: 'tip',
      title: 'Kata Nama dan Kata Kerja',
      bullets: [
        'Kata nama menamakan orang, tempat, benda atau haiwan.',
        'Kata kerja menunjukkan perbuatan.',
        'Kata adjektif menerangkan sifat, contoh cantik, besar.',
      ],
    },
    {
      kind: 'example',
      title: 'Kenal dalam Ayat',
      body: '"Adik makan nasi panas." Adik = kata nama, makan = kata kerja, panas = kata adjektif.',
    },
  ],
  'bm2-imbuhan-asas': [
    {
      kind: 'tip',
      title: 'Imbuhan Awalan dan Akhiran',
      bullets: [
        'Awalan diletak di depan kata dasar, contoh meN- + lukis = melukis.',
        'Akhiran diletak di belakang, contoh makan + -an = makanan.',
        'Imbuhan mengubah maksud kata dasar.',
      ],
    },
    {
      kind: 'example',
      title: 'Contoh Imbuhan',
      bullets: ['tulis → menulis', 'baca → bacaan', 'main → bermain'],
    },
  ],
  'bm2-kata-ganti-nama': [
    {
      kind: 'tip',
      title: 'Kata Ganti Nama',
      bullets: [
        'Kata ganti nama menggantikan nama orang atau benda.',
        'Contoh: saya, kamu, dia, mereka, kami, kita.',
        '"Kita" termasuk orang yang diajak; "kami" tidak termasuk.',
      ],
    },
    {
      kind: 'fun',
      title: 'Ingat Mudah',
      body: 'Guna "dia" untuk seorang, dan "mereka" untuk ramai orang lain.',
    },
  ],
  'bm2-peribahasa': [
    {
      kind: 'tip',
      title: 'Simpulan Bahasa',
      bullets: [
        'Simpulan bahasa ialah gabungan kata yang membawa maksud khas.',
        'Contoh: "kaki ayam" bermaksud tidak berkasut.',
        'Jangan tafsir secara harfiah.',
      ],
    },
    {
      kind: 'example',
      title: 'Contoh Peribahasa',
      bullets: ['"ringan tulang" = rajin bekerja', '"besar kepala" = degil', '"buah hati" = orang kesayangan'],
    },
  ],
  'bm3-tatabahasa': [
    {
      kind: 'tip',
      title: 'Fungsi Kata dalam Ayat',
      bullets: [
        'Kata nama, kata kerja, kata adjektif, kata sendi nama.',
        'Setiap kata memainkan peranan tertentu dalam ayat.',
        'Ayat yang betul susunannya mudah difahami.',
      ],
    },
    {
      kind: 'example',
      title: 'Analisis Ayat',
      body: '"Fatimah menyanyi dengan merdu." Fatimah = kata nama, menyanyi = kata kerja, merdu = kata adjektif.',
    },
  ],
  'bm3-simpulan-bahasa': [
    {
      kind: 'tip',
      title: 'Gaya Bahasa',
      bullets: [
        'Gaya bahasa menghidupkan tulisan.',
        'Contoh: personifikasi (benda bukan manusia seolah-olah bernyawa).',
        '"Angin berbisik" ialah personifikasi.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Pantun dan syair ialah warisan seni bahasa Melayu yang indah.',
    },
  ],
  'bm3-kata-bilangan': [
    {
      kind: 'tip',
      title: 'Penjodoh Bilangan',
      bullets: [
        'Penjodoh bilangan digunakan sebelum kata nama.',
        'Contoh: sebentuk cincin, sekeping kertas, seekor burung.',
        'Pilih penjodoh yang sesuai dengan benda.',
      ],
    },
    {
      kind: 'example',
      title: 'Contoh Penjodoh',
      bullets: ['orang → seorang', 'haiwan → seekor', 'bunga → sekuntum', 'kertas → sehelai'],
    },
  ],
  'bm3-pemahaman': [
    {
      kind: 'tip',
      title: 'Cara Jawab Pemahaman',
      bullets: [
        'Baca petikan dua kali untuk faham.',
        'Gariskan kata kunci dalam soalan.',
        'Cari jawapan dalam petikan, jangan agak.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tip Berguna',
      body: 'Baca soalan dahulu sebelum petikan supaya tahu apa yang perlu dicari.',
    },
  ],
  'bm4-kata-sendi-nama': [
    {
      kind: 'tip',
      title: 'Kata Sendi Nama',
      bullets: [
        'Kata sendi nama menghubungkan kata dengan frasa.',
        'Contoh: di, ke, dari, pada, dalam, antara.',
        '"di" untuk tempat, "ke" untuk arah.',
      ],
    },
    {
      kind: 'example',
      title: 'Guna yang Betul',
      bullets: ['Buku di atas meja.', 'Dia pergi ke sekolah.', 'Ayah datang dari pejabat.'],
    },
  ],
  'bm4-imbuhan': [
    {
      kind: 'tip',
      title: 'Imbuhan Kata Kerja',
      bullets: [
        'meN- membentuk kata kerja aktif, contoh menulis.',
        'di- membentuk kata kerja pasif, contoh ditulis.',
        'ber- dan ter- memberi maksud tersendiri.',
      ],
    },
    {
      kind: 'example',
      title: 'Aktif dan Pasif',
      bullets: ['Ali menulis surat. (aktif)', 'Surat ditulis oleh Ali. (pasif)'],
    },
  ],
  'bm4-peribahasa': [
    {
      kind: 'tip',
      title: 'Peribahasa dan Maksudnya',
      bullets: [
        'Peribahasa menyampaikan nasihat secara halus.',
        'Contoh: "sedikit-sedikit, lama-lama jadi bukit".',
        'Maksudnya: usaha sedikit tetapi berterusan akan berjaya.',
      ],
    },
    {
      kind: 'example',
      title: 'Contoh Lain',
      bullets: ['"seperti aur dengan tebing" = saling membantu', '"bagai menarik rambut dalam tepung" = pekerjaan yang sukar'],
    },
  ],
  'bm4-karangan': [
    {
      kind: 'tip',
      title: 'Struktur Karangan',
      bullets: [
        'Ada pendahuluan, isi dan penutup.',
        'Setiap perenggan membincangkan satu idea.',
        'Gunakan ayat yang lengkap dan tanda baca betul.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tip Menulis',
      body: 'Rangka karangan dahulu membantu tulisan lebih tersusun dan tidak tersasar.',
    },
  ],
  'bm5-tatabahasa-lanjut': [
    {
      kind: 'tip',
      title: 'Ayat Tunggal dan Ayat Majmuk',
      bullets: [
        'Ayat tunggal mempunyai satu klausa.',
        'Ayat majmuk menggabungkan dua atau lebih klausa.',
        'Kata hubung seperti "dan", "atau", "tetapi" menggabungkan ayat.',
      ],
    },
    {
      kind: 'example',
      title: 'Contoh',
      bullets: ['Ali membaca. (ayat tunggal)', 'Ali membaca dan adiknya bermain. (ayat majmuk)'],
    },
  ],
  'bm5-pemahaman-petikan': [
    {
      kind: 'tip',
      title: 'Fahami Idea Utama',
      bullets: [
        'Idea utama biasanya ada dalam ayat pertama setiap perenggan.',
        'Bezakan fakta dan pendapat.',
        'Jawab dengan ayat sendiri yang gramatis.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tip',
      body: 'Baca tajuk petikan dahulu — ia memberi gambaran keseluruhan kandungan.',
    },
  ],
  'bm6-karangan-lanjut': [
    {
      kind: 'tip',
      title: 'Karangan Perbincangan',
      bullets: [
        'Bincangkan kebaikan dan keburukan sesuatu isu.',
        'Gunakan perenggan yang seimbang.',
        'Akhiri dengan kesimpulan dan pendirian.',
      ],
    },
    {
      kind: 'example',
      title: 'Frasa Berguna',
      bullets: ['Pada pendapat saya…', 'Selain itu…', 'Kesimpulannya…'],
    },
  ],
  'bm6-sistem-bahasa': [
    {
      kind: 'tip',
      title: 'Kesalahan Lazim',
      bullets: [
        'Hindari "adalah" salah guna; gunakan "ialah" untuk kata nama.',
        '"dan/atau" berulang patut dielakkan.',
        'Pastikan subjek dan predikat sepadan.',
      ],
    },
    {
      kind: 'example',
      title: 'Betulkan Ayat',
      bullets: ['Salah: Dia telah pergi ke bandar semalam.', 'Betul: Dia telah pergi ke bandar semalam. (Jangan berlebihan kata sendi)'],
    },
  ],
  'bm6-komsas': [
    {
      kind: 'tip',
      title: 'Komsas dan Seni Bahasa',
      bullets: [
        'Komsas merangkumi prosa dan puisi.',
        'Perhatikan tema, persoalan dan nilai.',
        'Seni bahasa termasuk pantun, syair dan sajak.',
      ],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Pantun empat kerat mempunyai rima akhir a-b-a-b yang indah.',
    },
  ],

  /* ============================ ENGLISH ============================ */
  'en1-phonics': [
    {
      kind: 'tip',
      title: 'Letter Sounds',
      bullets: ['Each letter has a sound, e.g. "c" says /k/ in "cat".', 'Blend sounds: c-a-t → cat.', 'Practice blending to read new words.'],
    },
    {
      kind: 'fun',
      title: 'Did You Know?',
      body: 'Rhyming words have the same ending sound, e.g. cat, hat, bat.',
    },
  ],
  'en1-greetings': [
    {
      kind: 'tip',
      title: 'Polite Phrases',
      bullets: ['Say "Good morning" before noon.', 'Say "Thank you" when someone helps.', 'Say "Please" when asking for something.'],
    },
    {
      kind: 'example',
      title: 'Examples',
      bullets: ['Hello! How are you?', 'Nice to meet you.', 'Goodbye! See you soon.'],
    },
  ],
  'en1-colours-numbers': [
    {
      kind: 'tip',
      title: 'Colours and Numbers',
      bullets: ['Colours: red, blue, green, yellow, black, white.', 'Numbers: one to twenty.', 'Use "a" or "an" before a noun.'],
    },
    {
      kind: 'fun',
      title: 'Did You Know?',
      body: 'A rainbow has seven colours: red, orange, yellow, green, blue, indigo, violet.',
    },
  ],
  'en2-simple-sentences': [
    {
      kind: 'tip',
      title: 'Build a Sentence',
      bullets: ['Every sentence needs a subject and a verb.', 'Start with a capital letter.', 'End with a full stop.'],
    },
    {
      kind: 'example',
      title: 'Examples',
      bullets: ['The cat sleeps.', 'Ali likes apples.', 'We go to school.'],
    },
  ],
  'en2-vocabulary': [
    {
      kind: 'tip',
      title: 'Word Groups',
      bullets: ['Group words by topic, e.g. animals, food, family.', 'Learn words with pictures.', 'Use new words in sentences.'],
    },
    {
      kind: 'fun',
      title: 'Did You Know?',
      body: 'Learning five new words a day means over 1,800 words in a year!',
    },
  ],
  'en3-grammar-basics': [
    {
      kind: 'tip',
      title: 'is, are, am',
      bullets: ['Use "am" with I.', 'Use "is" with he, she, it.', 'Use "are" with you, we, they.'],
    },
    {
      kind: 'example',
      title: 'Examples',
      bullets: ['I am happy.', 'She is my friend.', 'They are playing.'],
    },
  ],
  'en3-reading': [
    {
      kind: 'tip',
      title: 'Reading Strategies',
      bullets: ['Look at the title and pictures first.', 'Guess new words from context.', 'Answer: Who? What? Where? When?'],
    },
    {
      kind: 'fun',
      title: 'Did You Know?',
      body: 'Reading a little every day makes you a faster reader.',
    },
  ],
  'en3-writing': [
    {
      kind: 'tip',
      title: 'Short Writing',
      bullets: ['Plan your ideas before writing.', 'Use describing words (adjectives).', 'Check capital letters and full stops.'],
    },
    {
      kind: 'example',
      title: 'Example',
      body: 'My cat is small and black. It likes to sleep on my bed.',
    },
  ],
  'en4-grammar': [
    {
      kind: 'tip',
      title: 'Tenses',
      bullets: ['Present: I eat.', 'Past: I ate.', 'Future: I will eat.'],
    },
    {
      kind: 'example',
      title: 'Word Forms',
      bullets: ['Singular: child.', 'Plural: children.', 'Careful: some plurals are irregular.'],
    },
  ],
  'en4-vocabulary': [
    {
      kind: 'tip',
      title: 'Word Meaning',
      bullets: ['Use a dictionary to find meanings.', 'Learn synonyms (same meaning) and antonyms (opposite).', 'Antonym of "big" is "small".'],
    },
    {
      kind: 'fun',
      title: 'Did You Know?',
      body: 'English has borrowed words from many languages, including Malay — like "orangutan".',
    },
  ],
  'en4-reading': [
    {
      kind: 'tip',
      title: 'Reading for Information',
      bullets: ['Skim for the main idea.', 'Scan for specific details.', 'Look for facts and numbers.'],
    },
    {
      kind: 'example',
      title: 'Tip',
      body: 'Read questions first, then scan the passage for the answers.',
    },
  ],
  'en4-writing': [
    {
      kind: 'tip',
      title: 'Narrative Writing',
      bullets: ['A story has a beginning, middle and end.', 'Describe the characters and setting.', 'Use past tense for stories.'],
    },
    {
      kind: 'example',
      title: 'Useful Phrases',
      bullets: ['Once upon a time…', 'Suddenly…', 'In the end…'],
    },
  ],
  'en5-grammar-advanced': [
    {
      kind: 'tip',
      title: 'Advanced Grammar',
      bullets: ['Comparatives: big → bigger → biggest.', 'Use "because" and "although" to link ideas.', 'Reported speech changes the tense.'],
    },
    {
      kind: 'example',
      title: 'Example',
      body: '"I am tired," said Ali → Ali said that he was tired.',
    },
  ],
  'en5-reading-advanced': [
    {
      kind: 'tip',
      title: 'Reading for Understanding',
      bullets: ['Identify the writer\'s purpose.', 'Tell fact from opinion.', 'Summarise in your own words.'],
    },
    {
      kind: 'fun',
      title: 'Did You Know?',
      body: 'Summarising helps you remember what you have read.',
    },
  ],
  'en6-grammar-mastery': [
    {
      kind: 'tip',
      title: 'Grammar Mastery',
      bullets: ['Use conditionals: "If I study, I will pass."', 'Use passive voice correctly.', 'Keep tenses consistent.'],
    },
    {
      kind: 'example',
      title: 'Example',
      body: 'Active: The boy kicked the ball. Passive: The ball was kicked by the boy.',
    },
  ],
  'en6-writing-composition': [
    {
      kind: 'tip',
      title: 'Essay Composition',
      bullets: ['Plan an outline with introduction, body, conclusion.', 'Use linking words: firstly, moreover, hence.', 'Proofread for errors.'],
    },
    {
      kind: 'example',
      title: 'Opening Line',
      body: 'A strong first sentence grabs the reader\'s attention.',
    },
  ],
  'en6-listening-language-arts': [
    {
      kind: 'tip',
      title: 'Poems and Devices',
      bullets: ['Simile uses "like" or "as".', 'Metaphor describes one thing as another.', 'Alliteration repeats the first sound.'],
    },
    {
      kind: 'example',
      title: 'Example of Simile',
      body: 'Her smile is as bright as the sun.',
    },
  ],

  /* ============================ SAINS ============================ */
  'sn1-deria-benda-hidup': [
    {
      kind: 'tip',
      title: 'Lima Deria Manusia',
      bullets: ['Mata untuk melihat.', 'Telinga untuk mendengar.', 'Hidung untuk menghidu, lidah untuk merasa, kulit untuk menyentuh.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Benda hidup perlu makan, minum, bernafas dan membesar. Benda bukan hidup tidak perlu.',
    },
  ],
  'sn1-benda-hidup-bukan-hidup': [
    {
      kind: 'tip',
      title: 'Ciri Benda Hidup',
      bullets: ['Bernafas, makan, membesar, bergerak.', 'Boleh membiak (beranak atau bertelur).', 'Benda bukan hidup tidak mempunyai ciri ini.'],
    },
    {
      kind: 'example',
      title: 'Contoh',
      bullets: ['Hidup: pokok, kucing, manusia.', 'Bukan hidup: batu, kerusi, air.'],
    },
  ],
  'sn1-magnet-penyerapan': [
    {
      kind: 'tip',
      title: 'Magnet dan Bahan',
      bullets: ['Magnet menarik bahan seperti besi dan keluli.', 'Magnet tidak menarik kertas, plastik atau kayu.', 'Bahan yang menyerap air ialah bahan berliang, contoh span.'],
    },
    {
      kind: 'fun',
      title: 'Cuba Ini',
      body: 'Uji dengan magnet: klip kertas tertarik, tetapi pemadam getah tidak.',
    },
  ],
  'sn1-bumi-asas-binaan': [
    {
      kind: 'tip',
      title: 'Bumi dan Bahan Asas',
      bullets: ['Bumi terdiri daripada tanah, air dan udara.', 'Bahan asas binaan: batu, kayu, pasir, simen.', 'Setiap bahan mempunyai kegunaan tersendiri.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Rumah dibina daripada pelbagai bahan supaya kukuh dan selamat.',
    },
  ],
  'sn2-pembiakan-tumbesaran': [
    {
      kind: 'tip',
      title: 'Cara Haiwan Membiak',
      bullets: ['Ada haiwan beranak, contoh kucing dan lembu.', 'Ada haiwan bertelur, contoh ayam dan ikan.', 'Tumbuhan membiak melalui biji benih atau keratan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Manusia membesar daripada bayi, kanak-kanak, remaja, dewasa hingga tua.',
    },
  ],
  'sn2-keperluan-manusia': [
    {
      kind: 'tip',
      title: 'Keperluan Asas',
      bullets: ['Makanan, air, udara dan tempat tinggal.', 'Kesihatan dijaga dengan makanan sihat dan senaman.', 'Tidur yang cukup penting untuk kesihatan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Kita boleh hidup beberapa minggu tanpa makanan, tetapi hanya beberapa hari tanpa air.',
    },
  ],
  'sn2-terang-gelap': [
    {
      kind: 'tip',
      title: 'Terang dan Gelap',
      bullets: ['Cahaya diperlukan untuk melihat.', 'Tanpa cahaya, keadaan menjadi gelap.', 'Bayang terbentuk apabila cahaya disekat oleh objek.'],
    },
    {
      kind: 'fun',
      title: 'Cuba Ini',
      body: 'Gunakan lampu suluh untuk membentuk bayang tangan pada dinding.',
    },
  ],
  'sn2-asid-alkali': [
    {
      kind: 'tip',
      title: 'Asid dan Alkali',
      bullets: ['Asid terasa masam, contoh cuka dan limau.', 'Alkali terasa pahit dan licin, contoh sabun.', 'Kertas litmus menguji asid dan alkali.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Asid litmus menjadi merah, alkali litmus menjadi biru.',
    },
  ],
  'sn3-kemahiran-saintifik': [
    {
      kind: 'tip',
      title: 'Kemahiran Proses Sains',
      bullets: ['Pemerhatian, pengelasan, pengukuran.', 'Membuat inferens dan ramalan.', 'Berkomunikasi hasil penyiasatan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Sains bermula dengan bertanya "mengapa" dan "bagaimana".',
    },
  ],
  'sn3-pengukuran': [
    {
      kind: 'tip',
      title: 'Unit Pengukuran',
      bullets: ['Panjang: cm, m.', 'Jisim: g, kg.', 'Suhu: darjah Celsius (°C).'],
    },
    {
      kind: 'example',
      title: 'Contoh',
      body: 'Gunakan pembaris untuk panjang, neraca untuk jisim, termometer untuk suhu.',
    },
  ],
  'sn3-ketumpatan': [
    {
      kind: 'tip',
      title: 'Ketumpatan',
      bullets: ['Ketumpatan = jisim ÷ isi padu.', 'Objek lebih tumpat daripada air tenggelam.', 'Objek kurang tumpat daripada air terapung.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Kapal besar boleh terapung kerana bentuknya membuat ketumpatan keseluruhan rendah.',
    },
  ],
  'sn3-sistem-suria': [
    {
      kind: 'tip',
      title: 'Ahli Sistem Suria',
      bullets: ['Matahari ialah pusat sistem suria.', 'Lapan planet mengelilingi Matahari.', 'Bumi ialah planet ketiga dari Matahari.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Bulan mengelilingi Bumi dan kelihatan bercahaya kerana memantulkan cahaya Matahari.',
    },
  ],
  'sn4-proses-hidup': [
    {
      kind: 'tip',
      title: 'Proses Hidup Manusia',
      bullets: ['Bernafas, makan, membesar, membiak.', 'Tumbuhan juga bernafas dan membuat makanan.', 'Proses ini mengekalkan kehidupan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Manusia bernafas menggunakan peparu, ikan menggunakan insang.',
    },
  ],
  'sn4-pengelasan-haiwan': [
    {
      kind: 'tip',
      title: 'Mengelaskan Haiwan',
      bullets: ['Haiwan bertulang belakang dan tidak bertulang belakang.', 'Mamalia, reptilia, burung, ikan, amfibia.', 'Tumbuhan dikelaskan kepada berbunga dan tidak berbunga.'],
    },
    {
      kind: 'example',
      title: 'Contoh',
      bullets: ['Mamalia: paus, kelawar.', 'Amfibia: katak.', 'Reptilia: ular, buaya.'],
    },
  ],
  'sn4-tenaga': [
    {
      kind: 'tip',
      title: 'Tenaga dan Litar',
      bullets: ['Tenaga tidak boleh dicipta atau dimusnahkan.', 'Litar elektrik perlu sumber, wayar dan mentol.', 'Litar bersiri dan litar selari berbeza.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Bateri menyimpan tenaga elektrik; suis mengawal aliran elektrik.',
    },
  ],
  'sn4-bahan-jirim': [
    {
      kind: 'tip',
      title: 'Tiga Keadaan Jirim',
      bullets: ['Pepejal: bentuk tetap.', 'Cecair: mengikut bentuk bekas.', 'Gas: mengisi seluruh ruang.'],
    },
    {
      kind: 'example',
      title: 'Perubahan Keadaan',
      body: 'Air (cecair) membeku menjadi ais (pepejal) pada 0°C, dan mengewap menjadi gas pada 100°C.',
    },
  ],
  'sn5-kitaran-hidup': [
    {
      kind: 'tip',
      title: 'Kitaran Hidup',
      bullets: ['Telur → anak → dewasa.', 'Katak melalui proses metamorfosis.', 'Tumbuhan berbunga: biji → anak pokok → pokok dewasa → bunga.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Kupu-kupu melalui empat peringkat: telur, ulat, kepompong, dewasa.',
    },
  ],
  'sn5-fotosintesis': [
    {
      kind: 'tip',
      title: 'Fotosintesis',
      bullets: ['Tumbuhan membuat makanan sendiri.', 'Perlu cahaya matahari, air dan karbon dioksida.', 'Menghasilkan glukosa dan oksigen.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Fotosintesis menambah oksigen ke udara — sebab itu pokok penting untuk kehidupan.',
    },
  ],
  'sn5-jirim-bahan': [
    {
      kind: 'tip',
      title: 'Jirim dan Bahan',
      bullets: ['Jirim terdiri daripada zarah kecil.', 'Bahan boleh berubah keadaan bila dipanaskan atau disejukkan.', 'Logam, kaca dan plastik mempunyai ciri berbeza.'],
    },
    {
      kind: 'example',
      title: 'Contoh',
      body: 'Ais mencair menjadi air, air mengewap menjadi wap air.',
    },
  ],
  'sn5-bumi-angkasa-teknologi': [
    {
      kind: 'tip',
      title: 'Bumi dan Angkasa',
      bullets: ['Bumi berputar pada paksinya menghasilkan siang dan malam.', 'Bumi mengelilingi Matahari menghasilkan tahun.', 'Teknologi membantu kajian angkasa.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Satu putaran penuh Bumi mengambil masa 24 jam.',
    },
  ],
  'sn6-sistem-badan': [
    {
      kind: 'tip',
      title: 'Sistem Badan Manusia',
      bullets: ['Sistem pencernaan mencerna makanan.', 'Sistem pernafasan membawa oksigen.', 'Sistem peredaran darah mengangkut bahan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Jantung berdenyut kira-kira 100 000 kali sehari untuk mengepam darah!',
    },
  ],
  'sn6-interaksi-hidupan': [
    {
      kind: 'tip',
      title: 'Interaksi antara Hidupan',
      bullets: ['Simbiosis: dua hidupan hidup bersama.', 'Persaingan untuk makanan dan ruang.', 'Rantai makanan menunjukkan aliran tenaga.'],
    },
    {
      kind: 'example',
      title: 'Rantai Makanan',
      body: 'Rumput → belalang → katak → ular. Tenaga mengalir dari pengeluar ke pengguna.',
    },
  ],
  'sn6-tenaga-konservasi': [
    {
      kind: 'tip',
      title: 'Tenaga dan Pemuliharaan',
      bullets: ['Sumber tenaga boleh diperbaharui: matahari, angin, air.', 'Sumber tidak boleh diperbaharui: arang batu, petroleum.', 'Jimat tenaga dengan mematikan lampu yang tidak digunakan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Menggunakan tenaga boleh diperbaharui membantu menjaga alam sekitar.',
    },
  ],
  'sn6-bumi-kehidupan': [
    {
      kind: 'tip',
      title: 'Bumi untuk Kehidupan',
      bullets: ['Bumi mempunyai udara, air dan suhu sesuai untuk hidupan.', 'Pencemaran menjejaskan hidupan.', 'Kitar semula menjaga Bumi.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Hari Bumi disambut pada 22 April setiap tahun.',
    },
  ],

  /* ============================ SEJARAH ============================ */
  'sj4-mari-belajar-sejarah': [
    {
      kind: 'tip',
      title: 'Mengapa Belajar Sejarah?',
      bullets: ['Sejarah mengajar kita tentang masa lalu.', 'Kita belajar daripada kesilapan dan kejayaan.', 'Sejarah membentuk jati diri kita.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Kronologi bermaksud susunan peristiwa mengikut urutan masa.',
    },
  ],
  'sj4-zaman-air-batu': [
    {
      kind: 'tip',
      title: 'Zaman Air Batu',
      bullets: ['Zaman apabila suhu Bumi sangat sejuk.', 'Sebahagian besar Bumi diliputi ais.', 'Berlaku kira-kira 2 juta tahun lalu.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Zaman air batu terbahagi kepada beberapa peringkat, dan haiwan seperti mamot hidup pada masa itu.',
    },
  ],
  'sj4-zaman-prasejarah': [
    {
      kind: 'tip',
      title: 'Zaman Prasejarah',
      bullets: ['Zaman sebelum manusia tahu menulis.', 'Menggunakan alat batu dan logam.', 'Terbahagi kepada Zaman Batu, Gangsa dan Besi.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Lukisan gua menunjukkan cara manusia prasejarah hidup dan berburu.',
    },
  ],
  'sj4-kerajaan-melayu-awal': [
    {
      kind: 'tip',
      title: 'Kerajaan Melayu Awal',
      bullets: ['Contoh: Kedah Tua, Gangga Negara, Langkasuka.', 'Berada di kawasan pesisir dan sungai.', 'Menjadi pusat perdagangan dan pelabuhan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Lembah Bujang di Kedah ialah tapak arkeologi penting kerajaan Melayu awal.',
    },
  ],
  'sj4-kesultanan-melaka': [
    {
      kind: 'tip',
      title: 'Tokoh Kesultanan Melayu Melaka',
      bullets: ['Parameswara ialah pengasas Melaka.', 'Tun Perak ialah Bendahara yang bijaksana.', 'Hang Tuah ialah laksamana yang gagah.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Melaka menjadi pusat perdagangan terkenal kerana kedudukannya di Selat Melaka.',
    },
  ],
  'sj5-institusi-raja': [
    {
      kind: 'tip',
      title: 'Institusi Raja',
      bullets: ['Raja ialah ketua negara bagi negeri beraja.', 'Sistem beraja di Malaysia berasaskan kesultanan Melayu.', 'Raja memerintah dengan nasihat dan undang-undang.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Sembilan negeri di Malaysia mempunyai sultan atau raja sebagai ketua negeri.',
    },
  ],
  'sj5-agama-islam': [
    {
      kind: 'tip',
      title: 'Agama Islam di Malaysia',
      bullets: ['Islam tersebar melalui pedagang dan pendakwah.', 'Islam menjadi agama rasmi Persekutuan.', 'Masjid menjadi pusat ibadah dan aktiviti.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Kedatangan Islam membawa tulisan Jawi ke Alam Melayu.',
    },
  ],
  'sj5-bahasa-melayu': [
    {
      kind: 'tip',
      title: 'Bahasa Melayu Warisan',
      bullets: ['Bahasa Melayu ialah bahasa kebangsaan.', 'Menjadi lingua franca di Kepulauan Melayu.', 'Batu Bersurat membuktikan penggunaan awal bahasa Melayu.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Batu Bersurat Terengganu ialah bukti awal tulisan Jawi dalam bahasa Melayu.',
    },
  ],
  'sj5-penjajahan-kemerdekaan': [
    {
      kind: 'tip',
      title: 'Perjuangan Kemerdekaan',
      bullets: ['Tanah Melayu dijajah Portugis, Belanda dan British.', 'Pemimpin berjuang menuntut kemerdekaan.', 'Kemerdekaan dicapai pada 31 Ogos 1957.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Tunku Abdul Rahman melaungkan "Merdeka!" tujuh kali di Stadium Merdeka.',
    },
  ],
  'sj5-yang-di-pertuan-agong': [
    {
      kind: 'tip',
      title: 'Yang di-Pertuan Agong',
      bullets: ['Ketua negara Malaysia.', 'Dipilih daripada sembilan raja Melayu.', 'Memegang jawatan selama lima tahun.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Istiadat Pertabalan Yang di-Pertuan Agong diadakan di Istana Negara.',
    },
  ],
  'sj6-pembentukan-malaysia': [
    {
      kind: 'tip',
      title: 'Pembentukan Malaysia',
      bullets: ['Malaysia dibentuk pada 16 September 1963.', 'Terdiri daripada 13 negeri dan 3 Wilayah Persekutuan.', 'Melaka dan Pulau Pinang pernah menjadi sebahagian Selat.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Singapura menyertai Malaysia pada 1963 tetapi keluar pada 1965.',
    },
  ],
  'sj6-rukun-negara': [
    {
      kind: 'tip',
      title: 'Lima Prinsip Rukun Negara',
      bullets: ['Kepercayaan kepada Tuhan.', 'Kesetiaan kepada Raja dan Negara.', 'Keluhuran Perlembagaan; Kedaulatan Undang-undang; Kesopanan dan Kesusilaan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Rukun Negara diperkenalkan pada 1970 selepas peristiwa 13 Mei 1969.',
    },
  ],
  'sj6-kita-rakyat-malaysia': [
    {
      kind: 'tip',
      title: 'Rakyat Berbilang Kaum',
      bullets: ['Malaysia mempunyai pelbagai kaum dan budaya.', 'Hidup bersatu padu membina negara.', 'Menghormati budaya lain penting untuk perpaduan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Perayaan seperti Hari Raya, Tahun Baru Cina dan Deepavali diraikan bersama.',
    },
  ],
  'sj6-pencapaian-negara': [
    {
      kind: 'tip',
      title: 'Pencapaian Negara',
      bullets: ['Malaysia membangun dalam pendidikan dan ekonomi.', 'Menjadi contoh negara berbilang kaum yang harmoni.', 'Sukan dan teknologi juga membanggakan.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Menara Berkembar Petronas pernah menjadi bangunan tertinggi di dunia.',
    },
  ],
  'sj6-sejarah-kita': [
    {
      kind: 'tip',
      title: 'Iktibar Sejarah',
      bullets: ['Belajar daripada peristiwa lalu.', 'Bersatu memajukan negara.', 'Menghargai pengorbanan generasi terdahulu.'],
    },
    {
      kind: 'fun',
      title: 'Tahukah Kamu?',
      body: 'Bangsa yang lupa sejarah mudah mengulangi kesilapan lalu — sebab itu sejarah penting.',
    },
  ],
};
