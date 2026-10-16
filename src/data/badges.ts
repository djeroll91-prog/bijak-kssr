/** Definisi lencana dan insentif untuk murid. */

import type { Badge, Profile } from './types';
import { ALL_TOPICS } from './catalog';

/** Bina konteks untuk semakan lencana. */
export function badgeContext(profile: Profile) {
  const attempts = profile.attempts;
  const total = attempts.length;
  const perfect = attempts.filter((a) => a.correct === a.total && a.total > 0).length;
  const distinctTopics = new Set(attempts.map((a) => a.topicId)).size;
  const distinctSubjects = new Set(attempts.map((a) => a.subject)).size;
  const best = attempts.reduce((m, a) => Math.max(m, a.total > 0 ? (a.correct / a.total) * 100 : 0), 0);
  const totalCorrect = attempts.reduce((s, a) => s + a.correct, 0);
  // Kira streak terbaik (hari berturut-turut dengan percubaan).
  const days = [...new Set(attempts.map((a) => dayKey(a.ts)))].sort();
  const maxStreak = longestRunLength(days);
  const thisYearTopics = new Set(
    ALL_TOPICS.filter((t) => t.year === profile.year).map((t) => t.id),
  );
  const hasFullMarkThisYear = attempts.some(
    (a) => a.correct === a.total && a.total > 0 && thisYearTopics.has(a.topicId),
  );
  return {
    profile,
    attempts: total,
    perfectAttempts: perfect,
    distinctTopics,
    distinctSubjects,
    bestScorePct: Math.round(best),
    totalCorrect,
    maxStreak,
    hasFullMarkThisYear,
  };
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function longestRunLength(sortedDays: string[]): number {
  if (sortedDays.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i += 1) {
    const prev = new Date(sortedDays[i - 1]);
    const cur = new Date(sortedDays[i]);
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else if (diff > 1) {
      run = 1;
    }
  }
  return best;
}

export const BADGES: Badge[] = [
  {
    id: 'langkah-pertama',
    name: 'Langkah Pertama',
    emoji: '👣',
    how: 'Siapkan latihan pertama kamu.',
    nameEn: 'First Step',
    howEn: 'Finish your first exercise.',
    check: (c) => c.attempts >= 1,
  },
  {
    id: 'rajin-belajar',
    name: 'Rajin Belajar',
    emoji: '📚',
    how: 'Siapkan 5 latihan.',
    nameEn: 'Keen Learner',
    howEn: 'Finish 5 exercises.',
    check: (c) => c.attempts >= 5,
  },
  {
    id: 'tekun',
    name: 'Murid Tekun',
    emoji: '💪',
    how: 'Siapkan 15 latihan.',
    nameEn: 'Diligent Student',
    howEn: 'Finish 15 exercises.',
    check: (c) => c.attempts >= 15,
  },
  {
    id: 'wira-latihan',
    name: 'Wira Latihan',
    emoji: '🦸',
    how: 'Siapkan 40 latihan.',
    nameEn: 'Exercise Hero',
    howEn: 'Finish 40 exercises.',
    check: (c) => c.attempts >= 40,
  },
  {
    id: 'markah-penuh',
    name: 'Markah Penuh',
    emoji: '💯',
    how: 'Dapat 100% dalam satu latihan.',
    nameEn: 'Full Marks',
    howEn: 'Get 100% in one exercise.',
    check: (c) => c.perfectAttempts >= 1,
  },
  {
    id: 'bintang-tiga',
    name: 'Koleksi Bintang',
    emoji: '⭐',
    how: 'Dapat 100% dalam 5 latihan berbeza.',
    nameEn: 'Star Collection',
    howEn: 'Get 100% in 5 different exercises.',
    check: (c) => c.perfectAttempts >= 5,
  },
  {
    id: 'sempurna-sepuluh',
    name: 'Sempurna Sepuluh',
    emoji: '🌟',
    how: 'Dapat 100% dalam 10 latihan berbeza.',
    nameEn: 'Perfect Ten',
    howEn: 'Get 100% in 10 different exercises.',
    check: (c) => c.perfectAttempts >= 10,
  },
  {
    id: 'penjelajah-topik',
    name: 'Penjelajah Topik',
    emoji: '🧭',
    how: 'Cuba 8 topik berbeza.',
    nameEn: 'Topic Explorer',
    howEn: 'Try 8 different topics.',
    check: (c) => c.distinctTopics >= 8,
  },
  {
    id: 'serba-boleh',
    name: 'Serba Boleh',
    emoji: '🎓',
    how: 'Cuba 3 mata pelajaran berbeza.',
    nameEn: 'All-Rounder',
    howEn: 'Try 3 different subjects.',
    check: (c) => c.distinctSubjects >= 3,
  },
  {
    id: 'juara-subjek',
    name: 'Juara Semua Subjek',
    emoji: '🏆',
    how: 'Cuba 5 mata pelajaran berbeza.',
    nameEn: 'Champion of All Subjects',
    howEn: 'Try 5 different subjects.',
    check: (c) => c.distinctSubjects >= 5,
  },
  {
    id: 'ratus-markah',
    name: '100 Soalan Betul',
    emoji: '🎯',
    how: 'Jawab 100 soalan dengan betul.',
    nameEn: '100 Correct Answers',
    howEn: 'Answer 100 questions correctly.',
    check: (c) => c.totalCorrect >= 100,
  },
  {
    id: 'lima-ratus',
    name: '500 Soalan Betul',
    emoji: '🚀',
    how: 'Jawab 500 soalan dengan betul.',
    nameEn: '500 Correct Answers',
    howEn: 'Answer 500 questions correctly.',
    check: (c) => c.totalCorrect >= 500,
  },
  {
    id: 'streak-tiga',
    name: '3 Hari Berturut',
    emoji: '🔥',
    how: 'Belajar 3 hari berturut-turut.',
    nameEn: '3-Day Streak',
    howEn: 'Study 3 days in a row.',
    check: (c) => c.maxStreak >= 3,
  },
  {
    id: 'streak-tujuh',
    name: '7 Hari Berturut',
    emoji: '🌈',
    how: 'Belajar 7 hari berturut-turut.',
    nameEn: '7-Day Streak',
    howEn: 'Study 7 days in a row.',
    check: (c) => c.maxStreak >= 7,
  },
  {
    id: 'darjah-terbaik',
    name: 'Bintang Darjah',
    emoji: '🥇',
    how: 'Dapat markah penuh dalam topik tahun semasa.',
    nameEn: 'Year Star',
    howEn: 'Get full marks in a current-year topic.',
    check: (c) => c.hasFullMarkThisYear,
  },
];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Nama lencana mengikut bahasa antara muka. */
export function badgeName(lang: 'ms' | 'en', b: Badge): string {
  return lang === 'en' ? (b.nameEn ?? b.name) : b.name;
}

/** Penerangan syarat lencana mengikut bahasa antara muka. */
export function badgeHow(lang: 'ms' | 'en', b: Badge): string {
  return lang === 'en' ? (b.howEn ?? b.how) : b.how;
}

/** Semak lencana baharu yang dimenangi. */
export function newBadges(profile: Profile): Badge[] {
  const ctx = badgeContext(profile);
  const owned = new Set(profile.badges);
  return BADGES.filter((b) => !owned.has(b.id) && b.check(ctx));
}
