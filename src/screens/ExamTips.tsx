/**
 * Tips menjawab soalan ujian: tip am mengikut tahun, kemudian tip khusus
 * setiap subjek. Setiap tip boleh dibaca kuat dengan suara.
 */

import { useEffect, useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { subjectById } from '../data/subjects';
import { subjectName, yearLabel } from '../lib/i18n';
import { Btn, TopBar } from '../components/ui';
import { sound, voice } from '../lib/audio';
import { subjectsForYear } from '../data/catalog';
import { tipsForYear } from '../data/tips';

export function ExamTipsScreen() {
  const { profile, go, back, settings, lang } = useStore();
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);

  const year = profile?.year ?? 1;
  const subjects = useMemo(() => subjectsForYear(year), [year]);
  const groups = useMemo(() => tipsForYear(year, subjects), [year, subjects]);

  // Baca tajuk skrin apabila dibuka supaya murid tahu apa yang dipaparkan.
  useEffect(() => {
    if (!settings.voice) return;
    const timer = window.setTimeout(
      () => voice.speak(t('tips.speak', { year: yearLabel(lang, year) }), 'ms'),
      300,
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) return null;

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={t('tips.title')}
        subtitle={`${yearLabel(lang, year)} • ${t('tips.count', { n: groups.reduce((n, g) => n + g.tips.length, 0) })}`}
      />
      <div className="screen-scroll">
        <div className="card hero-card animate-pop">
          <span className="hero-emoji" aria-hidden="true">💡</span>
          <h3>{t('tips.hero', { year: yearLabel(lang, year) })}</h3>
          <p className="tiny muted">{t('tips.heroDesc')}</p>
        </div>

        {groups.map((group) => {
          const name = group.subject
            ? subjectName(lang, group.subject, subjectById(group.subject).name)
            : t(group.nameKey ?? 'tips.group.general');
          const key = group.subject ?? 'general';
          const isOpen = open === key;
          return (
            <div key={key} className="tips-group">
              <button
                type="button"
                className="tips-head"
                aria-expanded={isOpen}
                onClick={() => {
                  sound.play('pop');
                  setOpen(isOpen ? null : key);
                }}
              >
                <span className="badge" aria-hidden="true">{group.emoji}</span>
                <span className="grow">
                  <b>{name}</b>
                  <small>{t('tips.count', { n: group.tips.length })}</small>
                </span>
                <span aria-hidden="true" className="tips-chevron" data-open={isOpen ? 'true' : 'false'}>
                  ▾
                </span>
              </button>

              {isOpen ? (
                <div className="stack" style={{ marginTop: 10 }}>
                  {group.tips.map((tip) => (
                    <div key={tip.titleKey} className="card animate-slide">
                      <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                        <span aria-hidden="true" style={{ fontSize: '1.3rem' }}>{tip.emoji}</span>
                        <div className="grow">
                          <b style={{ fontSize: '0.9rem', fontWeight: 900 }}>{t(tip.titleKey)}</b>
                          <p className="tiny muted" style={{ marginTop: 4 }}>{t(tip.bodyKey)}</p>
                        </div>
                        {settings.voice ? (
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={t('tips.speakBtn')}
                            onClick={() => {
                              sound.play('tap');
                              voice.speak(`${t(tip.titleKey)}. ${t(tip.bodyKey)}`, 'ms');
                            }}
                          >
                            🔊
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="stack" style={{ marginTop: 18 }}>
          <Btn block variant="accent" onClick={() => { sound.play('levelup'); go({ screen: 'mockExam' }); }}>
            📝 {t('tips.tryExam')}
          </Btn>
          <Btn block variant="ghost" onClick={back}>← {t('common.back')}</Btn>
        </div>
      </div>
    </div>
  );
}
