// Suntik keadaan demo ke dalam localStorage untuk semakan manual skrin
// Pelan / Kemajuan / Laporan. Guna sekali sahaja: node scripts/seed-demo.mjs
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const out = join(mkdtempSync(join(tmpdir(), 'p-')), 'b.mjs');
await build({ entryPoints: ['src/lib/plan.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const c = join(mkdtempSync(join(tmpdir(), 'c-')), 'c.mjs');
await build({ entryPoints: ['src/data/catalog.ts'], bundle: true, format: 'esm', platform: 'node', outfile: c, logLevel: 'error' });
const { buildPlan } = await import(out);
const { ALL_TOPICS } = await import(c);

const year = Number(process.argv[2] ?? 4);
const pick = (subject) => ALL_TOPICS.find((t) => t.year === year && t.subject === subject);
const topics = ['matematik', 'sains', 'bahasa-melayu', 'english', 'sejarah'].map(pick).filter(Boolean);

const items = topics.map((t, i) => ({
  topicId: t.id,
  subject: t.subject,
  title: t.title,
  correct: [1, 4, 3, 2, 4][i % 5],
  total: 4,
}));
const diagnostic = {
  ts: Date.now(),
  year,
  items,
  correct: items.reduce((s, x) => s + x.correct, 0),
  total: items.length * 4,
  seconds: 240,
};

const attempts = topics.slice(0, 4).map((t, i) => ({
  id: `a-seed-${i}`,
  ts: Date.now() - (4 - i) * 3600000,
  year,
  subject: t.subject,
  topicId: t.id,
  topicTitle: t.title,
  correct: [1, 2, 3, 4][i % 4],
  total: 4,
  seconds: 45,
  retries: 0,
}));

const profile = {
  id: 'p-demo',
  name: 'Amin',
  avatar: '🦊',
  year,
  createdAt: Date.now(),
  attempts,
  badges: ['first-steps'],
  streakDays: 3,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  stars: 5,
  points: 120,
  seenTopics: topics.slice(0, 2).map((t) => t.id),
  diagnostic,
  plan: null,
};
profile.plan = buildPlan(profile, 4242);
profile.plan.tasks = profile.plan.tasks.map((t, i) => (i < 4 ? { ...t, done: true } : t));
profile.plan.focusSeconds = 620;

writeFileSync(
  '/tmp/state.json',
  JSON.stringify({
    version: 1,
    activeProfileId: 'p-demo',
    profiles: [profile],
    settings: { sound: true, voice: false, motion: true, calm: false, contrast: false, dark: false, fontScale: 1 },
    lang: 'ms',
    celebratedBadges: ['first-steps'],
  }),
);
console.log(`keadaan demo ditulis (/tmp/state.json) — tahun ${year}, ${profile.plan.tasks.length} tugasan`);
