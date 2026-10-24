/**
 * Kad hafazan surah untuk topik al-Quran Pendidikan Islam.
 *
 * Setiap kad memaparkan teks Arab (kanan ke kiri), bacaan Rumi dan maksud
 * mengikut bahasa antara muka. Mod Hafazan menyembunyikan ayat supaya murid
 * boleh mencuba sendiri dahulu, kemudian menekan "Tunjuk Ayat" untuk menyemak.
 * Semua teks antara muka datang daripada i18n supaya kekal dwibahasa.
 */

import { useState } from 'react';
import type { Surah } from '../data/surah';
import { sound, voice } from '../lib/audio';
import { useT } from '../state/store';
import type { Lang } from '../lib/i18n';

export function SurahCard({
  surah,
  lang,
  memorised,
  onToggleMemorised,
  voiceOn,
}: {
  surah: Surah;
  lang: Lang;
  memorised: boolean;
  onToggleMemorised: () => void;
  voiceOn: boolean;
}) {
  const t = useT();
  const [hafaz, setHafaz] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());

  const revealAll = () => {
    sound.play('pop');
    setOpen(new Set(surah.ayahs.map((a) => a.n)));
  };

  const hideAll = () => {
    sound.play('tap');
    setOpen(new Set());
  };

  const toggleAyah = (n: number) => {
    sound.play('tap');
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  return (
    <div className="surah-card" data-memorised={memorised ? 'true' : 'false'}>
      <div className="surah-head">
        <span className="surah-emoji" aria-hidden="true">
          📖
        </span>
        <span className="grow">
          <b>{surah.name}</b>
          <small>
            {t('surah.count', { n: surah.count })} • {t('surah.arabicHint')}
          </small>
        </span>
        <button
          type="button"
          className={`chip ${memorised ? 'chip-success' : ''}`}
          aria-pressed={memorised}
          onClick={() => {
            sound.play(memorised ? 'tap' : 'win');
            onToggleMemorised();
          }}
        >
          {memorised ? `✅ ${t('surah.marks')}` : `⬜ ${t('surah.markDone')}`}
        </button>
      </div>

      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
        <button
          type="button"
          className={`chip ${hafaz ? 'chip-brand' : ''}`}
          aria-pressed={hafaz}
          onClick={() => {
            sound.play('pop');
            setHafaz((v) => !v);
            setOpen(new Set());
          }}
        >
          🙈 {t('surah.hafazMode')}
        </button>
        {hafaz ? (
          <>
            <button type="button" className="chip" onClick={revealAll}>
              👁️ {t('surah.reveal')}
            </button>
            <button type="button" className="chip" onClick={hideAll}>
              🙈 {t('surah.hideAll')}
            </button>
          </>
        ) : null}
        {voiceOn ? (
          <button
            type="button"
            className="chip chip-brand"
            onClick={() => {
              sound.play('tap');
              // Enjin suara membaca ayat Arab sebagai teks; bacaan Rumi
              // disertakan supaya sebutan Melayu turut kedengaran.
              voice.speak(
                [surah.name, ...surah.ayahs.map((a) => a.rumi)].join('. '),
                lang,
              );
            }}
          >
            🔊 {t('surah.listen')}
          </button>
        ) : null}
      </div>

      {hafaz ? <p className="tiny muted" style={{ marginTop: 8 }}>{t('surah.hafazHint')}</p> : null}

      <ol className="surah-ayahs">
        {surah.ayahs.map((a) => {
          const shown = !hafaz || open.has(a.n);
          return (
            <li key={a.n} className="surah-ayah">
              <div className="surah-ayah-head">
                <span className="surah-num" aria-hidden="true">
                  {a.n}
                </span>
                <span className="tiny muted">{t('surah.ayah', { n: a.n })}</span>
                {hafaz ? (
                  <button
                    type="button"
                    className="chip"
                    aria-expanded={shown}
                    onClick={() => toggleAyah(a.n)}
                  >
                    {shown ? '🙈' : `👁️ ${t('surah.reveal')}`}
                  </button>
                ) : null}
              </div>
              {shown ? (
                <div className="surah-reveal animate-pop">
                  <p className="surah-ar" dir="rtl" lang="ar">
                    {a.ar}
                  </p>
                  <p className="surah-rumi">
                    <span className="tiny muted">{t('surah.rumi')}:</span> {a.rumi}
                  </p>
                  <p className="surah-maksud">
                    <span className="tiny muted">{t('surah.meaning')}:</span>{' '}
                    {lang === 'en' ? a.en : a.ms}
                  </p>
                </div>
              ) : (
                <div className="surah-hidden" aria-hidden="true">
                  ✦ ✦ ✦ ✦ ✦
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
