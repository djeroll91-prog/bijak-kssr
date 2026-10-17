/**
 * Keputusan peperiksaan percubaan: gred, markah, pecahan topik/subjek,
 * perbandingan dengan percubaan lepas dan semakan jawapan penuh.
 */

import { useEffect, useState } from 'react';
import { useStore, useT } from '../state/store';
import { subjectById } from '../data/subjects';
import { subjectName, yearLabel } from '../lib/i18n';
import { BarList, Btn, Confetti, EmptyState, TopBar, useAnimatedNumber } from '../components/ui';
import { sound, voice } from '../lib/audio';
import { GRADE_KEY, gradeColour } from '../lib/exam';

export function ExamResultScreen() {
  const { nav, go, back, lang } = useStore();
  const t = useT();
  const [showReview, setShowReview] = useState(false);
  const [fire, setFire] = useState(0);

  const r = nav.exam;
  const pct = r?.score.pct ?? 0;
  const animated = useAnimatedNumber(pct, 900);

  useEffect(() => {
    if (!r) return;
    setFire((f) => f + 1);
    sound.play(r.score.pct >= 80 ? 'win' : r.score.pct >= 60 ? 'star' : 'tap');
    if (r.score.pct >= 80) {
      voice.speak(`${r.score.pct} peratus. ${t(GRADE_KEY[r.score.grade])}.`, 'ms');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!r) {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('exam.resultTitle')} />
        <div className="screen-scroll">
          <EmptyState emoji="📝" title={t('common.loading')} />
        </div>
      </div>
    );
  }

  const { score, compare } = r;
  const tier = score.pct >= 80 ? 'gold' : score.pct >= 60 ? 'silver' : score.pct >= 40 ? 'bronze' : 'plain';

  return (
    <div className="screen">
      <Confetti fireKey={fire} count={score.pct >= 80 ? 110 : 50} />
      <TopBar
        onBack={() => go({ screen: 'home' })}
        title={t('exam.resultTitle')}
        subtitle={yearLabel(lang, r.year)}
      />
      <div className="screen-scroll">
        <div className="result-hero" data-tier={tier}>
          <span style={{ fontSize: '2.6rem', display: 'block' }} aria-hidden="true">
            {score.pct >= 80 ? '🏆' : score.pct >= 60 ? '🎉' : '💪'}
          </span>
          <h2>{t(GRADE_KEY[score.grade])}</h2>
          <div className="score-big">{animated}%</div>
          <p style={{ fontSize: '0.88rem', fontWeight: 800, opacity: 0.95 }}>
            {score.correct} {t('result.correctOf')} {score.total} • {r.seconds}s
          </p>
          <div className="row center" style={{ gap: 8, marginTop: 10, justifyContent: 'center' }}>
            <span className="chip chip-brand">
              🎓 {t('exam.gradeLabel')} {score.grade}
            </span>
            <span className={`chip ${score.passed ? 'chip-success' : 'chip-warn'}`}>
              {score.passed ? `✅ ${t('exam.passed')}` : `⚠️ ${t('exam.failed')}`}
            </span>
          </div>
        </div>

        {/* Perbandingan dengan percubaan lepas */}
        <div className="card">
          <p className="tiny muted" style={{ marginBottom: 6 }}>
            {t('exam.compare')} • {t('exam.attemptNo', { n: r.attemptNo })}
          </p>
          <b style={{ fontSize: '0.95rem', fontWeight: 900 }}>
            {!compare
              ? t('exam.firstAttempt')
              : compare.delta > 0
                ? `📈 ${t('exam.compareUp', { n: compare.delta, p: compare.prevPct })}`
                : compare.delta < 0
                  ? `📉 ${t('exam.compareDown', { n: Math.abs(compare.delta), p: compare.prevPct })}`
                  : `➡️ ${t('exam.compareSame', { p: compare.prevPct })}`}
          </b>
          <p className="tiny muted" style={{ marginTop: 6 }}>
            {t('exam.passNote', { n: r.config.passPct })}
          </p>
        </div>

        {/* Pecahan mengikut subjek */}
        <p className="section-title">📚 {t('exam.bySubject')}</p>
        <div className="card">
          <BarList
            rows={score.bySubject.map((s) => ({
              label: `${subjectById(s.subject).emoji} ${subjectName(lang, s.subject, subjectById(s.subject).name)}`,
              value: s.pct,
              colour: gradeColour(s.pct),
              suffix: '%',
            }))}
          />
        </div>

        {/* Pecahan mengikut topik */}
        <p className="section-title">🗂️ {t('exam.byTopic')}</p>
        <div className="card">
          <BarList
            rows={score.items.map((it) => {
              const p = it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0;
              return {
                label: `${subjectById(it.subject).emoji} ${it.title}`,
                value: p,
                colour: gradeColour(p),
                suffix: '%',
              };
            })}
          />
        </div>

        {/* Semakan jawapan penuh */}
        <button
          type="button"
          className="btn btn-ghost btn-block"
          style={{ marginTop: 18 }}
          onClick={() => {
            sound.play('pop');
            setShowReview((v) => !v);
          }}
        >
          {showReview ? `🙈 ${t('exam.hideReview')}` : `🔍 ${t('exam.showReview')}`}
        </button>

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
                      <b style={{ color: 'var(--danger)' }}>{a.given}</b> →{' '}
                      <b style={{ color: 'var(--success)' }}>{a.correct}</b>
                    </small>
                  ) : (
                    <small>{a.correct}</small>
                  )}
                  {a.topicTitle ? <small className="muted">{a.topicTitle}</small> : null}
                  <small style={{ marginTop: 4 }}>💡 {a.explanation}</small>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="stack" style={{ marginTop: 18 }}>
          <Btn
            block
            variant="accent"
            onClick={() => {
              sound.play('levelup');
              go({ screen: 'mockExam', examSeed: Math.floor(Math.random() * 1e9) });
            }}
          >
            🔄 {t('exam.retake')}
          </Btn>
          <Btn block variant="ghost" onClick={() => go({ screen: 'examTips' })}>
            💡 {t('exam.seeTips')}
          </Btn>
          <Btn block variant="ghost" onClick={() => go({ screen: 'progress' })}>
            📊 {t('nav.progress')}
          </Btn>
          <Btn block variant="ghost" onClick={() => go({ screen: 'home' })}>
            🏠 {t('result.backHome')}
          </Btn>
        </div>
      </div>
    </div>
  );
}
