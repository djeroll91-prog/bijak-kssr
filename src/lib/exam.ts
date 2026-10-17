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

/** Konfigurasi kertas mengikut tahun. */
export interface ExamConfig {
  /** Bilangan soalan dalam kertas. */
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
 */
export function examConfig(year: YearNum): ExamConfig {
  if (year <= 3) return { questions: 20, minutes: 30, passPct: 60 };
  return { questions: 40, minutes: 60, passPct: 60 };
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
export function examTopics(year: YearNum, seed: number): Topic[] {
  const rnd = mulberry(seed);
  const bySubject = new Map<SubjectId, Topic[]>();
  for (const t of ALL_TOPICS) {
    if (t.year !== year) continue;
    const list = bySubject.get(t.subject) ?? [];
    list.push(t);
    bySubject.set(t.subject, list);
  }
  // Rawakkan setiap subjek dahulu, kemudian ambil giliran satu demi satu
  // supaya soalan berselang antara subjek.
  const pools = [...bySubject.keys()]
    .sort()
    .map((s) => shuffle(bySubject.get(s) ?? [], rnd));
  const out: Topic[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const pool of pools) {
      const next = pool.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

export interface ExamPaper {
  year: YearNum;
  config: ExamConfig;
  questions: Question[];
  /** Topik bagi setiap soalan (kunci = `Question.id`). */
  topicOf: Map<string, Topic>;
  /** Semua topik yang diuji dalam kertas ini. */
  topics: Topic[];
  /** Subjek yang diuji dalam kertas ini. */
  subjects: SubjectId[];
}

/**
 * Bina satu kertas peperiksaan percubaan.
 *
 * Soalan diagihkan secara adil ke atas topik tahun itu, kemudian
 * diselang-selikan supaya dua soalan berturut-turut tidak datang daripada
 * topik yang sama. Tiada dua soalan dengan teks yang sama dalam satu kertas,
 * dan benih berbeza menghasilkan kertas yang berbeza setiap percubaan.
 */
export function buildExamPaper(year: YearNum, seed: number): ExamPaper {
  const config = examConfig(year);
  const topics = examTopics(year, seed);
  if (topics.length === 0) {
    return { year, config, questions: [], topicOf: new Map(), topics: [], subjects: [] };
  }

  // Kuota setiap topik. Apabila topik lebih banyak daripada soalan, hanya
  // sebahagian topik dipilih supaya jumlah soalan kekal seperti yang ditetapkan.
  const base = Math.floor(config.questions / topics.length);
  const rem = config.questions % topics.length;
  const quotas = topics.map((_, i) => base + (i < rem ? 1 : 0));
  // Kekalkan sekurang-kurangnya satu soalan setiap topik apabila ada ruang.
  if (base === 0) {
    // Jumlah soalan mencukupi atau lebih daripada topik: pilih sebahagian sahaja.
    const picked = quotas.filter((q) => q > 0).length;
    if (picked < config.questions) {
      for (let i = picked; i < Math.min(topics.length, config.questions); i += 1) {
        quotas[i] = 1;
      }
    }
  }

  // Jana soalan dan buang pertindihan teks supaya tiada soalan berulang.
  const seen = new Set<string>();
  const buckets: Question[][] = topics.map((topic, i) => {
    const quota = quotas[i];
    if (quota <= 0) return [];
    // Jana lebih sedikit daripada kuota supaya ada bahan ganti apabila
    // terdapat pertindihan teks dengan topik lain.
    const qs = generateQuestions(topic.id, quota + 4, seed + i * 7919 + year * 104729);
    const out: Question[] = [];
    for (const q of qs) {
      const key = normalise(q.prompt);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
      if (out.length >= quota) break;
    }
    return out;
  });

  // Selang-selikan bucket supaya soalan berselang antara topik dan subjek.
  const questions: Question[] = [];
  const topicOf = new Map<string, Topic>();
  const maxLen = Math.max(...buckets.map((b) => b.length));
  for (let i = 0; i < maxLen; i += 1) {
    for (const [k, bucket] of buckets.entries()) {
      const q = bucket[i];
      if (!q) continue;
      if (questions.length >= config.questions) break;
      questions.push(q);
      topicOf.set(q.id, topics[k]);
    }
    if (questions.length >= config.questions) break;
  }

  return {
    year,
    config,
    questions,
    topicOf,
    topics: topics.filter((_, i) => quotas[i] > 0),
    subjects: [...new Set(topics.filter((_, i) => quotas[i] > 0).map((t) => t.subject))],
  };
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
  answers: Record<string, { ok: boolean }>,
): ExamScore {
  const perTopic = new Map<string, { correct: number; total: number }>();
  const perSubject = new Map<SubjectId, { correct: number; total: number }>();

  for (const q of paper.questions) {
    const topic = paper.topicOf.get(q.id);
    if (!topic) continue;
    const ok = Boolean(answers[q.id]?.ok);

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
