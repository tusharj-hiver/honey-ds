# Honey DS

The Honey design system: design tokens, icons and React components, with Storybook and Chromatic
visual review.

| Package                                                  | What it is                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `@honey-ds/tokens`                                       | Figma variables export → CSS custom properties, Tailwind v4 theme, shadcn  |
| `@honey-ds/icons`                                        | ~1,200 SVG icons → React components                                        |
| `@honey-ds/ui`                                           | Components on Base UI + Tailwind, with stories, a11y and interaction tests |
| `@honey-ds/eslint-config`, `@honey-ds/typescript-config` | Shared lint (incl. the token-only rule) and TS config                      |

## Getting started

Requires Node 22+ (`.nvmrc`) and Yarn 1.

```sh
yarn install
yarn storybook          # builds tokens + icons, then Storybook on http://localhost:6006
```

Checks:

```sh
yarn turbo run lint typecheck test build
yarn workspace @honey-ds/ui test:storybook   # every story as a browser test, light and dark, with axe
```

## Chromatic

CI publishes Storybook to [Chromatic](https://www.chromatic.com) on every PR and push to `main`;
each story is snapshotted in light and dark. Builds on `main` are auto-accepted as the baseline,
and PR diffs are reviewed in Chromatic.

Setup, once:

1. Sign in at chromatic.com with GitHub and create a project linked to this repository.
2. Copy its project token and add it as the repository secret `CHROMATIC_PROJECT_TOKEN`
   (Settings → Secrets and variables → Actions).

Until the secret exists, the Chromatic step is skipped and the rest of CI still runs. To publish
from your machine: `yarn build-storybook && CHROMATIC_PROJECT_TOKEN=<token> yarn chromatic`.

## Using it in an app

The packages export TypeScript source. Import the stylesheet once and the components where needed:

```tsx
import '@honey-ds/ui/styles.css';
import { Button } from '@honey-ds/ui';
import { SearchMd } from '@honey-ds/icons';
```

See `AGENTS.md` for the rules components follow, and `docs/ai/` for the generated component,
token and icon references.
