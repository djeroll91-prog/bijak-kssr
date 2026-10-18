/**
 * Lembaran latihan boleh cetak.
 *
 * Guru dan ibu bapa boleh memilih topik, menjana satu set soalan baharu, dan
 * mencetak lembaran itu untuk latihan tulis di atas kertas. Soalan dijana
 * daripada penjana topik yang sama seperti kuiz interaktif, jadi isi lembaran
 * sentiasa selaras dengan silibus dan sentiasa berbeza setiap kali dijana.
 *
 * Kunci jawapan disembunyikan secara lalai dan hanya ditunjuk apabila guru
 * memilihnya, supaya murid tidak boleh melihat jawapan sebelum mencuba.
 */

import { useMemo, useState } from 'react';
import { useStore, useT } from '../state/store';
import { Btn, Chip, TopBar } from '../components/ui';
import { subjectById } from '../data/subjects';
import { subjectName, yearLabel } from '../lib/i18n';
import { ALL_TOPICS, generateQuestions, topicsFor } from '../data/catalog';
import { sound, voice } from '../lib/audio';
import type { Question, SubjectId, Topic } from '../data/types';

/** Bilangan soalan dalam satu lembaran. */
const SHEET_COUNT = 10;

export function WorksheetScreen() {
  const { nav, back, profile, lang, showToast } = useStore();
  const t = useT();

  const subject = (nav.subject ?? 'matematik') as SubjectId;
  const meta = subjectById(subject);
  const year = profile?.year ?? 1;

  const available = useMemo(() => topicsFor(subject, year), [subject, year]);
  const [topicId, setTopicId] = useState<string>(nav.topicId ?? available[0]?.id ?? '');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [showKey, setShowKey] = useState(false);

  const topic: Topic | undefined = useMemo(
    () => ALL_TOPICS.find((x) => x.id === topicId) ?? available[0],
    [topicId, available],
  );

  // Soalan dijana semula apabila topik atau benih berubah, jadi setiap
  // lembaran yang dicetak berbeza daripada yang sebelumnya.
  const questions = useMemo<Question[]>(
    () => (topic ? generateQuestions(topic.id, SHEET_COUNT, seed) : []),
    [topic, seed],
  );

  const print = () => {
    sound.play('pop');
    window.print();
  };

  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={t('ws.title')}
        subtitle={`${subjectName(lang, subject, meta.name)} • ${yearLabel(lang, year)}`}
        right={
          <span className="icon-btn no-print" aria-hidden="true" style={{ background: `${meta.color}1a` }}>
            🖨️
          </span>
        }
      />
      <div className="screen-scroll">
        {/* Kawalan: hanya kelihatan di skrin, tidak dicetak. */}
        <div className="card no-print">
          <p className="tiny muted" style={{ marginTop: 0 }}>
            {t('ws.desc')}
          </p>
          <div className="ws-toolbar">
            <Btn small variant="primary" onClick={print}>
              🖨️ {t('ws.print')}
            </Btn>
            <Btn
              small
              variant="accent"
              onClick={() => {
                setSeed(Math.floor(Math.random() * 1e9));
                setShowKey(false);
                showToast(t('ws.newQuestions'));
              }}
            >
              🎲 {t('ws.newQuestions')}
            </Btn>
            <Btn
              small
              variant={showKey ? 'ghost' : 'success'}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? `🙈 ${t('ws.hideKey')}` : `🔑 ${t('ws.showKey')}`}
            </Btn>
          </div>
          <p className="tiny muted" style={{ marginBottom: 0 }}>
            {t('ws.printHint')}
          </p>
        </div>

        {/* Pemilih topik. */}
        {available.length > 0 ? (
          <div className="no-print">
            <p className="section-title">{t('ws.chooseTopic')}</p>
            <div className="row wrap" style={{ gap: 8 }}>
              {available.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className="chip-btn"
                  data-on={x.id === topicId ? 'true' : 'false'}
                  onClick={() => {
                    sound.play('tap');
                    setTopicId(x.id);
                    setShowKey(false);
                  }}
                >
                  {x.emoji} {x.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Helaian lembaran. */}
        {questions.length === 0 || !topic ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              {t('ws.noQuestions')}
            </p>
          </div>
        ) : (
          <div className="card ws-sheet">
            <div className="ws-head">
              <div className="ws-field">
                <span>{t('ws.name')}</span>
                <div className="ws-line" />
              </div>
              <div className="ws-field">
                <span>{t('ws.date')}</span>
                <div className="ws-line" />
              </div>
              <div className="ws-field" style={{ flex: '0 0 90px' }}>
                <span>{t('ws.marks')}</span>
                <div className="ws-line" />
              </div>
            </div>

            <div className="row-between" style={{ marginBottom: 8 }}>
              <b style={{ fontSize: '1.02rem', fontWeight: 900 }}>
                {topic.emoji} {topic.title}
              </b>
              <Chip tone="brand">
                {questions.length} {t('ws.questions')}
              </Chip>
            </div>
            <p className="tiny muted" style={{ marginTop: 0 }}>
              {t('ws.instructions')}
            </p>

            <div>
              {questions.map((q, i) => (
                <WorksheetItem key={q.id} q={q} n={i + 1} t={t} lang={lang} />
              ))}
            </div>

            {/* Kunci jawapan: untuk guru dan ibu bapa. */}
            {showKey ? (
              <div className="ws-key">
                <b>🔑 {t('ws.answerKey')}</b>
                <ol>
                  {questions.map((q) => (
                    <li key={q.id}>{answerText(q)}</li>
                  ))}
                </ol>
                <p className="ws-note">{t('ws.teacherNote')}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/** Satu soalan pada lembaran, dipaparkan mengikut bentuk jawapan. */
function WorksheetItem({
  q,
  n,
  t,
  lang,
}: {
  q: Question;
  n: number;
  t: (k: string) => string;
  lang: 'ms' | 'en';
}) {
  return (
    <div className="ws-item">
      <div className="ws-q">
        <span className="ws-num">{n}.</span>
        <span className="grow">
          {q.prompt}
          {q.promptSub ? <small className="muted"> ({q.promptSub})</small> : null}
        </span>
        <button
          type="button"
          className="icon-btn no-print"
          aria-label={q.prompt}
          onClick={() => voice.speak(q.speak ?? q.prompt, lang)}
        >
          🔊
        </button>
      </div>

      {/* Pilihan jawapan: murid membulatkan jawapan. */}
      {q.kind === 'mcq' || q.kind === 'truefalse' || q.kind === 'fillblank' ? (
        <>
          <p className="ws-note" style={{ marginLeft: 24 }}>
            {t('ws.instructionsMcq')}
          </p>
          <div className="ws-options">
            {(q.options ?? []).map((o, k) => (
              <div key={`${q.id}-o${k}`} className="ws-option">
                <span className="ws-bullet" aria-hidden="true" />
                <span>{o}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* Susun urutan: murid menulis nombor pada ruang. */}
      {q.kind === 'order' ? (
        <div className="ws-options">
          {(q.items ?? []).map((it, k) => (
            <div key={`${q.id}-i${k}`} className="ws-option">
              <span className="ws-bullet" aria-hidden="true" />
              <span className="grow">{it}</span>
              <span className="ws-num">___</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Padan pasangan: murid menulis huruf/abjad pada ruang. */}
      {q.kind === 'match' ? (
        <div className="ws-options">
          {(q.pairs ?? []).map((p, k) => (
            <div key={`${q.id}-p${k}`} className="ws-option">
              <span className="ws-num">{String.fromCharCode(65 + k)}.</span>
              <span className="grow">{p.left}</span>
              <span className="ws-num">___</span>
            </div>
          ))}
          <p className="ws-note">
            {(q.pairs ?? []).map((p, k) => `${k + 1}. ${p.right}`).join('   ')}
          </p>
        </div>
      ) : null}

      {/* Jawapan bertulis: ruang garisan. */}
      {q.kind !== 'mcq' && q.kind !== 'truefalse' && q.kind !== 'order' && q.kind !== 'match' && q.kind !== 'fillblank' ? (
        <>
          <p className="ws-note" style={{ marginLeft: 24 }}>
            {t('ws.instructionsWritten')}
          </p>
          <div className="ws-answer-line" />
        </>
      ) : null}
    </div>
  );
}

/** Teks jawapan bagi kunci jawapan. */
function answerText(q: Question): string {
  if (q.kind === 'order' && Array.isArray(q.answer)) return q.answer.join(' → ');
  if (q.kind === 'match' && q.pairs) {
    return q.pairs.map((p) => `${p.left} = ${p.right}`).join('; ');
  }
  return String(q.answer);
}
