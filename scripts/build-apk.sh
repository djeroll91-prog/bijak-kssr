#!/usr/bin/env bash
# Bina APK Bijak KSSR tanpa Gradle (guna aapt2, javac, d8, zipalign, apksigner).
# Prasyarat: ANDROID_HOME menunjuk ke Android SDK, java pada PATH.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/android-app"
SDK="${ANDROID_HOME:?ANDROID_HOME mesti ditetapkan}"
BT="$SDK/build-tools/35.0.1"
PLATFORM="$SDK/platforms/android-34/android.jar"
OUT="$APP/build"
mkdir -p "$OUT/compiled" "$OUT/classes" "$OUT/dex"

echo "==> 1/7 salinan aset web ke assets/www"
rm -rf "$APP/src/main/assets/www"
mkdir -p "$APP/src/main/assets"
cp -r "$ROOT/dist" "$APP/src/main/assets/www"
# Buang artifak bina daripada salinan aset supaya ia tidak masuk ke dalam APK.
find "$APP/src/main/assets/www" -maxdepth 1 -type f \
  \( -name '*.apk' -o -name '*.zip' -o -name '*.idsig' \) -delete

echo "==> 2/7 kompil sumber (aapt2 compile)"
"$BT/aapt2" compile --dir "$APP/src/main/res" -o "$OUT/compiled/res.zip"

echo "==> 3/7 paut sumber + manifest (aapt2 link)"
"$BT/aapt2" link \
  -o "$OUT/base.apk" \
  -I "$PLATFORM" \
  --manifest "$APP/src/main/AndroidManifest.xml" \
  -A "$APP/src/main/assets" \
  --java "$OUT/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code 4 \
  --version-name 1.4.0 \
  "$OUT/compiled/res.zip"

echo "==> 4/7 kompil Java (javac)"
mkdir -p "$OUT/gen"
find "$APP/src/main/java" "$OUT/gen" -name '*.java' > "$OUT/sources.txt"
javac -source 8 -target 8 -bootclasspath "$PLATFORM" -classpath "$PLATFORM" \
  -d "$OUT/classes" @"$OUT/sources.txt" 2>&1 | grep -v 'bootstrap class path' || true

echo "==> 5/7 tukar ke DEX (d8)"
find "$OUT/classes" -name '*.class' > "$OUT/classes.txt"
"$BT/d8" --min-api 24 --output "$OUT/dex" @"$OUT/classes.txt"

echo "==> 6/7 bina APK akhir (tambah dex + zipalign + tandatangan)"
cp "$OUT/base.apk" "$OUT/unsigned.apk"
python3 - "$OUT" <<'PY'
import sys, os, zipfile
out = sys.argv[1]
dex_dir = os.path.join(out, 'dex')
apk = os.path.join(out, 'unsigned.apk')
with zipfile.ZipFile(apk, 'a', zipfile.ZIP_DEFLATED) as z:
    for name in sorted(os.listdir(dex_dir)):
        if name.endswith('.dex'):
            z.write(os.path.join(dex_dir, name), name)
            print('  +', name)
PY

KS="$APP/keystore/bijak.keystore"
mkdir -p "$APP/keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -v \
    -keystore "$KS" -alias bijakkssr \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass bijakkssr -keypass bijakkssr \
    -dname "CN=Bijak KSSR, OU=Pendidikan, O=Bijak KSSR, L=Kuala Lumpur, C=MY" >/dev/null 2>&1
fi

"$BT/zipalign" -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"
"$BT/apksigner" sign \
  --ks "$KS" --ks-pass pass:bijakkssr --key-pass pass:bijakkssr --ks-key-alias bijakkssr \
  --v4-signing-enabled false --out "$ROOT/dist/bijak-kssr.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify --print-certs "$ROOT/dist/bijak-kssr.apk" | head -4

echo "==> 7/7 bungkus pakej web (ZIP)"
python3 - "$ROOT/dist" <<'PY'
import sys, os, zipfile
root = sys.argv[1]
out = os.path.join(root, 'bijak-kssr-app.zip')
if os.path.exists(out):
    os.remove(out)
count = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for dirpath, _, files in os.walk(root):
        for f in files:
            if f.endswith(('.zip', '.apk', '.idsig')):
                continue
            full = os.path.join(dirpath, f)
            z.write(full, os.path.relpath(full, root))
            count += 1
print(f'  {count} fail -> {os.path.basename(out)} ({os.path.getsize(out)} bait)')
PY

echo "SIAP: $ROOT/dist/bijak-kssr.apk"
ls -la "$ROOT/dist/bijak-kssr.apk" "$ROOT/dist/bijak-kssr-app.zip"
