/** Skrin senarai topik bagi satu mata pelajaran dan tahun. */

import { useMemo } from 'react';
import { useStore, useT } from '../state/store';
import { Chip, EmptyState, ProgressRing, TopBar } from '../components/ui';
import { subjectById, gamesForSubject } from '../data/subjects';
import { gameBlurb, gameName, subjectName, yearLabel } from '../lib/i18n';
import { topicsFor } from '../data/catalog';
import { sound } from '../lib/audio';
import type { SubjectId, YearNum } from '../data/types';

export function TopicsScreen() {
  const { profile, nav, go, back, lang } = useStore();
  const t = useT();
  const subject = (nav.subject ?? 'matematik') as SubjectId;
  const meta = subjectById(subject);
  const year = profile?.year ?? 1;

  // Sejarah hanya bermula Tahun 4 dan ke atas.
  const available = useMemo(() => topicsFor(subject, year), [subject, year]);
  const games = useMemo(() => gamesForSubject(subject, year), [subject, year]);

  if (!profile) return null;

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={subjectName(lang, subject, meta.name)}
        subtitle={`${yearLabel(lang, year)} • ${available.length} ${t('subjects.topics')}`}
        right={
          <span className="icon-btn" aria-hidden="true" style={{ background: `${meta.color}1a` }}>
            {meta.emoji}
          </span>
        }
      />
      <div className="screen-scroll">
        <div className="card-flat">
          <p className="tiny muted">{meta.blurb}</p>
        </div>

        {available.length === 0 ? (
          <EmptyState
            emoji="🔒"
            title={`${meta.name} ${t('subjects.locked')}`}
            desc={subject === 'sejarah' ? `${yearLabel(lang, 4)} — ${yearLabel(lang, 6)}` : t('subjects.notAvailable')}
          />
        ) : (
          <>
            <p className="section-title">{t('topics.title')}</p>
            <div className="stack">
              {available.map((topic) => {
                const best = bestScore(profile.attempts, topic.id);
                const attempts = profile.attempts.filter((a) => a.topicId === topic.id).length;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className="topic-item"
                    onClick={() => {
                      sound.play('pop');
                      go({ screen: 'notes', topicId: topic.id, subject, from: 'topics' });
                    }}
                  >
                    <span className="badge" aria-hidden="true" style={{ background: `${meta.color}1a` }}>
                      {topic.emoji}
                    </span>
                    <span className="grow">
                      <b>{topic.title}</b>
                      <small>{topic.summary}</small>
                      <span className="row wrap" style={{ marginTop: 6, gap: 6 }}>
                        <Chip tone="brand">DSKP {topic.code}</Chip>
                        {best !== null ? (
                          <Chip tone={best >= 80 ? 'success' : best >= 60 ? 'warn' : 'danger'}>
                            {t('common.best')} {best}%
                          </Chip>
                        ) : null}
                        {attempts > 0 ? (
                          <Chip>
                            {attempts}× {t('progress.attempts').toLowerCase()}
                          </Chip>
                        ) : null}
                      </span>
                    </span>
                    {best !== null ? (
                      <ProgressRing value={best} size={40} stroke={4} colour={meta.color} />
                    ) : (
                      <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>
                        ›
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {games.length > 0 ? (
          <>
            <p className="section-title">{t('topics.game')}</p>
            <div className="stack">
              {games.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="topic-item"
                  onClick={() => {
                    sound.play('pop');
                    go({ screen: 'game', gameId: g.id, subject, from: 'topics' });
                  }}
                >
                  <span className="badge" aria-hidden="true" style={{ background: 'var(--accent-soft)' }}>
                    {g.emoji}
                  </span>
                  <span className="grow">
                    <b>{gameName(lang, g.id, g.name)}</b>
                    <small>{gameBlurb(lang, g.id, g.blurb)}</small>
                  </span>
                  <span aria-hidden="true">🎮</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function bestScore(attempts: { topicId: string; correct: number; total: number }[], topicId: string): number | null {
  const rel = attempts.filter((a) => a.topicId === topicId && a.total > 0);
  if (rel.length === 0) return null;
  return Math.round(Math.max(...rel.map((a) => (a.correct / a.total) * 100)));
}

export type { YearNum };
