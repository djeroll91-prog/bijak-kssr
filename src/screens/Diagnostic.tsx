/**
 * Ujian diagnosis: mengukur penguasaan murid pada beberapa topik terpilih
 * supaya pelan belajar boleh dibina daripada kelemahan sebenar.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { generateQuestions, topicById } from '../data/catalog';
import { subjectById } from '../data/subjects';
import { subjectName, yearLabel } from '../lib/i18n';
import { QuestionView, type AnswerState } from '../components/QuestionView';
import { BarList, Btn, Confetti, EmptyState, ProgressRing, Sheet, TopBar } from '../components/ui';
import { sound, voice } from '../lib/audio';
import { DIAGNOSTIC_PER_TOPIC, diagnosticSummary, pickDiagnosticTopics } from '../lib/plan';
import type { DiagnosticItem, Question } from '../data/types';

type Phase = 'intro' | 'run' | 'done';

export function DiagnosticScreen() {
  const { profile, nav, go, back, settings, saveDiagnostic, lang, showToast } = useStore();
  const t = useT();

  const [phase, setPhase] = useState<Phase>('intro');
  const [nonce] = useState(() => Math.floor(Math.random() * 1e9));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [items, setItems] = useState<DiagnosticItem[]>([]);

  const year = profile?.year ?? 1;

  // Topik dan soalan dijana sekali sahaja untuk sesi ini.
  const topics = useMemo(() => pickDiagnosticTopics(year, nonce), [year, nonce]);

  const { questions, topicOf } = useMemo(() => {
    const list: Question[] = [];
    const map = new Map<string, string>();
    topics.forEach((topic, k) => {
      for (const q of generateQuestions(topic.id, DIAGNOSTIC_PER_TOPIC, nonce + k * 7919)) {
        map.set(q.id, topic.id);
        list.push(q);
      }
    });
    // Selang-seli supaya soalan satu topik tidak berturut-turut.
    const interleaved: Question[] = [];
    const buckets = topics.map((topic) =>
      list.filter((q) => map.get(q.id) === topic.id),
    );
    for (let i = 0; i < DIAGNOSTIC_PER_TOPIC; i += 1) {
      for (const bucket of buckets) if (bucket[i]) interleaved.push(bucket[i]);
    }
    return { questions: interleaved, topicOf: map };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics, nonce]);

  const q = questions[index];
  const result = q ? (answers[q.id] ?? null) : null;

  const start = () => {
    sound.play('levelup');
    setPhase('run');
    setIndex(0);
    setAnswers({});
    setStartedAt(Date.now());
  };

  const handleAnswer = (a: AnswerState) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: a }));
    setShowHint(false);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      finish(answers);
      return;
    }
    sound.play('whoosh');
    setIndex((i) => i + 1);
    setShowHint(false);
  };

  const finish = useCallback(
    (finalAnswers: Record<string, AnswerState>) => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      const perTopic = new Map<string, { correct: number; total: number }>();
      for (const qq of questions) {
        const topicId = topicOf.get(qq.id);
        if (!topicId) continue;
        const cur = perTopic.get(topicId) ?? { correct: 0, total: 0 };
        cur.total += 1;
        if (finalAnswers[qq.id]?.ok) cur.correct += 1;
        perTopic.set(topicId, cur);
      }
      const built: DiagnosticItem[] = [...perTopic.entries()].map(([topicId, v]) => {
        const topic = topicById(topicId);
        return {
          topicId,
          subject: topic?.subject ?? 'matematik',
          title: topic?.title ?? topicId,
          correct: v.correct,
          total: v.total,
        };
      });
      const totalCorrect = built.reduce((s, it) => s + it.correct, 0);
      const totalQuestions = built.reduce((s, it) => s + it.total, 0);
      sound.play(totalCorrect === totalQuestions ? 'win' : 'star');
      saveDiagnostic(built, seconds);
      setItems(built);
      setPhase('done');
      showToast(t('diag.saved'));
    },
    [questions, topicOf, startedAt, saveDiagnostic, showToast, t],
  );

  // Baca soalan dengan kuat apabila ditukar.
  useEffect(() => {
    if (phase !== 'run' || !settings.voice || !q) return;
    const topic = topicById(topicOf.get(q.id) ?? '');
    const langVoice: 'ms' | 'en' = topic?.subject === 'english' ? 'en' : 'ms';
    const timer = window.setTimeout(() => voice.speak(q.speak ?? q.prompt, langVoice), 240);
    return () => window.clearTimeout(timer);
  }, [phase, q, settings.voice, topicOf]);

  if (!profile) return null;

  if (topics.length === 0) {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('diag.title')} />
        <div className="screen-scroll">
          <EmptyState emoji="🧭" title={t('diag.noTopics')} desc={t('topics.tryFirst')} />
        </div>
      </div>
    );
  }

  /* ------------------------------ intro ------------------------------ */
  if (phase === 'intro') {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('diag.title')} subtitle={yearLabel(lang, year)} />
        <div className="screen-scroll">
          <div className="card hero-card animate-pop">
            <span className="hero-emoji" aria-hidden="true">
              🧭
            </span>
            <h3>{t('diag.introTitle')}</h3>
            <p className="tiny muted">{t('diag.introDesc')}</p>
            <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
              <span className="chip chip-brand">📚 {topics.length} {t('subjects.topics')}</span>
              <span className="chip">❓ {questions.length} {t('topics.questions')}</span>
              <span className="chip">⏱️ ~{Math.max(3, Math.round(questions.length * 0.5))} {t('progress.minutes')}</span>
            </div>
          </div>

          <p className="section-title">{t('diag.willAsk')}</p>
          <div className="stack stagger">
            {topics.map((topic) => (
              <div key={topic.id} className="topic-item animate-slide" data-static="true">
                <span
                  className="badge"
                  aria-hidden="true"
                  style={{ background: `${subjectById(topic.subject).color}1a` }}
                >
                  {topic.emoji}
                </span>
                <span className="grow">
                  <b>{topic.title}</b>
                  <small>{subjectName(lang, topic.subject, subjectById(topic.subject).name)}</small>
                </span>
              </div>
            ))}
          </div>

          <div className="stack" style={{ marginTop: 18 }}>
            <Btn block variant="accent" onClick={start}>
              🚀 {t('diag.start')}
            </Btn>
            <Btn block variant="ghost" onClick={back}>
              ← {t('common.back')}
            </Btn>
          </div>
          <p className="tiny muted center" style={{ marginTop: 12 }}>
            💚 {t('diag.offlineNote')}
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------- run ------------------------------- */
  if (phase === 'run') {
    if (!q) {
      return (
        <div className="screen">
          <TopBar onBack={back} title={t('diag.title')} />
          <div className="screen-scroll">
            <p className="muted center">{t('common.loading')}</p>
          </div>
        </div>
      );
    }
    const topic = topicById(topicOf.get(q.id) ?? '');
    return (
      <>
        <QuestionView
          q={q}
          index={index}
          total={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onHint={() => setShowHint(true)}
          onExit={() => setConfirmExit(true)}
          result={result}
          voiceOn={settings.voice}
          voiceLang={topic?.subject === 'english' ? 'en' : 'ms'}
          t={t}
        />

        {showHint && q.hint && !result ? (
          <div style={{ position: 'fixed', left: 16, right: 16, bottom: 90, zIndex: 70 }}>
            <div className="card animate-pop" style={{ background: 'var(--accent-soft)' }}>
              <p className="tiny">💡 {q.hint}</p>
            </div>
          </div>
        ) : null}

        <Confetti fireKey={index + 1 >= questions.length ? 1 : 0} count={30} />

        <Sheet open={confirmExit} onClose={() => setConfirmExit(false)} title={t('quiz.exitConfirm')}>
          <div className="stack">
            <Btn block variant="ghost" onClick={() => setConfirmExit(false)}>
              {t('quiz.stay')}
            </Btn>
            <Btn block variant="danger" onClick={() => setPhase('intro')}>
              {t('quiz.leave')}
            </Btn>
          </div>
        </Sheet>

        {topic ? (
          <div className="quiz-tag">
            <span className="chip" style={{ opacity: 0.65, fontSize: '0.62rem' }}>
              🧭 {t('diag.mode')} • {topic.title}
            </span>
          </div>
        ) : null}
      </>
    );
  }

  /* ------------------------------- done ------------------------------ */
  const summary = diagnosticSummary({
    ts: Date.now(),
    year,
    items,
    correct: items.reduce((s, it) => s + it.correct, 0),
    total: items.reduce((s, it) => s + it.total, 0),
    seconds: 0,
  });

  return (
    <div className="screen">
      <Confetti fireKey={2} count={summary && summary.pct >= 80 ? 90 : 50} />
      <TopBar onBack={back} title={t('diag.resultTitle')} subtitle={yearLabel(lang, year)} />
      <div className="screen-scroll">
        <div className="result-hero" data-tier={summary && summary.pct >= 80 ? 'silver' : summary && summary.pct >= 60 ? 'bronze' : 'plain'}>
          <span style={{ fontSize: '2.6rem', display: 'block' }} aria-hidden="true">
            🧭
          </span>
          <h2>{summary && summary.pct >= 80 ? t('diag.doneGreat') : t('diag.doneOk')}</h2>
          <div className="score-big">{summary?.pct ?? 0}%</div>
          <p style={{ fontSize: '0.88rem', fontWeight: 800, opacity: 0.95 }}>
            {items.reduce((s, it) => s + it.correct, 0)} {t('result.correctOf')}{' '}
            {items.reduce((s, it) => s + it.total, 0)}
          </p>
        </div>

        <p className="section-title">{t('diag.byTopic')}</p>
        <div className="card">
          <BarList
            rows={items.map((it) => {
              const pct = it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0;
              return {
                label: `${topicById(it.topicId)?.emoji ?? '📘'} ${it.title}`,
                value: pct,
                colour: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warn)' : 'var(--danger)',
                suffix: '%',
              };
            })}
          />
        </div>

        {summary && summary.weakItems.length > 0 ? (
          <>
            <p className="section-title">{t('diag.focusOn')}</p>
            <div className="stack stagger">
              {summary.weakItems.map((it) => (
                <div key={it.topicId} className="topic-item animate-slide" data-static="true">
                  <span className="badge" aria-hidden="true" style={{ background: 'var(--warn-soft)' }}>
                    🎯
                  </span>
                  <span className="grow">
                    <b>{it.title}</b>
                    <small>
                      {it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0}% •{' '}
                      {subjectName(lang, it.subject, subjectById(it.subject).name)}
                    </small>
                  </span>
                  <ProgressRing
                    value={it.total > 0 ? (it.correct / it.total) * 100 : 0}
                    size={38}
                    stroke={4}
                    colour="var(--warn)"
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className="stack" style={{ marginTop: 18 }}>
          <Btn
            block
            variant="accent"
            onClick={() => {
              sound.play('levelup');
              go({ screen: 'plan' });
            }}
          >
            🗺️ {t('diag.seePlan')}
          </Btn>
          <Btn block variant="ghost" onClick={() => setPhase('intro')}>
            🔄 {t('diag.retake')}
          </Btn>
          <Btn block variant="ghost" onClick={() => go({ screen: 'home' })}>
            🏠 {t('result.backHome')}
          </Btn>
        </div>
        <span hidden>{nav.screen}</span>
      </div>
    </div>
  );
}
