/**
 * Second layer of the token-only rule (principle 1), for CSS files. Generated token CSS is the only
 * place raw values may live.
 */
export default {
  ignoreFiles: ['**/dist/**', '**/node_modules/**', '**/storybook-static/**'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'oklab', 'lab', 'lch'],
    'declaration-property-unit-disallowed-list': {
      '/^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|width|height|min-width|min-height|max-width|max-height|font-size|line-height|border-radius|border-width)/':
        ['px', 'rem', 'em'],
    },
    'font-family-no-missing-generic-family-keyword': true,
  },
};
