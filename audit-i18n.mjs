import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const i18n = readFileSync('src/lib/i18n.ts', 'utf8');
const msStart = i18n.indexOf('const MS: Dict = {');
const enStart = i18n.indexOf('const EN: Dict = {');
const msBlock = i18n.slice(msStart, enStart);
const enBlock = i18n.slice(enStart, i18n.indexOf('const DICTS'));
const keysOf = (b) => new Set([...b.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
const ms = keysOf(msBlock);
const en = keysOf(enBlock);

function walk(d) {
  return readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.tsx?$/.test(p) ? [p] : [];
  });
}

const used = new Map();
for (const f of walk('src')) {
  if (f.endsWith('i18n.ts')) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(/\bt\(\s*'([^']+)'/g)) {
    if (!used.has(m[1])) used.set(m[1], new Set());
    used.get(m[1]).add(f);
  }
}

const missingMs = [...used.keys()].filter((k) => !ms.has(k));
const missingEn = [...used.keys()].filter((k) => !en.has(k));

// Sesetengah kunci dirujuk secara dinamik (cth. `t(tip.titleKey)`), jadi
// pengesanan literal `t('...')` sahaja tidak mencukupi. Untuk penentuan
// "benar-benar tidak digunakan", kita imbas setiap fail sumber dan anggap
// kunci sebagai terpakai jika rentetannya muncul di mana-mana di luar i18n.ts.
const srcText = walk('src')
  .filter((f) => !f.endsWith('i18n.ts'))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

const trulyUnused = [...ms].filter((k) => !srcText.includes(`'${k}'`) && !srcText.includes(`"${k}"`) && !srcText.includes(`\`${k}\``));

console.log(`keys used: ${used.size} | MS: ${ms.size} | EN: ${en.size}`);
console.log(`MISSING in MS: ${missingMs.length}`);
missingMs.forEach((k) => console.log('  ', k, '->', [...used.get(k)].join(', ')));
console.log(`MISSING in EN: ${missingEn.length}`);
missingEn.forEach((k) => console.log('  ', k, '->', [...used.get(k)].join(', ')));
console.log(`UNUSED in MS (literal t() sahaja): ${[...ms].filter((k) => !used.has(k)).length}`);
console.log(`TRULY UNUSED in MS (tiada rujukan langsung): ${trulyUnused.length}`);
trulyUnused.forEach((k) => console.log('  ', k));
if (trulyUnused.length > 0) process.exitCode = 1;
