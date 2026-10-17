/** Skrin nota pembelajaran sebelum latihan. */

import { useEffect } from 'react';
import { useStore, useT } from '../state/store';
import { Btn, Chip, NoteCard, TopBar } from '../components/ui';
import { subjectById, gamesForSubject } from '../data/subjects';
import { gameBlurb, gameName, subjectName, yearLabel } from '../lib/i18n';
import { topicById } from '../data/catalog';
import { contributorFor } from '../data/contributors';
import { sound, voice } from '../lib/audio';

export function NotesScreen() {
  const { nav, go, back, markTopicSeen, lang, settings } = useStore();
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
        subtitle={`${subjectName(lang, topic.subject, meta.name)} • DSKP ${topic.code}`}
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
