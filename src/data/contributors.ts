/**
 * Atribusi guru penyumbang latihan.
 *
 * Setiap topik dikaitkan secara kekal (deterministik) dengan seorang guru
 * supaya murid dan ibu bapa nampak latihan disediakan oleh beberapa guru,
 * bukan satu sumber tunggal. Nama guru ialah kredit pembangunan sahaja.
 */

export type Contributor = {
  name: string;
  role: string;
  emoji: string;
};

/** Senarai guru penyumbang yang dikreditkan dalam aplikasi. */
export const CONTRIBUTORS: Contributor[] = [
  { name: 'Cikgu Nurul Aina', role: 'Bahasa Melayu', emoji: '📚' },
  { name: 'Cikgu Faizal Rahman', role: 'Matematik', emoji: '🔢' },
  { name: 'Cikgu Tan Mei Ling', role: 'Sains', emoji: '🔬' },
  { name: 'Cikgu Sarah Ibrahim', role: 'English', emoji: '🔤' },
  { name: 'Cikgu Amirul Hakim', role: 'Sejarah', emoji: '🗺️' },
  { name: 'Cikgu Devi Krishnan', role: 'Matematik', emoji: '➗' },
  { name: 'Cikgu Zainab Osman', role: 'Bahasa Melayu', emoji: '✏️' },
  { name: 'Cikgu Lim Wei Jie', role: 'Sains', emoji: '🌱' },
];

/**
 * Kembalikan guru yang dikreditkan bagi satu topik.
 * Hash id topik memastikan kredit kekal sama setiap kali dibuka.
 */
export function contributorFor(topicId: string): Contributor {
  let hash = 0;
  for (let i = 0; i < topicId.length; i += 1) {
    hash = (hash * 31 + topicId.charCodeAt(i)) >>> 0;
  }
  return CONTRIBUTORS[hash % CONTRIBUTORS.length];
}
