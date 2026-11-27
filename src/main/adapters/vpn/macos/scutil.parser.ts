
import {
  type VpnConnection,
  type VpnStatus,
} from '../../../../shared/types';

const VPN_ID_PATTERN =
  /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;

const VPN_CONNECTION_PATTERN =
  /^\s*(\*?)\s*\(([^)]+)\)\s+([a-f0-9-]+)\s+.*?"([^"]+)"\s+\[([^\]]+)\]\s*$/i;

export const isValidVpnId = (id: string): boolean => {
  return VPN_ID_PATTERN.test(id);
};

export const normalizeVpnStatus = (
  value: string,
): VpnStatus => {
  switch (value.trim().toLowerCase()) {
    case 'connected':
      return 'connected';

    case 'disconnected':
      return 'disconnected';

    case 'connecting':
      return 'connecting';

    case 'disconnecting':
      return 'disconnecting';

    default:
      return 'unknown';
  }
};

export const parseVpnList = (
  output: string,
): VpnConnection[] => {
  const connections: VpnConnection[] = [];

  for (const line of output.split(/\r?\n/)) {
    const match = line.match(VPN_CONNECTION_PATTERN);

    if (!match) {
      continue;
    }

    const [
      ,
      enabled,
      status,
      id,
      name,
      protocol,
    ] = match;

    if (!isValidVpnId(id)) {
      continue;
    }

    connections.push({
      id,
      name,
      protocol,
      status: normalizeVpnStatus(status),
      enabled: enabled === '*',
    });
  }

  return connections;
};

export const parseVpnStatus = (
  output: string,
): VpnStatus => {
  const firstLine = output
    .trim()
    .split(/\r?\n/)[0];

  return normalizeVpnStatus(firstLine ?? '');
};
