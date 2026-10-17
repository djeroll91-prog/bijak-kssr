/**
 * Pilihan susun atur skrin untuk saluran web.
 *
 * APK Android sentiasa menggunakan susun atur telefon, jadi pilihan ini hanya
 * relevan dalam pelayar. Nilai disimpan pada attribute `data-layout` di <html>
 * supaya CSS boleh bertindak segera tanpa menunggu React.
 */

import { useCallback, useState } from 'react';

export type ScreenLayout = 'auto' | 'desktop' | 'phone';

const KEY = 'bijak-kssr/screen-layout';

/** Saluran semasa: `apk` untuk WebView Android, `web` untuk pelayar. */
export function shellChannel(): 'apk' | 'web' {
  try {
    return document.documentElement.dataset.shell === 'apk' ? 'apk' : 'web';
  } catch {
    return 'web';
  }
}

function read(): ScreenLayout {
  // APK tidak boleh menukar susun atur.
  if (shellChannel() === 'apk') return 'phone';
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'auto' || raw === 'desktop' || raw === 'phone') return raw;
  } catch {
    // Abaikan — gunakan lalai.
  }
  const current = document.documentElement.dataset.layout;
  if (current === 'desktop' || current === 'phone') return current;
  return 'auto';
}

/** Baca dan tetapkan susun atur skrin; perubahan disimpan untuk sesi seterusnya. */
export function useScreenLayout(): [ScreenLayout, (next: ScreenLayout) => void] {
  const [layout, setLayout] = useState<ScreenLayout>(read);

  const update = useCallback((next: ScreenLayout) => {
    if (shellChannel() === 'apk') return;
    document.documentElement.dataset.layout = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Abaikan — pilihan kekal untuk sesi ini sahaja.
    }
    setLayout(next);
  }, []);

  return [layout, update];
}
