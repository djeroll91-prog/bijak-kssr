/** Kerangka aplikasi: navigasi, penghalaan skrin dan kesan global. */

import { useCallback, useEffect } from 'react';
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
import { sound } from './lib/audio';
import type { ScreenId } from './state/store';

const NAV_ITEMS: { id: ScreenId; icon: string; labelKey: string }[] = [
  { id: 'home', icon: '🏠', labelKey: 'nav.home' },
  { id: 'subjects', icon: '📚', labelKey: 'nav.subjects' },
  { id: 'games', icon: '🎮', labelKey: 'nav.games' },
  { id: 'progress', icon: '📊', labelKey: 'nav.progress' },
  { id: 'profile', icon: '🙂', labelKey: 'nav.profile' },
];

function BottomNav() {
  const { nav, go } = useStore();
  const t = useT();

  // Skrin result/quiz/notes/game ialah skrin "dalaman" — sorokkan nav bawah
  // supaya murid fokus, kecuali result yang membenarkan pulang segera.
  const hidden: ScreenId[] = ['quiz', 'game'];
  if (hidden.includes(nav.screen)) return null;

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nav-item"
          data-active={nav.screen === item.id || (item.id === 'subjects' && ['topics', 'notes'].includes(nav.screen)) ? 'true' : 'false'}
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
