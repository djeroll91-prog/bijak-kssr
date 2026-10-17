/**
 * Peperiksaan percubaan: satu kertas penuh merangkumi semua topik tahun murid.
 *
 * Fasa: intro -> run (berpemasa) -> review (semak jawapan) -> hantar.
 * Jawapan disimpan supaya murid boleh lompat soalan dan kembali kemudian.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore, useT } from '../state/store';
import { subjectById } from '../data/subjects';
import { subjectsForYear } from '../data/catalog';
import { subjectName, yearLabel } from '../lib/i18n';
import { QuestionView, type AnswerState } from '../components/QuestionView';
import { Btn, Confetti, EmptyState, ProgressRing, Sheet, TopBar } from '../components/ui';
import { sound, voice } from '../lib/audio';
import {
  buildExamPaper,
  compareWithPrevious,
  examConfig,
  formatClock,
  scoreExam,
  EXAM_TOPIC_ID,
} from '../lib/exam';
import { typedCorrect } from '../lib/generators/written';
import type { ExamResult } from '../state/store';
import type { Question, SubjectId } from '../data/types';

type Phase = 'intro' | 'run' | 'review';

/** Ambang detik amaran (saat) sebelum masa tamat. */
const URGENT_SECONDS = 30;
const CRITICAL_SECONDS = 10;

export function MockExamScreen() {
  const { profile, nav, go, back, settings, saveExam, lang, showToast } = useStore();
  const t = useT();

  const year = profile?.year ?? 1;
  const [phase, setPhase] = useState<Phase>('intro');
  // Benih dikunci untuk sesi ini; skrin dimuat semula untuk percubaan baharu.
  const [nonce, setNonce] = useState(() => nav.examSeed ?? Math.floor(Math.random() * 1e9));
  // Satu kertas = satu subjek. Murid memilih subjek sebelum mula.
  const available = useMemo(() => subjectsForYear(year), [year]);
  const [subject, setSubject] = useState<SubjectId>(
    () => nav.examSubject ?? available[0] ?? 'matematik',
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const config = useMemo(() => examConfig(year), [year]);
  const paper = useMemo(
    () => buildExamPaper(year, subject, nonce, profile?.lastExamPrompts?.[subject] ?? []),
    [year, subject, nonce, profile],
  );
  const questions = paper.questions;

  const answeredCount = Object.keys(answers).length;
  const q: Question | undefined = questions[index];
  const current: AnswerState | null = q ? (answers[q.id] ?? null) : null;

  /** Tukar subjek bermakna kertas baharu; buang jawapan percubaan lama. */
  const pickSubject = (s: SubjectId) => {
    if (s === subject) return;
    sound.play('pop');
    setSubject(s);
    setNonce(Math.floor(Math.random() * 1e9));
    setAnswers({});
    setIndex(0);
  };

  /* ---------------------------------------------------------------- */
  /* Pemasa                                                            */
  /* ---------------------------------------------------------------- */

  const finishRef = useRef<(auto: boolean) => void>(() => {});
  const lastTickRef = useRef(-1);

  useEffect(() => {
    if (phase !== 'run') return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          finishRef.current(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Bunyi detik pada saat-saat akhir supaya murid sedar masa hampir tamat.
  useEffect(() => {
    if (phase !== 'run' || secondsLeft > URGENT_SECONDS) return;
    if (secondsLeft === lastTickRef.current) return;
    lastTickRef.current = secondsLeft;
    if (secondsLeft <= CRITICAL_SECONDS) sound.tickUrgent();
    else sound.play('tick');
  }, [phase, secondsLeft]);

  /* ---------------------------------------------------------------- */
  /* Tindakan                                                          */
  /* ---------------------------------------------------------------- */

  const start = () => {
    sound.play('levelup');
    setPhase('run');
    setIndex(0);
    setAnswers({});
    setStartedAt(Date.now());
    setSecondsLeft(config.minutes * 60);
    setTimeUp(false);
    if (settings.voice) {
      voice.speak(
        t('exam.speakStart', { n: config.minutes, q: questions.length }),
        'ms',
      );
    }
  };

  const handleAnswer = (a: AnswerState) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: a }));
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setConfirmSubmit(true);
      return;
    }
    sound.play('whoosh');
    setIndex((i) => i + 1);
  };

  const jumpTo = (i: number) => {
    sound.play('pop');
    setIndex(i);
  };

  const finish = useCallback(
    (auto: boolean) => {
      const seconds = startedAt > 0 ? Math.round((Date.now() - startedAt) / 1000) : 0;
      const score = scoreExam(paper, answers);
      const { stars, points } = {
        stars: score.pct >= 100 ? 3 : score.pct >= 80 ? 2 : score.pct >= 60 ? 1 : 0,
        points: score.correct * 10,
      };
      const ts = Date.now();
      const compare = compareWithPrevious(
        profile?.attempts ?? [],
        EXAM_TOPIC_ID,
        year,
        { ts, pct: score.pct },
      );
      const prevCount = (profile?.attempts ?? []).filter(
        (a) => a.topicId === EXAM_TOPIC_ID && a.year === year,
      ).length;

      const review = questions.map((qq) => {
        const a = answers[qq.id];
        const topic = paper.topicOf.get(qq.id);
        // Semak semula soalan taip supaya paparan semakan sepadan dengan markah.
        const ok = qq.kind === 'shorttext'
          ? typedCorrect(qq, a?.given ?? '')
          : Boolean(a?.ok);
        return {
          questionId: qq.id,
          prompt: qq.prompt,
          correct: describeAnswer(qq),
          given: a?.given ?? '—',
          ok,
          explanation: qq.explanation,
          topicTitle: topic?.title ?? '',
        };
      });

      const result: ExamResult = {
        year,
        seed: nonce,
        ts,
        seconds,
        config,
        score,
        stars,
        points,
        badges: [],
        answers: review,
        compare,
        attemptNo: prevCount + 1,
      };

      saveExam(result);
      setTimeUp(auto);
      if (auto) {
        sound.play('wrong');
        if (settings.voice) voice.speak(t('exam.speakTimeUp'), 'ms');
      } else {
        sound.play(score.pct >= 80 ? 'win' : 'star');
      }
      showToast(t('exam.saved'));
      go({ screen: 'examResult', exam: result, from: 'mockExam' });
    },
    [
      startedAt, paper, answers, profile, year, nonce, config,
      saveExam, go, showToast, t, questions, settings.voice,
    ],
  );

  finishRef.current = finish;

  /* ---------------------------------------------------------------- */
  /* Baca soalan dengan suara                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (phase !== 'run' || !settings.voice || !q) return;
    const topic = paper.topicOf.get(q.id);
    const langVoice: 'ms' | 'en' = topic?.subject === 'english' ? 'en' : 'ms';
    const timer = window.setTimeout(() => voice.speak(q.speak ?? q.prompt, langVoice), 260);
    return () => window.clearTimeout(timer);
  }, [phase, q, settings.voice, paper]);

  if (!profile) return null;

  /* ---------------------------------------------------------------- */
  /* Fasa: intro                                                       */
  /* ---------------------------------------------------------------- */

  if (phase === 'intro') {
    const meta = subjectById(subject);
    if (questions.length === 0) {
      return (
        <div className="screen">
          <TopBar onBack={back} title={t('exam.title')} subtitle={yearLabel(lang, year)} />
          <div className="screen-scroll">
            <EmptyState emoji="📝" title={t('exam.noQuestions')} desc={t('topics.tryFirst')} />
          </div>
        </div>
      );
    }
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('exam.title')} subtitle={yearLabel(lang, year)} />
        <div className="screen-scroll">
          <p className="section-title">{t('exam.introTitle')}</p>
          <p className="section-title">{t('exam.pickSubject')}</p>
          <div className="subject-picker">
            {available.map((s) => {
              const m = subjectById(s);
              return (
                <button
                  key={s}
                  type="button"
                  className="subject-chip"
                  data-active={s === subject ? 'true' : 'false'}
                  style={{ borderColor: s === subject ? m.color : undefined }}
                  onClick={() => pickSubject(s)}
                >
                  <span aria-hidden="true">{m.emoji}</span>
                  <span>{subjectName(lang, s, m.name)}</span>
                </button>
              );
            })}
          </div>

          <div className="card hero-card animate-pop" style={{ marginTop: 14 }}>
            <span className="hero-emoji" aria-hidden="true">{meta.emoji}</span>
            <h3>{subjectName(lang, subject, meta.name)}</h3>
            <p className="tiny muted">{t('exam.introDesc')}</p>
            <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
              <span className="chip chip-brand">❓ {t('exam.questionsChip', { n: questions.length })}</span>
              <span className="chip">🅰️ {t('exam.partAChip', { n: config.partA })}</span>
              <span className="chip">✍️ {t('exam.partBChip', { n: config.partB })}</span>
              <span className="chip">⏱️ {t('exam.minutesChip', { n: config.minutes })}</span>
              <span className="chip">🗂️ {t('exam.topicsChip', { n: paper.topics.length })}</span>
              <span className="chip chip-success">🎯 {t('exam.passChip', { n: config.passPct })}</span>
            </div>
          </div>

          <p className="section-title">{t('exam.willAsk')}</p>
          <div className="stack stagger">
            {paper.topics.map((x) => (
              <div key={x.id} className="topic-item" data-static="true">
                <span
                  className="badge"
                  aria-hidden="true"
                  style={{ background: `${meta.color}1a` }}
                >
                  {meta.emoji}
                </span>
                <span className="grow">
                  <b>{x.title}</b>
                  <small>{x.code}</small>
                </span>
              </div>
            ))}
          </div>

          <p className="section-title">{t('exam.rules')}</p>
          <div className="card">
            <ul className="stack" style={{ gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
              {(['exam.rule1', 'exam.rule2', 'exam.rule3', 'exam.rule4', 'exam.rule5'] as const).map((k, i) => (
                <li key={k} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span aria-hidden="true">{['⏱️', '↩️', '🙈', '🔍', '✍️'][i]}</span>
                  <span className="tiny">{t(k)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="stack" style={{ marginTop: 18 }}>
            <Btn block variant="accent" onClick={start}>🚀 {t('exam.start')}</Btn>
            <Btn block variant="ghost" onClick={() => go({ screen: 'examTips' })}>
              💡 {t('exam.seeTips')}
            </Btn>
            <Btn block variant="ghost" onClick={back}>← {t('common.back')}</Btn>
          </div>
          <p className="tiny muted center" style={{ marginTop: 12 }}>💚 {t('exam.offlineNote')}</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Fasa: review (semak sebelum hantar)                               */
  /* ---------------------------------------------------------------- */

  if (phase === 'review') {
    const unanswered = questions.length - answeredCount;
    return (
      <div className="screen">
        <TopBar
          onBack={() => setPhase('run')}
          title={t('exam.review')}
          subtitle={t('exam.answered', { a: answeredCount, b: questions.length })}
        />
        <div className="screen-scroll">
          <div className="card">
            <div className="row-between">
              <div className="row" style={{ gap: 12 }}>
                <ProgressRing
                  value={(answeredCount / Math.max(1, questions.length)) * 100}
                  size={52}
                />
                <div>
                  <b style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                    {t('exam.answered', { a: answeredCount, b: questions.length })}
                  </b>
                  <p className="tiny muted">
                    {unanswered > 0
                      ? t('exam.submitNote', { n: unanswered })
                      : t('exam.submitAllDone')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="section-title">{t('exam.jump')}</p>
          <div className="exam-jump-grid">
            {questions.map((qq, i) => {
              const done = Boolean(answers[qq.id]);
              const ok = answers[qq.id]?.ok;
              return (
                <button
                  key={qq.id}
                  type="button"
                  className="exam-jump"
                  data-done={done ? 'true' : 'false'}
                  data-ok={done ? (ok ? 'true' : 'false') : undefined}
                  data-current={i === index ? 'true' : undefined}
                  data-part={qq.part}
                  onClick={() => {
                    jumpTo(i);
                    setPhase('run');
                  }}
                  aria-label={`${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="stack" style={{ marginTop: 18 }}>
            <Btn block variant="accent" onClick={() => setConfirmSubmit(true)}>
              ✅ {t('exam.submit')}
            </Btn>
            <Btn block variant="ghost" onClick={() => setPhase('run')}>
              ← {t('exam.backToExam')}
            </Btn>
          </div>
        </div>

        <Sheet
          open={confirmSubmit}
          onClose={() => setConfirmSubmit(false)}
          title={t('exam.submitConfirm')}
        >
          <p className="tiny muted" style={{ marginBottom: 12 }}>
            {unanswered > 0 ? t('exam.submitNote', { n: unanswered }) : t('exam.submitAllDone')}
          </p>
          <div className="stack">
            <Btn block variant="accent" onClick={() => { setConfirmSubmit(false); finish(false); }}>
              ✅ {t('exam.submit')}
            </Btn>
            <Btn block variant="ghost" onClick={() => setConfirmSubmit(false)}>
              {t('quiz.stay')}
            </Btn>
          </div>
        </Sheet>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Fasa: run (peperiksaan berpemasa)                                 */
  /* ---------------------------------------------------------------- */

  const topic = q ? paper.topicOf.get(q.id) : undefined;
  const urgent = secondsLeft <= URGENT_SECONDS;
  const critical = secondsLeft <= CRITICAL_SECONDS;

  return (
    <>
      <QuestionView
        q={q}
        index={index}
        total={questions.length}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onHint={() => showToast(t('exam.rule3'))}
        onExit={() => setConfirmExit(true)}
        result={current}
        voiceOn={settings.voice}
        voiceLang={topic?.subject === 'english' ? 'en' : 'ms'}
        t={t}
      />

      {/* HUD pemasa: terapung di atas skrin supaya sentiasa kelihatan. */}
      <div className="exam-hud">
        <span className="chip" data-tone={critical ? 'danger' : urgent ? 'warn' : 'brand'}>
          ⏱️ {formatClock(secondsLeft)}
        </span>
        <span className="chip">
          {q?.part === 'B'
            ? `✍️ ${t('exam.partB')}`
            : `🅰️ ${t('exam.partA')}`}
        </span>
        <span className="chip">
          {t('exam.answered', { a: answeredCount, b: questions.length })}
        </span>
      </div>

      <Confetti fireKey={timeUp ? 1 : 0} count={40} />

      <Sheet open={confirmExit} onClose={() => setConfirmExit(false)} title={t('quiz.exitConfirm')}>
        <div className="stack">
          <Btn block variant="ghost" onClick={() => setConfirmExit(false)}>{t('quiz.stay')}</Btn>
          <Btn block variant="danger" onClick={() => { setConfirmExit(false); setPhase('intro'); }}>
            {t('quiz.leave')}
          </Btn>
        </div>
      </Sheet>

      {topic ? (
        <div className="quiz-tag">
          <span className="chip" style={{ opacity: 0.65, fontSize: '0.62rem' }}>
            📝 {t('exam.title')} • {topic.title}
          </span>
        </div>
      ) : null}

      {/* Butang semak: muncul apabila semua soalan sudah dijawab. */}
      {answeredCount === questions.length ? (
        <div className="exam-review-fab">
          <Btn variant="accent" small onClick={() => setPhase('review')}>
            🔍 {t('exam.review')}
          </Btn>
        </div>
      ) : null}
    </>
  );
}

/** Bentuk jawapan yang betul sebagai teks, untuk paparan semakan. */
function describeAnswer(q: Question): string {
  if (q.kind === 'order' && Array.isArray(q.answer)) return q.answer.join(' → ');
  if (q.kind === 'match' && q.pairs) {
    return q.pairs.map((p) => `${p.left} → ${p.right}`).join('; ');
  }
  return String(q.answer);
}
