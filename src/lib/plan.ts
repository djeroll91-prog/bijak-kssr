/**
 * Enjin "Program Belajar": diagnosis kelemahan, pelan mingguan dan
 * latihan pemulihan. Semua pengiraan berlaku pada peranti murid sahaja.
 */

import type {
  Attempt,
  DiagnosticItem,
  DiagnosticResult,
  PlanTask,
  PlanTaskKind,
  Profile,
  StudyPlan,
  SubjectId,
  Topic,
  YearNum,
} from '../data/types';
import { ALL_TOPICS } from '../data/catalog';
import { todayKey } from './storage';
import { addDays } from './dates';

/** Ambang penguasaan (peratus). Bawah nilai ini dianggap lemah. */
export const WEAK_PCT = 70;
/** Bilangan hari dalam satu pelan. */
export const PLAN_DAYS = 7;
/** Bilangan tugasan setiap hari. */
export const TASKS_PER_DAY = 3;
/** Bilangan topik dalam ujian diagnosis. */
export const DIAGNOSTIC_TOPICS = 6;
/** Bilangan soalan setiap topik dalam ujian diagnosis. */
export const DIAGNOSTIC_PER_TOPIC = 2;

/** Topik ringkasan yang dicatat sebagai satu `Attempt` selepas diagnosis. */
export const DIAGNOSTIC_TOPIC_ID = 'diagnostic';

/**
 * Topik ringkasan peperiksaan percubaan. Markahnya merangkumi keseluruhan
 * tahun, jadi ia tidak boleh dianggap sebagai penguasaan satu topik.
 */
export const EXAM_TOPIC_ID = 'exam';

/** Topik ringkasan yang bukan topik sebenar (dikecualikan daripada skor). */
export const SUMMARY_TOPIC_IDS = new Set([DIAGNOSTIC_TOPIC_ID, EXAM_TOPIC_ID]);

export interface TopicScore {
  topicId: string;
  avg: number;
  attempts: number;
  /** Skor daripada ujian diagnosis, jika ada. */
  diagnostic?: number;
}

/** Skor purata setiap topik, digabungkan daripada latihan dan diagnosis. */
export function topicScores(profile: Profile): Map<string, TopicScore> {
  const map = new Map<string, TopicScore>();
  for (const a of profile.attempts) {
    if (SUMMARY_TOPIC_IDS.has(a.topicId) || a.total <= 0) continue;
    const cur = map.get(a.topicId) ?? { topicId: a.topicId, avg: 0, attempts: 0 };
    // Purata bergerak supaya latihan terkini lebih berpengaruh.
    const pct = (a.correct / a.total) * 100;
    cur.avg = cur.attempts === 0 ? pct : cur.avg * 0.65 + pct * 0.35;
    cur.attempts += 1;
    map.set(a.topicId, cur);
  }
  const diag = profile.diagnostic;
  if (diag) {
    for (const it of diag.items) {
      if (it.total <= 0) continue;
      const pct = Math.round((it.correct / it.total) * 100);
      const cur = map.get(it.topicId);
      if (cur) {
        cur.diagnostic = pct;
      } else {
        map.set(it.topicId, { topicId: it.topicId, avg: pct, attempts: 0, diagnostic: pct });
      }
    }
  }
  for (const v of map.values()) v.avg = Math.round(v.avg);
  return map;
}

export function topicsForYear(year: YearNum): Topic[] {
  return ALL_TOPICS.filter((t) => t.year === year);
}

/** Topik tahun semasa yang belum pernah dicuba langsung. */
export function untriedTopics(profile: Profile): Topic[] {
  const scores = topicScores(profile);
  return topicsForYear(profile.year).filter((t) => !scores.has(t.id));
}

/** Topik tahun semasa yang lemah, disusun daripada paling lemah. */
export function weakTopics(profile: Profile): Topic[] {
  const scores = topicScores(profile);
  return topicsForYear(profile.year)
    .map((t) => ({ topic: t, score: scores.get(t.id)?.avg }))
    .filter((x): x is { topic: Topic; score: number } => x.score !== undefined && x.score < WEAK_PCT)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.topic);
}

/**
 * Pilih topik untuk ujian diagnosis: satu daripada setiap mata pelajaran
 * secara bergilir supaya liputan seimbang, dengan benih rawak.
 */
export function pickDiagnosticTopics(year: YearNum, seed: number): Topic[] {
  const bySubject = new Map<SubjectId, Topic[]>();
  for (const t of topicsForYear(year)) {
    const list = bySubject.get(t.subject) ?? [];
    list.push(t);
    bySubject.set(t.subject, list);
  }
  const rnd = mulberry(seed);
  const pools = [...bySubject.values()].map((list) => shuffle(list, rnd));
  const out: Topic[] = [];
  let round = 0;
  while (out.length < DIAGNOSTIC_TOPICS && pools.some((p) => p.length > round)) {
    for (const pool of pools) {
      if (out.length >= DIAGNOSTIC_TOPICS) break;
      if (pool[round]) out.push(pool[round]);
    }
    round += 1;
  }
  return out;
}

/** Topik tumpuan pelan: kelemahan dahulu, kemudian topik belum cuba. */
export function pickFocusTopics(profile: Profile, limit = 6): Topic[] {
  const out: Topic[] = [];
  const seen = new Set<string>();
  for (const t of weakTopics(profile)) {
    if (out.length >= limit) break;
    if (!seen.has(t.id)) {
      seen.add(t.id);
      out.push(t);
    }
  }
  for (const t of untriedTopics(profile)) {
    if (out.length >= limit) break;
    if (!seen.has(t.id)) {
      seen.add(t.id);
      out.push(t);
    }
  }
  return out;
}

const KIND_CYCLE: PlanTaskKind[] = ['learn', 'practice', 'practice'];

/**
 * Bina pelan belajar tujuh hari daripada kelemahan murid.
 * Setiap hari: satu tugasan belajar, satu latihan, dan satu pemulihan
 * (jika ada topik lemah). Hari terakhir ditutup dengan permainan.
 */
export function buildPlan(profile: Profile, seed = Date.now()): StudyPlan | null {
  const focus = pickFocusTopics(profile);
  if (focus.length === 0) return null;

  const weak = weakTopics(profile);
  const weakIds = new Set(weak.map((t) => t.id));
  const tasks: PlanTask[] = [];
  let n = 0;
  for (let day = 0; day < PLAN_DAYS; day += 1) {
    for (let slot = 0; slot < TASKS_PER_DAY; slot += 1) {
      const isLast = day === PLAN_DAYS - 1 && slot === TASKS_PER_DAY - 1;
      // Slot terakhir hari itu khusus untuk pemulihan topik lemah.
      const remedialSlot = slot === TASKS_PER_DAY - 1 && weak.length > 0;
      const pool = remedialSlot ? weak : focus;
      const topic = pool[(day * TASKS_PER_DAY + slot) % pool.length];
      let kind: PlanTaskKind = remedialSlot ? 'remedial' : KIND_CYCLE[slot % KIND_CYCLE.length];
      if (isLast) kind = 'game';
      n += 1;
      tasks.push({
        id: `pt-${seed.toString(36)}-${n}`,
        dayIndex: day,
        topicId: topic.id,
        kind,
        minutes: kind === 'learn' ? 10 : kind === 'game' ? 5 : 8,
        done: false,
      });
    }
  }

  return {
    createdAt: Date.now(),
    year: profile.year,
    focusTopicIds: focus.map((t) => t.id),
    weakTopicIds: [...weakIds],
    tasks,
    focusSeconds: 0,
    lastFocusDate: todayKey(),
    // Hari belum ada yang siap, jadi semua tarikh kosong.
    dayCompletedOn: Array.from({ length: PLAN_DAYS }, () => null),
  };
}

export interface PlanProgressOptions {
  /** Hadkan satu hari pelan bagi setiap hari kalendar. */
  dailyLimit?: boolean;
  /** Tarikh hari ini (YYYY-MM-DD); boleh diuji. */
  today?: string;
}

export interface PlanProgress {
  done: number;
  total: number;
  pct: number;
  /** Hari yang sedang aktif: hari pertama yang masih ada tugasan belum siap. */
  activeDay: number;
  /** Semua tugasan hari aktif sudah siap? */
  dayComplete: boolean;
  allDone: boolean;
  /**
   * Hari aktif belum dibuka kerana sesi hari ini sudah siap dan had harian
   * dihidupkan. Skrin pelan menggunakan ini untuk memaparkan mesej
   * "jumpa esok" dan bukan senarai tugasan.
   */
  waitingTomorrow: boolean;
  /** Bilangan hari pelan yang sudah dibuka setakat ini. */
  unlockedDays: number;
}

/**
 * Hitung kemajuan pelan, dengan sokongan had satu sesi sehari.
 *
 * Peraturan had harian: hari berikutnya hanya dibuka apabila hari semasa
 * sudah siap DAN tarikh siap itu bukan hari ini. Ini bermakna murid yang
 * menyiapkan hari pertama pada hari Isnin akan melihat hari kedua pada
 * hari Selasa, bukan serta-merta.
 *
 * Pemeriksaan dibuat pada tarikh setempat peranti supaya peraturan ini
 * berfungsi walaupun tanpa internet.
 */
export function planProgress(
  plan: StudyPlan | null | undefined,
  opts: PlanProgressOptions = {},
): PlanProgress {
  const { dailyLimit = false, today = todayKey() } = opts;
  if (!plan || plan.tasks.length === 0) {
    return {
      done: 0,
      total: 0,
      pct: 0,
      activeDay: 0,
      dayComplete: false,
      allDone: false,
      waitingTomorrow: false,
      unlockedDays: 0,
    };
  }

  const done = plan.tasks.filter((t) => t.done).length;
  const total = plan.tasks.length;
  const completed = plan.dayCompletedOn ?? [];

  const dayTasksOf = (d: number) => plan.tasks.filter((t) => t.dayIndex === d);
  const dayIsDone = (d: number) => {
    const list = dayTasksOf(d);
    return list.length > 0 && list.every((t) => t.done);
  };

  let activeDay = PLAN_DAYS - 1;
  let waitingTomorrow = false;
  let unlockedDays = 0;

  for (let d = 0; d < PLAN_DAYS; d += 1) {
    if (dayTasksOf(d).length === 0) continue;
    unlockedDays += 1;
    if (!dayIsDone(d)) {
      activeDay = d;
      break;
    }
    // Hari ini sudah siap. Dengan had harian, hari berikutnya hanya dibuka
    // pada hari kalendar seterusnya.
    const doneOn = completed[d];
    const nextHasTasks = d + 1 < PLAN_DAYS && dayTasksOf(d + 1).length > 0;
    if (dailyLimit && doneOn === today && nextHasTasks) {
      activeDay = d + 1;
      waitingTomorrow = true;
      break;
    }
    if (!nextHasTasks) {
      activeDay = d;
    }
  }

  const dayTasks = dayTasksOf(activeDay);
  return {
    done,
    total,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
    activeDay,
    dayComplete: dayTasks.length > 0 && dayTasks.every((t) => t.done),
    allDone: done === total,
    waitingTomorrow,
    unlockedDays,
  };
}

/**
 * Tandakan hari pelan sebagai siap pada tarikh tertentu.
 *
 * Dipanggil apabila semua tugasan satu hari selesai. Tarikh inilah yang
 * menentukan bila hari berikutnya boleh dibuka.
 */
export function markDayCompleted(
  plan: StudyPlan,
  dayIndex: number,
  today = todayKey(),
): (string | null)[] {
  const out = [...(plan.dayCompletedOn ?? [])];
  while (out.length < PLAN_DAYS) out.push(null);
  // Simpan tarikh siap yang PERTAMA sahaja supaya mengulang tugasan tidak
  // melambatkan pembukaan hari berikutnya.
  if (!out[dayIndex]) out[dayIndex] = today;
  return out;
}

/** Tarikh hari pelan berikutnya akan dibuka, atau `null` jika sudah dibuka. */
export function nextDayOpensOn(
  plan: StudyPlan | null | undefined,
  dayIndex: number,
): string | null {
  if (!plan || dayIndex <= 0) return null;
  const prev = plan.dayCompletedOn?.[dayIndex - 1];
  return prev ? addDays(prev, 1) : null;
}

/** Tugasan bagi hari aktif, disusun mengikut urutan asal. */
export function activeDayTasks(
  plan: StudyPlan | null | undefined,
  opts: PlanProgressOptions = {},
): PlanTask[] {
  if (!plan) return [];
  const { activeDay } = planProgress(plan, opts);
  return plan.tasks.filter((t) => t.dayIndex === activeDay);
}

/** Bilangan hari berturut pelan telah disiapkan sepenuhnya. */
export function planStreak(plan: StudyPlan | null | undefined): number {
  if (!plan) return 0;
  let streak = 0;
  for (let d = 0; d < PLAN_DAYS; d += 1) {
    const dayTasks = plan.tasks.filter((t) => t.dayIndex === d);
    if (dayTasks.length === 0) break;
    if (dayTasks.every((t) => t.done)) streak += 1;
    else break;
  }
  return streak;
}

/** Adakah pelan perlu dijana semula (lebih 7 hari atau tahun berubah)? */
export function planIsStale(plan: StudyPlan | null | undefined, year: YearNum): boolean {
  if (!plan) return true;
  if (plan.year !== year) return true;
  return Date.now() - plan.createdAt > PLAN_DAYS * 86400000;
}

/** Ringkasan keputusan diagnosis: subjek terkuat dan paling lemah. */
export function diagnosticSummary(diag: DiagnosticResult | null | undefined) {
  if (!diag || diag.items.length === 0) return null;
  const bySubject = new Map<SubjectId, { correct: number; total: number }>();
  for (const it of diag.items) {
    const cur = bySubject.get(it.subject) ?? { correct: 0, total: 0 };
    cur.correct += it.correct;
    cur.total += it.total;
    bySubject.set(it.subject, cur);
  }
  const rows = [...bySubject.entries()].map(([subject, v]) => ({
    subject,
    pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
  }));
  const sorted = [...rows].sort((a, b) => b.pct - a.pct);
  const weakest = [...diag.items]
    .filter((it) => it.total > 0)
    .sort((a, b) => a.correct / a.total - b.correct / b.total);
  return {
    pct: diag.total > 0 ? Math.round((diag.correct / diag.total) * 100) : 0,
    rows,
    strongest: sorted[0] ?? null,
    weakestSubject: sorted[sorted.length - 1] ?? null,
    weakItems: weakest.slice(0, 3),
  };
}

/** Tukar item diagnosis kepada senarai supaya mudah dipaparkan. */
export function diagnosticRows(diag: DiagnosticResult | null | undefined) {
  if (!diag) return [];
  return diag.items.map((it) => ({
    ...it,
    pct: it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0,
  }));
}

/** Percubaan latihan sebenar sahaja (tanpa ringkasan ujian diagnosis). */
export function practiceAttempts(profile: Profile): Attempt[] {
  return profile.attempts.filter((a) => !SUMMARY_TOPIC_IDS.has(a.topicId));
}

/** Bilangan topik berbeza yang telah dilatih murid. */
export function practisedTopicCount(profile: Profile): number {
  return new Set(practiceAttempts(profile).map((a) => a.topicId)).size;
}

export type { DiagnosticItem };

/* ------------------------------------------------------------------ */
/* Rawak kecil (benih) supaya jadual boleh diulang untuk ujian         */
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
