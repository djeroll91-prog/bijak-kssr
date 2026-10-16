/**
 * Lapisan dwibahasa untuk antara muka aplikasi.
 * Bahasa Melayu ialah bahasa lalai (silibus kebangsaan), dengan
 * sokongan Bahasa Inggeris untuk murid dan ibu bapa.
 */

export type Lang = 'ms' | 'en';

type Dict = Record<string, string>;

const MS: Dict = {
  'app.name': 'Bijak KSSR',
  'app.tagline': 'Belajar Seronok, Tahun 1 hingga 6',

  // Onboarding
  'onboard.title': 'Selamat Datang!',
  'onboard.sub': 'Aplikasi belajar ikut silibus Kementerian Pendidikan Malaysia.',
  'onboard.name': 'Nama Murid',
  'onboard.namePh': 'Contoh: Amin',
  'onboard.avatar': 'Pilih Avatar',
  'onboard.year': 'Pilih Darjah',
  'onboard.start': 'Mula Belajar',
  'onboard.welcomeBack': 'Selamat kembali',

  // Nav
  'nav.home': 'Utama',
  'nav.subjects': 'Subjek',
  'nav.games': 'Permainan',
  'nav.progress': 'Kemajuan',
  'nav.profile': 'Profil',

  // Home
  'home.hi': 'Hai',
  'home.letsLearn': 'Jom belajar hari ini!',
  'home.streak': 'Hari berturut',
  'home.stars': 'Bintang',
  'home.points': 'Mata',
  'home.subjects': 'Mata Pelajaran',
  'home.continue': 'Sambung Belajar',
  'home.suggested': 'Dicadangkan untuk kamu',
  'home.recentBadges': 'Lencana Terkini',
  'home.noBadges': 'Siapkan latihan untuk dapat lencana pertama!',
  'home.todayGoal': 'Sasaran Hari Ini',
  'home.quickQuiz': 'Latihan Pantas',

  // Subjects
  'subjects.title': 'Mata Pelajaran',
  'subjects.choose': 'Pilih subjek untuk tahun',
  'subjects.topics': 'topik',
  'subjects.locked': 'Mula Tahun 4',
  'subjects.notAvailable': 'Belum ada untuk tahun ini',

  // Topics
  'topics.title': 'Topik',
  'topics.notes': 'Nota',
  'topics.practice': 'Latihan',
  'topics.game': 'Mini Permainan',
  'topics.tryFirst': 'Baca notanya dahulu, kemudian cuba latihan!',
  'topics.questions': 'soalan',

  // Notes
  'notes.tip': 'Tip',
  'notes.example': 'Contoh',
  'notes.formula': 'Formula',
  'notes.fun': 'Seronok!',
  'notes.back': 'Kembali',
  'notes.startQuiz': 'Mula Latihan',
  'notes.readAloud': 'Baca Kuat',
  'notes.stopRead': 'Berhenti',

  // Quiz
  'quiz.question': 'Soalan',
  'quiz.of': 'daripada',
  'quiz.check': 'Semak Jawapan',
  'quiz.next': 'Seterusnya',
  'quiz.finish': 'Selesai',
  'quiz.correct': 'Betul!',
  'quiz.wrong': 'Cuba lagi!',
  'quiz.hint': 'Petunjuk',
  'quiz.showHint': 'Tunjuk Petunjuk',
  'quiz.tapAnswer': 'Pilih jawapan kamu',
  'quiz.matchPairs': 'Padankan pasangan',
  'quiz.arrange': 'Susun mengikut urutan',
  'quiz.clear': 'Padam',
  'quiz.submit': 'Hantar',
  'quiz.timeUp': 'Masa tamat!',
  'quiz.exit': 'Keluar',
  'quiz.exitConfirm': 'Keluar dari latihan ini?',
  'quiz.stay': 'Teruskan',
  'quiz.leave': 'Keluar',
  'quiz.decimalPoint': 'Titik perpuluhan',
  'quiz.delete': 'Padam',
  'quiz.negative': 'Nombor negatif',

  // Results
  'result.title': 'Keputusan',
  'result.perfect': 'Sempurna!',
  'result.great': 'Hebat!',
  'result.good': 'Bagus!',
  'result.tryAgain': 'Cuba Lagi!',
  'result.score': 'Markah',
  'result.correctOf': 'betul daripada',
  'result.perfectBonus': 'Bonus markah penuh!',
  'result.newBadge': 'Lencana Baharu!',
  'result.starsEarned': 'bintang diperoleh',
  'result.pointsEarned': 'mata diperoleh',
  'result.review': 'Semak Jawapan',
  'result.retry': 'Cuba Semula',
  'result.backHome': 'Balik ke Utama',
  'result.backTopics': 'Topik Lain',
  'result.timeSpent': 'Masa',
  'result.seconds': 'saat',
  'result.topicLabel': 'Topik',

  // Games
  'games.title': 'Mini Permainan',
  'games.sub': 'Belajar sambil bermain!',
  'games.play': 'Main',
  'games.score': 'Skor',
  'games.time': 'Masa',
  'games.lives': 'Nyawa',
  'games.level': 'Aras',
  'games.found': 'Dijumpai',
  'games.moves': 'Langkah',
  'games.pairs': 'Pasangan',
  'games.start': 'Mula',
  'games.playAgain': 'Main Lagi',
  'games.combo': 'Kombo',
  'games.best': 'Terbaik',
  'games.newBest': 'Rekod Baharu!',

  // Progress
  'progress.title': 'Kemajuan Saya',
  'progress.overview': 'Gambaran Keseluruhan',
  'progress.bySubject': 'Prestasi Ikut Subjek',
  'progress.byYear': 'Prestasi Ikut Darjah',
  'progress.trend': 'Trend Markah',
  'progress.mastery': 'Penguasaan Topik',
  'progress.attempts': 'Percubaan',
  'progress.accuracy': 'Ketepatan',
  'progress.avgScore': 'Markah Purata',
  'progress.totalTime': 'Jumlah Masa',
  'progress.minutes': 'minit',
  'progress.perfect': 'Markah Penuh',
  'progress.times': 'kali',
  'progress.noData': 'Belum ada data. Cuba buat latihan dahulu!',
  'progress.improving': 'Meningkat',
  'progress.steady': 'Konsisten',
  'progress.needsWork': 'Perlu Latihan',
  'progress.strongest': 'Subjek Terkuat',
  'progress.weakest': 'Perlu Perhatian',
  'progress.recent': 'Latihan Terkini',
  'progress.last7': 'Tujuh sesi terakhir',
  'progress.starsTotal': 'Jumlah Bintang',
  'progress.streakNow': 'Streak Semasa',
  'progress.days': 'hari',

  // Badges
  'badges.title': 'Lencana & Ganjaran',
  'badges.earned': 'Diperoleh',
  'badges.locked': 'Belum diperoleh',
  'badges.how': 'Cara dapat',
  'badges.earnedCount': 'lencana diperoleh',
  'badges.next': 'Seterusnya',
  'badges.allEarned': '🏆 Semua lencana telah diperoleh! Hebat!',
  'badges.ready': '✨ Sedia!',

  // Profile
  'profile.title': 'Profil',
  'profile.changeYear': 'Tukar Darjah',
  'profile.editName': 'Tukar Nama',
  'profile.avatar': 'Avatar',
  'profile.switch': 'Tukar Murid',
  'profile.addChild': 'Tambah Murid',
  'profile.settings': 'Tetapan',
  'profile.sound': 'Kesan Bunyi',
  'profile.soundDesc': 'Bunyi untuk setiap aktiviti',
  'profile.voice': 'Bacaan Suara',
  'profile.voiceDesc': 'Baca soalan dengan kuat',
  'profile.language': 'Bahasa',
  'profile.languageDesc': 'Bahasa antara muka',
  'profile.motion': 'Animasi',
  'profile.motionDesc': 'Gerakan dan animasi',
  'profile.calm': 'Mod Tenang',
  'profile.calmDesc': 'Warna lembut untuk mata sensitif',
  'profile.contrast': 'Kontras Tinggi',
  'profile.contrastDesc': 'Teks lebih jelas',
  'profile.fontSize': 'Saiz Teks',
  'profile.data': 'Data',
  'profile.export': 'Sandarkan Data',
  'profile.import': 'Pulihkan Data',
  'profile.exportDesc': 'Simpan salinan rekod murid',
  'profile.importDesc': 'Muat semula daripada fail sandaran',
  'profile.install': 'Pasang Aplikasi',
  'profile.installDesc': 'Tambah ke skrin utama untuk guna luar talian',
  'profile.installed': 'Aplikasi sudah dipasang',
  'profile.offline': 'Mod luar talian sedia',
  'profile.about': 'Tentang',
  'profile.aboutDesc': 'Silibus KSSR Semakan 2017, KPM Malaysia',
  'profile.reset': 'Padam Semua Data',
  'profile.resetDesc': 'Semua rekod akan dipadam kekal',
  'profile.resetConfirm': 'Pasti mahu padam semua data?',
  'profile.removeProfile': 'Padam Murid Ini',
  'profile.catalogInfo': 'topik mengikut silibus',
  'profile.subjectsCount': 'mata pelajaran',
  'profile.yearsCount': 'darjah',
  'profile.privacyNote': '100% luar talian • Tiada iklan • Tiada pengumpulan data',
  'profile.share': 'Kongsi dengan Ibu Bapa & Murid',
  'profile.shareDesc': 'Pautan kekal ini boleh dibuka bila-bila masa — boleh dipasang seperti aplikasi.',
  'profile.copyLink': 'Salin Pautan',
  'profile.shareLink': 'Kongsi',
  'toast.linkCopied': '🔗 Pautan disalin!',
  'toast.copyFailed': 'Tidak dapat menyalin pautan',
  'profile.version': 'Versi',

  // Toast
  'toast.backupDone': '✅ Sandaran dimuat turun',
  'toast.restored': '✅ Data dipulihkan',
  'toast.invalidFile': '❌ Fail tidak sah',
  'toast.childRemoved': '🗑️ Murid dipadam',
  'toast.nameUpdated': '✅ Nama dikemas kini',
  'toast.childAdded': '✅ Murid ditambah',
  'toast.dataCleared': '🗑️ Data dipadam',
  'topics.notFound': 'Topik tidak dijumpai.',

  // Spoken / dynamic messages
  'result.speakPerfect': 'Sempurna! Markah penuh {c} daripada {t}. Tahniah!',
  'result.speakScore': 'Kamu mendapat {c} daripada {t}.',
  'result.speakGood': 'Bagus, teruskan usaha!',
  'result.speakTryAgain': 'Jangan putus asa, cuba lagi!',
  'onboarding.greeting': 'Selamat belajar, {name}!',
  'profile.voiceOn': 'Bacaan suara dihidupkan.',

  // Game end / instruction labels
  'games.endChampion': 'Gelembung Juara!',
  'games.endGood': 'Bagus!',
  'games.endTryAgain': 'Cuba Lagi!',
  'games.endMemory': 'Ingatan Hebat!',
  'games.endFinder': 'Pencari Hebat!',
  'games.endFantastic': 'Pantastik!',
  'games.endCombo': 'Kombo Hebat!',
  'games.scoreLabel': 'Skor {s}',
  'games.tapFirstLast': 'Tekan huruf pertama, kemudian huruf terakhir.',
  'games.tapToArrange': 'Tekan untuk susun…',
  'games.answerIn6': 'Jawab dalam 6 saat untuk kekalkan kombo!',
  'games.noOrderQuestions': 'Tiada soalan susun urutan untuk subjek ini.',

  // Common
  'common.yes': 'Ya',
  'common.no': 'Tidak',
  'common.ok': 'OK',
  'common.cancel': 'Batal',
  'common.save': 'Simpan',
  'common.close': 'Tutup',
  'common.back': 'Kembali',
  'common.next': 'Seterusnya',
  'common.done': 'Selesai',
  'common.loading': 'Memuatkan...',
  'common.year': 'Tahun',
  'common.grade': 'Darjah',
  'common.true': 'Betul',
  'common.false': 'Salah',
  'common.of': 'daripada',
  'common.best': 'Terbaik',
};

const EN: Dict = {
  'app.name': 'Bijak KSSR',
  'app.tagline': 'Learn Happily, Year 1 to 6',

  'onboard.title': 'Welcome!',
  'onboard.sub': 'A learning app following the Malaysian Ministry of Education syllabus.',
  'onboard.name': 'Student Name',
  'onboard.namePh': 'Example: Amin',
  'onboard.avatar': 'Choose Avatar',
  'onboard.year': 'Choose Year',
  'onboard.start': 'Start Learning',
  'onboard.welcomeBack': 'Welcome back',

  'nav.home': 'Home',
  'nav.subjects': 'Subjects',
  'nav.games': 'Games',
  'nav.progress': 'Progress',
  'nav.profile': 'Profile',

  'home.hi': 'Hi',
  'home.letsLearn': "Let's learn today!",
  'home.streak': 'Day streak',
  'home.stars': 'Stars',
  'home.points': 'Points',
  'home.subjects': 'Subjects',
  'home.continue': 'Continue Learning',
  'home.suggested': 'Suggested for you',
  'home.recentBadges': 'Recent Badges',
  'home.noBadges': 'Finish an exercise to earn your first badge!',
  'home.todayGoal': "Today's Goal",
  'home.quickQuiz': 'Quick Practice',

  'subjects.title': 'Subjects',
  'subjects.choose': 'Choose a subject for year',
  'subjects.topics': 'topics',
  'subjects.locked': 'Starts Year 4',
  'subjects.notAvailable': 'Not available for this year',

  'topics.title': 'Topics',
  'topics.notes': 'Notes',
  'topics.practice': 'Practice',
  'topics.game': 'Mini Game',
  'topics.tryFirst': 'Read the notes first, then try the exercises!',
  'topics.questions': 'questions',

  'notes.tip': 'Tip',
  'notes.example': 'Example',
  'notes.formula': 'Formula',
  'notes.fun': 'Fun!',
  'notes.back': 'Back',
  'notes.startQuiz': 'Start Practice',
  'notes.readAloud': 'Read Aloud',
  'notes.stopRead': 'Stop',

  'quiz.question': 'Question',
  'quiz.of': 'of',
  'quiz.check': 'Check Answer',
  'quiz.next': 'Next',
  'quiz.finish': 'Finish',
  'quiz.correct': 'Correct!',
  'quiz.wrong': 'Try again!',
  'quiz.hint': 'Hint',
  'quiz.showHint': 'Show Hint',
  'quiz.tapAnswer': 'Choose your answer',
  'quiz.matchPairs': 'Match the pairs',
  'quiz.arrange': 'Arrange in order',
  'quiz.clear': 'Clear',
  'quiz.submit': 'Submit',
  'quiz.timeUp': "Time's up!",
  'quiz.exit': 'Exit',
  'quiz.exitConfirm': 'Leave this exercise?',
  'quiz.stay': 'Keep going',
  'quiz.leave': 'Leave',
  'quiz.decimalPoint': 'Decimal point',
  'quiz.delete': 'Delete',
  'quiz.negative': 'Negative number',

  'result.title': 'Result',
  'result.perfect': 'Perfect!',
  'result.great': 'Great!',
  'result.good': 'Good!',
  'result.tryAgain': 'Try Again!',
  'result.score': 'Score',
  'result.correctOf': 'correct out of',
  'result.perfectBonus': 'Perfect score bonus!',
  'result.newBadge': 'New Badge!',
  'result.starsEarned': 'stars earned',
  'result.pointsEarned': 'points earned',
  'result.review': 'Review Answers',
  'result.retry': 'Try Again',
  'result.backHome': 'Back to Home',
  'result.backTopics': 'Other Topics',
  'result.timeSpent': 'Time',
  'result.seconds': 'seconds',
  'result.topicLabel': 'Topic',

  'games.title': 'Mini Games',
  'games.sub': 'Learn while playing!',
  'games.play': 'Play',
  'games.score': 'Score',
  'games.time': 'Time',
  'games.lives': 'Lives',
  'games.level': 'Level',
  'games.found': 'Found',
  'games.moves': 'Moves',
  'games.pairs': 'Pairs',
  'games.start': 'Start',
  'games.playAgain': 'Play Again',
  'games.combo': 'Combo',
  'games.best': 'Best',
  'games.newBest': 'New Record!',

  'progress.title': 'My Progress',
  'progress.overview': 'Overview',
  'progress.bySubject': 'Performance by Subject',
  'progress.byYear': 'Performance by Year',
  'progress.trend': 'Score Trend',
  'progress.mastery': 'Topic Mastery',
  'progress.attempts': 'Attempts',
  'progress.accuracy': 'Accuracy',
  'progress.avgScore': 'Average Score',
  'progress.totalTime': 'Total Time',
  'progress.minutes': 'minutes',
  'progress.perfect': 'Perfect Scores',
  'progress.times': 'times',
  'progress.noData': 'No data yet. Try an exercise first!',
  'progress.improving': 'Improving',
  'progress.steady': 'Steady',
  'progress.needsWork': 'Needs Practice',
  'progress.strongest': 'Strongest Subject',
  'progress.weakest': 'Needs Attention',
  'progress.recent': 'Recent Exercises',
  'progress.last7': 'Last seven sessions',
  'progress.starsTotal': 'Total Stars',
  'progress.streakNow': 'Current Streak',
  'progress.days': 'days',

  'badges.title': 'Badges & Rewards',
  'badges.earned': 'Earned',
  'badges.locked': 'Not earned yet',
  'badges.how': 'How to earn',
  'badges.earnedCount': 'badges earned',
  'badges.next': 'Next',
  'badges.allEarned': '🏆 All badges earned! Amazing!',
  'badges.ready': '✨ Ready!',

  'profile.title': 'Profile',
  'profile.changeYear': 'Change Year',
  'profile.editName': 'Change Name',
  'profile.avatar': 'Avatar',
  'profile.switch': 'Switch Student',
  'profile.addChild': 'Add Student',
  'profile.settings': 'Settings',
  'profile.sound': 'Sound Effects',
  'profile.soundDesc': 'Sound for every activity',
  'profile.voice': 'Voice Reading',
  'profile.voiceDesc': 'Read questions aloud',
  'profile.language': 'Language',
  'profile.languageDesc': 'Interface language',
  'profile.motion': 'Animations',
  'profile.motionDesc': 'Motion and animations',
  'profile.calm': 'Calm Mode',
  'profile.calmDesc': 'Softer colours for sensitive eyes',
  'profile.contrast': 'High Contrast',
  'profile.contrastDesc': 'Clearer text',
  'profile.fontSize': 'Text Size',
  'profile.data': 'Data',
  'profile.export': 'Back Up Data',
  'profile.import': 'Restore Data',
  'profile.exportDesc': 'Save a copy of student records',
  'profile.importDesc': 'Load from a backup file',
  'profile.install': 'Install App',
  'profile.installDesc': 'Add to home screen for offline use',
  'profile.installed': 'App already installed',
  'profile.offline': 'Offline mode ready',
  'profile.about': 'About',
  'profile.aboutDesc': 'KSSR Semakan 2017 syllabus, Malaysian MOE',
  'profile.reset': 'Delete All Data',
  'profile.resetDesc': 'All records will be permanently deleted',
  'profile.resetConfirm': 'Really delete all data?',
  'profile.removeProfile': 'Delete This Student',
  'profile.catalogInfo': 'topics following the syllabus',
  'profile.subjectsCount': 'subjects',
  'profile.yearsCount': 'years',
  'profile.privacyNote': '100% offline • No ads • No data collection',
  'profile.share': 'Share with Parents & Students',
  'profile.shareDesc': 'This permanent link works any time — and can be installed like an app.',
  'profile.copyLink': 'Copy Link',
  'profile.shareLink': 'Share',
  'toast.linkCopied': '🔗 Link copied!',
  'toast.copyFailed': 'Could not copy link',
  'profile.version': 'Version',

  'toast.backupDone': '✅ Backup downloaded',
  'toast.restored': '✅ Data restored',
  'toast.invalidFile': '❌ Invalid file',
  'toast.childRemoved': '🗑️ Student removed',
  'toast.nameUpdated': '✅ Name updated',
  'toast.childAdded': '✅ Student added',
  'toast.dataCleared': '🗑️ Data cleared',
  'topics.notFound': 'Topic not found.',

  'result.speakPerfect': 'Perfect! Full marks {c} out of {t}. Congratulations!',
  'result.speakScore': 'You scored {c} out of {t}.',
  'result.speakGood': 'Well done, keep it up!',
  'result.speakTryAgain': "Don't give up, try again!",
  'onboarding.greeting': 'Happy learning, {name}!',
  'profile.voiceOn': 'Voice reading is on.',

  'games.endChampion': 'Bubble Champion!',
  'games.endGood': 'Well done!',
  'games.endTryAgain': 'Try Again!',
  'games.endMemory': 'Great Memory!',
  'games.endFinder': 'Super Finder!',
  'games.endFantastic': 'Fantastic!',
  'games.endCombo': 'Great Combo!',
  'games.scoreLabel': 'Score {s}',
  'games.tapFirstLast': 'Tap the first letter, then the last letter.',
  'games.tapToArrange': 'Tap to arrange…',
  'games.answerIn6': 'Answer within 6 seconds to keep your combo!',
  'games.noOrderQuestions': 'No ordering questions for this subject.',

  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.done': 'Done',
  'common.loading': 'Loading...',
  'common.year': 'Year',
  'common.grade': 'Year',
  'common.true': 'True',
  'common.false': 'False',
  'common.of': 'of',
  'common.best': 'Best',
};

const DICTS: Record<Lang, Dict> = { ms: MS, en: EN };

export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let out = DICTS[lang][key] ?? DICTS.ms[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

/** Subjek mempunyai nama berbeza antara bahasa. */
export function subjectName(lang: Lang, id: string, fallback: string): string {
  if (lang === 'ms') return fallback;
  const map: Record<string, string> = {
    matematik: 'Mathematics',
    'bahasa-melayu': 'Malay Language',
    english: 'English',
    sains: 'Science',
    sejarah: 'History',
  };
  return map[id] ?? fallback;
}

/** Label darjah mengikut bahasa antara muka. */
export function yearLabel(lang: Lang, year: number): string {
  return lang === 'en' ? `Year ${year}` : `Tahun ${year}`;
}

const YEAR_THEME_EN: Record<number, string> = {
  1: 'Basic literacy and numeracy',
  2: 'Building foundations',
  3: 'Applying the basics',
  4: 'Strengthening literacy',
  5: 'Applying skills',
  6: 'Higher-order skills',
};

/** Tema ringkas bagi setiap darjah. */
export function yearTheme(lang: Lang, year: number, fallback: string): string {
  return lang === 'en' ? (YEAR_THEME_EN[year] ?? fallback) : fallback;
}

/** Kiraan hari dengan bentuk tunggal/jamak yang betul. */
export function dayCount(lang: Lang, n: number): string {
  if (lang === 'en') return `${n} ${n === 1 ? 'day' : 'days'}`;
  return `${n} hari`;
}

const GAME_EN: Record<string, { name: string; blurb: string }> = {
  'gelembung-nombor': {
    name: 'Number Bubbles',
    blurb: 'Pop the correct answer bubbles before they disappear!',
  },
  'padan-ingatan': {
    name: 'Memory Match',
    blurb: 'Find the matching card pairs. Train your memory!',
  },
  'cari-perkataan': {
    name: 'Word Search',
    blurb: 'Find hidden words in the letter grid.',
  },
  'susun-cepat': {
    name: 'Quick Sort',
    blurb: 'Arrange items in the correct order, fast!',
  },
  'teka-cepat': {
    name: 'Quick Quiz',
    blurb: 'Answer as many questions as you can within the time limit!',
  },
};

/** Nama permainan mini mengikut bahasa antara muka. */
export function gameName(lang: Lang, id: string, fallback: string): string {
  return lang === 'en' ? (GAME_EN[id]?.name ?? fallback) : fallback;
}

/** Penerangan permainan mini mengikut bahasa antara muka. */
export function gameBlurb(lang: Lang, id: string, fallback: string): string {
  return lang === 'en' ? (GAME_EN[id]?.blurb ?? fallback) : fallback;
}
