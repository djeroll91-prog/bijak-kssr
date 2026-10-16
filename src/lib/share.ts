/** Paute kongsi kekal + utiliti papan keratan. */

/** Paute awam yang kekal. Boleh ditetapkan melalui VITE_SHARE_URL semasa bina. */
export function shareUrl(): string {
  const configured = import.meta.env.VITE_SHARE_URL as string | undefined;
  if (configured && configured.trim()) return configured.trim().replace(/\/+$/, '') + '/';
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin + '/';
  }
  return 'https://bijakkssr.app/';
}

/** Salin teks ke papan keratan, dengan sandaran untuk pelayar lama. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* jatuh balik di bawah */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
