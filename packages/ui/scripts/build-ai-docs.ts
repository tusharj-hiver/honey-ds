/**
 * Builds docs/ai/ — the catalogue AI coding assistants read before building screens (F-22).
 * Inputs: Storybook's own manifest (props, defaults, story snippets; written by `storybook build`),
 * each story's `parameters.design.figmaNode` and `parameters.ai` (read with the TS parser),
 * @honey-ds/tokens dist/tokens.json and @honey-ds/icons manifest.json.
 *
 *   yarn build-storybook && node scripts/build-ai-docs.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';

const ui = new URL('..', import.meta.url).pathname;
const repo = join(ui, '../..');
const out = join(repo, 'docs/ai');

type Prop = {
  required?: boolean;
  description?: string;
  tsType?: { name?: string; raw?: string };
  defaultValue?: { value: string };
};
type ManifestComponent = {
  id: string;
  name: string;
  path: string;
  reactDocgen?: { description?: string; props?: Record<string, Prop> };
  stories?: { id: string; name: string; snippet?: string }[];
};
const manifest = JSON.parse(
  readFileSync(join(ui, 'storybook-static/manifests/components.json'), 'utf8'),
) as {
  components: Record<string, ManifestComponent>;
};

/** Reads string-valued fields of `parameters.design` and `parameters.ai` from a stories file. */
function readParameters(file: string): { figmaNode?: string; ai: Record<string, string> } {
  const src = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const found: { figmaNode?: string; ai: Record<string, string> } = { ai: {} };
  const strings = (obj: ts.ObjectLiteralExpression) =>
    Object.fromEntries(
      obj.properties.flatMap((p) =>
        ts.isPropertyAssignment(p) &&
        ts.isIdentifier(p.name) &&
        ts.isStringLiteralLike(p.initializer)
          ? [[p.name.text, p.initializer.text]]
          : [],
      ),
    );
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      if (node.name.text === 'ai') found.ai = strings(node.initializer);
      if (node.name.text === 'design') found.figmaNode = strings(node.initializer).figmaNode;
    }
    ts.forEachChild(node, visit);
  };
  visit(src);
  return found;
}

const problems: string[] = [];
const components = Object.values(manifest.components)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((c) => {
    const params = readParameters(join(ui, c.path));
    for (const key of ['summary', 'useWhen', 'avoidWhen']) {
      if (!params.ai[key]) problems.push(`${c.path}: parameters.ai.${key} is missing`);
    }
    if (!params.figmaNode) problems.push(`${c.path}: parameters.design.figmaNode is missing`);
    return {
      name: c.name,
      import: `import { ${c.name} } from '@honey-ds/ui';`,
      // 'none' marks a code-only foundation with no Figma counterpart (e.g. ShadowRoot).
      figmaNode: params.figmaNode && params.figmaNode !== 'none' ? params.figmaNode : null,
      summary: params.ai.summary ?? '',
      useWhen: params.ai.useWhen ?? '',
      avoidWhen: params.ai.avoidWhen ?? '',
      props: Object.entries(c.reactDocgen?.props ?? {}).map(([name, p]) => ({
        name,
        type: p.tsType?.raw ?? p.tsType?.name ?? 'unknown',
        required: Boolean(p.required),
        default: p.defaultValue?.value ?? null,
        description: p.description ?? '',
      })),
      stories: (c.stories ?? []).map((s) => ({ id: s.id, name: s.name, snippet: s.snippet ?? '' })),
    };
  });
if (problems.length) {
  console.error(
    `docs/ai: every story file needs design.figmaNode and ai.{summary,useWhen,avoidWhen}:\n${problems.join('\n')}`,
  );
  process.exit(1);
}

const tokens = JSON.parse(readFileSync(join(repo, 'packages/tokens/dist/tokens.json'), 'utf8')) as {
  name: string;
  group: string;
}[];
// Utilities an AI should reach for, per role (mirrors packages/tokens/scripts/build.ts tailwindTheme).
const utilityFor = (t: { name: string; group: string }): string | null => {
  const rest = t.name.split('/').slice(1).join('-');
  switch (t.group) {
    case 'background':
      return `bg-${rest}`;
    case 'text':
      return `text-${rest}`;
    case 'border':
      return `border-${rest}`;
    case 'foreground':
      return `text-fg-${rest} | fill-${rest} | stroke-${rest}`;
    case 'radius':
      return `rounded-${rest}`;
    case 'font-size':
      return `text-${rest}`;
    case 'line-height':
      return `leading-${rest}`;
    case 'border-width':
      return `border-w-${rest}`;
    default:
      return null;
  }
};
const tokenDocs = tokens
  .map((t) => ({ name: t.name, utility: utilityFor(t) }))
  .filter((t) => t.utility);
const icons = JSON.parse(
  readFileSync(join(repo, 'packages/icons/src/generated/manifest.json'), 'utf8'),
) as {
  name: string;
  category: string;
  keywords: string[];
}[];

mkdirSync(out, { recursive: true });
const write = (file: string, data: unknown) => {
  mkdirSync(dirname(join(out, file)), { recursive: true });
  writeFileSync(join(out, file), `${JSON.stringify(data, null, 2)}\n`);
};
write('components.json', components);
write('tokens.json', tokenDocs);
write(
  'icons.json',
  icons.map(({ name, category, keywords }) => ({
    name,
    category,
    keywords,
    import: `import { ${name} } from '@honey-ds/icons';`,
  })),
);
console.log(
  `docs/ai: ${components.length} components, ${tokenDocs.length} token utilities, ${icons.length} icons`,
);
