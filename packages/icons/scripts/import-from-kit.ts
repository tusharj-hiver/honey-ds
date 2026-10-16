/**
 * One-off import from hiver-ui-kit: copies src/v2Icons/<category>/*.svg into svg/ and records the
 * kit's component name for each file in names.json, so both libraries use the same names.
 *
 *   node scripts/import-from-kit.ts <hiver-ui-kit dir>
 */
import { cpSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const kit = process.argv[2];
if (!kit) throw new Error('usage: node scripts/import-from-kit.ts <hiver-ui-kit dir>');
const src = join(kit, 'src/v2Icons');
const here = new URL('..', import.meta.url).pathname;

const names: Record<string, string> = {};
for (const file of readdirSync(src).filter(
  (f) => f.endsWith('.ts') && !['index.ts', 'manifest.ts'].includes(f),
)) {
  const m = /import \{ ReactComponent \} from '\.\/(.+\.svg)'/.exec(
    readFileSync(join(src, file), 'utf8'),
  );
  if (!m) throw new Error(`Unexpected wrapper format: ${file}`);
  names[m[1]!] = file.slice(0, -3);
}
const categories = readdirSync(src).filter((d) => statSync(join(src, d)).isDirectory());
for (const c of categories) cpSync(join(src, c), join(here, 'svg', c), { recursive: true });

const sorted = Object.fromEntries(Object.entries(names).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(here, 'names.json'), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`imported ${Object.keys(sorted).length} icons in ${categories.length} categories`);
