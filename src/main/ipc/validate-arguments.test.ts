import {
  describe,
  expect,
  it,
} from 'vitest';

import { validateVpnId } from './validate-arguments';

describe('validateVpnId', () => {
  it.each([
    'test-vpn',
    'My Windows VPN',
    '00000000-0000-4000-8000-000000000001',
  ])('accepts valid identifier "%s"', (value) => {
    expect(validateVpnId(value)).toBe(value);
  });

  it.each([
    null,
    undefined,
    123,
    {},
    [],
    '',
    ' ',
    ' test-vpn',
    'test-vpn ',
    'test\nvpn',
    'a'.repeat(257),
  ])('rejects invalid identifier "%s"', (value) => {
    expect(
      () => validateVpnId(value),
    ).toThrow('Invalid VPN identifier');
  });
});
