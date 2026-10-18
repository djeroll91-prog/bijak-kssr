/**
 * Skrin "Program Belajar": pelan 7 hari, tugasan hari ini, pemasa fokus
 * dan laluan terus ke latihan pemulihan.
 */

import { useEffect, useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { topicById } from '../data/catalog';
import { subjectById, gamesForSubject } from '../data/subjects';
import { yearLabel } from '../lib/i18n';
import { BarList, Btn, Chip, EmptyState, ProgressRing, Sheet, TopBar } from '../components/ui';
import { sound, voice } from '../lib/audio';
import {
  PLAN_DAYS,
  TASKS_PER_DAY,
  activeDayTasks,
  diagnosticRows,
  planIsStale,
  planProgress,
  planStreak,
} from '../lib/plan';
import type { PlanTask, PlanTaskKind } from '../data/types';

const KIND_META: Record<PlanTaskKind, { icon: string; key: string }> = {
  learn: { icon: '📖', key: 'plan.kindLearn' },
  practice: { icon: '✏️', key: 'plan.kindPractice' },
  remedial: { icon: '🎯', key: 'plan.kindRemedial' },
  game: { icon: '🎮', key: 'plan.kindGame' },
};

export function PlanScreen() {
  const {
    profile,
    go,
    back,
    generatePlan,
    completePlanTask,
    addFocusSeconds,
    clearPlan,
    showToast,
    lang,
    settings,
  } = useStore();
  const t = useT();
  const [confirmNew, setConfirmNew] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const plan = profile?.plan ?? null;
  const progress = useMemo(
    () => planProgress(plan, { dailyLimit: settings.dailyLimit !== false }),
    [plan, settings.dailyLimit],
  );
  const streak = useMemo(() => planStreak(plan), [plan]);
  const todayTasks = useMemo(
    () => activeDayTasks(plan, { dailyLimit: settings.dailyLimit !== false }),
    [plan, settings.dailyLimit],
  );
  const diagRows = useMemo(() => diagnosticRows(profile?.diagnostic), [profile?.diagnostic]);
  const stale = profile ? planIsStale(plan, profile.year) : false;

  // Pemasa fokus berjalan hanya semasa dihidupkan.
  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);

  if (!profile) return null;

  const startTask = (task: PlanTask) => {
    sound.play('pop');
    const topic = topicById(task.topicId);
    if (!topic) return;
    if (task.kind === 'learn') {
      go({ screen: 'notes', topicId: topic.id, subject: topic.subject, from: 'plan' });
      return;
    }
    if (task.kind === 'game') {
      const games = gamesForSubject(topic.subject, topic.year);
      const game = games[0];
      if (game) {
        go({ screen: 'game', gameId: game.id, subject: topic.subject, from: 'plan' });
        return;
      }
    }
    go({ screen: 'quiz', topicId: topic.id, subject: topic.subject, from: 'plan', planTaskId: task.id });
  };

  const toggleDone = (task: PlanTask) => {
    sound.play(task.done ? 'tap' : 'star');
    completePlanTask(task.id);
  };

  /* --------------------------- belum ada pelan --------------------------- */
  if (!plan || stale) {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('plan.title')} subtitle={profile.name} />
        <div className="screen-scroll">
          <EmptyState
            emoji="🗺️"
            title={stale && plan ? t('plan.staleTitle') : t('plan.noPlanTitle')}
            desc={t('plan.noPlanDesc')}
          />
          <div className="stack">
            <Btn
              block
              variant="accent"
              onClick={() => {
                sound.play('levelup');
                generatePlan();
                showToast(t('plan.generated'));
              }}
            >
              ✨ {plan ? t('plan.rebuild') : t('plan.create')}
            </Btn>
            <Btn block variant="ghost" onClick={() => go({ screen: 'diagnostic' })}>
              🧭 {t('diag.title')}
            </Btn>
          </div>
          <p className="tiny muted center" style={{ marginTop: 14 }}>
            💚 {t('diag.offlineNote')}
          </p>
        </div>
      </div>
    );
  }

  const dayDone = progress.dayComplete;

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={t('plan.title')}
        subtitle={`${profile.name} • ${yearLabel(lang, profile.year)}`}
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label={t('plan.newPlan')}
            onClick={() => {
              sound.play('tap');
              setConfirmNew(true);
            }}
          >
            🔄
          </button>
        }
      />
      <div className="screen-scroll">
        {/* Kemajuan pelan */}
        <div className="card animate-pop">
          <div className="row-between">
            <div className="row">
              <ProgressRing value={progress.pct} size={58} />
              <div>
                <b style={{ fontSize: '0.95rem', fontWeight: 900 }}>
                  {t('plan.dayOf', { n: progress.activeDay + 1, t: PLAN_DAYS })}
                </b>
                <p className="tiny muted">
                  {progress.done}/{progress.total} {t('plan.tasksDone')}
                </p>
              </div>
            </div>
            <div className="center">
              <b style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)' }}>
                🔥 {streak}
              </b>
              <p className="tiny muted">{t('plan.daysDone')}</p>
            </div>
          </div>

          <div className="plan-week" role="list">
            {Array.from({ length: PLAN_DAYS }, (_, d) => {
              const dayTasks = plan.tasks.filter((x) => x.dayIndex === d);
              const allDone = dayTasks.length > 0 && dayTasks.every((x) => x.done);
              const anyDone = dayTasks.some((x) => x.done);
              const state = allDone ? 'done' : d === progress.activeDay ? 'today' : anyDone ? 'part' : 'todo';
              return (
                <button
                  key={d}
                  type="button"
                  className="plan-day"
                  data-state={state}
                  role="listitem"
                  aria-label={t('plan.dayOf', { n: d + 1, t: PLAN_DAYS })}
                  onClick={() => {
                    sound.play('tap');
                    voice.speak(t('plan.dayOf', { n: d + 1, t: PLAN_DAYS }), lang);
                  }}
                >
                  <span className="d-num">{d + 1}</span>
                  <span className="d-dot" aria-hidden="true">
                    {allDone ? '✓' : anyDone ? '•' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tugasan hari ini */}
        <div className="row-between" style={{ marginTop: 18 }}>
          <p className="section-title" style={{ margin: 0 }}>
            {progress.waitingTomorrow
              ? t('daily.nextDay')
              : dayDone
                ? t('plan.allTodayDone')
                : t('plan.todayTasks')}
          </p>
          <Chip tone={dayDone ? 'success' : 'brand'}>
            {todayTasks.filter((x) => x.done).length}/{todayTasks.length || TASKS_PER_DAY}
          </Chip>
        </div>

        {/* Had sesi harian: sesi hari ini sudah siap, hari berikutnya tunggu esok. */}
        {progress.waitingTomorrow ? (
          <div className="card animate-pop daily-lock">
            <div className="daily-lock-emoji" aria-hidden="true">
              🌙
            </div>
            <b className="daily-lock-title">{t('daily.lockedTitle')}</b>
            <p className="muted" style={{ margin: '6px 0 0' }}>
              {t('daily.lockedDesc')}
            </p>
            <div className="daily-lock-when">
              <Chip tone="brand">⏰ {t('daily.opensTomorrow')}</Chip>
              <Chip tone="success">
                🔥 {streak} {t('plan.daysDone')}
              </Chip>
            </div>
            <p className="tiny muted" style={{ marginTop: 10 }}>
              {t('daily.streakNote')}
            </p>
            <p className="tiny muted" style={{ marginTop: 6 }}>
              {t('daily.seeYouTomorrow')}
            </p>
          </div>
        ) : (
          <div className="stack stagger">
            {todayTasks.map((task) => {
              const topic = topicById(task.topicId);
              if (!topic) return null;
              const meta = subjectById(topic.subject);
              const km = KIND_META[task.kind];
              return (
                <div key={task.id} className="plan-task animate-slide" data-done={task.done ? 'true' : 'false'}>
                  <button type="button" className="pt-check" aria-pressed={task.done} onClick={() => toggleDone(task)}>
                    {task.done ? '✓' : ''}
                  </button>
                  <button type="button" className="pt-main" onClick={() => startTask(task)}>
                    <span className="pt-emoji" aria-hidden="true" style={{ background: `${meta.color}1a` }}>
                      {topic.emoji}
                    </span>
                    <span className="grow">
                      <b>{topic.title}</b>
                      <small>
                        {km.icon} {t(km.key)} • ⏱️ {task.minutes} {t('progress.minutes')}
                      </small>
                    </span>
                    <span aria-hidden="true">{task.done ? '✅' : '›'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pemasa fokus */}
        <p className="section-title">{t('plan.focusTimer')}</p>
        <div className="card">
          <div className="row-between">
            <div className="row">
              <span className="focus-ring" data-on={timerOn ? 'true' : 'false'} aria-hidden="true">
                ⏱️
              </span>
              <div>
                <b style={{ fontSize: '1.05rem', fontWeight: 900 }}>
                  {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                </b>
                <p className="tiny muted">
                  {Math.round(((plan.lastFocusDate === todayIso() ? plan.focusSeconds : 0) + elapsed) / 60)}{' '}
                  {t('progress.minutes')} {t('plan.today')}
                </p>
              </div>
            </div>
            <Btn
              small
              variant={timerOn ? 'ghost' : 'accent'}
              onClick={() => {
                if (timerOn) {
                  sound.play('tap');
                  addFocusSeconds(elapsed);
                  setElapsed(0);
                  setTimerOn(false);
                  showToast(t('plan.focusSaved'));
                } else {
                  sound.play('levelup');
                  setTimerOn(true);
                }
              }}
            >
              {timerOn ? `⏸️ ${t('plan.pause')}` : `▶️ ${t('plan.start')}`}
            </Btn>
          </div>
        </div>

        {/* Keputusan diagnosis */}
        {diagRows.length > 0 ? (
          <>
            <p className="section-title">{t('diag.byTopic')}</p>
            <div className="card">
              <BarList
                rows={diagRows.map((r) => ({
                  label: `${topicById(r.topicId)?.emoji ?? '📘'} ${r.title}`,
                  value: r.pct,
                  colour: r.pct >= 80 ? 'var(--success)' : r.pct >= 60 ? 'var(--warn)' : 'var(--danger)',
                  suffix: '%',
                }))}
              />
              <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="chip chip-brand"
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
          </>
        ) : (
          <>
            <p className="section-title">{t('diag.title')}</p>
            <div className="card">
              <p className="tiny muted">{t('diag.encourage')}</p>
              <div style={{ marginTop: 12 }}>
                <Btn block variant="accent" onClick={() => go({ screen: 'diagnostic' })}>
                  🧭 {t('diag.start')}
                </Btn>
              </div>
            </div>
          </>
        )}

        {settings.motion ? (
          <p className="tiny muted center" style={{ marginTop: 14 }}>
            ✨ {t('plan.motionNote')}
          </p>
        ) : null}
      </div>

      <Sheet open={confirmNew} onClose={() => setConfirmNew(false)} title={t('plan.newPlan')}>
        <div className="stack">
          <p className="tiny muted">{t('plan.newPlanDesc')}</p>
          <Btn
            block
            variant="accent"
            onClick={() => {
              sound.play('levelup');
              generatePlan();
              setConfirmNew(false);
              showToast(t('plan.generated'));
            }}
          >
            ✨ {t('plan.rebuild')}
          </Btn>
          <Btn block variant="ghost" onClick={() => setConfirmNew(false)}>
            {t('common.cancel')}
          </Btn>
          <Btn
            block
            variant="danger"
            onClick={() => {
              sound.play('tap');
              clearPlan();
              setConfirmNew(false);
            }}
          >
            🗑️ {t('plan.deletePlan')}
          </Btn>
        </div>
      </Sheet>
    </div>
  );
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
