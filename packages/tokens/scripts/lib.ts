/** Shared helpers for the token scripts (Node 22+ runs these .ts files directly). */

export type ScrapeCollection = {
  modes: string[];
  variables: Record<string, Record<string, string>>;
};
export type DtcgToken = { $type: string; $value: string | number };
export type DtcgTree = { [key: string]: DtcgTree | DtcgToken };

/** Which Figma mode of each collection the theme uses: Omni only, HOT + plain Light/Dark. */
export const THEMES = {
  omni: { primitives: 'HOT', semantic: { light: 'Light', dark: 'Dark' }, components: 'Omni' },
} as const;

/** `color/gray/700` → ['color','gray','700']; Figma names are lower-cased (`Slate`, `White`, `Subtle`). */
export const pathOf = (figmaName: string): string[] =>
  figmaName.split('/').map((p) => p.trim().toLowerCase());

/** `#RRGGBB · 30%` → `#RRGGBB4D` (alpha rounded, not truncated). */
export function normalizeColor(raw: string): string | null {
  const m = /^#([0-9a-f]{6})(?:\s*·\s*(\d+(?:\.\d+)?)%)?$/i.exec(raw.trim());
  if (!m) return null;
  const hex = m[1]!.toUpperCase();
  if (m[2] === undefined) return `#${hex}`;
  const alpha = Math.round((Number(m[2]) / 100) * 255);
  return `#${hex}${alpha.toString(16).padStart(2, '0').toUpperCase()}`;
}

/** Turns a Figma variable name + raw value into a DTCG token. */
export function toToken(name: string, raw: string, knownNames: Set<string>): DtcgToken {
  if (knownNames.has(raw)) {
    return { $type: typeForAlias(name), $value: `{${pathOf(raw).join('.')}}` };
  }
  const color = normalizeColor(raw);
  if (color) return { $type: 'color', $value: color };
  const [group] = pathOf(name);
  switch (group) {
    case 'scale':
    case 'font-size':
    case 'line-height':
    case 'border-width':
      return { $type: 'dimension', $value: `${Number(raw)}px` };
    case 'font-weight':
      return { $type: 'fontWeight', $value: Number(raw) };
    case 'font-family':
      return { $type: 'fontFamily', $value: raw };
    case 'letter-spacing':
      return { $type: 'dimension', $value: `${Number(raw)}em` };
    case 'opacity':
      return { $type: 'number', $value: Number(raw) };
    default:
      throw new Error(`No type rule for ${name} = ${raw}`);
  }
}

function typeForAlias(name: string): string {
  const [group] = pathOf(name);
  if (group === 'spacing' || group === 'radius') return 'dimension';
  if (name.startsWith('button/radius')) return 'dimension';
  return 'color';
}

export function setPath(tree: DtcgTree, path: string[], token: DtcgToken): void {
  let node = tree;
  for (const key of path.slice(0, -1)) {
    const next = node[key];
    if (next && '$value' in next) throw new Error(`Token/group clash at ${path.join('.')}`);
    node = (node[key] ??= {}) as DtcgTree;
  }
  const leaf = path.at(-1)!;
  if (node[leaf]) throw new Error(`Duplicate token after lower-casing: ${path.join('.')}`);
  node[leaf] = token;
}

/** Stable JSON: keys sorted so regenerated files diff cleanly. */
export function stableJson(value: unknown): string {
  const sort = (v: unknown): unknown =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, sort((v as Record<string, unknown>)[k])]),
        )
      : v;
  return `${JSON.stringify(sort(value), null, 2)}\n`;
}

/** Flattens a DTCG tree and resolves `{a.b.c}` aliases to final values. */
export function resolveTree(tree: DtcgTree): Map<string, string> {
  const flat = new Map<string, string | number>();
  const walk = (node: DtcgTree, path: string[]) => {
    for (const [k, v] of Object.entries(node)) {
      if (v && '$value' in v) flat.set([...path, k].join('.'), (v as DtcgToken).$value);
      else walk(v as DtcgTree, [...path, k]);
    }
  };
  walk(tree, []);
  const resolve = (key: string, seen: Set<string>): string => {
    const v = flat.get(key);
    if (v === undefined) throw new Error(`Unresolved alias {${key}}`);
    if (typeof v === 'string' && /^\{.+\}$/.test(v)) {
      const target = v.slice(1, -1);
      if (seen.has(target)) throw new Error(`Alias cycle at ${key}`);
      return resolve(target, new Set([...seen, target]));
    }
    return String(v);
  };
  return new Map([...flat.keys()].map((k) => [k, resolve(k, new Set([k]))]));
}

export const SCRAPE_COLLECTIONS = ['primitives', 'numeric', 'semantic', 'components'] as const;

/** The scraped Variables view as DTCG trees keyed `<collection>.<mode>`, the export's file layout. */
export function scrapeToTrees(
  data: Record<(typeof SCRAPE_COLLECTIONS)[number], ScrapeCollection>,
): Map<string, DtcgTree> {
  const knownNames = new Set(SCRAPE_COLLECTIONS.flatMap((c) => Object.keys(data[c].variables)));
  const trees = new Map<string, DtcgTree>();
  for (const c of SCRAPE_COLLECTIONS) {
    for (const mode of data[c].modes) {
      const tree: DtcgTree = {};
      for (const [name, byMode] of Object.entries(data[c].variables)) {
        const raw = byMode[mode];
        if (raw === undefined) throw new Error(`${c}/${name} has no value for mode ${mode}`);
        setPath(tree, pathOf(name), toToken(name, raw, knownNames));
      }
      trees.set(`${c}.${mode}`, tree);
    }
  }
  return trees;
}
