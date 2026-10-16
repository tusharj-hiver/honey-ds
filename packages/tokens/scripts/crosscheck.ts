/**
 * tokens-check: the committed Figma export (figma/) against the scraped Variables view
 * (reference/figma-scrape/). Fails on any unexpected difference; scrape staleness is a warning.
 * It guards the switch from the scrape to design's first real export: once that export is
 * accepted, delete reference/figma-scrape/ and this check turns itself off.
 *
 *   node scripts/crosscheck.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { SCRAPE_COLLECTIONS, scrapeToTrees, type DtcgTree, type ScrapeCollection } from './lib.ts';
import { checkScrapeResolution, crosscheck } from './crosscheck-lib.ts';

const root = new URL('..', import.meta.url).pathname;
if (!existsSync(root + 'reference/figma-scrape')) {
  console.log('cross-check: no reference/figma-scrape, skipped');
  process.exit(0);
}
const readJson = <T>(rel: string): T => JSON.parse(readFileSync(root + rel, 'utf8')) as T;

const exported = new Map<string, DtcgTree>(
  readdirSync(root + 'figma')
    .filter((f) => f.endsWith('.tokens.json'))
    .map((f) => [f.replace(/\.tokens\.json$/, ''), readJson<DtcgTree>(`figma/${f}`)]),
);
const scrapeData = Object.fromEntries(
  SCRAPE_COLLECTIONS.map((c) => [
    c,
    readJson<ScrapeCollection>(`reference/figma-scrape/${c}.json`),
  ]),
) as Record<(typeof SCRAPE_COLLECTIONS)[number], ScrapeCollection>;
const scraped = scrapeToTrees(scrapeData);

const resolvedByMode = Object.fromEntries(
  scrapeData.semantic.modes.map((mode) => [
    mode,
    readJson<Record<string, { value: string }>>(
      `reference/figma-scrape/semantic-${mode
        .toLowerCase()
        .replace(/\s*-\s*/g, '-')
        .replace(/\s+/g, '-')}.json`,
    ),
  ]),
);

const findings = [
  ...crosscheck(exported, scraped),
  ...checkScrapeResolution(scraped, resolvedByMode),
];
for (const f of findings) {
  const line = `${f.where}: ${f.message}`;
  console.log(f.level === 'error' ? `::error::${line}` : `::warning::${line}`);
}
const errors = findings.filter((f) => f.level === 'error').length;
console.log(`cross-check: ${errors} errors, ${findings.length - errors} warnings`);
process.exitCode = errors ? 1 : 0;
