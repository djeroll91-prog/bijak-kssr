/**
 * Laporan kemajuan untuk ibu bapa/guru. Boleh disalin, dikongsi
 * atau dicetak. Semua data kekal pada peranti murid.
 */

import { useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { SUBJECTS, subjectById } from '../data/subjects';
import { dayCount, subjectName, yearLabel } from '../lib/i18n';
import { BarList, Btn, Chip, ProgressRing, TopBar } from '../components/ui';
import { profileStats } from '../lib/storage';
import { diagnosticRows, topicScores, weakTopics, untriedTopics } from '../lib/plan';
import { sound } from '../lib/audio';
import { copyText, shareUrl } from '../lib/share';

export function ReportScreen() {
  const { profile, back, go, showToast, lang } = useStore();
  const t = useT();
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => (profile ? profileStats(profile) : null), [profile]);
  const scores = useMemo(() => (profile ? topicScores(profile) : new Map()), [profile]);
  const weak = useMemo(() => (profile ? weakTopics(profile) : []), [profile]);
  const untried = useMemo(() => (profile ? untriedTopics(profile) : []), [profile]);
  const diagRows = useMemo(() => diagnosticRows(profile?.diagnostic), [profile?.diagnostic]);

  const bySubject = useMemo(() => {
    if (!profile) return [];
    return SUBJECTS.map((s) => {
      const rel = profile.attempts.filter((a) => a.subject === s.id && a.total > 0);
      const avg =
        rel.length > 0
          ? Math.round(rel.reduce((sum, a) => sum + (a.correct / a.total) * 100, 0) / rel.length)
          : 0;
      return { id: s.id, name: subjectName(lang, s.id, s.name), emoji: s.emoji, colour: s.color, avg, count: rel.length };
    }).filter((x) => x.count > 0);
  }, [profile, lang]);

  const trend = useMemo(() => {
    if (!profile) return [];
    const recent = profile.attempts.slice(-5);
    if (recent.length < 2) return [];
    return recent.map((a, i) => ({
      label: `${i + 1}`,
      value: a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0,
    }));
  }, [profile]);

  if (!profile || !stats) return null;

  const buildText = (): string => {
    const lines: string[] = [];
    lines.push(`📄 ${t('report.title')} — ${t('app.name')}`);
    lines.push(`${profile.name} • ${yearLabel(lang, profile.year)}`);
    lines.push('');
    lines.push(`⭐ ${profile.stars}  🏅 ${profile.points}  🔥 ${dayCount(lang, profile.streakDays)}`);
    lines.push(`${t('progress.accuracy')}: ${stats.accuracy}% (${stats.correct}/${stats.questions})`);
    lines.push(`${t('progress.attempts')}: ${stats.total} • ${t('progress.minutes')}: ${stats.minutes}`);
    if (diagRows.length > 0) {
      lines.push('');
      lines.push(`${t('diag.title')}: ${diagRows.reduce((s, r) => s + r.correct, 0)}/${diagRows.reduce((s, r) => s + r.total, 0)}`);
      for (const r of diagRows) lines.push(`  • ${r.title}: ${r.pct}%`);
    }
    if (bySubject.length > 0) {
      lines.push('');
      lines.push(t('progress.bySubject'));
      for (const s of bySubject) lines.push(`  • ${s.name}: ${s.avg}%`);
    }
    if (weak.length > 0) {
      lines.push('');
      lines.push(`${t('report.needHelp')}:`);
      for (const topic of weak.slice(0, 5)) lines.push(`  • ${topic.title}`);
    }
    if (untried.length > 0) {
      lines.push('');
      lines.push(`${t('report.notTried')}: ${untried.length}`);
    }
    lines.push('');
    lines.push(`${t('report.nextSteps')}:`);
    for (const step of nextSteps(profile.year, weak.length, stats.accuracy, t)) lines.push(`  • ${step}`);
    lines.push('');
    lines.push(`🔗 ${shareUrl()}`);
    return lines.join('\n');
  };

  const doCopy = async () => {
    sound.play('pop');
    const ok = await copyText(buildText());
    setCopied(ok);
    showToast(ok ? t('report.copied') : t('report.copyFail'));
  };

  const doShare = async () => {
    sound.play('pop');
    const text = buildText();
    const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: t('report.title'), text });
        return;
      } catch {
        /* murid batal kongsi — jatuh balik ke salin */
      }
    }
    await doCopy();
  };

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={t('report.title')}
        subtitle={`${profile.name} • ${yearLabel(lang, profile.year)}`}
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label={t('report.print')}
            onClick={() => {
              sound.play('tap');
              window.print();
            }}
          >
            🖨️
          </button>
        }
      />
      <div className="screen-scroll">
        <div className="card animate-pop">
          <div className="row-between">
            <div className="row">
              <ProgressRing value={stats.accuracy} size={58} />
              <div>
                <b style={{ fontSize: '0.95rem', fontWeight: 900 }}>{t('report.summary')}</b>
                <p className="tiny muted">
                  {stats.correct}/{stats.questions} {t('report.questionsAnswered')}
                </p>
              </div>
            </div>
            <div className="center">
              <b style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)' }}>
                ⭐ {profile.stars}
              </b>
              <p className="tiny muted">🏅 {profile.points}</p>
            </div>
          </div>
          <div className="legend" style={{ marginTop: 14 }}>
            <span>
              <i style={{ background: 'var(--brand)' }} /> {stats.total} {t('progress.attempts')}
            </span>
            <span>
              <i style={{ background: 'var(--success)' }} /> {stats.perfect} {t('progress.perfect')}
            </span>
            <span>
              <i style={{ background: 'var(--info)' }} /> ⏱️ {stats.minutes} {t('progress.minutes')}
            </span>
            <span>
              <i style={{ background: 'var(--accent)' }} /> 🔥 {profile.streakDays}
            </span>
          </div>
        </div>

        {diagRows.length > 0 ? (
          <>
            <p className="section-title">🧭 {t('diag.title')}</p>
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

        {bySubject.length > 0 ? (
          <>
            <p className="section-title">{t('progress.bySubject')}</p>
            <div className="card">
              <BarList
                rows={bySubject.map((s) => ({
                  label: `${s.emoji} ${s.name}`,
                  value: s.avg,
                  colour: s.colour,
                  suffix: '%',
                }))}
              />
            </div>
          </>
        ) : null}

        {trend.length > 1 ? (
          <>
            <p className="section-title">{t('report.recentTrend')}</p>
            <div className="card">
              <BarList
                rows={trend.map((p) => ({
                  label: `${t('report.session')} ${p.label}`,
                  value: p.value,
                  colour: 'var(--brand)',
                  suffix: '%',
                }))}
              />
            </div>
          </>
        ) : null}

        <p className="section-title">🎯 {t('report.needHelp')}</p>
        <div className="card">
          {weak.length === 0 ? (
            <p className="tiny muted">
              {stats.total === 0 ? t('report.startFirst') : t('report.noWeak')}
            </p>
          ) : (
            <div className="stack stagger">
              {weak.slice(0, 6).map((topic) => {
                const score = scores.get(topic.id)?.avg ?? 0;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className="topic-item animate-slide"
                    onClick={() => {
                      sound.play('pop');
                      go({ screen: 'notes', topicId: topic.id, subject: topic.subject, from: 'report' });
                    }}
                  >
                    <span className="badge" aria-hidden="true" style={{ background: 'var(--warn-soft)' }}>
                      {topic.emoji}
                    </span>
                    <span className="grow">
                      <b>{topic.title}</b>
                      <small>
                        {subjectById(topic.subject).name} • {t('common.best')} {score}%
                      </small>
                    </span>
                    <Chip tone="warn">{score}%</Chip>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="section-title">📋 {t('report.nextSteps')}</p>
        <div className="card">
          <ol className="report-steps">
            {nextSteps(profile.year, weak.length, stats.accuracy, t).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="stack" style={{ marginTop: 18 }}>
          <Btn block variant="accent" onClick={doShare}>
            📤 {t('report.share')}
          </Btn>
          <Btn block onClick={doCopy}>
            📋 {copied ? t('report.copied') : t('report.copy')}
          </Btn>
          <div className="row" style={{ gap: 10 }}>
            <Btn block variant="ghost" onClick={() => go({ screen: 'plan' })}>
              🗺️ {t('plan.title')}
            </Btn>
            <Btn block variant="ghost" onClick={() => go({ screen: 'progress' })}>
              📊 {t('progress.title')}
            </Btn>
          </div>
        </div>

        <p className="tiny muted center" style={{ marginTop: 14 }}>
          💚 {t('report.privacyNote')}
        </p>
      </div>
    </div>
  );
}

/** Cadangan langkah seterusnya untuk ibu bapa atau guru. */
function nextSteps(
  year: number,
  weakCount: number,
  accuracy: number,
  t: (k: string, vars?: Record<string, string | number>) => string,
): string[] {
  const out: string[] = [];
  if (weakCount > 0) out.push(t('report.stepRemedial'));
  else out.push(t('report.stepKeep'));
  if (accuracy < 70) out.push(t('report.stepSlow'));
  else out.push(t('report.stepChallenge'));
  out.push(t('report.stepRoutine'));
  out.push(t('report.stepYear', { y: year }));
  return out;
}
