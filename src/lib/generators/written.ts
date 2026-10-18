/**
 * Bank soalan Bahagian B (jawapan taip) untuk kertas peperiksaan percubaan.
 *
 * Dua sumber soalan:
 *   1. Matematik — soalan berangka daripada penjana Matematik, ditukar kepada
 *      bentuk "taip jawapan" dan dilengkapi LANGKAH KERJA supaya murid belajar
 *      cara mengira, bukan sekadar meneka jawapan.
 *   2. Subjek teks (BM, English, Sains, Sejarah) — soalan yang jawapannya
 *      pendek dan tepat ditukar daripada pilihan jawapan kepada taip jawapan.
 *
 * Semua soalan diambil daripada penjana subjek itu sendiri, jadi kertas
 * Bahasa Melayu kekal 100% Bahasa Melayu dan kertas English kekal Inggeris.
 */

import type { Question, SubjectId, Topic } from '../../data/types';
import type { Rng } from '../rng';
import { generateQuestions } from '../../data/catalog';
import { shortText } from './shared';

export type WrittenGen = (topic: Topic, rng: Rng, tier: TypedTier) => Question[];

/** Panjang maksimum jawapan yang sesuai ditaip murid sekolah rendah. */
const MAX_ANSWER_CHARS = 28;
/** Bilangan maksimum perkataan dalam jawapan taip. */
const MAX_ANSWER_WORDS = 5;

/** Label betul/salah yang tidak sesuai dijadikan soalan taip. */
const BOOLEAN_LABELS = new Set([
  'betul',
  'salah',
  'true',
  'false',
  'benar',
  'palsu',
]);

/* ------------------------------------------------------------------ */
/* Pembersihan jawapan taip                                            */
/* ------------------------------------------------------------------ */

/**
 * Normalkan jawapan murid sebelum dibandingkan.
 *
 * Murid sekolah rendah sering menulis "6,000" atau "6 000" atau " 6000. ".
 * Kita abaikan huruf besar, ruang berlebihan, koma ribuan dan tanda baca
 * hujung supaya mereka tidak dihukum kerana format semata-mata.
 */
export function normaliseTyped(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[,\u00a0]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.!?;:]+$/g, '')
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .trim();
}

/**
 * Kelonggaran penapisan jawapan taip.
 *
 * Bahagian B mesti sentiasa penuh. Apabila sesuatu tahun atau subjek tidak
 * mempunyai cukup jawapan pendek, kita longgarkan had secara berperingkat
 * dan akhirnya terima apa-apa jawapan yang masih munasabah untuk ditaip.
 */
export type TypedTier = 'strict' | 'relaxed' | 'any';

/** Had jawapan mengikut tahap kelonggaran. */
const TIERS: Record<TypedTier, { chars: number; words: number }> = {
  strict: { chars: MAX_ANSWER_CHARS, words: MAX_ANSWER_WORDS },
  relaxed: { chars: 48, words: 8 },
  any: { chars: 120, words: 20 },
};

/** Adakah jawapan sesuai ditaip pada tahap kelonggaran tertentu? */
export function isTypedFriendly(answer: string, tier: TypedTier = 'strict'): boolean {
  const a = answer.trim();
  if (a.length === 0) return false;
  if (/[\n\r]/.test(a)) return false;
  if (BOOLEAN_LABELS.has(a.toLowerCase())) return false;
  const lim = TIERS[tier];
  if (a.length > lim.chars) return false;
  if (a.split(/\s+/).length > lim.words) return false;
  return true;
}

/**
 * Adakah jawapan murid betul?
 * Menerima jawapan rasmi dan mana-mana ejaan alternatif dalam `accept`.
 */
export function typedCorrect(q: Question, given: string): boolean {
  const g = normaliseTyped(given);
  if (!g) return false;
  const wants = [String(q.answer), ...(q.accept ?? [])];
  return wants.some((w) => normaliseTyped(w) === g);
}

/* ------------------------------------------------------------------ */
/* Langkah kerja pengiraan (Matematik)                                 */
/* ------------------------------------------------------------------ */

/** Bentuk ayat matematik yang mudah dikenali: "45 + 50 = ?". */
const ARITH_RE = /^\s*([\d][\d,\s]*?)\s*([+\-−×x*÷/])\s*([\d][\d,\s]*?)\s*=/;

function toNum(s: string): number {
  return Number(s.replace(/[,\s]/g, ''));
}

/**
 * Bina langkah kerja bagi ayat matematik mudah, digit demi digit.
 *
 * Tujuannya meniru cara guru menunjukkan pengiraan di papan hitam: mulakan
 * dari tempat sa, bawa nilai ke tempat seterusnya, dan akhiri dengan jawapan.
 * Jika soalan bukan ayat matematik mudah, pulangkan null supaya pemanggil
 * boleh guna langkah lalai.
 */
export function arithSteps(prompt: string, answer: number): string[] | null {
  const m = ARITH_RE.exec(prompt);
  if (!m) return null;
  const a = toNum(m[1]);
  const b = toNum(m[3]);
  const op = m[2];
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  const lines: string[] = [];
  lines.push(`Ayat matematik: ${a} ${op} ${b}`);

  if (op === '+') {
    lines.push(`Susun nombor menegak: sa bawah sa, puluh bawah puluh.`);
    const sa = (a % 10) + (b % 10);
    const puluh = Math.floor(a / 10) + Math.floor(b / 10);
    lines.push(`Tambah tempat sa: ${a % 10} + ${b % 10} = ${sa}`);
    if (sa >= 10) {
      lines.push(`Sa jadi ${sa % 10}, bawa 1 ke tempat puluh.`);
      lines.push(`Tambah tempat puluh: ${puluh} + 1 (bawa) = ${puluh + 1}`);
    } else {
      lines.push(`Tambah tempat puluh: ${puluh}`);
    }
    lines.push(`Jawapan: ${answer}`);
  } else if (op === '−' || op === '-') {
    lines.push(`Susun nombor menegak: sa bawah sa, puluh bawah puluh.`);
    const saA = a % 10;
    const saB = b % 10;
    if (saA < saB) {
      lines.push(`Sa tidak cukup (${saA} < ${saB}), pinjam 1 puluh jadi ${saA + 10}.`);
      lines.push(`${saA + 10} − ${saB} = ${saA + 10 - saB}`);
    } else {
      lines.push(`Tolak tempat sa: ${saA} − ${saB} = ${saA - saB}`);
    }
    lines.push(`Tolak tempat puluh: ${Math.floor(a / 10)} − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - Math.floor(b / 10)}`);
    lines.push(`Jawapan: ${answer}`);
  } else if (op === '×' || op === 'x' || op === '*') {
    lines.push(`Maksud darab: ${a} kumpulan, setiap kumpulan ada ${b}.`);
    if (b <= 12 && b > 1) {
      let acc = a;
      for (let i = 2; i <= Math.min(b, 4); i += 1) {
        acc += a;
        lines.push(`Tambah ${a} lagi: ${acc}`);
      }
      if (b > 4) lines.push(`Ulang sehingga ${b} kali, kemudian semak dengan sifir ${b}.`);
    } else {
      lines.push(`Guna sifir atau cara lazim: ${a} × ${b}.`);
    }
    lines.push(`Jawapan: ${answer}`);
  } else {
    lines.push(`Maksud bahagi: ${a} dibahagikan kepada ${b} bahagian sama besar.`);
    if (b !== 0 && a % b === 0) {
      lines.push(`Cari nombor yang bila didarab ${b} menjadi ${a}.`);
      lines.push(`Sifir: ${b} × ${answer} = ${a}, jadi jawapannya ${answer}.`);
    } else {
      lines.push(`Gunakan cara lazim: ${a} ÷ ${b}.`);
    }
    lines.push(`Jawapan: ${answer}`);
  }
  return lines;
}

/** Langkah lalai daripada penerangan apabila soalan bukan ayat matematik. */
function stepsFromExplanation(explanation: string): string[] {
  const parts = explanation
    .split(/(?<=[.!?])\s+|Kemudian\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, 4);
}

/** Langkah kerja bagi satu soalan Matematik. */
export function mathSteps(prompt: string, answer: number, explanation: string): string[] {
  const arith = arithSteps(prompt, answer);
  if (arith) return arith;
  const steps = stepsFromExplanation(explanation);
  return steps.length > 0 ? steps : [`Baca soalan, kenal pasti maklumat, kemudian kira.`];
}

/* ------------------------------------------------------------------ */
/* Unit jawapan                                                        */
/* ------------------------------------------------------------------ */

/** Kenal pasti unit daripada teks bantuan, cth. "Tulis jawapan dalam RM". */
export function unitFromText(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const m = /dalam\s+([A-Za-z°]+)/i.exec(text);
  return m ? m[1] : undefined;
}

/* ------------------------------------------------------------------ */
/* Penjana bertulis                                                    */
/* ------------------------------------------------------------------ */

/** Bilangan soalan mentah yang dijana sebelum penapisan. */
const RAW_COUNT = 40;

/** Tunjuk ruang kerja coretan pada soalan Matematik berangka. */
function needsWorkpad(q: Question): boolean {
  if (q.kind !== 'numeric') return false;
  const n = Number(String(q.answer).replace(/[,\s]/g, ''));
  return Number.isFinite(n) && Math.abs(n) >= 10;
}

/** Soalan bertulis bagi subjek Matematik: berangka + langkah kerja. */
function mathWritten(topic: Topic, rng: Rng): Question[] {
  const raw = generateQuestions(topic.id, RAW_COUNT, rng.int(1, 1e9));
  const out: Question[] = [];
  for (const q of raw) {
    // Soalan berangka ialah bahan terbaik untuk jawapan taip Matematik.
    const isNumber = q.kind === 'numeric';
    const numericText =
      (q.kind === 'mcq' || q.kind === 'fillblank') &&
      typeof q.answer === 'string' &&
      /^[\d][\d,.\s]*$|^\d+\/\d+$/.test(q.answer);
    if (!isNumber && !numericText) continue;

    const ansText = String(q.answer);
    const ansNum = Number(ansText.replace(/[,\s]/g, ''));
    const unit = unitFromText(q.promptSub);
    out.push(
      shortText({
        prefix: 'w-mt',
        prompt: q.prompt,
        promptSub: q.promptSub,
        answer: ansText,
        // Terima ejaan dengan dan tanpa koma ribuan.
        accept: Number.isFinite(ansNum)
          ? [String(ansNum), ansNum.toLocaleString('en-MY')]
          : [ansText],
        explanation: q.explanation,
        emoji: q.emoji,
        speak: q.speak,
        unit,
        workpad: needsWorkpad(q),
        // Petunjuk dikekalkan supaya soalan taip pun ada bantuan berfikir.
        hint: q.hint,
        steps: Number.isFinite(ansNum)
          ? mathSteps(q.prompt, ansNum, q.explanation)
          : stepsFromExplanation(q.explanation),
      }),
    );
  }
  return out;
}

/**
 * Soalan bertulis bagi subjek teks: ambil soalan yang jawapannya pendek
 * dan tukar daripada pilihan jawapan kepada taip jawapan.
 */
function textWritten(topic: Topic, rng: Rng, tier: TypedTier = 'strict'): Question[] {
  const raw = generateQuestions(topic.id, RAW_COUNT, rng.int(1, 1e9));
  const out: Question[] = [];
  for (const q of raw) {
    if (q.kind !== 'mcq' && q.kind !== 'fillblank') continue;
    if (typeof q.answer !== 'string') continue;
    // Semakin longgar tahap, semakin banyak jawapan diterima. Ini penting
    // supaya Bahagian B sentiasa dapat dipenuhi untuk semua tahun/subjek.
    if (!isTypedFriendly(q.answer, tier)) continue;
    out.push(
      shortText({
        prefix: 'w-tx',
        prompt: q.prompt,
        promptSub: q.promptSub,
        answer: q.answer,
        accept: q.accept,
        explanation: q.explanation,
        emoji: q.emoji,
        speak: q.speak,
        hint: q.hint,
      }),
    );
  }
  return out;
}

/**
 * Bank penjana bertulis mengikut subjek.
 *
 * Penjana menerima `tier` supaya pemanggil boleh melonggarkan syarat
 * jawapan apabila Bahagian B perlu ditambah supaya kertas penuh.
 */
export const WRITTEN: Record<SubjectId, WrittenGen> = {
  matematik: (topic, rng) => mathWritten(topic, rng),
  'bahasa-melayu': (topic, rng, tier) => textWritten(topic, rng, tier),
  english: (topic, rng, tier) => textWritten(topic, rng, tier),
  sains: (topic, rng, tier) => textWritten(topic, rng, tier),
  sejarah: (topic, rng, tier) => textWritten(topic, rng, tier),
  'pendidikan-islam': (topic, rng, tier) => textWritten(topic, rng, tier),
};
