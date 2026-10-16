/** Skrin latihan: jana soalan rawak, kumpul jawapan, papar keputusan. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { generateQuestions, topicById, ALL_TOPICS, topicsFor } from '../data/catalog';
import { subjectById } from '../data/subjects';
import { yearLabel } from '../lib/i18n';
import { QuestionView, type AnswerState } from '../components/QuestionView';
import { Btn, Confetti, Sheet, TopBar } from '../components/ui';
import { sound, voice } from '../lib/audio';
import type { Question } from '../data/types';

/** Bilangan soalan setiap sesi latihan. */
const QUESTION_COUNT = 8;

export function QuizScreen() {
  const { nav, go, back, recordAttempt, settings, profile, lang } = useStore();
  const t = useT();

  const [nonce] = useState(() => Math.floor(Math.random() * 1e9));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [startedAt] = useState(() => Date.now());
  const [showHint, setShowHint] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [retries] = useState(0);

  // Jana set soalan sekali sahaja untuk sesi ini.
  const questions: Question[] = useMemo(() => {
    if (nav.quick) {
      const out: Question[] = [];
      const per = Math.max(1, Math.ceil(QUESTION_COUNT / Math.max(nav.quick.topicIds.length, 1)));
      let k = 0;
      for (const id of nav.quick.topicIds) {
        out.push(...generateQuestions(id, per, nonce + k * 7919));
        k += 1;
      }
      return out.slice(0, QUESTION_COUNT);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    if (!nav.topicId) return [];
    return generateQuestions(nav.topicId, QUESTION_COUNT, nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.topicId, nav.quick, nonce]);

  const topic = topicById(nav.topicId ?? '');
  const meta = topic ? subjectById(topic.subject) : null;

  const q = questions[index];
  const result = q ? (answers[q.id] ?? null) : null;
  const done = Object.keys(answers).length;

  const finish = useCallback(
    (finalAnswers: Record<string, AnswerState>) => {
      const correct = Object.values(finalAnswers).filter((a) => a.ok).length;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      const subject = topic?.subject ?? nav.subject ?? 'matematik';
      const title = nav.quick ? nav.quick.label : topic?.title ?? 'Latihan';
      const { stars, points, badges } = recordAttempt({
        year: (topic?.year ?? profile?.year ?? 1),
        subject,
        topicId: nav.topicId ?? (nav.quick?.topicIds[0] ?? 'quick'),
        topicTitle: title,
        correct,
        total: questions.length,
        seconds,
        retries,
      });

      const review = questions.map((qq) => {
        const a = finalAnswers[qq.id];
        return {
          questionId: qq.id,
          prompt: qq.prompt,
          correct: describeAnswer(qq),
          given: a?.given ?? '—',
          ok: Boolean(a?.ok),
          explanation: qq.explanation,
        };
      });

      sound.play(correct === questions.length ? 'win' : correct / questions.length >= 0.6 ? 'levelup' : 'tap');

      go({
        screen: 'result',
        subject,
        topicId: nav.topicId,
        from: nav.from ?? 'topics',
        result: {
          topicId: nav.topicId ?? 'quick',
          topicTitle: title,
          subject,
          year: topic?.year ?? profile?.year ?? 1,
          correct,
          total: questions.length,
          seconds,
          answers: review,
          stars,
          points,
          badges,
          perfect: correct === questions.length && questions.length > 0,
        },
      });
    },
    [recordAttempt, questions, startedAt, nav, topic, profile, retries, go],
  );

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

  // Baca soalan dengan kuat apabila ditukar.
  useEffect(() => {
    if (!settings.voice || !q) return;
    const langVoice: 'ms' | 'en' = topic?.subject === 'english' ? 'en' : 'ms';
    const timer = window.setTimeout(() => voice.speak(q.speak ?? q.prompt, langVoice), 240);
    return () => window.clearTimeout(timer);
  }, [q, settings.voice, topic?.subject]);

  if (questions.length === 0 || !q) {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('quiz.question')} />
        <div className="screen-scroll">
          <p className="muted center">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

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
          <div className="card" style={{ background: 'var(--accent-soft)' }}>
            <p className="tiny">💡 {q.hint}</p>
          </div>
        </div>
      ) : null}

      <Confetti fireKey={done >= questions.length ? 1 : 0} count={40} />

      <Sheet open={confirmExit} onClose={() => setConfirmExit(false)} title={t('quiz.exitConfirm')}>
        <div className="stack">
          <Btn block variant="ghost" onClick={() => setConfirmExit(false)}>
            {t('quiz.stay')}
          </Btn>
          <Btn block variant="danger" onClick={() => back()}>
            {t('quiz.leave')}
          </Btn>
        </div>
      </Sheet>

      {topic && meta ? (
        <div style={{ position: 'fixed', bottom: 4, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <span className="chip" style={{ opacity: 0.6, fontSize: '0.62rem' }}>
            {meta.emoji} {topic.title} • {yearLabel(lang, topic.year)} • {lang.toUpperCase()}
          </span>
        </div>
      ) : null}
    </>
  );
}

/** Perihalkan jawapan betul untuk semakan. */
function describeAnswer(q: Question): string {
  if (q.kind === 'order' && Array.isArray(q.answer)) return q.answer.join(' → ');
  if (q.kind === 'match' && q.pairs) return q.pairs.map((p) => `${p.left} → ${p.right}`).join('; ');
  return String(q.answer);
}

/** Bina soalan latihan pantas merentas subjek untuk tahun murid. */
export function buildQuick(topicIds: string[], label: string) {
  return { topicIds, label };
}

export { ALL_TOPICS, topicsFor };
