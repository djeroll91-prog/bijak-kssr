/** Skrin profil, tetapan, pengurusan murid dan data. */

import { useEffect, useRef, useState } from 'react';
import { useStore, useT } from '../state/store';
import { Btn, Chip, Sheet, ToggleRow, TopBar } from '../components/ui';
import { YEAR_THEME } from '../data/subjects';
import { dayCount, yearLabel, yearTheme } from '../lib/i18n';
import { catalogStats } from '../data/catalog';
import { profileStats } from '../lib/storage';
import { sound, voice } from '../lib/audio';
import { copyText, shareUrl } from '../lib/share';
import type { YearNum } from '../data/types';

const AVATARS = ['🦊', '🐼', '🐯', '🐨', '🐸', '🦉', '🐙', '🦄', '🐲', '🐰', '🐵', '🐧'];
const APP_VERSION = '1.3.0';

export function ProfileScreen() {
  const {
    profile,
    data,
    settings,
    lang,
    setSetting,
    setLang,
    updateProfile,
    addProfile,
    removeProfile,
    switchProfile,
    exportData,
    importData,
    resetAll,
    go,
    back,
    showToast,
  } = useStore();
  const t = useT();

  const [sheet, setSheet] = useState<null | 'name' | 'year' | 'avatar' | 'switch' | 'add' | 'reset'>(null);
  const [nameDraft, setNameDraft] = useState(profile?.name ?? '');
  const [installEvt, setInstallEvt] = useState<{ prompt: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Tangkap peristiwa pemasangan PWA.
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as unknown as { prompt: () => void });
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    setNameDraft(profile?.name ?? '');
  }, [profile?.name]);

  const stats = catalogStats();
  const pstats = profile ? profileStats(profile) : null;
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  return (
    <div className="screen">
      <TopBar onBack={back} title={t('profile.title')} />
      <div className="screen-scroll">
        {profile ? (
          <div className="card">
            <div className="row">
              <button
                type="button"
                className="hero-avatar"
                style={{ background: 'var(--brand-soft)', boxShadow: 'none', fontSize: '2rem' }}
                onClick={() => { sound.play('pop'); setSheet('avatar'); }}
                aria-label={t('profile.avatar')}
              >
                {profile.avatar}
              </button>
              <div className="grow">
                <div className="row-between">
                  <b style={{ fontSize: '1.1rem', fontWeight: 900 }}>{profile.name}</b>
                  <button type="button" className="chip chip-brand" onClick={() => { sound.play('tap'); setSheet('name'); }}>
                    ✏️ {t('profile.editName')}
                  </button>
                </div>
                <p className="tiny muted">
                  {yearLabel(lang, profile.year)} • {yearTheme(lang, profile.year, YEAR_THEME[profile.year])}
                </p>
                {pstats ? (
                  <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                    <Chip tone="success">⭐ {profile.stars}</Chip>
                    <Chip tone="brand">🏅 {profile.points}</Chip>
                    <Chip>🔥 {dayCount(lang, profile.streakDays)}</Chip>
                    <Chip tone="warn">🎯 {pstats.accuracy}%</Chip>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="row" style={{ gap: 10, marginTop: 14 }}>
              <Btn block small variant="ghost" onClick={() => { sound.play('pop'); setSheet('year'); }}>
                🎓 {t('profile.changeYear')}
              </Btn>
              <Btn block small variant="ghost" onClick={() => { sound.play('pop'); go({ screen: 'badges' }); }}>
                🎖️ {t('badges.title')}
              </Btn>
            </div>
          </div>
        ) : null}

        {/* Pengurusan murid */}
        <p className="section-title">{t('profile.switch')}</p>
        <div className="stack">
          {data.profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className="settings-row"
              style={p.id === data.activeProfileId ? { boxShadow: 'inset 0 0 0 3px var(--brand)' } : undefined}
              onClick={() => {
                sound.play('pop');
                switchProfile(p.id);
              }}
            >
              <span className="lead" aria-hidden="true">
                {p.avatar}
              </span>
              <span className="grow">
                <b>{p.name}</b>
                <small>
                  {yearLabel(lang, p.year)} • ⭐ {p.stars}
                </small>
              </span>
              {p.id === data.activeProfileId ? <Chip tone="success">✓</Chip> : null}
            </button>
          ))}
          <Btn block small variant="ghost" onClick={() => { sound.play('pop'); setSheet('add'); }}>
            ＋ {t('profile.addChild')}
          </Btn>
        </div>

        {/* Tetapan */}
        <p className="section-title">{t('profile.settings')}</p>
        <div className="stack">
          <ToggleRow
            lead="🔊"
            title={t('profile.sound')}
            desc={t('profile.soundDesc')}
            on={settings.sound}
            onChange={(v) => {
              setSetting('sound', v);
              if (v) sound.play('correct');
            }}
          />
          <ToggleRow
            lead="🗣️"
            title={t('profile.voice')}
            desc={t('profile.voiceDesc')}
            on={settings.voice}
            onChange={(v) => {
              setSetting('voice', v);
              if (v) setTimeout(() => voice.speak(t('profile.voiceOn'), lang), 120);
            }}
          />
          {!voice.supported ? (
            <p className="tiny muted" style={{ margin: '-6px 4px 4px' }}>
              ℹ️ {t('profile.voiceNoSupport')}
            </p>
          ) : null}
          <ToggleRow
            lead="✨"
            title={t('profile.motion')}
            desc={t('profile.motionDesc')}
            on={settings.motion}
            onChange={(v) => setSetting('motion', v)}
          />
          <ToggleRow
            lead="🌿"
            title={t('profile.calm')}
            desc={t('profile.calmDesc')}
            on={settings.calm}
            onChange={(v) => setSetting('calm', v)}
          />
          <ToggleRow
            lead="🔍"
            title={t('profile.contrast')}
            desc={t('profile.contrastDesc')}
            on={settings.contrast}
            onChange={(v) => setSetting('contrast', v)}
          />
          <ToggleRow
            lead="🌙"
            title={t('profile.dark')}
            desc={t('profile.darkDesc')}
            on={settings.dark}
            onChange={(v) => setSetting('dark', v)}
          />

          {/* Bahasa */}
          <div className="settings-row">
            <span className="lead" aria-hidden="true">
              🌐
            </span>
            <span className="grow">
              <b>{t('profile.language')}</b>
              <small>{t('profile.languageDesc')}</small>
            </span>
            <div className="row" style={{ gap: 6 }}>
              {(['ms', 'en'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  className="chip"
                  style={lang === l ? { background: 'var(--brand)', color: '#fff' } : undefined}
                  onClick={() => {
                    sound.play('pop');
                    setLang(l);
                  }}
                >
                  {l === 'ms' ? 'BM' : 'EN'}
                </button>
              ))}
            </div>
          </div>

          {/* Saiz teks */}
          <div className="settings-row">
            <span className="lead" aria-hidden="true">
              🔤
            </span>
            <span className="grow">
              <b>{t('profile.fontSize')}</b>
              <small>{Math.round(settings.fontScale * 100)}%</small>
            </span>
            <div className="row" style={{ gap: 6 }}>
              {[0.9, 1, 1.15, 1.3].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  style={settings.fontScale === s ? { background: 'var(--brand)', color: '#fff' } : undefined}
                  onClick={() => {
                    sound.play('tap');
                    setSetting('fontScale', s);
                  }}
                >
                  {Math.round(s * 100)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pemasangan */}
        <p className="section-title">{t('profile.install')}</p>
        <div className="stack">
          <div className="settings-row">
            <span className="lead" aria-hidden="true">
              📲
            </span>
            <span className="grow">
              <b>{isStandalone ? t('profile.installed') : t('profile.install')}</b>
              <small>{isStandalone ? t('profile.offline') : t('profile.installDesc')}</small>
            </span>
            {!isStandalone && installEvt ? (
              <Btn
                small
                variant="success"
                onClick={() => {
                  installEvt.prompt();
                }}
              >
                {t('profile.install')}
              </Btn>
            ) : null}
          </div>
        </div>

        {/* Pautan kekal untuk dikongsi */}
        <p className="section-title">{t('profile.share')}</p>
        <div className="share-box">
          <button
            type="button"
            className="share-link"
            onClick={async () => {
              sound.play('tap');
              const ok = await copyText(shareUrl());
              showToast(ok ? t('toast.linkCopied') : t('toast.copyFailed'));
            }}
          >
            🔗 {shareUrl()}
          </button>
          <p className="tiny muted center" style={{ margin: 0 }}>
            {t('profile.shareDesc')}
          </p>
          <div className="share-actions">
            <Btn
              small
              variant="ghost"
              onClick={async () => {
                const ok = await copyText(shareUrl());
                showToast(ok ? t('toast.linkCopied') : t('toast.copyFailed'));
              }}
            >
              📋 {t('profile.copyLink')}
            </Btn>
            <Btn
              small
              variant="success"
              onClick={async () => {
                const nav = window.navigator as Navigator & {
                  share?: (data: { title: string; text: string; url: string }) => Promise<void>;
                };
                if (nav.share) {
                  try {
                    await nav.share({
                      title: t('app.name'),
                      text: t('profile.shareDesc'),
                      url: shareUrl(),
                    });
                    return;
                  } catch {
                    /* pengguna batal — jatuh balik ke salin pautan */
                  }
                }
                const ok = await copyText(shareUrl());
                showToast(ok ? t('toast.linkCopied') : t('toast.copyFailed'));
              }}
            >
              📤 {t('profile.shareLink')}
            </Btn>
          </div>
        </div>

        {/* Data */}
        <p className="section-title">{t('profile.data')}</p>
        <div className="stack">
          <button type="button" className="settings-row" onClick={() => { sound.play('tap'); exportData(); showToast(t('toast.backupDone')); }}>
            <span className="lead" aria-hidden="true">
              💾
            </span>
            <span className="grow">
              <b>{t('profile.export')}</b>
              <small>{t('profile.exportDesc')}</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
          <button type="button" className="settings-row" onClick={() => { sound.play('tap'); fileRef.current?.click(); }}>
            <span className="lead" aria-hidden="true">
              📥
            </span>
            <span className="grow">
              <b>{t('profile.import')}</b>
              <small>{t('profile.importDesc')}</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                await importData(f);
                showToast(t('toast.restored'));
              } catch {
                showToast(t('toast.invalidFile'));
              }
              e.target.value = '';
            }}
          />
          {profile && data.profiles.length > 1 ? (
            <button
              type="button"
              className="settings-row"
              onClick={() => {
                sound.play('tap');
                removeProfile(profile.id);
                showToast(t('toast.childRemoved'));
              }}
            >
              <span className="lead" aria-hidden="true">
                🚪
              </span>
              <span className="grow">
                <b>{t('profile.removeProfile')}</b>
                <small>{profile.name}</small>
              </span>
            </button>
          ) : null}
          <button type="button" className="settings-row" onClick={() => { sound.play('wrong'); setSheet('reset'); }}>
            <span className="lead" aria-hidden="true">
              ⚠️
            </span>
            <span className="grow">
              <b>{t('profile.reset')}</b>
              <small>{t('profile.resetDesc')}</small>
            </span>
          </button>
        </div>

        {/* Tentang */}
        <p className="section-title">{t('profile.about')}</p>
        <div className="card-flat">
          <p className="tiny muted center">
            🎒 <b>{t('app.name')}</b> {t('profile.version')} {APP_VERSION}
          </p>
          <p className="tiny muted center" style={{ marginTop: 6 }}>
            {settings.contrast ? '🔍' : '📚'} {stats.topics} {t('profile.catalogInfo')} • {stats.subjects}{' '}
            {t('profile.subjectsCount')} • {stats.years} {t('profile.yearsCount')}
          </p>
          <p className="tiny muted center" style={{ marginTop: 6 }}>
            {t('profile.aboutDesc')}
          </p>
          <p className="tiny muted center" style={{ marginTop: 6 }}>
            💚 {t('profile.privacyNote')}
          </p>
        </div>
      </div>

      {/* Helaian: tukar nama */}
      <Sheet open={sheet === 'name'} onClose={() => setSheet(null)} title={t('profile.editName')}>
        <div className="stack">
          <input
            className="text-input"
            value={nameDraft}
            maxLength={20}
            onChange={(e) => setNameDraft(e.target.value)}
            aria-label={t('onboard.name')}
          />
          <Btn
            block
            variant="success"
            onClick={() => {
              updateProfile({ name: nameDraft.trim() || 'Murid' });
              setSheet(null);
              showToast(t('toast.nameUpdated'));
            }}
          >
            {t('common.save')}
          </Btn>
        </div>
      </Sheet>

      {/* Helaian: tukar darjah */}
      <Sheet open={sheet === 'year'} onClose={() => setSheet(null)} title={t('profile.changeYear')}>
        <div className="year-picker">
          {([1, 2, 3, 4, 5, 6] as YearNum[]).map((y) => (
            <button
              key={y}
              type="button"
              className="pick pick-year"
              data-sel={profile?.year === y ? 'true' : 'false'}
              onClick={() => {
                sound.play('pop');
                updateProfile({ year: y });
                setSheet(null);
                showToast(`✅ ${yearLabel(lang, y)}`);
              }}
            >
              <b>
                {t('common.grade')} {y}
              </b>
              <span className="tiny muted">{yearTheme(lang, y, YEAR_THEME[y])}</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* Helaian: avatar */}
      <Sheet open={sheet === 'avatar'} onClose={() => setSheet(null)} title={t('profile.avatar')}>
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              className="pick"
              data-sel={profile?.avatar === a ? 'true' : 'false'}
              onClick={() => {
                sound.play('pop');
                updateProfile({ avatar: a });
                setSheet(null);
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Helaian: tambah murid */}
      <AddChildSheet
        open={sheet === 'add'}
        onClose={() => setSheet(null)}
        onAdd={(n, a, y) => {
          addProfile(n, a, y);
          setSheet(null);
          showToast(t('toast.childAdded'));
        }}
      />

      {/* Helaian: padam data */}
      <Sheet open={sheet === 'reset'} onClose={() => setSheet(null)} title={t('profile.resetConfirm')}>
        <div className="stack">
          <div className="card-flat" style={{ background: 'var(--danger-soft)' }}>
            <p className="tiny">
              ⚠️ {t('profile.resetDesc')} — semua murid, lencana, bintang dan rekod kemajuan akan dipadam.
            </p>
          </div>
          <Btn block variant="ghost" onClick={() => setSheet(null)}>
            {t('common.cancel')}
          </Btn>
          <Btn
            block
            variant="danger"
            onClick={() => {
              resetAll();
              setSheet(null);
              showToast(t('toast.dataCleared'));
            }}
          >
            {t('profile.reset')}
          </Btn>
        </div>
      </Sheet>
    </div>
  );
}

function AddChildSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, avatar: string, year: YearNum) => void;
}) {
  const t = useT();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [year, setYear] = useState<YearNum>(1);

  useEffect(() => {
    if (open) {
      setName('');
      setAvatar(AVATARS[0]);
      setYear(1);
    }
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title={t('profile.addChild')}>
      <div className="stack">
        <div>
          <p className="field-label">{t('onboard.name')}</p>
          <input
            className="text-input"
            value={name}
            placeholder={t('onboard.namePh')}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
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
                onClick={() => { sound.play('pop'); setAvatar(a); }}
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
                onClick={() => { sound.play('pop'); setYear(y); }}
              >
                <b>
                  {t('common.grade')} {y}
                </b>
              </button>
            ))}
          </div>
        </div>
        <Btn block variant="accent" onClick={() => onAdd(name, avatar, year)}>
          ＋ {t('profile.addChild')}
        </Btn>
      </div>
    </Sheet>
  );
}
