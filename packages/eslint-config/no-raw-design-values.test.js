import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import rule from './no-raw-design-values.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run('no-raw-design-values', rule, {
  valid: [
    { code: '<div className="bg-brand-default p-2.5 text-neutral-strong" />' },
    {
      code: '<div style={{ color: "var(--hds-text-neutral-strong)", width: "100%", margin: 0 }} />',
    },
    { code: 'const label = "Width is 13px";' },
    { code: 'cva("inline-flex items-center", { variants: { size: { sm: "h-8 px-3" } } })' },
    { code: '<div className="w-[var(--hds-layout-list)]" />' },
    {
      code: '// hds-allow: third-party embed needs exact size\n<div style={{ width: "640px" }} />',
    },
    { code: '<div style={{ opacity: 0.5, zIndex: 10, flexGrow: 1, margin: 0 }} />' },
    { code: 'const config = { padding: 12 };' },
    { code: 'const TONES = { info: "bg-info-subtle text-info-strong" };' },
    { code: '<div className="origin-(--transform-origin) w-(--hds-layout-list)" />' },
    { code: 'const link = "#abc";' },
    { code: 'const COPY = { a: "Order #1234 is from a top-tier customer" };' },
    { code: 'const C = { a: "flex items-center gap-2 text-neutral-strong" };' },
    { code: 'const html = "<p style=\\"color:#333\\" class=\\"text-red\\">Hi</p>";' },
  ],
  invalid: [
    { code: '<div className="bg-[#FFCF54]" />', errors: [{ messageId: 'raw' }] },
    { code: '<div className="w-[13px]" />', errors: [{ messageId: 'raw' }] },
    { code: '<div style={{ color: "#404040" }} />', errors: [{ messageId: 'raw' }] },
    { code: '<div style={{ padding: "8px" }} />', errors: [{ messageId: 'raw' }] },
    { code: '<div style={{ background: "rgb(0, 0, 0)" }} />', errors: [{ messageId: 'raw' }] },
    { code: 'cva("rounded-[6px]")', errors: [{ messageId: 'raw' }] },
    { code: 'cn(`text-[14px] ${x}`)', errors: [{ messageId: 'raw' }] },
    { code: '<div style={{ padding: 12 }} />', errors: [{ messageId: 'raw' }] },
    { code: '<div style={{ ...base, marginTop: 4 }} />', errors: [{ messageId: 'raw' }] },
    // Lookup maps, outside className/cn/cva.
    { code: 'const TONES = { info: "bg-[#0af] text-white" };', errors: [{ messageId: 'raw' }] },
    { code: 'const SIZE = { sm: "h-[13px]" };', errors: [{ messageId: 'raw' }] },
    // The (--var) shorthand with a variable that isn't a token.
    { code: '<div className="bg-(--brand-pink)" />', errors: [{ messageId: 'raw' }] },
    { code: 'const C = { x: "text-(--my-color)" };', errors: [{ messageId: 'raw' }] },
    { code: 'const C = { x: "bg-(color:--brand-pink) p-2" };', errors: [{ messageId: 'raw' }] },
    { code: '<div className="bg-(color:--brand-pink)" />', errors: [{ messageId: 'raw' }] },
  ],
});
