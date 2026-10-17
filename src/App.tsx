/** Kerangka aplikasi: navigasi, penghalaan skrin dan kesan global. */

import { useCallback, useEffect, type ReactNode } from 'react';
import { StoreProvider, useStore, useT } from './state/store';
import { Onboarding } from './screens/Onboarding';
import { HomeScreen } from './screens/Home';
import { SubjectsScreen } from './screens/Subjects';
import { TopicsScreen } from './screens/Topics';
import { NotesScreen } from './screens/Notes';
import { QuizScreen } from './screens/Quiz';
import { ResultScreen } from './screens/Result';
import { ProgressScreen } from './screens/Progress';
import { BadgesScreen } from './screens/Badges';
import { ProfileScreen } from './screens/Profile';
import { GamesScreen, GameScreen } from './screens/Games';
import { PlanScreen } from './screens/Plan';
import { DiagnosticScreen } from './screens/Diagnostic';
import { ReportScreen } from './screens/Report';
import { MockExamScreen } from './screens/MockExam';
import { ExamResultScreen } from './screens/ExamResult';
import { ExamTipsScreen } from './screens/ExamTips';
import { sound } from './lib/audio';
import type { ScreenId } from './state/store';

const NAV_ITEMS: { id: ScreenId; icon: string; labelKey: string }[] = [
  { id: 'home', icon: '🏠', labelKey: 'nav.home' },
  { id: 'subjects', icon: '📚', labelKey: 'nav.subjects' },
  { id: 'plan', icon: '🗺️', labelKey: 'nav.plan' },
  { id: 'games', icon: '🎮', labelKey: 'nav.games' },
  { id: 'progress', icon: '📊', labelKey: 'nav.progress' },
  { id: 'profile', icon: '🙂', labelKey: 'nav.profile' },
];

/** Skrin yang berkongsi tab "Subjek" pada navigasi bawah. */
const SUBJECT_TABS: ScreenId[] = ['topics', 'notes'];

/** Skrin yang berkongsi tab "Pelan" pada navigasi bawah. */
const PLAN_TABS: ScreenId[] = ['diagnostic', 'report', 'examTips', 'examResult'];

function BottomNav() {
  const { nav, go } = useStore();
  const t = useT();

  // Skrin result/quiz/notes/game ialah skrin "dalaman" — sorokkan nav bawah
  // supaya murid fokus, kecuali result yang membenarkan pulang segera.
  const hidden: ScreenId[] = ['quiz', 'game', 'mockExam'];
  if (hidden.includes(nav.screen)) return null;

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nav-item"
          data-active={
            nav.screen === item.id ||
            (item.id === 'subjects' && SUBJECT_TABS.includes(nav.screen)) ||
            (item.id === 'plan' && PLAN_TABS.includes(nav.screen))
              ? 'true'
              : 'false'
          }
          aria-current={nav.screen === item.id ? 'page' : undefined}
          onClick={() => {
            sound.play('tap');
            go({ screen: item.id });
          }}
        >
          <span className="ico" aria-hidden="true">
            {item.icon}
          </span>
          {t(item.labelKey)}
        </button>
      ))}
    </nav>
  );
}

/**
 * Bar sisi untuk susun atur desktop (skrin lebar dalam pelayar). Menggunakan
 * senarai navigasi yang sama seperti nav bawah, jadi tingkah laku konsisten.
 * Disembunyikan oleh CSS pada telefon dan dalam APK.
 */
function SideNav() {
  const { nav, go, profile, lang } = useStore();
  const t = useT();

  const active = (id: ScreenId) =>
    nav.screen === id ||
    (id === 'subjects' && SUBJECT_TABS.includes(nav.screen)) ||
    (id === 'plan' && PLAN_TABS.includes(nav.screen));

  return (
    <nav className="side-nav" aria-label="Navigasi utama">
      <div className="side-nav-brand">
        <span className="mark" aria-hidden="true">
          🎒
        </span>
        <div>
          <div className="name">{t('app.name')}</div>
          <div className="sub">{t('app.tagline')}</div>
        </div>
      </div>

      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="side-nav-item"
          data-active={active(item.id) ? 'true' : 'false'}
          aria-current={nav.screen === item.id ? 'page' : undefined}
          onClick={() => {
            sound.play('tap');
            go({ screen: item.id });
          }}
        >
          <span className="ico" aria-hidden="true">
            {item.icon}
          </span>
          {t(item.labelKey)}
        </button>
      ))}

      {profile ? (
        <div className="side-nav-foot">
          <div className="side-nav-who">
            <span className="avatar" aria-hidden="true">
              {profile.avatar}
            </span>
            <div>
              <div className="nm">{profile.name}</div>
              <div className="yr">
                {lang === 'en' ? `Year ${profile.year}` : `Tahun ${profile.year}`}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

/**
 * Bungkus skrin dengan animasi masuk supaya peralihan halaman terasa hidup.
 * Kunci berubah mengikut skrin, jadi setiap peralihan mencetuskan animasi.
 */
function ScreenStage({ screen, children }: { screen: ScreenId; children: ReactNode }) {
  return (
    <div className="screen-stage" key={screen} data-screen={screen}>
      {children}
    </div>
  );
}

function Router() {
  const { profile, nav, toast, data } = useStore();
  const saveScore = useGameScore();

  if (!profile) {
    return (
      <div className="phone">
        <Onboarding />
      </div>
    );
  }

  return (
    <div className="phone">
      <SideNav />
      <ScreenStage screen={nav.screen}>
        {nav.screen === 'home' ? <HomeScreen /> : null}
        {nav.screen === 'subjects' ? <SubjectsScreen /> : null}
        {nav.screen === 'topics' ? <TopicsScreen /> : null}
        {nav.screen === 'notes' ? <NotesScreen /> : null}
        {nav.screen === 'quiz' ? <QuizScreen /> : null}
        {nav.screen === 'result' ? <ResultScreen /> : null}
        {nav.screen === 'progress' ? <ProgressScreen /> : null}
        {nav.screen === 'badges' ? <BadgesScreen /> : null}
        {nav.screen === 'profile' ? <ProfileScreen /> : null}
        {nav.screen === 'games' ? <GamesScreen /> : null}
        {nav.screen === 'game' ? <GameScreen onScore={saveScore} /> : null}
        {nav.screen === 'plan' ? <PlanScreen /> : null}
        {nav.screen === 'diagnostic' ? <DiagnosticScreen /> : null}
        {nav.screen === 'report' ? <ReportScreen /> : null}
        {nav.screen === 'mockExam' ? <MockExamScreen /> : null}
        {nav.screen === 'examResult' ? <ExamResultScreen /> : null}
        {nav.screen === 'examTips' ? <ExamTipsScreen /> : null}
      </ScreenStage>

      <BottomNav />

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}

      <span hidden>{data.version}</span>
    </div>
  );
}

/** Simpan rekod terbaik permainan dalam localStorage. */
function useGameScore(): (gameId: string, score: number) => void {
  return useCallback((gameId: string, score: number) => {
    try {
      const raw = localStorage.getItem('bijak-kssr/gamebest');
      const best: Record<string, number> = raw ? JSON.parse(raw) : {};
      if ((best[gameId] ?? 0) < score) {
        best[gameId] = score;
        localStorage.setItem('bijak-kssr/gamebest', JSON.stringify(best));
      }
    } catch {
      // Abaikan.
    }
  }, []);
}

/** Buka kunci audio pada interaksi pertama (keperluan pelayar). */
function useAudioUnlock() {
  useEffect(() => {
    const unlock = () => {
      sound.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);
}

export function App() {
  useAudioUnlock();
  return (
    <StoreProvider>
      <div className="app-shell">
        <Router />
      </div>
    </StoreProvider>
  );
}
