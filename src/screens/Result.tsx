/** Skrin keputusan latihan dengan ganjaran dan semakan jawapan. */

import { useEffect, useState } from 'react';
import { useStore, useT } from '../state/store';
import { Btn, Chip, Confetti, useAnimatedNumber } from '../components/ui';
import { subjectById } from '../data/subjects';
import { ALL_TOPICS } from '../data/catalog';
import { badgeHow, badgeName } from '../data/badges';
import { contributorFor } from '../data/contributors';
import { dayCount, subjectName, yearLabel } from '../lib/i18n';
import { sound, voice } from '../lib/audio';

export function ResultScreen() {
  const { nav, profile, go, back, celebrateBadge, lang, settings } = useStore();
  const t = useT();
  const r = nav.result;
  const [fire, setFire] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const score = r ? Math.round((r.correct / Math.max(r.total, 1)) * 100) : 0;
  const animated = useAnimatedNumber(score, 900);

  useEffect(() => {
    if (!r) return;
    setFire((f) => f + 1);
    sound.play(r.perfect ? 'win' : r.stars > 0 ? 'star' : 'tap');
    if (settings.voice) {
      const spoken = r.perfect
        ? t('result.speakPerfect', { c: r.correct, t: r.total })
        : `${t('result.speakScore', { c: r.correct, t: r.total })} ${
            score >= 60 ? t('result.speakGood') : t('result.speakTryAgain')
          }`;
      const timer = window.setTimeout(() => voice.speak(spoken, lang), 500);
      return () => window.clearTimeout(timer);
    }
  }, [r, score, settings.voice, t, lang]);

  // Tandakan lencana baharu sebagai diumumkan.
  useEffect(() => {
    if (!r) return;
    r.badges.forEach((b) => celebrateBadge(b.id));
  }, [r, celebrateBadge]);

  if (!r) {
    return (
      <div className="screen">
        <div className="screen-scroll">
          <p className="muted center">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const meta = subjectById(r.subject);
  const contributor = contributorFor(r.topicId);
  // Sesi ulangan merentas topik beberapa guru: paparkan setiap guru yang
  // menyumbang kepada sesi ini, bukan satu nama rawak.
  const reviewTeachers = r.reviewTopicIds
    ? [...new Set(r.reviewTopicIds.map((id) => contributorFor(id).name))]
    : [];
  const tier = score >= 100 ? 'gold' : score >= 80 ? 'silver' : score >= 60 ? 'bronze' : 'plain';
  const title = r.perfect ? t('result.perfect') : score >= 80 ? t('result.great') : score >= 60 ? t('result.good') : t('result.tryAgain');

  return (
    <div className="screen">
      <Confetti fireKey={fire} count={r.perfect ? 110 : r.stars > 0 ? 70 : 0} />

      <div className="screen-scroll">
        <div className="result-hero" data-tier={tier}>
          <span style={{ fontSize: '2.6rem', display: 'block' }} aria-hidden="true">
            {r.perfect ? '🏆' : score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
          </span>
          <h2>{title}</h2>
          <div className="score-big" aria-label={`${t('result.score')} ${score}%`}>
            {animated}%
          </div>
          <p style={{ fontSize: '0.88rem', fontWeight: 800, opacity: 0.95 }}>
            {r.correct} {t('result.correctOf')} {r.total} • {r.seconds} {t('result.seconds')}
          </p>
          <div className="star-row" aria-label={`${r.stars} ${t('result.starsEarned')}`}>
            {[1, 2, 3].map((s) => (
              <span key={s} className="star" data-off={s <= r.stars ? 'false' : 'true'} aria-hidden="true">
                ⭐
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="row-between">
            <div>
              <p className="tiny muted">{t('result.topicLabel') || 'Topik'}</p>
              <b style={{ fontSize: '0.95rem', fontWeight: 900 }}>
                {r.reviewTopicIds && r.reviewTopicIds.length > 0
                  ? r.reviewTopicIds
                      .map((id) => ALL_TOPICS.find((x) => x.id === id)?.title)
                      .filter(Boolean)
                      .join(' • ')
                  : r.topicTitle}
              </b>
              <p className="tiny muted">
                {subjectName(lang, r.subject, meta.name)} • {yearLabel(lang, r.year)}
              </p>
            </div>
            <span className="icon-btn" style={{ background: `${meta.color}1a` }} aria-hidden="true">
              {meta.emoji}
            </span>
          </div>

          <div className="row wrap" style={{ marginTop: 12, gap: 8 }}>
            <Chip tone="success">
              ⭐ +{r.stars} {t('result.starsEarned')}
            </Chip>
            <Chip tone="brand">
              🏅 +{r.points} {t('result.pointsEarned')}
            </Chip>
            {r.perfect ? <Chip tone="warn">💯 {t('result.perfectBonus')}</Chip> : null}
          </div>

          <p className="tiny muted" style={{ marginTop: 10 }}>
            {reviewTeachers.length > 0
              ? `📚 ${t('topics.byTeacher')} ${reviewTeachers.join(', ')}`
              : `${contributor.emoji} ${t('topics.byTeacher')} ${contributor.name}`}
          </p>

          {profile ? (
            <p className="tiny muted" style={{ marginTop: 10 }}>
              ⭐ {profile.stars} • 🏅 {profile.points} • 🔥 {dayCount(lang, profile.streakDays)}
            </p>
          ) : null}
        </div>

        {r.badges.length > 0 ? (
          <>
            <p className="section-title">🎖️ {t('result.newBadge')}</p>
            <div className="stack">
              {r.badges.map((b) => (
                <div key={b.id} className="card row" style={{ background: 'var(--success-soft)' }}>
                  <span style={{ fontSize: '2rem' }} className="animate-wiggle" aria-hidden="true">
                    {b.emoji}
                  </span>
                  <div className="grow">
                    <b style={{ fontWeight: 900 }}>{badgeName(lang, b)}</b>
                    <p className="tiny muted">{badgeHow(lang, b)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className="stack" style={{ marginTop: 18 }}>
          <Btn block variant="accent" onClick={() => { sound.play('pop'); setShowReview((s) => !s); }}>
            📋 {t('result.review')} {showReview ? '▲' : '▼'}
          </Btn>

          {showReview ? (
            <div className="stack">
              {r.answers.map((a, i) => (
                <div key={a.questionId} className="review-item" data-ok={a.ok ? 'true' : 'false'}>
                  <span className="mark" aria-hidden="true">
                    {a.ok ? '✅' : '❌'}
                  </span>
                  <div className="grow">
                    <b>
                      {i + 1}. {a.prompt}
                    </b>
                    {!a.ok ? (
                      <small>
                        <b style={{ color: 'var(--danger)' }}>{a.given}</b> → <b style={{ color: 'var(--success)' }}>{a.correct}</b>
                      </small>
                    ) : (
                      <small>{a.correct}</small>
                    )}
                    <small style={{ marginTop: 4 }}>💡 {a.explanation}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <Btn
            block
            onClick={() => {
              sound.play('pop');
              // Sesi baharu menggunakan benih berbeza → soalan berbeza.
              // Sesi ulangan diulang dengan topik yang sama.
              if (r.reviewTopicIds && r.reviewTopicIds.length > 0) {
                go({ screen: 'quiz', review: { topicIds: r.reviewTopicIds }, from: nav.from });
              } else {
                go({ screen: 'quiz', topicId: r.topicId === 'quick' ? nav.topicId : r.topicId, subject: r.subject, from: nav.from });
              }
            }}
          >
            🔄 {t('result.retry')}
          </Btn>

          <div className="row" style={{ gap: 10 }}>
            <Btn
              block
              variant="ghost"
              onClick={() => back()}
            >
              ← {t('result.backTopics')}
            </Btn>
            <Btn
              block
              variant="ghost"
              onClick={() => {
                go({ screen: 'home' });
              }}
            >
              🏠 {t('result.backHome')}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
