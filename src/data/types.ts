/** Model data teras untuk Bijak KSSR. */

export type YearNum = 1 | 2 | 3 | 4 | 5 | 6;

export type SubjectId =
  | 'matematik'
  | 'bahasa-melayu'
  | 'english'
  | 'sains'
  | 'sejarah';

export type NoteKind = 'tip' | 'example' | 'formula' | 'fun';

export interface Note {
  kind: NoteKind;
  title: string;
  body?: string;
  bullets?: string[];
  emojiRow?: string;
}

/** Bentuk soalan yang disokong oleh enjin latihan. */
export type QuestionKind =
  | 'mcq'
  | 'numeric'
  | 'truefalse'
  | 'match'
  | 'order'
  | 'fillblank';

export interface MatchPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  promptSub?: string;
  /** Teks yang dibaca kuat oleh fungsi suara. */
  speak?: string;
  /** Pilihan jawapan bagi mcq / truefalse / fillblank. */
  options?: string[];
  /** Susunan pasangan bagi kind 'match'. */
  pairs?: MatchPair[];
  /** Senarai item yang perlu disusun bagi kind 'order'. */
  items?: string[];
  /** Jawapan. Jenis bergantung kepada kind. */
  answer: string | number | string[];
  explanation: string;
  hint?: string;
  emoji?: string;
  /** Bilangan lajur paparan pilihan. */
  cols?: 1 | 2;
}

export interface Topic {
  id: string;
  year: YearNum;
  subject: SubjectId;
  /** Kod standard kandungan DSKP, cth. "1.0". */
  code: string;
  title: string;
  emoji: string;
  summary: string;
  notes: Note[];
  /** Id penjana soalan dalam daftar generator. */
  generator: string;
  /** Mini permainan yang sesuai untuk topik ini. */
  games?: string[];
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  short: string;
  emoji: string;
  color: string;
  /** Tahun pertama mata pelajaran ditawarkan. */
  fromYear: YearNum;
  blurb: string;
}

export interface GameMeta {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  /** Subject yang sesuai; kosong bermaksud semua. */
  subjects?: SubjectId[];
  minYear: YearNum;
}

/** Rekod percubaan latihan murid. */
export interface Attempt {
  id: string;
  ts: number;
  year: YearNum;
  subject: SubjectId;
  topicId: string;
  topicTitle: string;
  correct: number;
  total: number;
  /** Masa dalam saat. */
  seconds: number;
  /** Bilangan percubaan ulang dalam sesi yang sama. */
  retries: number;
}

/** Skor satu topik dalam ujian diagnosis. */
export interface DiagnosticItem {
  topicId: string;
  subject: SubjectId;
  title: string;
  correct: number;
  total: number;
}

/** Ringkasan satu sesi ujian diagnosis. */
export interface DiagnosticResult {
  ts: number;
  year: YearNum;
  items: DiagnosticItem[];
  correct: number;
  total: number;
  seconds: number;
}

/** Jenis tugasan dalam pelan belajar. */
export type PlanTaskKind = 'learn' | 'practice' | 'remedial' | 'game';

/** Satu tugasan dalam pelan belajar mingguan. */
export interface PlanTask {
  id: string;
  /** Hari dalam pelan: 0 = hari pertama. */
  dayIndex: number;
  topicId: string;
  kind: PlanTaskKind;
  /** Anggaran masa dalam minit. */
  minutes: number;
  done: boolean;
}

/** Pelan belajar 7 hari yang dijana daripada kelemahan murid. */
export interface StudyPlan {
  createdAt: number;
  year: YearNum;
  /** Topik tumpuan (kelemahan + topik belum cuba). */
  focusTopicIds: string[];
  /** Topik yang dikenal pasti lemah semasa pelan dijana. */
  weakTopicIds: string[];
  tasks: PlanTask[];
  /** Saat belajar terkumpul pada tarikh terakhir aktif. */
  focusSeconds: number;
  lastFocusDate: string;
}

/**
 * Kad ulangan berjarak bagi satu topik.
 *
 * Ulangan berlaku pada peringkat topik, bukan soalan tepat: penjana soalan
 * menghasilkan soalan baharu bagi konsep yang sama, jadi murid mengingat
 * semula idea dan bukan menghafal jawapan.
 */
export interface ReviewCard {
  topicId: string;
  subject: SubjectId;
  year: YearNum;
  /** Tarikh (YYYY-MM-DD) kad patut diulang. */
  dueDate: string;
  /** Kotak Leitner 0..5; makin tinggi, makin jarak ulangan. */
  box: number;
  /** Bilangan kali dijawab dengan markah baik berturut-turut. */
  streak: number;
  /** Bilangan kali gagal (markah rendah). */
  lapses: number;
  /** Markah terkini (peratus). */
  lastPct: number;
  lastReviewed: string;
  addedAt: number;
}

/** Hasil satu topik dalam satu sesi latihan, untuk kemas kini kad ulangan. */
export interface ReviewOutcome {
  topicId: string;
  subject: SubjectId;
  year: YearNum;
  correct: number;
  total: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  year: YearNum;
  createdAt: number;
  attempts: Attempt[];
  /** Kad ulangan berjarak bagi topik yang pernah dilatih. */
  reviews?: ReviewCard[];
  /** id lencana yang telah dimenangi. */
  badges: string[];
  /** Kiraan hari berturut-turut (streak) yang dikemas kini. */
  streakDays: number;
  lastActiveDate: string;
  /** Jumlah bintang ganjaran terkumpul. */
  stars: number;
  /** Jumlah mata insentif terkumpul. */
  points: number;
  /** Topik yang pernah dibuka. */
  seenTopics: string[];
  /** Keputusan ujian diagnosis terakhir (jika ada). */
  diagnostic?: DiagnosticResult | null;
  /** Pelan belajar mingguan semasa (jika ada). */
  plan?: StudyPlan | null;
}

export interface Settings {
  sound: boolean;
  voice: boolean;
  motion: boolean;
  calm: boolean;
  contrast: boolean;
  /** Mod gelap: latar gelap dengan kotak bercahaya. */
  dark: boolean;
  fontScale: number;
}

export interface AppData {
  version: number;
  activeProfileId: string | null;
  profiles: Profile[];
  settings: Settings;
  /** Bahasa antara muka. */
  lang: 'ms' | 'en';
  /** Lencana yang telah diumumkan supaya tidak berulang. */
  celebratedBadges: string[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  how: string;
  /** Terjemahan Bahasa Inggeris (pilihan). */
  nameEn?: string;
  howEn?: string;
  /** Syarat lencana. */
  check: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  profile: Profile;
  attempts: number;
  perfectAttempts: number;
  distinctTopics: number;
  distinctSubjects: number;
  bestScorePct: number;
  totalCorrect: number;
  maxStreak: number;
  hasFullMarkThisYear: boolean;
}
