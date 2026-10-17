/**
 * Trend markah mengikut skop (semua, subjek atau topik).
 *
 * Skrin kemajuan asal hanya menunjukkan satu graf global. Modul ini
 * menapis percubaan mengikut skop supaya ibu bapa boleh melihat sama ada
 * satu topik tertentu benar-benar bertambah baik, bukan hanya purata.
 */

import type { Attempt } from '../data/types';

export interface TrendPoint {
  label: string;
  value: number;
}

/** Penapis skop: subjek dan/atau topik tertentu. */
export interface TrendScope {
  subject?: string;
  topicId?: string;
}

/**
 * Titik trend markah (peratus) bagi percubaan yang sepadan dengan skop.
 * Percubaan tanpa jumlah soalan dilangkau kerana peratusnya tidak bermakna.
 */
export function trendPoints(attempts: Attempt[], scope: TrendScope = {}, limit = 12): TrendPoint[] {
  const rel = attempts
    .filter((a) => a.total > 0)
    .filter((a) => (scope.subject ? a.subject === scope.subject : true))
    .filter((a) => (scope.topicId ? a.topicId === scope.topicId : true))
    .slice(-limit);
  return rel.map((a, i) => ({
    label: String(i + 1),
    value: Math.round((a.correct / a.total) * 100),
  }));
}

/**
 * Arah trend dalam mata peratus: separuh kedua tolak separuh pertama.
 * Pulangan 0 jika titik terlalu sedikit untuk dibandingkan.
 */
export function trendDelta(points: TrendPoint[]): number {
  if (points.length < 4) return 0;
  const mid = Math.floor(points.length / 2);
  const avg = (xs: TrendPoint[]) => xs.reduce((s, p) => s + p.value, 0) / xs.length;
  return Math.round(avg(points.slice(mid)) - avg(points.slice(0, mid)));
}

/** Senarai subjek yang ada percubaan, mengikut susunan kemunculan. */
export function subjectsWithData(attempts: Attempt[]): string[] {
  const seen: string[] = [];
  for (const a of attempts) {
    if (a.total > 0 && !seen.includes(a.subject)) seen.push(a.subject);
  }
  return seen;
}

/** Senarai topik yang ada percubaan, mengikut susunan kemunculan. */
export function topicsWithData(attempts: Attempt[], subject?: string): string[] {
  const seen: string[] = [];
  for (const a of attempts) {
    if (a.total === 0) continue;
    if (subject && a.subject !== subject) continue;
    if (!seen.includes(a.topicId)) seen.push(a.topicId);
  }
  return seen;
}
