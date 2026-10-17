/**
 * Enjin peperiksaan percubaan (mock exam).
 *
 * Membina satu "kertas" penuh untuk sesuatu tahun: soalan diambil daripada
 * SEMUA topik tahun itu (bukan satu topik sahaja), diselang-selikan antara
 * subjek supaya murid tidak dapat meneka corak. Markah, gred dan pecahan
 * topik dikira di sini supaya skrin hanya perlu memaparkan.
 */

import type { Question, SubjectId, Topic, YearNum } from '../data/types';
import { ALL_TOPICS, generateQuestions } from '../data/catalog';
import { Rng } from './rng';
import { WRITTEN } from './generators/written';
import { typedCorrect } from './generators/written';

/** Konfigurasi kertas mengikut tahun. */
export interface ExamConfig {
  /** Bilangan soalan Bahagian A (pilihan jawapan A/B/C/D). */
  partA: number;
  /** Bilangan soalan Bahagian B (murid taip jawapan). */
  partB: number;
  /** Jumlah soalan dalam kertas. */
  questions: number;
  /** Tempoh masa dalam minit. */
  minutes: number;
  /** Peratus minimum untuk lulus. */
  passPct: number;
}

/**
 * Topik ringkasan yang dicatat sebagai satu `Attempt` selepas peperiksaan.
 * Ia dikecualikan daripada pengiraan penguasaan topik kerana markahnya
 * merangkumi keseluruhan tahun, bukan satu topik.
 */
export const EXAM_TOPIC_ID = 'exam';

/**
 * Tahap 1 (Tahun 1-3) guna kertas pendek supaya murid tidak penat.
 * Tahap 2 (Tahun 4-6) guna kertas lebih panjang seperti peperiksaan sebenar.
 * Setiap kertas ada dua bahagian: pilihan jawapan dan jawapan taip.
 */
export function examConfig(year: YearNum): ExamConfig {
  const partA = year <= 3 ? 12 : 20;
  const partB = year <= 3 ? 6 : 10;
  return {
    partA,
    partB,
    questions: partA + partB,
    minutes: year <= 3 ? 35 : 60,
    passPct: 60,
  };
}

/** Gred KSSR mengikut peratus markah. */
export type ExamGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export function examGrade(pct: number): ExamGrade {
  if (pct >= 80) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 40) return 'C';
  if (pct >= 20) return 'D';
  return 'E';
}

/** Kunci terjemahan bagi setiap gred (untuk `t()`). */
export const GRADE_KEY: Record<ExamGrade, string> = {
  A: 'grade.A',
  B: 'grade.B',
  C: 'grade.C',
  D: 'grade.D',
  E: 'grade.E',
};

/** Nombor gred kepada skor berwarna untuk carta. */
export function gradeColour(pct: number): string {
  if (pct >= 80) return 'var(--success)';
  if (pct >= 60) return 'var(--brand)';
  if (pct >= 40) return 'var(--warn)';
  return 'var(--danger)';
}

/* ------------------------------------------------------------------ */
/* Bina kertas                                                         */
/* ------------------------------------------------------------------ */

function mulberry(seed: number): () => number {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: readonly T[], rnd: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Semua topik bagi sesuatu tahun, diselang-selikan antara subjek. */
export function examTopics(year: YearNum, subject: SubjectId, seed: number): Topic[] {
  const rnd = mulberry(seed);
  const pool = ALL_TOPICS.filter((t) => t.year === year && t.subject === subject);
  return shuffle(pool, rnd);
}

export interface ExamPaper {
  year: YearNum;
  /** Subjek kertas ini. Satu kertas hanya mengandungi satu subjek. */
  subject: SubjectId;
  config: ExamConfig;
  questions: Question[];
  /** Topik bagi setiap soalan (kunci = `Question.id`). */
  topicOf: Map<string, Topic>;
  /** Semua topik yang diuji dalam kertas ini. */
  topics: Topic[];
}

/**
 * Bina satu kertas peperiksaan percubaan bagi SATU subjek.
 *
 * Kertas mengandungi dua bahagian seperti peperiksaan sebenar:
 *   - Bahagian A: pilihan jawapan A, B, C dan D (tepat empat pilihan).
 *   - Bahagian B: murid menaip jawapan sendiri.
 *
 * Semua soalan datang daripada subjek yang dipilih sahaja, jadi kertas
 * Bahasa Melayu mengandungi soalan Bahasa Melayu sepenuhnya. Benih berbeza
 * menghasilkan kertas berbeza, dan tiada soalan berulang dalam satu kertas.
 */
export function buildExamPaper(
  year: YearNum,
  subject: SubjectId,
  seed: number,
  avoid: readonly string[] = [],
): ExamPaper {
  const config = examConfig(year);
  const topics = examTopics(year, subject, seed);
  // Soalan percubaan lepas: utamakan soalan baharu, tetapi jangan sampai
  // kertas tidak dapat diisi apabila bank soalan sesuatu subjek kecil.
  const avoidSet = new Set(avoid.map(normalise));
  const empty: ExamPaper = {
    year,
    subject,
    config,
    questions: [],
    topicOf: new Map(),
    topics: [],
  };
  if (topics.length === 0) return empty;

  const seen = new Set<string>();
  const topicOf = new Map<string, Topic>();
  const used = new Set<string>();

  /* ---------------- Bahagian B: jawapan taip ---------------- */

  // Bahagian B dibina DAHULU kerana bahan jawapan taip lebih terhad
  // berbanding soalan pilihan. Jika Part A dibina dahulu, ia akan menelan
  // hampir semua soalan dan Part B tidak cukup untuk diisi (terutama
  // Sejarah dan Sains yang bank soalnya kecil).
  const pool = writtenPool(topics, seed);
  const partB: Question[] = [];
  const fallbackB: { question: Question; topic: Topic }[] = [];
  for (const item of interleaveByTopic(pool)) {
    if (partB.length >= config.partB) break;
    const key = normalise(item.question.prompt);
    if (seen.has(key)) continue;
    if (avoidSet.has(key)) {
      fallbackB.push(item);
      continue;
    }
    seen.add(key);
    const q: Question = { ...item.question, part: 'B' };
    partB.push(q);
    topicOf.set(q.id, item.topic);
    used.add(item.topic.id);
  }
  for (const { question, topic } of interleaveByTopic(fallbackB)) {
    if (partB.length >= config.partB) break;
    const key = normalise(question.prompt);
    if (seen.has(key)) continue;
    seen.add(key);
    const q: Question = { ...question, part: 'B' };
    partB.push(q);
    topicOf.set(q.id, topic);
    used.add(topic.id);
  }

  /* ---------------- Bahagian A: pilihan jawapan ---------------- */

  const partA: Question[] = [];
  const quotas = distribute(config.partA, topics.length);
  const buckets: Question[][] = topics.map((topic, i) => {
    const quota = quotas[i];
    if (quota <= 0) return [];
    // Jana lebih sedikit daripada kuota supaya ada bahan ganti apabila
    // terdapat pertindihan teks dengan topik lain.
    const qs = generateQuestions(topic.id, quota + 8, seed + i * 7919 + year * 104729);
    const out: Question[] = [];
    const reserve: Question[] = [];
    for (const q of qs) {
      // Bahagian A hanya jenis pilihan jawapan dengan empat pilihan.
      if (!isChoiceQuestion(q)) continue;
      const key = normalise(q.prompt);
      if (seen.has(key)) continue;
      if (avoidSet.has(key)) {
        reserve.push({ ...q, part: 'A' });
        continue;
      }
      seen.add(key);
      out.push({ ...q, part: 'A' });
      if (out.length >= quota) break;
    }
    return out.length > 0 ? out : reserve;
  });

  const maxLen = Math.max(0, ...buckets.map((b) => b.length));
  for (let i = 0; i < maxLen; i += 1) {
    for (const [k, bucket] of buckets.entries()) {
      const q = bucket[i];
      if (!q) continue;
      if (partA.length >= config.partA) break;
      partA.push(q);
      topicOf.set(q.id, topics[k]);
      used.add(topics[k].id);
    }
    if (partA.length >= config.partA) break;
  }

  /* ---------------- Penuhkan sisa slot Bahagian A ---------------- */

  // Jika sesetengah topik tidak menghasilkan cukup soalan empat pilihan,
  // kumpul baki daripada semua topik supaya jumlah soalan seperti dijanjikan.
  if (partA.length < config.partA) {
    const spare: { q: Question; topic: Topic }[] = [];
    for (const [k, topic] of topics.entries()) {
      const extra = generateQuestions(
        topic.id,
        config.partA + 12,
        seed + k * 7919 + year * 104729 + 424243,
      );
      for (const q of extra) {
        if (isChoiceQuestion(q)) spare.push({ q, topic });
      }
    }
    const spareFallback: { q: Question; topic: Topic }[] = [];
    for (const item of interleaveByTopic(spare)) {
      if (partA.length >= config.partA) break;
      const key = normalise(item.q.prompt);
      if (seen.has(key)) continue;
      if (avoidSet.has(key)) {
        spareFallback.push(item);
        continue;
      }
      seen.add(key);
      const qq: Question = { ...item.q, part: 'A' };
      partA.push(qq);
      topicOf.set(qq.id, item.topic);
      used.add(item.topic.id);
    }
    for (const { q, topic } of interleaveByTopic(spareFallback)) {
      if (partA.length >= config.partA) break;
      const key = normalise(q.prompt);
      if (seen.has(key)) continue;
      seen.add(key);
      const qq: Question = { ...q, part: 'A' };
      partA.push(qq);
      topicOf.set(qq.id, topic);
      used.add(topic.id);
    }
  }

  return {
    year,
    subject,
    config,
    questions: [...partA, ...partB],
    topicOf,
    topics: topics.filter((t) => used.has(t.id)),
  };
}

/** Bahagian A hanya menerima soalan yang ada tepat empat pilihan jawapan. */
export function isChoiceQuestion(q: Question): boolean {
  if (q.kind === 'mcq' || q.kind === 'fillblank') {
    return (q.options?.length ?? 0) === 4;
  }
  return false;
}

/** Agihkan `total` kuota ke atas `n` slot, selebihnya diberi kepada slot awal. */
function distribute(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const rem = total % n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}

/**
 * Bahan jawapan taip bagi semua topik, digabung merentas tahap kelonggaran.
 *
 * Tahap ketat didahulukan supaya soalan yang paling sesuai untuk ditaip
 * muncul dahulu. Tahap longgar menambah bahan bagi subjek yang bank soalnya
 * kecil (cth. Sejarah), jadi Bahagian B tetap boleh diisi.
 */
function writtenPool(
  topics: Topic[],
  seed: number,
): { question: Question; topic: Topic }[] {
  const tiers = ['strict', 'relaxed', 'any'] as const;
  const seen = new Set<string>();
  const out: { question: Question; topic: Topic }[] = [];
  for (const [ti, tier] of tiers.entries()) {
    const rnd = new Rng(seed ^ 0x5f3759df ^ (ti * 104729));
    for (const topic of topics) {
      const gen = WRITTEN[topic.subject];
      if (!gen) continue;
      for (const q of rnd.shuffle(gen(topic, rnd, tier))) {
        const key = normalise(q.prompt);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ question: q, topic });
      }
    }
  }
  return out;
}

/** Selang-selikan bahan mengikut topik supaya kertas meliputi semua topik. */
function interleaveByTopic<T extends { topic: Topic }>(list: T[]): T[] {
  const byTopic = new Map<string, T[]>();
  for (const item of list) {
    const arr = byTopic.get(item.topic.id) ?? [];
    arr.push(item);
    byTopic.set(item.topic.id, arr);
  }
  const groups = [...byTopic.values()];
  const out: T[] = [];
  const maxLen = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < maxLen; i += 1) {
    for (const g of groups) {
      const item = g[i];
      if (item) out.push(item);
    }
  }
  return out;
}


/** Bentuk teks yang boleh dibandingkan untuk mengesan soalan bertindih. */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').trim();
}

/* ------------------------------------------------------------------ */
/* Markah                                                              */
/* ------------------------------------------------------------------ */

export interface ExamItemScore {
  topicId: string;
  subject: SubjectId;
  title: string;
  correct: number;
  total: number;
}

export interface ExamScore {
  correct: number;
  total: number;
  pct: number;
  grade: ExamGrade;
  passed: boolean;
  /** Pecahan markah mengikut topik. */
  items: ExamItemScore[];
  /** Pecahan markah mengikut subjek. */
  bySubject: { subject: SubjectId; correct: number; total: number; pct: number }[];
}

export function scoreExam(
  paper: ExamPaper,
  answers: Record<string, { ok: boolean; given?: string }>,
): ExamScore {
  const perTopic = new Map<string, { correct: number; total: number }>();
  const perSubject = new Map<SubjectId, { correct: number; total: number }>();

  for (const q of paper.questions) {
    const topic = paper.topicOf.get(q.id);
    if (!topic) continue;
    // Soalan taip disemak di sini supaya markah tidak bergantung pada UI.
    const a = answers[q.id];
    const ok = q.kind === 'shorttext'
      ? typedCorrect(q, a?.given ?? '')
      : Boolean(a?.ok);

    const t = perTopic.get(topic.id) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (ok) t.correct += 1;
    perTopic.set(topic.id, t);

    const s = perSubject.get(topic.subject) ?? { correct: 0, total: 0 };
    s.total += 1;
    if (ok) s.correct += 1;
    perSubject.set(topic.subject, s);
  }

  // Susun mengikut subjek supaya pecahan mudah dibaca.
  const items: ExamItemScore[] = [...perTopic.entries()]
    .map(([topicId, v]) => {
      const topic = paper.topics.find((t) => t.id === topicId);
      return {
        topicId,
        subject: topic?.subject ?? 'matematik',
        title: topic?.title ?? topicId,
        correct: v.correct,
        total: v.total,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title));

  const correct = items.reduce((s, it) => s + it.correct, 0);
  const total = items.reduce((s, it) => s + it.total, 0);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const bySubject = [...perSubject.entries()]
    .map(([subject, v]) => ({
      subject,
      correct: v.correct,
      total: v.total,
      pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  return {
    correct,
    total,
    pct,
    grade: examGrade(pct),
    passed: pct >= paper.config.passPct,
    items,
    bySubject,
  };
}

/** Format saat kepada `MM:SS`. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Bandingkan markah percubaan ini dengan percubaan lepas bagi tahun yang sama.
 * Pulangkan beza peratus (positif = naik) atau `null` jika tiada rekod lepas.
 */
export function compareWithPrevious(
  attempts: { ts: number; topicId: string; year: number; correct: number; total: number }[],
  topicId: string,
  year: YearNum,
  current: { ts: number; pct: number },
): { prevPct: number; delta: number; count: number } | null {
  const prev = attempts
    .filter((a) => a.topicId === topicId && a.year === year && a.total > 0 && a.ts < current.ts)
    .sort((a, b) => a.ts - b.ts);
  if (prev.length === 0) return null;
  const last = prev[prev.length - 1];
  const prevPct = Math.round((last.correct / last.total) * 100);
  return { prevPct, delta: current.pct - prevPct, count: prev.length };
}
