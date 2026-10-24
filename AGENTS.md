# AGENTS.md — Bijak KSSR

Aplikasi pembelajaran luar talian untuk murid sekolah rendah Malaysia (Tahun 1ŌĆō6),
mengikut silibus **KSSR Semakan 2017**. Web statik (Vite + React + TS + PWA) yang
dibungkus sebagai **APK Android** dan boleh dipasang sebagai PWA.

## Arahan penting

- Semua teks antara muka mesti dwibahasa (BM/EN) melalui `src/lib/i18n.ts`.
  Jangan sekali-kali menulis rentetan Bahasa Melayu secara keras dalam komponen.
- Semua aktiviti mesti ada kesan bunyi (`src/lib/audio.ts` → `sound.play(...)`) dan animasi.
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
2. **Tiada Gradle diperlukan.** APK dibina terus dengan `aapt2 compile` → `aapt2 link`
   → `javac` → `d8` → `zipalign` → `apksigner`. Elak pergantungan muat turun besar.
3. **`zip` tiada dalam imej ini** — masukkan `classes.dex` ke dalam APK guna
   `zipfile` Python (APK ialah fail ZIP biasa).
4. **`/dev/kvm` tiada**, jadi emulator Android tidak boleh dijalankan. Sahkan APK
   secara statik sahaja: `aapt2 dump badging`, `apksigner verify`, `dexdump -f`,
   dan pastikan setiap aset yang dirujuk `index.html` wujud dalam APK.
4b. **Menyediakan SDK Android dari kosong (resepi disemak 2026).** Imej ini
   tiada `java` dan tiada SDK. Resepi yang berjaya:
   ```bash
   sudo apt-get install -y openjdk-21-jdk-headless   # JDK 21 (17 tiada dalam trixie)
   curl -sL -o /tmp/cmdtools.zip \
     https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
   mkdir -p ~/android-sdk/cmdline-tools
   unzip -q /tmp/cmdtools.zip -d /tmp/ct && mv /tmp/ct/cmdline-tools ~/android-sdk/cmdline-tools/latest
   chmod +x ~/android-sdk/cmdline-tools/latest/bin/*
   export ANDROID_HOME=~/android-sdk
   export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
   yes | sdkmanager --licenses                      # WAJIB sebelum --install
   sdkmanager --install "build-tools;35.0.1" "platforms;android-34"
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
   bash scripts/build-apk.sh
   ```
   Perangkap: `commandlinetools` diekstrak tanpa bit laksana (chmod perlu);
   `sdkmanager --install` gagal senyap sehingga lesen diterima; URL muat turun
   `build-tools` langsung memberi 404 - guna sdkmanager.

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
> `403 Resource not accessible by integration`. Untuk menerbitkan, minta
> pengguna berikan PAT klasik (`github_pat_...`) dan gunakannya sekali sahaja:
>
> ```bash
> GIT_TERMINAL_PROMPT=0 git push "https://x-access-token:$GH_PAT@github.com/djeroll91-prog/bijak-kssr.git" main
> ```
>
> Jangan simpan PAT dalam `git remote set-url` — ia akan tersimpan dalam
> `.git/config` dan kekal dalam sejarah kerja. Selepas push, ingatkan
> pengguna supaya memutarkan token kerana ia terdedah dalam log perbualan.

> **Perangkap release:** `releases/latest/download/...` hanya menunjuk ke
> artifak baharu selepas release dicipta. Menaikkan versi tanpa mencipta
> release bermakna pautan kekal menghantar APK LAMA walaupun Pages sudah
> terkini. Selepas setiap push: cipta release untuk tag baharu, muat naik
> `dist/bijak-kssr.apk` dan `dist/bijak-kssr-app.zip`, kemudian sahkan
> `versionCode` daripada pautan `releases/latest` (bukan hanya saiz fail —
> saiz boleh datang daripada cache CDN).

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
  "Subjek → Matematik → topik → Mula Belajar" kadangkala melebihi `sleep(700)`
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
Contoh pembetulan yang telah dibuat: `ketik` → `tekan`, `tukat` → `tukar`,
`Paute` → `Pautan`. Sebelum terbit, imbas `src/lib/i18n.ts` dan `src/data/`
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
suara terbaik yang ada (ms → nama "Malay" → id → null), dan memecahkan teks
panjang kepada ayat supaya bacaan tidak terhenti. UI menunjukkan makluman
`profile.voiceNoSupport` bila peranti tiada enjin suara. Jika pengguna kata
butang baca "tak berfungsi", semak `voice.supported` dahulu — ia bukan pepijat
kod jika peranti tiada enjin TTS.

### Pemilih suara (v1.12.0)

Masalah sebenar pengguna: macOS **tiada** suara Melayu, jadi enjin jatuh ke suara
Indonesia (`id-ID`) dan sebutan berbunyi Indonesia. Penyelesaian ialah pemilih
suara dalam aplikasi (Profil → Pilih Suara):

- Pilihan disimpan dalam `settings.voiceMsUri` dan `settings.voiceEnUri` (URI
  suara, bukan indeks — indeks berubah antara sesi/peranti).
- `voice.setPreference('ms'|'en', uri|null)`; `null` bermakna automatik.
- Susunan pemilihan: pilihan pengguna (jika masih ada pada peranti) → padanan
  `ms-MY` → nama mengandungi "malay"/"melayu" → `id-ID` → senyap.
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

## Cara tackle, langkah kerja & garis nombor (v1.18.0)

Tiga ciri membantu murid *faham cara menjawab*, bukan sekadar meneka jawapan.

### 1. Enjin langkah "Cara jawab" — `src/lib/steps.ts`

- `deriveSteps(q, { subject, year })` menukar gesaan matematik kepada langkah
  kerja (bundar, nilai tempat, tambah/tolak menegak dengan kumpul semula dan
  pinjam, darab, bahagi, tukar unit, masa, wang, pecahan/peratus, luas).
- **Pengadang keselamatan wajib:** setiap pengendali mengira jawapannya sendiri
  dan membandingkan dengan `q.answer`. Jika tidak sepadan, ia memulangkan
  `undefined`. Jangan sekali-kali keluarkan langkah tanpa semakan ini — langkah
  salah lebih memudaratkan daripada tiada langkah.
- Soalan subjek `english` sengaja dilangkau (langkah BM pada gesaan Inggeris
  mengelirukan).
- Nombor dalam gesaan boleh ada pemisah ribuan (`8,660`). Pengendali mesti
  menerima koma; ini punca utama liputan rendah sebelum ini.
- `roundingModel(prompt)` mendedahkan geometri pembundaran (lower/upper/digit/
  decider) dan dikongsi oleh langkah bertulis serta animasi garis nombor, jadi
  ayat dan gambar sentiasa bercakap tentang nombor yang sama.
- Liputan semasa: 427/4730 soalan boleh kira (~9%), 28/200 topik.
- Ujian: `node verify-steps.mjs` — WAJIB lulus sebelum setiap keluaran.

### 2. Strategi menjawab — `src/data/strategies.ts`

- `strategyForTopic(topicId, subject, year)` memulangkan tajuk + langkah +
  kata kunci. Strategi khusus topik (pembundaran T2–T6) menggantikan tajuk dan
  langkah subjek, tetapi **mewarisi** `keywords` subjek. Tanpa warisan ini,
  murid yang membuka bab pembundaran kehilangan rujukan kata kunci matematik.
- Teks dipandu kunci i18n (`strat.*`), jadi tiada rentetan BM berkod keras dalam
  komponen.
- Ujian: `node test-strategy.mjs` (jsdom; menyemak kad strategi, kata kunci,
  garis nombor, dan pertukaran bahasa BM/EN).

### 3. Animasi garis nombor — `src/components/NumberLine.tsx`

- Menunjukkan di mana nombor berada antara dua gandaan, kemudian menggerakkan
  penanda ke jawapan. Ini mengajar *mengapa* bundar ke atas/bawah, berbanding
  hanya membaca peraturan.
- Satu-satunya sumber gerakan ialah peralihan `left` pada `.numline-marker`.
  Mod tenang (`data-calm=on`), gerakan mati (`data-motion=off`) dan
  `prefers-reduced-motion` mematikannya.
- Garis nombor hanya dipaparkan pada topik yang notasinya menyebut "bundar".
  Contoh setiap tahun dalam `ROUND_SAMPLES` (Notes.tsx) mesti kekal sepadan
  dengan `roundingModel`.
- Ujian: `node verify-round-notes.mjs` (semak contoh kerja dalam nota) dan
  `node test-strategy.mjs`.

### Versi aplikasi

`src/screens/Profile.tsx` memaparkan `__APP_VERSION__`, disuntik oleh Vite
daripada `package.json` (`define` dalam `vite.config.ts`). Jangan kodkan keras
versi dalam komponen — ia akan lapuk tanpa disedari.

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
- `node audit-contrast.mjs` menguji 192 pasangan (4 mod x 48) dan mesti lulus
  WCAG AA. Jalankan selepas mengubah sebarang warna. Ia membaca token terus
  daripada `theme.css`, jadi nilai literal mesti dikemas kini dalam senarai
  `PAIRS` jika gradien tetap berubah.
- **Token `--brand` tidak selamat sebagai teks atas `--brand-soft`.** Ia hanya
  4.09:1 (cerah) dan 4.06:1 (tenang). Guna `--brand-deep` (5.16/5.12) untuk
  teks kecil. Ini pernah menjadi pepijat pada label nav aktif; `audit-contrast`
  tidak menangkapnya kerana ia hanya menguji `--brand-deep` atas `--brand-soft`.
- **Jalur nav bawah mesti mengikut tema.** Latar asas ialah putih 0.94, jadi
  tanpa penimpa `:root[data-theme='dark'] .bottom-nav` jalur itu kekal cerah
  dalam UI gelap dan teks nav jatuh ke 2.9:1. Mod bahan (`data-skin`) turut
  menetapkan semula jalur ini.
- Jangan guna `var(--muted)` — tidak wujud; guna `var(--ink-soft)`.

### Claymorphism (kulit UI semasa)

Seluruh UI memakai gaya **claymorphism**: elemen gebu seperti tanah liat dengan
sorot putih di tepi atas, bayang gelap lembut di tepi bawah-dalam, dan bayang
luaran berlapis.

Tiga peraturan yang mudah dilanggar:

- **Permukaan tidak boleh putih tulen.** Sorot putih hanya kelihatan jika
  permukaan lebih gelap daripada putih. Sebab itu `--surface: #fff8f0` dan
  `--bg: #f7ead9` (krim hangat). Menetapkan semula `--surface: #ffffff` akan
  mematikan kesan clay pada semua kad tanpa sebarang ujian gagal — jadi jangan.
- **Kedalaman clay ada dalam token, bukan pada komponen.** Tiga resipi:
  `--clay-out-1/2/3` (bayang luaran), `--clay-hi` / `--clay-hi-sm` (sorot +
  bayang dalam), `--clay-btn` / `--clay-btn-press` (butang berwarna),
  `--clay-press` (kawasan tenggelam). `--sh-1/2/3` menggabungkan lapisan luar
  dan dalam. Ubah kedalaman di satu tempat sahaja.
- **Mod gelap guna token clay sendiri.** Blok `:root[data-theme='dark']`
  mentakrifkan `--clay-dark-hi` / `--clay-dark-hi-sm` (sorot putih halus 0.11,
  bukan 1.0) dan `--sh-1/2/3` gelap yang berasingan. Sorot putih pekat pada
  latar gelap menjadi gumpalan kelabu berkabus — sebab itu ia tidak dikongsi.

Jejari juga dibesarkan untuk bentuk gebu: `--r-sm: 14px`, `--r-md: 22px`,
`--r-lg: 30px`, `--r-xl: 40px`.

`audit-contrast.mjs` TIDAK menguji bayang atau jejari, jadi perubahan clay
tidak akan ditangkap olehnya. Sahkan secara visual: bina, serve `dist/` pada
port baharu (origin baharu mengelak cache service worker PWA), dan periksa
bahawa tepi atas kad lebih cerah daripada tepi bawah.

### Gaya bahan (skin)

`data-skin` pada `<html>` menukar **bingkai chrome sahaja**: `clay` (lalai),
`leather` (Kulit), `book` (Buku latihan). Nilai disimpan dalam
`settings.skin` dan dipilih dalam `Profile.tsx`.

Peraturan yang mudah dilanggar:

- **Bahan tidak boleh menyentuh permukaan kandungan.** Ia hanya mewarnai
  `.topbar`, `.bottom-nav`, dan bingkai luar `.phone`/`.app-shell`. Kad,
  nota, dan butang jawapan mesti kekal permukaan clay legap. Jika tekstur
  bahan meresap ke bawah teks, kebolehbacaan jatuh tanpa sebarang ujian gagal.
- **Token bahan:** `--skin-page`, `--skin-shell`, `--skin-band`,
  `--skin-band-deep`, `--skin-band-ink`, `--skin-band-soft`,
  `--skin-band-active`. Setiap palet mesti lulus 4.5:1 untuk teks jalur.
- **Mod tenang mematikan tekstur.** `:root[data-calm='on']` menanggalkan
  gradien/jahitan bahan dan memulihkan jalur cerah. Jangan lupa jalur ini,
  jika tidak pengguna mod tenang terperangkap dengan jalur gelap.
- `node audit-contrast.mjs` menyemak token bahan (48 pasangan). Ia membaca
  fail CSS, jadi ia membuktikan palet ditakrifkan — bukan bahawa pelayar
  memilihnya.
- `node audit-skin-computed.mjs` memuatkan APL SEBENAR (React + CSS dibina) di
  dalam iframe seorigin, kemudian membaca `getComputedStyle` daripada Chromium.
  Ia mengukur semua 15 kombinasi (3 bahan x tema x mod tenang x kontras) dalam
  SATU pelancaran pelayar, jadi ia pantas. Ia membuktikan tiga perkara:
  bingkai bertukar bahan, permukaan kandungan kekal legap, dan setiap pasangan
  teks/latar lulus WCAG AA. Jalankan `npm run build` dahulu.
  Ia memulakan pelayan statiknya sendiri, jadi ia tidak bergantung pada
  `npm run dev` yang sedang berjalan.
  **Perangkap:** jangan guna `execFileSync` untuk memanggil Chromium apabila
  pelayan itu berjalan dalam proses yang sama. `execFileSync` menyekat gelung
  peristiwa Node, jadi pelayan tidak dapat membalas dan Chromium menunggu
  sehingga tamat masa. Guna `spawn` tak segerak.
  Satu lagi perangkap: melancarkan Chromium sekali per kombinasi sangat lambat
  (13 x ~60 s). Muatkan apl sekali, kemudian tukar `data-skin`/`data-theme`/
  `data-calm`/`data-contrast` pada `<html>` dan baca semula.

Bunyi: `src/lib/audio.ts` (Web Audio API, sintetik sepenuhnya, selamat luar
talian). Semua nama bunyi dalam `SoundName` mesti ada pemanggil. Lencana
baharu memainkan `badge` dalam `Result.tsx` (ditangguh 700 ms supaya tidak
bertindih dengan bunyi markah).

Animasi: semua `@keyframes` dihormati oleh blok `data-motion='off'` dan
`prefers-reduced-motion`. Ujian: `node test-screens.mjs`,
`node test-desktop-layout.mjs`, `node test-voice-picker.mjs`.

## Penjana soalan: bank fakta mesti diacak

Penjana berasaskan bank fakta (contoh `generators/pendidikan-islam.ts`)
mesti mengacak bank dengan `rng` SEBELUM memilih item:

```ts
const facts = rng.shuffle(b.facts);   // bukan b.facts[i % b.facts.length]
```

Jika tidak, setiap benih menghasilkan urutan soalan yang sama. Kertas
peperiksaan kemudian bertindih antara percubaan walaupun benih berbeza, dan
`verify-exam.mjs` gagal dengan "kertas terlalu serupa" serta "terlalu banyak
ulangan selepas elak". Kesannya paling teruk pada bank kecil (Pendidikan
Islam: ~9 fakta/topik).

Dua lagi peraturan untuk soalan padan (`match`):

- Label kiri mesti unik dalam satu soalan, jika tidak ada lebih daripada satu
  jawapan betul. Penjana PI menapis ini melalui `dedupeLeft` selepas mengacak.
- Label kanan juga mesti unik, kerana setiap kanan dipaparkan sekali sahaja.
  Semak dengan `node verify-match.mjs` dan `node verify-generators.mjs`.

Lembaran latihan (`screens/Worksheet.tsx`) dan had sesi harian
(`lib/plan.ts` → `waitingTomorrow`) diuji oleh
`node test-worksheet-daily.mjs`.

## Bina APK

`scripts/build-apk.sh` bina APK tanpa Gradle. Ia perlukan `ANDROID_HOME`
dengan `build-tools/35.0.1` dan `platforms/android-34`, serta `javac` dan
`keytool` pada PATH.

Pasang dalam bekas Debian 13:

```bash
sudo apt-get install -y openjdk-21-jdk-headless unzip
curl -sSL -o /tmp/clt.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
sudo mkdir -p /opt/android-sdk/cmdline-tools && sudo chown -R $(id -u):$(id -g) /opt/android-sdk
unzip -q /tmp/clt.zip -d /tmp/clt && mv /tmp/clt/cmdline-tools /opt/android-sdk/cmdline-tools/latest
export ANDROID_HOME=/opt/android-sdk
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
yes | sdkmanager --licenses
sdkmanager "build-tools;35.0.1" "platforms;android-34"
```

Naikkan `version` dalam `package.json` SEBELUM membina. Android enggan
memasang APK dengan version-code sama atau lebih rendah, dan version-code
dikira daripada `version` (`major*10000 + minor*100 + patch`). Selepas
binaan, `dist/bijak-kssr.apk` dan `dist/bijak-kssr-app.zip` dihasilkan;
salin `dist/.` ke `docs/` untuk penerbitan GitHub Pages.

Sahkan APK benar-benar terkini, bukan hanya wujud:

```bash
python3 -c "
import zipfile;z=zipfile.ZipFile('dist/bijak-kssr.apk')
js=[n for n in z.namelist() if 'assets/www/assets/index-' in n and n.endswith('.js')][0]
d=z.read(js).decode('utf-8','ignore');print(js, d.count('Lembaran'), d.count('daily-lock'))
"
PAYLOAD_DIR=/tmp/apk-payload node test-apk-load.mjs
```

`test-apk-load.mjs` membaca aset daripada APK yang telah diekstrak. Sediakan
muatan dengan `unzip -q dist/bijak-kssr.apk -d /tmp/apk-payload && cp -r
/tmp/apk-payload/assets/www/. /tmp/apk-payload/`, kemudian tetapkan
`PAYLOAD_DIR=/tmp/apk-payload`.
