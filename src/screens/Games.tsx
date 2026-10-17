/**
 * Mini permainan pendidikan.
 * Setiap permainan menggunakan soalan sebenar daripada penjana
 * supaya murid belajar sambil bermain.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore, useT } from '../state/store';
import { ALL_TOPICS, generateQuestions, topicsFor } from '../data/catalog';
import { gamesForSubject, subjectById, GAMES } from '../data/subjects';
import { gameBlurb, gameName } from '../lib/i18n';
import { Btn, Chip, Confetti, EmptyState, Sheet, TopBar } from '../components/ui';
import { sound } from '../lib/audio';
import type { Question, SubjectId, Topic } from '../data/types';

/* ================================================================== */
/* Skrin senarai permainan                                             */
/* ================================================================== */

export function GamesScreen() {
  const { profile, nav, go, back, lang } = useStore();
  const t = useT();
  const [best, setBest] = useState<Record<string, number>>({});

  // Rekod terbaik disimpan berasingan daripada percubaan latihan.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bijak-kssr/gamebest');
      if (raw) setBest(JSON.parse(raw));
    } catch {
      // Abaikan.
    }
  }, []);

  if (!profile) return null;

  const subject: SubjectId | undefined = nav.subject;
  const available = subject ? gamesForSubject(subject, profile.year) : GAMES.filter((g) => profile.year >= g.minYear);

  return (
    <div className="screen">
      <TopBar onBack={back} title={t('games.title')} subtitle={t('games.sub')} />
      <div className="screen-scroll">
        <div className="card-flat">
          <p className="tiny muted center">🎮 {t('games.sub')} — {t('profile.offline')}</p>
        </div>
        <div className="stack" style={{ marginTop: 14 }}>
          {available.map((g) => (
            <button
              key={g.id}
              type="button"
              className="topic-item"
              onClick={() => {
                sound.play('win');
                go({ screen: 'game', gameId: g.id, subject: subject ?? g.subjects?.[0], from: 'games' });
              }}
            >
              <span className="badge" aria-hidden="true" style={{ background: 'var(--accent-soft)', fontSize: '1.5rem' }}>
                {g.emoji}
              </span>
              <span className="grow">
                <b>{gameName(lang, g.id, g.name)}</b>
                <small>{gameBlurb(lang, g.id, g.blurb)}</small>
                {best[g.id] !== undefined ? (
                  <span style={{ display: 'block', marginTop: 4 }}>
                    <Chip tone="success">
                      🏆 {t('games.best')}: {best[g.id]}
                    </Chip>
                  </span>
                ) : null}
              </span>
              <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>
                ▶️
              </span>
            </button>
          ))}
        </div>
        {available.length === 0 ? <EmptyState emoji="🎮" title={t('subjects.notAvailable')} /> : null}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Skrin permainan tunggal                                             */
/* ================================================================== */

export function GameScreen({ onScore }: { onScore: (gameId: string, score: number) => void }) {
  const { nav, profile, back, go, lang } = useStore();
  const t = useT();
  const gameId = nav.gameId ?? 'gelembung-nombor';
  const meta = GAMES.find((g) => g.id === gameId) ?? GAMES[0];

  const [finished, setFinished] = useState<{ score: number; label: string } | null>(null);

  const handleEnd = useCallback(
    (score: number, label: string) => {
      setFinished({ score, label });
      onScore(gameId, score);
      sound.play(score > 0 ? 'win' : 'tap');
    },
    [gameId, onScore],
  );

  if (!profile) return null;

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={`${meta.emoji} ${gameName(lang, meta.id, meta.name)}`}
        subtitle={gameBlurb(lang, meta.id, meta.blurb)}
        right={<Chip tone="brand">{t('common.grade')} {profile.year}</Chip>}
      />
      <div className="screen-scroll" data-flush="true" style={{ display: 'flex', flexDirection: 'column' }}>
        {gameId === 'gelembung-nombor' ? <BubbleGame year={profile.year} subject={nav.subject} onEnd={handleEnd} /> : null}
        {gameId === 'padan-ingatan' ? <MemoryGame year={profile.year} subject={nav.subject} onEnd={handleEnd} /> : null}
        {gameId === 'cari-perkataan' ? <WordSearchGame year={profile.year} subject={nav.subject} onEnd={handleEnd} /> : null}
        {gameId === 'susun-cepat' ? <OrderGame year={profile.year} subject={nav.subject} onEnd={handleEnd} /> : null}
        {gameId === 'teka-cepat' ? <SpeedQuizGame year={profile.year} subject={nav.subject} onEnd={handleEnd} /> : null}
      </div>

      <Sheet open={finished !== null} onClose={() => setFinished(null)} title="🎉">
        {finished ? (
          <div className="stack center">
            <span style={{ fontSize: '3rem' }} aria-hidden="true">
              {finished.score >= 15 ? '🏆' : finished.score >= 8 ? '🎉' : '💪'}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{finished.label}</h3>
            <p className="muted tiny">{t('games.score')}: {finished.score}</p>
            <Btn block variant="accent" onClick={() => { setFinished(null); /* main semula */ go({ screen: 'game', gameId, subject: nav.subject, from: 'games' }); }}>
              🔄 {t('games.playAgain')}
            </Btn>
            <Btn block variant="ghost" onClick={() => go({ screen: 'games' })}>
              🎮 {t('games.title')}
            </Btn>
            <Btn block variant="ghost" onClick={() => go({ screen: 'home' })}>
              🏠 {t('result.backHome')}
            </Btn>
          </div>
        ) : null}
      </Sheet>

      <Confetti fireKey={finished && finished.score >= 8 ? 1 : 0} count={70} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pembantu: dapatkan topik + soalan                                   */
/* ------------------------------------------------------------------ */

function useGameTopics(year: number, subject: SubjectId | undefined): Topic[] {
  const y = year as Topic['year'];
  return useMemo(() => {
    if (subject) {
      const list = topicsFor(subject, y);
      return list.length > 0 ? list : ALL_TOPICS.filter((x) => x.year === y);
    }
    return ALL_TOPICS.filter((x) => x.year === y);
  }, [subject, y]);
}

function pickQuestions(topics: Topic[], count: number, seed: number): Question[] {
  if (topics.length === 0) return [];
  const out: Question[] = [];
  const per = Math.ceil(count / Math.min(topics.length, count));
  let k = 0;
  for (const tp of topics) {
    if (out.length >= count) break;
    out.push(...generateQuestions(tp.id, per, seed + k * 104729));
    k += 1;
  }
  return out.slice(0, count);
}

/* ================================================================== */
/* Permainan 1: Gelembung Nombor                                       */
/* ================================================================== */

interface Bubble {
  id: number;
  x: number;
  y: number;
  vy: number;
  text: string;
  ok: boolean;
  colour: string;
  size: number;
}

function BubbleGame({
  year,
  subject,
  onEnd,
}: {
  year: number;
  subject?: SubjectId;
  onEnd: (score: number, label: string) => void;
}) {
  const t = useT();
  const topics = useGameTopics(year, subject);
  const [questions] = useState(() => pickQuestions(topics, 12, Math.floor(Math.random() * 1e9)));
  const [qi, setQi] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(true);
  const areaRef = useRef<HTMLDivElement>(null);

  const current = questions[qi];

  // Bina gelembung untuk soalan semasa.
  useEffect(() => {
    if (!current || !running) return;
    const opts = current.options ?? [];
    const answers = opts.length > 0 ? opts : [String(current.answer)];
    const spread = 100 / answers.length;
    setBubbles(
      answers.map((text, i) => ({
        id: qi * 100 + i,
        x: spread * i + spread * 0.1 + Math.random() * spread * 0.5,
        y: 78 + Math.random() * 16,
        vy: 0.14 + Math.random() * 0.14,
        text,
        ok: text === String(current.answer),
        colour: BUBBLE_COLOURS[i % BUBBLE_COLOURS.length],
        size: Math.max(58, 76 - text.length * 1.6),
      })),
    );
  }, [current, qi, running]);

  // Gerakkan gelembung naik.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      setBubbles((bs) => {
        let missed = false;
        const moved = bs.map((b) => {
          const ny = b.y - b.vy * dt * 0.06;
          if (ny < -8) missed = true;
          return { ...b, y: ny < -8 ? -8 : ny };
        });
        if (missed && current) {
          // Gelembung jawapan betul terlepas → kehilangan nyawa.
          const correctEscaped = moved.every((b) => b.y <= -7 && !b.ok);
          if (correctEscaped) {
            setLives((l) => l - 1);
            setTimeout(() => setQi((q) => (q + 1) % Math.max(questions.length, 1)), 120);
          }
        }
        return moved;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, current, questions.length]);

  // Pemasa permainan.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        if (s <= 6) sound.tickUrgent();
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (lives <= 0 && running) setRunning(false);
  }, [lives, running]);

  useEffect(() => {
    if (!running) {
      onEnd(score, score >= 15 ? t('games.endChampion') : score >= 8 ? t('games.endGood') : t('games.endTryAgain'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const pop = (b: Bubble) => {
    if (!running) return;
    sound.play(b.ok ? 'correct' : 'wrong');
    if (b.ok) {
      setScore((s) => s + 2);
      setBubbles([]);
      setQi((q) => (q + 1) % Math.max(questions.length, 1));
    } else {
      setLives((l) => l - 1);
      setBubbles((bs) => bs.filter((x) => x.id !== b.id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="game-hud">
        <Chip tone="brand">⭐ {score}</Chip>
        <Chip tone={timeLeft <= 10 ? 'danger' : 'warn'}>⏱️ {timeLeft}s</Chip>
        <Chip tone="danger">{'❤️'.repeat(Math.max(lives, 0)) || '💔'}</Chip>
      </div>

      {current ? (
        <div className="q-prompt" style={{ margin: '0 0 10px', padding: '14px 12px' }}>
          <p style={{ fontSize: '1.02rem', fontWeight: 900 }}>{current.prompt}</p>
        </div>
      ) : null}

      <div className="game-stage" ref={areaRef} style={{ minHeight: 340 }}>
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            className="bubble"
            aria-label={b.text}
            onClick={() => pop(b)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              background: b.colour,
              fontSize: b.text.length > 8 ? '0.68rem' : b.text.length > 5 ? '0.8rem' : '1.05rem',
              transform: 'translate(-50%, -50%)',
              padding: 4,
            }}
          >
            {b.text}
          </button>
        ))}
        {!running ? (
          <div className="center" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.75)' }}>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>🏁 {t('games.score')}: {score}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* Warna gelembung ikut token subjek supaya kontras teks kekal lulus
   dalam mod cerah dan gelap (lihat --on-fill). */
const BUBBLE_COLOURS = [
  'var(--sub-matematik)',
  'var(--sub-bahasa-melayu)',
  'var(--sub-english)',
  'var(--sub-sains)',
  'var(--sub-sejarah)',
];

/* ================================================================== */
/* Permainan 2: Padan Ingatan                                          */
/* ================================================================== */

function MemoryGame({
  year,
  subject,
  onEnd,
}: {
  year: number;
  subject?: SubjectId;
  onEnd: (score: number, label: string) => void;
}) {
  const t = useT();
  const topics = useGameTopics(year, subject);
  const [questions] = useState(() => pickQuestions(topics, 8, Math.floor(Math.random() * 1e9)));
  const [moves, setMoves] = useState(0);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [lock, setLock] = useState(false);

  // Bina pasangan: teks soalan ↔ jawapannya.
  const cards = useMemo(() => {
    const pairs = questions
      .filter((q) => q.options && q.options.length > 0 && String(q.answer).length < 22)
      .slice(0, 6)
      .map((q) => ({ a: `${q.emoji ?? ''} ${q.prompt.split('\n')[0].slice(0, 26)}`, b: String(q.answer) }));
    const flat: { key: string; text: string; pair: number }[] = [];
    pairs.forEach((p, i) => {
      flat.push({ key: `a${i}`, text: p.a, pair: i });
      flat.push({ key: `b${i}`, text: p.b, pair: i });
    });
    return shuffle(flat);
  }, [questions]);

  const finishGame = useCallback(
    (finalMoves: number) => {
      const score = Math.max(0, cards.length * 2 - finalMoves);
      onEnd(score, finalMoves <= cards.length * 0.8 ? t('games.endMemory') : t('games.endGood'));
    },
    [cards.length, onEnd],
  );

  const flip = (idx: number) => {
    if (lock || open.includes(idx) || done.has(idx)) return;
    sound.play('pop');
    const next = [...open, idx];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].pair === cards[b].pair) {
        sound.play('correct');
        const nd = new Set(done);
        nd.add(a);
        nd.add(b);
        setDone(nd);
        setOpen([]);
        if (nd.size === cards.length) {
          window.setTimeout(() => finishGame(moves + 1), 400);
        }
      } else {
        sound.play('wrong');
        setLock(true);
        window.setTimeout(() => {
          setOpen([]);
          setLock(false);
        }, 620);
      }
    }
  };

  if (cards.length === 0) return <EmptyState emoji="🧠" title={t('common.loading')} />;

  return (
    <div>
      <div className="game-hud">
        <Chip tone="brand">🔁 {t('games.moves')}: {moves}</Chip>
        <Chip tone="success">✅ {done.size / 2}/{cards.length / 2}</Chip>
      </div>
      <p className="tiny muted center" style={{ marginBottom: 10 }}>
        {t('quiz.matchPairs')} — cari pasangan soalan &amp; jawapan
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {cards.map((c, i) => {
          const isOpen = open.includes(i) || done.has(i);
          return (
            <button
              key={c.key}
              type="button"
              className="memory-card"
              data-open={isOpen ? 'true' : 'false'}
              data-done={done.has(i) ? 'true' : 'false'}
              onClick={() => flip(i)}
              style={{ fontSize: isOpen && c.text.length > 12 ? '0.58rem' : '0.9rem', padding: 6 }}
            >
              {isOpen ? c.text : '❔'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Permainan 3: Cari Perkataan                                         */
/* ================================================================== */

function WordSearchGame({
  year,
  subject,
  onEnd,
}: {
  year: number;
  subject?: SubjectId;
  onEnd: (score: number, label: string) => void;
}) {
  const t = useT();
  const topics = useGameTopics(year, subject);

  const puzzle = useMemo(() => buildWordSearch(topics, year, subject), [topics, year, subject]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<number[]>([]);

  const grid = puzzle.grid;
  const words = puzzle.words;

  const finish = useCallback(
    (count: number) => onEnd(count * 3, count === words.length ? t('games.endFinder') : t('games.endGood')),
    [onEnd, words.length],
  );

  const cellClick = (idx: number) => {
    if (sel.length === 0) {
      sound.play('tick');
      setSel([idx]);
      return;
    }
    if (sel.length === 1) {
      const a = sel[0];
      // Hanya sokong garisan lurus mendatar atau menegak.
      const w = grid[0].length;
      const ar = Math.floor(a / w);
      const ac = a % w;
      const br = Math.floor(idx / w);
      const bc = idx % w;
      if (ar === br || ac === bc) {
        const cells: number[] = [];
        if (ar === br) {
          const [s, e] = ac < bc ? [ac, bc] : [bc, ac];
          for (let c = s; c <= e; c += 1) cells.push(ar * w + c);
        } else {
          const [s, e] = ar < br ? [ar, br] : [br, ar];
          for (let r = s; r <= e; r += 1) cells.push(r * w + ac);
        }
        const text = cells.map((c) => grid[Math.floor(c / w)][c % w]).join('');
        const rev = text.split('').reverse().join('');
        const hit = words.find((w2) => (w2.word === text || w2.word === rev) && !found.has(w2.word));
        if (hit) {
          sound.play('correct');
          const nf = new Set(found);
          nf.add(hit.word);
          setFound(nf);
          if (nf.size === words.length) window.setTimeout(() => finish(nf.size), 400);
        } else {
          sound.play('wrong');
        }
      } else {
        sound.play('wrong');
      }
      setSel([]);
    }
  };

  if (grid.length === 0 || words.length === 0) return <EmptyState emoji="🔍" title={t('common.loading')} />;

  return (
    <div>
      <div className="game-hud">
        <Chip tone="brand">✅ {t('games.found')}: {found.size}/{words.length}</Chip>
      </div>
      <p className="tiny muted center" style={{ marginBottom: 10 }}>
        {t('games.tapFirstLast')}
      </p>
      <div className="word-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 34px)` }}>
        {grid.map((row, r) =>
          row.map((ch, c) => {
            const idx = r * grid[0].length + c;
            const isSel = sel.includes(idx);
            const isFound = words.some(
              (w) =>
                found.has(w.word) &&
                w.cells.includes(idx),
            );
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className="word-cell"
                data-sel={isSel ? 'true' : 'false'}
                data-found={isFound ? 'true' : 'false'}
                onClick={() => cellClick(idx)}
              >
                {ch}
              </button>
            );
          }),
        )}
      </div>
      <div className="row wrap" style={{ gap: 6, marginTop: 14, justifyContent: 'center' }}>
        {words.map((w) => (
          <span key={w.word} className={found.has(w.word) ? 'chip chip-success' : 'chip'} style={{ opacity: found.has(w.word) ? 1 : 0.6 }}>
            {found.has(w.word) ? '✅' : '🔎'} {w.word}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildWordSearch(topics: Topic[], year: number, subject?: SubjectId) {
  const isEnglish = subject === 'english';
  const pool = isEnglish
    ? ['APPLE', 'BOOK', 'CAT', 'DOG', 'BALL', 'TREE', 'FISH', 'BIRD', 'HOME', 'STAR', 'MOON', 'SUN', 'RED', 'BLUE']
    : ['BUKU', 'BOLA', 'KAKI', 'MATA', 'NASI', 'RAJA', 'LAUT', 'GAJAH', 'RUMAH', 'TANGAN', 'BULAN', 'LAMPU', 'PADI', 'BATU'];
  const count = year <= 3 ? 4 : 6;
  const chosen = shuffle(pool.slice()).filter((w) => w.length <= 7).slice(0, count);
  const size = 8;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const words: { word: string; cells: number[] }[] = [];

  for (const word of chosen) {
    let placed = false;
    for (let attempt = 0; attempt < 60 && !placed; attempt += 1) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (horizontal ? c + word.length > size : r + word.length > size) continue;
      let conflict = false;
      for (let i = 0; i < word.length; i += 1) {
        const rr = horizontal ? r : r + i;
        const cc = horizontal ? c + i : c;
        if (grid[rr][cc] && grid[rr][cc] !== word[i]) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;
      const cells: number[] = [];
      for (let i = 0; i < word.length; i += 1) {
        const rr = horizontal ? r : r + i;
        const cc = horizontal ? c + i : c;
        grid[rr][cc] = word[i];
        cells.push(rr * size + cc);
      }
      words.push({ word, cells });
      placed = true;
    }
  }

  const letters = isEnglish ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) {
        // Huruf rawak daripada perkataan yang dipilih untuk mengekalkan fokus.
        const src = words.length > 0 ? words[(r + c) % words.length].word : '';
        grid[r][c] = src ? src[(r * 3 + c) % src.length] : letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  void topics;
  return { grid, words };
}

/* ================================================================== */
/* Permainan 4: Susun Cepat                                            */
/* ================================================================== */

function OrderGame({
  year,
  subject,
  onEnd,
}: {
  year: number;
  subject?: SubjectId;
  onEnd: (score: number, label: string) => void;
}) {
  const t = useT();
  const topics = useGameTopics(year, subject);
  const [questions] = useState(() =>
    pickQuestions(topics, 20, Math.floor(Math.random() * 1e9)).filter((q) => q.kind === 'order' && q.items),
  );
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);

  const current = questions[qi];
  const answer = (current?.answer as string[]) ?? [];

  useEffect(() => {
    if (questions.length === 0) return;
    const id = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [questions.length]);

  useEffect(() => {
    if (timeLeft === 0) onEnd(score, score >= 15 ? t('games.endFantastic') : score >= 8 ? t('games.endGood') : t('games.endTryAgain'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (questions.length === 0) {
    return <EmptyState emoji="⚡" title={t('common.loading')} desc={t('games.noOrderQuestions')} />;
  }

  const check = () => {
    const ok = picked.length === answer.length && picked.every((x, i) => x === answer[i]);
    sound.play(ok ? 'correct' : 'wrong');
    if (ok) setScore((s) => s + 3);
    setPicked([]);
    setQi((q) => (q + 1) % questions.length);
  };

  const pool = (current.items ?? []).filter((x) => !picked.includes(x));

  return (
    <div>
      <div className="game-hud">
        <Chip tone="brand">⭐ {score}</Chip>
        <Chip tone={timeLeft <= 15 ? 'danger' : 'warn'}>⏱️ {timeLeft}s</Chip>
      </div>
      <div className="q-prompt" style={{ margin: '0 0 10px', padding: '14px 12px' }}>
        <p style={{ fontSize: '1rem', fontWeight: 900 }}>{current.prompt}</p>
      </div>
      <div className="order-target" style={{ minHeight: 80 }}>
        {picked.length === 0 ? (
          <span className="tiny muted">{t('games.tapToArrange')}</span>
        ) : (
          picked.map((p, i) => (
            <button key={p} type="button" className="order-chip" onClick={() => { sound.play('tap'); setPicked((x) => x.filter((y) => y !== p)); }}>
              {i + 1}. {p}
            </button>
          ))
        )}
      </div>
      <div className="order-pool" style={{ marginTop: 10 }}>
        {pool.map((p) => (
          <button key={p} type="button" className="order-chip" onClick={() => { sound.play('pop'); setPicked((x) => [...x, p]); }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <Btn block variant="success" disabled={picked.length !== answer.length} onClick={check}>
          ✓ {t('quiz.check')}
        </Btn>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Permainan 5: Teka Cepat                                             */
/* ================================================================== */

function SpeedQuizGame({
  year,
  subject,
  onEnd,
}: {
  year: number;
  subject?: SubjectId;
  onEnd: (score: number, label: string) => void;
}) {
  const t = useT();
  const topics = useGameTopics(year, subject);
  const [questions] = useState(() =>
    pickQuestions(topics, 30, Math.floor(Math.random() * 1e9)).filter((q) => q.options && q.options.length >= 2),
  );
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [flash, setFlash] = useState<number | null>(null);

  const current = questions[qi];

  useEffect(() => {
    if (questions.length === 0) return;
    const id = window.setInterval(() => setTimeLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [questions.length]);

  useEffect(() => {
    if (timeLeft === 0) onEnd(score, `${t('games.scoreLabel', { s: score })} — ${bestStreak >= 5 ? t('games.endCombo') : t('games.endGood')}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Had masa setiap soalan untuk rasa "teka cepat".
  useEffect(() => {
    if (!current || timeLeft === 0) return;
    const id = window.setTimeout(() => {
      setStreak(0);
      setQi((q) => (q + 1) % questions.length);
    }, 6000);
    return () => window.clearTimeout(id);
  }, [current, qi, timeLeft, questions.length]);

  if (questions.length === 0) return <EmptyState emoji="⏱️" title={t('common.loading')} />;

  const answer = (opt: string, i: number) => {
    const ok = opt === String(current.answer);
    sound.play(ok ? 'correct' : 'wrong');
    setFlash(i);
    window.setTimeout(() => setFlash(null), 320);
    if (ok) {
      const ns = streak + 1;
      setStreak(ns);
      setBestStreak((b) => Math.max(b, ns));
      setScore((s) => s + 1 + Math.min(Math.floor(ns / 3), 2));
    } else {
      setStreak(0);
    }
    setQi((q) => (q + 1) % questions.length);
  };

  return (
    <div>
      <div className="game-hud">
        <Chip tone="brand">⭐ {score}</Chip>
        <Chip tone={streak >= 3 ? 'success' : 'default'}>🔥 {t('games.combo')} {streak}</Chip>
        <Chip tone={timeLeft <= 15 ? 'danger' : 'warn'}>⏱️ {timeLeft}s</Chip>
      </div>
      <div className="q-prompt" style={{ margin: '0 0 10px', padding: '16px 12px' }}>
        <p style={{ fontSize: '1.12rem', fontWeight: 900 }}>{current.prompt}</p>
      </div>
      <div className="options" data-cols="1">
        {(current.options ?? []).slice(0, 4).map((o, i) => (
          <button
            key={`${o}-${i}`}
            type="button"
            className="option"
            onClick={() => answer(o, i)}
            style={flash === i ? { boxShadow: 'inset 0 0 0 3px var(--danger)' } : undefined}
          >
            <span className="grow">{o}</span>
          </button>
        ))}
      </div>
      <p className="tiny muted center" style={{ marginTop: 12 }}>
        {t('games.answerIn6')}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

void subjectById;
