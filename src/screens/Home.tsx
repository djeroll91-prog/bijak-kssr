/** Skrin utama selepas onboarding. */

import { useMemo } from 'react';
import { useStore, useT, starsFor } from '../state/store';
import { Btn, Chip, ProgressRing, useAnimatedNumber } from '../components/ui';
import { SUBJECTS, subjectById, YEAR_THEME } from '../data/subjects';
import { subjectName, yearLabel, yearTheme } from '../lib/i18n';
import { ALL_TOPICS, topicsFor } from '../data/catalog';
import { badgeById, badgeName } from '../data/badges';
import { profileStats } from '../lib/storage';
import { planIsStale, planProgress } from '../lib/plan';
import { sound } from '../lib/audio';
import type { Topic } from '../data/types';

export function HomeScreen() {
  const { profile, go, lang } = useStore();
  const t = useT();
  if (!profile) return null;

  const stats = profileStats(profile);
  const stars = useAnimatedNumber(profile.stars);
  const points = useAnimatedNumber(profile.points);

  // Pelan dianggap sedia apabila ada dan masih relevan untuk tahun semasa.
  const planReady = Boolean(profile.plan) && !planIsStale(profile.plan, profile.year);
  const planProgressValue = planProgress(profile.plan);

  const yearTopics = useMemo(() => ALL_TOPICS.filter((x) => x.year === profile.year), [profile.year]);
  const subjects = useMemo(
    () => SUBJECTS.filter((s) => s.fromYear <= profile.year && topicsFor(s.id, profile.year).length > 0),
    [profile.year],
  );

  // Kemajuan keseluruhan: topik unik yang dicuba berbanding jumlah topik tahun ini.
  const overall = yearTopics.length > 0 ? (new Set(profile.attempts.map((a) => a.topicId)).size / yearTopics.length) * 100 : 0;

  // Cadangan: topik yang belum dicuba, atau skor terendah.
  const suggested = useMemo(() => pickSuggested(profile, yearTopics), [profile, yearTopics]);

  const recentBadges = useMemo(
    () =>
      profile.badges
        .slice(-3)
        .reverse()
        .map((id) => badgeById(id))
        .filter((b): b is NonNullable<ReturnType<typeof badgeById>> => Boolean(b)),
    [profile.badges],
  );

  return (
    <div className="screen">
      <div className="screen-scroll">
        <div className="hero">
          <div className="row">
            <span className="hero-avatar" aria-hidden="true">
              {profile.avatar}
            </span>
            <div className="grow">
              <p>{t('onboard.welcomeBack')},</p>
              <h2>{profile.name}</h2>
              <p>
                {yearLabel(lang, profile.year)} • {yearTheme(lang, profile.year, YEAR_THEME[profile.year])}
              </p>
            </div>
          </div>
          <div className="stat-pills">
            <div className="stat-pill">
              <b>🔥 {profile.streakDays}</b>
              <span>{t('home.streak')}</span>
            </div>
            <div className="stat-pill">
              <b>⭐ {stars}</b>
              <span>{t('home.stars')}</span>
            </div>
            <div className="stat-pill">
              <b>🏅 {points}</b>
              <span>{t('home.points')}</span>
            </div>
          </div>
        </div>

        <div className="card animate-pop" style={{ marginTop: 14 }}>
          <div className="row-between">
            <div className="row">
              <ProgressRing value={overall} size={54} />
              <div>
                <b style={{ fontSize: '0.92rem', fontWeight: 900 }}>{t('home.todayGoal')}</b>
                <p className="tiny muted">
                  {new Set(profile.attempts.map((a) => a.topicId)).size}/{yearTopics.length} {t('subjects.topics')}
                </p>
              </div>
            </div>
            <Chip tone={stats.accuracy >= 80 ? 'success' : stats.accuracy >= 60 ? 'warn' : 'danger'}>
              {stats.accuracy}% {t('progress.accuracy')}
            </Chip>
          </div>
        </div>

        {/* Kad pelan belajar: langkah seterusnya yang jelas untuk murid. */}
        <button
          type="button"
          className="plan-cta animate-slide"
          data-ready={planReady ? 'true' : 'false'}
          onClick={() => {
            sound.play(planReady ? 'levelup' : 'pop');
            go({ screen: planReady ? 'plan' : 'diagnostic' });
          }}
        >
          <span className="pc-emoji" aria-hidden="true">
            {planReady ? '🗺️' : '🧭'}
          </span>
          <span className="grow">
            <b>{planReady ? t('plan.todayTasks') : t('diag.introTitle')}</b>
            <small>
              {planReady
                ? t('plan.dayOf', { n: planProgressValue.activeDay + 1, t: 7 })
                : t('diag.encourage')}
            </small>
            {planReady ? (
              <span className="pc-bar">
                <i style={{ width: `${planProgressValue.pct}%` }} />
              </span>
            ) : null}
          </span>
          <span className="pc-go" aria-hidden="true">
            {planReady ? `${planProgressValue.done}/${planProgressValue.total}` : '›'}
          </span>
        </button>

        <p className="section-title">{t('home.subjects')}</p>
        <div className="subject-grid">
          {subjects.map((s) => {
            const list = topicsFor(s.id, profile.year);
            const tried = list.filter((x) => profile.attempts.some((a) => a.topicId === x.id)).length;
            const pct = list.length > 0 ? (tried / list.length) * 100 : 0;
            return (
              <button
                key={s.id}
                type="button"
                className="subject-tile"
                style={{ ['--tile' as string]: s.color }}
                onClick={() => {
                  sound.play('pop');
                  go({ screen: 'topics', subject: s.id, from: 'home' });
                }}
              >
                <span className="emoji" aria-hidden="true">
                  {s.emoji}
                </span>
                <span>
                  <b>{subjectName(lang, s.id, s.name)}</b>
                  <small>
                    {list.length} {t('subjects.topics')}
                  </small>
                </span>
                <span className="tile-ring">
                  <ProgressRing value={pct} size={34} stroke={4} colour={s.color} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="section-title">{t('home.suggested')}</p>
        <div className="stack stagger">
          {suggested.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="topic-item"
              onClick={() => {
                sound.play('pop');
                go({ screen: 'notes', topicId: topic.id, subject: topic.subject, from: 'home' });
              }}
            >
              <span className="badge" aria-hidden="true" style={{ background: `${subjectById(topic.subject).color}1a` }}>
                {topic.emoji}
              </span>
              <span className="grow">
                <b>{topic.title}</b>
                <small>
                  {subjectName(lang, topic.subject, subjectById(topic.subject).name)} • {yearLabel(lang, topic.year)}
                </small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>

        <p className="section-title">{t('home.recentBadges')}</p>
        {recentBadges.length === 0 ? (
          <div className="card-flat">
            <p className="tiny muted center">🏅 {t('home.noBadges')}</p>
          </div>
        ) : (
          <div className="row wrap" style={{ gap: 8 }}>
            {recentBadges.map((b) => (
              <span key={b.id} className="chip chip-success">
                {b.emoji} {badgeName(lang, b)}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Btn block variant="accent" onClick={() => go({ screen: 'games' })}>
            🎮 {t('games.title')}
          </Btn>
        </div>

        <div style={{ marginTop: 10 }}>
          <Btn block variant="ghost" onClick={() => go({ screen: 'report' })}>
            📄 {t('report.title')}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/** Pilih sehingga tiga topik cadangan untuk murid. */
function pickSuggested(
  profile: NonNullable<ReturnType<typeof useStore>['profile']>,
  topics: Topic[],
): Topic[] {
  const scoreBy = new Map<string, number>();
  for (const a of profile.attempts) {
    if (a.total === 0) continue;
    const pct = (a.correct / a.total) * 100;
    const prev = scoreBy.get(a.topicId);
    scoreBy.set(a.topicId, prev === undefined ? pct : (prev + pct) / 2);
  }
  const untried = topics.filter((x) => !scoreBy.has(x.id));
  const weak = topics
    .filter((x) => scoreBy.has(x.id))
    .sort((a, b) => (scoreBy.get(a.id) ?? 0) - (scoreBy.get(b.id) ?? 0));

  const out: Topic[] = [];
  const seen = new Set<string>();
  for (const x of weak.slice(0, 2)) {
    if (!seen.has(x.id)) {
      seen.add(x.id);
      out.push(x);
    }
  }
  for (const x of untried) {
    if (out.length >= 3) break;
    if (!seen.has(x.id)) {
      seen.add(x.id);
      out.push(x);
    }
  }
  return out.slice(0, 3);
}

export { starsFor };
