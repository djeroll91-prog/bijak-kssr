/**
 * Animasi garis nombor untuk membundarkan.
 *
 * Kanak-kanak lebih mudah faham pembundaran apabila nampak di mana nombor
 * itu terletak ANTARA dua gandaan. Komponen ini melukis garis itu dan
 * menggerakkan penanda dari nombor asal ke jawapan, jadi murid nampak
 * arah pembundaran, bukan sekadar membaca ayat.
 *
 * Animasi dimatikan apabila tetapan "Mod Tenang" atau "Animasi" dimatikan;
 * dalam keadaan itu penanda terus berada pada jawapan. Semua gerakan
 * menggunakan CSS, jadi tiada perpustakaan tambahan dan ia berfungsi
 * sepenuhnya di luar talian.
 */

import { useEffect, useState } from 'react';
import { useStore, useT } from '../state/store';
import { sound } from '../lib/audio';
import { fmt } from '../lib/generators/shared';
import type { RoundingModel } from '../lib/steps';

export function NumberLine({ model }: { model: RoundingModel }) {
  const { settings } = useStore();
  const t = useT();
  const animate = settings.motion && !settings.calm;

  // Penanda mula pada nombor asal, kemudian bergerak ke jawapan.
  const [settled, setSettled] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setSettled(true);
      return;
    }
    setSettled(false);
    const timer = window.setTimeout(() => {
      setSettled(true);
      sound.play('pop');
    }, 900);
    return () => window.clearTimeout(timer);
    // Main semula apabila soalan berubah.
  }, [animate, model.n, model.k]);

  const { n, lower, upper, computed, place } = model;
  const span = upper - lower || 1;
  /** Kedudukan 0–100% pada garis. */
  const pct = (value: number) => ((value - lower) / span) * 100;
  const atPct = pct(settled ? computed : n);

  return (
    <div className="numline" data-settled={settled ? 'yes' : 'no'}>
      <p className="numline-title">
        <span aria-hidden="true">📏</span> {t('notes.roundLine', { place })}
      </p>

      <div className="numline-track" role="img" aria-label={`${fmt(lower)} → ${fmt(n)} → ${fmt(upper)}`}>
        {/* Garis dan tanda hujung */}
        <span className="numline-axis" aria-hidden="true" />
        <span className="numline-tick" style={{ left: '0%' }} aria-hidden="true" />
        <span className="numline-tick" style={{ left: '100%' }} aria-hidden="true" />

        {/* Titik tengah: pemisah 5 */}
        <span className="numline-mid" style={{ left: '50%' }} aria-hidden="true" />

        {/* Penanda yang bergerak */}
        <span className="numline-marker" style={{ left: `${atPct}%` }} aria-hidden="true">
          <span className="numline-dot" />
        </span>

        {/* Label nombor asal, hanya semasa ia masih di tempat asal */}
        {!settled ? (
          <span className="numline-origin" style={{ left: `${pct(n)}%` }} aria-hidden="true">
            {fmt(n)}
          </span>
        ) : null}
      </div>

      <div className="numline-labels">
        <span className="numline-end">{fmt(lower)}</span>
        <span className="numline-answer">
          {fmt(n)} ≈ <b>{fmt(computed)}</b>
        </span>
        <span className="numline-end">{fmt(upper)}</span>
      </div>

      <p className="numline-note tiny muted">
        {model.decider >= 5 ? t('notes.roundUpNote') : t('notes.roundDownNote')}
      </p>
    </div>
  );
}
