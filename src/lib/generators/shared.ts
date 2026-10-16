/** Pembantu binaan soalan yang dikongsi semua penjana. */

import type { Question, QuestionKind } from '../../data/types';
import type { Rng } from '../rng';

export type Generator = (
  year: number,
  rng: Rng,
  count: number,
) => Question[];

let seq = 0;

export function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq.toString(36)}`;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Buang pendua dan nilai yang sama dengan jawapan. */
export function cleanDistractors(
  answer: string,
  pool: readonly string[],
  n: number,
  rng: Rng,
): string[] {
  const seen = new Set([norm(answer)]);
  const out: string[] = [];
  for (const cand of rng.shuffle(pool)) {
    const k = norm(cand);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(cand);
    if (out.length >= n) break;
  }
  return out;
}

interface McqArgs {
  prefix: string;
  prompt: string;
  answer: string;
  distractors: readonly string[];
  explanation: string;
  promptSub?: string;
  speak?: string;
  hint?: string;
  emoji?: string;
  cols?: 1 | 2;
  kind?: QuestionKind;
  n?: number;
}

/** Bina soalan pilihan jawapan dengan pilihan yang dirawak. */
export function mcq(rng: Rng, a: McqArgs): Question {
  const n = a.n ?? 4;
  const extra = cleanDistractors(a.answer, a.distractors, Math.max(n - 1, 1), rng);
  const options = rng.shuffle([a.answer, ...extra]);
  return {
    id: nextId(a.prefix),
    kind: a.kind ?? 'mcq',
    prompt: a.prompt,
    promptSub: a.promptSub,
    speak: a.speak ?? a.prompt,
    options,
    answer: a.answer,
    explanation: a.explanation,
    hint: a.hint,
    emoji: a.emoji,
    cols: a.cols ?? (options.every((o) => o.length <= 5) ? 2 : 1),
  };
}

/** Bina soalan jawapan nombor (papan kekunci). */
export function numeric(
  a: {
    prefix: string;
    prompt: string;
    answer: number;
    explanation: string;
    promptSub?: string;
    hint?: string;
    emoji?: string;
    speak?: string;
  },
): Question {
  return {
    id: nextId(a.prefix),
    kind: 'numeric',
    prompt: a.prompt,
    promptSub: a.promptSub,
    speak: a.speak ?? a.prompt,
    answer: a.answer,
    explanation: a.explanation,
    hint: a.hint,
    emoji: a.emoji,
  };
}

/** Bina soalan betul/salah. */
export function trueFalse(a: {
  prefix: string;
  prompt: string;
  isTrue: boolean;
  explanation: string;
  promptSub?: string;
  emoji?: string;
  speak?: string;
}): Question {
  return {
    id: nextId(a.prefix),
    kind: 'truefalse',
    prompt: a.prompt,
    promptSub: a.promptSub,
    speak: a.speak ?? a.prompt,
    options: ['Betul', 'Salah'],
    answer: a.isTrue ? 'Betul' : 'Salah',
    explanation: a.explanation,
    emoji: a.emoji,
    cols: 2,
  };
}

/** Bina soalan padan pasangan. */
export function match(a: {
  prefix: string;
  prompt: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  promptSub?: string;
  emoji?: string;
}): Question {
  return {
    id: nextId(a.prefix),
    kind: 'match',
    prompt: a.prompt,
    promptSub: a.promptSub,
    speak: a.prompt,
    pairs: a.pairs,
    answer: a.pairs.map((p) => p.right),
    explanation: a.explanation,
    emoji: a.emoji,
  };
}

/** Bina soalan susun urutan. */
export function order(a: {
  prefix: string;
  prompt: string;
  items: string[];
  correctOrder: string[];
  explanation: string;
  promptSub?: string;
  emoji?: string;
}): Question {
  return {
    id: nextId(a.prefix),
    kind: 'order',
    prompt: a.prompt,
    promptSub: a.promptSub,
    speak: a.prompt,
    items: a.items,
    answer: a.correctOrder,
    explanation: a.explanation,
    emoji: a.emoji,
  };
}

/** Bina soalan isi tempat kosong. */
export function fillBlank(
  rng: Rng,
  a: {
    prefix: string;
    prompt: string;
    answer: string;
    options: readonly string[];
    explanation: string;
    promptSub?: string;
    hint?: string;
    emoji?: string;
    cols?: 1 | 2;
    speak?: string;
  },
): Question {
  return mcq(rng, {
    prefix: a.prefix,
    prompt: a.prompt,
    answer: a.answer,
    distractors: a.options,
    explanation: a.explanation,
    promptSub: a.promptSub,
    hint: a.hint,
    emoji: a.emoji,
    cols: a.cols,
    speak: a.speak,
    kind: 'fillblank',
    n: Math.min(4, a.options.length + 1),
  });
}

/** Bentuk angka dengan pemisah ribuan. */
export function fmt(n: number): string {
  return n.toLocaleString('en-MY');
}

/** Tukar nombor perpuluhan kepada teks tanpa sifar berlebihan. */
export function dec(n: number, places = 2): string {
  const s = n.toFixed(places);
  return s.replace(/\.?0+$/, '') || '0';
}

/** Bina bilangan soalan melalui fungsi pembina. */
export function fill(count: number, build: (i: number) => Question): Question[] {
  const out: Question[] = [];
  for (let i = 0; i < count; i += 1) out.push(build(i));
  return out;
}
