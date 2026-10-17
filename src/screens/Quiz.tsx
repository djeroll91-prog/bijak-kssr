/** Skrin latihan: jana soalan rawak, kumpul jawapan, papar keputusan. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { generateQuestions, topicById, ALL_TOPICS, topicsFor } from '../data/catalog';
import { subjectById } from '../data/subjects';
import { yearLabel } from '../lib/i18n';
import { QuestionView, type AnswerState } from '../components/QuestionView';
import { Btn, Confetti, Sheet, TopBar } from '../components/ui';
import { sound, voice } from '../lib/audio';
import type { Question, ReviewOutcome, Topic } from '../data/types';

/** Bilangan soalan setiap sesi latihan. */
const QUESTION_COUNT = 8;
/** Bilangan soalan bagi setiap topik dalam sesi ulangan berselang. */
const REVIEW_PER_TOPIC = 2;
/** Bilangan minimum soalan dalam sesi ulangan, walau sedikit topik. */
const REVIEW_MIN_QUESTIONS = 6;

export function QuizScreen() {
  const { nav, go, back, recordAttempt, settings, profile, lang, completePlanTask } = useStore();
  const t = useT();

  const [nonce] = useState(() => Math.floor(Math.random() * 1e9));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [startedAt] = useState(() => Date.now());
  const [showHint, setShowHint] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [retries] = useState(0);

  // Jana set soalan sekali sahaja untuk sesi ini. Sesi ulangan mencampur
  // beberapa topik (latihan berselang) supaya otak kena memilih strategi
  // setiap kali, bukan mengulang corak soalan yang sama.
  const { questions, topicOf } = useMemo(() => {
    const list: Question[] = [];
    const map = new Map<string, Topic>();
    const add = (topic: Topic, count: number, seed: number) => {
      for (const q of generateQuestions(topic.id, count, seed)) {
        list.push(q);
        map.set(q.id, topic);
      }
    };

    if (nav.review && nav.review.topicIds.length > 0) {
      // Satu topik sahaja akan terlalu singkat, jadi tambah soalan bagi setiap
      // topik sehingga sesi mencapai bilangan minimum.
      const ids = nav.review.topicIds;
      const per = Math.max(REVIEW_PER_TOPIC, Math.ceil(REVIEW_MIN_QUESTIONS / ids.length));
      ids.forEach((id, k) => {
        const topic = topicById(id);
        if (topic) add(topic, per, nonce + k * 7919);
      });
      return { questions: list, topicOf: map };
    }

    if (nav.quick) {
      const per = Math.max(1, Math.ceil(QUESTION_COUNT / Math.max(nav.quick.topicIds.length, 1)));
      nav.quick.topicIds.forEach((id, k) => {
        const topic = topicById(id);
        if (topic) add(topic, per, nonce + k * 7919);
      });
      return { questions: list.slice(0, QUESTION_COUNT), topicOf: map };
    }

    const topic = topicById(nav.topicId ?? '');
    if (topic) add(topic, QUESTION_COUNT, nonce);
    return { questions: list, topicOf: map };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.topicId, nav.quick, nav.review, nonce]);

  const topic = topicById(nav.topicId ?? '');
  const meta = topic ? subjectById(topic.subject) : null;

  const q = questions[index];
  const result = q ? (answers[q.id] ?? null) : null;
  const done = Object.keys(answers).length;

  const finish = useCallback(
    (finalAnswers: Record<string, AnswerState>) => {
      const correct = Object.values(finalAnswers).filter((a) => a.ok).length;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      const isReview = Boolean(nav.review && nav.review.topicIds.length > 0);
      const subject = topic?.subject ?? nav.subject ?? 'matematik';
      const title = isReview ? t('review.sessionTitle') : nav.quick ? nav.quick.label : topic?.title ?? 'Latihan';

      // Sesi ulangan merangkumi beberapa topik: kira markah setiap topik
      // supaya jadual ulangan dikemas kini dengan tepat.
      const outcomes: ReviewOutcome[] = [];
      if (isReview) {
        const byTopic = new Map<string, { correct: number; total: number }>();
        for (const qq of questions) {
          const tp = topicOf.get(qq.id);
          if (!tp) continue;
          const cur = byTopic.get(tp.id) ?? { correct: 0, total: 0 };
          cur.total += 1;
          if (finalAnswers[qq.id]?.ok) cur.correct += 1;
          byTopic.set(tp.id, cur);
        }
        for (const [topicId, s] of byTopic) {
          const tp = topicById(topicId);
          outcomes.push({
            topicId,
            subject: tp?.subject ?? subject,
            year: tp?.year ?? profile?.year ?? 1,
            correct: s.correct,
            total: s.total,
          });
        }
      }

      const { stars, points, badges } = recordAttempt(
        {
          year: (topic?.year ?? profile?.year ?? 1),
          subject,
          topicId: nav.topicId ?? (nav.review?.topicIds[0] ?? nav.quick?.topicIds[0] ?? 'quick'),
          topicTitle: title,
          correct,
          total: questions.length,
          seconds,
          retries,
        },
        isReview ? outcomes : undefined,
      );

      const review = questions.map((qq) => {
        const a = finalAnswers[qq.id];
        const tp = topicOf.get(qq.id);
        return {
          questionId: qq.id,
          prompt: tp && isReview ? `${qq.prompt} — ${tp.title}` : qq.prompt,
          correct: describeAnswer(qq),
          given: a?.given ?? '—',
          ok: Boolean(a?.ok),
          explanation: qq.explanation,
        };
      });

      sound.play(correct === questions.length ? 'win' : correct / questions.length >= 0.6 ? 'levelup' : 'tap');

      // Tandakan tugasan pelan sebagai siap apabila latihan selesai.
      if (nav.planTaskId) completePlanTask(nav.planTaskId);

      go({
        screen: 'result',
        subject,
        topicId: nav.topicId,
        from: nav.from ?? 'topics',
        result: {
          topicId: nav.topicId ?? (nav.review ? 'review' : 'quick'),
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
          reviewTopicIds: isReview ? [...new Set(questions.map((qq) => topicOf.get(qq.id)?.id).filter((x): x is string => Boolean(x)))] : undefined,
        },
      });
    },
    [recordAttempt, questions, topicOf, startedAt, nav, topic, profile, retries, go, completePlanTask, t],
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

  // Topik soalan semasa. Dalam sesi ulangan berselang, setiap soalan boleh
  // datang daripada topik berbeza, jadi label dan suara mesti ikut soalan.
  const qTopic = q ? topicOf.get(q.id) : undefined;
  const qMeta = qTopic ? subjectById(qTopic.subject) : meta;
  const voiceLangOf: 'ms' | 'en' = qTopic?.subject === 'english' ? 'en' : 'ms';

  // Baca soalan dengan kuat apabila ditukar.
  useEffect(() => {
    if (!settings.voice || !q) return;
    const timer = window.setTimeout(() => voice.speak(q.speak ?? q.prompt, voiceLangOf), 240);
    return () => window.clearTimeout(timer);
  }, [q, settings.voice, voiceLangOf]);

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
        voiceLang={voiceLangOf}
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

      {qTopic && qMeta ? (
        <div style={{ position: 'fixed', bottom: 4, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <span className="chip" style={{ opacity: 0.6, fontSize: '0.62rem' }}>
            {qMeta.emoji} {qTopic.title} • {yearLabel(lang, qTopic.year)} • {lang.toUpperCase()}
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
