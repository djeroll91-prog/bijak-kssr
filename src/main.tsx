import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/theme.css';

/**
 * Kesan saluran: APK Android memuatkan halaman dari hos maya
 * `appassets.androidplatform.net` dalam WebView, manakala PWA dibuka dalam
 * pelayar biasa. APK sentiasa mendapat susun atur telefon supaya pengalaman
 * aplikasi tidak berubah; hanya pelayar mendapat susun atur desktop.
 */
function detectShell(): 'apk' | 'web' {
  try {
    return location.hostname === 'appassets.androidplatform.net' ? 'apk' : 'web';
  } catch {
    return 'web';
  }
}

const LAYOUT_KEY = 'bijak-kssr/screen-layout';

const root = document.documentElement;
const shell = detectShell();
root.dataset.shell = shell;

// Susun atur: APK dikunci kepada telefon. Pelayar menghormati pilihan yang
// disimpan, jika tidak lalai 'auto' (desktop pada skrin lebar).
let layout: 'auto' | 'desktop' | 'phone' = 'auto';
if (shell === 'apk') {
  layout = 'phone';
} else {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved === 'auto' || saved === 'desktop' || saved === 'phone') layout = saved;
  } catch {
    // Abaikan — guna lalai.
  }
}
root.dataset.layout = layout;

const el = document.getElementById('root');
if (!el) throw new Error('Root element not found');

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
