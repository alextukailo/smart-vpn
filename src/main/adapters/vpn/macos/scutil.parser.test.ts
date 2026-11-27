
import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  isValidVpnId,
  normalizeVpnStatus,
  parseVpnList,
  parseVpnStatus,
} from './scutil.parser';

const VPN_LIST_OUTPUT = `
Available network connection services in the current set (*=enabled):
* (Connected) 75E5324F-E2B8-40C5-8C6B-F02E4ACCB4E9 VPN (com.urban-vpn.mac) "Urban VPN Desktop" [VPN:com.urban-vpn.mac]
* (Disconnected) D0CA35D4-5483-42CC-8078-A38D199E8053 PPP --> L2TP "VPN JD" [PPP:L2TP]
* (Disconnected) 064CA0F0-C0CF-49C2-9F91-16E2BE4EDDBC VPN (com.wireguard.macos) "nazwa.pl" [VPN:com.wireguard.macos]
* (Disconnected) A636E36D-0361-45A4-8FA3-68AD75FF1F18 PPP --> L2TP "Hetzner VPN" [PPP:L2TP]
`;

describe('isValidVpnId', () => {
  it.each([
    '75E5324F-E2B8-40C5-8C6B-F02E4ACCB4E9',
    '75e5324f-e2b8-40c5-8c6b-f02e4accb4e9',
  ])('accepts valid UUID "%s"', (id) => {
    expect(isValidVpnId(id)).toBe(true);
  });

  it.each([
    '',
    'Urban VPN Desktop',
    '--help',
    'invalid-id',
    'abc; echo invalid',
  ])('rejects invalid identifier "%s"', (id) => {
    expect(isValidVpnId(id)).toBe(false);
  });
});

describe('normalizeVpnStatus', () => {
  it.each([
    ['Connected', 'connected'],
    ['Disconnected', 'disconnected'],
    ['Connecting', 'connecting'],
    ['Disconnecting', 'disconnecting'],
    ['CONNECTED', 'connected'],
    [' Connected ', 'connected'],
    ['Unexpected status', 'unknown'],
    ['', 'unknown'],
  ])('normalizes "%s" to "%s"', (input, expected) => {
    expect(normalizeVpnStatus(input)).toBe(expected);
  });
});

describe('parseVpnList', () => {
  it('parses all available VPN connections', () => {
    expect(
      parseVpnList(VPN_LIST_OUTPUT),
    ).toHaveLength(4);
  });

  it('parses a connected third-party VPN', () => {
    const connections = parseVpnList(VPN_LIST_OUTPUT);

    expect(connections[0]).toEqual({
      id: '75E5324F-E2B8-40C5-8C6B-F02E4ACCB4E9',
      name: 'Urban VPN Desktop',
      protocol: 'VPN:com.urban-vpn.mac',
      status: 'connected',
      enabled: true,
    });
  });

  it('parses an L2TP connection', () => {
    const connections = parseVpnList(VPN_LIST_OUTPUT);

    expect(connections[1]).toEqual({
      id: 'D0CA35D4-5483-42CC-8078-A38D199E8053',
      name: 'VPN JD',
      protocol: 'PPP:L2TP',
      status: 'disconnected',
      enabled: true,
    });
  });

  it('parses a WireGuard connection', () => {
    const connections = parseVpnList(VPN_LIST_OUTPUT);

    expect(connections[2]).toMatchObject({
      name: 'nazwa.pl',
      protocol: 'VPN:com.wireguard.macos',
      status: 'disconnected',
    });
  });

  it('parses a disabled VPN connection', () => {
    const output =
      '(Disconnected) D0CA35D4-5483-42CC-8078-A38D199E8053 PPP --> L2TP "VPN JD" [PPP:L2TP]';

    expect(parseVpnList(output)[0]).toMatchObject({
      name: 'VPN JD',
      enabled: false,
    });
  });

  it('returns an empty list for empty output', () => {
    expect(parseVpnList('')).toEqual([]);
  });

  it('ignores malformed output', () => {
    expect(
      parseVpnList('Unexpected output'),
    ).toEqual([]);
  });

  it('ignores invalid VPN identifiers', () => {
    const output =
      '* (Connected) abcd VPN "Invalid VPN" [VPN:test]';

    expect(parseVpnList(output)).toEqual([]);
  });

  it('supports Windows-style line endings', () => {
    const output = VPN_LIST_OUTPUT.replace(
      /\n/g,
      '\r\n',
    );

    expect(parseVpnList(output)).toHaveLength(4);
  });
});

describe('parseVpnStatus', () => {
  it.each([
    ['Connected', 'connected'],
    ['Disconnected', 'disconnected'],
    ['Connecting', 'connecting'],
    ['Disconnecting', 'disconnecting'],
  ])('parses the "%s" status', (input, expected) => {
    const output = `${input}\nExtended Status <dictionary> {}`;

    expect(parseVpnStatus(output)).toBe(expected);
  });

  it('returns unknown for empty output', () => {
    expect(parseVpnStatus('')).toBe('unknown');
  });
});
