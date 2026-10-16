/**
 * One-off bridge until design commits Figma's native DTCG export: converts the scraped Variables
 * view (collections.json, primitives.json, numeric.json, semantic.json, components.json) into
 * figma/<collection>.<mode>.tokens.json in the same layout the native export uses.
 *
 *   node scripts/from-scrape.ts [scrape-dir]   (default: reference/figma-scrape)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCRAPE_COLLECTIONS, scrapeToTrees, stableJson, type ScrapeCollection } from './lib.ts';

const dir = process.argv[2] ?? new URL('../reference/figma-scrape/', import.meta.url).pathname;
const outDir = new URL('../figma/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const data = Object.fromEntries(
  SCRAPE_COLLECTIONS.map((c) => [
    c,
    JSON.parse(readFileSync(join(dir, `${c}.json`), 'utf8')) as ScrapeCollection,
  ]),
) as Record<(typeof SCRAPE_COLLECTIONS)[number], ScrapeCollection>;

const trees = scrapeToTrees(data);
for (const [key, tree] of trees)
  writeFileSync(join(outDir, `${key}.tokens.json`), stableJson(tree));
console.log(`wrote ${trees.size} DTCG files to figma/`);
