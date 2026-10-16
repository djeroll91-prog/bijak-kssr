/**
 * Penyimpanan tempatan (localStorage) dengan versi skema dan migrasi.
 *
 * Data disimpan dalam peranti murid sahaja. Reka bentuk versi ini
 * membolehkan aplikasi dikemas kini tanpa kehilangan rekod lama.
 */

import type { AppData, Attempt, Profile, Settings, YearNum } from '../data/types';

const KEY = 'bijak-kssr/v1';
export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  voice: false,
  motion: true,
  calm: false,
  contrast: false,
  dark: false,
  fontScale: 1,
};

export function emptyData(): AppData {
  return {
    version: SCHEMA_VERSION,
    activeProfileId: null,
    profiles: [],
    settings: { ...DEFAULT_SETTINGS },
    lang: 'ms',
    celebratedBadges: [],
  };
}

export function newProfile(name: string, avatar: string, year: YearNum): Profile {
  return {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Murid',
    avatar,
    year,
    createdAt: Date.now(),
    attempts: [],
    badges: [],
    streakDays: 0,
    lastActiveDate: todayKey(),
    stars: 0,
    points: 0,
    seenTopics: [],
  };
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Betulkan dan lengkapkan rekod yang mungkin tidak lengkap. */
function repairAttempt(raw: unknown): Attempt | null {
  if (!isObj(raw)) return null;
  const total = Number(raw.total);
  const correct = Number(raw.correct);
  if (!Number.isFinite(total) || total <= 0) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : `a-${Math.random().toString(36).slice(2, 9)}`,
    ts: Number(raw.ts) || Date.now(),
    year: clampYear(Number(raw.year)),
    subject: (raw.subject as Attempt['subject']) ?? 'matematik',
    topicId: typeof raw.topicId === 'string' ? raw.topicId : 'unknown',
    topicTitle: typeof raw.topicTitle === 'string' ? raw.topicTitle : 'Topik',
    correct: Math.max(0, Math.min(correct, total)),
    total,
    seconds: Math.max(0, Number(raw.seconds) || 0),
    retries: Math.max(0, Number(raw.retries) || 0),
  };
}

function clampYear(n: number): YearNum {
  const v = Math.round(n);
  if (v < 1) return 1;
  if (v > 6) return 6;
  return v as YearNum;
}

function repairProfile(raw: unknown): Profile | null {
  if (!isObj(raw)) return null;
  const attempts = Array.isArray(raw.attempts)
    ? raw.attempts.map(repairAttempt).filter((a): a is Attempt => a !== null)
    : [];
  return {
    id: typeof raw.id === 'string' ? raw.id : `p-${Math.random().toString(36).slice(2, 9)}`,
    name: typeof raw.name === 'string' ? raw.name : 'Murid',
    avatar: typeof raw.avatar === 'string' ? raw.avatar : '🦊',
    year: clampYear(Number(raw.year) || 1),
    createdAt: Number(raw.createdAt) || Date.now(),
    attempts,
    badges: Array.isArray(raw.badges) ? raw.badges.filter((b): b is string => typeof b === 'string') : [],
    streakDays: Math.max(0, Number(raw.streakDays) || 0),
    lastActiveDate: typeof raw.lastActiveDate === 'string' ? raw.lastActiveDate : todayKey(),
    stars: Math.max(0, Number(raw.stars) || 0),
    points: Math.max(0, Number(raw.points) || 0),
    seenTopics: Array.isArray(raw.seenTopics)
      ? raw.seenTopics.filter((t): t is string => typeof t === 'string')
      : [],
  };
}

function repairSettings(raw: unknown): Settings {
  if (!isObj(raw)) return { ...DEFAULT_SETTINGS };
  return {
    sound: raw.sound !== false,
    voice: raw.voice === true,
    motion: raw.motion !== false,
    calm: raw.calm === true,
    contrast: raw.contrast === true,
    dark: raw.dark === true,
    fontScale: clampFont(Number(raw.fontScale)),
  };
}

function clampFont(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(1.3, Math.max(0.9, n));
}

/**
 * Muat data aplikasi. Data rosak akan diganti dengan data kosong
 * supaya aplikasi sentiasa boleh dibuka.
 */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData();
    const parsed: unknown = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return emptyData();
  }
}

/** Naik taraf data lama kepada skema semasa. */
export function migrate(raw: unknown): AppData {
  if (!isObj(raw)) return emptyData();
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles.map(repairProfile).filter((p): p is Profile => p !== null)
    : [];
  const activeId =
    typeof raw.activeProfileId === 'string' && profiles.some((p) => p.id === raw.activeProfileId)
      ? raw.activeProfileId
      : (profiles[0]?.id ?? null);
  return {
    version: SCHEMA_VERSION,
    activeProfileId: activeId,
    profiles,
    settings: repairSettings(raw.settings),
    lang: raw.lang === 'en' ? 'en' : 'ms',
    celebratedBadges: Array.isArray(raw.celebratedBadges)
      ? raw.celebratedBadges.filter((b): b is string => typeof b === 'string')
      : [],
  };
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storan penuh atau disekat — aplikasi terus berfungsi dalam sesi ini.
  }
}

/** Eksport data sebagai fail JSON untuk sandaran. */
export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bijak-kssr-sandaran-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Import data daripada fail sandaran. */
export async function importData(file: File): Promise<AppData> {
  const text = await file.text();
  return migrate(JSON.parse(text));
}

/** Padam semua data pada peranti ini. */
export function clearData(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(`${KEY}/celebrated`);
  } catch {
    // Abaikan.
  }
}

/** Kira statistik ringkas untuk paparan profil. */
export function profileStats(profile: Profile) {
  const total = profile.attempts.length;
  const questions = profile.attempts.reduce((s, a) => s + a.total, 0);
  const correct = profile.attempts.reduce((s, a) => s + a.correct, 0);
  const perfect = profile.attempts.filter((a) => a.correct === a.total && a.total > 0).length;
  const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : 0;
  const minutes = Math.round(profile.attempts.reduce((s, a) => s + a.seconds, 0) / 60);
  return { total, questions, correct, perfect, accuracy, minutes };
}
