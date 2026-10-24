/**
 * Strategi menjawab soalan mengikut subjek dan bab.
 *
 * Guru di seluruh Malaysia mengajar murid mengecam KATA KUNCI dalam soalan
 * sebelum mengira. Modul ini menyimpan strategi itu supaya murid melihat
 * pendekatan yang sama seperti di dalam kelas, bukan sekadar jawapan.
 *
 * Kunci i18n memegang teks, jadi antara muka kekal dwibahasa dan tiada
 * rentetan BM berkod keras di dalam komponen.
 */

import type { SubjectId, YearNum } from './types';

/** Satu langkah pendekatan menjawab. */
export interface StrategyStep {
  /** Kunci terjemahan bagi langkah ini. */
  key: string;
  emoji: string;
}

/** Sepasang kata kunci soalan dan maksud matematiknya. */
export interface Keyword {
  word: string;
  /** Kunci terjemahan bagi maksud kata kunci. */
  key: string;
  emoji: string;
}

/** Strategi menjawab bagi satu subjek dan peringkat tahun. */
export interface Strategy {
  /** Kunci terjemahan tajuk strategi. */
  titleKey: string;
  steps: StrategyStep[];
  keywords?: Keyword[];
}

/**
 * Kata kunci matematik yang paling kerap muncul dalam kertas soalan.
 *
 * Ini senarai yang guru sendiri tekankan, jadi murid boleh mengaitkan
 * soalan cerita dengan operasi yang betul tanpa meneka.
 */
const MATH_KEYWORDS: Keyword[] = [
  { word: 'jumlah', key: 'strat.kw.total', emoji: '➕' },
  { word: 'beza', key: 'strat.kw.diff', emoji: '➖' },
  { word: 'baki', key: 'strat.kw.left', emoji: '💸' },
  { word: 'setiap / sama rata', key: 'strat.kw.each', emoji: '➗' },
  { word: 'kali / setiap kumpulan', key: 'strat.kw.times', emoji: '✖️' },
  { word: 'semua sekali', key: 'strat.kw.all', emoji: '🧮' },
  { word: 'berapakah jumlah harga', key: 'strat.kw.cost', emoji: '💰' },
];

/** Langkah generik untuk semua subjek: baca, tanda, jawab, semak. */
function coreSteps(): StrategyStep[] {
  return [
    { key: 'strat.s1', emoji: '👀' },
    { key: 'strat.s2', emoji: '🖍️' },
    { key: 'strat.s3', emoji: '✏️' },
    { key: 'strat.s4', emoji: '✅' },
  ];
}

/**
 * Strategi bagi satu subjek.
 *
 * Matematik mendapat kata kunci kerana operasi ditentukan oleh perkataan
 * dalam soalan cerita. Subjek lain menumpu pada cara membaca soalan.
 */
export function strategyFor(subject: SubjectId, _year: YearNum): Strategy {
  switch (subject) {
    case 'matematik':
      return {
        titleKey: 'strat.math.title',
        steps: [
          { key: 'strat.math.s1', emoji: '👀' },
          { key: 'strat.math.s2', emoji: '🖍️' },
          { key: 'strat.math.s3', emoji: '✏️' },
          { key: 'strat.math.s4', emoji: '🔁' },
        ],
        keywords: MATH_KEYWORDS,
      };
    case 'bahasa-melayu':
      return {
        titleKey: 'strat.bm.title',
        steps: [
          { key: 'strat.bm.s1', emoji: '📖' },
          { key: 'strat.bm.s2', emoji: '🖍️' },
          { key: 'strat.bm.s3', emoji: '✍️' },
          { key: 'strat.bm.s4', emoji: '✅' },
        ],
      };
    case 'english':
      return {
        titleKey: 'strat.en.title',
        steps: [
          { key: 'strat.en.s1', emoji: '📖' },
          { key: 'strat.en.s2', emoji: '🖍️' },
          { key: 'strat.en.s3', emoji: '✍️' },
          { key: 'strat.en.s4', emoji: '✅' },
        ],
      };
    case 'sains':
      return {
        titleKey: 'strat.sn.title',
        steps: [
          { key: 'strat.sn.s1', emoji: '🔍' },
          { key: 'strat.sn.s2', emoji: '🧠' },
          { key: 'strat.sn.s3', emoji: '✏️' },
          { key: 'strat.sn.s4', emoji: '✅' },
        ],
      };
    case 'sejarah':
      return {
        titleKey: 'strat.sj.title',
        steps: [
          { key: 'strat.sj.s1', emoji: '🕰️' },
          { key: 'strat.sj.s2', emoji: '🖍️' },
          { key: 'strat.sj.s3', emoji: '🔢' },
          { key: 'strat.sj.s4', emoji: '✅' },
        ],
      };
    case 'pendidikan-islam':
      return {
        titleKey: 'strat.pi.title',
        steps: [
          { key: 'strat.pi.s1', emoji: '📖' },
          { key: 'strat.pi.s2', emoji: '🖍️' },
          { key: 'strat.pi.s3', emoji: '🤲' },
          { key: 'strat.pi.s4', emoji: '✅' },
        ],
      };
    default:
      return { titleKey: 'strat.general.title', steps: coreSteps() };
  }
}

/**
 * Strategi khusus topik, mengatasi strategi subjek.
 *
 * Setakat ini hanya pembundaran, kerana ia topik yang paling kerap
 * mengelirukan murid dan paling kerap ditanya ibu bapa.
 */
const TOPIC_STRATEGY: Record<string, Strategy> = {
  'mt2-nombor-hingga-1000': {
    titleKey: 'strat.round.title',
    steps: [
      { key: 'strat.round.s1', emoji: '🎯' },
      { key: 'strat.round.s2', emoji: '🔍' },
      { key: 'strat.round.s3', emoji: '5️⃣' },
      { key: 'strat.round.s4', emoji: '0️⃣' },
    ],
  },
  'mt3-nombor-hingga-10000': {
    titleKey: 'strat.round.title',
    steps: [
      { key: 'strat.round.s1', emoji: '🎯' },
      { key: 'strat.round.s2', emoji: '🔍' },
      { key: 'strat.round.s3', emoji: '5️⃣' },
      { key: 'strat.round.s4', emoji: '0️⃣' },
    ],
  },
  'mt4-nombor-hingga-100000': {
    titleKey: 'strat.round.title',
    steps: [
      { key: 'strat.round.s1', emoji: '🎯' },
      { key: 'strat.round.s2', emoji: '🔍' },
      { key: 'strat.round.s3', emoji: '5️⃣' },
      { key: 'strat.round.s4', emoji: '0️⃣' },
    ],
  },
  'mt5-nombor-juta': {
    titleKey: 'strat.round.title',
    steps: [
      { key: 'strat.round.s1', emoji: '🎯' },
      { key: 'strat.round.s2', emoji: '🔍' },
      { key: 'strat.round.s3', emoji: '5️⃣' },
      { key: 'strat.round.s4', emoji: '0️⃣' },
    ],
  },
  'mt6-nombor-juta': {
    titleKey: 'strat.round.title',
    steps: [
      { key: 'strat.round.s1', emoji: '🎯' },
      { key: 'strat.round.s2', emoji: '🔍' },
      { key: 'strat.round.s3', emoji: '5️⃣' },
      { key: 'strat.round.s4', emoji: '0️⃣' },
    ],
  },
};

/**
 * Strategi untuk satu topik.
 *
 * Strategi khusus topik menggantikan tajuk dan langkah subjek kerana ia lebih
 * tepat untuk bab itu, tetapi ia MEWARISI senarai kata kunci subjek. Tanpa
 * warisan ini, murid yang membuka bab pembundaran akan kehilangan rujukan
 * kata kunci matematik yang masih berguna untuk soalan lain dalam bab sama.
 */
export function strategyForTopic(
  topicId: string,
  subject: SubjectId,
  year: YearNum,
): Strategy {
  const base = strategyFor(subject, year);
  const override = TOPIC_STRATEGY[topicId];
  if (!override) return base;
  return {
    ...override,
    keywords: override.keywords ?? base.keywords,
  };
}
