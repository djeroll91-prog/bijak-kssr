/** Komponen UI yang dikongsi seluruh aplikasi. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { sound } from '../lib/audio';
import type { Note } from '../data/types';
import { useT } from '../state/store';

/* ------------------------------------------------------------------ */
/* Butang & cip                                                        */
/* ------------------------------------------------------------------ */

export function Btn({
  children,
  onClick,
  variant = 'primary',
  block,
  small,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'success' | 'ghost' | 'danger';
  block?: boolean;
  small?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const cls = [
    'btn',
    variant === 'accent' ? 'btn-accent' : '',
    variant === 'success' ? 'btn-success' : '',
    variant === 'ghost' ? 'btn-ghost' : '',
    variant === 'danger' ? 'btn-danger' : '',
    block ? 'btn-block' : '',
    small ? 'btn-sm' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={cls}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => {
        sound.play('tap');
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function Chip({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'brand' | 'success' | 'warn' | 'danger';
}) {
  const cls =
    tone === 'brand'
      ? 'chip chip-brand'
      : tone === 'success'
        ? 'chip chip-success'
        : tone === 'warn'
          ? 'chip chip-warn'
          : tone === 'danger'
            ? 'chip chip-danger'
            : 'chip';
  return <span className={cls}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Bar atas                                                            */
/* ------------------------------------------------------------------ */

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const t = useT();
  return (
    <div className="topbar">
      {onBack ? (
        <button
          type="button"
          className="icon-btn"
          aria-label={t('common.back')}
          onClick={() => {
            sound.play('tap');
            onBack();
          }}
        >
          ←
        </button>
      ) : null}
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Konfeti                                                             */
/* ------------------------------------------------------------------ */

const CONFETTI_COLOURS = [
  '#6c5ce7', '#ffb84c', '#17a673', '#e0608f', '#3d92d6',
  '#f7a83a', '#8e7bf5', '#4dd4a0',
];

export function Confetti({ fireKey, count = 70 }: { fireKey: number; count?: number }) {
  const [bits, setBits] = useState<
    { id: number; left: number; dx: number; delay: number; dur: number; colour: string; w: number; h: number }[]
  >([]);

  useEffect(() => {
    if (fireKey <= 0) return;
    const next = Array.from({ length: count }, (_, i) => ({
      id: fireKey * 1000 + i,
      left: Math.random() * 100,
      dx: (Math.random() - 0.5) * 160,
      delay: Math.random() * 0.5,
      dur: 1.9 + Math.random() * 1.4,
      colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
      w: 7 + Math.random() * 8,
      h: 10 + Math.random() * 10,
    }));
    setBits(next);
    const t = window.setTimeout(() => setBits([]), 3800);
    return () => window.clearTimeout(t);
  }, [fireKey, count]);

  if (bits.length === 0) return null;
  return (
    <div className="confetti-layer" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="confetti-bit"
          style={{
            left: `${b.left}%`,
            width: b.w,
            height: b.h,
            background: b.colour,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            ['--dx' as string]: `${b.dx}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cincin kemajuan (SVG)                                               */
/* ------------------------------------------------------------------ */

export function ProgressRing({
  value,
  size = 48,
  stroke = 5,
  colour = 'var(--brand)',
  track = 'var(--surface-sunken)',
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  colour?: string;
  track?: string;
  label?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="chart" role="img">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colour}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.28}
        fontWeight="900"
        fill="var(--ink)"
      >
        {label ?? `${Math.round(pct)}%`}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Carta garis trend                                                   */
/* ------------------------------------------------------------------ */

export function TrendChart({
  points,
  height = 132,
}: {
  points: { label: string; value: number }[];
  height?: number;
}) {
  const w = 300;
  const pad = { top: 14, right: 8, bottom: 22, left: 26 };
  const innerW = w - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxV = 100;

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? pad.left + innerW / 2 : pad.left + (i / (points.length - 1)) * innerW;
    const y = pad.top + innerH - (Math.max(0, Math.min(maxV, p.value)) / maxV) * innerH;
    return { x, y, ...p };
  });

  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${pad.left},${pad.top + innerH} ${line} ${pad.left + innerW},${pad.top + innerH}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="chart" role="img" aria-label="Carta trend markah">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => {
        const y = pad.top + innerH - (g / maxV) * innerH;
        return (
          <g key={g}>
            <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="var(--surface-sunken)" strokeWidth="1" />
            <text x={pad.left - 5} y={y} textAnchor="end" dominantBaseline="central" fontSize="8" fill="var(--ink-faint)" fontWeight="800">
              {g}
            </text>
          </g>
        );
      })}
      {coords.length > 1 ? <polygon points={area} fill="url(#trendFill)" /> : null}
      {coords.length > 1 ? (
        <polyline
          points={line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="4.4" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2.6" />
          <text x={c.x} y={height - 7} textAnchor="middle" fontSize="8" fill="var(--ink-faint)" fontWeight="800">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Carta palang                                                        */
/* ------------------------------------------------------------------ */

export function BarList({
  rows,
}: {
  rows: { label: string; value: number; max?: number; colour?: string; suffix?: string }[];
}) {
  return (
    <div>
      {rows.map((r) => {
        const max = r.max ?? 100;
        const pct = max > 0 ? Math.max(0, Math.min(100, (r.value / max) * 100)) : 0;
        return (
          <div className="bar-row" key={r.label}>
            <span className="lbl" title={r.label}>
              {r.label}
            </span>
            <span className="bar-track">
              <i style={{ width: `${pct}%`, background: r.colour ?? 'var(--brand)' }} />
            </span>
            <span className="val">
              {Math.round(r.value)}
              {r.suffix ?? ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nota pembelajaran                                                   */
/* ------------------------------------------------------------------ */

const NOTE_HEAD: Record<Note['kind'], { icon: string; label: string }> = {
  tip: { icon: '💡', label: 'Tip' },
  example: { icon: '📌', label: 'Contoh' },
  formula: { icon: '🧮', label: 'Formula' },
  fun: { icon: '🎉', label: 'Seronok!' },
};

export function NoteCard({ note, onSpeak }: { note: Note; onSpeak?: (text: string) => void }) {
  const head = NOTE_HEAD[note.kind];
  const text = [note.title, note.body, ...(note.bullets ?? [])].filter(Boolean).join('. ');
  return (
    <div className="note-block" data-kind={note.kind}>
      <h4>
        <span aria-hidden="true">{head.icon}</span>
        {note.title}
      </h4>
      {note.body ? <p>{note.body}</p> : null}
      {note.bullets ? (
        <ul>
          {note.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
      {note.emojiRow ? (
        <div className="big-emoji-row" aria-hidden="true">
          {note.emojiRow}
        </div>
      ) : null}
      {onSpeak ? (
        <button
          type="button"
          className="chip chip-brand"
          style={{ marginTop: 10 }}
          onClick={() => onSpeak(text)}
        >
          🔊 Baca
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lencana                                                             */
/* ------------------------------------------------------------------ */

export function BadgeTile({
  emoji,
  name,
  how,
  locked,
}: {
  emoji: string;
  name: string;
  how: string;
  locked?: boolean;
}) {
  return (
    <div className="badge-card" data-locked={locked ? 'true' : 'false'}>
      <span className="b-emoji" aria-hidden="true">
        {locked ? '🔒' : emoji}
      </span>
      <b>{name}</b>
      <small>{how}</small>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Baris tetapan                                                       */
/* ------------------------------------------------------------------ */

export function ToggleRow({
  lead,
  title,
  desc,
  on,
  onChange,
}: {
  lead: string;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="settings-row"
      role="switch"
      aria-checked={on}
      onClick={() => {
        sound.play(on ? 'tap' : 'pop');
        onChange(!on);
      }}
    >
      <span className="lead" aria-hidden="true">
        {lead}
      </span>
      <span className="grow">
        <b>{title}</b>
        <small>{desc}</small>
      </span>
      <span className="switch" data-on={on ? 'true' : 'false'} aria-hidden="true" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Helaian modal                                                       */
/* ------------------------------------------------------------------ */

export function Sheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet">
        <div className="sheet-grab" aria-hidden="true" />
        {title ? <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 14 }}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Keadaan kosong                                                      */
/* ------------------------------------------------------------------ */

export function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc?: string }) {
  return (
    <div className="empty">
      <span className="e-emoji" aria-hidden="true">
        {emoji}
      </span>
      <b style={{ fontSize: '1rem', fontWeight: 900 }}>{title}</b>
      {desc ? <p className="muted tiny" style={{ marginTop: 6 }}>{desc}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kira masa / kiraan animasi                                          */
/* ------------------------------------------------------------------ */

/** Nombor yang melompat ke nilai baharu dengan animasi. */
export function useAnimatedNumber(target: number, duration = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** Jam pemasa ringkas. */
export function useElapsed(running: boolean): number {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return secs;
}

/** Susun ungkapan sifar di hadapan. */
export function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

/** Cipta benih yang stabil untuk satu sesi latihan. */
export function useSessionSeed(topicId: string | undefined, nonce: number): number {
  return useMemo(() => {
    if (!topicId) return 1;
    let h = 2166136261;
    for (let i = 0; i < topicId.length; i += 1) {
      h ^= topicId.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h ^ nonce) >>> 0) || 1;
  }, [topicId, nonce]);
}
