/**
 * Tips menjawab soalan ujian, mengikut tahun dan subjek.
 *
 * Teks BM ialah kandungan utama; `i18n.ts` memegang padanan bahasa Inggeris
 * bagi setiap kunci supaya antara muka kekal dwibahasa.
 */

import type { SubjectId, YearNum } from './types';

/** Satu tip menjawab. */
export interface ExamTip {
  /** Kunci terjemahan tajuk. */
  titleKey: string;
  /** Kunci terjemahan isi. */
  bodyKey: string;
  emoji: string;
}

/** Sekumpulan tip, biasanya bagi satu subjek atau satu tema. */
export interface ExamTipGroup {
  /** Kunci terjemahan nama kumpulan (tip am sahaja). */
  nameKey?: string;
  /** Subjek bagi kumpulan ini; nama dipaparkan melalui `subjectName()`. */
  subject?: SubjectId;
  emoji: string;
  tips: ExamTip[];
}

/** Tip am yang terpakai kepada semua subjek bagi satu tahun. */
export function generalTips(year: YearNum): ExamTipGroup {
  if (year <= 3) {
    return {
      nameKey: 'tips.group.general',
      emoji: '🌟',
      tips: [
        { titleKey: 'tips.g1a.title', bodyKey: 'tips.g1a.body', emoji: '📖' },
        { titleKey: 'tips.g1b.title', bodyKey: 'tips.g1b.body', emoji: '✏️' },
        { titleKey: 'tips.g1c.title', bodyKey: 'tips.g1c.body', emoji: '🙋' },
        { titleKey: 'tips.g1d.title', bodyKey: 'tips.g1d.body', emoji: '🧘' },
      ],
    };
  }
  return {
    nameKey: 'tips.group.general',
    emoji: '🌟',
    tips: [
      { titleKey: 'tips.g2a.title', bodyKey: 'tips.g2a.body', emoji: '⏱️' },
      { titleKey: 'tips.g2b.title', bodyKey: 'tips.g2b.body', emoji: '🔍' },
      { titleKey: 'tips.g2c.title', bodyKey: 'tips.g2c.body', emoji: '🚩' },
      { titleKey: 'tips.g2d.title', bodyKey: 'tips.g2d.body', emoji: '🔁' },
    ],
  };
}

const SUBJECT_TIPS: Record<SubjectId, ExamTipGroup> = {
  matematik: {
    subject: 'matematik',
    emoji: '🔢',
    tips: [
      { titleKey: 'tips.math1.title', bodyKey: 'tips.math1.body', emoji: '🧮' },
      { titleKey: 'tips.math2.title', bodyKey: 'tips.math2.body', emoji: '📐' },
      { titleKey: 'tips.math3.title', bodyKey: 'tips.math3.body', emoji: '📝' },
    ],
  },
  'bahasa-melayu': {
    subject: 'bahasa-melayu',
    emoji: '📚',
    tips: [
      { titleKey: 'tips.bm1.title', bodyKey: 'tips.bm1.body', emoji: '📄' },
      { titleKey: 'tips.bm2.title', bodyKey: 'tips.bm2.body', emoji: '🖊️' },
      { titleKey: 'tips.bm3.title', bodyKey: 'tips.bm3.body', emoji: '💡' },
    ],
  },
  english: {
    subject: 'english',
    emoji: '🇬🇧',
    tips: [
      { titleKey: 'tips.en1.title', bodyKey: 'tips.en1.body', emoji: '📖' },
      { titleKey: 'tips.en2.title', bodyKey: 'tips.en2.body', emoji: '🔤' },
      { titleKey: 'tips.en3.title', bodyKey: 'tips.en3.body', emoji: '✍️' },
    ],
  },
  sains: {
    subject: 'sains',
    emoji: '🔬',
    tips: [
      { titleKey: 'tips.sn1.title', bodyKey: 'tips.sn1.body', emoji: '🧪' },
      { titleKey: 'tips.sn2.title', bodyKey: 'tips.sn2.body', emoji: '👀' },
      { titleKey: 'tips.sn3.title', bodyKey: 'tips.sn3.body', emoji: '📊' },
    ],
  },
  sejarah: {
    subject: 'sejarah',
    emoji: '🏛️',
    tips: [
      { titleKey: 'tips.sj1.title', bodyKey: 'tips.sj1.body', emoji: '📅' },
      { titleKey: 'tips.sj2.title', bodyKey: 'tips.sj2.body', emoji: '🧠' },
      { titleKey: 'tips.sj3.title', bodyKey: 'tips.sj3.body', emoji: '📜' },
    ],
  },
  'pendidikan-islam': {
    subject: 'pendidikan-islam',
    emoji: '🕌',
    tips: [
      { titleKey: 'tips.pi1.title', bodyKey: 'tips.pi1.body', emoji: '📖' },
      { titleKey: 'tips.pi2.title', bodyKey: 'tips.pi2.body', emoji: '🤲' },
      { titleKey: 'tips.pi3.title', bodyKey: 'tips.pi3.body', emoji: '✍️' },
    ],
  },
};

/** Kumpulan tip bagi satu tahun: tip am dahulu, kemudian setiap subjek. */
export function tipsForYear(year: YearNum, subjects: SubjectId[]): ExamTipGroup[] {
  return [generalTips(year), ...subjects.map((s) => SUBJECT_TIPS[s])];
}

/** Bilangan tip keseluruhan bagi sesuatu tahun. */
export function tipCount(year: YearNum, subjects: SubjectId[]): number {
  return tipsForYear(year, subjects).reduce((n, g) => n + g.tips.length, 0);
}

export { SUBJECT_TIPS };
