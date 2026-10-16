import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// `border-w-*` sets border-width on all four sides, so with `border-t`/`border-r`/… it draws a full
// box instead of one hairline (and tailwind-merge drops the side class). One-sided borders use the
// side utility alone.
const ONE_SIDED_WITH_WIDTH =
  /\bborder-[trblxyse]\b[^'"`]*\bborder-w-\d+|\bborder-w-\d+[^'"`]*\bborder-[trblxyse]\b(?!-)/;

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? sources(join(dir, e.name))
      : /\.tsx$/.test(e.name) && !e.name.includes('.stories.')
        ? [join(dir, e.name)]
        : [],
  );
}

describe('borders', () => {
  it('never combines a one-sided border with border-w-*', () => {
    const offenders = sources(new URL('..', import.meta.url).pathname).filter((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .some((line) => ONE_SIDED_WITH_WIDTH.test(line)),
    );
    expect(offenders).toEqual([]);
  });
});
