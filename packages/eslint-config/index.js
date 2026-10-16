import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import noRawDesignValues from './no-raw-design-values.js';

export const hds = { rules: { 'no-raw-design-values': noRawDesignValues } };

/** Base preset for every package. */
export const base = tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/storybook-static/**',
      '**/*.gen.ts',
      '**/mockServiceWorker.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);

/** React preset: hooks (incl. React Compiler rules), a11y, and the token-only rule. */
export const react = tseslint.config(...base, {
  files: ['**/*.{ts,tsx}'],
  plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y, hds },
  rules: {
    ...reactHooks.configs.recommended.rules,
    ...jsxA11y.configs.recommended.rules,
    'hds/no-raw-design-values': 'error',
  },
});

export default base;
