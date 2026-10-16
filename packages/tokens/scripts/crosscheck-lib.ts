import { resolveTree, THEMES, type DtcgTree } from './lib.ts';

export type Finding = { level: 'error' | 'warn'; where: string; message: string };

function stack(trees: Map<string, DtcgTree>, files: string[]): DtcgTree {
  const merged: DtcgTree = {};
  for (const f of files) {
    const tree = trees.get(f);
    if (!tree) throw new Error(`missing ${f}.tokens.json`);
    Object.assign(merged, structuredClone(tree));
  }
  return merged;
}

/**
 * Compares the committed Figma export with the scraped Variables view, both resolved per theme ×
 * scheme. Values are compared after alias resolution, so an export that aliases differently but
 * lands on the same colour is fine; a different final value, or a token one side lacks, is not.
 */
export function crosscheck(
  exported: Map<string, DtcgTree>,
  scraped: Map<string, DtcgTree>,
): Finding[] {
  const findings: Finding[] = [];
  for (const key of new Set([...exported.keys(), ...scraped.keys()])) {
    if (!exported.has(key))
      findings.push({ level: 'error', where: key, message: 'in the scrape, not in figma/' });
    else if (!scraped.has(key))
      findings.push({ level: 'error', where: key, message: 'in figma/, not in the scrape' });
  }
  if (findings.length) return findings;

  for (const [theme, t] of Object.entries(THEMES)) {
    for (const [scheme, semantic] of Object.entries(t.semantic)) {
      const files = [
        `primitives.${t.primitives}`,
        'numeric.Default',
        `semantic.${semantic}`,
        `components.${t.components}`,
      ];
      const a = resolveTree(stack(exported, files));
      const b = resolveTree(stack(scraped, files));
      const where = `${theme}/${scheme}`;
      for (const [k, v] of a) {
        const s = b.get(k);
        if (s === undefined)
          findings.push({ level: 'error', where, message: `${k} only in figma/ (${v})` });
        else if (s.toUpperCase() !== v.toUpperCase())
          findings.push({ level: 'error', where, message: `${k}: figma/ ${v} ≠ scrape ${s}` });
      }
      for (const k of b.keys())
        if (!a.has(k)) findings.push({ level: 'error', where, message: `${k} only in the scrape` });
    }
  }
  return findings;
}

/**
 * The scrape's resolved values were read in Figma with Default primitives selected. Re-resolving
 * its aliases against Default must reproduce them; anything else means the scrape is stale.
 */
export function checkScrapeResolution(
  scraped: Map<string, DtcgTree>,
  resolvedByMode: Record<string, Record<string, { value: string }>>,
): Finding[] {
  const findings: Finding[] = [];
  for (const [mode, values] of Object.entries(resolvedByMode)) {
    const ours = resolveTree(
      stack(scraped, ['primitives.Default', 'numeric.Default', `semantic.${mode}`]),
    );
    for (const [name, { value }] of Object.entries(values)) {
      const key = name.toLowerCase().split('/').join('.');
      const got = ours.get(key);
      if (got === undefined || !sameColor(got, value))
        findings.push({
          level: 'warn',
          where: `scrape ${mode}`,
          message: `${name}: ${got} ≠ ${value}`,
        });
    }
  }
  return findings;
}

/**
 * `#94A3B8` vs `#94A3B8FF` are the same colour, and alpha may differ by one step: the scrape
 * truncates 30% to 4C where the build rounds it to 4D.
 */
function sameColor(a: string, b: string): boolean {
  const norm = (c: string) => {
    const m = /^#([0-9a-f]{6})(?:([0-9a-f]{2}))?$/i.exec(c.trim());
    if (m) return `#${m[1]!.toUpperCase()}${(m[2] ?? 'FF').toUpperCase()}`;
    const p = /^#([0-9a-f]{6})\s*·\s*(\d+(?:\.\d+)?)%$/i.exec(c.trim());
    if (p)
      return `#${p[1]!.toUpperCase()}${Math.round((Number(p[2]) / 100) * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()}`;
    return c.trim();
  };
  const [x, y] = [norm(a), norm(b)];
  if (x === y) return true;
  return (
    x.length === 9 &&
    x.slice(0, 7) === y.slice(0, 7) &&
    Math.abs(parseInt(x.slice(7), 16) - parseInt(y.slice(7), 16)) <= 1
  );
}
