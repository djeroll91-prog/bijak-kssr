/** Skrin selamat datang untuk mencipta profil murid. */

import { useState } from 'react';
import { useStore, useT } from '../state/store';
import { Btn } from '../components/ui';
import { YEAR_THEME } from '../data/subjects';
import { yearLabel, yearTheme } from '../lib/i18n';
import { sound, voice } from '../lib/audio';
import type { YearNum } from '../data/types';

const AVATARS = ['🦊', '🐼', '🐯', '🐨', '🐸', '🦉', '🐙', '🦄', '🐲', '🐰', '🐵', '🐧'];

export function Onboarding({ mode = 'create' }: { mode?: 'create' | 'add' }) {
  const { createProfile, addProfile, data, profile, back, lang } = useStore();
  const t = useT();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [year, setYear] = useState<YearNum>((profile?.year ?? 1) as YearNum);

  const submit = () => {
    sound.unlock();
    sound.play('win');
    if (mode === 'add') addProfile(name, avatar, year);
    else createProfile(name, avatar, year);
    if (data.settings.voice) {
      setTimeout(() => voice.speak(t('onboarding.greeting', { name: name || 'murid' }), lang), 320);
    }
  };

  return (
    <div className="screen">
      <div className="onboard" data-flush="true">
        {mode === 'add' ? (
          <button type="button" className="icon-btn" style={{ alignSelf: 'flex-start' }} onClick={() => { sound.play('tap'); back(); }} aria-label={t('common.back')}>
            ←
          </button>
        ) : null}

        <div className="onboard-logo">
          <span className="mark" aria-hidden="true">
            🎒
          </span>
          <h1>{mode === 'add' ? t('profile.addChild') : t('onboard.title')}</h1>
          <p>{t('onboard.sub')}</p>
        </div>

        <div>
          <p className="field-label">{t('onboard.name')}</p>
          <input
            className="text-input"
            value={name}
            placeholder={t('onboard.namePh')}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            aria-label={t('onboard.name')}
          />
        </div>

        <div>
          <p className="field-label">{t('onboard.avatar')}</p>
          <div className="avatar-picker">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className="pick"
                data-sel={avatar === a ? 'true' : 'false'}
                aria-label={`Avatar ${a}`}
                aria-pressed={avatar === a}
                onClick={() => {
                  sound.play('pop');
                  setAvatar(a);
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="field-label">{t('onboard.year')}</p>
          <div className="year-picker">
            {([1, 2, 3, 4, 5, 6] as YearNum[]).map((y) => (
              <button
                key={y}
                type="button"
                className="pick pick-year"
                data-sel={year === y ? 'true' : 'false'}
                aria-pressed={year === y}
                onClick={() => {
                  sound.play('pop');
                  setYear(y);
                }}
              >
                <b>
                  {t('common.grade')} {y}
                </b>
                <span className="tiny muted">{yearTheme(lang, y, YEAR_THEME[y])}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-flat">
          <p className="tiny muted center">
            📚 {t('subjects.choose')} {yearLabel(lang, year)} — {yearTheme(lang, year, YEAR_THEME[year])}
          </p>
        </div>

        <Btn block variant="accent" onClick={submit}>
          🚀 {t('onboard.start')}
        </Btn>
      </div>
    </div>
  );
}
