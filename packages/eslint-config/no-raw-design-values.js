// Principle 1: no hex, px, colour functions, font families or arbitrary Tailwind values in
// styling positions. Values must come from @honey-ds/tokens (var(--hds-*) or token utilities).
const HEX = /#[0-9a-f]{3,8}\b/i;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i;
const PX = /(?<![\w-])-?\d+(?:\.\d+)?px\b/;
const FONT_FAMILY = /font-family\s*:/i;
const TW_ARBITRARY =
  /\[(?!var\(--hds-)[^\]]*(?:#|\d+(?:\.\d+)?(?:px|rem|em)|rgb|hsl|oklch|var\()[^\]]*\]/i;

// Tailwind's `(--name)` shorthand: only design tokens, plus the sizing variables Base UI sets on
// its popups (they carry no design value).
// `(--x)` and the typed form `(color:--x)`.
const TW_VAR_SHORTHAND =
  /\((?:[a-z-]+:)?--(?!hds-|transform-origin\b|available-|anchor-|popup-|positioner-|collapsible-|accordion-)[\w-]+\)/;
// A string that reads as Tailwind classes is checked wherever it sits, so lookup maps
// (`const TONES = { info: 'bg-…' }`) and variables passed to className later are covered.
const UTILITY =
  /(?:^|\s)(?:[\w-]+:)*-?(?:bg|text|border|ring|outline|fill|stroke|shadow|rounded|p[xytrblse]?|m[xytrblse]?|w|h|size|min-[wh]|max-[wh]|gap|space-[xy]|inset|top|left|right|bottom|font|leading|tracking|opacity|z|translate-[xy]|origin|divide|from|via|to|decoration|basis|grid-cols|grid-rows)-\S/;

// Utilities that are a single word, with no dash or variant.
const SINGLE_WORD_UTILITIES = new Set([
  'flex',
  'grid',
  'block',
  'inline',
  'hidden',
  'contents',
  'relative',
  'absolute',
  'fixed',
  'sticky',
  'static',
  'truncate',
  'italic',
  'underline',
  'uppercase',
  'lowercase',
  'capitalize',
  'grow',
  'shrink',
  'border',
  'rounded',
  'shadow',
  'outline',
  'ring',
  'transition',
  'container',
  'group',
  'peer',
  'isolate',
  'invisible',
  'visible',
  'antialiased',
]);
/**
 * A class string: it has a utility, and every word is class-shaped (has a dash or a variant
 * colon, or is a one-word utility). Copy such as "Order #1234 is from a top-tier customer" has
 * plain words, so it isn't one.
 */
function looksLikeClasses(text) {
  if (/^\s*</.test(text) || !UTILITY.test(text)) return false;
  const words = text.trim().split(/\s+/);
  return words.every((w) => /[-:]/.test(w) || SINGLE_WORD_UTILITIES.has(w.replace(/^!/, '')));
}

const STYLING_CALLEES = new Set(['cva', 'cn', 'clsx', 'twMerge', 'tv']);
// React treats a bare number on these style properties as unitless, not px.
const UNITLESS = new Set([
  'opacity',
  'zIndex',
  'flex',
  'flexGrow',
  'flexShrink',
  'order',
  'fontWeight',
  'lineHeight',
  'zoom',
  'aspectRatio',
  'columnCount',
  'fillOpacity',
  'strokeOpacity',
  'gridRow',
  'gridColumn',
]);

/** `style={{ padding: 12 }}` → React renders 12px. Returns the property name when it is one of those. */
function numericPxStyle(node) {
  const prop = node.parent;
  if (!prop || prop.type !== 'Property' || prop.value !== node) return null;
  const name = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
  if (UNITLESS.has(name) || node.value === 0) return null;
  for (let cur = prop.parent; cur; cur = cur.parent) {
    if (cur.type === 'JSXAttribute') return cur.name && cur.name.name === 'style' ? name : null;
    if (cur.type === 'Program') return null;
  }
  return null;
}
const ALLOW_COMMENT = /hds-allow:\s*\S+/;

function violation(text) {
  if (HEX.test(text)) return 'hex colour';
  if (COLOR_FN.test(text)) return 'colour function';
  if (TW_ARBITRARY.test(text)) return 'arbitrary Tailwind value';
  if (TW_VAR_SHORTHAND.test(text)) return 'non-token CSS variable';
  if (PX.test(text)) return 'px value';
  if (FONT_FAMILY.test(text)) return 'font-family';
  return null;
}

function isStylingContext(node) {
  for (let cur = node.parent; cur; cur = cur.parent) {
    if (cur.type === 'JSXAttribute') {
      const name = cur.name && cur.name.name;
      return name === 'className' || name === 'style';
    }
    if (cur.type === 'CallExpression') {
      const callee = cur.callee;
      const name =
        callee.type === 'Identifier' ? callee.name : callee.property && callee.property.name;
      if (STYLING_CALLEES.has(name)) return true;
    }
    if (cur.type === 'Program' || cur.type === 'FunctionDeclaration') return false;
  }
  return false;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw design values; use @honey-ds/tokens' },
    schema: [],
    messages: {
      raw: 'Raw {{kind}} "{{value}}" in a styling position. Use a token (var(--hds-*) or a token utility), or add "// hds-allow: <reason>".',
    },
  },
  create(context) {
    const source = context.sourceCode ?? context.getSourceCode();
    function allowed(node) {
      return (
        source.getCommentsBefore(node).some((c) => ALLOW_COMMENT.test(c.value)) ||
        source
          .getAllComments()
          .some((c) => c.loc.end.line === node.loc.start.line - 1 && ALLOW_COMMENT.test(c.value))
      );
    }
    function check(node, text) {
      if (typeof text !== 'string') return;
      // Markup (an email body in a story) is content, not this app's styling.
      if (!isStylingContext(node) && !looksLikeClasses(text)) return;
      const kind = violation(text);
      if (kind && !allowed(node)) {
        context.report({ node, messageId: 'raw', data: { kind, value: text.slice(0, 40) } });
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === 'number') {
          const prop = numericPxStyle(node);
          if (prop && !allowed(node)) {
            context.report({
              node,
              messageId: 'raw',
              data: { kind: 'px value (bare number)', value: `${prop}: ${node.value}` },
            });
          }
          return;
        }
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked);
      },
    };
  },
};
