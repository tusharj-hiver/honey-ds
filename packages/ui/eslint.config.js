import { react } from '@honey-ds/eslint-config';

export default [
  ...react,
  {
    // Apps consume this package as source, so a path alias like `@/lib/utils` only resolves here
    // and breaks every consumer. `shadcn add` generates `@/` imports: convert them to relative.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message: 'Use a relative import; @/ does not resolve in consumers of @honey-ds/ui.',
            },
          ],
        },
      ],
    },
  },
];
