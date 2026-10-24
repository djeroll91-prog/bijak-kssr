/** Pemapar soalan mengikut jenis (mcq, numeric, match, order, dsb.). */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '../data/types';
import { sound, voice } from '../lib/audio';
import { typedCorrect } from '../lib/generators/written';
import { Btn } from './ui';

export interface AnswerState {
  /** Jawapan yang diberi sebagai teks. */
  given: string;
  ok: boolean;
}

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionView({
  q,
  index,
  total,
  onAnswer,
  onNext,
  onExit,
  onHint,
  result,
  voiceOn,
  voiceLang,
  t,
}: {
  q: Question;
  index: number;
  total: number;
  onAnswer: (a: AnswerState) => void;
  onNext: () => void;
  onExit: () => void;
  onHint: () => void;
  result: AnswerState | null;
  voiceOn: boolean;
  voiceLang: 'ms' | 'en';
  t: (k: string) => string;
}) {
  const answered = result !== null;

  // Soalan hafazan meletakkan teks Arab pada baris kedua prompt. Baris itu
  // dipaparkan sebagai perenggan RTL berasingan supaya ayat al-Quran tidak
  // dicampur dengan teks Melayu dalam satu blok.
  const promptLines = q.prompt.split('\n');

  return (
    <div className="screen">
      <div className="quiz-head">
        <button
          type="button"
          className="icon-btn"
          aria-label={t('quiz.exit')}
          onClick={() => {
            sound.play('tap');
            onExit();
          }}
        >
          ✕
        </button>
        <span className="q-progress" role="progressbar" aria-valuenow={index} aria-valuemax={total}>
          <i style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }} />
        </span>
        <span className="chip">
          {index + 1}/{total}
        </span>
      </div>

      <div className="screen-scroll" data-flush="true">
        <div className="q-body" key={q.id}>
          <div className="q-prompt">
            {q.emoji ? (
              <div className="prompt-emoji animate-float" aria-hidden="true">
                {q.emoji}
              </div>
            ) : null}
            <p className="prompt-text">{promptLines[0]}</p>
            {promptLines.slice(1).map((line, i) => (
              <p key={i} className="prompt-ar" dir="rtl" lang="ar">
                {line}
              </p>
            ))}
            {q.promptSub ? <p className="prompt-sub">{q.promptSub}</p> : null}
            {voiceOn ? (
              <button
                type="button"
                className="chip chip-brand"
                style={{ marginTop: 10 }}
                onClick={() => voice.speak(q.speak ?? q.prompt, voiceLang)}
              >
                🔊 {t('notes.readAloud')}
              </button>
            ) : null}
          </div>

          <Body q={q} answered={answered} result={result} onAnswer={onAnswer} t={t} />

          {answered ? (
            <div className="feedback" data-ok={result.ok ? 'true' : 'false'} role="status">
              <span className="fb-emoji" aria-hidden="true">
                {result.ok ? '🎉' : '💪'}
              </span>
              <div className="grow">
                <b>{result.ok ? t('quiz.correct') : t('quiz.wrong')}</b>
                <p>{q.explanation}</p>
              </div>
            </div>
          ) : null}

          {!answered && q.hint ? (
            <button type="button" className="chip chip-warn" style={{ marginTop: 12 }} onClick={onHint}>
              💡 {t('quiz.showHint')}
            </button>
          ) : null}

          {answered ? (
            <div style={{ marginTop: 18 }}>
              <Btn block onClick={onNext} variant="success">
                {index + 1 >= total ? `🏁 ${t('quiz.finish')}` : `${t('quiz.next')} →`}
              </Btn>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Body({
  q,
  answered,
  result,
  onAnswer,
  t,
}: {
  q: Question;
  answered: boolean;
  result: AnswerState | null;
  onAnswer: (a: AnswerState) => void;
  t: (k: string) => string;
}) {
  switch (q.kind) {
    case 'numeric':
      return <NumericAnswer q={q} answered={answered} onAnswer={onAnswer} t={t} />;
    case 'shorttext':
      return <TypedAnswer q={q} answered={answered} onAnswer={onAnswer} t={t} />;
    case 'match':
      if (q.pairs && q.pairs.length > 0) {
        return <MatchAnswer q={q} answered={answered} onAnswer={onAnswer} t={t} />;
      }
      return <McqAnswer q={q} answered={answered} result={result} onAnswer={onAnswer} />;
    case 'order':
      if (q.items && q.items.length > 0) {
        return <OrderAnswer q={q} answered={answered} onAnswer={onAnswer} t={t} />;
      }
      return <McqAnswer q={q} answered={answered} result={result} onAnswer={onAnswer} />;
    default:
      return <McqAnswer q={q} answered={answered} result={result} onAnswer={onAnswer} />;
  }
}

/* ------------------------------------------------------------------ */
/* Pilihan jawapan                                                     */
/* ------------------------------------------------------------------ */

function McqAnswer({
  q,
  answered,
  result,
  onAnswer,
}: {
  q: Question;
  answered: boolean;
  result: AnswerState | null;
  onAnswer: (a: AnswerState) => void;
}) {
  const opts = q.options ?? [];
  const correct = String(q.answer);
  // Kertas peperiksaan sentiasa melabel pilihan A, B, C, D seperti kertas
  // sebenar. Latihan biasa hanya melabel apabila pilihan pendek.
  const labelled = q.part === 'A' || q.part === 'B' || q.cols !== 2;
  return (
    <div className="options" data-cols={q.cols === 2 ? '2' : '1'} role="group">
      {opts.map((o, i) => {
        let state: 'correct' | 'wrong' | 'dim' | undefined;
        if (answered && result) {
          if (o === correct) state = 'correct';
          else if (o === result.given) state = 'wrong';
          else state = 'dim';
        }
        return (
          <button
            key={`${o}-${i}`}
            type="button"
            className="option"
            data-state={state}
            disabled={answered}
            onClick={() => {
              const ok = o === correct;
              sound.play(ok ? 'correct' : 'wrong');
              onAnswer({ given: o, ok });
            }}
          >
            {labelled ? (
              <span className="key" aria-hidden="true">
                {KEYS[i] ?? i + 1}
              </span>
            ) : null}
            <span className="grow">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jawapan nombor                                                      */
/* ------------------------------------------------------------------ */

function NumericAnswer({
  q,
  answered,
  onAnswer,
  t,
}: {
  q: Question;
  answered: boolean;
  onAnswer: (a: AnswerState) => void;
  t: (k: string) => string;
}) {
  const [val, setVal] = useState('');
  const [neg, setNeg] = useState(false);
  const [dot, setDot] = useState(false);

  useEffect(() => {
    setVal('');
    setNeg(false);
    setDot(false);
  }, [q.id]);

  const display = `${neg ? '−' : ''}${val || ''}`;
  const submit = () => {
    if (!val) return;
    const given = Number(`${neg ? '-' : ''}${val}`);
    const want = Number(q.answer);
    const ok = Math.abs(given - want) < 0.0001;
    sound.play(ok ? 'correct' : 'wrong');
    onAnswer({ given: display, ok });
  };

  const press = (d: string) => {
    sound.play('tick');
    setVal((v) => (v.length >= 10 ? v : v + d));
  };

  return (
    <div className="numeric-pad">
      <div className="numeric-display" data-empty={val ? 'false' : 'true'}>
        {val ? display : t('quiz.tapAnswer')}
      </div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" disabled={answered} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button
          type="button"
          disabled={answered}
          aria-label={t('quiz.decimalPoint')}
          onClick={() => {
            sound.play('tick');
            if (!dot) {
              setDot(true);
              setVal((v) => (v ? v + '.' : '0.'));
            }
          }}
        >
          .
        </button>
        <button type="button" disabled={answered} onClick={() => press('0')}>
          0
        </button>
        <button
          type="button"
          disabled={answered}
          aria-label={t('quiz.delete')}
          onClick={() => {
            sound.play('tap');
            setVal((v) => {
              const nv = v.slice(0, -1);
              if (!nv.includes('.')) setDot(false);
              return nv;
            });
          }}
        >
          ⌫
        </button>
        <button
          type="button"
          disabled={answered}
          aria-label={t('quiz.negative')}
          onClick={() => {
            sound.play('tick');
            setNeg((n) => !n);
          }}
        >
          ±
        </button>
        <button
          type="button"
          disabled={answered}
          style={{ gridColumn: 'span 3', background: 'var(--brand)', color: 'var(--on-fill)' }}
          onClick={submit}
        >
          {t('quiz.submit')} ✓
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jawapan taip (Bahagian B)                                           */
/* ------------------------------------------------------------------ */

/**
 * Kotak jawapan taip untuk soalan yang murid perlu menulis sendiri.
 *
 * Soalan Matematik turut memaparkan ruang kerja coretan dan langkah kerja
 * selepas dijawab, supaya murid belajar cara mengira, bukan hanya meneka.
 */
function TypedAnswer({
  q,
  answered,
  onAnswer,
  t,
}: {
  q: Question;
  answered: boolean;
  onAnswer: (a: AnswerState) => void;
  t: (k: string) => string;
}) {
  const [val, setVal] = useState('');

  useEffect(() => {
    setVal('');
  }, [q.id]);

  const submit = () => {
    const given = val.trim();
    if (!given) return;
    // Betul atau salah ditentukan enjin peperiksaan; di sini kita hantar sahaja
    // supaya markah dan jawapan rasmi sentiasa sepadan.
    const ok = typedCorrect(q, given);
    sound.play(ok ? 'correct' : 'wrong');
    onAnswer({ given, ok });
  };

  return (
    <div className="typed-answer">
      {q.workpad ? <Workpad disabled={answered} t={t} /> : null}
      <div className="row" style={{ gap: 8, alignItems: 'stretch' }}>
        <input
          className="text-input grow"
          type="text"
          inputMode={q.workpad ? 'text' : 'text'}
          value={val}
          disabled={answered}
          placeholder={t('quiz.typeHere')}
          aria-label={t('quiz.typeAnswer')}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !answered) submit();
          }}
        />
        {q.unit ? <span className="typed-unit">{q.unit}</span> : null}
      </div>
      {!answered ? (
        <Btn block variant="accent" onClick={submit}>
          {t('quiz.submit')} ✓
        </Btn>
      ) : null}
      {answered && q.steps && q.steps.length > 0 ? (
        <div className="steps-card">
          <p className="steps-title">🧮 {t('quiz.steps')}</p>
          <ol className="steps-list">
            {q.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ruang kerja pengiraan (draf)                                        */
/* ------------------------------------------------------------------ */

/**
 * Kanvas coretan ringkas untuk murid mengira di atas skrin.
 *
 * Ia sengaja TIDAK dinilai — tujuannya meniru kertas conteng supaya murid
 * boleh menyusun nombor menegak sebelum menaip jawapan akhir. Semua coretan
 * kekal pada peranti dan tidak dihantar ke mana-mana.
 */
function Workpad({ disabled, t }: { disabled: boolean; t: (k: string) => string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // Saiz kanvas diambil daripada saiz paparan sebenar supaya garisan tidak kabur.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2b3a67';
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    setHasInk(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled) return;
    const ctx = e.currentTarget.getContext('2d');
    const p = pos(e);
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    last.current = p;
  };

  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    sound.play('tap');
  };

  return (
    <div className="workpad">
      <div className="row-between" style={{ marginBottom: 6 }}>
        <span className="tiny muted">✏️ {t('quiz.workpad')}</span>
        <button type="button" className="chip" onClick={clear} disabled={!hasInk}>
          🧽 {t('quiz.clearWork')}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="workpad-canvas"
        aria-label={t('quiz.workpad')}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Padan pasangan                                                      */
/* ------------------------------------------------------------------ */

function MatchAnswer({
  q,
  answered,
  onAnswer,
  t,
}: {
  q: Question;
  answered: boolean;
  onAnswer: (a: AnswerState) => void;
  t: (k: string) => string;
}) {
  const pairs = q.pairs ?? [];
  const [selLeft, setSelLeft] = useState<string | null>(null);
  // Setiap kiri dipadankan dengan indeks kanan, bukan teks kanan, supaya label
  // kanan yang berulang (contohnya "bulatan") masih boleh dipadankan.
  const [done, setDone] = useState<Record<string, number>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  useEffect(() => {
    setSelLeft(null);
    setDone({});
  }, [q.id]);

  const rights = useMemo(
    () => shuffleStable(pairs.map((p, i) => ({ right: p.right, i })), q.id),
    [pairs, q.id],
  );

  const handleLeft = (left: string) => {
    sound.play('tap');
    setSelLeft(left === selLeft ? null : left);
  };

  const handleRight = (idx: number, right: string) => {
    if (selLeft === null) return;
    const pairIndex = pairs.findIndex((p) => p.left === selLeft);
    const pair = pairs[pairIndex];
    if (pair && pair.right === right) {
      sound.play('correct');
      const next = { ...done, [selLeft]: idx };
      setDone(next);
      setSelLeft(null);
      if (Object.keys(next).length === pairs.length) {
        onAnswer({
          given: pairs.map((p) => next[p.left]).map((i) => pairs[i]?.right ?? '').join(', '),
          ok: true,
        });
      }
    } else {
      sound.play('wrong');
      setWrongFlash(`${selLeft}|${idx}`);
      window.setTimeout(() => setWrongFlash(null), 420);
      setSelLeft(null);
    }
  };

  return (
    <div>
      <p className="tiny muted center" style={{ marginTop: 12 }}>
        {t('quiz.matchPairs')}
      </p>
      <div className="match-grid">
        {pairs.map((p) => {
          const isDone = done[p.left] !== undefined;
          return (
            <button
              key={`L-${p.left}`}
              type="button"
              className="match-cell"
              data-sel={selLeft === p.left ? 'true' : 'false'}
              data-done={isDone ? 'true' : 'false'}
              disabled={answered || isDone}
              onClick={() => handleLeft(p.left)}
            >
              {p.left}
            </button>
          );
        })}
        {rights.map(({ right, i }) => {
          const used = Object.values(done).includes(i);
          const flashing = wrongFlash?.endsWith(`|${i}`);
          return (
            <button
              key={`R-${i}-${right}`}
              type="button"
              className="match-cell"
              data-done={used ? 'true' : 'false'}
              style={flashing ? { boxShadow: 'inset 0 0 0 3px var(--danger)' } : undefined}
              disabled={answered || used}
              onClick={() => handleRight(i, right)}
            >
              {right}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function shuffleStable<T>(arr: T[], seed: string): T[] {
  const out = arr.slice();
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = out.length - 1; i > 0; i -= 1) {
    h ^= h << 13;
    h >>>= 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Susun urutan                                                        */
/* ------------------------------------------------------------------ */

function OrderAnswer({
  q,
  answered,
  onAnswer,
  t,
}: {
  q: Question;
  answered: boolean;
  onAnswer: (a: AnswerState) => void;
  t: (k: string) => string;
}) {
  const answer = q.answer as string[];
  const [pool, setPool] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    setPool(shuffleStable(q.items ?? [], q.id));
    setPicked([]);
  }, [q.id, q.items]);

  const add = (item: string) => {
    sound.play('pop');
    setPool((p) => p.filter((x) => x !== item));
    setPicked((p) => [...p, item]);
  };
  const remove = (item: string) => {
    sound.play('tap');
    setPicked((p) => p.filter((x) => x !== item));
    setPool((p) => [...p, item]);
  };
  const submit = () => {
    const ok = picked.length === answer.length && picked.every((x, i) => x === answer[i]);
    sound.play(ok ? 'correct' : 'wrong');
    onAnswer({ given: picked.join(' → '), ok });
  };

  return (
    <div className="stack" style={{ marginTop: 16 }}>
      <div>
        <p className="tiny muted" style={{ marginBottom: 6 }}>
          ✅ {t('quiz.arrange')}
        </p>
        <div className="order-target">
          {picked.length === 0 ? (
            <span className="tiny muted">…</span>
          ) : (
            picked.map((p, i) => (
              <button key={p} type="button" className="order-chip" disabled={answered} onClick={() => remove(p)}>
                {i + 1}. {p}
              </button>
            ))
          )}
        </div>
      </div>
      <div>
        <p className="tiny muted" style={{ marginBottom: 6 }}>
          🧩 Pilihan
        </p>
        <div className="order-pool">
          {pool.length === 0 ? (
            <span className="tiny muted">—</span>
          ) : (
            pool.map((p) => (
              <button key={p} type="button" className="order-chip" disabled={answered} onClick={() => add(p)}>
                {p}
              </button>
            ))
          )}
        </div>
      </div>
      {!answered ? (
        <Btn block variant="success" disabled={picked.length !== answer.length} onClick={submit}>
          {t('quiz.submit')} ✓
        </Btn>
      ) : null}
    </div>
  );
}
