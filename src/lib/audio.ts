/**
 * Enjin kesan bunyi menggunakan Web Audio API.
 * Semua bunyi dijana secara sintetik — tiada fail audio, jadi aplikasi
 * boleh berfungsi sepenuhnya di luar talian dan kekal ringan.
 */

type SoundName =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'star'
  | 'levelup'
  | 'badge'
  | 'whoosh'
  | 'pop'
  | 'tick'
  | 'win';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = true;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  /** Sediakan konteks audio selepas interaksi pertama murid. */
  unlock(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    gain: number,
  ): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    env.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    env.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    osc.connect(env);
    env.connect(master);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.02);
  }

  private glide(from: number, to: number, dur: number, gain: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 20), ctx.currentTime + dur);
    env.gain.setValueAtTime(0.0001, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(env);
    env.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  private noise(dur: number, gain: number, hp = 800): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    const env = ctx.createGain();
    env.gain.value = gain;
    src.connect(filter);
    filter.connect(env);
    env.connect(master);
    src.start();
  }

  play(name: SoundName): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    switch (name) {
      case 'tap':
        this.tone(520, 0, 0.07, 'sine', 0.18);
        break;
      case 'pop':
        this.glide(420, 900, 0.12, 0.2);
        break;
      case 'tick':
        this.tone(1200, 0, 0.035, 'square', 0.06);
        break;
      case 'correct':
        this.tone(660, 0, 0.12, 'sine', 0.22);
        this.tone(880, 0.1, 0.16, 'sine', 0.2);
        this.tone(1320, 0.2, 0.22, 'sine', 0.14);
        break;
      case 'wrong':
        this.tone(220, 0, 0.16, 'triangle', 0.2);
        this.tone(160, 0.12, 0.22, 'triangle', 0.16);
        break;
      case 'star':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, i * 0.07, 0.2, 'sine', 0.16));
        break;
      case 'badge':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.1, 0.3, 'triangle', 0.15));
        break;
      case 'levelup':
        [523, 587, 659, 784, 880, 1047].forEach((f, i) =>
          this.tone(f, i * 0.075, 0.26, 'sine', 0.15),
        );
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.4, 'triangle', 0.18));
        this.tone(1319, 0.46, 0.6, 'sine', 0.16);
        break;
      case 'whoosh':
        this.noise(0.24, 0.1, 600);
        break;
    }
  }

  /** Bunyi blip kecil untuk kira detik pemasa. */
  tickUrgent(): void {
    if (!this.enabled) return;
    this.ensure();
    this.tone(1400, 0, 0.05, 'square', 0.1);
  }
}

export const sound = new SoundEngine();

/**
 * Suara bacaan menggunakan Web Speech API.
 * Bahasa disokong: Bahasa Melayu (ms-MY) dan Inggeris (en-GB/en-US).
 *
 * Nota penting: ada peranti/penyemak imbas yang tidak menyediakan suara
 * Bahasa Melayu. Enjin ini memilih suara terbaik yang ada dan memecahkan
 * teks panjang kepada bahagian kecil supaya bacaan tidak terhenti.
 */
class VoiceEngine {
  private enabled = false;
  private voiceMs: SpeechSynthesisVoice | null = null;
  private voiceEn: SpeechSynthesisVoice | null = null;
  private queue: string[] = [];
  private speaking = false;

  /** Adakah API suara tersedia pada peranti ini? */
  get supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on && this.supported) {
      window.speechSynthesis.cancel();
      this.queue = [];
      this.speaking = false;
    } else if (on) {
      this.loadVoices();
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  loadVoices(): void {
    if (!this.supported) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;
    // Utamakan suara Bahasa Melayu; jika tiada, Indonesia paling hampir.
    this.voiceMs =
      voices.find((v) => /^ms/i.test(v.lang)) ??
      voices.find((v) => /malay|melayu/i.test(v.name)) ??
      voices.find((v) => /^id/i.test(v.lang)) ??
      null;
    this.voiceEn =
      voices.find((v) => /^en-GB/i.test(v.lang)) ??
      voices.find((v) => /^en/i.test(v.lang)) ??
      null;
  }

  /** Pecahkan teks panjang kepada ayat supaya setiap bahagian dibaca lancar. */
  private split(text: string): string[] {
    const parts = text
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const out: string[] = [];
    let buf = '';
    for (const p of parts.length ? parts : [text]) {
      if ((buf + ' ' + p).trim().length > 200) {
        if (buf) out.push(buf.trim());
        buf = p;
      } else {
        buf = (buf + ' ' + p).trim();
      }
    }
    if (buf) out.push(buf.trim());
    return out;
  }

  /** Baca teks dengan bahasa yang dipilih. */
  speak(text: string, lang: 'ms' | 'en' = 'ms'): void {
    if (!this.enabled || !this.supported) return;
    this.loadVoices();
    const clean = text.replace(/[_#*`]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    window.speechSynthesis.cancel();
    this.queue = this.split(clean);
    this.speaking = false;
    this.drain(lang);
  }

  private drain(lang: 'ms' | 'en'): void {
    if (!this.supported) return;
    if (this.speaking) return;
    const next = this.queue.shift();
    if (!next) return;
    this.speaking = true;
    const u = new SpeechSynthesisUtterance(next);
    u.lang = lang === 'en' ? 'en-GB' : 'ms-MY';
    const voice = lang === 'en' ? this.voiceEn : this.voiceMs;
    if (voice) u.voice = voice;
    u.rate = 0.92;
    u.pitch = 1.08;
    const done = () => {
      this.speaking = false;
      this.drain(lang);
    };
    u.onend = done;
    u.onerror = done;
    // Sesetengah peranti "tersekat" jika terlalu lama; pastikan diteruskan.
    window.speechSynthesis.speak(u);
  }

  stop(): void {
    if (this.supported) window.speechSynthesis.cancel();
    this.queue = [];
    this.speaking = false;
  }
}

export const voice = new VoiceEngine();

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => voice.loadVoices();
  voice.loadVoices();
}
