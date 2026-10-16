/**
 * Penjana nombor rawak berbenih.
 * Setiap sesi latihan menggunakan benih baharu supaya set soalan berbeza
 * setiap kali murid membuka aplikasi, tetapi masih boleh diulang dalam ujian.
 */

export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  /** Nombor perpuluhan [0, 1). */
  next(): number {
    // xorshift32 — pantas dan cukup baik untuk penjanaan soalan.
    let x = this.state;
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    this.state = x;
    return x / 4294967296;
  }

  /** Integer dalam [min, max]. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Pilih satu elemen. */
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Pilih n elemen unik (tanpa penggantian), tertib rawak. */
  sample<T>(arr: readonly T[], n: number): T[] {
    const pool = arr.slice();
    const out: T[] = [];
    const take = Math.min(n, pool.length);
    for (let i = 0; i < take; i += 1) {
      out.push(pool.splice(this.int(0, pool.length - 1), 1)[0]);
    }
    return out;
  }

  /** Salinan tertib rawak. */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Benar dengan kebarangkalian p. */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Benih baharu untuk setiap sesi latihan. */
  static sessionSeed(): number {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }
}
