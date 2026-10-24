/** Skrin nota pembelajaran sebelum latihan. */

import { useEffect } from 'react';
import { useStore, useT } from '../state/store';
import { Btn, Chip, NoteCard, TopBar } from '../components/ui';
import { NumberLine } from '../components/NumberLine';
import { subjectById, gamesForSubject } from '../data/subjects';
import { gameBlurb, gameName, subjectName, topicCodeLabel, yearLabel } from '../lib/i18n';
import { topicById } from '../data/catalog';
import { surahsForTopic } from '../data/surah';
import { SurahCard } from '../components/SurahCard';
import { contributorFor } from '../data/contributors';
import { strategyForTopic } from '../data/strategies';
import { roundingModel } from '../lib/steps';
import { sound, voice } from '../lib/audio';

/**
 * Contoh pembundaran bagi setiap tahun, untuk animasi garis nombor.
 *
 * Nombor dipilih supaya kesnya berbeza setiap tahun: Tahun 2 membundar ke
 * puluh, Tahun 3 ke ratus, dan seterusnya. Contoh Tahun 3 sengaja memilih
 * digit 7 yang menjadi 8 supaya murid nampak kes "bundar ke atas".
 */
const ROUND_SAMPLES: Record<number, string> = {
  1: 'Bundarkan 47 kepada puluh terdekat.',
  2: 'Bundarkan 462 kepada puluh terdekat.',
  3: 'Bundarkan 3,750 kepada ratus terdekat.',
  4: 'Bundarkan 27,480 kepada ribu terdekat.',
  5: 'Bundarkan 348,000 kepada ratus ribu terdekat.',
  6: 'Bundarkan 4,650,000 kepada juta terdekat.',
};

export function NotesScreen() {
  const { nav, go, back, markTopicSeen, lang, settings, profile, toggleMemorisedSurah } = useStore();
  const t = useT();
  const topic = topicById(nav.topicId ?? '');

  useEffect(() => {
    if (topic) markTopicSeen(topic.id);
  }, [topic, markTopicSeen]);

  if (!topic) {
    return (
      <div className="screen">
        <TopBar onBack={back} title={t('topics.title')} />
        <div className="screen-scroll">
          <p className="muted center">{t('topics.notFound')}</p>
        </div>
      </div>
    );
  }

  const meta = subjectById(topic.subject);
  const contributor = contributorFor(topic.id);
  const games = gamesForSubject(topic.subject, topic.year).filter((g) =>
    topic.games ? topic.games.includes(g.id) : true,
  );
  const strategy = strategyForTopic(topic.id, topic.subject, topic.year);
  const topicSurahs = surahsForTopic(topic);
  const memorised = profile?.memorisedSurahs ?? [];

  // Contoh garis nombor: ambil soalan pembundaran pertama yang boleh dihurai.
  // Hanya dipaparkan untuk topik yang benar-benar membincangkan pembundaran.
  const roundExample = topic.notes.some((n) => /bundar/i.test(`${n.title} ${n.body ?? ''}`))
    ? ROUND_SAMPLES[topic.year]
    : undefined;
  const lineModel = roundExample ? roundingModel(roundExample) : undefined;

  const speakAll = () => {
    const text = [topic.title, topic.summary, ...topic.notes.flatMap((n) => [n.title, n.body ?? '', ...(n.bullets ?? [])])]
      .filter(Boolean)
      .join('. ');
    voice.speak(text, topic.subject === 'english' ? 'en' : 'ms');
  };

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={topic.title}
        subtitle={`${subjectName(lang, topic.subject, meta.name)} • ${topicCodeLabel(lang, topic.subject, topic.code)}`}
        right={
          <span className="icon-btn" aria-hidden="true" style={{ background: `${meta.color}1a` }}>
            {topic.emoji}
          </span>
        }
      />
      <div className="screen-scroll">
        <div className="card-flat">
          <p className="tiny muted">{topic.summary}</p>
          <div className="row wrap" style={{ marginTop: 8, gap: 6 }}>
            <Chip tone="brand">{yearLabel(lang, topic.year)}</Chip>
            <Chip>{topic.notes.length} {t('topics.notes').toLowerCase()}</Chip>
            {settings.voice ? (
              <button type="button" className="chip chip-success" onClick={speakAll}>
                🔊 {t('notes.readAloud')}
              </button>
            ) : null}
          </div>
          <p className="tiny muted" style={{ marginTop: 8 }}>
            {contributor.emoji} {t('topics.byTeacher')} <b>{contributor.name}</b>
          </p>
        </div>

        <p className="section-title">{t('topics.notes')}</p>
        <div className="stack">
          {topic.notes.map((n, i) => (
            <NoteCard key={i} note={n} onSpeak={settings.voice ? (txt) => voice.speak(txt, topic.subject === 'english' ? 'en' : 'ms') : undefined} />
          ))}
        </div>

        {/* Kad hafazan surah: hanya muncul pada topik al-Quran Pendidikan Islam. */}
        {topicSurahs.length > 0 ? (
          <>
            <p className="section-title">
              📖 {t('surah.heading')}{' '}
              <span className="tiny muted">
                {t('surah.progress', {
                  done: topicSurahs.filter((s) => memorised.includes(s.id)).length,
                  total: topicSurahs.length,
                })}
              </span>
            </p>
            <div className="stack">
              {topicSurahs.map((s) => (
                <SurahCard
                  key={s.id}
                  surah={s}
                  lang={lang}
                  memorised={memorised.includes(s.id)}
                  voiceOn={settings.voice}
                  onToggleMemorised={() => toggleMemorisedSurah(s.id)}
                />
              ))}
            </div>
            {topicSurahs.every((s) => memorised.includes(s.id)) ? (
              <p className="tiny muted center" style={{ marginTop: 8 }}>
                {t('surah.allDone')}
              </p>
            ) : null}
          </>
        ) : null}

        {/* Animasi garis nombor: nampak di mana nombor berada antara dua gandaan. */}
        {lineModel ? (
          <>
            <p className="section-title">{t('notes.roundLine', { place: lineModel.place })}</p>
            <NumberLine model={lineModel} />
          </>
        ) : null}

        {/* Strategi menjawab mengikut subjek dan bab. */}
        <p className="section-title">{t('strat.heading')}</p>
        <div className="strat-card">
          <p className="strat-title">
            <span aria-hidden="true">🧭</span> {t(strategy.titleKey)}
          </p>
          <ol className="strat-list">
            {strategy.steps.map((s, i) => (
              <li key={s.key}>
                <span className="strat-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <span aria-hidden="true">{s.emoji}</span> {t(s.key)}
                </span>
              </li>
            ))}
          </ol>

          {strategy.keywords ? (
            <>
              <p className="section-title" style={{ marginTop: 14 }}>
                {t('strat.keywords')}
              </p>
              <div className="strat-kw">
                {strategy.keywords.map((kw) => (
                  <span className="strat-kw-item" key={kw.key}>
                    <span aria-hidden="true">{kw.emoji}</span>
                    <b>{kw.word}</b>
                    <span>— {t(kw.key)}</span>
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div style={{ marginTop: 20 }}>
          <Btn
            block
            variant="accent"
            onClick={() => {
              sound.play('win');
              go({
                screen: 'quiz',
                topicId: topic.id,
                subject: topic.subject,
                from: 'notes',
              });
            }}
          >
            ✏️ {t('notes.startQuiz')}
          </Btn>
          {/* Lembaran latihan untuk topik ini sahaja. */}
          <button
            type="button"
            className="ws-open"
            onClick={() => {
              sound.play('tap');
              go({
                screen: 'worksheet',
                topicId: topic.id,
                subject: topic.subject,
                from: 'notes',
              });
            }}
          >
            <span className="lead" aria-hidden="true">
              🖨️
            </span>
            <span className="grow">
              <b>{t('ws.title')}</b>
              <small>{t('ws.desc')}</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        </div>

        {games.length > 0 ? (
          <>
            <p className="section-title">{t('topics.game')}</p>
            <div className="stack">
              {games.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="topic-item"
                  onClick={() => {
                    sound.play('pop');
                    go({ screen: 'game', gameId: g.id, subject: topic.subject, topicId: topic.id, from: 'notes' });
                  }}
                >
                  <span className="badge" aria-hidden="true" style={{ background: 'var(--accent-soft)' }}>
                    {g.emoji}
                  </span>
                  <span className="grow">
                    <b>{gameName(lang, g.id, g.name)}</b>
                    <small>{gameBlurb(lang, g.id, g.blurb)}</small>
                  </span>
                  <span aria-hidden="true">🎮</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
