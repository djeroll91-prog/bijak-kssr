/** Maklumat mata pelajaran dan mini permainan. */

import type { GameMeta, SubjectId, SubjectMeta } from './types';

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'matematik',
    name: 'Matematik',
    short: 'MT',
    emoji: '🔢',
    color: 'var(--sub-matematik)',
    fromYear: 1,
    blurb: 'Nombor, operasi, wang, masa, ukuran, ruang dan data.',
  },
  {
    id: 'bahasa-melayu',
    name: 'Bahasa Melayu',
    short: 'BM',
    emoji: '📚',
    color: 'var(--sub-bahasa-melayu)',
    fromYear: 1,
    blurb: 'Mendengar, bertutur, membaca, menulis, tatabahasa dan seni bahasa.',
  },
  {
    id: 'english',
    name: 'English',
    short: 'EN',
    emoji: '🔤',
    color: 'var(--sub-english)',
    fromYear: 1,
    blurb: 'Listening, speaking, reading, writing and language arts.',
  },
  {
    id: 'sains',
    name: 'Sains',
    short: 'SN',
    emoji: '🔬',
    color: 'var(--sub-sains)',
    fromYear: 1,
    blurb: 'Inkuiri, sains hayat, fizikal, bahan, bumi dan teknologi.',
  },
  {
    id: 'sejarah',
    name: 'Sejarah',
    short: 'SJ',
    emoji: '🏛️',
    color: 'var(--sub-sejarah)',
    fromYear: 4,
    blurb: 'Sejarah awal negara, kedaulatan negara dan kemakmuran negara.',
  },
];

export function subjectById(id: SubjectId): SubjectMeta {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
}

export function subjectColor(id: SubjectId): string {
  return subjectById(id).color;
}

export const GAMES: GameMeta[] = [
  {
    id: 'gelembung-nombor',
    name: 'Gelembung Nombor',
    emoji: '🫧',
    blurb: 'Letupkan gelembung jawapan yang betul sebelum ia hilang!',
    subjects: ['matematik'],
    minYear: 1,
  },
  {
    id: 'padan-ingatan',
    name: 'Padan Ingatan',
    emoji: '🧠',
    blurb: 'Cari pasangan kad yang sepadan. Latih daya ingatan!',
    minYear: 1,
  },
  {
    id: 'cari-perkataan',
    name: 'Cari Perkataan',
    emoji: '🔍',
    blurb: 'Cari perkataan tersembunyi dalam grid huruf.',
    subjects: ['bahasa-melayu', 'english'],
    minYear: 1,
  },
  {
    id: 'susun-cepat',
    name: 'Susun Cepat',
    emoji: '⚡',
    blurb: 'Susun item mengikut urutan yang betul dengan cepat.',
    minYear: 1,
  },
  {
    id: 'teka-cepat',
    name: 'Teka Cepat',
    emoji: '⏱️',
    blurb: 'Jawab seberapa banyak soalan dalam masa yang terhad!',
    minYear: 2,
  },
];

export function gamesForSubject(subject: SubjectId, year: number): GameMeta[] {
  return GAMES.filter(
    (g) => year >= g.minYear && (!g.subjects || g.subjects.includes(subject)),
  );
}

export const YEAR_LABELS: Record<number, string> = {
  1: 'Tahun 1',
  2: 'Tahun 2',
  3: 'Tahun 3',
  4: 'Tahun 4',
  5: 'Tahun 5',
  6: 'Tahun 6',
};

export const YEAR_THEME: Record<number, string> = {
  1: 'Asas literasi dan numerasi',
  2: 'Pengukuhan asas',
  3: 'Aplikasi asas',
  4: 'Pengukuhan literasi',
  5: 'Aplikasi kemahiran',
  6: 'Kemahiran aras tinggi',
};
