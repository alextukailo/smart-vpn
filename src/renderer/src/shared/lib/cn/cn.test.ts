import {
  describe,
  expect,
  it,
} from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('combines class names', () => {
    expect(
      cn('flex', 'items-center'),
    ).toBe('flex items-center');
  });

  it('ignores falsy values', () => {
    expect(
      cn('flex', false, null, undefined),
    ).toBe('flex');
  });

  it('supports conditional class names', () => {
    expect(
      cn('flex', {
        'items-center': true,
        hidden: false,
      }),
    ).toBe('flex items-center');
  });

  it('merges conflicting Tailwind classes', () => {
    expect(
      cn('px-4', 'px-6'),
    ).toBe('px-6');
  });

  it('preserves non-conflicting classes', () => {
    expect(
      cn('px-4 py-2', 'px-6'),
    ).toBe('py-2 px-6');
  });
});
