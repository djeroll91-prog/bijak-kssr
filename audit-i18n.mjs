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
console.log(`keys used: ${used.size} | MS: ${ms.size} | EN: ${en.size}`);
console.log(`MISSING in MS: ${missingMs.length}`);
missingMs.forEach((k) => console.log('  ', k, '->', [...used.get(k)].join(', ')));
console.log(`MISSING in EN: ${missingEn.length}`);
missingEn.forEach((k) => console.log('  ', k, '->', [...used.get(k)].join(', ')));
console.log(`UNUSED in MS: ${[...ms].filter((k) => !used.has(k)).length}`);
