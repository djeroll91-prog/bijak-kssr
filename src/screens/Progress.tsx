/**
 * Skrin pemantauan kemajuan murid.
 * Memaparkan trend markah, prestasi ikut subjek/topik dan penguasaan.
 */

import { useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { BarList, Chip, EmptyState, ProgressRing, TrendChart, TopBar } from '../components/ui';
import { SUBJECTS, subjectById } from '../data/subjects';
import { subjectName, yearLabel } from '../lib/i18n';
import { ALL_TOPICS, topicsFor } from '../data/catalog';
import { BADGES, badgeName } from '../data/badges';
import { profileStats } from '../lib/storage';
import { sound } from '../lib/audio';
import { DIAGNOSTIC_TOPIC_ID, diagnosticRows, planProgress, practisedTopicCount } from '../lib/plan';
import type { SubjectId } from '../data/types';

type Range = 7 | 15 | 30;

export function ProgressScreen() {
  const { profile, back, go, lang } = useStore();
  const t = useT();
  const [range, setRange] = useState<Range>(15);

  // Percubaan latihan sebenar sahaja; ringkasan diagnosis dipaparkan berasingan.
  const practice = useMemo(
    () => (profile ? profile.attempts.filter((a) => a.topicId !== DIAGNOSTIC_TOPIC_ID) : []),
    [profile],
  );

  const stats = useMemo(
    () => (profile ? profileStats({ ...profile, attempts: practice }) : null),
    [profile, practice],
  );

  const diagRows = useMemo(() => diagnosticRows(profile?.diagnostic), [profile?.diagnostic]);
  const planProgressValue = useMemo(() => planProgress(profile?.plan), [profile?.plan]);

  const sessions = useMemo(() => practice.slice(-range), [practice, range]);

  const trend = useMemo(
    () =>
      sessions.map((a, i) => ({
        label: `${i + 1}`,
        value: a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0,
      })),
    [sessions],
  );

  /** Prestasi ikut subjek berdasarkan purata markah semua percubaan. */
  const bySubject = useMemo(() => {
    if (!profile) return [];
    return SUBJECTS.map((s) => {
      const rel = practice.filter((a) => a.subject === s.id && a.total > 0);
      const avg = rel.length > 0 ? Math.round(rel.reduce((sum, a) => sum + (a.correct / a.total) * 100, 0) / rel.length) : 0;
      return { id: s.id, name: subjectName(lang, s.id, s.name), emoji: s.emoji, colour: s.color, avg, count: rel.length };
    }).filter((x) => x.count > 0);
  }, [practice, lang]);

  /** Prestasi ikut darjah. */
  const byYear = useMemo(() => {
    if (!profile) return [];
    return ([1, 2, 3, 4, 5, 6] as const)
      .map((y) => {
        const rel = practice.filter((a) => a.year === y && a.total > 0);
        const avg = rel.length > 0 ? Math.round(rel.reduce((sum, a) => sum + (a.correct / a.total) * 100, 0) / rel.length) : 0;
        return { year: y, avg, count: rel.length };
      })
      .filter((x) => x.count > 0);
  }, [practice]);

  /** Penguasaan setiap topik (purata markah). */
  const mastery = useMemo(() => {
    if (!profile) return [];
    const map = new Map<string, { total: number; count: number }>();
    for (const a of practice) {
      if (a.total === 0) continue;
      const cur = map.get(a.topicId) ?? { total: 0, count: 0 };
      cur.total += (a.correct / a.total) * 100;
      cur.count += 1;
      map.set(a.topicId, cur);
    }
    return [...map.entries()]
      .map(([id, v]) => {
        const topic = ALL_TOPICS.find((x) => x.id === id);
        return {
          id,
          title: topic?.title ?? id,
          emoji: topic?.emoji ?? '📘',
          subject: topic?.subject ?? ('matematik' as SubjectId),
          avg: Math.round(v.total / v.count),
          count: v.count,
        };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [practice]);

  const totalStars = useMemo(
    () => practice.reduce((s, a) => s + (a.correct === a.total && a.total > 0 ? 3 : a.total > 0 && a.correct / a.total >= 0.8 ? 2 : a.total > 0 && a.correct / a.total >= 0.6 ? 1 : 0), 0),
    [practice],
  );

  if (!profile || !stats) return null;

  const yearTopicCount = ALL_TOPICS.filter((x) => x.year === profile.year).length;
  const overallPct = yearTopicCount > 0 ? (practisedTopicCount(profile) / yearTopicCount) * 100 : 0;
  const bestSubject = bySubject.length > 0 ? bySubject.reduce((a, b) => (a.avg >= b.avg ? a : b)) : null;
  const weakSubject = bySubject.length > 0 ? bySubject.reduce((a, b) => (a.avg <= b.avg ? a : b)) : null;

  const trendStatus =
    trend.length >= 2
      ? trend[trend.length - 1].value - trend[0].value
      : 0;

  if (practice.length === 0 && !profile.diagnostic) {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('progress.title')} />
        <div className="screen-scroll">
          <EmptyState emoji="📊" title={t('progress.noData')} desc={t('topics.tryFirst')} />
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar onBack={back} title={t('progress.title')} subtitle={`${profile.name} • ${yearLabel(lang, profile.year)}`} />
      <div className="screen-scroll">
        {/* Gambaran keseluruhan */}
        <div className="card">
          <div className="row-between">
            <div className="row">
              <ProgressRing value={overallPct} size={58} label={`${Math.round(overallPct)}%`} />
              <div>
                <b style={{ fontSize: '0.95rem', fontWeight: 900 }}>{t('progress.overview')}</b>
                <p className="tiny muted">
                  {practisedTopicCount(profile)}/{yearTopicCount} {t('subjects.topics')}
                </p>
              </div>
            </div>
            <div className="center">
              <b style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand)' }}>{stats.accuracy}%</b>
              <p className="tiny muted">{t('progress.accuracy')}</p>
            </div>
          </div>

          <div className="legend" style={{ marginTop: 14 }}>
            <span>
              <i style={{ background: 'var(--brand)' }} /> {stats.total} {t('progress.attempts')}
            </span>
            <span>
              <i style={{ background: 'var(--success)' }} /> {stats.correct} ✅
            </span>
            <span>
              <i style={{ background: 'var(--accent)' }} /> ⭐ {totalStars}
            </span>
            <span>
              <i style={{ background: 'var(--info)' }} /> ⏱️ {stats.minutes} {t('progress.minutes')}
            </span>
          </div>
        </div>

        {/* Program belajar: diagnosis + pelan + laporan */}
        <p className="section-title">🗺️ {t('plan.title')}</p>
        <div className="card">
          <div className="row-between">
            <div className="row">
              <ProgressRing value={planProgressValue.pct} size={48} />
              <div>
                <b style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                  {profile.plan
                    ? t('plan.dayOf', { n: planProgressValue.activeDay + 1, t: 7 })
                    : t('plan.noPlanTitle')}
                </b>
                <p className="tiny muted">
                  {profile.plan
                    ? `${planProgressValue.done}/${planProgressValue.total} ${t('plan.tasksDone')}`
                    : t('plan.noPlanDesc')}
                </p>
              </div>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
            <button
              type="button"
              className="chip chip-brand"
              onClick={() => {
                sound.play('pop');
                go({ screen: 'plan' });
              }}
            >
              🗺️ {t('plan.title')}
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => {
                sound.play('pop');
                go({ screen: 'diagnostic' });
              }}
            >
              🧭 {t('diag.retake')}
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => {
                sound.play('pop');
                go({ screen: 'report' });
              }}
            >
              📄 {t('report.title')}
            </button>
          </div>
        </div>

        {diagRows.length > 0 ? (
          <>
            <p className="section-title">🧭 {t('diag.byTopic')}</p>
            <div className="card">
              <BarList
                rows={diagRows.map((r) => ({
                  label: r.title,
                  value: r.pct,
                  colour: r.pct >= 80 ? 'var(--success)' : r.pct >= 60 ? 'var(--warn)' : 'var(--danger)',
                  suffix: '%',
                }))}
              />
            </div>
          </>
        ) : null}

        {/* Trend markah */}
        <p className="section-title">{t('progress.trend')}</p>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="tiny muted">{t('progress.last7')}</span>
            <Chip tone={trendStatus > 3 ? 'success' : trendStatus < -3 ? 'danger' : 'warn'}>
              {trendStatus > 3
                ? `📈 ${t('progress.improving')}`
                : trendStatus < -3
                  ? `📉 ${t('progress.needsWork')}`
                  : `➡️ ${t('progress.steady')}`}
            </Chip>
          </div>
          <TrendChart points={trend} />
          <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
            {([7, 15, 30] as Range[]).map((n) => (
              <button
                key={n}
                type="button"
                className="chip"
                style={range === n ? { background: 'var(--brand)', color: '#fff' } : undefined}
                onClick={() => setRange(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Prestasi ikut subjek */}
        <p className="section-title">{t('progress.bySubject')}</p>
        <div className="card">
          {bySubject.length === 0 ? (
            <p className="tiny muted">{t('progress.noData')}</p>
          ) : (
            <>
              <BarList
                rows={bySubject.map((s) => ({
                  label: `${s.emoji} ${s.name}`,
                  value: s.avg,
                  colour: s.colour,
                  suffix: '%',
                }))}
              />
              <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
                {bestSubject ? (
                  <Chip tone="success">
                    🥇 {t('progress.strongest')}: {bestSubject.name}
                  </Chip>
                ) : null}
                {weakSubject && weakSubject.id !== bestSubject?.id ? (
                  <Chip tone="warn">
                    🎯 {t('progress.weakest')}: {weakSubject.name}
                  </Chip>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Prestasi ikut darjah */}
        {byYear.length > 1 ? (
          <>
            <p className="section-title">{t('progress.byYear')}</p>
            <div className="card">
              <BarList
                rows={byYear.map((y) => ({
                  label: yearLabel(lang, y.year),
                  value: y.avg,
                  colour: 'var(--info)',
                  suffix: '%',
                }))}
              />
            </div>
          </>
        ) : null}

        {/* Penguasaan topik */}
        <p className="section-title">{t('progress.mastery')}</p>
        <div className="stack">
          {mastery.slice(0, 12).map((m) => (
            <div key={m.id} className="card row" style={{ padding: 12 }}>
              <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
                {m.emoji}
              </span>
              <div className="grow">
                <b style={{ fontSize: '0.86rem', fontWeight: 900 }}>{m.title}</b>
                <p className="tiny muted">
                  {m.count}× {t('progress.attempts').toLowerCase()} • {subjectById(m.subject).name}
                </p>
                <div className="bar-track" style={{ marginTop: 6 }}>
                  <i
                    style={{
                      width: `${m.avg}%`,
                      background: m.avg >= 80 ? 'var(--success)' : m.avg >= 60 ? 'var(--warn)' : 'var(--danger)',
                    }}
                  />
                </div>
              </div>
              <b style={{ fontSize: '0.92rem', fontWeight: 900 }}>{m.avg}%</b>
            </div>
          ))}
        </div>

        {/* Lencana ringkas */}
        <p className="section-title">{t('badges.title')}</p>
        <div className="card">
          <div className="row-between">
            <span className="tiny muted">
              {profile.badges.length}/{BADGES.length} {t('badges.earnedCount')}
            </span>
            <button type="button" className="chip chip-brand" onClick={() => go({ screen: 'badges' })}>
              {t('badges.title')} ›
            </button>
          </div>
          <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
            {BADGES.slice(0, 8).map((b) => {
              const owned = profile.badges.includes(b.id);
              return (
                <span key={b.id} className={owned ? 'chip chip-success' : 'chip'} style={{ opacity: owned ? 1 : 0.5 }}>
                  {owned ? b.emoji : '🔒'} {badgeName(lang, b)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Latihan terkini */}
        <p className="section-title">{t('progress.recent')}</p>
        <div className="stack">
          {[...practice]
            .reverse()
            .slice(0, 8)
            .map((a) => {
              const pct = a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0;
              return (
                <div key={a.id} className="card row" style={{ padding: 12 }}>
                  <span className="badge" style={{ width: 38, height: 38, flex: '0 0 38px', fontSize: '1.1rem', background: `${subjectById(a.subject).color}1a` }} aria-hidden="true">
                    {subjectById(a.subject).emoji}
                  </span>
                  <div className="grow">
                    <b style={{ fontSize: '0.84rem', fontWeight: 900 }}>{a.topicTitle}</b>
                    <p className="tiny muted">
                      {yearLabel(lang, a.year)} • {a.correct}/{a.total} • {a.seconds}s
                    </p>
                  </div>
                  <Chip tone={pct >= 80 ? 'success' : pct >= 60 ? 'warn' : 'danger'}>{pct}%</Chip>
                </div>
              );
            })}
        </div>

        {/* Cadangan latihan */}
        <p className="section-title">{t('home.suggested')}</p>
        <div className="stack">
          {suggestRetry(mastery, profile.year, lang).map((s) => {
            const topic = ALL_TOPICS.find((x) => x.id === s.id);
            if (!topic) return null;
            return (
              <button
                key={topic.id}
                type="button"
                className="topic-item"
                onClick={() => go({ screen: 'notes', topicId: topic.id, subject: topic.subject, from: 'progress' })}
              >
                <span className="badge" aria-hidden="true" style={{ background: `${subjectById(topic.subject).color}1a` }}>
                  {topic.emoji}
                </span>
                <span className="grow">
                  <b>{topic.title}</b>
                  <small>
                    {t('progress.needsWork')} • {s.avg}%
                  </small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Pilih topik yang perlu latihan tambahan. */
function suggestRetry(
  mastery: { id: string; avg: number }[],
  year: number,
  _lang: string,
): { id: string; avg: number }[] {
  if (mastery.length > 0) return mastery.slice(-3).reverse();
  return topicsFor('matematik', year as 1 | 2 | 3 | 4 | 5 | 6)
    .slice(0, 3)
    .map((x) => ({ id: x.id, avg: 0 }));
}
