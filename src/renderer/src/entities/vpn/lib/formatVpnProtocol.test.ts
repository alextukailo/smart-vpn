import {
  describe,
  expect,
  it,
} from 'vitest';

import { formatVpnProtocol } from './formatVpnProtocol';

describe('formatVpnProtocol', () => {
  it.each([
    ['PPP:L2TP', 'L2TP'],
    ['VPN:com.wireguard.macos', 'WireGuard'],
    ['VPN:com.urban-vpn.mac', 'Third-party VPN'],
    ['IKEv2', 'IKEv2'],
    ['OpenVPN', 'OpenVPN'],
    ['', 'Unknown protocol'],
    ['Custom protocol', 'Custom protocol'],
  ])('formats "%s" as "%s"', (input, expected) => {
    expect(
      formatVpnProtocol(input),
    ).toBe(expected);
  });
});
