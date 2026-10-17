# AGENTS.md ŌĆö Bijak KSSR

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
- JAVA_HOME: `/usr/lib/jvm/java-21-openjdk-amd64`
- Komponen dipasang: `cmdline-tools/latest`, `platform-tools`, `platforms;android-34`,
  `build-tools;34.0.0`, `build-tools;35.0.1`

### Perangkap yang telah ditemui

1. **Guna `build-tools/35.0.1`, bukan 34.0.0.** `d8` dalam 34.0.0 (R8 8.2.2) ranap
   dengan `NullPointerException: Cannot invoke "String.length()"` apabila memproses
   kelas bersarang yang dikompil dengan JDK 21. Versi 35.0.1 berfungsi.
2. **Tiada Gradle diperlukan.** APK dibina terus dengan `aapt2 compile` ŌåÆ `aapt2 link`
   ŌåÆ `javac` ŌåÆ `d8` ŌåÆ `zipalign` ŌåÆ `apksigner`. Elak pergantungan muat turun besar.
3. **`zip` tiada dalam imej ini** ŌĆö masukkan `classes.dex` ke dalam APK guna
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

Deploy web: bina (`npm run build`) lalu salin `dist/` ke `docs/` dan push ke
`main`. GitHub Pages dicetak dari `main /docs`.

> **Perangkap deploy:** `docs/.nojekyll` tidak dihasilkan oleh `npm run build`.
> Selepas `rm -rf docs && cp -r dist docs`, pulihkan dengan
> `git checkout docs/.nojekyll`. Tanpanya GitHub Pages (Jekyll) mengabaikan
> folder `assets/` dan aplikasi gagal dimuat. Cetuskan bina semula melalui
`POST /repos/:owner/:repo/pages/builds` jika perlu.

## Struktur

- `src/screens/` ŌĆö skrin utama (Home, Subjects, Games, Progress, Profile)
- `src/lib/i18n.ts` ŌĆö kamus BM (`MS`) dan EN; kira-kira 221 kunci setiap satu
- `src/data/topics/` ŌĆö nota asas topik DSKP (374 nota)
- `src/data/notes-extra.ts` ŌĆö nota ringkas tambahan setiap topik (248 nota);
  digabungkan dalam `src/data/catalog.ts` semasa muat. Untuk tambah nota,
  letak kunci mengikut `id` topik dalam `EXTRA_NOTES`. Nota baharu perlu
  sepadan dengan `id` dalam `src/data/topics/*.ts` (semakan: tiada orphan).
- `src/data/contributors.ts` ŌĆö kredit guru penyumbang latihan. Setiap topik
  dipetakan secara deterministik (hash `id`) kepada seorang guru supaya kredit
  kekal. Semakan: `node verify-contributors.mjs`.
- `src/lib/review.ts` ŌĆö enjin ulangan berjarak (SRS) peringkat **topik**
  (bukan per soalan, kerana penjana menghasilkan soalan baharu setiap kali).
  Kotak Leitner (`BOX_INTERVALS`, `MAX_BOX=5`): lulus naik kotak dan
  menjarakkan tarikh, gagal turun kotak dan masuk bank kesilapan
  (`MISTAKE_LIMIT=8`). Kad lama dibina semula daripada sejarah percubaan
  semasa migrasi, jadi data murid sedia ada tidak hilang.
- `src/lib/dates.ts` ŌĆö pembantu tarikh (`todayKey`, `addDays`) untuk memecahkan
  kebergantungan bulat antara `storage.ts` dan `review.ts`.
- `android-app/` ŌĆö projek Android (manifest, `MainActivity.java`, res, assets/www)
- `scripts/build-apk.sh` ŌĆö saluran bina APK
- `scripts/make-icons.py` / `make-android-icons.py` ŌĆö penjana ikon
- `audit-i18n.mjs` ŌĆö semak kunci i18n yang hilang
- `verify-generators.mjs`, `verify-random.mjs`, `verify-plan.mjs`,
  `verify-contributors.mjs` — semakan enjin soalan, kerawakan, pelan
  harian dan kredit guru
- `verify-review.mjs` ŌĆö semakan enjin SRS (kotak, jarak, lapses)
- `verify-migrate.mjs` ŌĆö semakan migrasi data (rekod lama kekal, kad dibina)
- `test-review-ui.mjs` / `test-review-flow.mjs` ŌĆö ujian jsdom pada `dist/`:
  kad ulangan muncul, sesi berselang merentas topik, kad dikemas kini

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
butang baca "tak berfungsi", semak `voice.supported` dahulu ŌĆö ia bukan pepijat
kod jika peranti tiada enjin TTS.
