/**
 * Katalog sukatan pelajaran Bijak KSSR.
 * Menggabungkan topik (DSKP) dengan penjana soalan dan mengesahkan
 * setiap topik mempunyai penjana yang sah.
 */

import type { Question, SubjectId, Topic, YearNum } from './types';
import { MATEMATIK_TOPICS_12 } from './topics/matematik-12';
import { MATEMATIK_TOPICS_36 } from './topics/matematik-36';
import { BAHASA_MELAYU_TOPICS, ENGLISH_TOPICS } from './topics/bm-en';
import { SAINS_TOPICS, SEJARAH_TOPICS } from './topics/sains-sejarah';
import { PI_TOPICS } from './topics/pendidikan-islam';
import { EXTRA_NOTES } from './notes-extra';
import { MATEMATIK_GENERATORS } from '../lib/generators/matematik';
import { MATEMATIK_GENERATORS_34 } from '../lib/generators/matematik2';
import { MATEMATIK_GENERATORS_56 } from '../lib/generators/matematik3';
import { BAHASA_MELAYU_GENERATORS } from '../lib/generators/bahasa-melayu';
import { ENGLISH_GENERATORS } from '../lib/generators/english';
import { SAINS_GENERATORS } from '../lib/generators/sains';
import { SEJARAH_GENERATORS } from '../lib/generators/sejarah';
import { PENDIDIKAN_ISLAM_GENERATORS } from '../lib/generators/pendidikan-islam';
import { EXTRA_QUESTIONS } from '../lib/generators/extra-bank';
import type { Generator } from '../lib/generators/shared';
import { defaultHint, mcq } from '../lib/generators/shared';
import { deriveSteps } from '../lib/steps';
import { Rng } from '../lib/rng';

export const ALL_TOPICS: Topic[] = [
  ...MATEMATIK_TOPICS_12,
  ...MATEMATIK_TOPICS_36,
  ...BAHASA_MELAYU_TOPICS,
  ...ENGLISH_TOPICS,
  ...SAINS_TOPICS,
  ...SEJARAH_TOPICS,
  ...PI_TOPICS,
].map((t) => {
  const extra = EXTRA_NOTES[t.id];
  return extra ? { ...t, notes: [...t.notes, ...extra] } : t;
});

const GENERATORS: Record<string, Generator> = {
  ...MATEMATIK_GENERATORS,
  ...MATEMATIK_GENERATORS_34,
  ...MATEMATIK_GENERATORS_56,
  ...BAHASA_MELAYU_GENERATORS,
  ...ENGLISH_GENERATORS,
  ...SAINS_GENERATORS,
  ...SEJARAH_GENERATORS,
  ...PENDIDIKAN_ISLAM_GENERATORS,
};

/** Statistik yang dipaparkan di skrin maklumat. */
export function catalogStats() {
  const years = [1, 2, 3, 4, 5, 6] as const;
  let questions = 0;
  for (const t of ALL_TOPICS) {
    const g = GENERATORS[t.generator];
    if (g) questions += g(t.year, new Rng(1), 8).length;
  }
  return {
    topics: ALL_TOPICS.length,
    subjects: new Set(ALL_TOPICS.map((t) => t.subject)).size,
    years: years.length,
    /** Anggaran kombinasi soalan yang boleh dijana. */
    questionTemplates: questions,
  };
}

export function topicsFor(subject: SubjectId, year: YearNum): Topic[] {
  return ALL_TOPICS.filter((t) => t.subject === subject && t.year === year);
}

export function topicById(id: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function hasGenerator(id: string): boolean {
  return Boolean(GENERATORS[id]);
}

/**
 * Jana satu set soalan untuk topik tertentu.
 * Benih baharu menghasilkan set yang berbeza setiap sesi.
 *
 * Setiap soalan diberi petunjuk (hint) melalui `defaultHint` supaya murid
 * yang tersekat sentiasa ada bantuan sebelum menjawab, walaupun penjana
 * asal tidak menyediakan hint khusus.
 */
export function generateQuestions(
  topicId: string,
  count: number,
  seed?: number,
): Question[] {
  const topic = topicById(topicId);
  if (!topic) return [];
  const gen = GENERATORS[topic.generator];
  if (!gen) return [];
  const rng = new Rng(seed ?? Rng.sessionSeed());
  const questions = gen(topic.year, rng, count);

  // Bank tambahan menambah kedalaman topik yang asalnya kecil.
  const extra = EXTRA_QUESTIONS[topicId];
  if (extra) {
    const seen = new Set(questions.map((q) => normPrompt(q.prompt)));
    for (const [prompt, answer, distractors] of extra.items) {
      const key = normPrompt(prompt);
      if (seen.has(key)) continue;
      seen.add(key);
      questions.push(
        mcq(rng, {
          prefix: topicId,
          prompt,
          answer,
          distractors,
          explanation: `${answer} — jawapan yang betul.`,
          emoji: extra.emoji,
          cols: 1,
        }),
      );
    }
  }

  // Pastikan turutan rawak dan tiada id bertindih.
  const shuffled = rng.shuffle(questions);
  return shuffled.map((q, i) => ({
    ...q,
    id: `${topicId}#${seed ?? 0}#${i}`,
    hint: defaultHint(q),
    // Isi langkah "cara jawab" apabila penjana tidak menyediakannya. Fungsi
    // ini mengira sendiri dan hanya menerima hasil yang sepadan dengan
    // jawapan rasmi, jadi langkah salah tidak boleh terpapar.
    steps: deriveSteps(q, { subject: topic.subject, year: topic.year }),
  }));
}

const normPrompt = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** Senarai mata pelajaran yang sah untuk tahun tertentu. */
export function subjectsForYear(year: YearNum): SubjectId[] {
  const ids = new Set<SubjectId>();
  if (topicsFor('matematik', year).length > 0) ids.add('matematik');
  for (const t of ALL_TOPICS) if (t.year === year) ids.add(t.subject);
  return [...ids];
}
