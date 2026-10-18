# AGENTS.md — Bijak KSSR

Aplikasi pembelajaran luar talian untuk murid sekolah rendah Malaysia (Tahun 1ŌĆō6),
mengikut silibus **KSSR Semakan 2017**. Web statik (Vite + React + TS + PWA) yang
dibungkus sebagai **APK Android** dan boleh dipasang sebagai PWA.

## Arahan penting

- Semua teks antara muka mesti dwibahasa (BM/EN) melalui `src/lib/i18n.ts`.
  Jangan sekali-kali menulis rentetan Bahasa Melayu secara keras dalam komponen.
- Semua aktiviti mesti ada kesan bunyi (`src/lib/audio.ts` ŌåÆ `sound.play(...)`) dan animasi.
- Palet warna lembut dan riang; elak warna terlalu terang/saturasi tinggi.
- Guna `type` (bukan `interface`) dan pastikan `npx tsc --noEmit` lulus sebelum siap.

## Arahan bina

```bash
npm run build                                  # bina web ke dist/
bash scripts/build-apk.sh                      # bina dist/bijak-kssr.apk
```

`scripts/build-apk.sh` memerlukan `ANDROID_HOME` dan `java` pada PATH.

## Persekitaran Android SDK (dipasang dalam sandbox)

- SDK: `/workspace/android-sdk` (`export ANDROID_HOME=/workspace/android-sdk`)
- JAVA_HOME: `/workspace/jdk-21.0.12.1+1` (dipasang semula ke lokasi ini selepas
  sandbox set semula; laluan lama `/usr/lib/jvm/java-21-openjdk-amd64` sudah tiada).
  Sahkan dengan `ls -d /workspace/jdk-*` sebelum membina.
- Komponen dipasang: `cmdline-tools/latest`, `platform-tools`, `platforms;android-34`,
  `build-tools;34.0.0`, `build-tools;35.0.1`

### Perangkap yang telah ditemui

1. **Guna `build-tools/35.0.1`, bukan 34.0.0.** `d8` dalam 34.0.0 (R8 8.2.2) ranap
   dengan `NullPointerException: Cannot invoke "String.length()"` apabila memproses
   kelas bersarang yang dikompil dengan JDK 21. Versi 35.0.1 berfungsi.
2. **Tiada Gradle diperlukan.** APK dibina terus dengan `aapt2 compile` ŌåÆ `aapt2 link`
   ŌåÆ `javac` ŌåÆ `d8` ŌåÆ `zipalign` ŌåÆ `apksigner`. Elak pergantungan muat turun besar.
3. **`zip` tiada dalam imej ini** — masukkan `classes.dex` ke dalam APK guna
   `zipfile` Python (APK ialah fail ZIP biasa).
4. **`/dev/kvm` tiada**, jadi emulator Android tidak boleh dijalankan. Sahkan APK
   secara statik sahaja: `aapt2 dump badging`, `apksigner verify`, `dexdump -f`,
   dan pastikan setiap aset yang dirujuk `index.html` wujud dalam APK.
5. **`androidx.webkit` tidak digunakan.** Sebab itu `MainActivity` melaksanakan
   pemuat aset tersuai sendiri untuk hos maya `appassets.androidplatform.net`
   (menyajikan fail dari `assets/www`). Ini mengekalkan laluan mutlak seperti
   `/assets/index.js` berfungsi tanpa pelayan rangkaian.
6. **Keselamatan:** kunci tandatangan (`android-app/keystore/bijak.keystore`) dan
   kata laluannya adalah **rahsia pembangunan sahaja**. Untuk edaran awam, jana
   kunci baharu dan simpan di luar kawalan versi.
7. **`test-apk-load.mjs` perlu menjalankan bundel secara manual.** jsdom
   melangkau `<script type="module">`, jadi skrip mengeluarkan tag itu daripada
   HTML dan memanggil `dom.window.eval(bundle)` selepas DOM dibina. Tanpa ini
   React tidak dirender dan ujian gagal dengan "0 aksara" (pepijat harness,
   bukan pepijat aplikasi). Jalankan dengan
   `PAYLOAD_DIR=dist` (atau `docs`) — bukan lalai `/tmp/apk-payload`.

## Pautan edaran (KEKAL)

- **APK boleh pasang (pautan kekal):**
  https://github.com/djeroll91-prog/bijak-kssr/releases/latest/download/bijak-kssr.apk
  (juga boleh dimuat turun dari https://djeroll91-prog.github.io/bijak-kssr/bijak-kssr.apk)
- **Aplikasi web (PWA, kekal):** https://djeroll91-prog.github.io/bijak-kssr/
- **Repo:** https://github.com/djeroll91-prog/bijak-kssr
- **Pakej web zip:** https://github.com/djeroll91-prog/bijak-kssr/releases/latest/download/bijak-kssr-app.zip

Deploy web: bina (`npm run build`) lalu selaraskan `docs/` dengan `dist/` dan
push ke `main`. GitHub Pages dicetak dari `main /docs`.

> **Perangkap deploy 1 — `.nojekyll`:** ia tidak dihasilkan oleh
> `npm run build`. Tanpanya GitHub Pages (Jekyll) mengabaikan folder `assets/`
> dan aplikasi gagal dimuat. Pastikan ia wujud dalam `docs/`.

> **Perangkap deploy 2 — JANGAN `rm -rf docs`:** `docs/` ialah salinan `dist/`
> TAMBAH `bijak-kssr.apk` dan `bijak-kssr-app.zip`. Memadam `docs/` akan
> memusnahkan kedua-dua artifak itu walaupun pautan muat turun (dan
> `releases/latest`) masih merujuknya. Salin secara terpilih dan kekalkan
> kedua-dua fail tersebut.

> **Perangkap versi APK:** `version-code` mesti naik setiap keluaran, jika
> tidak Android enggan memasang APK baharu di atas yang lama. `build-apk.sh`
> kini mengira kedua-dua `version-code` dan `version-name` daripada
> `package.json` (1.14.0 -> kod 11400). Jangan kodkan keras semula.

> **Perangkap token:** `GITHUB_TOKEN` dalam persekitaran ini ialah token
> pengguna GitHub App (`ghu_`) dengan akses **baca sahaja**. Ia boleh
> `git ls-remote` dan membaca API, tetapi push/cipta ref gagal dengan
> `403 Resource not accessible by integration`. Push perlu dijalankan di
> persekitaran yang ada token boleh tulis.

## Versi kurikulum (PENTING — disemak 2026)

Aplikasi ini mengikut **KSSR Semakan 2017**, dan itu masih betul untuk majoriti murid:

- **KP2027** (Kurikulum Persekolahan 2027) hanya bermula pada **Tahun 1** (dan Tingkatan 1)
  pada sesi 2027. Murid **Tahun 2 hingga Tahun 6 kekal KSSR Semakan 2017** hingga kohort
  terakhir tamat Tahun 6 pada **2031**.
- Dokumen rujukan terkini untuk KSSR ialah **Dokumen Penjajaran KSSR (Semakan 2017)
  Edisi 3.0** bagi Bahasa Melayu, Bahasa Inggeris, Sains dan Matematik (Tahap I dan Tahap II).
  Edisi ini menyusun semula kandungan DSKP sedia ada; ia pilihan guru, bukan kurikulum baharu.
  Rujukan: portal BPK, `bpk.moe.gov.my/kurikulum/kssr/kssr-tahun-<n>`.
- DSKP rasmi boleh dimuat turun dari BPK, contoh Bahasa Melayu Tahun 5 SK:
  `bpk.moe.gov.my/kurikulum/kssr/kssr-tahun-5` (fail 005_DSKP_KSSR_Semakan_2017_BM_SK_Thn5).
- Bahasa Inggeris menggunakan DSKP berasaskan **CEFR** (Tahap 2 sasaran A2), dengan
  modul Listening/Speaking, Reading, Writing, Language Arts dan Grammar (Grammar hanya
  bermula Tahun 3). Susunan unit buku teks mengikut Scheme of Work KPM.

**Nota untuk kerja masa depan:** jangan tambah subjek "Alam dan Manusia" atau
"Teknologi dan Digital" ke katalog Tahun 1-6 sekarang — itu subjek KP2027 yang hanya
terpakai kepada kohort Tahun 1 mulai 2027, bukan kepada pengguna semasa.

### Penomboran standard kandungan DSKP (disemak 2026)

Medan `code` sesuatu topik dipaparkan sebagai "DSKP x.0" dalam skrin Topik dan Nota,
jadi ia **mesti padan nombor tajuk DSKP sebenar**. Dua pembetulan dibuat:

- **Matematik Tahun 1** ada **8** standard kandungan. Kod topik kini 1.0 Nombor,
  2.0 Operasi Asas, 3.0 Pecahan, 4.0 Wang, 5.0 Masa dan Waktu, **6.0 Ukuran dan
  Sukatan**, 7.0 Ruang, 8.0 Pengurusan Data. Sebelum ini 6.0/7.0 tersalah nombor dan
  6.0 Ukuran dan Sukatan langsung tiada.
- **Sains** menggunakan tema 1.0 Kemahiran Saintifik dan 2.0 Peraturan Bilik Sains
  untuk **setiap** tahun (T1-T6), disahkan dari DSKP Sains Tahun 1 dan Tahun 6.
  Sains Tahun 1 dahulunya bermula pada 2.0 tanpa 1.0.
- **Sains Tahun 2** ada **8** standard kandungan: 7.0 Elektrik dan 8.0 Campuran
  (kedua-duanya sebelum ini tiada).

**Sejarah guna penomboran TAJUK berterusan, bukan standard kandungan.** DSKP Sejarah
Tahun 4 = Tajuk 1-5, Tahun 5 = Tajuk 6-9, Tahun 6 = Tajuk 10-12. Kod topik Sejarah
kini mengikut skema ini (cth. `6.1`, `7.1`, `10.2`, `12.4`). Kerana Sejarah tidak
menggunakan "DSKP x.0", antara muka memaparkan label **"Tajuk"** untuk Sejarah dan
**"DSKP"** untuk subjek lain melalui `topicCodeLabel()` dalam `src/lib/i18n.ts`.
Jangan tukar nombor Sejarah tanpa merujuk DSKP penuh dahulu.

**Bahasa Melayu hanya ada standard 1.0-5.0**, iaitu 1.0 Mendengar & Bertutur,
2.0 Membaca, 3.0 Menulis, 4.0 Seni Bahasa, 5.0 Tatabahasa. Tiada 6.0. Setiap tahun
T1-T6 kini meliputi kesemua lima standard, dengan sub-nombor unik (cth. `5.1`, `5.2`)
supaya kod tidak bertindih dalam tahun yang sama.

**Sains setiap tahun bermula 1.0 Kemahiran Saintifik dan 2.0 Peraturan Bilik Sains**
(T1-T6), disahkan daripada DSKP Sains rasmi. Tahun 4-6 turut ada topik 1.0 yang
mengajar kemahiran mengawal pemboleh ubah dan membuat hipotesis.

Semakan automatik: `node verify-dskp.mjs` mengesahkan tiada kod bertindih, liputan
standard BM 1.0-5.0, penomboran Sains dan Sejarah, serta label kod yang betul.

## Struktur

- `src/screens/` — skrin utama (Home, Subjects, Games, Progress, Profile)
- `src/lib/i18n.ts` — kamus BM (`MS`) dan EN; kira-kira 469 kunci setiap satu (semak dengan `node audit-i18n.mjs`)
- `src/data/topics/` — nota asas topik DSKP (kira-kira 725 nota, 159 topik)
- `src/data/notes-extra.ts` — nota ringkas tambahan setiap topik (248 nota);
  digabungkan dalam `src/data/catalog.ts` semasa muat. Untuk tambah nota,
  letak kunci mengikut `id` topik dalam `EXTRA_NOTES`. Nota baharu perlu
  sepadan dengan `id` dalam `src/data/topics/*.ts` (semakan: tiada orphan).
- `src/data/contributors.ts` — kredit guru penyumbang latihan. Setiap topik
  dipetakan secara deterministik (hash `id`) kepada seorang guru supaya kredit
  kekal. Semakan: `node verify-contributors.mjs`.
- `src/lib/review.ts` — enjin ulangan berjarak (SRS) peringkat **topik**
  (bukan per soalan, kerana penjana menghasilkan soalan baharu setiap kali).
  Kotak Leitner (`BOX_INTERVALS`, `MAX_BOX=5`): lulus naik kotak dan
  menjarakkan tarikh, gagal turun kotak dan masuk bank kesilapan
  (`MISTAKE_LIMIT=8`). Kad lama dibina semula daripada sejarah percubaan
  semasa migrasi, jadi data murid sedia ada tidak hilang.
- `src/lib/dates.ts` — pembantu tarikh (`todayKey`, `addDays`) untuk memecahkan
  kebergantungan bulat antara `storage.ts` dan `review.ts`.
- `android-app/` — projek Android (manifest, `MainActivity.java`, res, assets/www)
- `scripts/build-apk.sh` — saluran bina APK
- `scripts/make-icons.py` / `make-android-icons.py` — penjana ikon
- `audit-i18n.mjs` — semak kunci i18n yang hilang
- `verify-generators.mjs`, `verify-random.mjs`, `verify-plan.mjs`,
  `verify-contributors.mjs` — semakan enjin soalan, kerawakan, pelan
  harian dan kredit guru
- `verify-review.mjs` — semakan enjin SRS (kotak, jarak, lapses)
- `verify-migrate.mjs` — semakan migrasi data (rekod lama kekal, kad dibina)
- `verify-exam.mjs` — semakan enjin peperiksaan percubaan: bilangan soalan
  ikut tahun, tiada soalan berulang dalam satu kertas, benih berbeza
  menghasilkan kertas berbeza, markah/gred/pecahan dikira betul
- `verify-match.mjs` — semakan soalan padan pasangan: kiri dan kanan sama
  bilangan, dan melaporkan label kanan berulang yang perlu dikendalikan widget
- `verify-dskp.mjs` — semakan pematuhan DSKP: tiada kod bertindih, liputan
  standard Bahasa Melayu 1.0-5.0, penomboran Sains dan Sejarah, label kod
- `test-review-ui.mjs` / `test-review-flow.mjs` — ujian jsdom pada `dist/`:
  kad ulangan muncul, sesi berselang merentas topik, kad dikemas kini

### Peperiksaan percubaan & tips menjawab (v1.9.0)

- `src/lib/exam.ts` — enjin peperiksaan percubaan. `examConfig(year)` menetapkan
  T1-T3 = 20 soalan / 30 minit, T4-T6 = 40 soalan / 60 minit. `buildExamPaper(year, seed)`
  mengagihkan soalan ke atas topik tahun itu, menyelang-selikan antara topik dan
  membuang soalan bertindih teks supaya **tiada soalan berulang dalam satu kertas**.
  Benih berbeza (dijana setiap percubaan baharu) menghasilkan kertas berbeza:
  diukur ~0-15% tumpang tindih antara dua percubaan, jadi soalan memang bertukar.
  `scoreExam` memulangkan markah, gred (A>=80, B>=60, C>=40, D>=20, E<20),
  pecahan ikut subjek dan topik, serta lulus pada 60%.
- `EXAM_TOPIC_ID = 'exam'` ialah id topik ringkasan untuk percubaan peperiksaan.
  Ia dikecualikan daripada penguasaan topik dan bank kesilapan melalui
  `SUMMARY_TOPIC_IDS` dalam `src/lib/plan.ts` dan penapis dalam `src/lib/review.ts`.
  Sebabnya: percubaan peperiksaan menjangkau banyak topik sekaligus dan tidak
  sepatutnya menaikkan atau menjatuhkan penguasaan satu topik.
- `src/data/tips.ts` — kandungan tip menjawab soalan: `generalTips(year)` untuk
  semua tahun dan `SUBJECT_TIPS` untuk setiap subjek. `tipsForYear(year, subjects)`
  menggabungkan kedua-duanya mengikut subjek yang ada pada tahun itu.
- `src/screens/MockExam.tsx` — aliran intro -> mula -> jawab -> semak -> hantar.
  HUD pemasa dan kiraan dijawab (`exam-hud`), grid lompat soalan (`exam-jump`),
  dan bar kemajuan kuiz yang dikongsi. Semua jenis soalan disokong (pilihan
  berganda, nombor, padan, susun) kerana ia menggunakan `QuestionView` yang sama.
- `src/screens/ExamResult.tsx` — markah, gred, pecahan ikut subjek dan topik,
  banding percubaan lepas, semakan jawapan penuh dan butang percubaan baharu.
- `src/screens/ExamTips.tsx` — kumpulan tip boleh kembang mengikut subjek,
  bacaan suara setiap tip, dan butang terus ke peperiksaan.
- Percubaan peperiksaan disimpan sebagai satu `Attempt` ringkasan (`saveExam`)
  supaya bintang, mata dan lencana sedia ada terus berfungsi.
- Ujian: `node verify-exam.mjs`, `node verify-match.mjs`, `node test-exam-ui.mjs`.
  `test-exam-ui.mjs` menguji aliran penuh dan mengesahkan soalan bertukar antara
  percubaan.

#### Pepijat soalan padan yang dibetulkan (v1.9.0)

Widget padan pasangan dulu memadankan mengikut **teks** label kanan dan
melumpuhkan semua butang kanan yang berkongsi teks. Untuk data seperti bentuk
3D (silinder, kon dan sfera semuanya bermuka "bulatan") ini menyebabkan soalan
mustahil diselesaikan. `MatchAnswer` dalam `src/components/QuestionView.tsx`
kini memadankan mengikut **indeks** kanan, jadi label kanan berulang pun boleh
dipadankan. `verify-match.mjs` melaporkan kes berulang supaya ia tidak
berulang tanpa disedari.

### Gerbang ibu bapa, trend & ujian skrin (v1.5.0)

- `src/lib/parentLock.ts` — cincangan SHA-256 (garam `bijak-kssr/parent-lock/v1`)
  untuk PIN ibu bapa. Dilaksana sendiri kerana `crypto.subtle` tiada dalam jsdom.
  `src/components/ParentLock.tsx` menyediakan `ParentLockSheet` (pad nombor
  tersuai, bukan papan kekunci telefon) dan `useParentGate()`. Gerbang hanya pada
  tindakan merosakkan (set semula data, padam profil), bukan setiap tetapan.
  Tukar PIN mesti melalui PIN lama. Ujian: `node test-parent-lock.mjs`.
- `src/lib/trend.ts` — trend markah mengikut skop (subjek dan/atau topik).
  `trendPoints` menapis percubaan; `trendDelta` membandingkan separuh kedua lawan
  separuh pertama dan memulangkan 0 jika kurang 4 titik supaya tidak meneka arah
  daripada dua titik. Skrin Kemajuan guna ini untuk graf boleh tapis.
  Ujian: `node verify-trend.mjs`, `node test-trend-ui.mjs`.
- `test-screens.mjs` — ujian jsdom melawat setiap skrin utama melalui navigasi
  sebenar dan gagal jika ada ralat JS. Skrin Laporan hanya muncul apabila `plan`
  wujud, jadi data ujian mesti ada `plan` dan `diagnostic`.
- Perangkap harness jsdom: `window.matchMedia` tidak wujud, dan `ProgressRing`
  turut menggunakan kelas `chart` — carta trend kini `chart chart-trend` supaya
  ujian boleh memilih bulatan dengan tepat.
- `test-apk-load.mjs` memerlukan `PAYLOAD_DIR` (guna `dist` atau `docs`).
  Ia juga memerlukan muatan APK diekstrak ke `/tmp/apk-payload` dahulu
  (`unzip -o dist/bijak-kssr.apk 'assets/www/*'`), jika tidak ia gagal serta-merta.
- `test-voice-picker.mjs` — menguji pemilih suara bacaan dengan senarai suara
  tiruan bagi setiap platform (ada/tak ada Melayu, suara awan Edge, tiada suara).
  Perangkap harness: jsdom tiada `SpeechSynthesisUtterance`, jadi ujian mesti
  menyediakan kelas tiruan atau klik pilih suara akan gagal.
- **Ujian navigasi guna `waitFor`, bukan `sleep` tetap.** Rantaian klik seperti
  "Subjek ŌåÆ Matematik ŌåÆ topik ŌåÆ Mula Belajar" kadangkala melebihi `sleep(700)`
  apabila mesin sibuk (gagal sekali-sekala, bukan pepijat kod). Guna corak
  `await waitFor(() => /.../.test(text()))` untuk keputusan yang stabil.

## Ciri ulangan berjarak (v1.4.0)

- Kad ulangan disimpan dalam `profile.reviews` (satu kad per topik).
- Skrin Utama memaparkan kad **Masa Ulang!** (bilangan topik perlu diulang
  hari ini) dan **Ruang Cuba Lagi** (bank kesilapan, topik yang pernah gagal).
- Sesi ulangan **berselang** merentas beberapa topik (bukan satu topik sahaja);
  sesi pendek ditambah soalan sehingga bilangan minimum supaya bermakna.
- Skrin Kemajuan mempunyai bahagian **Ulangan Pintar** untuk ibu bapa:
  bilangan perlu diulang, dikuasai, sedang belajar dan topik goyah.
- Skrin Keputusan sesi ulangan memaparkan semua topik yang disentuh dan
  mengkreditkan **setiap guru** yang menyumbang, bukan satu nama rawak.
- Skema storan dinaikkan ke v2; `migrate()` membina kad daripada sejarah
  percubaan lama tanpa kehilangan rekod.

## Bahasa antara muka

Teks antara muka mesti dalam **Bahasa Malaysia**, bukan Bahasa Indonesia.
Contoh pembetulan yang telah dibuat: `ketik` ŌåÆ `tekan`, `tukat` ŌåÆ `tukar`,
`Paute` ŌåÆ `Pautan`. Sebelum terbit, imbas `src/lib/i18n.ts` dan `src/data/`
untuk perkataan Indonesia (unduh, unggah, pengaturan, kirim, soal, dll.).

## Susun atur: telefon (APK) lwn web penuh (pelayar)

Aplikasi direka sebagai UI telefon: `.phone` dalam `src/App.tsx` dihadkan
`max-width: 460px`. Sejak v1.11.0, **pelayar web skrin lebar** mendapat susun
atur web penuh — bingkai telefon dibuka, **bar tab melekat di atas**, dan
kandungan berbilang kolum — manakala **APK Android kekal telefon**.

Kunci kepada ini ialah dua atribut pada `<html>`, ditetapkan awal dalam
`src/main.tsx` sebelum React dipasang:

- `data-shell` = `apk` | `web`
  APK memuatkan halaman dari hos maya `appassets.androidplatform.net`
  (lihat `MainActivity.java`), jadi `location.hostname` membezakannya.
- `data-layout` = `auto` | `desktop` | `phone`
  APK **dikunci** kepada `phone` tanpa mengira skrin. Pelayar menghormati
  pilihan yang disimpan di `localStorage['bijak-kssr/screen-layout']`, jika
  tidak lalai `auto`.

Navigasi web ialah komponen `WebNav` (bukan lagi `SideNav`): satu `<header>`
dengan jenama, tab mendatar (`.web-tab`, satu per `NAV_ITEMS`), dan ringkasan
murid di kanan. Ia `position: sticky; top: 0` supaya tab sentiasa boleh dicapai
semasa menatal. Nav bawah telefon (`.bottom-nav`) disembunyikan pada web.

Semua peraturan web dalam `src/styles/theme.css` (bahagian akhir fail,
`@media (min-width: 1024px)`) dijaga dengan `:root:not([data-layout='phone'])`.
Skrin senarai mendapat grid `repeat(auto-fill, minmax(340px, 1fr))`; skrin fokus
(kuiz, nota, keputusan, diagnostik) dikekang kepada satu kolum berpusat
(`max-width: 960px`) supaya ukuran bacaan kekal selesa. Peraturan web **tidak**
terpakai kepada APK pada bila-bila masa.

`src/lib/layout.ts` mengeksport `shellChannel` dan `useScreenLayout()` untuk
komponen. Kawalan pilihan susun atur ada dalam skrin Profil dan ditanda
`data-web-only="true"`; CSS menyembunyikannya dalam APK
(`:root[data-shell='apk'] [data-web-only='true']`).

Ujian: `node test-desktop-layout.mjs` (jsdom, termasuk hos maya APK).
Untuk semakan susun atur sebenar, muatkan aplikasi dalam Chromium headless —
jsdom tidak menilai CSS, jadi ia tidak boleh mengesahkan susun atur.

## Tema (terang / gelap)

Tema dikawal oleh atribut `data-theme` pada `<html>`, ditetapkan dalam
`src/state/store.tsx` daripada `settings.dark`. Token tema gelap berada dalam
`:root[data-theme='dark']` di `src/styles/theme.css`, bersama peraturan
`--sh-*` bercahaya (glow) untuk `.card`, `.option`, `.subject-tile`, `.note-block`
dan sebagainya. `settings.dark` disimpan melalui `src/lib/storage.ts`
(`DEFAULT_SETTINGS` + `repairSettings`). Togol ada dalam skrin Profil (­¤īÖ).

## Bacaan suara (TTS)

`VoiceEngine` dalam `src/lib/audio.ts` menggunakan Web Speech API. Had penting:
sesetengah peranti/WebView tiada suara Bahasa Melayu, dan `speechSynthesis`
mungkin tidak wujud langsung. Enjin menyediakan `voice.supported`, memilih
suara terbaik yang ada (ms ŌåÆ nama "Malay" ŌåÆ id ŌåÆ null), dan memecahkan teks
panjang kepada ayat supaya bacaan tidak terhenti. UI menunjukkan makluman
`profile.voiceNoSupport` bila peranti tiada enjin suara. Jika pengguna kata
butang baca "tak berfungsi", semak `voice.supported` dahulu — ia bukan pepijat
kod jika peranti tiada enjin TTS.

### Pemilih suara (v1.12.0)

Masalah sebenar pengguna: macOS **tiada** suara Melayu, jadi enjin jatuh ke suara
Indonesia (`id-ID`) dan sebutan berbunyi Indonesia. Penyelesaian ialah pemilih
suara dalam aplikasi (Profil ŌåÆ Pilih Suara):

- Pilihan disimpan dalam `settings.voiceMsUri` dan `settings.voiceEnUri` (URI
  suara, bukan indeks — indeks berubah antara sesi/peranti).
- `voice.setPreference('ms'|'en', uri|null)`; `null` bermakna automatik.
- Susunan pemilihan: pilihan pengguna (jika masih ada pada peranti) ŌåÆ padanan
  `ms-MY` ŌåÆ nama mengandungi "malay"/"melayu" ŌåÆ `id-ID` ŌåÆ senyap.
- Jika pilihan pengguna hilang dari peranti (contoh suara awan Edge dimatikan),
  ia diabaikan dengan selamat dan pemilihan automatik digunakan semula.
- UI mengelompokkan suara kepada tab Bahasa Melayu / Bahasa Inggeris dan melabel
  suara awan sebagai "Perlu internet" (`localService === false`).
- Amaran `profile.voiceWarnId` dipaparkan hanya apabila suara Indonesia benar-benar
  dipakai, supaya pengguna tahu sebutan mungkin berbunyi Indonesia.

Rujukan suara Melayu mengikut platform (untuk menyokong pengguna):

- Windows 11: suara sistem "Microsoft Rizwan" `[ms-MY]`; Edge ada
  "Microsoft Yasmin Online (Natural) - Malay (Malaysia)" `[ms-MY]`.
- macOS: tiada suara Melayu tersedia — pengguna perlu pilih suara lain atau
  terima amaran Indonesia.
- Linux (espeak-ng): menyertakan fail suara `ms` dan `id`.

Ujian: `node test-voice-picker.mjs` (jsdom, senarai suara tiruan bagi setiap
platform di atas).

## Bank soalan & kepelbagaian kertas (v1.13.0)

Kertas peperiksaan percubaan dijana daripada penjana + bank tambahan. Supaya
murid tidak melihat soalan yang sama berulang kali:

- `src/lib/generators/extra-*.ts` mengandungi `EXTRA_QUESTIONS` (jenis
  `ExtraTopic`) yang digabungkan dalam `extra-bank.ts`, kemudian dipakai oleh
  `generateQuestions()` dalam `src/data/catalog.ts` sebagai lapisan dedup
  (prompt dinormalkan, item bertindih dilangkau).
- `buildExamPaper(year, subject, seed, avoid?)` menerima senarai prompt
  percubaan lepas. Soalan baharu diutamakan; soalan lama hanya diambil sebagai
  sandaran apabila bank sesuatu subjek terlalu kecil — jadi kertas sentiasa
  cukup soalan.
- `Profile.lastExamPrompts` (disimpan oleh `saveExam`) menyimpan prompt kertas
  terakhir bagi setiap subjek. `MockExam` menghantarnya sebagai `avoid`.
- Setiap item dalam bank tambahan mesti ada 4 pilihan unik selepas normalisasi
  huruf kecil (lihat `cleanDistractors`). Elakkan pilihan yang hanya berbeza
  dari segi huruf besar/kecil.
- Ujian: `node verify-exam.mjs` (kepelbagaian + elak ulangan) dan
  `node verify-generators.mjs` (bank sihat).

## Warna, bunyi & animasi (aksesibiliti)

Mod paparan dikawal oleh atribut pada `<html>`: `data-theme` (cerah/gelap),
`data-calm` (tenang), `data-contrast` (kontras tinggi), `data-motion`
(gerakan). Semua ditetapkan dalam `src/state/store.tsx`; gaya dalam
`src/styles/theme.css`.

Peraturan penting tentang warna:

- Warna jenama/subjek dipakai dalam DUA peranan serentak: sebagai latar penuh
  dan sebagai teks atas permukaan. Satu nilai mesti lulus kedua-duanya.
- Teks di atas blok berwarna mesti guna `--on-fill`, bukan `#fff`. Dalam mod
  gelap blok itu terang, jadi `--on-fill` menjadi gelap (`#1a1630`). Jangan
  tulis `color: #fff` pada butang/cip/kunci jawapan.
- Tahap logam pada `result-hero` (emas/perak/gangsa) guna dakwat gelap
  `#2e2410`, bukan putih — logam itu cerah.
- `node audit-contrast.mjs` menguji 188 pasangan (4 mod x 47) dan mesti lulus
  WCAG AA. Jalankan selepas mengubah sebarang warna. Ia membaca token terus
  daripada `theme.css`, jadi nilai literal mesti dikemas kini dalam senarai
  `PAIRS` jika gradien tetap berubah.
- Jangan guna `var(--muted)` — tidak wujud; guna `var(--ink-soft)`.

Bunyi: `src/lib/audio.ts` (Web Audio API, sintetik sepenuhnya, selamat luar
talian). Semua nama bunyi dalam `SoundName` mesti ada pemanggil. Lencana
baharu memainkan `badge` dalam `Result.tsx` (ditangguh 700 ms supaya tidak
bertindih dengan bunyi markah).

Animasi: semua `@keyframes` dihormati oleh blok `data-motion='off'` dan
`prefers-reduced-motion`. Ujian: `node test-screens.mjs`,
`node test-desktop-layout.mjs`, `node test-voice-picker.mjs`.
