/**
 * Yarn 1 has no version catalog, so the same dependency is pinned in several package.json files.
 * Fails when two workspaces ask for different versions of one dependency.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type Manifest = { name: string } & Partial<
  Record<'dependencies' | 'devDependencies', Record<string, string>>
>;

const root = new URL('../../', import.meta.url).pathname;
const rootManifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  workspaces: string[];
};
const dirs = [
  '.',
  ...rootManifest.workspaces.flatMap((glob) => {
    const parent = glob.replace(/\/\*$/, '');
    return readdirSync(join(root, parent), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join(parent, d.name));
  }),
];

const seen = new Map<string, Map<string, string[]>>();
for (const dir of dirs) {
  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf8')) as Manifest;
  } catch {
    continue;
  }
  for (const deps of [manifest.dependencies, manifest.devDependencies]) {
    for (const [dep, range] of Object.entries(deps ?? {})) {
      if (dep.startsWith('@honey-ds/')) continue;
      const ranges = seen.get(dep) ?? new Map<string, string[]>();
      ranges.set(range, [...(ranges.get(range) ?? []), manifest.name]);
      seen.set(dep, ranges);
    }
  }
}

const conflicts = [...seen].filter(([, ranges]) => ranges.size > 1);
for (const [dep, ranges] of conflicts) {
  console.error(`${dep}:`);
  for (const [range, users] of ranges) console.error(`  ${range}  ${users.join(', ')}`);
}
if (conflicts.length) {
  console.error(`\n${conflicts.length} dependencies have mismatched versions.`);
  process.exit(1);
}
console.log(`versions: ${seen.size} external dependencies, all consistent`);
