/**
 * Utiliti tarikh tempatan.
 *
 * Diasingkan daripada `storage.ts` supaya modul seperti `review.ts` boleh
 * guna tarikh tanpa menyebabkan kebergantungan bulat dengan storan.
 */

/** Tarikh hari ini sebagai kunci YYYY-MM-DD (waktu tempatan peranti). */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Tambah n hari kepada kunci YYYY-MM-DD, pulangkan kunci YYYY-MM-DD. */
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + n);
  return todayKey(dt);
}
