/** Skrin senarai mata pelajaran untuk tahun murid. */

import { useMemo } from 'react';
import { useStore, useT } from '../state/store';
import { Chip, EmptyState, ProgressRing, TopBar } from '../components/ui';
import { SUBJECTS, YEAR_THEME } from '../data/subjects';
import { subjectName, yearLabel, yearTheme } from '../lib/i18n';
import { topicsFor } from '../data/catalog';
import { ALL_TOPICS } from '../data/catalog';
import { sound } from '../lib/audio';

export function SubjectsScreen() {
  const { profile, go, back, lang } = useStore();
  const t = useT();

  const rows = useMemo(() => {
    if (!profile) return [];
    return SUBJECTS.map((s) => {
      const list = topicsFor(s.id, profile.year);
      const tried = list.filter((x) => profile.attempts.some((a) => a.topicId === x.id)).length;
      const scores = list
        .map((x) => bestScore(profile, x.id))
        .filter((v): v is number => v !== null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      return {
        meta: s,
        list,
        tried,
        avg,
        available: s.fromYear <= profile.year && list.length > 0,
      };
    });
  }, [profile]);

  if (!profile) return null;
  const totalTopics = ALL_TOPICS.filter((x) => x.year === profile.year).length;

  return (
    <div className="screen">
      <TopBar onBack={back} title={t('subjects.title')} subtitle={`${yearLabel(lang, profile.year)} • ${yearTheme(lang, profile.year, YEAR_THEME[profile.year])}`} />
      <div className="screen-scroll">
        <div className="card-flat">
          <p className="tiny muted center">
            📖 {totalTopics} {t('subjects.topics')} • {t('profile.aboutDesc')}
          </p>
        </div>

        <div className="stack stagger" style={{ marginTop: 14 }}>
          {rows.map(({ meta, list, tried, avg, available }) => (
            <button
              key={meta.id}
              type="button"
              className="topic-item"
              data-locked={!available ? 'true' : 'false'}
              disabled={!available}
              style={{ opacity: available ? 1 : 0.55 }}
              onClick={() => {
                sound.play('pop');
                go({ screen: 'topics', subject: meta.id, from: 'subjects' });
              }}
            >
              <span className="badge" aria-hidden="true" style={{ background: `${meta.color}1a`, fontSize: '1.5rem' }}>
                {meta.emoji}
              </span>
              <span className="grow">
                <b>{subjectName(lang, meta.id, meta.name)}</b>
                <small>
                  {available
                    ? `${list.length} ${t('subjects.topics')} • ${tried} ${t('common.done').toLowerCase()}`
                    : `${t('subjects.locked')} — ${yearLabel(lang, meta.fromYear)}`}
                </small>
                {available ? (
                  <span className="row wrap" style={{ marginTop: 6, gap: 6 }}>
                    {avg !== null ? (
                      <Chip tone={avg >= 80 ? 'success' : avg >= 60 ? 'warn' : 'danger'}>
                        {t('progress.avgScore')} {avg}%
                      </Chip>
                    ) : (
                      <Chip>{t('topics.tryFirst')}</Chip>
                    )}
                  </span>
                ) : null}
              </span>
              {available ? <ProgressRing value={(tried / Math.max(list.length, 1)) * 100} size={40} stroke={4} colour={meta.color} /> : <span aria-hidden="true">🔒</span>}
            </button>
          ))}
        </div>

        {rows.every((r) => !r.available) ? (
          <EmptyState emoji="📭" title={t('subjects.notAvailable')} />
        ) : null}
      </div>
    </div>
  );
}

function bestScore(profile: { attempts: { topicId: string; correct: number; total: number }[] }, topicId: string): number | null {
  const rel = profile.attempts.filter((a) => a.topicId === topicId && a.total > 0);
  if (rel.length === 0) return null;
  return Math.round(Math.max(...rel.map((a) => (a.correct / a.total) * 100)));
}
