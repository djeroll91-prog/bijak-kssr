/**
 * Storan keadaan aplikasi berasaskan React Context.
 * Menguruskan profil murid, tetapan, kemajuan dan ganjaran.
 * Semua perubahan disimpan ke localStorage secara automatik.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppData, Attempt, Badge, Profile, Settings, SubjectId, YearNum } from '../data/types';
import {
  DEFAULT_SETTINGS,
  clearData,
  emptyData,
  exportData as doExport,
  importData as doImport,
  loadData,
  newProfile,
  saveData,
  todayKey,
} from '../lib/storage';
import { newBadges } from '../data/badges';
import { sound, voice } from '../lib/audio';
import { translate, type Lang } from '../lib/i18n';

export type ScreenId =
  | 'home'
  | 'subjects'
  | 'topics'
  | 'notes'
  | 'quiz'
  | 'result'
  | 'games'
  | 'game'
  | 'progress'
  | 'badges'
  | 'profile';

export interface NavState {
  screen: ScreenId;
  subject?: SubjectId;
  topicId?: string;
  gameId?: string;
  /** Data keputusan untuk dipaparkan pada skrin result. */
  result?: QuizResult;
  /** Tetapan latihan pantas. */
  quick?: { topicIds: string[]; label: string };
  /** Kembali ke skrin mana selepas result. */
  from?: ScreenId;
}

export interface QuizResult {
  topicId: string;
  topicTitle: string;
  subject: SubjectId;
  year: YearNum;
  correct: number;
  total: number;
  seconds: number;
  answers: {
    questionId: string;
    prompt: string;
    correct: string;
    given: string;
    ok: boolean;
    explanation: string;
  }[];
  stars: number;
  points: number;
  badges: Badge[];
  perfect: boolean;
}

interface Store {
  data: AppData;
  lang: Lang;
  settings: Settings;
  profile: Profile | null;
  nav: NavState;
  /** Lencana yang perlu diumumkan dengan animasi. */
  pendingBadges: Badge[];
  toast: string | null;

  /** Navigasi */
  go: (nav: NavState) => void;
  back: () => void;
  canGoBack: boolean;

  /** Profil */
  createProfile: (name: string, avatar: string, year: YearNum) => void;
  switchProfile: (id: string) => void;
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'avatar' | 'year'>>) => void;
  addProfile: (name: string, avatar: string, year: YearNum) => void;
  removeProfile: (id: string) => void;

  /** Tetapan */
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setLang: (lang: Lang) => void;

  /** Latihan */
  recordAttempt: (attempt: Omit<Attempt, 'id' | 'ts'>) => { stars: number; points: number; badges: Badge[] };
  markTopicSeen: (topicId: string) => void;
  consumePendingBadges: () => void;
  celebrateBadge: (id: string) => void;

  /** Data */
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  resetAll: () => void;
  showToast: (msg: string) => void;
}

const Ctx = createContext<Store | null>(null);

/** Kira bintang berdasarkan peratus markah. */
export function starsFor(correct: number, total: number): number {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 100) return 3;
  if (pct >= 80) return 2;
  if (pct >= 60) return 1;
  return 0;
}

/** Kira mata insentif. Markah penuh mendapat bonus besar. */
export function pointsFor(correct: number, total: number, seconds: number): number {
  const base = correct * 10;
  const perfect = correct === total && total > 0 ? 50 : 0;
  // Bonus kepantasan: sehingga 20 mata jika siap dalam masa singkat.
  const speed = seconds > 0 && seconds < 90 ? Math.round((90 - seconds) / 5) : 0;
  return base + perfect + Math.max(0, speed);
}

function streakUpdate(profile: Profile): { streakDays: number; lastActiveDate: string } {
  const today = todayKey();
  if (profile.lastActiveDate === today) {
    return { streakDays: Math.max(profile.streakDays, 1), lastActiveDate: today };
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (profile.lastActiveDate === yKey) {
    return { streakDays: profile.streakDays + 1, lastActiveDate: today };
  }
  return { streakDays: 1, lastActiveDate: today };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [nav, setNav] = useState<NavState>({ screen: 'home' });
  const [history, setHistory] = useState<NavState[]>([]);
  const [pendingBadges, setPendingBadges] = useState<Badge[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  // Simpan automatik setiap kali data berubah.
  useEffect(() => {
    saveData(data);
  }, [data]);

  const profile = useMemo(
    () => data.profiles.find((p) => p.id === data.activeProfileId) ?? null,
    [data.profiles, data.activeProfileId],
  );

  const settings = data.settings;

  // Selaraskan enjin bunyi dan suara dengan tetapan.
  useEffect(() => {
    sound.setEnabled(settings.sound);
  }, [settings.sound]);

  useEffect(() => {
    voice.setEnabled(settings.voice);
  }, [settings.voice]);

  // Bahasa antara muka disimpan bersama data aplikasi.
  const lang: Lang = data.lang;

  // Kesan visual pada elemen akar.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.calm = settings.calm ? 'on' : 'off';
    root.dataset.contrast = settings.contrast ? 'high' : 'normal';
    root.dataset.motion = settings.motion ? 'on' : 'off';
    root.style.setProperty('--fs-scale', String(settings.fontScale));
  }, [settings.calm, settings.contrast, settings.motion, settings.fontScale]);

  const go = useCallback((next: NavState) => {
    setHistory((h) => [...h, nav].slice(-30));
    setNav(next);
  }, [nav]);

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) {
        setNav({ screen: 'home' });
        return h;
      }
      const prev = h[h.length - 1];
      setNav(prev);
      return h.slice(0, -1);
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const createProfile = useCallback((name: string, avatar: string, year: YearNum) => {
    const p = newProfile(name, avatar, year);
    setData((d) => ({ ...d, profiles: [...d.profiles, p], activeProfileId: p.id }));
    setNav({ screen: 'home' });
    setHistory([]);
  }, []);

  const addProfile = useCallback((name: string, avatar: string, year: YearNum) => {
    const p = newProfile(name, avatar, year);
    setData((d) => ({ ...d, profiles: [...d.profiles, p], activeProfileId: p.id }));
    setNav({ screen: 'home' });
    setHistory([]);
  }, []);

  const switchProfile = useCallback((id: string) => {
    setData((d) => ({ ...d, activeProfileId: id }));
    setNav({ screen: 'home' });
    setHistory([]);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<Profile, 'name' | 'avatar' | 'year'>>) => {
      setData((d) => ({
        ...d,
        profiles: d.profiles.map((p) => (p.id === d.activeProfileId ? { ...p, ...patch } : p)),
      }));
    },
    [],
  );

  const removeProfile = useCallback((id: string) => {
    setData((d) => {
      const profiles = d.profiles.filter((p) => p.id !== id);
      return {
        ...d,
        profiles,
        activeProfileId: d.activeProfileId === id ? (profiles[0]?.id ?? null) : d.activeProfileId,
      };
    });
    setNav({ screen: 'home' });
    setHistory([]);
  }, []);

  const setSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setData((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  }, []);

  const setLang = useCallback((nextLang: Lang) => {
    setData((d) => ({ ...d, lang: nextLang }));
  }, []);

  const recordAttempt = useCallback(
    (attempt: Omit<Attempt, 'id' | 'ts'>) => {
      const stars = starsFor(attempt.correct, attempt.total);
      const points = pointsFor(attempt.correct, attempt.total, attempt.seconds);
      let gained: Badge[] = [];
      setData((d) => {
        const idx = d.profiles.findIndex((p) => p.id === d.activeProfileId);
        if (idx === -1) return d;
        const p = d.profiles[idx];
        const full: Attempt = {
          ...attempt,
          id: `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          ts: Date.now(),
        };
        const st = streakUpdate(p);
        const updated: Profile = {
          ...p,
          ...st,
          attempts: [...p.attempts, full],
          stars: p.stars + stars,
          points: p.points + points,
          seenTopics: p.seenTopics.includes(attempt.topicId)
            ? p.seenTopics
            : [...p.seenTopics, attempt.topicId],
        };
        gained = newBadges(updated);
        if (gained.length > 0) {
          updated.badges = [...updated.badges, ...gained.map((b) => b.id)];
        }
        const profiles = d.profiles.slice();
        profiles[idx] = updated;
        return { ...d, profiles };
      });
      return { stars, points, badges: gained };
    },
    [],
  );

  const markTopicSeen = useCallback((topicId: string) => {
    setData((d) => ({
      ...d,
      profiles: d.profiles.map((p) =>
        p.id === d.activeProfileId && !p.seenTopics.includes(topicId)
          ? { ...p, seenTopics: [...p.seenTopics, topicId] }
          : p,
      ),
    }));
  }, []);

  const consumePendingBadges = useCallback(() => setPendingBadges([]), []);
  const celebrateBadge = useCallback((id: string) => {
    setData((d) =>
      d.celebratedBadges.includes(id)
        ? d
        : { ...d, celebratedBadges: [...d.celebratedBadges, id] },
    );
  }, []);

  const exportDataFn = useCallback(() => doExport(data), [data]);

  const importDataFn = useCallback(async (file: File) => {
    const imported = await doImport(file);
    setData(imported);
    setNav({ screen: 'home' });
    setHistory([]);
  }, []);

  const resetAll = useCallback(() => {
    clearData();
    setData(emptyData());
    setNav({ screen: 'home' });
    setHistory([]);
  }, []);

  const value: Store = {
    data,
    lang,
    settings,
    profile,
    nav,
    pendingBadges,
    toast,
    go,
    back,
    canGoBack: history.length > 0,
    createProfile,
    switchProfile,
    updateProfile,
    addProfile,
    removeProfile,
    setSetting,
    setLang,
    recordAttempt,
    markTopicSeen,
    consumePendingBadges,
    celebrateBadge,
    exportData: exportDataFn,
    importData: importDataFn,
    resetAll,
    showToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Penterjemah ringkas untuk komponen. */
export function useT() {
  const { lang } = useStore();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );
}

export { DEFAULT_SETTINGS };
