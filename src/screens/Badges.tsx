/** Skrin lencana dan ganjaran. */

import { useStore, useT } from '../state/store';
import { BadgeTile, Chip, Confetti, ProgressRing, TopBar } from '../components/ui';
import { BADGES, badgeContext, badgeHow, badgeName } from '../data/badges';
import { useEffect, useState } from 'react';
import { sound } from '../lib/audio';

export function BadgesScreen() {
  const { profile, back, lang } = useStore();
  const t = useT();
  const [fire, setFire] = useState(0);

  useEffect(() => {
    if (profile && profile.badges.length > 0) setFire((f) => f + 1);
  }, [profile]);

  if (!profile) return null;
  const ctx = badgeContext(profile);
  const earned = profile.badges.length;
  const pct = (earned / BADGES.length) * 100;
  const next = BADGES.find((b) => !profile.badges.includes(b.id));

  return (
    <div className="screen">
      <TopBar onBack={back} title={t('badges.title')} subtitle={`${earned}/${BADGES.length} ${t('badges.earnedCount')}`} />
      <Confetti fireKey={fire} count={40} />
      <div className="screen-scroll">
        <div className="card">
          <div className="row-between">
            <div className="row">
              <ProgressRing value={pct} size={58} />
              <div>
                <b style={{ fontWeight: 900, fontSize: '0.95rem' }}>
                  {earned} {t('badges.earned')}
                </b>
                <p className="tiny muted">
                  ⭐ {profile.stars} • 🏅 {profile.points}
                </p>
              </div>
            </div>
          </div>
          {next ? (
            <div className="card-flat" style={{ marginTop: 12 }}>
              <p className="tiny muted">
                🎯 {t('badges.next')}: <b>{next.emoji} {badgeName(lang, next)}</b> — {badgeHow(lang, next)}
              </p>
            </div>
          ) : (
            <div className="card-flat" style={{ marginTop: 12 }}>
              <p className="tiny muted center">{t('badges.allEarned')}</p>
            </div>
          )}
        </div>

        <p className="section-title">{t('badges.title')}</p>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const owned = profile.badges.includes(b.id);
            const achieved = b.check(ctx);
            return (
              <div
                key={b.id}
                onClick={() => {
                  if (owned) sound.play('star');
                }}
                role={owned ? 'button' : undefined}
                tabIndex={owned ? 0 : undefined}
              >
                <BadgeTile emoji={b.emoji} name={badgeName(lang, b)} how={badgeHow(lang, b)} locked={!owned} />
                {achieved && !owned ? (
                  <div className="center" style={{ marginTop: 4 }}>
                    <Chip tone="warn">{t('badges.ready')}</Chip>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="card-flat" style={{ marginTop: 18 }}>
          <p className="tiny muted center">
            💡 Siapkan latihan dengan markah penuh untuk mengumpul bintang dan membuka lencana baharu!
          </p>
        </div>
      </div>
    </div>
  );
}
