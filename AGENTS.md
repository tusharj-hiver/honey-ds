# AGENTS.md — rules for AI-built code in honey-ds

Honey DS is the design system: tokens, icons and React components, built mostly by AI coding
assistants. These rules keep components consistent and reviewable. CI enforces most of them.

## Before writing UI

1. Read `docs/ai/components.json` (components, props, Figma node, when to use / avoid), or ask the
   Storybook MCP server (`.mcp.json`, Storybook running on :6006) to list components and stories.
2. Read `docs/ai/tokens.json` for the token utilities and `docs/ai/icons.json` for icon names.

## Rules

1. **Components compose the library.** Inside `packages/ui`, build on existing primitives and
   `@honey-ds/icons`; no raw `<button>`, `<input>`, menus or tooltips where a component exists.
2. **No raw design values.** No hex, rgb/hsl, px, font-family or arbitrary Tailwind values
   (`w-[13px]`, `bg-[#fff]`). Use token utilities: `bg-neutral-soft`, `text-neutral-strong`,
   `border-neutral-default`, `rounded-6`, `text-14 leading-20`, spacing `p-2.5` (Figma spacing/N =
   Tailwind N), layout widths `w-(--hds-layout-list)`. The lint rule `hds/no-raw-design-values`
   fails the build otherwise. `// hds-allow: <reason>` is for genuine third-party constraints only.
3. **Every component ships with its stories.** Stories for every state (default, hover, focus,
   disabled, error), light and dark, a play test for keyboard behaviour,
   `parameters.design.figmaNode` and `parameters.ai.{summary,useWhen,avoidWhen}`.
   `shadcn add` writes `@/…` imports: change them to relative imports (lint enforces this), because
   consumers use `@honey-ds/ui` as source and the alias does not resolve there.
4. **Keyboard first.** Every action is reachable by keyboard. Popups must accept a portal `container`.
5. **Accessibility is a test, not a review comment.** Stories run with axe in CI and violations fail.
6. **Visual changes are reviewed in Chromatic.** Every PR publishes Storybook to Chromatic, which
   snapshots each story in light and dark; accept or deny the diffs there.

## Layout

Yarn 1 workspaces + Turbo. `packages/`: `tokens` (Figma export → CSS + Tailwind theme), `icons`
(SVGs → React components), `ui` (components + Storybook), `eslint-config`, `typescript-config`.
`tooling/scripts/`: repo checks. `docs/ai/`: generated component, token and icon docs.

## Commands

Run `yarn check-versions` after changing a dependency version: every workspace must pin the same one.

- `yarn turbo run lint typecheck test build` — everything CI runs in the checks job
- `yarn storybook` — Storybook (and its MCP server) on :6006
- `yarn workspace @honey-ds/ui test:storybook` — stories as browser tests (a11y + play tests)
- `yarn build-storybook && yarn workspace @honey-ds/ui docs:ai` — refresh docs/ai
- `CHROMATIC_PROJECT_TOKEN=… yarn chromatic` — publish a local Storybook build to Chromatic

## Prompt templates

See `docs/ai/prompts/`: `new-component.md`, `add-variant.md`.
