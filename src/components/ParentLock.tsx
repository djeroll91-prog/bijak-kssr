/** Dialog gerbang ibu bapa: tetapkan atau sahkan PIN 4 digit. */

import { useEffect, useState } from 'react';
import { useStore, useT } from '../state/store';
import { Sheet, Btn } from './ui';
import { PIN_LENGTH, hashPin, verifyPin } from '../lib/parentLock';
import { sound } from '../lib/audio';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function ParentLockSheet({
  open,
  onClose,
  mode,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  /** 'verify' meminta PIN sedia ada; 'set' menetapkan PIN baharu. */
  mode: 'verify' | 'set';
  onVerified?: () => void;
}) {
  const { settings, setSetting, showToast } = useStore();
  const t = useT();
  const [entry, setEntry] = useState('');
  const [first, setFirst] = useState('');
  const [stage, setStage] = useState<'first' | 'confirm'>('first');
  const [error, setError] = useState('');

  // Setiap kali dialog dibuka, mulakan semula supaya PIN lama tidak tertinggal.
  useEffect(() => {
    if (!open) return;
    setEntry('');
    setFirst('');
    setStage('first');
    setError('');
  }, [open, mode]);

  const hasPin = Boolean(settings.parentPinHash);

  const finish = (pin: string) => {
    if (mode === 'verify') {
      if (verifyPin(pin, settings.parentPinHash)) {
        sound.play('correct');
        onVerified?.();
        onClose();
      } else {
        sound.play('wrong');
        setError(t('lock.wrong'));
        setEntry('');
      }
      return;
    }
    // Mod set: minta ulangan supaya tiada salah taip.
    if (stage === 'first') {
      setFirst(pin);
      setStage('confirm');
      setEntry('');
      setError('');
      return;
    }
    if (pin !== first) {
      sound.play('wrong');
      setError(t('lock.mismatch'));
      setFirst('');
      setStage('first');
      setEntry('');
      return;
    }
    setSetting('parentPinHash', hashPin(pin));
    sound.play('levelup');
    showToast(t('lock.saved'));
    onClose();
  };

  const press = (key: string) => {
    if (key === '') return;
    if (key === 'del') {
      sound.play('tap');
      setEntry((v) => v.slice(0, -1));
      return;
    }
    sound.play('tap');
    setError('');
    const next = (entry + key).slice(0, PIN_LENGTH);
    setEntry(next);
    if (next.length === PIN_LENGTH) {
      // Beri masa paparan digit terakhir sebelum bertindak.
      window.setTimeout(() => finish(next), 130);
    }
  };

  const title =
    mode === 'set'
      ? hasPin
        ? t('lock.change')
        : t('lock.setTitle')
      : t('lock.enterTitle');
  const desc =
    mode === 'set'
      ? stage === 'confirm'
        ? t('lock.confirmPin')
        : t('lock.setDesc')
      : t('lock.enterDesc');

  return (
    <Sheet open={open} onClose={onClose} title={`🔒 ${title}`}>
      <div className="stack">
        <p className="tiny muted center" style={{ margin: 0 }}>
          {desc}
        </p>

        <div className="pin-dots" role="status" aria-live="polite" aria-label={t('lock.enterPin')}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span key={i} className="pin-dot" data-filled={i < entry.length ? 'true' : 'false'} />
          ))}
        </div>

        {error ? (
          <p className="tiny center pin-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="pin-pad">
          {KEYS.map((k, i) =>
            k === '' ? (
              <span key={`gap-${i}`} />
            ) : (
              <button
                key={k}
                type="button"
                className="pin-key"
                aria-label={k === 'del' ? '⌫' : k}
                onClick={() => press(k)}
              >
                {k === 'del' ? '⌫' : k}
              </button>
            ),
          )}
        </div>

        <Btn block variant="ghost" onClick={onClose}>
          {t('common.cancel')}
        </Btn>
        <p className="tiny muted center" style={{ margin: 0 }}>
          {t('lock.forgot')}
        </p>
      </div>
    </Sheet>
  );
}

/**
 * Buka dialog PIN jika perlu, atau jalankan tindakan terus jika PIN belum
 * ditetapkan. Mengelak ibu bapa daripada terkunci keluar daripada aplikasi.
 */
export function useParentGate() {
  const { settings } = useStore();
  const [pending, setPending] = useState<(() => void) | null>(null);
  const needsPin = Boolean(settings.parentPinHash);

  return {
    needsPin,
    /** Tindakan yang menunggu PIN disahkan, atau null. */
    pending,
    /** Jalankan `action`, minta PIN dahulu jika perlu. */
    run: (action: () => void) => {
      if (!needsPin) {
        action();
        return;
      }
      setPending(() => action);
    },
    /** PIN betul: jalankan tindakan yang menunggu. */
    resolve: () => {
      setPending((fn) => {
        fn?.();
        return null;
      });
    },
    cancel: () => setPending(null),
  };
}
