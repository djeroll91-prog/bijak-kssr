/**
 * Enjin ulangan berjarak (spaced repetition) dan pengumpulan kesilapan.
 *
 * Idea asas: satu topik yang dikuasai diulang pada jarak yang semakin
 * panjang (1, 3, 7, 16, 35 hari). Topik yang gagal kembali cepat ke
 * giliran. Ini teknik belajar yang paling kukuh buktinya — otak dipaksa
 * mengingat semula, bukan membaca semula.
 *
 * Semua pengiraan berlaku pada peranti murid. Tiada data dihantar keluar.
 */

import type { Profile, ReviewCard, ReviewOutcome } from '../data/types';
import { addDays, todayKey } from './dates';

/** Jarak ulangan (hari) mengikut kotak Leitner. Indeks = kotak. */
export const BOX_INTERVALS = [1, 3, 7, 16, 35] as const;
/** Kotak tertinggi yang dijejaki. */
export const MAX_BOX = BOX_INTERVALS.length - 1;
/** Ambang markah untuk dianggap "kuasai" dan naik kotak. */
export const PASS_PCT = 70;
/** Ambang markah penuh — naik dua kotak, ganjaran untuk penguasaan kukuh. */
export const STRONG_PCT = 95;
/** Bilangan maksimum kad yang muncul dalam senarai ulangan harian. */
export const DAILY_REVIEW_LIMIT = 6;
/** Bilangan maksimum kesilapan yang disimpan dalam bank. */
export const MISTAKE_LIMIT = 8;

/** Jarak ulangan bagi satu kotak, dalam hari. */
export function intervalFor(box: number): number {
  const i = Math.max(0, Math.min(MAX_BOX, Math.round(box)));
  return BOX_INTERVALS[i];
}
/**
 * Kira keadaan kad selepas satu sesi latihan.
 *
 * Markah penuh melompat dua kotak (penguasaan kukuh), markah lulus naik satu
 * kotak, markah rendah menjatuhkan kad kembali ke kotak 0 supaya konsep itu
 * cepat diulang.
 */
export function nextCard(
  prev: ReviewCard | undefined,
  outcome: ReviewOutcome,
  today = todayKey(),
): ReviewCard {
  const total = Math.max(outcome.total, 1);
  const pct = Math.round((outcome.correct / total) * 100);
  const passed = pct >= PASS_PCT;

  let box: number;
  let streak: number;
  let lapses = prev?.lapses ?? 0;

  if (!prev) {
    // Kad baharu: lulus mula pada kotak 0. Gagal juga kotak 0, tetapi
    // dikira sebagai kesilapan supaya topik ini masuk "Ruang Cuba Lagi".
    box = 0;
    streak = passed ? 1 : 0;
    if (!passed) lapses += 1;
  } else if (passed) {
    box = Math.min(MAX_BOX, prev.box + (pct >= STRONG_PCT ? 2 : 1));
    streak = prev.streak + 1;
  } else {
    box = 0;
    streak = 0;
    lapses += 1;
  }

  return {
    topicId: outcome.topicId,
    subject: outcome.subject,
    year: outcome.year,
    box,
    streak,
    lapses,
    lastPct: pct,
    lastReviewed: today,
    addedAt: prev?.addedAt ?? Date.now(),
    dueDate: addDays(today, intervalFor(box)),
  };
}

/** Kemas kini senarai kad dengan hasil satu sesi latihan. */
export function applyOutcomes(
  cards: ReviewCard[],
  outcomes: ReviewOutcome[],
  today = todayKey(),
): ReviewCard[] {
  const byId = new Map(cards.map((c) => [c.topicId, c]));
  for (const o of outcomes) {
    if (o.total <= 0) continue;
    byId.set(o.topicId, nextCard(byId.get(o.topicId), o, today));
  }
  return [...byId.values()];
}

/** Kad yang sudah tiba masa ulangan (dueDate <= hari ini). */
export function dueCards(cards: ReviewCard[], today = todayKey()): ReviewCard[] {
  return cards
    .filter((c) => c.dueDate <= today)
    // Paling lama tertunggak dahulu, kemudian kotak rendah (paling rapuh).
    .sort((a, b) => (a.dueDate === b.dueDate ? a.box - b.box : a.dueDate < b.dueDate ? -1 : 1));
}

/** Bilangan kad yang perlu diulang hari ini. */
export function dueCount(cards: ReviewCard[], today = todayKey()): number {
  return dueCards(cards, today).length;
}

/**
 * Topik keutamaan untuk satu sesi ulangan: yang paling tertunggak dan
 * paling rapuh dahulu. Dihadkan supaya sesi tidak terlalu panjang.
 */
export function reviewTopicIds(
  cards: ReviewCard[],
  limit = DAILY_REVIEW_LIMIT,
  today = todayKey(),
): string[] {
  return dueCards(cards, today).slice(0, limit).map((c) => c.topicId);
}

/**
 * Topik yang paling banyak gagal — "Ruang Cuba Lagi".
 * Disusun mengikut bilangan gagal, kemudian markah terendah.
 */
export function mistakeCards(cards: ReviewCard[], limit = MISTAKE_LIMIT): ReviewCard[] {
  return cards
    .filter((c) => c.lapses > 0)
    .sort((a, b) => (b.lapses === a.lapses ? a.lastPct - b.lastPct : b.lapses - a.lapses))
    .slice(0, limit);
}

/** Ringkasan keadaan ulangan untuk paparan kemajuan. */
export function reviewSummary(cards: ReviewCard[], today = todayKey()) {
  const due = dueCards(cards, today).length;
  const mastered = cards.filter((c) => c.box >= MAX_BOX).length;
  const learning = cards.length - mastered;
  const shaky = cards.filter((c) => c.lapses > 0).length;
  const avgBox = cards.length > 0 ? cards.reduce((s, c) => s + c.box, 0) / cards.length : 0;
  return { total: cards.length, due, mastered, learning, shaky, avgBox };
}

/** Kiraan kesilapan (topik dengan sekurang-kurangnya satu gagal). */
export function mistakeCount(cards: ReviewCard[]): number {
  return cards.filter((c) => c.lapses > 0).length;
}

/** Kad bagi seorang murid, selamat jika medan tidak ada. */
export function cardsOf(profile: Profile | null | undefined): ReviewCard[] {
  return profile?.reviews ?? [];
}

/**
 * Bina kad ulangan daripada rekod latihan sedia ada.
 *
 * Digunakan apabila data lama dinaik taraf: murid yang sudah banyak berlatih
 * terus mendapat jadual ulangan daripada sejarahnya, tanpa perlu mula semula.
 */
export function backfillReviews(profile: Profile, today = todayKey()): ReviewCard[] {
  const ordered = [...profile.attempts]
    .filter((a) => a.topicId !== 'diagnostic' && a.topicId !== 'exam' && a.total > 0)
    .sort((a, b) => a.ts - b.ts);
  let cards: ReviewCard[] = [];
  for (const a of ordered) {
    cards = applyOutcomes(
      cards,
      [{ topicId: a.topicId, subject: a.subject, year: a.year, correct: a.correct, total: a.total }],
      today,
    );
  }
  // Kad daripada sejarah lama tidak patut terus menyerbu senarai hari ini:
  // jadualkan semula supaya murid bermula dengan beberapa ulangan sahaja.
  return cards.map((c, i) => ({
    ...c,
    dueDate: i < DAILY_REVIEW_LIMIT ? today : addDays(today, Math.max(1, intervalFor(c.box))),
  }));
}
